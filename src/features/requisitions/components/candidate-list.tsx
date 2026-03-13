import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { User, ExternalLink } from "lucide-react";
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

function StatusBadgeInline({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={
        status === "active"
          ? "bg-emerald-500/15 text-emerald-700"
          : status === "hired"
            ? "bg-blue-500/15 text-blue-700"
            : status === "rejected"
              ? "bg-destructive/15 text-destructive"
              : "bg-amber-500/15 text-amber-700"
      }
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function CandidateList({
  applications,
  reqId,
  reqTitle,
  view = "table",
}: CandidateListProps) {
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
          <TableHead>Applied</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => {
          const c = app.candidates;
          const fullName = `${c.first_name} ${c.last_name}`;
          const state = buildLinkState(reqId, reqTitle, fullName);
          return (
            <TableRow key={app.id}>
              <TableCell>
                <Link
                  to={`/candidates/${c.id}?app=${app.id}`}
                  state={state}
                  className="group flex items-center gap-2 font-medium hover:underline"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
                    {c.first_name[0]}
                    {c.last_name[0]}
                  </div>
                  <div>
                    <div>
                      {c.first_name} {c.last_name}
                    </div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {c.email}
                    </div>
                  </div>
                </Link>
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
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(app.applied_date), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <Link
                  to={`/candidates/${c.id}?app=${app.id}`}
                  state={state}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="size-4" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
