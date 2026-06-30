/**
 * ════════════════════════════════════════════════════════════════════════════
 * W80-C — MARKETPLACE BOOKING UI · ENGINE CONTRACT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 80 · 2026-06-30
 * Adapter for the W65-C marketplace-pricing-engine (cycle 65, branch
 * w65/marketplace-pricing-engine, SHA 01d9d92, 1067 LOC, 89/89 spec PASS).
 *
 * The W65 engine exports (per docs/WAVE-LOG.md cycle 65 brief):
 *   priceService, holdEscrow, releaseEscrow, refundEscrow,
 *   isSellerEligible, auditMarketplacePricing, validatePricing,
 *   chainEscrowHash
 *
 * The contract here is the **view-model layer** that the React UI consumes:
 *   - Offering list (7 traditions)
 *   - Slot generation + availability
 *   - Pricing quote (BRL cents)
 *   - Booking intent creation + status flow
 *   - LGPD consent gate (precondition for any PII capture)
 *   - Payment intent shape (Stripe-compatible mirror)
 *
 * The contract is testable in isolation. When the real W65 engine module is
 * available (post-merge), swap `_mockEngineImpl` for `await import(...)`.
 *
 * Durable lessons applied (cycle 60-79):
 *   - Object.freeze on every returned record + every nested array (cycle 75)
 *   - Branded types for IDs (cycle 77)
 *   - Discriminated union result type with `ok` (cycle 73)
 *   - HMAC SHA-256 chain for audit ledger (cycle 60 lesson — NEVER FNV)
 *   - SHA-256 cache key via canonical JSON (cycle 67)
 *   - Result narrowing POSITIVE: `if (r.ok)` not `if (!r.ok)` (cycle 73)
 *   - 7-tradition sacred coverage floor (cycle 65: 81+ symbols)
 *   - LGPD: explicit consent BEFORE PII capture (cycle 70 / 78)
 */

import * as _crypto from 'node:crypto';

// ════════════════════════════════════════════════════════════════════════════
// TYPES — Branded primitives + DTOs
// ════════════════════════════════════════════════════════════════════════════

/** Brand helpers — opaque nominal types */
export type Brand<T, B extends string> = T & { readonly __brand: B };

export type OfferingId = Brand<string, 'OfferingId'>;
export type UniversalistId = Brand<string, 'UniversalistId'>;
export type SlotId = Brand<string, 'SlotId'>;
export type BookingId = Brand<string, 'BookingId'>;
export type PaymentIntentId = Brand<string, 'PaymentIntentId'>;
export type EscrowId = Brand<string, 'EscrowId'>;
export type ConsentToken = Brand<string, 'ConsentToken'>;

/** BRL cents — opaque integer to prevent BRL/float math mistakes */
export type BRLCents = Brand<number, 'BRLCents'>;

/** 7 sacred traditions covered by the marketplace */
export type SacredTradition =
  | 'LEITURA_CIGANO'
  | 'CONSULTA_ORIXA'
  | 'MAPA_ASTROLOGICO'
  | 'ESTUDO_CABALISTICO'
  | 'SESSAO_NUMEROLOGIA'
  | 'PRATICA_TANTRA'
  | 'JOGO_TAROT';

export const SACRED_TRADITIONS: ReadonlyArray<SacredTradition> = Object.freeze([
  'LEITURA_CIGANO',
  'CONSULTA_ORIXA',
  'MAPA_ASTROLOGICO',
  'ESTUDO_CABALISTICO',
  'SESSAO_NUMEROLOGIA',
  'PRATICA_TANTRA',
  'JOGO_TAROT',
] as const);

/** Tradition → human label (PT-BR, A11Y-friendly) */
export const TRADITION_LABELS: Readonly<Record<SacredTradition, string>> = Object.freeze({
  LEITURA_CIGANO: 'Leitura de Cigano',
  CONSULTA_ORIXA: 'Consulta de Orixá',
  MAPA_ASTROLOGICO: 'Mapa Astrológico',
  ESTUDO_CABALISTICO: 'Estudo Cabalístico',
  SESSAO_NUMEROLOGIA: 'Sessão de Numerologia',
  PRATICA_TANTRA: 'Prática de Tantra',
  JOGO_TAROT: 'Jogo de Tarot',
});

/** Tradition → single emoji glyph (decorative, never as sole A11Y label) */
export const TRADITION_GLYPH: Readonly<Record<SacredTradition, string>> = Object.freeze({
  LEITURA_CIGANO: '🃏',
  CONSULTA_ORIXA: '🌿',
  MAPA_ASTROLOGICO: '✨',
  ESTUDO_CABALISTICO: '☸',
  SESSAO_NUMEROLOGIA: '🔢',
  PRATICA_TANTRA: '🕉',
  JOGO_TAROT: '🌙',
});

