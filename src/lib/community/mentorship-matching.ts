// ============================================================================
// MENTORSHIP MATCHING — Best-match finding with criteria (Wave 68, 2026-06-30)
// ============================================================================
// Pure-logic matching engine (no DB, no React) — dado um conjunto de
// candidatos a mentor, ranquear e filtrar por critérios do mentee.
//
// Composes:
//   - mentorship-scoring.ts (calculateCompatibility)
//   - mentorship-availability.ts (TimeSlot intersection)
//
// Design decisions:
//   - Deterministic ordering (total desc → userId asc for tie-break)
//   - Pre-filter is HARD (excludes candidates) — better than soft penalty
//   - Post-filter is SOFT (penalizes but keeps) — preserves "best effort"
//   - findBestMatches is pure (input → output, no side effects)
// ============================================================================

import {
  calculateCompatibility,
  DEFAULT_WEIGHTS,
  isScorableProfile,
} from "./mentorship-scoring.ts";

import type {
  CompatibilityWeights,
  ScorableProfile,
} from "./mentorship-scoring.ts";

// ============================================================================
// TYPES — Public matching types
// ============================================================================

/**
 * Criteria for hard/soft filtering. All fields optional.
 * Hard filters EXCLUDE candidates; soft filters PENALIZE but keep.
 */
export interface MatchingCriteria {
  /** Required traditions (any-of). Hard filter if set. */
  readonly traditions?: readonly string[];
  /** Required languages (any-of). Hard filter if set. */
  readonly languages?: readonly string[];
  /** Allowed timezone offset ranges (any-of). Hard filter if set. */
  readonly timezones?: readonly { readonly min?: number; readonly max?: number }[];
  /** Allowed experience range [min, max] in years. Hard filter if set. */
  readonly experienceRange?: { readonly min?: number; readonly max?: number };
  /** Required interests (any-of). Hard filter if set. */
  readonly interests?: readonly string[];
  /** Custom weights. Defaults to DEFAULT_WEIGHTS. */
  readonly weights?: CompatibilityWeights;
  /** Required availability slot (ISO datetime + duration). Hard filter if set. */
  readonly timeSlot?: { readonly start: string; readonly durationMinutes: number };
  /** Minimum total score to include (soft). Default 0. */
  readonly minScore?: number;
  /** Required mentor ID (e.g., re-requesting a specific mentor). */
  readonly requireMentorId?: string;
  /** Excluded mentor IDs (e.g., previous mentee-mentor pairs). */
  readonly excludeMentorIds?: readonly string[];
}

/**
 * A candidate mentor enriched with score, factor breakdown, and availability.
 * The output unit of findBestMatches.
 */
export interface MatchCandidate {
  readonly mentor: ScorableProfile;
  readonly score: number; // 0..1
  readonly factors: {
    readonly tradition: number;
    readonly language: number;
    readonly timezone: number;
    readonly experience: number;
    readonly interest: number;
  };
  readonly availableSlots: readonly { readonly start: string; readonly end: string }[];
  /** Why this candidate was excluded (only set on filtered-out candidates). */
  readonly excludedReason?: string;
}

/**
 * A free time slot a mentor is available in ISO datetime format.
 * Re-exported here for convenience; primary definition in availability module.
 */
export interface AvailableSlot {
  readonly start: string; // ISO datetime
  readonly end: string; // ISO datetime
}

// ============================================================================
// ERRORS — Typed error classes
// ============================================================================

export class InvalidCriteriaError extends Error {
  constructor(reason: string) {
    super(`Invalid matching criteria: ${reason}`);
    this.name = "InvalidCriteriaError";
  }
}

export class EmptyCandidatesError extends Error {
  constructor() {
    super("Cannot match against an empty candidate list");
    this.name = "EmptyCandidatesError";
  }
}

// ============================================================================
// HARD FILTERING — Excludes candidates before scoring
// ============================================================================

/**
 * Apply hard filters (exclusionary). Returns the subset of candidates that
 * pass every active filter. Excluded candidates are returned separately for
 * transparency.
 */
export function applyHardFilters(
  candidates: readonly ScorableProfile[],
  criteria: MatchingCriteria,
  availabilityByMentor?: ReadonlyMap<string, readonly AvailableSlot[]>,
): { readonly kept: ScorableProfile[]; readonly excluded: MatchCandidate[] } {
  const kept: ScorableProfile[] = [];
  const excluded: MatchCandidate[] = [];

  for (const candidate of candidates) {
    if (!isScorableProfile(candidate)) continue;

    const reason = evaluateHardExclusion(candidate, criteria, availabilityByMentor);
    if (reason) {
      excluded.push({
        mentor: candidate,
        score: 0,
        factors: { tradition: 0, language: 0, timezone: 0, experience: 0, interest: 0 },
        availableSlots: availabilityByMentor?.get(candidate.userId) ?? [],
        excludedReason: reason,
      });
    } else {
      kept.push(candidate);
    }
  }

  return { kept, excluded };
}

