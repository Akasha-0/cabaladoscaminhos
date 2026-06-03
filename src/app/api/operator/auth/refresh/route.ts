// ============================================================
// API ROUTE — Refresh do Operator (Fase 15 + 18 + 24)
// ============================================================
// Rotaciona o refresh token: revoga o refresh usado e emite novo par
// access (15min) + refresh (30d). Detecta reuso de refresh revogado
// (sinal de roubo de cookie) e revoga TODAS as sessões do operator.
//
// Respostas:
//   200 — rotação OK; novos cookies setados; { operator: {...} }
//   401 — refresh ausente / inválido / expirado
//   403 — reuso detectado; cookies limpos; operador precisa logar de novo
//   429 — rate-limit excedido (Fase 18 + 24)
//
// Por que 403 (e não 401) para reuso? RFC sugere 401 (não autenticado),
// mas a semântica de reuso é diferente: a autenticação era válida e foi
// REVOGADA por suspeita de comprometimento. 403 + log de segurança
// ajuda times de SRE a diferenciar.
//
// Fase 18: rate-limit por IP (30 rotações / min) via Redis. Mitiga
// abuso do endpoint de rotação.
//
// Fase 24: rate-limit POR OPERATOR (30 rotações / min) via Redis.
// Camada adicional: mesmo que um IP seja compartilhado (ex: NAT), cada
// operator tem seu próprio limite. Evita flooding de sessions.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import {
  OPERATOR_REFRESH_COOKIE,
  signOperatorAccessToken,
  signOperatorRefreshToken,
  setOperatorSessionCookie,
  setOperatorRefreshCookie,
  clearOperatorSessionCookie,
  clearOperatorRefreshCookie,
  verifyOperatorToken,
} from '@/lib/auth/operator-jwt';
import {
  applyRateLimitHeaders,
  checkBothRateLimits,
  OPERATOR_RATE_LIMITS,
} from '@/lib/auth/rate-limit';
import { rotateRefreshToken } from '@/lib/auth/operator-sessions';
import { logSecurityEvent } from '@/lib/auth/audit-service';

const IP_LIMIT = OPERATOR_RATE_LIMITS['refresh'].max;        // 30
const IP_WINDOW = 60;                                        // 1 min (sincronizado com fase 18)
const OPERATOR_LIMIT = OPERATOR_RATE_LIMITS['refresh'].max;  // 30
const OPERATOR_WINDOW = OPERATOR_RATE_LIMITS['refresh'].windowSeconds; // 60s

export async function POST(request: NextRequest) {
  // 1) Lê refresh cookie para obter operatorId ANTES do rate-limit
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(OPERATOR_REFRESH_COOKIE)?.value;

  let operatorId = 'anonymous';
  if (refreshToken) {
    const payload = verifyOperatorToken(refreshToken, 'refresh');
    if (payload) {
      operatorId = payload.sub;
    }
  }

  // Fase 24: DUAL-LAYER rate-limit (IP + Operator)
  // Ambas as camadas são verificadas independentemente.
  const rl = await checkBothRateLimits(
    request,
    operatorId,
    'refresh',
    IP_LIMIT,
    IP_WINDOW,
    OPERATOR_LIMIT,
    OPERATOR_WINDOW
  );

  if (rl.kind === 'blocked') {
    return rl.response;
  }
  const { ipResult, operatorResult } = rl;

  // 2) Lê refresh cookie
  if (!refreshToken) {
    const res = NextResponse.json(
      { error: 'Refresh token ausente. Faça login novamente.' },
      { status: 401 }
    );
    applyRateLimitHeaders(res, ipResult);
    return res;
  }

  // 3) Verifica assinatura + type=refresh
  const payload = verifyOperatorToken(refreshToken, 'refresh');
  if (!payload) {
    const res = NextResponse.json(
      { error: 'Refresh token inválido. Faça login novamente.' },
      { status: 401 }
    );
    applyRateLimitHeaders(res, ipResult);
    return res;
  }

  // 4) Rotação (Fase 15): revoga refresh usado, emite novo par.
  //    Reuso → revoga TODAS as sessões do operator.
  const ipAddress = request?.headers.get('x-forwarded-for') ?? request?.headers.get('x-real-ip') ?? null;
  const userAgent = request?.headers.get('user-agent') ?? null;

  const result = await rotateRefreshToken({
    refreshToken,
    signAccess: signOperatorAccessToken,
    signRefresh: signOperatorRefreshToken,
    loadOperator: async (id: string) => {
      const op = await prisma.operator.findUnique({
        where: { id },
        select: { id: true, role: true },
      });
      return op ? { id: op.id, role: op.role } : null;
    },
    ipAddress,
    userAgent,
  });

  if (result.kind === 'invalid') {
    // Refresh expirado / hash não bate / operator sumiu
    const response = NextResponse.json(
      { error: 'Refresh token inválido ou expirado. Faça login novamente.' },
      { status: 401 }
    );
    clearOperatorSessionCookie(response);
    clearOperatorRefreshCookie(response);
    applyRateLimitHeaders(response, ipResult);
    return response;
  }

  if (result.kind === 'reuse-detected') {
    // SINAL DE ROUBO: refresh revogado foi reapresentado.
    // revokeAllOperatorSessions já foi chamado dentro de rotateRefreshToken.
    console.error(
      `[operator/auth/refresh] REUSE DETECTED for operator ${payload.sub} — ` +
        `TODAS as sessões foram revogadas (provável roubo de cookie).`
    );
    // Fase 21: REFRESH_REUSE — fire-and-forget, nunca bloqueia
    logSecurityEvent({
      type: 'REFRESH_REUSE',
      operatorId: payload.sub,
      ipAddress,
      userAgent,
      metadata: { reusedAt: new Date().toISOString() },
    });
    const response = NextResponse.json({
        error: 'Sessão comprometida',
        message:
          'Detectamos reuso de um refresh token já revogado. ' +
          'Todas as sessões foram invalidadas por segurança. Faça login novamente.',
      },
      { status: 403 }
    );
    clearOperatorSessionCookie(response);
    clearOperatorRefreshCookie(response);
    applyRateLimitHeaders(response, ipResult);
    return response;
  }

  // result.kind === 'ok' — emite novo par
  const operator = await prisma.operator.findUnique({
    where: { id: result.operatorId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!operator) {
    // Edge case: operator foi deletado entre rotação e lookup final
    const response = NextResponse.json(
      { error: 'Operator não encontrado' },
      { status: 401 }
    );
    clearOperatorSessionCookie(response);
    clearOperatorRefreshCookie(response);
    applyRateLimitHeaders(response, ipResult);
    return response;
  }

  const response = NextResponse.json({
    operator: {
      id: operator.id,
      email: operator.email,
      name: operator.name,
      role: operator.role,
    },
  });
  setOperatorSessionCookie(response, result.newAccessToken);
  setOperatorRefreshCookie(response, result.newRefreshToken);
  // Aplica headers da camada IP (mais relevante para o cliente)
  applyRateLimitHeaders(response, ipResult);
  return response;
}
