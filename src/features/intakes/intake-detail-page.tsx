import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { Briefcase, Check, Loader2, Plus } from "lucide-react";
import type { BreadcrumbState } from "@/app/layout";
import { RichTextEditor } from "@/components/custom/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreateRequisitionDialog,
  type FormState,
} from "@/features/requisitions/components/create-requisition-dialog";
import { StatusBadge } from "@/features/requisitions/components/status-badge";
import { useIntake } from "@/features/intakes/api/use-intake";
import { useUpdateIntake } from "@/features/intakes/api/use-update-intake";
import { useSetPageTitle } from "@/stores/page-title-store";
import { formatReqTitle } from "@/lib/utils";

const AUTOSAVE_DELAY_MS = 800;

export function Component() {
  const { intakeId } = useParams<{ intakeId: string }>();
  const navigate = useNavigate();
  const { data: intake, isLoading, error } = useIntake(intakeId);
  const updateIntake = useUpdateIntake();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  // Track which values have been synced from the server so we don't overwrite
  // user edits when the query refetches.
  const syncedRef = useRef<{ title: string; content: string } | null>(null);

  useEffect(() => {
    if (!intake) return;
    if (syncedRef.current === null) {
      syncedRef.current = { title: intake.title, content: intake.content };
      setTitle(intake.title);
      setContent(intake.content);
    }
  }, [intake]);

  useSetPageTitle(intake ? intake.title || "Untitled intake" : null);

  // Debounced autosave: fires AUTOSAVE_DELAY_MS after the last edit.
  useEffect(() => {
    if (!intake || !intakeId) return;
    if (syncedRef.current === null) return;
    if (
      title === syncedRef.current.title &&
      content === syncedRef.current.content
    ) {
      return;
    }
    const handle = window.setTimeout(() => {
      const patch: { title?: string; content?: string } = {};
      if (title !== syncedRef.current!.title) patch.title = title;
      if (content !== syncedRef.current!.content) patch.content = content;
      updateIntake.mutate(
        { id: intakeId, ...patch },
        {
          onSuccess: () => {
            syncedRef.current = { title, content };
          },
        },
      );
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(handle);
    // updateIntake intentionally excluded — its identity changes on every render
    // and we only want to debounce on actual content changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, intake, intakeId]);

  const reqCrumbState: BreadcrumbState = useMemo(
    () => ({
      breadcrumb: [
        { title: "Requisitions", href: "/requisitions" },
        {
          title: title || "Untitled intake",
          href: `/intakes/${intakeId}`,
        },
      ],
    }),
    [title, intakeId],
  );

  const initialReqData: Partial<FormState> = useMemo(
    () => ({
      title,
      department: "Design",
      description: content,
      intake_id: intakeId ?? null,
    }),
    [title, content, intakeId],
  );

  if (isLoading) {
    return <IntakeDetailSkeleton />;
  }

  if (error || !intake) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-destructive">
          {error ? `Failed to load: ${error.message}` : "Intake not found"}
        </p>
        <Button variant="outline" onClick={() => navigate("/requisitions")}>
          Back to requisitions
        </Button>
      </div>
    );
  }

  const isDirty =
    syncedRef.current !== null &&
    (title !== syncedRef.current.title || content !== syncedRef.current.content);
  const isSaving = updateIntake.isPending;

  return (
    <div className="grid flex-1 min-h-0 grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex min-h-0 flex-col gap-4">
        <div className="flex items-center gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled intake"
            className="!text-3xl font-semibold border-0 px-0 shadow-none focus-visible:ring-0 dark:bg-transparent placeholder:text-muted-foreground/40 h-auto py-1"
          />
          <SaveStatus dirty={isDirty} saving={isSaving} />
          <Button
            size="sm"
            className="ml-8 shrink-0 gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            Add a requisition
          </Button>
        </div>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing the intake notes..."
          className="flex-1 min-h-0"
        />
      </div>

      <aside className="flex min-h-0 flex-col gap-3 pt-14">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">
            Job requisitions using this intake
          </h2>
          {intake.requisitions.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {intake.requisitions.length}
            </span>
          )}
        </div>

        {intake.requisitions.length === 0 ? (
          <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <Briefcase className="size-8" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                No requisitions yet
              </p>
              <p className="text-xs">
                Click "Add a requisition" to spin one up from this intake.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 overflow-y-auto">
            {intake.requisitions
              .slice()
              .sort((a, b) => b.created_at.localeCompare(a.created_at))
              .map((req) => (
                <Link
                  key={req.id}
                  to={`/requisitions/${req.id}`}
                  state={reqCrumbState}
                  className="group flex items-start gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-muted/50"
                >
                  <Briefcase className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="truncate text-sm font-medium">
                      {formatReqTitle(req.req_number, req.title)}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={req.status} />
                      {req.department && (
                        <span className="truncate text-xs text-muted-foreground">
                          {req.department}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Last updated{" "}
          {formatDistanceToNow(new Date(intake.updated_at), {
            addSuffix: true,
          })}
        </div>
      </aside>

      <CreateRequisitionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialData={initialReqData}
        onCreated={(id) =>
          navigate(`/requisitions/${id}`, { state: reqCrumbState })
        }
      />
    </div>
  );
}

function SaveStatus({ dirty, saving }: { dirty: boolean; saving: boolean }) {
  let label: string;
  let Icon: typeof Check | typeof Loader2 | null = Check;
  if (saving) {
    label = "Saving";
    Icon = Loader2;
  } else if (dirty) {
    label = "Unsaved";
    Icon = null;
  } else {
    label = "Saved";
    Icon = Check;
  }

  return (
    <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
      {Icon && (
        <Icon className={saving ? "size-3 animate-spin" : "size-3"} />
      )}
      {label}
    </div>
  );
}

function IntakeDetailSkeleton() {
  return (
    <div className="grid flex-1 min-h-0 grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
