// ============================================================================
// MENTORSHIP SCORING — Spec (Wave 68, 2026-06-30)
// ============================================================================
// Self-running test harness (no vitest needed at runtime). 30+ assertions.
// ============================================================================

import {
  calculateCompatibility,
  clamp01,
  CompatibilityWeights,
  DEFAULT_WEIGHTS,
  explainScore,
  InvalidProfileError,
  InvalidWeightsError,
  isCompatibilityFactors,
  isScorableProfile,
  scoreExperienceGap,
  scoreInterestMatch,
  scoreJaccard,
  scoreLanguageMatch,
  scoreTimezoneMatch,
  scoreTraditionMatch,
  ScorableProfile,
  validateWeights,
} from "../mentorship-scoring.ts";

// ============================================================================
// TEST HARNESS — Minimal but expressive
// ============================================================================

let _passed = 0;
let _failed = 0;
const _failures: string[] = [];

function expectEqual<T>(actual: T, expected: T, msg: string): void {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    _passed += 1;
  } else {
    _failed += 1;
    _failures.push(
      `${msg}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`,
    );
  }
}

function expectClose(actual: number, expected: number, tol: number, msg: string): void {
  if (Math.abs(actual - expected) <= tol) {
    _passed += 1;
  } else {
    _failed += 1;
    _failures.push(
      `${msg}\n  expected: ${expected} (±${tol})\n  actual:   ${actual}`,
    );
  }
}

function expectThrows(fn: () => unknown, name: string, ctor: new (...args: never[]) => Error): void {
  try {
    fn();
    _failed += 1;
    _failures.push(`${name}: expected throw, did not`);
  } catch (e) {
    if (e instanceof ctor) _passed += 1;
    else {
      _failed += 1;
      _failures.push(`${name}: wrong error type: ${(e as Error).name}`);
    }
  }
}

function expectTrue(cond: boolean, msg: string): void {
  if (cond) _passed += 1;
  else {
    _failed += 1;
    _failures.push(`${msg}: expected true, got false`);
  }
}

// ============================================================================
// FIXTURES — Canonical mentor/mentee profiles
// ============================================================================

const perfectMentor: ScorableProfile = {
  userId: "mentor-perfect",
  traditions: ["Cigano", "Orixás", "Tarot"],
  languages: ["pt-BR", "en-US"],
  timezoneOffset: -3,
  yearsExperience: 8,
  interests: ["Mesa Real", "Tarot"],
  displayName: "Perfect Mentor",
};

const perfectMentee: ScorableProfile = {
  userId: "mentee-perfect",
  traditions: ["Cigano", "Orixás"],
  languages: ["pt-BR"],
  timezoneOffset: -3,
  yearsExperience: 5,
  interests: ["Mesa Real"],
  displayName: "Perfect Mentee",
};

const badMentor: ScorableProfile = {
  userId: "mentor-bad",
  traditions: ["Numerologia"],
  languages: ["de-DE"],
  timezoneOffset: 5,
  yearsExperience: 20,
  interests: ["Astrologia"],
};

// ============================================================================
// SECTION 1 — Jaccard core
// ============================================================================

function testJaccard(): void {
  // 1.1 — Identical sets → 1
  expectClose(scoreJaccard(["A", "B"], ["A", "B"]), 1.0, 0.001, "jaccard identical");
  // 1.2 — Disjoint sets → 0
  expectClose(scoreJaccard(["A"], ["B"]), 0.0, 0.001, "jaccard disjoint");
  // 1.3 — Partial overlap → 0.5 (|A∩B|=1, |A∪B|=2)
  expectClose(scoreJaccard(["A", "B"], ["B", "C"]), 0.5, 0.001, "jaccard partial");
  // 1.4 — Empty A → 0.5 (neutral)
  expectClose(scoreJaccard([], ["A"]), 0.5, 0.001, "jaccard empty A");
  // 1.5 — Empty B → 0.5
  expectClose(scoreJaccard(["A"], []), 0.5, 0.001, "jaccard empty B");
  // 1.6 — Both empty → 0.5
  expectClose(scoreJaccard([], []), 0.5, 0.001, "jaccard both empty");
  // 1.7 — Case insensitive
  expectClose(scoreJaccard(["CIGANO"], ["cigano"]), 1.0, 0.001, "jaccard case");
  // 1.8 — Whitespace trimmed
  expectClose(scoreJaccard([" Cigano "], ["Cigano"]), 1.0, 0.001, "jaccard whitespace");
}

// ============================================================================
// SECTION 2 — Tradition factor
// ============================================================================

