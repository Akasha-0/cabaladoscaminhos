// ============================================================================
// BADGES — Spec (Wave 69, 2026-06-30)
// ============================================================================
// Self-running test harness (no vitest needed at runtime). 30+ assertions.
// ============================================================================

import {
  ACHIEVEMENTS,
  type AchievementId,
} from "../achievements.ts";
import {
  auditBadgeTiers,
  compareBadges,
  formatBadgeDisplay,
  formatBadgesList,
  getBadgeStyle,
  getIconName,
  iconColorPair,
  tierBoundaries,
  tierFromCount,
  tierRank,
} from "../badges.ts";

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
// getBadgeStyle — Style per tier
// ============================================================================

{
  const s = getBadgeStyle("first-light" as AchievementId);
  expectTrue(s !== null, "first-light style exists");
  expectEqual(s!.tier, "bronze", "first-light tier=bronze");
  expectEqual(s!.iconName, "sparkles", "first-light icon=sparkles");
  expectEqual(s!.glowEffect, false, "first-light no glow");
}

{
  const s = getBadgeStyle("mestre-da-mesa" as AchievementId);
  expectEqual(s!.tier, "gold", "mestre-da-mesa tier=gold");
  expectEqual(s!.glowEffect, true, "mestre-da-mesa has glow");
}

{
  const s = getBadgeStyle("oracle-elder" as AchievementId);
  expectEqual(s!.tier, "mythic", "oracle-elder tier=mythic");
  expectEqual(s!.iconName, "eye", "oracle-elder icon=eye");
}

expectEqual(
  getBadgeStyle("nonexistent" as AchievementId),
  null,
  "unknown id → null",
);

expectEqual(
  getIconName("first-light" as AchievementId),
  "sparkles",
  "getIconName returns icon name",
);
expectEqual(
  getIconName("unknown" as AchievementId),
  null,
  "getIconName unknown → null",
);

// ============================================================================
// tierFromCount — boundaries (9→bronze, 10→silver, 25→gold, 50→mythic)
// ============================================================================

expectEqual(tierFromCount(0), null, "tierFromCount(0) → null");
expectEqual(tierFromCount(-1), null, "tierFromCount(-1) → null");
expectEqual(tierFromCount(NaN), null, "tierFromCount(NaN) → null");

expectEqual(tierFromCount(1), "bronze", "tierFromCount(1) → bronze");
expectEqual(tierFromCount(5), "bronze", "tierFromCount(5) → bronze");
expectEqual(tierFromCount(9), "bronze", "tierFromCount(9) → bronze (boundary)");

expectEqual(tierFromCount(10), "silver", "tierFromCount(10) → silver (boundary)");
expectEqual(tierFromCount(20), "silver", "tierFromCount(20) → silver");
expectEqual(tierFromCount(24), "silver", "tierFromCount(24) → silver (max silver)");

expectEqual(tierFromCount(25), "gold", "tierFromCount(25) → gold (boundary)");
expectEqual(tierFromCount(40), "gold", "tierFromCount(40) → gold");
expectEqual(tierFromCount(49), "gold", "tierFromCount(49) → gold (max gold)");

expectEqual(tierFromCount(50), "mythic", "tierFromCount(50) → mythic (boundary)");
expectEqual(tierFromCount(99), "mythic", "tierFromCount(99) → mythic");
expectEqual(tierFromCount(999), "mythic", "tierFromCount(999) → mythic");

// ============================================================================
// tierBoundaries — published ruleset
// ============================================================================

const bounds = tierBoundaries();
expectEqual(bounds.length, 4, "4 tiers");
expectEqual(bounds[0]!.tier, "bronze", "first tier=bronze");
expectEqual(bounds[0]!.min, 1, "bronze min=1");
expectEqual(bounds[0]!.max, 9, "bronze max=9");
expectEqual(bounds[3]!.tier, "mythic", "last tier=mythic");

// ============================================================================
// tierRank — for compareBadges
// ============================================================================

expectTrue(tierRank("mythic") > tierRank("gold"), "mythic > gold");
expectTrue(tierRank("gold") > tierRank("silver"), "gold > silver");
expectTrue(tierRank("silver") > tierRank("bronze"), "silver > bronze");

// ============================================================================
// formatBadgeDisplay — i18n
// ============================================================================

{
  const d = formatBadgeDisplay("first-light" as AchievementId, "2026-06-30T01:00:00.000Z", "pt-BR");
  expectTrue(d !== null, "formatBadgeDisplay returns non-null");
  expectEqual(d!.title, "Primeira Luz", "pt-BR title");
  expectEqual(d!.description.includes("Bem-vindo"), true, "pt-BR description contains 'Bem-vindo'");
  expectEqual(d!.locale, "pt-BR", "locale=pt-BR");
  expectEqual(d!.earnedOn, "2026-06-30T01:00:00.000Z", "earnedOn ISO");
  expectEqual(d!.style.tier, "bronze", "style.tier=bronze");
}

{
  const d = formatBadgeDisplay("first-light" as AchievementId, null, "en-US");
  expectEqual(d!.title, "First Light", "en-US title");
  expectEqual(d!.earnedOn, null, "earnedOn=null for not earned");
}