export type ServiceTier = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER';

export type SlotStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';

export type BookingStatus =
  | 'DRAFT'
  | 'AWAITING_CONSENT'
  | 'AWAITING_PAYMENT'
  | 'ESCROW_HELD'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'RELEASED'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'FAILED';

export type PaymentStatus =
  | 'IDLE'
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED';

export type ConsentScope =
  | 'pii_capture'
  | 'payment_processing'
  | 'calendar_storage'
  | 'whatsapp_followup';

export interface ConsentRecord {
  readonly token: ConsentToken;
  readonly scopes: ReadonlyArray<ConsentScope>;
  readonly grantedAt: string; // ISO 8601
  readonly lgpdVersion: '1.0.0' | '1.1.0' | '2.0.0';
  readonly ipRedacted: string; // SHA-256 prefix
  readonly userAgentHash: string; // SHA-256 prefix
  readonly expiresAt: string; // ISO 8601 — TTL 90 days
}

export interface Offering {
  readonly id: OfferingId;
  readonly universalistId: UniversalistId;
  readonly universalistDisplayName: string;
  readonly tradition: SacredTradition;
  readonly tier: ServiceTier;
  readonly title: string;
  readonly description: string;
  readonly durationMin: 15 | 30 | 45 | 60 | 90 | 120;
  readonly priceBRLCents: BRLCents;
  readonly reputationScore: number; // 0.0 - 5.0
  readonly totalReadings: number; // gate: ≥ 10
  readonly isSellerEligible: boolean; // computed via W65 isSellerEligible()
  readonly language: ReadonlyArray<'pt-BR' | 'en' | 'es'>;
  readonly createdAt: string;
}

export interface Slot {
  readonly id: SlotId;
  readonly universalistId: UniversalistId;
  readonly startsAt: string; // ISO 8601 BRT
  readonly endsAt: string; // ISO 8601 BRT
  readonly status: SlotStatus;
  readonly offeringId: OfferingId;
}

export interface PriceQuote {
  readonly offeringId: OfferingId;
  readonly baseBRLCents: BRLCents;
  readonly platformFeeBRLCents: BRLCents;
  readonly netToSellerBRLCents: BRLCents;
  readonly taxBRLCents: BRLCents;
  readonly totalBRLCents: BRLCents;
  readonly chainHash: string; // HMAC-SHA-256 hex
  readonly validUntil: string; // ISO 8601 — TTL 15 min
}

export interface PaymentIntentShape {
  readonly id: PaymentIntentId;
  readonly bookingId: BookingId;
  readonly amountBRLCents: BRLCents;
  readonly currency: 'BRL';
  readonly provider: 'stripe' | 'mercadopago' | 'pix';
  readonly escrowId: EscrowId;
  readonly status: PaymentStatus;
  readonly clientSecret: string; // Opaque
  readonly expiresAt: string; // ISO 8601 — TTL 30 min
}

export interface Booking {
  readonly id: BookingId;
  readonly offeringId: OfferingId;
  readonly slotId: SlotId;
  readonly universalistId: UniversalistId;
  readonly seekerId: UniversalistId; // pseudonymized
  readonly status: BookingStatus;
  readonly priceQuote: PriceQuote;
  readonly paymentIntent: PaymentIntentShape | null;
  readonly consentToken: ConsentToken | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ════════════════════════════════════════════════════════════════════════════
// RESULT TYPE — Discriminated union
// ════════════════════════════════════════════════════════════════════════════

export type Result<T, E extends string = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E; readonly message: string };

export function ok<T>(value: T): Result<T, never> {
  return Object.freeze({ ok: true as const, value });
}

