import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export type AgentThreadMessage = ChatCompletionMessageParam;

export interface SchedulingAgentScope {
  candidateId?: string;
  applicationId?: string;
  stageId?: string;
}

export interface ToolCallLogEntry {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  status: "pending" | "success" | "error";
  result?: unknown;
  error?: string;
  summary?: string;
}

export interface ToolHandlerContext {
  threadId: string;
  scope?: SchedulingAgentScope;
}

export type ToolHandler = (
  args: Record<string, unknown>,
  ctx: ToolHandlerContext,
) => Promise<unknown> | unknown;

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: ToolHandler;
  summarize?: (args: Record<string, unknown>, result: unknown) => string;
}
