// In-memory database for the local demo adapter. Seeds from the generated fixture
// on first load, then persists every write to localStorage so changes survive a
// refresh (Flavor 2). `resetLocalDb()` wipes it back to the pristine seed.
import seedData from "./seed-data.json";

export type Row = Record<string, unknown>;
export type Database = Record<string, Row[]>;

const STORAGE_KEY = "ats-local-db";
// Bump when seed-data.json changes shape so stale snapshots are re-seeded.
const STORAGE_VERSION = 1;

// Tables with a composite primary key and no synthetic `id` column.
const NO_ID = new Set(["candidate_pool_members", "req_candidate_pools"]);
// Tables without a `created_at` column.
const NO_CREATED_AT = new Set(["hc_plan_settings"]);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function freshSeed(): Database {
  return clone(seedData as unknown as Database);
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

class LocalStore {
  db: Database;

  constructor() {
    this.db = this.hydrate();
  }

  private hydrate(): Database {
    if (typeof localStorage === "undefined") return freshSeed();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { version?: number; db?: Database };
        if (parsed?.version === STORAGE_VERSION && parsed.db) return parsed.db;
      }
    } catch {
      // corrupt snapshot -> fall through to a fresh seed
    }
    const seeded = freshSeed();
    this.write(seeded);
    return seeded;
  }

  private write(db: Database): void {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, db }));
    } catch (err) {
      console.warn("[local-db] failed to persist to localStorage", err);
    }
  }

  persist(): void {
    this.write(this.db);
  }

  table(name: string): Row[] {
    return (this.db[name] ??= []);
  }

  reset(): void {
    if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY);
    this.db = freshSeed();
    this.persist();
  }

  private nextReqNumber(): number {
    let max = 999; // sequence starts at 1000
    for (const r of this.table("requisitions")) {
      const n = r.req_number;
      if (typeof n === "number" && n > max) max = n;
    }
    return max + 1;
  }

  // Fills the column defaults Postgres would apply on INSERT.
  applyDefaults(name: string, input: Row): Row {
    const row = clone(input);
    if (!NO_ID.has(name) && row.id == null) row.id = uuid();
    if (!NO_CREATED_AT.has(name) && row.created_at == null) {
      row.created_at = new Date().toISOString();
    }
    if (name === "intakes" && row.updated_at == null) {
      row.updated_at = new Date().toISOString();
    }
    if (name === "requisitions") {
      if (row.req_number == null) row.req_number = this.nextReqNumber();
      if (row.opened_date == null) row.opened_date = new Date().toISOString();
      if (row.salary_currency == null) row.salary_currency = "USD";
      if (row.status == null) row.status = "open";
    }
    return row;
  }
}

export const store = new LocalStore();

export function resetLocalDb(): void {
  store.reset();
}
