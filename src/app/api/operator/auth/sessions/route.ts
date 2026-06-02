// ============================================================
// API ROUTE — Listar sessões ativas do Operator (Fase 16)
// ============================================================
// Devolve as OperatorSession ATIVAS (não-revogadas, não-expiradas)
// do operator autenticado. Apenas sessões ACCESS são expostas —
// sessions REFRESH são internas (não fazem sentido na UI).
//
// Respostas:
//   200 — { sessions: [{ id, ipAddress, userAgent, createdAt, expiresAt, isCurrent }] }
//   401 — operator não autenticado
//
// Segurança:
//   - Nunca expõe tokenHash, operatorId ou passwordHash
//   - `isCurrent` é detectado por comparação com o tokenHash do cookie
//     de access (o que a UI usa para destacar a sessão atual)
//
// Por que só ACCESS? A UI de "sessões ativas" mostra onde o usuário
// está logado — o cookie de access é o que identifica essa info. As
// REFRESH existem só para o endpoint /refresh; não há decisão de
// segurança que o usuário precise tomar sobre elas.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';
import {
  OPERATOR_TOKEN_COOKIE,
} from '@/lib/auth/operator-jwt';
import { hashOperatorToken } from '@/lib/auth/operator-sessions';

// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  const operatorOrResponse = await requireOperator(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;

  // 1) Lista sessions ACCESS ativas do operator
  //    - type=ACCESS (esconde REFRESH da UI)
  //    - revokedAt=null
  //    - expiresAt>now() (considera expiração do JWT)
  const now = new Date();
  const sessions = await prisma.operatorSession.findMany({
    where: {
      operatorId: operator.id,
      type: 'ACCESS',
      revokedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  // 2) Identifica a sessão atual pelo tokenHash do cookie de access
  //    (cookie httpOnly — só lê server-side)
  const cookieStore = await cookies();
  const currentAccessToken = cookieStore.get(OPERATOR_TOKEN_COOKIE)?.value ?? null;
  const currentTokenHash = currentAccessToken ? hashOperatorToken(currentAccessToken) : null;

  // 3) Mapeia para shape pública (sem tokenHash/operatorId/passwordHash)
  //    Para descobrir qual é a sessão atual sem expor tokenHash, comparamos
  //    o hash do cookie com o tokenHash de cada session via um find separado.
  let currentSessionId: string | null = null;
  if (currentTokenHash) {
    const currentSession = await prisma.operatorSession.findUnique({
      where: { tokenHash: currentTokenHash },
      select: { id: true, operatorId: true, type: true, revokedAt: true },
    });
    // Só marca como "atual" se for ACCESS, não-revogada e do mesmo operator
    if (
      currentSession &&
      currentSession.operatorId === operator.id &&
      currentSession.type === 'ACCESS' &&
      currentSession.revokedAt === null
    ) {
      currentSessionId = currentSession.id;
    }
  }

  const publicSessions = sessions.map((s) => ({
    id: s.id,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    createdAt: s.createdAt.toISOString(),
    expiresAt: s.expiresAt.toISOString(),
    isCurrent: s.id === currentSessionId,
  }));

  return NextResponse.json({ sessions: publicSessions });
}
