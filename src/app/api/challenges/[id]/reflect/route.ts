// ============================================================================
// POST /api/challenges/[id]/reflect — Save daily reflection
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth-utils';

const prisma = new PrismaClient();

const ReflectSchema = z.object({
  dayIndex: z.number().int().min(0).max(366),
  text: z.string().min(5).max(2000),
  isPublic: z.boolean().default(false),
});

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

    const body = await req.json();
    const parsed = ReflectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_failed', issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const { dayIndex, text, isPublic } = parsed.data;

    // Get participation (must exist)
    const participation = await prisma.challengeParticipation.findUnique({
      where: { challengeId_userId: { challengeId, userId: user.id } },
      include: { challenge: true },
    });
    if (!participation) {
      return NextResponse.json(
        { error: 'not_participating' },
        { status: 409 },
      );
    }

    if (dayIndex >= participation.challenge.durationDays) {
      return NextResponse.json(
        { error: 'day_out_of_range' },
        { status: 400 },
      );
    }

    // Update sharedReflections JSON + completedDays + progressDays
    const reflections = (participation.sharedReflections as Record<string, any>) || {};
    reflections[dayIndex.toString()] = {
      text,
      isPublic,
      authorId: user.id, // For moderation only, never exposed publicly
      authorName: user.nomeCompleto,
      createdAt: new Date().toISOString(),
    };

    const completedDays = new Set(participation.completedDays);
    const alreadyCompleted = completedDays.has(dayIndex);
    completedDays.add(dayIndex);

    const updated = await prisma.challengeParticipation.update({
      where: { id: participation.id },
      data: {
        completedDays: Array.from(completedDays).sort((a, b) => a - b),
        progressDays: completedDays.size,
        sharedReflections: reflections as any,
        // Mark completed when crossing 80% threshold
        completedAt:
          !participation.completedAt &&
          completedDays.size >= Math.ceil(participation.challenge.durationDays * 0.8)
            ? new Date()
            : participation.completedAt,
      },
    });

    // If completion just crossed, increment completionCount + consider badge award
    if (
      !alreadyCompleted &&
      updated.completedAt &&
      !participation.completedAt &&
      updated.progressDays > participation.progressDays
    ) {
      await prisma.communityChallenge.update({
        where: { id: challengeId },
        data: { completionCount: { increment: 1 } },
      });
      // Badge award logic handled by /api/badges/award (idempotent)
    }

    return NextResponse.json({ participation: updated }, { status: 200 });
  } catch (err) {
    console.error('[challenges/id/reflect/POST]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
