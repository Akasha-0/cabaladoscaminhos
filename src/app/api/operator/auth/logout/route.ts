// ============================================================
// API ROUTE — Logout do Operator (Fase 8 + 13 + 15)
// ============================================================
// Revoga AS DUAS OperatorSession (access + refresh) e limpa OS DOIS
// cookies: `cockpit_session` (access) + `cockpit_refresh` (refresh).
// Idempotente — sempre retorna 200 (logout não precisa falhar se o
// usuário não estava autenticado).

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  OPERATOR_TOKEN_COOKIE,
  OPERATOR_REFRESH_COOKIE,
  clearOperatorSessionCookie,
  clearOperatorRefreshCookie,
} from '@/lib/auth/operator-jwt';
import { revokeSession } from '@/lib/auth/operator-sessions';

export async function POST(_request: NextRequest) {
  // Tenta revogar ambas as sessões (se houver cookies).
  // Falha aqui é logged mas NÃO bloqueia o logout.
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(OPERATOR_TOKEN_COOKIE)?.value;
    if (accessToken) {
      await revokeSession(accessToken);
    }
    const refreshToken = cookieStore.get(OPERATOR_REFRESH_COOKIE)?.value;
    if (refreshToken) {
      await revokeSession(refreshToken);
    }
  } catch (err) {
    console.error('[operator/auth/logout] failed to revoke session(s)', err);
  }

  const response = NextResponse.json({ success: true });
  clearOperatorSessionCookie(response);
  clearOperatorRefreshCookie(response);
  return response;
}
