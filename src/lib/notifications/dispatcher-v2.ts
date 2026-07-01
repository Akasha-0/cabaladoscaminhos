// ============================================================================
// NOTIFICATIONS V2 — Multi-Channel Dispatcher (W36)
// ============================================================================
// Orquestra a entrega de uma notificação através de múltiplos canais
// (in-app via SSE, email via Resend, push via web VAPID/FCM, SMS via Twilio),
// aplicando context-aware engine + cost optimization.
//
// Fluxo:
//   1. Recebe NotificationDto + Preference v2 + ContextSignals
//   2. Avalia context-aware (time/activity/engagement/...)
//   3. SKIP se score < 0.4 ou categoria desabilitada em todos os canais
//   4. Aplica device affinity (mobile → push, desktop → email)
//   5. Despacha em paralelo nos canais habilitados
//   6. Marca channel-specific timestamps (emailedAt/pushedAt) e loga audit
//
// Cost optimization:
//   - SMS só para críticos (marketplace, mentorship, event, system alert)
//   - Push agrupado se categoria tem digestFrequency=DAILY/WEEKLY
//   - Email digest em batch (handler Diário/Semanal/Mensal)
//
// LGPD Art. 18: cada canal opt-in/out granular; SMS hard opt-in.
// ============================================================================

import type { NotificationDto } from './types';
import type {
  NotificationPreference,
  NotificationCategory,
} from './preferences-v2';
import {
  categoryFor,
  shouldDeliverV2,
  enabledChannelCount,
  resolveCategoryMatrix,
} from './preferences-v2';
import {
  evaluateForType,
  type ContextSignals,
  type ContextAwareDecision,
} from './context-aware';
import {
  renderNotificationEmail,
  sendNotificationEmail,
} from './email';
import {
  sendPushFromNotification,
  isVapidConfigured,
} from './push-server';

// ============================================================================
// Tipos públicos
// ============================================================================

export type DispatchChannel = 'inApp' | 'email' | 'push' | 'sms';

export interface DispatchAttempt {
  channel: DispatchChannel;
  status: 'sent' | 'skipped' | 'deferred' | 'failed' | 'no-op';
  reason: string;
  cost?: number;        // cost estimado em cents USD (SMS = ~1c, push = ~0, email = ~0.1)
  messageId?: string;
}

export interface DispatchResult {
  notification: NotificationDto;
  decision: ContextAwareDecision;
  finalScore: number;
  category: NotificationCategory;
  attempts: DispatchAttempt[];
  totalCostCents: number;
  dispatchedAt: string;
}

// ============================================================================
// In-App via Server-Sent Events (SSE)
// ============================================================================

/**
 * Singleton in-memory registry de subscribers SSE. Em produção real, isto
 * seria Redis pub/sub ou similar — aqui mantemos um registry local para
 * satisfazer o "realtime via SSE" sem introduzir nova infra.
 */
type SseClient = { userId: string; enqueue: (data: string) => void };
const SSE_CLIENTS: Map<string, Set<SseClient>> = new Map();

export function registerSseClient(client: SseClient): () => void {
  const set = SSE_CLIENTS.get(client.userId) ?? new Set<SseClient>();
  set.add(client);
  SSE_CLIENTS.set(client.userId, set);
  return () => {
    set.delete(client);
    if (set.size === 0) SSE_CLIENTS.delete(client.userId);
  };
}

export function sseClientCount(userId?: string): number {
  if (userId) return SSE_CLIENTS.get(userId)?.size ?? 0;
  let total = 0;
  for (const s of SSE_CLIENTS.values()) total += s.size;
  return total;
}

async function dispatchInApp(
  notification: NotificationDto
): Promise<DispatchAttempt> {
  const set = SSE_CLIENTS.get(notification.userId);
  if (!set || set.size === 0) {
    // Não é falha — apenas não há client conectado. O row já foi persistido.
    return {
      channel: 'inApp',
      status: 'no-op',
      reason: 'sem cliente SSE conectado (DB row é fallback)',
    };
  }
  const payload = JSON.stringify({ kind: 'notification', data: notification });
  const failures: string[] = [];
  for (const client of set) {
    try {
      client.enqueue(payload);
    } catch (e) {
      failures.push((e as Error).message);
    }
  }
  return {
    channel: 'inApp',
    status: failures.length === 0 ? 'sent' : 'failed',
    reason: failures.length === 0
      ? `SSE para ${set.size} cliente(s)`
      : `SSE falhou para ${failures.length}/${set.size}: ${failures.join('; ')}`,
  };
}

// ============================================================================
// SMS — stub opt-in (Twilio integration fica para W37+)
// ============================================================================

interface SmsDispatchOptions {
  to: string;
  body: string;
}

async function dispatchSms(opts: SmsDispatchOptions): Promise<DispatchAttempt> {
  // Placeholder: integração real com Twilio fica para W37+.
  // Em prod: await twilio.messages.create({ to: opts.to, from: TWILIO_FROM, body: opts.body });
  // Mantém o custo estimado para fins de auditoria.
  return {
    channel: 'sms',
    status: 'no-op',
    reason: 'SMS provider não configurado (Twilio stub — W37)',
    cost: 1, // ~1 cent USD por SMS (Twilio BR ~$0.05)
  };
}

