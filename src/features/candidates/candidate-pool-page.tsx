import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { Users, Trash2 } from "lucide-react";
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
import { useSetPageTitle } from "@/stores/page-title-store";

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
  const navigate = useNavigate();
  const { data: pools, isLoading: poolsLoading } = useCandidatePools();
  const { data: candidates, isLoading: candidatesLoading } = usePoolCandidates(
    poolId!
  );
  const removeMutation = useRemoveCandidateFromPool();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const pool = pools?.find((p) => p.id === poolId);
  useSetPageTitle(pool?.name ?? null);
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
        <h1 className="text-2xl font-semibold ">{pool.name}</h1>
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
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((c: any) => {
                const fullName = `${c.first_name} ${c.last_name}`;
                return (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/candidates/${c.id}`, { state: candidateBreadcrumb(pool.name, pool.id, fullName) })}
                  >
                    <TableCell>
                      <div className="font-medium">{c.first_name} {c.last_name}</div>
                      {c.last_activity_action && (
                        <div className="text-xs text-muted-foreground">
                          {c.last_activity_action}
                          {c.last_activity_at && ` · ${formatDistanceToNow(new Date(c.last_activity_at), { addSuffix: true })}`}
                        </div>
                      )}
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        disabled={removingId === c.id}
                        onClick={() => handleRemove(c.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
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