function evaluateHardExclusion(
  candidate: ScorableProfile,
  criteria: MatchingCriteria,
  availabilityByMentor?: ReadonlyMap<string, readonly AvailableSlot[]>,
): string | null {
  // Required mentor ID
  if (criteria.requireMentorId && candidate.userId !== criteria.requireMentorId) {
    return `does not match required mentor ID`;
  }

  // Excluded mentor IDs
  if (
    criteria.excludeMentorIds &&
    criteria.excludeMentorIds.includes(candidate.userId)
  ) {
    return `mentor ID is in exclusion list`;
  }

  // Traditions (any-of)
  if (criteria.traditions && criteria.traditions.length > 0) {
    const candidateTraditions = new Set(
      candidate.traditions.map((t) => t.toLowerCase().trim()),
    );
    const hasMatch = criteria.traditions.some((t) =>
      candidateTraditions.has(t.toLowerCase().trim()),
    );
    if (!hasMatch) return `traditions do not include any required tradition`;
  }

  // Languages (any-of)
  if (criteria.languages && criteria.languages.length > 0) {
    const candidateLanguages = new Set(
      candidate.languages.map((l) => l.toLowerCase().trim()),
    );
    const hasMatch = criteria.languages.some((l) =>
      candidateLanguages.has(l.toLowerCase().trim()),
    );
    if (!hasMatch) return `languages do not include any required language`;
  }

  // Timezone range
  if (criteria.timezones && criteria.timezones.length > 0) {
    const inRange = criteria.timezones.some(
      (tz) =>
        (tz.min === undefined || candidate.timezoneOffset >= tz.min) &&
        (tz.max === undefined || candidate.timezoneOffset <= tz.max),
    );
    if (!inRange) return `timezone ${candidate.timezoneOffset} not in any range`;
  }

  // Experience range
  if (criteria.experienceRange) {
    const { min, max } = criteria.experienceRange;
    if (min !== undefined && candidate.yearsExperience < min) {
      return `experience ${candidate.yearsExperience} below minimum ${min}`;
    }
    if (max !== undefined && candidate.yearsExperience > max) {
      return `experience ${candidate.yearsExperience} above maximum ${max}`;
    }
  }

  // Interests (any-of)
  if (criteria.interests && criteria.interests.length > 0) {
    const candidateInterests = new Set(
      candidate.interests.map((i) => i.toLowerCase().trim()),
    );
    const hasMatch = criteria.interests.some((i) =>
      candidateInterests.has(i.toLowerCase().trim()),
    );
    if (!hasMatch) return `interests do not include any required interest`;
  }

  // Time slot availability
  if (criteria.timeSlot && availabilityByMentor) {
    const slots = availabilityByMentor.get(candidate.userId) ?? [];
    const matches = slots.some((s) =>
      slotContains(s, criteria.timeSlot!.start, criteria.timeSlot!.durationMinutes),
    );
    if (!matches) return `not available at requested time slot`;
  }

  return null;
}

function slotContains(
  slot: AvailableSlot,
  requestedStartIso: string,
  durationMinutes: number,
): boolean {
  const reqStart = new Date(requestedStartIso).getTime();
  if (!Number.isFinite(reqStart)) return false;
  const reqEnd = reqStart + durationMinutes * 60_000;
  const slotStart = new Date(slot.start).getTime();
  const slotEnd = new Date(slot.end).getTime();
  return slotStart <= reqStart && slotEnd >= reqEnd;
}

// ============================================================================
// SOFT FILTERING — Penalizes but keeps
// ============================================================================

/**
 * Apply a minimum score filter (soft). Returns the subset of scored
 * candidates whose total >= minScore. Default 0 (keep all).
 */
export function applyMinScore(
  candidates: readonly MatchCandidate[],
  minScore: number,
): MatchCandidate[] {
  if (minScore <= 0) return [...candidates];
  return candidates.filter((c) => c.score >= minScore);
}

// ============================================================================
// RANKING — Sort candidates by score
// ============================================================================

/**
 * Rank candidates by score (descending). Tie-break: userId ascending.
 * Returns a NEW array (does not mutate).
 */
export function rankByScore(
  candidates: readonly MatchCandidate[],
  weights?: CompatibilityWeights,
): MatchCandidate[] {
  void weights; // weights used during scoring, not ranking
  return [...candidates].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return a.mentor.userId.localeCompare(b.mentor.userId);
  });
}

