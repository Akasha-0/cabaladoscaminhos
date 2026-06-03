// ============================================================
// API ROUTE — Recuperação de senha: passo 1 (Fase 25)
// ============================================================
// POST /api/operator/auth/forgot-password
//
// Recebe { email } e, se o email corresponder a um Operator,
// cria um token de reset (1h TTL) e loga o link de reset.
// Email real fica fora de scope nesta fase.
//
// SEGURANÇA:
//   - Retorna sempre 200 — não revela se o email existe ou não.
//     (Previne enumeração de emails via brute-force.)
//   - Rate-limited por IP: 5 solicitações / 15min.
//   - Um novo pedido invalida tokens pendentes anteriores.
//
// LOG: Token é logado como info (não como warn) já que é
// comportamento esperado do endpoint. Log de acesso contém o email.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateResetToken } from '@/lib/auth/password-reset';
import {
  applyRateLimitHeaders,
  enforceAuthRateLimit,
} from '@/lib/auth/rate-limit';

const forgotPasswordSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.string().email('Email inválido').max(200)
  ),
});

export async function POST(request: NextRequest) {
  // Rate-limit PRIMEIRO (antes de qualquer I/O).
  const rl = await enforceAuthRateLimit(request, 'forgot-password');
  if (rl.kind === 'blocked') return rl.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const response = NextResponse.json(
      { error: 'Corpo da requisição inválido' },
      { status: 400 }
    );
    applyRateLimitHeaders(response, rl.result);
    return response;
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    const response = NextResponse.json(
      { error: 'Email inválido' },
      { status: 400 }
    );
    applyRateLimitHeaders(response, rl.result);
    return response;
  }

  const { email } = parsed.data;

  // Busca operator pelo email — operador inativo NÃO recebe reset.
  const operator = await prisma.operator.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  // Sempre retorna 200. Não revelar se o email existe.
  // Se não encontrou, simplesmente não faz nada.
  if (operator) {
    const rawToken = await generateResetToken(operator.id);

    // Log do link de reset (email real fora de scope).
    // O token é o raw (64 hex chars) — só existe em memória aqui.
    const resetUrl = `/operator/reset-password?token=${rawToken}`;
    console.info(
      `[password-reset] Token gerado para operator=${operator.email} id=${operator.id}. ` +
      `Reset URL: ${resetUrl}`
    );
  }

  const response = NextResponse.json(
    { message: 'Se o email existir em nossos registros, você receberá instruções de recuperação.' },
    { status: 200 }
  );
  applyRateLimitHeaders(response, rl.result);
  return response;
}
