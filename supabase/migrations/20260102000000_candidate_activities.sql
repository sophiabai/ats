-- Candidate activities table for tracking all candidate-level events
create table candidate_activities (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  application_id uuid references applications(id) on delete set null,
  activity_type text not null check (activity_type in (
    'application_events',
    'interviews_and_feedbacks',
    'communication',
    'data_changes',
    'imported_activity_feed',
    'application_moved',
    'pipeline_plan_updated'
  )),
  action text not null,
  detail text,
  metadata jsonb default '{}'::jsonb
);

create index idx_candidate_activities_candidate on candidate_activities(candidate_id, created_at desc);
create index idx_candidate_activities_application on candidate_activities(application_id);
