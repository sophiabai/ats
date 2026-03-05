import { Briefcase } from "lucide-react";
import { useRequisitions } from "@/features/requisitions/api/use-requisitions";
import { RequisitionsTable } from "@/features/requisitions/components/requisitions-table";
import { RequisitionsSkeleton } from "@/features/requisitions/components/requisitions-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RequisitionsPage() {
  const { data, isLoading, error } = useRequisitions();

  if (isLoading) {
    return <RequisitionsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-destructive">
          Failed to load requisitions: {error.message}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <Briefcase className="size-12" />
        <h2 className="text-xl font-semibold text-foreground">
          No requisitions yet
        </h2>
        <p>Create your first job requisition to get started.</p>
      </div>
    );
  }

  const openCount = data.filter((r) => r.status === "open").length;
  const totalApplicants = data.reduce((sum, r) => sum + r.applicant_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Requisitions</h1>
          <p className="text-sm text-muted-foreground">
            {data.length} total &middot; {openCount} open &middot;{" "}
            {totalApplicants} applicant{totalApplicants !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total requisitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total applicants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplicants}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border">
        <RequisitionsTable data={data} />
      </div>
    </div>
  );
}

export { RequisitionsPage as Component };
