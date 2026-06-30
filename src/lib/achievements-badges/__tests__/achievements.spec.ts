// ============================================================================
// ACHIEVEMENTS — Spec (Wave 69, 2026-06-30)
// ============================================================================
// Self-running test harness (no vitest needed at runtime). 40+ assertions.
// ============================================================================

import {
  ACHIEVEMENTS,
  auditCatalog,
  evaluateAchievements,
  evaluateAchievement,
  getAchievement,
  listByCategory,
  listByTradition,
  listUnlocked,
  recordUnlocked,
  resetUnlockedStore,
  setUnlockedStore,
  type AchievementDefinition,
  type AchievementId,
  type UserId,
  type UserState,
} from "../achievements.ts";

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

function expectTrue(cond: boolean, msg: string): void {
  if (cond) _passed += 1;
  else {
    _failed += 1;
    _failures.push(`${msg}: expected true, got false`);
  }
}

function expectFalse(cond: boolean, msg: string): void {
  if (!cond) _passed += 1;
  else {
    _failed += 1;
    _failures.push(`${msg}: expected false, got true`);
  }
}

// ============================================================================
// FIXTURE — Default empty userState (factory for variants)
// ============================================================================

function emptyState(overrides: Partial<UserState> = {}): UserState {
  return {
    userId: "user-spec-1" as UserId,
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
// CATALOG SHAPE
// ============================================================================

expectTrue(ACHIEVEMENTS.length >= 30, "Catalog has 30+ entries");

const ids = new Set<string>();
ACHIEVEMENTS.forEach((d) => ids.add(d.id as string));
expectEqual(
  ids.size,
  ACHIEVEMENTS.length,
  "All achievement ids are unique",
);

const categories = new Set(
  ACHIEVEMENTS.map((d) => d.category),
);
expectTrue(categories.has("readings"), "Category 'readings' present");
expectTrue(categories.has("streaks"), "Category 'streaks' present");
expectTrue(categories.has("reflection"), "Category 'reflection' present");
expectTrue(categories.has("community"), "Category 'community' present");
expectTrue(categories.has("exploration"), "Category 'exploration' present");

ACHIEVEMENTS.forEach((d, idx) => {
  expectTrue(typeof d.id === "string" && (d.id as string).length > 0,
    `Entry ${idx}: id is non-empty`);
  expectTrue(typeof d.title["pt-BR"] === "string" && d.title["pt-BR"].length > 0,
    `Entry ${idx}: title[pt-BR] non-empty`);
  expectTrue(typeof d.title["en-US"] === "string" && d.title["en-US"].length > 0,
    `Entry ${idx}: title[en-US] non-empty (i18n)`);
  expectTrue(typeof d.title["es-ES"] === "string" && d.title["es-ES"].length > 0,
    `Entry ${idx}: title[es-ES] non-empty (i18n)`);
  expectTrue(typeof d.title["fr-FR"] === "string" && d.title["fr-FR"].length > 0,
    `Entry ${idx}: title[fr-FR] non-empty (i18n)`);
  expectTrue(typeof d.description["pt-BR"] === "string" && d.description["pt-BR"].length > 0,
    `Entry ${idx}: description[pt-BR] non-empty`);
  expectTrue(typeof d.criteria === "function", `Entry ${idx}: criteria is function`);
  expectTrue(typeof d.badge.iconName === "string", `Entry ${idx}: badge.iconName set`);
  expectTrue(["bronze", "silver", "gold", "mythic"].includes(d.badge.tier),
    `Entry ${idx}: badge.tier is valid`);
  expectTrue(typeof d.badge.color === "string" && d.badge.color.startsWith("#"),
    `Entry ${idx}: badge.color is hex`);
  expectTrue(typeof d.badge.glowEffect === "boolean",
    `Entry ${idx}: badge.glowEffect is boolean`);
  expectTrue(typeof d.order === "number" && d.order > 0,
    `Entry ${idx}: order is positive number`);
});

// ============================================================================
// SACRED COVERAGE — ≥50% with sacredRef
// ============================================================================

const withRef = ACHIEVEMENTS.filter((d) => d.sacredRef).length;
const coveragePct = Math.round((withRef / ACHIEVEMENTS.length) * 100);
expectTrue(
  coveragePct >= 50,
  `Sacred coverage ${coveragePct}% >= 50% (got ${withRef}/${ACHIEVEMENTS.length})`,
);

// ============================================================================
// PURITY — Criteria functions are deterministic on same input
// ============================================================================

const sample = emptyState({ totalReadings: 10 });
ACHIEVEMENTS.forEach((d) => {
  const r1 = d.criteria(sample);
  const r2 = d.criteria(sample);
  const r3 = d.criteria(sample);
  expectTrue(r1 === r2 && r2 === r3,
    `Criteria for ${d.id} is pure across 3 calls`);
});

// ============================================================================
// EVALUATE — Single achievement checks
// ============================================================================

const stateEmpty = emptyState();
const stateFirstReading = emptyState({ totalReadings: 1 });
const stateDevoted = emptyState({ totalReadings: 10 });
const stateMestre = emptyState({ totalReadings: 100 });
const stateCigano = emptyState({ ciganoReadings: 10 });
const stateStreak7 = emptyState({ currentStreak: 7 });

expectTrue(
  !evaluateAchievement(stateEmpty, "first-light" as AchievementId),
  "Empty state does not unlock 'first-light'",
);
expectTrue(
  evaluateAchievement(stateFirstReading, "first-light" as AchievementId),
  "1 reading unlocks 'first-light'",
);
expectTrue(
  evaluateAchievement(stateDevoted, "devoted-seeker" as AchievementId),
  "10 readings unlocks 'devoted-seeker'",
);
expectTrue(
  evaluateAchievement(stateMestre, "mestre-da-mesa" as AchievementId),
  "100 readings unlocks 'mestre-da-mesa'",
);
expectTrue(
  evaluateAchievement(stateCigano, "cigano-sincero" as AchievementId),
  "10 cigano readings unlocks 'cigano-sincero'",
);
expectTrue(
  evaluateAchievement(stateStreak7, "chama-de-7-dias" as AchievementId),
  "streak of 7 unlocks 'chama-de-7-dias'",
);
expectTrue(
  !evaluateAchievement(stateStreak7, "chama-de-30-dias" as AchievementId),
  "streak of 7 does NOT unlock 'chama-de-30-dias'",
);

// Unknown id → false (anti-dark-pattern: no throw)
expectFalse(
  evaluateAchievement(stateEmpty, "unknown-achievement" as AchievementId),
  "Unknown id returns false (no throw)",
);

// ============================================================================
// EVALUATE-ALL — Aggregate
// ============================================================================

const unlockedEmpty = evaluateAchievements(stateEmpty);
expectEqual(unlockedEmpty.length, 0, "Empty state → 0 unlocked");

const unlockedFirstReading = evaluateAchievements(stateFirstReading);
expectTrue(
  unlockedFirstReading.includes("first-light" as AchievementId),
  "Total=1 unlocks 'first-light'",
);
expectEqual(
  unlockedFirstReading.length,
  1,
  "1 reading unlocks exactly 1 achievement",
);

const unlockedFull = evaluateAchievements(
  emptyState({
    totalReadings: 100,
    ciganoReadings: 50,
    tarotReadings: 50,
    astrologiaReadings: 50,
    orixasReadings: 50,
    cabalaReadings: 50,
    numerologiaReadings: 50,
    tantraReadings: 50,
    currentStreak: 30,
    reflections: 100,
    dreams: 10,
    posts: 100,
    helpfulComments: 10,
    mentoringPeer: true,
    uniqueTraditionsUsed: 7,
    readingTypesUsed: 6,
    hasCompletedOnboarding: true,
  }),
);
expectTrue(
  unlockedFull.length >= 15,
  "Full state unlocks many achievements",
);

// Null/invalid state → no crash
expectEqual(
  evaluateAchievements(null as unknown as UserState),
  [],
  "Null state returns [] (no crash)",
);

// ============================================================================
// LIST-UNLOCKED — Persistence + sort
// ============================================================================

await (async () => {
  resetUnlockedStore();
  const r1 = await recordUnlocked(
    emptyState({ totalReadings: 1 }),
    "2026-06-30T01:00:00.000Z",
  );
  expectTrue(r1.includes("first-light" as AchievementId), "recordUnlocked returns 'first-light'");

  const r2 = await recordUnlocked(
    emptyState({ totalReadings: 100, ciganoReadings: 50, currentStreak: 30 }),
    "2026-06-30T02:00:00.000Z",
  );
  expectTrue(r2.length >= 5, "recordUnlocked returns multiple ids");

  const list = await listUnlocked("user-spec-1" as UserId);
  expectTrue(list.length >= 1, "listUnlocked returns entries");
  // Sort check: oldest first
  for (let i = 1; i < list.length; i++) {
    expectTrue(
      list[i - 1]!.earnedAt <= list[i]!.earnedAt,
      `EarnedAt sorted ascending (idx ${i})`,
    );
  }

  // Idempotent: re-record does not duplicate
  const r3 = await recordUnlocked(
    emptyState({ totalReadings: 1 }),
    "2026-06-30T01:00:00.000Z",
  );
  expectEqual(r3.length, 0, "Idempotent: re-record returns no new ids");

  // Pluggable store: setUnlockedStore with a fresh store, then listUnlocked
  // walks that store.
  const calls: string[] = [];
  setUnlockedStore({
    async listForUser(uid) {
      calls.push(`list:${uid}`);
      return [];
    },
    async record(uid, aid, ts) {
      calls.push(`record:${uid}:${aid}:${ts}`);
    },
  });
  await listUnlocked("alt-user" as UserId);
  expectTrue(calls.some((c) => c.startsWith("list:alt-user")),
    "Custom UnlockedStore is invoked");
  resetUnlockedStore();
})();

// ============================================================================
// LIST BY CATEGORY — Stable order
// ============================================================================

const readingsList = listByCategory("readings");
expectTrue(readingsList.length >= 5, "readings category has 5+ entries");

for (let i = 1; i < readingsList.length; i++) {
  expectTrue(
    readingsList[i - 1]!.order < readingsList[i]!.order,
    `readings sorted by order (idx ${i})`,
  );
}

// ============================================================================
// LIST BY TRADITION
// ============================================================================

const ciganoAchs = listByTradition("cigano");
expectTrue(ciganoAchs.length >= 3, "At least 3 achievements for cigano tradition");

// ============================================================================
// GET-ACHIEVEMENT helper
// ============================================================================

const def = getAchievement("first-light" as AchievementId);
expectTrue(def !== null, "getAchievement returns definition for known id");
expectEqual(
  def!.title["pt-BR"],
  "Primeira Luz",
  "getAchievement returns correct title",
);
expectEqual(
  getAchievement("nonexistent" as AchievementId),
  null,
  "getAchievement returns null for unknown id",
);

// ============================================================================
// CATALOG AUDIT
// ============================================================================

const audit = auditCatalog();
expectTrue(audit.passes, `auditCatalog passes (got ${JSON.stringify(audit)})`);
expectTrue(audit.totalCount >= 30, `auditCatalog totalCount >= 30`);
expectTrue(
  audit.localeCompleteness["pt-BR"] === audit.totalCount,
  "auditCatalog pt-BR completeness = total",
);
expectTrue(
  audit.localeCompleteness["en-US"] === audit.totalCount,
  "auditCatalog en-US completeness = total",
);
expectTrue(
  audit.sacredCoveragePercent >= 50,
  `auditCatalog sacred coverage ${audit.sacredCoveragePercent}% >= 50%`,
);

// ============================================================================
// ANTI-DARK-PATTERN — Copy check
// ============================================================================

const DARK_WORDS = ["failed", "urro", "fracasso", "missed", "lost", "shame"];
ACHIEVEMENTS.forEach((d) => {
  for (const loc of ["pt-BR", "en-US", "es-ES", "fr-FR"] as const) {
    const t = (d.title[loc] ?? "").toLowerCase();
    const desc = (d.description[loc] ?? "").toLowerCase();
    for (const w of DARK_WORDS) {
      expectFalse(
        t.includes(w),
        `Title (${loc}) for ${d.id} avoids '${w}'`,
      );
      expectFalse(
        desc.includes(w),
        `Description (${loc}) for ${d.id} avoids '${w}'`,
      );
    }
  }
});

// ============================================================================
// OUTPUT
// ============================================================================

console.log(
  `[achievements.spec.ts] ${_passed} passed, ${_failed} failed`,
);
if (_failed > 0) {
  console.error(_failures.join("\n"));
  process.exit(1);
}