export function err<E extends string>(error: E, message: string): Result<never, E> {
  return Object.freeze({ ok: false as const, error, message });
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const W80_C_VERSION = '1.0.0';
export const W80_C_CYCLE = 80;
export const W80_C_TRADITIONS_COVERED = 7;
export const W80_C_OFFERINGS_FIXTURE_COUNT = 21; // 3 sellers × 7 traditions
export const W80_C_LGPD_VERSION: ConsentRecord['lgpdVersion'] = '2.0.0';

/** Minimum touch target (WCAG AA, mobile-first) */
export const MIN_TOUCH_TARGET_PX = 44;

/** Platform fee in basis points (12.5%) */
export const PLATFORM_FEE_BPS = 1250;
export const BPS_DIVISOR = 10_000;

/** Price quote TTL — 15 minutes */
export const PRICE_QUOTE_TTL_MS = 15 * 60 * 1000;

/** Payment intent TTL — 30 minutes */
export const PAYMENT_INTENT_TTL_MS = 30 * 60 * 1000;

/** LGPD consent TTL — 90 days */
export const LGPD_CONSENT_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/** Minimum reputation gate (W65 engine contract) */
export const MIN_REPUTATION_GATE = 4.0;

/** Minimum readings count gate (W65 engine contract) */
export const MIN_READINGS_GATE = 10;

// ════════════════════════════════════════════════════════════════════════════
// HELPERS — Branded constructors + utilities
// ════════════════════════════════════════════════════════════════════════════

function makeBrand<T extends string>(prefix: string, s: string, minLen = 3, maxLen = 64): T {
  if (typeof s !== 'string') throw new Error(`brand ${prefix} requires string`);
  if (s.length < minLen || s.length > maxLen) {
    throw new Error(`brand ${prefix} length out of bounds: ${s.length} not in [${minLen}, ${maxLen}]`);
  }
  if (!/^[a-z0-9_]+$/i.test(s)) {
    throw new Error(`brand ${prefix} invalid chars: ${s}`);
  }
  return s as T;
}

export const offeringId = (s: string): OfferingId => makeBrand<OfferingId>('offering', `off_${s}`, 6, 60);
export const universalistId = (s: string): UniversalistId => makeBrand<UniversalistId>('user', `usr_${s}`, 6, 60);
export const slotId = (s: string): SlotId => makeBrand<SlotId>('slot', `slt_${s}`, 6, 60);
export const bookingId = (s: string): BookingId => makeBrand<BookingId>('booking', `bk_${s}`, 6, 60);
export const paymentIntentId = (s: string): PaymentIntentId => makeBrand<PaymentIntentId>('pi', `pi_${s}`, 6, 60);
export const escrowId = (s: string): EscrowId => makeBrand<EscrowId>('escrow', `esc_${s}`, 6, 60);
export const consentToken = (s: string): ConsentToken => makeBrand<ConsentToken>('consent', `cns_${s}`, 8, 64);
export const brlCents = (n: number): BRLCents => {
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000_00) {
    throw new Error(`BRLCents out of bounds: ${n}`);
  }
  return n as BRLCents;
};

export function formatBRL(cents: BRLCents): string {
  const reais = Math.floor(cents / 100);
  const c = cents % 100;
  return `R$ ${reais.toLocaleString('pt-BR')},${c.toString().padStart(2, '0')}`;
}

// ════════════════════════════════════════════════════════════════════════════
// SHA-256 / HMAC SHA-256 — sync (no subtle.crypto in some sandboxes)
// ════════════════════════════════════════════════════════════════════════════

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]!;
    out += b.toString(16).padStart(2, '0');
  }
  return out;
}

/** Sync SHA-256 — uses node:crypto (Node 22 sandbox safe). */
export function sha256HexSync(input: string): string {
  return _crypto.createHash('sha256').update(input, 'utf-8').digest('hex');
}

/** Sync HMAC-SHA-256 — same rationale as above. */
export function hmacSha256Sync(key: string, message: string): string {
  return _crypto.createHmac('sha256', key).update(message, 'utf-8').digest('hex');
}


/** Canonical JSON for cache key + HMAC input (cycle 67 pattern) */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJson).join(',') + ']';
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts: string[] = [];
  for (const k of keys) {
    parts.push(JSON.stringify(k) + ':' + canonicalJson(obj[k]));
  }
  return '{' + parts.join(',') + '}';
}

// ════════════════════════════════════════════════════════════════════════════
// LGPD CONSENT — Explicit gate before any PII capture
// ════════════════════════════════════════════════════════════════════════════

export interface LgpdConsentInput {
  readonly scopes: ReadonlyArray<ConsentScope>;
  readonly ipRedacted: string; // already-hashed IP prefix
  readonly userAgentHash: string; // already-hashed UA prefix
  readonly now?: string; // ISO 8601, for testability
}

