import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS, DEFAULT_MODEL } from "@/lib/constants"
import type { SopStep } from "../types"

const SYSTEM_PROMPT = `You are a workflow builder assistant. The user will describe a business process in natural language. Parse it into a structured SOP (Standard Operating Procedure) as a JSON array of steps.

Each step must have:
- "id": a unique string (use "step-1", "step-2", etc.)
- "stepNumber": integer starting from 1
- "type": one of "action", "decision", or "manual"
  - "action" = an automated system action (sending emails, moving records, notifications, data capture)
  - "decision" = a conditional branch point (if/then, qualification checks, routing logic)
  - "manual" = a step requiring human judgment (interviews, evaluations, approvals)
- "label": a short uppercase label for the step type badge (e.g. "ACTION", "DECISION", "MANUAL STEP")
- "description": a clear, natural-language paragraph describing what happens in this step. Write it like an internal process doc — complete sentences, not bullet shorthand.
- "branches": (only for "decision" type) an array of outcome objects, each with:
  - "label": the outcome name (e.g. "Qualified", "Not qualified", "Pass", "Fail")
  - "description": a paragraph describing what happens for this outcome

Guidelines:
- Break the process into discrete, logical steps
- Identify branch points where the process splits based on conditions
- Mark steps that require human judgment as "manual"
- Keep descriptions clear and complete — each should read like a paragraph in a process document
- Typically produce 3-8 steps for a standard workflow
- If the input is vague, make reasonable assumptions for a recruiting/HR context

Respond with ONLY valid JSON — an array of step objects. No other text.`

async function generateViaApi(input: string): Promise<SopStep[]> {
  const { content } = await apiClient<{ content: string }>(
    API_ENDPOINTS.aiGenerate,
    {
      method: "POST",
      body: {
        prompt: `${SYSTEM_PROMPT}\n\nUser input:\n${input}`,
      },
    },
  )
  const match = content.match(/\[[\s\S]*\]/)
  if (!match) throw new Error("Failed to parse SOP response")
  return JSON.parse(match[0]) as SopStep[]
}

async function generateDirect(input: string): Promise<SopStep[]> {
  const { default: OpenAI } = await import("openai")
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  })

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: input },
    ],
  })

  const raw = response.choices[0]?.message?.content ?? ""
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) throw new Error("Failed to parse SOP response")
  return JSON.parse(match[0]) as SopStep[]
}

const generateSop = import.meta.env.DEV ? generateDirect : generateViaApi

export function useGenerateSop() {
  return useMutation({ mutationFn: generateSop })
}
