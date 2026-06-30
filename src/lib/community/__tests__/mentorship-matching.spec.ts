// ============================================================================
// MENTORSHIP MATCHING — Spec (Wave 68, 2026-06-30)
// ============================================================================
// Self-running test harness. 25+ assertions.
// ============================================================================

import {
  applyHardFilters,
  applyMinScore,
  EmptyCandidatesError,
  explainCandidate,
  filterByAvailability,
  findBestMatches,
  findMentorsForWindow,
  indexAvailability,
  InvalidCriteriaError,
  MatchCandidate,
  MatchingCriteria,
  rankByScore,
} from "../mentorship-matching.ts";
import {
  CompatibilityWeights,
  DEFAULT_WEIGHTS,
} from "../mentorship-scoring.ts";

import type { ScorableProfile } from "../mentorship-scoring.ts";
import { AvailableSlot } from "../mentorship-matching.ts";
import type { Availability } from "../mentorship-availability.ts";

// ============================================================================
// TEST HARNESS
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
    _failures.push(`${msg}\n  expected: ${expected} (±${tol})\n  actual:   ${actual}`);
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
// FIXTURES
// ============================================================================

const mentee: ScorableProfile = {
  userId: "mentee-1",
  traditions: ["Cigano", "Orixás"],
  languages: ["pt-BR"],
  timezoneOffset: -3,
  yearsExperience: 5,
  interests: ["Mesa Real"],
  displayName: "Mentee",
};

const mentorA: ScorableProfile = {
  userId: "mentor-A",
  traditions: ["Cigano", "Orixás", "Tarot"],
  languages: ["pt-BR", "en-US"],
  timezoneOffset: -3,
  yearsExperience: 8,
  interests: ["Mesa Real", "Tarot"],
  displayName: "Mentor A (best)",
};

const mentorB: ScorableProfile = {
  userId: "mentor-B",
  traditions: ["Cigano"],
  languages: ["pt-BR"],
  timezoneOffset: -3,
  yearsExperience: 6,
  interests: ["Mesa Real"],
  displayName: "Mentor B (good)",
};

const mentorC: ScorableProfile = {
  userId: "mentor-C",
  traditions: ["Numerologia"],
  languages: ["de-DE"],
  timezoneOffset: 5,
  yearsExperience: 20,
  interests: ["Astrologia"],
  displayName: "Mentor C (mismatch)",
};

const allCandidates = [mentorA, mentorB, mentorC];

// ============================================================================
// SECTION 1 — Hard filtering
// ============================================================================

function testHardFilters(): void {
  // 1.1 — Filter by required traditions
  const criteria1: MatchingCriteria = { traditions: ["Cigano"] };
  const r1 = applyHardFilters(allCandidates, criteria1);
  expectEqual(r1.kept.length, 2, "traditions filter keeps 2");
  expectEqual(r1.excluded.length, 1, "traditions filter excludes 1");
  expectTrue(
    r1.excluded[0]!.excludedReason !== undefined,
    "excluded reason set",
  );
  // 1.2 — Filter by required languages
  const r2 = applyHardFilters(allCandidates, { languages: ["pt-BR"] });
  expectEqual(r2.kept.length, 2, "languages filter keeps 2");
  // 1.3 — Filter by timezone range (array of ranges, any-of)
  const r3 = applyHardFilters(allCandidates, {
    timezones: [{ min: -6, max: 0 }],
  });
  expectEqual(r3.kept.length, 2, "timezone range keeps 2");
  // 1.4 — Filter by experience range
  const r4 = applyHardFilters(allCandidates, { experienceRange: { max: 10 } });
  expectEqual(r4.kept.length, 2, "experience max 10 keeps 2");
  // 1.5 — Filter by interests
  const r5 = applyHardFilters(allCandidates, { interests: ["Mesa Real"] });
  expectEqual(r5.kept.length, 2, "interests Mesa Real keeps 2");
  // 1.6 — Filter by requireMentorId
  const r6 = applyHardFilters(allCandidates, { requireMentorId: "mentor-A" });
  expectEqual(r6.kept.length, 1, "requireMentorId keeps 1");
  expectEqual(r6.kept[0]!.userId, "mentor-A", "requireMentorId keeps correct");
  // 1.7 — Filter by excludeMentorIds
  const r7 = applyHardFilters(allCandidates, {
    excludeMentorIds: ["mentor-A", "mentor-B"],
  });
  expectEqual(r7.kept.length, 1, "exclude keeps 1");
  expectEqual(r7.kept[0]!.userId, "mentor-C", "exclude correct");
}

// ============================================================================
// SECTION 2 — Soft filtering
// ============================================================================

