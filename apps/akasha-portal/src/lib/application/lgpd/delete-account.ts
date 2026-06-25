/**
 * delete-account.ts — Wave 19.2 (LGPD self-service Art. 18 §V)
 *
 * Helper unificado para eliminação de conta. Suporta DOIS modos:
 *
 *   1. SELF-SERVICE (soft delete com grace period)
 *      - Acionado por `/api/account/delete` (usuário deletando A SI PRÓPRIO)
 *      - Marca `User.deletedAt = NOW()` e `deleteGracePeriodEndsAt = NOW() + 30d`
 *      - Sessão é invalidada (clear cookies)
 *      - Cron de limpeza (Wave 19.2-followup) faz hard delete + cascade
 *        APÓS o grace expirar
 *
 *   2. ADMIN (hard delete com cascade imediato)
 *      - Acionado por `/api/akasha/profile/[id]` DELETE (Wave 8.3, admin-only
 *        OU owner — Wave 19.2 passou a aceitar ambos)
 *      - `prisma.user.delete` propaga cascade (BirthChart, Subscription,
 *        Manifesto, Caminhante→Caminhada→Sessao→SessaoChunk, etc.)
 *
 * LGPD:
 *   - Art. 18 §V — direito de eliminação
 *   - Art. 18 §3 — revogação: usuário pode cancelar soft-delete durante grace
 *   - Art. 37 — auditoria (cada ação loga em `audit_logs`)
 *   - Art. 33 — IP hasheado, PII redacted
 *
 * Trade-off (documentado):
 *   - Soft delete aumenta risco de "fantasma" (conta existe mas inativa).
 *     Mitigado por:
 *       a) filtro em `requireAkashaApi` (rejeita auth se deletedAt !== null)
 *       b) cron diário de hard delete pós-grace
 *       c) UI mostra banner "sua conta será eliminada em X dias, cancelar?"
 */

import { compare } from 'bcryptjs';
import { prisma } from '@/lib/infrastructure/prisma';
import { auditLog } from '@/lib/infrastructure/audit-log';
import type { AkashaUser } from '@/lib/application/auth/akasha-guard';

// ===== Constantes =====

/** Wave 19.2 — grace period de 30 dias (LGPD Art. 18 §3 — revogação). */
export const LGPD_DELETION_GRACE_DAYS = 30;

/** Wave 19.2 — janela mínima entre dois self-deletes (anti-abuse). */
export const LGPD_DELETION_CONFIRM_WINDOW_MIN = 10;

// ===== Tipos =====

export interface SoftDeleteInput {
  /** User autenticado (vem de requireAkashaApi). */
  auth: AkashaUser;
  /** IP já hasheado (vem de hashIpForAudit). */
  ipHash?: string;
  /** Request ID para tracing. */
  requestId?: string;
}

export interface SoftDeleteResult {
  success: boolean;
  deletedAt: Date;
  gracePeriodEndsAt: Date;
  graceDays: number;
  /** Snapshot do que será hard-deletado após grace. */
  cascadePreview: Awaited<ReturnType<typeof countCascadedData>>;
}

export interface HardDeleteInput {
  /** Quem está pedindo o delete (geralmente ADMIN ou owner). */
  auth: AkashaUser;
  /** Role do actor (precisa ser buscado antes — só ADMIN pode deletar outros). */
  actorRole: 'MEMBER' | 'ADMIN';
  /** ID do user a ser deletado. */
  targetUserId: string;
  /** IP hasheado. */
  ipHash?: string;
  requestId?: string;
}

export interface HardDeleteResult {
  success: boolean;
  cascaded: Awaited<ReturnType<typeof countCascadedData>>;
}

export type CancelDeletionInput = {
  auth: AkashaUser;
  ipHash?: string;
  requestId?: string;
};

export interface CancelDeletionResult {
  cancelled: true;
  previouslyScheduledFor: Date;
}

// ===== Funções públicas =====

/**
 * SELF-SERVICE soft delete (Wave 19.2).
 *
 * Fluxo:
 *   1. Verifica que user existe e está ATIVO (não deletado)
 *   2. Grava `deletedAt` + `deleteGracePeriodEndsAt`
 *   3. Audit log: requested + scheduled
 *   4. Retorna snapshot do cascade (preview do que será removido)
 *
 * NÃO chama `prisma.user.delete` — isso fica para o cron pós-grace.
 *
 * @throws Error se user já está em grace (idempotência: chama `cancelDeletion`
 *         antes se quiser reiniciar).
 */
