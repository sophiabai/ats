import { useState } from "react";
import { Link } from "react-router";
import { ExternalLink, FolderOpen, Plus, Unlink, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useReqCandidatePools,
  useUnlinkPoolFromReq,
  type PoolWithCandidates,
} from "@/features/requisitions/api/use-req-candidate-pools";
import { LinkPoolsDialog } from "@/features/requisitions/components/link-pools-dialog";
import type { BreadcrumbState } from "@/app/layout";

function buildLinkState(
  reqId: string,
  reqTitle: string,
  candidateName: string
): BreadcrumbState {
  return {
    breadcrumb: [
      { title: "Requisitions", href: "/requisitions" },
      { title: reqTitle, href: `/requisitions/${reqId}` },
    ],
    pageTitle: candidateName,
  };
}

interface ReqPoolCandidatesProps {
  reqId: string;
  reqTitle: string;
}

function PoolSection({
  pool,
  reqId,
  reqTitle,
  onUnlink,
  isUnlinking,
}: {
  pool: PoolWithCandidates;
  reqId: string;
  reqTitle: string;
  onUnlink: () => void;
  isUnlinking: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{pool.name}</h3>
          <Badge variant="secondary" className="text-xs">
            {pool.candidates.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
          onClick={onUnlink}
          disabled={isUnlinking}
        >
          <Unlink className="size-3" />
          Unlink
        </Button>
      </div>

      {pool.candidates.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No candidates in this pool
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Current role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead className="text-right">Applications</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pool.candidates.map((c) => {
                const fullName = `${c.first_name} ${c.last_name}`;
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link
                        to={`/candidates/${c.id}`}
                        state={buildLinkState(reqId, reqTitle, fullName)}
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
                    <TableCell>
                      {c.skills && c.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.skills.slice(0, 3).map((s) => (
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
                      <Link
                        to={`/candidates/${c.id}`}
                        state={buildLinkState(reqId, reqTitle, fullName)}
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

export function ReqPoolCandidates({ reqId, reqTitle }: ReqPoolCandidatesProps) {
  const { data: pools, isLoading } = useReqCandidatePools(reqId);
  const unlinkMutation = useUnlinkPoolFromReq();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unlinkingPoolId, setUnlinkingPoolId] = useState<string | null>(null);

  async function handleUnlink(poolId: string) {
    setUnlinkingPoolId(poolId);
    await unlinkMutation.mutateAsync({ reqId, poolId });
    setUnlinkingPoolId(null);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const linkedPoolIds = pools?.map((p) => p.id) ?? [];
  const totalCandidates =
    pools?.reduce((sum, p) => sum + p.candidates.length, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pools?.length ?? 0} pool{pools?.length !== 1 ? "s" : ""} linked
          {" · "}
          {totalCandidates} candidate{totalCandidates !== 1 ? "s" : ""} total
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="mr-1.5 size-4" />
          Link pools
        </Button>
      </div>

      {!pools || pools.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border py-16 text-muted-foreground">
          <Users className="size-12" />
          <h2 className="text-lg font-semibold text-foreground">
            No pools linked
          </h2>
          <p className="text-sm">
            Link candidate pools to source candidates for this requisition.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-1.5 size-4" />
            Link pools
          </Button>
        </div>
      ) : (
        pools.map((pool) => (
          <PoolSection
            key={pool.id}
            pool={pool}
            reqId={reqId}
            reqTitle={reqTitle}
            onUnlink={() => handleUnlink(pool.id)}
            isUnlinking={unlinkingPoolId === pool.id}
          />
        ))
      )}

      <LinkPoolsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reqId={reqId}
        alreadyLinkedPoolIds={linkedPoolIds}
      />
    </div>
  );
}
