import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Intake, Requisition } from "@/types/database";

export interface IntakeWithRequisitions extends Intake {
  requisitions: Pick<
    Requisition,
    "id" | "req_number" | "title" | "status" | "department" | "created_at"
  >[];
}

export function useIntake(intakeId: string | undefined) {
  return useQuery({
    queryKey: ["intake", intakeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intakes")
        .select(
          "*, requisitions(id, req_number, title, status, department, created_at)",
        )
        .eq("id", intakeId!)
        .single();

      if (error) throw error;
      return data as unknown as IntakeWithRequisitions;
    },
    enabled: !!intakeId,
  });
}
