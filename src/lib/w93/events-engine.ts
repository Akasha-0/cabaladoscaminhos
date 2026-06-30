// ============================================================================
// W93-D — EVENTS ENGINE
// ----------------------------------------------------------------------------
// CRUD de eventos + RSVP (com waitlist) + cancelamento + notificações.
//
// Princípios:
//   - Pure functions quando possível; efeitos colaterais (notif, prisma)
//     via callback injetado, permitindo teste sem DB.
//   - Determinístico: clock injetado via `now: () => Date` (default Date.now).
//   - LGPD: RSVP storage NÃO armazena email — apenas userId. Output público
//     exporta Rsvp sem email/payload.
//   - Sacred-cultural: aceita apenas `EventKind` pt-BR. NÃO traduz.
//
// IDs são UUID v4-like (randomUUID) por padrão; engine aceita override
// `idFactory` para testes determinísticos.
// ============================================================================

import {
  eventId as toEventId,
  rsvpId as toRsvpId,
  type Event,
  type EventDraft,
  type EventId,
  type EventsNotification,
  type EventsNotificationKind,
  type Host,
  type Rsvp,
  type RsvpId,
  type RsvpInput,
  type RsvpStatus,
  type SignupStatus,
  type UserId,
  type WorkshopId,
  EventsError,
} from './events-types.ts';

// ============================================================================
// Engine config
// ============================================================================

export interface EventsEngineConfig {
  /** Relógio — default `Date.now` (ms). */
  now?: () => number;
  /** Factory de UUID — default `crypto.randomUUID`. */
  idFactory?: () => string;
  /**
   * Hook de notificação. Engine emite eventos estruturados (RSVP criado,
   * waitlist promovido, etc) sem tocar no sistema de notif real. O
   * consumidor (W91-A) faz a integração com Prisma/email/push.
   */
  notifier?: (n: EventsNotification) => void;
  /** Logger opcional (default no-op). */
  log?: (msg: string, meta?: Record<string, unknown>) => void;
}

export interface CreateEngineConfig {
  now?: () => number;
  idFactory?: () => string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function defaultIdFactory(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback pseudo-UUID (sufficient for in-memory store; not used in prod)
  const hex = (n: number) => n.toString(16).padStart(2, '0');
  const r = (n: number) => Array.from({ length: n }, () => hex(Math.floor(Math.random() * 256))).join('');
  return `${r(4)}-${r(2)}-${r(2)}-${r(2)}-${r(6)}`;
}

// ============================================================================
// Capacity / waitlist helpers
// ============================================================================

export interface CapacityResult {
  status: SignupStatus;
  remainingSeats: number;
  /** Tamanho atual da waitlist (0 se signup aberto). */
  waitlistSize: number;
}

/**
 * Calcula status agregado de signup dada capacidade e contagens atuais.
 * `nowMs` usado para fechar inscrições se evento já passou.
 */
export function computeSignupStatus(args: {
  capacity: number;
  confirmedCount: number;
  waitlistCount: number;
  startsAt: string;
  nowMs: number;
  /** Se true, inscrições manualmente fechadas pelo organizador. */
  closedByOrganizer?: boolean;
}): CapacityResult {
  const { capacity, confirmedCount, waitlistCount, startsAt, nowMs, closedByOrganizer } = args;

  if (closedByOrganizer) {
    return { status: 'closed', remainingSeats: 0, waitlistSize: waitlistCount };
  }

  const eventStart = Date.parse(startsAt);
  if (Number.isFinite(eventStart) && eventStart <= nowMs) {
    return { status: 'closed', remainingSeats: 0, waitlistSize: waitlistCount };
  }

  // capacity = 0 significa ilimitado (sempre aberto enquanto não passou)
  if (capacity === 0) {
    return { status: 'open', remainingSeats: Number.POSITIVE_INFINITY, waitlistSize: 0 };
  }

  if (confirmedCount >= capacity) {
    return { status: 'waitlist', remainingSeats: 0, waitlistSize: waitlistCount };
  }

  return {
    status: 'open',
    remainingSeats: capacity - confirmedCount,
    waitlistSize: 0,
  };
}

// ============================================================================
// EventsEngine — estado em memória + métodos
// ============================================================================

export class EventsEngine {
  private events = new Map<EventId, Event>();
  private rsvps = new Map<RsvpId, Rsvp>();
  /** RSVPs indexados por eventId → ordem de inserção (FIFO para waitlist). */
  private rsvpsByEvent = new Map<EventId, RsvpId[]>();
  private readonly now: () => number;
  private readonly idFactory: () => string;
  private readonly notifier: (n: EventsNotification) => void;
  private readonly log: (msg: string, meta?: Record<string, unknown>) => void;

