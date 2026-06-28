'use client';

/**
 * SupabaseProvider — Provider de cliente Supabase + sessão reativa.
 * ----------------------------------------------------------------------------
 * Disponibiliza o cliente Supabase + sessão atual via Context API.
 * Usado em src/app/layout.tsx para envolver toda a app.
 *
 * Hooks expostos:
 *   - useSupabase() → { supabase, session, isLoading }
 *   - useAuth()     → { user, isAuthenticated, isLoading, supabase }
 *                      (wrapper canônico usado por src/hooks/useAuth.ts)
 *
 * Wave 11 (auth integration): useAuth foi consolidado aqui para eliminar a
 * divergência anterior onde `src/hooks/useAuth.ts` importava `useAuth` deste
 * provider mas o provider só exportava `useSupabase`. Mantemos os dois
 * exports para retrocompatibilidade.
 *
 * Refs:
 *   - src/lib/supabase/client.ts (cliente browser)
 *   - src/lib/supabase/server.ts (cliente server)
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import { trackLogin, trackLogout } from '@/lib/analytics/events-catalog';
import { getPostHog } from '@/lib/monitoring/posthog';

type SupabaseContextValue = {
  supabase: SupabaseClient | null;
  session: Session | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextValue>({
  supabase: null,
  session: null,
  isLoading: true,
});

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => {
    try {
      return createClient();
    } catch (err) {
      // Supabase nao configurado (sem env vars). App funciona em modo demo.
      console.warn('[SupabaseProvider] Supabase nao configurado:', err);
      return null;
    }
  });

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Pega sessao inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Escuta mudancas de sessao (login/logout/refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // Wave 18 — analytics: user_logged_in / user_logged_out
      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id;
        const provider = (session.user.app_metadata?.provider as
          | 'email'
          | 'google'
          | 'apple'
          | 'magic_link'
          | undefined) ?? 'email';
        trackLogin(userId, provider);

        // Identifica o usuario no PostHog (atribui distinct_id)
        const ph = getPostHog();
        if (ph) {
          ph.identify(userId, {
            email: session.user.email,
            created_at: session.user.created_at,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        trackLogout();
        const ph = getPostHog();
        if (ph) ph.reset();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase, session, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error('useSupabase deve ser usado dentro de SupabaseProvider');
  }
  return ctx;
}

/**
 * useAuth — Hook canônico de autenticação no provider.
 *
 * Retorna o subconjunto que `src/hooks/useAuth.ts` consome. O hook público
 * adiciona `signIn`/`signUp`/`signOut`/`signInWithGoogle` etc. em cima
 * deste shape.
 */
export function useAuth(): {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  supabase: SupabaseClient | null;
} {
  const { supabase, session, isLoading } = useContext(SupabaseContext);
  const user = session?.user ?? null;
  return {
    user,
    supabase,
    isLoading,
    isAuthenticated: Boolean(user) && !isLoading,
  };
}
