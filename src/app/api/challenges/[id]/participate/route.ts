// ============================================================================
// POST /api/challenges/[id]/participate — Join a challenge
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const challengeId = params.id;
    if (!challengeId) {
      return NextResponse.json({ error: 'missing_challenge_id' }, { status: 400 });
    }

    // Verify challenge exists and is active
    const challenge = await prisma.communityChallenge.findUnique({
      where: { id: challengeId },
      select: { id: true, startsAt: true, endsAt: true },
    });
    if (!challenge) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    const now = new Date();
    if (now < challenge.startsAt || now > challenge.endsAt) {
      return NextResponse.json(
        { error: 'challenge_not_active', reason: 'outside_window' },
        { status: 409 },
      );
    }

    // Upsert (idempotent: participating twice returns same record)
    const participation = await prisma.challengeParticipation.upsert({
      where: { challengeId_userId: { challengeId, userId: user.id } },
      create: {
        challengeId,
        userId: user.id,
        progressDays: 0,
        completedDays: [],
        sharedReflections: {},
      },
      update: {}, // no-op on rejoin
    });

    // Increment participantsCount (denormalized counter)
    await prisma.communityChallenge.update({
      where: { id: challengeId },
      data: { participantsCount: { increment: 1 } },
    });

    return NextResponse.json({ participation }, { status: 200 });
  } catch (err) {
    console.error('[challenges/id/participate/POST]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