function testTraditionFactor(): void {
  // 2.1 — High overlap
  expectClose(scoreTraditionMatch(perfectMentor, perfectMentee), 1.0, 0.001, "tradition full overlap");
  // 2.2 — Partial overlap (mentor has Cigano+Orixás+Tarot, mentee Cigano+Orixás)
  const partial = scoreTraditionMatch(
    { ...perfectMentor, traditions: ["Cigano", "Tarot"] },
    { ...perfectMentee, traditions: ["Cigano", "Orixás"] },
  );
  // |A∩B|=1, |A∪B|=3 → 0.333
  expectClose(partial, 1 / 3, 0.001, "tradition partial overlap");
  // 2.3 — No overlap
  expectClose(scoreTraditionMatch(badMentor, perfectMentee), 0.0, 0.001, "tradition no overlap");
  // 2.4 — Empty traditions → 0.5
  expectClose(
    scoreTraditionMatch({ ...perfectMentor, traditions: [] }, perfectMentee),
    0.5,
    0.001,
    "tradition empty",
  );
}

// ============================================================================
// SECTION 3 — Language factor
// ============================================================================

function testLanguageFactor(): void {
  // 3.1 — Full overlap
  expectClose(scoreLanguageMatch(perfectMentor, perfectMentee), 1.0, 0.001, "language full");
  // 3.2 — No overlap
  expectClose(
    scoreLanguageMatch(badMentor, perfectMentee),
    0.0,
    0.001,
    "language no overlap",
  );
  // 3.3 — Multilingual intersection
  const m = { ...perfectMentor, languages: ["pt-BR", "en-US", "es-ES"] };
  const n = { ...perfectMentee, languages: ["pt-BR", "es-ES"] };
  // |A∩B|=2, |A∪B|=3 → 0.667
  expectClose(scoreLanguageMatch(m, n), 2 / 3, 0.001, "language multilingual");
}

// ============================================================================
// SECTION 4 — Timezone factor
// ============================================================================

function testTimezoneFactor(): void {
  // 4.1 — Same tz → 1
  expectClose(scoreTimezoneMatch(perfectMentor, perfectMentee), 1.0, 0.001, "tz same");
  // 4.2 — 3 hour gap → 1 - 3/12 = 0.75
  const m3 = { ...perfectMentor, timezoneOffset: 0 };
  const n3 = { ...perfectMentee, timezoneOffset: -3 };
  expectClose(scoreTimezoneMatch(m3, n3), 0.75, 0.001, "tz 3h gap");
  // 4.3 — 6 hour gap → 0.5
  const m6 = { ...perfectMentor, timezoneOffset: 3 };
  const n6 = { ...perfectMentee, timezoneOffset: -3 };
  expectClose(scoreTimezoneMatch(m6, n6), 0.5, 0.001, "tz 6h gap");
  // 4.4 — 12 hour gap → 0
  const m12 = { ...perfectMentor, timezoneOffset: 9 };
  const n12 = { ...perfectMentee, timezoneOffset: -3 };
  expectClose(scoreTimezoneMatch(m12, n12), 0.0, 0.001, "tz 12h gap");
  // 4.5 — >12 hour gap (e.g., 14) → 0 (capped)
  const m14 = { ...perfectMentor, timezoneOffset: 11 };
  const n14 = { ...perfectMentee, timezoneOffset: -3 };
  expectClose(scoreTimezoneMatch(m14, n14), 0.0, 0.001, "tz >12h capped");
}

// ============================================================================
// SECTION 5 — Experience factor (bell curve)
// ============================================================================

function testExperienceFactor(): void {
  // 5.1 — Ideal gap (3 years) → 1
  const m_ideal = { ...perfectMentor, yearsExperience: 8 };
  const n_ideal = { ...perfectMentee, yearsExperience: 5 };
  expectClose(scoreExperienceGap(m_ideal, n_ideal), 1.0, 0.001, "exp ideal gap");
  // 5.2 — Zero gap (peers) → 0.5
  const m_peer = { ...perfectMentor, yearsExperience: 5 };
  const n_peer = { ...perfectMentee, yearsExperience: 5 };
  expectClose(scoreExperienceGap(m_peer, n_peer), 0.5, 0.001, "exp peers");
  // 5.3 — Negative gap (mentee MORE experienced) → 0.3
  const m_jun = { ...perfectMentor, yearsExperience: 3 };
  const n_sen = { ...perfectMentee, yearsExperience: 10 };
  expectClose(scoreExperienceGap(m_jun, n_sen), 0.3, 0.001, "exp negative");
  // 5.4 — 6 year gap (falling side) → 1 - 3/7 ≈ 0.571
  const m_6 = { ...perfectMentor, yearsExperience: 11 };
  const n_6 = { ...perfectMentee, yearsExperience: 5 };
  expectClose(scoreExperienceGap(m_6, n_6), 1 - 3 / 7, 0.001, "exp 6y gap");
  // 5.5 — 10 year gap → 0
  const m_10 = { ...perfectMentor, yearsExperience: 15 };
  const n_10 = { ...perfectMentee, yearsExperience: 5 };
  expectClose(scoreExperienceGap(m_10, n_10), 0.0, 0.001, "exp 10y gap");
  // 5.6 — 1 year gap → 0.5 + 0.5 * (1/3) ≈ 0.667
  const m_1 = { ...perfectMentor, yearsExperience: 6 };
  const n_1 = { ...perfectMentee, yearsExperience: 5 };
  expectClose(scoreExperienceGap(m_1, n_1), 0.5 + 0.5 * (1 / 3), 0.001, "exp 1y gap");
}

