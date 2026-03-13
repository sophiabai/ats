import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useHcScenarios } from "@/features/headcount-planning/api/use-hc-scenarios";
import type { HcScenario } from "@/types/database";

interface AddScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScenariosAdded: () => void;
}

export function AddScenarioDialog({
  open,
  onOpenChange,
  onScenariosAdded,
}: AddScenarioDialogProps) {
  const { data: scenarios } = useHcScenarios();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState("");

  const pendingScenarios =
    scenarios?.filter((s) => s.status === "pending") ?? [];

  const filteredScenarios = pendingScenarios.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.requested_by?.toLowerCase().includes(q)
    );
  });

  function toggleScenario(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    setSelected(new Set());
    onOpenChange(false);
    onScenariosAdded();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add scenarios</DialogTitle>
        </DialogHeader>

        {pendingScenarios.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No pending scenarios available.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search scenarios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-72 space-y-3 overflow-y-auto">
            {filteredScenarios.map((scenario: HcScenario) => (
              <label
                key={scenario.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  checked={selected.has(scenario.id)}
                  onCheckedChange={() => toggleScenario(scenario.id)}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{scenario.name}</p>
                  {scenario.description && (
                    <p className="text-sm text-muted-foreground">
                      {scenario.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {scenario.scenario_positions?.length ?? 0} positions
                    {scenario.requested_by && ` · Requested by ${scenario.requested_by}`}
                  </p>
                </div>
              </label>
            ))}
            {filteredScenarios.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No scenarios match your search.
              </p>
            )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selected.size === 0}
          >
            Add {selected.size > 0 ? `${selected.size} scenario${selected.size > 1 ? "s" : ""}` : "scenarios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
