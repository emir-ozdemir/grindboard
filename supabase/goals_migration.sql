-- ============================================
-- Goals tablosu migrasyonu
-- Supabase Dashboard > SQL Editor'da çalıştır
-- ============================================

-- Eski tabloyu sil
drop table if exists goals cascade;

-- Yeni goals tablosu
create table goals (
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

-- RLS
alter table goals enable row level security;
drop policy if exists "Users can CRUD own goals" on goals;
create policy "Users can CRUD own goals" on goals for all using (auth.uid() = user_id);
