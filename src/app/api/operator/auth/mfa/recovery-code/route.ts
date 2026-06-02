// ============================================================
// API ROUTE — MFA recovery-code (Fase 20)
// ============================================================
// Consome um recovery code durante o challenge pós-login. Em sucesso,
// emite o par access+refresh e seta os 2 cookies httpOnly. O code
// consumido é marcado como inválido (single-use).
//
// POST /api/operator/auth/mfa/recovery-code
// Body: { mfaToken, code }   // recovery code (16 chars hex)

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
import { consumeRecoveryCode } from '@/lib/auth/operator-mfa';

const recoverySchema = z.object({
  mfaToken: z.string().min(1, 'mfaToken obrigatório'),
  // Recovery code: 16 chars hex (8 bytes). Whitespace removido.
  code: z.string().transform((s) => s.trim().toLowerCase()).pipe(
    z.string().regex(/^[0-9a-f]{16}$/, 'Recovery code inválido')
  ),
});

function publicOperator(operator: { id: string; email: string; name: string; role: 'OPERATOR' | 'ADMIN' }) {
  return { id: operator.id, email: operator.email, name: operator.name, role: operator.role };
}

export async function POST(request: NextRequest) {
  let body: z.infer<typeof recoverySchema>;
  try {
    body = recoverySchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  const payload = verifyMfaChallengeToken(body.mfaToken);
  if (!payload) {
    return NextResponse.json(
      { error: 'mfaToken inválido ou expirado' },
      { status: 401 }
    );
  }

  const result = await consumeRecoveryCode({
    operatorId: payload.sub,
    code: body.code,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason === 'not-enabled' ? 'MFA não configurado' : 'Recovery code inválido' },
      { status: result.reason === 'not-enabled' ? 400 : 401 }
    );
  }

  const operator = await prisma.operator.findUnique({ where: { id: payload.sub } });
  if (!operator) {
    return NextResponse.json(
      { error: 'Operator não encontrado' },
      { status: 401 }
    );
  }

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
    console.error('[mfa/recovery-code] failed to create session(s)', err);
  }

  const response = NextResponse.json({
    operator: publicOperator(operator),
    recoveryUsed: true,
  });
  setOperatorSessionCookie(response, accessToken);
  setOperatorRefreshCookie(response, refreshToken);
  return response;
}
