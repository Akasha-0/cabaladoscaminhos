// ============================================================
// API ROUTE — Registro de Operator (Fase 8)
// ============================================================
// Cria um novo Operator com email+senha. Decisão Fase 8: endpoint
// público (útil para primeiro usuário, demos, dev). Em produção,
// restrinja via reverse-proxy/allowlist — o helper
// `ALLOW_OPERATOR_REGISTRATION` permite ligar/desligar sem mexer no código.
//
// Comportamento: registra e AUTO-LOGA o usuário (seta cookie de sessão)
// para simplificar o fluxo de primeiro uso.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signOperatorToken, setOperatorSessionCookie } from '@/lib/auth/operator-jwt';

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

  // Auto-login: assina JWT e seta cookie
  const token = signOperatorToken({ id: operator.id, role: operator.role });
  const response = NextResponse.json(
    { operator: publicOperator(operator) },
    { status: 201 }
  );
  setOperatorSessionCookie(response, token);
  return response;
}
