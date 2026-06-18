/**
 * Web Push — Akasha (Doc 25 §11 / Onda 3.5)
 *
 * Implementação server-side de Web Push API com VAPID.
 * Requer `web-push` instalado e `VAPID_PRIVATE_KEY` + `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
 * no `.env`.
 *
 * Subscrições são persistidas no modelo `pushSubscription` (Doc 25 §6).
 */
import webpush from 'web-push';

let configured = false;

/** Configura VAPID uma única vez. Idempotente. */
function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:contato@akasha.local';

  if (!publicKey || !privateKey) {
    throw new Error(
      '[web-push] VAPID keys não configuradas. Defina NEXT_PUBLIC_VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY.'
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  badge?: string;
}

/**
 * Envia uma notificação push para uma subscription.
 * Retorna true se entregue, false se subscription inválida (404/410).
 */
export async function sendPush(
  sub: PushSubscriptionJSON,
  payload: PushPayload
): Promise<{ ok: boolean; error?: string; expired?: boolean }> {
  try {
    ensureConfigured();
    await webpush.sendNotification(
      sub,
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 } // 24h
    );
    return { ok: true };
  } catch (err) {
    const e = err as { statusCode?: number; message?: string };
    // 404/410 = subscription inválida/expirada — caller deve deletar
    if (e.statusCode === 404 || e.statusCode === 410) {
      return { ok: false, error: e.message, expired: true };
    }
    return { ok: false, error: e.message ?? 'push_failed' };
  }
}

/** Helper para gerar par de chaves VAPID (apenas em setup inicial). */
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  return webpush.generateVAPIDKeys() as { publicKey: string; privateKey: string };
}

/** Retorna a chave pública VAPID (para o cliente). */
export function getPublicVapidKey(): string {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error('[web-push] NEXT_PUBLIC_VAPID_PUBLIC_KEY não configurada no ambiente.');
  }
  return publicKey;
}
