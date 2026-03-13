import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { HcScenario, HcScenarioStatus } from "@/types/database";
import type { View } from "@/components/custom/view-toggle";

const statusConfig: Record<
  HcScenarioStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

function formatSalaryRange(min: number | null, max: number | null) {
  if (!min && !max) return "—";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

interface ScenarioListProps {
  scenarios: HcScenario[];
  view: View;
  emptyMessage?: string;
  badge?: (scenario: HcScenario) => React.ReactNode;
  actions?: (scenario: HcScenario) => React.ReactNode;
  hideStatus?: (scenario: HcScenario) => boolean;
}

export function ScenarioList({
  scenarios,
  view,
  emptyMessage = "No scenarios yet.",
  badge,
  actions,
  hideStatus,
}: ScenarioListProps) {
  if (scenarios.length === 0) {
    return (
      <div className="rounded-lg border py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scenarios.map((scenario) => {
        const cfg = statusConfig[scenario.status] ?? statusConfig.pending;
        const posCount = scenario.scenario_positions?.length ?? 0;

        return (
          <div
            key={scenario.id}
            className={cn(
              "rounded-lg border p-4",
              scenario.status !== "pending" && "bg-muted",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{scenario.name}</h3>
                  {badge?.(scenario)}
                </div>
                {scenario.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {scenario.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {posCount} position{posCount !== 1 ? "s" : ""}
                  {scenario.requested_by &&
                    ` · Requested by ${scenario.requested_by}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!(hideStatus?.(scenario)) && (
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                )}
                {actions?.(scenario)}
              </div>
            </div>

            {posCount > 0 &&
              (view === "cards" ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {scenario.scenario_positions?.map((sp) => (
                    <div key={sp.id} className="rounded-md border p-3">
                      <div className="font-medium">{sp.title}</div>
                      <div className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                        <div>
                          {sp.department} · {sp.level}
                        </div>
                        <div>{sp.location ?? "—"}</div>
                        <div>
                          {formatSalaryRange(sp.salary_min, sp.salary_max)}
                        </div>
                        <div className="capitalize">
                          Priority: {sp.priority}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Comp range</TableHead>
                        <TableHead>Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scenario.scenario_positions?.map((sp) => (
                        <TableRow key={sp.id}>
                          <TableCell className="font-medium">
                            {sp.title}
                          </TableCell>
                          <TableCell>{sp.department}</TableCell>
                          <TableCell>{sp.level}</TableCell>
                          <TableCell>{sp.location ?? "—"}</TableCell>
                          <TableCell>
                            {formatSalaryRange(sp.salary_min, sp.salary_max)}
                          </TableCell>
                          <TableCell className="capitalize">
                            {sp.priority}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
}
