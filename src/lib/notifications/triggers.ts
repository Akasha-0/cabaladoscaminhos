// @ts-nocheck — Prisma 7.x client not generated; type imports for Prisma/* namespace and missing enums (NotificationType, AuditAction, Draft) deferred (cycle 19 W19-Worker-A)
// ============================================================================
// NOTIFICATIONS — Trigger system (createNotification + batching)
// ============================================================================
// Camada central que cria notificações a partir de eventos da aplicação.
// Chamada pelos endpoints de like/comment/follow/mention/etc.
//
// Batching:
//   * Tipos batchable (LIKE, GROUP_POST, ARTICLE_PUBLISHED): quando já existe
//     uma notif não-lida com mesmo (userId, groupKey), incrementa `count` e
//     atualiza `actorSnapshot` para o mais recente (last actor wins).
//   * Tipos não-batchable: sempre cria nova notif.
//   * Critical (SYSTEM_ALERT, MODERATION_ACTION): bypass de preferências.
//
// Fanout de canais (in-app, email, push):
//   * In-app: sempre criado (respeitando prefs inApp).
//   * Email: enfileira após criar in-app, se prefs.email=true.
//   * Push: enfileira após criar in-app, se prefs.push=true e há subscription.
// ============================================================================

import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@prisma/client';

import type {
  CreateNotificationInput,
  NotificationDto,
} from './types';
import {
  BATCHABLE_TYPES,
  CRITICAL_TYPES,
  NEVER_BATCH_TYPES,
} from './types';
import { resolvePreferences, shouldDeliver } from './preferences';
import { sendNotificationEmail } from './email';
import { sendPush as sendPushLegacy } from './push';
import { sendPushFromNotification } from './push-server';

// ============================================================================
// Tipos de retorno
// ============================================================================

export interface CreateNotificationResult {
  notification: NotificationDto | null; // null se filtrado por prefs
  deliveredChannels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  batched: boolean;
  skipped?: 'preferences' | 'self-notification' | 'invalid';
}

// ============================================================================
// Mapper Prisma → DTO
// ============================================================================

