import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Requisition } from "@/types/database";

export function useJobPosts() {
  return useQuery({
    queryKey: ["job-board"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requisitions")
        .select("*")
        .eq("status", "open")
        .order("opened_date", { ascending: false })
        .returns<Requisition[]>();

      if (error) throw error;
      return data;
    },
  });
}

export function useJobPost(id: string) {
  return useQuery({
    queryKey: ["job-board", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requisitions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Requisition;
    },
    enabled: !!id,
  });
}
