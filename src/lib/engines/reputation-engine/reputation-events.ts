/**
 * reputation-events.ts — event taxonomy + 7-tradição weight matrix
 *
 * Cycle 79 / W79-D lesson applied:
 * - NFD-normalize + lowercase both sides before lookup, so input like
 *   "Candomblé" / "candomble" / "CANDOMBLÉ" all match the canonical key.
 *
 * Weight matrix rationale (curated, not algorithmically derived):
 * - candomblé / umbanda / ifá: ritual_share and study_attendance weight higher
 *   (community/cultural transmission is sacred).
 * - cabala: code_contribution + mentorship_offer weight higher (study tradition).
 * - astrologia: helpful_answer + kind_review weight higher (consultive tradition).
 * - tantra: mentorship_offer + ritual_share weight higher (intimacy/holding space).
 * - cigano: feedback_given + ritual_share weight higher (oral/divinatory tradition).
 *
 * Object.freeze on the matrix AND nested per-tradição objects.
 */
import { TRADICOES, type EventType, type Tradicao, type WeightMatrix } from './types.ts';

// ---------------------------------------------------------------------------
// Canonical weight matrix
// ---------------------------------------------------------------------------

const RAW_MATRIX: Readonly<Record<Tradicao, Readonly<Record<EventType, number>>>> = Object.freeze({
  candomble: Object.freeze({
    helpful_answer: 1.0,
    code_contribution: 0.8,
    kind_review: 1.1,
    ritual_share: 1.6,
    mentorship_offer: 1.3,
    study_attendance: 1.5,
    feedback_given: 1.0,
  }),
  umbanda: Object.freeze({
    helpful_answer: 1.0,
    code_contribution: 0.8,
    kind_review: 1.1,
    ritual_share: 1.6,
    mentorship_offer: 1.3,
    study_attendance: 1.5,
    feedback_given: 1.0,
  }),
  ifa: Object.freeze({
    helpful_answer: 1.1,
    code_contribution: 0.9,
    kind_review: 1.1,
    ritual_share: 1.7,
    mentorship_offer: 1.4,
    study_attendance: 1.6,
    feedback_given: 1.0,
  }),
  cabala: Object.freeze({
    helpful_answer: 1.2,
    code_contribution: 1.6,
    kind_review: 1.0,
    ritual_share: 0.9,
    mentorship_offer: 1.5,
    study_attendance: 1.3,
    feedback_given: 1.0,
  }),
  astrologia: Object.freeze({
    helpful_answer: 1.4,
    code_contribution: 0.9,
    kind_review: 1.3,
    ritual_share: 0.8,
    mentorship_offer: 1.2,
    study_attendance: 1.1,
    feedback_given: 1.0,
  }),
  tantra: Object.freeze({
    helpful_answer: 1.1,
    code_contribution: 0.7,
    kind_review: 1.2,
    ritual_share: 1.5,
    mentorship_offer: 1.6,
    study_attendance: 1.2,
    feedback_given: 1.1,
  }),
  cigano: Object.freeze({
    helpful_answer: 1.1,
    code_contribution: 0.7,
    kind_review: 1.1,
    ritual_share: 1.4,
    mentorship_offer: 1.2,
    study_attendance: 1.2,
    feedback_given: 1.4,
  }),
});

export const TRADICAO_WEIGHTS: WeightMatrix = RAW_MATRIX;

// ---------------------------------------------------------------------------
// Tradição normalization (NFD + lowercase) — cycle 79 lesson
// ---------------------------------------------------------------------------

/**
 * Normalize a user-supplied tradição string to its canonical key.
 *
 * "Candomblé"  -> "candomble"
 * "Umbanda"    -> "umbanda"
 * "IFÁ"        -> "ifa"
 * "Cigano"     -> "cigano"
 * "cANDOMBLÉ"  -> "candomble"
 */
export function normalizeTradicao(raw: string): Tradicao {
  if (typeof raw !== 'string') {
    throw new Error(`Tradição must be a string, got ${typeof raw}`);
  }
  const stripped = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  for (const t of TRADICOES) {
    if (t === stripped) return t;
  }
  throw new Error(
    `Tradição inválida: "${raw}" (normalized: "${stripped}"). ` +
      `Esperado um de: ${TRADICOES.join(', ')}`,
  );
}

// ---------------------------------------------------------------------------
// Event weight resolution
// ---------------------------------------------------------------------------

export interface WeightedDelta {
  readonly tradicao: Tradicao;
  readonly eventType: EventType;
  readonly baseDelta: number;
  readonly multiplier: number;
  readonly weightedDelta: number;
}

/**
 * Resolve the multiplier for a (tradição, eventType) pair.
 *
 * Always returns a finite number. Throws on unknown eventType.
 */
export function resolveMultiplier(
  tradicaoRaw: string,
  eventType: EventType,
): { readonly tradicao: Tradicao; readonly multiplier: number } {
  const tradicao = normalizeTradicao(tradicaoRaw);
  const perTrad = RAW_MATRIX[tradicao];
  const mult = perTrad[eventType];
  if (typeof mult !== 'number' || !Number.isFinite(mult)) {
    throw new Error(
      `No weight for eventType="${eventType}" under tradição="${tradicao}"`,
    );
  }
  return Object.freeze({ tradicao, multiplier: mult });
}

/**
 * Compute weighted delta for an event given a tradição string.
 *
 * Returns a frozen struct: tradicao, eventType, baseDelta, multiplier, weightedDelta.
 */
export function weightedDeltaFor(
  eventType: EventType,
  baseDelta: number,
  tradicaoRaw: string,
): WeightedDelta {
  if (!Number.isFinite(baseDelta)) {
    throw new Error(`baseDelta must be finite, got ${baseDelta}`);
  }
  const { tradicao, multiplier } = resolveMultiplier(tradicaoRaw, eventType);
  return Object.freeze({
    tradicao,
    eventType,
    baseDelta,
    multiplier,
    weightedDelta: Math.round(baseDelta * multiplier * 100) / 100,
  });
}

// ---------------------------------------------------------------------------
// Catalog helpers
// ---------------------------------------------------------------------------

/**
 * All event types grouped by tradição showing max-weight event.
 * Used by UI/curation layers; pure read-only.
 */
export function highestWeightEventFor(tradicaoRaw: string): {
  readonly tradicao: Tradicao;
  readonly eventType: EventType;
  readonly multiplier: number;
} {
  const { tradicao } = resolveMultiplier(tradicaoRaw, 'helpful_answer');
  const perTrad = RAW_MATRIX[tradicao];
  let bestType: EventType = 'helpful_answer';
  let bestMult = perTrad[bestType];
  for (const evt of Object.keys(perTrad) as EventType[]) {
    const m = perTrad[evt];
    if (m > bestMult) {
      bestMult = m;
      bestType = evt;
    }
  }
  return Object.freeze({ tradicao, eventType: bestType, multiplier: bestMult });
}