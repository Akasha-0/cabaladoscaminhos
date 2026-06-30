// ============================================================================
// W93-D — EVENTS + WORKSHOPS · TIPOS BRANDED
// ----------------------------------------------------------------------------
// Camada de tipos compartilhada entre events-engine, workshops-engine,
// ics-export e os componentes UI.
//
// Decisões de design:
//   - Datas como ISO 8601 string UTC (consistência cross-TZ; iCal export usa UTC)
//   - Branded types para impedir troca acidental entre EventId/WorkshopId/RSVPId
//   - Tipos de evento preservam terminologia pt-BR sagrada (roda, gira, cerimônia)
//   - RSVP status como string-union discriminada (sem bitmask)
// ============================================================================

// ============================================================================
// Branded IDs
// ============================================================================

declare const EventIdBrand: unique symbol;
export type EventId = string & { readonly [EventIdBrand]: void };

declare const WorkshopIdBrand: unique symbol;
export type WorkshopId = string & { readonly [WorkshopIdBrand]: void };

declare const SessionIdBrand: unique symbol;
export type SessionId = string & { readonly [SessionIdBrand]: void };

declare const RsvpIdBrand: unique symbol;
export type RsvpId = string & { readonly [RsvpIdBrand]: void };

declare const UserIdBrand: unique symbol;
export type UserId = string & { readonly [UserIdBrand]: void };

export const eventId = (s: string): EventId => s as EventId;
export const workshopId = (s: string): WorkshopId => s as WorkshopId;
export const sessionId = (s: string): SessionId => s as SessionId;
export const rsvpId = (s: string): RsvpId => s as RsvpId;
export const userId = (s: string): UserId => s as UserId;

// ============================================================================
// Tipos de evento — terminologia pt-BR sagrada
// ============================================================================

/**
 * Categorias canônicas de evento.
 *
 * IMPORTANTE: a ordem e os termos são SACRAMENTAIS. NÃO traduzir:
 *   - roda (não "circle")
 *   - gira (não "spin" / "session")
 *   - cerimônia (não "ceremony")
 *   - curso (não "course")
 *   - workshop (aceitável em ambos idiomas)
 */
export type EventKind = 'roda' | 'workshop' | 'curso' | 'cerimonia' | 'gira';

export const EVENT_KINDS: readonly EventKind[] = [
  'roda',
  'workshop',
  'curso',
  'cerimonia',
  'gira',
] as const;

/** Rótulo pt-BR para UI (somente exibição — chaves são EventKind). */
export const EVENT_KIND_LABEL: Readonly<Record<EventKind, string>> = {
  roda: 'Roda',
  workshop: 'Workshop',
  curso: 'Curso',
  cerimonia: 'Cerimônia',
  gira: 'Gira',
};

/** Descrição curta do propósito de cada tipo (UI legend). */
export const EVENT_KIND_DESCRIPTION: Readonly<Record<EventKind, string>> = {
  roda: 'Roda de conversa e partilha entre praticantes.',
  workshop: 'Encontro prático de curta duração (1-3 sessões).',
  curso: 'Formação estruturada em múltiplos módulos.',
  cerimonia: 'Cerimônia espiritual conduzida por sacerdote/ sacerdotisa.',
  gira: 'Gira de desenvolvimento mediúnico ou trabalho espiritual.',
};

// ============================================================================
// Modalidade + tradição (espelha patterns de src/lib/events/types.ts W26)
// ============================================================================

export type EventModality = 'online' | 'presencial' | 'hibrido';

export type Tradition =
  | 'cabala'
  | 'ifa'
  | 'astrologia'
  | 'tantra'
  | 'reiki'
  | 'meditacao'
  | 'xamanismo'
  | 'cristianismo-mistico'
  | 'sufismo'
  | 'taoismo'
  | 'umbanda'
  | 'candomble';

