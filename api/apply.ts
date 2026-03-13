import { createClient } from "@supabase/supabase-js";

export const config = { runtime: "edge" };

const supabase = createClient(
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { candidate_id, req_id, source, referrer_name } = await req.json();

    const { data: application, error: appError } = await supabase
      .from("applications")
      .insert({
        candidate_id,
        req_id,
        source,
        referrer_name,
        current_milestone: "application",
      })
      .select()
      .single();

    if (appError) throw appError;

    const { data: reqInterviews, error: riError } = await supabase
      .from("req_interviews")
      .select("*")
      .eq("req_id", req_id);

    if (riError) throw riError;

    if (reqInterviews && reqInterviews.length > 0) {
      const appInterviews = reqInterviews.map((ri) => ({
        application_id: application.id,
        stage_id: ri.stage_id,
        source_req_interview_id: ri.id,
        title: ri.title,
        interview_type: ri.interview_type,
        duration_minutes: ri.duration_minutes,
        interviewer_name: ri.interviewer_name,
        interviewer_email: ri.interviewer_email,
        order_position: ri.order_position,
        instructions: ri.instructions,
        status: "pending",
      }));

      const { error: insertError } = await supabase
        .from("application_interviews")
        .insert(appInterviews);

      if (insertError) throw insertError;
    }

    return new Response(JSON.stringify(application), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Apply error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create application" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
