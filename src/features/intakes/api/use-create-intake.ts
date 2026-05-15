import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Intake } from "@/types/database";

interface CreateIntakeInput {
  title?: string;
  content?: string;
}

export function useCreateIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateIntakeInput = {}) => {
      const { data, error } = await supabase
        .from("intakes")
        .insert({
          title: input.title ?? "",
          content: input.content ?? "",
        })
        .select()
        .single<Intake>();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intakes"] });
    },
  });
}
