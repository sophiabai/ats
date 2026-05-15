import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateIntake } from "@/features/intakes/api/use-create-intake";

export function Component() {
  const navigate = useNavigate();
  const createIntake = useCreateIntake();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    createIntake.mutate(
      {},
      {
        onSuccess: (intake) => {
          navigate(`/intakes/${intake.id}`, { replace: true });
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (createIntake.isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-destructive">
          Failed to create intake: {createIntake.error.message}
        </p>
        <Button variant="outline" onClick={() => navigate("/requisitions")}>
          Back to requisitions
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      Creating intake...
    </div>
  );
}
