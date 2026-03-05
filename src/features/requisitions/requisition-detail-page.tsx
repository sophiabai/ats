import { useParams } from "react-router";
import { formatDistanceToNow } from "date-fns";
import {
  MapPin,
  Building2,
  Users,
  DollarSign,
  CalendarDays,
  UserCheck,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  StatusBadge,
  EmploymentBadge,
} from "@/features/requisitions/components/status-badge";
import { CandidateList } from "@/features/requisitions/components/candidate-list";
import {
  useRequisitionDetail,
  groupApplicationsByMilestone,
} from "@/features/requisitions/api/use-requisition-detail";
import type { Milestone } from "@/types/database";

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

  const grouped = groupApplicationsByMilestone(req.applications ?? []);
  const salary = formatSalary(req.salary_min, req.salary_max, req.salary_currency);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{req.title}</h1>
          <StatusBadge status={req.status} />
          <EmploymentBadge type={req.employment_type} />
        </div>
        {req.description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {req.description}
          </p>
        )}
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

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All ({req.applications?.length ?? 0})
          </TabsTrigger>
          {(Object.keys(MILESTONE_LABELS) as Milestone[]).map((m) => (
            <TabsTrigger key={m} value={m}>
              {MILESTONE_LABELS[m]} ({grouped[m].length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="rounded-lg border">
            <CandidateList
              applications={req.applications ?? []}
              reqId={req.id}
              reqTitle={req.title}
            />
          </div>
        </TabsContent>

        {(Object.keys(MILESTONE_LABELS) as Milestone[]).map((m) => (
          <TabsContent key={m} value={m} className="mt-4">
            <div className="rounded-lg border">
              <CandidateList
                applications={grouped[m]}
                reqId={req.id}
                reqTitle={req.title}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
