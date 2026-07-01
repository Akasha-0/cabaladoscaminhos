/**
 * PATCH /api/admin/moderation/[id]/decision
 *
 * Aplica decisão de moderação: APPROVE, FLAG, HIDE, REMOVE, DISMISS.
 * Suporta bulk via `ids: string[]` no body.
 *
 * Body: { ids: string[], decision, actionTaken?, note? }
 */

import { z } from 'zod';
import { cookies } from 'next/headers';
import { ok, fail, handleError } from '@/lib/community/api';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  ids: z.array(z.string().min(1).max(64)).min(1).max(100),
  decision: z.enum(['APPROVE', 'FLAG', 'HIDE', 'REMOVE', 'DISMISS']),
  actionTaken: z.enum(['dismiss', 'hide', 'delete']).optional(),
  note: z.string().max(1000).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const reviewerId = cookieStore.get('userId')?.value;
    const role = cookieStore.get('role')?.value ?? 'user';
    if (!reviewerId || !['admin', 'moderator', 'curator'].includes(role)) {
      return fail(403, 'FORBIDDEN', 'Acesso restrito a admins e moderadores.');
    }

    const json = await request.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Dados inválidos', parsed.error.format());
    }

    // O [id] da URL é tratado como membro do batch (consistente com ?ids= opcional)
    const { id } = await params;
    const ids = parsed.data.ids.includes(id) ? parsed.data.ids : [id, ...parsed.data.ids];
    const { decision, actionTaken, note } = parsed.data;

    // Mapear decision → FlagStatus
    const status: 'PENDING' | 'REVIEWED' | 'ACTIONED' | 'DISMISSED' =
      decision === 'DISMISS' ? 'DISMISSED' :
      decision === 'APPROVE' ? 'REVIEWED' :
      decision === 'FLAG' ? 'PENDING' : // mantém PENDING mas com reviewer
      'ACTIONED'; // HIDE / REMOVE

    const { prisma } = await import('@/lib/prisma');

    const result = await prisma.$transaction(async (tx) => {
      const updates = await Promise.all(
        ids.map((flagId) =>
          tx.flag.update({
            where: { id: flagId },
            data: {
              status,
              reviewedAt: new Date(),
              reviewerId,
              actionTaken: actionTaken ?? defaultActionFor(decision),
              description: note
                ? { set: undefined } // fallback se for string simples
                : undefined,
            },
            select: { id: true, status: true, actionTaken: true },
          }).catch(() => null)
        )
      );

      // Audit log por decisão
      await tx.auditLog.create({
        data: {
          action: 'MODERATION_DECISION',
          actorId: reviewerId,
          metadata: {
            flagIds: ids,
            decision,
            actionTaken: actionTaken ?? defaultActionFor(decision),
            note: note ?? null,
          },
        },
      });

      return updates.filter(Boolean);
    });

    return ok(
      {
        applied: result.length,
        decision,
        items: result,
      },
      { cache: { noStore: true } }
    );
  } catch (err) {
    return handleError(err);
  }
}

function defaultActionFor(decision: string): string {
  switch (decision) {
    case 'HIDE': return 'hide';
    case 'REMOVE': return 'delete';
    case 'DISMISS': return 'dismiss';
    default: return 'reviewed';
  }
}