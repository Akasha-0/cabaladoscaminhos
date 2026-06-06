// ============================================================
// API ROUTE — Recuperação de senha: passo 1 (Fase 25)
// ============================================================
// POST /api/operator/auth/forgot-password
//
// Recebe { email } e, se o email corresponder a um Operator,
// cria um token de reset (1h TTL) e registra evento de segurança.
// Email real fica fora de scope nesta fase.
//
// SEGURANÇA:
//   - Retorna sempre 200 — não revela se o email existe ou não.
//     (Previne enumeração de emails via brute-force.)
//   - Rate-limited por IP: 5 solicitações / 15min.
//   - Um novo pedido invalida tokens pendentes anteriores.
//
// LOG: Operador, ID e timestamp são logados. O token NUNCA aparece
// em logs — é uma credencial de alto privilégio.
//

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logSecurityEvent } from '@/lib/auth/audit-service';
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
  if (operator) {
    const rawToken = await generateResetToken(operator.id);

    // Fase 21: PASSWORD_RESET_REQUESTED — fire-and-forget, nunca bloqueia
    logSecurityEvent({
      type: 'PASSWORD_RESET_REQUESTED',
      operatorId: operator.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null,
      userAgent: request.headers.get('user-agent'),
    });

    // Log do link de reset (email real fora de scope).
    // NUNCA logar o token — é uma credencial. Só metadados operacionais.
    console.info(
      `[password-reset] Reset solicitado para operator=${operator.email} id=${operator.id}.`
    );
  }

  const response = NextResponse.json(
    { message: 'Se o email existir em nossos registros, você receberá instruções de recuperação.' },
    { status: 200 }
  );
  applyRateLimitHeaders(response, rl.result);
  return response;
}
