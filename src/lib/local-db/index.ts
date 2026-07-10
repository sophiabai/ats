// Local, DB-free replacement for the supabase-js client used across the app.
// Only `.from(table)` is implemented, since that is the entire surface the hooks
// use. Backed by an in-memory store persisted to localStorage (see store.ts).
import { LocalQueryBuilder } from "./query-builder";

export function createLocalClient() {
  return {
    from(table: string) {
      return new LocalQueryBuilder(table);
    },
  };
}

export { resetLocalDb } from "./store";
