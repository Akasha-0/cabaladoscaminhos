// ============================================================================
// ADMIN FLAG ACTION — POST /api/admin/flags/[id]/action
// ============================================================================
// Resolve uma denúncia. Ações possíveis:
//   - dismiss  → não procede (status=DISMISSED)
//   - hide     → esconde conteúdo (soft delete) (status=ACTIONED)
//   - delete   → remove definitivamente (status=ACTIONED)
//
// Toda ação é auditada em AuditLog. Conteúdo é modificado via soft-delete
// no Post/Comment (deletedAt) — nunca hard delete, para preservar audit.
//
// Wave 25 (2026-06-28): aceita MODERADOR (isModerator=true) além de ADMIN.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { prisma } from '@/lib/prisma';
import { requireModerator } from '@/lib/admin/session';
import { FlagActionSchema } from '@/lib/validators/flags';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let session;
    try {
      session = await requireModerator();
    } catch {
      return fail(403, ErrorCode.FORBIDDEN, 'Acesso restrito a moderadores');
    }
    if (!session.ok) {
      return fail(403, ErrorCode.FORBIDDEN, 'Acesso restrito a moderadores');
    }

    const { id } = await params;
    if (!id) {
      return fail(400, ErrorCode.BAD_REQUEST, 'ID da denúncia ausente');
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = FlagActionSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    // Carrega a flag
    const flag = await prisma.flag.findUnique({
      where: { id },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        reason: true,
        status: true,
        reporterId: true,
      },
    });

    if (!flag) {
      return fail(404, ErrorCode.NOT_FOUND, 'Denúncia não encontrada');
    }

    if (flag.status === 'ACTIONED' || flag.status === 'DISMISSED') {
      return fail(409, ErrorCode.CONFLICT, 'Esta denúncia já foi resolvida');
    }

    // Aplica a ação no conteúdo alvo
    const now = new Date();
    let contentAffected = false;

    if (parsed.data.action === 'hide' || parsed.data.action === 'delete') {
      try {
        if (flag.targetType === 'POST') {
          await prisma.post.update({
            where: { id: flag.targetId },
            data: { deletedAt: now },
          });
          contentAffected = true;
        } else if (flag.targetType === 'COMMENT') {
          await prisma.comment.update({
            where: { id: flag.targetId },
            data: { deletedAt: now },
          });
          contentAffected = true;
        } else if (flag.targetType === 'GROUP') {
          // Grupos: hide vira isPublic=false
          await prisma.group.update({
            where: { id: flag.targetId },
            data: { isPublic: false },
          });
          contentAffected = true;
        } else if (flag.targetType === 'USER') {
          // User ban é responsabilidade de outro fluxo; flag resolve como REVIEWED aqui
          // (não deletamos conta via flag)
          contentAffected = false;
        }
      } catch (err) {
        // Se o conteúdo já não existe mais, prosseguimos (audit continua)
        const e = err as { code?: string };
        if (e.code !== 'P2025') throw err; // P2025 = record not found
      }
    }

    // Atualiza a flag
    const newStatus =
      parsed.data.action === 'dismiss' ? 'DISMISSED' : 'ACTIONED';

    const updated = await prisma.flag.update({
      where: { id: flag.id },
      data: {
        status: newStatus,
        reviewedAt: now,
        reviewerId: session.userId!,
        actionTaken: parsed.data.action,
      },
      select: {
        id: true,
        status: true,
        reviewedAt: true,
        actionTaken: true,
      },
    });

    // Audit log (sempre)
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId!,
          targetId: flag.targetId,
          action:
            parsed.data.action === 'delete' || parsed.data.action === 'hide'
              ? 'ADMIN_CONTENT_REMOVE'
              : 'ADMIN_USER_BAN', // usado como proxy genérico
          metadata: {
            event: 'FLAG_RESOLVED',
            flagId: flag.id,
            flagReason: flag.reason,
            targetType: flag.targetType,
            targetId: flag.targetId,
            action: parsed.data.action,
            note: parsed.data.note ?? null,
            contentAffected,
            actorRole: session.role,
          },
        },
      });
    } catch {
      // best-effort
    }

    return ok({
      id: updated.id,
      status: updated.status,
      reviewedAt: updated.reviewedAt?.toISOString() ?? null,
      actionTaken: updated.actionTaken,
      contentAffected,
      role: session.role,
    });
  } catch (err) {
    return handleError(err);
  }
}
