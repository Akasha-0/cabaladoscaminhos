// ============================================================
// API ROUTE — Login do Operator (Fase 8 + 13 + 15 + 18)
// ============================================================
// Recebe { email, password }, valida credenciais contra o Operator no
// banco, emite PAR access (15min) + refresh (30d) (Fase 15), cria
// DUAS OperatorSession (Fase 13 — revogação), e seta OS DOIS cookies
// no response: `cockpit_session` (access) + `cockpit_refresh` (refresh).
//
// Fase 18: rate-limit por IP (5 tentativas / 15min) via Redis com
// fallback in-memory. Headers `X-RateLimit-*` em todas as respostas.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  signOperatorAccessToken,
  signOperatorRefreshToken,
  setOperatorSessionCookie,
  setOperatorRefreshCookie,
} from '@/lib/auth/operator-jwt';
import { createSession, createRefreshSession } from '@/lib/auth/operator-sessions';
import {
  applyRateLimitHeaders,
  enforceAuthRateLimit,
} from '@/lib/auth/rate-limit';

const loginSchema = z.object({
  // Preprocess normaliza o email (lowercase + trim) ANTES de validar
  // o formato — assim '  Ramiro@Cabala.COM  ' também é aceito.
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.string().email('Email inválido')
  ),
  password: z.string().min(1, 'Senha é obrigatória'),
});

/** Operator serializado (sem passwordHash) p/ a response. */
function publicOperator(operator: { id: string; email: string; name: string; role: 'OPERATOR' | 'ADMIN' }) {
  return { id: operator.id, email: operator.email, name: operator.name, role: operator.role };
}

export async function POST(request: NextRequest) {
  // Fase 18: rate-limit PRIMEIRO (antes de qualquer trabalho caro).
  // Brute-force típico: 1000 requests com senha errada. Bloquear nos
  // primeiros 5 protege bcrypt (que é caro em CPU) e a tabela Operator.
  const rl = await enforceAuthRateLimit(request, 'login');
  if (rl.kind === 'blocked') {
    return rl.response;
  }
  const { result: rlResult } = rl;

  let body: z.infer<typeof loginSchema>;
  try {
    body = loginSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      const res = NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
      applyRateLimitHeaders(res, rlResult);
      return res;
    }
    throw err;
  }

  // 1) Buscar Operator por email
  const operator = await prisma.operator.findUnique({
    where: { email: body.email.toLowerCase().trim() },
  });
  if (!operator) {
    // Mensagem genérica para não revelar se o email existe (anti-enumeração).
    const res = NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    applyRateLimitHeaders(res, rlResult);
    return res;
  }

  // 2) Verificar senha (bcrypt)
  const ok = await bcrypt.compare(body.password, operator.passwordHash);
  if (!ok) {
    const res = NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    applyRateLimitHeaders(res, rlResult);
    return res;
  }

  // 3) Fase 15 — emitir par access (15min) + refresh (30d)
  const accessToken = signOperatorAccessToken({ id: operator.id, role: operator.role });
  const refreshToken = signOperatorRefreshToken({ id: operator.id, role: operator.role });

  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent');

  // 4) Criar DUAS OperatorSession (Fase 13 + 15)
  //    Falha aqui é logged mas NÃO bloqueia o login (degradação suave).
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
    console.error('[operator/auth/login] failed to create session(s)', err);
  }

  // 5) Setar 2 cookies httpOnly e responder
  const response = NextResponse.json({ operator: publicOperator(operator) });
  setOperatorSessionCookie(response, accessToken);
  setOperatorRefreshCookie(response, refreshToken);
  applyRateLimitHeaders(response, rlResult);
  return response;
}
