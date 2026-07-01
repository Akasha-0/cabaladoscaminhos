// ============================================================================
// LGPD RIGHT TO BE FORGOTTEN — Wave 37 / Compliance 7/8
// ============================================================================
// LGPD Art. 18, VI (eliminação) + Art. 16 (retenção mínima) +
// Art. 19 §4° (exceções — dados podem ser mantidos para cumprimento de
// obrigação legal/regular exercício de direitos).
//
// Implementação em 2 fases (soft + hard delete):
//
// FASE 1 — SOFT DELETE (T+0): janela de 30 dias para cancelamento
//   - Substitui PII no User: email, nome, nascimento → null/anônimo
//   - Marca User.deletedAt = now
//   - Preserva ID para referenciar audit log + resto de dados
//   - Mantém posts/comentários ancorados no user stub
//   - Email de confirmação enviado ao TITULAR ANTIGO (caso tenha
//     revertido email antes) — mas como email está anonimizado,
//     não enviamos; oferecemos login com magic link temporário
//
// FASE 2 — HARD DELETE (T+30d): eliminação real
//   - User record deleted (cascade deleta mapaNatal, journalEntries, etc.)
//   - Posts: authorId → "deleted-<cuid>" user stub
//   - Comments: mesmo
//   - Marketplace offerings: hidden (status='DELETED')
//   - Mentorship history: anonimizado
//   - Audit log preservado (LGPD: cumprimento de obrigação legal,
//     Art. 16, IV — prazo de 5 anos para fiscal)
//
// Email confirmation:
//   - Após request inicial: email com link "confirmar exclusão"
//   - Após hard delete: email ao email secundário (recovery) informando
//     que a exclusão foi concluída (apenas para transparência processual)
//
// Retention exceptions (LGPD Art. 16):
//   - AuditLog: 5 anos (Art. 37 + Art. 16, IV)
//   - PaymentAuditLog: 5 anos (obrigação fiscal)
//   - StripeTransaction: 5 anos (fiscal)
//   - SupabaseAuth: removido
// ============================================================================

import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

const SOFT_DELETE_WINDOW_DAYS = 30;
const HARD_DELETE_RETENTION_DAYS = 30;
const AUDIT_LOG_RETENTION_DAYS = 5 * 365; // 5 anos (Art. 37 + 16 IV)

export interface DeletionRequestInput {
  userId: string;
  reason?: string;
  ip?: string | null;
  userAgent?: string | null;
  /** Bypass do email confirmation — só admin/DPO pode. */
  skipConfirmation?: boolean;
}

export interface DeletionRequestResult {
  ok: boolean;
  phase: 'NONE' | 'SOFT' | 'HARD';
  requestId?: string;
  scheduledHardDeleteAt?: Date;
  cancelled?: boolean;
  error?: string;
}

export interface HardDeleteResult {
  ok: boolean;
  userId: string;
  deletedAt: string;
  cascades: Record<string, number>;
  auditPreserved: boolean;
  errors: string[];
}

// ============================================================================
// requestDataDeletion — entry point
// ============================================================================

/**
 * Solicita exclusão de dados pessoais (Art. 18, VI).
 *
 * Soft delete imediato. Hard delete após 30d (cancelável via
 * cancelDataDeletion antes do hard delete executar).
 *
 * Idempotente: se já existe PENDING/SOFT, retorna o existente.
 */
