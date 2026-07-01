// ============================================================================
// PATCH /api/admin/feedback/[id] — admin review (status, priority, note)
// ============================================================================
// Auth: requireAdmin. Permite:
//   - mudar status (NEW → IN_REVIEW → PLANNED → DONE | WONT_FIX)
//   - bumpear priority (0=normal, 1=high, 2=urgent)
//   - adicionar reviewNote visível ao usuário final (via GET /api/feedback/mine)
//
// Toda ação gera AuditLog para LGPD Art. 37.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/session';
import { prisma } from '@/lib/prisma';
import { auditFeedback } from '@/lib/feedback';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const bodySchema = z.object({
  status: z.enum(['NEW', 'IN_REVIEW', 'PLANNED', 'DONE', 'WONT_FIX']).optional(),
  priority: z.number().int().min(0).max(2).optional(),
  reviewNote: z.string().trim().max(2000).optional().nullable(),
}).refine(
  (v) => Object.values(v).some((x) => x !== undefined),
  { message: 'Forneça pelo menos um campo (status, priority, reviewNote).' },
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireAdmin();
  if (!session.ok) {
    return NextResponse.json(
      { error: 'forbidden', reason: session.reason },
      { status: session.reason === 'config_error' ? 500 : 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'invalid_json' },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_error', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.feedbackSubmission.findUnique({
    where: { id: params.id },
    select: { id: true, status: true, priority: true, userId: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: 'not_found', message: 'Feedback não encontrado.' },
      { status: 404 },
    );
  }

  const adminId = (session.userId ?? null) as string | null;
  const isStatusTransition =
    parsed.data.status !== undefined && parsed.data.status !== existing.status;
  const reviewedAt = isStatusTransition ? new Date() : undefined;

  const updated = await prisma.feedbackSubmission.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      priority: parsed.data.priority,
      reviewNote: parsed.data.reviewNote,
      ...(reviewedAt ? { reviewedAt, reviewedBy: adminId } : {}),
    },
    select: {
      id: true,
      status: true,
      priority: true,
      reviewNote: true,
      reviewedAt: true,
      reviewedBy: true,
    },
  });

  await auditFeedback(adminId, 'FEEDBACK_REVIEWED', updated.id, {
    fromStatus: existing.status,
    toStatus: updated.status,
    fromPriority: existing.priority,
    toPriority: updated.priority,
    hasNote: updated.reviewNote !== null,
  });

  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireAdmin();
  if (!session.ok) {
    return NextResponse.json(
      { error: 'forbidden', reason: session.reason },
      { status: 403 },
    );
  }
  // Soft pattern: marcar WONT_FIX ao invés de deletar (audit trail)
  await prisma.feedbackSubmission.update({
    where: { id: params.id },
    data: { status: 'WONT_FIX', reviewedAt: new Date(), reviewedBy: (session.userId ?? null) as string | null },
  });
  await auditFeedback((session.userId ?? null) as string | null, 'FEEDBACK_CLOSED', params.id);
  return NextResponse.json({ ok: true });
}
