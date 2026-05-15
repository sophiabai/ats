-- Intakes: long-form role docs that can be reused across multiple requisitions.
-- A requisition optionally points back at the intake it was created from.

create table intakes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  title text not null default '',
  content text not null default ''
);

create index idx_intakes_updated_at on intakes(updated_at desc);

alter table requisitions
  add column intake_id uuid references intakes(id) on delete set null;

create index idx_requisitions_intake on requisitions(intake_id);