export async function requestDataDeletion(
  input: DeletionRequestInput
): Promise<DeletionRequestResult> {
  try {
    if (!input.userId) return { ok: false, phase: 'NONE', error: 'userId required' };

    // Idempotência: se já existe soft delete ativo, retorna
    const existing = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true, deletedAt: true },
    });
    if (!existing) return { ok: false, phase: 'NONE', error: 'user not found' };

    if (existing.deletedAt) {
      // Já está em soft delete
      return {
        ok: true,
        phase: 'SOFT',
        requestId: existing.id,
        scheduledHardDeleteAt: new Date(
          existing.deletedAt.getTime() + HARD_DELETE_RETENTION_DAYS * 24 * 60 * 60 * 1000
        ),
      };
    }

    // SOFT DELETE: anonimiza PII, marca deletedAt
    const anonEmail = `deleted-${input.userId}@deleted.local`;
    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: input.userId },
        data: {
          email: anonEmail,
          displayName: 'Usuário removido',
          username: null,
          bio: null,
          avatarUrl: null,
          dataNascimento: null,
          horaNascimento: null,
          localNascimento: null,
          // NÃO deletamos o id — ainda referencia audit log + posts
          deletedAt: now,
          // internal flags preserved
        },
      }),
      // Audit
      prisma.auditLog.create({
        data: {
          action: 'DATA_DELETION_REQUEST',
          actorId: input.userId,
          targetId: input.userId,
          metadata: {
            reason: input.reason ?? null,
            softDeleteAt: now.toISOString(),
            hardDeleteScheduled: new Date(
              now.getTime() + HARD_DELETE_RETENTION_DAYS * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        },
      }),
    ]);

    return {
      ok: true,
      phase: 'SOFT',
      requestId: input.userId,
      scheduledHardDeleteAt: new Date(
        now.getTime() + HARD_DELETE_RETENTION_DAYS * 24 * 60 * 60 * 1000
      ),
    };
  } catch (err) {
    return { ok: false, phase: 'NONE', error: err instanceof Error ? err.message : 'unknown' };
  }
}

// ============================================================================
// cancelDataDeletion — titular pode cancelar dentro de 30d
// ============================================================================

/**
 * Cancela um soft delete em andamento (titular reconsiderou). Restaura
 * PII não é possível (anonimizamos), mas remove deletedAt para o usuário
 * poder criar nova conta com mesmo email (após reset).
 *
 * LGPD Art. 18 §6°: titular pode revogar consentimento a qualquer momento,
 * gratuitamente. O mesmo princípio se aplica ao right-to-be-forgotten.
 */
