/**
 * Notification preferences — D-048 (Wave 18.2).
 *
 * Helper central para ler/escrever preferências de notificação por user.
 *
 * Default behavior: se o user NÃO tem uma row de preference para um tipo,
 * a preferência é considerada `enabled = true` (opt-out model).
 *
 * Quem chama este helper:
 *   - `createNotification()` em ./create.ts — checa se user opt-out
 *     do tipo antes de inserir na tabela `notifications`.
 *   - API routes GET/PATCH em /api/notifications/preferences.
 *
 * Quem NÃO chama: UI (busca via API route; prefetch em server component).
 */

import { prisma } from '@/lib/infrastructure/prisma';
import type { NotificationType } from '@prisma/client';

export const ALL_NOTIFICATION_TYPES: readonly NotificationType[] = [
  'DIARIO',
  'MENTOR',
  'CONEXOES',
  'CREDITS',
  'SYSTEM',
] as const;

/**
 * DTO serializado que a API retorna. Mesma forma da model do schema
 * mas com tipos serializáveis (Date → ISO string) para passar pelo
 * Server Component boundary sem hydration warnings.
 */
export interface NotificationPreferenceDTO {
  type: NotificationType;
  enabled: boolean;
  updatedAt: string; // ISO 8601
}

/**
 * Lê TODAS as preferências do user. Para tipos sem row persistida,
 * retorna enabled: true (default opt-out model).
 *
 * Performance: 1 query (findMany) + memoize em cima se virar hot path.
 */
export async function getUserPreferences(
  userId: string
): Promise<NotificationPreferenceDTO[]> {
  if (!userId) {
    throw new Error('userId é obrigatório');
  }

  const rows = await prisma.notificationPreference.findMany({
    where: { userId },
    select: { type: true, enabled: true, updatedAt: true },
  });

  // Index por type para merge O(1) com defaults
  const byType = new Map(rows.map((r) => [r.type, r]));

  return ALL_NOTIFICATION_TYPES.map((type) => {
    const row = byType.get(type);
    if (row) {
      return {
        type,
        enabled: row.enabled,
        updatedAt: row.updatedAt.toISOString(),
      };
    }
    // Default: enabled (opt-out model). updatedAt = epoch zero.
    return {
      type,
      enabled: true,
      updatedAt: '1970-01-01T00:00:00.000Z',
    };
  });
}

/**
 * Seta (upsert) a preferência de um tipo para um user.
 * Retorna o DTO atualizado.
 *
 * @throws Error se userId vazio ou type inválido.
 */
export async function setPreference(
  userId: string,
  type: NotificationType,
  enabled: boolean
): Promise<NotificationPreferenceDTO> {
  if (!userId) {
    throw new Error('userId é obrigatório');
  }
  if (!ALL_NOTIFICATION_TYPES.includes(type)) {
    throw new Error(`type inválido: ${type}`);
  }

  const row = await prisma.notificationPreference.upsert({
    where: { userId_type: { userId, type } },
    create: { userId, type, enabled },
    update: { enabled },
    select: { type: true, enabled: true, updatedAt: true },
  });

  return {
    type: row.type,
    enabled: row.enabled,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Checagem rápida: user tem `type` desativado?
 *
 * Usado por `createNotification()` ANTES do insert. Se retorna false
 * (type está desativado), o caller deve skip a criação (return null).
 *
 * Performance: 1 query. Pode ser cacheado em memória se virar hot path,
 * mas por enquanto cada call é OK — Volume é baixo (≤ 5 calls/user/day).
 *
 * Default = true (sem row → habilitado, opt-out model).
 */
export async function isTypeEnabled(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  if (!userId) return true; // safety: sem user → assume habilitado
  if (!ALL_NOTIFICATION_TYPES.includes(type)) return true; // safety

  const row = await prisma.notificationPreference.findUnique({
    where: { userId_type: { userId, type } },
    select: { enabled: true },
  });

  // Sem row = default habilitado (opt-out)
  return row?.enabled ?? true;
}
