// ============================================================================
// COMMUNITY EVENTS — /api/community/events
// ============================================================================
// Wave 35 — Eventos com RSVP, live streaming, calendar.
// GET  → lista (filtros: tradição, type, status, data, search)
// POST → cria novo evento (autenticado; vira host)
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { getViewer, requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ============================================================
// Validação
// ============================================================================

const EventTypeEnum = z.enum([
  'WORKSHOP',
  'CIRCLE',
  'LECTURE',
  'CEREMONY',
  'MEDITATION',
  'LIVESTREAM',
]);

const ListQuerySchema = z.object({
  tradition: z.string().optional(),
  type: EventTypeEnum.optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
  upcoming: z.coerce.boolean().optional(),
  past: z.coerce.boolean().optional(),
  hostId: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const CreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  tradition: z.string().min(2).max(50),
  type: EventTypeEnum,
  facilitatorIds: z.array(z.string()).default([]),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  timezone: z.string().default('America/Sao_Paulo'),
  location: z.string().max(500).optional().nullable(),
  onlineUrl: z.string().url().optional().nullable(),
  capacity: z.number().int().min(1).optional().nullable(),
  priceCents: z.number().int().min(0).default(0),
  currency: z.string().length(3).default('BRL'),
  coverImage: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
  rsvpRequired: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

// ============================================================
// GET — list
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const parsed = ListQuerySchema.safeParse({
      tradition: sp.get('tradition') ?? undefined,
      type: sp.get('type') ?? undefined,
      status: sp.get('status') ?? undefined,
      upcoming: sp.get('upcoming') ?? undefined,
      past: sp.get('past') ?? undefined,
      hostId: sp.get('hostId') ?? undefined,
      search: sp.get('search') ?? undefined,
      limit: sp.get('limit') ?? undefined,
    });

    if (!parsed.success) {
      return fail(ErrorCode.VALIDATION, 'Invalid query', { issues: parsed.error.issues });
    }

    const q = parsed.data;
    const now = new Date();
    const where: Prisma.CommunityEventWhereInput = {};

    if (q.tradition) where.tradition = q.tradition;
    if (q.type) where.type = q.type;
    if (q.status) where.status = q.status;
    if (q.hostId) where.hostId = q.hostId;

    if (q.upcoming) {
      where.startsAt = { gte: now };
      where.status = where.status ?? 'PUBLISHED';
    } else if (q.past) {
      where.endsAt = { lt: now };
    }

    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.communityEvent.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      take: q.limit,
      include: {
        rsvps: {
          where: { userId: (await getViewer())?.id ?? '__none__' },
          take: 1,
        },
      },
    });

    return ok(
      events.map((e) => ({
        ...e,
        viewerRsvp: e.rsvps[0]?.status ?? null,
        rsvps: undefined,
      })),
      {
        cache: { sMaxage: 30, staleWhileRevalidate: 60 },
        meta: { count: events.length },
      },
    );
  } catch (err) {
    return handleError(err);
  }
}

// ============================================================
// POST — create
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const viewer = await requireViewer();
    const body = await request.json();
    const parsed = CreateSchema.safeParse(body);

    if (!parsed.success) {
      return fail(ErrorCode.VALIDATION, 'Invalid body', { issues: parsed.error.issues });
    }

    if (parsed.data.endsAt <= parsed.data.startsAt) {
      return fail(ErrorCode.VALIDATION, 'endsAt must be after startsAt');
    }

    const event = await prisma.communityEvent.create({
      data: {
        ...parsed.data,
        hostId: viewer.id,
      },
    });

    return ok(event, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}