  constructor(config: EventsEngineConfig = {}) {
    this.now = config.now ?? (() => Date.now());
    this.idFactory = config.idFactory ?? defaultIdFactory;
    this.notifier = config.notifier ?? (() => {});
    this.log = config.log ?? (() => {});
  }

  // ============================================================
  // Validation helpers
  // ============================================================

  private assertValidDates(startsAt: string, endsAt: string): void {
    const s = Date.parse(startsAt);
    const e = Date.parse(endsAt);
    if (!Number.isFinite(s)) {
      throw new EventsError('INVALID_DATES', `startsAt inválido: ${startsAt}`);
    }
    if (!Number.isFinite(e)) {
      throw new EventsError('INVALID_DATES', `endsAt inválido: ${endsAt}`);
    }
    if (e <= s) {
      throw new EventsError('INVALID_DATES', 'endsAt deve ser maior que startsAt', {
        startsAt,
        endsAt,
      });
    }
  }

  private assertValidCapacity(capacity: number): void {
    if (!Number.isInteger(capacity) || capacity < 0) {
      throw new EventsError('INVALID_CAPACITY', `capacity deve ser inteiro ≥ 0 (got ${capacity})`);
    }
  }

  // ============================================================
  // CREATE event
  // ============================================================

  /**
   * Cria evento. `draft` vem sem `createdAt`/`updatedAt` (engine preenche).
   * Validações:
   *   - dates: startsAt < endsAt
   *   - capacity ≥ 0
   *   - id não pode colidir
   * Retorna Event completo (com signupStatus, confirmedCount, waitlistCount).
   */
  create(draft: EventDraft): Event {
    this.assertValidDates(draft.startsAt, draft.endsAt);
    this.assertValidCapacity(draft.capacity);

    const id = toEventId(draft.id);
    if (this.events.has(id)) {
      throw new EventsError('INVALID_DATES', `evento com id ${id} já existe`, { id });
    }

    const nowMs = this.now();
    const nowIso = new Date(nowMs).toISOString();
    const status = computeSignupStatus({
      capacity: draft.capacity,
      confirmedCount: 0,
      waitlistCount: 0,
      startsAt: draft.startsAt,
      nowMs,
    });

    const ev: Event = {
      ...draft,
      id,
      createdAt: draft.createdAt ?? nowIso,
      updatedAt: draft.updatedAt ?? nowIso,
      signupStatus: status.status,
      confirmedCount: 0,
      waitlistCount: 0,
      closedByOrganizer: false,
    };

    this.events.set(id, ev);
    this.rsvpsByEvent.set(id, []);
    this.log('event.created', { id, slug: ev.slug, kind: ev.kind });
    return ev;
  }

  // ============================================================
  // READ
  // ============================================================

  get(id: EventId): Event {
    const e = this.events.get(id);
    if (!e) throw new EventsError('EVENT_NOT_FOUND', `evento ${id} não encontrado`);
    return this.refreshStatus(e);
  }

  getBySlug(slug: string): Event | undefined {
    for (const e of this.events.values()) {
      if (e.slug === slug) return this.refreshStatus(e);
    }
    return undefined;
  }

