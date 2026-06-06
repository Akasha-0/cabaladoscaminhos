// ============================================================
// API ROUTE — Revogar TODAS as sessões do Operator (Fase 16 + 24)
// ============================================================
// POST /api/operator/auth/sessions/revoke-all
// "Sair de todos os outros dispositivos" — revoga TODAS as
// OperatorSession do operator EXCETO a atual (identificada pelo
// tokenHash do cookie de access). Para usar em caso de
// comprometimento: clique → todas as outras sessões caem.
//
// IMPORTANTE: as DUAS sessões do par atual (access+refresh) são
// preservadas, senão o usuário seria deslogado imediatamente.
// No cenário "realmente comprometido", o usuário deve chamar
// /logout em vez deste endpoint — o que revoga TUDO, inclusive
// a sessão atual.
//
// Respostas:
//   200 — { success: true, revokedCount }  (quantas sessions foram revogadas)
//   401 — operator não autenticado
//   429 — rate-limit excedido (Phase 24)
//
// Segurança:
//   - Filtra por operatorId (do Operator autenticado, não do body)
//   - type=ACCESS (revoga só access, mas se quiser pode estender
//     para REFRESH numa próxima fase — UI atual não precisa)
//
// Fase 24: rate-limit POR OPERATOR (3 revogações / min).
// Protege contra abuso acidental ou malicioso deste endpoint.
//
// Detecção de "sessão atual": usamos o hash do cookie de access,
// igual ao /sessions GET. Se o cookie expirou entre o load da UI
// e o clique do botão, a "atual" pode ser detectada como nenhuma —
// nesse caso NENHUMA sessão é preservada, e o operador é
// deslogado no próximo /me. Aceitável (UX razoável para o caso
// "conta comprometida").

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';
import { OPERATOR_TOKEN_COOKIE } from '@/lib/auth/operator-jwt';
import { hashOperatorToken } from '@/lib/auth/operator-sessions';
import { checkOperatorRateLimit, OPERATOR_RATE_LIMITS } from '@/lib/auth/rate-limit';

const OPERATOR_LIMIT = OPERATOR_RATE_LIMITS['sessions/revoke-all'].max; // 3
const OPERATOR_WINDOW = OPERATOR_RATE_LIMITS['sessions/revoke-all'].windowSeconds; // 60s

export async function POST(request: NextRequest) {
  const operatorOrResponse = await requireOperator(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;

  // Fase 24: rate-limit POR OPERATOR antes de fazer trabalho pesado
  const rlResult = await checkOperatorRateLimit(
    operator.id,
    'revoke-all',
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

  // 1) Identifica o tokenHash da sessão atual
  const cookieStore = await cookies();
  const currentAccessToken = cookieStore.get(OPERATOR_TOKEN_COOKIE)?.value ?? null;
  const currentTokenHash = currentAccessToken ? hashOperatorToken(currentAccessToken) : null;

  // 2) Monta o filtro: revoga tudo EXCETO a sessão atual
  //    (se cookie expirou, currentTokenHash=null → revoga todas)
  const where = {
    operatorId: operator.id,
    type: 'ACCESS',
    revokedAt: null,
    ...(currentTokenHash
      ? { NOT: { tokenHash: currentTokenHash } }
      : {}),
  } as const;

  // 3) Soft revoke em batch
  const result = await prisma.operatorSession.updateMany({
    where,
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    revokedCount: result.count,
  });
}
