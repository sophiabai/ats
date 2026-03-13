import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { HcPlanSettings } from "@/types/database";

export function useHcPlanSettings() {
  return useQuery({
    queryKey: ["hc-plan-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hc_plan_settings")
        .select("*")
        .limit(1)
        .returns<HcPlanSettings[]>();

      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useUpdatePlanSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Partial<
        Pick<HcPlanSettings, "plan_name" | "collaborators" | "archived">
      >,
    ) => {
      const { data: existing } = await supabase
        .from("hc_plan_settings")
        .select("id")
        .limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from("hc_plan_settings")
          .update(updates)
          .eq("id", existing[0].id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hc-plan-settings"] });
    },
  });
}

export function useLockPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: existing } = await supabase
        .from("hc_plan_settings")
        .select("id")
        .limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from("hc_plan_settings")
          .update({
            plan_status: "locked",
            plan_locked: true,
            locked_at: new Date().toISOString(),
            locked_by: "Current User",
          })
          .eq("id", existing[0].id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hc_plan_settings").insert({
          plan_status: "locked",
          plan_locked: true,
          locked_at: new Date().toISOString(),
          locked_by: "Current User",
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hc-plan-settings"] });
    },
  });
}
