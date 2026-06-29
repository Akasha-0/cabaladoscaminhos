/**
 * Onboarding State Engine — Self-running test suite (W63)
 *
 * Run pattern: lightweight harness using built-in `assert` + a tiny runner.
 * No vitest/jest required — works in any Node ≥ 18 with `--experimental-strip-types`.
 *
 * Coverage:
 *   - Type definitions (structural)
 *   - startOnboarding happy path
 *   - applyTradition: happy + 6 invalid cases
 *   - applyIntent: happy + 2 invalid cases
 *   - applyProfileBasics: happy + 4 invalid cases
 *   - validateDisplayName: 9 boundary cases
 *   - validateBio: 6 boundary cases
 *   - validateIntentions: 7 cases (0..6)
 *   - advanceStep: legal + 2 illegal
 *   - completeOnboarding: requires all 4 prerequisites
 *   - resetOnboarding clears state
 *   - buildTraditionSuggestions sorting/dedup
 *   - mergeSuggestions dedup by userId
 *   - auditTraditionCoverage (≥ 9 unique, 36+ label-rows)
 *   - auditIntentCoverage (≥ 7)
 *   - auditStepSequence 0 gaps
 *   - summarizeOnboarding at each step
 *   - End-to-end: welcome → done
 *   - notifyOnSacredTradition returns 'review' for sacred 6
 *   - promptsByTradition returns ≥ 5 prompts for candomble
 */

import * as assert from "node:assert/strict";
import {
  // types
  type OnboardingStepId,
  type TraditionOption,
  type IntentOption,
  type ProfileBasicsDraft,
  type FollowSuggestion,
  type TraditionAnswer,
  type IntentAnswer,
  type OnboardingState,
  // constants
  ONBOARDING_STEPS,
  TRADITION_OPTIONS,
  INTENT_OPTIONS,
  STEP_ORDER,
  MAX_SECONDARY_TRADITIONS,
  MAX_ACCEPTED_FOLLOWS,
  MAX_INTENTIONS,
  MIN_DISPLAY_NAME,
  MAX_DISPLAY_NAME,
  MAX_BIO,
  SACRED_TRADITIONS,
  ENGINE_INFO,
  __ALL_EXPORTS,
  // validation
  validateDisplayName,
  validateBio,
  validateIntentions,
  validateProfileBasics,
  validateTraditionAnswer,
  validateIntentAnswer,
  // sanitization
  sanitizeDisplayName,
  sanitizeBio,
  sanitizeIntentions,
  // state machine
  startOnboarding,
  applyTradition,
  applyIntent,
  applyProfileBasics,
  applySuggestedFollows,
  advanceStep,
  completeOnboarding,
  resetOnboarding,
  // suggestions
  buildTraditionSuggestions,
  buildIntentSuggestions,
  buildMentorSuggestions,
  mergeSuggestions,
  // audit
  auditTraditionCoverage,
  auditIntentCoverage,
  auditStepSequence,
  summarizeOnboarding,
  // sacred
  notifyOnSacredTradition,
  promptsByTradition,
} from "../onboarding_state_engine.ts";

// ---------------------------------------------------------------------------
// Tiny test harness — counts pass/fail, no external deps.
// ---------------------------------------------------------------------------

interface TestEntry {
  readonly name: string;
  readonly fn: () => void | Promise<void>;
}

const tests: TestEntry[] = [];
const test = (name: string, fn: () => void | Promise<void>): void => {
  tests.push({ name, fn });
};
const skip = (_name: string): void => {
  /* intentionally empty */
};

const sampleFollows = (n: number): FollowSuggestion[] => {
  const out: FollowSuggestion[] = [];
  for (let i = 0; i < n; i += 1) {
    out.push({
      userId: `user_${i}`,
      displayName: `User ${i}`,
      reason: "tradition_match",
    });
  }
  return out;
};

const NOW = 1_700_000_000_000;

// ---------------------------------------------------------------------------
// Type definitions non-empty
// ---------------------------------------------------------------------------

test("Type definitions: ONBOARDING_STEPS has 7 steps in order", () => {
  assert.equal(ONBOARDING_STEPS.length, 7);
  assert.deepEqual([...ONBOARDING_STEPS], [
    "welcome",
    "tradition",
    "intent",
    "profile_basics",
    "suggested_follows",
    "review",
    "done",
  ]);
});

test("Type definitions: TRADITION_OPTIONS has ≥ 12 entries", () => {
  assert.ok(
    TRADITION_OPTIONS.length >= 12,
    `expected ≥12, got ${TRADITION_OPTIONS.length}`,
  );
});