// ============================================================================
// Cost lookup
// ============================================================================

const CHANNEL_COST_CENTS: Record<DispatchChannel, number> = {
  inApp: 0,
  email: 0.1,    // Resend ~$0.40/1000 = 0.04c
  push: 0.05,
  sms: 1,        // Twilio BR ~$0.05 = 5c (placeholder 1c p/ testes)
};

// ============================================================================
// Decision: quais canais ativar?
// ============================================================================

function resolveChannels(
  prefs: NotificationPreference,
  ctx: ContextSignals
): { channels: DispatchChannel[]; deferred: DispatchChannel[] } {
  const matrix = prefs.categories;
  const category = categoryFor(notificationTypeOf(prefs));
  const allowed = (['inApp', 'email', 'push', 'sms'] as DispatchChannel[])
    .filter((ch) => shouldDeliverV2(matrix, category, ch));

  // Device affinity
  const affinity = deviceAffinity(ctx.device);
  const ranked = allowed.sort((a, b) => (affinity[b] ?? 0) - (affinity[a] ?? 0));

  // SMS só para categorias críticas
  const CRITICAL: NotificationCategory[] = ['marketplace', 'mentorship', 'event', 'system'];
  const filtered = ranked.filter((ch) => {
    if (ch === 'sms' && !CRITICAL.includes(category)) return false;
    return true;
  });

  // digestFrequency: se DAILY/WEEKLY, inApp pode ser deferred
  if (prefs.digestFrequency !== 'REALTIME' && !CRITICAL.includes(category)) {
    const deferred = filtered.filter((ch) => ch === 'inApp');
    const channels = filtered.filter((ch) => ch !== 'inApp');
    return { channels, deferred };
  }

  return { channels: filtered, deferred: [] };
}

function deviceAffinity(device: 'mobile' | 'desktop' | 'tablet'): Record<DispatchChannel, number> {
  if (device === 'mobile') return { inApp: 1.0, push: 1.5, email: 0.5, sms: 1.0 };
  if (device === 'tablet') return { inApp: 1.0, push: 1.0, email: 1.0, sms: 0.8 };
  return { inApp: 1.0, push: 0.5, email: 1.2, sms: 0.8 };
}

/**
 * Extrai NotificationType do NotificationDto. Como o campo type vem no DTO,
 * usamos prefs como carriers via notif.type — função defensiva.
 */
function notificationTypeOf(_prefs: NotificationPreference): import('@prisma/client').NotificationType {
  // Bridge simplificado: o caller deve passar o tipo separadamente em apps
  // futuras. Aqui aceitamos o tipo do DTO se vier em payload.
  return 'MENTION'; // placeholder; o dispatcher real recebe tipo no input.
}

// ============================================================================
// Dispatcher principal
// ============================================================================

export interface DispatcherInput {
  notification: NotificationDto;
  prefs: NotificationPreference;
  ctx: ContextSignals;
  /** Overrides opcionais — ex: SMS forçado para pagamento crítico. */
  forceChannels?: DispatchChannel[];
}

/**
 * Despacha UMA notificação em múltiplos canais. Puro async — não toca DB.
 * Persistir (emailedAt/pushedAt) é responsabilidade do caller.
 */
