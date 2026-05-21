import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ScheduleRequestStatus =
  | "sent"
  | "reminded"
  | "replied"
  | "completed"
  | "ghosted"
  | "cancelled";

export interface SchedulingInterviewDetail {
  title: string;
  duration_min: number;
  interviewer_name: string | null;
}

export interface SchedulingRequest {
  id: string;
  candidate_id: string;
  application_id?: string;
  stage_id?: string;
  candidate_name: string;
  candidate_email: string;
  candidate_role: string;
  template: "self_schedule" | "availability_request";
  email_subject: string;
  email_body: string;
  interview_details?: SchedulingInterviewDetail[];
  sent_at: number;
  last_reminder_at?: number;
  reminder_count: number;
  status: ScheduleRequestStatus;
  candidate_reply?: string;
  candidate_availability?: string[];
  candidate_picked_slot?: string;
}

export interface SlackDM {
  id: string;
  to_id: string;
  to_name: string;
  to_role: "interviewer" | "scheduler";
  type: "conflict_resolution" | "rule_preference_check" | "notification";
  message: string;
  sent_at: number;
  status: "sent" | "accepted" | "rejected" | "replied";
  reply?: string;
  metadata?: Record<string, unknown>;
}

export interface SchedulerInboxItem {
  id: string;
  type: "proposal" | "stuck" | "reject_suggestion" | "info" | "approved";
  title: string;
  body: string;
  candidate_id?: string;
  created_at: number;
  read: boolean;
  proposal?: {
    slot: string;
    interviewer_ids: string[];
    conflicts_resolved: number;
  };
  suggested_reject_reason?: string;
}

export interface InterviewBooking {
  id: string;
  candidate_id: string;
  candidate_name: string;
  interviewer_ids: string[];
  interviewer_names: string[];
  slot: string;
  duration_min: number;
  event_id: string;
  video_link: string;
  hackerrank_link?: string;
  booked_at: number;
}

interface SchedulingState {
  requests: SchedulingRequest[];
  slackDMs: SlackDM[];
  schedulerInbox: SchedulerInboxItem[];
  bookings: InterviewBooking[];

  addRequest: (
    req: Omit<SchedulingRequest, "id" | "sent_at" | "reminder_count" | "status">,
  ) => SchedulingRequest;
  updateRequest: (id: string, patch: Partial<SchedulingRequest>) => void;
  getRequestByCandidate: (candidate_id: string) => SchedulingRequest | undefined;
  getRequestByApplication: (application_id: string) => SchedulingRequest | undefined;

  addSlackDM: (dm: Omit<SlackDM, "id" | "sent_at" | "status">) => SlackDM;
  updateSlackDM: (id: string, patch: Partial<SlackDM>) => void;

  addSchedulerInboxItem: (item: Omit<SchedulerInboxItem, "id" | "created_at" | "read">) => SchedulerInboxItem;

  addBooking: (booking: Omit<InterviewBooking, "id" | "booked_at" | "event_id" | "video_link">) => InterviewBooking;

  resetAll: () => void;
}

function nextId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useSchedulingStateStore = create<SchedulingState>()(
  persist(
    (set, get) => ({
      requests: [],
      slackDMs: [],
      schedulerInbox: [],
      bookings: [],

      addRequest: (req) => {
        const newReq: SchedulingRequest = {
          ...req,
          id: nextId("req"),
          sent_at: Date.now(),
          reminder_count: 0,
          status: "sent",
        };
        set((s) => ({ requests: [...s.requests, newReq] }));
        return newReq;
      },

      updateRequest: (id, patch) =>
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      getRequestByCandidate: (candidate_id) =>
        [...get().requests]
          .reverse()
          .find(
            (r) =>
              r.candidate_id === candidate_id &&
              r.status !== "cancelled" &&
              r.status !== "completed",
          ),

      getRequestByApplication: (application_id) =>
        [...get().requests]
          .reverse()
          .find(
            (r) =>
              r.application_id === application_id &&
              r.status !== "cancelled" &&
              r.status !== "completed",
          ),

      addSlackDM: (dm) => {
        const newDm: SlackDM = {
          ...dm,
          id: nextId("slack"),
          sent_at: Date.now(),
          status: "sent",
        };
        set((s) => ({ slackDMs: [...s.slackDMs, newDm] }));
        return newDm;
      },

      updateSlackDM: (id, patch) =>
        set((s) => ({
          slackDMs: s.slackDMs.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),

      addSchedulerInboxItem: (item) => {
        const newItem: SchedulerInboxItem = {
          ...item,
          id: nextId("inbox"),
          created_at: Date.now(),
          read: false,
        };
        set((s) => ({ schedulerInbox: [...s.schedulerInbox, newItem] }));
        return newItem;
      },

      addBooking: (booking) => {
        const id = nextId("book");
        const newBooking: InterviewBooking = {
          ...booking,
          id,
          event_id: `evt_${id}`,
          video_link: `https://meet.example.com/${id}`,
          booked_at: Date.now(),
        };
        set((s) => ({ bookings: [...s.bookings, newBooking] }));
        return newBooking;
      },

      resetAll: () =>
        set({ requests: [], slackDMs: [], schedulerInbox: [], bookings: [] }),
    }),
    { name: "scheduling-state" },
  ),
);
