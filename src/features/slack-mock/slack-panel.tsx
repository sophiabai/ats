import { useMemo, useState, useEffect, useRef } from "react";
import {
  Bell,
  Bookmark,
  ChevronDown,
  Compass,
  Edit3,
  Hash,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Sparkles,
  Smile,
  Paperclip,
  AtSign,
  Mic,
} from "lucide-react";
import {
  useSchedulingStateStore,
  useSchedulingAgent,
} from "@/features/scheduling-agent";
import { useChatStore } from "@/features/chat/stores/chat-store";
import type { SlackDM } from "@/features/scheduling-agent/stores/scheduling-state-store";

export const COLORS = {
  sidebar: "#350D36",
  workspace: "#4A154B",
  textPrimary: "rgba(255,255,255,0.95)",
  textMuted: "rgba(255,255,255,0.65)",
  textSubtle: "rgba(255,255,255,0.45)",
};

export const RECRUITING_AGENT = {
  id: "recruiting_agent",
  name: "Recruiting coordination agent",
  initial: "R",
  color: "#16a34a",
};

export interface Viewer {
  id: string;
  name: string;
  role: "recruiter" | "interviewer";
  initials: string;
  color: string;
  email: string;
}

export const RECRUITER_VIEWER: Viewer = {
  id: "anne_montgomery",
  name: "Anne Montgomery",
  role: "recruiter",
  initials: "AM",
  color: "#0891b2",
  email: "anne@acme.ai",
};

export const INTERVIEWER_VIEWERS: Viewer[] = [
  { id: "leslie_alexander", name: "Leslie Alexander", role: "interviewer", initials: "LA", color: "#dc2626", email: "leslie@acme.ai" },
  { id: "javier_ramirez", name: "Javier Ramirez", role: "interviewer", initials: "JR", color: "#ea580c", email: "javier@acme.ai" },
  { id: "jerome_bell", name: "Jerome Bell", role: "interviewer", initials: "JB", color: "#16a34a", email: "jerome@acme.ai" },
  { id: "marvin_mckinney", name: "Marvin McKinney", role: "interviewer", initials: "MM", color: "#7c3aed", email: "marvin@acme.ai" },
];

interface Partner {
  id: string;
  name: string;
  role: "interviewer" | "app" | "recruiter";
  initial: string;
  color: string;
}

const KNOWN_INTERVIEWERS: Partner[] = INTERVIEWER_VIEWERS.map((v) => ({
  id: v.id,
  name: v.name,
  role: "interviewer",
  initial: v.name[0],
  color: v.color,
}));

const RECRUITING_AGENT_PARTNER: Partner = {
  id: RECRUITING_AGENT.id,
  name: RECRUITING_AGENT.name,
  role: "app",
  initial: RECRUITING_AGENT.initial,
  color: RECRUITING_AGENT.color,
};

interface IncomingReply {
  id: string;
  text: string;
  at: number;
}

type AppTab = "home" | "messages" | "about";