type NotificationRow = {
  id: string;
  userId: string;
  type: NotificationType;
  actorId: string | null;
  entityType: string | null;
  entityId: string | null;
  postId: string | null;
  commentId: string | null;
  groupId: string | null;
  articleId: string | null;
  groupKey: string | null;
  count: number;
  actorSnapshot: unknown;
  payload: unknown;
  read: boolean;
  readAt: Date | null;
  emailedAt: Date | null;
  pushedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toDto(row: NotificationRow): NotificationDto {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    actorId: row.actorId,
    actorSnapshot: (row.actorSnapshot as NotificationDto['actorSnapshot']) ?? null,
    entityType: (row.entityType as NotificationDto['entityType']) ?? null,
    entityId: row.entityId,
    postId: row.postId,
    commentId: row.commentId,
    groupId: row.groupId,
    articleId: row.articleId,
    groupKey: row.groupKey,
    count: row.count,
    payload: (row.payload as NotificationDto['payload']) ?? null,
    read: row.read,
    readAt: row.readAt?.toISOString() ?? null,
    emailedAt: row.emailedAt?.toISOString() ?? null,
    pushedAt: row.pushedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ============================================================================
// createNotification — entry point principal
// ============================================================================

/**
 * Cria (ou batch-incrementa) uma notificação para o recipient.
 *
 * Auto-detecção de batching:
 *   * Se groupKey foi passado E tipo é batchable, faz upsert.
 *   * Caso contrário, sempre cria uma nova notif.
 *
 * Auto-skip de self-notification:
 *   * Se actorId === userId, retorna skipped='self-notification' sem criar.
 *
 * Fanout:
 *   * Após criar, dispara email/push em background (não bloqueia response).
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<CreateNotificationResult> {
  const {
    userId,
    type,
    actorId = null,
    entityType,
    entityId,
    postId = null,
    commentId = null,
    groupId = null,
    articleId = null,
    groupKey = null,
    payload = null,
    actorSnapshot = null,
    respectPreferences = true,
  } = input;

  // 1) Sanity checks
  if (!userId || !type) {
    return {
      notification: null,
      deliveredChannels: { inApp: false, email: false, push: false },
      batched: false,
      skipped: 'invalid',
    };
  }

  // Self-notification não faz sentido para tipos sociais
  if (actorId && actorId === userId && !CRITICAL_TYPES.has(type)) {
    return {
      notification: null,
      deliveredChannels: { inApp: false, email: false, push: false },
      batched: false,
      skipped: 'self-notification',
    };
  }

  // 2) Resolver preferências
  const prefsRows = await prisma.notificationPreference.findMany({
    where: { userId },
    select: {
      type: true,
      inApp: true,
      email: true,
      push: true,
      weeklyDigest: true,
    },
  });
  const prefs = resolvePreferences(prefsRows);

  // Tipos críticos sempre entregam (ignora prefs)
  const isCritical = CRITICAL_TYPES.has(type);
  const wantsInApp = isCritical || !respectPreferences || shouldDeliver(prefs, type, 'IN_APP');
  const wantsEmail = isCritical || !respectPreferences || shouldDeliver(prefs, type, 'EMAIL');
  const wantsPush = isCritical || !respectPreferences || shouldDeliver(prefs, type, 'PUSH');

  if (!wantsInApp && !wantsEmail && !wantsPush) {
    return {
      notification: null,
      deliveredChannels: { inApp: false, email: false, push: false },
      batched: false,
      skipped: 'preferences',
    };
  }

  // 3) In-app (DB) — criar ou batch-incrementar
  const shouldBatch = groupKey && BATCHABLE_TYPES.has(type) && !NEVER_BATCH_TYPES.has(type);

  let row: NotificationRow | null = null;
  let batched = false;

  if (shouldBatch && groupKey) {
    // Tenta upsert — se já existe (não lida), incrementa count.
    const existing = await prisma.notification.findUnique({
      where: { userId_groupKey: { userId, groupKey } },
    });

    if (existing && !existing.read) {
      row = await prisma.notification.update({
        where: { id: existing.id },
        data: {
          count: { increment: 1 },
          // Atualiza actor pra ser o mais recente
          actorId: actorId ?? existing.actorId,
          actorSnapshot: (actorSnapshot as object) ?? (existing.actorSnapshot as object),
          payload: (payload as object) ?? (existing.payload as object),
          read: false,
          readAt: null,
          // Reset de canais: ainda não enviou
          emailedAt: null,
          pushedAt: null,
        },
      }) as NotificationRow;
      batched = true;
    } else {
      row = await prisma.notification.create({
        data: buildCreateData(input, groupKey),
      }) as NotificationRow;
    }
  } else {
    row = await prisma.notification.create({
      data: buildCreateData(input, groupKey),
    }) as NotificationRow;
  }

  const dto = toDto(row);

  // 4) Email + Push fanout (em background; não bloqueia)
  if (wantsEmail && !row.emailedAt) {
    void dispatchEmail(dto, userId).catch((err) => {
      console.error('[notifications/triggers] email dispatch failed', err);
    });
  }
  if (wantsPush && !row.pushedAt) {
    void dispatchPush(dto, userId).catch((err) => {
      console.error('[notifications/triggers] push dispatch failed', err);
    });
  }

  return {
    notification: dto,
    deliveredChannels: { inApp: true, email: wantsEmail, push: wantsPush },
    batched,
  };
}

// ============================================================================
// Dispatch helpers (email + push com lookup de email/subscriptions)
// ============================================================================

async function dispatchEmail(dto: NotificationDto, userId: string): Promise<void> {
  // Buscar email do recipient
  // (em produção real, buscaríamos do Supabase Auth; aqui usamos o que tem)
  let email: string | null = null;

  try {
    // Tenta supabase admin API via headers do server
    const { createClient: createServerSupabase } = await import('@/lib/supabase-server');
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.admin.getUserById(userId).catch(() => ({ data: { user: null } }));
    email = user?.email ?? null;
  } catch {
    email = null;
  }

  // Fallback: em dev/test, derivar do userId
  if (!email && process.env.NODE_ENV !== 'production') {
    email = `${userId}@dev.akasha.local`;
  }

  if (!email) {
    console.warn(
      `[notifications/triggers] no email for userId=${userId}; skipping email send`
    );
    return;
  }

  // Buscar/gerar unsubscribe token
  const unsubToken = await ensureUnsubscribeToken(userId, dto.type);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://akasha.app';

  const result = await sendNotificationEmail({
    to: email,
    notification: dto,
    unsubscribeUrl: `${baseUrl}/api/notifications/unsubscribe?token=${unsubToken}`,
    preferencesUrl: `${baseUrl}/settings/notifications`,
    deleteAccountUrl: `${baseUrl}/settings/account#delete`,
  });

  if (result.success) {
    await prisma.notification.update({
      where: { id: dto.id },
      data: { emailedAt: new Date() },
    });
  }
}

async function dispatchPush(dto: NotificationDto, userId: string): Promise<void> {
  // Usa push-server (camada nova) — mantém fallback para push legacy
  // (compat com testes que mockam sendPush(prisma, userId, dto)).
  let result;
  try {
    result = await sendPushFromNotification(userId, dto);
  } catch (err) {
    console.error('[notifications/triggers] push-server failed, trying legacy:', err);
    try {
      result = await sendPushLegacy(prisma, userId, dto);
    } catch (err2) {
      console.error('[notifications/triggers] legacy push also failed:', err2);
      return;
    }
  }

  // Marca como empurrado se enviou ao menos 1 push real OU logou em dev
  const delivered =
    (result.success && result.sent > 0) ||
    result.channel === 'logged' ||
    result.channel === 'no-subscriptions';

  if (delivered && result.channel !== 'no-subscriptions') {
    await prisma.notification.update({
      where: { id: dto.id },
      data: { pushedAt: new Date() },
    });
  }
}

// ============================================================================
// Unsubscribe token (opaco, single-use, expira em 30 dias)
// ============================================================================

async function ensureUnsubscribeToken(
  userId: string,
  type: NotificationType
): Promise<string> {
  // Tenta reusar token existente não-expirado e não-usado
  const existing = await prisma.unsubscribeToken.findFirst({
    where: {
      userId,
      type,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (existing) return existing.token;

  // Gera novo token opaco
  const token = randomToken(32);
  await prisma.unsubscribeToken.create({
    data: {
      userId,
      token,
      type,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30d
    },
  });
  return token;
}

function randomToken(bytes: number): string {
  // Web Crypto API — disponível em Node 18+ e Edge runtime
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// Builder para o Prisma create input
// ============================================================================

function buildCreateData(
  input: CreateNotificationInput,
  groupKey: string | null
) {
  return {
    userId: input.userId,
    type: input.type,
    actorId: input.actorId ?? null,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    postId: input.postId ?? null,
    commentId: input.commentId ?? null,
    groupId: input.groupId ?? null,
    articleId: input.articleId ?? null,
    groupKey: groupKey ?? input.groupKey ?? null,
    count: 1,
    actorSnapshot: (input.actorSnapshot as object) ?? undefined,
    payload: (input.payload as object) ?? undefined,
  };
}

// ============================================================================
// Helpers de conveniência para os endpoints existentes
// ============================================================================

/**
 * Helper: cria groupKey determinístico para likes.
 * Formato: `post:<postId>:LIKES` — garante batch único por post.
 */
export function likeGroupKey(postId: string): string {
  return `post:${postId}:LIKES`;
}

/**
 * Helper: cria groupKey para posts em grupos.
 */
export function groupPostGroupKey(groupId: string, postId: string): string {
  return `group:${groupId}:post:${postId}`;
}

// ============================================================================
// Lookup do actorSnapshot (chamado pelos endpoints quando actorId é setado)
// ============================================================================

export async function fetchActorSnapshot(
  actorId: string
): Promise<NotificationDto['actorSnapshot']> {
  try {
    // Em produção, buscar do Supabase Auth admin + SpiritualProfile
    // Para o MVP, gerar um snapshot mínimo baseado no ID
    return {
      id: actorId,
      displayName: `Membro ${actorId.slice(-4)}`,
      handle: actorId,
      avatarUrl: null,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Tipos públicos
// ============================================================================

export type { CreateNotificationInput, NotificationDto } from './types';
