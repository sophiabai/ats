import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { format, formatDistanceToNow, isToday } from "date-fns";
import { toast } from "sonner";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Ellipsis,
  FileText,
  Forward,
  Link2,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Pencil,
  Phone,
  Reply,
  ReplyAll,
  Search,
  Send,
  SendHorizontal,
  Sparkles,
  Trash2,
  UserCheck,
  Workflow,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENT_USER } from "@/lib/constants";
import { cn, formatReqTitle } from "@/lib/utils";
import {
  useCandidateDetail,
  type CandidateDetail,
  type ApplicationDetail,
  type ReqStageWithInterviews,
} from "@/features/candidates/api/use-candidate-detail";
import { AllFeedbackTab } from "@/features/candidates/components/all-feedback-tab";
import { ApplicationOverview } from "@/features/candidates/components/application-overview";
import {
  getStageStatus,
  InterviewTimeline,
  MILESTONE_LABELS,
  MILESTONE_ORDER,
  StageIcon,
} from "@/features/candidates/components/application-tab-content";
import {
  EducationSection,
  ExperienceSection,
} from "@/features/candidates/components/candidate-sections";
import { CandidateFormDialog } from "@/features/candidates/components/candidate-form-dialog";
import {
  EmailComposer,
  EMAIL_TEMPLATE_LABELS,
  renderEmailTemplatePlain,
  type EmailContext,
  type EmailTemplateKey,
} from "@/features/candidates/components/email-composer";
import { EmailDialog } from "@/features/candidates/components/email-dialog";
import { CandidateSelfScheduleDialog } from "@/features/candidates/components/candidate-self-schedule-dialog";
import { RequestAvailabilityDialog } from "@/features/candidates/components/request-availability-dialog";
import { ScheduleInterviewDialog } from "@/features/candidates/components/schedule-interview-dialog";
import { SendSplitButton } from "@/features/candidates/components/send-button";
import { useCandidateActivities } from "@/features/candidates/api/use-candidate-activities";
import { useCreateActivity, type CreateActivityInput } from "@/features/candidates/api/use-create-activity";
import { useDeleteCandidate } from "@/features/candidates/api/use-candidate-mutations";
import { useMoveApplicationForward } from "@/features/candidates/api/use-application-mutations";
import {
  RATING_LABELS,
  type InterviewFeedback,
  type Rating,
} from "@/features/candidates/components/interview-feedback-dialog";
import { ReassignStageDialog } from "@/features/candidates/components/reassign-stage-dialog";
import { useSetPageTitle } from "@/stores/page-title-store";
import type { Milestone } from "@/types/database";

export type RaSentEvent = {
  id: string;
  kind?: "request_availability" | "email";
  candidateName: string;
  recipientEmail: string;
  reqTitle: string;
  companyName: string;
  senderName: string;
  sentAt: Date;
  templateKey?: EmailTemplateKey;
  emailContext?: EmailContext;
};

