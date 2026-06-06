// src/app/api/dev/bypass-status/route.ts
// Endpoint de diagnóstico para o bypass de auth do cockpit.
// NÃO remove de produção — quando COCKPIT_AUTH_BYPASS / COCKPIT_BYPASS_TOKEN
// estão unset, o endpoint devolve 200 com tudo false. Útil só pra debug.
//
// Resposta: JSON com o estado das envs + o que o request atual carrega.
// Use isto para descobrir por que /cockpit está redirecionando.

import { NextRequest, NextResponse } from 'next/server';
import {
  isCockpitAuthBypassEnabled,
  isCockpitBypassTokenConfigured,
  getCockpitBypassTokenForDisplay,
} from '@/lib/auth/operator-session';

export async function GET(request: NextRequest) {
  const envToken = getCockpitBypassTokenForDisplay();
  const tokenLength = envToken?.length ?? 0;

  const headerToken = request.headers.get('x-cockpit-bypass');
  const cookieToken = request.cookies.get('cockpit_bypass')?.value ?? null;

  // Não devolvemos o token em si — só tamanho + boolean matching
  const matches = !!(envToken && cookieToken && cookieToken === envToken);
  const headerMatches = !!(envToken && headerToken && headerToken === envToken);

  return NextResponse.json({
    env: {
      NODE_ENV: process.env.NODE_ENV ?? 'undefined',
      COCKPIT_AUTH_BYPASS: process.env.COCKPIT_AUTH_BYPASS ?? '(unset)',
      COCKPIT_BYPASS_TOKEN: envToken
        ? `(set, ${tokenLength} chars)`
        : '(unset)',
    },
    flags: {
      wideOpenActive: isCockpitAuthBypassEnabled(),
      tokenConfigured: isCockpitBypassTokenConfigured(),
    },
    request: {
      cookieValueLength: cookieToken?.length ?? 0,
      headerTokenLength: headerToken?.length ?? 0,
      cookieMatches: matches,
      headerMatches: headerMatches,
    },
    diagnosis: diagnose({
      wideOpen: isCockpitAuthBypassEnabled(),
      tokenConfigured: isCockpitBypassTokenConfigured(),
      cookieToken: cookieToken ?? null,
      headerToken: headerToken ?? null,
      envToken: envToken ?? null,
    }),
  });
}

function diagnose(state: {
  wideOpen: boolean;
  tokenConfigured: boolean;
  cookieToken: string | null;
  headerToken: string | null;
  envToken: string | null;
}): string {
  if (state.wideOpen) return 'OK: COCKPIT_AUTH_BYPASS=true — wide-open ativo';
  if (!state.tokenConfigured) {
    return 'BYPASS OFF: nem COCKPIT_AUTH_BYPASS=true nem COCKPIT_BYPASS_TOKEN estão setados. Sem bypass, /cockpit vai redirecionar pra /login. Reinicie o dev server depois de setar a var.';
  }
  if (!state.cookieToken && !state.headerToken) {
    return 'TOKEN MODE ATIVO mas o request NÃO carrega o token. Você setou o cookie no browser? Tente: document.cookie = "cockpit_bypass=<seu-token>; path=/"';
  }
  if (state.cookieToken && state.cookieToken !== state.envToken) {
    return `TOKEN MODE ATIVO, cookie presente (${state.cookieToken.length} chars) mas NÃO BATE com o env (${state.envToken!.length} chars). Verifique se você copiou o token certo.`;
  }
  if (state.headerToken && state.headerToken !== state.envToken) {
    return `TOKEN MODE ATIVO, header presente (${state.headerToken.length} chars) mas NÃO BATE com o env.`;
  }
  return 'OK: token mode ativo + request carrega token matching — /cockpit deve entrar.';
}
