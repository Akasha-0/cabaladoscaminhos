// ============================================================================
// POST /api/support/csat — submit CSAT rating (Wave 37)
// ============================================================================
// Body: { ticketId, rating (1-5), comment?, email? }
//
// LGPD Art. 7: comment é opt-in (campo livre). Rating é obrigatório.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateCsat, shouldEscalateToManager } from '@/lib/support';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const Schema = z.object({
  ticketId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().nullable(),
  email: z.string().email().optional().nullable(),
  userId: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_error', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const validation = validateCsat({
    ticketId: parsed.data.ticketId,
    userId: parsed.data.userId ?? null,
    email: parsed.data.email ?? null,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
  });
  if (!validation.ok) {
    return NextResponse.json(
      { error: 'invalid_csat', message: validation.reason },
      { status: 400 },
    );
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: parsed.data.ticketId },
    select: { id: true, status: true, satisfactionRating: true },
  });
  if (!ticket) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const updated = await prisma.supportTicket.update({
    where: { id: parsed.data.ticketId },
    data: {
      satisfactionRating: parsed.data.rating,
      satisfactionComment: parsed.data.comment ?? null,
      satisfactionSubmittedAt: new Date(),
    },
    select: {
      id: true,
      satisfactionRating: true,
      satisfactionSubmittedAt: true,
    },
  });

  // Audit
  try {
    await prisma.auditLog.create({
      data: {
        actorId: parsed.data.userId ?? null,
        action: 'SUPPORT_CSAT_SUBMITTED' as never,
        targetId: ticket.id,
        metadata: {
          rating: parsed.data.rating,
          escalated: shouldEscalateToManager(parsed.data.rating, parsed.data.comment ?? null),
        } as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.warn('[support audit] csat failed', err);
  }

  // Detractor escalation → write to audit (manager queue picks it up)
  if (shouldEscalateToManager(parsed.data.rating, parsed.data.comment ?? null)) {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: null,
          action: 'SUPPORT_DETRACTOR_ESCALATED' as never,
          targetId: ticket.id,
          metadata: { rating: parsed.data.rating, comment: parsed.data.comment ?? null } as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      console.warn('[support audit] escalation failed', err);
    }
  }

  return NextResponse.json({ ticket: updated });
}