export function CandidateHeader({
  candidate,
  onEmail,
  onEdit,
  onDownload,
  onDelete,
}: {
  candidate: CandidateDetail;
  onEmail?: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}) {
  const latestActivity = ACTIVITY_SEEDS[0];
  const linkedinUrl =
    `https://www.linkedin.com/in/${candidate.first_name}-${candidate.last_name}`.toLowerCase();

  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold">
          {candidate.first_name} {candidate.last_name}
        </h1>
        {candidate.current_company && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            {candidate.current_title
              ? `${candidate.current_title} at ${candidate.current_company}`
              : candidate.current_company}
          </p>
        )}
        {latestActivity && (
          <p
            className={
              candidate.current_company
                ? "mt-1 text-sm text-muted-foreground"
                : "mt-1.5 text-sm text-muted-foreground"
            }
          >
            {latestActivity.action} · {latestActivity.time}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">{candidate.email}</span>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="size-3.5 shrink-0" />
              {candidate.phone}
            </div>
          )}
          {candidate.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              {candidate.location}
            </div>
          )}
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <Linkedin className="size-3.5 shrink-0" />
            LinkedIn
          </a>
        </div>
      </div>
      {(onEmail || onEdit || onDownload || onDelete) && (
        <div className="flex shrink-0 items-center gap-1">
          {onEmail && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Email candidate"
              onClick={onEmail}
            >
              <Mail className="size-4" />
            </Button>
          )}
          {(onEdit || onDownload || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="More actions"
                >
                  <Ellipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onSelect={onEdit}>
                    <Pencil />
                    Edit candidate
                  </DropdownMenuItem>
                )}
                {onDownload && (
                  <DropdownMenuItem onSelect={onDownload}>
                    <Download />
                    Download PDF
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                    <Trash2 />
                    Delete candidate
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function CandidateDetailV2() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedAppId = searchParams.get("app");
  const tabParam = searchParams.get("tab");

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const deleteCandidate = useDeleteCandidate();
  const createActivity = useCreateActivity();

  const {
    data: candidate,
    isLoading,
    error,
  } = useCandidateDetail(candidateId!);

  useSetPageTitle(
    candidate ? `${candidate.first_name} ${candidate.last_name}` : null,
  );

  const VALID_TABS = ["profile", "applications", "documents", "messages", "activities"];
  const apps = candidate?.applications ?? [];
  const candidateFullName = candidate ? `${candidate.first_name} ${candidate.last_name}` : "";
  const [raSentEvents, setRaSentEvents] = useState<RaSentEvent[]>([]);
  const seededRef = useRef(false);
  useEffect(() => {
    if (candidateFullName === "Jane Warren" && !seededRef.current) {
      seededRef.current = true;
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
  }, [candidateFullName]);

  const tabsValue = VALID_TABS.includes(tabParam ?? "")
    ? tabParam!
    : "applications";

  const setActiveTab = useCallback(
    (tab: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (tab === "applications") {
            next.delete("tab");
          } else {
            next.set("tab", tab);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  if (isLoading) return <ProfileSkeleton />;

  if (error || !candidate) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-destructive">
          {error ? `Failed to load: ${error.message}` : "Candidate not found"}
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const resolvedCandidateId = candidate.id;
  const handleDeleteCandidate = () => {
    if (
      !window.confirm(
        `Delete ${candidateFullName}? This cannot be undone.`,
      )
    ) {
      return;
    }
    deleteCandidate.mutate(resolvedCandidateId, {
      onSuccess: () => {
        toast.success("Candidate deleted");
        navigate("/candidates");
      },
      onError: (err) => {
        toast.error(`Failed to delete: ${err.message}`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <CandidateHeader
        candidate={candidate}
        onEmail={() => setEmailDialogOpen(true)}
        onEdit={() => setEditDialogOpen(true)}
        onDownload={() => toast.success("PDF downloaded")}
        onDelete={handleDeleteCandidate}
      />

      <Tabs value={tabsValue} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Candidate info</TabsTrigger>
          <TabsTrigger value="applications">Job applications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="activities">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTabContent candidate={candidate} />
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          <JobApplicationsTabContent
            apps={apps}
            preselectedAppId={preselectedAppId}
            candidateName={`${candidate.first_name} ${candidate.last_name}`}
            candidateId={candidateId!}
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
            candidateId={candidateId!}
            onCreateActivity={(input) => createActivity.mutate(input)}
          />
        </TabsContent>
      </Tabs>

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

      <CandidateFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        candidate={candidate}
      />
    </div>
  );
}

export function ProfileTabContent({
  candidate,
  singleColumn = false,
}: {
  candidate: CandidateDetail;
  singleColumn?: boolean;
}) {
  const hasSkills = candidate.skills && candidate.skills.length > 0;

  const skillsSection = hasSkills && (
    <section>
      <h3 className="mb-4 font-semibold">Skills</h3>
      <div className="flex flex-wrap gap-1.5">
        {candidate.skills!.map((skill) => (
          <Badge key={skill} variant="secondary" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>
    </section>
  );

  const notesSection = candidate.notes && (
    <section>
      <h3 className="mb-4 font-semibold">Notes</h3>
      <p className="text-sm text-muted-foreground">{candidate.notes}</p>
    </section>
  );

  if (singleColumn) {
    return (
      <div className="space-y-8">
        <ExperienceSection candidate={candidate} />
        <EducationSection candidate={candidate} />
        {skillsSection}
        {notesSection}
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-8">
        <ExperienceSection candidate={candidate} />
        <EducationSection candidate={candidate} />
      </div>

      <aside className="space-y-6 lg:border-l lg:pl-6">
        {skillsSection}
        {notesSection}
      </aside>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const MONTH_INDEX: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

function parseScheduleDate(input: string): Date {
  const match = input.match(/\w+,\s+(\w+)\s+(\d+),\s+(\d+)/);
  if (!match) return new Date(input);
  const [, monthName, day, year] = match;
  const monthIdx = MONTH_INDEX[monthName] ?? 0;
  return new Date(parseInt(year), monthIdx, parseInt(day));
}

function ApplicationDetailPanel({ app, candidateName, onAvailabilitySent, schedulingStatus, onScheduled }: { app: ApplicationDetail; candidateName: string; onAvailabilitySent: () => void; schedulingStatus: SchedulingStatus; onScheduled?: () => void }) {
  const [subTab, setSubTab] = useState(
    app.current_milestone === "application" ? "home" : "interviews",
  );
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const createActivity = useCreateActivity();
  const [requestAvailOpen, setRequestAvailOpen] = useState(false);
  const [selfScheduleOpen, setSelfScheduleOpen] = useState(false);
  const [scheduledByTitle, setScheduledByTitle] = useState<Record<string, Date>>(() => {
    const initial: Record<string, Date> = {};
    for (const ai of app.application_interviews ?? []) {
      if (ai.scheduled_at) {
        initial[ai.title] = new Date(ai.scheduled_at);
      }
    }
    return initial;
  });
  const allStages = app.requisitions?.req_stages ?? [];
  const reqTitle = formatReqTitle(app.requisitions.req_number, app.requisitions.title);

  const pipeline = useMemo(() => {
    const grouped = new Map<Milestone, ReqStageWithInterviews[]>();
    for (const ms of MILESTONE_ORDER) grouped.set(ms, []);
    for (const stage of allStages) grouped.get(stage.milestone)?.push(stage);
    for (const [, arr] of grouped)
      arr.sort((a, b) => a.sort_order - b.sort_order);
    for (const [, arr] of grouped) {
      for (const stage of arr) {
        stage.req_interviews = (stage.req_interviews ?? []).sort(
          (a, b) => (a.order_position ?? 0) - (b.order_position ?? 0),
        );
      }
    }
    return grouped;
  }, [allStages]);

  const defaultStageId = app.current_stage_id ?? allStages[0]?.id ?? null;
  const [selectedStageId, setSelectedStageId] = useState<string | null>(
    defaultStageId,
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      <Tabs
        value={subTab}
        onValueChange={setSubTab}
        className="flex min-w-0 flex-1 flex-col gap-0 overflow-hidden"
      >
        <div className="-mb-px pt-4">
          <TabsList variant="file-labels" className="text-xs">
            <TabsTrigger value="home">Application</TabsTrigger>
            <TabsTrigger value="interviews">Interview stages</TabsTrigger>
            <TabsTrigger value="feedback">All feedback</TabsTrigger>
            <TabsTrigger value="notes">Notes & comments</TabsTrigger>
          </TabsList>
        </div>

        <Card className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", subTab === "home" && "rounded-tl-none")}>
          <TabsContent value="home" className="mt-0 flex-1 overflow-y-auto p-6">
            <ApplicationOverview app={app} />
          </TabsContent>

          <TabsContent value="interviews" className="mt-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {MILESTONE_ORDER.map((ms, msIdx) => (
                <PipelineMilestone
                  key={ms}
                  milestone={ms}
                  index={msIdx}
                  stages={pipeline.get(ms) ?? []}
                  app={app}
                  allStages={allStages}
                  selectedStageId={selectedStageId}
                  onSelectStage={setSelectedStageId}
                  onSchedule={() => setScheduleOpen(true)}
                  onRequestAvailability={() => setRequestAvailOpen(true)}
                  onSelfSchedule={() => setSelfScheduleOpen(true)}
                  schedulingStatus={schedulingStatus}
                  scheduledByTitle={scheduledByTitle}
                  candidateName={candidateName}
                  onCreateActivity={(input) => createActivity.mutate(input)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-0 flex-1 overflow-y-auto p-4">
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              <NotesCard />
              <CommentsCard />
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="mt-0 flex flex-1 overflow-hidden p-4">
            <AllFeedbackTab />
          </TabsContent>
        </Card>
      </Tabs>

      <ScheduleInterviewDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        candidateName={candidateName}
        reqTitle={reqTitle}
        onScheduled={(payload) => {
          const base = parseScheduleDate(payload.date);
          const next: Record<string, Date> = {};
          for (const iv of payload.interviews) {
            const hours = Math.floor(iv.startHour);
            const minutes = Math.round((iv.startHour - hours) * 60);
            const d = new Date(base);
            d.setHours(hours, minutes, 0, 0);
            next[iv.title] = d;
          }
          setScheduledByTitle((prev) => ({ ...prev, ...next }));
          onScheduled?.();
        }}
      />

      <RequestAvailabilityDialog
        open={requestAvailOpen}
        onOpenChange={setRequestAvailOpen}
        candidateName={candidateName}
        candidateEmail={`${candidateName.toLowerCase().replace(/\s+/g, "")}@gmail.com`}
        reqTitle={reqTitle}
        companyName="ACME AI"
        senderName="Anne Montgomery"
        onSent={onAvailabilitySent}
      />

      <CandidateSelfScheduleDialog
        open={selfScheduleOpen}
        onOpenChange={setSelfScheduleOpen}
        candidateName={candidateName}
        reqTitle={reqTitle}
        onSent={onAvailabilitySent}
      />
    </div>
  );
}

function PipelineMilestone({
  milestone,
  index,
  stages,
  app,
  allStages,
  selectedStageId,
  onSelectStage,
  onSchedule,
  onRequestAvailability,
  onSelfSchedule,
  schedulingStatus: schStatus,
  scheduledByTitle,
  candidateName,
  onCreateActivity,
}: {
  milestone: Milestone;
  index: number;
  stages: ReqStageWithInterviews[];
  app: ApplicationDetail;
  allStages: ReqStageWithInterviews[];
  selectedStageId: string | null;
  onSelectStage: (id: string | null) => void;
  onSchedule: () => void;
  onRequestAvailability: () => void;
  onSelfSchedule: () => void;
  schedulingStatus: SchedulingStatus;
  scheduledByTitle?: Record<string, Date>;
  candidateName?: string;
  onCreateActivity?: (input: CreateActivityInput) => void;
}) {
  const [availExpanded, setAvailExpanded] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [autoMoveMessage, setAutoMoveMessage] = useState<string | null>(null);
  const [feedbacksByInterview, setFeedbacksByInterview] = useState<
    Record<string, Record<string, InterviewFeedback>>
  >({});
  const moveForward = useMoveApplicationForward();

  const orderedStages = useMemo(() => {
    return [...allStages].sort((a, b) => {
      const ai = MILESTONE_ORDER.indexOf(a.milestone);
      const bi = MILESTONE_ORDER.indexOf(b.milestone);
      if (ai !== bi) return ai - bi;
      return a.sort_order - b.sort_order;
    });
  }, [allStages]);

  const nextStage = useMemo(() => {
    const currentIdx = orderedStages.findIndex(
      (s) => s.id === app.current_stage_id,
    );
    return orderedStages[currentIdx + 1] ?? null;
  }, [orderedStages, app.current_stage_id]);

  const handleMoveForward = () => {
    if (!nextStage) return;
    moveForward.mutate({
      applicationId: app.id,
      candidateId: app.candidate_id,
      nextStageId: nextStage.id,
      nextMilestone: nextStage.milestone,
    });
  };

  const handleReassign = (stageId: string, nextMilestone: Milestone) => {
    moveForward.mutate(
      {
        applicationId: app.id,
        candidateId: app.candidate_id,
        nextStageId: stageId,
        nextMilestone,
      },
      { onSuccess: () => setReassignOpen(false) },
    );
  };

  const handleFeedbackChange = (
    interviewTitle: string,
    interviewerName: string,
    feedback: InterviewFeedback,
  ) => {
    const next = {
      ...feedbacksByInterview,
      [interviewTitle]: {
        ...(feedbacksByInterview[interviewTitle] ?? {}),
        [interviewerName]: feedback,
      },
    };
    setFeedbacksByInterview(next);

    onCreateActivity?.({
      candidateId: app.candidate_id,
      applicationId: app.id,
      activityType: "interviews_and_feedbacks",
      action: "Feedback submitted",
      detail: `${interviewerName} submitted feedback for ${interviewTitle}: ${feedback.overallRating ? RATING_LABELS[feedback.overallRating as Rating] : "No rating"}`,
    });

    const currentStage = allStages.find((s) => s.id === app.current_stage_id);
    if (!currentStage) return;

    const allInterviewers: { title: string; name: string }[] = [];
    for (const iv of currentStage.req_interviews) {
      for (const n of (iv.interviewer_name ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)) {
        allInterviewers.push({ title: iv.title, name: n });
      }
    }

    const allHaveFeedback = allInterviewers.every(
      ({ title, name }) => next[title]?.[name]?.overallRating,
    );
    if (!allHaveFeedback) return;

    const allPositive = allInterviewers.every(({ title, name }) => {
      const r = next[title]?.[name]?.overallRating;
      return r === "yes" || r === "strong_yes";
    });

    if (allPositive && nextStage) {
      setAutoMoveMessage(
        `All interviewers said yes, moved to ${nextStage.name}`,
      );
      onCreateActivity?.({
        candidateId: app.candidate_id,
        applicationId: app.id,
        activityType: "application_moved",
        action: `Moved to ${nextStage.name}`,
        detail: `Auto-advanced from ${currentStage.name} — all interviewers recommended`,
      });
      moveForward.mutate({
        applicationId: app.id,
        candidateId: app.candidate_id,
        nextStageId: nextStage.id,
        nextMilestone: nextStage.milestone,
      });
    }
  };

  return (
    <div className="space-y-1">
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground/70">
        Milestone {index + 1}: {MILESTONE_LABELS[milestone]}
      </div>
      {stages.length > 0
        ? stages.map((stage) => {
            const status = getStageStatus(
              milestone,
              stage.id,
              app.current_milestone,
              app.current_stage_id,
              allStages,
            );
            const isCurrent = status === "current";
            const isExpanded = stage.id === selectedStageId || isCurrent;
            const allScheduled =
              stage.req_interviews.length > 0 &&
              stage.req_interviews.every((iv) => scheduledByTitle?.[iv.title]);
            return (
              <div
                key={stage.id}
                className={cn(
                  "rounded-lg hover:bg-muted",
                  isExpanded && "bg-muted",
                )}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    onSelectStage(stage.id === selectedStageId ? null : stage.id)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectStage(
                        stage.id === selectedStageId ? null : stage.id,
                      );
                    }
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    status === "upcoming" && "text-muted-foreground",
                  )}
                >
                  <StageIcon status={status} />
                  <span className="flex-1 truncate text-left font-semibold">
                    {stage.name}
                    {isCurrent && (
                      <span className="ml-1.5">(current stage)</span>
                    )}
                  </span>
                  {isCurrent && !allScheduled && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button size="sm">Schedule</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={onSchedule}>Schedule</DropdownMenuItem>
                        <DropdownMenuItem onSelect={onRequestAvailability}>Request availability</DropdownMenuItem>
                        <DropdownMenuItem onSelect={onSelfSchedule}>Candidate self-schedule</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="px-2">
                  {isCurrent && schStatus === "pending_availability" && (
                    <div className="flex items-start gap-2 py-2">
                      <div className="flex shrink-0 items-center py-2">
                        <div className="flex size-5 items-center justify-center rounded bg-amber-500/10">
                          <Mail className="size-4 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            Pending candidate availability
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-amber-600 dark:text-amber-400"
                              >
                                <Ellipsis className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem>
                                <Link2 className="mr-2 size-4" />
                                Copy availability link
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="mr-2 size-4" />
                                Resend
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
                          Sent on {format(new Date(), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                  {isCurrent && schStatus === "availability_received" && (
                    <div className="py-2">
                      <div className="flex items-start gap-2">
                        <div className="flex shrink-0 items-center py-2">
                          <div className="flex size-5 items-center justify-center rounded bg-emerald-500/10">
                            <CalendarCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
                              onClick={() => setAvailExpanded(!availExpanded)}
                            >
                              Availability received
                              {availExpanded ? (
                                <ChevronDown className="size-3.5 stroke-[2.5]" />
                              ) : (
                                <ChevronRight className="size-3.5 stroke-[2.5]" />
                              )}
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground"
                              title="Copy availabilities"
                            >
                              <Calendar className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground"
                              title="Request new availability"
                            >
                              <Mail className="size-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                            Received on {format(new Date(), "MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "stage-collapse grid",
                          availExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                        )}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div className="mt-2 ml-7 space-y-1.5">
                            {[
                              { day: "Mon, May 5", slots: ["9:00 AM – 12:30 PM"] },
                              { day: "Tue, May 6", slots: ["10:00 AM – 1:30 PM", "2:00 PM – 5:30 PM"] },
                              { day: "Wed, May 7", slots: ["9:00 AM – 12:30 PM"] },
                              { day: "Thu, May 8", slots: ["1:00 PM – 4:30 PM"] },
                            ].map((d) => (
                              <div key={d.day} className="flex gap-3 text-sm">
                                <span className="w-24 shrink-0 font-medium text-foreground">{d.day}</span>
                                <div className="flex flex-col">
                                  {d.slots.map((s) => (
                                    <span key={s} className="text-muted-foreground">{s}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div
                    className={cn(
                      "stage-collapse grid",
                      isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                      {stage.req_interviews.length > 0 && (
                        <div className="pb-2">
                          <InterviewTimeline
                            interviews={stage.req_interviews}
                            scheduledByTitle={scheduledByTitle}
                            candidateName={candidateName}
                            feedbacks={feedbacksByInterview}
                            onFeedbackChange={handleFeedbackChange}
                          />
                        </div>
                      )}
                      {status === "current" && (
                        <div className="flex items-center gap-2 border-t border-border/60 py-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                More actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem>Add note</DropdownMenuItem>
                              <DropdownMenuItem>Add feedback</DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setReassignOpen(true);
                                }}
                              >
                                Reassign stage
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <div className="flex-1" />
                          <Button variant="outline" size="sm">
                            <X className="size-3.5" />
                            Reject
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={handleMoveForward}
                            disabled={moveForward.isPending}
                          >
                            <Check className="size-3.5" />
                            Move forward
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        : (
          <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground/40">
            <StageIcon status="upcoming" />
            <span>{MILESTONE_LABELS[milestone]}</span>
          </div>
        )}

      {autoMoveMessage && (
        <div className="animate-in fade-in slide-in-from-top-1 flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 duration-300 dark:text-emerald-400">
          <Sparkles className="size-3.5 shrink-0" />
          <span>{autoMoveMessage}</span>
        </div>
      )}

      <ReassignStageDialog
        open={reassignOpen}
        onOpenChange={setReassignOpen}
        candidateName={candidateName ?? "this candidate"}
        allStages={allStages}
        currentStageId={app.current_stage_id}
        defaultStageId={nextStage?.id ?? app.current_stage_id}
        onConfirm={handleReassign}
        isSaving={moveForward.isPending}
      />
    </div>
  );
}

function NotesCard() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="gap-0 py-0">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-2.5"
          >
            <span className="text-base font-semibold">Notes</span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">No notes yet</p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

const DEMO_COMMENTS = [
  {
    author: "Sarah Chen",
    time: "2 days ago",
    text: "Looks great! Let's schedule an interview for them.",
  },
  {
    author: "Anne Montgomery",
    time: "2 days ago",
    text: "Hi @Sarah Chen Can you please also take a look at this resume?",
    mention: "Sarah Chen",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

function CommentsCard() {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-base">Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        <div className="relative">
          <Input className="h-9 pr-16" placeholder="Add a comment..." />
          <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
            <Button variant="ghost" size="icon" className="size-6 opacity-50">
              <Paperclip className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-6 opacity-50">
              <SendHorizontal className="size-3.5" />
            </Button>
          </div>
        </div>
        {DEMO_COMMENTS.map((comment, i) => (
          <div key={i} className="flex gap-2">
            <Avatar size="sm">
              <AvatarFallback>{initials(comment.author)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-semibold">{comment.author}</span>{" "}
                <span className="text-xs text-muted-foreground">{comment.time}</span>
              </p>
              <p className="text-sm">
                {comment.mention ? (
                  <>
                    Hi <span className="text-primary underline">@{comment.mention}</span>{" "}
                    {comment.text.split(`@${comment.mention}`).slice(1).join("").trim()}
                  </>
                ) : (
                  comment.text
                )}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

type SchedulingStatus = "to_be_scheduled" | "pending_availability" | "availability_received";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  hired: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  to_be_scheduled: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  pending_availability: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  availability_received: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

const SCHEDULING_STATUS_LABELS: Record<SchedulingStatus, string> = {
  to_be_scheduled: "To be scheduled",
  pending_availability: "Pending candidate availability",
  availability_received: "Availability received",
};

function formatStatusLabel(status: string, date: string) {
  const formatted = format(new Date(date), "MMM d, yyyy");
  return status === "active"
    ? `Active since: ${formatted}`
    : `${STATUS_LABEL[status] ?? status} on: ${formatted}`;
}

export function JobApplicationsTabContent({
  apps,
  preselectedAppId,
  candidateName,
  candidateId,
  onRaSent,
  onCreateActivity,
}: {
  apps: ApplicationDetail[];
  preselectedAppId: string | null;
  candidateName: string;
  candidateId: string;
  onRaSent: (evt: RaSentEvent) => void;
  onCreateActivity: (input: CreateActivityInput) => void;
}) {
  const defaultAppId =
    preselectedAppId && apps.some((a) => a.id === preselectedAppId)
      ? preselectedAppId
      : apps[0]?.id ?? null;
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    defaultAppId,
  );
  const selectedApp =
    apps.find((a) => a.id === selectedAppId) ?? apps[0] ?? null;

  const [schedulingStatus, setSchedulingStatus] = useState<Record<string, SchedulingStatus>>(() => {
    if (candidateName === "Jane Warren") {
      const initial: Record<string, SchedulingStatus> = {};
      for (const a of apps) initial[a.id] = "availability_received";
      return initial;
    }
    return {};
  });

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
        <Briefcase className="size-8" />
        <p className="text-sm">No job applications yet</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[480px] flex-col overflow-hidden rounded-xl bg-muted p-4">
      {selectedApp && (
        <div className="flex flex-wrap items-center gap-3 p-4 pt-1">
          <ApplicationSelector
            apps={apps}
            selectedApp={selectedApp}
            onSelect={setSelectedAppId}
          />
          <Badge
            variant="outline"
            className={cn(
              "border-0 text-xs",
              STATUS_BADGE_CLASSES[schedulingStatus[selectedApp.id] ?? "to_be_scheduled"] ??
                "bg-muted text-muted-foreground",
            )}
          >
            {SCHEDULING_STATUS_LABELS[schedulingStatus[selectedApp.id] ?? "to_be_scheduled"]}
          </Badge>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {selectedApp && (
          <ApplicationDetailPanel
            key={selectedApp.id}
            app={selectedApp}
            candidateName={candidateName}
            schedulingStatus={schedulingStatus[selectedApp.id] ?? "to_be_scheduled"}
            onAvailabilitySent={() => {
              setSchedulingStatus((prev) => ({
                ...prev,
                [selectedApp.id]: "pending_availability",
              }));
              onRaSent({
                id: Math.random().toString(36).slice(2) + Date.now().toString(36),
                candidateName,
                recipientEmail: `${candidateName.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
                reqTitle: formatReqTitle(selectedApp.requisitions.req_number, selectedApp.requisitions.title),
                companyName: "ACME AI",
                senderName: "Anne Montgomery",
                sentAt: new Date(),
              });
              onCreateActivity({
                candidateId,
                applicationId: selectedApp.id,
                activityType: "communication",
                action: "Request availability sent",
                detail: `To: ${candidateName}`,
                metadata: { reqTitle: formatReqTitle(selectedApp.requisitions.req_number, selectedApp.requisitions.title) },
              });
            }}
          />
        )}
      </div>
    </div>
  );
}

function ApplicationSelector({
  apps,
  selectedApp,
  onSelect,
}: {
  apps: ApplicationDetail[];
  selectedApp: ApplicationDetail;
  onSelect: (id: string) => void;
}) {
  const label = formatReqTitle(
    selectedApp.requisitions.req_number,
    selectedApp.requisitions.title,
  );

  if (apps.length <= 1) {
    return (
      <span className="truncate text-base font-semibold text-foreground">
        {label}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="-mx-2 inline-flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-base font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-72">
        {apps.map((app) => {
          const active = app.id === selectedApp.id;
          return (
            <DropdownMenuItem
              key={app.id}
              onSelect={() => onSelect(app.id)}
              className={cn("gap-3", active && "font-medium")}
            >
              <Check
                className={cn(
                  "size-3.5",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              <span className="truncate">
                {formatReqTitle(
                  app.requisitions.req_number,
                  app.requisitions.title,
                )}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "ml-auto shrink-0 border-0 text-[11px] font-normal",
                  STATUS_BADGE_CLASSES[app.status] ??
                    "bg-muted text-muted-foreground",
                )}
              >
                {formatStatusLabel(app.status, app.applied_date)}
              </Badge>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const ACTIVITY_TYPES = [
  { value: "application_events", label: "Application events" },
  { value: "interviews_and_feedbacks", label: "Interviews and feedbacks" },
  { value: "communication", label: "Communication" },
  { value: "data_changes", label: "Data changes" },
  { value: "imported_activity_feed", label: "Imported activity feed" },
  { value: "application_moved", label: "Application moved" },
  { value: "pipeline_plan_updated", label: "Pipeline plan updated" },
] as const;

type ActivityType = (typeof ACTIVITY_TYPES)[number]["value"];

type ActivitySeed = {
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  detail: string;
  time: string;
  type: ActivityType;
  // Index into the candidate's applications, mod-wrapped so demo works for any count
  appIndex: number;
};

const ACTIVITY_SEEDS: ActivitySeed[] = [
  {
    icon: CalendarCheck,
    action: "Availability received",
    detail: "Candidate submitted 4 time slots across Mon–Thu next week",
    time: "6 hours ago",
    type: "interviews_and_feedbacks",
    appIndex: 0,
  },
  {
    icon: MessageSquare,
    action: "Candidate replied",
    detail: "Expressed interest in the role, asked about team size",
    time: "1 day ago",
    type: "communication",
    appIndex: 0,
  },
  {
    icon: Calendar,
    action: "Phone screen scheduled",
    detail: "Thursday, May 15 at 2:00 PM with Leslie Alexander",
    time: "1 day ago",
    type: "interviews_and_feedbacks",
    appIndex: 0,
  },
  {
    icon: ArrowRight,
    action: "Moved to Phone screen stage",
    detail: "Advanced from Application review by Anne Montgomery",
    time: "1 day ago",
    type: "application_moved",
    appIndex: 0,
  },
  {
    icon: Workflow,
    action: "Pipeline plan updated",
    detail: "Added Technical screen before Onsite by Anne Montgomery",
    time: "2 days ago",
    type: "pipeline_plan_updated",
    appIndex: 1,
  },
  {
    icon: Search,
    action: "Profile enriched",
    detail: "Cross-referenced WAAS, Ashby, and Gmail by Candidate lookup agent",
    time: "2 days ago",
    type: "data_changes",
    appIndex: 1,
  },
  {
    icon: FileText,
    action: "Application reviewed",
    detail: "Recommended for phone screen by Applicant review agent",
    time: "3 days ago",
    type: "application_events",
    appIndex: 1,
  },
  {
    icon: UserCheck,
    action: "Application received",
    detail: "Applied via LinkedIn",
    time: "3 days ago",
    type: "application_events",
    appIndex: 0,
  },
  {
    icon: CheckCircle2,
    action: "Added to candidate pool",
    detail: "Sourced from LinkedIn by recruiter",
    time: "5 days ago",
    type: "imported_activity_feed",
    appIndex: 0,
  },
];

const ACTIVITY_TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  application_events: FileText,
  interviews_and_feedbacks: Calendar,
  communication: Send,
  data_changes: Search,
  imported_activity_feed: CheckCircle2,
  application_moved: ArrowRight,
  pipeline_plan_updated: Workflow,
};

export function ActivitiesTabContent({ apps, raSentEvents, candidateId, onCreateActivity }: { apps: ApplicationDetail[]; raSentEvents: RaSentEvent[]; candidateId: string; onCreateActivity: (input: CreateActivityInput) => void }) {
  const { data: dbActivities } = useCandidateActivities(candidateId);

  const reqOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: { value: string; label: string }[] = [];
    for (const a of apps) {
      const id = a.requisitions.id;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({
        value: id,
        label: formatReqTitle(a.requisitions.req_number, a.requisitions.title),
      });
    }
    return out;
  }, [apps]);

  const reqLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of reqOptions) map.set(o.value, o.label);
    return map;
  }, [reqOptions]);

  // Map application_id to req_id for DB activities
  const appIdToReqId = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of apps) map.set(a.id, a.requisitions.id);
    return map;
  }, [apps]);

  const activities = useMemo(() => {
    type UnifiedActivity = {
      id: string;
      icon: React.ComponentType<{ className?: string }>;
      action: string;
      detail: string;
      time: string;
      type: ActivityType;
      reqId: string;
    };

    const items: UnifiedActivity[] = [];

    // DB activities first (already sorted by created_at desc from query)
    if (dbActivities) {
      for (const row of dbActivities) {
        const reqId = row.application_id ? (appIdToReqId.get(row.application_id) ?? "") : (apps[0]?.requisitions.id ?? "");
        items.push({
          id: row.id,
          icon: ACTIVITY_TYPE_ICON[row.activity_type] ?? FileText,
          action: row.action,
          detail: row.detail ?? "",
          time: formatDistanceToNow(new Date(row.created_at), { addSuffix: true }),
          type: row.activity_type as ActivityType,
          reqId,
        });
      }
    }

    // Demo seed activities appended (kept in their defined order)
    if (apps.length > 0) {
      for (const seed of ACTIVITY_SEEDS) {
        const app = apps[seed.appIndex % apps.length];
        items.push({
          id: `seed-${seed.action}-${seed.appIndex}`,
          icon: seed.icon,
          action: seed.action,
          detail: seed.detail,
          time: seed.time,
          type: seed.type,
          reqId: app.requisitions.id,
        });
      }
    }

    return items;
  }, [apps, dbActivities, appIdToReqId]);

  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    () => new Set(ACTIVITY_TYPES.map((t) => t.value)),
  );
  const [selectedReqs, setSelectedReqs] = useState<Set<string>>(
    () => new Set(apps.map((a) => a.requisitions.id)),
  );
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const filtered = activities.filter(
    (a) => selectedTypes.has(a.type) && selectedReqs.has(a.reqId),
  );

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          label="Type"
          options={ACTIVITY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          selected={selectedTypes}
          onSelectedChange={setSelectedTypes}
          searchPlaceholder="Search types"
          allLabel="All activity types"
        />
        {reqOptions.length > 0 && (
          <MultiSelectFilter
            label="Req"
            options={reqOptions}
            selected={selectedReqs}
            onSelectedChange={setSelectedReqs}
            searchPlaceholder="Search reqs"
            allLabel="All job requisitions"
          />
        )}
      </div>

      {/* Reply composer above activity feed */}
      {replyingToId && (() => {
        const evt = raSentEvents.find((e) => e.id === replyingToId);
        if (!evt) return null;
        return (
          <div className="rounded-2xl border bg-card">
            <EmailComposer
              initialTemplate="availability-default"
              context={{
                candidateName: evt.candidateName,
                candidateEmail: evt.recipientEmail,
                jobTitle: evt.reqTitle,
                companyName: evt.companyName,
                senderName: evt.senderName,
                recruiterName: evt.senderName,
              }}
              recipientName={evt.candidateName}
              recipientEmail={evt.recipientEmail}
              className="border-0 rounded-none shadow-none"
              footerLeading={
                <SendSplitButton
                  size="xs"
                  onSend={() => {
                    onCreateActivity({
                      candidateId,
                      applicationId: apps[0]?.id ?? null,
                      activityType: "communication",
                      action: "Reply sent",
                      detail: `To: ${evt.candidateName}`,
                      metadata: { recipientEmail: evt.recipientEmail },
                    });
                    setReplyingToId(null);
                  }}
                />
              }
              footerTrailing={
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setReplyingToId(null)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Discard draft</TooltipContent>
                </Tooltip>
              }
            />
          </div>
        );
      })()}

      {/* RA sent email activities */}
      {raSentEvents.map((evt, i) => (
        <EmailActivityItem
          key={evt.id}
          event={evt}
          expanded={expandedEmailId === evt.id}
          onToggle={() => setExpandedEmailId(expandedEmailId === evt.id ? null : evt.id)}
          onReply={() => setReplyingToId(evt.id)}
          showConnector={i < raSentEvents.length - 1 || filtered.length > 0}
        />
      ))}

      {filtered.length === 0 && raSentEvents.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No activities match the current filters
        </div>
      ) : (
        <div className="space-y-0">
          {filtered.map((activity, i) => (
            <div key={activity.id} className="flex gap-3 py-3">
              <div className="relative flex flex-col items-center">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <activity.icon className="size-3.5 text-muted-foreground" />
                </div>
                {i < filtered.length - 1 && (
                  <div className="mt-1 w-px flex-1 bg-border" />
                )}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{activity.action}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{activity.detail}</p>
                {reqLabelById.get(activity.reqId) && (
                  <p className="mt-0.5 text-xs text-muted-foreground/70">
                    Req · {reqLabelById.get(activity.reqId)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmailActivityItem({
  event,
  expanded,
  onToggle,
  onReply,
  showConnector = true,
}: {
  event: RaSentEvent;
  expanded: boolean;
  onToggle: () => void;
  onReply: () => void;
  showConnector?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const formattedDate = isToday(event.sentAt)
    ? format(event.sentAt, "h:mm a")
    : format(event.sentAt, "MM/dd/yyyy h:mm a");

  const isEmailKind = event.kind === "email";
  const title = isEmailKind
    ? event.templateKey
      ? EMAIL_TEMPLATE_LABELS[event.templateKey]
      : "Email"
    : "Request availability";

  const recipientLabel = event.reqTitle
    ? `To: ${event.candidateName} · ${event.reqTitle}`
    : `To: ${event.candidateName}`;

  return (
    <div className="flex gap-3 py-3">
      <div className="relative flex flex-col items-center">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
          <Mail className="size-3.5 text-muted-foreground" />
        </div>
        {showConnector && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>
      <div
        className={cn(
          "min-w-0 flex-1 cursor-pointer rounded-lg pb-1 transition-colors",
          hovered ? "bg-muted" : "bg-card",
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center justify-between gap-2 px-3 pt-1">
          <div
            role="button"
            tabIndex={0}
            onClick={onToggle}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle();
              }
            }}
            className="min-w-0 flex-1"
          >
            <span className="text-sm font-medium">{title}</span>
            <p className="text-xs text-muted-foreground">{recipientLabel}</p>
          </div>
          <div className="relative flex shrink-0 items-center">
            <div className={cn("flex items-center gap-0.5", hovered ? "opacity-100" : "pointer-events-none opacity-0")}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
                onClick={onReply}
              >
                <Reply className="size-3.5" />
                Reply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
              >
                <ReplyAll className="size-3.5" />
                Reply all
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
              >
                <Forward className="size-3.5" />
                Forward
              </Button>
            </div>
            <span className={cn(
              "absolute inset-0 flex items-center justify-end text-[11px] text-muted-foreground transition-opacity pointer-events-none",
              hovered ? "opacity-0" : "opacity-100",
            )}>
              {formattedDate}
            </span>
          </div>
        </div>

        {expanded && (
          <div className="px-3 pb-3 pt-2">
            {isEmailKind && event.templateKey && event.emailContext ? (
              <div
                className="space-y-3 text-sm leading-relaxed [&_p]:my-0"
                onClick={(e) => e.stopPropagation()}
                dangerouslySetInnerHTML={{
                  __html: renderEmailTemplatePlain(
                    event.templateKey,
                    event.emailContext,
                  ),
                }}
              />
            ) : (
              <div className="space-y-3 text-sm leading-relaxed">
                <p>Hi {event.candidateName},</p>
                <p>
                  We&apos;re excited to move forward with your candidacy for the{" "}
                  {event.reqTitle} at {event.companyName}! Please use the link
                  below to share your availability for an interview.
                </p>
                <p>Looking forward to speaking with you!</p>
                <p>
                  <a
                    href="#"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Enter your availability here &gt;&gt;&gt;
                  </a>
                </p>
                <p>Best,</p>
                <p>{event.senderName}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MultiSelectFilter({
  label,
  options,
  selected,
  onSelectedChange,
  searchPlaceholder = "Search",
  allLabel = "All",
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: Set<string>;
  onSelectedChange: (next: Set<string>) => void;
  searchPlaceholder?: string;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const total = options.length;
  const count = selected.size;
  const allSelected = total > 0 && count === total;
  const someSelected = count > 0 && !allSelected;

  const chipLabel = (() => {
    if (count === 0) return "None";
    if (allSelected) return allLabel;
    if (count === 1) {
      const [only] = selected;
      return options.find((o) => o.value === only)?.label ?? "1 selected";
    }
    return `${count} selected`;
  })();

  const toggleAll = () => {
    if (allSelected) {
      onSelectedChange(new Set());
    } else {
      onSelectedChange(new Set(options.map((o) => o.value)));
    }
  };

  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onSelectedChange(next);
  };

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Filter by ${label.toLowerCase()}`}
          className={cn(
            "flex h-9 min-w-56 items-center gap-2 rounded-md border border-input bg-card px-2.5 text-sm shadow-xs transition-colors",
            "hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            open && "ring-2 ring-ring",
          )}
        >
          <span className="inline-flex max-w-[180px] items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-xs text-foreground">
            <span className="truncate">{chipLabel}</span>
            <span
              role="button"
              tabIndex={-1}
              aria-label={`Clear ${label.toLowerCase()} filter`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSelectedChange(new Set());
              }}
              className="-mr-0.5 inline-flex size-3.5 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
            >
              <X className="size-3" />
            </span>
          </span>
          <ChevronDown
            className={cn(
              "ml-auto size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="border-b px-3 py-2.5">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8"
          />
        </div>
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm font-semibold">{count} selected</span>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            Select all
            <Checkbox
              checked={
                allSelected ? true : someSelected ? "indeterminate" : false
              }
              onCheckedChange={toggleAll}
            />
          </label>
        </div>
        <Separator />
        <div className="max-h-64 overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No matches
            </p>
          ) : (
            filteredOptions.map((o) => (
              <label
                key={o.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm hover:bg-accent"
              >
                <Checkbox
                  checked={selected.has(o.value)}
                  onCheckedChange={() => toggle(o.value)}
                />
                <span className="min-w-0 truncate">{o.label}</span>
              </label>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