  /**
   * Lista eventos aplicando filtros. Filtros opcionais são AND-combined.
   * `from`/`to` filtram por startsAt (inclusive).
   * Ordenação: startsAt asc.
   */
  list(filter: {
    kind?: Event['kind'];
    tradition?: Event['tradition'];
    modality?: Event['location']['kind'];
    from?: string;
    to?: string;
    /** Se true, retorna só eventos futuros (>= now). */
    upcomingOnly?: boolean;
    /** Se definido, retorna só eventos cujo host.id === hostId. */
    hostId?: UserId;
  } = {}): Event[] {
    const nowMs = this.now();
    const fromMs = filter.from ? Date.parse(filter.from) : Number.NEGATIVE_INFINITY;
    const toMs = filter.to ? Date.parse(filter.to) : Number.POSITIVE_INFINITY;

    const out: Event[] = [];
    for (const e of this.events.values()) {
      if (filter.kind && e.kind !== filter.kind) continue;
      if (filter.tradition && e.tradition !== filter.tradition) continue;
      if (filter.modality && e.location.kind !== filter.modality) continue;
      if (filter.hostId && e.host.id !== filter.hostId) continue;

      const startMs = Date.parse(e.startsAt);
      if (filter.upcomingOnly && startMs < nowMs) continue;
      if (startMs < fromMs || startMs > toMs) continue;

      out.push(this.refreshStatus(e));
    }
    out.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
    return out;
  }

  /**
   * Retorna o status do signup de um user em um evento (ou null se não
   * existe). Status é derivado do Rsvp atual.
   */
  rsvpStatus(eventId: EventId, userId: UserId): RsvpStatus | null {
    const r = this.findRsvp(eventId, userId);
    return r ? r.status : null;
  }

  /**
   * Lista RSVPs de um evento (uso interno + endpoint organizer).
   * NÃO retorna email ou PII — apenas Rsvp shape.
   */
  listRsvps(eventId: EventId): Rsvp[] {
    const ids = this.rsvpsByEvent.get(eventId) ?? [];
    const out: Rsvp[] = [];
    for (const id of ids) {
      const r = this.rsvps.get(id);
      if (r) out.push(r);
    }
    return out;
  }

  /**
   * Lista RSVPs confirmados de um usuário (para a página /conta/inscricoes).
   */
  listUserRsvps(userId: UserId): Rsvp[] {
    const out: Rsvp[] = [];
    for (const r of this.rsvps.values()) {
      if (r.userId === userId) out.push(r);
    }
    out.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return out;
  }

  // ============================================================
  // RSVP — confirmed / waitlist
  // ============================================================