// ============================================================================
// SECTION 6 — Interest factor
// ============================================================================

function testInterestFactor(): void {
  // 6.1 — Full overlap
  expectClose(scoreInterestMatch(perfectMentor, perfectMentee), 1.0, 0.001, "interest full");
  // 6.2 — No overlap
  expectClose(
    scoreInterestMatch(badMentor, perfectMentee),
    0.0,
    0.001,
    "interest no overlap",
  );
  // 6.3 — Case insensitive
  const m = { ...perfectMentor, interests: ["MESA REAL", "tarot"] };
  const n = { ...perfectMentee, interests: ["mesa real"] };
  expectClose(scoreInterestMatch(m, n), 1.0, 0.001, "interest case");
}

// ============================================================================
// SECTION 7 — Weights validation
// ============================================================================

function testWeightsValidation(): void {
  // 7.1 — Default weights sum to 1
  const sum =
    DEFAULT_WEIGHTS.tradition +
    DEFAULT_WEIGHTS.language +
    DEFAULT_WEIGHTS.timezone +
    DEFAULT_WEIGHTS.experience +
    DEFAULT_WEIGHTS.interest;
  expectClose(sum, 1.0, 0.001, "default weights sum");
  // 7.2 — Valid custom weights
  const good: CompatibilityWeights = {
    tradition: 0.5,
    language: 0.2,
    timezone: 0.1,
    experience: 0.1,
    interest: 0.1,
  };
  validateWeights(good); // no throw
  expectTrue(true, "custom weights accepted");
  // 7.3 — Bad sum
  expectThrows(
    () =>
      validateWeights({
        tradition: 0.5,
        language: 0.5,
        timezone: 0.5,
        experience: 0.5,
        interest: 0.5,
      }),
    "weights sum too high",
    InvalidWeightsError,
  );
  // 7.4 — Negative weight
  expectThrows(
    () =>
      validateWeights({
        tradition: -0.1,
        language: 0.3,
        timezone: 0.3,
        experience: 0.3,
        interest: 0.2,
      }),
    "negative weight",
    InvalidWeightsError,
  );
  // 7.5 — NaN weight
  expectThrows(
    () =>
      validateWeights({
        tradition: Number.NaN,
        language: 0.3,
        timezone: 0.3,
        experience: 0.3,
        interest: 0.1,
      }),
    "NaN weight",
    InvalidWeightsError,
  );
}

// ============================================================================
// SECTION 8 — Compatibility aggregation
// ============================================================================

function testCompatibility(): void {
  // 8.1 — Perfect pair scores 1.0 (or close to it)
  const perfect = calculateCompatibility(perfectMentor, perfectMentee);
  expectTrue(perfect.total > 0.85, `perfect pair total ${perfect.total} > 0.85`);
  expectEqual(perfect.factors.tradition, 1.0, "perfect tradition");
  expectEqual(perfect.factors.language, 1.0, "perfect language");
  expectEqual(perfect.factors.timezone, 1.0, "perfect timezone");
  // 8.2 — Mismatch scores low
  const bad = calculateCompatibility(badMentor, perfectMentee);
  expectTrue(bad.total < 0.3, `bad pair total ${bad.total} < 0.3`);
  // 8.3 — Invalid profile (mentor)
  expectThrows(
    () => calculateCompatibility({} as ScorableProfile, perfectMentee),
    "invalid mentor",
    InvalidProfileError,
  );
  // 8.4 — Same user
  expectThrows(
    () => calculateCompatibility(perfectMentor, perfectMentor),
    "same user",
    InvalidProfileError,
  );
  // 8.5 — Invalid weights
  expectThrows(
    () =>
      calculateCompatibility(perfectMentor, perfectMentee, {
        tradition: 2.0,
        language: 0.0,
        timezone: 0.0,
        experience: 0.0,
        interest: 0.0,
      }),
    "invalid weights",
    InvalidWeightsError,
  );
  // 8.6 — Factors are clamped [0,1]
  const extreme = calculateCompatibility(perfectMentor, perfectMentee);
  expectTrue(
    extreme.factors.tradition >= 0 && extreme.factors.tradition <= 1,
    "tradition clamped",
  );
  expectTrue(
    extreme.total >= 0 && extreme.total <= 1,
    "total clamped",
  );
  // 8.7 — Total equals weighted sum (within rounding)
  const sum =
    extreme.factors.tradition * extreme.weights.tradition +
    extreme.factors.language * extreme.weights.language +
    extreme.factors.timezone * extreme.weights.timezone +
    extreme.factors.experience * extreme.weights.experience +
    extreme.factors.interest * extreme.weights.interest;
  expectClose(extreme.total, sum, 0.001, "total = weighted sum");
}

