import { useState } from "react";
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
import { ViewToggle, type View } from "@/components/custom/view-toggle";
import { useHcDepartments } from "@/features/headcount-planning/api/use-hc-departments";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetPage() {
  const { data: departments, isLoading, error } = useHcDepartments();
  const [view, setView] = useState<View>("table");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-72" />
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
          Failed to load budget data: {error.message}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const totalAllocated = departments?.reduce((s, d) => s + d.budget_allocated, 0) ?? 0;
  const totalSpent = departments?.reduce((s, d) => s + d.budget_spent, 0) ?? 0;
  const totalRemaining = totalAllocated - totalSpent;
  const overallUtilization = totalAllocated > 0
    ? Math.round((totalSpent / totalAllocated) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget</h1>
          <p className="text-sm text-muted-foreground">
            Headcount budget allocation and spend tracking for 2026.
          </p>
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total allocated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAllocated)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRemaining)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallUtilization}%</div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}

export { BudgetPage as Component };