  /**
   * Inscreve usuário no evento.
   * - Se capacidade disponível: cria Rsvp `confirmed`.
   * - Se lotado: cria Rsvp `waitlist` (FIFO).
   * - Se evento fechado/passado: lança `EVENT_CLOSED` ou `EVENT_PAST`.
   * - Se usuário já tem RSVP ativo: lança `DUPLICATE_RSVP`.
   */
  rsvp(input: RsvpInput): Rsvp {
    const ev = this.get(input.eventId); // valida existência + atualiza status
    const existing = this.findRsvp(input.eventId, input.userId);
    if (existing && existing.status !== 'cancelled') {
      throw new EventsError('DUPLICATE_RSVP', `usuário já inscrito em ${input.eventId}`, {
        eventId: input.eventId,
        userId: input.userId,
        currentStatus: existing.status,
      });
    }

    const nowMs = this.now();
    const eventStart = Date.parse(ev.startsAt);
    if (Number.isFinite(eventStart) && eventStart <= nowMs) {
      throw new EventsError('EVENT_PAST', 'evento já começou ou passou', {
        eventId: input.eventId,
        startsAt: ev.startsAt,
      });
    }

    let status: RsvpStatus;
    let waitlistPosition = 0;

    if (ev.signupStatus === 'closed') {
      throw new EventsError('EVENT_CLOSED', 'inscrições fechadas', {
        eventId: input.eventId,
      });
    }

    if (ev.signupStatus === 'waitlist' || ev.signupStatus === 'full') {
      status = 'waitlist';
      waitlistPosition = ev.waitlistCount + 1;
    } else {
      status = 'confirmed';
    }

    const id = toRsvpId(this.idFactory());
    const nowIso = new Date(nowMs).toISOString();
    const rsvp: Rsvp = {
      id,
      eventId: input.eventId,
      userId: input.userId,
      status,
      createdAt: nowIso,
      updatedAt: nowIso,
      waitlistPosition,
    };

    this.rsvps.set(id, rsvp);
    this.rsvpsByEvent.get(input.eventId)!.push(id);

    // Atualiza contagens no evento
    const updated: Event = { ...ev };
    if (status === 'confirmed') {
      updated.confirmedCount = ev.confirmedCount + 1;
    } else {
      updated.waitlistCount = ev.waitlistCount + 1;
    }
    updated.signupStatus = computeSignupStatus({
      capacity: updated.capacity,
      confirmedCount: updated.confirmedCount,
      waitlistCount: updated.waitlistCount,
      startsAt: updated.startsAt,
      nowMs,
    }).status;
    updated.updatedAt = nowIso;
    this.events.set(updated.id, updated);

    this.emitNotification({
      kind: status === 'confirmed' ? 'rsvp-confirmed' : 'rsvp-waitlisted',
      eventId: input.eventId,
      userId: input.userId,
      preview:
        status === 'confirmed'
          ? `Inscrição confirmada em "${ev.title}"`
          : `Você está na lista de espera de "${ev.title}" (posição ${waitlistPosition})`,
      link: `/eventos/${ev.slug}`,
      payload: {
        eventTitle: ev.title,
        eventSlug: ev.slug,
        startsAt: ev.startsAt,
        waitlistPosition,
      },
    });

    this.log('rsvp.created', { id, eventId: input.eventId, userId: input.userId, status });
    return rsvp;
  }

  /**
   * Cancela um RSVP. Se era `confirmed`, decrementa confirmedCount e
   * tenta promover o primeiro da waitlist para `confirmed` (e emite
   * notificação `waitlist-promoted`).
   */
  cancel(rsvpIdValue: Rsvp['id']): { cancelled: Rsvp; promoted?: Rsvp } {
    const r = this.rsvps.get(rsvpIdValue);
    if (!r) throw new EventsError('RSVP_NOT_FOUND', `rsvp ${rsvpIdValue} não encontrado`);
    if (r.status === 'cancelled') return { cancelled: r };

    const ev = this.events.get(r.eventId);
    if (!ev) throw new EventsError('EVENT_NOT_FOUND', `evento ${r.eventId} desapareceu`);

    const nowMs = this.now();
    const nowIso = new Date(nowMs).toISOString();

    const cancelled: Rsvp = {
      ...r,
      status: 'cancelled',
      updatedAt: nowIso,
      waitlistPosition: 0,
    };
    this.rsvps.set(cancelled.id, cancelled);

    let updated: Event = { ...ev };
    if (r.status === 'confirmed') {
      updated.confirmedCount = Math.max(0, ev.confirmedCount - 1);
    } else if (r.status === 'waitlist') {
      updated.waitlistCount = Math.max(0, ev.waitlistCount - 1);
      // Recalcula posições dos que ficaram na fila
      this.recomputeWaitlistPositions(r.eventId);
    }
    updated.updatedAt = nowIso;

    let promoted: Rsvp | undefined;

    // Se cancelamento liberou vaga e há waitlist, promove o primeiro.
    if (r.status === 'confirmed' && updated.waitlistCount > 0) {
      const firstWaitlist = this.findFirstWaitlist(r.eventId);
      if (firstWaitlist) {
        firstWaitlist.status = 'confirmed';
        firstWaitlist.updatedAt = nowIso;
        firstWaitlist.waitlistPosition = 0;
        this.rsvps.set(firstWaitlist.id, firstWaitlist);
        updated.confirmedCount += 1;
        updated.waitlistCount = Math.max(0, updated.waitlistCount - 1);
        this.recomputeWaitlistPositions(r.eventId);
        promoted = firstWaitlist;

        this.emitNotification({
          kind: 'waitlist-promoted',
          eventId: r.eventId,
          userId: firstWaitlist.userId,
          preview: `Vaga liberada em "${ev.title}". Sua inscrição está confirmada.`,
          link: `/eventos/${ev.slug}`,
          payload: {
            eventTitle: ev.title,
            eventSlug: ev.slug,
            startsAt: ev.startsAt,
          },
        });
      }
    }

    updated.signupStatus = computeSignupStatus({
      capacity: updated.capacity,
      confirmedCount: updated.confirmedCount,
      waitlistCount: updated.waitlistCount,
      startsAt: updated.startsAt,
      nowMs,
    }).status;

    this.events.set(updated.id, updated);

    this.emitNotification({
      kind: 'rsvp-cancelled',
      eventId: r.eventId,
      userId: r.userId,
      preview: `Inscrição cancelada em "${ev.title}".`,
      link: `/eventos/${ev.slug}`,
      payload: {
        eventTitle: ev.title,
        eventSlug: ev.slug,
      },
    });

    this.log('rsvp.cancelled', { id: rsvpIdValue });
    return { cancelled, promoted };
  }

