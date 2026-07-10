// Parses supabase/seed.sql into a JSON fixture the local-db adapter loads at runtime.
// Handles: INSERT ... VALUES, UPDATE ... SET ... WHERE, E'...' escape strings,
// ARRAY[...] literals, '...'::jsonb casts, and the two INSERT ... SELECT ... (VALUES)
// statements the seed uses to attach rows to a resolved application id.
//
// Run with: node scripts/generate-seed-fixture.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SEED_PATH = resolve(ROOT, "supabase/seed.sql");
const OUT_PATH = resolve(ROOT, "src/lib/local-db/seed-data.json");

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------
const PUNCT = new Set(["(", ")", ",", ";", "[", "]", "*", "=", "."]);

function decodeEString(raw) {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === "\\") {
      const n = raw[++i];
      out +=
        n === "n" ? "\n" :
        n === "t" ? "\t" :
        n === "r" ? "\r" :
        n === "b" ? "\b" :
        n === "f" ? "\f" :
        n === "'" ? "'" :
        n === '"' ? '"' :
        n === "\\" ? "\\" :
        n;
    } else {
      out += c;
    }
  }
  return out;
}

function tokenize(sql) {
  const tokens = [];
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i];
    // whitespace
    if (c === " " || c === "\t" || c === "\n" || c === "\r") { i++; continue; }
    // line comment
    if (c === "-" && sql[i + 1] === "-") {
      while (i < n && sql[i] !== "\n") i++;
      continue;
    }
    // E'...' escape string
    if ((c === "E" || c === "e") && sql[i + 1] === "'") {
      i += 2;
      let raw = "";
      while (i < n) {
        if (sql[i] === "\\") { raw += sql[i] + (sql[i + 1] ?? ""); i += 2; continue; }
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") { raw += "'"; i += 2; continue; }
          i++; break;
        }
        raw += sql[i++];
      }
      tokens.push({ type: "str", value: decodeEString(raw) });
      continue;
    }
    // '...' normal string ('' escapes an apostrophe)
    if (c === "'") {
      i++;
      let val = "";
      while (i < n) {
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") { val += "'"; i += 2; continue; }
          i++; break;
        }
        val += sql[i++];
      }
      tokens.push({ type: "str", value: val });
      continue;
    }
    // :: cast
    if (c === ":" && sql[i + 1] === ":") { tokens.push({ type: "cast" }); i += 2; continue; }
    // number (optionally negative)
    if (/[0-9]/.test(c) || (c === "-" && /[0-9]/.test(sql[i + 1] ?? ""))) {
      let num = c; i++;
      while (i < n && /[0-9.]/.test(sql[i])) num += sql[i++];
      tokens.push({ type: "num", value: Number(num) });
      continue;
    }
    // punctuation
    if (PUNCT.has(c)) { tokens.push({ type: "punct", value: c }); i++; continue; }
    // word / identifier / keyword
    if (/[A-Za-z_]/.test(c)) {
      let w = c; i++;
      while (i < n && /[A-Za-z0-9_]/.test(sql[i])) w += sql[i++];
      tokens.push({ type: "word", value: w });
      continue;
    }
    // anything else: skip
    i++;
  }
  return tokens;
}

// ---------------------------------------------------------------------------
// Statement splitting (on `;` at paren depth 0)
// ---------------------------------------------------------------------------
function splitStatements(tokens) {
  const stmts = [];
  let cur = [];
  let depth = 0;
  for (const t of tokens) {
    if (t.type === "punct" && (t.value === "(" || t.value === "[")) depth++;
    else if (t.type === "punct" && (t.value === ")" || t.value === "]")) depth--;
    if (t.type === "punct" && t.value === ";" && depth === 0) {
      if (cur.length) stmts.push(cur);
      cur = [];
      continue;
    }
    cur.push(t);
  }
  if (cur.length) stmts.push(cur);
  return stmts;
}

const isWord = (t, w) => t && t.type === "word" && t.value.toLowerCase() === w;

