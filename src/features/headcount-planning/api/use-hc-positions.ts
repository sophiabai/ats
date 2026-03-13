import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { HcPosition } from "@/types/database";

export function useHcPositions(filter?: { inPlan?: boolean }) {
  return useQuery({
    queryKey: ["hc-positions", filter],
    queryFn: async () => {
      let query = supabase
        .from("hc_positions")
        .select("*")
        .order("position_id");

      if (filter?.inPlan !== undefined) {
        query = query.eq("in_plan", filter.inPlan);
      }

      const { data, error } = await query.returns<HcPosition[]>();
      if (error) throw error;
      return data;
    },
  });
}
