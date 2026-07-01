// ============================================================================
// GET /api/me/engagement — Current user's engagement score + tier recognition
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-utils';
import {
  ENGAGEMENT_WEIGHTS,
  weekKeyFromDate,
} from '@/lib/community/engagement-score';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const weekKey = new URL(req.url).searchParams.get('week') || weekKeyFromDate();

    const score = await prisma.engagementScore.findUnique({
      where: { userId_weekKey: { userId: user.id, weekKey } },
    });

    if (!score) {
      return NextResponse.json({
        weekKey,
        hasNoData: true,
        message: 'No engagement recorded for this week yet.',
      }, { status: 200 });
    }

    return NextResponse.json({
      weekKey,
      totalScore: score.totalScore,
      isActiveContributor: score.isTop10Percent,
      weights: ENGAGEMENT_WEIGHTS,
      counts: {
        posts: score.posts,
        comments: score.comments,
        reactionsReceived: score.reactionsReceived,
        akashaConversations: score.akashaConversations,
        mentorshipSessions: score.mentorshipSessions,
        marketplaceTx: score.marketplaceTx,
        challengeParticipation: score.challengeParticipation,
        eventRsvps: score.eventRsvps,
      },
    }, { status: 200 });
  } catch (err) {
    console.error('[me/engagement/GET]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
