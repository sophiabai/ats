export const APP_NAME = "ATS";

export const API_ENDPOINTS = {
  chat: "/api/chat",
  createReq: "/api/create-req",
  apply: "/api/apply",
  syncInterviews: "/api/sync-interviews",
} as const;

export const DEFAULT_MODEL = "gpt-4o" as const;

export const MILESTONES = [
  "application",
  "screen",
  "final_interview",
  "offer",
  "offer_accepted",
] as const;