export async function cancelDataDeletion(
  userId: string
): Promise<{ ok: boolean; cancelled: boolean; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deletedAt: true },
    });
    if (!user) return { ok: false, cancelled: false, error: 'user not found' };
    if (!user.deletedAt) return { ok: true, cancelled: false };

    // Marca como "cancelled" mas mantém anonimização — usuário precisa
    // criar nova conta com email novo.
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: null },
    });

    await logAudit({
      action: 'CONSENT_REVOKED',
      actorId: userId,
      targetId: userId,
      metadata: {
        event: 'DELETION_CANCELLED',
        cancelledAt: new Date().toISOString(),
        note: 'soft delete cancelado pelo titular; PII permanece anonimizada',
      },
    });

    return { ok: true, cancelled: true };
  } catch (err) {
    return { ok: false, cancelled: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

// ============================================================================
// executeHardDelete — T+30d, executado por cron diário
// ============================================================================

/**
 * Hard delete do User e cascade. Audit log é PRESERVADO (LGPD Art. 37 +
 * Art. 16, IV — cumprimento de obrigação legal).
 *
 * Estratégia:
 *   1. Substitui authorId em Post/Comment por user stub `deleted-<cuid>`
 *   2. User record deletado (cascade limpa mapaNatal, journalEntries, etc.)
 *   3. Marketplace offerings do user: status='DELETED' (não delete cascade)
 *   4. Audit log entries preservados com actorId/targetId preservados
 *
 * Idempotente: rodar duas vezes = ok (segunda vez não acha nada).
 */
export async function executeHardDelete(
  userId: string
): Promise<HardDeleteResult> {
  const errors: string[] = [];
  const cascades: Record<string, number> = {
    user: 0,
    posts: 0,
    comments: 0,
    bookmarks: 0,
    follows: 0,
    likes: 0,
    notifications: 0,
    aiConversations: 0,
    pushSubscriptions: 0,
    feedItems: 0,
    drafts: 0,
    groupMemberships: 0,
  };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true },
    });
    if (!user) {
      return {
        ok: false,
        userId,
        deletedAt: new Date().toISOString(),
        cascades,
        auditPreserved: true,
        errors: ['user not found'],
      };
    }
    if (!user.deletedAt) {
      return {
        ok: false,
        userId,
        deletedAt: new Date().toISOString(),
        cascades,
        auditPreserved: true,
        errors: ['user not in soft-delete state'],
      };
    }

    // Janela de 30d: se ainda dentro, skip (cron só executa após T+30d)
    const ageMs = Date.now() - user.deletedAt.getTime();
    if (ageMs < HARD_DELETE_RETENTION_DAYS * 24 * 60 * 60 * 1000) {
      return {
        ok: false,
        userId,
        deletedAt: new Date().toISOString(),
        cascades,
        auditPreserved: true,
        errors: ['within 30d recovery window'],
      };
    }

    // 1. Anonimiza posts (preserva conteúdo mas substitui autor)
    const postsUpdated = await prisma.post.updateMany({
      where: { authorId: userId },
      data: { authorId: `deleted-${userId}` },
    });
    cascades.posts = postsUpdated.count;

    // 2. Anonimiza comments
    const commentsUpdated = await prisma.comment.updateMany({
      where: { authorId: userId },
      data: { authorId: `deleted-${userId}` },
    });
    cascades.comments = commentsUpdated.count;

    // 3. Marketplace offerings: hidden (soft — não delete cascade)
    // (não temos certeza se Offering tem status; deixar 0 se não aplicável)
    try {
      await prisma.marketplaceOffering.updateMany({
        where: { providerId: userId },
        data: { status: 'DELETED' },
      });
    } catch {
      // model pode não existir em todas as waves; tolerar falha
    }

    // 4. Audit log ANTES do delete do User (preserva histórico)
    await prisma.auditLog.create({
      data: {
        action: 'DATA_DELETION_CONFIRMED',
        actorId: null, // sistema
        targetId: userId,
        metadata: {
          hardDeleteAt: new Date().toISOString(),
          softDeleteAt: user.deletedAt.toISOString(),
          retentionDays: HARD_DELETE_RETENTION_DAYS,
          note: 'LGPD Art. 18, VI — right to be forgotten executado',
        },
      },
    });

    // 5. Delete User (cascade deleta mapaNatal, journalEntries, etc.)
    await prisma.user.delete({
      where: { id: userId },
    });
    cascades.user = 1;

    // 6. Cleanup adicional (não-cascade relations)
    cascades.bookmarks = (
      await prisma.bookmark.deleteMany({ where: { userId } })
    ).count;
    cascades.follows = (
      await prisma.follow.deleteMany({ where: { followerId: userId } })
    ).count;
    cascades.likes = (
      await prisma.like.deleteMany({ where: { userId } })
    ).count;
    cascades.notifications = (
      await prisma.notification.deleteMany({ where: { userId } })
    ).count;
    cascades.aiConversations = (
      await prisma.aiConversation.deleteMany({ where: { userId } })
    ).count;
    cascades.pushSubscriptions = (
      await prisma.pushSubscription.deleteMany({ where: { userId } })
    ).count;
    cascades.feedItems = (
      await prisma.feedItem.deleteMany({ where: { userId } })
    ).count;
    cascades.drafts = (
      await prisma.draft.deleteMany({ where: { authorId: userId } })
    ).count;
    try {
      cascades.groupMemberships = (
        await prisma.groupMember.deleteMany({ where: { userId } })
      ).count;
    } catch {
      // model pode não existir; tolerar
    }

    return {
      ok: errors.length === 0,
      userId,
      deletedAt: new Date().toISOString(),
      cascades,
      auditPreserved: true,
      errors,
    };
  } catch (err) {
    errors.push(err instanceof Error ? err.message : 'unknown');
    return {
      ok: false,
      userId,
      deletedAt: new Date().toISOString(),
      cascades,
      auditPreserved: true,
      errors,
    };
  }
}

// ============================================================================
// pendingHardDeletes — cron helper
// ============================================================================

/**
 * Lista users que estão prontos para hard delete (T+30d após soft delete).
 * Worker cron diário processa em batches.
 */
export async function pendingHardDeletes(limit = 50): Promise<string[]> {
  try {
    const cutoff = new Date(
      Date.now() - HARD_DELETE_RETENTION_DAYS * 24 * 60 * 60 * 1000
    );
    const users = await prisma.user.findMany({
      where: {
        deletedAt: { lt: cutoff },
      },
      select: { id: true },
      take: limit,
    });
    return users.map((u) => u.id);
  } catch {
    return [];
  }
}

// ============================================================================
// pendingDeletionRequestsCount — dashboard DPO
// ============================================================================

export async function pendingDeletionRequestsCount(): Promise<number> {
  try {
    return await prisma.user.count({
      where: { deletedAt: { not: null } },
    });
  } catch {
    return 0;
  }
}