export function issueConsentToken(input: LgpdConsentInput): ConsentRecord {
  if (input.scopes.length === 0) {
    throw new Error('LGPD: at least one scope required');
  }
  for (const s of input.scopes) {
    const allowed: ReadonlyArray<ConsentScope> = [
      'pii_capture',
      'payment_processing',
      'calendar_storage',
      'whatsapp_followup',
    ];
    if (!allowed.includes(s)) throw new Error(`LGPD: invalid scope ${s}`);
  }
  if (!/^[a-f0-9]{8,32}$/.test(input.ipRedacted)) {
    throw new Error('LGPD: ipRedacted must be 8-32 hex chars');
  }
  if (!/^[a-f0-9]{8,32}$/.test(input.userAgentHash)) {
    throw new Error('LGPD: userAgentHash must be 8-32 hex chars');
  }
  const now = input.now ?? new Date().toISOString();
  const issued = sha256HexSync(`${now}|${input.scopes.join(',')}|${input.ipRedacted}|${input.userAgentHash}`);
  const expires = new Date(Date.parse(now) + LGPD_CONSENT_TTL_MS).toISOString();
  return Object.freeze({
    token: consentToken(issued.slice(0, 40)),
    scopes: Object.freeze([...input.scopes] as ReadonlyArray<ConsentScope>),
    grantedAt: now,
    lgpdVersion: W80_C_LGPD_VERSION,
    ipRedacted: input.ipRedacted,
    userAgentHash: input.userAgentHash,
    expiresAt: expires,
  });
}

export function isConsentValid(record: ConsentRecord, required: ReadonlyArray<ConsentScope>, now?: string): boolean {
  const ts = now ?? new Date().toISOString();
  if (Date.parse(ts) > Date.parse(record.expiresAt)) return false;
  for (const r of required) {
    if (!record.scopes.includes(r)) return false;
  }
  return true;
}

// ════════════════════════════════════════════════════════════════════════════
// OFFERING FIXTURES — 7 traditions × 3 universalistas (deterministic)
// ════════════════════════════════════════════════════════════════════════════

const FIXED_SEED = 'w80c-marketplace-fixtures-v1';

interface OfferingSeed {
  tradition: SacredTradition;
  tier: ServiceTier;
  title: string;
  description: string;
  durationMin: 15 | 30 | 45 | 60 | 90 | 120;
  basePrice: number; // BRL reais
  reputation: number;
  totalReadings: number;
}

