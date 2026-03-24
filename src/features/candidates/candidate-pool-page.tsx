import { useState } from "react";
import { Link, useParams } from "react-router";
import { Users, ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import {
  useCandidatePools,
  usePoolCandidates,
  useRemoveCandidateFromPool,
} from "@/features/candidates/api/use-candidate-pools";
import type { BreadcrumbState } from "@/app/layout";

function candidateBreadcrumb(
  poolName: string,
  poolId: string,
  candidateName: string
): BreadcrumbState {
  return {
    breadcrumb: [
      { title: "Candidates", href: "/candidates" },
      { title: poolName, href: `/candidates/pools/${poolId}` },
    ],
    pageTitle: candidateName,
  };
}

function PoolSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
      <div className="rounded-lg border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 border-b px-4 py-3 last:border-b-0"
          >
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CandidatePoolPage() {
  const { poolId } = useParams<{ poolId: string }>();
  const { data: pools, isLoading: poolsLoading } = useCandidatePools();
  const { data: candidates, isLoading: candidatesLoading } = usePoolCandidates(
    poolId!
  );
  const removeMutation = useRemoveCandidateFromPool();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const pool = pools?.find((p) => p.id === poolId);
  const isLoading = poolsLoading || candidatesLoading;

  if (isLoading) return <PoolSkeleton />;

  if (!pool) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <Users className="size-12" />
        <h2 className="text-xl font-semibold text-foreground">
          Pool not found
        </h2>
        <Link to="/candidates">
          <Button variant="outline">Back to all candidates</Button>
        </Link>
      </div>
    );
  }

  async function handleRemove(candidateId: string) {
    setRemovingId(candidateId);
    await removeMutation.mutateAsync({ poolId: poolId!, candidateId });
    setRemovingId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{pool.name}</h1>
        <p className="text-sm text-muted-foreground">
          {candidates?.length ?? 0} candidate
          {candidates?.length !== 1 ? "s" : ""} in this pool
        </p>
      </div>

      {!candidates || candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border py-16 text-muted-foreground">
          <Users className="size-12" />
          <h2 className="text-xl font-semibold text-foreground">
            No candidates in this pool
          </h2>
          <p>
            Go to{" "}
            <Link to="/candidates" className="underline">
              all candidates
            </Link>{" "}
            to add candidates to this pool.
          </p>
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
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((c: any) => {
                const fullName = `${c.first_name} ${c.last_name}`;
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link
                        to={`/candidates/${c.id}`}
                        state={candidateBreadcrumb(
                          pool.name,
                          pool.id,
                          fullName
                        )}
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
                          {c.skills.slice(0, 3).map((s: string) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="text-xs"
                            >
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
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/candidates/${c.id}`}
                          state={candidateBreadcrumb(
                            pool.name,
                            pool.id,
                            fullName
                          )}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          disabled={removingId === c.id}
                          onClick={() => handleRemove(c.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
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

export { CandidatePoolPage as Component };
