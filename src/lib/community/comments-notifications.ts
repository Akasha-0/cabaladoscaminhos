// ============================================================================
// COMMENTS NOTIFICATIONS — MENTION notifications trigger + management
// ============================================================================
// Integra com o schema Prisma já existente (Notification table) usando o tipo
// 'MENTION' (já definido no enum NotificationType). Reusa createNotification()
// de `@/lib/community/notifications` quando possível.
//
// Funções:
//   - createMentionNotification(commentId, mentionedUserId, mentionerId)
//   - createMentionNotificationsForUsernames(...)  // batch via @usernames
//   - getMentionNotificationsForUser(userId, options?)
//   - markMentionRead(notificationId, userId)
//
// Estratégia de dedup:
//   - Mesmo (userId, commentId, type=MENTION) → não duplica
//   - Self-mention (@user mentionando a si mesmo) → bloqueado
//
// Best-effort: falhas não propagam para o caller (notificações são
// side-effects, não devem quebrar o fluxo de createComment).
// ============================================================================

import { Prisma } from '@prisma/client';

// ============================================================================
// CONSTANTS
// ============================================================================

export const MENTION_TYPE = 'MENTION' as const;
export const MENTION_ENTITY_TYPE = 'MENTION' as const;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

// ============================================================================
// ERRORS
// ============================================================================

export class MentionNotificationError extends Error {
  statusCode = 500;
  constructor(message: string) {
    super(message);
    this.name = 'MentionNotificationError';
  }
}

export class MentionNotificationNotFoundError extends Error {
  statusCode = 404;
  constructor(id: string) {
    super(`Mention notification não encontrada: ${id}`);
    this.name = 'MentionNotificationNotFoundError';
  }
}

