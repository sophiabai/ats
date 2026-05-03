import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface InterviewInput {
  title: string;
  interview_type: string;
  duration_minutes: number;
  interviewer_name: string | null;
  interviewer_email: string | null;
  order_position: number | null;
  instructions: string | null;
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { application_id, stage_id, interviews, push_to_req } =
      (await req.json()) as {
        application_id: string;
        stage_id: string;
        interviews: InterviewInput[];
        push_to_req?: boolean;
      };

    await supabase
      .from("application_interviews")
      .delete()
      .eq("application_id", application_id)
      .eq("stage_id", stage_id);

    const appInterviews = interviews.map((i) => ({
      application_id,
      stage_id,
      ...i,
      status: "pending" as const,
    }));

    await supabase.from("application_interviews").insert(appInterviews);

    if (push_to_req) {
      const { data: app } = await supabase
        .from("applications")
        .select("req_id")
        .eq("id", application_id)
        .single();

      if (app) {
        await supabase
          .from("req_interviews")
          .delete()
          .eq("req_id", app.req_id)
          .eq("stage_id", stage_id);

        const reqInterviews = interviews.map((i) => ({
          req_id: app.req_id,
          stage_id,
          title: i.title,
          interview_type: i.interview_type,
          duration_minutes: i.duration_minutes,
          interviewer_name: i.interviewer_name,
          interviewer_email: i.interviewer_email,
          order_position: i.order_position,
          instructions: i.instructions,
        }));

        await supabase.from("req_interviews").insert(reqInterviews);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to sync interviews" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