function testSoftFilters(): void {
  // 2.1 — Min score filter (none below 0)
  const cands: MatchCandidate[] = [
    { mentor: mentorA, score: 0.9, factors: { tradition: 1, language: 1, timezone: 1, experience: 1, interest: 1 }, availableSlots: [] },
    { mentor: mentorB, score: 0.5, factors: { tradition: 1, language: 1, timezone: 1, experience: 1, interest: 1 }, availableSlots: [] },
    { mentor: mentorC, score: 0.2, factors: { tradition: 1, language: 1, timezone: 1, experience: 1, interest: 1 }, availableSlots: [] },
  ];
  const r1 = applyMinScore(cands, 0.5);
  expectEqual(r1.length, 2, "minScore 0.5 keeps 2");
  // 2.2 — Min score 0 (default) keeps all
  const r2 = applyMinScore(cands, 0);
  expectEqual(r2.length, 3, "minScore 0 keeps all");
  // 2.3 — Min score above all
  const r3 = applyMinScore(cands, 0.99);
  expectEqual(r3.length, 0, "minScore 0.99 keeps 0");
}

// ============================================================================
// SECTION 3 — Ranking
// ============================================================================

function testRanking(): void {
  // 3.1 — Sort by score desc
  const cands: MatchCandidate[] = [
    { mentor: { ...mentorA, userId: "z" }, score: 0.5, factors: { tradition: 1, language: 1, timezone: 1, experience: 1, interest: 1 }, availableSlots: [] },
    { mentor: { ...mentorB, userId: "a" }, score: 0.9, factors: { tradition: 1, language: 1, timezone: 1, experience: 1, interest: 1 }, availableSlots: [] },
    { mentor: { ...mentorC, userId: "m" }, score: 0.7, factors: { tradition: 1, language: 1, timezone: 1, experience: 1, interest: 1 }, availableSlots: [] },
  ];
  const ranked = rankByScore(cands);
  expectEqual(ranked[0]!.mentor.userId, "a", "top score first");
  expectEqual(ranked[1]!.mentor.userId, "m", "middle score second");
  expectEqual(ranked[2]!.mentor.userId, "z", "lowest score last");
  // 3.2 — Tie-break by userId asc
  const tied: MatchCandidate[] = [
    { mentor: { ...mentorA, userId: "z" }, score: 0.5, factors: { tradition: 1, language: 1, timezone: 1, experience: 1, interest: 1 }, availableSlots: [] },
    { mentor: { ...mentorB, userId: "a" }, score: 0.5, factors: { tradition: 1, language: 1, timezone: 1, experience: 1, interest: 1 }, availableSlots: [] },
    { mentor: { ...mentorC, userId: "m" }, score: 0.5, factors: { tradition: 1, language: 1, timezone: 1, experience: 1, interest: 1 }, availableSlots: [] },
  ];
  const tiedRanked = rankByScore(tied);
  expectEqual(tiedRanked[0]!.mentor.userId, "a", "tie-break: a first");
  expectEqual(tiedRanked[1]!.mentor.userId, "m", "tie-break: m second");
  expectEqual(tiedRanked[2]!.mentor.userId, "z", "tie-break: z last");
}

// ============================================================================
// SECTION 4 — filterByAvailability
// ============================================================================

function testFilterByAvailability(): void {
  const slots: Map<string, AvailableSlot[]> = new Map([
    [
      "mentor-A",
      [{ start: "2026-07-06T18:00:00Z", end: "2026-07-06T19:00:00Z" }],
    ],
    [
      "mentor-B",
      [{ start: "2026-07-07T18:00:00Z", end: "2026-07-07T19:00:00Z" }],
    ],
  ]);
  // 4.1 — Filter candidates by slot at 18:00 on 2026-07-06
  const r1 = filterByAvailability(
    allCandidates,
    "2026-07-06T18:00:00Z",
    60,
    slots,
  );
  expectEqual(r1.length, 1, "filter avail keeps 1");
  expectEqual(r1[0]!.userId, "mentor-A", "correct mentor");
  // 4.2 — Empty availability → no matches
  const empty: Map<string, AvailableSlot[]> = new Map();
  const r2 = filterByAvailability(allCandidates, "2026-07-06T18:00:00Z", 60, empty);
  expectEqual(r2.length, 0, "empty avail → 0");
  // 4.3 — Slot too short for duration
  const r3 = filterByAvailability(
    [mentorA],
    "2026-07-06T18:30:00Z",
    60,
    slots,
  );
  expectEqual(r3.length, 0, "slot too short for duration");
}

// ============================================================================
// SECTION 5 — findBestMatches (integration)
// ============================================================================

function testFindBestMatches(): void {
  // 5.1 — Returns top-N sorted
  const r1 = findBestMatches(mentee, allCandidates, {}, 3);
  expectEqual(r1.length, 3, "top-3 returns 3");
  expectEqual(r1[0]!.mentor.userId, "mentor-A", "best is A");
  // 5.2 — Limit truncates
  const r2 = findBestMatches(mentee, allCandidates, {}, 1);
  expectEqual(r2.length, 1, "limit 1 truncates");
  // 5.3 — Hard filter excludes then ranks remaining
  const r3 = findBestMatches(
    mentee,
    allCandidates,
    { traditions: ["Cigano"] },
    5,
  );
  expectEqual(r3.length, 2, "filtered → 2 candidates");
  expectEqual(r3[0]!.mentor.userId, "mentor-A", "best within filtered");
  // 5.4 — Empty candidates → empty
  const r4 = findBestMatches(mentee, [], {}, 5);
  expectEqual(r4.length, 0, "empty candidates → empty");
  // 5.5 — Invalid limit
  expectThrows(
    () => findBestMatches(mentee, allCandidates, {}, 0),
    "limit 0 throws",
    InvalidCriteriaError,
  );
  // 5.6 — Invalid mentee
  expectThrows(
    () => findBestMatches({} as ScorableProfile, allCandidates, {}, 5),
    "invalid mentee",
    InvalidCriteriaError,
  );
}

