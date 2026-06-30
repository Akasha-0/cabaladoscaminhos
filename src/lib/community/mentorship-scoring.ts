// ============================================================================
// MENTORSHIP SCORING — Compatibility calculation (Wave 68, 2026-06-30)
// ============================================================================
// Pure-logic scoring engine (no DB, no React) — calcular compatibilidade
// mentor↔mentee via 5 fatores ponderados (tradição, língua, fuso horário,
// experiência, interesse). Usado pelo matching engine e pelo suggestPairings.
//
// Design decisions:
//   - All factors normalized to [0,1] (deterministic, comparable)
//   - Default weights sum to 1.00 (callers may override via MatchingCriteria)
//   - Jaccard similarity for set-based factors (tradition/language/interest)
//   - Inverse linear distance for timezone (|Δtz| capped at 12h)
//   - Experience gap uses bell curve (penalize too-close AND too-far)
//   - All boundary detection uses lookaround regex (cycle 60/65/67 lesson)
// ============================================================================

// ============================================================================
// TYPES — Public scoring types
// ============================================================================

/**
 * Profile fields needed by the scoring engine.
 * Source-agnostic — can be derived from Prisma, DTO, or hand-built in tests.
 */
export interface ScorableProfile {
  readonly userId: string;
  readonly traditions: readonly string[]; // ['Cigano', 'Orixás', ...]
  readonly languages: readonly string[]; // ['pt-BR', 'en-US', ...]
  readonly timezoneOffset: number; // -12..+14 (UTC offset hours)
  readonly yearsExperience: number; // 0..99
  readonly interests: readonly string[]; // ['Mesa Real', 'Tarot', ...]
  readonly displayName?: string | null;
}

/**
 * The 5 factor scores, each in [0,1].
 * Naming mirrors the candidate fields for clarity.
 */
export interface CompatibilityFactors {
  readonly tradition: number; // Jaccard on traditions
  readonly language: number; // Jaccard on languages
  readonly timezone: number; // 1 - |Δtz|/12, clamped [0,1]
  readonly experience: number; // Bell curve over |Δexp| in years
  readonly interest: number; // Jaccard on interests
}

/**
 * Weighted, total score with both raw factors and effective weights used.
 * Useful for ranking AND for explaining WHY a match scored what it scored.
 */
export interface CompatibilityScore {
  readonly total: number; // 0..1
  readonly factors: CompatibilityFactors;
  readonly weights: CompatibilityWeights;
}

/**
 * Weights assigned to each factor. Must sum to ~1.00.
 * Callers may override via MatchingCriteria.weights.
 */
export interface CompatibilityWeights {
  readonly tradition: number;
  readonly language: number;
  readonly timezone: number;
  readonly experience: number;
  readonly interest: number;
}

/**
 * Default weights tuned for Cabala dos Caminhos audience:
 *   - Tradição é o fator mais importante (linguagem comum)
 *   - Língua é quase tão importante (comunicação direta)
 *   - Interesse complementa tradição (mesma tradição, foco diferente)
 *   - Fuso horário é pragmático (horários sobrepostos)
 *   - Experiência gap evita tutoria "mortas" (muito próximo) e inacessíveis
 */
export const DEFAULT_WEIGHTS: CompatibilityWeights = Object.freeze({
  tradition: 0.30,
  language: 0.20,
  timezone: 0.15,
  experience: 0.15,
  interest: 0.2,
});

// ============================================================================
// CONSTANTS — Magic numbers extracted
// ============================================================================

/** Maximum absolute timezone difference (hours). |Δtz| > 12 = no overlap. */
const MAX_TIMEZONE_GAP = 12;

/** Bell curve peak: experience gap of 3 years gives full score. */
const EXPERIENCE_PEAK_GAP = 3;

/** Bell curve width: |Δexp| > 10 years ≈ no mentor/mentee dynamic. */
const EXPERIENCE_MAX_GAP = 10;

/** Minimum experience for a mentor to be "useful" (sanity floor). */
const MIN_MENTOR_EXPERIENCE = 0;

/** Minimum set size below which Jaccard short-circuits to a safe value. */
const MIN_JACCARD_SET_SIZE = 1;

// ============================================================================
// ERRORS — Typed error classes
// ============================================================================

export class InvalidProfileError extends Error {
  readonly field: string;
  constructor(field: string, reason: string) {
    super(`Invalid profile field '${field}': ${reason}`);
    this.name = "InvalidProfileError";
    this.field = field;
  }
}

export class InvalidWeightsError extends Error {
  constructor(reason: string) {
    super(`Invalid weights: ${reason}`);
    this.name = "InvalidWeightsError";
  }
}

