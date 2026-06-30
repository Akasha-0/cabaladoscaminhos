// ============================================================================
// W86-D — Events/Workshops Engine · types
// ----------------------------------------------------------------------------
// Modelo de domínio para a feature NOVA de eventos/workshops. Tema fresh —
// não depende de `src/lib/events/` (que é a feature W26 legada, mantém-se
// intacta para retrocompatibilidade). Aqui definimos:
//   - 7 tradições (mesmas do portal: cigano, candomblé, umbanda, ifá, cabala,
//     astrologia, tantra)
//   - 4 tipos de evento (workshop, ceremony, circle, lecture)
//   - 4 status de evento (scheduled, live, ended, cancelled)
//   - RSVP com waitlist automático quando lotado
//
// Decisões:
//   - Datas ISO 8601 (compatível com `new Date(...)`)
//   - IDs são branded types (string & { __brand }) para evitar mix-ups
//   - Capacity 0 = ilimitado (não é erro)
//   - RSVP status: 'confirmed' quando há vaga, 'waitlist' quando lotado
//   - LGPD consent é obrigatório no momento do RSVP (campo `lgpdConsent: boolean`)
// ============================================================================

/** 7 tradições suportadas pela feature events/workshops */
export type Tradição =
  | 'cigano'
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra';

/** Símbolo textual (Unicode) por tradição — todos announcement-friendly */
export const TRADIÇÃO_SYMBOL: Readonly<Record<Tradição, string>> = Object.freeze({
  cigano: '✦',
  candomble: '🪶',
  umbanda: '☩',
  ifa: '◈',
  cabala: '☸',
  astrologia: '☉',
  tantra: '☬',
});

/** Label humana (pt-BR) por tradição */
export const TRADIÇÃO_LABEL: Readonly<Record<Tradição, string>> = Object.freeze({
  cigano: 'Cigano',
  candomble: 'Candomblé',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
});

/** Tipos de evento suportados */
export type EventType = 'workshop' | 'ceremony' | 'circle' | 'lecture';

/** Status geral do evento */
export type EventStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

/** Status do RSVP (independent do status do evento) */
export type RSVPStatus = 'confirmed' | 'waitlist' | 'cancelled';

/** Branded ID — evita mix-ups entre eventId, rsvpId, userId */
export type EventId = string & { readonly __eventId: unique symbol };
export type RSVPId = string & { readonly __rsvpId: unique symbol };
export type UserId = string & { readonly __userId: unique symbol };

/** Facilitador/anfitrião do evento */
export interface Host {
  readonly id: string;
  readonly displayName: string;
  readonly handle: string;
  readonly tradição: Tradição;
  readonly bio: string;
}

/** Evento/workshop */
export interface Event {
  readonly id: EventId;
  readonly title: string;
  readonly descrição: string;
  readonly type: EventType;
  readonly tradição: Tradição;
  readonly host: Host;
  /** ISO 8601 — início */
  readonly startsAt: string;
  /** ISO 8601 — fim */
  readonly endsAt: string;
  /** Capacidade total (0 = ilimitado) */
  readonly capacity: number;
  /** True se é gratuito (sem campo `priceCents`) */
  readonly free: boolean;
  /** Preço em centavos BRL. Só presente quando `free === false` */
  readonly priceCents?: number;
  /** Cidade/país (livre) */
  readonly location: string;
  /** Modalidade textual */
  readonly modality: 'presencial' | 'online' | 'hibrido';
  /** Status geral (admin pode mudar) */
  readonly status: EventStatus;
  /** Tags/labels secundárias */
  readonly tags: ReadonlyArray<string>;
}

/** RSVP — inscrição de um usuário em um evento */
export interface RSVP {
  readonly id: RSVPId;
  readonly eventId: EventId;
  readonly userId: UserId;
  readonly userName: string;
  /** Número de convidados além do próprio usuário (0 = só o usuário) */
  readonly guests: number;
  readonly status: RSVPStatus;
  readonly lgpdConsent: boolean;
  /** ISO 8601 do momento da inscrição */
  readonly createdAt: string;
}

