export type MessageRole = "user" | "assistant" | "system";

export interface ReqDraftFormData {
  title: string;
  department: string;
  employment_type: string;
  level: string;
  hiring_manager_name: string;
  recruiter_name: string;
  include_coordinator: boolean;
  coordinator_name: string;
  include_sourcer: boolean;
  sourcer_name: string;
}

export interface ReqDraftMetadata {
  type: "req_draft";
  formData: ReqDraftFormData;
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
  command?: string;
  metadata?: ReqDraftMetadata;
}
