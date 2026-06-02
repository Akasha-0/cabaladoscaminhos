// ============================================================
// API ROUTE — Logout do Operator (Fase 8 + 13)
// ============================================================
// Revoga a OperatorSession (Fase 13 — soft revoke) e limpa o cookie
// `cockpit_session`. Idempotente — sempre retorna 200 (logout não
// precisa falhar se o usuário não estava autenticado).

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearOperatorSessionCookie, OPERATOR_TOKEN_COOKIE } from '@/lib/auth/operator-jwt';
import { revokeSession } from '@/lib/auth/operator-sessions';

export async function POST(_request: NextRequest) {
  // Tenta revogar a sessão atual (se houver cookie).
  // Falha aqui é logged mas NÃO bloqueia o logout.
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(OPERATOR_TOKEN_COOKIE)?.value;
    if (token) {
      await revokeSession(token);
    }
  } catch (err) {
    console.error('[operator/auth/logout] failed to revoke session', err);
  }

  const response = NextResponse.json({ success: true });
  clearOperatorSessionCookie(response);
  return response;
}