// ---------------------------------------------------------------------------
// Value reading
// ---------------------------------------------------------------------------
// Reads a single scalar/array value starting at cursor { i }. Returns the JS value.
function readValue(tokens, cur) {
  const t = tokens[cur.i];
  if (!t) return null;
  if (t.type === "word") {
    const lw = t.value.toLowerCase();
    if (lw === "null") { cur.i++; return null; }
    if (lw === "true") { cur.i++; return true; }
    if (lw === "false") { cur.i++; return false; }
    if (lw === "array") {
      cur.i++; // ARRAY
      // expect [
      if (tokens[cur.i]?.value === "[") cur.i++;
      const arr = [];
      while (tokens[cur.i] && tokens[cur.i].value !== "]") {
        arr.push(readValue(tokens, cur));
        if (tokens[cur.i]?.value === ",") cur.i++;
      }
      if (tokens[cur.i]?.value === "]") cur.i++;
      // optional ::type cast on the array
      if (tokens[cur.i]?.type === "cast") { cur.i += 2; }
      return arr;
    }
    // bare identifier used as a value (rare) -> treat as string
    cur.i++;
    return t.value;
  }
  if (t.type === "num") { cur.i++; return t.value; }
  if (t.type === "str") {
    cur.i++;
    let castType = null;
    if (tokens[cur.i]?.type === "cast") {
      castType = tokens[cur.i + 1]?.value?.toLowerCase() ?? null;
      cur.i += 2;
    }
    if (castType === "jsonb" || castType === "json") {
      try { return JSON.parse(t.value); }
      catch { return t.value; }
    }
    return t.value;
  }
  // unknown -> advance and return null
  cur.i++;
  return null;
}

// Reads a comma-separated list of bare identifiers inside ( ... ). Returns names[].
function readIdentList(tokens, cur) {
  const names = [];
  if (tokens[cur.i]?.value === "(") cur.i++;
  while (tokens[cur.i] && tokens[cur.i].value !== ")") {
    if (tokens[cur.i].type === "word") names.push(tokens[cur.i].value);
    cur.i++;
    if (tokens[cur.i]?.value === ",") cur.i++;
  }
  if (tokens[cur.i]?.value === ")") cur.i++;
  return names;
}

// Reads one `( value, value, ... )` tuple into an array of values.
function readTuple(tokens, cur) {
  const vals = [];
  if (tokens[cur.i]?.value !== "(") return vals;
  cur.i++; // (
  let depth = 1;
  while (tokens[cur.i] && depth > 0) {
    if (tokens[cur.i].value === "(") { depth++; cur.i++; continue; }
    if (tokens[cur.i].value === ")") { depth--; cur.i++; break; }
    vals.push(readValue(tokens, cur));
    if (tokens[cur.i]?.value === ",") cur.i++;
  }
  return vals;
}

// ---------------------------------------------------------------------------
// Statement parsers
// ---------------------------------------------------------------------------
// Reads `INSERT INTO <table> ( <cols> )` and leaves cur at VALUES/SELECT.
function readInsertHeader(tokens) {
  const cur = { i: 1 }; // skip INSERT
  if (isWord(tokens[cur.i], "into")) cur.i++;
  const table = tokens[cur.i++].value;
  const columns = readIdentList(tokens, cur);
  return { cur, table, columns };
}

// Parses INSERT ... VALUES immediately; defers INSERT ... SELECT (needs row ids first).
function parseInsert(tokens, data, deferred) {
  const { cur, table, columns } = readInsertHeader(tokens);
  data[table] ??= [];

  if (isWord(tokens[cur.i], "values")) {
    cur.i++;
    while (cur.i < tokens.length) {
      if (tokens[cur.i]?.value !== "(") break;
      const vals = readTuple(tokens, cur);
      const row = {};
      columns.forEach((col, idx) => { row[col] = vals[idx]; });
      data[table].push(row);
      if (tokens[cur.i]?.value === ",") { cur.i++; continue; }
      break;
    }
    return;
  }

  if (isWord(tokens[cur.i], "select")) {
    deferred.push(tokens);
  }
}

// Reads a single SELECT expression, returns a descriptor:
//  { kind: 'lit', value } | { kind: 'ref', src: 'a'|'v', col, jsonb }
function readSelectExpr(tokens, cur) {
  const t = tokens[cur.i];
  if (t.type === "word" && (t.value === "a" || t.value === "v") && tokens[cur.i + 1]?.value === ".") {
    const src = t.value;
    cur.i += 2; // src .
    const col = tokens[cur.i++].value;
    let jsonb = false;
    if (tokens[cur.i]?.type === "cast") {
      jsonb = tokens[cur.i + 1]?.value?.toLowerCase() === "jsonb";
      cur.i += 2;
    }
    return { kind: "ref", src, col, jsonb };
  }
  // literal (string/number/null/true/false)
  const value = readValue(tokens, cur);
  return { kind: "lit", value };
}

