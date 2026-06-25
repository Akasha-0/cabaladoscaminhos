/**
 * /api/discoveries/cron — POST endpoint protegido por CRON_SECRET.
 *
 * Wave 24.1 — ADR-013: roda diariamente (GitHub Actions 03:00 BRT OU
 * Vercel Cron fallback — ver vercel.json + .github/workflows/).
 *
 * Contract:
 *   - POST com header `Authorization: Bearer *** (CRON_SECRET).
 *   - 200 + JSON { ok: true, jobId, insightsGenerated, papersCited,
 *     status, errors }.
 *   - 401 sem secret válido (via verifyCronSecret).
 *   - 500 só em erro de DB no setup inicial (depois tudo é capturado).
 *
 * Body: opcional. Aceita { jobName?: string, maxInsights?: number }.
 *
 * LGPD: o handler NÃO toca em user data. Insights gerados são GLOBAIS
 * (sem user attribution). InsightJob.errors é estrutural sem PII.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { verifyCronSecret } from '@/lib/application/auth/cron-guard';
import { runBackgroundInsights } from '@/lib/application/consciousness/background-job';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5min — budget do cron diário

const bodySchema = z.object({
  jobName: z.string().min(1).max(64).optional(),
  maxInsights: z.number().int().min(1).max(50).optional(),
});

export async function POST(request: NextRequest) {
  // 1. Auth do cron
  const guard = verifyCronSecret(request);
  if (guard) return guard;

  // 2. Override opcional (body JSON)
  let overrides: { jobName?: string; maxInsights?: number } = {};
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      const raw = (await request.json()) as unknown;
      const parsed = bodySchema.safeParse(raw);
      if (parsed.success) overrides = parsed.data;
    }
  } catch {
    // Body inválido → ignora silenciosamente
  }

  // 3. Roda o background job
  const result = await runBackgroundInsights(overrides);

  return NextResponse.json({
    ok: true,
    jobId: result.jobId,
    insightsGenerated: result.insightsGenerated,
    papersCited: result.papersCited,
    status: result.status,
    errors: result.errors,
  });
}
