import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { HcDepartment } from "@/types/database";

export function useHcDepartments() {
  return useQuery({
    queryKey: ["hc-departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hc_departments")
        .select("*")
        .order("name")
        .returns<HcDepartment[]>();

      if (error) throw error;
      return data;
    },
  });
}