// ============================================================================
// TYPE GUARDS — Defensive validation
// ============================================================================

export function isScorableProfile(value: unknown): value is ScorableProfile {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.userId !== "string" || v.userId.length === 0) return false;
  if (!Array.isArray(v.traditions)) return false;
  if (!Array.isArray(v.languages)) return false;
  if (typeof v.timezoneOffset !== "number" || !Number.isFinite(v.timezoneOffset))
    return false;
  if (typeof v.yearsExperience !== "number" || !Number.isFinite(v.yearsExperience))
    return false;
  if (!Array.isArray(v.interests)) return false;
  return true;
}

export function isCompatibilityFactors(value: unknown): value is CompatibilityFactors {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const keys: (keyof CompatibilityFactors)[] = [
    "tradition",
    "language",
    "timezone",
    "experience",
    "interest",
  ];
  return keys.every(
    (k) => typeof v[k] === "number" && Number.isFinite(v[k] as number),
  );
}

// ============================================================================
// FACTOR SCORERS — Individual [0,1] calculators
// ============================================================================

/**
 * Jaccard similarity: |A ∩ B| / |A ∪ B|.
 * Returns 0 for two empty sets (intentional — no overlap means no score).
 * Returns a safe value if either set is empty (no signal, not a penalty).
 */
export function scoreJaccard(a: readonly string[], b: readonly string[]): number {
  if (a.length === 0 || b.length === 0) {
    // Either side has no signal — neutral 0.5 (not 0, not 1)
    return 0.5;
  }
  const setA = new Set(a.map((s) => s.toLowerCase().trim()).filter(Boolean));
  const setB = new Set(b.map((s) => s.toLowerCase().trim()).filter(Boolean));
  if (setA.size < MIN_JACCARD_SET_SIZE || setB.size < MIN_JACCARD_SET_SIZE) {
    return 0.5;
  }
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0.5 : intersection / union;
}

/**
 * Tradition overlap. Same as Jaccard but stricter on case normalization.
 * Returns 1 if the EXACT same single tradition is shared.
 */
export function scoreTraditionMatch(
  mentor: ScorableProfile,
  mentee: ScorableProfile,
): number {
  return scoreJaccard(mentor.traditions, mentee.traditions);
}

/**
 * Language overlap. Multi-lingual mentors score higher with multilingual mentees.
 */
export function scoreLanguageMatch(
  mentor: ScorableProfile,
  mentee: ScorableProfile,
): number {
  return scoreJaccard(mentor.languages, mentee.languages);
}

/**
 * Timezone overlap. |Δtz| in hours → inverse linear score.
 *   - Δtz = 0 → score 1
 *   - |Δtz| >= 12 → score 0
 *   - otherwise → 1 - |Δtz| / 12
 */
export function scoreTimezoneMatch(
  mentor: ScorableProfile,
  mentee: ScorableProfile,
): number {
  const gap = Math.abs(mentor.timezoneOffset - mentee.timezoneOffset);
  if (gap >= MAX_TIMEZONE_GAP) return 0;
  if (gap <= 0) return 1;
  return 1 - gap / MAX_TIMEZONE_GAP;
}

/**
 * Experience gap — bell curve.
 *   - Ideal gap: 3 years (mentor has 3 more years of practice)
 *   - Gap of 0 (peers): score 0.5 (still useful but less mentoring dynamic)
 *   - Gap > 10: score approaches 0 (mentor too senior or too junior)
 *   - Negative gap (mentee MORE experienced): score 0.3 (unusual pairing)
 *
 * Formula: triangular bell:
 *   gap = mentor.yearsExperience - mentee.yearsExperience
 *   if gap < 0: 0.3 (uncommon but valid)
 *   elif gap >= 10: 0 (too far apart)
 *   elif gap == 3: 1 (ideal)
 *   elif gap < 3: 0.5 + 0.5 * (gap / 3) (rising)
 *   else: 1 - ((gap - 3) / 7) (falling toward 0)
 */
export function scoreExperienceGap(
  mentor: ScorableProfile,
  mentee: ScorableProfile,
): number {
  const mentorExp = Math.max(MIN_MENTOR_EXPERIENCE, mentor.yearsExperience);
  const menteeExp = Math.max(0, mentee.yearsExperience);
  const gap = mentorExp - menteeExp;

  if (gap < 0) {
    // Mentee more experienced than mentor — unusual pairing, score 0.3
    return 0.3;
  }
  if (gap >= EXPERIENCE_MAX_GAP) return 0;
  if (gap === EXPERIENCE_PEAK_GAP) return 1;

  if (gap < EXPERIENCE_PEAK_GAP) {
    // Rising side: 0..3 → 0.5..1
    return 0.5 + 0.5 * (gap / EXPERIENCE_PEAK_GAP);
  }
  // Falling side: 3..10 → 1..0
  const t = (gap - EXPERIENCE_PEAK_GAP) / (EXPERIENCE_MAX_GAP - EXPERIENCE_PEAK_GAP);
  return Math.max(0, 1 - t);
}