const OFFERING_SEEDS: ReadonlyArray<OfferingSeed> = Object.freeze([
  // Universalista A — Cigano master
  { tradition: 'LEITURA_CIGANO', tier: 'MASTER', title: 'Leitura Completa da Mesa Real (36 cartas)', description: 'Abertura completa da Mesa Real Cigana com 36 cartas. Cruzamento astrológico + orixás regentes.', durationMin: 90, basePrice: 280, reputation: 4.8, totalReadings: 412 },
  { tradition: 'CONSULTA_ORIXA', tier: 'ADVANCED', title: 'Consulta de Odu de Nascimento', description: 'Consulta de Odu com identificação do orixá regente + caminho de Ifá.', durationMin: 60, basePrice: 220, reputation: 4.7, totalReadings: 268 },
  { tradition: 'MAPA_ASTROLOGICO', tier: 'ADVANCED', title: 'Mapa Astrológico Completo + Lilith', description: 'Mapa natal com Sol, Lua, Ascendente, Lilith, Nodos Lunares e aspectos principais.', durationMin: 90, basePrice: 320, reputation: 4.9, totalReadings: 184 },
  { tradition: 'ESTUDO_CABALISTICO', tier: 'INTERMEDIATE', title: 'Estudo da Árvore da Vida (10 Sefirot)', description: 'Estudo Cabalístico prático com meditação dos 10 Sefirot + 22 caminhos.', durationMin: 60, basePrice: 180, reputation: 4.5, totalReadings: 96 },
  { tradition: 'SESSAO_NUMEROLOGIA', tier: 'BASIC', title: 'Mapa Numerológico Cabalístico', description: 'LifePath, Expression, SoulUrge, PersonalYear + Master Numbers preservados.', durationMin: 45, basePrice: 90, reputation: 4.3, totalReadings: 156 },
  { tradition: 'PRATICA_TANTRA', tier: 'INTERMEDIATE', title: 'Prática de Tantra — 7 Chakras', description: 'Sessão de equilíbrio dos 7 chakras com meditação guiada e respiração.', durationMin: 60, basePrice: 150, reputation: 4.6, totalReadings: 78 },
  { tradition: 'JOGO_TAROT', tier: 'BASIC', title: 'Jogo de Tarot — 3 Cartas (Passado/Presente/Futuro)', description: 'Jogo de 3 cartas com interpretação dos Arcanos Maiores + Menores.', durationMin: 30, basePrice: 70, reputation: 4.4, totalReadings: 312 },
  // Universalista B — Orixás specialist
  { tradition: 'LEITURA_CIGANO', tier: 'INTERMEDIATE', title: 'Leitura de Cigano — 9 cartas', description: 'Leitura Cigana intermediária com 9 cartas e cruzamento de Orixás.', durationMin: 45, basePrice: 130, reputation: 4.5, totalReadings: 86 },
  { tradition: 'CONSULTA_ORIXA', tier: 'MASTER', title: 'Bori & Consulta Completa de Orixá', description: 'Bori + consulta completa de orixá regente, pedindo atenção e ebó.', durationMin: 120, basePrice: 380, reputation: 4.9, totalReadings: 224 },
  { tradition: 'MAPA_ASTROLOGICO', tier: 'INTERMEDIATE', title: 'Mapa Solar (signo + Ascendente)', description: 'Foco no Sol, Lua e Ascendente com interpretação prática.', durationMin: 45, basePrice: 140, reputation: 4.6, totalReadings: 142 },
  { tradition: 'ESTUDO_CABALISTICO', tier: 'BASIC', title: 'Introdução à Cabala — 22 Caminhos', description: 'Introdução ao Tarô Cabalístico + 22 letras hebraicas + meditação.', durationMin: 45, basePrice: 95, reputation: 4.2, totalReadings: 64 },
  { tradition: 'SESSAO_NUMEROLOGIA', tier: 'INTERMEDIATE', title: 'Sessão Numerológica Cabalística', description: 'Análise numerológica cabalística com ciclos de 9 anos.', durationMin: 60, basePrice: 130, reputation: 4.4, totalReadings: 108 },
  { tradition: 'PRATICA_TANTRA', tier: 'BASIC', title: 'Tantra Introdutório — Respiração e Movimento', description: 'Sessão introdutória de Tantra com foco em respiração e movimento consciente.', durationMin: 30, basePrice: 80, reputation: 3.8, totalReadings: 42 },
  { tradition: 'JOGO_TAROT', tier: 'INTERMEDIATE', title: 'Tarot — Cruz Celta (10 cartas)', description: 'Cruz Celta com 10 cartas e interpretação profunda dos 4 naipes.', durationMin: 60, basePrice: 160, reputation: 4.7, totalReadings: 178 },
  // Universalista C — Tantra + Cabala
  { tradition: 'LEITURA_CIGANO', tier: 'BASIC', title: 'Leitura Cigana — 3 cartas', description: 'Leitura rápida de 3 cartas para orientação pontual.', durationMin: 15, basePrice: 50, reputation: 3.7, totalReadings: 24 },
  { tradition: 'CONSULTA_ORIXA', tier: 'BASIC', title: 'Orientação de Orixá — Sessão Express', description: 'Sessão express de 30min para orientação de orixá.', durationMin: 30, basePrice: 80, reputation: 4.1, totalReadings: 8 },
  { tradition: 'MAPA_ASTROLOGICO', tier: 'BASIC', title: 'Mapa Astrológico — Sessão Express', description: 'Mapa solar rápido com foco em trânsito do momento.', durationMin: 30, basePrice: 85, reputation: 4.3, totalReadings: 56 },
  { tradition: 'ESTUDO_CABALISTICO', tier: 'MASTER', title: 'Cabala Avançada — Meditação dos Nomes Divinos', description: 'Estudo profundo dos 72 Nomes Divinos + meditação guiada.', durationMin: 120, basePrice: 420, reputation: 4.9, totalReadings: 92 },
  { tradition: 'SESSAO_NUMEROLOGIA', tier: 'ADVANCED', title: 'Numerologia Cabalística Avançada', description: 'Análise numerológica completa com ciclos, pinnacles e challenges.', durationMin: 90, basePrice: 240, reputation: 4.7, totalReadings: 124 },
  { tradition: 'PRATICA_TANTRA', tier: 'ADVANCED', title: 'Tantra Avançado — Meditação Kundalini', description: 'Meditação Kundalini avançada com ativação dos 7 chakras.', durationMin: 90, basePrice: 260, reputation: 4.8, totalReadings: 64 },
  { tradition: 'JOGO_TAROT', tier: 'ADVANCED', title: 'Tarot Avançado — Mandala Astral', description: 'Mandala Astral com 22 cartas e interpretação dos Arcanos Maiores.', durationMin: 90, basePrice: 280, reputation: 4.8, totalReadings: 88 },
]);

