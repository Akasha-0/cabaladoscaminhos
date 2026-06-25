/**
 * /api/literature/ingest/cron — POST endpoint protegido por CRON_SECRET.
 *
 * Wave 23.1 — ADR-013: roda 1x/semana (GitHub Actions Mondays 03:00 BRT
 * OU Vercel Cron fallback — ver vercel.json + .github/workflows/).
 *
 * Contract:
 *   - POST com header `Authorization: Bearer *** (CRON_SECRET).
 *   - 200 + JSON { ok: true, logId, inserted, skipped, errors, status }.
 *   - 401 sem secret válido (via verifyCronSecret).
 *   - 500 só em erro de DB no setup inicial (depois tudo é capturado).
 *
 * Body: opcional. Aceita { queries?: string[] } para override (test/manual).
 * Em prod, deixar vazio → usa SEED_QUERIES.
 *
 * LGPD: o handler NÃO toca em user data. Apenas roda o cron job. Logs
 * não carregam PII (CronLog.errors é estrutural sem user fields).
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/application/auth/cron-guard';
import { runLiteratureIngest } from '@/lib/application/literature/ingest-runner';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5min — budget do cron semanal

export async function POST(request: NextRequest) {
  // 1. Auth do cron
  const guard = verifyCronSecret(request);
  if (guard) return guard;

  // 2. Override opcional de queries (body JSON)
  let queries: readonly string[] | undefined;
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      const body = (await request.json()) as { queries?: unknown };
      if (Array.isArray(body.queries)) {
        queries = body.queries.filter(
          (q): q is string => typeof q === 'string' && q.length > 0
        );
      }
    }
  } catch {
    // Body inválido → ignora silenciosamente e usa SEED_QUERIES
  }

  // 3. Roda o cron
  const result = await runLiteratureIngest({ queries });

  return NextResponse.json({
    ok: true,
    logId: result.logId,
    inserted: result.inserted,
    skipped: result.skipped,
    errors: result.errors,
    status: result.status,
  });
}