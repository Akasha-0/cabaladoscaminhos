// ============================================================================
// NOTIFICATIONS — Web Push (RFC 8030)
// ============================================================================
// Wrapper sobre web-push com persistência via Prisma. NÃO envia por padrão —
// o usuário precisa explicitamente ter `push: true` na preferência do tipo.
//
// VAPID keys: gere com `npx web-push generate-vapid-keys` e armazene em
// VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY. Em dev sem chaves, console.log.
// ============================================================================

import type { NotificationDto, NotificationType } from './types';

// ============================================================================
// Tipos públicos
// ============================================================================

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionInput {
  userId: string;
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface PushSubscriptionRow {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string | null;
  active: boolean;
  lastSentAt: Date | null;
  lastError: string | null;
  createdAt: Date;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  url?: string;
}

export interface PushSendResult {
  success: boolean;
  sent: number;
  failed: number;
  errors?: string[];
  channel: 'sent' | 'logged' | 'error' | 'no-subscriptions' | 'disabled';
}

// ============================================================================
// VAPID configuration
// ============================================================================

function getVapidKeys() {
  return {
    publicKey: process.env.VAPID_PUBLIC_KEY ?? '',
    privateKey: process.env.VAPID_PRIVATE_KEY ?? '',
    subject: process.env.VAPID_SUBJECT ?? 'mailto:admin@akasha.app',
  };
}

export function getVapidPublicKey(): string {
  return getVapidKeys().publicKey;
}

export function isVapidConfigured(): boolean {
  const k = getVapidKeys();
  return Boolean(k.publicKey && k.privateKey);
}

// ============================================================================
// Subscription management (Prisma persist)
// ============================================================================

/**
 * Cria ou atualiza uma subscription push. Deduplica por endpoint.
 */
export async function saveSubscription(
  prisma: PushPrismaLike,
  input: PushSubscriptionInput
): Promise<{ id: string; created: boolean }> {
  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: input.endpoint },
    select: { id: true, userId: true },
  });

  if (existing) {
    // Se mudou de usuário, atualiza; senão só reativa
    await prisma.pushSubscription.update({
      where: { id: existing.id },
      data: {
        userId: input.userId,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
        userAgent: input.userAgent ?? null,
        ipAddress: input.ipAddress ?? null,
        active: true,
        lastError: null,
      },
    });
    return { id: existing.id, created: false };
  }

  const row = await prisma.pushSubscription.create({
    data: {
      userId: input.userId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent: input.userAgent ?? null,
      ipAddress: input.ipAddress ?? null,
      active: true,
    },
  });
  return { id: row.id, created: true };
}

/**
 * Remove subscription por endpoint (chamado quando o browser desinscreve).
 */
export async function removeSubscription(
  prisma: PushPrismaLike,
  endpoint: string
): Promise<boolean> {
  try {
    await prisma.pushSubscription.delete({ where: { endpoint } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Lista subscriptions ativas de um usuário.
 */
export async function listSubscriptions(
  prisma: PushPrismaLike,
  userId: string
): Promise<PushSubscriptionRow[]> {
  return prisma.pushSubscription.findMany({
    where: { userId, active: true },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================================================
// Send
// ============================================================================

/**
 * Envia push para todas as subscriptions ativas do usuário. Retorna resultado
 * agregado; subscriptions inválidas (410) são desativadas automaticamente.
 *
 * Em dev sem VAPID, console.log ao invés de enviar.
 */
export async function sendPush(
  prisma: PushPrismaLike,
  userId: string,
  notification: NotificationDto
): Promise<PushSendResult> {
  const subs = await listSubscriptions(prisma, userId);
  if (subs.length === 0) {
    return { success: true, sent: 0, failed: 0, channel: 'no-subscriptions' };
  }

  // Dev mode — log ao invés de enviar
  if (!isVapidConfigured() || process.env.NODE_ENV !== 'production') {
     
    console.log('[notifications/push] (dev) would send:', {
      userId,
      notificationId: notification.id,
      type: notification.type,
      subscriptionCount: subs.length,
    });
    return {
      success: true,
      sent: 0,
      failed: 0,
      channel: 'logged',
    };
  }

  // Prod — usar web-push dinamicamente (lazy import pra não falhar build
  // quando a dep não está presente em ambiente de dev)
  let webpush: typeof import('web-push') | null = null;
  try {
    webpush = await import('web-push');
  } catch (err) {
    console.error('[notifications/push] web-push not available:', err);
    return {
      success: false,
      sent: 0,
      failed: subs.length,
      channel: 'error',
      errors: ['web-push module not available'],
    };
  }

  const vapid = getVapidKeys();
  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const payload = pushPayloadFromNotification(notification);
  const invalidIds: string[] = [];
  const errors: string[] = [];
  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
        { TTL: 60 * 60 * 24 } // 24h
      );
      sent++;
      await prisma.pushSubscription.update({
        where: { id: sub.id },
        data: { lastSentAt: new Date(), lastError: null },
      });
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(msg);
      // 404/410 — subscription inválida, desativar
      if (msg.includes('410') || msg.includes('404')) {
        invalidIds.push(sub.id);
      }
      await prisma.pushSubscription.update({
        where: { id: sub.id },
        data: { lastError: msg.slice(0, 500) },
      });
    }
  }

  // Limpar invalids em batch
  if (invalidIds.length > 0) {
    await prisma.pushSubscription.updateMany({
      where: { id: { in: invalidIds } },
      data: { active: false },
    });
  }

  return {
    success: failed === 0,
    sent,
    failed,
    errors: errors.length > 0 ? errors : undefined,
    channel: 'sent',
  };
}

// ============================================================================
// Helpers
// ============================================================================

function pushPayloadFromNotification(n: NotificationDto): PushPayload {
  const title =
    n.payload?.preview ??
    n.actorSnapshot?.displayName ??
    'Akasha Portal';
  const body =
    typeof n.payload?.excerpt === 'string'
      ? (n.payload.excerpt as string).slice(0, 200)
      : 'Há nova atividade para você no Akasha Portal.';
  const link =
    typeof n.payload?.link === 'string'
      ? (n.payload.link as string)
      : 'https://akasha.app/notifications';

  return {
    title,
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: `notification-${n.id}`,
    url: link.startsWith('http') ? link : `https://akasha.app${link}`,
    data: {
      notificationId: n.id,
      type: n.type,
      entityId: n.entityId,
    },
  };
}

// ============================================================================
// Prisma shape (mínimo necessário — evita import direto pra ficar testável)
// ============================================================================

/**
 * Subset do PrismaClient necessário para push. Aceita o client completo ou
 * um mock para testes.
 */
export interface PushPrismaLike {
  pushSubscription: {
    findUnique: (args: {
      where: { endpoint: string };
      select?: Record<string, boolean>;
    }) => Promise<{ id: string; userId: string } | null>;
    create: (args: {
      data: {
        userId: string;
        endpoint: string;
        p256dh: string;
        auth: string;
        userAgent?: string | null;
        ipAddress?: string | null;
        active?: boolean;
      };
    }) => Promise<{ id: string }>;
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => Promise<unknown>;
    updateMany: (args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }) => Promise<unknown>;
    delete: (args: { where: { endpoint: string } }) => Promise<unknown>;
    findMany: (args: {
      where: Record<string, unknown>;
      orderBy?: Record<string, 'asc' | 'desc'>;
    }) => Promise<PushSubscriptionRow[]>;
  };
}

// Re-export para usar como tipo em testes
export type { NotificationType };
