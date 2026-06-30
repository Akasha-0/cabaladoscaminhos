// ============================================================================
// W81-B — events-rsvp-engine
// ----------------------------------------------------------------------------
// Pure logic for the events RSVP UI. NO React imports. Engine is consumed
// by the React components (events-rsvp-ui.tsx) AND by the spec harness.
//
// Responsibilities:
//   1. Branded ID types (EventId, UserId, RsvpId)
//   2. RSVP state machine (idle | submitting | confirmed | waitlisted | rejected | cancelling)
//   3. Capacity arithmetic (free seats, waitlist position, promotion)
//   4. 7-tradition event-type labels (gira, mutirão, ponto, caboclo, prece, mantra, leitura)
//   5. Audit trail (HMAC-SHA-256 chain over canonical JSON)
//
// Patterns inherited from prior cycles:
//   - Object.freeze every record before return (cycle 75)
//   - Discriminated union + narrowing helpers (cycle 73)
//   - Branded ID factories with regex prefix (cycle 77)
//   - Canonical JSON for HMAC (cycle 60, 67)
// ============================================================================

import { createHmac, randomUUID } from 'node:crypto';

// ============================================================================
// Branded types
// ============================================================================

export type EventId = string & { readonly __brand: 'EventId' };
export type UserId = string & { readonly __brand: 'UserId' };
export type RsvpId = string & { readonly __brand: 'RsvpId' };
export type WaitlistToken = string & { readonly __brand: 'WaitlistToken' };

const EVENT_ID_RE = /^ev_[a-z0-9_-]{2,64}$/;
const USER_ID_RE = /^usr_[a-z0-9_-]{2,64}$/;
const RSVP_ID_RE = /^rsvp_[a-z0-9_-]{2,64}$/;
const WAITLIST_TOKEN_RE = /^wl_[a-z0-9_-]{2,64}$/;

export function makeEventId(raw: string): EventId {
  if (!EVENT_ID_RE.test(raw)) {
    throw new Error(`Invalid EventId: ${raw}`);
  }
  return raw as EventId;
}
export function makeUserId(raw: string): UserId {
  if (!USER_ID_RE.test(raw)) {
    throw new Error(`Invalid UserId: ${raw}`);
  }
  return raw as UserId;
}
export function makeRsvpId(raw: string): RsvpId {
  if (!RSVP_ID_RE.test(raw)) {
    throw new Error(`Invalid RsvpId: ${raw}`);
  }
  return raw as RsvpId;
}
export function makeWaitlistToken(raw: string): WaitlistToken {
  if (!WAITLIST_TOKEN_RE.test(raw)) {
    throw new Error(`Invalid WaitlistToken: ${raw}`);
  }
  return raw as WaitlistToken;
}

/** Soft validators — return null on invalid (no throw). For UI forms. */
export function tryParseEventId(raw: string): EventId | null {
  return EVENT_ID_RE.test(raw) ? (raw as EventId) : null;
}
export function tryParseUserId(raw: string): UserId | null {
  return USER_ID_RE.test(raw) ? (raw as UserId) : null;
}

// ============================================================================
// 7-tradition event-type labels (PT-BR)
// ============================================================================

/** Tradition codes recognized by the events module */
export type TraditionCode =
  | 'cigano'
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra';

export type EventKind =
  | 'gira'
  | 'mutirao'
  | 'ponto'
  | 'caboclo'
  | 'prece'
  | 'mantra'
  | 'leitura';

export interface TraditionKindLabel {
  readonly kind: EventKind;
  readonly label: string;
  readonly iconHint: string;
  readonly description: string;
}

