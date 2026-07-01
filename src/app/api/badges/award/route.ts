// ============================================================================
// POST /api/badges/award — Internal: award badge to user
// Admin-only endpoint. Idempotent via @@unique([badgeId,userId,contextId]).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient, BadgeAwardReason } from '@prisma/client';
import { requireAuth } from '@/lib/auth-utils';
import { assertAdmin } from '@/lib/auth-guards';

const prisma = new PrismaClient();

const AwardSchema = z.object({
  badgeSlug: z.string().min(1),
  userId: z.string().min(1),
  reason: z.nativeEnum(BadgeAwardReason),
  contextId: z.string().min(1),
  contextLabel: z.string().max(120).optional(),
  isPublic: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const caller = await requireAuth(req);
    if (!caller) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    // Admin or system-only endpoint
    try {
      await assertAdmin(caller);
    } catch {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = AwardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_failed', issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Look up badge
    const badge = await prisma.badge.findUnique({
      where: { slug: data.badgeSlug },
    });
    if (!badge) {
      return NextResponse.json({ error: 'badge_not_found' }, { status: 404 });
    }

    // Idempotent upsert via @@unique([badgeId,userId,contextId])
    const award = await prisma.badgeAward.upsert({
      where: {
        badgeId_userId_contextId: {
          badgeId: badge.id,
          userId: data.userId,
          contextId: data.contextId,
        },
      },
      create: {
        badgeId: badge.id,
        userId: data.userId,
        reason: data.reason,
        contextId: data.contextId,
        contextLabel: data.contextLabel ?? null,
        isPublic: data.isPublic,
      },
      update: {}, // no-op
    });

    // Update awardedCount cache (denormalized)
    await prisma.badge.update({
      where: { id: badge.id },
      data: { awardedCount: { increment: 1 } },
    });

    return NextResponse.json({ award }, { status: 200 });
  } catch (err) {
    console.error('[badges/award/POST]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