test("Type definitions: INTENT_OPTIONS has ≥ 7 entries", () => {
  assert.ok(
    INTENT_OPTIONS.length >= 7,
    `expected ≥7, got ${INTENT_OPTIONS.length}`,
  );
});

test("Type definitions: STEP_ORDER maps every stepId to its index", () => {
  for (let i = 0; i < ONBOARDING_STEPS.length; i += 1) {
    const id = ONBOARDING_STEPS[i] as OnboardingStepId;
    assert.equal(STEP_ORDER[id], i);
  }
});

test("Type definitions: __ALL_EXPORTS has ≥ 22 entries", () => {
  assert.ok(
    __ALL_EXPORTS.length >= 22,
    `expected ≥22 exports, got ${__ALL_EXPORTS.length}`,
  );
});

test("Type definitions: ENGINE_INFO exposes engine metadata", () => {
  assert.equal(ENGINE_INFO.name, "onboarding-state-engine");
  assert.ok(ENGINE_INFO.traditionCount >= 12);
  assert.ok(ENGINE_INFO.intentCount >= 7);
  assert.ok(ENGINE_INFO.sacredTraditions.length >= 6);
});

// ---------------------------------------------------------------------------
// startOnboarding
// ---------------------------------------------------------------------------

test("startOnboarding returns welcome step with no answers", () => {
  const s = startOnboarding("user_1", NOW);
  assert.equal(s.userId, "user_1");
  assert.equal(s.currentStep, "welcome");
  assert.deepEqual([...s.stepsCompleted], []);
  assert.equal(s.tradition, undefined);
  assert.equal(s.intent, undefined);
  assert.equal(s.profileBasics, undefined);
  assert.deepEqual([...s.suggestedFollows], []);
  assert.deepEqual([...s.acceptedFollows], []);
  assert.equal(s.startedAt, NOW);
  assert.equal(s.lastVisitedAt, NOW);
  assert.equal(s.completedAt, undefined);
});

// ---------------------------------------------------------------------------
// applyTradition
// ---------------------------------------------------------------------------

test("applyTradition: happy path advances to intent", () => {
  const s0 = startOnboarding("u1", NOW);
  const ans: TraditionAnswer = {
    primary: "candomble",
    secondary: ["umbanda"],
    openness: "exploratory",
  };
  const t = applyTradition(s0, ans, NOW + 100);
  assert.equal(t.ok, true);
  assert.equal(t.errors.length, 0);
  assert.equal(t.nextState.currentStep, "intent");
  assert.equal(t.nextState.tradition?.primary, "candomble");
  assert.equal(t.nextState.tradition?.openness, "exploratory");
  assert.ok(t.nextState.stepsCompleted.includes("welcome"));
});

test("applyTradition: missing primary is invalid", () => {
  const s0 = startOnboarding("u1", NOW);
  const ans = {
    primary: "invalid_tradition" as unknown as TraditionOption,
    openness: "exploratory" as const,
  };
  const t = applyTradition(s0, ans as TraditionAnswer, NOW);
  assert.equal(t.ok, false);
  assert.ok(t.errors.length > 0);
});

test("applyTradition: secondary list too long is invalid", () => {
  const s0 = startOnboarding("u1", NOW);
  const ans: TraditionAnswer = {
    primary: "candomble",
    secondary: [
      "umbanda",
      "ifa",
      "cabala",
      "astrologia",
      "numerologia",
      "tantra",
    ],
    openness: "exploratory",
  };
  const t = applyTradition(s0, ans, NOW);
  assert.equal(t.ok, false);
  assert.ok(
    t.errors.some((e) => e.includes("cannot exceed")),
  );
});

test("applyTradition: openness=exclusive with ≥2 secondary rejected", () => {
  const s0 = startOnboarding("u1", NOW);
  const ans: TraditionAnswer = {
    primary: "candomble",
    secondary: ["umbanda", "ifa"],
    openness: "exclusive",
  };
  const t = applyTradition(s0, ans, NOW);
  // validateTraditionAnswer emits a warning (not error) for this case,
  // but applyTradition also enforces that exclusive cannot have any secondary.
  assert.equal(t.ok, false);
});

test("applyTradition: openness=exclusive with 0 secondary is OK", () => {
  const s0 = startOnboarding("u1", NOW);
  const ans: TraditionAnswer = {
    primary: "candomble",
    openness: "exclusive",
  };
  const t = applyTradition(s0, ans, NOW);
  assert.equal(t.ok, true);
  assert.equal(t.nextState.currentStep, "intent");
});

test("applyTradition: secondary contains invalid id is rejected", () => {
  const s0 = startOnboarding("u1", NOW);
  const ans = {
    primary: "candomble" as TraditionOption,
    secondary: ["not_a_tradition" as unknown as TraditionOption],
    openness: "exploratory" as const,
  };
  const t = applyTradition(s0, ans as TraditionAnswer, NOW);
  assert.equal(t.ok, false);
});

