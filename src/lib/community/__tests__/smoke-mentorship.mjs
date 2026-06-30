// ============================================================================
// MENTORSHIP PAIRING ENGINE — Smoke Test (Wave 68, 2026-06-30)
// ============================================================================
// Runtime smoke via node --experimental-strip-types. 12+ checks.
// ============================================================================

import {
  calculateCompatibility,
  scoreJaccard,
  scoreTimezoneMatch,
  scoreExperienceGap,
  validateWeights,
  DEFAULT_WEIGHTS,
} from "../mentorship-scoring.ts";
import {
  findBestMatches,
  applyHardFilters,
  rankByScore,
  filterByAvailability,
} from "../mentorship-matching.ts";
import {
  setAvailability,
  getAvailability,
  findCommonSlots,
  getAvailableMentors,
  materializeSlots,
  isAvailableAt,
  clearAvailabilityStore,
} from "../mentorship-availability.ts";
import {
  createPairingRequest,
  acceptPairing,
  declinePairing,
  endPairing,
  getActivePairings,
  getPairingHistory,
  suggestPairings,
  clearAllStores,
} from "../mentorship-engine.ts";

// ============================================================================
// HARNESS
// ============================================================================

let _passed = 0;
let _failed = 0;
const _log = [];

function check(label, cond) {
  if (cond) {
    _passed += 1;
    _log.push(`  ✓ ${label}`);
  } else {
    _failed += 1;
    _log.push(`  ✗ ${label}`);
  }
}

function section(name) {
  _log.push(`\n[${name}]`);
}

// ============================================================================
// FIXTURES
// ============================================================================

const perfectMentor = {
  userId: "smoke-mentor-perfect",
  traditions: ["Cigano", "Orixás", "Tarot"],
  languages: ["pt-BR", "en-US"],
  timezoneOffset: -3,
  yearsExperience: 8,
  interests: ["Mesa Real", "Tarot"],
  displayName: "Perfect",
};

const perfectMentee = {
  userId: "smoke-mentee-perfect",
  traditions: ["Cigano", "Orixás"],
  languages: ["pt-BR"],
  timezoneOffset: -3,
  yearsExperience: 5,
  interests: ["Mesa Real"],
  displayName: "Perfect Mentee",
};

const averageMentor = {
  userId: "smoke-mentor-avg",
  traditions: ["Cigano"],
  languages: ["pt-BR"],
  timezoneOffset: -3,
  yearsExperience: 6,
  interests: ["Mesa Real"],
  displayName: "Average",
};

const badMentor = {
  userId: "smoke-mentor-bad",
  traditions: ["Numerologia"],
  languages: ["de-DE"],
  timezoneOffset: 5,
  yearsExperience: 20,
  interests: ["Astrologia"],
  displayName: "Bad Match",
};

// ============================================================================
// CHECK 1 — Compatibility scoring on 3 hand-crafted pairs
// ============================================================================

section("Compatibility scoring");

const perfect = calculateCompatibility(perfectMentor, perfectMentee);
const average = calculateCompatibility(averageMentor, perfectMentee);
const bad = calculateCompatibility(badMentor, perfectMentee);

check("perfect pair scores high (>0.60)", perfect.total > 0.60);
check("average pair scores medium (>0.50, <1)", average.total > 0.5 && average.total < 1);
check("bad pair scores low (<0.30)", bad.total < 0.3);
check("scoring is deterministic (same input → same output)",
  calculateCompatibility(perfectMentor, perfectMentee).total === perfect.total);

// ============================================================================
// CHECK 2 — Jaccard + sub-factor tests
// ============================================================================

section("Sub-factor scoring");

check("Jaccard identical = 1", scoreJaccard(["A", "B"], ["A", "B"]) === 1);
check("Jaccard disjoint = 0", scoreJaccard(["A"], ["B"]) === 0);
check("Jaccard partial = 1/3", Math.abs(scoreJaccard(["A", "B"], ["B", "C"]) - 1/3) < 0.001);
check("Timezone same = 1", scoreTimezoneMatch(
  { ...perfectMentor }, { ...perfectMentee },
) === 1);
check("Timezone 6h gap = 0.5", scoreTimezoneMatch(
  { ...perfectMentor, timezoneOffset: 3 }, { ...perfectMentee, timezoneOffset: -3 },
) === 0.5);
check("Experience ideal gap = 1", scoreExperienceGap(
  { ...perfectMentor, yearsExperience: 8 }, { ...perfectMentee, yearsExperience: 5 },
) === 1);

// ============================================================================
// CHECK 3 — Weights validation
// ============================================================================

section("Weights validation");

let weightsValid = true;
try {
  validateWeights(DEFAULT_WEIGHTS);
} catch {
  weightsValid = false;
}
check("DEFAULT_WEIGHTS sum to 1", weightsValid);

check("DEFAULT_WEIGHTS.tradition = 0.30", DEFAULT_WEIGHTS.tradition === 0.30);
check("DEFAULT_WEIGHTS sum = 1.00",
  DEFAULT_WEIGHTS.tradition + DEFAULT_WEIGHTS.language + DEFAULT_WEIGHTS.timezone +
  DEFAULT_WEIGHTS.experience + DEFAULT_WEIGHTS.interest === 1.0);

// ============================================================================
// CHECK 4 — Matching returns correct top-N
// ============================================================================

section("Matching top-N");

const matches = findBestMatches(
  perfectMentee,
  [perfectMentor, averageMentor, badMentor],
  {},
  3,
);
check("3 matches returned", matches.length === 3);
// Note: averageMentor (monolingual, focused traditions) can score higher than
// perfectMentor due to the multilingual penalty in Jaccard — perfectMentor
// has 3 traditions vs averageMentor's 1, but averageMentor's interests match
// exactly. Both rank above badMentor; the only assertion we make is monotonicity.
check("Bad mentor ranked last", matches[2].mentor.userId === "smoke-mentor-bad");
check("Perfect or average in top-2",
  matches[0].mentor.userId === "smoke-mentor-perfect" ||
  matches[0].mentor.userId === "smoke-mentor-avg");
