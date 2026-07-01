// ============================================================================
// POST /api/engagement/recompute — Recompute weekly EngagementScore for a user
// Cron-callable (5x/day max per user). Idempotent.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-utils';
import {
  computeAndStore,
  weekKeyFromDate,
} from '@/lib/community/engagement-score';
import { rateLimit } from '@/lib/rate-limit';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Rate limit: 5 recomputes/day/user
    const limited = await rateLimit(`engagement-recompute:${user.id}`, 5, 86400);
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', resetAt: limited.resetAt },
        { status: 429 },
      );
    }

    const targetWeek =
      new URL(req.url).searchParams.get('week') || weekKeyFromDate();

    const result = await computeAndStore(user.id, targetWeek);

    return NextResponse.json(
      {
        weekKey: targetWeek,
        totalScore: result.totalScore,
        isActiveContributor: result.isTop10Percent,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[engagement/recompute/POST]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