test("applyTradition: openness invalid value is rejected", () => {
  const s0 = startOnboarding("u1", NOW);
  const ans = {
    primary: "candomble" as TraditionOption,
    openness: "very_open" as unknown as "exploratory",
  };
  const t = applyTradition(s0, ans as TraditionAnswer, NOW);
  assert.equal(t.ok, false);
});

// ---------------------------------------------------------------------------
// applyIntent
// ---------------------------------------------------------------------------

test("applyIntent: happy path advances to profile_basics", () => {
  const s0 = startOnboarding("u1", NOW);
  const ans: IntentAnswer = {
    primary: "learn",
    secondary: ["practice"],
    weeklyMinutes: 60,
  };
  const t = applyIntent(s0, ans, NOW + 200);
  assert.equal(t.ok, true);
  assert.equal(t.nextState.currentStep, "profile_basics");
  assert.equal(t.nextState.intent?.primary, "learn");
  assert.equal(t.nextState.intent?.weeklyMinutes, 60);
});

test("applyIntent: primary not in INTENTS rejected", () => {
  const s0 = startOnboarding("u1", NOW);
  const ans = {
    primary: "play_games" as unknown as IntentOption,
  };
  const t = applyIntent(s0, ans as IntentAnswer, NOW);
  assert.equal(t.ok, false);
});

test("applyIntent: weeklyMinutes below MIN rejected", () => {
  const s0 = startOnboarding("u1", NOW);
  const ans: IntentAnswer = { primary: "learn", weeklyMinutes: 1 };
  const t = applyIntent(s0, ans, NOW);
  assert.equal(t.ok, false);
  assert.ok(t.errors.some((e) => e.includes("weeklyMinutes")));
});

test("applyIntent: weeklyMinutes above MAX rejected", () => {
  const s0 = startOnboarding("u1", NOW);
  const ans: IntentAnswer = { primary: "learn", weeklyMinutes: 9999 };
  const t = applyIntent(s0, ans, NOW);
  assert.equal(t.ok, false);
});

// ---------------------------------------------------------------------------
// applyProfileBasics
// ---------------------------------------------------------------------------

test("applyProfileBasics: happy path advances to suggested_follows", () => {
  const s0 = startOnboarding("u1", NOW);
  const draft: ProfileBasicsDraft = {
    displayName: "Maria Silva",
    bio: "Curiosa sobre axé e fundamentos",
    avatarSeed: "maria_seed_001",
    locale: "pt-BR",
    intentions: ["aprender", "praticar", "comunidade"],
  };
  const t = applyProfileBasics(s0, draft, NOW + 300);
  assert.equal(t.ok, true);
  assert.equal(t.nextState.currentStep, "suggested_follows");
  assert.equal(t.nextState.profileBasics?.displayName, "Maria Silva");
  assert.equal(t.nextState.profileBasics?.locale, "pt-BR");
});

test("applyProfileBasics: displayName too short rejected", () => {
  const s0 = startOnboarding("u1", NOW);
  const draft: ProfileBasicsDraft = {
    displayName: "a",
    bio: "ok",
    avatarSeed: "seed",
    locale: "en",
    intentions: [],
  };
  const t = applyProfileBasics(s0, draft, NOW);
  assert.equal(t.ok, false);
});

test("applyProfileBasics: bio too long rejected", () => {
  const s0 = startOnboarding("u1", NOW);
  const draft: ProfileBasicsDraft = {
    displayName: "Valid Name",
    bio: "x".repeat(MAX_BIO + 1),
    avatarSeed: "seed",
    locale: "es",
    intentions: [],
  };
  const t = applyProfileBasics(s0, draft, NOW);
  assert.equal(t.ok, false);
});

test("applyProfileBasics: intentions > MAX_INTENTIONS rejected", () => {
  const s0 = startOnboarding("u1", NOW);
  const tooMany = Array.from({ length: MAX_INTENTIONS + 1 }, (_, i) => `int${i}`);
  const draft: ProfileBasicsDraft = {
    displayName: "Valid Name",
    bio: "ok",
    avatarSeed: "seed",
    locale: "pt-BR",
    intentions: tooMany,
  };
  const t = applyProfileBasics(s0, draft, NOW);
  assert.equal(t.ok, false);
});

test("applyProfileBasics: invalid locale rejected", () => {
  const s0 = startOnboarding("u1", NOW);
  const draft = {
    displayName: "Valid Name",
    bio: "ok",
    avatarSeed: "seed",
    locale: "fr-FR",
    intentions: [],
  } as unknown as ProfileBasicsDraft;
  const t = applyProfileBasics(s0, draft, NOW);
  assert.equal(t.ok, false);
});

