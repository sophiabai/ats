import { DEMO_INTERVIEWERS } from "@/features/candidates/components/scheduling/scheduling-demo-data";
import {
  getCandidateById,
  lookupCandidateForAgent,
} from "@/features/scheduling-agent/lib/candidate-lookup";
import {
  useSchedulingStateStore,
  type SchedulingInterviewDetail,
} from "@/features/scheduling-agent/stores/scheduling-state-store";
import { useChatStore } from "@/features/chat/stores/chat-store";
import { useSchedulingRulesStore } from "@/features/scheduling-agent/stores/scheduling-rules-store";
import type {
  ToolDefinition,
  ToolHandlerContext,
} from "@/features/scheduling-agent/types";

const INTERVIEWER_DIRECTORY: Record<
  string,
  { id: string; name: string; slack: string; email: string }
> = {
  leslie_alexander: {
    id: "leslie_alexander",
    name: "Leslie Alexander",
    slack: "U_LESLIE",
    email: "leslie@acme.com",
  },
  javier_ramirez: {
    id: "javier_ramirez",
    name: "Javier Ramirez",
    slack: "U_JAVIER",
    email: "javier@acme.com",
  },
  jerome_bell: {
    id: "jerome_bell",
    name: "Jerome Bell",
    slack: "U_JEROME",
    email: "jerome@acme.com",
  },
  marvin_mckinney: {
    id: "marvin_mckinney",
    name: "Marvin McKinney",
    slack: "U_MARVIN",
    email: "marvin@acme.com",
  },
};

function resolveInterviewer(idOrName: string): { id: string; name: string; slack: string; email: string } {
  const raw = idOrName.trim();
  if (INTERVIEWER_DIRECTORY[raw]) return INTERVIEWER_DIRECTORY[raw];

  const normalized = raw.toLowerCase().replace(/\s+/g, "_");
  if (INTERVIEWER_DIRECTORY[normalized]) return INTERVIEWER_DIRECTORY[normalized];

  for (const entry of Object.values(INTERVIEWER_DIRECTORY)) {
    if (entry.name.toLowerCase() === raw.toLowerCase()) return entry;
  }

  const slug = normalized || `interviewer_${Math.random().toString(36).slice(2, 7)}`;
  return {
    id: slug,
    name: raw,
    slack: `U_${slug.toUpperCase()}`,
    email: `${slug.replace(/_/g, ".")}@acme.com`,
  };
}

const CURRENT_SCHEDULER = {
  id: "anne_montgomery",
  name: "Anne Montgomery",
  slack: "U_ANNE",
  email: "anne@acme.com",
};

interface SuggestedSlot {
  slot_id: string;
  date: string;
  time: string;
  duration_min: number;
  interviewer_ids: string[];
  interviewer_names: string[];
  conflict_count: number;
  conflicts: Array<{
    interviewer_id: string;
    interviewer_name: string;
    event_title: string;
    event_time: string;
  }>;
}

const DEFAULT_PANEL_IDS = ["leslie_alexander", "javier_ramirez", "jerome_bell"];
const DEFAULT_PANEL_NAMES = ["Leslie Alexander", "Javier Ramirez", "Jerome Bell"];

