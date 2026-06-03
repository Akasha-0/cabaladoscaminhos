// ============================================================
// API ROUTE — MFA disable (Fase 20)
// ============================================================
// Desativa o MFA do operator logado. Requer re-autenticação por senha
// (defense-in-depth: sessão sozinha não desabilita — previne que
// atacante que roubou cookie consiga desabilitar o 2FA).
//
// POST /api/operator/auth/mfa/disable
// Body: { password }
// Auth: access token válido.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOperatorApi } from '@/lib/auth/operator-guard';
import { disableMfa } from '@/lib/auth/operator-mfa';
import { logSecurityEvent } from '@/lib/auth/audit-service';

const disableSchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória'),
});

export async function POST(request: NextRequest) {
  const guard = await requireOperatorApi(request);
  if (guard instanceof NextResponse) return guard;
  const operator = guard;

  let body: z.infer<typeof disableSchema>;
  try {
    body = disableSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  try {
    const result = await disableMfa({
      operator: { id: operator.id, passwordHash: operator.passwordHash },
      password: body.password,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason === 'wrong-password' ? 'Senha incorreta' : 'MFA não configurado' },
        { status: result.reason === 'wrong-password' ? 401 : 400 }
      );
    }
    // Fase 21: MFA_DISABLED — operador desativou MFA (após re-autenticação).
    logSecurityEvent({
      type: 'MFA_DISABLED',
      operatorId: operator.id,
    });
    return NextResponse.json({ ok: true, disabled: true });
  } catch (err) {
    console.error('[mfa/disable] failed', err);
    return NextResponse.json(
      { error: 'Falha ao desabilitar MFA' },
      { status: 500 }
    );
  }
}