function parseInsertSelect(tokens, cur, table, columns, data) {
  cur.i++; // SELECT
  // read select expressions until FROM
  const exprs = [];
  while (cur.i < tokens.length && !isWord(tokens[cur.i], "from")) {
    exprs.push(readSelectExpr(tokens, cur));
    if (tokens[cur.i]?.value === ",") cur.i++;
  }
  cur.i++; // FROM
  // expect: applications a  [CROSS JOIN ( VALUES ... ) AS v ( vcols )]  WHERE a.candidate_id = X AND a.req_id = Y
  // fromTable + alias
  const fromTable = tokens[cur.i++].value; // applications
  if (tokens[cur.i]?.type === "word" && tokens[cur.i].value === "a") cur.i++; // alias a

  let valuesRows = null;
  let vCols = null;
  if (isWord(tokens[cur.i], "cross")) {
    cur.i++; // CROSS
    if (isWord(tokens[cur.i], "join")) cur.i++;
    // ( VALUES (..),(..) )
    if (tokens[cur.i]?.value === "(") cur.i++;
    if (isWord(tokens[cur.i], "values")) cur.i++;
    valuesRows = [];
    while (tokens[cur.i]?.value === "(") {
      valuesRows.push(readTuple(tokens, cur));
      if (tokens[cur.i]?.value === ",") { cur.i++; continue; }
      break;
    }
    if (tokens[cur.i]?.value === ")") cur.i++;
    if (isWord(tokens[cur.i], "as")) cur.i++;
    if (tokens[cur.i]?.type === "word") cur.i++; // v
    vCols = readIdentList(tokens, cur);
  }

  // WHERE a.candidate_id = X AND a.req_id = Y
  const where = {};
  if (isWord(tokens[cur.i], "where")) {
    cur.i++;
    while (cur.i < tokens.length) {
      // a.col = value
      if (tokens[cur.i]?.value === "a" && tokens[cur.i + 1]?.value === ".") cur.i += 2;
      const col = tokens[cur.i++].value;
      if (tokens[cur.i]?.value === "=") cur.i++;
      const val = readValue(tokens, cur);
      where[col] = val;
      if (isWord(tokens[cur.i], "and")) { cur.i++; continue; }
      break;
    }
  }

  const apps = (data[fromTable] ?? []).filter((r) =>
    Object.entries(where).every(([k, v]) => r[k] === v),
  );

  const emit = (app, vRow) => {
    const row = {};
    columns.forEach((col, idx) => {
      const e = exprs[idx];
      if (!e) return;
      if (e.kind === "lit") { row[col] = e.value; return; }
      if (e.src === "a") { row[col] = app[e.col]; return; }
      // v.<col>
      const vi = vCols ? vCols.indexOf(e.col) : -1;
      let v = vi >= 0 && vRow ? vRow[vi] : null;
      if (e.jsonb && typeof v === "string") {
        try { v = JSON.parse(v); } catch { /* keep string */ }
      }
      row[col] = v;
    });
    data[table].push(row);
  };

  data[table] ??= [];
  for (const app of apps) {
    if (valuesRows) for (const vRow of valuesRows) emit(app, vRow);
    else emit(app, null);
  }
}

function parseUpdate(tokens, data) {
  const cur = { i: 1 }; // skip UPDATE
  const table = tokens[cur.i++].value;
  if (!isWord(tokens[cur.i], "set")) return;
  cur.i++; // SET
  const set = {};
  while (cur.i < tokens.length && !isWord(tokens[cur.i], "where")) {
    const col = tokens[cur.i++].value;
    if (tokens[cur.i]?.value === "=") cur.i++;
    set[col] = readValue(tokens, cur);
    if (tokens[cur.i]?.value === ",") { cur.i++; continue; }
  }
  const where = {};
  if (isWord(tokens[cur.i], "where")) {
    cur.i++;
    while (cur.i < tokens.length) {
      const col = tokens[cur.i++].value;
      if (tokens[cur.i]?.value === "=") cur.i++;
      where[col] = readValue(tokens, cur);
      if (isWord(tokens[cur.i], "and")) { cur.i++; continue; }
      break;
    }
  }
  for (const row of data[table] ?? []) {
    if (Object.entries(where).every(([k, v]) => row[k] === v)) {
      Object.assign(row, set);
    }
  }
}

