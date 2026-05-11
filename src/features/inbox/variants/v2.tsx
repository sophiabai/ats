import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  ListFilter,
  Mail,
  MessageSquare,
  Search,
  Send,
  Undo2,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn, formatReqTitle } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { supabase } from "@/lib/supabase";
import { useInboxDetailStore } from "@/stores/inbox-detail-store";
import { MILESTONE_ORDER } from "@/features/candidates/components/application-tab-content";
import type {
  Application,
  ApplicationInterview,
  Candidate,
  CriteriaEvaluation,
  Email,
  Milestone,
  ReqStage,
  Requisition,
  StageDecision,
} from "@/types/database";

type InboxView = "candidate" | "agent";

type EmailPreview = Pick<
  Email,
  "id" | "direction" | "created_at" | "subject" | "body"
>;

interface ApplicationRow extends Application {
  candidates: Candidate & {
    criteria_evaluations: Pick<
      CriteriaEvaluation,
      "req_id" | "criterion" | "met"
    >[];
  };
  requisitions: Pick<Requisition, "id" | "title" | "req_number"> & {
    req_stages: ReqStage[];
  };
  application_interviews: ApplicationInterview[];
  stage_decisions: StageDecision[];
  emails: EmailPreview[];
}

function useStageBoard() {
  return useQuery({
    queryKey: ["inbox-stage-board"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `*,
          candidates(*, criteria_evaluations(req_id, criterion, met)),
          requisitions(id, title, req_number, req_stages(*)),
          application_interviews(*),
          stage_decisions(*),
          emails(id, direction, created_at, subject, body)`,
        )
        .eq("status", "active")
        .order("applied_date", { ascending: false });

      if (error) throw error;
      return data as unknown as ApplicationRow[];
    },
  });
}

type CardStatus =
  | "decision-needed"
  | "to-be-scheduled"
  | "new-message"
  | "top-match"
  | "worth-review"
  | "new-application"
  | "offer-extended"
  | "offer-accepted";

