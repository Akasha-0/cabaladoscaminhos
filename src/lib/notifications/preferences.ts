// ============================================================================
// NOTIFICATIONS — Preferências do usuário
// ============================================================================
// Resolve se uma notificação deve ser entregue em cada canal (in-app, email,
// push). Defaults conservadores: in-app=true, email=true, push=false.
// ============================================================================

import type { NotificationType } from '@prisma/client';
import type { NotificationChannel } from '@prisma/client';

// ============================================================================
// Defaults (LGPD-friendly: opt-in pra push, opt-out pra in-app e email)
// ============================================================================

export const DEFAULT_PREFERENCES: Record<
  NotificationType,
  { inApp: boolean; email: boolean; push: boolean; weeklyDigest: boolean }
> = {
  // Social graph
  LIKE: { inApp: true, email: false, push: false, weeklyDigest: true },
  COMMENT: { inApp: true, email: true, push: false, weeklyDigest: false },
  POST_REPLY: { inApp: true, email: true, push: false, weeklyDigest: false },
  FOLLOW: { inApp: true, email: false, push: false, weeklyDigest: true },
  MENTION: { inApp: true, email: true, push: false, weeklyDigest: false },
  // Community
  GROUP_INVITE: { inApp: true, email: true, push: false, weeklyDigest: false },
  GROUP_POST: { inApp: true, email: false, push: false, weeklyDigest: true },
  GROUP_ROLE_CHANGE: { inApp: true, email: true, push: false, weeklyDigest: false },
  // Content
  ARTICLE_RECOMMENDATION: { inApp: true, email: true, push: false, weeklyDigest: true },
  ARTICLE_PUBLISHED: { inApp: true, email: false, push: false, weeklyDigest: true },
  // System
  SYSTEM_ALERT: { inApp: true, email: true, push: false, weeklyDigest: false },
  MODERATION_ACTION: { inApp: true, email: true, push: false, weeklyDigest: false },
  DIGEST_WEEKLY: { inApp: false, email: true, push: false, weeklyDigest: false },
};

export type ResolvedPreferences = Record<NotificationType, {
  inApp: boolean;
  email: boolean;
  push: boolean;
  weeklyDigest: boolean;
}>;

// ============================================================================
// Tipos públicos
// ============================================================================

export interface PreferenceRow {
  type: NotificationType;
  inApp: boolean;
  email: boolean;
  push: boolean;
  weeklyDigest: boolean;
}

/**
 * Resolve as preferências finais para um usuário, mesclando defaults com
 * overrides do DB.
 *
 * @param rows Linhas de NotificationPreference do DB (sem defaults aplicados)
 * @returns Mapa completo por tipo (sempre todos os tipos presentes)
 */
export function resolvePreferences(rows: PreferenceRow[]): ResolvedPreferences {
  const out = {} as ResolvedPreferences;

  for (const type of Object.keys(DEFAULT_PREFERENCES) as NotificationType[]) {
    const row = rows.find((r) => r.type === type);
    const def = DEFAULT_PREFERENCES[type];
    out[type] = row
      ? {
          inApp: row.inApp,
          email: row.email,
          push: row.push,
          weeklyDigest: row.weeklyDigest,
        }
      : { ...def };
  }

  return out;
}

/**
 * Decide se a notificação deve ser entregue em um canal específico.
 *
 * @returns true se deve entregar, false se deve pular (preferência off)
 */
export function shouldDeliver(
  prefs: ResolvedPreferences,
  type: NotificationType,
  channel: NotificationChannel
): boolean {
  const p = prefs[type];
  if (!p) return true; // tipo desconhecido → entrega (fail-open)
  return channel === 'IN_APP' ? p.inApp : channel === 'EMAIL' ? p.email : p.push;
}
