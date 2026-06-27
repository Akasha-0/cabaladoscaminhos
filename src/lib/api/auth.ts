// ============================================================================
// AUTH HELPER — Extração do usuário autenticado a partir do Supabase server
// client.
// ============================================================================
// Encapsula a chamada `supabase.auth.getUser()` com fallback seguro para
// ambientes sem Supabase configurado (dev/sandbox).
// ============================================================================

import { createClient as createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * Usuário autenticado, forma reduzida.
 * Os IDs são do Supabase Auth (não do Prisma User).
 */
export interface AuthUser {
  id: string;
  email: string | null;
  /** Display name do metadata (Supabase user_metadata.full_name) */
  displayName: string | null;
}

/**
 * Recupera o usuário autenticado. Retorna `null` se não houver sessão.
 * Falha silenciosa quando Supabase não está configurado.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    const displayName =
      typeof metadata['full_name'] === 'string'
        ? (metadata['full_name'] as string)
        : typeof metadata['name'] === 'string'
          ? (metadata['name'] as string)
          : null;

    return {
      id: user.id,
      email: user.email ?? null,
      displayName,
    };
  } catch {
    // Supabase não configurado ou outro erro — retorna null silenciosamente
    return null;
  }
}

/**
 * Helper para rotas que exigem auth — retorna usuário ou lança erro.
 * @throws {AuthError} se não autenticado
 */
export class AuthError extends Error {
  readonly code = 'UNAUTHORIZED';
  constructor(message = 'Autenticação necessária') {
    super(message);
    this.name = 'AuthError';
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) throw new AuthError();
  return user;
}