export function listOfferings(): ReadonlyArray<Offering> {
  const result: Offering[] = [];
  OFFERING_SEEDS.forEach((seed, idx) => {
    const sellerIdx = idx < 7 ? 0 : idx < 14 ? 1 : 2;
    const sellerNames = ['Irmandade Estrela Guia', 'Casa do Odu', 'Santuário Tantra Cabalá'];
    const cents = Math.round(seed.basePrice * 100);
    const isEligible = seed.reputation >= MIN_REPUTATION_GATE && seed.totalReadings >= MIN_READINGS_GATE;
    result.push(Object.freeze({
      id: offeringId(`${sellerIdx}_${seed.tradition.toLowerCase()}_${seed.tier.toLowerCase()}`),
      universalistId: universalistId(`seller${sellerIdx}_w80c`),
      universalistDisplayName: sellerNames[sellerIdx]!,
      tradition: seed.tradition,
      tier: seed.tier,
      title: seed.title,
      description: seed.description,
      durationMin: seed.durationMin,
      priceBRLCents: brlCents(cents),
      reputationScore: seed.reputation,
      totalReadings: seed.totalReadings,
      isSellerEligible: isEligible,
      language: Object.freeze(['pt-BR'] as ReadonlyArray<'pt-BR'>),
      createdAt: '2026-06-01T00:00:00.000Z',
    } as Offering));
  });
  return Object.freeze(result);
}

// ════════════════════════════════════════════════════════════════════════════
// SLOT GENERATION — 14 days forward, 3 slots/day, deterministic
// ════════════════════════════════════════════════════════════════════════════

export interface SlotGenerationOptions {
  readonly universalistId: UniversalistId;
  readonly offeringId: OfferingId;
  readonly durationMin: number;
  readonly daysForward?: number; // default 14
  readonly slotsPerDay?: number; // default 3 (morning/afternoon/evening)
  readonly now?: string; // ISO 8601
}

const HOUR_SLOTS: ReadonlyArray<number> = Object.freeze([9, 14, 19]); // 9h, 14h, 19h BRT

export function generateSlots(opts: SlotGenerationOptions): ReadonlyArray<Slot> {
  const days = opts.daysForward ?? 14;
  const perDay = opts.slotsPerDay ?? 3;
  const now = opts.now ?? new Date().toISOString();
  const baseDate = new Date(now);
  baseDate.setUTCHours(0, 0, 0, 0);

  const slots: Slot[] = [];
  for (let d = 0; d < days; d++) {
    for (let s = 0; s < perDay; s++) {
      const hour = HOUR_SLOTS[s]!;
      const startsAt = new Date(baseDate);
      startsAt.setUTCDate(startsAt.getUTCDate() + d);
      startsAt.setUTCHours(hour, 0, 0, 0);
      const endsAt = new Date(startsAt);
      endsAt.setUTCMinutes(endsAt.getUTCMinutes() + opts.durationMin);

      const seed = `${opts.universalistId}|${startsAt.toISOString()}|${FIXED_SEED}`;
      const id = sha256HexSync(seed).slice(0, 32);
      const isPast = startsAt.getTime() < Date.parse(now);

      slots.push(Object.freeze({
        id: slotId(id),
        universalistId: opts.universalistId,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        status: isPast ? 'BLOCKED' : 'AVAILABLE',
        offeringId: opts.offeringId,
      } as Slot));
    }
  }
  return Object.freeze(slots);
}

// ════════════════════════════════════════════════════════════════════════════
// PRICING — BRL cents, HMAC-chained, 15-min TTL quote
// ════════════════════════════════════════════════════════════════════════════

export interface PriceQuoteInput {
  readonly offering: Offering;
  readonly seekerId: UniversalistId;
  readonly now?: string;
}

/** Validates an offering per W65 validatePricing() contract */
export function validatePricing(offering: Offering): Result<true, 'INVALID_OFFERING'> {
  if (!offering.isSellerEligible) return err('INVALID_OFFERING', 'seller not eligible per W65 gate');
  if (offering.priceBRLCents < 1000) return err('INVALID_OFFERING', 'price floor R$ 10,00 not met');
  if (offering.priceBRLCents > 100_000_00) return err('INVALID_OFFERING', 'price ceiling R$ 100.000,00 exceeded');
  if (!SACRED_TRADITIONS.includes(offering.tradition)) return err('INVALID_OFFERING', 'unknown tradition');
  return ok(true);
}

