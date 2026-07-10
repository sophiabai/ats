import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createLocalClient } from "./local-db";

// Demo mode: run entirely against a local, in-browser database (no server, no
// Supabase). Writes persist to localStorage and survive refreshes. Set
// VITE_USE_LOCAL_DB=false in .env.local to point at a real Supabase instead.
const useLocalDb = import.meta.env.VITE_USE_LOCAL_DB !== "false";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!useLocalDb && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    "Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, then restart the dev server.",
  );
}

// The local client implements the small `.from(...)` subset the app uses; the
// cast keeps every existing hook typed against the familiar SupabaseClient API.
export const supabase: SupabaseClient = useLocalDb
  ? (createLocalClient() as unknown as SupabaseClient)
  : createClient(
      supabaseUrl ?? "https://placeholder.supabase.co",
      supabaseAnonKey ?? "placeholder",
    );
