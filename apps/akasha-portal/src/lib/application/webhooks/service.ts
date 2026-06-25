/**
 * Webhooks service — D-049 (Wave 19.1).
 *
 * Camada de aplicação que faz CRUD em webhooks do próprio user.
 * SEM cross-user access — todo método recebe `userId` e filtra por ele.
 *
 * URL validation:
 *   - https-only (rejeita http)
 *   - não-localhost (rejeita 127.0.0.1, ::1, localhost)
 *   - não-IP-privado (rejeita 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16,
 *     169.254.0.0/16, fc00::/7, fe80::/10) — previne SSRF contra a
 *     infra interna do Vercel/Postgres/Redis.
 *
 * LGPD (Art. 18 + Art. 33):
 *   - Webhooks são userId-only — `findMany`, `findUnique`, `update`,
 *     `deleteMany` SEMPRE filtram por `(id, userId)`.
 *   - `secret` é exposto **UMA ÚNICA VEZ** em `createWebhook`. Em
 *     `listWebhooks` e `getWebhook` expomos apenas `secretFingerprint`.
 */

import { URL } from 'node:url';
import { prisma } from '@/lib/infrastructure/prisma';
import {
  WEBHOOK_EVENT_TYPES,
  fingerprintSecret,
  generateSecret,
  isWebhookEventType,
} from './signature';

// ─── Types ────────────────────────────────────────────────────────────

