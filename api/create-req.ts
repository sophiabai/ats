import { createClient } from "@supabase/supabase-js";

export const config = { runtime: "edge" };

const supabase = createClient(
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const DEFAULT_STAGES = [
  { milestone: "screen", name: "Recruiter Screen", sort_order: 1 },
  { milestone: "screen", name: "Hiring Manager Screen", sort_order: 2 },
  { milestone: "final_interview", name: "Onsite Interview", sort_order: 1 },
  { milestone: "final_interview", name: "Reference Check", sort_order: 2 },
];

const DEFAULT_INTERVIEWS: Record<
  string,
  Array<{
    title: string;
    interview_type: string;
    order_position: number | null;
  }>
> = {
  "Recruiter Screen": [
    { title: "Recruiter Screen", interview_type: "standard", order_position: 1 },
  ],
  "Hiring Manager Screen": [
    {
      title: "Hiring Manager Screen",
      interview_type: "standard",
      order_position: 1,
    },
  ],
  "Onsite Interview": [
    { title: "Interview 1", interview_type: "standard", order_position: null },
    { title: "Interview 2", interview_type: "standard", order_position: null },
    { title: "Interview 3", interview_type: "standard", order_position: null },
  ],
  "Reference Check": [
    {
      title: "Reference Check",
      interview_type: "reference_check",
      order_position: 1,
    },
  ],
};

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const reqData = await req.json();

    const { data: requisition, error: reqError } = await supabase
      .from("requisitions")
      .insert(reqData)
      .select()
      .single();

    if (reqError) throw reqError;

    const stagesToInsert = DEFAULT_STAGES.map((s) => ({
      req_id: requisition.id,
      ...s,
    }));

    const { data: stages, error: stageError } = await supabase
      .from("req_stages")
      .insert(stagesToInsert)
      .select();

    if (stageError) throw stageError;

    const interviewsToInsert = stages.flatMap((stage) => {
      const defaults = DEFAULT_INTERVIEWS[stage.name] ?? [];
      return defaults.map((i) => ({
        req_id: requisition.id,
        stage_id: stage.id,
        ...i,
        duration_minutes: 60,
      }));
    });

    if (interviewsToInsert.length > 0) {
      const { error: intError } = await supabase
        .from("req_interviews")
        .insert(interviewsToInsert);

      if (intError) throw intError;
    }

    return new Response(JSON.stringify(requisition), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Create req error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create requisition" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
