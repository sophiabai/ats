import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Application, Milestone } from "@/types/database";

export function useMoveApplicationForward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      nextStageId,
      nextMilestone,
    }: {
      applicationId: string;
      candidateId: string;
      nextStageId: string;
      nextMilestone: Milestone;
    }) => {
      const { data, error } = await supabase
        .from("applications")
        .update({
          current_stage_id: nextStageId,
          current_milestone: nextMilestone,
        })
        .eq("id", applicationId)
        .select()
        .single();

      if (error) throw error;
      return data as Application;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["candidate", variables.candidateId],
      });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}
