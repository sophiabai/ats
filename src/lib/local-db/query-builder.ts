// A small subset of the PostgREST query builder (supabase-js `.from(...)`), backed
// by the in-memory local store. Implements exactly the surface the app uses:
// select (with nested embeds + count), eq/neq/in/gt/gte/lt/lte/is/ilike/like/
// contains/match/or filters, order, limit, single/maybeSingle, and
// insert/update/delete/upsert with optional returning via .select().
import { store, type Row } from "./store";
import { resolveRelation } from "./relationships";

interface QueryResult<T = unknown> {
  data: T;
  error: { message: string; code?: string; details?: string } | null;
}

// ---------------------------------------------------------------------------
// select() string parsing
// ---------------------------------------------------------------------------
interface ParsedSelect {
  all: boolean;
  columns: string[];
  embeds: ParsedEmbed[];
}
interface ParsedEmbed {
  key: string;
  table: string;
  hint?: string;
  count: boolean;
  select: ParsedSelect | null;
}

// Splits a comma list while respecting nested parentheses.
function splitTopLevel(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

// Given a string starting with "(", returns the content up to the matching ")".
function extractParens(s: string): string {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") {
      depth--;
      if (depth === 0) return s.slice(1, i);
    }
  }
  return s.slice(1);
}

function parseSelect(sel: string | null): ParsedSelect {
  const result: ParsedSelect = { all: false, columns: [], embeds: [] };
  if (!sel || sel.trim() === "") {
    result.all = true;
    return result;
  }
  for (const part of splitTopLevel(sel)) {
    const paren = part.indexOf("(");
    if (paren === -1) {
      if (part === "*") result.all = true;
      else if (part !== "count") result.columns.push(part);
      continue;
    }
    const head = part.slice(0, paren).trim();
    const inner = extractParens(part.slice(paren));

    let alias: string | undefined;
    let rest = head;
    const colon = head.indexOf(":");
    if (colon !== -1) {
      alias = head.slice(0, colon).trim();
      rest = head.slice(colon + 1).trim();
    }
    let hint: string | undefined;
    let table = rest;
    const bang = rest.indexOf("!");
    if (bang !== -1) {
      table = rest.slice(0, bang).trim();
      hint = rest.slice(bang + 1).trim();
    }
    const isCount = inner.trim() === "count";
    result.embeds.push({
      key: alias ?? table,
      table,
      hint,
      count: isCount,
      select: isCount ? null : parseSelect(inner),
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Projection (applies select() shape to a row, resolving embeds)
// ---------------------------------------------------------------------------
function projectRow(table: string, row: Row, parsed: ParsedSelect): Row {
  const out: Row = {};
  if (parsed.all) {
    Object.assign(out, row);
  } else {
    for (const col of parsed.columns) out[col] = row[col];
  }
  for (const emb of parsed.embeds) {
    out[emb.key] = computeEmbed(table, row, emb);
  }
  return out;
}

function computeEmbed(parentTable: string, parentRow: Row, emb: ParsedEmbed): unknown {
  const rel = resolveRelation(parentTable, emb.table, emb.hint);
  if (!rel) {
    console.warn(`[local-db] no relationship ${parentTable} -> ${emb.table}`);
    return emb.count ? [{ count: 0 }] : null;
  }
  const matches = store
    .table(emb.table)
    .filter((t) => t[rel.childKey] === parentRow[rel.parentKey]);

  if (emb.count) return [{ count: matches.length }];
  if (rel.kind === "to-one") {
    return matches[0] ? projectRow(emb.table, matches[0], emb.select!) : null;
  }
  return matches.map((m) => projectRow(emb.table, m, emb.select!));
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------
type Predicate = (row: Row) => boolean;

function likePatternToRegex(pattern: string, flags: string): RegExp {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const body = escaped.replace(/%/g, ".*").replace(/_/g, ".");
  return new RegExp(`^${body}$`, flags);
}

function coerce(raw: string): string | number | boolean | null {
  if (raw === "null") return null;
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw !== "" && !Number.isNaN(Number(raw))) return Number(raw);
  return raw;
}

// Builds a predicate for a `column.operator.value` term (used by or()).
function makePredicate(col: string, op: string, rawValue: string): Predicate {
  switch (op) {
    case "eq":
      return (r) => r[col] === coerce(rawValue);
    case "neq":
      return (r) => r[col] !== coerce(rawValue);
    case "ilike": {
      const re = likePatternToRegex(rawValue, "i");
      return (r) => r[col] != null && re.test(String(r[col]));
    }
    case "like": {
      const re = likePatternToRegex(rawValue, "");
      return (r) => r[col] != null && re.test(String(r[col]));
    }
    case "gt":
      return (r) => (r[col] as number) > (coerce(rawValue) as number);
    case "gte":
      return (r) => (r[col] as number) >= (coerce(rawValue) as number);
    case "lt":
      return (r) => (r[col] as number) < (coerce(rawValue) as number);
    case "lte":
      return (r) => (r[col] as number) <= (coerce(rawValue) as number);
    case "is":
      return (r) => r[col] === coerce(rawValue);
    default:
      return () => false;
  }
}

// Splits an or() term list on top-level commas, ignoring commas inside quotes/parens.
function splitOrTerms(s: string): string[] {
  const terms: string[] = [];
  let depth = 0;
  let inQuote = false;
  let cur = "";
  for (const ch of s) {
    if (ch === '"') {
      inQuote = !inQuote;
      cur += ch;
    } else if (!inQuote && ch === "(") {
      depth++;
      cur += ch;
    } else if (!inQuote && ch === ")") {
      depth--;
      cur += ch;
    } else if (!inQuote && depth === 0 && ch === ",") {
      terms.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) terms.push(cur);
  return terms.map((t) => t.trim()).filter(Boolean);
}

function parseOr(str: string): Predicate {
  const preds = splitOrTerms(str).map((term) => {
    const first = term.indexOf(".");
    const second = term.indexOf(".", first + 1);
    const col = term.slice(0, first);
    const op = term.slice(first + 1, second);
    let value = term.slice(second + 1);
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    return makePredicate(col, op, value);
  });
  return (row) => preds.some((p) => p(row));
}

// ---------------------------------------------------------------------------
// Ordering
// ---------------------------------------------------------------------------
interface OrderSpec {
  column: string;
  ascending: boolean;
  nullsFirst?: boolean;
}

function applyOrder(rows: Row[], orders: OrderSpec[]): Row[] {
  if (orders.length === 0) return rows;
  return [...rows].sort((a, b) => {
    for (const o of orders) {
      const av = a[o.column];
      const bv = b[o.column];
      const aNull = av == null;
      const bNull = bv == null;
      // Postgres default: NULLS LAST for ASC, NULLS FIRST for DESC.
      const nullsFirst = o.nullsFirst ?? !o.ascending;
      if (aNull && bNull) continue;
      if (aNull) return nullsFirst ? -1 : 1;
      if (bNull) return nullsFirst ? 1 : -1;
      let cmp = av < bv ? -1 : av > bv ? 1 : 0;
      if (!o.ascending) cmp = -cmp;
      if (cmp !== 0) return cmp;
    }
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------
type Mode = "select" | "insert" | "update" | "delete" | "upsert";

export class LocalQueryBuilder<T = unknown> implements PromiseLike<QueryResult<T>> {
  private readonly tableName: string;
  private mode: Mode = "select";
  private selectSpec: string | null = null;
  private wantReturning = false;
  private filters: Predicate[] = [];
  private orders: OrderSpec[] = [];
  private limitN: number | null = null;
  private singleMode: "single" | "maybe" | null = null;
  private payload: Row | Row[] | null = null;
  private conflictKeys: string[] = [];

  constructor(table: string) {
    this.tableName = table;
  }

  // ---- selection ----
  select(spec = "*"): this {
    this.selectSpec = spec;
    if (this.mode !== "select") this.wantReturning = true;
    return this;
  }
  returns<R = unknown>(): LocalQueryBuilder<R> {
    return this as unknown as LocalQueryBuilder<R>;
  }

  // ---- filters ----
  eq(column: string, value: unknown): this {
    this.filters.push((r) => r[column] === value);
    return this;
  }
  neq(column: string, value: unknown): this {
    this.filters.push((r) => r[column] !== value);
    return this;
  }
  in(column: string, values: unknown[]): this {
    this.filters.push((r) => values.includes(r[column]));
    return this;
  }
  gt(column: string, value: number): this {
    this.filters.push((r) => (r[column] as number) > value);
    return this;
  }
  gte(column: string, value: number): this {
    this.filters.push((r) => (r[column] as number) >= value);
    return this;
  }
  lt(column: string, value: number): this {
    this.filters.push((r) => (r[column] as number) < value);
    return this;
  }
  lte(column: string, value: number): this {
    this.filters.push((r) => (r[column] as number) <= value);
    return this;
  }
  is(column: string, value: unknown): this {
    this.filters.push((r) => r[column] === value);
    return this;
  }
  ilike(column: string, pattern: string): this {
    const re = likePatternToRegex(pattern, "i");
    this.filters.push((r) => r[column] != null && re.test(String(r[column])));
    return this;
  }
  like(column: string, pattern: string): this {
    const re = likePatternToRegex(pattern, "");
    this.filters.push((r) => r[column] != null && re.test(String(r[column])));
    return this;
  }
  contains(column: string, value: unknown): this {
    this.filters.push((r) => {
      const cell = r[column];
      if (!Array.isArray(cell)) return false;
      const needles = Array.isArray(value) ? value : [value];
      return needles.every((n) => cell.includes(n));
    });
    return this;
  }
  match(criteria: Record<string, unknown>): this {
    this.filters.push((r) => Object.entries(criteria).every(([k, v]) => r[k] === v));
    return this;
  }
  or(filterString: string): this {
    this.filters.push(parseOr(filterString));
    return this;
  }

  // ---- ordering / limiting ----
  order(column: string, opts?: { ascending?: boolean; nullsFirst?: boolean }): this {
    this.orders.push({
      column,
      ascending: opts?.ascending ?? true,
      nullsFirst: opts?.nullsFirst,
    });
    return this;
  }
  limit(n: number): this {
    this.limitN = n;
    return this;
  }
  range(from: number, to: number): this {
    this.limitN = to - from + 1;
    return this;
  }

  // ---- single-row ----
  single<R = unknown>(): LocalQueryBuilder<R> {
    this.singleMode = "single";
    return this as unknown as LocalQueryBuilder<R>;
  }
  maybeSingle<R = unknown>(): LocalQueryBuilder<R> {
    this.singleMode = "maybe";
    return this as unknown as LocalQueryBuilder<R>;
  }

  // ---- mutations ----
  insert(payload: Row | Row[]): this {
    this.mode = "insert";
    this.payload = payload;
    return this;
  }
  update(patch: Row): this {
    this.mode = "update";
    this.payload = patch;
    return this;
  }
  delete(): this {
    this.mode = "delete";
    return this;
  }
  upsert(payload: Row | Row[], opts?: { onConflict?: string }): this {
    this.mode = "upsert";
    this.payload = payload;
    this.conflictKeys = opts?.onConflict
      ? opts.onConflict.split(",").map((s) => s.trim())
      : [];
    return this;
  }

  // ---- execution ----
  private matchesFilters(row: Row): boolean {
    return this.filters.every((f) => f(row));
  }

  private finalize(rows: Row[]): QueryResult<T> {
    if (this.singleMode === "single") {
      if (rows.length === 1) return { data: rows[0] as T, error: null };
      return {
        data: null as T,
        error: {
          code: "PGRST116",
          message: `Expected a single row but found ${rows.length}`,
        },
      };
    }
    if (this.singleMode === "maybe") {
      if (rows.length <= 1) return { data: (rows[0] ?? null) as T, error: null };
      return {
        data: null as T,
        error: {
          code: "PGRST116",
          message: `Expected at most one row but found ${rows.length}`,
        },
      };
    }
    return { data: rows as T, error: null };
  }

  private project(rows: Row[]): Row[] {
    const parsed = parseSelect(this.selectSpec ?? "*");
    return rows.map((r) => projectRow(this.tableName, r, parsed));
  }

  private runSelect(): QueryResult<T> {
    let rows = store.table(this.tableName).filter((r) => this.matchesFilters(r));
    rows = applyOrder(rows, this.orders);
    if (this.limitN != null) rows = rows.slice(0, this.limitN);
    return this.finalize(this.project(rows));
  }

  private runInsert(): QueryResult<T> {
    const items = Array.isArray(this.payload) ? this.payload : [this.payload!];
    const inserted = items.map((item) => store.applyDefaults(this.tableName, item));
    store.table(this.tableName).push(...inserted);
    store.persist();
    return this.wantReturning
      ? this.finalize(this.project(inserted))
      : { data: null as T, error: null };
  }

  private runUpdate(): QueryResult<T> {
    const patch = this.payload as Row;
    const updated = store
      .table(this.tableName)
      .filter((r) => this.matchesFilters(r));
    for (const row of updated) Object.assign(row, patch);
    store.persist();
    return this.wantReturning
      ? this.finalize(this.project(updated))
      : { data: null as T, error: null };
  }

  private runDelete(): QueryResult<T> {
    const all = store.table(this.tableName);
    const removed = all.filter((r) => this.matchesFilters(r));
    store.db[this.tableName] = all.filter((r) => !this.matchesFilters(r));
    store.persist();
    return this.wantReturning
      ? this.finalize(this.project(removed))
      : { data: null as T, error: null };
  }

  private runUpsert(): QueryResult<T> {
    const items = Array.isArray(this.payload) ? this.payload : [this.payload!];
    const table = store.table(this.tableName);
    const results: Row[] = [];
    for (const item of items) {
      const existing = this.conflictKeys.length
        ? table.find((r) => this.conflictKeys.every((k) => r[k] === item[k]))
        : undefined;
      if (existing) {
        Object.assign(existing, item);
        results.push(existing);
      } else {
        const row = store.applyDefaults(this.tableName, item);
        table.push(row);
        results.push(row);
      }
    }
    store.persist();
    return this.wantReturning
      ? this.finalize(this.project(results))
      : { data: null as T, error: null };
  }

  private execute(): QueryResult<T> {
    switch (this.mode) {
      case "insert":
        return this.runInsert();
      case "update":
        return this.runUpdate();
      case "delete":
        return this.runDelete();
      case "upsert":
        return this.runUpsert();
      default:
        return this.runSelect();
    }
  }

  then<R1 = QueryResult<T>, R2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): Promise<R1 | R2> {
    let result: QueryResult<T>;
    try {
      result = this.execute();
    } catch (err) {
      result = {
        data: null as T,
        error: { message: err instanceof Error ? err.message : String(err) },
      };
    }
    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}
