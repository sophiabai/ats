import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ChevronsRight, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCandidateDetail,
} from "@/features/candidates/api/use-candidate-detail";
import { useCreateActivity } from "@/features/candidates/api/use-create-activity";
import { EmailDialog } from "@/features/candidates/components/email-dialog";
import {
  ActivitiesTabContent,
  CandidateHeader,
  JobApplicationsTabContent,
  ProfileTabContent,
  type RaSentEvent,
} from "@/features/candidates/variants/v2";
import { CURRENT_USER } from "@/lib/constants";
import { useInboxDetailStore } from "@/stores/inbox-detail-store";

const MIN_WIDTH = 380;
const MAX_WIDTH = 960;
const DEFAULT_WIDTH = 720;

function useResizable(initial: number) {
  const [width, setWidth] = useState(initial);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      startX.current = e.clientX;
      startW.current = width;

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const delta = startX.current - ev.clientX;
        setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startW.current + delta)));
      };

      const onMouseUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width],
  );

  return { width, onMouseDown };
}

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute inset-y-0 left-0 z-10 w-1 cursor-col-resize transition-colors hover:bg-berry-500/40 active:bg-berry-500/60"
    />
  );
}

export function DockedCandidatePanel() {
  const { candidateId, appId, initialTab, close } = useInboxDetailStore();
  const { width, onMouseDown } = useResizable(DEFAULT_WIDTH);
  const { data: candidate, isLoading } = useCandidateDetail(candidateId!);
  const createActivity = useCreateActivity();

  const [activeTab, setActiveTab] = useState(initialTab ?? "applications");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [raSentEvents, setRaSentEvents] = useState<RaSentEvent[]>([]);

  // Reset per-candidate state when the drawer switches candidates.
  const lastCandidateIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (lastCandidateIdRef.current !== candidateId) {
      lastCandidateIdRef.current = candidateId;
      setActiveTab(initialTab ?? "applications");
      setRaSentEvents([]);
      setEmailDialogOpen(false);
    }
  }, [candidateId, initialTab]);

  // Seed RA event for the Jane Warren demo, matching the candidate page.
  const candidateFullName = candidate
    ? `${candidate.first_name} ${candidate.last_name}`
    : "";
  const seededRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      candidateFullName === "Jane Warren" &&
      seededRef.current !== candidate?.id
    ) {
      seededRef.current = candidate?.id ?? null;
      setRaSentEvents([
        {
          id: "seed-ra-jane-warren",
          candidateName: "Jane Warren",
          recipientEmail: "jane.w@email.com",
          reqTitle: "1000 · Senior Frontend Engineer",
          companyName: "ACME AI",
          senderName: "Anne Montgomery",
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ]);
    }
  }, [candidateFullName, candidate?.id]);

  if (isLoading) {
    return (
      <div className="relative flex h-full shrink-0 flex-col border-l bg-white dark:bg-stone-950" style={{ width }}>
        <ResizeHandle onMouseDown={onMouseDown} />
        <DrawerChrome onClose={close} candidateId={null} />
        <div className="space-y-4 p-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="relative flex h-full shrink-0 flex-col items-center justify-center border-l bg-white dark:bg-stone-950 text-sm text-muted-foreground" style={{ width }}>
        Candidate not found
      </div>
    );
  }

  const apps = candidate.applications ?? [];

  return (
    <aside className="relative flex h-full shrink-0 flex-col border-l bg-white dark:bg-stone-950" style={{ width }}>
      <ResizeHandle onMouseDown={onMouseDown} />
      <DrawerChrome onClose={close} candidateId={candidate.id} />

      <div className="flex-1 overflow-y-auto px-12 py-10">
        <div className="pb-6">
          <CandidateHeader
            candidate={candidate}
            onEmail={() => setEmailDialogOpen(true)}
            onEdit={() => toast.info("Edit candidate coming soon")}
            onDownload={() => toast.success("PDF downloaded")}
            onDelete={() => toast.info("Delete candidate coming soon")}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="profile">Candidate info</TabsTrigger>
            <TabsTrigger value="applications">Job applications</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="activities">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <ProfileTabContent candidate={candidate} singleColumn />
          </TabsContent>

          <TabsContent value="applications" className="mt-4">
            <JobApplicationsTabContent
              apps={apps}
              preselectedAppId={appId}
              candidateName={candidateFullName}
              candidateId={candidate.id}
              onRaSent={(evt) => setRaSentEvents((prev) => [evt, ...prev])}
              onCreateActivity={(input) => createActivity.mutate(input)}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Coming soon
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Coming soon
            </div>
          </TabsContent>

          <TabsContent value="activities" className="mt-4">
            <ActivitiesTabContent
              apps={apps}
              raSentEvents={raSentEvents}
              candidateId={candidate.id}
              onCreateActivity={(input) => createActivity.mutate(input)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <EmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        candidateName={candidateFullName}
        candidateEmail={candidate.email}
        companyName={CURRENT_USER.company}
        senderName={CURRENT_USER.name}
        jobTitle={apps[0]?.requisitions?.title ?? ""}
        onSent={(payload) => {
          const evt: RaSentEvent = {
            id: `email-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            kind: "email",
            candidateName: payload.candidateName,
            recipientEmail: payload.candidateEmail,
            reqTitle: payload.context.jobTitle,
            companyName: payload.context.companyName,
            senderName: payload.context.senderName,
            sentAt: new Date(),
            templateKey: payload.templateKey,
            emailContext: payload.context,
          };
          setRaSentEvents((prev) => [evt, ...prev]);
        }}
      />
    </aside>
  );
}

function DrawerChrome({
  onClose,
  candidateId,
}: {
  onClose: () => void;
  candidateId: string | null;
}) {
  return (
    <div className="flex items-center justify-end gap-0.5 px-3 pt-3">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        aria-label="Close"
      >
        <ChevronsRight className="size-4" />
      </Button>
      {candidateId && (
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          aria-label="Open full profile"
        >
          <Link to={`/candidates/${candidateId}`} target="_blank">
            <Maximize2 className="size-3.5" />
          </Link>
        </Button>
      )}
    </div>
  );
}
