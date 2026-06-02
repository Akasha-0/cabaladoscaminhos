// ============================================================
// API ROUTE — Registro de Operator (Fase 8 + 15)
// ============================================================
// Cria um novo Operator com email+senha. Decisão Fase 8: endpoint
// público (útil para primeiro usuário, demos, dev). Em produção,
// restrinja via reverse-proxy/allowlist — o helper
// `ALLOW_OPERATOR_REGISTRATION` permite ligar/desligar sem mexer no código.
//
// Comportamento: registra e AUTO-LOGA o usuário (seta par de cookies
// access+refresh — Fase 15) para simplificar o fluxo de primeiro uso.

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
  // Gate opcional (default: desligado em prod, ligado em dev/test)
  const allowRegistration =
    process.env.ALLOW_OPERATOR_REGISTRATION !== 'false' ||
    process.env.NODE_ENV !== 'production';
  if (!allowRegistration) {
    return NextResponse.json(
      { error: 'Registro de Operator desabilitado neste ambiente' },
      { status: 403 }
    );
  }

  let body: z.infer<typeof registerSchema>;
  try {
    body = registerSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  const email = body.email.toLowerCase().trim();

  // Verifica duplicata
  const existing = await prisma.operator.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'Email já cadastrado' },
      { status: 409 }
    );
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
    console.error('[operator/auth/register] failed to create session(s)', err);
  }

  const response = NextResponse.json(
    { operator: publicOperator(operator) },
    { status: 201 }
  );
  setOperatorSessionCookie(response, accessToken);
  setOperatorRefreshCookie(response, refreshToken);
  return response;
}
