import { supabase } from '@/lib/supabaseClient';
import type { Profile, UserRole } from '@/types';

/**
 * Admin user-management on the `profiles` table.
 *
 * Creating auth users with passwords requires the Supabase service_role key
 * (Edge Function / server). Admins add users in Supabase Dashboard → Authentication.
 * Public self-signup must be disabled in the Supabase project (see README).
 */
export const userService = {
  async list(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Profile[];
  },

  async updateRole(userId: string, role: UserRole): Promise<void> {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
  },

  async remove(userId: string): Promise<void> {
    // Removes the profile row. Fully deleting the auth user requires the admin
    // API (service_role) via a server function; documented in README.
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
  },
};