export const TRADITION_KIND_LABELS: Readonly<Record<TraditionCode, readonly TraditionKindLabel[]>> =
  Object.freeze({
    cigano: Object.freeze([
      Object.freeze({
        kind: 'leitura',
        label: 'Leitura de Cartas',
        iconHint: '\uD83C\uDCA4',
        description: 'Tiragem cigana — aberta, fechadas, cruz, grande quadro.',
      }),
      Object.freeze({
        kind: 'prece',
        label: 'Prece Cigana',
        iconHint: '\uD83C\uDF19',
        description: 'Oração ao Santo Padroeiro cigano do consulente.',
      }),
    ]),
    candomble: Object.freeze([
      Object.freeze({
        kind: 'gira',
        label: 'Gira',
        iconHint: '\uD83E\uDD41',
        description: 'Ritual de terreiro com atabaques, cantos em iorubá e orixás.',
      }),
      Object.freeze({
        kind: 'ponto',
        label: 'Ponto Cantado',
        iconHint: '\uD83C\uDFB5',
        description: 'Cantos em iorubá,祭祀 e assentamento de orixá.',
      }),
    ]),
    umbanda: Object.freeze([
      Object.freeze({
        kind: 'gira',
        label: 'Gira de Caboclo',
        iconHint: '\uD83C\uDF3F',
        description: 'Sessão com linha de caboclo, preto-velho e criança.',
      }),
      Object.freeze({
        kind: 'ponto',
        label: 'Ponto Risacado',
        iconHint: '\uD83C\uDFB6',
        description: 'Ponto riscado e cantado, defumação com ervas.',
      }),
    ]),
    ifa: Object.freeze([
      Object.freeze({
        kind: 'mutirao',
        label: 'Mutirão de Ifá',
        iconHint: '\uD83E\uDDE8',
        description: 'Jogo de búzios coletivo, oferendas orientadas pelos Odus.',
      }),
      Object.freeze({
        kind: 'prece',
        label: 'Oração a Orunmilá',
        iconHint: '\u2600\uFE0F',
        description: 'Prece de abertura e consulta com babalawô.',
      }),
    ]),
    cabala: Object.freeze([
      Object.freeze({
        kind: 'leitura',
        label: 'Leitura da Árvore',
        iconHint: '\uD83C\uDF33',
        description: 'Estudo das 10 Sephiroth e 22 Caminhos.',
      }),
      Object.freeze({
        kind: 'prece',
        label: 'Meditação Cabalística',
        iconHint: '\u2721\uFE0F',
        description: 'Contemplação dos nomes divinos.',
      }),
    ]),
    astrologia: Object.freeze([
      Object.freeze({
        kind: 'leitura',
        label: 'Leitura de Mapa',
        iconHint: '\u2B50',
        description: 'Interpretação de mapa natal, sinastria ou trânsitos.',
      }),
      Object.freeze({
        kind: 'prece',
        label: 'Meditação Planetária',
        iconHint: '\uD83E\uDE90',
        description: 'Contemplação guiada por signo ou planeta.',
      }),
    ]),
    tantra: Object.freeze([
      Object.freeze({
        kind: 'mantra',
        label: 'Mantra',
        iconHint: '\uD83D\uDE49',
        description: 'Canto de mantra com respiração tântrica.',
      }),
      Object.freeze({
        kind: 'prece',
        label: 'Meditação Kundalini',
        iconHint: '\uD83D\uDC0D',
        description: 'Trabalho de subida de energia pelos chakras.',
      }),
    ]),
  });

/** Resolve the label for a given tradition + kind combo, or null if unknown. */
export function labelFor(tradition: TraditionCode, kind: EventKind): TraditionKindLabel | null {
  const list = TRADITION_KIND_LABELS[tradition];
  return list.find((l) => l.kind === kind) ?? null;
}

/** All labels for a tradition (used in dropdowns). */
export function labelsForTradition(tradition: TraditionCode): readonly TraditionKindLabel[] {
  return TRADITION_KIND_LABELS[tradition];
}

// ============================================================================
// RSVP state machine
// ============================================================================

export type RsvpPhase =
  | 'idle'
  | 'submitting'
  | 'confirmed'
  | 'waitlisted'
  | 'rejected'
  | 'cancelling'
  | 'attended'
  | 'no_show';

export interface RsvpRecord {
  readonly id: RsvpId;
  readonly eventId: EventId;
  readonly userId: UserId;
  readonly phase: RsvpPhase;
  readonly waitlistPosition: number | null;
  readonly waitlistToken: WaitlistToken | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly cancelledReason?: string;
}

/** Valid transitions in the state machine. */
const TRANSITIONS: Readonly<Record<RsvpPhase, readonly RsvpPhase[]>> = Object.freeze({
  idle: Object.freeze<RsvpPhase[]>(['submitting']),
  submitting: Object.freeze<RsvpPhase[]>(['confirmed', 'waitlisted', 'rejected', 'idle']),
  confirmed: Object.freeze<RsvpPhase[]>(['cancelling', 'attended', 'no_show']),
  waitlisted: Object.freeze<RsvpPhase[]>(['cancelling', 'confirmed', 'rejected']),
  rejected: Object.freeze<RsvpPhase[]>(['idle']),
  cancelling: Object.freeze<RsvpPhase[]>(['idle']),
  attended: Object.freeze<RsvpPhase[]>([]),
  no_show: Object.freeze<RsvpPhase[]>([]),
});

export function canTransition(from: RsvpPhase, to: RsvpPhase): boolean {
  return TRANSITIONS[from].includes(to);
}

export interface RsvpTransitionResult {
  readonly ok: boolean;
  readonly record: RsvpRecord;
  readonly error?: string;
}

/** Apply a transition, returning a new frozen record. Throws on illegal transitions
 *  if `strict` is true (default). Use strict=false for speculative state-machine
 *  diagrams in the UI. */
