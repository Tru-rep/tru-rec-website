import { supabase } from '@/lib/supabaseClient';
import { PAGE_SIZE } from '@/utils/constants';
import type { Paginated, RecordInput, RecordRow, RecordSummary } from '@/types';

/** Columns needed for list/search cards only (keeps payloads small). */
const SUMMARY_COLUMNS = 'id, full_name, nickname, profession, report_number, photo_url, created_at';
const FULL_COLUMNS =
  'id, full_name, age, gender, address, profession, nickname, visible_marks, case_notes, crime_type, report_number, additional_notes, photo_url, created_by, created_at, updated_at';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * All reads/writes against the `records` table. Business rules around what
 * columns to select, pagination and search live here, not in components.
 */
export const recordService = {
  /** Paginated list with optional fuzzy search across indexed text columns. */
  async list({ page = 1, pageSize = PAGE_SIZE, search }: ListParams): Promise<Paginated<RecordSummary>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('records')
      .select(SUMMARY_COLUMNS, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    const term = search?.trim();
    if (term) {
      // ilike across the most useful columns; backed by pg_trgm indexes.
      const pattern = `%${term}%`;
      query = query.or(
        `full_name.ilike.${pattern},nickname.ilike.${pattern},profession.ilike.${pattern},address.ilike.${pattern},report_number.ilike.${pattern}`,
      );
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      items: (data ?? []) as RecordSummary[],
      total: count ?? 0,
      page,
      pageSize,
    };
  },

  /** Recent records for the dashboard. */
  async recent(limit = 5): Promise<RecordSummary[]> {
    const { data, error } = await supabase
      .from('records')
      .select(SUMMARY_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as RecordSummary[];
  },

  /** Total record count for dashboard stats. */
  async count(): Promise<number> {
    const { count, error } = await supabase
      .from('records')
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    return count ?? 0;
  },

  async getById(id: string): Promise<RecordRow> {
    const { data, error } = await supabase
      .from('records')
      .select(FULL_COLUMNS)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as RecordRow;
  },

  async create(input: RecordInput, createdBy: string): Promise<RecordRow> {
    // `created_by` is enforced by DB trigger + RLS; client value must match auth.uid().
    const { data, error } = await supabase
      .from('records')
      .insert({ ...input, created_by: createdBy })
      .select(FULL_COLUMNS)
      .single();
    if (error) throw error;
    return data as RecordRow;
  },

  async update(id: string, input: Partial<RecordInput>): Promise<RecordRow> {
    const { data, error } = await supabase
      .from('records')
      .update(input)
      .eq('id', id)
      .select(FULL_COLUMNS)
      .single();
    if (error) throw error;
    return data as RecordRow;
  },

  async remove(id: string): Promise<void> {
    const { data, error } = await supabase.from('records').delete().eq('id', id).select('id');
    if (error) throw error;
    if (!data?.length) {
      throw new Error(
        'لم يتم حذف السجل. تأكد من تشغيل migration 0006 في Supabase أو أن لديك صلاحية الحذف.',
      );
    }
  },

  /** Exact match on report_number for duplicate checks before save. */
  async findByReportNumber(
    reportNumber: string,
    excludeId?: string,
  ): Promise<{ id: string; full_name: string } | null> {
    const trimmed = reportNumber.trim();
    if (!trimmed) return null;

    let query = supabase
      .from('records')
      .select('id, full_name')
      .eq('report_number', trimmed)
      .limit(1);

    if (excludeId) query = query.neq('id', excludeId);

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data as { id: string; full_name: string } | null;
  },
};
