import { useState } from "react";
import { useNavigate } from "react-router";
import { Briefcase, FileText, Plus } from "lucide-react";
import { useRequisitions } from "@/features/requisitions/api/use-requisitions";
import { RequisitionsTable } from "@/features/requisitions/components/requisitions-table";
import { RequisitionsSkeleton } from "@/features/requisitions/components/requisitions-skeleton";
import { CreateRequisitionDialog } from "@/features/requisitions/components/create-requisition-dialog";
import { useIntakes } from "@/features/intakes/api/use-intakes";
import { useCreateIntake } from "@/features/intakes/api/use-create-intake";
import { IntakesTable } from "@/features/intakes/components/intakes-table";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type TabKey = "requisitions" | "intakes";

export function RequisitionsPage() {
  const navigate = useNavigate();
  const {
    data: requisitions,
    isLoading: reqsLoading,
    error: reqsError,
  } = useRequisitions();
  const {
    data: intakes,
    isLoading: intakesLoading,
    error: intakesError,
  } = useIntakes();
  const createIntake = useCreateIntake();

  const [tab, setTab] = useState<TabKey>("requisitions");
  const [createOpen, setCreateOpen] = useState(false);

  function handleNewIntake() {
    createIntake.mutate(
      {},
      {
        onSuccess: (intake) => navigate(`/intakes/${intake.id}`),
      },
    );
  }

  if (reqsLoading) {
    return <RequisitionsSkeleton />;
  }

  if (reqsError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-destructive">
          Failed to load requisitions: {reqsError.message}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const reqs = requisitions ?? [];
  const openCount = reqs.filter((r) => r.status === "open").length;
  const totalApplicants = reqs.reduce((sum, r) => sum + r.applicant_count, 0);
  const intakesCount = intakes?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Requisitions</h1>
          <p className="text-sm text-muted-foreground">
            {reqs.length} total &middot; {openCount} open &middot;{" "}
            {totalApplicants} applicant{totalApplicants !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={createIntake.isPending}
            onClick={handleNewIntake}
          >
            <Plus className="size-4" />
            New intake
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            New job req
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList>
          <TabsTrigger value="requisitions">
            Requisitions
            <span className="ml-1 text-xs text-muted-foreground">
              {reqs.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="intakes">
            Intakes
            <span className="ml-1 text-xs text-muted-foreground">
              {intakesCount}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requisitions" className="mt-4">
          {reqs.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="size-10" />}
              title="No requisitions yet"
              body="Create your first job requisition to get started."
              action={
                <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
                  <Plus className="size-4" />
                  New job req
                </Button>
              }
            />
          ) : (
            <div className="rounded-lg border">
              <RequisitionsTable data={reqs} view="table" />
            </div>
          )}
        </TabsContent>

        <TabsContent value="intakes" className="mt-4">
          {intakesLoading ? (
            <RequisitionsSkeleton />
          ) : intakesError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <p className="text-destructive">
                Failed to load intakes: {intakesError.message}
              </p>
            </div>
          ) : !intakes || intakes.length === 0 ? (
            <EmptyState
              icon={<FileText className="size-10" />}
              title="No intakes yet"
              body="Start an intake to draft a role doc before opening a requisition."
              action={
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={createIntake.isPending}
                  onClick={handleNewIntake}
                >
                  <Plus className="size-4" />
                  New intake
                </Button>
              }
            />
          ) : (
            <div className="rounded-lg border">
              <IntakesTable data={intakes} />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateRequisitionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => navigate(`/requisitions/${id}`)}
      />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
      {icon}
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm">{body}</p>
      </div>
      <div className="mt-2">{action}</div>
    </div>
  );
}

export { RequisitionsPage as Component };
