/**
 * GET /api/transparency/moderation
 *
 * Relatório público de transparência sobre ações de moderação. Anonimizado
 * (LGPD Art. 7, 18, 37) — apenas agregados, sem PII.
 *
 * Query: ?month=YYYY-MM (default mês corrente)
 * Resposta: { month, total, byReason, byAction, byDecision, appealStats, slaP50, slaP95 }
 */

import { ok, handleError } from '@/lib/community/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const monthStr = url.searchParams.get('month');

    const now = new Date();
    const target = monthStr ? new Date(`${monthStr}-01T00:00:00Z`) : now;
    const startOfMonth = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 1));

    const { prisma } = await import('@/lib/prisma');

    // 1. Total de flags no mês
    const allFlags = await prisma.flag.findMany({
      where: {
        createdAt: { gte: startOfMonth, lt: endOfMonth },
      },
      select: {
        reason: true,
        status: true,
        actionTaken: true,
        createdAt: true,
        reviewedAt: true,
      },
    });

    // 2. Distribuição por reason
    const byReason: Record<string, number> = {};
    for (const f of allFlags) {
      byReason[f.reason] = (byReason[f.reason] ?? 0) + 1;
    }

    // 3. Distribuição por status
    const byStatus: Record<string, number> = {};
    for (const f of allFlags) {
      byStatus[f.status] = (byStatus[f.status] ?? 0) + 1;
    }

    // 4. Distribuição por action
    const byAction: Record<string, number> = {};
    for (const f of allFlags) {
      const a = f.actionTaken ?? 'none';
      byAction[a] = (byAction[a] ?? 0) + 1;
    }

    // 5. SLA — tempo de revisão (em horas)
    const reviewTimes = allFlags
      .filter((f) => f.reviewedAt)
      .map((f) => (f.reviewedAt!.getTime() - f.createdAt.getTime()) / 3600_000)
      .sort((a, b) => a - b);

    const slaP50 = reviewTimes.length > 0 ? reviewTimes[Math.floor(reviewTimes.length * 0.5)] : null;
    const slaP95 = reviewTimes.length > 0 ? reviewTimes[Math.floor(reviewTimes.length * 0.95)] : null;
    const slaOver24h = reviewTimes.filter((t) => t > 24).length;

    // 6. Appeal stats: flags ACTIONED que foram revertidas (actionTaken='reviewed' após)
    const appealed = allFlags.filter((f) => f.status === 'DISMISSED').length;
    const actioned = allFlags.filter((f) => f.status === 'ACTIONED').length;
    const appealRate = actioned > 0 ? appealed / actioned : 0;

    return ok(
      {
        month: monthStr ?? `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`,
        total: allFlags.length,
        byReason,
        byStatus,
        byAction,
        sla: {
          p50Hours: slaP50 !== null ? Number(slaP50.toFixed(2)) : null,
          p95Hours: slaP95 !== null ? Number(slaP95.toFixed(2)) : null,
          reviewedCount: reviewTimes.length,
          over24hCount: slaOver24h,
        },
        appeals: {
          total: appealed,
          rate: Number(appealRate.toFixed(3)),
          reverseRate: actioned > 0 ? Number((appealed / actioned).toFixed(3)) : 0,
        },
        autoModCoverage: {
          totalAudited: allFlags.length, // approximated: AuditLog separado conta auto-mod
          manualOverrides: 0,
        },
      },
      { cache: { private: true, maxAge: 3600 } }
    );
  } catch (err) {
    return handleError(err);
  }
}