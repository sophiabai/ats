import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CandidateActivity, CandidateActivityType } from "@/types/database";

export interface CreateActivityInput {
  candidateId: string;
  applicationId?: string | null;
  activityType: CandidateActivityType;
  action: string;
  detail?: string | null;
  metadata?: Record<string, unknown>;
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateActivityInput) => {
      const { data, error } = await supabase
        .from("candidate_activities")
        .insert({
          candidate_id: input.candidateId,
          application_id: input.applicationId ?? null,
          activity_type: input.activityType,
          action: input.action,
          detail: input.detail ?? null,
          metadata: input.metadata ?? {},
        })
        .select()
        .single();

      if (error) throw error;

      // Update the candidate's last_activity summary
      await supabase
        .from("candidates")
        .update({
          last_activity_action: input.action,
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", input.candidateId);

      return data as CandidateActivity;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["candidate-activities", data.candidate_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["candidate", data.candidate_id],
      });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}
