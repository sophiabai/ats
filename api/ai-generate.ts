import OpenAI from "openai";

// Node runtime on Fluid Compute bills active CPU only, so the long await on
// OpenAI doesn't accrue duration cost. Hoisting the client lets warm
// invocations reuse it.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { prompt, model = "gpt-4o-mini" } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "prompt string is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    return new Response(
      JSON.stringify({ content: response.choices[0]?.message?.content ?? "" }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("AI generate error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
