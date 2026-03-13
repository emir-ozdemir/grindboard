-- ============================================
-- GrindBoard Supabase SQL Schema
-- Supabase Dashboard > SQL Editor'da çalıştır
-- ============================================

-- 1. profiles tablosu
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  daily_goal_minutes integer default 120,
  preferred_locale text default 'tr',
  created_at timestamp with time zone default now()
);

-- 2. subscriptions tablosu
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade unique,
  lemonsqueezy_subscription_id text unique,
  status text not null default 'trialing'
    check (status in ('trialing', 'active', 'cancelled', 'expired', 'paused')),
  plan_name text default 'pro',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_ends_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. subjects tablosu
create table if not exists subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  icon text,
  created_at timestamp with time zone default now()
);

-- 4. topics tablosu
create table if not exists topics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  subject_id uuid references subjects(id) on delete cascade,
  name text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  notes text,
  order_index integer default 0,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- 5. study_sessions tablosu
create table if not exists study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  duration_minutes integer not null,
  session_type text not null default 'pomodoro',
  started_at timestamp with time zone not null,
  ended_at timestamp with time zone
);

-- 6. schedules tablosu
create table if not exists schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  subject_id uuid references subjects(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default now()
);

-- 7. notes tablosu
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  content text not null default '',
  subject_id uuid references subjects(id) on delete set null,
  topic_id uuid references topics(id) on delete set null,
  is_pinned boolean not null default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 8. goals tablosu
create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  category text not null default 'general'
    check (category in ('daily', 'weekly', 'general')),
  subject_id uuid references subjects(id) on delete set null,
  target_date date,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  progress_type text not null default 'checkbox'
    check (progress_type in ('checkbox', 'numeric')),
  progress_current integer default 0,
  progress_target integer default 1,
  is_completed boolean default false,
  note text,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) Politikaları
-- ============================================

-- profiles
alter table profiles enable row level security;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- subscriptions
alter table subscriptions enable row level security;
drop policy if exists "Users can view own subscription" on subscriptions;
drop policy if exists "Users can insert own subscription" on subscriptions;
drop policy if exists "Users can update own subscription" on subscriptions;
create policy "Users can view own subscription" on subscriptions for select using (auth.uid() = user_id);
create policy "Users can insert own subscription" on subscriptions for insert with check (auth.uid() = user_id);
create policy "Users can update own subscription" on subscriptions for update using (auth.uid() = user_id);

-- subjects
alter table subjects enable row level security;
drop policy if exists "Users can CRUD own subjects" on subjects;
create policy "Users can CRUD own subjects" on subjects for all using (auth.uid() = user_id);

-- topics
alter table topics enable row level security;
drop policy if exists "Users can CRUD own topics" on topics;
create policy "Users can CRUD own topics" on topics for all using (auth.uid() = user_id);

-- study_sessions
alter table study_sessions enable row level security;
drop policy if exists "Users can CRUD own sessions" on study_sessions;
create policy "Users can CRUD own sessions" on study_sessions for all using (auth.uid() = user_id);

-- schedules
alter table schedules enable row level security;
drop policy if exists "Users can CRUD own schedules" on schedules;
create policy "Users can CRUD own schedules" on schedules for all using (auth.uid() = user_id);

-- notes
alter table notes enable row level security;
drop policy if exists "Users can CRUD own notes" on notes;
create policy "Users can CRUD own notes" on notes for all using (auth.uid() = user_id);

-- goals
alter table goals enable row level security;
drop policy if exists "Users can CRUD own goals" on goals;
create policy "Users can CRUD own goals" on goals for all using (auth.uid() = user_id);

-- ============================================
-- Yeni kullanıcı kaydında profile otomatik oluştur
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, preferred_locale)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'preferred_locale', 'tr')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
