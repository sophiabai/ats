import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { HcScenario } from "@/types/database";

export function useHcScenarios() {
  return useQuery({
    queryKey: ["hc-scenarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hc_scenarios")
        .select("*, scenario_positions:hc_scenario_positions(*)")
        .order("created_at", { ascending: false })
        .returns<HcScenario[]>();

      if (error) throw error;
      return data;
    },
  });
}

export function useApproveScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scenarioId,
      addToPlan,
    }: {
      scenarioId: string;
      addToPlan: boolean;
    }) => {
      const { error: updateErr } = await supabase
        .from("hc_scenarios")
        .update({ status: "approved", in_plan: addToPlan })
        .eq("id", scenarioId);
      if (updateErr) throw updateErr;

      const { data: scenarioPositions, error: posErr } = await supabase
        .from("hc_scenario_positions")
        .select("*")
        .eq("scenario_id", scenarioId);
      if (posErr) throw posErr;

      if (scenarioPositions && scenarioPositions.length > 0) {
        const { data: lastPos } = await supabase
          .from("hc_positions")
          .select("position_id")
          .order("position_id", { ascending: false })
          .limit(1);

        let nextNum = 1;
        if (lastPos && lastPos.length > 0) {
          nextNum =
            parseInt(lastPos[0].position_id.replace("PID-", ""), 10) + 1;
        }

        const newPositions = scenarioPositions.map((sp, i) => ({
          position_id: `PID-${String(nextNum + i).padStart(3, "0")}`,
          title: sp.title,
          department: sp.department,
          level: sp.level,
          location: sp.location,
          employment_type: sp.employment_type,
          cost_center: sp.cost_center,
          salary_min: sp.salary_min,
          salary_max: sp.salary_max,
          priority: sp.priority,
          hiring_manager: sp.hiring_manager,
          target_date: sp.target_date,
          position_type: "open",
          in_plan: addToPlan,
          scenario_id: scenarioId,
        }));

        const { error: insertErr } = await supabase
          .from("hc_positions")
          .insert(newPositions);
        if (insertErr) throw insertErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hc-scenarios"] });
      queryClient.invalidateQueries({ queryKey: ["hc-positions"] });
    },
  });
}

export function useRejectScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scenarioId: string) => {
      const { error } = await supabase
        .from("hc_scenarios")
        .update({ status: "rejected" })
        .eq("id", scenarioId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hc-scenarios"] });
    },
  });
}
