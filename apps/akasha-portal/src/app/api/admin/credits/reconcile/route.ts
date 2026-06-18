import { NextRequest, NextResponse } from 'next/server';
import { reconcileCredits } from '@/lib/application/admin/credit-reconciliation';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/credits/reconcile
 *
 * Roda reconciliação de créditos vs consultas (Doc 25 §8).
 * Requer role ADMIN. Pode ser disparado manualmente ou via cron.
 *
 * Body: { since?: ISO_DATE_STRING, dryRun?: boolean }
 *
 * Resposta: { report: ReconciliationReport }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  // Verifica role ADMIN
  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { role: true },
  });
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso restrito a ADMIN' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    since?: string;
    dryRun?: boolean;
  };
  const since = body.since ? new Date(body.since) : undefined;

  const report = await reconcileCredits({ since });

  return NextResponse.json({ report });
}
