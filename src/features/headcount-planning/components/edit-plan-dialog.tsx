import * as React from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUpdatePlanSettings } from "@/features/headcount-planning/api/use-hc-plan-settings";
import type { HcPlanSettings } from "@/types/database";

interface EditPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: HcPlanSettings;
}

export function EditPlanDialog({
  open,
  onOpenChange,
  settings,
}: EditPlanDialogProps) {
  const updateSettings = useUpdatePlanSettings();
  const [planName, setPlanName] = React.useState(settings.plan_name);
  const [collaborators, setCollaborators] = React.useState<string[]>(
    settings.collaborators ?? [],
  );
  const [newCollaborator, setNewCollaborator] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setPlanName(settings.plan_name);
      setCollaborators(settings.collaborators ?? []);
      setNewCollaborator("");
    }
  }, [open, settings]);

  function addCollaborator() {
    const trimmed = newCollaborator.trim();
    if (trimmed && !collaborators.includes(trimmed)) {
      setCollaborators((prev) => [...prev, trimmed]);
      setNewCollaborator("");
    }
  }

  function removeCollaborator(name: string) {
    setCollaborators((prev) => prev.filter((c) => c !== name));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCollaborator();
    }
  }

  async function handleSave() {
    await updateSettings.mutateAsync({
      plan_name: planName,
      collaborators,
    });
    onOpenChange(false);
  }

  async function handleArchive() {
    await updateSettings.mutateAsync({ archived: true });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit plan</DialogTitle>
          <DialogDescription>
            Update the plan name, manage collaborators, or archive.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="plan-name">Plan name</Label>
            <Input
              id="plan-name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Collaborators</Label>
            {collaborators.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {collaborators.map((name) => (
                  <Badge
                    key={name}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => removeCollaborator(name)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Add collaborator name"
                value={newCollaborator}
                onChange={(e) => setNewCollaborator(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCollaborator}
                disabled={!newCollaborator.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Archive plan</p>
              <p className="text-sm text-muted-foreground">
                This will hide the plan from active views.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleArchive}
              disabled={updateSettings.isPending}
            >
              Archive
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateSettings.isPending || !planName.trim()}
          >
            {updateSettings.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
