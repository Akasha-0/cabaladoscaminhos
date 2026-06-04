// ============================================================
// API ROUTE — Registro de Operator (Fase 8 + 15 + 18)
// ============================================================
// Cria um novo Operator com email+senha. Decisão Fase 8: endpoint
// público (útil para primeiro usuário, demos, dev). Em produção,
// restrinja via reverse-proxy/allowlist — o helper
// `ALLOW_OPERATOR_REGISTRATION` permite ligar/desligar sem mexer no código.
//
// Comportamento: registra e AUTO-LOGA o usuário (seta par de cookies
// access+refresh — Fase 15) para simplificar o fluxo de primeiro uso.
//
// Fase 18: rate-limit por IP (3 registros / 1h) via Redis. Mitiga
// account-stuffing caso o endpoint seja exposto publicamente.

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
import { createLogger, generateRequestId } from '@/lib/logging';

const BCRYPT_COST = 12; // ~250ms em CPU moderna; bom balanço segurança/perf.

const registerSchema = z.object({
  // Preprocess normaliza o email (lowercase + trim) antes de validar
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.string().email('Email inválido').max(200)
  ),
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  password: z
    .string()
    .min(8, 'Senha deve ter ao menos 8 caracteres')
    .max(200, 'Senha muito longa'),
});

function publicOperator(operator: { id: string; email: string; name: string; role: 'OPERATOR' | 'ADMIN' }) {
  return { id: operator.id, email: operator.email, name: operator.name, role: operator.role };
}

export async function POST(request: NextRequest) {
  // Fase 18: rate-limit ANTES de tudo (até antes do gate opcional).
  // Register é caro (bcrypt cost 12) — não queremos rodar isso
  // 1000x/segundo num account-stuffing.
  const rl = await enforceAuthRateLimit(request, 'register');
  if (rl.kind === 'blocked') {
    return rl.response;
  }
  const { result: rlResult } = rl;

  // Extrai requestId do header x-request-id (fallback: gera um novo)
  const requestId = request.headers.get('x-request-id') ?? generateRequestId();
  const log = createLogger(requestId, '/api/operator/auth/register');

  // Gate de registro: explicitamente opt-in via variável de ambiente.
  // Não usar NODE_ENV para decisões de auth — preview/staging deployments
  // podem ter NODE_ENV != 'production' mas serem publicamente acessíveis.
  const allowRegistration = process.env.ALLOW_OPERATOR_REGISTRATION === 'true';
  if (!allowRegistration) {
    const res = NextResponse.json(
      { error: 'Registro de Operator desabilitado neste ambiente' },
      { status: 403 }
    );
    applyRateLimitHeaders(res, rlResult);
    return res;
  }

  let body: z.infer<typeof registerSchema>;
  try {
    body = registerSchema.parse(await request.json());
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

  const email = body.email.toLowerCase().trim();

  // Verifica duplicata
  const existing = await prisma.operator.findUnique({ where: { email } });
  if (existing) {
    const res = NextResponse.json(
      { error: 'Email já cadastrado' },
      { status: 409 }
    );
    applyRateLimitHeaders(res, rlResult);
    return res;
  }

  // Hash da senha
  const passwordHash = await bcrypt.hash(body.password, BCRYPT_COST);

  // Cria o Operator
  const operator = await prisma.operator.create({
    data: {
      email,
      name: body.name.trim(),
      passwordHash,
    },
  });

  // Fase 15: auto-login com par access+refresh
  const accessToken = signOperatorAccessToken({ id: operator.id, role: operator.role });
  const refreshToken = signOperatorRefreshToken({ id: operator.id, role: operator.role });

  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent');

  // Cria as 2 OperatorSession (best-effort, falha não bloqueia)
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
    log.error('auth.register.session_create_error', { error: String(err) });
  }

  const response = NextResponse.json(
    { operator: publicOperator(operator) },
    { status: 201 }
  );
  setOperatorSessionCookie(response, accessToken);
  setOperatorRefreshCookie(response, refreshToken);
  applyRateLimitHeaders(response, rlResult);
  return response;
}
