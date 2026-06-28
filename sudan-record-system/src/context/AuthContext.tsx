import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/env';
import type { Profile } from '@/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    try {
      const p = await authService.getProfile(userId);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }

  useEffect(() => {
    // Without Supabase configured we cannot have a session; stop loading so
    // the login screen renders with the setup banner.
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    authService
      .getSession()
      .then(async (s) => {
        if (!active) return;
        setSession(s);
        if (s?.user) await loadProfile(s.user.id);
      })
      .finally(() => active && setLoading(false));

    const { data: sub } = authService.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        void loadProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      isAuthenticated: Boolean(session),
      async signIn(email, password) {
        await authService.signIn(email, password);
      },
      async signOut() {
        await authService.signOut();
        setProfile(null);
      },
      async refreshProfile() {
        if (session?.user) await loadProfile(session.user.id);
      },
    }),
    [session, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
