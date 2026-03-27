import { useState } from "react";
import { useParams } from "react-router";
import { formatDistanceToNow } from "date-fns";
import {
  MapPin,
  Building2,
  Briefcase,
  Users,
  DollarSign,
  CalendarDays,
  UserCheck,
  Star,
  MoreHorizontal,
  Pencil,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/features/requisitions/components/status-badge";
import { CandidateList } from "@/features/requisitions/components/candidate-list";
import { ReqPoolCandidates } from "@/features/requisitions/components/req-pool-candidates";
import { useReqCandidatePools } from "@/features/requisitions/api/use-req-candidate-pools";
import { useCriteriaEvaluations } from "@/features/requisitions/api/use-criteria-evaluations";
import {
  CreateRequisitionDialog,
  type FormState,
} from "@/features/requisitions/components/create-requisition-dialog";
import {
  useRequisitionDetail,
  groupApplicationsByMilestone,
} from "@/features/requisitions/api/use-requisition-detail";
import type { View } from "@/components/custom/view-toggle";
import {
  ResponsiveTabsList,
  type TabItem,
} from "@/components/custom/responsive-tabs-list";
import { useStarredRequisitionsStore } from "@/stores/starred-requisitions-store";
import { useSetPageTitle } from "@/stores/page-title-store";
import type { Milestone } from "@/types/database";

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string,
) {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

const MILESTONE_LABELS: Record<Milestone, string> = {
  application: "Application",
  screen: "Screen",
  final_interview: "Final interview",
  offer: "Offer",
  offer_accepted: "Offer accepted",
};

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function Component() {
  const { reqId } = useParams<{ reqId: string }>();
  const { data: req, isLoading, error } = useRequisitionDetail(reqId!);
  useSetPageTitle(req?.title ?? null);
  const { data: pools } = useReqCandidatePools(reqId!);
  const { data: evaluations } = useCriteriaEvaluations(reqId);
  const poolCandidateCount = pools?.reduce((sum, p) => sum + p.candidates.length, 0) ?? 0;
  const [view] = useState<View>("table");
  const [editOpen, setEditOpen] = useState(false);
  const [linkPoolsOpen, setLinkPoolsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pools");
  const { isStarred, toggle: toggleStar } = useStarredRequisitionsStore();

  if (isLoading) return <DetailSkeleton />;

  if (error || !req) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-destructive">
          {error ? `Failed to load: ${error.message}` : "Requisition not found"}
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const { groups: grouped, rejected } = groupApplicationsByMilestone(req.applications ?? []);
  const salary = formatSalary(req.salary_min, req.salary_max, req.salary_currency);
  const starred = isStarred(req.id);

  const tabItems: TabItem[] = [
    { value: "pools", label: `Candidate pools (${poolCandidateCount})` },
    ...(Object.keys(MILESTONE_LABELS) as Milestone[]).map((m) => ({
      value: m,
      label: `${MILESTONE_LABELS[m]} (${grouped[m].length})`,
    })),
    { value: "rejected", label: `Rejected (${rejected.length})` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold ">{req.title}</h1>
          <StatusBadge status={req.status} />
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => toggleStar({ id: req.id, title: req.title })}
            >
              <Star
                className={cn(
                  "size-4",
                  starred
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground",
                )}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                  <Pencil />
                  Edit requisition
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {req.department && (
          <div className="flex items-center gap-1.5">
            <Building2 className="size-4" />
            {req.department}
          </div>
        )}
        {req.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {req.location}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Briefcase className="size-4" />
          {EMPLOYMENT_LABELS[req.employment_type] ?? req.employment_type}
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="size-4" />
          {req.headcount} headcount
        </div>
        {salary && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="size-4" />
            {salary}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <CalendarDays className="size-4" />
          Opened{" "}
          {formatDistanceToNow(new Date(req.opened_date), {
            addSuffix: true,
          })}
        </div>
        {req.hiring_manager_name && (
          <div className="flex items-center gap-1.5">
            <UserCheck className="size-4" />
            HM: {req.hiring_manager_name}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center gap-2">
          <ResponsiveTabsList
            items={tabItems}
            activeValue={activeTab}
            onValueChange={setActiveTab}
          />
          <div className="flex shrink-0 items-center gap-2">
            {activeTab === "pools" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLinkPoolsOpen(true)}
              >
                <Plus className="mr-1.5 size-4" />
                Link pools
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="pools" className="mt-4">
          <ReqPoolCandidates
            reqId={req.id}
            reqTitle={req.title}
            linkDialogOpen={linkPoolsOpen}
            onLinkDialogOpenChange={setLinkPoolsOpen}
            evaluations={evaluations}
            assessmentCriteria={req.assessment_criteria ?? undefined}
          />
        </TabsContent>

        {(Object.keys(MILESTONE_LABELS) as Milestone[]).map((m) => (
          <TabsContent key={m} value={m} className="mt-4">
            {view === "cards" ? (
              <CandidateList
                applications={grouped[m]}
                reqId={req.id}
                reqTitle={req.title}
                view="cards"
                evaluations={evaluations}
              />
            ) : (
              <div className="rounded-lg border">
                <CandidateList
                  applications={grouped[m]}
                  reqId={req.id}
                  reqTitle={req.title}
                  view="table"
                  evaluations={evaluations}
                />
              </div>
            )}
          </TabsContent>
        ))}

        <TabsContent value="rejected" className="mt-4">
          {view === "cards" ? (
            <CandidateList
              applications={rejected}
              reqId={req.id}
              reqTitle={req.title}
              view="cards"
              evaluations={evaluations}
            />
          ) : (
            <div className="rounded-lg border">
              <CandidateList
                applications={rejected}
                reqId={req.id}
                reqTitle={req.title}
                view="table"
                evaluations={evaluations}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateRequisitionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={{
          title: req.title,
          department: req.department ?? "Any department",
          employment_type: req.employment_type,
          level: req.level ?? "",
          hiring_manager_name: req.hiring_manager_name ?? "",
          recruiter_name: req.recruiter_name ?? "",
          include_coordinator: !!req.coordinator_name,
          coordinator_name: req.coordinator_name ?? "",
          include_sourcer: !!req.sourcer_name,
          sourcer_name: req.sourcer_name ?? "",
          description: req.description ?? "",
          assessment_criteria: req.assessment_criteria ?? [],
          linked_pool_ids: pools?.map((p) => p.id) ?? [],
        } satisfies FormState}
      />
    </div>
  );
}
