import { useState } from "react";
import {
  Building2,
  CircleDollarSign,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { View } from "@/components/custom/view-toggle";
import { useHcDepartments } from "@/features/headcount-planning/api/use-hc-departments";
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

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

export function HeadcountPlanningPage() {
  const { data: departments, isLoading: deptsLoading, error: deptsError } = useHcDepartments();
  const { data: positions, isLoading: posLoading, error: posError } = useHcPositions();
  const { data: planSettings } = useHcPlanSettings();
  const [view, setView] = useState<View>("table");
  const isLocked = planSettings?.plan_status === "locked";

  const isLoading = deptsLoading || posLoading;
  const error = deptsError || posError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-80" />
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
          Failed to load headcount data: {error.message}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const totalCurrent = departments?.reduce((s, d) => s + d.current_headcount, 0) ?? 0;
  const totalPlanned = departments?.reduce((s, d) => s + d.planned_headcount, 0) ?? 0;
  const totalOpen = departments?.reduce((s, d) => s + d.open_positions, 0) ?? 0;
  const totalFilled = departments?.reduce((s, d) => s + d.filled_positions, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold ">
            Headcount planning
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your organization's hiring plan for 2026.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current headcount
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalCurrent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Planned headcount
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalPlanned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open positions
            </CardTitle>
            <UserPlus className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalOpen}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active positions
            </CardTitle>
            <CircleDollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalFilled}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments">
            <Building2 className="size-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="positions">
            <UserPlus className="size-4" />
            Positions
          </TabsTrigger>
          <TabsTrigger value="budget">
            <CircleDollarSign className="size-4" />
            Budget
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="mt-4">
          {view === "cards" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {departments?.map((dept) => (
                <Card key={dept.id}>
                  <CardContent>
                    <div className="font-medium">{dept.name}</div>
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Current</div>
                      <div className="text-right font-medium">{dept.current_headcount}</div>
                      <div className="text-muted-foreground">Planned</div>
                      <div className="text-right font-medium">{dept.planned_headcount}</div>
                      <div className="text-muted-foreground">Open</div>
                      <div className="text-right font-medium">{dept.open_positions}</div>
                      <div className="text-muted-foreground">Filled</div>
                      <div className="text-right font-medium">{dept.filled_positions}</div>
                      <div className="text-muted-foreground">Budget</div>
                      <div className="text-right font-medium">{formatCurrency(dept.budget_allocated)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">Planned</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                    <TableHead className="text-right">Filled</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments?.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell className="text-right">{dept.current_headcount}</TableCell>
                      <TableCell className="text-right">{dept.planned_headcount}</TableCell>
                      <TableCell className="text-right">{dept.open_positions}</TableCell>
                      <TableCell className="text-right">{dept.filled_positions}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(dept.budget_allocated)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="positions" className="mt-4">
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
        </TabsContent>

        <TabsContent value="budget" className="mt-4">
          {view === "cards" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {departments?.map((dept) => {
                const remaining = dept.budget_allocated - dept.budget_spent;
                const utilization = dept.budget_allocated > 0
                  ? Math.round((dept.budget_spent / dept.budget_allocated) * 100)
                  : 0;
                return (
                  <Card key={dept.id}>
                    <CardContent>
                      <div className="font-medium">{dept.name}</div>
                      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="text-muted-foreground">Allocated</div>
                        <div className="text-right font-medium">{formatCurrency(dept.budget_allocated)}</div>
                        <div className="text-muted-foreground">Spent</div>
                        <div className="text-right font-medium">{formatCurrency(dept.budget_spent)}</div>
                        <div className="text-muted-foreground">Remaining</div>
                        <div className="text-right font-medium">{formatCurrency(remaining)}</div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {utilization}%
                        </span>
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
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Allocated</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-right">Utilization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments?.map((dept) => {
                    const remaining = dept.budget_allocated - dept.budget_spent;
                    const utilization = dept.budget_allocated > 0
                      ? Math.round((dept.budget_spent / dept.budget_allocated) * 100)
                      : 0;
                    return (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(dept.budget_allocated)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(dept.budget_spent)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(remaining)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-2 w-16 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${utilization}%` }}
                              />
                            </div>
                            <span className="w-9 text-right text-sm tabular-nums">
                              {utilization}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { HeadcountPlanningPage as Component };
