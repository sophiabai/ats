import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { HcEmployee } from "@/types/database";

export function useHcEmployees(directReportsOnly = false) {
  return useQuery({
    queryKey: ["hc-employees", { directReportsOnly }],
    queryFn: async () => {
      let query = supabase
        .from("hc_employees")
        .select("*")
        .order("name");

      if (directReportsOnly) {
        query = query.eq("is_direct_report", true);
      }

      const { data, error } = await query.returns<HcEmployee[]>();
      if (error) throw error;
      return data;
    },
  });
}