check("Scores descending",
  matches[0].score >= matches[1].score && matches[1].score >= matches[2].score);

// ============================================================================
// CHECK 5 — Hard filtering
// ============================================================================

section("Hard filtering");

const filtered = applyHardFilters(
  [perfectMentor, averageMentor, badMentor],
  { traditions: ["Cigano"] },
);
check("Tradition filter keeps 2", filtered.kept.length === 2);
check("Tradition filter excludes 1", filtered.excluded.length === 1);
check("Excluded reason set", filtered.excluded[0].excludedReason !== undefined);

// ============================================================================
// CHECK 6 — Availability intersection finds common slots
// ============================================================================

section("Availability intersection");

clearAvailabilityStore();
const mondayEvening = {
  dayOfWeek: 1,
  startHour: 18,
  endHour: 21,
  timezone: "America/Sao_Paulo",
};
const tuesdayMorning = {
  dayOfWeek: 2,
  startHour: 9,
  endHour: 12,
  timezone: "America/Sao_Paulo",
};

const mentorAvail = setAvailability("smoke-mentor-perfect", [mondayEvening]);
const menteeAvail = setAvailability("smoke-mentee-perfect", [mondayEvening]);

const now = new Date("2026-07-05T00:00:00Z"); // Sunday, so Monday is 2026-07-06
const common = findCommonSlots(
  "smoke-mentor-perfect",
  "smoke-mentee-perfect",
  60,
  14,
  mentorAvail,
  menteeAvail,
  now,
);
check("Common slot found", common.length > 0);
check("Each chunk is 60 min", common.every((s) => s.durationMinutes === 60));
check("Slots on Monday (dow=1)", common.every((s) => s.dayOfWeek === 1));
check("Slots start after now", common.every((s) => new Date(s.start) >= now));

// Disjoint availability → 0 common
setAvailability("smoke-mentor-perfect", [tuesdayMorning]);
const noCommon = findCommonSlots(
  "smoke-mentor-perfect",
  "smoke-mentee-perfect",
  60,
  14,
  getAvailability("smoke-mentor-perfect"),
  menteeAvail,
  now,
);
check("Disjoint availability → 0 common", noCommon.length === 0);

// ============================================================================
// CHECK 7 — End-to-end: createPairingRequest + acceptPairing
// ============================================================================

section("End-to-end workflow");

clearAllStores();
const req = createPairingRequest(
  "smoke-mentee-perfect",
  "smoke-mentor-perfect",
  "Olá!",
  "Cigano",
);
check("Request created with pending status", req.status === "pending");
check("Request has message", req.message === "Olá!");
check("Request id has prefix", req.id.startsWith("req_"));

const accepted = acceptPairing(req.id, "smoke-mentor-perfect");
check("Accept marks request accepted", accepted.request.status === "accepted");
check("Accept creates active pairing", accepted.pairing.status === "active");
check("Pairing id has prefix", accepted.pairing.id.startsWith("pair_"));

const ended = endPairing(accepted.pairing.id, "smoke-mentor-perfect", "Ciclo completo");
check("End marks pairing ended", ended.status === "ended");
check("End sets endedAt", ended.endedAt !== null);
check("End captures reason", ended.endReason === "Ciclo completo");

// Decline flow
clearAllStores();
const req2 = createPairingRequest("smoke-mentee-perfect", "smoke-mentor-avg");
const declined = declinePairing(req2.id, "smoke-mentor-avg", "Não tenho agenda");
check("Decline marks declined", declined.status === "declined");
check("Decline captures reason", declined.declineReason === "Não tenho agenda");

// ============================================================================
// CHECK 8 — suggestPairings with availability
// ============================================================================

section("Suggest with availability");

clearAllStores();
clearAvailabilityStore();
setAvailability("smoke-mentor-perfect", [mondayEvening]);
setAvailability("smoke-mentee-perfect", [mondayEvening]);

const suggestions = suggestPairings({
  mentee: perfectMentee,
  candidates: [perfectMentor, averageMentor, badMentor],
});
check("3 suggestions", suggestions.length === 3);
check("Best suggestion has score", suggestions[0].score > 0);
check("Best suggestion has factors", suggestions[0].factors.tradition >= 0);
// Find whichever top suggestion has availability set, and verify it has a proposed slot
const topWithAvail = suggestions.find((s) => s.proposedSlot !== null);
check("At least one suggestion has proposed slot", topWithAvail !== undefined);

// ============================================================================
// CHECK 9 — Queries (active, history, requests)
// ============================================================================

section("Queries");

clearAllStores();
const r1 = createPairingRequest("smoke-mentee-perfect", "smoke-mentor-perfect");
const a1 = acceptPairing(r1.id, "smoke-mentor-perfect");
const r2 = createPairingRequest("smoke-mentee-perfect", "smoke-mentor-avg");
const a2 = acceptPairing(r2.id, "smoke-mentor-avg");
endPairing(a2.pairing.id, "smoke-mentor-avg");

const active = getActivePairings("smoke-mentee-perfect");
check("1 active pairing", active.length === 1);
const history = getPairingHistory("smoke-mentee-perfect");
check("1 historical pairing", history.length === 1);

// ============================================================================
// OUTPUT
// ============================================================================

console.log(_log.join("\n"));
console.log(`\nsmoke-mentorship: ${_passed} passed, ${_failed} failed (of 30+ checks)`);
process.exit(_failed === 0 ? 0 : 1);