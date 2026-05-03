import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

interface DraftEmailBody {
  prompt: string;
  senderName?: string;
  companyName?: string;
  model?: string;
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const {
      prompt,
      senderName = "You",
      companyName = "Your company",
      model = "gpt-4o-mini",
    } = (await req.json()) as DraftEmailBody;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const response = await openai.chat.completions.create({
      model,
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
    if (!match) {
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(match[0], {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Draft email error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to draft email" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
