import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from './env';

/**
 * Single shared Supabase client for the whole app.
 *
 * When env vars are missing (e.g. fresh checkout before configuring .env) we
 * still create a client with placeholder values so the app can boot and render
 * the login screen with a "configure Supabase" banner instead of crashing.
 * All real network calls are guarded by `isSupabaseConfigured`.
 */
const supabaseUrl = isSupabaseConfigured ? env.supabaseUrl : 'https://placeholder.supabase.co';
const supabaseKey = isSupabaseConfigured ? env.supabaseAnonKey : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Switch session storage before sign-in so «تذكرني» uses localStorage vs sessionStorage. */
export function configureAuthPersistence(remember: boolean) {
  const storage = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  const auth = supabase.auth as unknown as { storage: Storage; storageKey: string };
  auth.storage = storage;
  other.removeItem(auth.storageKey);
}
