import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, DEFAULT_MODEL } from "@/lib/constants";
import type { CriteriaEvaluation, Candidate } from "@/types";

export type EvaluationMap = Map<
  string,
  { criterion: string; met: boolean; reasoning: string | null }[]
>;

export function useCriteriaEvaluations(reqId: string | undefined) {
  return useQuery({
    queryKey: ["criteria-evaluations", reqId],
    queryFn: async (): Promise<EvaluationMap> => {
      const { data, error } = await supabase
        .from("criteria_evaluations")
        .select("*")
        .eq("req_id", reqId!);

      if (error) throw error;

      const map: EvaluationMap = new Map();
      for (const row of data as CriteriaEvaluation[]) {
        const existing = map.get(row.candidate_id) ?? [];
        existing.push({
          criterion: row.criterion,
          met: row.met,
          reasoning: row.reasoning,
        });
        map.set(row.candidate_id, existing);
      }
      return map;
    },
    enabled: !!reqId,
  });
}

interface EvaluateCandidateInput {
  reqId: string;
  candidateId: string;
  criteria: string[];
  candidate: Candidate;
}

const EVAL_SYSTEM_PROMPT = `You are a recruiting evaluation assistant. Given a candidate's profile and a list of assessment criteria for a job requisition, evaluate whether the candidate meets each criterion.

For each criterion, respond with:
- "criterion": the exact criterion text
- "met": true or false
- "reasoning": a brief 1-2 sentence explanation

Respond with ONLY a valid JSON array, no other text:
[{ "criterion": "...", "met": true/false, "reasoning": "..." }]`;

function buildCandidateContext(c: Candidate): string {
  const parts: string[] = [
    `Name: ${c.first_name} ${c.last_name}`,
    c.current_title ? `Current title: ${c.current_title}` : "",
    c.current_company ? `Current company: ${c.current_company}` : "",
    c.location ? `Location: ${c.location}` : "",
    c.years_experience != null
      ? `Years of experience: ${c.years_experience}`
      : "",
    c.skills?.length ? `Skills: ${c.skills.join(", ")}` : "",
    c.headline ? `Headline: ${c.headline}` : "",
  ];

  if (c.work_history?.length) {
    parts.push(
      "Work history:\n" +
        c.work_history
          .map(
            (w) =>
              `- ${w.title} at ${w.company}${w.start_date ? ` (${w.start_date}–${w.end_date ?? "present"})` : ""}${w.description ? `: ${w.description}` : ""}`,
          )
          .join("\n"),
    );
  }

  if (c.education?.length) {
    parts.push(
      "Education:\n" +
        c.education
          .map(
            (e) =>
              `- ${e.degree}${e.field ? ` in ${e.field}` : ""} from ${e.school}${e.end_year ? ` (${e.end_year})` : ""}`,
          )
          .join("\n"),
    );
  }

  return parts.filter(Boolean).join("\n");
}

async function evaluateDirect(
  input: EvaluateCandidateInput,
): Promise<{ criterion: string; met: boolean; reasoning: string }[]> {
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const userPrompt = `Candidate profile:\n${buildCandidateContext(input.candidate)}\n\nAssessment criteria:\n${input.criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: EVAL_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Failed to parse AI evaluation response");
  return JSON.parse(match[0]);
}

async function evaluateViaApi(
  input: EvaluateCandidateInput,
): Promise<{ criterion: string; met: boolean; reasoning: string }[]> {
  return apiClient<{ criterion: string; met: boolean; reasoning: string }[]>(
    API_ENDPOINTS.aiGenerate,
    {
      method: "POST",
      body: {
        type: "evaluate-criteria",
        candidateProfile: buildCandidateContext(input.candidate),
        criteria: input.criteria,
      },
    },
  );
}

const evaluateCandidate = import.meta.env.DEV
  ? evaluateDirect
  : evaluateViaApi;

export function useEvaluateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EvaluateCandidateInput) => {
      const results = await evaluateCandidate(input);

      const rows = results.map((r) => ({
        req_id: input.reqId,
        candidate_id: input.candidateId,
        criterion: r.criterion,
        met: r.met,
        reasoning: r.reasoning,
      }));

      const { error } = await supabase
        .from("criteria_evaluations")
        .upsert(rows, { onConflict: "req_id,candidate_id,criterion" });

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey: ["criteria-evaluations", input.reqId],
      });

      return results;
    },
  });
}
