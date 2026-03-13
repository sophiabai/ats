import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { HcApprovalRequest } from "@/types/database";

export function useHcApprovalRequests() {
  return useQuery({
    queryKey: ["hc-approval-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hc_approval_requests")
        .select("*")
        .order("submitted_date", { ascending: false })
        .returns<HcApprovalRequest[]>();

      if (error) throw error;
      return data;
    },
  });
}
