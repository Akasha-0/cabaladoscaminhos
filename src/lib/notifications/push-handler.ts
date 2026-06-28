// ============================================================================
// NOTIFICATIONS — Push handler stub (Wave 24 Worker A)
// ============================================================================
// Camada de recepção de eventos de notificação que serão despachados para
// providers de push (FCM / APNS / Web Push).
//
// Este arquivo é um stub mínimo: a forma do contrato (`NotificationEvent`)
// está congelada, mas o roteamento real para providers ainda não foi
// implementado. A função `handleNotification` apenas simula a entrega
// devolvendo `{ delivered: true }` após 1ms, para que o restante do
// pipeline (triggers, queue, etc.) já tenha um ponto de integração.
// ============================================================================

/**
 * Evento de notificação recebido pelo handler.
 *
 * @property id        Identificador único do evento (UUID v4 recomendado)
 * @property type      Categoria semântica (ex: "POST_REPLY", "MENTION", "LIKE")
 * @property userId    ID do usuário destinatário (recipient)
 * @property payload   Dados arbitrários da notificação (preview, link, etc)
 * @property createdAt Timestamp ISO-8601 de quando o evento foi emitido
 */
export interface NotificationEvent {
  id: string;
  type: string;
  userId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

/**
 * Stub de entrega de push notification.
 *
 * Atualmente apenas simula a entrega com um delay mínimo de 1ms e retorna
 * `{ delivered: true }`. A integração real com providers (FCM / APNS /
 * Web Push) será adicionada em uma wave futura.
 *
 * @param event Evento de notificação a ser entregue
 * @returns Promise com flag `delivered` indicando sucesso da entrega
 */
export async function handleNotification(
  event: NotificationEvent,
): Promise<{ delivered: boolean }> {
  // Simula latência mínima de roteamento (placeholder até integrarmos
  // a queue real). Mantemos o await para que o call site já lide com
  // o formato assíncrono.
  await new Promise((resolve) => setTimeout(resolve, 1));

  // TODO(w24): real push provider integration (FCM/APNS/Web Push)
  return { delivered: true };
}
