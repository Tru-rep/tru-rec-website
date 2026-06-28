-- ============================================================================
-- 0001_init.sql
-- Core schema for the Sudan Digital Record System.
-- Creates enums, profiles + records tables, search indexes, and triggers.
-- Run this first in the Supabase SQL editor (or via the Supabase CLI).
-- ============================================================================

-- Extensions ------------------------------------------------------------------
-- pgcrypto: gen_random_uuid()  | pg_trgm: fast partial / fuzzy text search
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Enums -----------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin', 'staff');
  end if;
  if not exists (select 1 from pg_type where typname = 'gender_type') then
    create type gender_type as enum ('male', 'female', 'other');
  end if;
end$$;

-- Profiles --------------------------------------------------------------------
-- One row per auth user. Holds the role used for permission checks (and RLS).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        user_role not null default 'staff',
  created_at  timestamptz not null default now()
);

-- Records ---------------------------------------------------------------------
create table if not exists public.records (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null,
  age              int check (age is null or (age >= 0 and age <= 150)),
  gender           gender_type,
  address          text,
  profession       text,
  nickname         text,
  visible_marks    text,
  case_notes       text,
  crime_type       text,
  additional_notes text,
  photo_url        text,
  created_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Search indexes --------------------------------------------------------------
-- Trigram GIN indexes power fast ILIKE '%term%' partial matching.
create index if not exists idx_records_full_name_trgm  on public.records using gin (full_name gin_trgm_ops);
create index if not exists idx_records_nickname_trgm   on public.records using gin (nickname gin_trgm_ops);
create index if not exists idx_records_profession_trgm on public.records using gin (profession gin_trgm_ops);
create index if not exists idx_records_address_trgm    on public.records using gin (address gin_trgm_ops);
-- For "recent records" ordering and pagination.
create index if not exists idx_records_created_at on public.records (created_at desc);

-- updated_at trigger ----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_records_updated_at on public.records;
create trigger trg_records_updated_at
  before update on public.records
  for each row execute function public.set_updated_at();

-- Auto-create a profile when a new auth user signs up ------------------------
-- The first ever user becomes 'admin'; everyone else defaults to 'staff'.
-- A requested_role can be passed via signUp options.data but is ignored for
-- self-signup security (admins promote users explicitly via the UI).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean;
begin
  select count(*) = 0 into is_first from public.profiles;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    case when is_first then 'admin'::user_role else 'staff'::user_role end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
