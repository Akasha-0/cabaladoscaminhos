// ============================================================================
// W93-D — WORKSHOPS ENGINE
// ----------------------------------------------------------------------------
// Workshops multi-sessão. Cada workshop tem N sessões (módulos/encontros),
// cada uma com sua data, duração e capacidade.
//
// Design:
//   - Sessões derivam de eventos quando há evento pai (1:1 opcional).
//   - Quando uma sessão NÃO tem evento, o workshop engine gerencia
//     attendance direto (RSVP simplificado por sessão).
//   - RSVP do workshop inteiro = RSVP em todas as sessões (derivado).
//   - Capacidade por sessão pode ser menor que workshop (override).
//
// O engine NÃO duplica lógica de RSVP — delega para EventsEngine quando
// sessão tem `eventId`. Para sessões standalone (sem evento), mantém
// um mapa interno `sessionAttendance: Map<SessionId, Set<UserId>>`.
// ============================================================================

import {
  type EventId,
  type EventsNotification,
  type SessionId,
  type UserId,
  type Workshop,
  type WorkshopDraft,
  type WorkshopId,
  type WorkshopSession,
  EventsError,
  sessionId as toSessionId,
  workshopId as toWorkshopId,
} from './events-types.ts';

import { diffMinutes } from './events-engine.ts';

// ============================================================================
// Config
// ============================================================================

export interface WorkshopsEngineConfig {
  now?: () => number;
  idFactory?: () => string;
  notifier?: (n: EventsNotification) => void;
  log?: (msg: string, meta?: Record<string, unknown>) => void;
}

function defaultIdFactory(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const hex = (n: number) => n.toString(16).padStart(2, '0');
  const r = (n: number) =>
    Array.from({ length: n }, () => hex(Math.floor(Math.random() * 256))).join('');
  return `${r(4)}-${r(2)}-${r(2)}-${r(2)}-${r(6)}`;
}

// ============================================================================
// WorkshopsEngine
// ============================================================================

export interface WorkshopAttendance {
  sessionId: SessionId;
  userId: UserId;
  attendedAt: string;
}

export interface SessionCapacity {
  sessionId: SessionId;
  capacity: number; // 0 = ilimitado
  confirmedCount: number;
  waitlistCount: number;
}

export class WorkshopsEngine {
  private workshops = new Map<string, Workshop>();
  /** sessionId → Set<userId> (confirmed only) */
  private attendance = new Map<SessionId, Set<UserId>>();
  /** sessionId → array de userIds em waitlist (FIFO) */
  private waitlist = new Map<SessionId, UserId[]>();
  private readonly now: () => number;
  private readonly idFactory: () => string;
  private readonly notifier: (n: EventsNotification) => void;
  private readonly log: (msg: string, meta?: Record<string, unknown>) => void;

  constructor(config: WorkshopsEngineConfig = {}) {
    this.now = config.now ?? (() => Date.now());
    this.idFactory = config.idFactory ?? defaultIdFactory;
    this.notifier = config.notifier ?? (() => {});
    this.log = config.log ?? (() => {});
  }

  // ============================================================
  // CREATE workshop
  // ============================================================

  /**
   * Cria workshop + suas sessões. Cada sessão recebe `id` próprio.
   * Se uma sessão já tem `eventId`, ela é marcada como sincronizada
   * com evento (RSVP delegado a EventsEngine).
   * Validações:
   *   - Ao menos 1 sessão
   *   - Datas válidas (cada sessão startsAt < endsAt)
   *   - Ordem única e monotônica
   *   - capacity ≥ 0
   */
  create(draft: WorkshopDraft): Workshop {
    if (!draft.sessions || draft.sessions.length === 0) {
      throw new EventsError('NO_SESSIONS', 'workshop precisa ter ao menos 1 sessão');
    }
    if (draft.capacity < 0 || !Number.isInteger(draft.capacity)) {
      throw new EventsError('INVALID_CAPACITY', `capacity deve ser inteiro ≥ 0 (got ${draft.capacity})`);
    }

    const id = toWorkshopId(draft.id);
    if (this.workshops.has(id)) {
      throw new EventsError('INVALID_DATES', `workshop com id ${id} já existe`, { id });
    }

    const nowMs = this.now();
    const nowIso = new Date(nowMs).toISOString();

    // Valida ordem única + datas
    const seenOrders = new Set<number>();
    const sessions: WorkshopSession[] = [];
    for (const s of draft.sessions) {
      if (seenOrders.has(s.order)) {
        throw new EventsError('INVALID_DATES', `sessão com order=${s.order} duplicada`, {
          workshopId: id,
        });
      }
      seenOrders.add(s.order);

      const startMs = Date.parse(s.startsAt);
      const endMs = Date.parse(s.endsAt);
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
        throw new EventsError('INVALID_DATES', `sessão ${s.title} tem datas inválidas`, {
          workshopId: id,
          sessionTitle: s.title,
        });
      }

      const sid = toSessionId(this.idFactory());
      const capacityOverride =
        s.capacityOverride !== undefined && s.capacityOverride !== null
          ? s.capacityOverride
          : 0;

      const session: WorkshopSession = {
        id: sid,
        workshopId: id,
        title: s.title,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        durationMin:
          s.durationMin !== undefined && s.durationMin !== null
            ? s.durationMin
            : diffMinutes(s.startsAt, s.endsAt),
        capacityOverride,
        order: s.order,
      };
      if (s.description !== undefined) session.description = s.description;
      if (s.eventId !== undefined) session.eventId = s.eventId;

      sessions.push(session);
      this.attendance.set(sid, new Set());
      this.waitlist.set(sid, []);
    }

