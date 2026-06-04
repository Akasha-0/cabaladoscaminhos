// ============================================================
// API ROUTE — MFA verify (challenge) (Fase 20)
// ============================================================
// Consome um código TOTP durante o challenge pós-login. Em sucesso,
// emite o par access+refresh e seta os 2 cookies httpOnly.
//
// POST /api/operator/auth/mfa/verify
// Body: { mfaToken, code }
// Não requer cookie de sessão (senão seria circular).
//
// Fluxo:
//   1. Cliente já chamou /login, recebeu { mfaRequired, mfaToken }
//   2. Cliente envia o código TOTP do app autenticador
//   3. Servidor valida mfaToken (5min, type=mfa-challenge)
//   4. Valida code contra secret armazenado
//   5. Emite access+refresh, cria 2 OperatorSession, seta cookies

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  signOperatorAccessToken,
  signOperatorRefreshToken,
  verifyMfaChallengeToken,
  setOperatorSessionCookie,
  setOperatorRefreshCookie,
} from '@/lib/auth/operator-jwt';
import { createSession, createRefreshSession } from '@/lib/auth/operator-sessions';
import { consumeMfaChallenge } from '@/lib/auth/operator-mfa';

const verifySchema = z.object({
  mfaToken: z.string().min(1, 'mfaToken obrigatório'),
  code: z.string().regex(/^\d{6}$/, 'Código deve ter 6 dígitos'),
});

function publicOperator(operator: { id: string; email: string; name: string; role: 'OPERATOR' | 'ADMIN' }) {
  return { id: operator.id, email: operator.email, name: operator.name, role: operator.role };
}

export async function POST(request: NextRequest) {
  let body: z.infer<typeof verifySchema>;
  try {
    body = verifySchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  // 1) Valida mfaToken (assinatura, expiração, type)
  const payload = verifyMfaChallengeToken(body.mfaToken);
  if (!payload) {
    return NextResponse.json(
      { error: 'mfaToken inválido ou expirado' },
      { status: 401 }
    );
  }
  // Fase 26: Bloqueio de conta — MFA não deve permitir bypass de lockout.
  const lockStatus = await import('@/lib/auth/account-lockout').then(m => m.isLockedById(payload.sub));
  if (lockStatus.locked) {
    return NextResponse.json(
      { error: 'Conta bloqueada temporariamente. Tente novamente mais tarde.', lockedUntil: lockStatus.until },
      { status: 423 }
    );
  }

  // 2) Valida código TOTP
  const result = await consumeMfaChallenge({
    operatorId: payload.sub,
    code: body.code,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason === 'not-enabled' ? 'MFA não configurado' : 'Código inválido' },
      { status: result.reason === 'not-enabled' ? 400 : 401 }
    );
  }

  // 3) Carrega operator para emitir tokens
  const operator = await prisma.operator.findUnique({ where: { id: payload.sub } });
  if (!operator) {
    return NextResponse.json(
      { error: 'Operator não encontrado' },
      { status: 401 }
    );
  }

  // 4) Emite par access+refresh
  const accessToken = signOperatorAccessToken({ id: operator.id, role: operator.role });
  const refreshToken = signOperatorRefreshToken({ id: operator.id, role: operator.role });
  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent');

  try {
    await createSession({
      operatorId: operator.id,
      token: accessToken,
      type: 'ACCESS',
      ipAddress,
      userAgent,
    });
    await createRefreshSession({
      operatorId: operator.id,
      token: refreshToken,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('[mfa/verify] failed to create session(s)', err);
  }

  // 5) Setar 2 cookies httpOnly e responder
  const response = NextResponse.json({ operator: publicOperator(operator) });
  setOperatorSessionCookie(response, accessToken);
  setOperatorRefreshCookie(response, refreshToken);
  return response;
}
