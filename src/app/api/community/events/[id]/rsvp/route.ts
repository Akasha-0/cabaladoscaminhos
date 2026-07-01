// ============================================================================
// COMMUNITY EVENT RSVP — /api/community/events/[id]/rsvp
// ============================================================================
// POST → toggle RSVP (GOING / WAITLIST / MAYBE / NOT_GOING / CANCELLED)
// GET  → lista RSVPs do evento (host only)
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import { applyRsvp, promoteWaitlist } from '@/lib/events/rsvp';

export const dynamic = 'force-dynamic';

const RsvpBodySchema = z.object({
  status: z.enum(['GOING', 'MAYBE', 'NOT_GOING', 'CANCELLED']),
  guests: z.number().int().min(0).max(10).default(0),
  note: z.string().max(500).optional(),
});

interface RouteParams {
  params: { id: string };
}

// ============================================================================
// POST
// ============================================================================

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const viewer = await requireViewer();
    const eventId = params.id;
    const body = await request.json();
    const parsed = RsvpBodySchema.safeParse(body);

    if (!parsed.success) {
      return fail(ErrorCode.VALIDATION, 'Invalid body', { issues: parsed.error.issues });
    }

    const result = await applyRsvp(prisma as any, {
      eventId,
      userId: viewer.id,
      guests: parsed.data.guests,
      note: parsed.data.note,
    }, parsed.data.status);

    if (!result.ok) {
      const code = result.reason === 'event_not_found'
        ? ErrorCode.NOT_FOUND
        : result.reason === 'event_not_published'
        ? ErrorCode.FORBIDDEN
        : ErrorCode.VALIDATION;
      return fail(code, result.reason ?? 'rsvp_failed');
    }

    // Auto-promote waitlist se alguém cancelou
    if (parsed.data.status === 'CANCELLED') {
      await promoteWaitlist(prisma as any, eventId, 1);
    }

    return ok({
      status: result.status,
      position: result.position ?? null,
      reason: result.reason ?? null,
    });
  } catch (err) {
    return handleError(err);
  }
}

// ============================================================================
// GET — list (host only)
// ============================================================================

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const viewer = await requireViewer();

    const event = await prisma.communityEvent.findUnique({
      where: { id: params.id },
      select: { hostId: true },
    });

    if (!event) {
      return fail(ErrorCode.NOT_FOUND, 'event not found');
    }

    if (event.hostId !== viewer.id) {
      return fail(ErrorCode.FORBIDDEN, 'only host can view RSVPs');
    }

    const rsvps = await prisma.eventRsvp.findMany({
      where: { eventId: params.id },
      orderBy: { createdAt: 'asc' },
    });

    return ok(rsvps);
  } catch (err) {
    return handleError(err);
  }
}