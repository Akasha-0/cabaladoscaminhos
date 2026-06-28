// ============================================================================
// NOTIFICATIONS — Push Server (RFC 8030 + VAPID)
// ============================================================================
// Wrapper server-side de web-push. Persiste subscriptions via Prisma e envia
// pushes reais quando VAPID está configurado. Em dev sem VAPID, mantém
// modo "logged" para que fluxos de UI possam ser exercitados sem chave.
//
// Variáveis de ambiente necessárias em produção:
//   VAPID_PUBLIC_KEY       — chave pública VAPID (base64 url-safe)
//   VAPID_PRIVATE_KEY      — chave privada VAPID (NUNCA expor no client)
//   VAPID_SUBJECT          — mailto:admin@akasha.app ou https://akasha.app
//
// Como gerar (uma vez):
//   npx web-push generate-vapid-keys
//
// Este módulo é uma camada complementar a ./push.ts (que cuida de tipos +
// roteamento por canal). Aqui centralizamos:
//   - subscribeUser(userId, subscription)         — upsert no Prisma
//   - unsubscribeUser(userId, endpoint)           — remove do Prisma
//   - sendPush(userId, payload)                   — entrega real via web-push
//   - getVapidPublicKey() / isVapidConfigured()   — endpoint /subscribe
// ============================================================================

import { prisma } from '@/lib/prisma';
import type { NotificationDto } from './types';

// ============================================================================
// Tipos públicos (re-exportados aqui para importadores)
// ============================================================================

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  url?: string;
  actions?: Array<{ action: string; title: string }>;
}

export interface PushSendResult {
  success: boolean;
  sent: number;
  failed: number;
  channel: 'sent' | 'logged' | 'no-subscriptions' | 'disabled' | 'error';
  errors?: string[];
}

// ============================================================================
// VAPID
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
// Subscription management
// ============================================================================

/**
 * Salva (ou reativa) uma subscription push. Deduplica por endpoint —
 * se o browser re-subscrever (ex: novo device), atualiza o userId.
 */
export async function subscribeUser(
  userId: string,
  input: PushSubscriptionInput
): Promise<{ id: string; created: boolean }> {
  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: input.endpoint },
    select: { id: true, userId: true },
  });

  if (existing) {
    await prisma.pushSubscription.update({
      where: { id: existing.id },
      data: {
        userId,
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
      userId,
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
 * Remove subscription por endpoint. Idempotente — retorna false se não
 * existia (útil pra unsubscribe duplo do browser).
 */
export async function unsubscribeUser(
  endpoint: string
): Promise<boolean> {
  try {
    await prisma.pushSubscription.delete({ where: { endpoint } });
    return true;
  } catch {
    // Não existia — operação idempotente
    return false;
  }
}

/**
 * Lista subscriptions ativas do usuário.
 */
export async function listSubscriptions(userId: string) {
  return prisma.pushSubscription.findMany({
    where: { userId, active: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  });
}

// ============================================================================
// Send
// ============================================================================

/**
 * Envia push para todas as subscriptions ativas do usuário.
 *
 * @param userId  destinatário
 * @param payload estrutura completa (title, body, icon, url, data, actions)
 *
 * Comportamento:
 *   - Sem subscriptions → 'no-subscriptions'
 *   - Sem VAPID em prod → 'error' (não enviamos push real sem autenticação)
 *   - Sem VAPID em dev  → 'logged' (console.log para debug)
 *   - Push enviado com sucesso → 'sent'
 *   - Push falhou (4xx/5xx)  → 'error', marca lastError no DB
 *   - Subscription 404/410   → desativa automaticamente (limpeza)
 */
export async function sendPush(
  userId: string,
  payload: PushPayload
): Promise<PushSendResult> {
  const subs = await listSubscriptions(userId);
  if (subs.length === 0) {
    return { success: true, sent: 0, failed: 0, channel: 'no-subscriptions' };
  }

  // Dev sem VAPID — log em vez de enviar. Permite exercitar UI sem chave.
  if (!isVapidConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      // Em prod SEM VAPID = erro real (não temos como autenticar push)
      return {
        success: false,
        sent: 0,
        failed: subs.length,
        channel: 'error',
        errors: ['VAPID keys not configured in production'],
      };
    }

     
    console.log('[notifications/push-server] (dev) would send:', {
      userId,
      title: payload.title,
      body: payload.body,
      subscriptionCount: subs.length,
    });
    return { success: true, sent: 0, failed: 0, channel: 'logged' };
  }

  // Prod (ou dev com VAPID) — usar web-push dinamicamente
  let webpush: typeof import('web-push') | null = null;
  try {
    webpush = await import('web-push');
  } catch (err) {
    console.error('[notifications/push-server] web-push not available:', err);
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
      // 404/410 — subscription inválida (browser removeu permissão)
      if (msg.includes('410') || msg.includes('404')) {
        invalidIds.push(sub.id);
      }
      await prisma.pushSubscription.update({
        where: { id: sub.id },
        data: { lastError: msg.slice(0, 500) },
      });
    }
  }

  // Limpar invalids em batch (desativa, mantém histórico)
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
    channel: 'sent',
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Envia push a partir de uma Notification (mapper). Atalho para o caminho
 * comum do triggers.ts.
 */
export async function sendPushFromNotification(
  userId: string,
  notification: NotificationDto
): Promise<PushSendResult> {
  const payload = pushPayloadFromNotification(notification);
  return sendPush(userId, payload);
}

// ============================================================================
// Helpers
// ============================================================================

function pushPayloadFromNotification(n: NotificationDto): PushPayload {
  const title =
    (n.payload && typeof n.payload.preview === 'string'
      ? (n.payload.preview as string)
      : null) ??
    n.actorSnapshot?.displayName ??
    'Akasha Portal';
  const body =
    n.payload && typeof n.payload.excerpt === 'string'
      ? (n.payload.excerpt as string).slice(0, 200)
      : 'Há nova atividade para você no Akasha Portal.';
  const link =
    n.payload && typeof n.payload.link === 'string'
      ? (n.payload.link as string)
      : '/notifications';

  return {
    title,
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: `notification-${n.id}`,
    url: link.startsWith('http') ? link : link,
    data: {
      notificationId: n.id,
      type: n.type,
      entityId: n.entityId,
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
  };
}
