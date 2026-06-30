// ============================================================================
// W93-D — NOTIFICATION HOOK (integração com W91-A)
// ----------------------------------------------------------------------------
// Ponte entre o events-engine/workshops-engine e o sistema de notificações
// (W91-A). Este módulo NÃO reimplementa o envio de email/push — apenas
// emite via callback que o W91-A pode escutar e traduzir para
// `CreateNotificationInput` + email/push.
//
// Padrão: events-engine aceita `notifier: (n: EventsNotification) => void`.
// Esta função é a ponte padrão — traduz `EventsNotification` para
// `CreateNotificationInput` (compatível com `triggers.createNotification`).
//
// Mapeamento kind → NotificationType:
//   - 'rsvp-confirmed'      → SYSTEM_ALERT (porque NÃO temos EVENT_RSVP no enum Prisma)
//   - 'rsvp-waitlisted'     → SYSTEM_ALERT
//   - 'rsvp-cancelled'      → SYSTEM_ALERT
//   - 'waitlist-promoted'   → SYSTEM_ALERT
//   - 'workshop-session-added' → SYSTEM_ALERT
//
// CRITICAL_TYPES no notifications engine já inclui SYSTEM_ALERT, então
// preferências são bypassed — entrega garantida.
//
// IMPORTANTE: SYSTEM_ALERT é genérico; payload inclui `eventKind` discrimi-
// nador para o cliente UI saber se renderiza como "Inscrição confirmada"
// vs "Você foi promovido da lista de espera".
// ============================================================================

import type {
  EventsNotification,
  EventsNotificationKind,
} from './events-types.ts';

/**
 * DTO compatível com `CreateNotificationInput` em
 * `src/lib/notifications/types.ts`. NÃO depende do módulo de notifications
 * para type-checking (decoupling); W91-A faz o type narrowing no adapter.
 */
export interface CreateNotificationInputLike {
  userId: string;
  type: 'SYSTEM_ALERT' | 'MODERATION_ACTION';
  payload?: {
    preview?: string;
    link?: string;
    excerpt?: string;
    /** Discriminador — qual sub-evento gerou a notif. */
    eventKind?: EventsNotificationKind;
    /** Dados estruturados. */
    [key: string]: unknown;
  } | null;
  /** groupKey opcional (deduplicação). */
  groupKey?: string;
  /** Respeitar preferências (default: true). System alerts bypassam. */
  respectPreferences?: boolean;
}

/** Adapter: converte EventsNotification → CreateNotificationInputLike. */
export function eventsNotificationToCreateInput(
  n: EventsNotification,
): CreateNotificationInputLike {
  const isCritical =
    n.kind === 'rsvp-confirmed' ||
    n.kind === 'rsvp-cancelled' ||
    n.kind === 'waitlist-promoted';

  return {
    userId: n.userId as string,
    type: 'SYSTEM_ALERT',
    payload: {
      preview: n.preview,
      link: n.link,
      eventKind: n.kind,
      ...n.payload,
    },
    groupKey: `event-${n.kind}-${n.eventId}`,
    respectPreferences: !isCritical,
  };
}

/**
 * Bridge padrão: recebe EventsNotification e chama um sink (ex: W91-A
 * `createNotification`). NÃO executa side-effects diretamente.
 */
export type NotificationSink = (
  input: CreateNotificationInputLike,
) => void | Promise<void>;

/**
 * Cria um `notifier` compatível com EventsEngine/WorkshopsEngine que
 * traduz EventsNotification para CreateNotificationInputLike e envia
 * ao sink do W91-A.
 */
export function makeNotifier(sink: NotificationSink, log?: (msg: string, meta?: Record<string, unknown>) => void): (n: EventsNotification) => void {
  return (n: EventsNotification) => {
    const input = eventsNotificationToCreateInput(n);
    try {
      const result = sink(input);
      if (result && typeof (result as Promise<void>).catch === 'function') {
        (result as Promise<void>).catch((err: unknown) => {
          (log ?? (() => {}))('notifier.sink.error', {
            kind: n.kind,
            error: err instanceof Error ? err.message : String(err),
          });
        });
      }
    } catch (err) {
      (log ?? (() => {}))('notifier.sink.syncError', {
        kind: n.kind,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };
}

/**
 * Validador LGPD: garante que EventsNotification NÃO carrega email,
 * telefone ou PII além do userId (e do payload controlado).
 */
export function assertNoPiiInNotification(n: EventsNotification): void {
  // userId é OK (já é identificador opaco).
  // preview/link são gerados pelo engine e NÃO devem conter PII.
  // payload é gerado pelo engine e contém apenas eventSlug/waitlistPosition.
  // Se algum dia o caller incluir email no payload, este assert falha.
  const forbidden = ['@', 'email', 'tel:', 'cpf', 'rg', 'phone'];
  const blob = JSON.stringify(n);
  for (const f of forbidden) {
    if (blob.toLowerCase().includes(f)) {
      // exceptions: o próprio `preview` pode ter '@' em links — só falha
      // se houver um padrão que pareça email real.
      if (f === '@') {
        const emailLike = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
        if (!emailLike.test(blob)) continue;
      }
      throw new Error(`EventsNotification contém PII (detectado: ${f}): ${blob.slice(0, 200)}`);
    }
  }
}