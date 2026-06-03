// ============================================================
// API ROUTE — Recuperação de senha: passo 2 (Fase 25)
// ============================================================
// POST /api/operator/auth/reset-password
//
// Recebe { token, newPassword } e:
//   1. Valida o token (existe, não expirou, não usado)
//   2. Atualiza passwordHash do operator
//   3. Consome o token (marca usedAt)
//
// SEGURANÇA:
//   - Token é hasheado (SHA-256) na comparação — nunca em plain no DB.
//   - Após uso, token é marcado como usado — não reutilizável.
//   - Rate-limited: 10 tentativas / 5min (protege contra brute-force
//     de tokens randômicos, que é improvável mas mitigável).
//   - Transação atômica: senha atualizada E token consumido juntos.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resetPassword } from '@/lib/auth/password-reset';
import {
  applyRateLimitHeaders,
  enforceAuthRateLimit,
} from '@/lib/auth/rate-limit';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório').max(128),
  newPassword: z
    .string()
    .min(8, 'Senha deve ter ao menos 8 caracteres')
    .max(200, 'Senha muito longa'),
});

export async function POST(request: NextRequest) {
  // Rate-limit PRIMEIRO.
  const rl = await enforceAuthRateLimit(request, 'reset-password');
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

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    const response = NextResponse.json(
      { error: 'Token ou senha inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
    applyRateLimitHeaders(response, rl.result);
    return response;
  }

  const { token, newPassword } = parsed.data;

  const result = await resetPassword(token, newPassword);

  if (!result.ok) {
    let status = 400;
    let message = 'Token inválido';

    if (result.reason === 'expired') {
      message = 'Token expirado. Solicite um novo link de recuperação.';
      status = 400;
    } else if (result.reason === 'used') {
      message = 'Token já utilizado. Solicite um novo link de recuperação.';
      status = 400;
    }
    // 'invalid-token' → 400 genérico (não revela qual)

    const response = NextResponse.json({ error: message }, { status });
    applyRateLimitHeaders(response, rl.result);
    return response;
  }

  const response = NextResponse.json(
    { message: 'Senha atualizada com sucesso. Faça login com a nova senha.' },
    { status: 200 }
  );
  applyRateLimitHeaders(response, rl.result);
  return response;
}
