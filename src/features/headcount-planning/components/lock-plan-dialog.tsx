import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLockPlan } from "@/features/headcount-planning/api/use-hc-plan-settings";

interface LockPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LockPlanDialog({ open, onOpenChange }: LockPlanDialogProps) {
  const lockPlan = useLockPlan();

  async function handleLock() {
    await lockPlan.mutateAsync();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lock plan</DialogTitle>
          <DialogDescription>
            This will lock the headcount plan and prevent any further changes.
            This action cannot be easily undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleLock}
            disabled={lockPlan.isPending}
          >
            {lockPlan.isPending ? "Locking..." : "Lock plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
