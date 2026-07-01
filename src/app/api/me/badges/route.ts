// ============================================================================
// GET /api/me/badges — Current user's badge awards
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const awards = await prisma.badgeAward.findMany({
      where: { userId: user.id },
      include: {
        badge: {
          select: {
            slug: true,
            name: true,
            description: true,
            symbolKey: true,
            colorHex: true,
            tradition: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter: only public badges shown to others; user sees own both
    const visible = awards.filter((a) => a.isPublic);

    return NextResponse.json(
      {
        awards: visible,
        totalCount: visible.length,
        // counts: breakdown by reason (no PII, just counts)
        byReason: visible.reduce(
          (acc: Record<string, number>, a) => {
            acc[a.reason] = (acc[a.reason] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[me/badges/GET]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