export function SlackPanel({ viewer }: { viewer: Viewer }) {
  const slackDMs = useSchedulingStateStore((s) => s.slackDMs);
  const updateSlackDM = useSchedulingStateStore((s) => s.updateSlackDM);
  const agent = useSchedulingAgent();
  const addChatMessage = useChatStore((s) => s.addMessage);
  const [activePartnerId, setActivePartnerId] = useState<string>(RECRUITING_AGENT.id);
  const [appTab, setAppTab] = useState<AppTab>("messages");
  const [incomingReplies, setIncomingReplies] = useState<IncomingReply[]>([]);

  const isRecruiter = viewer.role === "recruiter";

  const dmPartners = useMemo<(Partner & { unreadCount: number })[]>(() => {
    if (isRecruiter) {
      return KNOWN_INTERVIEWERS.map((p) => ({
        ...p,
        unreadCount: slackDMs.filter(
          (d) => d.to_id === p.id && d.status === "sent" && !d.reply,
        ).length,
      }));
    }
    const others: Partner[] = [
      { id: RECRUITER_VIEWER.id, name: RECRUITER_VIEWER.name, role: "recruiter", initial: "A", color: RECRUITER_VIEWER.color },
      ...KNOWN_INTERVIEWERS.filter((p) => p.id !== viewer.id),
    ];
    return others.map((p) => ({ ...p, unreadCount: 0 }));
  }, [slackDMs, isRecruiter, viewer.id]);

  const agentUnread = useMemo(() => {
    if (isRecruiter) {
      return Math.max(
        slackDMs.filter((d) => d.to_role === "scheduler").length - incomingReplies.length,
        0,
      );
    }
    return slackDMs.filter(
      (d) => d.to_id === viewer.id && d.status === "sent" && !d.reply,
    ).length;
  }, [slackDMs, incomingReplies, isRecruiter, viewer.id]);

  const isAgentSelected = activePartnerId === RECRUITING_AGENT.id;
  const activePartner = isAgentSelected
    ? RECRUITING_AGENT_PARTNER
    : (dmPartners.find((p) => p.id === activePartnerId) ?? RECRUITING_AGENT_PARTNER);

  const threadDMs = useMemo(() => {
    if (isAgentSelected) {
      if (isRecruiter) return slackDMs.filter((d) => d.to_role === "scheduler");
      return slackDMs.filter((d) => d.to_id === viewer.id);
    }
    return slackDMs.filter((d) => d.to_id === activePartner.id);
  }, [slackDMs, isAgentSelected, isRecruiter, viewer.id, activePartner.id]);

  function handleAgentMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setIncomingReplies((prev) => [
      ...prev,
      { id: `inc_${Date.now()}`, text: trimmed, at: Date.now() },
    ]);
    addChatMessage({ role: "user", content: `[via Slack — ${viewer.name}] ${trimmed}` });
    void agent.run(trimmed);
  }

  function handleInterviewerReply(dm: SlackDM, action: "accept" | "reject" | "custom", text?: string) {
    if (action === "accept") {
      updateSlackDM(dm.id, { status: "accepted", reply: text || "Yes, I can move that event." });
    } else if (action === "reject") {
      updateSlackDM(dm.id, { status: "rejected", reply: text || "Sorry, I can't move that one." });
    } else if (action === "custom" && text) {
      updateSlackDM(dm.id, { status: "replied", reply: text });
    }
  }

  return (
    <div
      className="flex h-svh w-full bg-[#f8f8f8] text-sm"
      style={{ fontFamily: "Lato, system-ui, -apple-system, sans-serif" }}
    >
      <LeftSidebar viewer={viewer} />
      <WorkspaceColumn
        viewer={viewer}
        dmPartners={dmPartners}
        activePartnerId={activePartnerId}
        agentUnread={agentUnread}
        onSelectPartner={(id) => {
          setActivePartnerId(id);
          if (id === RECRUITING_AGENT.id) setAppTab("messages");
        }}
      />
      {isAgentSelected ? (
        <AppMainView
          partner={activePartner}
          tab={appTab}
          onTabChange={setAppTab}
          dms={threadDMs}
          replies={incomingReplies}
          viewer={viewer}
          onAgentMessage={handleAgentMessage}
          agentPending={agent.isPending}
        />
      ) : (
        <DMMainView
          partner={activePartner}
          dms={threadDMs}
          onInterviewerReply={handleInterviewerReply}
          viewerRole={viewer.role}
        />
      )}
    </div>
  );
}

