import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { Briefcase, MapPin, Building2, Users } from "lucide-react";
import type { BreadcrumbState } from "@/app/layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, EmploymentBadge } from "@/features/requisitions/components/status-badge";
import type { RequisitionRow } from "@/features/requisitions/api/use-requisitions";
import type { View } from "@/components/custom/view-toggle";
import { formatReqTitle } from "@/lib/utils";

function formatSalary(min: number | null, max: number | null, currency: string) {
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

interface RequisitionsTableProps {
  data: RequisitionRow[];
  view?: View;
}

export function RequisitionsTable({ data, view = "table" }: RequisitionsTableProps) {
  const navigate = useNavigate();

  function navigateToReq(req: RequisitionRow) {
    navigate(`/requisitions/${req.id}`, {
      state: {
        breadcrumb: [{ title: "Requisitions", href: "/requisitions" }],
        pageTitle: formatReqTitle(req.req_number, req.title),
      } satisfies BreadcrumbState,
    });
  }

  if (view === "cards") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((req) => {
          const salary = formatSalary(req.salary_min, req.salary_max, req.salary_currency);
          return (
            <Card
              key={req.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => navigateToReq(req)}
            >
              <CardContent>
                <div className="flex items-center gap-2">
                  <Briefcase className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium">{formatReqTitle(req.req_number, req.title)}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={req.status} />
                  <EmploymentBadge type={req.employment_type} />
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {req.department && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 shrink-0" />
                      {req.department}
                    </div>
                  )}
                  {req.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0" />
                      {req.location}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {req.applicant_count} applicants
                    </span>
                    <span>{req.headcount} headcount</span>
                  </div>
                  {salary && <div>{salary}</div>}
                  {req.hiring_manager_name && (
                    <div>HM: {req.hiring_manager_name}</div>
                  )}
                  <div>
                    Opened{" "}
                    {formatDistanceToNow(new Date(req.opened_date), {
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
          <TableHead>Role</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Applicants</TableHead>
          <TableHead className="text-right">Headcount</TableHead>
          <TableHead>Salary range</TableHead>
          <TableHead>Hiring manager</TableHead>
          <TableHead>Opened</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((req) => (
          <TableRow
            key={req.id}
            className="cursor-pointer"
            onClick={() => navigateToReq(req)}
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 shrink-0 text-muted-foreground" />
                {formatReqTitle(req.req_number, req.title)}
              </div>
            </TableCell>
            <TableCell>
              {req.department ? (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="size-3.5 shrink-0" />
                  {req.department}
                </div>
              ) : (
                <span className="text-muted-foreground/50">—</span>
              )}
            </TableCell>
            <TableCell>
              {req.location ? (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" />
                  {req.location}
                </div>
              ) : (
                <span className="text-muted-foreground/50">—</span>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge status={req.status} />
            </TableCell>
            <TableCell>
              <EmploymentBadge type={req.employment_type} />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                <Users className="size-3.5" />
                {req.applicant_count}
              </div>
            </TableCell>
            <TableCell className="text-right">{req.headcount}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatSalary(req.salary_min, req.salary_max, req.salary_currency) ?? (
                <span className="text-muted-foreground/50">—</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {req.hiring_manager_name ?? (
                <span className="text-muted-foreground/50">—</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(new Date(req.opened_date), {
                addSuffix: true,
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
