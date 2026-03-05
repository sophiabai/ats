import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Candidate } from "@/types/database";

export function useCandidates() {
  return useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*, applications(count)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data as (Candidate & { applications: { count: number }[] })[]).map(
        (c) => ({
          ...c,
          application_count: c.applications?.[0]?.count ?? 0,
        }),
      );
    },
  });
}

export type CandidateRow = Candidate & { application_count: number };