export async function softDeleteAccount(
  input: SoftDeleteInput,
): Promise<SoftDeleteResult> {
  const { auth } = input;

  const now = new Date();
  const gracePeriodEndsAt = new Date(
    now.getTime() + LGPD_DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000,
  );

  // 1. Verifica estado atual
  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { id: true, email: true, deletedAt: true },
  });

  if (!user) {
    throw new Error('User não encontrado');
  }

  if (user.deletedAt) {
    // Já em grace — não recomeçar (idempotência)
    const cascadePreview = await countCascadedData(user.id);
    auditLog({
      action: 'lgpd_deletion_requested',
      userId: auth.id,
      ipHash: input.ipHash,
      requestId: input.requestId,
      metadata: {
        outcome: 'already_scheduled',
        previouslyDeletedAt: user.deletedAt.toISOString(),
      },
    });
    return {
      success: true,
      deletedAt: user.deletedAt,
      gracePeriodEndsAt: gracePeriodEndsAt,
      graceDays: LGPD_DELETION_GRACE_DAYS,
      cascadePreview,
    };
  }

  // 2. Audit: requested (antes de qualquer escrita destrutiva)
  const cascadePreview = await countCascadedData(user.id);

  auditLog({
    action: 'lgpd_deletion_requested',
    userId: auth.id,
    ipHash: input.ipHash,
    requestId: input.requestId,
    metadata: {
      email: user.email,
      selfService: true,
      graceDays: LGPD_DELETION_GRACE_DAYS,
      cascadePreview,
    },
  });

  // 3. Soft delete
  await prisma.user.update({
    where: { id: auth.id },
    data: {
      deletedAt: now,
      deleteGracePeriodEndsAt: gracePeriodEndsAt,
      // Refresh token JTI invalidation (forçar logout pós-delete)
      currentRefreshTokenJti: null,
    },
  });

  // 4. Audit: scheduled
  auditLog({
    action: 'lgpd_deletion_scheduled',
    userId: auth.id,
    ipHash: input.ipHash,
    requestId: input.requestId,
    metadata: {
      deletedAt: now.toISOString(),
      gracePeriodEndsAt: gracePeriodEndsAt.toISOString(),
      graceDays: LGPD_DELETION_GRACE_DAYS,
    },
  });

  return {
    success: true,
    deletedAt: now,
    gracePeriodEndsAt,
    graceDays: LGPD_DELETION_GRACE_DAYS,
    cascadePreview,
  };
}

/**
 * CANCELAR soft delete (LGPD Art. 18 §3 — revogação).
 *
 * Zera `deletedAt` + `deleteGracePeriodEndsAt`. Válido apenas dentro do
 * grace period (após o grace, user já foi hard-deleted — não há o que
 * cancelar).
 *
 * @throws Error se user não estava em grace period.
 */
export async function cancelDeletion(
  input: CancelDeletionInput,
): Promise<CancelDeletionResult> {
  const user = await prisma.user.findUnique({
    where: { id: input.auth.id },
    select: { deletedAt: true, deleteGracePeriodEndsAt: true },
  });

  if (!user?.deletedAt || !user.deleteGracePeriodEndsAt) {
    throw new Error('Conta não está em processo de eliminação');
  }

  await prisma.user.update({
    where: { id: input.auth.id },
    data: {
      deletedAt: null,
      deleteGracePeriodEndsAt: null,
    },
  });

  auditLog({
    action: 'lgpd_deletion_cancelled',
    userId: input.auth.id,
    ipHash: input.ipHash,
    requestId: input.requestId,
    metadata: {
      previouslyScheduledFor: user.deleteGracePeriodEndsAt.toISOString(),
    },
  });

  return {
    cancelled: true,
    previouslyScheduledFor: user.deleteGracePeriodEndsAt,
  };
}

/**
 * HARD delete (Wave 8.3, refatorado em Wave 19.2).
 *
 * Refatoração: a lógica do Wave 8.3 (cascade count + delete) foi extraída
 * para cá. O route handler `/api/akasha/profile/[id]` agora delega para
 * esta função, garantindo paridade de comportamento + auditoria entre
 * self-service e admin.
 *
 * Permissão: caller precisa ser owner OU ADMIN (checado antes de chamar).
 *
 * @throws Error se permissão insuficiente ou user não existe.
 */
