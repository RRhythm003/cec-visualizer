-- ─── CEC Visualizer — Database Schema ───────────────────────────────────────
-- Run this in Supabase SQL Editor to set up the production database.
-- The app ships with demo data and works without Supabase (client-side mode).

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────────────────────
create type user_role as enum ('admin', 'approver', 'proposer');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  role user_role not null default 'proposer',
  division_scope text[] default '{}',
  avatar_initials text,
  last_login timestamptz,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Admins can read all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── MEETINGS ─────────────────────────────────────────────────────────────────
create type meeting_status as enum ('draft', 'published', 'active', 'locked', 'archived');

create table public.meetings (
  id uuid primary key default uuid_generate_v4(),
  meeting_code text not null unique,
  title text not null,
  date date not null,
  pdf_path text,
  parsed_at timestamptz,
  status meeting_status not null default 'draft',
  admin_user_id uuid references public.profiles(id),
  proposal_count int default 0,
  summary jsonb default '{}',
  archived_year int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.meetings enable row level security;
create policy "Authenticated users can read meetings" on public.meetings
  for select to authenticated using (true);
create policy "Admins can manage meetings" on public.meetings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── PROPOSALS ────────────────────────────────────────────────────────────────
create type division_type as enum ('Corporate', 'SME Banking', 'Consumer Asset');
create type category_type as enum (
  'Disbursement', 'Settlement', 'Call-Up', 'NOC',
  'Pricing Change', 'Security Change', 'Write-Off'
);
create type resolution_status as enum (
  'Approved', 'Approved (Board)', 'Deferred', 'Declined', 'Pending'
);
create type cib_status as enum ('STD', 'SMA', 'SS', 'DF', 'BL', 'Unclassified');
create type irg_grade as enum (
  'IDLC 1', 'IDLC 2', 'IDLC 3', 'IDLC 4', 'IDLC 5', 'IDLC 6', 'IDLC 7'
);

create table public.proposals (
  id uuid primary key default uuid_generate_v4(),
  meeting_id uuid references public.meetings(id) on delete cascade,
  proposal_code text not null,
  serial_number int not null,
  ag_code text,
  title text not null,
  client_name text not null,
  group_name text,
  division division_type not null,
  category category_type not null,
  facility_type text,

  -- Exposure & Amounts (all in BDT Crore)
  existing_exposure numeric,
  proposed_amount numeric,
  cumulative_exposure numeric,
  disbursed_amount numeric,
  current_outstanding numeric,
  overdue_amount numeric,
  months_of_default int,
  settlement_amount numeric,
  waiver_amount numeric,
  net_receivable numeric,
  write_off_amount numeric,
  provision_released numeric,

  -- Pricing & Terms
  interest_rate numeric,
  tenor text,
  processing_fee text,
  revised_irr numeric,

  -- Risk Metrics
  credit_rating text,
  irg_grade irg_grade,
  cib_status cib_status,
  dscr numeric,
  de_ratio numeric,
  ltv numeric,
  es_risk text,

  -- Security
  security_description text,
  security_coverage numeric,
  security_value numeric,
  fdr_requirement text,

  -- CRM
  crm_remarks text,
  negative_remarks text,

  -- Resolution
  resolution resolution_status not null default 'Pending',
  resolution_note text,
  resolution_timestamp timestamptz,
  resolution_by uuid references public.profiles(id),

  -- Action
  action_owners jsonb default '[]',
  action_deadline date,

  -- Category-specific
  category_data jsonb,

  -- Metadata
  page_start int,
  page_end int,
  raw_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.proposals enable row level security;
create policy "Authenticated users can read proposals" on public.proposals
  for select to authenticated using (true);
create policy "Admins can manage proposals" on public.proposals
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── AUDIT LOG ────────────────────────────────────────────────────────────────
create table public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  action text not null,
  meeting_id uuid references public.meetings(id),
  proposal_id uuid references public.proposals(id),
  field_name text,
  old_value text,
  new_value text,
  timestamp timestamptz default now()
);

alter table public.audit_log enable row level security;
create policy "Admins can read audit log" on public.audit_log
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Authenticated users can insert audit log" on public.audit_log
  for insert to authenticated with check (true);

-- ─── AUTO-ARCHIVE FUNCTION ────────────────────────────────────────────────────
-- Called by a pg_cron job at 00:00 on Jan 1 every year
create or replace function archive_previous_year_meetings()
returns void language plpgsql as $$
declare
  prev_year int := extract(year from now()) - 1;
begin
  update public.meetings
  set
    status = 'archived',
    archived_year = prev_year,
    updated_at = now()
  where
    extract(year from date) = prev_year
    and status in ('locked', 'published');
end;
$$;

-- Schedule via pg_cron (enable in Supabase dashboard):
-- select cron.schedule('archive-meetings', '0 0 1 1 *', 'select archive_previous_year_meetings()');

-- ─── REAL-TIME ────────────────────────────────────────────────────────────────
-- Enable real-time for meetings and proposals
alter publication supabase_realtime add table public.meetings;
alter publication supabase_realtime add table public.proposals;