/** DTO que a API retorna (sem `secret` cru, com `secretFingerprint`). */
export interface WebhookDTO {
  id: string;
  url: string;
  events: string[];
  secretFingerprint: string;
  isActive: boolean;
  lastCalledAt: string | null; // ISO 8601
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

/** DTO retornado SÓ no POST (com `secret` em plain — exibido UMA VEZ). */
export interface WebhookWithSecretDTO extends WebhookDTO {
  secret: string;
}

interface WebhookRow {
  id: string;
  url: string;
  events: string[];
  secret: string;
  secretFingerprint: string;
  isActive: boolean;
  lastCalledAt: Date | null;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function toDTO(row: WebhookRow): WebhookDTO {
  return {
    id: row.id,
    url: row.url,
    events: row.events,
    secretFingerprint: row.secretFingerprint,
    isActive: row.isActive,
    lastCalledAt: row.lastCalledAt ? row.lastCalledAt.toISOString() : null,
    lastError: row.lastError,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const SELECT = {
  id: true,
  url: true,
  events: true,
  secret: true,
  secretFingerprint: true,
  isActive: true,
  lastCalledAt: true,
  lastError: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ─── Errors ───────────────────────────────────────────────────────────

export class WebhookValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookValidationError';
  }
}

// ─── URL validation ───────────────────────────────────────────────────

const PRIVATE_IPV4_PATTERNS: ReadonlyArray<RegExp> = [
  /^10\./, // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
  /^192\.168\./, // 192.168.0.0/16
  /^169\.254\./, // link-local 169.254.0.0/16 (cloud metadata!)
  /^127\./, // loopback 127.0.0.0/8
  /^0\./, // 0.0.0.0/8
];

/**
 * Valida URL do webhook. Lança `WebhookValidationError` se inválida.
 *
 * Regras:
 *   - protocol = https (rejeita http, ftp, etc)
 *   - hostname não pode ser localhost/127.0.0.1/::1
 *   - hostname não pode ser IP privado (10/8, 172.16/12, 192.168/16,
 *     169.254/16, fc00::/7, fe80::/10)
 *   - URL deve parsear como absolute
 */
export function validateWebhookUrl(rawUrl: string): string {
  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    throw new WebhookValidationError('URL é obrigatória');
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new WebhookValidationError('URL inválida (não parseou)');
  }

  if (parsed.protocol !== 'https:') {
    throw new WebhookValidationError('URL deve ser https (rejeitado: ' + parsed.protocol + ')');
  }

  // Strip brackets de IPv6 (Node's URL keeps brackets in hostname for IPv6)
  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (hostname === 'localhost' || hostname === '::1') {
    throw new WebhookValidationError('URL não pode ser localhost');
  }

  // Bloqueia IPv4 privada + loopback
  for (const pat of PRIVATE_IPV4_PATTERNS) {
    if (pat.test(hostname)) {
      throw new WebhookValidationError('URL não pode apontar para IP privado/loopback');
    }
  }

  // Bloqueia IPv6 privada (fc00::/7 = fc00..fdff, fe80::/10 = fe80..febf)
  if (/^f[cd][0-9a-f]{2}:/i.test(hostname) || /^fe[89ab][0-9a-f]?:/i.test(hostname)) {
    throw new WebhookValidationError('URL não pode apontar para IPv6 privado/link-local');
  }

  return rawUrl;
}

/** Valida array de eventos. Lança se algum for desconhecido. */
export function validateEvents(events: unknown): string[] {
  if (!Array.isArray(events)) {
    throw new WebhookValidationError('events deve ser array de strings');
  }
  if (events.length === 0) {
    throw new WebhookValidationError('events deve ter ao menos 1 evento');
  }
  if (events.length > 20) {
    throw new WebhookValidationError('events máximo 20 entries');
  }
  const normalized: string[] = [];
  for (const e of events) {
    if (typeof e !== 'string') {
      throw new WebhookValidationError('cada evento deve ser string');
    }
    if (!isWebhookEventType(e)) {
      throw new WebhookValidationError(
        `evento desconhecido: ${e}. Permitidos: ${WEBHOOK_EVENT_TYPES.join(', ')}`
      );
    }
    if (!normalized.includes(e)) normalized.push(e);
  }
  return normalized;
}

// ─── CRUD ─────────────────────────────────────────────────────────────

/** Lista webhooks do user (SEM expor o secret). */
export async function listWebhooks(userId: string): Promise<WebhookDTO[]> {
  if (!userId) throw new Error('userId é obrigatório');
  const rows = await prisma.webhook.findMany({
    where: { userId },
    select: SELECT,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toDTO);
}

/**
 * Cria um webhook para o user. Retorna `WebhookWithSecretDTO` com o
 * `secret` em plain — caller DEVE mostrar ao user UMA ÚNICA VEZ
 * (não há como recuperar depois).
 */
export async function createWebhook(
  userId: string,
  input: { url: string; events: string[]; isActive?: boolean }
): Promise<WebhookWithSecretDTO> {
  if (!userId) throw new Error('userId é obrigatório');
  const url = validateWebhookUrl(input.url);
  const events = validateEvents(input.events);

  const secret = generateSecret();
  const secretFingerprint = fingerprintSecret(secret);

  const row = await prisma.webhook.create({
    data: {
      userId,
      url,
      events,
      secret,
      secretFingerprint,
      isActive: input.isActive ?? true,
    },
    select: SELECT,
  });

  return { ...toDTO(row), secret };
}

/** Busca um webhook do user (SEM expor o secret). */
export async function getWebhook(userId: string, id: string): Promise<WebhookDTO | null> {
  if (!userId || !id) throw new Error('userId e id são obrigatórios');
  const row = await prisma.webhook.findFirst({
    where: { id, userId },
    select: SELECT,
  });
  return row ? toDTO(row) : null;
}

/**
 * Atualiza um webhook do user. Apenas campos fornecidos são alterados.
 * Retorna DTO atualizado (sem secret) ou null se não encontrado.
 */
export async function updateWebhook(
  userId: string,
  id: string,
  patch: { url?: string; events?: string[]; isActive?: boolean }
): Promise<WebhookDTO | null> {
  if (!userId || !id) throw new Error('userId e id são obrigatórios');

  // Constrói data apenas com campos presentes
  const data: { url?: string; events?: string[]; isActive?: boolean } = {};
  if (patch.url !== undefined) data.url = validateWebhookUrl(patch.url);
  if (patch.events !== undefined) data.events = validateEvents(patch.events);
  if (patch.isActive !== undefined) data.isActive = patch.isActive;

  if (Object.keys(data).length === 0) {
    // Nada para atualizar — retorna estado atual
    return getWebhook(userId, id);
  }

  // IDOR-safe: updateMany com where=(id, userId) — 0 affected = not found
  const result = await prisma.webhook.updateMany({
    where: { id, userId },
    data,
  });
  if (result.count === 0) return null;

  const row = await prisma.webhook.findFirst({
    where: { id, userId },
    select: SELECT,
  });
  return row ? toDTO(row) : null;
}

/**
 * Deleta um webhook do user. Retorna true se deletou, false se não
 * encontrou (não pertence ao user OU id inexistente — indistinguível
 * intencionalmente para o caller).
 */
export async function deleteWebhook(userId: string, id: string): Promise<boolean> {
  if (!userId || !id) throw new Error('userId e id são obrigatórios');
  const result = await prisma.webhook.deleteMany({
    where: { id, userId },
  });
  return result.count > 0;
}

// ─── Dispatcher support ───────────────────────────────────────────────

/**
 * Atualiza lastCalledAt + lastError após uma tentativa de delivery.
 * Chamado pelo dispatcher (Wave 19.1 — fire-and-forget).
 */
export async function recordDelivery(
  userId: string,
  id: string,
  outcome: { ok: boolean; error?: string }
): Promise<void> {
  if (!userId || !id) throw new Error('userId e id são obrigatórios');
  const error = outcome.ok ? null : (outcome.error ?? 'unknown_error').slice(0, 500);
  await prisma.webhook.updateMany({
    where: { id, userId },
    data: { lastCalledAt: new Date(), lastError: error },
  });
}

/** Busca TODOS os webhooks ativos que subscrevem um evento. User-scoped. */
export async function findActiveSubscribers(
  userId: string,
  event: string
): Promise<Array<{ id: string; url: string; secret: string }>> {
  if (!userId || !event) throw new Error('userId e event são obrigatórios');
  // Postgres native array overlap operator: events && ARRAY[$1]
  // Prisma: use `hasSome` para "overlap" (qualquer match).
  const rows = await prisma.webhook.findMany({
    where: { userId, isActive: true, events: { hasSome: [event] } },
    select: { id: true, url: true, secret: true },
  });
  return rows;
}
