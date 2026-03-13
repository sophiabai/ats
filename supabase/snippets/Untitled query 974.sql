alter table hc_plan_settings
  add column if not exists plan_status text default 'open' check (plan_status in ('draft', 'open', 'locked'));
  