/** Filtros para `listEvents` */
export interface EventFilter {
  readonly tradição?: Tradição;
  readonly type?: EventType;
  /** ISO 8601 — início do range */
  readonly from?: string;
  /** ISO 8601 — fim do range */
  readonly to?: string;
  /** `true` só eventos gratuitos, `false` só pagos, `undefined` ambos */
  readonly free?: boolean;
}

/** Estatísticas agregadas de um evento */
export interface EventStats {
  readonly eventId: EventId;
  readonly capacity: number;
  readonly confirmed: number;
  readonly waitlist: number;
  readonly cancelled: number;
  /** True se lotado (confirmed >= capacity quando capacity > 0) */
  readonly isFull: boolean;
  /** Vagas restantes (Infinity se capacity=0) */
  readonly spotsLeft: number;
}

/** Resultado discriminado de `createRSVP` */
export type CreateRSVPResult =
  | { readonly kind: 'success'; readonly rsvp: RSVP; readonly stats: EventStats }
  | { readonly kind: 'waitlist'; readonly rsvp: RSVP; readonly stats: EventStats }
  | { readonly kind: 'lgpd_missing'; readonly message: string }
  | { readonly kind: 'event_not_found'; readonly message: string }
  | { readonly kind: 'event_ended'; readonly message: string }
  | { readonly kind: 'event_cancelled'; readonly message: string }
  | { readonly kind: 'duplicate'; readonly message: string };

/** Adapter — fonte de dados (memory | http | supabase | ...) */
export interface EventsAdapter {
  listEvents(filter?: EventFilter): Promise<ReadonlyArray<Event>>;
  getEvent(id: EventId): Promise<Event | null>;
  saveEvent(event: Event): Promise<void>;
  listRSVPs(eventId: EventId): Promise<ReadonlyArray<RSVP>>;
  listUserRSVPs(userId: UserId): Promise<ReadonlyArray<RSVP>>;
  saveRSVP(rsvp: RSVP): Promise<void>;
  updateRSVP(rsvp: RSVP): Promise<void>;
}

/** Engine — fachada de alto nível */
export interface EventsEngine {
  listEvents(filter?: EventFilter): Promise<ReadonlyArray<Event>>;
  getEvent(id: EventId): Promise<Event | null>;
  createRSVP(
    eventId: EventId,
    userId: UserId,
    userName: string,
    guests: number,
    lgpdConsent: boolean
  ): Promise<CreateRSVPResult>;
  cancelRSVP(rsvpId: RSVPId): Promise<{ ok: boolean; message: string }>;
  listUserRSVPs(userId: UserId): Promise<ReadonlyArray<RSVP>>;
  getEventStats(eventId: EventId): Promise<EventStats | null>;
}

/** Constantes exportadas */
export const LGPD_VERSION = '2026-01' as const;
export const RSVP_GUESTS_MAX = 5 as const;
export const RSVP_GUESTS_MIN = 0 as const;
export const EVENT_TITLE_MAX = 120 as const;
export const EVENT_DESCRIPTION_MAX = 2000 as const;

/** Versão do schema (para migrations futuras) */
export const EVENTS_SCHEMA_VERSION = '1.0.0' as const;

/** Helper: type guard para Tradição */
export function isTradição(value: unknown): value is Tradição {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(TRADIÇÃO_LABEL, value)
  );
}

/** Helper: type guard para EventType */
export function isEventType(value: unknown): value is EventType {
  return value === 'workshop' || value === 'ceremony' || value === 'circle' || value === 'lecture';
}

/** Helper: type guard para EventStatus */
export function isEventStatus(value: unknown): value is EventStatus {
  return (
    value === 'scheduled' || value === 'live' || value === 'ended' || value === 'cancelled'
  );
}

/** Helper: type guard para RSVPStatus */
export function isRSVPStatus(value: unknown): value is RSVPStatus {
  return (
    value === 'confirmed' || value === 'waitlist' || value === 'cancelled'
  );
}
