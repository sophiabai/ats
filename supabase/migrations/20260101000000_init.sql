-- ATS Database Schema
-- Run these statements in order in the Supabase SQL Editor.

-- 1. candidates
create table candidates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  location text,
  headline text,

  years_experience int,
  current_company text,
  current_title text,
  work_history jsonb default '[]'::jsonb,
  education jsonb default '[]'::jsonb,

  skills text[],
  tags text[],
  notes text,

  resume_url text,
  avatar_url text
);

create index idx_candidates_name on candidates(last_name, first_name);
create index idx_candidates_email on candidates(email);

-- 2. requisitions
create table requisitions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  title text not null,
  department text,
  location text,
  employment_type text default 'full_time' check (employment_type in (
    'full_time', 'part_time', 'contract', 'intern'
  )),

  recruiter_name text,
  recruiter_email text,
  hiring_manager_name text,
  hiring_manager_email text,

  opened_date timestamptz default now(),
  closed_date timestamptz,
  status text default 'open' check (status in (
    'draft', 'open', 'on_hold', 'closed', 'cancelled'
  )),

  description text,
  requirements text[],
  salary_min numeric,
  salary_max numeric,
  salary_currency text default 'USD',

  headcount int default 1,

  location_pay_ranges jsonb,

  level text,
  coordinator_name text,
  sourcer_name text,
  assessment_criteria text[]
);

create index idx_requisitions_status on requisitions(status);
create index idx_requisitions_department on requisitions(department);

-- 3. req_stages
create table req_stages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  req_id uuid references requisitions(id) on delete cascade not null,

  milestone text not null check (milestone in (
    'application', 'screen', 'final_interview', 'offer', 'offer_accepted'
  )),

  name text not null,
  sort_order int not null default 0,
  description text
);

create index idx_req_stages_req on req_stages(req_id);
create unique index idx_req_stages_order on req_stages(req_id, milestone, sort_order);

-- 4. req_interviews
create table req_interviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  req_id uuid references requisitions(id) on delete cascade not null,
  stage_id uuid references req_stages(id) on delete cascade not null,

  title text not null,
  interview_type text default 'standard' check (interview_type in (
    'standard', 'technical', 'behavioral', 'presentation', 'case_study',
    'pair_programming', 'portfolio_review', 'reference_check', 'other'
  )),
  duration_minutes int default 60,
  interviewer_name text,
  interviewer_email text,

  order_position int,
  instructions text
);

create index idx_req_interviews_stage on req_interviews(stage_id);
create index idx_req_interviews_req on req_interviews(req_id);

-- 5. applications
create table applications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  candidate_id uuid references candidates(id) on delete cascade not null,
  req_id uuid references requisitions(id) on delete cascade not null,

  applied_date timestamptz default now(),
  source text check (source in (
    'linkedin', 'referral', 'careers_page', 'indeed', 'glassdoor',
    'agency', 'university', 'internal', 'other'
  )),
  referrer_name text,

  current_milestone text default 'application' check (current_milestone in (
    'application', 'screen', 'final_interview', 'offer', 'offer_accepted'
  )),
  current_stage_id uuid references req_stages(id),

  status text default 'active' check (status in (
    'active', 'hired', 'rejected', 'withdrawn'
  )),
  rejected_reason text,
  withdrawn_reason text,

  notes text
);

create index idx_applications_candidate on applications(candidate_id);
create index idx_applications_req on applications(req_id);
create index idx_applications_status on applications(status);
create index idx_applications_milestone on applications(current_milestone);

-- 6. application_interviews
create table application_interviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  application_id uuid references applications(id) on delete cascade not null,
  stage_id uuid references req_stages(id) on delete cascade not null,
  source_req_interview_id uuid references req_interviews(id),

  title text not null,
  interview_type text default 'standard' check (interview_type in (
    'standard', 'technical', 'behavioral', 'presentation', 'case_study',
    'pair_programming', 'portfolio_review', 'reference_check', 'other'
  )),
  duration_minutes int default 60,
  interviewer_name text,
  interviewer_email text,

  order_position int,

  scheduled_at timestamptz,
  location text,
  meeting_link text,

  status text default 'pending' check (status in (
    'pending', 'scheduled', 'completed', 'cancelled', 'no_show'
  )),

  instructions text
);

create index idx_app_interviews_application on application_interviews(application_id);
create index idx_app_interviews_stage on application_interviews(stage_id);
create index idx_app_interviews_status on application_interviews(status);
create index idx_app_interviews_schedule on application_interviews(scheduled_at);

-- 7. scorecards
create table scorecards (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  application_interview_id uuid references application_interviews(id) on delete cascade not null,
  application_id uuid references applications(id) on delete cascade not null,

  submitted_by text not null,
  submitted_at timestamptz,

  overall_score numeric(2,1),
  technical_score numeric(2,1),
  communication_score numeric(2,1),
  problem_solving_score numeric(2,1),
  culture_score numeric(2,1),

  strengths text[],
  concerns text[],
  notes text,

  recommendation text check (recommendation in (
    'strong_yes', 'yes', 'neutral', 'no', 'strong_no'
  )),

  ai_summary text,
  raw_ai_response jsonb,

  status text default 'draft' check (status in ('draft', 'submitted'))
);

