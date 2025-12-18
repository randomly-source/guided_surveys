-- Create household_data table
create table if not exists household_data (
  household_id text not null,
  question_id text not null,
  value jsonb,
  updated_at timestamp with time zone default now(),
  primary key (household_id, question_id)
);

-- Add household_id and status columns to survey_sessions
alter table survey_sessions 
add column if not exists household_id text,
add column if not exists status text default 'active';

-- Add check constraint for status
alter table survey_sessions 
drop constraint if exists survey_sessions_status_check;

alter table survey_sessions 
add constraint survey_sessions_status_check 
check (status in ('active', 'completed'));

-- Create index on household_id for faster lookups
create index if not exists idx_household_data_household_id on household_data(household_id);
create index if not exists idx_survey_sessions_household_id on survey_sessions(household_id);

-- Enable Realtime replication for household_data table
-- Note: This needs to be done in Supabase dashboard under Database > Replication
-- or via Supabase CLI. The table will need to be enabled for replication manually.