const SLOTS_5_DAY: SuggestedSlot[] = [
  {
    slot_id: "slot_mon_9am",
    date: "Mon, May 25",
    time: "9:00am – 10:00am PT",
    duration_min: 60,
    interviewer_ids: DEFAULT_PANEL_IDS,
    interviewer_names: DEFAULT_PANEL_NAMES,
    conflict_count: 0,
    conflicts: [],
  },
  {
    slot_id: "slot_mon_11_30",
    date: "Mon, May 25",
    time: "11:30am – 12:30pm PT",
    duration_min: 60,
    interviewer_ids: DEFAULT_PANEL_IDS,
    interviewer_names: DEFAULT_PANEL_NAMES,
    conflict_count: 1,
    conflicts: [
      {
        interviewer_id: "javier_ramirez",
        interviewer_name: "Javier Ramirez",
        event_title: "Product Demo",
        event_time: "12:00pm – 12:30pm PT",
      },
    ],
  },
  {
    slot_id: "slot_tue_9am",
    date: "Tue, May 26",
    time: "9:00am – 10:00am PT",
    duration_min: 60,
    interviewer_ids: DEFAULT_PANEL_IDS,
    interviewer_names: DEFAULT_PANEL_NAMES,
    conflict_count: 0,
    conflicts: [],
  },
  {
    slot_id: "slot_tue_2pm",
    date: "Tue, May 26",
    time: "2:00pm – 3:00pm PT",
    duration_min: 60,
    interviewer_ids: DEFAULT_PANEL_IDS,
    interviewer_names: DEFAULT_PANEL_NAMES,
    conflict_count: 1,
    conflicts: [
      {
        interviewer_id: "leslie_alexander",
        interviewer_name: "Leslie Alexander",
        event_title: "Client Call",
        event_time: "2:30pm – 3:00pm PT",
      },
    ],
  },
  {
    slot_id: "slot_wed_1pm",
    date: "Wed, May 27",
    time: "1:00pm – 2:00pm PT",
    duration_min: 60,
    interviewer_ids: DEFAULT_PANEL_IDS,
    interviewer_names: DEFAULT_PANEL_NAMES,
    conflict_count: 1,
    conflicts: [
      {
        interviewer_id: "leslie_alexander",
        interviewer_name: "Leslie Alexander",
        event_title: "1:1 weekly with manager",
        event_time: "1:00pm – 1:30pm PT",
      },
    ],
  },
  {
    slot_id: "slot_thu_9am",
    date: "Thu, May 28",
    time: "9:00am – 10:00am PT",
    duration_min: 60,
    interviewer_ids: DEFAULT_PANEL_IDS,
    interviewer_names: DEFAULT_PANEL_NAMES,
    conflict_count: 0,
    conflicts: [],
  },
  {
    slot_id: "slot_fri_11am",
    date: "Fri, May 29",
    time: "11:00am – 12:00pm PT",
    duration_min: 60,
    interviewer_ids: DEFAULT_PANEL_IDS,
    interviewer_names: DEFAULT_PANEL_NAMES,
    conflict_count: 0,
    conflicts: [],
  },
];

const SLOTS_10_DAY_EXTRA: SuggestedSlot[] = [
  {
    slot_id: "slot_mon2_10am",
    date: "Mon, Jun 1",
    time: "10:00am – 11:00am PT",
    duration_min: 60,
    interviewer_ids: DEFAULT_PANEL_IDS,
    interviewer_names: DEFAULT_PANEL_NAMES,
    conflict_count: 0,
    conflicts: [],
  },
  {
    slot_id: "slot_tue2_3pm",
    date: "Tue, Jun 2",
    time: "3:00pm – 4:00pm PT",
    duration_min: 60,
    interviewer_ids: DEFAULT_PANEL_IDS,
    interviewer_names: DEFAULT_PANEL_NAMES,
    conflict_count: 0,
    conflicts: [],
  },
];

function applyRules(slots: SuggestedSlot[]): SuggestedSlot[] {
  const rules = useSchedulingRulesStore.getState().rules;
  if (rules.length === 0) return slots;

  return slots.map((slot) => {
    const remaining = slot.conflicts.filter((c) => {
      const matches = rules.some(
        (r) =>
          r.interviewer_id === c.interviewer_id &&
          r.can_override &&
          (c.event_title.toLowerCase().includes(r.event_pattern.toLowerCase()) ||
            r.event_pattern.toLowerCase().includes(c.event_title.toLowerCase())),
      );
      return !matches;
    });
    return { ...slot, conflicts: remaining, conflict_count: remaining.length };
  });
}

function getRequestForContext(
  store: ReturnType<typeof useSchedulingStateStore.getState>,
  candidateId: string,
  ctx: ToolHandlerContext,
) {
  const scopedApplicationId =
    ctx.scope?.candidateId === candidateId ? ctx.scope.applicationId : undefined;

  return scopedApplicationId
    ? store.getRequestByApplication(scopedApplicationId) ??
        store.getRequestByCandidate(candidateId)
    : store.getRequestByCandidate(candidateId);
}

