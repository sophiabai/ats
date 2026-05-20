import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageFunctionToolCall,
} from "openai/resources/chat/completions";
import { DEFAULT_MODEL } from "@/lib/constants";
import { SCHEDULING_AGENT_SYSTEM_PROMPT } from "@/features/scheduling-agent/system-prompt";
import {
  getOpenAiToolSchemas,
  getTool,
} from "@/features/scheduling-agent/tools";
import type {
  ToolCallLogEntry,
  ToolHandlerContext,
} from "@/features/scheduling-agent/types";

const MAX_TURNS = 10;

export interface AgentRunCallbacks {
  onToolCallBatch?: (entries: ToolCallLogEntry[]) => void;
  onToolCallComplete?: (entry: ToolCallLogEntry) => void;
  onAssistantText?: (text: string) => void;
}

export interface AgentRunResult {
  finalThread: ChatCompletionMessageParam[];
  finalText: string;
}

async function callModel(
  thread: ChatCompletionMessageParam[],
): Promise<{
  message: ChatCompletionMessageParam;
  toolCalls: ChatCompletionMessageFunctionToolCall[];
  text: string;
}> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: SCHEDULING_AGENT_SYSTEM_PROMPT },
      ...thread,
    ],
    tools: getOpenAiToolSchemas(),
    tool_choice: "auto",
  });

  const choice = response.choices[0];
  const message = choice.message;
  const toolCalls = (message.tool_calls ?? []).filter(
    (tc): tc is ChatCompletionMessageFunctionToolCall => tc.type === "function",
  );

  return {
    message: message as ChatCompletionMessageParam,
    toolCalls,
    text: message.content ?? "",
  };
}

export async function runAgent(
  thread: ChatCompletionMessageParam[],
  userInput: string,
  ctx: ToolHandlerContext,
  callbacks: AgentRunCallbacks = {},
): Promise<AgentRunResult> {
  const working: ChatCompletionMessageParam[] = [
    ...thread,
    { role: "user", content: userInput },
  ];

  let finalText = "";

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const { message, toolCalls, text } = await callModel(working);
    working.push(message);

    if (text) {
      finalText = text;
      callbacks.onAssistantText?.(text);
    }

    if (toolCalls.length === 0) break;

    const entries: ToolCallLogEntry[] = toolCalls.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: safeParseJson(tc.function.arguments),
      status: "pending",
    }));
    callbacks.onToolCallBatch?.(entries);

    for (const tc of toolCalls) {
      const def = getTool(tc.function.name);
      const args = safeParseJson(tc.function.arguments);
      const entry = entries.find((e) => e.id === tc.id);

      if (!def) {
        const errMsg = `Unknown tool: ${tc.function.name}`;
        if (entry) {
          entry.status = "error";
          entry.error = errMsg;
          callbacks.onToolCallComplete?.(entry);
        }
        working.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify({ error: errMsg }),
        });
        continue;
      }

      try {
        const result = await def.handler(args, ctx);
        if (entry) {
          entry.status = "success";
          entry.result = result;
          entry.summary = def.summarize?.(args, result);
          callbacks.onToolCallComplete?.(entry);
        }
        working.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (entry) {
          entry.status = "error";
          entry.error = errMsg;
          callbacks.onToolCallComplete?.(entry);
        }
        working.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify({ error: errMsg }),
        });
      }
    }
  }

  return { finalThread: working, finalText };
}

function safeParseJson(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
