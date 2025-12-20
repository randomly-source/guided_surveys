# Environment Variables Setup Guide

This project requires Supabase environment variables to function properly.

## Required Environment Variables

Both apps need the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

## How to Get Your Supabase Credentials

1. **Create a Supabase Project** (if you don't have one):
   - Go to https://app.supabase.com
   - Sign up or log in
   - Click "New Project"
   - Fill in your project details and wait for it to be created

2. **Get Your API Credentials**:
   - In your Supabase project dashboard, go to **Settings** → **API**
   - You'll find:
     - **Project URL** → Copy this as `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → Copy this as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Set Up Your Environment Files**:
   - Edit `apps/agent-app/.env.local` and add your credentials
   - Edit `apps/customer-app/.env.local` and add your credentials

## Database Setup

After setting up your Supabase project, you need to create the database tables. Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create survey_sessions table
create table survey_sessions (
  id uuid primary key,
  current_page int default 0,
  edit_mode text default 'customer_editable',
  status text default 'in_progress',
  household_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create survey_responses table
create table survey_responses (
  session_id uuid references survey_sessions(id) on delete cascade,
  question_id text,
  value jsonb,
  primary key (session_id, question_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create household_data table (for storing submitted responses)
create table household_data (
  household_id text primary key,
  data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Realtime for all tables
alter publication supabase_realtime add table survey_sessions;
alter publication supabase_realtime add table survey_responses;
alter publication supabase_realtime add table household_data;
```

## Enable Row Level Security (RLS)

For development, you may want to disable RLS or set up policies. In production, you should configure proper RLS policies.

For now, you can disable RLS for testing:

```sql
-- Disable RLS for development (NOT recommended for production)
alter table survey_sessions disable row level security;
alter table survey_responses disable row level security;
alter table household_data disable row level security;
```

Or set up permissive policies:

```sql
-- Allow all operations for authenticated users (adjust as needed)
create policy "Allow all for authenticated users" on survey_sessions
  for all using (true) with check (true);

create policy "Allow all for authenticated users" on survey_responses
  for all using (true) with check (true);

create policy "Allow all for authenticated users" on household_data
  for all using (true) with check (true);
```

## Verify Setup

1. Make sure both `.env.local` files have your Supabase credentials
2. Restart your development servers
3. The apps should now connect to your Supabase database

## Troubleshooting

- **"Missing Supabase Environment Variables" error**: Make sure your `.env.local` files are in the correct locations and have the correct variable names
- **Connection errors**: Verify your Supabase URL and key are correct
- **Realtime not working**: Make sure you've enabled Realtime replication for the tables in Supabase