function LeftSidebar({ viewer }: { viewer: Viewer }) {
  return (
    <div
      className="flex w-16 shrink-0 flex-col items-center gap-2 py-3"
      style={{ backgroundColor: COLORS.sidebar }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-base font-bold text-[#4A154B]">
        A
      </div>
      <button
        className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
        title="Add workspace"
      >
        <Plus className="size-5" />
      </button>
      <div
        className="mt-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: viewer.color }}
        title={viewer.name}
      >
        {viewer.initials}
      </div>
    </div>
  );
}

function WorkspaceColumn({
  viewer,
  dmPartners,
  activePartnerId,
  agentUnread,
  onSelectPartner,
}: {
  viewer: Viewer;
  dmPartners: (Partner & { unreadCount: number })[];
  activePartnerId: string;
  agentUnread: number;
  onSelectPartner: (id: string) => void;
}) {
  return (
    <div
      className="flex w-64 shrink-0 flex-col"
      style={{ backgroundColor: COLORS.workspace }}
    >
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
            ACME AI
          </span>
          <span className="text-xs" style={{ color: COLORS.textSubtle }}>
            {viewer.email}
          </span>
        </div>
        <button
          className="flex h-7 w-7 items-center justify-center rounded text-white/70 hover:bg-white/10"
          title="Compose"
        >
          <Edit3 className="size-4" />
        </button>
      </div>

      <div className="px-3 py-3">
        <button
          className="flex w-full items-center gap-2 rounded-md bg-white/5 px-2 py-1.5 text-xs hover:bg-white/10"
          style={{ color: COLORS.textMuted }}
        >
          <Search className="size-3.5" />
          <span>Search ACME AI</span>
        </button>
      </div>

      <nav className="space-y-0.5 px-2">
        <SidebarNavItem icon={<Hash className="size-4" />} label="Threads" />
        <SidebarNavItem icon={<Bell className="size-4" />} label="Mentions & reactions" />
        <SidebarNavItem icon={<Bookmark className="size-4" />} label="Saved items" />
        <SidebarNavItem icon={<MessageSquare className="size-4" />} label="Drafts & sent" />
        <SidebarNavItem icon={<Compass className="size-4" />} label="More" />
      </nav>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto px-2 pb-3">
        <Section title="Direct messages">
          {dmPartners.map((p) => (
            <DMEntry
              key={p.id}
              partner={p}
              isActive={p.id === activePartnerId}
              onSelect={() => onSelectPartner(p.id)}
              unreadCount={p.unreadCount}
            />
          ))}
        </Section>

        <Section title="Apps">
          <AppEntry
            partner={RECRUITING_AGENT_PARTNER}
            isActive={activePartnerId === RECRUITING_AGENT.id}
            onSelect={() => onSelectPartner(RECRUITING_AGENT.id)}
            unreadCount={agentUnread}
          />
          <button
            className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] hover:bg-white/10"
            style={{ color: COLORS.textMuted }}
          >
            <Plus className="size-4 text-white/60" />
            <span>Add apps</span>
          </button>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium" style={{ color: COLORS.textMuted }}>
        <ChevronDown className="size-3" />
        <span>{title}</span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarNavItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] hover:bg-white/10"
      style={{ color: COLORS.textMuted }}
    >
      <span className="text-white/60">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function DMEntry({
  partner,
  isActive,
  onSelect,
  unreadCount,
}: {
  partner: Partner;
  isActive: boolean;
  onSelect: () => void;
  unreadCount: number;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors ${isActive ? "" : "hover:bg-white/10"}`}
      style={{
        backgroundColor: isActive ? "#1164A3" : "transparent",
        color: isActive ? "#ffffff" : COLORS.textMuted,
      }}
    >
      <div
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white"
        style={{ backgroundColor: partner.color }}
      >
        {partner.initial}
      </div>
      <span className="flex-1 truncate text-[13px]">{partner.name}</span>
      {unreadCount > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#CC2A2A] px-1 text-[10px] font-bold text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
}

function AppEntry({
  partner,
  isActive,
  onSelect,
  unreadCount,
}: {
  partner: Partner;
  isActive: boolean;
  onSelect: () => void;
  unreadCount: number;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors ${isActive ? "" : "hover:bg-white/10"}`}
      style={{
        backgroundColor: isActive ? "#1164A3" : "transparent",
        color: isActive ? "#ffffff" : COLORS.textMuted,
      }}
    >
      <div
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white"
        style={{ backgroundColor: partner.color }}
      >
        <Sparkles className="size-3" />
      </div>
      <span className="flex-1 truncate text-[13px]">{partner.name}</span>
      {unreadCount > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#CC2A2A] px-1 text-[10px] font-bold text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
}

function DMMainView({
  partner,
  dms,
  onInterviewerReply,
  viewerRole,
}: {
  partner: Partner;
  dms: SlackDM[];
  onInterviewerReply: (dm: SlackDM, action: "accept" | "reject" | "custom", text?: string) => void;
  viewerRole: Viewer["role"];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [dms.length]);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#dddddd] px-5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded text-xs font-semibold text-white"
            style={{ backgroundColor: partner.color }}
          >
            {partner.initial}
          </div>
          <span className="text-[15px] font-bold text-[#1d1c1d]">{partner.name}</span>
          {partner.role === "interviewer" && (
            <span className="rounded bg-[#f8f8f8] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#616061]">
              Interviewer
            </span>
          )}
          {partner.role === "recruiter" && (
            <span className="rounded bg-[#f8f8f8] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#616061]">
              Recruiter
            </span>
          )}
        </div>
        <button className="flex h-7 w-7 items-center justify-center rounded text-[#1d1c1d]/70 hover:bg-[#f8f8f8]">
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        {dms.length === 0 ? (
          <EmptyState partner={partner} />
        ) : (
          <div className="space-y-5">
            {dms.map((dm) => (
              <SlackMessage
                key={dm.id}
                dm={dm}
                onInterviewerReply={onInterviewerReply}
                allowReply={viewerRole === "interviewer"}
              />
            ))}
          </div>
        )}
      </div>

      <DisabledComposer partnerName={partner.name} />
    </div>
  );
}

function AppMainView({
  partner,
  tab,
  onTabChange,
  dms,
  replies,
  viewer,
  onAgentMessage,
  agentPending,
}: {
  partner: Partner;
  tab: AppTab;
  onTabChange: (tab: AppTab) => void;
  dms: SlackDM[];
  replies: IncomingReply[];
  viewer: Viewer;
  onAgentMessage: (text: string) => void;
  agentPending: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const updateSlackDM = useSchedulingStateStore((s) => s.updateSlackDM);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [dms.length, replies.length, agentPending]);

  function handleConflictAction(dm: SlackDM, action: "accept" | "reject" | "custom", text?: string) {
    if (action === "accept") {
      updateSlackDM(dm.id, { status: "accepted", reply: text || "Yes, I can move that event." });
    } else if (action === "reject") {
      updateSlackDM(dm.id, { status: "rejected", reply: text || "Sorry, I can't move that one." });
    } else if (action === "custom" && text) {
      updateSlackDM(dm.id, { status: "replied", reply: text });
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#dddddd] px-5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded text-white"
            style={{ backgroundColor: partner.color }}
          >
            <Sparkles className="size-3.5" />
          </div>
          <span className="text-[15px] font-bold text-[#1d1c1d]">{partner.name}</span>
          <ChevronDown className="size-4 text-[#616061]" />
        </div>
        <button className="flex h-7 w-7 items-center justify-center rounded text-[#1d1c1d]/70 hover:bg-[#f8f8f8]">
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      <div className="flex h-10 shrink-0 items-center gap-6 border-b border-[#dddddd] px-5">
        <AppTabButton label="Home" active={tab === "home"} onClick={() => onTabChange("home")} />
        <AppTabButton label="Messages" active={tab === "messages"} onClick={() => onTabChange("messages")} />
        <AppTabButton label="About" active={tab === "about"} onClick={() => onTabChange("about")} />
      </div>

      {tab === "messages" && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
            <AppMessagesIntro partner={partner} />
            {dms.length > 0 && (
              <>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#dddddd]" />
                  <div className="rounded-full border border-[#dddddd] bg-white px-3 py-0.5 text-xs font-semibold text-[#1d1c1d]">
                    {formatToday()}
                  </div>
                  <div className="h-px flex-1 bg-[#dddddd]" />
                </div>
                <div className="mt-4 space-y-5">
                  {dms.map((dm) => (
                    <AppMessage
                      key={dm.id}
                      dm={dm}
                      viewer={viewer}
                      onAction={handleConflictAction}
                    />
                  ))}
                  {replies.map((r) => (
                    <ViewerMessageBubble key={r.id} text={r.text} at={r.at} viewer={viewer} />
                  ))}
                  {agentPending && (
                    <div className="flex items-center gap-2 text-xs text-[#616061]">
                      <span className="size-2 animate-pulse rounded-full" style={{ backgroundColor: partner.color }} />
                      <span>{partner.name} is working…</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <AppComposer
            partnerName={partner.name}
            onSend={onAgentMessage}
            disabled={agentPending}
          />
        </>
      )}

      {tab === "home" && (
        <div className="flex flex-1 items-start justify-center overflow-y-auto px-5 py-10">
          <div className="max-w-md space-y-3 text-sm text-[#1d1c1d]">
            <h2 className="text-lg font-bold">Welcome to {partner.name}</h2>
            <p className="text-[#616061]">
              Your AI scheduling assistant. {viewer.role === "recruiter"
                ? "Ask it to schedule candidates, follow up on outreach, resolve interviewer conflicts, and book interviews — all from this DM."
                : "It coordinates interviews on your behalf — accept or reject conflict resolutions and stay in the loop on upcoming sessions."}
            </p>
          </div>
        </div>
      )}

      {tab === "about" && (
        <div className="flex flex-1 items-start justify-center overflow-y-auto px-5 py-10">
          <div className="max-w-md space-y-3 text-sm text-[#1d1c1d]">
            <h2 className="text-lg font-bold">About {partner.name}</h2>
            <p className="text-[#616061]">
              The {partner.name} is the ACME AI scheduling assistant. It coordinates interviews between
              candidates and interviewers, handles reminders, and surfaces conflicts that need a human in
              the loop.
            </p>
            <p className="text-[#616061]">Maintained by the ACME AI ATS team.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AppTabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex h-full items-center text-[13px] font-medium transition-colors ${active ? "text-[#1d1c1d]" : "text-[#616061] hover:text-[#1d1c1d]"}`}
    >
      {label}
      {active && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#007A5A]" />}
    </button>
  );
}

function AppMessagesIntro({ partner }: { partner: Partner }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: partner.color }}
      >
        <Sparkles className="size-5" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-[#1d1c1d]">{partner.name}</span>
          <span className="rounded bg-[#1264A3]/10 px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#1264A3]">
            APP
          </span>
          <span className="size-2 rounded-full bg-[#007A5A]" />
        </div>
        <p className="text-[15px] text-[#1d1c1d]">
          This is the very beginning of your direct message history with{" "}
          <span className="text-[#1264A3]">@{partner.name}</span>
        </p>
        <button className="text-[13px] text-[#1264A3] hover:underline">
          💡 How does {partner.name} work?
        </button>
      </div>
    </div>
  );
}

function formatToday(): string {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const day = now.getDate();
  return `${weekday}, ${month} ${day}${ordinalSuffix(day)}`;
}

function ordinalSuffix(d: number): string {
  if (d > 3 && d < 21) return "th";
  switch (d % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function AppMessage({
  dm,
  viewer,
  onAction,
}: {
  dm: SlackDM;
  viewer: Viewer;
  onAction: (dm: SlackDM, action: "accept" | "reject" | "custom", text?: string) => void;
}) {
  const time = new Date(dm.sent_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const isConflict = dm.type === "conflict_resolution";
  const hasReply = !!dm.reply;
  const showActions = isConflict && !hasReply && viewer.role === "interviewer";

  return (
    <div className="flex gap-3">
      <div
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded text-white"
        style={{ backgroundColor: RECRUITING_AGENT.color }}
      >
        <Sparkles className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-[#1d1c1d]">{RECRUITING_AGENT.name}</span>
          <span className="rounded bg-[#1264A3]/10 px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#1264A3]">
            APP
          </span>
          <span className="text-xs text-[#616061]">{time}</span>
        </div>
        <div className="mt-0.5 whitespace-pre-wrap text-[15px] leading-relaxed text-[#1d1c1d]">
          {dm.message.split("\n").map((line, i) => (
            <p key={i}>{renderSlackLine(line)}</p>
          ))}
        </div>

        {showActions && <ConflictActions dm={dm} onReply={onAction} />}

        {hasReply && (
          <div className="mt-3 flex gap-3 rounded-md border border-[#dddddd] bg-[#f8f8f8] p-3">
            <div
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold text-white"
              style={{ backgroundColor: KNOWN_INTERVIEWERS.find((p) => p.id === dm.to_id)?.color ?? "#616061" }}
            >
              {dm.to_name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-[#1d1c1d]">{dm.to_name}</span>
                <StatusBadge status={dm.status} />
              </div>
              <p className="mt-0.5 text-sm text-[#1d1c1d]">{dm.reply}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SlackMessage({
  dm,
  onInterviewerReply,
  allowReply,
}: {
  dm: SlackDM;
  onInterviewerReply: (dm: SlackDM, action: "accept" | "reject" | "custom", text?: string) => void;
  allowReply: boolean;
}) {
  const time = new Date(dm.sent_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const isConflict = dm.type === "conflict_resolution";
  const hasReply = !!dm.reply;

  return (
    <div className="flex gap-3">
      <div
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded text-white"
        style={{ backgroundColor: RECRUITING_AGENT.color }}
      >
        <Sparkles className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-[#1d1c1d]">{RECRUITING_AGENT.name}</span>
          <span className="rounded bg-[#1264A3]/10 px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#1264A3]">
            APP
          </span>
          <span className="text-xs text-[#616061]">{time}</span>
        </div>
        <div className="mt-0.5 whitespace-pre-wrap text-[15px] leading-relaxed text-[#1d1c1d]">
          {dm.message.split("\n").map((line, i) => (
            <p key={i}>{renderSlackLine(line)}</p>
          ))}
        </div>

        {isConflict && !hasReply && allowReply && (
          <ConflictActions dm={dm} onReply={onInterviewerReply} />
        )}

        {hasReply && (
          <div className="mt-3 flex gap-3 rounded-md border border-[#dddddd] bg-[#f8f8f8] p-3">
            <div
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold text-white"
              style={{ backgroundColor: KNOWN_INTERVIEWERS.find((p) => p.id === dm.to_id)?.color ?? "#616061" }}
            >
              {dm.to_name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-[#1d1c1d]">{dm.to_name}</span>
                <StatusBadge status={dm.status} />
              </div>
              <p className="mt-0.5 text-sm text-[#1d1c1d]">{dm.reply}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderSlackLine(line: string) {
  const parts = line.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <strong key={i} className="font-bold">{part.slice(1, -1)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function StatusBadge({ status }: { status: SlackDM["status"] }) {
  const styles: Record<SlackDM["status"], { bg: string; color: string; label: string }> = {
    sent: { bg: "#f8f8f8", color: "#616061", label: "Pending" },
    accepted: { bg: "#007A5A1A", color: "#007A5A", label: "Accepted" },
    rejected: { bg: "#CC2A2A1A", color: "#CC2A2A", label: "Rejected" },
    replied: { bg: "#1264A31A", color: "#1264A3", label: "Replied" },
  };
  const s = styles[status];
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function ConflictActions({
  dm,
  onReply,
}: {
  dm: SlackDM;
  onReply: (dm: SlackDM, action: "accept" | "reject" | "custom", text?: string) => void;
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [text, setText] = useState("");

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onReply(dm, "accept")}
          className="rounded border border-[#007A5A] bg-[#007A5A] px-4 py-1.5 text-[13px] font-bold text-white hover:bg-[#006449]"
        >
          Yes, I can move it
        </button>
        <button
          onClick={() => onReply(dm, "reject")}
          className="rounded border border-[#dddddd] bg-white px-4 py-1.5 text-[13px] font-bold text-[#1d1c1d] hover:bg-[#f8f8f8]"
        >
          No
        </button>
        <button
          onClick={() => setShowCustom((v) => !v)}
          className="text-[12px] text-[#1264A3] hover:underline"
        >
          {showCustom ? "Cancel" : "Or write a custom reply"}
        </button>
      </div>
      {showCustom && (
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your reply…"
            className="flex-1 rounded border border-[#dddddd] bg-white px-3 py-1.5 text-[13px] text-[#1d1c1d] placeholder:text-[#616061] focus:border-[#1264A3] focus:outline-none focus:ring-2 focus:ring-[#1264A3]/30"
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim()) {
                onReply(dm, "custom", text.trim());
                setText("");
                setShowCustom(false);
              }
            }}
          />
          <button
            disabled={!text.trim()}
            onClick={() => {
              onReply(dm, "custom", text.trim());
              setText("");
              setShowCustom(false);
            }}
            className="rounded bg-[#1264A3] px-3 py-1.5 text-[13px] font-bold text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

function ViewerMessageBubble({ text, at, viewer }: { text: string; at: number; viewer: Viewer }) {
  const time = new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <div className="flex gap-3">
      <div
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded text-sm font-bold text-white"
        style={{ backgroundColor: viewer.color }}
      >
        {viewer.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-[#1d1c1d]">{viewer.name}</span>
          <span className="text-xs text-[#616061]">{time}</span>
        </div>
        <div className="mt-0.5 whitespace-pre-wrap text-[15px] leading-relaxed text-[#1d1c1d]">{text}</div>
      </div>
    </div>
  );
}

function AppComposer({
  partnerName,
  onSend,
  disabled,
}: {
  partnerName: string;
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <div className="border-t border-[#dddddd] px-5 py-3">
      <div className="rounded-lg border border-[#dddddd] bg-white focus-within:border-[#1264A3] focus-within:ring-2 focus-within:ring-[#1264A3]/20">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          disabled={disabled}
          placeholder={`Message ${partnerName}`}
          className="block w-full resize-none border-0 bg-transparent px-4 py-2.5 text-[15px] text-[#1d1c1d] placeholder:text-[#616061] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f8f8f8]"
        />
        <div className="flex items-center justify-between border-t border-[#dddddd] px-2 py-1.5">
          <div className="flex items-center gap-1 text-[#616061]">
            <ComposerIcon><Paperclip className="size-4" /></ComposerIcon>
            <ComposerIcon><Smile className="size-4" /></ComposerIcon>
            <ComposerIcon><AtSign className="size-4" /></ComposerIcon>
            <ComposerIcon><Mic className="size-4" /></ComposerIcon>
          </div>
          <button
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            className="flex h-7 w-7 items-center justify-center rounded bg-[#007A5A] text-white disabled:bg-[#dddddd] disabled:text-[#616061]"
            title="Send"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DisabledComposer({ partnerName }: { partnerName: string }) {
  return (
    <div className="border-t border-[#dddddd] px-5 py-3">
      <div className="rounded-lg border border-[#dddddd] bg-[#f8f8f8] px-4 py-3 text-xs text-[#616061]">
        Messaging {partnerName} directly is disabled in this mock.
      </div>
    </div>
  );
}

function ComposerIcon({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#f8f8f8]">
      {children}
    </button>
  );
}

function EmptyState({ partner }: { partner: Partner }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center text-sm text-[#616061]">
      <div
        className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold text-white"
        style={{ backgroundColor: partner.color }}
      >
        {partner.initial}
      </div>
      <p className="mb-1 font-bold text-[#1d1c1d]">{partner.name}</p>
      <p>No messages with {partner.name} yet.</p>
    </div>
  );
}