  /**
   * Força cancelamento de todos os RSVPs de um evento (uso organizer).
   * Não emite notificação individual — caller decide.
   */
  cancelAll(eventIdValue: EventId, reason: string): Rsvp[] {
    const ids = this.rsvpsByEvent.get(eventIdValue) ?? [];
    const cancelled: Rsvp[] = [];
    for (const id of ids) {
      const r = this.rsvps.get(id);
      if (r && r.status !== 'cancelled') {
        const nowMs = this.now();
        const nowIso = new Date(nowMs).toISOString();
        const updated: Rsvp = { ...r, status: 'cancelled', updatedAt: nowIso, waitlistPosition: 0 };
        this.rsvps.set(updated.id, updated);
        cancelled.push(updated);
      }
    }
    const ev = this.events.get(eventIdValue);
    if (ev) {
      const nowIso = new Date(this.now()).toISOString();
      const updated: Event = {
        ...ev,
        confirmedCount: 0,
        waitlistCount: 0,
        signupStatus: 'closed',
        closedByOrganizer: true,
        updatedAt: nowIso,
      };
      this.events.set(eventIdValue, updated);
      this.log('rsvp.cancelledAll', { eventId: eventIdValue, reason, count: cancelled.length });
    }
    return cancelled;
  }

  // ============================================================
  // Internals
  // ============================================================

  private findRsvp(eventIdValue: EventId, userIdValue: UserId): Rsvp | undefined {
    for (const r of this.rsvps.values()) {
      if (r.eventId === eventIdValue && r.userId === userIdValue) return r;
    }
    return undefined;
  }

  private findFirstWaitlist(eventIdValue: EventId): Rsvp | undefined {
    const ids = this.rsvpsByEvent.get(eventIdValue) ?? [];
    let best: Rsvp | undefined;
    for (const id of ids) {
      const r = this.rsvps.get(id);
      if (!r) continue;
      if (r.status !== 'waitlist') continue;
      if (!best || r.waitlistPosition < best.waitlistPosition) {
        best = r;
      }
    }
    return best;
  }

  private recomputeWaitlistPositions(eventIdValue: EventId): void {
    const ids = this.rsvpsByEvent.get(eventIdValue) ?? [];
    const waitlisted = ids
      .map((id) => this.rsvps.get(id))
      .filter((r): r is Rsvp => !!r && r.status === 'waitlist')
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    waitlisted.forEach((r, i) => {
      const updated: Rsvp = { ...r, waitlistPosition: i + 1 };
      this.rsvps.set(updated.id, updated);
    });
  }