test("applyProfileBasics: empty avatarSeed rejected", () => {
  const s0 = startOnboarding("u1", NOW);
  const draft: ProfileBasicsDraft = {
    displayName: "Valid Name",
    bio: "ok",
    avatarSeed: "  ",
    locale: "pt-BR",
    intentions: [],
  };
  const t = applyProfileBasics(s0, draft, NOW);
  assert.equal(t.ok, false);
});

// ---------------------------------------------------------------------------
// validateDisplayName boundary cases
// ---------------------------------------------------------------------------

test("validateDisplayName: 2-char name OK", () => {
  const v = validateDisplayName("ab");
  assert.equal(v.valid, true);
});

test("validateDisplayName: 1-char name FAIL", () => {
  const v = validateDisplayName("a");
  assert.equal(v.valid, false);
});

test("validateDisplayName: 40-char name OK", () => {
  const v = validateDisplayName("a".repeat(40));
  assert.equal(v.valid, true);
});

test("validateDisplayName: 41-char name FAIL", () => {
  const v = validateDisplayName("a".repeat(41));
  assert.equal(v.valid, false);
});

test("validateDisplayName: with @ prefix FAIL", () => {
  const v = validateDisplayName("@user");
  assert.equal(v.valid, false);
  assert.ok(v.errors.some((e) => e.includes("@")));
});

test("validateDisplayName: with URL FAIL", () => {
  const v = validateDisplayName("user http://spam.com");
  assert.equal(v.valid, false);
});

test("validateDisplayName: with www. FAIL", () => {
  const v = validateDisplayName("user www.spam.com");
  assert.equal(v.valid, false);
});

test("validateDisplayName: with control chars FAIL", () => {
  const v = validateDisplayName("valid\u0000name");
  assert.equal(v.valid, false);
});

test("validateDisplayName: non-string FAIL", () => {
  const v = validateDisplayName(42);
  assert.equal(v.valid, false);
});

// ---------------------------------------------------------------------------
// validateBio boundary cases
// ---------------------------------------------------------------------------

test("validateBio: empty string OK", () => {
  const v = validateBio("");
  assert.equal(v.valid, true);
});

test("validateBio: 280 chars OK", () => {
  const v = validateBio("x".repeat(280));
  assert.equal(v.valid, true);
});

test("validateBio: 281 chars FAIL", () => {
  const v = validateBio("x".repeat(281));
  assert.equal(v.valid, false);
});

test("validateBio: with URL FAIL", () => {
  const v = validateBio("visit https://spam.com");
  assert.equal(v.valid, false);
});

test("validateBio: with control chars FAIL", () => {
  const v = validateBio("hello\u0001world");
  assert.equal(v.valid, false);
});

test("validateBio: non-string FAIL", () => {
  const v = validateBio(true);
  assert.equal(v.valid, false);
});

// ---------------------------------------------------------------------------
// validateIntentions
// ---------------------------------------------------------------------------

test("validateIntentions: 0 items OK", () => {
  const v = validateIntentions([]);
  assert.equal(v.valid, true);
});

test("validateIntentions: 5 items OK", () => {
  const v = validateIntentions(["one", "two", "three", "four", "five"]);
  assert.equal(v.valid, true);
});

test("validateIntentions: 6 items FAIL", () => {
  const v = validateIntentions([
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
  ]);
  assert.equal(v.valid, false);
});

test("validateIntentions: each 3-char min OK", () => {
  const v = validateIntentions(["abc"]);
  assert.equal(v.valid, true);
});

test("validateIntentions: each 2-char min FAIL", () => {
  const v = validateIntentions(["ab"]);
  assert.equal(v.valid, false);
});

test("validateIntentions: 61-char each FAIL", () => {
  const v = validateIntentions(["a".repeat(61)]);
  assert.equal(v.valid, false);
});

test("validateIntentions: non-array FAIL", () => {
  const v = validateIntentions("not an array");
  assert.equal(v.valid, false);
});

// ---------------------------------------------------------------------------
// advanceStep
// ---------------------------------------------------------------------------

test("advanceStep: legal advance from welcome to tradition", () => {
  const s0 = startOnboarding("u1", NOW);
  const t = advanceStep(s0, "tradition", NOW);
  assert.equal(t.ok, true);
  assert.equal(t.nextState.currentStep, "tradition");
});

test("advanceStep: skip-step rejected", () => {
  const s0 = startOnboarding("u1", NOW);
  const t = advanceStep(s0, "intent", NOW);
  assert.equal(t.ok, false);
  assert.ok(t.errors.length > 0);
});

