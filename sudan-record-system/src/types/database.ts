/**
 * Database row shapes. These mirror the SQL schema in `supabase/migrations/`.
 * Defined by hand (rather than generated) to keep the project dependency-free,
 * but laid out so they can be swapped for `supabase gen types` output later.
 */

export type UserRole = 'admin' | 'staff';

export type Gender = 'male' | 'female' | 'other';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
}

export interface RecordRow {
  id: string;
  full_name: string;
  age: number | null;
  gender: Gender | null;
  address: string | null;
  profession: string | null;
  nickname: string | null;
  visible_marks: string | null;
  case_notes: string | null;
  crime_type: string | null;
  report_number: string | null;
  additional_notes: string | null;
  photo_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Fields a user can write when creating/updating a record. */
export type RecordInput = Omit<
  RecordRow,
  'id' | 'created_by' | 'created_at' | 'updated_at'
>;
