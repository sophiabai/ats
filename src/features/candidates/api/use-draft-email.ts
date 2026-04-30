import { useMutation } from "@tanstack/react-query";
import OpenAI from "openai";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, DEFAULT_MODEL } from "@/lib/constants";

export interface DraftEmailInput {
  prompt: string;
  senderName?: string;
  companyName?: string;
}

export interface DraftEmailResult {
  recipientName: string;
  bodyHtml: string;
  message: string;
}

const SYSTEM_PROMPT = `You are a recruiting assistant that drafts outreach emails from natural language instructions.

The user will send a message like "email Jane Warren asking if they want to hop on a quick call to discuss the offer details". You must:

1. Extract the recipient's full name (first + last) from the instruction.
2. Draft a polished, professional email body in HTML based on the intent.

HTML rules for the body:
- Use only <p>, <br>, <strong>, <em>, <ul>, <ol>, <li> tags.
- Wrap every paragraph in a <p>. No divs or spans.
- Start with a greeting like "<p>Hi <FIRST_NAME>,</p>" (use just the first name).
- End with "<p>Best,</p><p><SENDER_NAME></p>" using the provided sender name.
- Keep the body to 2-4 short paragraphs. No subject line.
- If the instruction references the candidate's role or company, reference them naturally.
- Do not include placeholder tokens like {{ }} — spell out the actual names.

Respond with ONLY valid JSON in this exact format, no other text:
{
  "recipientName": "First Last",
  "bodyHtml": "<p>...</p>",
  "message": "One-sentence summary of the draft, referring to the recipient by name."
}`;

async function draftViaApi(input: DraftEmailInput): Promise<DraftEmailResult> {
  return apiClient<DraftEmailResult>(API_ENDPOINTS.draftEmail, {
    method: "POST",
    body: input,
  });
}

async function draftDirect(input: DraftEmailInput): Promise<DraftEmailResult> {
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const { prompt, senderName = "You", companyName = "Your company" } = input;

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Sender name: ${senderName}\nCompany: ${companyName}\n\nInstruction: ${prompt}`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Failed to parse AI response");
  return JSON.parse(match[0]) as DraftEmailResult;
}

const draftEmail = import.meta.env.DEV ? draftDirect : draftViaApi;

export function useDraftEmail() {
  return useMutation({ mutationFn: draftEmail });
}
