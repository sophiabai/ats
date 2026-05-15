import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface CreateRequisitionInput {
  title: string;
  department: string;
  employment_type: string;
  level: string;
  hiring_manager_name: string;
  recruiter_name: string;
  coordinator_name: string;
  sourcer_name: string;
  description: string;
  assessment_criteria: string[];
  intake_id?: string | null;
}

export function useCreateRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRequisitionInput) => {
      const { data, error } = await supabase
        .from("requisitions")
        .insert({
          title: input.title,
          department: input.department || null,
          employment_type: input.employment_type,
          level: input.level || null,
          hiring_manager_name: input.hiring_manager_name || null,
          recruiter_name: input.recruiter_name || null,
          coordinator_name: input.coordinator_name || null,
          sourcer_name: input.sourcer_name || null,
          description: input.description || null,
          assessment_criteria:
            input.assessment_criteria.length > 0
              ? input.assessment_criteria
              : null,
          intake_id: input.intake_id ?? null,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      if (variables.intake_id) {
        queryClient.invalidateQueries({
          queryKey: ["intake", variables.intake_id],
        });
        queryClient.invalidateQueries({ queryKey: ["intakes"] });
      }
    },
  });
}
