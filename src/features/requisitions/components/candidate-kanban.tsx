import { useMemo } from "react";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type {
  ApplicationWithCandidate,
} from "@/features/requisitions/api/use-requisition-detail";
import type { PoolWithCandidates } from "@/features/requisitions/api/use-req-candidate-pools";
import type { EvaluationMap } from "@/features/requisitions/api/use-criteria-evaluations";
import type { BreadcrumbState } from "@/app/layout";
import type { Milestone, Candidate } from "@/types/database";
import { cn } from "@/lib/utils";

const MILESTONE_COLUMNS: { key: Milestone; label: string }[] = [
  { key: "application", label: "Application" },
  { key: "screen", label: "Screen" },
  { key: "final_interview", label: "Final interview" },
  { key: "offer", label: "Offer" },
  { key: "offer_accepted", label: "Offer accepted" },
];

const SOURCE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  referral: "Referral",
  careers_page: "Careers page",
  indeed: "Indeed",
  glassdoor: "Glassdoor",
  agency: "Agency",
  university: "University",
  internal: "Internal",
  other: "Other",
};

interface CandidateKanbanProps {
  applications: ApplicationWithCandidate[];
  pools?: PoolWithCandidates[];
  reqId: string;
  reqTitle: string;
  evaluations?: EvaluationMap;
}

function buildLinkState(
  reqId: string,
  reqTitle: string,
  candidateName: string,
): BreadcrumbState {
  return {
    breadcrumb: [
      { title: "Requisitions", href: "/requisitions" },
      { title: reqTitle, href: `/requisitions/${reqId}` },
    ],
    pageTitle: candidateName,
  };
}

function CriteriaSummary({
  evaluations,
}: {
  evaluations: { criterion: string; met: boolean }[] | undefined;
}) {
  if (!evaluations || evaluations.length === 0) return null;
  const metCount = evaluations.filter((e) => e.met).length;
  return (
    <Badge
      variant="outline"
      className="bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
    >
      {metCount}/{evaluations.length} met
    </Badge>
  );
}

function ColumnShell({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-[280px] shrink-0 flex-col gap-2 rounded-xl bg-muted p-2">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
          {count}
        </Badge>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-card/30 px-3 py-6 text-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}

function PoolCandidateCard({
  candidate,
  reqId,
  reqTitle,
  evaluations,
}: {
  candidate: Candidate;
  reqId: string;
  reqTitle: string;
  evaluations?: EvaluationMap;
}) {
  const fullName = `${candidate.first_name} ${candidate.last_name}`;
  const role =
    candidate.current_title && candidate.current_company
      ? `${candidate.current_title} at ${candidate.current_company}`
      : candidate.current_title ?? candidate.headline ?? null;

  return (
    <Link
      to={`/candidates/${candidate.id}`}
      state={buildLinkState(reqId, reqTitle, fullName)}
      className="flex flex-col gap-2 rounded-lg bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col">
        <span className="truncate text-sm font-medium">{fullName}</span>
        {role && (
          <span className="truncate text-sm text-foreground">{role}</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <CriteriaSummary evaluations={evaluations?.get(candidate.id)} />
        {candidate.location && (
          <span className="ml-auto truncate text-xs text-muted-foreground">
            {candidate.location}
          </span>
        )}
      </div>
    </Link>
  );
}

function ApplicationCard({
  app,
  reqId,
  reqTitle,
  evaluations,
  showRejectionBadge,
}: {
  app: ApplicationWithCandidate;
  reqId: string;
  reqTitle: string;
  evaluations?: EvaluationMap;
  showRejectionBadge?: boolean;
}) {
  const c = app.candidates;
  const fullName = `${c.first_name} ${c.last_name}`;
  const role =
    c.current_title && c.current_company
      ? `${c.current_title} at ${c.current_company}`
      : c.current_title ?? c.headline ?? null;

  return (
    <Link
      to={`/candidates/${c.id}?app=${app.id}`}
      state={buildLinkState(reqId, reqTitle, fullName)}
      className="flex flex-col gap-2 rounded-lg bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col">
        <span className="truncate text-sm font-medium">{fullName}</span>
        {role && (
          <span className="truncate text-sm text-foreground">{role}</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {showRejectionBadge && (
          <Badge
            variant="outline"
            className={cn(
              app.status === "withdrawn"
                ? "bg-muted text-muted-foreground"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {app.status === "withdrawn" ? "Withdrawn" : "Rejected"}
          </Badge>
        )}
        {app.source && (
          <Badge variant="secondary" className="text-[11px]">
            {SOURCE_LABELS[app.source] ?? app.source}
          </Badge>
        )}
        <CriteriaSummary evaluations={evaluations?.get(c.id)} />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">
          {formatDistanceToNow(new Date(app.applied_date), {
            addSuffix: true,
          })}
        </span>
      </div>
    </Link>
  );
}

export function CandidateKanban({
  applications,
  pools,
  reqId,
  reqTitle,
  evaluations,
}: CandidateKanbanProps) {
  const { milestoneGroups, rejected } = useMemo(() => {
    const groups: Record<Milestone, ApplicationWithCandidate[]> = {
      application: [],
      screen: [],
      final_interview: [],
      offer: [],
      offer_accepted: [],
    };
    const rejectedList: ApplicationWithCandidate[] = [];
    for (const app of applications) {
      if (app.status === "rejected" || app.status === "withdrawn") {
        rejectedList.push(app);
      } else {
        groups[app.current_milestone].push(app);
      }
    }
    return { milestoneGroups: groups, rejected: rejectedList };
  }, [applications]);

  const poolCandidates = useMemo(() => {
    if (!pools) return [] as Candidate[];
    const seen = new Set<string>();
    const list: Candidate[] = [];
    for (const pool of pools) {
      for (const c of pool.candidates) {
        if (seen.has(c.id)) continue;
        seen.add(c.id);
        list.push(c);
      }
    }
    return list;
  }, [pools]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <ColumnShell title="Candidate pool" count={poolCandidates.length}>
        {poolCandidates.length === 0 ? (
          <EmptyState label="No sourced candidates" />
        ) : (
          poolCandidates.map((c) => (
            <PoolCandidateCard
              key={c.id}
              candidate={c}
              reqId={reqId}
              reqTitle={reqTitle}
              evaluations={evaluations}
            />
          ))
        )}
      </ColumnShell>

      {MILESTONE_COLUMNS.map(({ key, label }) => {
        const items = milestoneGroups[key];
        return (
          <ColumnShell key={key} title={label} count={items.length}>
            {items.length === 0 ? (
              <EmptyState label="No candidates" />
            ) : (
              items.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  reqId={reqId}
                  reqTitle={reqTitle}
                  evaluations={evaluations}
                />
              ))
            )}
          </ColumnShell>
        );
      })}

      <ColumnShell title="Rejected" count={rejected.length}>
        {rejected.length === 0 ? (
          <EmptyState label="No rejected candidates" />
        ) : (
          rejected.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              reqId={reqId}
              reqTitle={reqTitle}
              evaluations={evaluations}
              showRejectionBadge
            />
          ))
        )}
      </ColumnShell>
    </div>
  );
}