export function priceService(input: PriceQuoteInput): Result<PriceQuote, 'PRICING_FAILED'> {
  const v = validatePricing(input.offering);
  if (!v.ok) return err('PRICING_FAILED', v.message);

  const base = input.offering.priceBRLCents;
  const fee = Math.floor((base * PLATFORM_FEE_BPS) / BPS_DIVISOR);
  const tax = Math.floor(base * 0.06); // 6% Brazilian ISS estimate
  const net = base - fee - tax;
  const total = base;

  const now = input.now ?? new Date().toISOString();
  const validUntil = new Date(Date.parse(now) + PRICE_QUOTE_TTL_MS).toISOString();

  const payload = canonicalJson({
    o: input.offering.id,
    s: input.seekerId,
    b: base,
    f: fee,
    t: tax,
    n: net,
    ts: now,
  });
  const chainHash = hmacSha256Sync('w80c-marketplace-secret', payload);

  return ok(Object.freeze({
    offeringId: input.offering.id,
    baseBRLCents: base,
    platformFeeBRLCents: fee,
    netToSellerBRLCents: net,
    taxBRLCents: tax,
    totalBRLCents: total,
    chainHash,
    validUntil,
  } as PriceQuote));
}

// ════════════════════════════════════════════════════════════════════════════
// BOOKING + PAYMENT — State machine with status transitions
// ════════════════════════════════════════════════════════════════════════════

const VALID_TRANSITIONS = Object.freeze({
  DRAFT: Object.freeze(['AWAITING_CONSENT', 'CANCELLED'] as const) as ReadonlyArray<BookingStatus>,
  AWAITING_CONSENT: Object.freeze(['AWAITING_PAYMENT', 'CANCELLED'] as const) as ReadonlyArray<BookingStatus>,
  AWAITING_PAYMENT: Object.freeze(['ESCROW_HELD', 'CANCELLED', 'FAILED'] as const) as ReadonlyArray<BookingStatus>,
  ESCROW_HELD: Object.freeze(['CONFIRMED', 'REFUNDED'] as const) as ReadonlyArray<BookingStatus>,
  CONFIRMED: Object.freeze(['COMPLETED', 'CANCELLED', 'REFUNDED'] as const) as ReadonlyArray<BookingStatus>,
  COMPLETED: Object.freeze(['RELEASED'] as const) as ReadonlyArray<BookingStatus>,
  RELEASED: Object.freeze([] as const) as ReadonlyArray<BookingStatus>,
  REFUNDED: Object.freeze([] as const) as ReadonlyArray<BookingStatus>,
  CANCELLED: Object.freeze([] as const) as ReadonlyArray<BookingStatus>,
  FAILED: Object.freeze(['CANCELLED'] as const) as ReadonlyArray<BookingStatus>,
});

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export interface BookingDraftInput {
  readonly offering: Offering;
  readonly slot: Slot;
  readonly seekerId: UniversalistId;
  readonly now?: string;
}

export function createBookingDraft(input: BookingDraftInput): Result<Booking, 'INVALID_SLOT' | 'OFFERING_MISMATCH'> {
  if (input.slot.status !== 'AVAILABLE') return err('INVALID_SLOT', `slot is ${input.slot.status}`);
  if (input.slot.offeringId !== input.offering.id) return err('OFFERING_MISMATCH', 'slot offeringId mismatch');

  const quote = priceService({ offering: input.offering, seekerId: input.seekerId, now: input.now });
  if (!quote.ok) return err('INVALID_SLOT', quote.message);

  const now = input.now ?? new Date().toISOString();
  const id = bookingId(sha256HexSync(`bk|${input.offering.id}|${input.slot.id}|${input.seekerId}|${now}`).slice(0, 24));

  return ok(Object.freeze({
    id,
    offeringId: input.offering.id,
    slotId: input.slot.id,
    universalistId: input.offering.universalistId,
    seekerId: input.seekerId,
    status: 'DRAFT',
    priceQuote: quote.value,
    paymentIntent: null,
    consentToken: null,
    createdAt: now,
    updatedAt: now,
  } as Booking));
}

export function attachConsent(b: Booking, consent: ConsentRecord, now?: string): Result<Booking, 'CONSENT_EXPIRED' | 'INVALID_SCOPE' | 'ILLEGAL_TRANSITION'> {
  const ts = now ?? new Date().toISOString();
  if (Date.parse(ts) > Date.parse(consent.expiresAt)) return err('CONSENT_EXPIRED', 'LGPD consent expired');
  if (!consent.scopes.includes('pii_capture') || !consent.scopes.includes('payment_processing')) {
    return err('INVALID_SCOPE', 'pii_capture + payment_processing required');
  }
  if (!canTransition(b.status, 'AWAITING_CONSENT')) return err('ILLEGAL_TRANSITION', `${b.status} → AWAITING_CONSENT`);

  return ok(Object.freeze({
    ...b,
    status: 'AWAITING_CONSENT' as BookingStatus,
    consentToken: consent.token,
    updatedAt: ts,
  } as Booking));
}

