import { useMutation } from "@tanstack/react-query";
import OpenAI from "openai";
import { DEFAULT_MODEL } from "@/lib/constants";
import type { ChatMessage, ReqDraftFormData } from "@/types";

export interface ParseReqResult {
  message: string;
  formData: ReqDraftFormData;
}

const SYSTEM_PROMPT = `You are a recruiting assistant that parses natural language job requisition descriptions into structured data.

Given a user's description of a role, extract the following fields. Use your best judgment for any field not explicitly stated, and leave fields empty ("") if you truly cannot infer them.

Fields:
- title (string): The job title, e.g. "Senior Software Engineer"
- department (string): One of: "Any department", "Engineering", "Product", "Design", "Sales", "Marketing", "Customer Success", "AI Research". Pick the best match.
- employment_type (string): One of: "full_time", "part_time", "contract", "intern". Default to "full_time" if not specified.
- level (string): A level like "L3", "L4", "L5", "L6", "Staff", "Senior", "Principal", "Junior". Infer from seniority keywords.
- hiring_manager_name (string): Name of hiring manager if mentioned.
- recruiter_name (string): Name of recruiter if mentioned.
- include_coordinator (boolean): true if a coordinator is mentioned.
- coordinator_name (string): Name of coordinator if mentioned.
- include_sourcer (boolean): true if a sourcer is mentioned.
- sourcer_name (string): Name of sourcer if mentioned.

IMPORTANT: When you make assumptions (e.g. inferring "senior" → "L5", or guessing department from team name), call them out in the message field so the user knows. When referencing specific values or terms, wrap them in backticks, e.g. \`Infra team\` → \`Engineering\`, \`senior\` → \`L5\`. This makes them stand out visually.

Respond with ONLY valid JSON in this exact format, no other text:
{
  "message": "Here's what I've put together for the requisition. [call out any assumptions]",
  "formData": {
    "title": "",
    "department": "",
    "employment_type": "",
    "level": "",
    "hiring_manager_name": "",
    "recruiter_name": "",
    "include_coordinator": false,
    "coordinator_name": "",
    "include_sourcer": false,
    "sourcer_name": ""
  }
}`;

async function parseRequisition(
  messages: ChatMessage[],
): Promise<ParseReqResult> {
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Failed to parse AI response");
  return JSON.parse(match[0]) as ParseReqResult;
}

export function useParseRequisition() {
  return useMutation({ mutationFn: parseRequisition });
}
