import { useState } from "react";
import { Bug, Check, RotateCcw, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useSchedulingStateStore,
  type SchedulingRequest,
  type SlackDM,
} from "@/features/scheduling-agent/stores/scheduling-state-store";
import { useSchedulingRulesStore } from "@/features/scheduling-agent/stores/scheduling-rules-store";
import { useSchedulingAgent } from "@/features/scheduling-agent/hooks/use-scheduling-agent";
import { useAgentThreadStore } from "@/features/scheduling-agent/stores/agent-thread-store";
import { useChatStore } from "@/features/chat/stores/chat-store";

export function ScenarioPanel() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-2 text-xs font-medium text-background shadow-lg hover:bg-foreground"
      >
        <Bug className="size-3.5" />
        Demo controls
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-h-[80vh] w-[380px] flex-col rounded-xl border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Bug className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold">Demo controls</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <ActiveRequests />
        <PendingConflicts />
        <GlobalActions />
      </div>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-2 mt-3 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      <span>{title}</span>
      {count !== undefined && (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          {count}
        </span>
      )}
    </div>
  );
}

function ActiveRequests() {
  const requests = useSchedulingStateStore((s) => s.requests);
  const active = requests.filter((r) => r.status !== "completed" && r.status !== "cancelled");

  if (active.length === 0) {
    return (
      <div>
        <SectionHeader title="Active requests" />
        <EmptyHint text="No scheduling requests yet. Trigger one via Schedule with AI or the chat." />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Active requests" count={active.length} />
      <div className="space-y-2">
        {active.map((r) => (
          <RequestRow key={r.id} request={r} />
        ))}
      </div>
    </div>
  );
}

function RequestRow({ request }: { request: SchedulingRequest }) {
  const updateRequest = useSchedulingStateStore((s) => s.updateRequest);
  const agent = useSchedulingAgent();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState(defaultReplyForRequest(request));

  const sentAgo = formatAgo(request.sent_at);

  function simulate48hPassed() {
    if (agent.isPending) return;
    void agent.run(
      `[Simulation: 48 hours have passed since you sent the ${request.template.replace(/_/g, " ")} request to ${request.candidate_name}.] Check whether they've replied; if not, send the next reminder according to your normal flow.`,
    );
    toast.info(`Simulated 48h passed for ${request.candidate_name}`);
  }

  function simulateCandidateReplied() {
    if (agent.isPending) return;
    const trimmed = replyText.trim();
    if (!trimmed) {
      toast.error("Reply text can't be empty");
      return;
    }

    if (request.template === "self_schedule") {
      updateRequest(request.id, {
        candidate_reply: trimmed,
        candidate_picked_slot: trimmed,
        status: "replied",
      });
    } else {
      updateRequest(request.id, {
        candidate_reply: trimmed,
        candidate_availability: trimmed.split(/\n+/).filter(Boolean),
        status: "replied",
      });
    }

    setReplyOpen(false);
    void agent.run(
      `[Simulation: ${request.candidate_name} replied to the scheduling request.] Their reply: "${trimmed}". Check the reply and proceed with scheduling.`,
    );
    toast.info(`Simulated reply from ${request.candidate_name}`);
  }

  function simulateGhosted() {
    if (agent.isPending) return;
    updateRequest(request.id, { status: "ghosted" });
    void agent.run(
      `[Simulation: 10 days have elapsed without a reply from ${request.candidate_name}.] Notify the scheduler with a suggestion to reject the candidate with reason "Stopped responding".`,
    );
    toast.info(`Simulated 10d ghost for ${request.candidate_name}`);
  }

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{request.candidate_name}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{request.status}</span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {request.template === "self_schedule" ? "Self-schedule" : "Availability request"} · {sentAgo} ago · {request.reminder_count} reminder{request.reminder_count === 1 ? "" : "s"}
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <SimulateButton onClick={simulate48hPassed} disabled={agent.isPending}>
          48h passed
        </SimulateButton>
        <Popover open={replyOpen} onOpenChange={setReplyOpen}>
          <PopoverTrigger asChild>
            <SimulateButton disabled={agent.isPending}>
              Candidate replied
            </SimulateButton>
          </PopoverTrigger>
          <PopoverContent side="left" align="start" className="w-72">
            <p className="mb-1.5 text-xs font-semibold">
              Reply from {request.candidate_name}
            </p>
            <p className="mb-2 text-[11px] text-muted-foreground">
              {request.template === "self_schedule"
                ? "Slot the candidate picked"
                : "Availability windows (one per line)"}
            </p>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              className="text-sm"
            />
            <Button
              size="sm"
              className="mt-2 w-full"
              onClick={simulateCandidateReplied}
              disabled={agent.isPending}
            >
              <Send className="size-3" />
              Simulate reply
            </Button>
          </PopoverContent>
        </Popover>
        <SimulateButton onClick={simulateGhosted} disabled={agent.isPending}>
          Ghosted 10d
        </SimulateButton>
      </div>
    </div>
  );
}