export function transition(
  current: RsvpRecord,
  to: RsvpPhase,
  now: string = new Date().toISOString(),
  strict: boolean = true,
): RsvpTransitionResult {
  if (!canTransition(current.phase, to)) {
    if (strict) {
      throw new Error(`Illegal transition: ${current.phase} -> ${to}`);
    }
    return Object.freeze({ ok: false, record: current, error: `Illegal: ${current.phase}->${to}` });
  }
  const next: RsvpRecord = Object.freeze({
    ...current,
    phase: to,
    updatedAt: now,
  });
  return Object.freeze({ ok: true, record: next });
}

// ============================================================================
// Capacity arithmetic
// ============================================================================

export interface CapacitySnapshot {
  readonly capacity: number;
  readonly confirmed: number;
  readonly waitlist: number;
}

export interface CapacityView {
  readonly isUnlimited: boolean;
  readonly seatsTotal: number;
  readonly seatsTaken: number;
  readonly seatsFree: number;
  readonly percentFull: number;
  readonly waitlistOpen: boolean;
  readonly waitlistSize: number;
  readonly status: 'free' | 'last_seats' | 'full' | 'unlimited';
}

/** Compute a UI-ready view from a snapshot. `capacity=0` means unlimited. */
export function computeCapacity(snap: CapacitySnapshot): CapacityView {
  if (snap.capacity === 0) {
    return Object.freeze({
      isUnlimited: true,
      seatsTotal: 0,
      seatsTaken: snap.confirmed,
      seatsFree: Number.POSITIVE_INFINITY,
      percentFull: 0,
      waitlistOpen: false,
      waitlistSize: 0,
      status: 'unlimited',
    });
  }
  const seatsTaken = Math.min(snap.confirmed, snap.capacity);
  const seatsFree = Math.max(0, snap.capacity - seatsTaken);
  const percentFull = snap.capacity > 0 ? Math.round((seatsTaken / snap.capacity) * 100) : 0;
  const status: CapacityView['status'] =
    seatsFree === 0 ? 'full' : seatsFree <= 3 ? 'last_seats' : 'free';
  return Object.freeze({
    isUnlimited: false,
    seatsTotal: snap.capacity,
    seatsTaken,
    seatsFree,
    percentFull,
    waitlistOpen: seatsFree === 0,
    waitlistSize: snap.waitlist,
    status,
  });
}

/** Position 1-indexed. Returns null if not on waitlist. */
export function waitlistPositionOf(record: RsvpRecord | null): number | null {
  if (!record) return null;
  if (record.phase !== 'waitlisted') return null;
  return record.waitlistPosition && record.waitlistPosition > 0 ? record.waitlistPosition : null;
}

// ============================================================================
// Submit attempt — pure transition (no I/O)
// ============================================================================

export interface SubmitAttempt {
  readonly eventId: EventId;
  readonly userId: UserId;
  readonly capacity: CapacitySnapshot;
  readonly now?: string;
}

export interface SubmitOutcome {
  readonly ok: boolean;
  readonly rsvp: RsvpRecord;
  readonly error?: string;
}

export function attemptSubmit(input: SubmitAttempt): SubmitOutcome {
  const now = input.now ?? new Date().toISOString();
  const view = computeCapacity(input.capacity);

  // Draft record — starts as submitting
  const draft: RsvpRecord = Object.freeze({
    id: makeRsvpId(`rsvp_${randomUUID().slice(0, 12)}`),
    eventId: input.eventId,
    userId: input.userId,
    phase: 'submitting',
    waitlistPosition: null,
    waitlistToken: null,
    createdAt: now,
    updatedAt: now,
  });

  if (view.isUnlimited) {
    const confirmed = transition(draft, 'confirmed', now, true).record;
    return Object.freeze({ ok: true, rsvp: confirmed });
  }
  if (view.status === 'full') {
    // Capacity reached — go to waitlist
    const next = makeWaitlistToken(`wl_${randomUUID().slice(0, 12)}`);
    const position = view.waitlistSize + 1;
    const waitlisted: RsvpRecord = Object.freeze({
      ...draft,
      phase: 'waitlisted',
      waitlistToken: next,
      waitlistPosition: position,
    });
    return Object.freeze({
      ok: true,
      rsvp: waitlisted,
      error: position === 1 ? undefined : 'Capacidade cheia. Voce entrou na lista de espera.',
    });
  }
  // Has free seats → confirm
  const confirmed = transition(draft, 'confirmed', now, true).record;
  return Object.freeze({ ok: true, rsvp: confirmed });
}

// ============================================================================
// Waitlist promotion — move head of queue to confirmed when seat frees
// ============================================================================

export interface PromotionInput {
  readonly headRecord: RsvpRecord;
  readonly now?: string;
}

export interface PromotionOutcome {
  readonly ok: boolean;
  readonly record: RsvpRecord;
  readonly promoted: boolean;
}

