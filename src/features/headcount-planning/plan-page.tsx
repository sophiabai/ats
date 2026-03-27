import * as React from "react";
import { Link } from "react-router";
import {
  Archive,
  Building2,
  Check,
  CircleDollarSign,
  ListChecks,
  Lock,
  Pencil,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  useHcScenarios,
  useApproveScenario,
  useRejectScenario,
} from "@/features/headcount-planning/api/use-hc-scenarios";
import { useHcPlanSettings } from "@/features/headcount-planning/api/use-hc-plan-settings";
import { AddPositionDialog } from "@/features/headcount-planning/components/add-position-dialog";
import { AddScenarioDialog } from "@/features/headcount-planning/components/add-scenario-dialog";
import { EditPlanDialog } from "@/features/headcount-planning/components/edit-plan-dialog";
import { LockPlanDialog } from "@/features/headcount-planning/components/lock-plan-dialog";
import { ScenarioList } from "@/features/headcount-planning/components/scenario-list";
import type { HcPlanStatus, HcPositionType, HcScenario } from "@/types/database";

const planStatusConfig: Record<
  HcPlanStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Draft", variant: "outline" },
  open: { label: "Open", variant: "secondary" },
  locked: { label: "Locked", variant: "default" },
};

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

export function PlanPage() {
  const {
    data: departments,
    isLoading: deptsLoading,
    error: deptsError,
  } = useHcDepartments();
  const {
    data: positions,
    isLoading: posLoading,
    error: posError,
  } = useHcPositions({ inPlan: true });
  const { data: scenarios } = useHcScenarios();
  const { data: planSettings } = useHcPlanSettings();

  const approveScenario = useApproveScenario();
  const rejectScenario = useRejectScenario();

  const [addPositionOpen, setAddPositionOpen] = React.useState(false);
  const [addScenarioOpen, setAddScenarioOpen] = React.useState(false);
  const [lockPlanOpen, setLockPlanOpen] = React.useState(false);
  const [editPlanOpen, setEditPlanOpen] = React.useState(false);
  const [view] = React.useState<View>("table");

  const isLoading = deptsLoading || posLoading;
  const error = deptsError || posError;
  const planStatus = planSettings?.plan_status ?? "open";
  const isLocked = planStatus === "locked";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="mt-2 h-4 w-64" />
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
          Failed to load plan data: {error.message}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const totalCurrent =
    departments?.reduce((s, d) => s + d.current_headcount, 0) ?? 0;
  const totalPlanned =
    departments?.reduce((s, d) => s + d.planned_headcount, 0) ?? 0;
  const totalOpen =
    departments?.reduce((s, d) => s + d.open_positions, 0) ?? 0;
  const totalFilled =
    departments?.reduce((s, d) => s + d.filled_positions, 0) ?? 0;

  function renderScenarioActions(scenario: HcScenario) {
    if (scenario.status !== "pending" || isLocked) return null;
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold ">
              {planSettings?.plan_name ?? "Plan"}
            </h1>
            {(() => {
              const cfg = planStatusConfig[planStatus];
              return (
                <Badge variant={cfg.variant} className="gap-1">
                  {isLocked && <Lock className="size-3" />}
                  {cfg.label}
                </Badge>
              );
            })()}
            {planSettings?.archived && (
              <Badge variant="outline">Archived</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/headcount-planning/past-plans">
              <Archive className="size-4" />
              Past plans
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditPlanOpen(true)}
          >
            <Pencil className="size-4" />
            Edit plan
          </Button>
          {!isLocked && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setLockPlanOpen(true)}
            >
              <Lock className="size-4" />
              Lock plan
            </Button>
          )}
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
              Positions filled
            </CardTitle>
            <CircleDollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalFilled}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scenarios">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="scenarios">
              <ListChecks className="size-4" />
              Scenarios
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building2 className="size-4" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="positions">
              <UserPlus className="size-4" />
              Positions
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            {!isLocked && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="size-4" />
                    Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setAddPositionOpen(true)}>
                    <UserPlus className="size-4" />
                    Position
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAddScenarioOpen(true)}>
                    <ListChecks className="size-4" />
                    Scenario
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments?.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell className="text-right">
                        {dept.current_headcount}
                      </TableCell>
                      <TableCell className="text-right">
                        {dept.planned_headcount}
                      </TableCell>
                      <TableCell className="text-right">
                        {dept.open_positions}
                      </TableCell>
                      <TableCell className="text-right">
                        {dept.filled_positions}
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
                const cfg =
                  positionTypeConfig[pos.position_type] ??
                  positionTypeConfig.open;
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
              {positions?.length === 0 && (
                <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                  No positions in the plan yet. Add positions or approve scenarios.
                </div>
              )}
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
                    const cfg =
                      positionTypeConfig[pos.position_type] ??
                      positionTypeConfig.open;
                    return (
                      <TableRow key={pos.id}>
                        <TableCell className="font-medium">
                          {pos.position_id}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </TableCell>
                        <TableCell>{pos.title}</TableCell>
                        <TableCell>{pos.department}</TableCell>
                        <TableCell>{pos.level}</TableCell>
                        <TableCell>{pos.location ?? "—"}</TableCell>
                        <TableCell>
                          {formatSalaryRange(pos.salary_min, pos.salary_max)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {pos.priority}
                        </TableCell>
                        <TableCell>{pos.hiring_manager}</TableCell>
                        <TableCell>
                          {formatTargetDate(pos.target_date)}
                        </TableCell>
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
                  {positions?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={isLocked ? 11 : 10}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No positions in the plan yet. Add positions or approve
                        scenarios.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="scenarios" className="mt-4">
          <ScenarioList
            scenarios={scenarios ?? []}
            view={view}
            emptyMessage="No scenarios yet. Add a scenario to model different headcount plans."
            actions={renderScenarioActions}
          />
        </TabsContent>
      </Tabs>

      <AddPositionDialog
        open={addPositionOpen}
        onOpenChange={setAddPositionOpen}
      />
      <AddScenarioDialog
        open={addScenarioOpen}
        onOpenChange={setAddScenarioOpen}
        onScenariosAdded={() => {}}
      />
      <LockPlanDialog open={lockPlanOpen} onOpenChange={setLockPlanOpen} />
      {planSettings && (
        <EditPlanDialog
          open={editPlanOpen}
          onOpenChange={setEditPlanOpen}
          settings={planSettings}
        />
      )}
    </div>
  );
}

export { PlanPage as Component };
