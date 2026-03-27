import { useState } from "react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { View } from "@/components/custom/view-toggle";
import { useHcScenarios } from "@/features/headcount-planning/api/use-hc-scenarios";
import { useHcPlanSettings } from "@/features/headcount-planning/api/use-hc-plan-settings";
import { ScenarioList } from "@/features/headcount-planning/components/scenario-list";
import type { HcScenario } from "@/types/database";

export function ScenariosPage() {
  const { data: scenarios, isLoading, error } = useHcScenarios();
  const { data: planSettings } = useHcPlanSettings();
  const [view, setView] = useState<View>("table");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-destructive">
          Failed to load scenarios: {error.message}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  function renderBadge(scenario: HcScenario) {
    return scenario.in_plan ? (
      <Link to="/headcount-planning/plan">
        <Badge variant="default" className="cursor-pointer hover:opacity-80">
          {planSettings?.plan_name ?? "In plan"}
        </Badge>
      </Link>
    ) : (
      <Badge variant="secondary" className="text-muted-foreground">
        Not in plan
      </Badge>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold ">Scenarios</h1>
          <p className="text-sm text-muted-foreground">
            Group requests with multiple open headcount positions.
          </p>
        </div>
      </div>

      <ScenarioList
        scenarios={scenarios ?? []}
        view={view}
        emptyMessage="No scenarios yet."
        badge={renderBadge}
      />
    </div>
  );
}

export { ScenariosPage as Component };
