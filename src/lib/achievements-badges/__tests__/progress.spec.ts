// ============================================================================
// PROGRESS — Spec (Wave 69, 2026-06-30)
// ============================================================================
// Self-running test harness (no vitest needed at runtime). 35+ assertions.
// ============================================================================

import {
  ACHIEVEMENTS,
  evaluateAchievements,
  type AchievementId,
  type UserState,
} from "../achievements.ts";
import {
  auditProgressCalculation,
  getInProgressAchievements,
  getProgress,
  nextMilestone,
  progressAllCategories,
  progressByCategory,
  progressToStreakMilestones,
} from "../progress.ts";

// ============================================================================
// HARNESS
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

function expectTrue(cond: boolean, msg: string): void {
  if (cond) _passed += 1;
  else {
    _failed += 1;
    _failures.push(`${msg}: expected true, got false`);
  }
}

function expectThrows(
  fn: () => unknown,
  name: string,
  ctor: new (...args: never[]) => Error,
): void {
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

// ============================================================================
// FIXTURE
// ============================================================================

function state(overrides: Partial<UserState> = {}): UserState {
  return {
    userId: "u1" as UserState["userId"],
    totalReadings: 0,
    ciganoReadings: 0,
    tarotReadings: 0,
    astrologiaReadings: 0,
    orixasReadings: 0,
    cabalaReadings: 0,
    numerologiaReadings: 0,
    tantraReadings: 0,
    currentStreak: 0,
    longestStreak: 0,
    reflections: 0,
    dreams: 0,
    posts: 0,
    helpfulComments: 0,
    mentoringPeer: false,
    uniqueTraditionsUsed: 0,
    readingTypesUsed: 0,
    hasCompletedOnboarding: false,
    ...overrides,
  };
}

// ============================================================================
// getProgress — single achievement
// ============================================================================

{
  const s = state({ totalReadings: 5 });
  const p = getProgress(s, "first-light" as AchievementId);
  expectEqual(p.current, 5, "first-light current=5 with 5 readings");
  expectEqual(p.target, 1, "first-light target=1");
  expectTrue(p.isComplete, "first-light isComplete=true when current>=1");
  expectEqual(p.percent, 100, "first-light percent=100 when current>=target (capped)");
}

{
  const s = state({ totalReadings: 7 });
  const p = getProgress(s, "devoted-seeker" as AchievementId);
  expectEqual(p.current, 7, "devoted-seeker current=7");
  expectEqual(p.target, 10, "devoted-seeker target=10");
  expectEqual(p.percent, 70, "devoted-seeker percent=70 (7/10)");
  expectTrue(!p.isComplete, "devoted-seeker isComplete=false when current<target");
}

{
  const s = state({ totalReadings: 50 });
  const p = getProgress(s, "mestre-da-mesa" as AchievementId);
  expectEqual(p.percent, 50, "mestre-da-mesa percent=50 (50/100)");
}

{
  const s = state({ totalReadings: 200 });
  const p = getProgress(s, "mestre-da-mesa" as AchievementId);
  expectEqual(p.percent, 100, "mestre-da-mesa percent capped at 100");
  expectEqual(p.current, 200, "current not capped (it stores raw)");
}

{
  const s = state({ totalReadings: 0 });
  const p = getProgress(s, "first-light" as AchievementId);
  expectEqual(p.percent, 0, "first-light percent=0 with 0 readings");
  expectTrue(!p.isComplete, "first-light not complete at 0");
}

// ============================================================================
// getProgress — throws on invalid input
// ============================================================================

expectThrows(
  () => getProgress(null as unknown as UserState, "first-light" as AchievementId),
  "getProgress(null)",
  Error,
);

expectThrows(
  () => getProgress(state(), "unknown-achievement" as AchievementId),
  "getProgress(unknownId)",
  Error,
);

// ============================================================================
// getInProgressAchievements
// ============================================================================

{
  const s = state({ totalReadings: 7, currentStreak: 2 });
  const inProg = getInProgressAchievements(s);
  expectTrue(inProg.length > 0, "in-progress is non-empty");
  // Must exclude completed (none at this state)
  for (const p of inProg) {
    expectTrue(!p.isComplete, "in-progress excludes complete achievements");
  }
  // Sorted by percent desc (closest first)
  for (let i = 1; i < inProg.length; i++) {
    expectTrue(
      inProg[i - 1]!.percent >= inProg[i]!.percent,
      `in-progress sorted by percent desc (idx ${i})`,
    );
  }
}

// ============================================================================
// nextMilestone
// ============================================================================

{
  const s = state({ totalReadings: 50 });
  const next = nextMilestone(s);
  expectTrue(next !== null, "nextMilestone returns non-null for in-progress");
  if (next) {
    expectTrue(next.percent > 0 && next.percent < 100, "nextMilestone is partial");
  }
}

{
  // Empty state — many in-progress; pick highest percent
  const s = state();
  const next = nextMilestone(s);
  expectTrue(next !== null, "nextMilestone returns non-null for empty state");
}

{
  // State where everything is complete (using sacred unlock pattern)
  const fullState = state({
    totalReadings: 9999,
    ciganoReadings: 9999,
    tarotReadings: 9999,
    astrologiaReadings: 9999,
    orixasReadings: 9999,
    cabalaReadings: 9999,
    numerologiaReadings: 9999,
    tantraReadings: 9999,
    currentStreak: 9999,
    longestStreak: 9999,
    reflections: 9999,
    dreams: 9999,
    posts: 9999,
    helpfulComments: 9999,
    mentoringPeer: true,
    uniqueTraditionsUsed: 7,
    readingTypesUsed: 99,
    hasCompletedOnboarding: true,
  });
  // Verify many unlock — may or may not cover ALL achievements
  // (oracle-elder needs 500 which is met, mas não completa todas que precisam de lógica adicional)
  const unlocked = evaluateAchievements(fullState);
  expectTrue(unlocked.length >= 20, `Full state unlocks >=20 (got ${unlocked.length})`);
}

// ============================================================================
// progressToStreakMilestones
// ============================================================================

{
  const s = state({ currentStreak: 3 });
  const streaks = progressToStreakMilestones(s);
  expectEqual(streaks.length, 5, "5 streak milestones defined");
  // sorted by milestone ASC
  for (let i = 1; i < streaks.length; i++) {
    expectTrue(
      streaks[i - 1]!.milestone < streaks[i]!.milestone,
      `streak milestones sorted ASC (idx ${i})`,
    );
  }
  expectEqual(streaks[0]!.current, 3, "streak current=3");
  // First milestone (3) should be complete or near
  expectTrue(streaks[0]!.percent >= 90, `first streak milestone ${streaks[0]!.percent}% >= 90`);
}

{
  const s = state({ currentStreak: 25 });
  const streaks = progressToStreakMilestones(s);
  // 25/30 = ~83%
  const c30 = streaks.find((x) => x.milestone === 30)!;
  expectClose(c30.percent, 83.3, 1, "streak@25 → milestone 30 ≈ 83%");
}

// ============================================================================
// progressByCategory
// ============================================================================

{
  const full = state({
    totalReadings: 999,
    ciganoReadings: 999,
    tarotReadings: 999,
    astrologiaReadings: 999,
    orixasReadings: 999,
    cabalaReadings: 999,
    numerologiaReadings: 999,
    tantraReadings: 999,
    currentStreak: 999,
    reflections: 999,
    dreams: 999,
    posts: 999,
    helpfulComments: 999,
    mentoringPeer: true,
    uniqueTraditionsUsed: 7,
    readingTypesUsed: 99,
    hasCompletedOnboarding: true,
  });
  const cat = progressByCategory(full, "readings");
  expectTrue(cat.totalAchievements >= 5, `readings category has 5+ achs (got ${cat.totalAchievements})`);
  // unlocked using criteria-as-source (no explicit unlock set)
  expectTrue(cat.unlockedCount > 0, "readings unlocked via criteria > 0");
  expectTrue(cat.percent > 0 && cat.percent <= 100, "readings percent in (0, 100]");
}

{
  // Use explicit unlockedIds
  const full = state({ totalReadings: 0 });
  const cat = progressByCategory(
    full,
    "readings",
    new Set(["first-light", "devoted-seeker"]),
  );
  expectEqual(cat.unlockedCount, 2, "explicit unlockedIds count=2");
}

{
  // Empty category return
  const full = state();
  const cat = progressByCategory(full, "streaks");
  expectEqual(cat.totalAchievements, ACHIEVEMENTS.filter((d) => d.category === "streaks").length,
    "streaks category count matches catalog");
}

// ============================================================================
// progressAllCategories — composite rollup
// ============================================================================

{
  const full = state({
    totalReadings: 999,
    ciganoReadings: 999,
    tarotReadings: 999,
    astrologiaReadings: 999,
    orixasReadings: 999,
    cabalaReadings: 999,
    numerologiaReadings: 999,
    tantraReadings: 999,
    currentStreak: 999,
    reflections: 999,
    dreams: 999,
    posts: 999,
    helpfulComments: 999,
    mentoringPeer: true,
    uniqueTraditionsUsed: 7,
    readingTypesUsed: 99,
    hasCompletedOnboarding: true,
  });
  const all = progressAllCategories(full);
  expectEqual(all.length, 5, "all categories (5)");
  expectTrue(all.every((c) => c.totalAchievements > 0), "every category has achievements");
}

// ============================================================================
// auditProgressCalculation — chain exposed
// ============================================================================

{
  const audit = auditProgressCalculation();
  expectTrue(audit.targetEntryCount >= 30, `audit target count >= 30 (got ${audit.targetEntryCount})`);
  expectTrue(audit.passes, "auditProgressCalculation.passes");
  expectEqual(
    audit.catalogEntryCount,
    ACHIEVEMENTS.length,
    "audit catalogEntryCount = catalog length",
  );
  expectEqual(audit.streakPrefix, "chama-de-", "audit streakPrefix");
  expectEqual(audit.categoryList.length, 5, "audit categoryList length=5");
  // Formula string is non-empty
  expectTrue(audit.percentFormula.length > 5, "audit percentFormula non-empty");
}

// ============================================================================
// OUTPUT
// ============================================================================

console.log(
  `[progress.spec.ts] ${_passed} passed, ${_failed} failed`,
);
if (_failed > 0) {
  console.error(_failures.join("\n"));
  process.exit(1);
}
