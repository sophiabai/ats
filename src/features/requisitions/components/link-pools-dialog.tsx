import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCandidatePools } from "@/features/candidates/api/use-candidate-pools";
import { useLinkPoolsToReq } from "@/features/requisitions/api/use-req-candidate-pools";

interface LinkPoolsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reqId: string;
  alreadyLinkedPoolIds: string[];
}

export function LinkPoolsDialog({
  open,
  onOpenChange,
  reqId,
  alreadyLinkedPoolIds,
}: LinkPoolsDialogProps) {
  const { data: pools } = useCandidatePools();
  const linkMutation = useLinkPoolsToReq();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const availablePools = pools?.filter(
    (p) => !alreadyLinkedPoolIds.includes(p.id)
  );

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    setSelectedIds(new Set());
  }

  async function handleSubmit() {
    if (selectedIds.size === 0) return;
    await linkMutation.mutateAsync({
      reqId,
      poolIds: Array.from(selectedIds),
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link candidate pools</DialogTitle>
        </DialogHeader>

        {!availablePools || availablePools.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            All pools are already linked to this requisition.
          </p>
        ) : (
          <div className="space-y-1">
            {availablePools.map((pool) => (
              <label
                key={pool.id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedIds.has(pool.id)}
                  onCheckedChange={() => toggle(pool.id)}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{pool.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {pool.member_count} candidate
                    {pool.member_count !== 1 ? "s" : ""}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedIds.size === 0 || linkMutation.isPending}
          >
            {linkMutation.isPending
              ? "Linking..."
              : `Link ${selectedIds.size || ""} pool${selectedIds.size !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
