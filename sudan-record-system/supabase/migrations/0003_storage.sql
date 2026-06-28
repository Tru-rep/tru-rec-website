-- ============================================================================
-- 0003_storage.sql
-- Storage bucket + RLS for protected record photos.
--
-- NOTE: You can also create the bucket from the Supabase Dashboard
-- (Storage -> New bucket -> name: "record-photos"). This file does it via SQL
-- and adds policies so only authenticated users can read/write photos, and
-- only admins can delete them (mirrors the records table rules).
--
-- The bucket name MUST match VITE_SUPABASE_PHOTO_BUCKET (default: record-photos).
-- ============================================================================

-- Create the bucket (idempotent). Keep `public = false`; the app uses signed URLs.
insert into storage.buckets (id, name, public)
values ('record-photos', 'record-photos', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Storage RLS policies (operate on storage.objects)
-- ---------------------------------------------------------------------------

-- Read photos: any authenticated user.
drop policy if exists "record_photos_select" on storage.objects;
create policy "record_photos_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'record-photos');

-- Upload photos: any authenticated user.
drop policy if exists "record_photos_insert" on storage.objects;
create policy "record_photos_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'record-photos');

-- Update/replace photos: any authenticated user.
drop policy if exists "record_photos_update" on storage.objects;
create policy "record_photos_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'record-photos')
  with check (bucket_id = 'record-photos');

-- Delete photos: admins only (matches record delete permission).
drop policy if exists "record_photos_delete_admin" on storage.objects;
create policy "record_photos_delete_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'record-photos' and public.is_admin());
