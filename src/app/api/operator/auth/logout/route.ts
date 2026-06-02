// ============================================================
// API ROUTE — Logout do Operator (Fase 8)
// ============================================================
// Limpa o cookie `cockpit_session`. Idempotente — sempre retorna 200
// (logout não precisa falhar se o usuário não estava autenticado).

import { NextResponse } from 'next/server';
import { clearOperatorSessionCookie } from '@/lib/auth/operator-jwt';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearOperatorSessionCookie(response);
  return response;
}
