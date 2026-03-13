import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface AddPositionInput {
  title: string;
  department: string;
  level: string;
  location: string;
  employment_type: string;
  cost_center: string;
  salary_min: number | null;
  salary_max: number | null;
  priority: string;
  hiring_manager: string;
  target_date: string;
  in_plan: boolean;
}

async function generateNextPid(): Promise<string> {
  const { data } = await supabase
    .from("hc_positions")
    .select("position_id")
    .order("position_id", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return "PID-001";

  const lastNum = parseInt(data[0].position_id.replace("PID-", ""), 10);
  return `PID-${String(lastNum + 1).padStart(3, "0")}`;
}

export function useAddPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddPositionInput) => {
      const positionId = await generateNextPid();

      const { data, error } = await supabase
        .from("hc_positions")
        .insert({
          position_id: positionId,
          title: input.title,
          department: input.department,
          level: input.level || null,
          location: input.location || null,
          employment_type: input.employment_type,
          cost_center: input.cost_center || null,
          salary_min: input.salary_min,
          salary_max: input.salary_max,
          priority: input.priority,
          hiring_manager: input.hiring_manager || null,
          target_date: input.target_date || null,
          position_type: "open",
          in_plan: input.in_plan,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hc-positions"] });
    },
  });
}
