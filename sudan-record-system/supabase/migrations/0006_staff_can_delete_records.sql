-- ============================================================================
-- 0006_staff_can_delete_records.sql
-- Allow all authenticated users (admin + staff) to delete records and photos.
-- Run in Supabase SQL Editor after 0001–0005.
-- ============================================================================

drop policy if exists "records_delete_admin" on public.records;
create policy "records_delete" on public.records
  for delete to authenticated
  using (auth.uid() is not null);

drop policy if exists "record_photos_delete_admin" on storage.objects;
create policy "record_photos_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'record-photos');
