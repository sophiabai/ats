export const APP_NAME = "ATS";

export const API_ENDPOINTS = {
  chat: "/api/chat",
  aiGenerate: "/api/ai-generate",
  parseReq: "/api/parse-req",
  draftEmail: "/api/draft-email",
  createReq: "/api/create-req",
  apply: "/api/apply",
  syncInterviews: "/api/sync-interviews",
} as const;

export const DEFAULT_MODEL = "gpt-4o" as const;

// Demo-app identity for the currently signed-in recruiter.
export const CURRENT_USER = {
  name: "Anne Montgomery",
  company: "ACME AI",
} as const;

export const MILESTONES = [
  "application",
  "screen",
  "final_interview",
  "offer",
  "offer_accepted",
] as const;
