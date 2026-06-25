/**
 * Webhook HMAC signature helper — D-049 (Wave 19.1).
 *
 * Server-side: ao disparar um webhook, assinamos o body com
 *   signature = HMAC-SHA256(secret, rawBody)
 * e enviamos no header `X-Akasha-Signature: sha256=<hex>`.
 *
 * Consumer-side: o receiver re-computa HMAC-SHA256(secret, rawBody) e
 * compara com `timingSafeEqual` (em vez de `===`) para evitar timing
 * attacks. Helper exposto abaixo — usado pelo consumer em tests e
 * pelo dispatcher em produção.
 *
 * Formato do header: `sha256=<hex>` (mesmo padrão que GitHub,
 * Stripe v1, etc). Versão futura pode usar `v1,t=...,v0=...` se virar
 * requisito — manter simple agora (YAGNI).
 *
 * LGPD: secret é gerado server-side, NUNCA derivado de dado pessoal.
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/** Gera um secret novo: 32 bytes random → 64 hex chars. */
export function generateSecret(): string {
  return randomBytes(32).toString('hex');
}

/** Deriva um fingerprint não-reversível do secret (8 chars hex). */
export function fingerprintSecret(secret: string): string {
  return createHash('sha256').update(secret, 'utf8').digest('hex').slice(0, 8);
}

/**
 * Assina um body com HMAC-SHA256(secret, body).
 * Retorna a string `sha256=<hex>` pronta para o header.
 */
export function signBody(secret: string, body: string): string {
  const hmac = createHmac('sha256', secret).update(body, 'utf8').digest('hex');
  return `sha256=${hmac}`;
}

/**
 * Verifica uma assinatura em timing-safe. Retorna true se a assinatura
 * fornecida bate com HMAC-SHA256(secret, body).
 *
 * Aceita tanto `sha256=<hex>` quanto `<hex>` puro (defensivo).
 *
 * Edge cases:
 *   - secret vazio → false (sem chave = impossível validar)
 *   - signature vazia → false
 *   - lengths diferentes → false (timingSafeEqual exige mesmo length)
 *   - hex inválido → false
 */
export function verifySignature(
  secret: string,
  body: string,
  signature: string | null | undefined
): boolean {
  if (!secret || !signature) return false;

  const expected = signBody(secret, body);
  const provided = signature.startsWith('sha256=')
    ? signature.slice('sha256='.length)
    : signature;

  // timingSafeEqual exige mesmo length — early-return sem expor
  // qual lado divergiu (segurança).
  if (provided.length !== expected.length - 'sha256='.length) return false;

  const expectedBytes = Buffer.from(expected.slice('sha256='.length), 'utf8');
  const providedBytes = Buffer.from(provided, 'utf8');

  // timingSafeEqual lanca se lengths diferentes — já checamos acima.
  return timingSafeEqual(expectedBytes, providedBytes);
}

/**
 * Lista canônica de eventos que podem ser subscritos em webhooks.
 *
 * Espelhado em `WebhooksService` (validation). Mantemos no signature
 * module porque é o "contrato público" do sistema de webhooks
 * (consumers veem isso na doc).
 */
export const WEBHOOK_EVENT_TYPES = [
  'notification.created',
  'diario.published',
  'mentor.response_received',
  'conexao.match',
  'credits.low',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

/** Type guard: string é um WebhookEventType válido? */
export function isWebhookEventType(value: string): value is WebhookEventType {
  return (WEBHOOK_EVENT_TYPES as readonly string[]).includes(value);
}
