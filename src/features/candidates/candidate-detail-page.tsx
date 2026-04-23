import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { format, formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Send,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
  const [searchParams] = useSearchParams();
  const preselectedAppId = searchParams.get("app");
  const preselectedTab = searchParams.get("tab");

  const {
    data: candidate,
    isLoading,
    error,
  } = useCandidateDetail(candidateId!);

  useSetPageTitle(
    candidate ? `${candidate.first_name} ${candidate.last_name}` : null,
  );

  const apps = candidate?.applications ?? [];
  const defaultTab =
    preselectedTab === "activities"
      ? "activities"
      : preselectedTab === "applications" ||
          (preselectedAppId && apps.some((a) => a.id === preselectedAppId))
        ? "applications"
        : "profile";
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    setActiveTab(undefined);
  }, [candidateId]);

  const tabsValue = activeTab ?? defaultTab;

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
          <TabsTrigger value="activities">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTabContent candidate={candidate} />
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          <JobApplicationsTabContent
            apps={apps}
            preselectedAppId={preselectedAppId}
          />
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

function ApplicationDetailPanel({ app }: { app: ApplicationDetail }) {
  const [subTab, setSubTab] = useState("application");
  const allStages = app.requisitions?.req_stages ?? [];

  const pipeline = useMemo(() => {
    const grouped = new Map<Milestone, ReqStageWithInterviews[]>();
    for (const ms of MILESTONE_ORDER) grouped.set(ms, []);
    for (const stage of allStages) grouped.get(stage.milestone)?.push(stage);
    for (const [, arr] of grouped) arr.sort((a, b) => a.sort_order - b.sort_order);
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
  const selectedStage = allStages.find((s) => s.id === selectedStageId);

  return (
    <Tabs
      value={subTab}
      onValueChange={setSubTab}
      className="flex flex-1 flex-col overflow-hidden"
    >
      <div className="flex items-center gap-6 px-5 pt-5">
        <TabsList className="h-[34px]">
          <TabsTrigger value="application" className="text-xs">
            Application
          </TabsTrigger>
          <TabsTrigger value="interviews" className="text-xs">
            Interview stages
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">
            Documents
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs">
            All feedback
          </TabsTrigger>
          <TabsTrigger value="messages" className="text-xs">
            Messages
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">
            Activity
          </TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm">
          View application
        </Button>
      </div>

      <TabsContent
        value="application"
        className="mt-0 flex flex-1 overflow-hidden rounded-xl"
      >
        <div className="w-60 shrink-0 space-y-1 overflow-y-auto border-r p-4">
          {MILESTONE_ORDER.map((ms, msIdx) => {
            const stages = pipeline.get(ms) ?? [];
            return (
              <div key={ms}>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground/70">
                  Milestone {msIdx + 1}: {MILESTONE_LABELS[ms]}
                </div>
                {stages.length > 0
                  ? stages.map((stage) => {
                      const status = getStageStatus(
                        ms,
                        stage.id,
                        app.current_milestone,
                        app.current_stage_id,
                        allStages,
                      );
                      const isSelected = stage.id === selectedStageId;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => setSelectedStageId(stage.id)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                            isSelected
                              ? "bg-card shadow-sm"
                              : "hover:bg-card/50",
                            status === "upcoming" && "text-muted-foreground",
                          )}
                        >
                          <StageIcon status={status} />
                          <span className="truncate">{stage.name}</span>
                        </button>
                      );
                    })
                  : (
                    <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground/40">
                      <StageIcon status="upcoming" />
                      <span>{MILESTONE_LABELS[ms]}</span>
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {selectedStage ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  {selectedStage.name}
                </h3>
                <Button size="sm">Schedule</Button>
              </div>
              {selectedStage.req_interviews.length > 0 ? (
                <InterviewTimeline
                  interviews={selectedStage.req_interviews}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No interviews configured for this stage
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a stage to view details
            </p>
          )}
        </div>
      </TabsContent>

      {["interviews", "documents", "feedback", "messages", "activity"].map(
        (tab) => (
          <TabsContent
            key={tab}
            value={tab}
            className="mt-0 flex flex-1 items-center justify-center"
          >
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </TabsContent>
        ),
      )}
    </Tabs>
  );
}

function JobApplicationsTabContent({
  apps,
  preselectedAppId,
}: {
  apps: ApplicationDetail[];
  preselectedAppId: string | null;
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
    <div className="flex min-h-[480px] overflow-hidden rounded-xl border shadow-sm">
      <nav className="flex w-80 shrink-0 flex-col gap-1 border-r bg-muted/50 p-4">
        {apps.map((app) => {
          const isActive = app.id === selectedApp?.id;
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => setSelectedAppId(app.id)}
              className={cn(
                "flex flex-col gap-1.5 rounded-lg p-2 text-left transition-colors",
                isActive
                  ? "bg-card shadow-sm"
                  : "hover:bg-card/60",
              )}
            >
              <span className="truncate text-sm leading-snug">
                {formatReqTitle(
                  app.requisitions.req_number,
                  app.requisitions.title,
                )}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "w-fit border-0 text-[11px]",
                  app.status === "active"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : app.status === "rejected"
                      ? "bg-red-500/10 text-red-700 dark:text-red-400"
                      : app.status === "hired"
                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        : "bg-muted text-muted-foreground",
                )}
              >
                {app.status === "active"
                  ? `Active since: ${format(new Date(app.applied_date), "MMM d, yyyy")}`
                  : `${STATUS_LABEL[app.status] ?? app.status} on: ${format(new Date(app.applied_date), "MMM d, yyyy")}`}
              </Badge>
            </button>
          );
        })}
      </nav>

      <div className="flex flex-1 flex-col overflow-hidden bg-card">
        {selectedApp && (
          <ApplicationDetailPanel key={selectedApp.id} app={selectedApp} />
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
