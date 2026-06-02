// ============================================================
// API ROUTE — Login do Operator (Fase 8 + 13)
// ============================================================
// Recebe { email, password }, valida credenciais contra o Operator no
// banco, assina JWT, cria OperatorSession (Fase 13 — revogação), e
// seta o cookie `cockpit_session` no response.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signOperatorToken, setOperatorSessionCookie } from '@/lib/auth/operator-jwt';
import { createSession } from '@/lib/auth/operator-sessions';

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
  let body: z.infer<typeof loginSchema>;
  try {
    body = loginSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  // 1) Buscar Operator por email
  const operator = await prisma.operator.findUnique({
    where: { email: body.email.toLowerCase().trim() },
  });
  if (!operator) {
    // Mensagem genérica para não revelar se o email existe (anti-enumeração).
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  // 2) Verificar senha (bcrypt)
  const ok = await bcrypt.compare(body.password, operator.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  // 3) Assinar JWT
  const token = signOperatorToken({ id: operator.id, role: operator.role });

  // 4) Criar OperatorSession (Fase 13) — habilita logout imediato.
  //    Falha aqui é logged mas NÃO bloqueia o login (degradação suave).
  try {
    await createSession({
      operatorId: operator.id,
      token,
      ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
    });
  } catch (err) {
    console.error('[operator/auth/login] failed to create session', err);
  }

  // 5) Setar cookie httpOnly e responder
  const response = NextResponse.json({ operator: publicOperator(operator) });
  setOperatorSessionCookie(response, token);
  return response;
}