export async function hardDeleteAccount(
  input: HardDeleteInput,
): Promise<HardDeleteResult> {
  const { auth, actorRole, targetUserId } = input;

  const isOwner = auth.id === targetUserId;
  const isAdmin = actorRole === 'ADMIN';
  if (!isOwner && !isAdmin) {
    auditLog({
      action: 'profile_delete_failed',
      userId: auth.id,
      ipHash: input.ipHash,
      requestId: input.requestId,
      metadata: {
        targetUserId,
        reason: 'forbidden',
        actorRole,
      },
    });
    throw new Error('Acesso negado: você só pode deletar seu próprio perfil');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true },
  });

  if (!targetUser) {
    throw new Error('Perfil não encontrado');
  }

  // Snapshot ANTES do delete — Wave 8.3 não fazia, então cascaded ia zerado
  // no audit. Wave 19.2 corrige.
  const cascaded = await countCascadedData(targetUserId);

  auditLog({
    action: 'profile_delete_requested',
    userId: auth.id,
    ipHash: input.ipHash,
    requestId: input.requestId,
    metadata: {
      targetUserId,
      targetEmail: targetUser.email,
      isAdminOverride: !isOwner && isAdmin,
      cascaded,
    },
  });

  try {
    await prisma.user.delete({ where: { id: targetUserId } });
  } catch (err) {
    auditLog({
      action: 'profile_delete_failed',
      userId: auth.id,
      ipHash: input.ipHash,
      requestId: input.requestId,
      metadata: {
        targetUserId,
        reason: 'prisma_delete_error',
        error: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }

  auditLog({
    action: 'profile_delete_completed',
    userId: auth.id,
    ipHash: input.ipHash,
    requestId: input.requestId,
    metadata: {
      targetUserId,
      targetEmail: targetUser.email,
      isAdminOverride: !isOwner && isAdmin,
      cascaded,
    },
  });

  return { success: true, cascaded };
}

/**
 * Valida confirmação de senha via header `X-Confirm-Password`.
 * Compara contra `User.passwordHash` usando bcrypt.
 *
 * @returns true se senha confere; false caso contrário (ou se user não
 *          tem senha setada — ex.: login social).
 */
export async function verifyPasswordConfirmation(
  userId: string,
  providedPassword: string | null | undefined,
): Promise<{ ok: boolean; reason?: 'missing' | 'no_password_set' | 'mismatch' }> {
  if (!providedPassword || typeof providedPassword !== 'string') {
    return { ok: false, reason: 'missing' };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { ok: false, reason: 'no_password_set' };
  }

  const matches = await compare(providedPassword, user.passwordHash);
  return matches ? { ok: true } : { ok: false, reason: 'mismatch' };
}

// ===== Helpers internos =====

/**
 * Conta quantos registros seriam deletados em cascata para o userId.
 * Refatorado do Wave 8.3 para reuso entre soft + hard delete.
 */
export async function countCascadedData(userId: string) {
  const [
    birthChart,
    subscription,
    manifesto,
    creditEntries,
    dailyReadings,
    consultations,
    ritualCompletions,
    pushSubscriptions,
    connections,
    cycleSnapshots,
    areaHistory,
    exerciseCompletions,
    notifications,
    // Multi-tenant (zeladorId — User = zelador)
    caminhantes,
    caminhadas,
    sessoes,
    sessaoChunks,
    grimorioPessoal,
    notasConsulentes,
    mapasCalculo,
    pilar6Calculos,
    pilar7Calculos,
    pilar7Estagios,
  ] = await Promise.all([
    prisma.birthChart.count({ where: { userId } }),
    prisma.subscription.count({ where: { userId } }),
    prisma.manifesto.count({ where: { userId } }),
    prisma.creditEntry.count({ where: { userId } }),
    prisma.dailyReading.count({ where: { userId } }),
    prisma.consultation.count({ where: { userId } }),
    prisma.ritualCompletion.count({ where: { userId } }),
    prisma.pushSubscription.count({ where: { userId } }),
    prisma.connection.count({ where: { userId } }),
    prisma.cycleSnapshot.count({ where: { userId } }),
    prisma.areaHistoryEntry.count({ where: { userId } }),
    prisma.exerciseCompletion.count({ where: { userId } }),
    prisma.notification.count({ where: { userId } }),
    prisma.caminhante.count({ where: { zeladorId: userId } }),
    prisma.caminhada.count({ where: { zeladorId: userId } }),
    prisma.sessao.count({ where: { zeladorId: userId } }),
    prisma.sessaoChunk.count({ where: { zeladorId: userId } }),
    prisma.grimorioPessoal.count({ where: { zeladorId: userId } }),
    prisma.notasConsulente.count({ where: { zeladorId: userId } }),
    prisma.mapaCalculo.count({ where: { zeladorId: userId } }),
    prisma.pilar6Calculo.count({ where: { zeladorId: userId } }),
    prisma.pilar7Calculo.count({ where: { zeladorId: userId } }),
    prisma.pilar7Estagio.count({ where: { zeladorId: userId } }),
  ]);

  return {
    birthChart,
    subscription,
    manifesto,
    creditEntries,
    dailyReadings,
    consultations,
    ritualCompletions,
    pushSubscriptions,
    connections,
    cycleSnapshots,
    areaHistory,
    exerciseCompletions,
    notifications,
    caminhantes,
    caminhadas,
    sessoes,
    sessaoChunks,
    grimorioPessoal,
    notasConsulentes,
    mapasCalculo,
    pilar6Calculos,
    pilar7Calculos,
    pilar7Estagios,
  };
}
