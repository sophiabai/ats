import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { Folder, FolderOpen, Unlink, Users, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useReqCandidatePools,
  useUnlinkPoolFromReq,
  type PoolWithCandidates,
} from "@/features/requisitions/api/use-req-candidate-pools";
import { useDeleteCandidate } from "@/features/candidates/api/use-candidate-mutations";
import { LinkPoolsDialog } from "@/features/requisitions/components/link-pools-dialog";
import { CandidateFormDialog } from "@/features/candidates/components/candidate-form-dialog";
import {
  useEvaluateCandidate,
  type EvaluationMap,
} from "@/features/requisitions/api/use-criteria-evaluations";
import type { BreadcrumbState } from "@/app/layout";
import type { Candidate } from "@/types/database";

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
  linkDialogOpen?: boolean;
  onLinkDialogOpenChange?: (open: boolean) => void;
  evaluations?: EvaluationMap;
  assessmentCriteria?: string[];
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

function PoolSection({
  pool,
  reqId,
  reqTitle,
  onUnlink,
  isUnlinking,
  evaluations,
  onEdit,
  onDelete,
}: {
  pool: PoolWithCandidates;
  reqId: string;
  reqTitle: string;
  onUnlink: () => void;
  isUnlinking: boolean;
  evaluations?: EvaluationMap;
  onEdit: (c: Candidate) => void;
  onDelete: (c: Candidate) => void;
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const FolderIcon = expanded ? FolderOpen : Folder;

  return (
    <div className={expanded ? "space-y-3 pb-4" : ""}>
      <button
        type="button"
        className="group flex w-full items-center gap-2 rounded-md px-1 -ml-1 py-2 transition-colors hover:bg-muted"
        onClick={() => setExpanded((v) => !v)}
      >
        <FolderIcon className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{pool.name} ({pool.candidates.length})</h3>
        <span
          role="button"
          tabIndex={-1}
          className="ml-auto flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onUnlink();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onUnlink();
            }
          }}
          aria-disabled={isUnlinking || undefined}
        >
          <Unlink className="size-3" />
          Unlink
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <div className="overflow-hidden">
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
                    <TableHead>Criteria</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pool.candidates.map((c) => {
                    const fullName = `${c.first_name} ${c.last_name}`;
                    return (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/candidates/${c.id}`, { state: buildLinkState(reqId, reqTitle, fullName) })}
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
                        <TableCell>
                          <CriteriaBadge evaluations={evaluations?.get(c.id)} />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEdit(c)}>
                                <Pencil className="mr-2 size-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(c)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReqPoolCandidates({
  reqId,
  reqTitle,
  linkDialogOpen,
  onLinkDialogOpenChange,
  evaluations,
  assessmentCriteria,
}: ReqPoolCandidatesProps) {
  const { data: pools, isLoading } = useReqCandidatePools(reqId);
  const unlinkMutation = useUnlinkPoolFromReq();
  const evaluateMutation = useEvaluateCandidate();
  const deleteCandidateMutation = useDeleteCandidate();
  const [internalOpen, setInternalOpen] = useState(false);
  const dialogOpen = linkDialogOpen ?? internalOpen;
  const setDialogOpen = onLinkDialogOpenChange ?? setInternalOpen;
  const [unlinkingPoolId, setUnlinkingPoolId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null);
  const evaluatingRef = useRef(new Set<string>());

  function openEdit(c: Candidate) {
    setEditingCandidate(c);
    setFormDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deletingCandidate) return;
    await deleteCandidateMutation.mutateAsync(deletingCandidate.id);
    setDeletingCandidate(null);
  }

  const triggerEvaluations = useCallback(async () => {
    if (!pools || !assessmentCriteria?.length || !evaluations) return;

    const allCandidates: Candidate[] = pools.flatMap((p) => p.candidates);
    const unevaluated = allCandidates.filter(
      (c) => !evaluations.has(c.id) && !evaluatingRef.current.has(c.id),
    );

    for (const candidate of unevaluated) {
      evaluatingRef.current.add(candidate.id);
      try {
        await evaluateMutation.mutateAsync({
          reqId,
          candidateId: candidate.id,
          criteria: assessmentCriteria,
          candidate,
        });
      } catch {
        evaluatingRef.current.delete(candidate.id);
      }
    }
  }, [pools, assessmentCriteria, evaluations, reqId, evaluateMutation]);

  useEffect(() => {
    triggerEvaluations();
  }, [triggerEvaluations]);

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

  return (
    <div className="space-y-1">
      {!pools || pools.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border py-16 text-muted-foreground">
          <Users className="size-12" />
          <h2 className="text-lg font-semibold text-foreground">
            No pools linked
          </h2>
          <p className="text-sm">
            Link candidate pools to source candidates for this requisition.
          </p>
        </div>
      ) : (
        <>
          {pools.map((pool) => (
            <PoolSection
              key={pool.id}
              pool={pool}
              reqId={reqId}
              reqTitle={reqTitle}
              onUnlink={() => handleUnlink(pool.id)}
              isUnlinking={unlinkingPoolId === pool.id}
              evaluations={evaluations}
              onEdit={openEdit}
              onDelete={setDeletingCandidate}
            />
          ))}
        </>
      )}

      <LinkPoolsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reqId={reqId}
        alreadyLinkedPoolIds={linkedPoolIds}
      />

      <CandidateFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        candidate={editingCandidate}
      />

      <AlertDialog
        open={!!deletingCandidate}
        onOpenChange={(open) => {
          if (!open) setDeletingCandidate(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete candidate</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deletingCandidate?.first_name} {deletingCandidate?.last_name}
              </span>{" "}
              and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCandidateMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
