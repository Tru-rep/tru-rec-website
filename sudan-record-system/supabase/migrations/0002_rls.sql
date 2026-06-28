-- ============================================================================
-- 0002_rls.sql
-- Row Level Security policies. Enforces roles at the DATABASE level so the API
-- is secure even if the UI is bypassed.
--
-- Rules:
--   * Only authenticated users can read/write anything.
--   * Admins: full access (incl. delete) on records + manage profiles.
--   * Staff: select / insert / update records, but CANNOT delete records,
--            and cannot modify other users' profiles or roles.
-- ============================================================================

-- Helper: is the current user an admin? (security definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Enable RLS ------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.records  enable row level security;

-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (true);

-- Users may update their own profile (name only in practice); admins update any.
drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Only admins can delete profiles.
drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- Inserts happen via the handle_new_user() trigger (security definer), so no
-- broad insert policy is required for normal signup. Admins may insert too:
drop policy if exists "profiles_insert_admin_or_self" on public.profiles;
create policy "profiles_insert_admin_or_self" on public.profiles
  for insert to authenticated
  with check (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- records policies
-- ---------------------------------------------------------------------------
-- All authenticated users can read records.
drop policy if exists "records_select" on public.records;
create policy "records_select" on public.records
  for select to authenticated
  using (true);

-- Any authenticated user (admin or staff) can create records.
drop policy if exists "records_insert" on public.records;
create policy "records_insert" on public.records
  for insert to authenticated
  with check (auth.uid() is not null);

-- Any authenticated user can update records.
drop policy if exists "records_update" on public.records;
create policy "records_update" on public.records
  for update to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ONLY admins can delete records (staff are blocked at the DB level).
drop policy if exists "records_delete_admin" on public.records;
create policy "records_delete_admin" on public.records
  for delete to authenticated
  using (public.is_admin());
