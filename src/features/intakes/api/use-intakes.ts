import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Intake } from "@/types/database";

export interface IntakeRow extends Intake {
  requisition_count: number;
}

export function useIntakes() {
  return useQuery({
    queryKey: ["intakes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intakes")
        .select("*, requisitions(count)")
        .order("updated_at", { ascending: false })
        .returns<(Intake & { requisitions: { count: number }[] })[]>();

      if (error) throw error;

      return data.map<IntakeRow>((row) => ({
        ...row,
        requisition_count: row.requisitions?.[0]?.count ?? 0,
      }));
    },
  });
}
