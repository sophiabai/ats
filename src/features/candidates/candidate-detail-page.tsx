import { useCallback, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { format, formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  FileText,
  GraduationCap,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Search,
  Send,
  SendHorizontal,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ScheduleInterviewDialog } from "@/features/candidates/components/schedule-interview-dialog";
import { useSetPageTitle } from "@/stores/page-title-store";
import type { Milestone } from "@/types/database";

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

export function Component() {
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

  const tabsValue = VALID_TABS.includes(tabParam ?? "")
    ? tabParam!
    : preselectedAppId && apps.some((a) => a.id === preselectedAppId)
      ? "applications"
      : "profile";

  const setActiveTab = useCallback(
    (tab: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (tab === "profile") {
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
          {candidate.last_activity_action && (
            <p
              className={
                candidate.current_company
                  ? "mt-1 text-sm text-muted-foreground"
                  : "mt-1.5 text-sm text-muted-foreground"
              }
            >
              {candidate.last_activity_action}
              {candidate.last_activity_at &&
                ` · ${formatDistanceToNow(new Date(candidate.last_activity_at), { addSuffix: true })}`}
            </p>
          )}
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
          <ActivitiesTabContent />
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
            <h3 className="mb-4 font-semibold">Experience</h3>
            <div className="space-y-7">
              {workHistory.map((w, i) => (
                <div key={i}>
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
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground/70">
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
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <GraduationCap className="size-5 text-muted-foreground" />
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
        <section>
          <h3 className="mb-4 font-semibold">Contact</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-3.5 shrink-0" />
                {candidate.phone}
              </div>
            )}
            {candidate.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {candidate.location}
              </div>
            )}
          </div>
        </section>

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

function ApplicationDetailPanel({ app, candidateName }: { app: ApplicationDetail; candidateName: string }) {
  const [subTab, setSubTab] = useState("interviews");
  const [scheduleOpen, setScheduleOpen] = useState(false);
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
    <div className="flex flex-1 gap-4 overflow-hidden">
      <Tabs
        value={subTab}
        onValueChange={setSubTab}
        className="flex min-w-0 flex-1 flex-col overflow-hidden"
      >
        <div className="px-4 pt-4">
          <TabsList className="h-8 text-xs">
            <TabsTrigger value="home"><Home className="size-3.5" /> Home</TabsTrigger>
            <TabsTrigger value="interviews"><Calendar className="size-3.5" /> Interview stages</TabsTrigger>
            <TabsTrigger value="progress"><TrendingUp className="size-3.5" /> Progress</TabsTrigger>
            <TabsTrigger value="people"><Users className="size-3.5" /> People</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="interviews" className="mt-0 flex-1 overflow-y-auto p-4">
          <Card className="space-y-2 p-4">
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
              />
            ))}
          </Card>
        </TabsContent>

        {["home", "progress", "people"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0 flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </TabsContent>
        ))}
      </Tabs>

      <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto px-4 pt-[74px] pb-4">
        <NotesCard />
        <CommentsCard />
      </aside>

      <ScheduleInterviewDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        candidateName={candidateName}
        reqTitle={reqTitle}
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
}: {
  milestone: Milestone;
  index: number;
  stages: ReqStageWithInterviews[];
  app: ApplicationDetail;
  allStages: ReqStageWithInterviews[];
  selectedStageId: string | null;
  onSelectStage: (id: string | null) => void;
  onSchedule: () => void;
}) {
  return (
    <div>
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
            const isSelected = stage.id === selectedStageId;
            return (
              <div key={stage.id}>
                <button
                  type="button"
                  onClick={() => onSelectStage(isSelected ? null : stage.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm",
                    !isSelected && "hover:bg-muted/50",
                    status === "upcoming" && "text-muted-foreground",
                  )}
                >
                  <StageIcon status={status} />
                  <span className="flex-1 truncate text-left font-semibold">
                    {stage.name}
                  </span>
                  {isSelected && status === "current" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button size="sm">Schedule</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={onSchedule}>Schedule</DropdownMenuItem>
                        <DropdownMenuItem>Request availability</DropdownMenuItem>
                        <DropdownMenuItem>Candidate self-schedule</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </button>
                {isSelected && stage.req_interviews.length > 0 && (
                  <div className="ml-6 pl-2">
                    <InterviewTimeline interviews={stage.req_interviews} />
                  </div>
                )}
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
}: {
  apps: ApplicationDetail[];
  preselectedAppId: string | null;
  candidateName: string;
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

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
        <Briefcase className="size-8" />
        <p className="text-sm">No job applications yet</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[480px] overflow-hidden bg-muted rounded-xl">
      <nav className="flex w-80 shrink-0 flex-col gap-1 p-4">
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => setSelectedAppId(app.id)}
            className={cn(
              "flex flex-col gap-1.5 rounded-lg p-2 text-left",
              app.id === selectedApp?.id
                ? "bg-card shadow-sm"
                : "hover:bg-card/60",
            )}
          >
            <span className="truncate text-sm">
              {formatReqTitle(app.requisitions.req_number, app.requisitions.title)}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "w-fit border-0 text-[11px]",
                STATUS_BADGE_CLASSES[app.status] ?? "bg-muted text-muted-foreground",
              )}
            >
              {formatStatusLabel(app.status, app.applied_date)}
            </Badge>
          </button>
        ))}
      </nav>

      <div className="flex flex-1 flex-col overflow-hidden">
        {selectedApp && (
          <ApplicationDetailPanel key={selectedApp.id} app={selectedApp} candidateName={candidateName} />
        )}
      </div>
    </div>
  );
}

const CANDIDATE_ACTIVITIES = [
  {
    icon: Send,
    action: "Outreach email sent",
    detail: "Personalized cold email drafted by Outreach agent",
    time: "2 hours ago",
  },
  {
    icon: MessageSquare,
    action: "Candidate replied",
    detail: "Expressed interest in the role, asked about team size",
    time: "1 day ago",
  },
  {
    icon: Calendar,
    action: "Phone screen scheduled",
    detail: "Thursday, May 15 at 2:00 PM with Leslie Alexander",
    time: "1 day ago",
  },
  {
    icon: Search,
    action: "Profile enriched",
    detail: "Cross-referenced WAAS, Ashby, and Gmail by Candidate lookup agent",
    time: "2 days ago",
  },
  {
    icon: FileText,
    action: "Application reviewed",
    detail: "Recommended for phone screen by Applicant review agent",
    time: "3 days ago",
  },
  {
    icon: UserCheck,
    action: "Application received",
    detail: "Applied via LinkedIn for Senior Frontend Engineer",
    time: "3 days ago",
  },
  {
    icon: CheckCircle2,
    action: "Added to candidate pool",
    detail: "Sourced from LinkedIn by recruiter",
    time: "5 days ago",
  },
];

function ActivitiesTabContent() {
  return (
    <div className="max-w-2xl space-y-0">
      {CANDIDATE_ACTIVITIES.map((activity, i) => (
        <div key={i} className="flex gap-3 py-3">
          <div className="relative flex flex-col items-center">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <activity.icon className="size-3.5 text-muted-foreground" />
            </div>
            {i < CANDIDATE_ACTIVITIES.length - 1 && (
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
          </div>
        </div>
      ))}
    </div>
  );
}
