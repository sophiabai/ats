import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

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

const supabase = createClient(
  env["VITE_SUPABASE_URL"]!,
  env["SUPABASE_SERVICE_ROLE_KEY"]!,
);

async function seed() {
  console.log("Fetching existing data...\n");

  const { data: candidates } = await supabase
    .from("candidates")
    .select("id, first_name, last_name")
    .order("created_at");
  const { data: requisitions } = await supabase
    .from("requisitions")
    .select("id, title")
    .order("created_at");
  const { data: existingApps } = await supabase
    .from("applications")
    .select("candidate_id, req_id");

  if (!candidates || !requisitions || !existingApps) {
    throw new Error("Failed to fetch existing data");
  }

  const existing = new Set(
    existingApps.map((a) => `${a.candidate_id}:${a.req_id}`),
  );

  const sources = [
    "linkedin",
    "referral",
    "careers_page",
    "indeed",
    "glassdoor",
    "agency",
    "university",
    "internal",
  ] as const;

  const milestones = [
    "application",
    "screen",
    "final_interview",
    "offer",
    "offer_accepted",
  ] as const;

  const statuses: Record<string, string> = {
    application: "active",
    screen: "active",
    final_interview: "active",
    offer: "active",
    offer_accepted: "hired",
  };

  // Build a plan: each candidate gets at least 2 applications total.
  // Spread candidates across different reqs for variety.
  const plan: Array<{
    candidate_id: string;
    req_id: string;
    source: string;
    milestone: string;
    status: string;
    candidateName: string;
    reqTitle: string;
  }> = [];

  // Assign each candidate to reqs they don't already have, picking 2-3 new ones
  for (const c of candidates) {
    const currentCount = existingApps.filter(
      (a) => a.candidate_id === c.id,
    ).length;
    const needed = Math.max(0, 2 - currentCount) + 1; // at least 1 new, ensure total >= 2

    const availableReqs = requisitions.filter(
      (r) => !existing.has(`${c.id}:${r.id}`),
    );

    for (let i = 0; i < Math.min(needed, availableReqs.length); i++) {
      const req = availableReqs[i];
      const milestone =
        milestones[Math.floor(Math.random() * milestones.length)];
      plan.push({
        candidate_id: c.id,
        req_id: req.id,
        source: sources[Math.floor(Math.random() * sources.length)],
        milestone,
        status:
          milestone === "offer_accepted"
            ? "hired"
            : Math.random() < 0.15
              ? "rejected"
              : "active",
        candidateName: `${c.first_name} ${c.last_name}`,
        reqTitle: req.title,
      });
    }
  }

  if (plan.length === 0) {
    console.log("No new applications needed.");
    return;
  }

  console.log(`  Creating ${plan.length} new applications...\n`);
  for (const p of plan) {
    console.log(`    ${p.candidateName} → ${p.reqTitle} (${p.milestone})`);
  }

  // Insert applications
  const appRows = plan.map((p) => ({
    candidate_id: p.candidate_id,
    req_id: p.req_id,
    source: p.source,
    current_milestone: p.milestone,
    status: p.status,
    rejected_reason: p.status === "rejected" ? "Other candidates were a stronger fit" : null,
  }));

  const { data: insertedApps, error: appErr } = await supabase
    .from("applications")
    .insert(appRows)
    .select();

  if (appErr) throw appErr;
  console.log(`\n  ✓ ${insertedApps.length} applications created`);

  // Copy req_interviews → application_interviews for each new application
  console.log("  Copying interview templates...");
  let totalInterviews = 0;

  for (const app of insertedApps) {
    const { data: reqInterviews } = await supabase
      .from("req_interviews")
      .select("*")
      .eq("req_id", app.req_id);

    if (reqInterviews && reqInterviews.length > 0) {
      const rows = reqInterviews.map((ri) => ({
        application_id: app.id,
        stage_id: ri.stage_id,
        source_req_interview_id: ri.id,
        title: ri.title,
        interview_type: ri.interview_type,
        duration_minutes: ri.duration_minutes,
        order_position: ri.order_position,
        status: "pending" as const,
      }));

      const { error } = await supabase
        .from("application_interviews")
        .insert(rows);

      if (error) throw error;
      totalInterviews += rows.length;
    }
  }

  console.log(`  ✓ ${totalInterviews} application interviews created`);

  // Print summary
  const { data: summary } = await supabase
    .from("candidates")
    .select("first_name, last_name, applications(count)")
    .order("created_at");

  console.log("\n  Application counts per candidate:");
  for (const c of summary ?? []) {
    const count = (c.applications as unknown as { count: number }[])?.[0]
      ?.count ?? 0;
    console.log(`    ${c.first_name} ${c.last_name}: ${count}`);
  }

  console.log("\n✓ Done!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
