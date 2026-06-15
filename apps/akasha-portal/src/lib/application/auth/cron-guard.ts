/**
 * cron-guard.ts — validação de segredo para cron endpoints
 *
 * Vercel Cron envia header `Authorization: Bearer <CRON_SECRET>` OU
 * query `?secret=<CRON_SECRET>`. Se nenhum match, retorna 401.
 *
 * SECURITY: nunca log CRON_SECRET. Use apenas === comparison.
 * CRON_SECRET é definido no Vercel dashboard (env var) e nunca commitado.
 *
 * Uso:
 *   const guard = verifyCronSecret(request);
 *   if (guard) return guard;
 */

import { NextRequest, NextResponse } from 'next/server';

const UNAUTHORIZED = NextResponse.json(
  { error: 'unauthorized' },
  { status: 401, headers: { 'Cache-Control': 'no-store' } }
);

/**
 * Verifica o segredo do cron. Retorna `NextResponse` 401 se inválido,
 * ou `null` se OK (request pode prosseguir).
 */
export function verifyCronSecret(request: NextRequest): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // Sem secret configurado = bloquear tudo (fail-secure)
    return UNAUTHORIZED;
  }

  // 1. Header `Authorization: Bearer <secret>`
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const match = /^Bearer\s+(.+)$/.exec(authHeader);
    if (match && match[1] === expected) return null;
  }

  // 2. Query `?secret=<secret>` (Vercel Cron alternative)
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  if (querySecret && querySecret === expected) return null;

  return UNAUTHORIZED;
}
