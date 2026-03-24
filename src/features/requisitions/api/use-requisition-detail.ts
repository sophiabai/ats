import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Requisition,
  ReqStage,
  Application,
  Candidate,
  Milestone,
} from "@/types/database";

export interface ApplicationWithCandidate extends Application {
  candidates: Candidate;
}

export interface RequisitionDetail extends Requisition {
  req_stages: ReqStage[];
  applications: ApplicationWithCandidate[];
}

export function useRequisitionDetail(reqId: string) {
  return useQuery({
    queryKey: ["requisition", reqId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requisitions")
        .select(
          "*, req_stages(*), applications(*, candidates(*))",
        )
        .eq("id", reqId)
        .single();

      if (error) throw error;
      return data as unknown as RequisitionDetail;
    },
    enabled: !!reqId,
  });
}

export function groupApplicationsByMilestone(
  applications: ApplicationWithCandidate[],
) {
  const groups: Record<Milestone, ApplicationWithCandidate[]> = {
    application: [],
    screen: [],
    final_interview: [],
    offer: [],
    offer_accepted: [],
  };
  const rejected: ApplicationWithCandidate[] = [];

  for (const app of applications) {
    if (app.status === "rejected" || app.status === "withdrawn") {
      rejected.push(app);
    } else {
      groups[app.current_milestone].push(app);
    }
  }

  return { groups, rejected };
}
