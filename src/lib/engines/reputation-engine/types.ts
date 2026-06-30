/**
 * reputation-engine — types
 *
 * Branded primitives + DTOs.
 *
 * Cycle 82 lessons applied:
 * - Brand<TBase, TBrand> for type-safe IDs / hashes
 * - All exports frozen at construction site
 * - Readonly DTOs (no mutation after append)
 */

// ---------------------------------------------------------------------------
// Brand helper
// ---------------------------------------------------------------------------

declare const __brand: unique symbol;
export type Brand<TBase, TBrand extends string> = TBase & {
  readonly [__brand]: TBrand;
};

// ---------------------------------------------------------------------------
// Branded primitives
// ---------------------------------------------------------------------------

/** 7-tradição key. Lowercase, no accents (candomble, umbanda, ifa, cabala, astrologia, tantra, cigano). */
export type TradicaoKey = Brand<string, 'TradicaoKey'>;

/** User id (UUID-like). */
export type UsuarioId = Brand<string, 'UsuarioId'>;

/** Stable per-entry id (counter-based or uuid). */
export type LedgerEntryId = Brand<string, 'LedgerEntryId'>;

/** 64-char lowercase hex SHA-256 digest. */
export type ReputationHash = Brand<string, 'ReputationHash'>;

// ---------------------------------------------------------------------------
// Tradicao enum (canonical 7 — kept in sync with cabaladoscaminhos taxonomy)
// ---------------------------------------------------------------------------

export const TRADICOES = [
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
  'cigano',
] as const;
export type Tradicao = (typeof TRADICOES)[number];

export const TRADICAO_LABELS: Readonly<Record<Tradicao, string>> = Object.freeze({
  candomble: 'Candomblé',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
  cigano: 'Cigano',
});

// ---------------------------------------------------------------------------
// Event taxonomy
// ---------------------------------------------------------------------------

export const EVENT_TYPES = [
  'helpful_answer',
  'code_contribution',
  'kind_review',
  'ritual_share',
  'mentorship_offer',
  'study_attendance',
  'feedback_given',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

/** Per-event payload (tradition-agnostic; weight map decides multiplier). */
export interface ReputationEvent {
  readonly id: LedgerEntryId;
  readonly usuarioId: UsuarioId;
  readonly eventType: EventType;
  /** Base reputation delta before tradição multiplier. */
  readonly baseDelta: number;
  /** Tradição under which the event happened (normalized). */
  readonly tradicao: Tradicao;
  /** ISO-8601 timestamp. */
  readonly occurredAt: string;
  /** Free-form note (sanitized at boundary). */
  readonly note: string;
}

/** 7-tradição × 7-event weight matrix (multipliers applied on top of baseDelta). */
export type WeightMatrix = Readonly<Record<Tradicao, Readonly<Record<EventType, number>>>>;

// ---------------------------------------------------------------------------
// Ledger entries (immutable after append)
// ---------------------------------------------------------------------------

export interface LedgerEntry {
  readonly id: LedgerEntryId;
  readonly usuarioId: UsuarioId;
  readonly eventType: EventType;
  readonly baseDelta: number;
  readonly tradicao: Tradicao;
  readonly occurredAt: string;
  readonly note: string;
  /** Hash of previous entry (or 64 zeros for genesis). */
  readonly prevHash: ReputationHash;
  /** Hash of THIS entry: SHA-256(prevHash || canonical(entry payload)). */
  readonly hash: ReputationHash;
  /** Number assigned at append time (1-based; genesis is #1). */
  readonly seq: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const ZERO_HASH: ReputationHash = '0'.repeat(64) as ReputationHash;

const ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;
const USUARIO_RE = /^[a-zA-Z0-9_:-]{1,128}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

export function asLedgerEntryId(raw: string): LedgerEntryId {
  if (!ID_RE.test(raw)) {
    throw new Error(`Invalid LedgerEntryId: ${raw}`);
  }
  return raw as LedgerEntryId;
}

export function asUsuarioId(raw: string): UsuarioId {
  if (!USUARIO_RE.test(raw)) {
    throw new Error(`Invalid UsuarioId: ${raw}`);
  }
  return raw as UsuarioId;
}

export function asTradicaoKey(raw: string): TradicaoKey {
  return raw as TradicaoKey;
}

export function asReputationHash(raw: string): ReputationHash {
  if (!/^[0-9a-f]{64}$/.test(raw)) {
    throw new Error(`Invalid ReputationHash (must be 64-char hex): ${raw}`);
  }
  return raw as ReputationHash;
}

export function isValidIso8601(s: string): boolean {
  return ISO_RE.test(s);
}