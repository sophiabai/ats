import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Candidate,
  Application,
  Requisition,
  ApplicationInterview,
  ReqStage,
  ReqInterview,
} from "@/types/database";

export interface ReqStageWithInterviews extends ReqStage {
  req_interviews: ReqInterview[];
}

export interface RequisitionWithPipeline extends Requisition {
  req_stages: ReqStageWithInterviews[];
}

export interface ApplicationDetail extends Application {
  requisitions: RequisitionWithPipeline;
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
            requisitions(*, req_stages(*, req_interviews(*))),
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
