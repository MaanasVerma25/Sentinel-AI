-- ============================================================
-- Sentinel AI — Supabase Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  company text,
  email text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Auto-create profile on signup (trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, company, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'company',
    new.email
  );
  
  insert into public.alert_preferences (user_id, threshold, notify_slack, notify_email)
  values (
    new.id,
    65,
    true,
    true
  ) on conflict (user_id) do nothing;
  
  return new;
end;
$$;

-- Drop existing trigger if it exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Connected sources table (tracks which channels a user has linked)
create table if not exists public.connected_sources (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  source_type text not null check (source_type in ('slack', 'email', 'twitter', 'intercom', 'forums', 'internal_logs')),
  source_label text,
  is_active boolean default true,
  api_key_hint text,  -- last 4 chars only, never store full keys
  connected_at timestamptz default now()
);

-- 4. Alert preferences table
create table if not exists public.alert_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  threshold integer default 65 check (threshold between 10 and 100),
  notify_slack boolean default true,
  notify_email boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.connected_sources enable row level security;
alter table public.alert_preferences enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Connected sources: users can CRUD their own sources
create policy "Users can view own sources"
  on public.connected_sources for select
  using (auth.uid() = user_id);

create policy "Users can insert own sources"
  on public.connected_sources for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sources"
  on public.connected_sources for update
  using (auth.uid() = user_id);

create policy "Users can delete own sources"
  on public.connected_sources for delete
  using (auth.uid() = user_id);

-- Alert preferences: users can CRUD their own preferences
create policy "Users can view own alert prefs"
  on public.alert_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own alert prefs"
  on public.alert_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own alert prefs"
  on public.alert_preferences for update
  using (auth.uid() = user_id);

-- 5. Updated_at auto-update trigger
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger alert_prefs_updated_at
  before update on public.alert_preferences
  for each row execute function public.update_updated_at();

-- ============================================================
-- 6. Onboarding Profiles table
--    Stores company details & social handles entered during onboarding
--    Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists public.onboarding_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,

  -- Company details
  company_name text,
  website text,
  industry text,
  company_size text check (company_size in ('1-10', '11-50', '51-200', '201+')),
  description text,

  -- Social media handles
  twitter_handle text,
  linkedin_url text,
  facebook_url text,
  instagram_handle text,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.onboarding_profiles enable row level security;

-- RLS Policies: users can only access their own onboarding profile
create policy "Users can view own onboarding profile"
  on public.onboarding_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own onboarding profile"
  on public.onboarding_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own onboarding profile"
  on public.onboarding_profiles for update
  using (auth.uid() = user_id);

-- Auto-update trigger for updated_at
create trigger onboarding_profiles_updated_at
  before update on public.onboarding_profiles
  for each row execute function public.update_updated_at();

