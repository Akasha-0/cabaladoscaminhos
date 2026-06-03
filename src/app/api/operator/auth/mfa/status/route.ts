// ============================================================
// API ROUTE — MFA status (Fase 20)
// ============================================================
// Retorna se o operator logado tem MFA ativo.
//
// GET /api/operator/auth/mfa/status
// Auth: access token válido.
//
// Response 200:
//   { mfaEnabled: boolean, role: 'ADMIN' | 'OPERATOR' }
//
// Usa isMfaEnabled() do manager — apenas uma query no OperatorMfa.

import { NextRequest, NextResponse } from 'next/server';
import { requireOperatorApi } from '@/lib/auth/operator-guard';
import { isMfaEnabled } from '@/lib/auth/operator-mfa';

export async function GET(request: NextRequest) {
  const guard = await requireOperatorApi(request);
  if (guard instanceof NextResponse) return guard;
  const operator = guard;

  try {
    const mfaEnabled = await isMfaEnabled(operator.id);
    return NextResponse.json({
      mfaEnabled,
      role: operator.role,
    });
  } catch (err) {
    console.error('[mfa/status] failed', err);
    return NextResponse.json(
      { error: 'Falha ao verificar status de MFA' },
      { status: 500 }
    );
  }
}