test("advanceStep: out-of-order rejected", () => {
  const s0: OnboardingState = {
    ...startOnboarding("u1", NOW),
    currentStep: "intent",
  };
  const t = advanceStep(s0, "review", NOW);
  assert.equal(t.ok, false);
});

test("advanceStep: from terminal step rejected", () => {
  const s0: OnboardingState = {
    ...startOnboarding("u1", NOW),
    currentStep: "done",
  };
  const t = advanceStep(s0, "welcome", NOW);
  assert.equal(t.ok, false);
});

// ---------------------------------------------------------------------------
// completeOnboarding
// ---------------------------------------------------------------------------

test("completeOnboarding: requires all 4 prerequisites", () => {
  // Empty state — no tradition, intent, profile, follows
  const s0 = startOnboarding("u1", NOW);
  const t = completeOnboarding(s0, NOW);
  assert.equal(t.ok, false);
  // Should report 4 missing prerequisites
  assert.ok(t.errors.length >= 4);
});

test("completeOnboarding: success after full pipeline", () => {
  let s = startOnboarding("u1", NOW);
  s = applyTradition(s, { primary: "candomble", openness: "exploratory" }, NOW + 100).nextState;
  s = applyIntent(s, { primary: "learn", weeklyMinutes: 30 }, NOW + 200).nextState;
  s = applyProfileBasics(
    s,
    {
      displayName: "Maria",
      bio: "axé",
      avatarSeed: "seed1",
      locale: "pt-BR",
      intentions: ["aprender"],
    },
    NOW + 300,
  ).nextState;
  const follows = sampleFollows(3);
  s = applySuggestedFollows(s, follows, ["user_0"], NOW + 400).nextState;
  // advance to done
  const adv = advanceStep(s, "done", NOW + 500);
  assert.equal(adv.ok, true);
  const c = completeOnboarding(adv.nextState, NOW + 600);
  assert.equal(c.ok, true);
  assert.equal(c.nextState.currentStep, "done");
  assert.equal(c.nextState.completedAt, NOW + 600);
});

test("completeOnboarding: missing acceptedFollows fails", () => {
  let s = startOnboarding("u1", NOW);
  s = applyTradition(s, { primary: "candomble", openness: "exploratory" }, NOW).nextState;
  s = applyIntent(s, { primary: "learn" }, NOW).nextState;
  s = applyProfileBasics(
    s,
    {
      displayName: "Maria",
      bio: "",
      avatarSeed: "s",
      locale: "pt-BR",
      intentions: [],
    },
    NOW,
  ).nextState;
  s = applySuggestedFollows(s, sampleFollows(3), ["user_0"], NOW).nextState;
  // Pretend no follows accepted
  const cleared: OnboardingState = {
    ...s,
    acceptedFollows: [],
  };
  const adv = advanceStep(cleared, "done", NOW);
  assert.equal(adv.ok, true);
  const c = completeOnboarding(adv.nextState, NOW);
  assert.equal(c.ok, false);
  assert.ok(c.errors.some((e) => e.includes("follow")));
});

// ---------------------------------------------------------------------------
// resetOnboarding
// ---------------------------------------------------------------------------

test("resetOnboarding: clears stepsCompleted and currentStep=welcome", () => {
  let s = startOnboarding("u1", NOW);
  s = applyTradition(s, { primary: "candomble", openness: "exploratory" }, NOW + 100).nextState;
  s = applyIntent(s, { primary: "learn" }, NOW + 200).nextState;
  s = {
    ...s,
    acceptedFollows: ["user_a"],
  };
  const r = resetOnboarding(s, "user_logout");
  assert.equal(r.currentStep, "welcome");
  assert.deepEqual([...r.stepsCompleted], []);
  assert.equal(r.tradition, undefined);
  assert.equal(r.intent, undefined);
  assert.deepEqual([...r.acceptedFollows], []);
  assert.equal(r.userId, "u1"); // userId preserved
  assert.equal(r.startedAt, s.startedAt); // startedAt preserved
});

// ---------------------------------------------------------------------------
// Suggestions
// ---------------------------------------------------------------------------

test("buildTraditionSuggestions: returns top-N tradition_match", () => {
  const cands = sampleFollows(10);
  const out = buildTraditionSuggestions("candomble", cands, 5);
  assert.equal(out.length, 5);
  for (const s of out) {
    assert.equal(s.reason, "tradition_match");
  }
});

test("buildIntentSuggestions: returns top-N intent_match", () => {
  const cands = sampleFollows(8);
  const out = buildIntentSuggestions("learn", cands, 3);
  assert.equal(out.length, 3);
  for (const s of out) {
    assert.equal(s.reason, "intent_match");
  }
});

