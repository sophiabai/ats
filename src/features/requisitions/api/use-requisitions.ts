import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Requisition } from "@/types/database";

interface RequisitionWithCounts extends Requisition {
  applications: { count: number }[];
}

export function useRequisitions() {
  return useQuery({
    queryKey: ["requisitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requisitions")
        .select("*, applications(count)")
        .order("created_at", { ascending: false })
        .returns<RequisitionWithCounts[]>();

      if (error) throw error;

      return data.map((req) => ({
        ...req,
        applicant_count: req.applications?.[0]?.count ?? 0,
      }));
    },
  });
}

export type RequisitionRow = Requisition & { applicant_count: number };
