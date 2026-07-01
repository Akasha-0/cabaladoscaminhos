// ============================================================================
// POST /api/circles — Create a Circle (admin/curator)
// GET  /api/circles — List circles (filter by tradição)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient, CircleCadence } from '@prisma/client';
import { requireAuth } from '@/lib/auth-utils';
import { assertAdminOrCurator } from '@/lib/auth-guards';

const prisma = new PrismaClient();

const CreateCircleSchema = z.object({
  name: z.string().min(3).max(120),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(80),
  description: z.string().min(10).max(2000),
  tradition: z.string().nullable().optional(),
  cadence: z.nativeEnum(CircleCadence),
  nextSessionAt: z.string().datetime().optional(),
  durationMins: z.number().int().min(15).max(240).default(60),
  mentorId: z.string().optional(),
  bundlePriceCents: z.number().int().min(0).optional(),
  bundleSessions: z.number().int().min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const caller = await requireAuth(req);
    if (!caller) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    try {
      await assertAdminOrCurator(caller);
    } catch {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateCircleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_failed', issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Unique slug
    const existing = await prisma.circle.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: 'slug_taken' }, { status: 409 });
    }

    const circle = await prisma.circle.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        tradition: data.tradition || null,
        cadence: data.cadence,
        nextSessionAt: data.nextSessionAt ? new Date(data.nextSessionAt) : null,
        durationMins: data.durationMins,
        mentorId: data.mentorId || caller.id,
        bundlePriceCents: data.bundlePriceCents ?? null,
        bundleSessions: data.bundleSessions ?? null,
      },
    });

    return NextResponse.json({ circle }, { status: 201 });
  } catch (err) {
    console.error('[circles/POST]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tradition = searchParams.get('tradition');
    const cadence = searchParams.get('cadence') as CircleCadence | null;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    const where: any = {};
    if (tradition) where.tradition = tradition;
    if (cadence) where.cadence = cadence;

    const circles = await prisma.circle.findMany({
      where,
      orderBy: { nextSessionAt: 'asc' },
      take: limit,
      include: {
        mentor: { select: { id: true, nomeCompleto: true } },
      },
    });

    return NextResponse.json({ circles }, { status: 200 });
  } catch (err) {
    console.error('[circles/GET]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