{
  // Fallback to pt-BR when locale not present for that key
  // All achievements in this catalog have all 4 locales, but we test fallback
  // by using a locale that may not be in the key set. With known keys we test
  // the helpder directly via import.
  const d = formatBadgeDisplay("first-light" as AchievementId, null, "es-ES");
  expectEqual(d!.title, "Primera Luz", "es-ES title");
}

{
  const d = formatBadgeDisplay("first-light" as AchievementId, null, "fr-FR");
  expectEqual(d!.title, "Première Lumière", "fr-FR title");
}

expectEqual(
  formatBadgeDisplay("nonexistent" as AchievementId, null),
  null,
  "formatBadgeDisplay unknown → null",
);

// ============================================================================
// formatBadgesList — bulk
// ============================================================================

{
  const ids = ["first-light", "devoted-seeker", "mestre-da-mesa"] as AchievementId[];
  const earnedOnMap = new Map<AchievementId, string>([
    ["first-light" as AchievementId, "2026-06-30T01:00:00.000Z"],
    ["devoted-seeker" as AchievementId, "2026-06-30T02:00:00.000Z"],
    ["mestre-da-mesa" as AchievementId, "2026-06-30T03:00:00.000Z"],
  ]);
  const out = formatBadgesList(ids, earnedOnMap);
  expectEqual(out.length, 3, "3 formatted badges");
  expectEqual(out[0]!.earnedOn, "2026-06-30T01:00:00.000Z", "first badge earnedOn");
}

// ============================================================================
// compareBadges — sort order
// ============================================================================

{
  // Higher tier ranks earlier: mythic > gold > bronze
  const r1 = compareBadges(
    { tier: "mythic", earnedAt: "2026-06-30T00:00:00Z", id: "oracle-elder" as AchievementId },
    { tier: "bronze", earnedAt: "2026-06-30T00:00:00Z", id: "first-light" as AchievementId },
  );
  expectEqual(r1, -1, "mythic ranks before bronze");

  const r2 = compareBadges(
    { tier: "gold", earnedAt: "2026-06-30T00:00:00Z", id: "mestre-da-mesa" as AchievementId },
    { tier: "silver", earnedAt: "2026-06-30T00:00:00Z", id: "devoted-seeker" as AchievementId },
  );
  expectEqual(r2, -1, "gold ranks before silver");

  // Same tier → chronological (oldest first)
  const r3 = compareBadges(
    { tier: "bronze", earnedAt: "2026-06-30T00:00:00Z", id: "first-light" as AchievementId },
    { tier: "bronze", earnedAt: "2026-06-30T01:00:00Z", id: "devoted-seeker" as AchievementId },
  );
  expectEqual(r3, -1, "older earnedAt ranks first within same tier");

  // Same tier + same ts → alphabetical by id
  const r4 = compareBadges(
    { tier: "bronze", earnedAt: "2026-06-30T00:00:00Z", id: "alpha" as AchievementId },
    { tier: "bronze", earnedAt: "2026-06-30T00:00:00Z", id: "beta" as AchievementId },
  );
  expectEqual(r4, -1, "alphabetical id when tier+ts equal");

  // Equal
  const r5 = compareBadges(
    { tier: "silver", earnedAt: "2026-06-30T00:00:00Z", id: "x" as AchievementId },
    { tier: "silver", earnedAt: "2026-06-30T00:00:00Z", id: "x" as AchievementId },
  );
  expectEqual(r5, 0, "identical returns 0");
}

// ============================================================================
// auditBadgeTiers — chain exposed
// ============================================================================

{
  const a = auditBadgeTiers();
  expectTrue(a.passes, "auditBadgeTiers passes");
  expectEqual(a.tierRules.length, 4, "4 tier rules");
  expectEqual(a.sortOrder[0], "bronze", "first in sortOrder=bronze");
  expectEqual(a.sortOrder[3], "mythic", "last in sortOrder=mythic");
  // Compare rules is non-empty
  expectTrue(a.compareRules.length >= 1, "compareRules non-empty");
}

// ============================================================================
// iconColorPair — UI helper
// ============================================================================

{
  const pair = iconColorPair("mestre-da-mesa" as AchievementId);
  expectEqual(pair, "crown#FFD700", "mestre-da-mesa icon#color");
}

expectEqual(
  iconColorPair("nonexistent" as AchievementId),
  null,
  "iconColorPair unknown → null",
);

// ============================================================================
// TIER-FROM-COUNT coverage — every catalog achievement must have a tier
// ============================================================================

ACHIEVEMENTS.forEach((d) => {
  expectTrue(
    ["bronze", "silver", "gold", "mythic"].includes(d.badge.tier),
    `${d.id} has valid tier (got ${d.badge.tier})`,
  );
});

// ============================================================================
// OUTPUT
// ============================================================================

console.log(
  `[badges.spec.ts] ${_passed} passed, ${_failed} failed`,
);
if (_failed > 0) {
  console.error(_failures.join("\n"));
  process.exit(1);
}
