import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { User, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

export function CandidateList({
  applications,
  reqId,
  reqTitle,
}: CandidateListProps) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <User className="mb-2 size-8" />
        <p>No candidates in this stage</p>
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
                <Badge
                  variant="outline"
                  className={
                    app.status === "active"
                      ? "bg-emerald-500/15 text-emerald-700"
                      : app.status === "hired"
                        ? "bg-blue-500/15 text-blue-700"
                        : app.status === "rejected"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-amber-500/15 text-amber-700"
                  }
                >
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </Badge>
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