export class MentionNotificationForbiddenError extends Error {
  statusCode = 403;
  constructor() {
    super('Você não tem permissão para esta notificação');
    this.name = 'MentionNotificationForbiddenError';
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface MentionNotification {
  id: string;
  userId: string;
  commentId: string;
  mentionerId: string;
  postId: string | null;
  read: boolean;
  createdAt: string;
}

export interface MentionNotificationOptions {
  limit?: number;
  offset?: number;
  /** Quando true, inclui já lidas. Default: false. */
  includeRead?: boolean;
}

export interface PaginatedMentionNotifications {
  notifications: MentionNotification[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================================================
// LAZY PRISMA
// ============================================================================

type NotificationPrismaLike = {
  notification: {
    findFirst: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<unknown[]>;
    count: (args: unknown) => Promise<number>;
    create: (args: unknown) => Promise<unknown>;
    createMany: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    updateMany: (args: unknown) => Promise<unknown>;
  };
  user: {
    findUnique: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<unknown[]>;
  };
};

let _prisma: NotificationPrismaLike | null = null;
async function getPrisma(): Promise<NotificationPrismaLike> {
  if (_prisma) return _prisma;
  const mod = await import('@/lib/prisma');
  _prisma = mod.prisma as unknown as NotificationPrismaLike;
  return _prisma;
}

export function _setPrismaForTesting(mock: NotificationPrismaLike | null): void {
  _prisma = mock;
}

// ============================================================================
// HELPERS
// ============================================================================

type RawNotification = {
  id: string;
  userId: string;
  type: string;
  actorId: string | null;
  commentId: string | null;
  postId: string | null;
  entityType: string | null;
  entityId: string | null;
  groupKey: string | null;
  count: number;
  read: boolean;
  createdAt: Date;
};

function toDto(raw: RawNotification): MentionNotification {
  return {
    id: raw.id,
    userId: raw.userId,
    commentId: raw.commentId ?? '',
    mentionerId: raw.actorId ?? '',
    postId: raw.postId,
    read: raw.read,
    createdAt: raw.createdAt.toISOString(),
  };
}

function clampLimit(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_PAGE_LIMIT;
  return Math.min(Math.floor(raw), MAX_PAGE_LIMIT);
}

// ============================================================================
// CREATE — single
// ============================================================================

/**
 * Cria UMA mention notification (userId único).
 * Idempotente: se já existe (userId, commentId, type=MENTION), noop.
 *
 * Bloqueia self-mention: se `mentionerId === userId`, retorna null sem criar.
 *
 * @returns MentionNotification criada ou null (se idempotente/self-blocked).
 */
export async function createMentionNotification(input: {
  commentId: string;
  mentionedUserId: string;
  mentionerId: string;
  postId?: string | null;
}): Promise<MentionNotification | null> {
  if (!input.commentId || !input.mentionedUserId || !input.mentionerId) {
    throw new MentionNotificationError(
      'commentId, mentionedUserId e mentionerId são obrigatórios'
    );
  }

  // Self-mention guard
  if (input.mentionerId === input.mentionedUserId) {
    return null;
  }

  const prisma = await getPrisma();

  // Dedup check
  const existing = await prisma.notification.findFirst({
    where: {
      userId: input.mentionedUserId,
      commentId: input.commentId,
      type: MENTION_TYPE,
    },
    select: { id: true, userId: true, actorId: true, commentId: true,
              postId: true, read: true, createdAt: true, type: true,
              entityType: true, entityId: true, groupKey: true, count: true },
  }) as RawNotification | null;

  if (existing) {
    return toDto(existing);
  }

  const created = await prisma.notification.create({
    data: {
      userId: input.mentionedUserId,
      type: MENTION_TYPE,
      actorId: input.mentionerId,
      commentId: input.commentId,
      postId: input.postId ?? null,
      entityType: MENTION_ENTITY_TYPE,
      entityId: input.commentId,
      groupKey: `comment:${input.commentId}:MENTION`,
      payload: {
        source: 'mention',
      } as Prisma.InputJsonValue,
    },
    select: { id: true, userId: true, actorId: true, commentId: true,
              postId: true, read: true, createdAt: true, type: true,
              entityType: true, entityId: true, groupKey: true, count: true },
  }) as RawNotification;

  return toDto(created);
}

// ============================================================================
// CREATE — batch (from usernames)
// ============================================================================

/**
 * Dado um commentId + lista de usernames mencionados, resolve cada username
 * para userId e cria notifications. Usado por createComment/editComment.
 *
 * Retorna as notifications criadas (ou null para self-mentions/dedup hits).
 * Falhas em usernames individuais são logadas mas não quebram o batch.
 */
export async function createMentionNotificationsForUsernames(input: {
  commentId: string;
  postId: string;
  mentionerId: string;
  usernames: string[];
}): Promise<MentionNotification[]> {
  if (!Array.isArray(input.usernames) || input.usernames.length === 0) {
    return [];
  }

  // Filtra termos sagrados (segurança)
  const { isSacredTerm } = await import('./comments-mentions');
  const safeUsernames = input.usernames.filter((u) => {
    if (!u || typeof u !== 'string') return false;
    if (isSacredTerm(u)) return false;
    return true;
  });

  if (safeUsernames.length === 0) return [];

  let prisma: NotificationPrismaLike;
  try {
    prisma = await getPrisma();
  } catch {
    return [];
  }

  // Resolve usernames → userIds (tenta supabaseUserId e id)
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { supabaseUserId: { in: safeUsernames } },
        { id: { in: safeUsernames } },
      ],
    },
    select: { id: true, supabaseUserId: true },
  }) as Array<{ id: string; supabaseUserId: string | null }>;

  // Map username → userId
  const usernameToUserId = new Map<string, string>();
  for (const u of users) {
    if (u.supabaseUserId) usernameToUserId.set(u.supabaseUserId, u.id);
    usernameToUserId.set(u.id, u.id);
  }

  const created: MentionNotification[] = [];

  for (const username of safeUsernames) {
    const userId = usernameToUserId.get(username);
    if (!userId) continue;
    if (userId === input.mentionerId) continue; // self-mention block

    try {
      const result = await createMentionNotification({
        commentId: input.commentId,
        mentionedUserId: userId,
        mentionerId: input.mentionerId,
        postId: input.postId,
      });
      if (result) created.push(result);
    } catch {
      // best-effort
    }
  }

  return created;
}

// ============================================================================
// FETCH
// ============================================================================

/**
 * Lista mention notifications para um user, paginadas.
 *
 * Default: apenas não-lidas, ordem cronológica desc.
 */
export async function getMentionNotificationsForUser(
  userId: string,
  options: MentionNotificationOptions = {}
): Promise<PaginatedMentionNotifications> {
  if (!userId) {
    throw new MentionNotificationError('userId é obrigatório');
  }

  const limit = clampLimit(options.limit ?? DEFAULT_PAGE_LIMIT);
  const offset = Math.max(0, options.offset ?? 0);

  const prisma = await getPrisma();

  const where: Prisma.NotificationWhereInput = {
    userId,
    type: MENTION_TYPE,
  };

  if (!options.includeRead) {
    where.read = false;
  }

  const [rows, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
      skip: offset,
      select: { id: true, userId: true, actorId: true, commentId: true,
                postId: true, read: true, createdAt: true, type: true,
                entityType: true, entityId: true, groupKey: true, count: true },
    }) as Promise<RawNotification[]>,
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId, type: MENTION_TYPE, read: false },
    }),
  ]);

  const notifications = rows.map(toDto);

  return {
    notifications,
    total,
    unreadCount,
    limit,
    offset,
    hasMore: offset + notifications.length < total,
  };
}

