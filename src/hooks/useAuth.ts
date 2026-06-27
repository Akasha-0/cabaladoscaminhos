'use client';

/**
 * useAuth — Hook unificado de autenticação
 * ----------------------------------------------------------------------------
 * Wrapper fino sobre o `SupabaseProvider` que expõe:
 *   - user            — User do Supabase Auth (ou null)
 *   - loading         — true enquanto carrega a sessão inicial
 *   - isAuthenticated — atalho `!!user && !loading`
 *   - signIn          — login com email + senha
 *   - signUp          — signup com email + senha + metadados
 *   - signInWithGoogle — OAuth (placeholder)
 *   - signOut         — logout
 *   - supabase        — cliente Supabase (pode ser null em sandbox)
 *
 * Toda a API aqui é server-safe: nunca quebra quando o Supabase não está
 * configurado (sandbox / preview). Cada método devolve `{ ok, error }` para
 * padronizar tratamento de erro nos componentes.
 */

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useAuthFromProvider } from '@/components/providers/SupabaseProvider';
import type { AuthError, User } from '@supabase/supabase-js';

export interface AuthActionResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface SignUpMetadata {
  fullName: string;
  traditions?: string[];
  redirectTo?: string;
}

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  supabase: ReturnType<typeof useAuthFromProvider>['supabase'];

  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (
    email: string,
    password: string,
    metadata?: SignUpMetadata
  ) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  redirectAfterAuth: (path?: string) => void;
}

/**
 * Hook público de autenticação. Re-exportado de `src/hooks/useAuth.ts` para
 * padronizar a import path recomendada (em vez de importar diretamente do
 * provider).
 */
export function useAuth(): UseAuthReturn {
  const ctx = useAuthFromProvider();
  const router = useRouter();

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      if (!ctx.supabase) {
        return { ok: false, error: 'Serviço de autenticação indisponível' };
      }
      const { error } = await ctx.supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { ok: false, error: mapAuthError(error) };
      }
      return { ok: true };
    },
    [ctx.supabase]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata?: SignUpMetadata
    ): Promise<AuthActionResult> => {
      if (!ctx.supabase) {
        return { ok: false, error: 'Serviço de autenticação indisponível' };
      }
      const { data, error } = await ctx.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.fullName,
            traditions: metadata?.traditions ?? [],
          },
          emailRedirectTo:
            metadata?.redirectTo ??
            (typeof window !== 'undefined'
              ? `${window.location.origin}/onboarding`
              : undefined),
        },
      });
      if (error) {
        return { ok: false, error: mapAuthError(error) };
      }
      return { ok: true, data: data.user ?? undefined };
    },
    [ctx.supabase]
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthActionResult> => {
    if (!ctx.supabase) {
      return { ok: false, error: 'Serviço de autenticação indisponível' };
    }
    const { error } = await ctx.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/feed`
            : undefined,
      },
    });
    if (error) {
      return { ok: false, error: mapAuthError(error) };
    }
    return { ok: true };
  }, [ctx.supabase]);

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    if (!ctx.supabase) {
      return { ok: false, error: 'Serviço de autenticação indisponível' };
    }
    const { error } = await ctx.supabase.auth.signOut();
    if (error) {
      return { ok: false, error: mapAuthError(error) };
    }
    return { ok: true };
  }, [ctx.supabase]);

  const redirectAfterAuth = useCallback(
    (path?: string) => {
      router.push(path ?? '/feed');
    },
    [router]
  );

  return useMemo(
    () => ({
      user: ctx.user,
      loading: ctx.isLoading,
      isAuthenticated: ctx.isAuthenticated,
      supabase: ctx.supabase,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      redirectAfterAuth,
    }),
    [
      ctx.user,
      ctx.isLoading,
      ctx.isAuthenticated,
      ctx.supabase,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      redirectAfterAuth,
    ]
  );
}

function mapAuthError(err: AuthError | { message: string }): string {
  const msg = err.message || 'Erro desconhecido';
  if (/invalid login credentials/i.test(msg)) return 'Email ou senha incorretos';
  if (/user already registered/i.test(msg)) return 'Este email já está cadastrado';
  if (/password/i.test(msg) && /short/i.test(msg)) return 'Senha muito curta';
  if (/email/i.test(msg) && /invalid/i.test(msg)) return 'Email inválido';
  return msg;
}