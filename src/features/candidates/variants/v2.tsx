import { useCallback, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { format } from "date-fns";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  CornerUpLeft,
  Ellipsis,
  FileText,
  Forward,
  GraduationCap,
  Link2,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Reply,
  ReplyAll,
  Search,
  Send,
  SendHorizontal,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatReqTitle } from "@/lib/utils";
import {
  useCandidateDetail,
  type CandidateDetail,
  type ApplicationDetail,
  type ReqStageWithInterviews,
} from "@/features/candidates/api/use-candidate-detail";
import {
  getStageStatus,
  InterviewTimeline,
  MILESTONE_LABELS,
  MILESTONE_ORDER,
  StageIcon,
} from "@/features/candidates/components/application-tab-content";
import { EmailComposer } from "@/features/candidates/components/email-composer";
import { RequestAvailabilityDialog } from "@/features/candidates/components/request-availability-dialog";
import { ScheduleInterviewDialog } from "@/features/candidates/components/schedule-interview-dialog";
import { SendSplitButton } from "@/features/candidates/components/send-button";
import { useSetPageTitle } from "@/stores/page-title-store";
import type { Milestone } from "@/types/database";

type RaSentEvent = {
  id: string;
  candidateName: string;
  recipientEmail: string;
  reqTitle: string;
  companyName: string;
  senderName: string;
  sentAt: Date;
};

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
  const preselectedAppId = searchParams.get("app");
  const tabParam = searchParams.get("tab");

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
  const [raSentEvents, setRaSentEvents] = useState<RaSentEvent[]>([]);

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

  return (
    <div className="space-y-6">
      <div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold ">
            {candidate.first_name} {candidate.last_name}
          </h1>
          {candidate.current_company && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              {candidate.current_title
                ? `${candidate.current_title} at ${candidate.current_company}`
                : candidate.current_company}
            </p>
          )}
          {ACTIVITY_SEEDS[0] && (
            <p
              className={
                candidate.current_company
                  ? "mt-1 text-sm text-muted-foreground"
                  : "mt-1.5 text-sm text-muted-foreground"
              }
            >
              {ACTIVITY_SEEDS[0].action} · {ACTIVITY_SEEDS[0].time}
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
              href={`https://www.linkedin.com/in/${candidate.first_name}-${candidate.last_name}`.toLowerCase()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground"
            >
              <Linkedin className="size-3.5 shrink-0" />
              LinkedIn
            </a>
          </div>
        </div>
      </div>


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
            onRaSent={(evt) => setRaSentEvents((prev) => [evt, ...prev])}
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
          <ActivitiesTabContent apps={apps} raSentEvents={raSentEvents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatMonth(dateStr: string) {
  const [year, month] = dateStr.split("-");
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

function durationLabel(start: string, end: string | null) {
  const s = new Date(start + "-01");
  const e = end ? new Date(end + "-01") : new Date();
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months < 1) months = 1;
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs > 0 && mos > 0) return `${yrs} yr${yrs > 1 ? "s" : ""} ${mos} mo${mos > 1 ? "s" : ""}`;
  if (yrs > 0) return `${yrs} yr${yrs > 1 ? "s" : ""}`;
  return `${mos} mo${mos > 1 ? "s" : ""}`;
}

function ProfileTabContent({ candidate }: { candidate: CandidateDetail }) {
  const workHistory = candidate.work_history ?? [];
  const education = candidate.education ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-8">
        {workHistory.length > 0 && (
          <section>
            <h3 className="font-semibold">Experience</h3>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              Total years of experience:{" "}
              <span className="font-semibold text-foreground">10.5 years</span>
            </p>
            <div className="space-y-7">
              {workHistory.map((w, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <Briefcase className="size-5 text-blue-600 dark:text-blue-400" strokeWidth={1.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium leading-snug">{w.title}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
                      <span>{w.company}</span>
                      {w.location && (
                        <>
                          <span className="text-border">·</span>
                          <span>{w.location}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
                      <span>
                        {formatMonth(w.start_date)} – {w.end_date ? formatMonth(w.end_date) : "Present"}
                      </span>
                      <span className="text-border">·</span>
                      <span>{durationLabel(w.start_date, w.end_date)}</span>
                    </div>
                    {w.description && (
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                        {w.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h3 className="mb-4 font-semibold">Education</h3>
            <div className="space-y-4">
              {education.map((ed, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <GraduationCap className="size-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.2} />
                  </div>
                  <div>
                    <div className="font-medium leading-snug">
                      {ed.degree}{ed.field ? ` in ${ed.field}` : ""}
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {ed.school}
                      {ed.end_year ? ` · ${ed.end_year}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-6 lg:border-l lg:pl-6">
        {candidate.skills && candidate.skills.length > 0 && (
          <section>
            <h3 className="mb-4 font-semibold">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {candidate.notes && (
          <section>
            <h3 className="mb-4 font-semibold">Notes</h3>
            <p className="text-sm text-muted-foreground">{candidate.notes}</p>
          </section>
        )}
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

function ApplicationDetailPanel({ app, candidateName, onAvailabilitySent }: { app: ApplicationDetail; candidateName: string; onAvailabilitySent: () => void }) {
  const [subTab, setSubTab] = useState("interviews");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [requestAvailOpen, setRequestAvailOpen] = useState(false);
  const [pendingAvailability, setPendingAvailability] = useState(false);
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
          </TabsList>
        </div>

        <Card className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", subTab === "home" && "rounded-tl-none")}>
          <TabsContent value="interviews" className="mt-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-0.5">
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
                  pendingAvailability={pendingAvailability}
                />
              ))}
            </div>
          </TabsContent>

          {["home", "feedback"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0 flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </TabsContent>
          ))}
        </Card>
      </Tabs>

      <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto px-4 pt-[48px] pb-4">
        <NotesCard />
        <CommentsCard />
      </aside>

      <ScheduleInterviewDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        candidateName={candidateName}
        reqTitle={reqTitle}
      />

      <RequestAvailabilityDialog
        open={requestAvailOpen}
        onOpenChange={setRequestAvailOpen}
        candidateName={candidateName}
        candidateEmail={`${candidateName.toLowerCase().replace(/\s+/g, "")}@gmail.com`}
        reqTitle={reqTitle}
        companyName="ACME AI"
        senderName="Anne Montgomery"
        onSent={() => {
          setPendingAvailability(true);
          onAvailabilitySent();
        }}
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
  pendingAvailability,
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
  pendingAvailability: boolean;
}) {
  return (
    <div className="space-y-0.5">
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
                  {isCurrent && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button size="sm">Schedule</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={onSchedule}>Schedule</DropdownMenuItem>
                        <DropdownMenuItem onSelect={onRequestAvailability}>Request availability</DropdownMenuItem>
                        <DropdownMenuItem>Candidate self-schedule</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {isCurrent && pendingAvailability && (
                  <div className="flex items-start gap-2 px-2 py-2">
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
                              className="size-5 text-amber-600 dark:text-amber-400"
                            >
                              <Ellipsis className="size-3" />
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
                      <p className="text-sm text-muted-foreground">
                        Sent on {format(new Date(), "MMMM d, yyyy")}
                      </p>
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
                      <div className="pb-2 pl-2 pr-2">
                        <InterviewTimeline interviews={stage.req_interviews} />
                      </div>
                    )}
                    <div className="flex items-center gap-2 border-t border-border/60 px-2 py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Ellipsis className="size-3.5" />
                            More actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem>Add note</DropdownMenuItem>
                          <DropdownMenuItem>Add feedback</DropdownMenuItem>
                          <DropdownMenuItem>Reassign stage</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="flex-1" />
                      <Button variant="outline" size="sm">
                        <X className="size-3.5" />
                        Reject
                      </Button>
                      <Button variant="success" size="sm">
                        Move forward
                        <ArrowRight className="size-3.5" />
                      </Button>
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

const STATUS_BADGE_CLASSES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  hired: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  to_be_scheduled: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  pending_availability: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

function formatStatusLabel(status: string, date: string) {
  const formatted = format(new Date(date), "MMM d, yyyy");
  return status === "active"
    ? `Active since: ${formatted}`
    : `${STATUS_LABEL[status] ?? status} on: ${formatted}`;
}

function JobApplicationsTabContent({
  apps,
  preselectedAppId,
  candidateName,
  onRaSent,
}: {
  apps: ApplicationDetail[];
  preselectedAppId: string | null;
  candidateName: string;
  onRaSent: (evt: RaSentEvent) => void;
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

  const [schedulingStatus, setSchedulingStatus] = useState<Record<string, "to_be_scheduled" | "pending_availability">>({});

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
            {schedulingStatus[selectedApp.id] === "pending_availability"
              ? "Pending candidate availability"
              : "To be scheduled"}
          </Badge>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {selectedApp && (
          <ApplicationDetailPanel
            key={selectedApp.id}
            app={selectedApp}
            candidateName={candidateName}
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

function ActivitiesTabContent({ apps, raSentEvents }: { apps: ApplicationDetail[]; raSentEvents: RaSentEvent[] }) {
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

  const activities = useMemo(() => {
    if (apps.length === 0) return [];
    return ACTIVITY_SEEDS.map((seed) => {
      const app = apps[seed.appIndex % apps.length];
      return { ...seed, reqId: app.requisitions.id };
    });
  }, [apps]);

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
        />
        {reqOptions.length > 0 && (
          <MultiSelectFilter
            label="Req"
            options={reqOptions}
            selected={selectedReqs}
            onSelectedChange={setSelectedReqs}
            searchPlaceholder="Search reqs"
          />
        )}
      </div>

      {/* Reply composer above activity feed */}
      {replyingToId && (() => {
        const evt = raSentEvents.find((e) => e.id === replyingToId);
        if (!evt) return null;
        return (
          <div className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CornerUpLeft className="size-3.5" />
                <span>Replying to {evt.candidateName}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setReplyingToId(null)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="p-4">
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
              />
            </div>
            <div className="flex items-center border-t px-4 py-3">
              <SendSplitButton onSend={() => setReplyingToId(null)} />
            </div>
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
            <div key={i} className="flex gap-3 py-3">
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
  const formattedDate = format(event.sentAt, "MM/dd/yyyy h:mm a") + " PST";

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
          hovered && "bg-muted",
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
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
          className="px-3 pt-1"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
              <p className="text-sm font-semibold">Request availability</p>
              <p className="text-xs text-muted-foreground">
                To: {event.candidateName}
              </p>
            </div>
            {hovered && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReply();
                  }}
                >
                  <Reply className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ReplyAll className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Forward className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {expanded && (
          <div className="px-3 pb-3 pt-2">
            <div className="space-y-3 text-sm leading-relaxed">
              <p>Hi {event.candidateName},</p>
              <p>
                We&apos;re excited to move forward with your candidacy for the{" "}
                {event.reqTitle} at {event.companyName}! Please use the link below
                to share your availability for an interview.
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
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: Set<string>;
  onSelectedChange: (next: Set<string>) => void;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const total = options.length;
  const count = selected.size;
  const allSelected = total > 0 && count === total;
  const someSelected = count > 0 && !allSelected;

  const chipLabel = (() => {
    if (count === 0) return "None";
    if (allSelected) return "All";
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
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
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