/** Promote the head of the waitlist to confirmed. Returns the new record. */
export function promoteFromWaitlist(input: PromotionInput): PromotionOutcome {
  const now = input.now ?? new Date().toISOString();
  if (input.headRecord.phase !== 'waitlisted') {
    return Object.freeze({
      ok: false,
      record: input.headRecord,
      promoted: false,
    });
  }
  const promoted = transition(input.headRecord, 'confirmed', now, true).record;
  return Object.freeze({
    ok: true,
    record: Object.freeze({
      ...promoted,
      waitlistPosition: null,
    }),
    promoted: true,
  });
}

// ============================================================================
// Audit ledger — HMAC-SHA-256 chain
// ============================================================================

export interface AuditEvent {
  readonly seq: number;
  readonly eventId: EventId;
  readonly userId: UserId;
  readonly phase: RsvpPhase;
  readonly at: string;
  readonly prevHash: string;
  readonly hash: string;
}

function canonicalJSON(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonicalJSON).join(',') + ']';
  const keys = Object.keys(v as Record<string, unknown>).sort();
  return (
    '{' +
    keys
      .map((k) => JSON.stringify(k) + ':' + canonicalJSON((v as Record<string, unknown>)[k]))
      .join(',') +
    '}'
  );
}

export function hashAuditEvent(event: Omit<AuditEvent, 'hash'>, secret: string): string {
  const payload = canonicalJSON({
    seq: event.seq,
    eventId: event.eventId,
    userId: event.userId,
    phase: event.phase,
    at: event.at,
    prevHash: event.prevHash,
  });
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export interface AppendAuditInput {
  readonly chain: readonly AuditEvent[];
  readonly eventId: EventId;
  readonly userId: UserId;
  readonly phase: RsvpPhase;
  readonly now?: string;
  readonly secret: string;
}

export function appendAudit(input: AppendAuditInput): AuditEvent {
  const now = input.now ?? new Date().toISOString();
  const seq = input.chain.length;
  const prevHash = seq === 0 ? 'GENESIS' : input.chain[seq - 1]!.hash;
  const partial: Omit<AuditEvent, 'hash'> = Object.freeze({
    seq,
    eventId: input.eventId,
    userId: input.userId,
    phase: input.phase,
    at: now,
    prevHash,
  });
  const hash = hashAuditEvent(partial, input.secret);
  return Object.freeze({ ...partial, hash });
}

export function verifyAuditChain(chain: readonly AuditEvent[], secret: string): boolean {
  for (let i = 0; i < chain.length; i++) {
    const e = chain[i]!;
    const expectedPrev = i === 0 ? 'GENESIS' : chain[i - 1]!.hash;
    if (e.prevHash !== expectedPrev) return false;
    const recomputed = hashAuditEvent(
      {
        seq: e.seq,
        eventId: e.eventId,
        userId: e.userId,
        phase: e.phase,
        at: e.at,
        prevHash: e.prevHash,
      },
      secret,
    );
    if (recomputed !== e.hash) return false;
  }
  return true;
}

// ============================================================================
// Misc helpers
// ============================================================================

/** A11Y-friendly label for the RSVP CTA, depending on phase. */
export function ctaLabelFor(phase: RsvpPhase, isFree: boolean): string {
  switch (phase) {
    case 'idle':
      return isFree ? 'Confirmar presenca (gratuito)' : 'Inscrever-se';
    case 'submitting':
      return 'Enviando...';
    case 'confirmed':
      return 'Voce esta inscrita. Cancelar';
    case 'waitlisted':
      return 'Na lista de espera. Sair';
    case 'rejected':
      return 'Inscricao rejeitada. Tentar novamente';
    case 'cancelling':
      return 'Cancelando...';
    case 'attended':
      return 'Presenca confirmada';
    case 'no_show':
      return 'Nao compareceu';
    default:
      return 'Inscrever-se';
  }
}

/** A11Y live region text for screen readers. */
export function a11yAnnounceFor(phase: RsvpPhase): string {
  switch (phase) {
    case 'confirmed':
      return 'Inscricao confirmada. Voce recebera um e-mail com os detalhes.';
    case 'waitlisted':
      return 'Voce entrou na lista de espera. Avisaremos por e-mail se uma vaga abrir.';
    case 'rejected':
      return 'Inscricao rejeitada. Tente novamente mais tarde.';
    case 'idle':
      return 'Pronto para nova inscricao.';
    default:
      return '';
  }
}

/** Initial draft RSVP — used by UI for "not yet submitted" state. */
export function idleRsvp(eventId: EventId, userId: UserId): RsvpRecord {
  const now = new Date().toISOString();
  return Object.freeze({
    id: makeRsvpId(`rsvp_${randomUUID().slice(0, 12)}`),
    eventId,
    userId,
    phase: 'idle',
    waitlistPosition: null,
    waitlistToken: null,
    createdAt: now,
    updatedAt: now,
  });
}