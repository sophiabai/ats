import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCandidatePools,
  useCreateCandidatePool,
  useAddCandidatesToPool,
} from "@/features/candidates/api/use-candidate-pools";

const NEW_POOL_VALUE = "__new__";

interface AddToPoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateIds: string[];
  onSuccess?: () => void;
}

export function AddToPoolDialog({
  open,
  onOpenChange,
  candidateIds,
  onSuccess,
}: AddToPoolDialogProps) {
  const { data: pools } = useCandidatePools();
  const createPool = useCreateCandidatePool();
  const addToPool = useAddCandidatesToPool();

  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const [newPoolName, setNewPoolName] = useState("");
  const isCreatingNew = selectedPoolId === NEW_POOL_VALUE;

  const isSubmitting = createPool.isPending || addToPool.isPending;
  const canSubmit =
    candidateIds.length > 0 &&
    (isCreatingNew ? newPoolName.trim().length > 0 : selectedPoolId.length > 0);

  function reset() {
    setSelectedPoolId("");
    setNewPoolName("");
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    let poolId = selectedPoolId;

    if (isCreatingNew) {
      const pool = await createPool.mutateAsync(newPoolName.trim());
      poolId = pool.id;
    }

    await addToPool.mutateAsync({ poolId, candidateIds });
    reset();
    onOpenChange(false);
    onSuccess?.();
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
          <DialogTitle>
            Add {candidateIds.length} candidate
            {candidateIds.length !== 1 ? "s" : ""} to a pool
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Pool</Label>
            <Select value={selectedPoolId} onValueChange={setSelectedPoolId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a pool" />
              </SelectTrigger>
              <SelectContent>
                {pools?.map((pool) => (
                  <SelectItem key={pool.id} value={pool.id}>
                    {pool.name}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_POOL_VALUE}>
                  <Plus className="size-4" />
                  Create new pool
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCreatingNew && (
            <div className="space-y-2">
              <Label>Pool name</Label>
              <Input
                placeholder="e.g. Frontend engineers"
                value={newPoolName}
                onChange={(e) => setNewPoolName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSubmit) handleSubmit();
                }}
                autoFocus
              />
            </div>
          )}
        </div>
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
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting
              ? "Adding..."
              : isCreatingNew
                ? "Create & add"
                : "Add to pool"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
