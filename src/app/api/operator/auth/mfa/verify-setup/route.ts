// ============================================================
// API ROUTE — MFA verify-setup (Fase 20)
// ============================================================
// Valida o primeiro código TOTP do operator. Em sucesso, marca
// `enabled=true` no OperatorMfa e o MFA passa a ser exigido no login.
//
// POST /api/operator/auth/mfa/verify-setup
// Body: { code: string }   // 6 dígitos
// Auth: access token válido + role=ADMIN.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOperatorApi } from '@/lib/auth/operator-guard';
import { verifySetupMfa } from '@/lib/auth/operator-mfa';

const verifySetupSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Código deve ter 6 dígitos'),
});

export async function POST(request: NextRequest) {
  const guard = await requireOperatorApi(request);
  if (guard instanceof NextResponse) return guard;
  const operator = guard;

  if (operator.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'MFA disponível apenas para Operators com role=ADMIN' },
      { status: 403 }
    );
  }

  let body: z.infer<typeof verifySetupSchema>;
  try {
    body = verifySetupSchema.parse(await request.json());
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
    const result = await verifySetupMfa({
      operatorId: operator.id,
      code: body.code,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason === 'no-setup' ? 'Setup não iniciado' : 'Código inválido' },
        { status: result.reason === 'no-setup' ? 400 : 401 }
      );
    }
    return NextResponse.json({ ok: true, enabled: true });
  } catch (err) {
    console.error('[mfa/verify-setup] failed', err);
    return NextResponse.json(
      { error: 'Falha ao validar setup' },
      { status: 500 }
    );
  }
}
