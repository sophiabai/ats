import { useState } from "react";
import { Link } from "react-router";
import { Users, ExternalLink } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ViewToggle, type View } from "@/components/custom/view-toggle";
import { useCandidates } from "@/features/candidates/api/use-candidates";
import type { BreadcrumbState } from "@/app/layout";

function candidateBreadcrumb(name: string): BreadcrumbState {
  return {
    breadcrumb: [{ title: "Candidates", href: "/candidates" }],
    pageTitle: name,
  };
}

function CandidatesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <div className="flex gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 border-b px-4 py-3 last:border-b-0">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CandidatesPage() {
  const { data, isLoading, error } = useCandidates();
  const [view, setView] = useState<View>("table");

  if (isLoading) return <CandidatesSkeleton />;

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-destructive">
          Failed to load candidates: {error.message}
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
        <Users className="size-12" />
        <h2 className="text-xl font-semibold text-foreground">
          No candidates yet
        </h2>
        <p>Candidates will appear here once added.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All candidates</h1>
          <p className="text-sm text-muted-foreground">
            {data.length} candidate{data.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => {
            const fullName = `${c.first_name} ${c.last_name}`;
            return (
              <Card key={c.id}>
                <CardContent>
                  <Link
                    to={`/candidates/${c.id}`}
                    state={candidateBreadcrumb(fullName)}
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
                    {c.location && <div>{c.location}</div>}
                    {c.years_experience != null && (
                      <div>{c.years_experience} yrs experience</div>
                    )}
                    {c.skills && c.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                        {c.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{c.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div>{c.application_count} application{c.application_count !== 1 ? "s" : ""}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Current role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead className="text-right">Applications</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => {
                const fullName = `${c.first_name} ${c.last_name}`;
                return (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      to={`/candidates/${c.id}`}
                      state={candidateBreadcrumb(fullName)}
                      className="flex items-center gap-2 font-medium hover:underline"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
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
                  <TableCell className="text-muted-foreground">
                    {c.location ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.years_experience != null
                      ? `${c.years_experience} yrs`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {c.skills && c.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                        {c.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{c.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {c.application_count}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/candidates/${c.id}`}
                      state={candidateBreadcrumb(fullName)}
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
        </div>
      )}
    </div>
  );
}

export { CandidatesPage as Component };
