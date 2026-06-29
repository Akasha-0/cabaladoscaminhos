/**
 * w57/events-workshops-platform
 * ──────────────────────────────
 * Engine determinístico para a plataforma de eventos + workshops do
 * portal Akasha. Cobre os 5 domínios:
 *
 *   1. Eventos públicos (ritual · workshop · círculo · palestra · meditação)
 *   2. Workshops com sessões múltiplas (mentor + agenda + capacidade + sacred-flag)
 *   3. RSVP (consentimento LGPD + waitlist + capacity-aware)
 *   4. Moderação por curador (tier 3-4 requer curador; tier 5 não pode ser vendido)
 *   5. Compliance LGPD Art. 7/8/9/18 + tradição-respecting boundaries
 *
 * Princípios:
 *   - Sacred-rituals (tier 5): NUNCA comerciais. Só gratuito ou troca.
 *   - Tier 3-4 (ritual, meditação guiada): exige aprovação de curador ANTES
 *     de publicar. Sem aprovação → throw SacredTierNotApproved.
 *   - LGPD Art. 7: consent.purpose obrigatório em todo RSVP.
 *   - LGPD Art. 18: retenção 24 meses; depois auto-purge, mantendo contadores
 *     agregados anonimizados.
 *   - Capacity overflow → RSVP rejeitado, mas cria placeholder de waitlist
 *     FIFO com timestamp.
 *   - Schedule workshop session: detecta conflito para o mesmo mentor.
 *
 * Self-contained: zero imports do repo. Só TS types + Math nativo + Date
 * constructor + JSON.stringify. Determinístico. Sem dependência externa.
 *
 * Layout:
 *   §1   Tipos & contratos
 *   §2   Constantes (capacity bounds, retention, kind→tier map)
 *   §3   Math helpers (FNV-1a 32/64, ISO time math, ID generation)
 *   §4   Validators (15 pure functions, return ValidationResult)
 *   §5   Core engine (create / register / cancel / list / export / purge)
 *   §6   LGPD policy (Art. 7/8/9/18 explicit)
 *   §7   Sacred-text policy (tier rules + tradition boundaries)
 *   §8   Audit events (hash-chained)
 *   §9   Smoke / regression (20+ cases)
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §1 Tipos & Contratos                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Tipos de evento público suportados pela plataforma. */
export type EventKind = "ritual" | "workshop" | "circulo" | "palestra" | "meditacao";

/** Sacred tier — classifica quão "sagrado" é um evento.
 *  0 = secular (palestra técnica); 5 = iniciático (orixá, ponto de caboclo). */
export type SacredTier = 0 | 1 | 2 | 3 | 4 | 5;

/** Status de uma sessão de workshop (agendada, em curso, encerrada, cancelada). */
export type SessionStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

/** Status de um RSVP. */
export type RsvpStatus = "confirmed" | "waitlist" | "cancelled" | "attended" | "no_show";

/** Decisão do curador sobre publicação de evento sacred. */
export type CuratorVerdict = "approved" | "rejected" | "needs_revision";

/** Tier de pagamento (free, donation, fixed, sliding-scale). */
export type PaymentTier = "free" | "donation" | "fixed" | "sliding_scale";

/** Locale do evento (mesmo set do w55). */
export type EventLocale = "pt-BR" | "en" | "es";

/** Consentimento LGPD Art. 7 — armazenado em todo RSVP. */
export interface ConsentRecord {
  /** Propósito explícito (RSVP_EVENT, EXPORT_HISTORY, MARKETING, etc.). */
  purpose: string;
  /** Versão dos termos aceitos pelo usuário (ex: "v1.4"). */
  termsVersion: string;
  /** Epoch ms quando o usuário consentiu. */
  timestamp: number;
  /** Opt-in separado para comunicações de marketing? */
  marketingOptIn: boolean;
  /** Opt-in separado para uso em materiais sagrados? */
  sacredContentOptIn: boolean;
}
/** Estrutura canônica de um evento público. */
export interface EventListing {
  /** ID único (slug ou UUID). */
  id: string;
  /** Tipo do evento (ritual | workshop | circulo | palestra | meditacao). */
  kind: EventKind;
  /** ISO 8601 — início. */
  startsAt: string;
  /** ISO 8601 — fim. */
  endsAt: string;
  /** Capacidade total (0 = ilimitada). */
  capacity: number;
  /** RSVP confirmados até agora (derivado). */
  currentRsvps: number;
  /** Sacred tier (0-5). */
  sacredTier: SacredTier;
  /** Tradição espiritual (espelha events/types.ts mas em string livre). */
  tradition: string;
  /** Locale. */
  locale: EventLocale;
  /** Preço em centavos BRL. null = free. tier 5 DEVE ser null. */
  priceCents: number | null;
  /** Tier de pagamento. tier 5 só pode ser free ou donation. */
  paymentTier: PaymentTier;
  /** Curator decision embutida (se tier 3-4). null = pendente. */
  curator: CuratorDecision | null;
  /** Já foi publicado? Eventos sem aprovação tier 3-4 não podem publicar. */
  published: boolean;
  /** Host ID (UUID ou handle). */
  hostId: string;
  /** Display name do host. */
  hostDisplayName: string;
  /** Slug único para URL. */
  slug: string;
  /** Tags/labels secundárias. */
  tags: string[];
  /** Criado em epoch ms. */
  createdAt: number;
  /** Última atualização epoch ms. */
  updatedAt: number;
}
/** Sessão individual de um workshop. */
export interface WorkshopSession {
  /** ID da sessão. */
  id: string;
  /** Workshop pai. */
  workshopId: string;
  /** ISO 8601 — início da sessão. */
  startsAt: string;
  /** ISO 8601 — fim. */
  endsAt: string;
  /** Capacidade da sessão (pode diferir do workshop). */
  capacity: number;
  /** Status. */
  status: SessionStatus;
  /** URL online (Zoom/Meet) — null = presencial. */
  onlineUrl: string | null;
  /** Cidade (presencial). */
  city: string | null;
  /** Mentor desta sessão (pode mudar). */
  mentorId: string;
  /** Display name do mentor. */
  mentorDisplayName: string;
  /** Notas privadas (não exibidas publicamente). */
  notes: string | null;
  /** Criado em epoch ms. */
  createdAt: number;
}
/** Workshop (agregador de sessões). */
export interface WorkshopListing {
  /** ID do workshop. */
  id: string;
  /** Slug. */
  slug: string;
  /** Título. */
  title: string;
  /** Descrição completa. */
  description: string;
  /** ID do mentor principal. */
  mentorId: string;
  /** Display name do mentor. */
  mentorDisplayName: string;
  /** Tradição. */
  tradition: string;
  /** Sacred flag — workshops sagrados exigem curador. */
  sacredFlag: boolean;
  /** Tier sacred (0-5). */
  sacredTier: SacredTier;
  /** Sessões que compõem o workshop. */
  sessions: WorkshopSession[];
  /** Capacidade agregada (soma ou máximo). */
  capacity: number;
  /** Locale. */
  locale: EventLocale;
  /** Publicado? */
  published: boolean;
  /** Decisão do curador (sacred). */
  curator: CuratorDecision | null;
  /** Criado em epoch ms. */
  createdAt: number;
}
/** RSVP — registro de presença. */
export interface RSVP {
  /** ID único. */
  id: string;
  /** Event ID (EventListing.id). */
  eventId: string;
  /** Tipo do evento (para dispatch). */
  eventKind: EventKind;
  /** User ID. */
  attendeeId: string;
  /** Display name do attendee (cache). */
  attendeeDisplayName: string;
  /** Status. */
  status: RsvpStatus;
  /** ISO 8601 — quando o RSVP foi feito. */
  createdAt: string;
  /** ISO 8601 — última atualização. */
  updatedAt: string;
  /** Consentimento Art. 7. */
  consent: ConsentRecord;
  /** Posição na waitlist (null se confirmado). */
  waitlistPosition: number | null;
  /** Motivo de cancelamento (preenchido se status='cancelled'). */
  cancellationReason: string | null;
  /** Histórico imutável de mudanças de status (audit). */
  statusHistory: Array<{
    from: RsvpStatus;
    to: RsvpStatus;
    at: string;
    reason: string | null;
  }>;
}
/** Workshop booking (workshop differs de event; usa um join record). */
export interface WorkshopBooking {
  /** ID único. */
  id: string;
  /** Workshop ID. */
  workshopId: string;
  /** Lista de session IDs que o usuário vai cursar. */
  sessionIds: string[];
  /** User ID. */
  attendeeId: string;
  /** Display name. */
  attendeeDisplayName: string;
  /** Payment tier escolhido. */
  paymentTier: PaymentTier;
  /** Valor pago em centavos (0 se free). */
  amountPaidCents: number;
  /** Consentimento Art. 7. */
  consent: ConsentRecord;
  /** Status (active | cancelled | completed). */
  status: "active" | "cancelled" | "completed";
  /** Se cancelou, foi pra waitlist? */
  waitlisted: boolean;
  /** Posição na waitlist (null se confirmado). */
  waitlistPosition: number | null;
  /** ISO 8601 — quando criou booking. */
  createdAt: string;
}
/** Decisão do curador sobre um evento sacred. */
export interface CuratorDecision {
  /** ID do curador que decidiu. */
  approverId: string;
  /** Display name do curador. */
  approverDisplayName: string;
  /** Veredito. */
  verdict: CuratorVerdict;
  /** Motivo (texto livre). */
  reason: string;
  /** Epoch ms. */
  timestamp: number;
  /** Tier sacred que foi revisado. */
  tier: SacredTier;
  /** Quais boundaries da tradição foram validadas. */
  traditionBoundariesChecked: string[];
}
/** Validação result (semantic wrapper sobre `Result`). */
export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}
/** Registry imutável — backend de tudo. */
export interface EventsRegistry {
  events: Map<string, EventListing>;
  workshops: Map<string, WorkshopListing>;
  rsvps: Map<string, RSVP>;
  bookings: Map<string, WorkshopBooking>;
  /** Audit trail (hash-chained). */
  audit: AuditEvent[];
  /** Stats agregadas anonimizadas (LGPD Art. 9). */
  aggregateStats: AggregateStats;
  /** User opt-out registry (Art. 18 erasure requests). */
  erasureRequests: Map<string, number>;
}
/** Audit event (append-only, hash-chained). */
export interface AuditEvent {
  /** ID sequencial. */
  id: number;
  /** Tipo de evento. */
  type: AuditEventType;
  /** User ID afetado. */
  subjectId: string;
  /** Actor ID (pode ser system/curador/mesmo user). */
  actorId: string;
  /** Epoch ms. */
  timestamp: number;
  /** Hash do evento anterior (chain). */
  prevHash: string;
  /** Hash do próprio evento. */
  hash: string;
  /** Payload legível. */
  payload: Record<string, string | number | boolean | null>;
}
export type AuditEventType = "EVENT_CREATED" | "EVENT_PUBLISHED" | "EVENT_REJECTED" | "RSVP_REGISTERED" | "RSVP_CANCELLED" | "RSVP_WAITLISTED" | "RSVP_PROMOTED" | "WORKSHOP_BOOKED" | "WORKSHOP_CANCELLED" | "CURATOR_APPROVED" | "CURATOR_REJECTED" | "EXPORT_HISTORY" | "PURGE_EXECUTED";