const STATUS_CONFIG: Record<CardStatus, { label: string; className: string }> = {
  "decision-needed": {
    label: "Decision needed",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  "to-be-scheduled": {
    label: "To be scheduled",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  "new-message": {
    label: "New message",
    className: "bg-berry-100 text-berry-700 dark:bg-berry-800 dark:text-berry-200",
  },
  "top-match": {
    label: "Top match",
    className: "bg-berry-600 text-white",
  },
  "worth-review": {
    label: "Worth review",
    className:
      "bg-berry-100 text-berry-700 dark:bg-berry-800 dark:text-berry-200",
  },
  "new-application": {
    label: "New application",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  "offer-extended": {
    label: "Offer extended",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  "offer-accepted": {
    label: "Offer accepted",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
};

const STATUS_RANK: Record<CardStatus, number> = {
  "top-match": 0,
  "worth-review": 1,
  "new-application": 2,
  "decision-needed": 3,
  "to-be-scheduled": 4,
  "new-message": 5,
  "offer-extended": 6,
  "offer-accepted": 7,
};

const SEVEN_DAYS_MS = 1000 * 60 * 60 * 24 * 7;

function getRecentInbound(app: ApplicationRow): EmailPreview | null {
  const recent = app.emails
    .filter(
      (e) =>
        e.direction === "inbound" &&
        Date.now() - new Date(e.created_at).getTime() < SEVEN_DAYS_MS,
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  return recent[0] ?? null;
}

function getConsideration(
  app: ApplicationRow,
): "top-match" | "worth-review" | null {
  const evaluations =
    app.candidates?.criteria_evaluations?.filter(
      (e) => e.req_id === app.req_id,
    ) ?? [];
  if (evaluations.length === 0) return null;

  const metRatio =
    evaluations.filter((e) => e.met).length / evaluations.length;
  if (metRatio >= 0.5) return metRatio >= 0.8 ? "top-match" : "worth-review";
  return "top-match";
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const SYNTHETIC_MESSAGES: { subject: string; preview: string }[] = [
  {
    subject: "Re: Interview details",
    preview:
      "Thanks for sending over the schedule! I had a quick question about the format — should I prepare anything specific?",
  },
  {
    subject: "Re: Phone screen follow-up",
    preview:
      "I really enjoyed our conversation yesterday. I'm excited about the role and would love to move forward.",
  },
  {
    subject: "Availability for next week",
    preview:
      "I'm free Monday through Wednesday next week, any time after 10am PT works for me.",
  },
  {
    subject: "Re: Next steps",
    preview:
      "Just wanted to confirm I received everything. Looking forward to the on-site!",
  },
  {
    subject: "Question about the role",
    preview:
      "Had a chance to review the job description in more detail — the scope is exactly what I've been looking for.",
  },
];

function getMessagePreview(
  app: ApplicationRow,
): { subject: string; body: string } | null {
  const real = getRecentInbound(app);
  if (real) return { subject: real.subject, body: real.body };
  const fallback = SYNTHETIC_MESSAGES[hashId(app.id) % SYNTHETIC_MESSAGES.length];
  return { subject: fallback.subject, body: fallback.preview };
}

function deriveStatus(app: ApplicationRow): CardStatus | null {
  const stageInterviews = app.application_interviews.filter(
    (i) => i.stage_id === app.current_stage_id,
  );
  const stageDecision = app.stage_decisions.find(
    (d) => d.stage_id === app.current_stage_id,
  );

  // Hard signals tied to terminal milestones.
  if (app.current_milestone === "offer_accepted") return "offer-accepted";
  if (app.current_milestone === "offer") return "offer-extended";

  // Real data signals (only fire when seed/user data supports them).
  if (
    stageInterviews.length > 0 &&
    stageInterviews.every((i) => i.status === "completed") &&
    (!stageDecision ||
      stageDecision.decision === "pending" ||
      stageDecision.decision === "hold")
  ) {
    return "decision-needed";
  }

  if (
    stageInterviews.some(
      (i) =>
        i.status === "pending" ||
        (!i.scheduled_at && i.status !== "cancelled"),
    )
  ) {
    return "to-be-scheduled";
  }

  if (getRecentInbound(app)) return "new-message";

  // Application stage: prefer the real consideration from criteria_evaluations,
  // otherwise fall back to a deterministic label for prototype variety.
  if (app.current_milestone === "application") {
    const consideration = getConsideration(app);
    if (consideration) return consideration;
    const APPLICATION_FALLBACKS: CardStatus[] = [
      "top-match",
      "top-match",
      "worth-review",
      "new-application",
    ];
    return APPLICATION_FALLBACKS[hashId(app.id) % APPLICATION_FALLBACKS.length];
  }

  // Mid-pipeline stages: deterministic fallback so every card gets a badge,
  // matching v1's visual variety even before real interviews/decisions exist.
  if (
    app.current_milestone === "screen" ||
    app.current_milestone === "final_interview"
  ) {
    const MID_FALLBACKS: CardStatus[] = [
      "to-be-scheduled",
      "decision-needed",
      "new-message",
    ];
    return MID_FALLBACKS[hashId(app.id) % MID_FALLBACKS.length];
  }

  return null;
}

interface StageColumnDef {
  key: string;
  name: string;
  milestone: Milestone;
}

interface ReqGroup {
  reqId: string;
  reqNumber: number;
  reqTitle: string;
  total: number;
  columns: { def: StageColumnDef; applications: ApplicationRow[] }[];
}

/**
 * Derive the canonical column order (stage names) from every stage seen across
 * the loaded applications. Identical names across requisitions merge into one
 * column so headers stay aligned across all requisition groups (Jira-style).
 */
function buildColumnOrder(applications: ApplicationRow[]): StageColumnDef[] {
  const byName = new Map<
    string,
    { name: string; milestone: Milestone; sortOrder: number }
  >();

  for (const app of applications) {
    for (const stage of app.requisitions?.req_stages ?? []) {
      const existing = byName.get(stage.name);
      if (existing) {
        existing.sortOrder = Math.min(existing.sortOrder, stage.sort_order);
      } else {
        byName.set(stage.name, {
          name: stage.name,
          milestone: stage.milestone,
          sortOrder: stage.sort_order,
        });
      }
    }
  }

  return Array.from(byName.values())
    .sort((a, b) => {
      const ai = MILESTONE_ORDER.indexOf(a.milestone);
      const bi = MILESTONE_ORDER.indexOf(b.milestone);
      if (ai !== bi) return ai - bi;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name);
    })
    .map((col) => ({
      key: `${col.milestone}:${col.name}`,
      name: col.name,
      milestone: col.milestone,
    }));
}

function buildReqGroups(
  applications: ApplicationRow[],
  columnOrder: StageColumnDef[],
): ReqGroup[] {
  const groups = new Map<string, ReqGroup>();

  for (const app of applications) {
    const req = app.requisitions;
    if (!req) continue;

    let group = groups.get(req.id);
    if (!group) {
      group = {
        reqId: req.id,
        reqNumber: req.req_number,
        reqTitle: req.title,
        total: 0,
        columns: columnOrder.map((def) => ({ def, applications: [] })),
      };
      groups.set(req.id, group);
    }

    const stage = req.req_stages?.find((s) => s.id === app.current_stage_id);
    if (!stage) continue;

    const col = group.columns.find((c) => c.def.name === stage.name);
    if (!col) continue;

    col.applications.push(app);
    group.total += 1;
  }

  const result = Array.from(groups.values()).sort(
    (a, b) => a.reqNumber - b.reqNumber,
  );

  for (const group of result) {
    for (const col of group.columns) {
      col.applications.sort((a, b) => {
        const sa = deriveStatus(a);
        const sb = deriveStatus(b);
        const ra = sa ? (STATUS_RANK[sa] ?? 99) : 99;
        const rb = sb ? (STATUS_RANK[sb] ?? 99) : 99;
        return ra - rb;
      });
    }
  }

  return result;
}

function formatApplied(date: string | null) {
  if (!date) return "";
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const day = 1000 * 60 * 60 * 24;
  const days = Math.floor(diffMs / day);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface Activity {
  id: string;
  agent: string;
  icon: typeof Bot;
  action: string;
  detail: string;
  time: string;
  undoable?: boolean;
  candidateId?: string;
  candidateName?: string;
  role?: string;
}

const AGENT_ACTIVITIES: Activity[] = [
  {
    id: "1",
    agent: "Outreach",
    icon: Send,
    action: "Drafted cold email",
    detail: "Senior Frontend Engineer pipeline",
    time: "12 min ago",
    candidateId: "c0000000-0000-0000-0000-000000000001",
    candidateName: "Emily Zhang",
    role: "Senior Software Engineer",
  },
  {
    id: "2",
    agent: "Triage",
    icon: Mail,
    action: "Flagged urgent message",
    detail: "Candidate replies needing same-day response",
    time: "28 min ago",
    undoable: true,
    candidateId: "c0000000-0000-0000-0000-000000000003",
    candidateName: "Liam O'Brien",
    role: "Frontend Engineer",
  },
  {
    id: "3",
    agent: "Scheduling",
    icon: Calendar,
    action: "Sent calendar invite",
    detail: "Phone screens for Data Scientist role",
    time: "1 hour ago",
    candidateId: "c0000000-0000-0000-0000-000000000002",
    candidateName: "Alex Rivera",
    role: "Data Engineer",
  },
  {
    id: "4",
    agent: "Applicant review",
    icon: FileText,
    action: "Reviewed application",
    detail: "Recommended for phone screen",
    time: "2 hours ago",
    candidateId: "c0000000-0000-0000-0000-000000000005",
    candidateName: "Jordan Kim",
    role: "Software Engineer",
  },
  {
    id: "5",
    agent: "Follow-ups",
    icon: MessageSquare,
    action: "Drafted follow-up email",
    detail: "No reply after 3+ days",
    time: "3 hours ago",
    candidateId: "c0000000-0000-0000-0000-000000000004",
    candidateName: "Nina Patel",
    role: "Senior Frontend Engineer",
  },
  {
    id: "6",
    agent: "Candidate lookup",
    icon: Search,
    action: "Enriched profile",
    detail: "Cross-referenced WAAS, Ashby, and Gmail",
    time: "4 hours ago",
    candidateId: "c0000000-0000-0000-0000-000000000010",
    candidateName: "Marcus Johnson",
    role: "Account Executive",
  },
  {
    id: "7",
    agent: "Rejections",
    icon: CheckCircle2,
    action: "Drafted rejection email",
    detail: "Calibrated to phone-screen stage",
    time: "5 hours ago",
    candidateId: "c0000000-0000-0000-0000-000000000009",
    candidateName: "Mei-Lin Wu",
    role: "Frontend Engineer",
  },
];

function ApplicationCard({
  app,
  selected,
  onSelect,
}: {
  app: ApplicationRow;
  selected: boolean;
  onSelect: () => void;
}) {
  const c = app.candidates;
  const status = deriveStatus(app);
  const message = status === "new-message" ? getMessagePreview(app) : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-2 rounded-lg bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md",
        selected && "shadow-md ring-1 ring-berry-600",
      )}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">
          {c.first_name} {c.last_name}
        </div>
        {(c.current_title || c.current_company) && (
          <div className="truncate text-xs text-muted-foreground">
            {c.current_title && c.current_company
              ? `${c.current_title} at ${c.current_company}`
              : c.current_title || c.current_company}
          </div>
        )}
      </div>
      {message && (
        <div className="flex flex-col gap-0.5">
          <span className="truncate text-xs font-medium">
            {message.subject}
          </span>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {message.body}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between">
        {status ? (
          <Badge
            variant="secondary"
            className={cn(
              "px-1.5 py-0 text-[11px]",
              STATUS_CONFIG[status].className,
            )}
          >
            {STATUS_CONFIG[status].label}
          </Badge>
        ) : (
          <span />
        )}
        <span className="text-[11px] text-muted-foreground">
          {formatApplied(app.applied_date)}
        </span>
      </div>
    </button>
  );
}

function ReqGroupSection({
  group,
  selectedAppId,
  onSelectApp,
}: {
  group: ReqGroup;
  selectedAppId: string | null;
  onSelectApp: (candidateId: string, appId: string, initialTab?: string) => void;
}) {
  const reqTitle = formatReqTitle(group.reqNumber, group.reqTitle);

  return (
    <Collapsible defaultOpen className="group/req">
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left hover:bg-muted/50">
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=closed]/req:-rotate-90" />
        <Link
          to={`/requisitions/${group.reqId}`}
          target="_blank"
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-medium hover:underline"
        >
          {reqTitle}
        </Link>
        <span className="text-sm font-medium text-muted-foreground">
          ({group.total} {group.total === 1 ? "candidate" : "candidates"})
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="-mr-17 flex gap-2 overflow-x-auto pr-17">
          {group.columns.map((col) => (
            <div
              key={col.def.key}
              className="flex w-[220px] shrink-0 flex-col gap-2 rounded-xl bg-muted p-2"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {col.def.name}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-white px-1.5 py-0 text-[11px] dark:bg-stone-900"
                >
                  {col.applications.length}
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                {col.applications.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground/60">
                    —
                  </div>
                ) : (
                  col.applications.map((app) => {
                    const initialTab =
                      deriveStatus(app) === "new-message"
                        ? "messages"
                        : undefined;
                    return (
                      <ApplicationCard
                        key={app.id}
                        app={app}
                        selected={app.id === selectedAppId}
                        onSelect={() =>
                          onSelectApp(app.candidates.id, app.id, initialTab)
                        }
                      />
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ReqGroupSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, gi) => (
        <div key={gi} className="space-y-2">
          <Skeleton className="h-5 w-64" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, ci) => (
              <div
                key={ci}
                className="flex w-[220px] shrink-0 flex-col gap-2 rounded-xl bg-muted p-2"
              >
                <Skeleton className="mx-3 my-1.5 h-3 w-20" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchableFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 gap-1.5 text-xs",
            value && "bg-muted",
          )}
        >
          <ListFilter className="size-3" />
          {value ?? label}
          {value && (
            <span
              role="button"
              className="ml-0.5 rounded-sm hover:bg-muted-foreground/20"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              <X className="size-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => {
                    onChange(value === opt ? null : opt);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-3.5",
                      value === opt ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const TIME_OPTIONS = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

function AgentActivityFilters({
  activities,
  filters,
  onFiltersChange,
}: {
  activities: Activity[];
  filters: {
    candidate: string | null;
    activityType: string | null;
    jobReq: string | null;
    time: string | null;
  };
  onFiltersChange: (f: typeof filters) => void;
}) {
  const candidates = useMemo(
    () => [...new Set(activities.map((a) => a.candidateName).filter(Boolean) as string[])].sort(),
    [activities],
  );
  const activityTypes = useMemo(
    () => [...new Set(activities.map((a) => a.agent))].sort(),
    [activities],
  );
  const jobReqs = useMemo(
    () => [...new Set(activities.map((a) => a.role).filter(Boolean) as string[])].sort(),
    [activities],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchableFilter
        label="Candidate"
        options={candidates}
        value={filters.candidate}
        onChange={(v) => onFiltersChange({ ...filters, candidate: v })}
      />
      <SearchableFilter
        label="Activity type"
        options={activityTypes}
        value={filters.activityType}
        onChange={(v) => onFiltersChange({ ...filters, activityType: v })}
      />
      <SearchableFilter
        label="Job req"
        options={jobReqs}
        value={filters.jobReq}
        onChange={(v) => onFiltersChange({ ...filters, jobReq: v })}
      />
      <Select
        value={filters.time ?? "all"}
        onValueChange={(v) =>
          onFiltersChange({ ...filters, time: v === "all" ? null : v })
        }
      >
        <SelectTrigger className="h-7 w-auto gap-1.5 text-xs">
          <Calendar className="size-3" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIME_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function filterActivities(
  activities: Activity[],
  filters: {
    candidate: string | null;
    activityType: string | null;
    jobReq: string | null;
    time: string | null;
  },
) {
  return activities.filter((a) => {
    if (filters.candidate && a.candidateName !== filters.candidate) return false;
    if (filters.activityType && a.agent !== filters.activityType) return false;
    if (filters.jobReq && a.role !== filters.jobReq) return false;
    return true;
  });
}

export function InboxV2() {
  const [view, setView] = useState<InboxView>("candidate");
  const [activityFilters, setActivityFilters] = useState({
    candidate: null as string | null,
    activityType: null as string | null,
    jobReq: null as string | null,
    time: null as string | null,
  });
  const { appId: selectedAppId, toggle: toggleDetail, close: closeDetail } =
    useInboxDetailStore();
  const { data: applications, isLoading } = useStageBoard();

  useEffect(() => () => closeDetail(), [closeDetail]);

  const columnOrder = useMemo(
    () => buildColumnOrder(applications ?? []),
    [applications],
  );
  const reqGroups = useMemo(
    () => buildReqGroups(applications ?? [], columnOrder),
    [applications, columnOrder],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <div className="flex items-center rounded-lg border bg-card p-0.5">
          <Toggle
            pressed={view === "candidate"}
            onPressedChange={() => setView("candidate")}
            size="sm"
            className="rounded-md data-[state=on]:bg-muted"
          >
            <User className="size-4" />
            <span className="sr-only">Candidate view</span>
          </Toggle>
          <Toggle
            pressed={view === "agent"}
            onPressedChange={() => setView("agent")}
            size="sm"
            className="rounded-md data-[state=on]:bg-muted"
          >
            <Bot className="size-4" />
            <span className="sr-only">Agent view</span>
          </Toggle>
        </div>
      </div>

      {view === "candidate" && (
        <div className="space-y-6">
          {isLoading ? (
            <ReqGroupSkeleton />
          ) : reqGroups.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No active applications.
            </div>
          ) : (
            reqGroups.map((group) => (
              <ReqGroupSection
                key={group.reqId}
                group={group}
                selectedAppId={selectedAppId}
                onSelectApp={toggleDetail}
              />
            ))
          )}
        </div>
      )}

      {view === "agent" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="size-4 text-muted-foreground" />
                  Agent activity
                </CardTitle>
                <CardDescription>
                  Recent actions taken by your agents
                </CardDescription>
              </div>
            </div>
            <AgentActivityFilters
              activities={AGENT_ACTIVITIES}
              filters={activityFilters}
              onFiltersChange={setActivityFilters}
            />
          </CardHeader>
          <CardContent>
            {(() => {
              const filtered = filterActivities(AGENT_ACTIVITIES, activityFilters);
              if (filtered.length === 0) {
                return (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No activities match the current filters.
                  </p>
                );
              }
              return (
                <div className="space-y-0">
                  {filtered.map((activity, i) => (
                    <div
                      key={activity.id}
                      className={cn("group/activity flex gap-3 py-3")}
                    >
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
                          <span className="text-sm font-medium">
                            {activity.agent}
                          </span>
                          <div className="flex items-center gap-2">
                            {activity.undoable && (
                              <Button
                                variant="ghost"
                                size="xs"
                                className="gap-1 text-muted-foreground opacity-0 transition-opacity group-hover/activity:opacity-100"
                              >
                                <Undo2 className="size-3" />
                                Undo
                              </Button>
                            )}
                            {activity.candidateId && (
                              <Button
                                asChild
                                variant="ghost"
                                size="xs"
                                className="gap-1 text-muted-foreground opacity-0 transition-opacity group-hover/activity:opacity-100"
                              >
                                <Link
                                  to={`/candidates/${activity.candidateId}?tab=activities`}
                                  target="_blank"
                                >
                                  View details
                                </Link>
                              </Button>
                            )}
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {activity.time}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {activity.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