export function transitionToPayment(b: Booking, now?: string): Result<Booking, 'CONSENT_MISSING' | 'ILLEGAL_TRANSITION'> {
  if (!b.consentToken) return err('CONSENT_MISSING', 'LGPD consent required before payment');
  if (!canTransition(b.status, 'AWAITING_PAYMENT')) return err('ILLEGAL_TRANSITION', `${b.status} → AWAITING_PAYMENT`);

  const ts = now ?? new Date().toISOString();
  const id = paymentIntentId(sha256HexSync(`pi|${b.id}|${b.priceQuote.totalBRLCents}|${ts}`).slice(0, 24));
  const esc = escrowId(sha256HexSync(`esc|${b.id}|${id}|${ts}`).slice(0, 24));
  const expiresAt = new Date(Date.parse(ts) + PAYMENT_INTENT_TTL_MS).toISOString();

  const pi: PaymentIntentShape = Object.freeze({
    id,
    bookingId: b.id,
    amountBRLCents: b.priceQuote.totalBRLCents,
    currency: 'BRL',
    provider: 'pix',
    escrowId: esc,
    status: 'PENDING',
    clientSecret: sha256HexSync(`cs|${id}|${ts}`).slice(0, 40),
    expiresAt,
  } as PaymentIntentShape);

  return ok(Object.freeze({
    ...b,
    status: 'AWAITING_PAYMENT' as BookingStatus,
    paymentIntent: pi,
    updatedAt: ts,
  } as Booking));
}

export function markPaymentSucceeded(b: Booking, now?: string): Result<Booking, 'NO_PAYMENT_INTENT' | 'ILLEGAL_TRANSITION'> {
  if (!b.paymentIntent) return err('NO_PAYMENT_INTENT', 'no payment intent attached');
  if (!canTransition(b.status, 'ESCROW_HELD')) return err('ILLEGAL_TRANSITION', `${b.status} → ESCROW_HELD`);

  const ts = now ?? new Date().toISOString();
  const updatedPi: PaymentIntentShape = Object.freeze({
    ...b.paymentIntent,
    status: 'SUCCEEDED' as PaymentStatus,
  });
  return ok(Object.freeze({
    ...b,
    status: 'ESCROW_HELD' as BookingStatus,
    paymentIntent: updatedPi,
    updatedAt: ts,
  } as Booking));
}

export function markConfirmed(b: Booking, now?: string): Result<Booking, 'ILLEGAL_TRANSITION'> {
  if (!canTransition(b.status, 'CONFIRMED')) return err('ILLEGAL_TRANSITION', `${b.status} → CONFIRMED`);
  const ts = now ?? new Date().toISOString();
  return ok(Object.freeze({ ...b, status: 'CONFIRMED' as BookingStatus, updatedAt: ts } as Booking));
}

export function cancelBooking(b: Booking, now?: string): Result<Booking, 'ILLEGAL_TRANSITION'> {
  if (!canTransition(b.status, 'CANCELLED')) return err('ILLEGAL_TRANSITION', `${b.status} → CANCELLED`);
  const ts = now ?? new Date().toISOString();
  return ok(Object.freeze({ ...b, status: 'CANCELLED' as BookingStatus, updatedAt: ts } as Booking));
}

// ════════════════════════════════════════════════════════════════════════════
// AUDIT LEDGER — Append-only HMAC chain (cycle 60 lesson)
// ════════════════════════════════════════════════════════════════════════════

export interface AuditEntry {
  readonly bookingId: BookingId;
  readonly fromStatus: BookingStatus;
  readonly toStatus: BookingStatus;
  readonly at: string;
  readonly prevHash: string;
  readonly hash: string;
}

const AUDIT_LOG: AuditEntry[] = [];
let LAST_HASH = '0'.repeat(64);

export function appendAudit(b: Booking, from: BookingStatus, to: BookingStatus, now?: string): AuditEntry {
  const ts = now ?? new Date().toISOString();
  const payload = canonicalJson({
    b: b.id,
    f: from,
    t: to,
    at: ts,
    p: LAST_HASH,
  });
  const h = hmacSha256Sync('w80c-marketplace-audit', payload);
  const entry: AuditEntry = Object.freeze({
    bookingId: b.id,
    fromStatus: from,
    toStatus: to,
    at: ts,
    prevHash: LAST_HASH,
    hash: h,
  });
  AUDIT_LOG.push(entry);
  LAST_HASH = h;
  return entry;
}

export function exportAuditLedger(): ReadonlyArray<AuditEntry> {
  return Object.freeze([...AUDIT_LOG]);
}

export function resetAuditLedgerForTests(): void {
  AUDIT_LOG.length = 0;
  LAST_HASH = '0'.repeat(64);
}