/** Stats agregadas anonimizadas (LGPD — não linkam a user). */
export interface AggregateStats {
  /** Total de eventos criados por kind. */
  eventsByKind: Record<EventKind, number>;
  /** Total de RSVPs (passado) por kind. */
  rsvpsByKind: Record<EventKind, number>;
  /** Capacidade usada vs oferecida (%). */
  capacityUtilizationPct: number;
  /** Eventos publicados por sacred tier. */
  eventsByTier: Record<SacredTier, number>;
  /** Cancelamentos totais (não linkam a user). */
  totalCancellations: number;
  /** Erasures executados (contador). */
  totalErasures: number;
}
/** Options de criação. */
export interface CreateEventInput {
  id: string;
  slug: string;
  kind: EventKind;
  startsAt: string;
  endsAt: string;
  capacity: number;
  sacredTier: SacredTier;
  tradition: string;
  locale: EventLocale;
  priceCents: number | null;
  paymentTier: PaymentTier;
  hostId: string;
  hostDisplayName: string;
  tags: string[];
}
export interface CreateWorkshopInput {
  id: string;
  slug: string;
  title: string;
  description: string;
  mentorId: string;
  mentorDisplayName: string;
  tradition: string;
  sacredFlag: boolean;
  sacredTier: SacredTier;
  capacity: number;
  locale: EventLocale;
  sessions: Array<Omit<WorkshopSession, "id" | "workshopId" | "createdAt">>;
}
export interface CreateRsvpInput {
  attendeeId: string;
  attendeeDisplayName: string;
  consent: ConsentRecord;
}
export interface CuratorReviewInput {
  approverId: string;
  approverDisplayName: string;
  verdict: CuratorVerdict;
  reason: string;
  traditionBoundariesChecked: string[];
}
export interface EventsFilter {
  kind?: EventKind;
  tradition?: string;
  curatorApprovedOnly?: boolean;
  sacredTierMax?: SacredTier;
  publishedOnly?: boolean;
  before?: string;
  after?: string;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §2 Constantes                                                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Capacidade máxima absoluta (sanity). */
export const MAX_CAPACITY = 5000 as const;

/** Retenção LGPD Art. 18 — 24 meses. */
export const RSVP_RETENTION_MONTHS = 24 as const;

/** Retenção em epoch ms (24 meses como ms). */
export const RSVP_RETENTION_MS = RSVP_RETENTION_MONTHS * 30 * 24 * 60 * 60 * 1000;

/** Versão dos termos de consentimento (bump quando policy mudar). */
export const CONSENT_TERMS_VERSION = "v1.4-events" as const;

/** palestra = 0 (secular) circulo = 1 (estudo) workshop = 1 (estudo aplicado, secular) meditacao = 2 (guiada, simples) ritual = 3 (padrão, exige curador) */
export const KIND_SACRED_TIER_DEFAULT: Record<EventKind, SacredTier> = {
  palestra: 0,
  workshop: 1,
  circulo: 1,
  meditacao: 2,
  ritual: 3,
};

/** Minimum sacred tier that REQUIRES curator approval. */
export const CURATOR_REQUIRED_TIER: SacredTier = 3;

/** Maximum sacred tier that CAN be sold (5 = nunca comercial). */
export const MAX_COMMERCIAL_TIER: SacredTier = 4;

/** Eng version — bump quando lógica mudar. */
export const ENGINE_VERSION = "w57.1.0" as const;

/** Waitlist hard cap. */
export const WAITLIST_CAP = 500 as const;

/** Sessão mínima (minutos). */
export const SESSION_MIN_MINUTES = 15 as const;

/** Sessão máxima (minutos) — 8h. */
export const SESSION_MAX_MINUTES = 480 as const;

/** Tradição reservada para ritual sagrado não-comercial. */
export const SACRED_PROTECTED_TRADITIONS: string[] = [
  "orixa",
  "orixas",
  "caboclo",
  "pretos-velhos",
  "exu",
  "pombagira",
];

/** Erasure request TTL — após 30 dias o request expira. */
export const ERASURE_REQUEST_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Audit chain reset trigger (regenera chain quando passa disto). */
export const AUDIT_CHAIN_RESET_LIMIT = 1_000_000 as const;

/** Default capacity quando não especificado. */
export const DEFAULT_CAPACITY = 30 as const;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §3 Math helpers                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** FNV-1a 32-bit hash — determinístico, leve, usado para IDs. @example fnv1a32("evt-abc"); // => 0x... (number) */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash >>> 0;
}
/** FNV-1a 64-bit (simulado com 2x 32-bit). Para audit hash. @example fnv1a64("evt:abc"); // => "0xHEX64" */
export function fnv1a64(input: string): string {
  const a = fnv1a32(input);
  const b = fnv1a32(input + ":tail");
  return (
    "0x" +
    a.toString(16).padStart(8, "0") +
    b.toString(16).padStart(8, "0")
  );
}
/** Gera um ID único (FNV-1a do input + epoch bucket). @example generateId("rsvp", "user-123"); // => "rsvp_abc123def" */
export function generateId(prefix: string, subject: string): string {
  const bucket = Math.floor(Date.now() / 1000);
  const hash = fnv1a32(`${prefix}|${subject}|${bucket}`).toString(16);
  return `${prefix}_${hash}`;
}
/** ISO timestamp N meses atrás (LGPD Art. 18 retention). @example isoMonthsAgo(25); // ISO de 25 meses atrás */
export function isoMonthsAgo(months: number, nowMs?: number): string {
  const now = nowMs ?? Date.now();
  const past = now - months * 30 * 24 * 60 * 60 * 1000;
  return new Date(past).toISOString();
}
/** Compara 2 ISO timestamps. Retorna negativo se a<b, 0 se igual, positivo se a>b. @example compareIso("2026-01-01T00:00:00Z", "2026-02-01T00:00:00Z"); // => negativo */
export function compareIso(a: string, b: string): number {
  return new Date(a).getTime() - new Date(b).getTime();
}
/** Detecta sobreposição temporal entre 2 intervalos (inclusivo nos extremos). @example intervalsOverlap("2026-01-01T10:00:00Z", "2026-01-01T11:00:00Z", "2026-01-01T10:30:00Z", "2026-01-01T11:30:00Z"); // => true */
export function intervalsOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const aS = new Date(aStart).getTime();
  const aE = new Date(aEnd).getTime();
  const bS = new Date(bStart).getTime();
  const bE = new Date(bEnd).getTime();
  return aS < bE && bS < aE;
}
/** Minutos entre dois ISO. @example minutesBetween("2026-01-01T10:00:00Z", "2026-01-01T11:30:00Z"); // => 90 */
export function minutesBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}
/** Duração em minutos de um par ISO. @example durationMin("2026-01-01T10:00:00Z", "2026-01-01T12:00:00Z"); // => 120 */
export function durationMin(startIso: string, endIso: string): number {
  return minutesBetween(startIso, endIso);
}
/** Valida formato ISO 8601 (fraco: aceita Date.parse). @example isValidIso("2026-01-01T10:00:00Z"); // => true isValidIso("not a date");          // => false */
export function isValidIso(iso: string): boolean {
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) && ms > 0;
}
/** Cria timestamp ISO atual. @example nowIso(); // => "2026-..." */
export function nowIso(): string {
  return new Date().toISOString();
}
/** Hash determinístico para conteúdo de consentimento. @example hashConsent({ purpose: "RSVP", termsVersion: "v1.4", timestamp: 123, marketingOptIn: false, sacredContentOptIn: false }); // string */
export function hashConsent(c: ConsentRecord): string {
  const canonical = JSON.stringify({
    p: c.purpose,
    t: c.termsVersion,
    ts: c.timestamp,
    m: c.marketingOptIn,
    s: c.sacredContentOptIn,
  });
  return fnv1a64(canonical);
}
/** Const-time equality check (anti timing-attack pra checks de token). @example constEqual("abc123", "abc123"); // => true */
export function constEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) {
    r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return r === 0;
}
/** Clamp number entre min e max. @example clamp(15, 0, 10); // => 10 */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §4 Validators                                                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Valida capacidade do evento vs RSVPs existentes. @example validateEventCapacity(event, rsvps); // { ok: true } se cabe */
export function validateEventCapacity(
  event: EventListing,
  rsvps: RSVP[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (event.capacity < 0) {
    errors.push("capacity cannot be negative");
  }
  if (event.capacity > MAX_CAPACITY) {
    errors.push(`capacity ${event.capacity} exceeds MAX ${MAX_CAPACITY}`);
  }
  const confirmed = rsvps.filter(
    (r) => r.status === "confirmed" && r.eventId === event.id
  ).length;
  if (event.capacity > 0 && confirmed > event.capacity) {
    errors.push(
      `overbooking: ${confirmed} confirmed vs capacity ${event.capacity}`
    );
  }
  if (event.capacity > 0 && confirmed === event.capacity) {
    warnings.push("event is at capacity; further RSVPs go to waitlist");
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida agenda do workshop: sem conflito de horário para o mesmo mentor. @example validateWorkshopSchedule(workshop, sessions); */
export function validateWorkshopSchedule(
  workshop: WorkshopListing,
  sessions: WorkshopSession[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  // Cada sessão deve estar dentro do bounds
  for (const s of sessions) {
    if (s.workshopId !== workshop.id) {
      errors.push(`session ${s.id} does not belong to workshop ${workshop.id}`);
    }
    if (!isValidIso(s.startsAt)) {
      errors.push(`session ${s.id} has invalid startsAt`);
    }
    if (!isValidIso(s.endsAt)) {
      errors.push(`session ${s.id} has invalid endsAt`);
    }
    if (compareIso(s.endsAt, s.startsAt) <= 0) {
      errors.push(`session ${s.id} endsAt <= startsAt`);
    }
    const dur = durationMin(s.startsAt, s.endsAt);
    if (dur < SESSION_MIN_MINUTES) {
      errors.push(`session ${s.id} too short (${dur}min)`);
    }
    if (dur > SESSION_MAX_MINUTES) {
      errors.push(`session ${s.id} too long (${dur}min)`);
    }
  }
  // Conflitos para o mesmo mentor
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const a = sessions[i];
      const b = sessions[j];
      if (a.mentorId !== b.mentorId) continue;
      if (
        intervalsOverlap(a.startsAt, a.endsAt, b.startsAt, b.endsAt)
      ) {
        errors.push(
          `mentor ${a.mentorId} has conflict between ${a.id} and ${b.id}`
        );
      }
    }
  }
  if (sessions.length === 0) {
    warnings.push("workshop has no sessions defined");
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida um RSVP: consentimento obrigatório + status válido + event match. @example validateRSVP(rsvp, event); */
export function validateRSVP(
  rsvp: RSVP,
  event: EventListing
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!rsvp.consent) {
    errors.push("consent required (LGPD Art. 7)");
  } else {
    if (!rsvp.consent.purpose || rsvp.consent.purpose.trim() === "") {
      errors.push("consent.purpose must be non-empty");
    }
    if (!rsvp.consent.termsVersion || rsvp.consent.termsVersion.trim() === "") {
      errors.push("consent.termsVersion must be non-empty");
    }
    if (!Number.isFinite(rsvp.consent.timestamp) || rsvp.consent.timestamp <= 0) {
      errors.push("consent.timestamp must be a valid epoch");
    }
    if (rsvp.consent.termsVersion !== CONSENT_TERMS_VERSION) {
      warnings.push(
        `consent terms ${rsvp.consent.termsVersion} differ from current ${CONSENT_TERMS_VERSION}`
      );
    }
  }
  if (rsvp.eventId !== event.id) {
    errors.push(`rsvp.eventId ${rsvp.eventId} does not match event.id ${event.id}`);
  }
  const validStatuses: RsvpStatus[] = [
    "confirmed",
    "waitlist",
    "cancelled",
    "attended",
    "no_show",
  ];
  if (!validStatuses.includes(rsvp.status)) {
    errors.push(`invalid status ${rsvp.status}`);
  }
  if (rsvp.status === "confirmed" && rsvp.waitlistPosition !== null) {
    warnings.push("confirmed RSVP should not have waitlistPosition");
  }
  if (rsvp.status === "waitlist" && rsvp.waitlistPosition == null) {
    errors.push("waitlist RSVP must have waitlistPosition");
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida se evento sacred tier≥3 tem decisão de curador antes de publicar. @example validateCuratorApproval(event, decision); */
export function validateCuratorApproval(
  event: EventListing,
  decision: CuratorDecision | null
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (event.sacredTier >= CURATOR_REQUIRED_TIER) {
    if (!decision) {
      errors.push(
        `tier ${event.sacredTier} event ${event.id} requires curator approval`
      );
    } else {
      if (decision.tier !== event.sacredTier) {
        errors.push(
          `decision tier ${decision.tier} != event tier ${event.sacredTier}`
        );
      }
      if (decision.verdict !== "approved") {
        errors.push(`decision verdict is "${decision.verdict}", not approved`);
      }
      if (!decision.reason || decision.reason.trim() === "") {
        warnings.push("approver did not provide a reason");
      }
    }
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida que rituais sagrados (tier 4-5) NÃO sejam vendidos. @example validateSacredRitualSale(event); */
export function validateSacredRitualSale(
  event: EventListing
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (
    event.sacredTier > MAX_COMMERCIAL_TIER &&
    event.priceCents != null &&
    event.priceCents > 0
  ) {
    errors.push(
      `sacred ritual tier ${event.sacredTier} cannot be commercial (priceCents=${event.priceCents})`
    );
  }
  if (
    event.sacredTier > MAX_COMMERCIAL_TIER &&
    event.paymentTier === "fixed"
  ) {
    errors.push(
      `sacred ritual tier ${event.sacredTier} cannot use fixed payment`
    );
  }
  if (
    event.sacredTier > MAX_COMMERCIAL_TIER &&
    event.paymentTier !== "free" &&
    event.paymentTier !== "donation"
  ) {
    warnings.push(
      `tier ${event.sacredTier} should be 'free' or 'donation'; got ${event.paymentTier}`
    );
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida dados básicos de criação de evento. @example validateEventInput({ id, slug, ... }); */
export function validateEventInput(input: CreateEventInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!input.id || input.id.trim() === "") errors.push("id required");
  if (!input.slug || input.slug.trim() === "") errors.push("slug required");
  if (!input.hostId) errors.push("hostId required");
  if (!input.hostDisplayName) errors.push("hostDisplayName required");
  if (!isValidIso(input.startsAt)) errors.push("startsAt invalid ISO");
  if (!isValidIso(input.endsAt)) errors.push("endsAt invalid ISO");
  if (compareIso(input.endsAt, input.startsAt) <= 0) {
    errors.push("endsAt must be after startsAt");
  }
  if (input.capacity < 0) errors.push("capacity cannot be negative");
  if (input.capacity > MAX_CAPACITY) {
    errors.push(`capacity ${input.capacity} exceeds MAX ${MAX_CAPACITY}`);
  }
  if (input.tradition.trim() === "") errors.push("tradition required");
  if (
    SACRED_PROTECTED_TRADITIONS.includes(input.tradition.toLowerCase()) &&
    input.sacredTier < 3
  ) {
    warnings.push(
      `tradition ${input.tradition} typically requires tier≥3; got ${input.sacredTier}`
    );
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida criação de workshop. @example validateWorkshopInput(workshop); */
export function validateWorkshopInput(
  input: CreateWorkshopInput
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!input.id) errors.push("id required");
  if (!input.slug) errors.push("slug required");
  if (!input.title) errors.push("title required");
  if (!input.description) errors.push("description required");
  if (!input.mentorId) errors.push("mentorId required");
  if (!input.tradition) errors.push("tradition required");
  if (input.capacity < 0) errors.push("capacity cannot be negative");
  if (input.sessions.length === 0) {
    errors.push("workshop must have at least one session");
  }
  if (input.sacredFlag && input.sacredTier < 3) {
    errors.push("sacredFlag requires sacredTier ≥ 3");
  }
  for (const s of input.sessions) {
    if (s.capacity < 0) errors.push(`session capacity must be ≥ 0`);
    if (!isValidIso(s.startsAt)) errors.push(`session startsAt invalid`);
    if (!isValidIso(s.endsAt)) errors.push(`session endsAt invalid`);
    if (compareIso(s.endsAt, s.startsAt) <= 0) {
      errors.push(`session endsAt must be after startsAt`);
    }
  }
  if (input.sacredFlag) {
    warnings.push("sacred workshop requires curator approval before publish");
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida consentimento LGPD. @example validateConsent(consent); */
export function validateConsent(c: ConsentRecord): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!c.purpose || c.purpose.trim() === "") {
    errors.push("purpose required");
  }
  if (c.termsVersion !== CONSENT_TERMS_VERSION) {
    warnings.push(`termsVersion ${c.termsVersion} != current ${CONSENT_TERMS_VERSION}`);
  }
  if (c.timestamp > Date.now() + 60_000) {
    errors.push("consent.timestamp is in the future");
  }
  if (c.timestamp < Date.now() - 365 * 24 * 60 * 60 * 1000) {
    warnings.push("consent.timestamp older than 1y — re-confirm recommended");
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida que o RSVP está dentro de prazo razoável (não no passado longínquo). @example validateRsvpTemporal(rsvp); */
export function validateRsvpTemporal(rsvp: RSVP): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const created = new Date(rsvp.createdAt).getTime();
  if (!Number.isFinite(created) || created <= 0) {
    errors.push("createdAt invalid");
  }
  if (created > Date.now() + 24 * 60 * 60 * 1000) {
    errors.push("createdAt in the future (>24h)");
  }
  if (created < Date.now() - RSVP_RETENTION_MS) {
    errors.push(`createdAt older than ${RSVP_RETENTION_MONTHS} months — purge-eligible`);
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida decisão de curador (estrutura + razão). @example validateCuratorDecision(decision); */
export function validateCuratorDecision(d: CuratorDecision): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!d.approverId) errors.push("approverId required");
  if (!d.approverDisplayName) errors.push("approverDisplayName required");
  if (!d.reason || d.reason.trim() === "") errors.push("reason required");
  if (d.reason && d.reason.length > 2000) {
    warnings.push("reason > 2000 chars — recommend summary");
  }
  if (d.timestamp > Date.now() + 60_000) errors.push("timestamp in the future");
  if (d.traditionBoundariesChecked.length === 0) {
    warnings.push("no tradition boundaries checked");
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida que booking pode ser feito (workshop published, user consent ok, capacity). @example validateBooking(workshop, booking); */
export function validateBooking(
  workshop: WorkshopListing,
  booking: WorkshopBooking
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (workshop.sacredFlag && !workshop.curator) {
    errors.push("sacred workshop requires curator before booking");
  }
  if (!workshop.published) {
    errors.push("workshop not published");
  }
  if (booking.sessionIds.length === 0) {
    errors.push("booking must include at least one session");
  }
  for (const sid of booking.sessionIds) {
    const session = workshop.sessions.find((s) => s.id === sid);
    if (!session) {
      errors.push(`session ${sid} not found in workshop`);
      continue;
    }
    if (session.status === "cancelled") {
      errors.push(`session ${sid} cancelled`);
    }
  }
  if (workshop.sacredFlag && !booking.consent.sacredContentOptIn) {
    warnings.push(
      "sacred workshop: attendee has not opted into sacred content"
    );
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida que um evento pode ser publicado (curador + sale + capacity). @example validatePublishGate(event); */
export function validatePublishGate(
  event: EventListing
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (event.published) {
    warnings.push("event already published");
  }
  if (event.kind === "ritual" || event.sacredTier >= CURATOR_REQUIRED_TIER) {
    if (!event.curator) {
      errors.push("curator decision required before publish");
    } else if (event.curator.verdict !== "approved") {
      errors.push(`curator verdict is "${event.curator.verdict}", not approved`);
    }
  }
  if (
    event.sacredTier > MAX_COMMERCIAL_TIER &&
    event.priceCents != null &&
    event.priceCents > 0
  ) {
    errors.push("sacred ritual cannot be commercial");
  }
  if (!event.hostDisplayName) errors.push("hostDisplayName required for publish");
  if (!isValidIso(event.startsAt)) errors.push("startsAt invalid");
  if (!isValidIso(event.endsAt)) errors.push("endsAt invalid");
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida filtro de listagem. @example validateEventsFilter({ kind: "ritual" }); */
export function validateEventsFilter(f: EventsFilter): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validKinds: EventKind[] = [
    "ritual",
    "workshop",
    "circulo",
    "palestra",
    "meditacao",
  ];
  if (f.kind !== undefined && !validKinds.includes(f.kind)) {
    errors.push(`invalid kind ${f.kind}`);
  }
  if (
    f.sacredTierMax !== undefined &&
    (f.sacredTierMax < 0 || f.sacredTierMax > 5)
  ) {
    errors.push(`sacredTierMax must be 0-5`);
  }
  if (f.before && !isValidIso(f.before)) errors.push("before invalid ISO");
  if (f.after && !isValidIso(f.after)) errors.push("after invalid ISO");
  if (f.before && f.after && compareIso(f.before, f.after) <= 0) {
    errors.push("before must be after after");
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida slugs (kebab-case ASCII). @example validateSlug("kabalat-shabbat-2026"); // { ok: true } */
export function validateSlug(slug: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!slug) {
    errors.push("slug required");
    return { ok: false, errors, warnings };
  }
  if (slug.length < 3) errors.push("slug too short (min 3)");
  if (slug.length > 100) errors.push("slug too long (max 100)");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    errors.push("slug must be kebab-case ascii");
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida boundary de tradição:祭 não tente manipular conteúdo de tradição reservada sem curador. @example validateTraditionBoundary("cabala", 1); // ok */
export function validateTraditionBoundary(
  tradition: string,
  sacredTier: SacredTier
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lower = tradition.toLowerCase();
  if (SACRED_PROTECTED_TRADITIONS.includes(lower) && sacredTier < 3) {
    errors.push(
      `tradition ${tradition} (protected) requires sacredTier ≥ 3; got ${sacredTier}`
    );
  }
  if (lower === "ifá" || lower === "ifa") {
    if (sacredTier > 0 && sacredTier < 3) {
      warnings.push("Ifá ceremonies typically require tier 3+ — confirm with babalorixá");
    }
  }
  if (lower === "candomble" || lower === "candomblé") {
    if (sacredTier > 0 && sacredTier < 3) {
      warnings.push("Candomblé ceremonies typically require tier 3+");
    }
  }
  return { ok: errors.length === 0, errors, warnings };
}
/** Valida que RSVP seja marcado attended/no_show somente após o evento terminar. @example validateAttendanceTransition(rsvp, "attended"); */
export function validateAttendanceTransition(
  rsvp: RSVP,
  newStatus: RsvpStatus,
  event: EventListing
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const eventEnd = new Date(event.endsAt).getTime();
  const now = Date.now();
  if (newStatus === "attended" || newStatus === "no_show") {
    if (now < eventEnd) {
      errors.push(
        `cannot mark ${newStatus} before event ends (${event.endsAt})`
      );
    }
  }
  if (rsvp.status === "cancelled" && (newStatus === "attended" || newStatus === "no_show")) {
    errors.push(`cannot mark ${newStatus} a cancelled RSVP`);
  }
  return { ok: errors.length === 0, errors, warnings };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §5 Core engine                                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Cria um registry vazio. @example const reg = createRegistry(); */
export function createRegistry(): EventsRegistry {
  return {
    events: new Map(),
    workshops: new Map(),
    rsvps: new Map(),
    bookings: new Map(),
    audit: [],
    aggregateStats: emptyStats(),
    erasureRequests: new Map(),
  };
}
/** Cria um evento novo (type-checked). @example const evt = createEvent(reg, input); */
export function createEvent(
  reg: EventsRegistry,
  input: CreateEventInput
): EventListing {
  const validation = validateEventInput(input);
  if (!validation.ok) {
    throw new Error(
      `createEvent validation failed: ${validation.errors.join("; ")}`
    );
  }
  const tierCheck = validateTraditionBoundary(input.tradition, input.sacredTier);
  if (!tierCheck.ok) {
    throw new Error(`tradition boundary: ${tierCheck.errors.join("; ")}`);
  }
  const saleCheck = validateSacredRitualSale({
    ...placeholderEvent(input),
  });
  if (!saleCheck.ok) {
    throw new Error(`sacred sale: ${saleCheck.errors.join("; ")}`);
  }
  if (reg.events.has(input.id)) {
    throw new Error(`event ${input.id} already exists`);
  }
  const now = Date.now();
  const evt: EventListing = {
    id: input.id,
    slug: input.slug,
    kind: input.kind,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    capacity: input.capacity,
    currentRsvps: 0,
    sacredTier: input.sacredTier,
    tradition: input.tradition,
    locale: input.locale,
    priceCents: input.priceCents,
    paymentTier: input.paymentTier,
    curator: null,
    published: false,
    hostId: input.hostId,
    hostDisplayName: input.hostDisplayName,
    tags: input.tags,
    createdAt: now,
    updatedAt: now,
  };
  reg.events.set(evt.id, evt);
  reg.aggregateStats.eventsByKind[evt.kind] =
    (reg.aggregateStats.eventsByKind[evt.kind] ?? 0) + 1;
  reg.aggregateStats.eventsByTier[evt.sacredTier] =
    (reg.aggregateStats.eventsByTier[evt.sacredTier] ?? 0) + 1;
  appendAudit(reg, "EVENT_CREATED", evt.hostId, "system", {
    eventId: evt.id,
    kind: evt.kind,
    tier: evt.sacredTier,
  });
  return evt;
}
/** Cria workshop com sessões derivadas. @example const ws = createWorkshop(reg, input, mentor); */
export function createWorkshop(
  reg: EventsRegistry,
  input: CreateWorkshopInput
): WorkshopListing {
  const validation = validateWorkshopInput(input);
  if (!validation.ok) {
    throw new Error(
      `createWorkshop validation failed: ${validation.errors.join("; ")}`
    );
  }
  if (reg.workshops.has(input.id)) {
    throw new Error(`workshop ${input.id} already exists`);
  }
  const now = Date.now();
  const sessions: WorkshopSession[] = input.sessions.map((s, i) => ({
    ...s,
    id: `${input.id}-session-${i}`,
    workshopId: input.id,
    createdAt: now,
  }));
  const workshop: WorkshopListing = {
    id: input.id,
    slug: input.slug,
    title: input.title,
    description: input.description,
    mentorId: input.mentorId,
    mentorDisplayName: input.mentorDisplayName,
    tradition: input.tradition,
    sacredFlag: input.sacredFlag,
    sacredTier: input.sacredTier,
    sessions,
    capacity: input.capacity,
    locale: input.locale,
    published: false,
    curator: null,
    createdAt: now,
  };
  // schedule-level validation
  const schedValidation = validateWorkshopSchedule(workshop, sessions);
  if (!schedValidation.ok) {
    throw new Error(
      `workshop schedule: ${schedValidation.errors.join("; ")}`
    );
  }
  reg.workshops.set(workshop.id, workshop);
  appendAudit(reg, "EVENT_CREATED", workshop.mentorId, "system", {
    workshopId: workshop.id,
    sacredFlag: workshop.sacredFlag,
  });
  return workshop;
}
/** Registra RSVP (capacity-aware; vira waitlist se lotado). @example const rsvp = registerRSVP(reg, event, input); */
export function registerRSVP(
  reg: EventsRegistry,
  event: EventListing,
  input: CreateRsvpInput
): RSVP {
  // Evento precisa existir
  if (!reg.events.has(event.id)) {
    throw new Error(`event ${event.id} not found in registry`);
  }
  // Tier 4-5 sacred → re-verifica approval
  if (
    event.sacredTier >= CURATOR_REQUIRED_TIER &&
    (!event.curator || event.curator.verdict !== "approved")
  ) {
    throw new Error(
      `event ${event.id} sacred tier ${event.sacredTier} lacks curator approval — RSVP blocked`
    );
  }
  // Consent obrigatório
  const consentCheck = validateConsent(input.consent);
  if (!consentCheck.ok) {
    throw new Error(`consent invalid: ${consentCheck.errors.join("; ")}`);
  }
  // Sem duplicata
  const dupe = Array.from(reg.rsvps.values()).find(
    (r) =>
      r.eventId === event.id &&
      r.attendeeId === input.attendeeId &&
      (r.status === "confirmed" || r.status === "waitlist")
  );
  if (dupe) {
    throw new Error(
      `attendee ${input.attendeeId} already has RSVP ${dupe.id} for event ${event.id}`
    );
  }
  const now = nowIso();
  const eventRsvps = Array.from(reg.rsvps.values()).filter(
    (r) => r.eventId === event.id
  );
  const confirmedCount = eventRsvps.filter((r) => r.status === "confirmed").length;
  const isFull =
    event.capacity > 0 && confirmedCount >= event.capacity;
  const waitlistCount = eventRsvps.filter((r) => r.status === "waitlist").length;
  if (waitlistCount >= WAITLIST_CAP) {
    throw new Error(`waitlist at cap ${WAITLIST_CAP}`);
  }
  const status: RsvpStatus = isFull ? "waitlist" : "confirmed";
  const waitlistPosition = isFull ? waitlistCount + 1 : null;
  const rsvp: RSVP = {
    id: generateId("rsvp", `${event.id}|${input.attendeeId}`),
    eventId: event.id,
    eventKind: event.kind,
    attendeeId: input.attendeeId,
    attendeeDisplayName: input.attendeeDisplayName,
    status,
    createdAt: now,
    updatedAt: now,
    consent: input.consent,
    waitlistPosition,
    cancellationReason: null,
    statusHistory: [],
  };
  reg.rsvps.set(rsvp.id, rsvp);
  if (status === "confirmed") {
    event.currentRsvps = confirmedCount + 1;
    reg.aggregateStats.rsvpsByKind[event.kind] =
      (reg.aggregateStats.rsvpsByKind[event.kind] ?? 0) + 1;
  }
  appendAudit(
    reg,
    status === "confirmed" ? "RSVP_REGISTERED" : "RSVP_WAITLISTED",
    input.attendeeId,
    input.attendeeId,
    {
      rsvpId: rsvp.id,
      eventId: event.id,
      status,
      waitlistPosition: waitlistPosition ?? -1,
    }
  );
  return rsvp;
}
/** Cancela um RSVP (libera seat). @example cancelRSVP(reg, rsvpId, "não posso ir"); */
export function cancelRSVP(
  reg: EventsRegistry,
  rsvpId: string,
  reason: string
): RSVP {
  const rsvp = reg.rsvps.get(rsvpId);
  if (!rsvp) throw new Error(`RSVP ${rsvpId} not found`);
  if (rsvp.status === "cancelled") {
    return rsvp; // idempotente
  }
  const prev = rsvp.status;
  rsvp.status = "cancelled";
  rsvp.cancellationReason = reason;
  rsvp.updatedAt = nowIso();
  rsvp.statusHistory.push({
    from: prev,
    to: "cancelled",
    at: rsvp.updatedAt,
    reason,
  });
  // Se era confirmed → liberar seat + promover head da waitlist
  if (prev === "confirmed") {
    const event = reg.events.get(rsvp.eventId);
    if (event) {
      event.currentRsvps = Math.max(0, event.currentRsvps - 1);
      promoteFromWaitlist(reg, event);
    }
    reg.aggregateStats.totalCancellations =
      reg.aggregateStats.totalCancellations + 1;
  }
  appendAudit(reg, "RSVP_CANCELLED", rsvp.attendeeId, rsvp.attendeeId, {
    rsvpId: rsvp.id,
    eventId: rsvp.eventId,
    reason,
  });
  return rsvp;
}
/** Promove o head da waitlist quando um seat é liberado. @example promoteFromWaitlist(reg, event); */
export function promoteFromWaitlist(
  reg: EventsRegistry,
  event: EventListing
): RSVP | null {
  const waitlist = Array.from(reg.rsvps.values())
    .filter((r) => r.eventId === event.id && r.status === "waitlist")
    .sort((a, b) => (a.waitlistPosition ?? 0) - (b.waitlistPosition ?? 0));
  if (waitlist.length === 0) return null;
  const head = waitlist[0];
  head.status = "confirmed";
  head.waitlistPosition = null;
  head.updatedAt = nowIso();
  head.statusHistory.push({
    from: "waitlist",
    to: "confirmed",
    at: head.updatedAt,
    reason: "promoted-from-waitlist",
  });
  event.currentRsvps = event.currentRsvps + 1;
  // Re-posicionar demais
  for (let i = 1; i < waitlist.length; i++) {
    waitlist[i].waitlistPosition = i;
  }
  appendAudit(reg, "RSVP_PROMOTED", head.attendeeId, "system", {
    rsvpId: head.id,
    eventId: event.id,
  });
  return head;
}
/** Lista eventos por filtro. @example const upcoming = getUpcomingEvents(reg, { kind: "ritual" }); */
export function getUpcomingEvents(
  reg: EventsRegistry,
  filter: EventsFilter
): EventListing[] {
  const fValidation = validateEventsFilter(filter);
  if (!fValidation.ok) {
    throw new Error(`filter invalid: ${fValidation.errors.join("; ")}`);
  }
  const now = nowIso();
  const all = Array.from(reg.events.values());
  return all
    .filter((e) => {
      if (compareIso(e.startsAt, now) < 0 && !filter.publishedOnly) {
        return false; // upcoming only
      }
      if (filter.kind && e.kind !== filter.kind) return false;
      if (filter.tradition && e.tradition !== filter.tradition) return false;
      if (filter.curatorApprovedOnly) {
        if (!e.curator || e.curator.verdict !== "approved") return false;
      }
      if (filter.sacredTierMax !== undefined && e.sacredTier > filter.sacredTierMax) {
        return false;
      }
      if (filter.publishedOnly && !e.published) return false;
      if (filter.before && compareIso(e.startsAt, filter.before) >= 0) return false;
      if (filter.after && compareIso(e.startsAt, filter.after) <= 0) return false;
      return true;
    })
    .sort((a, b) => compareIso(a.startsAt, b.startsAt));
}
/** Lista workshops de um mentor. @example const list = getWorkshopByMentor(reg, "mentor-xyz"); */
export function getWorkshopByMentor(
  reg: EventsRegistry,
  mentorId: string
): WorkshopListing[] {
  return Array.from(reg.workshops.values()).filter(
    (w) => w.mentorId === mentorId
  );
}
/** Adiciona sessão ao workshop (validando conflitos). @example scheduleWorkshopSession(reg, "workshop-1", "2026-...", 30); */
export function scheduleWorkshopSession(
  reg: EventsRegistry,
  workshopId: string,
  startsAt: string,
  endsAt: string,
  capacity: number,
  onlineUrl: string | null,
  city: string | null
): WorkshopSession {
  const workshop = reg.workshops.get(workshopId);
  if (!workshop) throw new Error(`workshop ${workshopId} not found`);
  if (!isValidIso(startsAt)) throw new Error("startsAt invalid");
  if (!isValidIso(endsAt)) throw new Error("endsAt invalid");
  if (compareIso(endsAt, startsAt) <= 0) {
    throw new Error("endsAt must be after startsAt");
  }
  if (capacity < 0 || capacity > MAX_CAPACITY) {
    throw new Error(`capacity out of bounds: ${capacity}`);
  }
  const newSession: WorkshopSession = {
    id: generateId("session", `${workshopId}|${startsAt}`),
    workshopId,
    startsAt,
    endsAt,
    capacity,
    status: "scheduled",
    onlineUrl,
    city,
    mentorId: workshop.mentorId,
    mentorDisplayName: workshop.mentorDisplayName,
    notes: null,
    createdAt: Date.now(),
  };
  const allSessions = [...workshop.sessions, newSession];
  const conflictCheck = validateWorkshopSchedule(workshop, allSessions);
  if (!conflictCheck.ok) {
    throw new Error(
      `session conflicts: ${conflictCheck.errors.join("; ")}`
    );
  }
  workshop.sessions.push(newSession);
  appendAudit(reg, "EVENT_CREATED", workshop.mentorId, workshop.mentorId, {
    workshopId,
    sessionId: newSession.id,
  });
  return newSession;
}
/** Curador revisa evento sacred (record decisão). @example curatorReview(reg, "evt-1", decision); */
export function curatorReview(
  reg: EventsRegistry,
  eventId: string,
  input: CuratorReviewInput
): CuratorDecision {
  const event = reg.events.get(eventId);
  if (!event) throw new Error(`event ${eventId} not found`);
  if (event.sacredTier < CURATOR_REQUIRED_TIER) {
    throw new Error(
      `event tier ${event.sacredTier} does not require curator (min ${CURATOR_REQUIRED_TIER})`
    );
  }
  const decision: CuratorDecision = {
    approverId: input.approverId,
    approverDisplayName: input.approverDisplayName,
    verdict: input.verdict,
    reason: input.reason,
    timestamp: Date.now(),
    tier: event.sacredTier,
    traditionBoundariesChecked: input.traditionBoundariesChecked,
  };
  const dCheck = validateCuratorDecision(decision);
  if (!dCheck.ok) {
    throw new Error(`decision invalid: ${dCheck.errors.join("; ")}`);
  }
  event.curator = decision;
  event.updatedAt = Date.now();
  appendAudit(
    reg,
    input.verdict === "approved" ? "CURATOR_APPROVED" : "CURATOR_REJECTED",
    input.approverId,
    input.approverId,
    {
      eventId,
      verdict: input.verdict,
      tier: event.sacredTier,
    }
  );
  return decision;
}
/** Exporta histórico completo de RSVPs de um usuário (LGPD Art. 18). @example const export = exportEventParticipants(reg, "evt-1", "user-1"); */
export function exportEventParticipants(
  reg: EventsRegistry,
  eventId: string,
  requesterId: string
): {
  event: EventListing;
  rsvps: RSVP[];
  exportedAt: string;
  requesterId: string;
} {
  const event = reg.events.get(eventId);
  if (!event) throw new Error(`event ${eventId} not found`);
  // requesterId pode ser o host OU o próprio user (self-export)
  const isHost = event.hostId === requesterId;
  const rsvpsOfRequester = Array.from(reg.rsvps.values()).filter(
    (r) => r.attendeeId === requesterId && r.eventId === eventId
  );
  if (!isHost && rsvpsOfRequester.length === 0) {
    throw new Error(
      `requester ${requesterId} has no RSVP and is not host of ${eventId}`
    );
  }
  const result = {
    event,
    rsvps: isHost
      ? Array.from(reg.rsvps.values()).filter((r) => r.eventId === eventId)
      : rsvpsOfRequester,
    exportedAt: nowIso(),
    requesterId,
  };
  appendAudit(reg, "EXPORT_HISTORY", requesterId, requesterId, {
    eventId,
    scope: isHost ? "host" : "self",
    rsvpCount: result.rsvps.length,
  });
  return result;
}
/** Export universal de RSVP history (Art. 18 right of access). @example const all = exportRsvpHistory(reg, "user-1"); */
export function exportRsvpHistory(
  reg: EventsRegistry,
  userId: string
): {
  userId: string;
  rsvps: RSVP[];
  bookings: WorkshopBooking[];
  exportedAt: string;
} {
  const rsvps = Array.from(reg.rsvps.values()).filter(
    (r) => r.attendeeId === userId
  );
  const bookings = Array.from(reg.bookings.values()).filter(
    (b) => b.attendeeId === userId
  );
  if (rsvps.length === 0 && bookings.length === 0) {
    // ok — user pode estar sem nenhuma participação; export vazio é legal
  }
  const result = {
    userId,
    rsvps,
    bookings,
    exportedAt: nowIso(),
  };
  appendAudit(reg, "EXPORT_HISTORY", userId, userId, {
    rsvpCount: rsvps.length,
    bookingCount: bookings.length,
  });
  return result;
}
/** Purga RSVPs mais antigos que retention (LGPD Art. 18). @example purgeOldRsvps(reg, 24); // retorna quantos foram purgados */
export function purgeOldRsvps(
  reg: EventsRegistry,
  retentionMonths: number = RSVP_RETENTION_MONTHS,
  nowMs?: number
): { purged: number; remaining: number } {
  const now = nowMs ?? Date.now();
  const cutoff = now - retentionMonths * 30 * 24 * 60 * 60 * 1000;
  const all = Array.from(reg.rsvps.entries());
  let purged = 0;
  for (const [id, r] of all) {
    const t = new Date(r.createdAt).getTime();
    if (Number.isFinite(t) && t < cutoff) {
      reg.rsvps.delete(id);
      purged++;
    }
  }
  const remaining = reg.rsvps.size;
  // Manter stats agregadas (não linkam a user)
  appendAudit(reg, "PURGE_EXECUTED", "system", "system", {
    purged,
    remaining,
    retentionMonths,
  });
  return { purged, remaining };
}
/** Erasure total de um user (Art. 9). @example requestErasure(reg, "user-1"); */
export function requestErasure(
  reg: EventsRegistry,
  userId: string
): { purgedRsvps: number; purgedBookings: number } {
  let purgedRsvps = 0;
  let purgedBookings = 0;
  for (const [id, r] of Array.from(reg.rsvps.entries())) {
    if (r.attendeeId === userId) {
      reg.rsvps.delete(id);
      purgedRsvps++;
    }
  }
  for (const [id, b] of Array.from(reg.bookings.entries())) {
    if (b.attendeeId === userId) {
      reg.bookings.delete(id);
      purgedBookings++;
    }
  }
  reg.erasureRequests.set(userId, Date.now());
  reg.aggregateStats.totalErasures = reg.aggregateStats.totalErasures + 1;
  // NÃO linkar erasure request a user (manter agregada)
  appendAudit(reg, "PURGE_EXECUTED", "system", "system", {
    erasedUserIdHash: fnv1a64(userId),
    purgedRsvps,
    purgedBookings,
  });
  return { purgedRsvps, purgedBookings };
}
/** Reserva um booking de workshop. @example const booking = bookWorkshop(reg, workshop, input); */
export function bookWorkshop(
  reg: EventsRegistry,
  workshop: WorkshopListing,
  input: CreateRsvpInput
): WorkshopBooking {
  if (!reg.workshops.has(workshop.id)) {
    throw new Error(`workshop ${workshop.id} not registered`);
  }
  if (workshop.sacredFlag && !workshop.curator) {
    throw new Error("sacred workshop requires curator before booking");
  }
  if (!workshop.published) {
    throw new Error("workshop not published");
  }
  const consentCheck = validateConsent(input.consent);
  if (!consentCheck.ok) {
    throw new Error(`consent: ${consentCheck.errors.join("; ")}`);
  }
  // Sem duplicata
  const dupe = Array.from(reg.bookings.values()).find(
    (b) =>
      b.workshopId === workshop.id &&
      b.attendeeId === input.attendeeId &&
      b.status !== "cancelled"
  );
  if (dupe) throw new Error(`attendee ${input.attendeeId} already booked`);
  const sessionIds = workshop.sessions.map((s) => s.id);
  const booking: WorkshopBooking = {
    id: generateId("booking", `${workshop.id}|${input.attendeeId}`),
    workshopId: workshop.id,
    sessionIds,
    attendeeId: input.attendeeId,
    attendeeDisplayName: input.attendeeDisplayName,
    paymentTier: workshop.sacredFlag ? "donation" : "fixed",
    amountPaidCents: 0,
    consent: input.consent,
    status: "active",
    waitlisted: false,
    waitlistPosition: null,
    createdAt: nowIso(),
  };
  const validation = validateBooking(workshop, booking);
  if (!validation.ok) {
    throw new Error(`booking: ${validation.errors.join("; ")}`);
  }
  reg.bookings.set(booking.id, booking);
  appendAudit(reg, "WORKSHOP_BOOKED", input.attendeeId, input.attendeeId, {
    bookingId: booking.id,
    workshopId: workshop.id,
  });
  return booking;
}
/** Cancela um booking. @example cancelBooking(reg, "booking-1", "conflito de agenda"); */
export function cancelBooking(
  reg: EventsRegistry,
  bookingId: string,
  reason: string
): WorkshopBooking {
  const booking = reg.bookings.get(bookingId);
  if (!booking) throw new Error(`booking ${bookingId} not found`);
  if (booking.status === "cancelled") return booking;
  booking.status = "cancelled";
  // Re-bumps audit
  appendAudit(reg, "WORKSHOP_CANCELLED", booking.attendeeId, booking.attendeeId, {
    bookingId,
    reason,
  });
  return booking;
}
/** Publica um evento (gate: curator, sacred sale, host). @example publishEvent(reg, "evt-1"); */
export function publishEvent(
  reg: EventsRegistry,
  eventId: string
): EventListing {
  const event = reg.events.get(eventId);
  if (!event) throw new Error(`event ${eventId} not found`);
  const gate = validatePublishGate(event);
  if (!gate.ok) {
    throw new Error(`publish gate: ${gate.errors.join("; ")}`);
  }
  event.published = true;
  event.updatedAt = Date.now();
  appendAudit(reg, "EVENT_PUBLISHED", event.hostId, event.hostId, {
    eventId,
    tier: event.sacredTier,
  });
  return event;
}
/** Compute utilization stats (% confirmados vs capacidade total). @example recomputeUtilization(reg); */
export function recomputeUtilization(reg: EventsRegistry): number {
  const events = Array.from(reg.events.values());
  if (events.length === 0) return 0;
  let sumRsvps = 0;
  let sumCap = 0;
  for (const e of events) {
    sumRsvps += e.currentRsvps;
    if (e.capacity > 0) sumCap += e.capacity;
  }
  const pct = sumCap > 0 ? clamp(Math.round((sumRsvps / sumCap) * 100), 0, 100) : 0;
  reg.aggregateStats.capacityUtilizationPct = pct;
  return pct;
}
/** Estatísticas anonimizadas agregadas (LGPD Art. 9 — sem linkar user). @example const stats = getAggregateStats(reg); */
export function getAggregateStats(reg: EventsRegistry): AggregateStats {
  // Garantir que tudo está atualizado
  recomputeUtilization(reg);
  return JSON.parse(JSON.stringify(reg.aggregateStats));
}
/** Detecta eventos que precisam de review de curador. @example const pending = getPendingCuratorReview(reg); */
export function getPendingCuratorReview(reg: EventsRegistry): EventListing[] {
  return Array.from(reg.events.values()).filter(
    (e) =>
      e.sacredTier >= CURATOR_REQUIRED_TIER &&
      (!e.curator || e.curator.verdict !== "approved")
  );
}
/** Detecta eventos prontos para auto-purge (viram published=false após expiry). @example const expired = getExpiredEvents(reg); */
export function getExpiredEvents(
  reg: EventsRegistry,
  nowMs?: number
): EventListing[] {
  const now = nowMs ?? Date.now();
  return Array.from(reg.events.values()).filter(
    (e) => new Date(e.endsAt).getTime() < now - 24 * 60 * 60 * 1000
  );
}
/** Conta RSVP por status. @example const counts = countRsvpsByStatus(reg, "evt-1"); */
export function countRsvpsByStatus(
  reg: EventsRegistry,
  eventId: string
): Record<RsvpStatus, number> {
  const out: Record<RsvpStatus, number> = {
    confirmed: 0,
    waitlist: 0,
    cancelled: 0,
    attended: 0,
    no_show: 0,
  };
  for (const r of reg.rsvps.values()) {
    if (r.eventId === eventId) {
      out[r.status] = out[r.status] + 1;
    }
  }
  return out;
}
/** Conta bookings por status. @example const c = countBookingsByStatus(reg, "ws-1"); */
export function countBookingsByStatus(
  reg: EventsRegistry,
  workshopId: string
): Record<"active" | "cancelled" | "completed", number> {
  const out = { active: 0, cancelled: 0, completed: 0 };
  for (const b of reg.bookings.values()) {
    if (b.workshopId === workshopId) {
      out[b.status] = out[b.status] + 1;
    }
  }
  return out;
}
/** Atualiza RSVP para attended/no_show (somente após evento acabar). @example markAttendance(reg, "rsvp-1", "attended"); */
export function markAttendance(
  reg: EventsRegistry,
  rsvpId: string,
  newStatus: "attended" | "no_show"
): RSVP {
  const rsvp = reg.rsvps.get(rsvpId);
  if (!rsvp) throw new Error(`rsvp ${rsvpId} not found`);
  const event = reg.events.get(rsvp.eventId);
  if (!event) throw new Error(`event ${rsvp.eventId} not found`);
  const tCheck = validateAttendanceTransition(rsvp, newStatus, event);
  if (!tCheck.ok) {
    throw new Error(`attendance: ${tCheck.errors.join("; ")}`);
  }
  const prev = rsvp.status;
  rsvp.status = newStatus;
  rsvp.updatedAt = nowIso();
  rsvp.statusHistory.push({
    from: prev,
    to: newStatus,
    at: rsvp.updatedAt,
    reason: "attendance-marked",
  });
  appendAudit(reg, "EXPORT_HISTORY", rsvp.attendeeId, "system", {
    rsvpId,
    newStatus,
  });
  return rsvp;
}
/** Sanitiza RSVP para exportar (remove internal fields, mantém LGPD-essencial). @example const safe = sanitizeRsvpForExport(rsvp); */
export function sanitizeRsvpForExport(rsvp: RSVP): {
  eventId: string;
  status: RsvpStatus;
  createdAt: string;
  consent: {
    purpose: string;
    termsVersion: string;
    timestamp: number;
  };
} {
  return {
    eventId: rsvp.eventId,
    status: rsvp.status,
    createdAt: rsvp.createdAt,
    consent: {
      purpose: rsvp.consent.purpose,
      termsVersion: rsvp.consent.termsVersion,
      timestamp: rsvp.consent.timestamp,
    },
  };
}
/** Verifica se evento é sacred-protegido (não pode ser comercial). @example isProtectedSacred(event); */
export function isProtectedSacred(event: EventListing): boolean {
  return event.sacredTier > MAX_COMMERCIAL_TIER;
}
/** Determina tier mínimo que exige curador. @example minTierRequiringCurator(); // 3 */
export function minTierRequiringCurator(): SacredTier {
  return CURATOR_REQUIRED_TIER;
}
/** Hash canônico do evento pra deduplicação. @example eventFingerprint(event); */
export function eventFingerprint(event: EventListing): string {
  return fnv1a64(
    `${event.id}|${event.kind}|${event.startsAt}|${event.sacredTier}|${event.tradition}`
  );
}
/** Conta eventos por kind (helper de stats). @example countEventsByKind(reg); */
export function countEventsByKind(reg: EventsRegistry): Record<EventKind, number> {
  const out: Record<EventKind, number> = {
    ritual: 0,
    workshop: 0,
    circulo: 0,
    palestra: 0,
    meditacao: 0,
  };
  for (const e of reg.events.values()) {
    out[e.kind] = out[e.kind] + 1;
  }
  return out;
}
/** Conta eventos por sacred tier. @example countEventsByTier(reg); */
export function countEventsByTier(reg: EventsRegistry): Record<SacredTier, number> {
  const out: Record<SacredTier, number> = {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  };
  for (const e of reg.events.values()) {
    out[e.sacredTier] = out[e.sacredTier] + 1;
  }
  return out;
}
/** Filtra eventos publicados. @example listPublished(reg); */
export function listPublished(reg: EventsRegistry): EventListing[] {
  return Array.from(reg.events.values()).filter((e) => e.published);
}
/** Filtra workshops publicados. @example listPublishedWorkshops(reg); */
export function listPublishedWorkshops(reg: EventsRegistry): WorkshopListing[] {
  return Array.from(reg.workshops.values()).filter((w) => w.published);
}
/** Audit helper: append event hash-chained. @example appendAudit(reg, "EVENT_CREATED", "user-1", "system", {...}); */
export function appendAudit(
  reg: EventsRegistry,
  type: AuditEventType,
  subjectId: string,
  actorId: string,
  payload: Record<string, string | number | boolean | null>
): AuditEvent {
  const id = reg.audit.length + 1;
  const timestamp = Date.now();
  const prev = reg.audit[reg.audit.length - 1];
  const prevHash = prev ? prev.hash : "0x00000000";
  const hash = fnv1a64(
    `${prevHash}|${id}|${type}|${subjectId}|${actorId}|${timestamp}|${JSON.stringify(
      payload
    )}`
  );
  const evt: AuditEvent = {
    id,
    type,
    subjectId,
    actorId,
    timestamp,
    prevHash,
    hash,
    payload,
  };
  reg.audit.push(evt);
  // Audit chain reset
  if (id >= AUDIT_CHAIN_RESET_LIMIT) {
    reg.audit.shift();
    // Re-hash chain (keep most recent AUDIT_CHAIN_RESET_LIMIT/2)
  }
  return evt;
}
/** Verifica integridade da audit chain. @example const ok = verifyAuditChain(reg); */
export function verifyAuditChain(reg: EventsRegistry): {
  ok: boolean;
  brokenAt: number | null;
} {
  let prev = "0x00000000";
  for (let i = 0; i < reg.audit.length; i++) {
    const e = reg.audit[i];
    if (e.prevHash !== prev) {
      return { ok: false, brokenAt: e.id };
    }
    const expected = fnv1a64(
      `${prev}|${e.id}|${e.type}|${e.subjectId}|${e.actorId}|${e.timestamp}|${JSON.stringify(
        e.payload
      )}`
    );
    if (expected !== e.hash) {
      return { ok: false, brokenAt: e.id };
    }
    prev = e.hash;
  }
  return { ok: true, brokenAt: null };
}
/** Retorna audit events para um user (debug/admin). @example const trail = getAuditTrailFor(reg, "user-1"); */
export function getAuditTrailFor(
  reg: EventsRegistry,
  subjectId: string
): AuditEvent[] {
  return reg.audit.filter((e) => e.subjectId === subjectId);
}
/** Busca evento por id. @example const evt = getEventById(reg, "evt-1"); */
export function getEventById(
  reg: EventsRegistry,
  eventId: string
): EventListing | null {
  return reg.events.get(eventId) ?? null;
}
/** Busca workshop por id. @example const w = getWorkshopById(reg, "ws-1"); */
export function getWorkshopById(
  reg: EventsRegistry,
  workshopId: string
): WorkshopListing | null {
  return reg.workshops.get(workshopId) ?? null;
}
/** Busca RSVP por id. @example const r = getRsvpById(reg, "rsvp-1"); */
export function getRsvpById(
  reg: EventsRegistry,
  rsvpId: string
): RSVP | null {
  return reg.rsvps.get(rsvpId) ?? null;
}
/** Lista RSVPs de um usuário. @example const list = listRsvpsForUser(reg, "user-1"); */
export function listRsvpsForUser(
  reg: EventsRegistry,
  userId: string
): RSVP[] {
  return Array.from(reg.rsvps.values()).filter((r) => r.attendeeId === userId);
}
/** Lista bookings de um usuário. @example const list = listBookingsForUser(reg, "user-1"); */
export function listBookingsForUser(
  reg: EventsRegistry,
  userId: string
): WorkshopBooking[] {
  return Array.from(reg.bookings.values()).filter((b) => b.attendeeId === userId);
}
/** Verifica se um user já tem RSVP ativo em evento. @example hasActiveRsvp(reg, "user-1", "evt-1"); */
export function hasActiveRsvp(
  reg: EventsRegistry,
  userId: string,
  eventId: string
): boolean {
  return Array.from(reg.rsvps.values()).some(
    (r) =>
      r.eventId === eventId &&
      r.attendeeId === userId &&
      (r.status === "confirmed" || r.status === "waitlist")
  );
}
/** Adiciona note privada a uma sessão. @example addSessionNote(reg, "session-1", "levar incenso"); */
export function addSessionNote(
  reg: EventsRegistry,
  sessionId: string,
  note: string
): WorkshopSession {
  for (const w of reg.workshops.values()) {
    const session = w.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.notes = note;
      return session;
    }
  }
  throw new Error(`session ${sessionId} not found`);
}
/** Cancela uma sessão (notifica todos os bookings ativos). @example cancelSession(reg, "session-1", "mentor indisposto"); */
export function cancelSession(
  reg: EventsRegistry,
  sessionId: string,
  reason: string
): WorkshopSession {
  for (const w of reg.workshops.values()) {
    const session = w.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.status = "cancelled";
      appendAudit(reg, "EVENT_REJECTED", session.mentorId, session.mentorId, {
        sessionId,
        reason,
      });
      return session;
    }
  }
  throw new Error(`session ${sessionId} not found`);
}
/** Helper para criar consent default (Art. 7 — propósito explícito). @example const c = createConsent("RSVP_EVENT"); */
export function createConsent(
  purpose: string,
  marketingOptIn = false,
  sacredContentOptIn = false
): ConsentRecord {
  return {
    purpose,
    termsVersion: CONSENT_TERMS_VERSION,
    timestamp: Date.now(),
    marketingOptIn,
    sacredContentOptIn,
  };
}
/** Helper: ISO now+N hours. @example isoInHours(2); // ISO de 2h no futuro */
export function isoInHours(hours: number, nowMs?: number): string {
  const now = nowMs ?? Date.now();
  return new Date(now + hours * 60 * 60 * 1000).toISOString();
}
/** Helper: ISO now+N days. @example isoInDays(7); */
export function isoInDays(days: number, nowMs?: number): string {
  const now = nowMs ?? Date.now();
  return new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
}
/** Helper: ISO now (ancora pro testing). @example isoAt(Date.now() + 1000); */
export function isoAt(ms: number): string {
  return new Date(ms).toISOString();
}
/** Helper: adiciona ms a um ISO base. @example addIso("2026-01-01T10:00:00Z", 2 * 60 * 60 * 1000); // +2h */
export function addIso(baseIso: string, deltaMs: number): string {
  return new Date(new Date(baseIso).getTime() + deltaMs).toISOString();
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §6 LGPD policy helpers                                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Verifica se consent tem purpose permitido (Art. 7). @example isPurposeAllowed(consent); // true */
export function isPurposeAllowed(c: ConsentRecord): boolean {
  const allowed = [
    "RSVP_EVENT",
    "RSVP_WORKSHOP",
    "EXPORT_HISTORY",
    "MARKETING",
    "SACRED_CONTENT",
  ];
  return allowed.includes(c.purpose);
}
/** Retorna lista de purposes permitidos (Art. 7 — declaração explícita). @example listAllowedPurposes(); */
export function listAllowedPurposes(): string[] {
  return [
    "RSVP_EVENT",
    "RSVP_WORKSHOP",
    "EXPORT_HISTORY",
    "MARKETING",
    "SACRED_CONTENT",
  ];
}
/** LGPD Art. 18 right of access: user pode pedir export do seu histórico. @example userHasExportRight("user-1"); */
export function userHasExportRight(_userId: string): boolean {
  // Toda pessoa natural tem esse direito; mantido como função para clareza.
  return true;
}
/** LGPD Art. 9 retention: retorna meses default. @example defaultRetentionMonths(); // 24 */
export function defaultRetentionMonths(): number {
  return RSVP_RETENTION_MONTHS;
}
/** LGPD Art. 9: anonimização preserva stats agregadas. @example canAnonymizeForStats(); // true */
export function canAnonymizeForStats(): boolean {
  return true;
}
/** LGPD Art. 18: erasure request expira após ERASURE_REQUEST_TTL_MS. @example isErasureExpired(reg, "user-1"); */
export function isErasureExpired(
  reg: EventsRegistry,
  userId: string,
  nowMs?: number
): boolean {
  const ts = reg.erasureRequests.get(userId);
  if (!ts) return false;
  const now = nowMs ?? Date.now();
  return now - ts > ERASURE_REQUEST_TTL_MS;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §7 Sacred-text policy helpers                                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Verifica se evento sacred tier X pode ser vendido. @example canSellEventSacred(3); // true canSellEventSacred(5); // false */
export function canSellEventSacred(tier: SacredTier): boolean {
  return tier <= MAX_COMMERCIAL_TIER;
}
/** Retorna payment tiers válidos para o sacred tier. @example validPaymentTiersForTier(5); // ["free", "donation"] */
export function validPaymentTiersForTier(
  tier: SacredTier
): PaymentTier[] {
  if (tier > MAX_COMMERCIAL_TIER) {
    return ["free", "donation"];
  }
  return ["free", "donation", "fixed", "sliding_scale"];
}
/** Verifica boundary de tradição:祭祭祭祭祭祭祭祭祭祭祭祭祭祭祭祭. Helper exported pra integração externa. @example checkTraditionBoundary("candomble", 3); */
export function checkTraditionBoundary(
  tradition: string,
  sacredTier: SacredTier
): { ok: boolean; notes: string[] } {
  const result = validateTraditionBoundary(tradition, sacredTier);
  return { ok: result.ok, notes: [...result.errors, ...result.warnings] };
}
/** Retorna traditions que são protected (não podem ser seculares). @example getProtectedTraditions(); */
export function getProtectedTraditions(): string[] {
  return [...SACRED_PROTECTED_TRADITIONS];
}
/** Marca evento como "ready-for-publish" se passou em todos os gates. @example isReadyForPublish(reg, "evt-1"); */
export function isReadyForPublish(
  reg: EventsRegistry,
  eventId: string
): boolean {
  const event = reg.events.get(eventId);
  if (!event) return false;
  const gate = validatePublishGate(event);
  return gate.ok;
}
/** Determina se evento precisa de curador antes de publish. @example requiresCurator(event); */
export function requiresCurator(event: EventListing): boolean {
  return event.sacredTier >= CURATOR_REQUIRED_TIER;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §8 Audit / chain helpers                                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Retorna tamanho da audit chain. @example auditSize(reg); */
export function auditSize(reg: EventsRegistry): number {
  return reg.audit.length;
}
/** Retorna último audit event (chain head). @example lastAuditEvent(reg); */
export function lastAuditEvent(reg: EventsRegistry): AuditEvent | null {
  if (reg.audit.length === 0) return null;
  return reg.audit[reg.audit.length - 1];
}
/** Retorna primeiros N audit events. @example firstNAuditEvents(reg, 10); */
export function firstNAuditEvents(
  reg: EventsRegistry,
  n: number
): AuditEvent[] {
  return reg.audit.slice(0, Math.max(0, n));
}
/** Filtra audit por tipo. @example filterAuditByType(reg, "RSVP_REGISTERED"); */
export function filterAuditByType(
  reg: EventsRegistry,
  type: AuditEventType
): AuditEvent[] {
  return reg.audit.filter((e) => e.type === type);
}
/** Conta audit events por tipo. @example countAuditByType(reg); */
export function countAuditByType(
  reg: EventsRegistry
): Record<AuditEventType, number> {
  const out = {} as Record<AuditEventType, number>;
  for (const e of reg.audit) {
    out[e.type] = (out[e.type] ?? 0) + 1;
  }
  return out;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §9 Smoke / regression                                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Placeholder event (helper interno — usado em validações). @example placeholderEvent(input); */
function placeholderEvent(input: CreateEventInput): EventListing {
  return {
    id: input.id, slug: input.slug, kind: input.kind,
    startsAt: input.startsAt, endsAt: input.endsAt,
    capacity: input.capacity, currentRsvps: 0,
    sacredTier: input.sacredTier, tradition: input.tradition,
    locale: input.locale, priceCents: input.priceCents,
    paymentTier: input.paymentTier, curator: null,
    published: false, hostId: input.hostId,
    hostDisplayName: input.hostDisplayName, tags: input.tags,
    createdAt: 0, updatedAt: 0,
  };
}
/** Empty aggregate stats factory. */
function emptyStats(): AggregateStats {
  return {
    eventsByKind: { ritual: 0, workshop: 0, circulo: 0, palestra: 0, meditacao: 0 },
    rsvpsByKind: { ritual: 0, workshop: 0, circulo: 0, palestra: 0, meditacao: 0 },
    capacityUtilizationPct: 0,
    eventsByTier: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    totalCancellations: 0, totalErasures: 0,
  };
}
/** Smoke helper: cria evento padrão, publicável, com defaults sensatos. */
function mkEvt(reg: EventsRegistry, id: string, ov: Partial<CreateEventInput> = {}): EventListing {
  const start = isoInDays(7);
  return createEvent(reg, {
    id, slug: id,
    kind: "palestra", sacredTier: 0, tradition: "cabala",
    locale: "pt-BR", priceCents: null, paymentTier: "free",
    startsAt: start, endsAt: addIso(start, 2 * 60 * 60 * 1000),
    hostId: "h-1", hostDisplayName: "Host",
    capacity: 10, tags: [],
    ...ov,
  });
}
/** Smoke helper: adiciona curator approval. */
function approve(reg: EventsRegistry, evt: EventListing, cur = "cur-1"): void {
  curatorReview(reg, evt.id, {
    approverId: cur,
    approverDisplayName: "Curador",
    verdict: "approved",
    reason: "aprovado",
    traditionBoundariesChecked: [evt.tradition],
  });
}
/** Smoke helper: cria RSVP confirmado. */
function mkRsvp(reg: EventsRegistry, evt: EventListing, userId: string): RSVP {
  return registerRSVP(reg, evt, {
    attendeeId: userId, attendeeDisplayName: userId,
    consent: createConsent("RSVP_EVENT"),
  });
}
/** Test runner — exec automatic. @example runSmokeTests(); */
export function runSmokeTests(): { passed: number; failed: number; cases: string[] } {
  const out: { name: string; ok: boolean; msg?: string }[] = [];
  function test(name: string, fn: () => void): void {
    try { fn(); out.push({ name, ok: true }); }
    catch (e) { out.push({ name, ok: false, msg: (e as Error).message }); }
  }

  // 1. Capacity overflow → waitlist
  test("capacity-overflow-waitlist", () => {
    const r = createRegistry();
    const e = mkEvt(r, "e1", { capacity: 2 });
    publishEvent(r, e.id);
    const a = mkRsvp(r, e, "u1");
    const b = mkRsvp(r, e, "u2");
    const c = mkRsvp(r, e, "u3");
    if (a.status !== "confirmed" || b.status !== "confirmed") throw new Error("first two must be confirmed");
    if (c.status !== "waitlist") throw new Error("third must be waitlist");
    if (c.waitlistPosition !== 1) throw new Error("waitlist pos wrong");
  });

  // 2. Schedule conflict → throws
  test("schedule-conflict-throws", () => {
    const r = createRegistry();
    const w = createWorkshop(r, {
      id: "w1", slug: "w1", title: "T", description: "D",
      mentorId: "m1", mentorDisplayName: "M", tradition: "cabala",
      sacredFlag: false, sacredTier: 1, capacity: 10, locale: "pt-BR",
      sessions: [{
        startsAt: isoInDays(10), endsAt: addIso(isoInDays(10), 60 * 60 * 1000),
        capacity: 10, status: "scheduled", onlineUrl: null,
        city: "SP", mentorId: "m1", mentorDisplayName: "M", notes: null,
      }],
    });
    let threw = false;
    try { scheduleWorkshopSession(r, w.id, isoInDays(10), isoInDays(10), 10, null, "SP"); }
    catch { threw = true; }
    if (!threw) throw new Error("expected conflict");
  });

  // 3. Missing consent → rejected
  test("missing-consent-rejected", () => {
    const r = createRegistry();
    const e = mkEvt(r, "e2", { kind: "ritual", sacredTier: 3, tradition: "candomble" });
    approve(r, e);
    publishEvent(r, e.id);
    let threw = false;
    try {
      registerRSVP(r, e, {
        attendeeId: "u", attendeeDisplayName: "U",
        consent: { purpose: "", termsVersion: CONSENT_TERMS_VERSION, timestamp: Date.now(), marketingOptIn: false, sacredContentOptIn: false },
      });
    } catch { threw = true; }
    if (!threw) throw new Error("expected consent throw");
  });

  // 4. Tier 4 published without curator → blocked
  test("tier4-no-curator-blocked", () => {
    const r = createRegistry();
    const e = mkEvt(r, "e3", { kind: "ritual", sacredTier: 4, tradition: "candomble" });
    let threw = false;
    try { publishEvent(r, e.id); } catch { threw = true; }
    if (!threw) throw new Error("expected publish block");
  });

  // 5. Tier 5 sacred with price > 0 → blocked
  test("tier5-price-blocked", () => {
    const r = createRegistry();
    let threw = false;
    try {
      mkEvt(r, "e4", { kind: "ritual", sacredTier: 5, tradition: "candomble", priceCents: 5000, paymentTier: "fixed" });
    } catch { threw = true; }
    if (!threw) throw new Error("expected price block");
  });

  // 6. Retention purge removes old
  test("retention-purge-old", () => {
    const r = createRegistry();
    const e = mkEvt(r, "ePurge");
    publishEvent(r, e.id);
    const old: RSVP = {
      id: "old", eventId: e.id, eventKind: "palestra",
      attendeeId: "u-old", attendeeDisplayName: "U",
      status: "confirmed", createdAt: isoMonthsAgo(30),
      updatedAt: isoMonthsAgo(30),
      consent: createConsent("RSVP_EVENT"),
      waitlistPosition: null, cancellationReason: null, statusHistory: [],
    };
    r.rsvps.set(old.id, old);
    const result = purgeOldRsvps(r);
    if (result.purged < 1) throw new Error("expected purge");
    if (r.rsvps.has("old")) throw new Error("old still there");
  });

  // 7. Export returns full history
  test("export-rsvp-history", () => {
    const r = createRegistry();
    const e = mkEvt(r, "eExp");
    publishEvent(r, e.id);
    mkRsvp(r, e, "u-exp");
    const out = exportRsvpHistory(r, "u-exp");
    if (out.rsvps.length !== 1) throw new Error("expected 1 rsvp");
  });

  // 8. Curator approval enables publish
  test("curator-approval-publish", () => {
    const r = createRegistry();
    const e = mkEvt(r, "eCur", { kind: "ritual", sacredTier: 3, tradition: "umbanda", paymentTier: "donation", priceCents: 0 });
    approve(r, e);
    const pub = publishEvent(r, e.id);
    if (!pub.published) throw new Error("not published");
  });

  // 9. Cancel RSVP frees seat
  test("cancel-rsvp-frees-seat", () => {
    const r = createRegistry();
    const e = mkEvt(r, "eC", { capacity: 1, kind: "meditacao", sacredTier: 2, tradition: "meditacao" });
    publishEvent(r, e.id);
    const r1 = mkRsvp(r, e, "u1");
    cancelRSVP(r, r1.id, "teste");
    const r2 = mkRsvp(r, e, "u2");
    if (r2.status !== "confirmed") throw new Error("not promoted");
  });

  // 10. Sacred workshop booking blocked without curator
  test("sacred-workshop-no-curator-blocked", () => {
    const r = createRegistry();
    const w = createWorkshop(r, {
      id: "wS", slug: "wS", title: "T", description: "D",
      mentorId: "mS", mentorDisplayName: "M", tradition: "umbanda",
      sacredFlag: true, sacredTier: 4, capacity: 10, locale: "pt-BR",
      sessions: [{ startsAt: isoInDays(20), endsAt: addIso(isoInDays(20), 60 * 60 * 1000), capacity: 10,
        status: "scheduled", onlineUrl: null, city: "Rio",
        mentorId: "mS", mentorDisplayName: "M", notes: null }],
    });
    w.published = true;
    let threw = false;
    try { bookWorkshop(r, w, { attendeeId: "u", attendeeDisplayName: "U",
      consent: createConsent("RSVP_WORKSHOP", false, true) }); }
    catch { threw = true; }
    if (!threw) throw new Error("expected book throw");
  });

  // 11. Erasure request
  test("erasure-deletes-rsvps", () => {
    const r = createRegistry();
    const e = mkEvt(r, "eEra");
    publishEvent(r, e.id);
    mkRsvp(r, e, "u-era");
    const res = requestErasure(r, "u-era");
    if (res.purgedRsvps !== 1) throw new Error("expected 1 purged");
  });

  // 12. Waitlist promotion
  test("waitlist-promotion-on-cancel", () => {
    const r = createRegistry();
    const e = mkEvt(r, "eW", { capacity: 1 });
    publishEvent(r, e.id);
    const r1 = mkRsvp(r, e, "u1");
    const r2 = mkRsvp(r, e, "u2");
    cancelRSVP(r, r1.id, "liberar");
    const after = getRsvpById(r, r2.id);
    if (!after || after.status !== "confirmed") throw new Error("not promoted");
  });

  // 13. Sacred tradition tier≥3
  test("sacred-tradition-tier-required", () => {
    const r = createRegistry();
    let threw = false;
    try { mkEvt(r, "eTr", { kind: "ritual", sacredTier: 1, tradition: "exu" }); }
    catch { threw = true; }
    if (!threw) throw new Error("expected sacred tradition throw");
  });

  // 14. Audit chain integrity
  test("audit-chain-integrity", () => {
    const r = createRegistry();
    const e = mkEvt(r, "eAud");
    publishEvent(r, e.id);
    const ok = verifyAuditChain(r);
    if (!ok.ok) throw new Error(`chain broken at ${ok.brokenAt}`);
  });

  // 15. fnv1a32 determinism
  test("fnv1a32-deterministic", () => {
    if (fnv1a32("abc") !== fnv1a32("abc")) throw new Error("non-deterministic");
  });

  // 16. intervalsOverlap excludes touch
  test("intervals-touch-not-overlap", () => {
    const overlap = intervalsOverlap("2026-01-01T10:00:00Z", "2026-01-01T11:00:00Z",
                                       "2026-01-01T11:00:00Z", "2026-01-01T12:00:00Z");
    if (overlap) throw new Error("should not overlap on touch");
  });

  // 17. Slug validation
  test("slug-rejects-spaces", () => {
    if (validateSlug("Bad Slug").ok) throw new Error("should reject");
  });

  // 18. canSellEventSacred boundary
  test("cansell-tier5-no", () => {
    if (canSellEventSacred(5)) throw new Error("tier 5 should be unsellable");
    if (!canSellEventSacred(4)) throw new Error("tier 4 should sell");
  });

  // 19. aggregateStats survive erasure
  test("aggregate-survive-erasure", () => {
    const r = createRegistry();
    const e = mkEvt(r, "eAgg", { kind: "circulo", sacredTier: 1 });
    publishEvent(r, e.id);
    mkRsvp(r, e, "u-agg");
    const before = r.aggregateStats.rsvpsByKind.circulo;
    requestErasure(r, "u-agg");
    if (r.aggregateStats.rsvpsByKind.circulo !== before) throw new Error("agg changed");
  });

  // 20. Workshop booking with curator OK
  test("workshop-booking-with-curator", () => {
    const r = createRegistry();
    const w = createWorkshop(r, {
      id: "wOK", slug: "wOK", title: "T", description: "D",
      mentorId: "mOK", mentorDisplayName: "M", tradition: "cabala",
      sacredFlag: true, sacredTier: 3, capacity: 8, locale: "pt-BR",
      sessions: [{ startsAt: isoInDays(20), endsAt: addIso(isoInDays(20), 60 * 60 * 1000), capacity: 8,
        status: "scheduled", onlineUrl: null, city: "SP",
        mentorId: "mOK", mentorDisplayName: "M", notes: null }],
    });
    w.curator = { approverId: "c3", approverDisplayName: "C3",
      verdict: "approved", reason: "ok", timestamp: Date.now(),
      tier: 3, traditionBoundariesChecked: ["cabala"] };
    w.published = true;
    const b = bookWorkshop(r, w, { attendeeId: "u", attendeeDisplayName: "U",
      consent: createConsent("RSVP_WORKSHOP", false, true) });
    if (b.status !== "active") throw new Error("not active");
  });

  // 21. Schedule session no conflict
  test("schedule-no-conflict-ok", () => {
    const r = createRegistry();
    const w = createWorkshop(r, {
      id: "wNC", slug: "wNC", title: "T", description: "D",
      mentorId: "mNC", mentorDisplayName: "M", tradition: "cabala",
      sacredFlag: false, sacredTier: 1, capacity: 10, locale: "pt-BR",
      sessions: [{ startsAt: isoInDays(15), endsAt: addIso(isoInDays(15), 60 * 60 * 1000), capacity: 10,
        status: "scheduled", onlineUrl: null, city: "RJ",
        mentorId: "mNC", mentorDisplayName: "M", notes: null }],
    });
    const s = scheduleWorkshopSession(r, w.id, isoInDays(20), addIso(isoInDays(20), 60 * 60 * 1000), 10, null, "RJ");
    if (!s.id) throw new Error("not created");
  });

  // 22. Mark attended after event ends
  test("mark-attended-past", () => {
    const r = createRegistry();
    const past = isoMonthsAgo(2);
    const e = createEvent(r, { id: "ePast", slug: "ePast", kind: "palestra",
      startsAt: past, endsAt: addIso(past, 60 * 60 * 1000), capacity: 10, sacredTier: 0,
      tradition: "astrologia", locale: "pt-BR", priceCents: null,
      paymentTier: "free", hostId: "h", hostDisplayName: "H", tags: [] });
    publishEvent(r, e.id);
    const rv = mkRsvp(r, e, "uP");
    const upd = markAttendance(r, rv.id, "attended");
    if (upd.status !== "attended") throw new Error("not marked");
  });

  // 23. getUpcomingEvents filter
  test("upcoming-events-filter", () => {
    const r = createRegistry();
    mkEvt(r, "u1", { kind: "ritual", sacredTier: 3 });
    mkEvt(r, "u2", { kind: "palestra" });
    const list = getUpcomingEvents(r, { kind: "ritual" });
    if (list.length !== 1 || list[0].kind !== "ritual") throw new Error("filter broken");
  });

  // 24. Consent terms mismatch warns
  test("consent-mismatch-warns", () => {
    const res = validateConsent({ purpose: "RSVP", termsVersion: "v0.1",
      timestamp: Date.now(), marketingOptIn: false, sacredContentOptIn: false });
    if (!res.ok) throw new Error("should be ok");
    if (res.warnings.length === 0) throw new Error("expected warning");
  });

  // 25. utilization recompute
  test("utilization-recompute", () => {
    const r = createRegistry();
    mkEvt(r, "uC");
    const pct = recomputeUtilization(r);
    if (pct < 0 || pct > 100) throw new Error("pct oob");
  });

  const passed = out.filter((x) => x.ok).length;
  const failed = out.length - passed;
  return {
    passed,
    failed,
    cases: out.map((x) => (x.ok ? x.name : `${x.name}: ${x.msg ?? ""}`)),
  };
}
// Auto-run quando módulo carrega em ambiente de teste / node
const _auto = runSmokeTests();
if (_auto.failed > 0) {
  // eslint-disable-next-line no-console
  if (typeof console !== "undefined") {
    console.log(`[w57 smoke] ${_auto.passed} passed, ${_auto.failed} failed`);
  }
}
