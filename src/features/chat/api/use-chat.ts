import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, DEFAULT_MODEL } from "@/lib/constants";
import type { ChatMessage } from "@/types";

interface ChatResponse {
  role: "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are a helpful recruiting assistant for an applicant tracking system.
Help the user with tasks like summarizing candidates, drafting outreach emails,
comparing applicants, and answering questions about their hiring pipeline.
Keep responses concise and actionable.

When you perform an action, briefly explain your reasoning:
- "I'm scheduling this as a technical interview because Sarah is in the technical stage"
- "I'd recommend rejecting this candidate because [reasons from assessment]"

When asked to evaluate a candidate, structure your response as JSON:
{
  "reasoning": {
    "steps": [
      { "title": "Resume Analysis", "content": "..." },
      { "title": "Skills Match", "content": "..." },
      { "title": "Experience Assessment", "content": "..." },
      { "title": "Potential Concerns", "content": "..." }
    ],
    "confidence": "high" | "medium" | "low"
  },
  "result": {
    "overall_score": 4.2,
    "technical_score": 4.5,
    "communication_score": 3.8,
    "culture_score": 4.0,
    "summary": "...",
    "strengths": ["...", "..."],
    "concerns": ["...", "..."],
    "recommendation": "strong_yes" | "yes" | "neutral" | "no" | "strong_no"
  }
}

Always provide reasoning steps BEFORE the final result. Think through each dimension carefully.
For non-evaluation questions, respond in plain text.`;

function withSystemPrompt(messages: ChatMessage[]): ChatMessage[] {
  return [{ role: "system", content: SYSTEM_PROMPT }, ...messages];
}

async function sendViaApi(messages: ChatMessage[]): Promise<ChatResponse> {
  return apiClient<ChatResponse>(API_ENDPOINTS.chat, {
    method: "POST",
    body: { messages: withSystemPrompt(messages) },
  });
}

async function sendDirect(messages: ChatMessage[]): Promise<ChatResponse> {
  // Dynamic import keeps the openai SDK out of the production bundle.
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: withSystemPrompt(messages),
  });

  return {
    role: "assistant",
    content: response.choices[0]?.message?.content ?? "",
  };
}

const sendMessage = import.meta.env.DEV ? sendDirect : sendViaApi;

export function useChat() {
  return useMutation({ mutationFn: sendMessage });
}
