// ============================================================================
// POST /api/challenges — Create a new CommunityChallenge
// GET  /api/challenges — List challenges (with filters)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient, ChallengeType, ChallengeCadence } from '@prisma/client';
import { requireAuth } from '@/lib/auth-utils';
import { rateLimit } from '@/lib/rate-limit';

const prisma = new PrismaClient();

const CreateChallengeSchema = z.object({
  type: z.nativeEnum(ChallengeType),
  tradition: z.string().nullable().optional(),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  durationDays: z.number().int().min(1).max(365),
  cadence: z.nativeEnum(ChallengeCadence),
  completionThreshold: z.number().int().min(50).max(100).default(80),
  badgeEnabled: z.boolean().default(false),
  badgeName: z.string().max(80).optional(),
  badgeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Rate limit (5 creates/day/user — manual workflow)
    const limited = await rateLimit(`create-challenge:${user.id}`, 5, 86400);
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', resetAt: limited.resetAt },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = CreateChallengeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_failed', issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // LGPD minor sanity: enforce start < end
    if (new Date(data.startsAt) >= new Date(data.endsAt)) {
      return NextResponse.json(
        { error: 'invalid_period' },
        { status: 400 },
      );
    }

    const challenge = await prisma.communityChallenge.create({
      data: {
        type: data.type,
        tradition: data.tradition || null,
        title: data.title,
        description: data.description,
        durationDays: data.durationDays,
        cadence: data.cadence,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        coverImage: data.coverImage || null,
        hostId: user.id,
      },
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (err) {
    console.error('[challenges/POST]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as ChallengeType | null;
    const tradition = searchParams.get('tradition');
    const active = searchParams.get('active') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    const where: any = {};
    if (type) where.type = type;
    if (tradition) where.tradition = tradition;
    if (active) {
      const now = new Date();
      where.startsAt = { lte: now };
      where.endsAt = { gte: now };
    }

    const challenges = await prisma.communityChallenge.findMany({
      where,
      orderBy: { startsAt: 'desc' },
      take: limit,
      include: {
        host: { select: { id: true, nomeCompleto: true } },
      },
    });

    return NextResponse.json({ challenges }, { status: 200 });
  } catch (err) {
    console.error('[challenges/GET]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
