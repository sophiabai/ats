import { supabase } from "@/lib/supabase";

export interface CandidateLookupResult {
  first_name: string;
  last_name: string;
  email: string | null;
  headline: string | null;
}

function escapeFilter(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// Fuzzy-matches a candidate by full name. Tries first + last, then either.
export async function findCandidateByName(
  fullName: string,
): Promise<CandidateLookupResult | null> {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;

  const columns = "first_name, last_name, email, headline";

  if (parts.length >= 2) {
    const first = escapeFilter(parts[0]);
    const last = escapeFilter(parts.slice(1).join(" "));
    const { data } = await supabase
      .from("candidates")
      .select(columns)
      .ilike("first_name", `%${first}%`)
      .ilike("last_name", `%${last}%`)
      .limit(1);
    if (data?.[0]) return data[0] as CandidateLookupResult;
  }

  const any = escapeFilter(parts.join(" "));
  const { data } = await supabase
    .from("candidates")
    .select(columns)
    .or(`first_name.ilike."%${any}%",last_name.ilike."%${any}%"`)
    .limit(1);
  return (data?.[0] as CandidateLookupResult | undefined) ?? null;
}
