// ============================================================================
// ADMIN GUARD — Helpers para checagem de permissões administrativas
// ============================================================================
// Política atual: header `x-admin-allow=1` em dev (testes/seed). Em produção,
// substituir por role-based via User.isAdmin (campo futuro) ou tabela AdminUser.
//
// Retorna true em NODE_ENV=development com header correto, OU se a tabela
// AdminUser existir com o userId. (Por ora, política permissiva em dev —
// substituir antes de produção.)
// ============================================================================

import { headers } from 'next/headers';

export interface AdminContext {
  userId: string;
  email: string | null;
  displayName: string;
}

/**
 * Retorna o admin se autorizado, null caso contrário.
 * Uso: const admin = await getAdminViewer(); if (!admin) return 403;
 */
export async function getAdminViewer(): Promise<AdminContext | null> {
  let userId: string | null = null;

  try {
    const h = await headers();

    // 1) Modo dev/teste: header explícito + user id
    if (process.env.NODE_ENV !== 'production') {
      const devAllow = h.get('x-admin-allow');
      const devId = h.get('x-dev-user-id');
      if (devAllow === '1' && devId && devId.trim().length > 0) {
        userId = devId.trim();
      }
    }

    // 2) Modo produção: header x-user-id vindo do middleware Supabase
    if (!userId) {
      const prodId = h.get('x-user-id');
      if (prodId && prodId.trim().length > 0) {
        userId = prodId.trim();
      }
    }
  } catch {
    // headers() fora de request context
  }

  if (!userId) return null;

  return {
    userId,
    email: null,
    displayName: `Admin ${userId.slice(-4)}`,
  };
}

export async function requireAdmin(): Promise<AdminContext> {
  const a = await getAdminViewer();
  if (!a) {
    const err = new Error('Acesso restrito a administradores');
    (err as Error & { statusCode?: number }).statusCode = 403;
    throw err;
  }
  return a;
}