// ============================================================================
// SECTION 9 — Type guards
// ============================================================================

function testTypeGuards(): void {
  // 9.1 — Valid profile
  expectTrue(isScorableProfile(perfectMentor), "valid profile");
  // 9.2 — Missing userId
  expectTrue(!isScorableProfile({ ...perfectMentor, userId: "" }), "empty userId");
  // 9.3 — Wrong type
  expectTrue(!isScorableProfile(null), "null profile");
  expectTrue(!isScorableProfile("string"), "string profile");
  // 9.4 — Non-array traditions
  expectTrue(
    !isScorableProfile({ ...perfectMentor, traditions: "Cigano" }),
    "non-array traditions",
  );
  // 9.5 — NaN timezone
  expectTrue(
    !isScorableProfile({ ...perfectMentor, timezoneOffset: Number.NaN }),
    "NaN timezone",
  );
  // 9.6 — Valid factors
  expectTrue(
    isCompatibilityFactors({
      tradition: 0.5,
      language: 0.5,
      timezone: 0.5,
      experience: 0.5,
      interest: 0.5,
    }),
    "valid factors",
  );
  // 9.7 — Missing factor
  expectTrue(
    !isCompatibilityFactors({
      tradition: 0.5,
      language: 0.5,
      timezone: 0.5,
      experience: 0.5,
    }),
    "missing factor",
  );
}

// ============================================================================
// SECTION 10 — Helpers
// ============================================================================

function testHelpers(): void {
  // 10.1 — clamp01 normal values
  expectEqual(clamp01(0.5), 0.5, "clamp 0.5");
  expectEqual(clamp01(0), 0, "clamp 0");
  expectEqual(clamp01(1), 1, "clamp 1");
  // 10.2 — clamp01 out of range
  expectEqual(clamp01(-0.5), 0, "clamp negative");
  expectEqual(clamp01(1.5), 1, "clamp > 1");
  // 10.3 — clamp01 NaN
  expectEqual(clamp01(Number.NaN), 0, "clamp NaN");
  expectEqual(clamp01(Number.POSITIVE_INFINITY), 1, "clamp Infinity");
  // 10.4 — explainScore format
  const score = calculateCompatibility(perfectMentor, perfectMentee);
  const explanation = explainScore(score);
  expectTrue(explanation.includes("tradição"), "explain has tradição");
  expectTrue(explanation.includes("língua"), "explain has língua");
  expectTrue(explanation.includes("fuso"), "explain has fuso");
  expectTrue(explanation.includes("experiência"), "explain has experiência");
  expectTrue(explanation.includes("interesse"), "explain has interesse");
  expectTrue(explanation.includes("%"), "explain has percent");
  expectTrue(explanation.includes("total"), "explain ends with total");
}

// ============================================================================
// RUNNER
// ============================================================================

export function runMentorshipScoringSpec(): { passed: number; failed: number } {
  _passed = 0;
  _failed = 0;
  _failures.length = 0;
  testJaccard();
  testTraditionFactor();
  testLanguageFactor();
  testTimezoneFactor();
  testExperienceFactor();
  testInterestFactor();
  testWeightsValidation();
  testCompatibility();
  testTypeGuards();
  testHelpers();
  return { passed: _passed, failed: _failed };
}

export function getMentorshipScoringFailures(): readonly string[] {
  return _failures;
}

// Self-run when executed directly via Node
if (typeof require !== "undefined" && require.main === module) {
  const result = runMentorshipScoringSpec();
  console.log(`mentorship-scoring: ${result.passed} passed, ${result.failed} failed`);
  for (const f of _failures) console.log(`  ✗ ${f}`);
  process.exit(result.failed === 0 ? 0 : 1);
}