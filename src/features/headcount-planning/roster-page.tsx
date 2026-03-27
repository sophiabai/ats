import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { View } from "@/components/custom/view-toggle";
import { useHcPositions } from "@/features/headcount-planning/api/use-hc-positions";
import { useHcPlanSettings } from "@/features/headcount-planning/api/use-hc-plan-settings";
import type { HcPositionType } from "@/types/database";

const positionTypeConfig: Record<
  HcPositionType,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  open: { label: "Open", variant: "outline" },
  in_progress: { label: "In progress", variant: "secondary" },
  filled: { label: "Filled", variant: "default" },
  closed: { label: "Closed", variant: "default" },
};

function formatTargetDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

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

export function RosterPage() {
  const { data: positions, isLoading, error } = useHcPositions();
  const { data: planSettings } = useHcPlanSettings();
  const [view, setView] = useState<View>("table");
  const isLocked = planSettings?.plan_status === "locked";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-destructive">
          Failed to load roster: {error.message}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const totalCount = positions?.length ?? 0;
  const openCount = positions?.filter((p) => p.position_type === "open").length ?? 0;
  const inProgressCount = positions?.filter((p) => p.position_type === "in_progress").length ?? 0;
  const filledCount = positions?.filter((p) => p.position_type === "filled").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold ">Roster</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} positions across all departments
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{openCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Filled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{filledCount}</div>
          </CardContent>
        </Card>
      </div>

      {view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {positions?.map((pos) => {
            const cfg = positionTypeConfig[pos.position_type] ?? positionTypeConfig.open;
            return (
              <Card key={pos.id}>
                <CardContent>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground">{pos.position_id}</div>
                      <div className="font-medium">{pos.title}</div>
                    </div>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    <div>{pos.department} · {pos.level}</div>
                    <div>{pos.location ?? "—"}</div>
                    <div>{formatSalaryRange(pos.salary_min, pos.salary_max)}</div>
                    <div className="capitalize">Priority: {pos.priority}</div>
                    <div>HM: {pos.hiring_manager}</div>
                    <div>Target: {formatTargetDate(pos.target_date)}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position ID</TableHead>
                <TableHead>Position type</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Comp range</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Hiring manager</TableHead>
                <TableHead>Target date</TableHead>
                {isLocked && <TableHead>In plan</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions?.map((pos) => {
                const cfg = positionTypeConfig[pos.position_type] ?? positionTypeConfig.open;
                return (
                  <TableRow key={pos.id}>
                    <TableCell className="font-medium">{pos.position_id}</TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell>{pos.title}</TableCell>
                    <TableCell>{pos.department}</TableCell>
                    <TableCell>{pos.level}</TableCell>
                    <TableCell>{pos.location ?? "—"}</TableCell>
                    <TableCell>{formatSalaryRange(pos.salary_min, pos.salary_max)}</TableCell>
                    <TableCell className="capitalize">{pos.priority}</TableCell>
                    <TableCell>{pos.hiring_manager}</TableCell>
                    <TableCell>{formatTargetDate(pos.target_date)}</TableCell>
                    {isLocked && (
                      <TableCell>
                        <Badge variant={pos.in_plan ? "default" : "outline"}>
                          {pos.in_plan ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export { RosterPage as Component };
