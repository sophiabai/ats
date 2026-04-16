export const APP_NAME = "ATS";

export const API_ENDPOINTS = {
  chat: "/api/chat",
  aiGenerate: "/api/ai-generate",
  parseReq: "/api/parse-req",
  createReq: "/api/create-req",
  apply: "/api/apply",
  syncInterviews: "/api/sync-interviews",
  generateSop: "/api/generate-sop",
  generateWorkflow: "/api/generate-workflow",
} as const;

export const DEFAULT_MODEL = "gpt-4o" as const;

export const MILESTONES = [
  "application",
  "screen",
  "final_interview",
  "offer",
  "offer_accepted",
] as const;
