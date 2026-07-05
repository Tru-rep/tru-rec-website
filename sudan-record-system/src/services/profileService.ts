import { supabase } from '@/lib/supabaseClient';
import type { Profile } from '@/types';

/** Updates for the signed-in user's profile row. */
export const profileService = {
  async updateFullName(userId: string, fullName: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() || null })
      .eq('id', userId)
      .select('id, email, role, full_name, created_at')
      .single();
    if (error) throw error;
    return data as Profile;
  },
};