export const TRADITIONS: readonly Tradition[] = [
  'cabala',
  'ifa',
  'astrologia',
  'tantra',
  'reiki',
  'meditacao',
  'xamanismo',
  'cristianismo-mistico',
  'sufismo',
  'taoismo',
  'umbanda',
  'candomble',
] as const;

export const TRADITION_LABEL: Readonly<Record<Tradition, string>> = {
  cabala: 'Cabala',
  ifa: 'Ifá',
  astrologia: 'Astrologia',
  tantra: 'Tântrica',
  reiki: 'Reiki',
  meditacao: 'Meditação',
  xamanismo: 'Xamanismo',
  'cristianismo-mistico': 'Cristianismo Místico',
  sufismo: 'Sufismo',
  taoismo: 'Taoísmo',
  umbanda: 'Umbanda',
  candomble: 'Candomblé',
};

// ============================================================================
// Local
// ============================================================================

export interface EventLocation {
  kind: EventModality;
  /** Cidade (presencial/hibrido). */
  city?: string;
  /** Estado UF (presencial/hibrido). */
  state?: string;
  /** País (default 'BR'). */
  country?: string;
  /** Bairro ou ponto de referência curto (SEM expor rua/numero). */
  neighborhood?: string;
  /** URL da sala online (Zoom, Meet, Jitsi) — online/hibrido. */
  onlineUrl?: string;
  /** Plataforma exibida (ex: "Zoom", "Google Meet"). */
  platform?: string;
}

// ============================================================================
// Host (facilitador / anfitrião)
// ============================================================================

export interface Host {
  id: UserId;
  displayName: string;
  /** @handle sem @ */
  handle?: string;
  /** Linha curta "Cabala · Ifá · Astrologia" */
  traditionLine?: string;
  bio: string;
  avatarUrl?: string;
}

// ============================================================================
// Event (entidade principal)
// ============================================================================

export interface EventBase {
  id: EventId;
  /** Slug URL-amigável (único) */
  slug: string;
  title: string;
  /** Markdown simples — sem HTML */
  description: string;
  kind: EventKind;
  tradition: Tradition;
  /** ISO 8601 UTC */
  startsAt: string;
  /** ISO 8601 UTC */
  endsAt: string;
  /** Duração em minutos (derivada mas cacheada p/ UI). */
  durationMin: number;
  location: EventLocation;
  /** 0 = ilimitado */
  capacity: number;
  /** Preço em centavos BRL. null = gratuito. */
  priceCents: number | null;
  /** URL da capa 16:9 */
  coverImage: string;
  /** Texto alt da capa (LGPD + a11y) */
  coverAlt: string;
  tags?: string[];
  host: Host;
  /** Idioma principal (default 'pt-BR') */
  language: 'pt-BR' | 'en' | 'es';
  /** ISO 8601 criação */
  createdAt: string;
  /** ISO 8601 última atualização */
  updatedAt: string;
}

export interface Event extends EventBase {
  /** Status agregado do signup (capacidade / datas / cancelamento). */
  signupStatus: SignupStatus;
  /** Quantos confirmados (excluindo waitlist). */
  confirmedCount: number;
  /** Quantos em waitlist. */
  waitlistCount: number;
  /** Se true, organizer fechou manualmente (override de computeSignupStatus). */
  closedByOrganizer: boolean;
}

/** Event "cru" antes do motor calcular status/confirmedCount. */
export type EventDraft = Omit<EventBase, 'createdAt' | 'updatedAt'> & {
  createdAt?: string;
  updatedAt?: string;
};

// ============================================================================
// Workshop (multi-session)
// ============================================================================

export interface WorkshopSession {
  id: SessionId;
  /** Workshop pai */
  workshopId: WorkshopId;
  /** Título da sessão (ex: "Módulo 1 — A Árvore da Vida") */
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  durationMin: number;
  /** Pode ter evento separado (não obrigatório). */
  eventId?: EventId;
  /** Limite específico desta sessão (0 = herda do workshop). */
  capacityOverride: number;
  /** Ordenação dentro do workshop (1-indexed). */
  order: number;
}

