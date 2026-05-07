import { Link } from "react-router";
import { useState } from "react";
import {
  Bot,
  Calendar,
  CheckCircle2,
  FileText,
  Gavel,
  Mail,
  MessageSquare,
  Search,
  Send,
  Undo2,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { useChatBarStore } from "@/stores/chat-bar-store";
import { useChatStore } from "@/features/chat/stores/chat-store";
import type { ScheduleMetadata } from "@/types";

type InboxView = "candidate" | "agent";

interface ActionItem {
  id: string;
  candidateId: string;
  candidate: string;
  initials: string;
  avatar?: string;
  role: string;
  type: "schedule" | "decision";
  detail: string;
  urgent?: boolean;
}

const ACTION_ITEMS: ActionItem[] = [
  {
    id: "1",
    candidateId: "c0000000-0000-0000-0000-000000000015",
    candidate: "Priya Sharma",
    initials: "PS",
    role: "Senior Product Designer",
    type: "schedule",
    detail: "On-site interview — no slots confirmed",
    urgent: true,
  },
  {
    id: "2",
    candidateId: "c0000000-0000-0000-0000-000000000010",
    candidate: "Marcus Johnson",
    initials: "MJ",
    role: "Account Executive, Enterprise",
    type: "decision",
    detail: "Final round complete — awaiting hiring decision",
    urgent: true,
  },
  {
    id: "3",
    candidateId: "c0000000-0000-0000-0000-000000000017",
    candidate: "Olivia Hart",
    initials: "OH",
    role: "Product Designer",
    type: "schedule",
    detail: "Phone screen — interviewer has conflicts",
  },
  {
    id: "4",
    candidateId: "c0000000-0000-0000-0000-000000000004",
    candidate: "Nina Patel",
    initials: "NP",
    role: "Senior Frontend Engineer",
    type: "decision",
    detail: "Panel debrief scheduled for tomorrow",
  },
  {
    id: "5",
    candidateId: "c0000000-0000-0000-0000-000000000002",
    candidate: "Alex Rivera",
    initials: "AR",
    role: "Data Engineer",
    type: "schedule",
    detail: "Technical interview — candidate requested reschedule",
  },
];

type Consideration = "top-match" | "worth-review" | "skipped";

const CONSIDERATION_CONFIG: Record<
  Consideration,
  { label: string; className: string }
> = {
  "top-match": {
    label: "Top match",
    className: "bg-berry-600 text-white",
  },
  "worth-review": {
    label: "Worth review",
    className: "bg-berry-100 text-berry-700 dark:bg-berry-800 dark:text-berry-200",
  },
  skipped: {
    label: "Skipped",
    className: "bg-muted text-muted-foreground",
  },
};

interface Applicant {
  id: string;
  candidateId: string;
  name: string;
  initials: string;
  role: string;
  applied: string;
  source: string;
  consideration: Consideration;
}

const NEW_APPLICANTS: Applicant[] = [
  {
    id: "1",
    candidateId: "c0000000-0000-0000-0000-000000000005",
    name: "Jordan Kim",
    initials: "JK",
    role: "Senior Frontend Engineer",
    applied: "2 hours ago",
    source: "LinkedIn",
    consideration: "top-match",
  },
  {
    id: "2",
    candidateId: "c0000000-0000-0000-0000-000000000018",
    name: "Sam Adeyemi",
    initials: "SA",
    role: "Product Designer",
    applied: "4 hours ago",
    source: "Referral",
    consideration: "top-match",
  },
  {
    id: "3",
    candidateId: "c0000000-0000-0000-0000-000000000020",
    name: "Sophie Chen",
    initials: "SC",
    role: "Marketing Manager",
    applied: "6 hours ago",
    source: "Careers page",
    consideration: "worth-review",
  },
  {
    id: "4",
    candidateId: "c0000000-0000-0000-0000-000000000023",
    name: "Ryan O'Connor",
    initials: "RO",
    role: "Content Marketer",
    applied: "Yesterday",
    source: "Indeed",
    consideration: "skipped",
  },
];

interface CandidateMessage {
  id: string;
  candidateId: string;
  name: string;
  initials: string;
  subject: string;
  preview: string;
  time: string;
  unread?: boolean;
}

const CANDIDATE_MESSAGES: CandidateMessage[] = [
  {
    id: "1",
    candidateId: "c0000000-0000-0000-0000-000000000001",
    name: "Emily Zhang",
    initials: "EZ",
    subject: "Re: On-site interview details",
    preview: "Thanks for sending over the schedule! I had a quick question about the system design round — should I prepare anything specific?",
    time: "20 min ago",
    unread: true,
  },
  {
    id: "2",
    candidateId: "c0000000-0000-0000-0000-000000000003",
    name: "Liam O'Brien",
    initials: "LO",
    subject: "Re: Phone screen follow-up",
    preview: "I really enjoyed our conversation yesterday. I'm excited about the design systems work and would love to move forward.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    candidateId: "c0000000-0000-0000-0000-000000000015",
    name: "Priya Sharma",
    initials: "PS",
    subject: "Availability for next week",
    preview: "I'm free Monday through Wednesday next week, any time after 10am PT works for me.",
    time: "3 hours ago",
  },
  {
    id: "4",
    candidateId: "c0000000-0000-0000-0000-000000000020",
    name: "Sophie Chen",
    initials: "SC",
    subject: "Re: Marketing Manager role",
    preview: "I had a chance to review the job description in more detail. The growth marketing focus is exactly what I've been looking for.",
    time: "5 hours ago",
  },
  {
    id: "5",
    candidateId: "c0000000-0000-0000-0000-000000000005",
    name: "Jordan Kim",
    initials: "JK",
    subject: "Portfolio update",
    preview: "I just pushed some updates to my portfolio that include the React component library I mentioned during our call.",
    time: "Yesterday",
  },
];

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

const DEMO_SCHEDULE: ScheduleMetadata = {
  type: "schedule",
  date: "Monday, May 12 2025",
  slots: [
    {
      time: "9:00am –\n10:00am",
      title: "System Design",
      participants: ["Jerome Bell", "Marvin McKinney"],
      location: "San Francisco-15-Bruce(6) [Zoom]",
    },
    {
      time: "10:00am –\n10:45am",
      title: "Algorithms and Data Structures",
      participants: ["Javier Ramirez"],
      location: "San Francisco-15-Bruce(6) [Zoom]",
    },
    {
      time: "10:45am –\n11:00am",
      title: "Break",
      participants: [],
      location: "San Francisco-15-Bruce(6) [Zoom]",
    },
    {
      time: "11:00am –\n11:30am",
      title: "Culture Fit",
      participants: ["Cameron Williamson"],
      location: "San Francisco-15-Bruce(6) [Zoom]",
    },
    {
      time: "11:30am –\n12:00pm",
      title: "Hiring Manager Close-up",
      participants: ["Leslie Alexander"],
      location: "San Francisco-15-Bruce(6) [Zoom]",
    },
  ],
};

export function InboxV1() {
  const [view, setView] = useState<InboxView>("candidate");
  const { setDocked } = useChatBarStore();
  const { addMessage } = useChatStore();

  function handleSchedule(candidate: string) {
    addMessage({
      role: "user",
      content: `Schedule an on-site interview for ${candidate}`,
    });
    addMessage({
      role: "assistant",
      content: "The earliest option is:",
      metadata: DEMO_SCHEDULE,
    });
    setDocked(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            What needs your attention today.
          </p>
        </div>
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

      {/* Kanban board */}
      {view === "candidate" && <div className="flex gap-2 overflow-x-auto">
        {/* Action needed column */}
        <div className="flex w-[280px] shrink-0 flex-col gap-2 rounded-xl bg-muted p-2">
          <div className="flex items-center gap-1.5 px-3 py-2">
            <span className="text-sm font-medium">Action needed</span>
            <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
              {ACTION_ITEMS.length}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {ACTION_ITEMS.map((item) => (
              <Link
                key={item.id}
                to={`/candidates/${item.candidateId}`}
                target="_blank"
                className="flex flex-col gap-2 rounded-lg bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">
                      {item.candidate}
                    </span>
                    {item.urgent && (
                      <span className="size-1.5 shrink-0 rounded-full bg-destructive" />
                    )}
                  </div>
                  <span className="text-sm text-foreground truncate">{item.role}</span>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "w-fit text-xs px-1.5 py-0",
                    item.type === "schedule"
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  )}
                >
                  {item.type === "schedule" ? "To be scheduled" : "Pending decision"}
                </Badge>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.type === "schedule" ? (
                      <Button
                        variant="outline"
                        size="xs"
                        className="h-6 gap-1 text-[11px]"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSchedule(item.candidate);
                        }}
                      >
                        <Calendar className="size-3" />
                        Schedule
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="xs"
                        className="h-6 gap-1 text-[11px]"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Gavel className="size-3" />
                        Decide
                      </Button>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{item.detail.split("—")[0].trim()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* New applications to review column */}
        <div className="flex w-[280px] shrink-0 flex-col gap-2 rounded-xl bg-muted p-2">
          <div className="flex items-center gap-1.5 px-3 py-2">
            <span className="text-sm font-medium">New applications</span>
            <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
              {NEW_APPLICANTS.length}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {NEW_APPLICANTS.map((applicant) => (
              <Link
                key={applicant.id}
                to={`/candidates/${applicant.candidateId}`}
                target="_blank"
                className="flex flex-col gap-2 rounded-lg bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate">
                    {applicant.name}
                  </span>
                  <span className="text-sm text-foreground truncate">{applicant.role}</span>
                </div>
                <Badge
                  className={cn(
                    "w-fit text-xs px-1.5 py-0",
                    CONSIDERATION_CONFIG[applicant.consideration].className
                  )}
                >
                  {CONSIDERATION_CONFIG[applicant.consideration].label}
                </Badge>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{applicant.source}</span>
                  <span className="text-xs text-muted-foreground">{applicant.applied}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Messages from candidates column */}
        <div className="flex w-[280px] shrink-0 flex-col gap-2 rounded-xl bg-muted p-2">
          <div className="flex items-center gap-1.5 px-3 py-2">
            <span className="text-sm font-medium">Messages</span>
            <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
              {CANDIDATE_MESSAGES.length}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {CANDIDATE_MESSAGES.map((msg) => (
              <Link
                key={msg.id}
                to={`/candidates/${msg.candidateId}`}
                target="_blank"
                className="flex flex-col gap-2 rounded-lg bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">
                      {msg.name}
                    </span>
                    {msg.unread && (
                      <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                    )}
                  </div>
                  <span className="text-sm text-foreground truncate">{msg.subject}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {msg.preview}
                </p>
                <div className="flex items-center justify-end">
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Offers and onboarding column */}
        <div className="flex w-[280px] shrink-0 flex-col gap-2 rounded-xl bg-muted p-2">
          <div className="flex items-center gap-1.5 px-3 py-2">
            <span className="text-sm font-medium">Offers and onboarding</span>
            <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
              3
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {[
              {
                candidateId: "c0000000-0000-0000-0000-000000000004",
                name: "Nina Patel",
                role: "Senior Frontend Engineer",
                status: "Offer extended",
                statusClass: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                time: "1 day ago",
              },
              {
                candidateId: "c0000000-0000-0000-0000-000000000010",
                name: "Marcus Johnson",
                role: "Account Executive, Enterprise",
                status: "Offer accepted",
                statusClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
                time: "2 days ago",
              },
              {
                candidateId: "c0000000-0000-0000-0000-000000000001",
                name: "Emily Zhang",
                role: "Senior Software Engineer",
                status: "Onboarding",
                statusClass: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                time: "3 days ago",
              },
            ].map((item) => (
              <Link
                key={item.candidateId}
                to={`/candidates/${item.candidateId}`}
                target="_blank"
                className="flex flex-col gap-2 rounded-lg bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate">{item.name}</span>
                  <span className="text-sm text-foreground truncate">{item.role}</span>
                </div>
                <Badge variant="secondary" className={cn("w-fit text-xs px-1.5 py-0", item.statusClass)}>
                  {item.status}
                </Badge>
                <div className="flex items-center justify-end">
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Agent activity column */}
        <div className="flex w-[280px] shrink-0 flex-col gap-2 rounded-xl bg-muted p-2">
          <div className="flex items-center gap-1.5 px-3 py-2">
            <span className="text-sm font-medium">Agent activity</span>
            <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
              {AGENT_ACTIVITIES.length}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {AGENT_ACTIVITIES.map((activity) => (
              <Link
                key={activity.id}
                to={activity.candidateId ? `/candidates/${activity.candidateId}?tab=activities` : "#"}
                target="_blank"
                className="flex flex-col gap-2 rounded-lg bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate">
                    {activity.candidateName ?? activity.agent}
                  </span>
                  {activity.role && (
                    <span className="text-sm text-foreground truncate">{activity.role}</span>
                  )}
                </div>
                <Badge variant="secondary" className="w-fit text-xs px-1.5 py-0">
                  {activity.action}
                </Badge>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{activity.agent}</span>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>}

      {/* Agent activity */}
      {view === "agent" && <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="size-4 text-muted-foreground" />
            Agent activity
          </CardTitle>
          <CardDescription>
            Recent actions taken by your agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {AGENT_ACTIVITIES.map((activity, i) => (
              <div key={activity.id} className="group/activity flex gap-3 py-3">
                <div className="relative flex flex-col items-center">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <activity.icon className="size-3.5 text-muted-foreground" />
                  </div>
                  {i < AGENT_ACTIVITIES.length - 1 && (
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
                        <Button variant="ghost" size="xs" className="gap-1 text-muted-foreground opacity-0 transition-opacity group-hover/activity:opacity-100">
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
        </CardContent>
      </Card>}
    </div>
  );
}