function PendingConflicts() {
  const slackDMs = useSchedulingStateStore((s) => s.slackDMs);
  const pending = slackDMs.filter(
    (d) => d.type === "conflict_resolution" && !d.reply,
  );

  if (pending.length === 0) return null;

  return (
    <div>
      <SectionHeader title="Pending conflict DMs" count={pending.length} />
      <div className="space-y-2">
        {pending.map((dm) => (
          <ConflictRow key={dm.id} dm={dm} />
        ))}
      </div>
    </div>
  );
}

function ConflictRow({ dm }: { dm: SlackDM }) {
  const updateSlackDM = useSchedulingStateStore((s) => s.updateSlackDM);
  const conflicting_event = (dm.metadata?.conflicting_event as string) ?? "the conflicting event";

  function accept() {
    updateSlackDM(dm.id, {
      status: "accepted",
      reply: "Yes, I can move that one.",
    });
    toast.info(`${dm.to_name} accepted conflict resolution`);
  }

  function reject() {
    updateSlackDM(dm.id, {
      status: "rejected",
      reply: "Sorry, I can't move that one.",
    });
    toast.info(`${dm.to_name} rejected conflict resolution`);
  }

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{dm.to_name}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">pending</span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Move "{conflicting_event}"
      </p>
      <div className="mt-2 flex gap-1.5">
        <SimulateButton onClick={accept} variant="accept">
          <Check className="size-3" />
          Accept
        </SimulateButton>
        <SimulateButton onClick={reject} variant="reject">
          <X className="size-3" />
          Reject
        </SimulateButton>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        After accept/reject, ask the agent "check conflict status for {dm.to_name}" to continue.
      </p>
    </div>
  );
}

function GlobalActions() {
  const resetAll = useSchedulingStateStore((s) => s.resetAll);
  const resetRules = useSchedulingRulesStore((s) => s.resetRules);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const resetThread = useAgentThreadStore((s) => s.resetThread);

  return (
    <div className="mt-4 border-t pt-3">
      <button
        onClick={() => {
          resetAll();
          resetRules();
          clearMessages();
          resetThread();
          toast.success("Demo data reset");
        }}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-2 text-xs text-muted-foreground hover:bg-muted"
      >
        <RotateCcw className="size-3" />
        Reset all demo data
      </button>
    </div>
  );
}

function SimulateButton({
  children,
  onClick,
  disabled,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "accept" | "reject";
}) {
  const styles = {
    default: "border border-input bg-background text-foreground hover:bg-muted",
    accept: "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    reject: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-50",
        styles[variant],
      )}
    >
      {children}
    </button>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
      {text}
    </p>
  );
}

function defaultReplyForRequest(request: SchedulingRequest): string {
  if (request.template === "self_schedule") {
    return "Monday, May 25 9:00am – 10:00am PT";
  }
  return "Mon, May 25 9:00am – 12:00pm PT\nTue, May 26 1:00pm – 4:00pm PT\nThu, May 28 9:00am – 11:00am PT";
}

function formatAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60_000);
  const hr = Math.floor(diff / 3_600_000);
  const day = Math.floor(diff / 86_400_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  if (hr < 24) return `${hr}h`;
  return `${day}d`;
}
