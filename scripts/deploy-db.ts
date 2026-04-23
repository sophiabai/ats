import postgres from "postgres";
import { readFileSync, readdirSync } from "fs";
import { resolve, join } from "path";

const envPath = resolve(import.meta.dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const databaseUrl = env["CLOUD_DATABASE_URL"];
if (!databaseUrl) {
  console.error("Missing CLOUD_DATABASE_URL in .env.local");
  console.error("Get it from: Supabase Dashboard > Settings > Database > Connection string (URI)");
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: "require" });

async function deploy() {
  console.log("Deploying database to cloud...\n");

  // Drop all public tables and sequences
  console.log("  Dropping all tables and sequences...");
  await sql.unsafe(`
    DO $$ DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
      FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequencename) || ' CASCADE';
      END LOOP;
    END $$;
  `);
  console.log("  ✓ All tables and sequences dropped");

  // Run migrations in order
  const migrationsDir = resolve(import.meta.dirname, "../supabase/migrations");
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    console.log(`  Running migration: ${file}...`);
    const migration = readFileSync(join(migrationsDir, file), "utf-8");
    await sql.unsafe(migration);
    console.log(`  ✓ ${file}`);
  }

  // Run seed
  console.log("  Running seed...");
  const seedPath = resolve(import.meta.dirname, "../supabase/seed.sql");
  const seed = readFileSync(seedPath, "utf-8");
  await sql.unsafe(seed);
  console.log("  ✓ Seed complete");

  console.log("\n✓ Cloud database deployed!");
  await sql.end();
}

deploy().catch(async (err) => {
  console.error("Deploy failed:", err);
  await sql.end();
  process.exit(1);
});