/**
 * Interest overlap (e.g., Mesa Real, Runas, Tarot, etc).
 * Same algorithm as tradition, but called separately for transparency.
 */
export function scoreInterestMatch(
  mentor: ScorableProfile,
  mentee: ScorableProfile,
): number {
  return scoreJaccard(mentor.interests, mentee.interests);
}

// ============================================================================
// AGGREGATE — Weighted total
// ============================================================================

/**
 * Validate that weights sum to ~1.00 (within tolerance).
 * Throws InvalidWeightsError if not.
 */
export function validateWeights(weights: CompatibilityWeights): void {
  const sum =
    weights.tradition +
    weights.language +
    weights.timezone +
    weights.experience +
    weights.interest;
  const tolerance = 0.001;
  if (Math.abs(sum - 1) > tolerance) {
    throw new InvalidWeightsError(
      `weights must sum to 1.00 (got ${sum.toFixed(4)})`,
    );
  }
  for (const [k, v] of Object.entries(weights)) {
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1) {
      throw new InvalidWeightsError(
        `weight '${k}' must be a finite number in [0,1] (got ${v})`,
      );
    }
  }
}

/**
 * Calculate weighted composite compatibility score for a mentor/mentee pair.
 * - Validates inputs (throws on invalid profile)
 * - Defaults to DEFAULT_WEIGHTS if none provided
 * - Returns total + per-factor breakdown for ranking and explanation
 */
export function calculateCompatibility(
  mentor: ScorableProfile,
  mentee: ScorableProfile,
  weights: CompatibilityWeights = DEFAULT_WEIGHTS,
): CompatibilityScore {
  if (!isScorableProfile(mentor)) {
    throw new InvalidProfileError("mentor", "not a ScorableProfile");
  }
  if (!isScorableProfile(mentee)) {
    throw new InvalidProfileError("mentee", "not a ScorableProfile");
  }
  if (mentor.userId === mentee.userId) {
    throw new InvalidProfileError(
      "mentor/mentee",
      "cannot pair a user with themselves",
    );
  }
  validateWeights(weights);

  const factors: CompatibilityFactors = {
    tradition: scoreTraditionMatch(mentor, mentee),
    language: scoreLanguageMatch(mentor, mentee),
    timezone: scoreTimezoneMatch(mentor, mentee),
    experience: scoreExperienceGap(mentor, mentee),
    interest: scoreInterestMatch(mentor, mentee),
  };

  const total =
    factors.tradition * weights.tradition +
    factors.language * weights.language +
    factors.timezone * weights.timezone +
    factors.experience * weights.experience +
    factors.interest * weights.interest;

  return {
    total: clamp01(total),
    factors,
    weights,
  };
}

// ============================================================================
// HELPERS — Pure utilities
// ============================================================================

/** Clamp a number to [0,1]. NaN-safe (NaN → 0). */
export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Format a CompatibilityScore for human-readable explanation.
 * Example: "tradição 100% × 0.30 + língua 67% × 0.20 + ..."
 */
export function explainScore(score: CompatibilityScore): string {
  const parts: string[] = [];
  const f = score.factors;
  const w = score.weights;
  parts.push(
    `tradição ${(f.tradition * 100).toFixed(0)}% × ${w.tradition.toFixed(2)}`,
  );
  parts.push(`língua ${(f.language * 100).toFixed(0)}% × ${w.language.toFixed(2)}`);
  parts.push(
    `fuso ${(f.timezone * 100).toFixed(0)}% × ${w.timezone.toFixed(2)}`,
  );
  parts.push(
    `experiência ${(f.experience * 100).toFixed(0)}% × ${w.experience.toFixed(2)}`,
  );
  parts.push(
    `interesse ${(f.interest * 100).toFixed(0)}% × ${w.interest.toFixed(2)}`,
  );
  return parts.join(" + ") + ` = ${(score.total * 100).toFixed(1)}%`;
}

// ============================================================================
// INTERNAL EXPORTS — For testing / advanced callers
// ============================================================================

export const __internal = {
  MAX_TIMEZONE_GAP,
  EXPERIENCE_PEAK_GAP,
  EXPERIENCE_MAX_GAP,
  MIN_MENTOR_EXPERIENCE,
  MIN_JACCARD_SET_SIZE,
};