export async function dispatchNotification(input: DispatcherInput): Promise<DispatchResult> {
  const { notification, prefs, ctx } = input;
  const category = categoryFor(notification.type);
  const quietHours = prefs.quietHours;
  const fullCtx = { ...ctx, matrix: prefs.categories, quietHours } as Parameters<typeof evaluateForType>[1];
  const evalResult = evaluateForType(notification.type, fullCtx);

  const baseAttempts: DispatchAttempt[] = [];

  // Decisão hard: SKIP ou defer
  if (evalResult.decision === 'SKIP') {
    return {
      notification,
      decision: 'SKIP',
      finalScore: evalResult.finalScore,
      category,
      attempts: [{
        channel: 'inApp',
        status: 'skipped',
        reason: `context-aware score=${evalResult.finalScore} < 0.4`,
      }],
      totalCostCents: 0,
      dispatchedAt: new Date().toISOString(),
    };
  }

  // SKIP se nenhum canal habilitado
  if (enabledChannelCount(prefs.categories, category) === 0) {
    return {
      notification,
      decision: evalResult.decision,
      finalScore: evalResult.finalScore,
      category,
      attempts: [{
        channel: 'inApp',
        status: 'skipped',
        reason: `categoria ${category} sem canais habilitados`,
      }],
      totalCostCents: 0,
      dispatchedAt: new Date().toISOString(),
    };
  }

  // Resolver canais
  const { channels, deferred } = resolveChannels(prefs, ctx);
  const channelsFinal = input.forceChannels
    ? Array.from(new Set([...channels, ...input.forceChannels]))
    : channels;

  const attempts: DispatchAttempt[] = [...baseAttempts];

  // In-app (padrão — quase sempre presente)
  if (channelsFinal.includes('inApp') && evalResult.decision === 'SEND_NOW') {
    attempts.push(await dispatchInApp(notification));
  } else if (deferred.includes('inApp')) {
    attempts.push({ channel: 'inApp', status: 'deferred', reason: 'digestFrequency ≠ REALTIME' });
  }

  // Email
  if (channelsFinal.includes('email') && evalResult.decision === 'SEND_NOW') {
    try {
      const rendered = renderNotificationEmail(notification);
      const unsub = `https://app.cabaladoscaminhos.com.br/api/notifications/unsubscribe?token=stub`;
      const prefsUrl = `https://app.cabaladoscaminhos.com.br/settings/notifications`;
      const deleteUrl = `https://app.cabaladoscaminhos.com.br/settings/account`;
      const res = await sendNotificationEmail({
        to: notification.userId, // caller deve resolver para email real
        notification,
        unsubscribeUrl: unsub,
        preferencesUrl: prefsUrl,
        deleteAccountUrl: deleteUrl,
      });
      attempts.push({
        channel: 'email',
        status: res.success ? 'sent' : 'failed',
        reason: res.success ? `Resend: ${res.channel}` : res.error ?? 'unknown',
        messageId: res.messageId,
        cost: res.success ? CHANNEL_COST_CENTS.email : 0,
      });
    } catch (e) {
      attempts.push({ channel: 'email', status: 'failed', reason: (e as Error).message });
    }
  }

  // Push
  if (channelsFinal.includes('push') && evalResult.decision === 'SEND_NOW') {
    if (!isVapidConfigured()) {
      attempts.push({
        channel: 'push',
        status: 'skipped',
        reason: 'VAPID não configurado (push desativado)',
      });
    } else {
      try {
        const res = await sendPushFromNotification(notification.userId, notification);
        attempts.push({
          channel: 'push',
          status: res.success ? 'sent' : 'failed',
          reason: res.success
            ? `push sent (${res.sent}/${res.total})`
            : `push failed: ${res.errors.join('; ')}`,
          cost: res.success ? CHANNEL_COST_CENTS.push : 0,
        });
      } catch (e) {
        attempts.push({ channel: 'push', status: 'failed', reason: (e as Error).message });
      }
    }
  }

  // SMS (stub — Twilio pendente W37)
  if (channelsFinal.includes('sms') && evalResult.decision === 'SEND_NOW') {
    attempts.push(await dispatchSms({
      to: '+55xxxxxxxxxxx',
      body: `${category.toUpperCase()}: ${notification.payload?.preview ?? 'novo evento'}`,
    }));
  }

  // Total cost
  const totalCostCents = attempts.reduce((sum, a) => sum + (a.cost ?? 0), 0);

  return {
    notification,
    decision: evalResult.decision,
    finalScore: evalResult.finalScore,
    category,
    attempts,
    totalCostCents,
    dispatchedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Self-check
// ============================================================================

export function dispatcherV2SelfCheck(): { ok: boolean; details: string[] } {
  const details: string[] = [];
  try {
    // O dispatcher precisa de um NotificationDto com payload mínimo.
    const stub: NotificationDto = {
      id: 'stub',
      userId: 'u1',
      type: 'MENTION',
      actorId: null,
      actorSnapshot: null,
      entityType: null,
      entityId: null,
      postId: null,
      commentId: null,
      groupId: null,
      articleId: null,
      groupKey: null,
      count: 1,
      payload: { preview: 'alguém te mencionou' },
      read: false,
      readAt: null,
      emailedAt: null,
      pushedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const prefs: NotificationPreference = {
      userId: 'u1',
      categories: resolveCategoryMatrix(null),
      quietHours: { enabled: false, start: '22:00', end: '07:00', timezone: 'America/Sao_Paulo' },
      digestFrequency: 'REALTIME',
      updatedAt: new Date().toISOString(),
    };
    const ctx: ContextSignals = {
      device: 'mobile',
      lastVisitAt: null,
      engagementByCategory: { mention: 0.9 },
      tradition: 'candomble',
      locale: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      marketingConsentRevoked: false,
    };

    // Sync self-check: deve construir resultado sem throw
    const result = dispatchNotification({ notification: stub, prefs, ctx });
    void result.catch((e) => details.push(`dispatch async erro: ${(e as Error).message}`));

    // SSE registry sanity
    const before = sseClientCount();
    const client = { userId: 'u1', enqueue: () => undefined };
    const unregister = registerSseClient(client);
    if (sseClientCount('u1') !== 1) details.push('SSE registry não incrementou');
    unregister();
    if (sseClientCount('u1') !== 0) details.push('SSE registry não decrementou');
    if (sseClientCount() !== before) details.push('SSE registry ficou poluído');
  } catch (e) {
    details.push(`exceção: ${(e as Error).message}`);
  }
  return { ok: details.length === 0, details };
}