    sessions.sort((a, b) => a.order - b.order);

    const w: Workshop = {
      ...draft,
      id,
      sessions,
      createdAt: draft.createdAt ?? nowIso,
      updatedAt: draft.updatedAt ?? nowIso,
    };
    this.workshops.set(id, w);

    this.log('workshop.created', { id, slug: w.slug, sessions: sessions.length });
    return w;
  }

  // ============================================================
  // READ
  // ============================================================

  get(id: Workshop['id']): Workshop {
    const w = this.workshops.get(id);
    if (!w) throw new EventsError('WORKSHOP_NOT_FOUND', `workshop ${id} não encontrado`);
    return w;
  }

  getBySlug(slug: string): Workshop | undefined {
    for (const w of this.workshops.values()) {
      if (w.slug === slug) return w;
    }
    return undefined;
  }

  list(filter: {
    tradition?: Workshop['tradition'];
    hostId?: UserId;
    upcomingOnly?: boolean;
  } = {}): Workshop[] {
    const nowMs = this.now();
    const out: Workshop[] = [];
    for (const w of this.workshops.values()) {
      if (filter.tradition && w.tradition !== filter.tradition) continue;
      if (filter.hostId && w.host.id !== filter.hostId) continue;
      if (filter.upcomingOnly) {
        const last = w.sessions[w.sessions.length - 1];
        if (last && Date.parse(last.endsAt) < nowMs) continue;
      }
      out.push(w);
    }
    out.sort((a, b) => {
      const fa = a.sessions[0]?.startsAt ?? '';
      const fb = b.sessions[0]?.startsAt ?? '';
      return Date.parse(fa) - Date.parse(fb);
    });
    return out;
  }

  // ============================================================
  // ATTENDANCE — para sessões SEM eventId
  // ============================================================

  /**
   * Inscreve usuário em uma sessão standalone (sem eventId).
   * Lança `CAPACITY_FULL` se lotado e não houver waitlist policy (default: rejeita).
   *
   * Para sessões COM eventId, o caller DEVE usar EventsEngine.rsvp() —
   * este engine NÃO delega (mantém isolamento).
   */
  attend(args: { sessionId: SessionId; userId: UserId; allowWaitlist?: boolean }): {
    status: 'confirmed' | 'waitlist' | 'duplicate';
    position?: number;
  } {
    const session = this.findSession(args.sessionId);
    if (!session) throw new EventsError('INVALID_DATES', `sessão ${args.sessionId} não encontrada`);

    if (session.eventId) {
      throw new EventsError(
        'INVALID_DATES',
        'sessão tem eventId; use EventsEngine.rsvp() para esta sessão',
        { sessionId: args.sessionId, eventId: session.eventId },
      );
    }

    const attendees = this.attendance.get(args.sessionId)!;
    if (attendees.has(args.userId)) return { status: 'duplicate' };

    const cap = session.capacityOverride;
    if (cap === 0 || attendees.size < cap) {
      attendees.add(args.userId);
      this.emitNotification({
        kind: 'rsvp-confirmed',
        eventId: session.eventId ?? ('' as EventId),
        workshopId: session.workshopId,
        sessionId: args.sessionId,
        userId: args.userId,
        preview: `Presença confirmada em "${session.title}"`,
        link: `/workshops/${this.get(session.workshopId).slug}`,
        payload: {
          sessionTitle: session.title,
          workshopSlug: this.get(session.workshopId).slug,
        },
      });
      return { status: 'confirmed' };
    }

    if (!args.allowWaitlist) {
      throw new EventsError('CAPACITY_FULL', `sessão ${args.sessionId} está lotada`, {
        sessionId: args.sessionId,
        capacity: cap,
      });
    }

    const queue = this.waitlist.get(args.sessionId)!;
    if (!queue.includes(args.userId)) queue.push(args.userId);
    this.emitNotification({
      kind: 'rsvp-waitlisted',
      eventId: session.eventId ?? ('' as EventId),
      workshopId: session.workshopId,
      sessionId: args.sessionId,
      userId: args.userId,
      preview: `Você está na lista de espera de "${session.title}" (posição ${queue.length})`,
      link: `/workshops/${this.get(session.workshopId).slug}`,
      payload: {
        sessionTitle: session.title,
        workshopSlug: this.get(session.workshopId).slug,
        position: queue.length,
      },
    });
    return { status: 'waitlist', position: queue.length };
  }

  /**
   * Remove attendance de uma sessão (cancelamento).
   */
  unattend(args: { sessionId: SessionId; userId: UserId }): boolean {
    const attendees = this.attendance.get(args.sessionId);
    if (!attendees) return false;
    if (!attendees.has(args.userId)) return false;
    attendees.delete(args.userId);

    // Promove primeiro da waitlist se houver
    const queue = this.waitlist.get(args.sessionId) ?? [];
    const promoted = queue.shift();
    if (promoted) {
      attendees.add(promoted);
      this.emitNotification({
        kind: 'waitlist-promoted',
        eventId: ('' as EventId),
        workshopId: this.findSession(args.sessionId)?.workshopId,
        sessionId: args.sessionId,
        userId: promoted,
        preview: `Vaga liberada em uma sessão do workshop. Sua presença está confirmada.`,
        link: `/workshops`,
        payload: { promotedFromWaitlist: true },
      });
    }
    return true;
  }

  /**
   * Lista presença confirmada em uma sessão (sem emails, sem PII).
   */
  listAttendance(sessionIdValue: SessionId): UserId[] {
    const attendees = this.attendance.get(sessionIdValue);
    return attendees ? Array.from(attendees) : [];
  }

  /**
   * Lista presença confirmada em todas as sessões de um workshop.
   * Output inclui apenas userIds (LGPD-safe).
   */
  listWorkshopAttendance(workshopIdValue: Workshop['id']): WorkshopAttendance[] {
    const w = this.get(workshopIdValue);
    const out: WorkshopAttendance[] = [];
    const nowMs = this.now();
    const attendedAt = new Date(nowMs).toISOString();
    for (const s of w.sessions) {
      const set = this.attendance.get(s.id);
      if (!set) continue;
      for (const uid of set) {
        out.push({ sessionId: s.id, userId: uid, attendedAt });
      }
    }
    return out;
  }

  /**
   * Capacidade efetiva de uma sessão (override > workshop capacity > ilimitado).
   */
  sessionCapacity(sessionIdValue: SessionId): SessionCapacity {
    const s = this.findSession(sessionIdValue);
    if (!s) throw new EventsError('INVALID_DATES', `sessão ${sessionIdValue} não encontrada`);
    const cap = s.capacityOverride; // 0 = ilimitado, NÃO cai pra workshop.capacity (intencional)
    const confirmed = this.attendance.get(sessionIdValue)?.size ?? 0;
    const queue = this.waitlist.get(sessionIdValue) ?? [];
    return {
      sessionId: sessionIdValue,
      capacity: cap,
      confirmedCount: confirmed,
      waitlistCount: queue.length,
    };
  }

  /**
   * Calcula progresso agregado: % de sessões que já aconteceram.
   */
  progress(workshopIdValue: Workshop['id']): {
    totalSessions: number;
    pastSessions: number;
    percent: number;
  } {
    const w = this.get(workshopIdValue);
    const nowMs = this.now();
    let past = 0;
    for (const s of w.sessions) {
      if (Date.parse(s.endsAt) < nowMs) past++;
    }
    const total = w.sessions.length;
    return {
      totalSessions: total,
      pastSessions: past,
      percent: total === 0 ? 0 : Math.round((past / total) * 100),
    };
  }

  // ============================================================
  // ADD SESSION (extensão de workshop existente)
  // ============================================================

  /**
   * Adiciona nova sessão a um workshop existente. Emite notification.
   */
  addSession(workshopIdValue: Workshop['id'], input: {
    title: string;
    description?: string;
    startsAt: string;
    endsAt: string;
    capacityOverride?: number;
    eventId?: EventId;
  }): WorkshopSession {
    const w = this.get(workshopIdValue);
    const maxOrder = w.sessions.reduce((m, s) => Math.max(m, s.order), 0);
    const newOrder = maxOrder + 1;

    const startMs = Date.parse(input.startsAt);
    const endMs = Date.parse(input.endsAt);
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
      throw new EventsError('INVALID_DATES', `sessão ${input.title} tem datas inválidas`);
    }

    const sid = toSessionId(this.idFactory());
    const session: WorkshopSession = {
      id: sid,
      workshopId: workshopIdValue,
      title: input.title,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      durationMin: diffMinutes(input.startsAt, input.endsAt),
      capacityOverride: input.capacityOverride ?? 0,
      order: newOrder,
    };
    if (input.description !== undefined) session.description = input.description;
    if (input.eventId !== undefined) session.eventId = input.eventId;

    const updated: Workshop = {
      ...w,
      sessions: [...w.sessions, session].sort((a, b) => a.order - b.order),
      updatedAt: new Date(this.now()).toISOString(),
    };
    this.workshops.set(workshopIdValue, updated);
    this.attendance.set(sid, new Set());
    this.waitlist.set(sid, []);

    this.emitNotification({
      kind: 'workshop-session-added',
      eventId: input.eventId ?? ('' as EventId),
      workshopId: workshopIdValue,
      sessionId: sid,
      userId: w.host.id,
      preview: `Nova sessão "${input.title}" adicionada ao workshop "${w.title}".`,
      link: `/workshops/${w.slug}`,
      payload: {
        sessionTitle: input.title,
        workshopSlug: w.slug,
        startsAt: input.startsAt,
      },
    });

    this.log('workshop.sessionAdded', { workshopId: workshopIdValue, sessionId: sid });
    return session;
  }

  // ============================================================
  // Internals
  // ============================================================

  private findSession(sessionIdValue: SessionId): WorkshopSession | undefined {
    for (const w of this.workshops.values()) {
      for (const s of w.sessions) {
        if (s.id === sessionIdValue) return s;
      }
    }
    return undefined;
  }

  private emitNotification(args: {
    kind: EventsNotification['kind'];
    eventId: EventId;
    workshopId?: WorkshopId;
    sessionId?: SessionId;
    userId: UserId;
    preview: string;
    link: string;
    payload: Record<string, unknown>;
  }): void {
    const n: EventsNotification = {
      kind: args.kind,
      eventId: args.eventId,
      workshopId: args.workshopId,
      sessionId: args.sessionId,
      userId: args.userId,
      preview: args.preview,
      link: args.link,
      payload: args.payload,
      emittedAt: new Date(this.now()).toISOString(),
    };
    try {
      this.notifier(n);
    } catch (err) {
      this.log('notifier.error', {
        kind: args.kind,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

// ============================================================================
// Static helpers
// ============================================================================

export function buildWorkshopDraft(input: {
  slug: string;
  title: string;
  description: string;
  tradition: Workshop['tradition'];
  host: Workshop['host'];
  coverImage: string;
  coverAlt: string;
  capacity: number;
  priceCents: number | null;
  tags?: string[];
  language?: Workshop['language'];
  sessions: Array<{
    title: string;
    description?: string;
    startsAt: string;
    endsAt: string;
    capacityOverride?: number;
    eventId?: EventId;
  }>;
}, config: { idFactory?: () => string } = {}): WorkshopDraft {
  const idFactory = config.idFactory ?? defaultIdFactory;
  const draft: WorkshopDraft = {
    id: toWorkshopId(idFactory()),
    slug: input.slug,
    title: input.title,
    description: input.description,
    tradition: input.tradition,
    host: input.host,
    coverImage: input.coverImage,
    coverAlt: input.coverAlt,
    capacity: input.capacity,
    priceCents: input.priceCents,
    sessions: input.sessions.map((s, i) => ({
      title: s.title,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      capacityOverride: s.capacityOverride ?? 0,
      order: i + 1,
      ...(s.description !== undefined && { description: s.description }),
      ...(s.eventId !== undefined && { eventId: s.eventId }),
    })),
    language: input.language ?? 'pt-BR',
  };
  if (input.tags !== undefined) draft.tags = input.tags;
  return draft;
}