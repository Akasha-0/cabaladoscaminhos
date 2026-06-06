// src/app/api/operator/dev/bypass-set/route.ts
// Helper one-time-setup: o operador navega pra cá com ?token=<seu-token>
// e o server seta o cookie de bypass via Set-Cookie header.
//
// Por que server-side: document.cookie no browser falha silenciosamente em
// vários casos (path errado, domain errado, aba anônima, etc). Set-Cookie
// no response header é 100% confiável.

import { NextRequest, NextResponse } from 'next/server';
import { isCockpitBypassTokenConfigured, getCockpitBypassTokenForDisplay } from '@/lib/auth/operator-session';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const envToken = getCockpitBypassTokenForDisplay();
  const configured = isCockpitBypassTokenConfigured();

  if (!configured) {
    return new NextResponse(
      `COCKPIT_BYPASS_TOKEN não está setado no .env.local. Sem token configurado, este endpoint não pode ajudar.`,
      { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } }
    );
  }

  if (!token) {
    return new NextResponse(
      `Falta ?token=<seu-token>. Use: ${request.nextUrl.origin}${request.nextUrl.pathname}?token=<seu-token>`,
      { status: 400, headers: { 'content-type': 'text/plain; charset=utf-8' } }
    );
  }

  if (token !== envToken) {
    return new NextResponse(
      `Token não confere com COCKPIT_BYPASS_TOKEN (${envToken!.length} chars). Verifique se você copiou certo.`,
      { status: 403, headers: { 'content-type': 'text/plain; charset=utf-8' } }
    );
  }

  // Token confere. Seta cookie httpOnly=false (legível pelo browser DevTools
  // para inspeção) + path=/ (vale pra toda a app) + maxAge 1 ano.
  const response = NextResponse.json({
    ok: true,
    message: 'Cookie cockpit_bypass setado. Redirecionando para /cockpit.',
  });
  response.cookies.set({
    name: 'cockpit_bypass',
    value: token,
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 ano
    sameSite: 'lax',
  });
  return response;
}
