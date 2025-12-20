-- ============================================
-- Complete Database Setup for Guided Surveys
-- ============================================
-- Run this entire script in your Supabase SQL Editor
-- Go to: Supabase Dashboard > SQL Editor > New Query

-- ============================================
-- 1. Create survey_sessions table
-- ============================================
create table if not exists survey_sessions (
  id uuid primary key,
  current_page int default 0,
  edit_mode text default 'customer_editable',
  status text default 'active',
  household_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add check constraint for status
alter table survey_sessions 
drop constraint if exists survey_sessions_status_check;

alter table survey_sessions 
add constraint survey_sessions_status_check 
check (status in ('active', 'completed', 'in_progress'));

-- Add check constraint for edit_mode
alter table survey_sessions 
drop constraint if exists survey_sessions_edit_mode_check;

alter table survey_sessions 
add constraint survey_sessions_edit_mode_check 
check (edit_mode in ('customer_editable', 'agent_only'));

-- ============================================
-- 2. Create survey_responses table
-- ============================================
create table if not exists survey_responses (
  session_id uuid references survey_sessions(id) on delete cascade,
  question_id text not null,
  value jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (session_id, question_id)
);

-- ============================================
-- 3. Create household_data table
-- ============================================
create table if not exists household_data (
  household_id text not null,
  question_id text not null,
  value jsonb,
  updated_at timestamptz default now(),
  primary key (household_id, question_id)
);

-- ============================================
-- 4. Create indexes for better performance
-- ============================================
create index if not exists idx_survey_sessions_household_id on survey_sessions(household_id);
create index if not exists idx_survey_sessions_status on survey_sessions(status);
create index if not exists idx_survey_responses_session_id on survey_responses(session_id);
create index if not exists idx_household_data_household_id on household_data(household_id);

-- ============================================
-- 5. Enable Realtime replication
-- ============================================
-- Note: Realtime must be enabled via Supabase Dashboard
-- Go to: Database > Replication
-- Enable replication for:
--   - survey_sessions
--   - survey_responses
--   - household_data
--
-- Or run these commands (if you have the right permissions):
alter publication supabase_realtime add table survey_sessions;
alter publication supabase_realtime add table survey_responses;
alter publication supabase_realtime add table household_data;

-- ============================================
-- 6. Set up Row Level Security (RLS)
-- ============================================
-- For development, we'll disable RLS to make testing easier
-- ⚠️ IMPORTANT: In production, you should enable RLS with proper policies

-- Disable RLS for development (NOT recommended for production)
alter table survey_sessions disable row level security;
alter table survey_responses disable row level security;
alter table household_data disable row level security;

-- ============================================
-- Alternative: Enable RLS with permissive policies
-- ============================================
-- Uncomment the following if you want to enable RLS with permissive policies
-- (Remove the "disable row level security" commands above first)

/*
-- Enable RLS
alter table survey_sessions enable row level security;
alter table survey_responses enable row level security;
alter table household_data enable row level security;

-- Create permissive policies (allows all operations)
create policy "Allow all operations on survey_sessions" on survey_sessions
  for all using (true) with check (true);

create policy "Allow all operations on survey_responses" on survey_responses
  for all using (true) with check (true);

create policy "Allow all operations on household_data" on household_data
  for all using (true) with check (true);
*/

-- ============================================
-- 7. Verify tables were created
-- ============================================
-- Run this to verify everything was created correctly:
-- select table_name from information_schema.tables 
-- where table_schema = 'public' 
-- and table_name in ('survey_sessions', 'survey_responses', 'household_data');

