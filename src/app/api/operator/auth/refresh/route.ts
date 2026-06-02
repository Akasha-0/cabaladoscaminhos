// ============================================================
// API ROUTE — Refresh do Operator (Fase 15 + 18)
// ============================================================
// Rotaciona o refresh token: revoga o refresh usado e emite novo par
// access (15min) + refresh (30d). Detecta reuso de refresh revogado
// (sinal de roubo de cookie) e revoga TODAS as sessões do operator.
//
// Respostas:
//   200 — rotação OK; novos cookies setados; { operator: {...} }
//   401 — refresh ausente / inválido / expirado
//   403 — reuso detectado; cookies limpos; operador precisa logar de novo
//   429 — rate-limit excedido (Fase 18)
//
// Por que 403 (e não 401) para reuso? RFC sugere 401 (não autenticado),
// mas a semântica de reuso é diferente: a autenticação era válida e foi
// REVOGADA por suspeita de comprometimento. 403 + log de segurança
// ajuda times de SRE a diferenciar.
//
// Fase 18: rate-limit por IP (30 rotações / min) via Redis. Mitiga
// abuso do endpoint de rotação (que faz I/O no banco + cria session).

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
  enforceAuthRateLimit,
} from '@/lib/auth/rate-limit';
import { rotateRefreshToken } from '@/lib/auth/operator-sessions';

// fallow-ignore-next-line complexity
export async function POST(request: NextRequest) {
  // Fase 18: rate-limit ANTES de tudo. Refresh é endpoint "barato" mas
  // faz 3 escritas no banco (revoke + create access + create refresh) e
  // emite 2 JWTs. Atacante pode abusar para encher a tabela de sessions.
  const rl = await enforceAuthRateLimit(request, 'refresh');
  if (rl.kind === 'blocked') {
    return rl.response;
  }
  const { result: rlResult } = rl;

  // 1) Lê refresh cookie
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(OPERATOR_REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    const res = NextResponse.json(
      { error: 'Refresh token ausente. Faça login novamente.' },
      { status: 401 }
    );
    applyRateLimitHeaders(res, rlResult);
    return res;
  }

  // 2) Verifica assinatura + type=refresh
  const payload = verifyOperatorToken(refreshToken, 'refresh');
  if (!payload) {
    const res = NextResponse.json(
      { error: 'Refresh token inválido. Faça login novamente.' },
      { status: 401 }
    );
    applyRateLimitHeaders(res, rlResult);
    return res;
  }

  // 3) Rotação (Fase 15): revoga refresh usado, emite novo par.
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
    applyRateLimitHeaders(response, rlResult);
    return response;
  }

  if (result.kind === 'reuse-detected') {
    // SINAL DE ROUBO: refresh revogado foi reapresentado.
    // revokeAllOperatorSessions já foi chamado dentro de rotateRefreshToken.
    console.error(
      `[operator/auth/refresh] REUSE DETECTED for operator ${payload.sub} — ` +
        `TODAS as sessões foram revogadas (provável roubo de cookie).`
    );
    const response = NextResponse.json(
      {
        error: 'Sessão comprometida',
        message:
          'Detectamos reuso de um refresh token já revogado. ' +
          'Todas as sessões foram invalidadas por segurança. Faça login novamente.',
      },
      { status: 403 }
    );
    clearOperatorSessionCookie(response);
    clearOperatorRefreshCookie(response);
    applyRateLimitHeaders(response, rlResult);
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
    applyRateLimitHeaders(response, rlResult);
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
  applyRateLimitHeaders(response, rlResult);
  return response;
}
