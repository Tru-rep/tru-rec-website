import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { Profile } from '@/types';

/**
 * Authentication + current-user concerns.
 *
 * This service is the ONLY place that talks to `supabase.auth` and the
 * `profiles` table for the signed-in user. UI/hooks call these functions and
 * never touch the Supabase client directly.
 */
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async sendPasswordReset(email: string) {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /** Fetch the profile row (role, name) for a given auth user id. */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      // No profile row yet is not a fatal error; treat as "no profile".
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Profile;
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
