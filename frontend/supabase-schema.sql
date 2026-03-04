-- Sajumon Supabase Schema
-- Run this in the Supabase SQL Editor

-- 1. Page Views
create table page_views (
  id bigint generated always as identity primary key,
  session_id text not null,
  page text not null,
  referrer text,
  user_agent text,
  device_type text,
  created_at timestamptz default now()
);

create index idx_page_views_created on page_views (created_at);
create index idx_page_views_session on page_views (session_id);
create index idx_page_views_page on page_views (page);

-- 2. Analyses (saju analysis records)
create table analyses (
  id bigint generated always as identity primary key,
  session_id text,
  birth_date text,
  theme text,
  animal text,
  ilju text,
  success boolean default true,
  error_msg text,
  duration_ms integer,
  created_at timestamptz default now()
);

create index idx_analyses_created on analyses (created_at);
create index idx_analyses_animal on analyses (animal);
create index idx_analyses_theme on analyses (theme);

-- 3. Downloads (talisman download tracking)
create table downloads (
  id bigint generated always as identity primary key,
  session_id text not null,
  animal text,
  theme text,
  created_at timestamptz default now()
);

create index idx_downloads_created on downloads (created_at);

-- 4. Shares (share tracking, for future expansion)
create table shares (
  id bigint generated always as identity primary key,
  session_id text not null,
  platform text,
  created_at timestamptz default now()
);

create index idx_shares_created on shares (created_at);

-- 5. Error Logs
create table error_logs (
  id bigint generated always as identity primary key,
  endpoint text,
  message text,
  stack text,
  created_at timestamptz default now()
);

create index idx_error_logs_created on error_logs (created_at);

-- 6. Session Durations
create table session_durations (
  id bigint generated always as identity primary key,
  session_id text not null,
  duration_ms integer not null,
  created_at timestamptz default now()
);

create index idx_session_durations_created on session_durations (created_at);
