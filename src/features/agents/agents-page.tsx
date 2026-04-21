import { useState } from "react";
import {
  ArchiveX,
  Calendar,
  ClipboardCheck,
  Inbox,
  Kanban,
  Mail,
  Reply,
  Search,
  UserX,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const AGENTS = [
  {
    id: "pipeline",
    title: "Pipeline management",
    description:
      "View your full hiring pipeline by stage, with urgency tiers",
    icon: Kanban,
  },
  {
    id: "outreach",
    title: "Outreach",
    description:
      "Draft personalized cold emails using candidate backgrounds and your outreach template",
    icon: Mail,
  },
  {
    id: "follow-ups",
    title: "Follow-ups",
    description:
      "Draft follow-up emails for candidates who haven't replied",
    icon: Reply,
  },
  {
    id: "scheduling",
    title: "Scheduling",
    description:
      "Find open calendar slots, create Zoom/in-person events, send invites",
    icon: Calendar,
  },
  {
    id: "triage",
    title: "Triage",
    description:
      "Scan inbox, WAAS, and Ashby for what needs attention",
    icon: Inbox,
  },
  {
    id: "candidate-lookup",
    title: "Candidate lookup",
    description:
      "Cross-reference WAAS, Ashby, Gmail, and Calendar for any candidate",
    icon: Search,
  },
  {
    id: "inbox-cleanup",
    title: "Inbox cleanup",
    description: "Suggest safe-to-archive emails",
    icon: ArchiveX,
  },
  {
    id: "applicant-review",
    title: "Applicant review",
    description:
      "Review new inbound applicants with recommendations",
    icon: ClipboardCheck,
  },
  {
    id: "rejections",
    title: "Rejections",
    description:
      "Draft personalized rejection emails calibrated to pipeline stage",
    icon: UserX,
  },
] as const;

export function Component() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(AGENTS.map((a) => [a.id, false]))
  );

  function toggle(id: string) {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
        <p className="text-sm text-muted-foreground">
          Manage and monitor your recruiting agents.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => {
          const active = enabled[agent.id];
          return (
            <Card
              key={agent.id}
              className={cn(
                "transition-colors",
                !active && "opacity-75"
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <agent.icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm">{agent.title}</CardTitle>
                  </div>
                </div>
                <CardDescription>{agent.description}</CardDescription>
                <CardAction>
                  <Switch
                    checked={active}
                    onCheckedChange={() => toggle(agent.id)}
                  />
                </CardAction>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
