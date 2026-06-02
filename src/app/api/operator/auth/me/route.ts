// ============================================================
// API ROUTE — Operator atual (Fase 8)
// ============================================================
// Devolve o Operator autenticado. Útil para a UI do Cockpit checar
// sessão ativa no boot / refresh.

import { NextRequest, NextResponse } from 'next/server';
import { requireOperator } from '@/lib/auth/operator-session';

export async function GET(request: NextRequest) {
  const operatorOrResponse = await requireOperator(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;

  // Sem passwordHash na response
  return NextResponse.json({
    operator: {
      id: operator.id,
      email: operator.email,
      name: operator.name,
      role: operator.role,
    },
  });
}
