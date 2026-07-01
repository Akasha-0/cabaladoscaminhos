// ============================================================================
// CRON AUTH — Bearer CRON_SECRET com timingSafeEqual (Wave 34)
// ============================================================================
// Padrão único de autenticação para todos os endpoints /api/cron/*.
//
// O secret chega no header `Authorization: Bearer ${CRON_SECRET}` enviado
// pelo Vercel Cron (configurado via vercel.json → CRON_SECRET).
//
// Comparação com timingSafeEqual:
//   - Evita timing side-channel (response time não vaza o secret correto)
//   - Length-mismatch é short-circuit antes do constant-time compare
//
// Modo dev (NODE_ENV !== 'production'):
//   - CRON_SECRET ausente = permissive (warn) — facilita testes locais
//   - CRON_SECRET presente = ainda exige match
//
// Modo produção:
//   - CRON_SECRET ausente = recusa (fail-closed)
// ============================================================================

import { timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

export interface CronAuthResult {
  ok: boolean;
  reason?: 'missing_header' | 'missing_secret' | 'mismatch' | 'dev_permissive';
}

/**
 * Verifica se o request tem o Bearer CRON_SECRET válido.
 *
 * @example
 *   const auth = verifyCronSecret(request);
 *   if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
 */
export function verifyCronSecret(request: NextRequest): CronAuthResult {
  const provided = request.headers
    .get('authorization')
    ?.replace(/^Bearer\s+/i, '')
    ?.trim();
  const expected = process.env.CRON_SECRET;

  // 1) Sem CRON_SECRET configurado
  if (!expected) {
    if (process.env.NODE_ENV !== 'production') {
      return { ok: true, reason: 'dev_permissive' };
    }
    return { ok: false, reason: 'missing_secret' };
  }

  // 2) Sem header enviado
  if (!provided) {
    return { ok: false, reason: 'missing_header' };
  }

  // 3) Length mismatch — não tenta comparar (lengths precisam ser iguais)
  if (provided.length !== expected.length) {
    return { ok: false, reason: 'mismatch' };
  }

  // 4) Constant-time compare
  try {
    const a = Buffer.from(provided, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (timingSafeEqual(a, b)) return { ok: true };
    return { ok: false, reason: 'mismatch' };
  } catch {
    return { ok: false, reason: 'mismatch' };
  }
}

/** Helper de response 401 — padroniza JSON + headers anti-cache. */
export function unauthorizedResponse(result: CronAuthResult): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      error: 'unauthorized',
      reason: result.reason ?? 'unknown',
    }),
    {
      status: 401,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    }
  );
}