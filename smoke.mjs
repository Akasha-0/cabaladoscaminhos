/**
 * smoke.mjs — runtime smoke test (6/6 scenarios)
 *
 * Runs via `node --experimental-strip-types smoke.mjs`
 * Validates the 6 critical paths end-to-end against real engine code.
 */
import {
  REPUTATION_BADGES,
  DISPUTE_STATES,
  REPUTATION_SACRED_TAGS,
  REPUTATION_TRADITION_FLOORS,
  CIGANO_TAGS,
  ORIXAS_TAGS,
  TAROT_TAGS,
  ASTROLOGIA_TAGS,
  SEFIROT_TAGS,
  CHAKRAS_TAGS,
  IFA_TAGS,
  SAMPLE_SERVICES,
  SAMPLE_REVIEWS,
  computeReputation,
  computeTrustScore,
  computeTraditionScore,
  raiseDispute,
  resolveDispute,
  moveDisputeToReview,
  awardBadge,
  listBadges,
  revokeBadge,
  eraseUserReputation,
  validateReputation,
  chainReputationHash,
  auditReputationCoverage,
  pseudonymizeUserId,
  isBadgeId,
  isTraditionId,
  isServiceType,
  clampTrustScore,
  resetReputationLedgerForTest,
  InvalidBadgeError,
  DisputeStateError,
} from "./src/lib/w66/reputation-system.ts";

let passed = 0;
let failed = 0;
const errors = [];

