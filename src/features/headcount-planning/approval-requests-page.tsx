import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { View } from "@/components/custom/view-toggle";
import {
  useHcScenarios,
  useApproveScenario,
  useRejectScenario,
} from "@/features/headcount-planning/api/use-hc-scenarios";
import { ScenarioList } from "@/features/headcount-planning/components/scenario-list";
import type { HcScenario } from "@/types/database";

const STATUS_ORDER = ["pending", "approved", "rejected"] as const;
const GROUP_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function ApprovalRequestsPage() {
  const { data: scenarios, isLoading, error } = useHcScenarios();
  const approveScenario = useApproveScenario();
  const rejectScenario = useRejectScenario();
  const [view, setView] = useState<View>("table");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-destructive">
          Failed to load approvals: {error.message}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    label: GROUP_LABELS[status],
    items: (scenarios ?? []).filter((s) => s.status === status),
  })).filter((g) => g.items.length > 0);

  const pendingCount =
    scenarios?.filter((s) => s.status === "pending").length ?? 0;
  const totalCount = scenarios?.length ?? 0;

  function renderActions(scenario: HcScenario) {
    if (scenario.status !== "pending") return null;
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => rejectScenario.mutate(scenario.id)}
          disabled={rejectScenario.isPending}
        >
          <X className="size-4" />
          Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            approveScenario.mutate({
              scenarioId: scenario.id,
              addToPlan: false,
            })
          }
          disabled={approveScenario.isPending}
        >
          <Check className="size-4" />
          Approve to roster
        </Button>
        <Button
          size="sm"
          onClick={() =>
            approveScenario.mutate({
              scenarioId: scenario.id,
              addToPlan: true,
            })
          }
          disabled={approveScenario.isPending}
        >
          <Check className="size-4" />
          Approve to plan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold ">Approvals</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pending &middot; {totalCount} total
          </p>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-lg border py-8 text-center text-sm text-muted-foreground">
          No scenarios to review.
        </div>
      ) : (
        grouped.map((group) => (
          <div key={group.status} className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              {group.label} ({group.items.length})
            </h2>
            <ScenarioList
              scenarios={group.items}
              view={view}
              actions={renderActions}
              hideStatus={(s) => s.status === "pending"}
            />
          </div>
        ))
      )}
    </div>
  );
}

export { ApprovalRequestsPage as Component };
