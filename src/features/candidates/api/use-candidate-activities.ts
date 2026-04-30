import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CandidateActivity } from "@/types/database";

export function useCandidateActivities(candidateId: string) {
  return useQuery({
    queryKey: ["candidate-activities", candidateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_activities")
        .select("*")
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CandidateActivity[];
    },
    enabled: !!candidateId,
  });
}