/**
 * Conta quantas mentions não-lidas um user tem.
 */
export async function getUnreadMentionCount(userId: string): Promise<number> {
  if (!userId) return 0;
  const prisma = await getPrisma();
  return await prisma.notification.count({
    where: { userId, type: MENTION_TYPE, read: false },
  });
}

// ============================================================================
// MARK READ
// ============================================================================

/**
 * Marca UMA mention notification como lida. Verifica ownership.
 *
 * Idempotente: marcar já-lida é noop (retorna a notification atual).
 */
export async function markMentionRead(input: {
  notificationId: string;
  userId: string;
}): Promise<MentionNotification> {
  if (!input.notificationId || !input.userId) {
    throw new MentionNotificationError(
      'notificationId e userId são obrigatórios'
    );
  }

  const prisma = await getPrisma();

  const existing = await prisma.notification.findFirst({
    where: {
      id: input.notificationId,
      type: MENTION_TYPE,
    },
    select: { id: true, userId: true, actorId: true, commentId: true,
              postId: true, read: true, createdAt: true, type: true,
              entityType: true, entityId: true, groupKey: true, count: true },
  }) as RawNotification | null;

  if (!existing) {
    throw new MentionNotificationNotFoundError(input.notificationId);
  }
  if (existing.userId !== input.userId) {
    throw new MentionNotificationForbiddenError();
  }

  if (existing.read) {
    return toDto(existing);
  }

  const updated = await prisma.notification.update({
    where: { id: input.notificationId },
    data: { read: true },
    select: { id: true, userId: true, actorId: true, commentId: true,
              postId: true, read: true, createdAt: true, type: true,
              entityType: true, entityId: true, groupKey: true, count: true },
  }) as RawNotification;

  return toDto(updated);
}

/**
 * Marca TODAS as mention notifications do user como lidas (bulk).
 * Retorna quantas foram atualizadas.
 */
export async function markAllMentionsRead(userId: string): Promise<number> {
  if (!userId) return 0;
  const prisma = await getPrisma();
  const result = await prisma.notification.updateMany({
    where: { userId, type: MENTION_TYPE, read: false },
    data: { read: true },
  }) as { count: number };
  return result.count;
}

// ============================================================================
// AUDIT
// ============================================================================

export interface MentionNotificationAudit {
  totalCreated: number;
  totalUnread: number;
  totalUsers: number;
  hasMentionType: boolean;
}

let _auditCache: MentionNotificationAudit | null = null;

/**
 * Auditoria rápida do sistema de mention notifications.
 * Útil para health checks e dashboard.
 */
export async function auditMentionNotifications(): Promise<MentionNotificationAudit> {
  if (_auditCache) return _auditCache;

  const prisma = await getPrisma();

  const [totalCreated, totalUnread, userIds] = await Promise.all([
    prisma.notification.count({ where: { type: MENTION_TYPE } }),
    prisma.notification.count({ where: { type: MENTION_TYPE, read: false } }),
    prisma.notification.findMany({
      where: { type: MENTION_TYPE },
      select: { userId: true },
      distinct: ['userId'],
    }) as Promise<Array<{ userId: string }>>,
  ]);

  _auditCache = {
    totalCreated,
    totalUnread,
    totalUsers: userIds.length,
    hasMentionType: totalCreated > 0,
  };
  return _auditCache;
}

/** Limpa cache de auditoria (para testes). */
export function _resetMentionAuditCache(): void {
  _auditCache = null;
}

// ============================================================================
// PUBLIC EXPORTS
// ============================================================================

export const __allExports = {
  // functions
  createMentionNotification,
  createMentionNotificationsForUsernames,
  getMentionNotificationsForUser,
  getUnreadMentionCount,
  markMentionRead,
  markAllMentionsRead,
  auditMentionNotifications,
  _resetMentionAuditCache,
  _setPrismaForTesting,
  // errors
  MentionNotificationError,
  MentionNotificationNotFoundError,
  MentionNotificationForbiddenError,
  // constants
  MENTION_TYPE,
  MENTION_ENTITY_TYPE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} as const;