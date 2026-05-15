import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Intake } from "@/types/database";
import type { IntakeWithRequisitions } from "@/features/intakes/api/use-intake";

interface UpdateIntakeInput {
  id: string;
  title?: string;
  content?: string;
}

export function useUpdateIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...patch }: UpdateIntakeInput) => {
      const { data, error } = await supabase
        .from("intakes")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single<Intake>();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IntakeWithRequisitions>(
        ["intake", data.id],
        (prev) => (prev ? { ...prev, ...data } : undefined),
      );
      queryClient.invalidateQueries({ queryKey: ["intakes"] });
    },
  });
}
