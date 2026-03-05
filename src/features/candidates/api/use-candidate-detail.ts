import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Candidate,
  Application,
  Requisition,
  ApplicationInterview,
  ReqStage,
} from "@/types/database";

export interface ApplicationDetail extends Application {
  requisitions: Requisition;
  application_interviews: (ApplicationInterview & {
    req_stages: ReqStage;
  })[];
}

export interface CandidateDetail extends Candidate {
  applications: ApplicationDetail[];
}

export function useCandidateDetail(candidateId: string) {
  return useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select(
          `*,
          applications(
            *,
            requisitions(*),
            application_interviews(*, req_stages(*))
          )`,
        )
        .eq("id", candidateId)
        .single();

      if (error) throw error;
      return data as unknown as CandidateDetail;
    },
    enabled: !!candidateId,
  });
}
