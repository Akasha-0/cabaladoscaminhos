// ============================================================
// API ROUTE — Logout do Operator (Fase 8 + 13 + 15 + 24)
// ============================================================
// Revoga AS DUAS OperatorSession (access + refresh) e limpa OS DOIS
// cookies: `cockpit_session` (access) + `cockpit_refresh` (refresh).
// Idempotente — sempre retorna 200 (logout não precisa falhar se o
// usuário não estava autenticado).
//
// Fase 24: rate-limit POR OPERATOR (10 logout / min).
// Protege contra logout-forçado (ex: atacante tenta deslogar o operator
// em loop para causar inconvenience). O IP limit já existia na Fase 18
// para o endpoint de login, mas logout agora também tem operador limit.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  OPERATOR_TOKEN_COOKIE,
  OPERATOR_REFRESH_COOKIE,
  clearOperatorSessionCookie,
  clearOperatorRefreshCookie,
} from '@/lib/auth/operator-jwt';
import { revokeSession } from '@/lib/auth/operator-sessions';
import { checkOperatorRateLimit, OPERATOR_RATE_LIMITS } from '@/lib/auth/rate-limit';
import { getOperatorFromRequest } from '@/lib/auth/operator-session';

const OPERATOR_LIMIT = OPERATOR_RATE_LIMITS['logout'].max; // 10
const OPERATOR_WINDOW = OPERATOR_RATE_LIMITS['logout'].windowSeconds; // 60s

export async function POST(request: NextRequest) {
  // Tenta obter o operatorId para rate-limit
  let operatorId = 'anonymous';
  try {
    const operator = await getOperatorFromRequest(request);
    if (operator) {
      operatorId = operator.id;
    }
  } catch {
    // Se falhar em obter operator, usamos 'anonymous' — IP limit ainda protege
  }

  // Fase 24: rate-limit POR OPERATOR antes de trabalho no banco
  const rlResult = await checkOperatorRateLimit(
    operatorId,
    'logout',
    OPERATOR_LIMIT,
    OPERATOR_WINDOW
  );

  if (!rlResult.allowed) {
    return NextResponse.json(
      {
        error: 'Limite de操作 por operador excedido. Tente novamente mais tarde.',
        retryAfter: rlResult.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rlResult.limit.toString(),
          'X-RateLimit-Remaining': rlResult.remaining.toString(),
          'X-RateLimit-Reset': rlResult.resetAt.toString(),
          'Retry-After': rlResult.retryAfterSeconds.toString(),
        },
      }
    );
  }

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