create unique index idx_scorecards_interview on scorecards(application_interview_id);
create index idx_scorecards_application on scorecards(application_id);

-- 8. stage_decisions
create table stage_decisions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  application_id uuid references applications(id) on delete cascade not null,
  stage_id uuid references req_stages(id) on delete cascade not null,

  decided_by text not null,
  decided_at timestamptz default now(),

  decision text not null check (decision in (
    'advance', 'reject', 'hold', 'pending'
  )),

  reasoning text,
  ai_recommendation text,
  raw_ai_response jsonb
);

create unique index idx_stage_decisions_unique on stage_decisions(application_id, stage_id);

-- 9. emails
create table emails (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  application_id uuid references applications(id) on delete cascade,
  candidate_id uuid references candidates(id) on delete cascade,

  direction text default 'outbound' check (direction in ('inbound', 'outbound')),
  email_type text check (email_type in (
    'schedule_confirmation', 'rejection', 'offer', 'follow_up', 'custom'
  )),

  to_address text not null,
  from_address text default 'recruiting@company.com',
  subject text not null,
  body text not null,

  status text default 'sent' check (status in ('draft', 'sent', 'failed'))
);

create index idx_emails_application on emails(application_id);
create index idx_emails_candidate on emails(candidate_id);

-- 10. hc_departments (headcount planning – department-level data + budget)
create table hc_departments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  name text not null unique,
  current_headcount int not null default 0,
  planned_headcount int not null default 0,
  open_positions int not null default 0,
  filled_positions int not null default 0,

  budget_allocated numeric not null default 0,
  budget_spent numeric not null default 0
);

-- 11. hc_positions (headcount planning – individual planned positions)
create table hc_positions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  position_id text not null unique,
  title text not null,
  department text not null,
  level text,
  position_type text default 'open' check (position_type in ('open', 'in_progress', 'filled', 'closed')),
  hiring_manager text,
  target_date date,
  location text,
  employment_type text default 'full_time' check (employment_type in ('full_time', 'part_time', 'contract', 'intern')),
  cost_center text,
  salary_min numeric,
  salary_max numeric,
  priority text default 'medium' check (priority in ('high', 'medium', 'low')),
  in_plan boolean default false,
  scenario_id uuid
);

create index idx_hc_positions_department on hc_positions(department);
create index idx_hc_positions_type on hc_positions(position_type);
create index idx_hc_positions_plan on hc_positions(in_plan);

-- 12. hc_employees (headcount planning – roster & team members)
create table hc_employees (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  name text not null,
  title text not null,
  department text not null,
  level text,
  location text,
  employment_type text default 'full_time' check (employment_type in ('full_time', 'contractor')),
  start_date date,
  status text default 'active' check (status in ('active', 'on_leave', 'offboarded')),
  is_direct_report boolean default false
);

create index idx_hc_employees_department on hc_employees(department);

-- 13. hc_scenarios (headcount planning – group requests with positions)
create table hc_scenarios (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  name text not null,
  description text,
  requested_by text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  in_plan boolean default false
);

-- 13b. hc_scenario_positions (positions within a scenario)
create table hc_scenario_positions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  scenario_id uuid references hc_scenarios(id) on delete cascade not null,
  title text not null,
  department text not null,
  level text,
  location text,
  employment_type text default 'full_time' check (employment_type in ('full_time', 'part_time', 'contract', 'intern')),
  cost_center text,
  salary_min numeric,
  salary_max numeric,
  priority text default 'medium' check (priority in ('high', 'medium', 'low')),
  hiring_manager text,
  target_date date
);

create index idx_hc_scenario_positions_scenario on hc_scenario_positions(scenario_id);

-- 13c. hc_plan_settings (plan-level settings like lock state)
create table hc_plan_settings (
  id uuid default gen_random_uuid() primary key,
  plan_name text not null default 'AOP 2026',
  collaborators text[] default '{}',
  archived boolean default false,
  plan_locked boolean default false,
  locked_at timestamptz,
  locked_by text
);

-- 14. candidate_pools
create table candidate_pools (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null unique
);

-- 15. candidate_pool_members (join table)
create table candidate_pool_members (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  pool_id uuid references candidate_pools(id) on delete cascade not null,
  candidate_id uuid references candidates(id) on delete cascade not null
);

create unique index idx_pool_members_unique on candidate_pool_members(pool_id, candidate_id);
create index idx_pool_members_pool on candidate_pool_members(pool_id);
create index idx_pool_members_candidate on candidate_pool_members(candidate_id);

-- 16. req_candidate_pools (link pools to requisitions)
create table req_candidate_pools (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  req_id uuid references requisitions(id) on delete cascade not null,
  pool_id uuid references candidate_pools(id) on delete cascade not null
);

create unique index idx_req_candidate_pools_unique on req_candidate_pools(req_id, pool_id);
create index idx_req_candidate_pools_req on req_candidate_pools(req_id);
create index idx_req_candidate_pools_pool on req_candidate_pools(pool_id);

-- 17. hc_approval_requests (headcount planning – approval workflow)
create table hc_approval_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  request_id text not null unique,
  position text not null,
  department text not null,
  requested_by text not null,
  submitted_date date not null default current_date,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected'))
);
