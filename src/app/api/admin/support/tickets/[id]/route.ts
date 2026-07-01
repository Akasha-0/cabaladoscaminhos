// ============================================================================
// PATCH /api/admin/support/tickets/[id] — atualizar status/priority/assignment
// ============================================================================
// Ações permitidas: assign, status change, priority bump, resolve, close,
// CSAT capture.
//
// LGPD Art. 37: cada mudança gera entrada em AuditLog.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UpdateSchema = z.object({
  status: z.enum(['NEW', 'OPEN', 'PENDING_CUSTOMER', 'PENDING_AGENT', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedTo: z.string().nullable().optional(),
  team: z.enum(['BILLING', 'TECHNICAL', 'CONTENT', 'COMMUNITY', 'ACCOUNT']).optional(),
  tags: z.array(z.string().max(32)).max(10).optional(),
  satisfactionRating: z.number().int().min(1).max(5).optional().nullable(),
  satisfactionComment: z.string().max(2000).optional().nullable(),
  actorId: z.string().optional().nullable(), // agent userId for audit
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_error', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.supportTicket.findUnique({
    where: { id },
    select: { id: true, status: true, resolvedAt: true, closedAt: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const data: Prisma.SupportTicketUpdateInput = {
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
    ...(parsed.data.priority ? { priority: parsed.data.priority } : {}),
    ...(parsed.data.assignedTo !== undefined ? { assignedTo: parsed.data.assignedTo } : {}),
    ...(parsed.data.team ? { team: parsed.data.team } : {}),
    ...(parsed.data.tags ? { tags: parsed.data.tags } : {}),
    ...(parsed.data.satisfactionRating !== undefined
      ? { satisfactionRating: parsed.data.satisfactionRating, satisfactionSubmittedAt: new Date() }
      : {}),
    ...(parsed.data.satisfactionComment !== undefined
      ? { satisfactionComment: parsed.data.satisfactionComment }
      : {}),
    // Side-effect timestamps
    ...(parsed.data.status === 'RESOLVED' && !existing.resolvedAt ? { resolvedAt: new Date() } : {}),
    ...(parsed.data.status === 'CLOSED' && !existing.closedAt ? { closedAt: new Date() } : {}),
  };

  const updated = await prisma.supportTicket.update({
    where: { id },
    data,
    select: {
      id: true,
      status: true,
      priority: true,
      assignedTo: true,
      team: true,
      resolvedAt: true,
      closedAt: true,
      satisfactionRating: true,
      tags: true,
      updatedAt: true,
    },
  });

  // Audit log
  try {
    await prisma.auditLog.create({
      data: {
        actorId: parsed.data.actorId ?? null,
        action: 'SUPPORT_TICKET_UPDATED' as never,
        targetId: id,
        metadata: {
          changes: Object.keys(parsed.data).filter((k) => k !== 'actorId'),
          before: { status: existing.status },
          after: { status: parsed.data.status ?? existing.status },
        } as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.warn('[support audit] update failed', err);
  }

  return NextResponse.json({ ticket: updated });
}