// ============================================================
// API ROUTE — MFA setup (Fase 20)
// ============================================================
// Inicia o fluxo de setup de TOTP para o operator logado.
// Apenas role=ADMIN pode ativar (Fase 20 escopo).
//
// POST /api/operator/auth/mfa/setup
// Auth: precisa de access token válido (caller já logado).
//
// Response 200:
//   { secret, qrDataUrl, otpauthUrl, recoveryCodes }
//
// O secret + recovery codes são mostrados UMA única vez — o cliente
// DEVE exibi-los e o operator DEVE guardar os recovery codes.
// O secret cifrado fica no DB (não é devolvido de novo).

import { NextRequest, NextResponse } from 'next/server';
import { requireOperatorApi } from '@/lib/auth/operator-guard';
import { setupMfa } from '@/lib/auth/operator-mfa';
import { logSecurityEvent } from '@/lib/auth/audit-service';

export async function POST(request: NextRequest) {
  const guard = await requireOperatorApi(request);
  if (guard instanceof NextResponse) return guard;
  const operator = guard;

  // Fase 20: apenas ADMIN pode ativar MFA. Operators comuns ficam
  // de fora por enquanto (escopo da fase).
  if (operator.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'MFA disponível apenas para Operators com role=ADMIN' },
      { status: 403 }
    );
  }
  try {
    const result = await setupMfa({ id: operator.id, email: operator.email });
    // Fase 21: MFA_ENABLED — setup iniciado (MFA ainda não ativo até verify-setup).
    // Logging aqui indica que o ADMIN começou o fluxo de ativação.
    logSecurityEvent({
      type: 'MFA_ENABLED',
      operatorId: operator.id,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[mfa/setup] failed', err);
    return NextResponse.json(
      { error: 'Falha ao iniciar setup de MFA' },
      { status: 500 }
    );
  }
}
