import { useState } from "react";
import { useNavigate } from "react-router";
import { Briefcase, Plus } from "lucide-react";
import { useRequisitions } from "@/features/requisitions/api/use-requisitions";
import { RequisitionsTable } from "@/features/requisitions/components/requisitions-table";
import { RequisitionsSkeleton } from "@/features/requisitions/components/requisitions-skeleton";
import { CreateRequisitionDialog } from "@/features/requisitions/components/create-requisition-dialog";
import { Button } from "@/components/ui/button";
import type { View } from "@/components/custom/view-toggle";

export function RequisitionsPage() {
  const { data, isLoading, error } = useRequisitions();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("table");
  const [createOpen, setCreateOpen] = useState(false);

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
      <>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
          <Briefcase className="size-12" />
          <h2 className="text-xl font-semibold text-foreground">
            No requisitions yet
          </h2>
          <p>Create your first job requisition to get started.</p>
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create job requisition
          </Button>
        </div>
        <CreateRequisitionDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(id) => navigate(`/requisitions/${id}`)}
        />
      </>
    );
  }

  const openCount = data.filter((r) => r.status === "open").length;
  const totalApplicants = data.reduce((sum, r) => sum + r.applicant_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold ">Requisitions</h1>
          <p className="text-sm text-muted-foreground">
            {data.length} total &middot; {openCount} open &middot;{" "}
            {totalApplicants} applicant{totalApplicants !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            Create job requisition
          </Button>
        </div>
      </div>

      <CreateRequisitionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => navigate(`/requisitions/${id}`)}
      />

      {view === "cards" ? (
        <RequisitionsTable data={data} view="cards" />
      ) : (
        <div className="rounded-lg border">
          <RequisitionsTable data={data} view="table" />
        </div>
      )}
    </div>
  );
}

export { RequisitionsPage as Component };
