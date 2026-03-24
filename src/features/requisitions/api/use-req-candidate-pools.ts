import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CandidatePool, Candidate } from "@/types/database";

export interface PoolWithCandidates extends CandidatePool {
  candidates: (Candidate & { application_count: number })[];
}

export function useReqCandidatePools(reqId: string) {
  return useQuery({
    queryKey: ["req-candidate-pools", reqId],
    enabled: !!reqId,
    queryFn: async () => {
      const { data: links, error: linksError } = await supabase
        .from("req_candidate_pools")
        .select("pool_id, candidate_pools(id, name, created_at)")
        .eq("req_id", reqId);

      if (linksError) throw linksError;
      if (!links || links.length === 0) return [] as PoolWithCandidates[];

      const poolIds = links.map((l: any) => l.pool_id);

      const { data: members, error: membersError } = await supabase
        .from("candidate_pool_members")
        .select("pool_id, candidates(*, applications(count))")
        .in("pool_id", poolIds);

      if (membersError) throw membersError;

      const candidatesByPool = new Map<string, any[]>();
      for (const m of members ?? []) {
        const list = candidatesByPool.get(m.pool_id) ?? [];
        list.push({
          ...(m as any).candidates,
          application_count:
            (m as any).candidates.applications?.[0]?.count ?? 0,
        });
        candidatesByPool.set(m.pool_id, list);
      }

      return links.map((l: any) => ({
        ...l.candidate_pools,
        candidates: candidatesByPool.get(l.pool_id) ?? [],
      })) as PoolWithCandidates[];
    },
  });
}

export function useLinkPoolsToReq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reqId,
      poolIds,
    }: {
      reqId: string;
      poolIds: string[];
    }) => {
      const rows = poolIds.map((pool_id) => ({
        req_id: reqId,
        pool_id,
      }));

      const { error } = await supabase
        .from("req_candidate_pools")
        .upsert(rows, { onConflict: "req_id,pool_id" });

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["req-candidate-pools", variables.reqId],
      });
    },
  });
}

export function useUnlinkPoolFromReq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reqId,
      poolId,
    }: {
      reqId: string;
      poolId: string;
    }) => {
      const { error } = await supabase
        .from("req_candidate_pools")
        .delete()
        .eq("req_id", reqId)
        .eq("pool_id", poolId);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["req-candidate-pools", variables.reqId],
      });
    },
  });
}
