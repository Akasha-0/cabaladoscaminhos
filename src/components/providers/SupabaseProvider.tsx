'use client';

/**
 * SupabaseProvider — Provider de cliente Supabase + sessão reativa.
 * ----------------------------------------------------------------------------
 * Disponibiliza o cliente Supabase + sessão atual via Context API.
 * Usado em src/app/layout.tsx para envolver toda a app.
 *
 * Refs:
 *   - src/lib/supabase/client.ts (cliente browser)
 *   - src/lib/supabase/server.ts (cliente server)
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, Session } from '@supabase/supabase-js';

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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