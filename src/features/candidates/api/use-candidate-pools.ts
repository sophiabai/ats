import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CandidatePool } from "@/types/database";

export function useCandidatePools() {
  return useQuery({
    queryKey: ["candidate-pools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_pools")
        .select("*, candidate_pool_members(count)")
        .order("name");

      if (error) throw error;

      return (
        data as (CandidatePool & {
          candidate_pool_members: { count: number }[];
        })[]
      ).map((p) => ({
        ...p,
        member_count: p.candidate_pool_members?.[0]?.count ?? 0,
      }));
    },
  });
}

export type CandidatePoolRow = CandidatePool & { member_count: number };

export function useCreateCandidatePool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("candidate_pools")
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      return data as CandidatePool;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-pools"] });
    },
  });
}

export function useAddCandidatesToPool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      poolId,
      candidateIds,
    }: {
      poolId: string;
      candidateIds: string[];
    }) => {
      const rows = candidateIds.map((candidate_id) => ({
        pool_id: poolId,
        candidate_id,
      }));

      const { error } = await supabase
        .from("candidate_pool_members")
        .upsert(rows, { onConflict: "pool_id,candidate_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-pools"] });
      queryClient.invalidateQueries({ queryKey: ["candidate-pool"] });
    },
  });
}

export function usePoolCandidates(poolId: string) {
  return useQuery({
    queryKey: ["candidate-pool", poolId],
    enabled: !!poolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_pool_members")
        .select("candidate_id, candidates(*, applications(count))")
        .eq("pool_id", poolId);

      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        ...row.candidates,
        application_count: row.candidates.applications?.[0]?.count ?? 0,
      }));
    },
  });
}

export function useRemoveCandidateFromPool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      poolId,
      candidateId,
    }: {
      poolId: string;
      candidateId: string;
    }) => {
      const { error } = await supabase
        .from("candidate_pool_members")
        .delete()
        .eq("pool_id", poolId)
        .eq("candidate_id", candidateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-pools"] });
      queryClient.invalidateQueries({ queryKey: ["candidate-pool"] });
    },
  });
}
