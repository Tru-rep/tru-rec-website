/**
 * Centralized, validated access to environment variables.
 *
 * Keeping env access in one place means the rest of the app never reads
 * `import.meta.env` directly, and we can report a single, friendly message
 * when configuration is missing (e.g. before Supabase has been wired up).
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const photoBucket = (import.meta.env.VITE_SUPABASE_PHOTO_BUCKET as string | undefined) ?? 'record-photos';

/** True only when both required Supabase variables are present and non-empty. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const env = {
  supabaseUrl: url ?? '',
  supabaseAnonKey: anonKey ?? '',
  photoBucket,
} as const;

/** Human-readable list of missing variables, for the setup banner. */
export function getMissingEnvVars(): string[] {
  const missing: string[] = [];
  if (!url) missing.push('VITE_SUPABASE_URL');
  if (!anonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  return missing;
}
