import { Link } from "react-router";
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
  UserPlus,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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
import { useChatBarStore } from "@/stores/chat-bar-store";
import { useChatStore } from "@/features/chat/stores/chat-store";
import type { ScheduleMetadata } from "@/types";

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
}

const AGENT_ACTIVITIES: Activity[] = [
  {
    id: "1",
    agent: "Outreach",
    icon: Send,
    action: "Drafted 3 cold emails",
    detail: "Senior Frontend Engineer pipeline",
    time: "12 min ago",
    candidateId: "c0000000-0000-0000-0000-000000000001",
  },
  {
    id: "2",
    agent: "Triage",
    icon: Mail,
    action: "Flagged 2 urgent messages",
    detail: "Candidate replies needing same-day response",
    time: "28 min ago",
    undoable: true,
    candidateId: "c0000000-0000-0000-0000-000000000003",
  },
  {
    id: "3",
    agent: "Scheduling",
    icon: Calendar,
    action: "Sent 4 calendar invites",
    detail: "Phone screens for Data Scientist role",
    time: "1 hour ago",
    candidateId: "c0000000-0000-0000-0000-000000000002",
  },
  {
    id: "4",
    agent: "Applicant review",
    icon: FileText,
    action: "Reviewed 6 new applications",
    detail: "3 recommended for phone screen, 3 not a fit",
    time: "2 hours ago",
    candidateId: "c0000000-0000-0000-0000-000000000005",
  },
  {
    id: "5",
    agent: "Follow-ups",
    icon: MessageSquare,
    action: "Drafted 5 follow-up emails",
    detail: "Candidates with no reply after 3+ days",
    time: "3 hours ago",
    candidateId: "c0000000-0000-0000-0000-000000000004",
  },
  {
    id: "6",
    agent: "Candidate lookup",
    icon: Search,
    action: "Enriched 2 candidate profiles",
    detail: "Cross-referenced WAAS, Ashby, and Gmail",
    time: "4 hours ago",
    candidateId: "c0000000-0000-0000-0000-000000000010",
  },
  {
    id: "7",
    agent: "Rejections",
    icon: CheckCircle2,
    action: "Drafted 8 rejection emails",
    detail: "Calibrated to phone-screen stage",
    time: "5 hours ago",
    candidateId: "c0000000-0000-0000-0000-000000000009",
  },
];

const DEMO_SCHEDULE: ScheduleMetadata = {
  type: "schedule",
  date: "Monday, May 12 2025",
  slots: [
    {
      time: "9:00am –\n10:00am",
      title: "System Design",
      participants: ["Leslie Alexander", "Floyd Miles"],
      location: "San Francisco-15-Bruce(6) [Zoom]",
    },
    {
      time: "10:00am –\n10:45am",
      title: "Algorithms and Data Structures",
      participants: ["Jerome Bell"],
      location: "San Francisco-15-Bruce(6) [Zoom]",
    },
    {
      time: "10:45am –\n11:00am",
      title: "Break",
      participants: ["Brooklyn Simmons"],
      location: "San Francisco-15-Bruce(6) [Zoom]",
    },
    {
      time: "11:00am –\n11:30am",
      title: "Culture Fit",
      participants: ["Marvin McKinney"],
      location: "San Francisco-15-Bruce(6) [Zoom]",
    },
    {
      time: "11:30am –\n12:00pm",
      title: "Hiring Manager Close-up",
      participants: ["Cameron Williamson"],
      location: "San Francisco-15-Bruce(6) [Zoom]",
    },
  ],
};

export function Component() {
  const scheduleItems = ACTION_ITEMS.filter((i) => i.type === "schedule");
  const decisionItems = ACTION_ITEMS.filter((i) => i.type === "decision");
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          What needs your attention today.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Action needed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Action needed
              <Badge variant="secondary">{ACTION_ITEMS.length}</Badge>
            </CardTitle>
            <CardDescription>
              Candidates waiting on scheduling or a hiring decision
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Needs scheduling */}
            <div className="space-y-1">
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="size-3.5" />
                Needs scheduling
              </h3>
              <div className="divide-y divide-border">
                {scheduleItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Link to={`/candidates/${item.candidateId}`} target="_blank">
                      <Avatar className="size-8">
                        {item.avatar && <AvatarImage src={item.avatar} />}
                        <AvatarFallback className="text-[10px]">
                          {item.initials}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/candidates/${item.candidateId}`}
                          target="_blank"
                          className="text-sm font-medium truncate hover:underline"
                        >
                          {item.candidate}
                        </Link>
                        {item.urgent && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.role} — {item.detail}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleSchedule(item.candidate)}
                    >
                      <Calendar className="size-3" />
                      Schedule
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Hiring decisions */}
            <div className="space-y-1">
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Gavel className="size-3.5" />
                Hiring decisions
              </h3>
              <div className="divide-y divide-border">
                {decisionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Link to={`/candidates/${item.candidateId}`} target="_blank">
                      <Avatar className="size-8">
                        {item.avatar && <AvatarImage src={item.avatar} />}
                        <AvatarFallback className="text-[10px]">
                          {item.initials}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/candidates/${item.candidateId}`}
                          target="_blank"
                          className="text-sm font-medium truncate hover:underline"
                        >
                          {item.candidate}
                        </Link>
                        {item.urgent && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.role} — {item.detail}
                      </p>
                    </div>
                    <Button variant="outline" size="xs">
                      <Gavel className="size-3" />
                      Decide
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New applications to review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="size-4 text-muted-foreground" />
              New applications to review
              <Badge variant="secondary">{NEW_APPLICANTS.length}</Badge>
            </CardTitle>
            <CardDescription>
              Inbound applicants awaiting your review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {NEW_APPLICANTS.map((applicant) => (
                <div
                  key={applicant.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Link to={`/candidates/${applicant.candidateId}`} target="_blank">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-[10px]">
                        {applicant.initials}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/candidates/${applicant.candidateId}`}
                      target="_blank"
                      className="text-sm font-medium truncate hover:underline"
                    >
                      {applicant.name}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      {applicant.role} · {applicant.source} · {applicant.applied}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "shrink-0 text-[10px] px-1.5 py-0",
                      CONSIDERATION_CONFIG[applicant.consideration].className
                    )}
                  >
                    {CONSIDERATION_CONFIG[applicant.consideration].label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages from candidates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4 text-muted-foreground" />
              Messages from candidates
              <Badge variant="secondary">5</Badge>
            </CardTitle>
            <CardDescription>
              Recent replies and new messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {CANDIDATE_MESSAGES.map((msg) => (
                <Link
                  key={msg.id}
                  to={`/candidates/${msg.candidateId}`}
                  target="_blank"
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors rounded-md -mx-4"
                >
                  <Avatar className="size-8 mt-0.5">
                    <AvatarFallback className="text-[10px]">
                      {msg.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">
                        {msg.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {msg.subject}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground/70 line-clamp-2">
                      {msg.preview}
                    </p>
                  </div>
                  {msg.unread && (
                    <div className="mt-2 size-2 shrink-0 rounded-full bg-brand" />
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent activities */}
        <Card>
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
        </Card>
      </div>
    </div>
  );
}