// ---------------------------------------------------------------------------
// Synthetic ids / timestamps for rows that relied on DB defaults
// (seed omits id/created_at for many tables; Postgres fills them at insert time).
// ---------------------------------------------------------------------------
const NO_ID = new Set(["candidate_pool_members", "req_candidate_pools"]);
const NO_CREATED_AT = new Set(["hc_plan_settings"]);
const BASE_TS = Date.UTC(2026, 4, 1, 0, 0, 0); // 2026-05-01, for spread ordering

function hashHex(s) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0").slice(0, 8);
}
function synthId(table, i) {
  return `${hashHex(table)}-0000-4000-8000-${i.toString(16).padStart(12, "0")}`;
}
// Fills missing id/created_at without overwriting values the seed provided. Idempotent.
function assignSynthetic(data) {
  for (const [table, rows] of Object.entries(data)) {
    rows.forEach((row, i) => {
      if (!NO_ID.has(table) && (row.id === undefined || row.id === null)) {
        row.id = synthId(table, i);
      }
      if (!NO_CREATED_AT.has(table) && (row.created_at === undefined || row.created_at === null)) {
        row.created_at = new Date(BASE_TS - i * 3600000).toISOString();
      }
    });
  }
}

// Column defaults from schema.sql that Postgres would apply on INSERT. The seed
// omits these, so we materialize them here (e.g. requisitions.salary_currency).
const COLUMN_DEFAULTS = {
  candidates: { work_history: [], education: [], skills: [], tags: [] },
  requisitions: { salary_currency: "USD", employment_type: "full_time", status: "open", headcount: 1 },
  req_interviews: { interview_type: "standard", duration_minutes: 60 },
  applications: { status: "active", current_milestone: "application" },
  application_interviews: { interview_type: "standard", duration_minutes: 60, status: "pending" },
  hc_positions: { position_type: "open", employment_type: "full_time", priority: "medium", in_plan: false },
  hc_employees: { employment_type: "full_time", status: "active", is_direct_report: false },
  hc_scenarios: { status: "pending", in_plan: false },
  hc_scenario_positions: { employment_type: "full_time", priority: "medium" },
  hc_approval_requests: { status: "pending" },
  hc_plan_settings: { plan_status: "open", plan_locked: false, archived: false, collaborators: [] },
};
function applyColumnDefaults(data) {
  for (const [table, rows] of Object.entries(data)) {
    const defaults = COLUMN_DEFAULTS[table];
    for (const row of rows) {
      if (defaults) {
        for (const [col, val] of Object.entries(defaults)) {
          if (row[col] === undefined || row[col] === null) {
            row[col] = Array.isArray(val) ? [...val] : val;
          }
        }
      }
      // opened_date defaults to the row's creation time.
      if (table === "requisitions" && (row.opened_date === undefined || row.opened_date === null)) {
        row.opened_date = row.created_at;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const sql = readFileSync(SEED_PATH, "utf8");
const tokens = tokenize(sql);
const statements = splitStatements(tokens);
const data = {};
const deferred = [];

// Phase 1: INSERT ... VALUES and UPDATE
for (const stmt of statements) {
  const head = stmt[0];
  if (!head || head.type !== "word") continue;
  const kw = head.value.toLowerCase();
  try {
    if (kw === "insert") parseInsert(stmt, data, deferred);
    else if (kw === "update") parseUpdate(stmt, data);
  } catch (err) {
    console.warn(`⚠️  Skipped a ${kw} statement: ${err.message}`);
  }
}

// Phase 2: fill ids/timestamps so INSERT ... SELECT can resolve application ids
assignSynthetic(data);

// Phase 3: deferred INSERT ... SELECT (resolves a.id from applications)
for (const stmt of deferred) {
  try {
    const { cur, table, columns } = readInsertHeader(stmt);
    data[table] ??= [];
    if (isWord(stmt[cur.i], "select")) parseInsertSelect(stmt, cur, table, columns, data);
  } catch (err) {
    console.warn(`⚠️  Skipped an INSERT ... SELECT: ${err.message}`);
  }
}

// Phase 4: fill ids/timestamps for rows created in phase 3
assignSynthetic(data);

// Phase 5: materialize schema column defaults the seed relied on
applyColumnDefaults(data);

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(data, null, 2) + "\n");

console.log("Generated", OUT_PATH);
console.log("Row counts:");
for (const [table, rows] of Object.entries(data)) {
  console.log(`  ${table.padEnd(26)} ${rows.length}`);
}
