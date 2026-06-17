/**
 * cron-guard.ts — validação de segredo para cron endpoints
 *
 * Vercel Cron envia header `Authorization: Bearer <CRON_SECRET>`.
 * Se nenhum match, retorna 401.
 *
 * SECURITY:
 * - Nunca log CRON_SECRET.
 * - Use apenas === comparison (constant-time via timingSafeEqual idealmente,
 *   mas para CRON_SECRET de 32+ chars, === é suficiente).
 * - NÃO aceitamos ?secret= query (vazaria em logs do proxy/cdn).
 * - CRON_SECRET é definido no Vercel dashboard (env var) e nunca commitado.
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
 * Verifica o segredo do cron via header `Authorization: Bearer <secret>`.
 * Retorna `NextResponse` 401 se inválido, ou `null` se OK.
 */
export function verifyCronSecret(request: NextRequest): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // Sem secret configurado = bloquear tudo (fail-secure)
    return UNAUTHORIZED;
  }

  // Header `Authorization: Bearer <secret>` (única forma aceita)
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const match = /^Bearer\s+(.+)$/.exec(authHeader);
    if (match && match[1] === expected) return null;
  }

  return UNAUTHORIZED;
}