export const schedulingTools: ToolDefinition[] = [
  {
    name: "get_candidate_info",
    description:
      "Look up a candidate by full name, partial name, or UUID. Returns the candidate's identity, headline, current company/title, and the active application (with req title, current stage, and the interviews scheduled for that stage). Always call this first when scheduling.",
    parameters: {
      type: "object",
      properties: {
        candidate_id: {
          type: "string",
          description:
            "Candidate name (e.g., 'Jordan Kim', 'Jane Warren') or UUID. Fuzzy name match is supported.",
        },
      },
      required: ["candidate_id"],
    },
    handler: async (args, ctx) => {
      const input = String(args.candidate_id ?? "");
      const resolved = await lookupCandidateForAgent(input, ctx.scope);
      if (!resolved)
        return {
          error: `No candidate matching '${input}' found in the ATS.`,
        };
      return resolved;
    },
    summarize: (args, result) => {
      const r = result as { error?: string; name?: string };
      if (r.error) return `Couldn't find ${args.candidate_id}`;
      return `Looked up ${r.name}`;
    },
  },

  {
    name: "get_stage_interviews",
    description:
      "Return the interviews defined for the candidate's current pipeline stage. The count of interviews drives the choice between self-scheduling (exactly 1) and availability request (more than 1). Pass either candidate UUID or name.",
    parameters: {
      type: "object",
      properties: {
        candidate_id: { type: "string" },
      },
      required: ["candidate_id"],
    },
    handler: async (args, ctx) => {
      const resolved = await lookupCandidateForAgent(
        String(args.candidate_id ?? ""),
        ctx.scope,
      );
      if (!resolved) return { error: `Candidate not found.` };
      if (!resolved.application)
        return {
          candidate_id: resolved.id,
          candidate_name: resolved.name,
          error: `${resolved.name} has no active application.`,
        };

      const interviews = resolved.application.stage_interviews;
      return {
        candidate_id: resolved.id,
        candidate_name: resolved.name,
        req_title: resolved.application.req_title,
        stage: resolved.application.stage_name,
        interview_count: interviews.length,
        interviews: interviews.map((i) => ({
          title: i.title,
          duration_minutes: i.duration_minutes,
          interview_type: i.interview_type,
          interviewer_name: i.interviewer_name,
        })),
        interviewer_names: Array.from(
          new Set(interviews.map((i) => i.interviewer_name).filter(Boolean)),
        ) as string[],
      };
    },
    summarize: (_args, result) => {
      const r = result as {
        error?: string;
        stage?: string;
        interview_count?: number;
        candidate_name?: string;
      };
      if (r.error) return r.error;
      return `${r.candidate_name}: ${r.stage} (${r.interview_count} interview${r.interview_count === 1 ? "" : "s"})`;
    },
  },

  {
    name: "get_automatic_suggestions",
    description:
      "Returns possible interview slots over the requested date range. Each slot includes conflict count and details. Pass candidate_availability if the candidate has already submitted windows. Honors stored scheduling rules — pre-approved overrides are filtered out of the conflict list.",
    parameters: {
      type: "object",
      properties: {
        candidate_id: { type: "string" },
        date_range_days: {
          type: "integer",
          enum: [5, 10],
        },
        candidate_availability: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional candidate-stated windows (e.g., 'Mon 9am-12pm', 'Tue 2-5pm'). When provided, narrow suggestions to overlap with these.",
        },
      },
      required: ["candidate_id", "date_range_days"],
    },
    handler: (args) => {
      const days = Number(args.date_range_days);
      const base = days === 10 ? [...SLOTS_5_DAY, ...SLOTS_10_DAY_EXTRA] : SLOTS_5_DAY;
      const adjusted = applyRules(base);
      return {
        date_range: days === 10 ? "next 10 days" : "next 5 days",
        suggestions: adjusted,
        conflict_free_count: adjusted.filter((s) => s.conflict_count === 0).length,
        one_conflict_count: adjusted.filter((s) => s.conflict_count === 1).length,
      };
    },
    summarize: (args, result) => {
      const r = result as { conflict_free_count: number; one_conflict_count: number };
      return `Found ${r.conflict_free_count} conflict-free + ${r.one_conflict_count} 1-conflict slots (${args.date_range_days}d)`;
    },
  },

  {
    name: "send_scheduling_request",
    description:
      "Send the scheduling request email to a candidate. The system generates the canonical email body from the template — you do NOT draft the email yourself. The template choice is determined by the recruiter's explicit instruction first; the interview count is only a fallback when the recruiter didn't specify. See the system prompt for the full decision rule.",
    parameters: {
      type: "object",
      properties: {
        candidate_id: { type: "string" },
        template: {
          type: "string",
          enum: ["self_schedule", "availability_request"],
        },
      },
      required: ["candidate_id", "template"],
    },
    handler: async (args, ctx) => {
      const candidate = await getCandidateById(String(args.candidate_id), ctx.scope);
      if (!candidate) return { error: `Candidate not found.` };

      const store = useSchedulingStateStore.getState();
      const existing = getRequestForContext(store, candidate.id, ctx);
      if (existing) {
        return {
          error: `A scheduling request to ${candidate.name} is already outstanding (status: ${existing.status}).`,
        };
      }

      const template = args.template as "self_schedule" | "availability_request";
      const role = candidate.application?.req_title ?? candidate.headline ?? "the role";
      const interviewDetails: SchedulingInterviewDetail[] =
        candidate.application?.stage_interviews.map((i) => ({
          title: i.title,
          duration_min: i.duration_minutes,
          interviewer_name: i.interviewer_name,
        })) ?? [];

      const subject =
        template === "self_schedule"
          ? `Schedule your interview — ${role}`
          : `Next steps with ACME AI — ${role}`;

      const firstName = candidate.name.split(/\s+/)[0] ?? candidate.name;
      const body =
        template === "self_schedule"
          ? `Hi ${firstName}, great news! We've found times that work for your interview for the ${role} role at ACME AI. Please click the link in the email to pick a time slot.`
          : `Hi ${firstName}, we're excited to move forward with your candidacy for the ${role} role at ACME AI! Please use the link in the email to share your availability.`;

      const req = store.addRequest({
        candidate_id: candidate.id,
        application_id: candidate.application?.id,
        stage_id: candidate.application?.stage_id ?? undefined,
        candidate_name: candidate.name,
        candidate_email: candidate.email ?? "",
        candidate_role: role,
        template,
        email_subject: subject,
        email_body: body,
        interview_details: interviewDetails,
      });

      return {
        status: "sent",
        request_id: req.id,
        template: req.template,
        to: candidate.email,
        to_name: candidate.name,
        role,
        subject,
      };
    },
    summarize: (_args, result) => {
      const r = result as { error?: string; template?: string; to_name?: string };
      if (r.error) return `Send failed: ${r.error}`;
      const template = r.template === "self_schedule" ? "self-schedule" : "availability request";
      return `Sent ${template} email to ${r.to_name ?? "candidate"}`;
    },
  },

  {
    name: "send_scheduling_reminder",
    description:
      "Send a follow-up reminder to a candidate who hasn't responded. Call this when 48 hours have passed since the last contact.",
    parameters: {
      type: "object",
      properties: {
        candidate_id: { type: "string" },
        email_body: { type: "string" },
      },
      required: ["candidate_id", "email_body"],
    },
    handler: (args, ctx) => {
      const id = String(args.candidate_id);
      const store = useSchedulingStateStore.getState();
      const req = getRequestForContext(store, id, ctx);
      if (!req) {
        return { error: `No outstanding scheduling request found for candidate.` };
      }
      store.updateRequest(req.id, {
        last_reminder_at: Date.now(),
        reminder_count: req.reminder_count + 1,
        status: "reminded",
      });
      return {
        status: "reminder_sent",
        reminder_count: req.reminder_count + 1,
        candidate_name: req.candidate_name,
        request_id: req.id,
      };
    },
    summarize: (_args, result) => {
      const r = result as { error?: string; reminder_count?: number; candidate_name?: string };
      if (r.error) return `Reminder failed: ${r.error}`;
      return `Sent reminder #${r.reminder_count} to ${r.candidate_name}`;
    },
  },

  {
    name: "check_candidate_reply",
    description:
      "Check whether the candidate has replied to the most recent scheduling outreach. Returns the reply text and any parsed availability or picked slot.",
    parameters: {
      type: "object",
      properties: {
        candidate_id: { type: "string" },
      },
      required: ["candidate_id"],
    },
    handler: (args, ctx) => {
      const id = String(args.candidate_id);
      const store = useSchedulingStateStore.getState();
      const req = getRequestForContext(store, id, ctx);
      if (!req) return { reply: null, status: "no_outstanding_request" };
      if (!req.candidate_reply)
        return {
          reply: null,
          status: req.status,
          reminders_sent: req.reminder_count,
          candidate_name: req.candidate_name,
        };
      return {
        reply: req.candidate_reply,
        availability: req.candidate_availability,
        picked_slot: req.candidate_picked_slot,
        status: req.status,
        candidate_name: req.candidate_name,
      };
    },
    summarize: (_args, result) => {
      const r = result as { reply: string | null; candidate_name?: string };
      const name = r.candidate_name ?? "candidate";
      return r.reply ? `${name} has replied` : `${name}: no reply yet`;
    },
  },

  {
    name: "resolve_conflict",
    description:
      "Slack an interviewer to ask if they can move a specific conflicting event so an interview can be booked over it. Use this for each conflict in a 1-conflict slot, in parallel if multiple. Pass interviewer_id as either a slug (e.g., 'leslie_alexander') or display name.",
    parameters: {
      type: "object",
      properties: {
        interviewer_id: { type: "string" },
        conflicting_event: { type: "string" },
        conflicting_event_time: { type: "string" },
        candidate_name: { type: "string" },
        candidate_role: { type: "string" },
        proposed_interview_slot: { type: "string" },
        message: {
          type: "string",
          description: "Slack message body. Include candidate name, role, proposed time, and the specific event you're asking them to move.",
        },
      },
      required: [
        "interviewer_id",
        "conflicting_event",
        "candidate_name",
        "proposed_interview_slot",
        "message",
      ],
    },
    handler: (args) => {
      const interviewer = resolveInterviewer(String(args.interviewer_id));

      const dm = useSchedulingStateStore.getState().addSlackDM({
        to_id: interviewer.id,
        to_name: interviewer.name,
        to_role: "interviewer",
        type: "conflict_resolution",
        message: String(args.message),
        metadata: {
          conflicting_event: args.conflicting_event,
          conflicting_event_time: args.conflicting_event_time,
          candidate_name: args.candidate_name,
          candidate_role: args.candidate_role,
          proposed_interview_slot: args.proposed_interview_slot,
        },
      });

      return {
        status: "sent",
        slack_dm_id: dm.id,
        to: interviewer.name,
      };
    },
    summarize: (args) =>
      `Slacked ${resolveInterviewer(String(args.interviewer_id)).name} to move "${args.conflicting_event}"`,
  },

  {
    name: "get_scheduling_rules",
    description:
      "Read stored scheduling rules. Use this BEFORE calling resolve_conflict so you don't ask interviewers to confirm conflicts they've already approved overriding.",
    parameters: {
      type: "object",
      properties: {
        interviewer_id: {
          type: "string",
          description: "Filter to one interviewer. Omit for all rules.",
        },
      },
    },
    handler: (args) => {
      const store = useSchedulingRulesStore.getState();
      if (args.interviewer_id) {
        const interviewer = resolveInterviewer(String(args.interviewer_id));
        return { rules: store.findRules(interviewer.id) };
      }
      return { rules: store.rules };
    },
    summarize: (_args, result) => {
      const r = result as { rules: unknown[] };
      return `Found ${r.rules.length} scheduling rule${r.rules.length === 1 ? "" : "s"}`;
    },
  },

  {
    name: "update_scheduling_rules",
    description:
      "Record a structured rule from a successful conflict resolution. Call this after an interviewer accepted scheduling over a conflict AND confirmed it's safe to do so for similar events in the future.",
    parameters: {
      type: "object",
      properties: {
        interviewer_id: { type: "string" },
        event_pattern: {
          type: "string",
          description: "Short pattern describing the event type (e.g., 'Team Meeting', '1:1 weekly').",
        },
        can_override: { type: "boolean" },
        reason: { type: "string" },
      },
      required: ["interviewer_id", "event_pattern", "can_override", "reason"],
    },
    handler: (args) => {
      const interviewer = resolveInterviewer(String(args.interviewer_id));
      const rule = useSchedulingRulesStore.getState().addRule({
        interviewer_id: interviewer.id,
        interviewer_name: interviewer.name,
        event_pattern: String(args.event_pattern),
        can_override: Boolean(args.can_override),
        reason: String(args.reason),
      });
      return { status: "saved", rule_id: rule.id, interviewer_name: interviewer.name };
    },
    summarize: (args, result) => {
      const r = result as { interviewer_name?: string };
      return `Saved rule: ${r.interviewer_name} → "${args.event_pattern}" override OK`;
    },
  },

  {
    name: "book_interview",
    description:
      "Create the calendar event, send the confirmation email to the candidate, and send calendar invites. Use this once a slot is agreed and the recruiter has approved.",
    parameters: {
      type: "object",
      properties: {
        candidate_id: { type: "string" },
        interviewer_ids: {
          type: "array",
          items: { type: "string" },
        },
        slot: {
          type: "string",
          description: "Agreed slot (e.g., 'Mon, May 25 9:00am – 10:00am PT').",
        },
        duration_min: { type: "integer" },
        include_hackerrank: { type: "boolean" },
        confirmation_email_body: { type: "string" },
      },
      required: ["candidate_id", "interviewer_ids", "slot", "duration_min", "confirmation_email_body"],
    },
    handler: async (args, ctx) => {
      const candidate = await getCandidateById(String(args.candidate_id), ctx.scope);
      if (!candidate) return { error: `Candidate not found.` };

      const interviewerIds = Array.isArray(args.interviewer_ids)
        ? (args.interviewer_ids as string[])
        : [];
      const resolved = interviewerIds.map(resolveInterviewer);

      const store = useSchedulingStateStore.getState();
      const hackerrankLink = args.include_hackerrank
        ? `https://hackerrank.com/test/${Math.random().toString(36).slice(2, 10)}`
        : undefined;
      const booking = store.addBooking({
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        interviewer_ids: resolved.map((i) => i.id),
        interviewer_names: resolved.map((i) => i.name),
        slot: String(args.slot),
        duration_min: Number(args.duration_min),
        hackerrank_link: hackerrankLink,
      });

      const req = getRequestForContext(store, candidate.id, ctx);
      if (req) store.updateRequest(req.id, { status: "completed" });

      return {
        status: "booked",
        booking_id: booking.id,
        event_id: booking.event_id,
        video_link: booking.video_link,
        hackerrank_link: booking.hackerrank_link,
        candidate_name: candidate.name,
        invites_sent_to: [candidate.email, ...resolved.map((i) => i.email)],
      };
    },
    summarize: (args, result) => {
      const r = result as { error?: string; candidate_name?: string };
      if (r.error) return `Booking failed: ${r.error}`;
      return `Booked ${r.candidate_name} for ${args.slot}`;
    },
  },

  {
    name: "notify_scheduler",
    description:
      "Send a notification to the recruiter (scheduler). Produces both a Slack DM and an in-product inbox item. Use type='proposal' when proposing a schedule for approval, 'stuck' when blocked, 'reject_suggestion' when proposing to reject a candidate, 'info' for status updates, 'approved' for confirming a successful booking.",
    parameters: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["proposal", "stuck", "reject_suggestion", "info", "approved"],
        },
        title: { type: "string" },
        body: { type: "string" },
        candidate_id: { type: "string" },
        proposal_slot: { type: "string" },
        proposal_interviewer_ids: { type: "array", items: { type: "string" } },
        proposal_conflicts_resolved: { type: "integer" },
        suggested_reject_reason: { type: "string" },
      },
      required: ["type", "title", "body"],
    },
    handler: (args) => {
      const type = String(args.type) as
        | "proposal"
        | "stuck"
        | "reject_suggestion"
        | "info"
        | "approved";

      const store = useSchedulingStateStore.getState();

      const inboxItem = store.addSchedulerInboxItem({
        type,
        title: String(args.title),
        body: String(args.body),
        candidate_id: args.candidate_id ? String(args.candidate_id) : undefined,
        proposal:
          type === "proposal" && args.proposal_slot
            ? {
                slot: String(args.proposal_slot),
                interviewer_ids: Array.isArray(args.proposal_interviewer_ids)
                  ? (args.proposal_interviewer_ids as string[])
                  : [],
                conflicts_resolved:
                  typeof args.proposal_conflicts_resolved === "number"
                    ? args.proposal_conflicts_resolved
                    : 0,
              }
            : undefined,
        suggested_reject_reason: args.suggested_reject_reason
          ? String(args.suggested_reject_reason)
          : undefined,
      });

      const dm = store.addSlackDM({
        to_id: CURRENT_SCHEDULER.id,
        to_name: CURRENT_SCHEDULER.name,
        to_role: "scheduler",
        type: "notification",
        message: `*${args.title}*\n${args.body}`,
        metadata: { inbox_item_id: inboxItem.id, notification_type: type },
      });

      return {
        status: "sent",
        inbox_item_id: inboxItem.id,
        slack_dm_id: dm.id,
      };
    },
    summarize: (args) => `Notified scheduler: ${args.title}`,
  },

  {
    name: "slack_interviewer",
    description:
      "Send an ad-hoc Slack message to an interviewer (not a conflict resolution). Use for FYI updates, schedule confirmations, etc.",
    parameters: {
      type: "object",
      properties: {
        interviewer_id: { type: "string" },
        message: { type: "string" },
      },
      required: ["interviewer_id", "message"],
    },
    handler: (args) => {
      const interviewer = resolveInterviewer(String(args.interviewer_id));
      const dm = useSchedulingStateStore.getState().addSlackDM({
        to_id: interviewer.id,
        to_name: interviewer.name,
        to_role: "interviewer",
        type: "notification",
        message: String(args.message),
      });
      return { status: "sent", slack_dm_id: dm.id, to_name: interviewer.name };
    },
    summarize: (args) =>
      `Slacked ${resolveInterviewer(String(args.interviewer_id)).name}`,
  },

  {
    name: "present_email_draft",
    description:
      "Show the recruiter an editable email draft card for a non-scheduling email (offer, rejection, follow-up, general outreach). You generate the body_html yourself based on the recruiter's intent. The card lets the recruiter review and send. Do NOT use this for scheduling emails — those go through send_scheduling_request.",
    parameters: {
      type: "object",
      properties: {
        candidate_id: { type: "string", description: "Candidate name or UUID" },
        subject: { type: "string", description: "Email subject line" },
        body_html: {
          type: "string",
          description: "HTML email body. Use only <p>, <br>, <strong>, <em>, <ul>, <ol>, <li> tags. Start with greeting, end with sign-off.",
        },
        summary: {
          type: "string",
          description: "One-sentence summary shown in chat above the card (e.g., 'Drafted an offer letter for Jane Warren.').",
        },
      },
      required: ["candidate_id", "subject", "body_html", "summary"],
    },
    handler: async (args) => {
      const candidate = await getCandidateById(String(args.candidate_id));
      if (!candidate) return { error: `Candidate not found.` };

      useChatStore.getState().addMessage({
        role: "assistant",
        content: String(args.summary),
        metadata: {
          type: "email_draft",
          candidateName: candidate.name,
          candidateEmail: candidate.email ?? "",
          jobTitle: candidate.application?.req_title ?? candidate.headline ?? "",
          bodyHtml: String(args.body_html),
        },
      });

      return {
        status: "presented",
        candidate_name: candidate.name,
        candidate_email: candidate.email,
        subject: String(args.subject),
      };
    },
    summarize: (_args, result) => {
      const r = result as { error?: string; candidate_name?: string };
      if (r.error) return `Draft failed: ${r.error}`;
      return `Drafted email for ${r.candidate_name}`;
    },
  },

  {
    name: "slack_scheduler",
    description:
      "Send an ad-hoc Slack message to the recruiter (scheduler). Use for conversational replies. For structured notifications, use notify_scheduler instead.",
    parameters: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
      required: ["message"],
    },
    handler: (args) => {
      const dm = useSchedulingStateStore.getState().addSlackDM({
        to_id: CURRENT_SCHEDULER.id,
        to_name: CURRENT_SCHEDULER.name,
        to_role: "scheduler",
        type: "notification",
        message: String(args.message),
      });
      return { status: "sent", slack_dm_id: dm.id };
    },
    summarize: () => `Slacked scheduler`,
  },
];

export const DEMO_DATA = {
  interviewers: DEMO_INTERVIEWERS,
  interviewerDirectory: INTERVIEWER_DIRECTORY,
  currentScheduler: CURRENT_SCHEDULER,
};
