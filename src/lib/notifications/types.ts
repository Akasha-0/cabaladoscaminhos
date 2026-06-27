// ============================================================================
// NOTIFICATIONS — Tipos compartilhados
// ============================================================================
// Camada de tipos compartilhada entre o trigger system, API, hooks e UI.
// ============================================================================

import type { NotificationType, EntityType } from '@prisma/client';

// ============================================================================
// Re-exports de tipos do Prisma (fonte da verdade)
// ============================================================================

export type { NotificationType, EntityType } from '@prisma/client';

// ============================================================================
// DTOs (API shape)
// ============================================================================

export interface NotificationActorSnapshot {
  id: string;
  displayName: string;
  handle: string | null;
  avatarUrl: string | null;
}

export interface NotificationPayload {
  // Texto pré-renderizado pra UI (ex: "João curtiu seu post")
  preview?: string;
  // Texto extra (ex: conteúdo do comentário que gerou a notif)
  excerpt?: string;
  // Deep-link interno (ex: "/post/abc")
  link?: string;
  // URL externo opcional (artigo, etc)
  externalUrl?: string;
  // Data arbitrária por tipo
  [key: string]: unknown;
}

export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  actorId: string | null;
  actorSnapshot: NotificationActorSnapshot | null;
  entityType: EntityType | null;
  entityId: string | null;
  postId: string | null;
  commentId: string | null;
  groupId: string | null;
  articleId: string | null;
  groupKey: string | null;
  count: number;
  payload: NotificationPayload | null;
  read: boolean;
  readAt: string | null;
  emailedAt: string | null;
  pushedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferenceDto {
  type: NotificationType;
  inApp: boolean;
  email: boolean;
  push: boolean;
  weeklyDigest: boolean;
}

export interface PaginatedNotifications {
  items: NotificationDto[];
  nextCursor: string | null;
  unreadCount: number;
}

// ============================================================================
// Trigger input (shape interno usado pelos triggers)
// ============================================================================

export interface CreateNotificationInput {
  userId: string;              // recipient
  type: NotificationType;
  actorId?: string | null;
  entityType?: EntityType;
  entityId?: string;
  postId?: string | null;
  commentId?: string | null;
  groupId?: string | null;
  articleId?: string | null;
  groupKey?: string | null;    // upsert key (batch)
  payload?: NotificationPayload | null;
  actorSnapshot?: NotificationActorSnapshot | null;
  // Respeitar preferências (default: true). Setar false para system alerts
  // críticos que devem ser entregues mesmo se o user desabilitou o tipo.
  respectPreferences?: boolean;
}

// ============================================================================
// Constantes
// ============================================================================

/** Tipos que NUNCA devem ser batched (cada evento gera 1 notif). */
export const NEVER_BATCH_TYPES = new Set<NotificationType>([
  'MENTION',
  'POST_REPLY',
  'COMMENT',
  'FOLLOW',
  'GROUP_INVITE',
  'GROUP_ROLE_CHANGE',
  'SYSTEM_ALERT',
  'MODERATION_ACTION',
]);

/** Tipos elegíveis para batching (ex: 5 likes → 1 notif "+5 likes"). */
export const BATCHABLE_TYPES = new Set<NotificationType>([
  'LIKE',
  'GROUP_POST',
  'ARTICLE_PUBLISHED',
]);

/** Tipos que representam alertas críticos — sempre enviados (ignora prefs). */
export const CRITICAL_TYPES = new Set<NotificationType>([
  'SYSTEM_ALERT',
  'MODERATION_ACTION',
]);