export interface Workshop {
  id: WorkshopId;
  slug: string;
  title: string;
  description: string;
  tradition: Tradition;
  host: Host;
  coverImage: string;
  coverAlt: string;
  /** Capacidade total do workshop (0 = ilimitado). */
  capacity: number;
  priceCents: number | null;
  tags?: string[];
  /** Lista de sessões ordenadas por `order`. */
  sessions: WorkshopSession[];
  language: 'pt-BR' | 'en' | 'es';
  createdAt: string;
  updatedAt: string;
}

export type WorkshopDraft = Omit<Workshop, 'sessions' | 'createdAt' | 'updatedAt'> & {
  sessions: Array<Omit<WorkshopSession, 'id' | 'workshopId' | 'durationMin'> & { durationMin?: number }>;
  createdAt?: string;
  updatedAt?: string;
};

// ============================================================================
// RSVP (inscrição)
// ============================================================================

export type RsvpStatus = 'confirmed' | 'waitlist' | 'cancelled';

export interface Rsvp {
  id: RsvpId;
  eventId: EventId;
  userId: UserId;
  status: RsvpStatus;
  /** ISO 8601 criação */
  createdAt: string;
  /** ISO 8601 última atualização (cancelamento etc) */
  updatedAt: string;
  /** Posição na fila do waitlist (1-indexed; 0 se confirmado). */
  waitlistPosition: number;
}

export interface RsvpInput {
  eventId: EventId;
  userId: UserId;
}

// ============================================================================
// Status público (visível na listagem)
// ============================================================================

export type SignupStatus = 'open' | 'closed' | 'waitlist' | 'full';

export const SIGNUP_STATUS_LABEL: Readonly<Record<SignupStatus, string>> = {
  open: 'Inscrições abertas',
  closed: 'Inscrições fechadas',
  waitlist: 'Lista de espera',
  full: 'Lotado',
};

// ============================================================================
// Notificação hook (W91-A compat)
// ============================================================================

/**
 * Payload emitido pelo events-engine quando algo acontece (RSVP criado,
 * cancelado, promovido do waitlist). NÃO é gravado em DB — apenas emitido
 * via callback. O consumidor (W91-A notifications) decide se quer
 * persistir como Notification row, enviar email, push, etc.
 */
export type EventsNotificationKind =
  | 'rsvp-confirmed'
  | 'rsvp-waitlisted'
  | 'rsvp-cancelled'
  | 'waitlist-promoted'
  | 'workshop-session-added';

export interface EventsNotification {
  kind: EventsNotificationKind;
  eventId: EventId;
  workshopId?: WorkshopId;
  sessionId?: SessionId;
  userId: UserId;
  preview: string;
  link: string;
  payload: Record<string, unknown>;
  emittedAt: string;
}

// ============================================================================
// Erros canônicos
// ============================================================================

export type EventsErrorCode =
  | 'EVENT_NOT_FOUND'
  | 'WORKSHOP_NOT_FOUND'
  | 'RSVP_NOT_FOUND'
  | 'CAPACITY_FULL'
  | 'EVENT_CLOSED'
  | 'EVENT_PAST'
  | 'DUPLICATE_RSVP'
  | 'NOT_ORGANIZER'
  | 'INVALID_DATES'
  | 'INVALID_CAPACITY'
  | 'NO_SESSIONS';

export class EventsError extends Error {
  public readonly code: EventsErrorCode;
  public readonly meta: Record<string, unknown>;

  constructor(code: EventsErrorCode, message: string, meta: Record<string, unknown> = {}) {
    super(message);
    this.name = 'EventsError';
    this.code = code;
    this.meta = meta;
  }
}

// ============================================================================
// Constantes de versão
// ============================================================================

export const W93_D_VERSION = '1.0.0';
export const W93_D_CYCLE = 93;