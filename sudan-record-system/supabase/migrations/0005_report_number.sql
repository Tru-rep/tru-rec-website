-- ============================================================================
-- 0005_report_number.sql
-- Add report/complaint serial number (رقم البلاغ) to records.
-- ============================================================================

alter table public.records
  add column if not exists report_number text;

create index if not exists idx_records_report_number_trgm
  on public.records using gin (report_number gin_trgm_ops);