// ============================================================================
// FILTER BY AVAILABILITY — Slot-based filtering
// ============================================================================

/**
 * Filter candidates by availability at a specific time slot.
 * - If availabilityByMentor is empty/undefined, returns all candidates.
 * - Otherwise, only candidates with availability covering the slot are kept.
 */
export function filterByAvailability(
  candidates: readonly ScorableProfile[],
  requestedStartIso: string,
  durationMinutes: number,
  availabilityByMentor: ReadonlyMap<string, readonly AvailableSlot[]>,
): ScorableProfile[] {
  return candidates.filter((c) => {
    const slots = availabilityByMentor.get(c.userId) ?? [];
    if (slots.length === 0) return false;
    return slots.some((s) =>
      slotContains(s, requestedStartIso, durationMinutes),
    );
  });
}

// ============================================================================
// MAIN ENTRY — findBestMatches
// ============================================================================

/**
 * Find the top-N best mentor matches for a mentee.
 * Pipeline:
 *   1. Hard filter (excludes by criteria)
 *   2. Score each kept candidate (calculateCompatibility)
 *   3. Soft filter (minScore)
 *   4. Rank (descending by score, asc by userId)
 *   5. Truncate to limit
 *
 * Returns MatchCandidate[] with per-factor breakdown for explanation.
 * Pure function — no side effects, deterministic ordering.
 */
export function findBestMatches(
  mentee: ScorableProfile,
  candidates: readonly ScorableProfile[],
  criteria: MatchingCriteria = {},
  limit: number = 5,
  availabilityByMentor?: ReadonlyMap<string, readonly AvailableSlot[]>,
): MatchCandidate[] {
  if (!isScorableProfile(mentee)) {
    throw new InvalidCriteriaError("mentee is not a ScorableProfile");
  }
  if (limit <= 0) {
    throw new InvalidCriteriaError("limit must be > 0");
  }
  if (candidates.length === 0) {
    return [];
  }

  const weights = criteria.weights ?? DEFAULT_WEIGHTS;
  const { kept } = applyHardFilters(candidates, criteria, availabilityByMentor);

  const scored: MatchCandidate[] = kept.map((mentor) => {
    const result = calculateCompatibility(mentor, mentee, weights);
    const slots = availabilityByMentor?.get(mentor.userId) ?? [];
    return {
      mentor,
      score: result.total,
      factors: result.factors,
      availableSlots: slots,
    };
  });

  const minScore = criteria.minScore ?? 0;
  const filtered = applyMinScore(scored, minScore);
  const ranked = rankByScore(filtered, weights);
  return ranked.slice(0, limit);
}

// ============================================================================
// HELPERS — Pure utilities
// ============================================================================

/**
 * Build a lookup map of mentor ID → available slots.
 * Convenience for callers that have parallel arrays.
 */
export function indexAvailability(
  availabilities: readonly { readonly mentorId: string; readonly slots: readonly AvailableSlot[] }[],
): ReadonlyMap<string, readonly AvailableSlot[]> {
  const map = new Map<string, readonly AvailableSlot[]>();
  for (const entry of availabilities) {
    map.set(entry.mentorId, entry.slots);
  }
  return map;
}

/**
 * Find candidates that overlap with a specific time window.
 * Returns the list of mentor IDs available for the FULL window.
 */
export function findMentorsForWindow(
  requestedStartIso: string,
  durationMinutes: number,
  availabilityByMentor: ReadonlyMap<string, readonly AvailableSlot[]>,
): string[] {
  const result: string[] = [];
  for (const [mentorId, slots] of availabilityByMentor.entries()) {
    if (slots.some((s) => slotContains(s, requestedStartIso, durationMinutes))) {
      result.push(mentorId);
    }
  }
  return result.sort();
}

/**
 * Explain why a candidate was ranked where it was.
 * Used by UI to show "why this match?" tooltip.
 */
export function explainCandidate(candidate: MatchCandidate): string {
  if (candidate.excludedReason) {
    return `EXCLUDED: ${candidate.excludedReason}`;
  }
  const f = candidate.factors;
  const parts = [
    `tradição ${(f.tradition * 100).toFixed(0)}%`,
    `língua ${(f.language * 100).toFixed(0)}%`,
    `fuso ${(f.timezone * 100).toFixed(0)}%`,
    `experiência ${(f.experience * 100).toFixed(0)}%`,
    `interesse ${(f.interest * 100).toFixed(0)}%`,
  ];
  return `${(candidate.score * 100).toFixed(1)}% total — ${parts.join(", ")}`;
}

// ============================================================================
// INTERNAL EXPORTS — For testing / advanced callers
// ============================================================================

export const __internal = {
  applyHardFilters,
  evaluateHardExclusion,
  slotContains,
};