test("buildMentorSuggestions: returns top-N mentor_match", () => {
  const cands = sampleFollows(5);
  const out = buildMentorSuggestions("cabala", cands, 2);
  assert.equal(out.length, 2);
  for (const s of out) {
    assert.equal(s.reason, "mentor_match");
  }
});

test("mergeSuggestions: dedup by userId, prefer first list", () => {
  const a: FollowSuggestion[] = [
    { userId: "u1", displayName: "A1", reason: "tradition_match" },
    { userId: "u2", displayName: "A2", reason: "tradition_match" },
  ];
  const b: FollowSuggestion[] = [
    { userId: "u2", displayName: "B2", reason: "intent_match" },
    { userId: "u3", displayName: "B3", reason: "intent_match" },
  ];
  const out = mergeSuggestions(a, b);
  assert.equal(out.length, 3);
  assert.equal(out[0]?.userId, "u1");
  assert.equal(out[1]?.userId, "u2");
  // First occurrence wins
  assert.equal(out[1]?.reason, "tradition_match");
  assert.equal(out[2]?.userId, "u3");
});

test("mergeSuggestions: empty lists → empty result", () => {
  const out = mergeSuggestions([], []);
  assert.equal(out.length, 0);
});

// ---------------------------------------------------------------------------
// Audit / coverage
// ---------------------------------------------------------------------------

test("auditTraditionCoverage: ≥ 9 unique traditions and ≥ 36 label-rows", () => {
  const cov = auditTraditionCoverage();
  assert.ok(cov.uniqueIds >= 9, `uniqueIds=${cov.uniqueIds}`);
  assert.ok(cov.total >= 36, `total=${cov.total}`);
  assert.ok(cov.byLanguage["pt-BR"] >= 12);
  assert.ok(cov.byLanguage.en >= 12);
  assert.ok(cov.byLanguage.es >= 12);
});

test("auditIntentCoverage: ≥ 7 with descriptions", () => {
  const cov = auditIntentCoverage();
  assert.ok(cov.total >= 7);
  assert.equal(cov.withDescription, cov.total);
});

test("auditStepSequence: 0 gaps", () => {
  const a = auditStepSequence();
  assert.equal(a.gaps.length, 0);
  assert.deepEqual([...a.steps], [...ONBOARDING_STEPS]);
});

// ---------------------------------------------------------------------------
// summarizeOnboarding
// ---------------------------------------------------------------------------

test("summarizeOnboarding: at welcome shows progressPct=0", () => {
  const s = startOnboarding("u1", NOW);
  const sum = summarizeOnboarding(s);
  assert.equal(sum.step, "welcome");
  assert.equal(sum.progressPct, 0);
  assert.equal(sum.hasTradition, false);
  assert.equal(sum.hasIntent, false);
  assert.equal(sum.hasProfile, false);
  assert.equal(sum.hasFollows, false);
  assert.equal(sum.isComplete, false);
});

test("summarizeOnboarding: after tradition → hasTradition=true", () => {
  let s = startOnboarding("u1", NOW);
  s = applyTradition(s, { primary: "candomble", openness: "exploratory" }, NOW).nextState;
  const sum = summarizeOnboarding(s);
  assert.equal(sum.step, "intent");
  assert.equal(sum.hasTradition, true);
  assert.equal(sum.hasIntent, false);
  assert.ok(sum.progressPct > 0);
});

test("summarizeOnboarding: after all steps → isComplete=true", () => {
  let s = startOnboarding("u1", NOW);
  s = applyTradition(s, { primary: "candomble", openness: "exploratory" }, NOW).nextState;
  s = applyIntent(s, { primary: "learn" }, NOW).nextState;
  s = applyProfileBasics(
    s,
    {
      displayName: "Maria",
      bio: "",
      avatarSeed: "s",
      locale: "pt-BR",
      intentions: [],
    },
    NOW,
  ).nextState;
  s = applySuggestedFollows(s, sampleFollows(3), ["user_0"], NOW).nextState;
  s = advanceStep(s, "done", NOW).nextState;
  s = completeOnboarding(s, NOW).nextState;
  const sum = summarizeOnboarding(s);
  assert.equal(sum.isComplete, true);
  assert.equal(sum.step, "done");
  assert.equal(sum.progressPct, 100);
});

// ---------------------------------------------------------------------------
// End-to-end full pipeline
// ---------------------------------------------------------------------------

