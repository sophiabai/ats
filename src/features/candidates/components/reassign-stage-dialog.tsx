import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Milestone } from "@/types/database";
import {
  MILESTONE_LABELS,
  MILESTONE_ORDER,
} from "@/features/candidates/components/application-tab-content";
import type { ReqStageWithInterviews } from "@/features/candidates/api/use-candidate-detail";

export function ReassignStageDialog({
  open,
  onOpenChange,
  candidateName,
  allStages,
  currentStageId,
  defaultStageId,
  onConfirm,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  allStages: ReqStageWithInterviews[];
  currentStageId: string | null;
  defaultStageId: string | null;
  onConfirm: (stageId: string, milestone: Milestone) => void;
  isSaving?: boolean;
}) {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(
    defaultStageId,
  );

  useEffect(() => {
    if (open) setSelectedStageId(defaultStageId);
  }, [open, defaultStageId]);

  const orderedStages = [...allStages].sort((a, b) => {
    const ai = MILESTONE_ORDER.indexOf(a.milestone);
    const bi = MILESTONE_ORDER.indexOf(b.milestone);
    if (ai !== bi) return ai - bi;
    return a.sort_order - b.sort_order;
  });

  const handleConfirm = () => {
    if (!selectedStageId) return;
    const stage = orderedStages.find((s) => s.id === selectedStageId);
    if (!stage) return;
    onConfirm(stage.id, stage.milestone);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign stage</DialogTitle>
          <DialogDescription>
            Move {candidateName} to a different stage in the pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="reassign-stage">Stage</Label>
          <Select
            value={selectedStageId ?? undefined}
            onValueChange={(v) => setSelectedStageId(v)}
          >
            <SelectTrigger id="reassign-stage" className="w-full">
              <SelectValue placeholder="Select a stage" />
            </SelectTrigger>
            <SelectContent>
              {orderedStages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  <span>
                    {MILESTONE_LABELS[stage.milestone]} &middot; {stage.name}
                  </span>
                  {stage.id === currentStageId && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (current)
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isSaving ||
              !selectedStageId ||
              selectedStageId === currentStageId
            }
          >
            Reassign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