// ============================================================================
// SECTION 6 — Custom weights
// ============================================================================

function testCustomWeights(): void {
  // 6.1 — Higher weight on language boosts multilingual mentors
  const customWeights: CompatibilityWeights = {
    tradition: 0.2,
    language: 0.4,
    timezone: 0.1,
    experience: 0.1,
    interest: 0.2,
  };
  const r1 = findBestMatches(mentee, allCandidates, { weights: customWeights }, 3);
  // Mentor A speaks pt-BR + en-US, others just one. With higher language weight, A still wins.
  expectEqual(r1[0]!.mentor.userId, "mentor-A", "A still wins with custom weights");
  // 6.2 — Default weights used when none provided
  const r2 = findBestMatches(mentee, allCandidates, {}, 3);
  expectEqual(r2[0]!.mentor.userId, "mentor-A", "A wins with default weights");
}

// ============================================================================
// SECTION 7 — indexAvailability
// ============================================================================

function testIndexAvailability(): void {
  // 7.1 — Build map from entries
  const entries = [
    { mentorId: "m1", slots: [{ start: "2026-07-06T18:00:00Z", end: "2026-07-06T19:00:00Z" }] },
    { mentorId: "m2", slots: [] },
  ];
  const map = indexAvailability(entries);
  expectEqual(map.size, 2, "indexed 2");
  expectEqual(map.get("m1")!.length, 1, "m1 has 1 slot");
  expectEqual(map.get("m2")!.length, 0, "m2 has 0 slots");
}

// ============================================================================
// SECTION 8 — findMentorsForWindow
// ============================================================================

function testFindMentorsForWindow(): void {
  const slots: Map<string, AvailableSlot[]> = new Map([
    [
      "mentor-A",
      [{ start: "2026-07-06T18:00:00Z", end: "2026-07-06T19:00:00Z" }],
    ],
    [
      "mentor-B",
      [{ start: "2026-07-06T18:00:00Z", end: "2026-07-06T19:00:00Z" }],
    ],
    [
      "mentor-C",
      [{ start: "2026-07-07T18:00:00Z", end: "2026-07-07T19:00:00Z" }],
    ],
  ]);
  const r1 = findMentorsForWindow("2026-07-06T18:00:00Z", 60, slots);
  expectEqual(r1.length, 2, "2 mentors for window");
  expectEqual(r1[0], "mentor-A", "A first (sorted)");
  expectEqual(r1[1], "mentor-B", "B second (sorted)");
  const r2 = findMentorsForWindow("2026-07-08T18:00:00Z", 60, slots);
  expectEqual(r2.length, 0, "no mentors for other window");
}

// ============================================================================
// SECTION 9 — explainCandidate
// ============================================================================

function testExplainCandidate(): void {
  // 9.1 — Excluded candidate explanation
  const excluded: MatchCandidate = {
    mentor: mentorA,
    score: 0,
    factors: { tradition: 1, language: 1, timezone: 1, experience: 1, interest: 1 },
    availableSlots: [],
    excludedReason: "traditions do not include any required tradition",
  };
  const r1 = explainCandidate(excluded);
  expectTrue(r1.startsWith("EXCLUDED"), "excluded prefix");
  expectTrue(r1.includes("traditions"), "excluded reason in output");
  // 9.2 — Scored candidate explanation
  const scored: MatchCandidate = {
    mentor: mentorA,
    score: 0.85,
    factors: { tradition: 1, language: 1, timezone: 1, experience: 1, interest: 1 },
    availableSlots: [],
  };
  const r2 = explainCandidate(scored);
  expectTrue(r2.includes("85.0%"), "score in output");
  expectTrue(r2.includes("tradição"), "factor in output");
}

// ============================================================================
// RUNNER
// ============================================================================

export function runMentorshipMatchingSpec(): { passed: number; failed: number } {
  _passed = 0;
  _failed = 0;
  _failures.length = 0;
  testHardFilters();
  testSoftFilters();
  testRanking();
  testFilterByAvailability();
  testFindBestMatches();
  testCustomWeights();
  testIndexAvailability();
  testFindMentorsForWindow();
  testExplainCandidate();
  return { passed: _passed, failed: _failed };
}

export function getMentorshipMatchingFailures(): readonly string[] {
  return _failures;
}

if (typeof require !== "undefined" && require.main === module) {
  const result = runMentorshipMatchingSpec();
  console.log(`mentorship-matching: ${result.passed} passed, ${result.failed} failed`);
  for (const f of _failures) console.log(`  ✗ ${f}`);
  process.exit(result.failed === 0 ? 0 : 1);
}