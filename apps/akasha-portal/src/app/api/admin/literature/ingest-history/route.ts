/**
 * /api/admin/literature/ingest-history — GET (auditoria de execuções).
 *
 * Wave 23.1 — interface para admin ver as últimas execuções do cron
 * de ingestão de papers. Retorna rows de CronLog com filtro opcional
 * por jobName + paginação simples.
 *
 * Auth: usa o guard padrão `requireAkashaApi` (cookie `akasha_session`
 * com role ADMIN). Mesmo padrão de /api/admin/feedback (Wave 13.5).
 * Em produção, isso é restrito a AkashaAuthorityRole.ADMIN — ver
 * `requireAkashaApi` para detalhes.
 *
 * LGPD: este endpoint expõe apenas CronLog (sem PII). papers ingeridos
 * são públicos (PubMed open-access). OK para admin visualizar.
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

  // 3. Query CronLog
  const rows = await prisma.cronLog.findMany({
    where: {
      ...(jobName ? { jobName } : {}),
      ...(status ? { status: status as 'RUNNING' | 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' } : {}),
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({
    ok: true,
    count: rows.length,
    rows: rows.map((r) => ({
      id: r.id,
      jobName: r.jobName,
      startedAt: r.startedAt.toISOString(),
      finishedAt: r.finishedAt?.toISOString() ?? null,
      status: r.status,
      inserted: r.inserted,
      skipped: r.skipped,
      errors: r.errors,
    })),
  });
}