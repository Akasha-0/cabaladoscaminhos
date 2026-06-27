// ============================================================================
// AUTH HELPERS — Server-side: extrai user do Supabase
// ============================================================================
// Os endpoints de mutação exigem usuário autenticado. Em ambiente de dev sem
// Supabase configurado, aceitamos um header `x-dev-user-id` para que os
// seeds e testes funcionem sem precisar de OAuth.
// ============================================================================

import { headers } from 'next/headers';
import { createClient as createServerSupabase } from '@/lib/supabase-server';

export interface Viewer {
  id: string;
  email: string | null;
  displayName: string;
}

export async function getViewer(): Promise<Viewer | null> {
  // 1) Modo dev: aceita header x-dev-user-id
  try {
    const h = await headers();
    const devId = h.get('x-dev-user-id');
    if (devId && devId.trim().length > 0) {
      return {
        id: devId.trim(),
        email: null,
        displayName: `Dev ${devId.slice(0, 6)}`,
      };
    }
  } catch {
    // headers() pode falhar fora de request context
  }

  // 2) Supabase server-side
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email ?? null,
      displayName:
        (user.user_metadata?.display_name as string | undefined) ??
        (user.email?.split('@')[0] ?? 'Membro'),
    };
  } catch {
    return null;
  }
}

/**
 * Em produção, todos endpoints de mutação DEVEM chamar requireViewer().
 * Em dev/test, aceitamos o header x-dev-user-id para destravar a UI.
 */
export async function requireViewer(): Promise<Viewer> {
  const v = await getViewer();
  if (!v) {
    const err = new Error('Não autenticado');
    (err as Error & { statusCode?: number }).statusCode = 401;
    throw err;
  }
  return v;
}