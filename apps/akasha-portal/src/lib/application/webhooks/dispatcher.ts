/**
 * Webhooks dispatcher — D-049 (Wave 19.1).
 *
 * Disparador assíncrono (fire-and-forget) que entrega eventos para os
 * webhooks subscritos. Garante:
 *   - LGPD: filtra por userId antes de qualquer delivery (nunca
 *     cross-user, nunca broadcast).
 *   - HMAC: cada POST vai com header `X-Akasha-Signature: sha256=<hex>`.
 *   - Persistência de status: `lastCalledAt` + `lastError` na row.
 *   - Não-bloqueante: callers devem `dispatchEvent()` sem await
 *     crítico — erros são logados e persistidos em `lastError`, nunca
 *     lançados.
 *
 * Quem chama:
 *   - `createNotification()` em notifications/create.ts (event:
 *     'notification.created') — depois de inserir a notification.
 *   - `POST /api/webhooks/[id]/test` — event: 'webhook.test' (não está
 *     em WEBHOOK_EVENT_TYPES, é reservado).
 *   - Futuro: cron diário, diario.published, mentor.response_received,
 *     etc.
 *
 * NÃO chama:
 *   - A própria UI (que vai chamar `POST /api/webhooks/[id]/test`).
 */

import { prisma } from '@/lib/infrastructure/prisma';
import { findActiveSubscribers, recordDelivery } from './service';
import { signBody, WEBHOOK_EVENT_TYPES } from './signature';

/** Timeout do fetch em ms — 5s é o padrão da indústria (GitHub, Stripe). */
const FETCH_TIMEOUT_MS = 5_000;

/** Versão do payload — bump quando o schema mudar (consumers podem versionar). */
export const WEBHOOK_PAYLOAD_VERSION = '1';

export interface WebhookPayload {
  /** ISO 8601 timestamp do dispatch. */
  deliveredAt: string;
  /** Tipo de evento (ex: 'notification.created'). */
  event: string;
  /** userId de quem originou o evento (LGPD: somente o próprio user). */
  userId: string;
  /** Dados do evento (schema depende do tipo). */
  data: unknown;
  /** Versão do schema do payload. */
  version: string;
}

/**
 * Despacha um evento para todos os webhooks ativos do user que
 * subscreveram o evento. Fire-and-forget — não lança, não bloqueia.
 *
 * @param userId  userId do originador do evento (LGPD: sempre filtra
 *                por este userId — nunca envia para webhook de outro user).
 * @param event   nome do evento (deve estar em WEBHOOK_EVENT_TYPES)
 * @param data    payload específico do evento
 */
export async function dispatchEvent(
  userId: string,
  event: string,
  data: unknown
): Promise<void> {
  // Validação defensiva — callers internos devem respeitar o enum,
  // mas um type slip não pode crashar produção.
  if (!userId || !event) return;

  if (!(WEBHOOK_EVENT_TYPES as readonly string[]).includes(event)) {
    // Evento desconhecido — não é erro fatal (futuro vai adicionar
    // novos eventos dinamicamente), só ignoramos.
    return;
  }

  let subscribers: Array<{ id: string; url: string; secret: string }>;
  try {
    subscribers = await findActiveSubscribers(userId, event);
  } catch (err) {
    console.error('[webhooks] findActiveSubscribers failed', {
      userId,
      event,
      err: (err as Error).message,
    });
    return;
  }

  if (subscribers.length === 0) return;

  // Dispara em paralelo (sem await no caller) — Promise.allSettled
  // garante que um erro de rede em um webhook não afeta os outros.
  await Promise.allSettled(
    subscribers.map((sub) => deliverToSubscriber(userId, sub, event, data))
  );
}

async function deliverToSubscriber(
  userId: string,
  subscriber: { id: string; url: string; secret: string },
  event: string,
  data: unknown
): Promise<void> {
  const payload: WebhookPayload = {
    deliveredAt: new Date().toISOString(),
    event,
    userId,
    data,
    version: WEBHOOK_PAYLOAD_VERSION,
  };
  const body = JSON.stringify(payload);
  const signature = signBody(subscriber.secret, body);

  let ok = false;
  let error: string | undefined;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(subscriber.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Akasha-Signature': signature,
        'X-Akasha-Event': event,
        'X-Akasha-Webhook-Id': subscriber.id,
        'User-Agent': 'Akasha-Webhooks/1.0',
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      ok = true;
    } else {
      error = `HTTP ${response.status}`;
    }
  } catch (err) {
    error = (err as Error).name === 'AbortError' ? 'timeout' : (err as Error).message;
  }

  // Persiste status (lastCalledAt + lastError). Fire-and-forget — se
  // o prisma.update falhar, logamos mas não propagamos.
  try {
    await recordDelivery(userId, subscriber.id, { ok, ...(error ? { error } : {}) });
  } catch (err) {
    console.error('[webhooks] recordDelivery failed', {
      userId,
      webhookId: subscriber.id,
      err: (err as Error).message,
    });
  }

  if (!ok) {
    console.warn('[webhooks] delivery failed', {
      userId,
      webhookId: subscriber.id,
      url: subscriber.url,
      event,
      error,
    });
  }
}

/**
 * Helper de teste: dispara o evento 'webhook.test' (reservado) com
 * um payload mínimo. Usado por `POST /api/webhooks/[id]/test`.
 *
 * IMPORTANTE: este evento NÃO está em WEBHOOK_EVENT_TYPES — ele só
 * chega se o user tiver subscrito manualmente (não é auto-selecionado
 * na UI). Isso evita disparos acidentais em prod.
 */
export async function dispatchTestEvent(
  userId: string,
  webhookId: string,
  url: string,
  secret: string
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const payload: WebhookPayload = {
    deliveredAt: new Date().toISOString(),
    event: 'webhook.test',
    userId,
    data: { message: 'This is a test delivery from Akasha Webhooks.' },
    version: WEBHOOK_PAYLOAD_VERSION,
  };
  const body = JSON.stringify(payload);
  const signature = signBody(secret, body);

  let ok = false;
  let status: number | undefined;
  let error: string | undefined;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Akasha-Signature': signature,
        'X-Akasha-Event': 'webhook.test',
        'X-Akasha-Webhook-Id': webhookId,
        'User-Agent': 'Akasha-Webhooks/1.0',
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    status = response.status;
    if (response.ok) {
      ok = true;
    } else {
      error = `HTTP ${response.status}`;
    }
  } catch (err) {
    error = (err as Error).name === 'AbortError' ? 'timeout' : (err as Error).message;
  }

  // Persiste status (best-effort).
  try {
    await prisma.webhook.updateMany({
      where: { id: webhookId, userId },
      data: {
        lastCalledAt: new Date(),
        lastError: ok ? null : (error ?? 'unknown_error').slice(0, 500),
      },
    });
  } catch (err) {
    console.error('[webhooks] test recordDelivery failed', {
      userId,
      webhookId,
      err: (err as Error).message,
    });
  }

  return { ok, ...(status !== undefined ? { status } : {}), ...(error ? { error } : {}) };
}