  private refreshStatus(e: Event): Event {
    const status = computeSignupStatus({
      capacity: e.capacity,
      confirmedCount: e.confirmedCount,
      waitlistCount: e.waitlistCount,
      startsAt: e.startsAt,
      nowMs: this.now(),
      closedByOrganizer: e.closedByOrganizer,
    });
    return { ...e, signupStatus: status.status };
  }

  private emitNotification(args: {
    kind: EventsNotificationKind;
    eventId: EventId;
    workshopId?: WorkshopId;
    sessionId?: string;
    userId: UserId;
    preview: string;
    link: string;
    payload: Record<string, unknown>;
  }): void {
    const n: EventsNotification = {
      kind: args.kind,
      eventId: args.eventId,
      workshopId: args.workshopId,
      sessionId: args.sessionId as EventsNotification['sessionId'],
      userId: args.userId,
      preview: args.preview,
      link: args.link,
      payload: args.payload,
      emittedAt: new Date(this.now()).toISOString(),
    };
    try {
      this.notifier(n);
    } catch (err) {
      // Notifier não pode quebrar o engine. Loga e segue.
      this.log('notifier.error', {
        kind: args.kind,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

// ============================================================================
// Helpers estáticos (uso por UI + API)
// ============================================================================

/** Atalho para criar um Host a partir de input cru. */
export function makeHost(input: {
  id: UserId;
  displayName: string;
  handle?: string;
  traditionLine?: string;
  bio: string;
  avatarUrl?: string;
}): Host {
  const host: Host = { id: input.id, displayName: input.displayName, bio: input.bio };
  if (input.handle !== undefined) host.handle = input.handle;
  if (input.traditionLine !== undefined) host.traditionLine = input.traditionLine;
  if (input.avatarUrl !== undefined) host.avatarUrl = input.avatarUrl;
  return host;
}

/** Validador de UUID (engine aceita qualquer string como ID, mas força formato). */
export function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

/** Converte uma duração em minutos entre duas datas ISO. */
export function diffMinutes(startsAt: string, endsAt: string): number {
  const s = Date.parse(startsAt);
  const e = Date.parse(endsAt);
  if (!Number.isFinite(s) || !Number.isFinite(e)) return 0;
  return Math.max(0, Math.round((e - s) / 60000));
}

// ============================================================================
// Helpers para criação de Event a partir de input "cru" (UI form)
// ============================================================================

export interface NewEventInput {
  slug: string;
  title: string;
  description: string;
  kind: Event['kind'];
  tradition: Event['tradition'];
  startsAt: string;
  endsAt: string;
  location: Event['location'];
  capacity: number;
  priceCents: number | null;
  coverImage: string;
  coverAlt: string;
  host: Host;
  tags?: string[];
  language?: Event['language'];
}

/**
 * Cria um EventDraft com id gerado e durationMin calculado.
 * NÃO insere no engine (use `engine.create(draft)` depois).
 */
export function buildEventDraft(
  input: NewEventInput,
  config: CreateEngineConfig = {},
): EventDraft {
  const idFactory = config.idFactory ?? defaultIdFactory;
  const draft: EventDraft = {
    id: toEventId(idFactory()),
    slug: input.slug,
    title: input.title,
    description: input.description,
    kind: input.kind,
    tradition: input.tradition,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    durationMin: diffMinutes(input.startsAt, input.endsAt),
    location: input.location,
    capacity: input.capacity,
    priceCents: input.priceCents,
    coverImage: input.coverImage,
    coverAlt: input.coverAlt,
    host: input.host,
    language: input.language ?? 'pt-BR',
  };
  if (input.tags !== undefined) draft.tags = input.tags;
  return draft;
}