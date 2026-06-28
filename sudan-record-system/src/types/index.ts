export * from './database';

/** Generic shape for paginated list responses. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Lightweight result for search cards (subset of columns for performance). */
export interface RecordSummary {
  id: string;
  full_name: string;
  nickname: string | null;
  profession: string | null;
  photo_url: string | null;
  created_at: string;
}