test("End-to-end: welcome → tradition → intent → profile → follows → done", () => {
  let s = startOnboarding("user_e2e", NOW);
  assert.equal(s.currentStep, "welcome");

  s = applyTradition(
    s,
    {
      primary: "cabala",
      secondary: ["astrologia"],
      openness: "exploratory",
    },
    NOW + 1500,
  ).nextState;
  assert.equal(s.currentStep, "intent");

  s = applyIntent(
    s,
    { primary: "learn", secondary: ["practice"], weeklyMinutes: 120 },
    NOW + 3000,
  ).nextState;
  assert.equal(s.currentStep, "profile_basics");

  s = applyProfileBasics(
    s,
    {
      displayName: "Ezra",
      bio: "Estudante de Cabala e Astrologia",
      avatarSeed: "ezra_001",
      locale: "pt-BR",
      intentions: ["estudar", "meditar", "compartilhar"],
    },
    NOW + 4500,
  ).nextState;
  assert.equal(s.currentStep, "suggested_follows");

  const follows = sampleFollows(5);
  s = applySuggestedFollows(s, follows, ["user_0", "user_1"], NOW + 6000).nextState;
  assert.equal(s.currentStep, "review");
  assert.equal(s.acceptedFollows.length, 2);

  s = advanceStep(s, "done", NOW + 7500).nextState;
  assert.equal(s.currentStep, "done");

  s = completeOnboarding(s, NOW + 9000).nextState;
  assert.equal(s.completedAt, NOW + 9000);
  assert.equal(s.tradition?.primary, "cabala");
  assert.equal(s.intent?.primary, "learn");
  assert.equal(s.profileBasics?.displayName, "Ezra");
});

// ---------------------------------------------------------------------------
// Sacred cross-cut
// ---------------------------------------------------------------------------

test("notifyOnSacredTradition: returns 'review' for candomble", () => {
  assert.equal(notifyOnSacredTradition("candomble"), "review");
});

test("notifyOnSacredTradition: returns 'review' for umbanda", () => {
  assert.equal(notifyOnSacredTradition("umbanda"), "review");
});

test("notifyOnSacredTradition: returns 'review' for ifa", () => {
  assert.equal(notifyOnSacredTradition("ifa"), "review");
});

test("notifyOnSacredTradition: returns 'review' for cabala", () => {
  assert.equal(notifyOnSacredTradition("cabala"), "review");
});

test("notifyOnSacredTradition: returns 'review' for astrologia", () => {
  assert.equal(notifyOnSacredTradition("astrologia"), "review");
});

test("notifyOnSacredTradition: returns 'review' for numerologia", () => {
  assert.equal(notifyOnSacredTradition("numerologia"), "review");
});

test("notifyOnSacredTradition: returns 'done' for non-sacred (yoga)", () => {
  assert.equal(notifyOnSacredTradition("yoga"), "done");
});

test("SACRED_TRADITIONS: contains all 7 sacred traditions", () => {
  const expected: readonly TraditionOption[] = [
    "candomble",
    "umbanda",
    "ifa",
    "cabala",
    "astrologia",
    "numerologia",
    "tantra",
  ];
  for (const t of expected) {
    assert.ok(SACRED_TRADITIONS.has(t), `missing sacred tradition ${t}`);
  }
});

test("promptsByTradition: returns ≥ 5 prompts for candomble", () => {
  const ps = promptsByTradition("candomble");
  assert.ok(ps.length >= 5, `got ${ps.length} prompts`);
});

test("promptsByTradition: returns ≥ 5 prompts for cabala", () => {
  const ps = promptsByTradition("cabala");
  assert.ok(ps.length >= 5);
});

test("promptsByTradition: returns ≥ 5 prompts for astrologia", () => {
  const ps = promptsByTradition("astrologia");
  assert.ok(ps.length >= 5);
});

test("promptsByTradition: returns ≥ 5 prompts for numerologia", () => {
  const ps = promptsByTradition("numerologia");
  assert.ok(ps.length >= 5);
});

test("promptsByTradition: returns ≥ 5 prompts for umbanda", () => {
  const ps = promptsByTradition("umbanda");
  assert.ok(ps.length >= 5);
});

test("promptsByTradition: returns ≥ 5 prompts for ifa", () => {
  const ps = promptsByTradition("ifa");
  assert.ok(ps.length >= 5);
});

test("promptsByTradition: returns ≥ 5 prompts for tantra", () => {
  const ps = promptsByTradition("tantra");
  assert.ok(ps.length >= 5);
});

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

test("sanitizeDisplayName: trims, collapses whitespace", () => {
  const out = sanitizeDisplayName("  hello   world  ");
  assert.equal(out, "hello world");
});

test("sanitizeDisplayName: drops invalid chars", () => {
  const out = sanitizeDisplayName("hello<world>{}");
  assert.equal(out, "helloworld");
});

test("sanitizeBio: strips control chars", () => {
  const out = sanitizeBio("hello\u0001\u0002world");
  assert.equal(out, "helloworld");
});

