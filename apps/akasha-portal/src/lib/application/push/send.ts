/**
 * send.ts — Akasha (T7 / Doc 25 §11)
 *
 * Wrapper server-side sobre `web-push-server.sendPush` com **guard de privacidade**
 * (Doc 22 AD-22.2 / Doc 25 §11): rejeita payloads cujo `body` ultrapasse 100
 * caracteres ou que pareçam conter conteúdo do ritual.
 *
 * Por design, push do Akasha é **genérico** — a mensagem típica é
 * "Seu ritual de hoje está pronto", nunca o conteúdo do ritual em si.
 * O ritual detalhado fica no `/diario` (autenticado), nunca no payload.
 */

import webpush from 'web-push';
import {
  sendPush as baseSendPush,
  type PushSubscriptionJSON,
  type PushPayload,
} from './web-push-server';

// Re-exporta o tipo para consumidores deste módulo.
export type { PushSubscriptionJSON, PushPayload };

/**
 * Limite de caracteres do `body` (recomendação do spec; protege contra
 * regressões que vazem conteúdo do ritual no payload).
 */
const MAX_BODY_LENGTH = 100;

/**
 * Envia uma notificação push para `subscription` com `payload` validado.
 *
 * @returns `{ ok: true }` em sucesso; `{ ok: false, error, expired? }` em falha
 *   (incluindo 404/410 do push service, que indica subscription expirada).
 */
export async function sendPush(
  subscription: PushSubscriptionJSON,
  payload: PushPayload
): Promise<{ ok: true } | { ok: false; error: string; expired?: boolean }> {
  // Guard de privacidade: corpo curto e semântico.
  if (typeof payload?.body !== 'string' || payload.body.length === 0) {
    return { ok: false, error: 'payload body missing' };
  }
  if (payload.body.length > MAX_BODY_LENGTH) {
    return {
      ok: false,
      error: `payload body too long (max ${MAX_BODY_LENGTH} chars)`,
    };
  }

  return baseSendPush(subscription, payload) as unknown as
    | { ok: true }
    | { ok: false; error: string; expired?: boolean };
}

/**
 * Configura o VAPID uma vez no startup. Idempotente.
 * Chame uma vez no `instrumentation.ts` ou no entrypoint do server.
 */
export function configureVapid(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:dev@akasha.local';

  if (!publicKey || !privateKey) {
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}
