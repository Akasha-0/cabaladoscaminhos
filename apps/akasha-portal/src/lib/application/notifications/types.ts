/**
 * Notification types — DTOs compartilhados entre helper, API routes, e UI.
 *
 * Por que existe um arquivo separado de `create.ts`:
 *   - Components React (NotificationsBell.tsx) precisam importar o DTO
 *     NotificationDTO mas NÃO podem importar o helper (que faz I/O).
 *   - API routes precisam tanto do helper quanto do DTO.
 *   - Separação types/helpers facilita tree-shaking e mocking.
 *
 * Relação com o schema:
 *   - `NotificationType` (enum) vem do Prisma client gerado.
 *   - Re-exportamos aqui para que consumers (helper, UI, API) tenham
 *     um único ponto de entrada que não dependa de `@prisma/client`
 *     diretamente (facilita swapping do ORM em testes).
 */

import { NotificationType as PrismaNotificationType } from '@prisma/client';

export type NotificationType = PrismaNotificationType;
export const NotificationType = PrismaNotificationType;

/**
 * DTO que a API retorna e a UI consome.
 * Mapeia 1:1 com o `model Notification` do schema.prisma, mas com
 * tipos serializáveis (Date → ISO string) para passar pelo Next.js
 * Server Component / Route Handler boundary sem hydration warnings.
 */
export interface NotificationDTO {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null; // ISO 8601 — Date.now().toISOString()
  createdAt: string;     // ISO 8601
}

/**
 * Payload aceito por `createNotification`. Validação adicional
 * (title ≤ 120, body ≤ 500) acontece DENTRO do helper.
 *
 * `userId` é separado do resto porque vem do auth context do caller
 * (nunca do body — fonte de IDOR/spoofing).
 */
export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  body: string;
  href?: string | null;
}

/**
 * Limites enforced pelo helper `createNotification`. Mantidos aqui
 * para reuso em testes e na UI (ex: form de admin mandando system msg).
 */
export const NOTIFICATION_LIMITS = {
  TITLE_MAX: 120,
  BODY_MAX: 500,
  HREF_MAX: 500, // URLs podem ser longas; aceita até 500 chars
} as const;