test("sanitizeIntentions: trims, drops empty, caps at MAX_INTENTIONS", () => {
  const out = sanitizeIntentions([
    "  one  ",
    "",
    "two",
    "   ",
    "three",
    "four",
    "five",
    "six",
    "seven",
  ]);
  assert.equal(out.length, 5);
  assert.equal(out[0], "one");
  assert.equal(out[1], "two");
});

// ---------------------------------------------------------------------------
// applySuggestedFollows edge cases
// ---------------------------------------------------------------------------

test("applySuggestedFollows: 0 accepted with 0 suggestions OK", () => {
  const s0 = startOnboarding("u1", NOW);
  const t = applySuggestedFollows(s0, [], [], NOW);
  assert.equal(t.ok, true);
  assert.equal(t.nextState.acceptedFollows.length, 0);
});

test("applySuggestedFollows: 0 accepted with >0 suggestions FAIL", () => {
  const s0 = startOnboarding("u1", NOW);
  const t = applySuggestedFollows(s0, sampleFollows(3), [], NOW);
  assert.equal(t.ok, false);
});

test("applySuggestedFollows: >MAX_ACCEPTED_FOLLOWS FAIL", () => {
  const s0 = startOnboarding("u1", NOW);
  const follows = sampleFollows(15);
  const tooMany = follows.slice(0, MAX_ACCEPTED_FOLLOWS + 1).map((f) => f.userId);
  const t = applySuggestedFollows(s0, follows, tooMany, NOW);
  assert.equal(t.ok, false);
});

test("applySuggestedFollows: accepted userId not in suggestions FAIL", () => {
  const s0 = startOnboarding("u1", NOW);
  const follows = sampleFollows(3);
  const t = applySuggestedFollows(s0, follows, ["ghost_user"], NOW);
  assert.equal(t.ok, false);
});

// ---------------------------------------------------------------------------
// validateProfileBasics composite
// ---------------------------------------------------------------------------

test("validateProfileBasics: valid draft → no errors", () => {
  const v = validateProfileBasics({
    displayName: "Valid Name",
    bio: "ok",
    avatarSeed: "seed1",
    locale: "pt-BR",
    intentions: ["learn"],
  });
  assert.equal(v.valid, true);
});

test("validateProfileBasics: invalid draft → errors", () => {
  const v = validateProfileBasics({
    displayName: "a",
    bio: "x".repeat(MAX_BIO + 1),
    avatarSeed: "",
    locale: "ja",
    intentions: Array.from({ length: 6 }, (_, i) => `i${i}`),
  });
  assert.equal(v.valid, false);
  assert.ok(v.errors.length >= 4);
});

test("validateProfileBasics: empty bio emits warning but still valid", () => {
  const v = validateProfileBasics({
    displayName: "Valid Name",
    bio: "",
    avatarSeed: "seed",
    locale: "pt-BR",
    intentions: [],
  });
  assert.equal(v.valid, true);
  assert.ok(v.warnings.length > 0);
});

// ---------------------------------------------------------------------------
// validateTraditionAnswer / validateIntentAnswer
// ---------------------------------------------------------------------------

test("validateTraditionAnswer: warning for exclusive + ≥2 secondary", () => {
  const v = validateTraditionAnswer({
    primary: "candomble",
    secondary: ["umbanda", "ifa"],
    openness: "exclusive",
  });
  assert.equal(v.valid, true);
  assert.ok(v.warnings.length > 0);
});

test("validateIntentAnswer: weeklyMinutes at MIN boundary OK", () => {
  const v = validateIntentAnswer({ primary: "learn", weeklyMinutes: 5 });
  assert.equal(v.valid, true);
});

test("validateIntentAnswer: weeklyMinutes at MAX boundary OK", () => {
  const v = validateIntentAnswer({ primary: "learn", weeklyMinutes: 600 });
  assert.equal(v.valid, true);
});

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

const main = async (): Promise<void> => {
  let passed = 0;
  let failed = 0;
  const failures: { name: string; err: unknown }[] = [];
  for (const t of tests) {
    try {
      await t.fn();
      passed += 1;
    } catch (err) {
      failed += 1;
      failures.push({ name: t.name, err });
    }
  }
  // eslint-disable-next-line no-console
  console.log(`\n=== Onboarding State Engine — Test Results ===`);
  // eslint-disable-next-line no-console
  console.log(`Passed: ${passed}`);
  // eslint-disable-next-line no-console
  console.log(`Failed: ${failed}`);
  // eslint-disable-next-line no-console
  console.log(`Total:  ${passed + failed}`);
  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`\nFailures:`);
    for (const f of failures) {
      // eslint-disable-next-line no-console
      console.log(`  - ${f.name}: ${(f.err as Error).message ?? String(f.err)}`);
    }
    process.exit(1);
  }
};

void skip;

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});