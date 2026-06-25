/**
 * /api/admin/insights/jobs — GET (auditoria de execuções do discovery cron).
 *
 * Wave 24.1 — interface para admin ver as últimas execuções do cron
 * de background insights. Retorna rows de InsightJob com filtro opcional
 * por jobName + paginação simples.
 *
 * Auth: usa o guard padrão `requireAkashaApi` (cookie `akasha_session`
 * com role ADMIN). Mesmo padrão de /api/admin/literature/ingest-history
 * (Wave 23.1).
 *
 * LGPD: este endpoint expõe apenas InsightJob (sem PII). Insights
 * gerados são públicos (consciência viva do Akasha). OK para admin.
 */
import { NextRequest, NextResponse } from 'next/server';

import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  // 1. Auth — só admin
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  // const { id: userId } = authResult; // disponível para log futuro

  // 2. Parse query params
  const url = new URL(request.url);
  const jobName = url.searchParams.get('jobName') ?? undefined;
  const status = url.searchParams.get('status') ?? undefined;
  const limitParam = Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT);
  const limit = Math.min(
    Math.max(Number.isFinite(limitParam) ? limitParam : DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  // 3. Query InsightJob (graceful se tabela não existe ainda)
  let rows: Array<{
    id: string;
    jobName: string;
    startedAt: Date;
    finishedAt: Date | null;
    status: string;
    insightsGenerated: number;
    papersCited: number;
    errors: unknown;
    windowSpec: unknown;
  }> = [];

  try {
    rows = await prisma.insightJob.findMany({
      where: {
        ...(jobName ? { jobName } : {}),
        ...(status
          ? {
              status: status as
                | 'RUNNING'
                | 'SUCCESS'
                | 'PARTIAL_SUCCESS'
                | 'FAILED',
            }
          : {}),
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  } catch {
    // InsightJob pode não existir (D-053 PROPOSAL pendente).
    // Retorna [] silenciosamente — UI mostra "aguardando primeira execução".
    return NextResponse.json({
      ok: true,
      count: 0,
      rows: [],
      note: 'insight_jobs table not yet created (D-053 PROPOSAL awaiting human apply)',
    });
  }

  return NextResponse.json({
    ok: true,
    count: rows.length,
    rows: rows.map((r) => ({
      id: r.id,
      jobName: r.jobName,
      startedAt: r.startedAt.toISOString(),
      finishedAt: r.finishedAt?.toISOString() ?? null,
      status: r.status,
      insightsGenerated: r.insightsGenerated,
      papersCited: r.papersCited,
      errors: r.errors,
      windowSpec: r.windowSpec,
    })),
  });
}
