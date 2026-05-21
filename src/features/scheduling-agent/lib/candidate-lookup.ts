import { supabase } from "@/lib/supabase";
import type { SchedulingAgentScope } from "@/features/scheduling-agent/types";

export interface ResolvedStageInterview {
  id: string;
  title: string;
  interview_type: string;
  duration_minutes: number;
  interviewer_name: string | null;
  interviewer_email: string | null;
  order_position: number | null;
}

export interface ResolvedApplication {
  id: string;
  status: string;
  milestone: string;
  stage_id: string | null;
  stage_name: string | null;
  req_id: string | null;
  req_title: string | null;
  stage_interviews: ResolvedStageInterview[];
}

export interface ResolvedCandidate {
  id: string;
  name: string;
  email: string | null;
  headline: string | null;
  current_company: string | null;
  current_title: string | null;
  application: ResolvedApplication | null;
  applications_summary: Array<{
    id: string;
    req_title: string | null;
    stage_name: string | null;
    status: string;
  }>;
}

interface CandidateRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  headline: string | null;
  current_company: string | null;
  current_title: string | null;
}

interface ApplicationRow {
  id: string;
  candidate_id: string;
  status: string;
  current_milestone: string;
  current_stage_id: string | null;
  created_at: string;
  requisitions: { id: string; title: string } | null;
  current_stage: { id: string; name: string } | null;
}

const isUuid = (s: string): boolean => /^[0-9a-f-]{20,}$/i.test(s);

async function findCandidateRow(input: string): Promise<CandidateRow | null> {
  const raw = input.trim();
  if (!raw) return null;

  const columns = "id, first_name, last_name, email, headline, current_company, current_title";

  if (isUuid(raw)) {
    const { data } = await supabase
      .from("candidates")
      .select(columns)
      .eq("id", raw)
      .maybeSingle();
    if (data) return data as CandidateRow;
  }

  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0];
    const last = parts.slice(1).join(" ");
    const { data } = await supabase
      .from("candidates")
      .select(columns)
      .ilike("first_name", `%${first}%`)
      .ilike("last_name", `%${last}%`)
      .limit(1);
    if (data?.[0]) return data[0] as CandidateRow;
  }

  const single = raw.replace(/[%_]/g, "\\$&");
  const { data } = await supabase
    .from("candidates")
    .select(columns)
    .or(`first_name.ilike.%${single}%,last_name.ilike.%${single}%`)
    .limit(1);
  return (data?.[0] as CandidateRow | undefined) ?? null;
}

async function fetchActiveApplication(candidate_id: string): Promise<ApplicationRow | null> {
  const { data } = await supabase
    .from("applications")
    .select(`
      id, candidate_id, status, current_milestone, current_stage_id, created_at,
      requisitions(id, title),
      current_stage:req_stages!current_stage_id(id, name)
    `)
    .eq("candidate_id", candidate_id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);
  return (data?.[0] as unknown as ApplicationRow | undefined) ?? null;
}

async function fetchApplicationById(
  application_id: string,
): Promise<ApplicationRow | null> {
  const { data } = await supabase
    .from("applications")
    .select(`
      id, candidate_id, status, current_milestone, current_stage_id, created_at,
      requisitions(id, title),
      current_stage:req_stages!current_stage_id(id, name)
    `)
    .eq("id", application_id)
    .maybeSingle();
  return (data as unknown as ApplicationRow | null) ?? null;
}

async function fetchApplicationsSummary(
  candidate_id: string,
): Promise<ResolvedCandidate["applications_summary"]> {
  const { data } = await supabase
    .from("applications")
    .select(`
      id, status,
      requisitions(title),
      current_stage:req_stages!current_stage_id(name)
    `)
    .eq("candidate_id", candidate_id);

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      status: string;
      requisitions: { title: string } | null;
      current_stage: { name: string } | null;
    };
    return {
      id: r.id,
      status: r.status,
      req_title: r.requisitions?.title ?? null,
      stage_name: r.current_stage?.name ?? null,
    };
  });
}

async function fetchStageInterviews(stage_id: string): Promise<ResolvedStageInterview[]> {
  const { data } = await supabase
    .from("req_interviews")
    .select(`
      id, title, interview_type, duration_minutes,
      interviewer_name, interviewer_email, order_position
    `)
    .eq("stage_id", stage_id)
    .order("order_position", { ascending: true, nullsFirst: false });
  return (data as ResolvedStageInterview[] | null) ?? [];
}

export async function lookupCandidateForAgent(
  input: string,
  scope?: SchedulingAgentScope,
): Promise<ResolvedCandidate | null> {
  const row = await findCandidateRow(input);
  if (!row) return null;

  const useScopedApplication =
    !!scope?.applicationId &&
    (!scope.candidateId || scope.candidateId === row.id);

  const [summary, scopedApplication] = await Promise.all([
    fetchApplicationsSummary(row.id),
    useScopedApplication ? fetchApplicationById(scope.applicationId!) : Promise.resolve(null),
  ]);

  const resolvedApplication =
    scopedApplication?.candidate_id === row.id
      ? scopedApplication
      : await fetchActiveApplication(row.id);

  let resolvedApp: ResolvedApplication | null = null;
  if (resolvedApplication) {
    const stage_interviews = resolvedApplication.current_stage_id
      ? await fetchStageInterviews(resolvedApplication.current_stage_id)
      : [];
    resolvedApp = {
      id: resolvedApplication.id,
      status: resolvedApplication.status,
      milestone: resolvedApplication.current_milestone,
      stage_id: resolvedApplication.current_stage_id,
      stage_name: resolvedApplication.current_stage?.name ?? null,
      req_id: resolvedApplication.requisitions?.id ?? null,
      req_title: resolvedApplication.requisitions?.title ?? null,
      stage_interviews,
    };
  }

  return {
    id: row.id,
    name: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email,
    headline: row.headline,
    current_company: row.current_company,
    current_title: row.current_title,
    application: resolvedApp,
    applications_summary: summary,
  };
}

export async function getCandidateById(
  candidate_id: string,
  scope?: SchedulingAgentScope,
): Promise<ResolvedCandidate | null> {
  return lookupCandidateForAgent(candidate_id, scope);
}
