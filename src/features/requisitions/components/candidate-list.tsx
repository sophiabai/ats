import { Link, useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApplicationWithCandidate } from "@/features/requisitions/api/use-requisition-detail";
import type { BreadcrumbState } from "@/app/layout";
import type { View } from "@/components/custom/view-toggle";
import type { EvaluationMap } from "@/features/requisitions/api/use-criteria-evaluations";

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

interface CandidateListProps {
  applications: ApplicationWithCandidate[];
  reqId?: string;
  reqTitle?: string;
  view?: View;
  evaluations?: EvaluationMap;
}

function buildLinkState(
  reqId: string | undefined,
  reqTitle: string | undefined,
  candidateName: string,
): BreadcrumbState | undefined {
  if (!reqId || !reqTitle) return undefined;
  return {
    breadcrumb: [
      { title: "Requisitions", href: "/requisitions" },
      { title: reqTitle, href: `/requisitions/${reqId}` },
    ],
    pageTitle: candidateName,
  };
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: {
    label: "To be scheduled",
    className: "bg-amber-500/15 text-amber-700",
  },
  hired: {
    label: "Hired",
    className: "bg-blue-500/15 text-blue-700",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/15 text-destructive",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-muted text-muted-foreground",
  },
};

function StatusBadgeInline({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: "bg-amber-500/15 text-amber-700",
  };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function CriteriaBadge({
  evaluations,
}: {
  evaluations: { criterion: string; met: boolean }[] | undefined;
}) {
  if (!evaluations || evaluations.length === 0) {
    return <span className="text-muted-foreground/50">—</span>;
  }
  const metCount = evaluations.filter((e) => e.met).length;
  return (
    <Badge
      variant="outline"
      className="bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
    >
      {metCount} met
    </Badge>
  );
}

export function CandidateList({
  applications,
  reqId,
  reqTitle,
  view = "table",
  evaluations,
}: CandidateListProps) {
  const navigate = useNavigate();
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <User className="mb-2 size-8" />
        <p>No candidates in this stage</p>
      </div>
    );
  }

  if (view === "cards") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {applications.map((app) => {
          const c = app.candidates;
          const fullName = `${c.first_name} ${c.last_name}`;
          const state = buildLinkState(reqId, reqTitle, fullName);
          return (
            <Card key={app.id}>
              <CardContent>
                <Link
                  to={`/candidates/${c.id}?app=${app.id}`}
                  state={state}
                  className="group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase">
                      {c.first_name[0]}
                      {c.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium group-hover:underline">
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {c.email}
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <div>
                    {c.current_title && c.current_company
                      ? `${c.current_title} at ${c.current_company}`
                      : c.current_title ?? c.headline ?? "—"}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadgeInline status={app.status} />
                    {app.source && (
                      <Badge variant="secondary">
                        {SOURCE_LABELS[app.source] ?? app.source}
                      </Badge>
                    )}
                  </div>
                  <div>
                    Applied{" "}
                    {formatDistanceToNow(new Date(app.applied_date), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Candidate</TableHead>
          <TableHead>Current title</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criteria</TableHead>
          <TableHead>Applied</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => {
          const c = app.candidates;
          const fullName = `${c.first_name} ${c.last_name}`;
          const state = buildLinkState(reqId, reqTitle, fullName);
          return (
            <TableRow
              key={app.id}
              className="cursor-pointer"
              onClick={() => navigate(`/candidates/${c.id}?app=${app.id}`, { state })}
            >
              <TableCell>
                <div className="font-medium">{c.first_name} {c.last_name}</div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {c.current_title && c.current_company
                  ? `${c.current_title} at ${c.current_company}`
                  : c.current_title ?? c.headline ?? "—"}
              </TableCell>
              <TableCell>
                {app.source ? (
                  <Badge variant="secondary">
                    {SOURCE_LABELS[app.source] ?? app.source}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadgeInline status={app.status} />
              </TableCell>
              <TableCell>
                <CriteriaBadge evaluations={evaluations?.get(c.id)} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(app.applied_date), {
                  addSuffix: true,
                })}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
