/**
 * createNotification — helper central para criar uma notificação in-app.
 *
 * Por que este helper existe (vs. chamar prisma.notification.create
 * direto nas routes):
 *   1. Centraliza validação (title/body length, href sanity).
 *   2. Centraliza o mapeamento para DTO quando a rota quer devolver
 *      a notificação criada no response body (ex: endpoint admin).
 *   3. Único ponto para instrumentação futura (logging, métricas,
 *      tracing — Wave 14).
 *   4. Testável isoladamente sem mockar toda a rota.
 *
 * Quem chama este helper:
 *   - Endpoints de domínio (ex: `/api/diario/regenerate` quando cria
 *     novo Mandato do Dia → dispara NOTIFICATION tipo DIARIO).
 *   - Webhooks (ex: Mentor async response → tipo MENTOR).
 *   - Cron jobs (ex: "saldo baixo" check → tipo CREDITS).
 *   - Admin endpoints (tipo SYSTEM).
 *
 * NÃO chama este helper:
 *   - A UI (frontend nunca cria notificações — sempre via API).
 *
 * Convenção de erros:
 *   - Lança Error com mensagem PT-BR para o chamador (route) traduzir
 *     num 4xx/5xx estruturado. Validação falha = NotificationValidationError
 *     (caller decide se é 400 ou 422).
 */

import { prisma } from '@/lib/infrastructure/prisma';
import {
  CreateNotificationInput,
  NotificationDTO,
  NOTIFICATION_LIMITS,
} from './types';

export class NotificationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotificationValidationError';
  }
}

/**
 * Cria uma notificação para `userId`. Valida tamanho de title/body/href
 * antes de inserir. Retorna o DTO serializado (datas em ISO string).
 *
 * Idempotência: NÃO é idempotente. Cada chamada cria uma linha nova.
 * Se o caller precisa dedup (ex: "novo diário" 1x por dia), deve
 * checar antes com `findFirst({ userId, type, readAt: null, createdAt: { gte: hoje } })`.
 *
 * @throws NotificationValidationError se title/body/href inválidos
 * @throws Error (Prisma) se DB indisponível
 */
export async function createNotification(
  userId: string,
  input: CreateNotificationInput
): Promise<NotificationDTO> {
  // ─── Validação ─────────────────────────────────────────────────────
  if (!userId || typeof userId !== 'string') {
    throw new NotificationValidationError('userId é obrigatório');
  }
  const title = input.title?.trim();
  const body = input.body?.trim();
  const href = input.href?.trim() || null;

  if (!title) {
    throw new NotificationValidationError('title é obrigatório');
  }
  if (title.length > NOTIFICATION_LIMITS.TITLE_MAX) {
    throw new NotificationValidationError(
      `title excede ${NOTIFICATION_LIMITS.TITLE_MAX} caracteres (${title.length})`
    );
  }
  if (!body) {
    throw new NotificationValidationError('body é obrigatório');
  }
  if (body.length > NOTIFICATION_LIMITS.BODY_MAX) {
    throw new NotificationValidationError(
      `body excede ${NOTIFICATION_LIMITS.BODY_MAX} caracteres (${body.length})`
    );
  }
  if (href && href.length > NOTIFICATION_LIMITS.HREF_MAX) {
    throw new NotificationValidationError(
      `href excede ${NOTIFICATION_LIMITS.HREF_MAX} caracteres (${href.length})`
    );
  }
  // Sanity: href, se presente, deve começar com `/` (rota interna)
  // ou `https://` (link externo válido). Bloqueia javascript:, data:, etc.
  if (href && !href.startsWith('/') && !href.startsWith('https://')) {
    throw new NotificationValidationError(
      'href deve começar com "/" (rota interna) ou "https://" (link externo)'
    );
  }

  // ─── Inserção ──────────────────────────────────────────────────────
  const created = await prisma.notification.create({
    data: {
      userId,
      type: input.type,
      title,
      body,
      href,
      // readAt fica null por default = não lida
    },
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      href: true,
      readAt: true,
      createdAt: true,
    },
  });

  return toDTO(created);
}

/**
 * Converte uma Notification do Prisma para o DTO serializado.
 * Exportado para reuso em queries (GET /api/notifications).
 */
export function toDTO(n: {
  id: string;
  type: NotificationDTO['type'];
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
}): NotificationDTO {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    href: n.href,
    readAt: n.readAt ? n.readAt.toISOString() : null,
    createdAt: n.createdAt.toISOString(),
  };
}