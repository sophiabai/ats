import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Candidate } from "@/types/database";

export type CandidateInsert = Omit<Candidate, "id" | "created_at">;
export type CandidateUpdate = Partial<CandidateInsert>;

export function useCreateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CandidateInsert) => {
      const { data, error } = await supabase
        .from("candidates")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as Candidate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: CandidateUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("candidates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Candidate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["candidate", data.id] });
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("candidates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}
