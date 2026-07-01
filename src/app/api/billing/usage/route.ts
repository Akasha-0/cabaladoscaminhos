// ============================================================================
// GET /api/billing/usage — Snapshot agregado do uso do usuário
// ============================================================================
// Wave 37 (2026-07-01).
//
// OUTPUT: UsageSnapshot[] para todas as métricas + tier atual + period info
//
// USO: dashboard /billing mostra barras "X / Y usado" para cada métrica.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, ErrorCode } from '@/lib/community/api';
import {
  getAllMetricsSnapshot,
  resolveUserTier,
} from '@/lib/billing/usage-tracker';
import { getTier, type TierDefinition } from '@/lib/billing/tiers';
import { getBillingPrisma } from '@/lib/billing/prisma-adapter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    const prisma = getBillingPrisma();
    const tierKey = await resolveUserTier(userId, prisma);
    const tier = getTier(tierKey);

    const snapshots = await getAllMetricsSnapshot({
      userId,
      tier: tierKey,
      prisma,
    });

    const warnings = snapshots.filter((s) => s.warningThreshold);
    const exceeded = snapshots.filter((s) => s.limitExceeded);

    return ok({
      tier: tier.key,
      tierName: tier.name,
      limits: {
        akashaConversationsPerMonth: tier.limits.akashaConversationsPerMonth,
        oraculoMaps: tier.limits.oraculoMaps,
        mentorshipSessionsPerMonth: tier.limits.mentorshipSessionsPerMonth,
        groupsCreated: tier.limits.groupsCreated,
        monthlyStorageGB: tier.limits.monthlyStorageGB,
        marketplaceListings: tier.limits.marketplaceListings,
      },
      metrics: snapshots,
      warnings: warnings.map((w) => ({
        metric: w.metric,
        used: w.used,
        limit: w.limit,
        pctUsed: w.pctUsed,
      })),
      exceeded: exceeded.map((e) => ({
        metric: e.metric,
        used: e.used,
        limit: e.limit,
      })),
    });
  } catch (err) {
    console.error('[billing/usage] erro:', (err as Error).message);
    return fail(500, ErrorCode.INTERNAL_ERROR, 'Erro carregando usage');
  }
}