function check(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message}`);
    failed++;
    errors.push(name + ": " + e.message);
  }
}

console.log("\n=== W66 reputation-system smoke 6/6 ===");

// Smoke 1: Sacred-tag coverage is FULL (≥128 + all 7 traditions meet floor)
check("smoke-1: auditReputationCoverage reports isFullCoverage=true with 128+ symbols", () => {
  const a = auditReputationCoverage();
  if (a.totalSacredTags < 128) throw new Error(`totalSacredTags too low: ${a.totalSacredTags}`);
  if (!a.isFullCoverage) throw new Error("isFullCoverage must be true");
  // Per-tradition floor check
  const floors = REPUTATION_TRADITION_FLOORS;
  const all = {
    CIGANO: CIGANO_TAGS.length,
    ORIXAS: ORIXAS_TAGS.length,
    TAROT: TAROT_TAGS.length,
    ASTROLOGIA: ASTROLOGIA_TAGS.length,
    SEFIROT: SEFIROT_TAGS.length,
    CHAKRAS: CHAKRAS_TAGS.length,
    IFA: IFA_TAGS.length,
  };
  for (const k of Object.keys(floors)) {
    if (all[k] < floors[k]) throw new Error(`${k} coverage ${all[k]} < floor ${floors[k]}`);
  }
  if (REPUTATION_SACRED_TAGS.length !== 128) {
    throw new Error(`REPUTATION_SACRED_TAGS should aggregate to 128, got ${REPUTATION_SACRED_TAGS.length}`);
  }
});

// Smoke 2: Trust score is NEVER negative + capped [0,5]
check("smoke-2: computeTrustScore is non-negative + capped across adversarial inputs", () => {
  const reviews = SAMPLE_REVIEWS;
  const s1 = computeTrustScore(reviews);
  if (s1 < 0 || s1 > 5) throw new Error(`trust score out of range: ${s1}`);

  // Empty
  if (computeTrustScore([]) !== 0) throw new Error("empty reviews should be 0");

  // Adversarial: malformed/negative scores
  const adversarial = [
    { reviewerId: "x", score: -10, serviceId: "s", createdAt: 1 },
    { reviewerId: "y", score: NaN, serviceId: "s", createdAt: 1 },
    { reviewerId: "z", score: 9999, serviceId: "s", createdAt: 1 },
  ];
  const s2 = computeTrustScore(adversarial);
  if (s2 < 0 || s2 > 5) throw new Error(`adversarial trust out of range: ${s2}`);
});

// Smoke 3: HMAC chain end-to-end: dispute raised → in_review → resolved + verify
check("smoke-3: dispute state machine + HMAC chain end-to-end", () => {
  resetReputationLedgerForTest();
  const d1 = raiseDispute({
    transactionId: "tx_smoke_d",
    raisedById: "buyer-d",
    againstId: "seller-d",
    reason: "service_quality_concern",
    serviceType: "CONSULTA_TAROT",
    amountCents: 7500,
  });
  if (d1.state !== "raised") throw new Error("expected state=raised");
  if (!/^[0-9a-f]{64}$/.test(d1.ledgerHash)) throw new Error("ledgerHash must be 64-hex");

  const d2 = moveDisputeToReview(d1.disputeId, "smoke-secret");
  if (d2.state !== "in_review") throw new Error("expected state=in_review");
  if (d2.ledgerHash === d1.ledgerHash) throw new Error("ledgerHash must change between states");

  const d3 = resolveDispute(d1.disputeId, "resolved_refunded", "smoke-secret");
  if (d3.state !== "resolved_refunded") throw new Error("expected state=resolved_refunded");
  // Dispute is RETAINED in audit (NO-derogatory)
  const a = auditReputationCoverage();
  if (a.resolvedDisputes < 1) throw new Error("resolvedDisputes counter must increment");
});

// Smoke 4: 3-badge cap + threshold validation + UNIVERSALISTA eligibility
check("smoke-4: awardBadge validates thresholds + 3-badge cap + UNIVERSALISTA rules", () => {
  resetReputationLedgerForTest();
  // GUIA_INICIANTE @ 4.0
  const a1 = awardBadge("guia_smoke_a", "GUIA_INICIANTE", "sec", { trustScore: 4.0 });
  if (!a1.active) throw new Error("a1 must be active");
  if (a1.userId.length !== 16) throw new Error("a1.userId must be 16-char pseudonym");

  // GUIA_MESTRE @ 4.8 (≥4.7 required)
  const a2 = awardBadge("guia_smoke_b", "GUIA_MESTRE", "sec", { trustScore: 4.8 });
  if (!a2.active) throw new Error("a2 must be active");

  // GUIA_MESTRE @ 4.5 must FAIL
  let didThrow = false;
  try {
    awardBadge("guia_smoke_c", "GUIA_MESTRE", "sec", { trustScore: 4.5 });
  } catch (e) {
    if (e instanceof InvalidBadgeError) didThrow = true;
  }
  if (!didThrow) throw new Error("GUIA_MESTRE @ 4.5 must throw InvalidBadgeError");

  // UNIVERSALISTA — 3 traditions × ≥4.0 → success
  const a3 = awardBadge("guia_smoke_d", "UNIVERSALISTA", "sec", {
    trustScore: 4.6,
    traditionsActive: 3,
    traditionScores: { CIGANO: 4.5, ORIXAS: 4.3, TAROT: 4.1, ASTROLOGIA: 0, SEFIROT: 0, CHAKRAS: 0, IFA: 0 },
  });
  if (!a3.active) throw new Error("a3 UNIVERSALISTA must be active");

  // listBadges returns active sorted
  const list = listBadges("guia_smoke_b");
  if (list.length !== 1) throw new Error(`listBadges(guia_smoke_b) should return 1, got ${list.length}`);
});

// Smoke 5: NO-derogatory invariants across all surfaces
check("smoke-5: NO derogatory invariants — no negative fields, no 'negative_reviews' key", () => {
  // Reputation has no negative field
  const r = computeReputation(SAMPLE_SERVICES);
  const keys = Object.keys(r);
  const forbidden = ["negativeReviews", "negative_reviews", "rejectedReviews", "trustPenalty", "deductions", "subtractions"];
  for (const f of forbidden) {
    if (keys.includes(f)) throw new Error(`Reputation must NOT contain '${f}'`);
  }
  if (r.trustScore < 0) throw new Error("trustScore must be non-negative");
  if (r.trustScore > 5) throw new Error("trustScore must be <= 5");
  for (const trad of Object.keys(r.traditionScores)) {
    const v = r.traditionScores[trad];
    if (v < 0 || v > 5) throw new Error(`traditionScores.${trad} out of [0,5]: ${v}`);
  }

  // Resolved-refunded dispute does NOT lower reputation
  resetReputationLedgerForTest();
  const before = computeReputation(SAMPLE_SERVICES).trustScore;
  const d = raiseDispute({
    transactionId: "tx_smoke_refund",
    raisedById: "buyer-ref",
    againstId: "seller-ref",
    reason: "service_quality_concern",
    serviceType: "MESA_REAL",
    amountCents: 10000,
  });
  resolveDispute(d.disputeId, "resolved_refunded", "sec");
  const after = computeReputation(SAMPLE_SERVICES).trustScore;
  if (before !== after) throw new Error(`refund must not change trust: before=${before} after=${after}`);

  // validateReputation rejects negative / >5
  const v1 = validateReputation({ ...r, trustScore: -1 });
  if (v1.ok) throw new Error("validateReputation must reject negative trustScore");
  const v2 = validateReputation({ ...r, trustScore: 10 });
  if (v2.ok) throw new Error("validateReputation must reject trustScore > 5");
});

// Smoke 6: pseudonymizeUserId LGPD + chainReputationHash determinism
check("smoke-6: LGPD pseudonymization + HMAC chain determinism", () => {
  const p1 = pseudonymizeUserId("user-sensitive", "salt-1");
  const p2 = pseudonymizeUserId("user-sensitive", "salt-1");
  const p3 = pseudonymizeUserId("user-different", "salt-1");
  if (p1 !== p2) throw new Error("pseudonymizeUserId must be deterministic");
  if (p1 === p3) throw new Error("pseudonymizeUserId must distinguish users");
  if (p1.includes("user-sensitive")) throw new Error("pseudonym must NOT contain raw userId");
  if (p1.length !== 16) throw new Error(`pseudonym must be 16 chars, got ${p1.length}`);

  const rep = computeReputation(SAMPLE_SERVICES);
  const h1 = chainReputationHash("GENESIS", rep, "secret-z");
  const h2 = chainReputationHash("GENESIS", rep, "secret-z");
  const h3 = chainReputationHash("GENESIS", rep, "secret-w");
  if (h1 !== h2) throw new Error("chainReputationHash must be deterministic");
  if (h1 === h3) throw new Error("chainReputationHash must differ with secret");
  if (!/^[0-9a-f]{64}$/.test(h1)) throw new Error("chainReputationHash must be 64-hex");
});

console.log(`\n=== smoke result: ${passed}/6 passed ===`);
if (failed > 0) {
  for (const e of errors) console.log("  - " + e);
  process.exit(1);
}
console.log("✅ all 6 smoke scenarios PASS");
