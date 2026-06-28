-- ============================================================================
-- 0004_security_hardening.sql
-- Role escalation guard, records created_by enforcement, private photo bucket.
-- Run after 0001–0003 in the Supabase SQL editor (or via CLI).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Prevent staff from escalating their own role (or editing others)
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if old.id is distinct from auth.uid() then
    raise exception 'insufficient_privilege';
  end if;

  -- Non-admins may only change full_name on their own row.
  new.role := old.role;
  new.email := old.email;
  new.id := old.id;
  new.created_at := old.created_at;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile_update on public.profiles;
create trigger trg_guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- 2. Enforce created_by = current user on record insert
-- ---------------------------------------------------------------------------
drop policy if exists "records_insert" on public.records;
create policy "records_insert" on public.records
  for insert to authenticated
  with check (created_by = auth.uid());

create or replace function public.set_record_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.created_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_records_set_created_by on public.records;
create trigger trg_records_set_created_by
  before insert on public.records
  for each row execute function public.set_record_created_by();

-- ---------------------------------------------------------------------------
-- 3. Private photo bucket (signed URLs required; no anonymous access)
-- ---------------------------------------------------------------------------
update storage.buckets
set public = false
where id = 'record-photos';
