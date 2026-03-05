export type EmploymentType = "full_time" | "part_time" | "contract" | "intern";

export type ReqStatus = "draft" | "open" | "on_hold" | "closed" | "cancelled";

export type Milestone =
  | "application"
  | "screen"
  | "final_interview"
  | "offer"
  | "offer_accepted";

export type InterviewType =
  | "standard"
  | "technical"
  | "behavioral"
  | "presentation"
  | "case_study"
  | "pair_programming"
  | "portfolio_review"
  | "reference_check"
  | "other";

export type InterviewStatus =
  | "pending"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export type ApplicationStatus = "active" | "hired" | "rejected" | "withdrawn";

export type ApplicationSource =
  | "linkedin"
  | "referral"
  | "careers_page"
  | "indeed"
  | "glassdoor"
  | "agency"
  | "university"
  | "internal"
  | "other";

export type Recommendation =
  | "strong_yes"
  | "yes"
  | "neutral"
  | "no"
  | "strong_no";

export type StageDecisionType = "advance" | "reject" | "hold" | "pending";

export type EmailType =
  | "schedule_confirmation"
  | "rejection"
  | "offer"
  | "follow_up"
  | "custom";

export interface Candidate {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  headline: string | null;
  years_experience: number | null;
  current_company: string | null;
  current_title: string | null;
  work_history: Array<{
    company: string;
    title: string;
    start_date: string;
    end_date: string | null;
    description: string | null;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string | null;
    start_year: number | null;
    end_year: number | null;
  }>;
  skills: string[] | null;
  tags: string[] | null;
  notes: string | null;
  resume_url: string | null;
  avatar_url: string | null;
}

export interface Requisition {
  id: string;
  created_at: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: EmploymentType;
  recruiter_name: string | null;
  recruiter_email: string | null;
  hiring_manager_name: string | null;
  hiring_manager_email: string | null;
  opened_date: string;
  closed_date: string | null;
  status: ReqStatus;
  description: string | null;
  requirements: string[] | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  headcount: number;
}

export interface ReqStage {
  id: string;
  created_at: string;
  req_id: string;
  milestone: Milestone;
  name: string;
  sort_order: number;
  description: string | null;
}

export interface ReqInterview {
  id: string;
  created_at: string;
  req_id: string;
  stage_id: string;
  title: string;
  interview_type: InterviewType;
  duration_minutes: number;
  interviewer_name: string | null;
  interviewer_email: string | null;
  order_position: number | null;
  instructions: string | null;
}

export interface Application {
  id: string;
  created_at: string;
  candidate_id: string;
  req_id: string;
  applied_date: string;
  source: ApplicationSource | null;
  referrer_name: string | null;
  current_milestone: Milestone;
  current_stage_id: string | null;
  status: ApplicationStatus;
  rejected_reason: string | null;
  withdrawn_reason: string | null;
  notes: string | null;
}

export interface ApplicationInterview {
  id: string;
  created_at: string;
  application_id: string;
  stage_id: string;
  source_req_interview_id: string | null;
  title: string;
  interview_type: InterviewType;
  duration_minutes: number;
  interviewer_name: string | null;
  interviewer_email: string | null;
  order_position: number | null;
  scheduled_at: string | null;
  location: string | null;
  meeting_link: string | null;
  status: InterviewStatus;
  instructions: string | null;
}

export interface Scorecard {
  id: string;
  created_at: string;
  updated_at: string;
  application_interview_id: string;
  application_id: string;
  submitted_by: string;
  submitted_at: string | null;
  overall_score: number | null;
  technical_score: number | null;
  communication_score: number | null;
  problem_solving_score: number | null;
  culture_score: number | null;
  strengths: string[] | null;
  concerns: string[] | null;
  notes: string | null;
  recommendation: Recommendation | null;
  ai_summary: string | null;
  raw_ai_response: Record<string, unknown> | null;
  status: "draft" | "submitted";
}

export interface StageDecision {
  id: string;
  created_at: string;
  application_id: string;
  stage_id: string;
  decided_by: string;
  decided_at: string;
  decision: StageDecisionType;
  reasoning: string | null;
  ai_recommendation: string | null;
  raw_ai_response: Record<string, unknown> | null;
}

export interface Email {
  id: string;
  created_at: string;
  application_id: string | null;
  candidate_id: string | null;
  direction: "inbound" | "outbound";
  email_type: EmailType | null;
  to_address: string;
  from_address: string;
  subject: string;
  body: string;
  status: "draft" | "sent" | "failed";
}
