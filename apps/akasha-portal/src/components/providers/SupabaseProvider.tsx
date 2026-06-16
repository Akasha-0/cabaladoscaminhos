'use client';

import { createBrowserClient } from '@supabase/ssr';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  supabase: ReturnType<typeof createBrowserClient> | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  supabase: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within SupabaseProvider');
  }
  return context;
};

// Singleton client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseClient(url?: string, anonKey?: string) {
  if (supabaseClient) return supabaseClient;
  const resolvedUrl = url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const resolvedKey = anonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!resolvedUrl || !resolvedKey) {
    console.error('[SupabaseProvider] Missing Supabase environment variables');
    return null;
  }
  supabaseClient = createBrowserClient(resolvedUrl, resolvedKey);
  return supabaseClient;
}

export function SupabaseProvider({
  children,
  url,
  anonKey,
}: {
  children: React.ReactNode;
  url?: string;
  anonKey?: string;
}) {
  // All hooks must be called unconditionally
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const initRef = useRef(false);

  // Always get supabase client (passing explicit env vars from layout for clarity)
  const supabase = getSupabaseClient(url, anonKey);

  // Mark as hydrated on client mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize auth - hooks called after all initial hooks
  useEffect(() => {
    // Don't run if not hydrated or already initialized
    if (!isHydrated || initRef.current) {
      return;
    }

    initRef.current = true;

    // If no supabase, just mark as not loading
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('[SupabaseProvider] Error getting session:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, isHydrated]);

  const signOut = useCallback(async () => {
    if (!supabase) return;

    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('[SupabaseProvider] Sign out error:', err);
    }
  }, [supabase, router]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user && isHydrated,
    signOut,
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
