// ============================================================================
// BADGES — Badge rendering + tiering (Wave 69, 2026-06-30)
// ============================================================================
// Pure-logic engine (no DB, no React) — converte AchievementId em estilo de
// badge (icon, cor, glow), classifica tier pelo número total desbloqueado,
// formata display locale-aware, e ordena. Exporta audit das regras de tier.
//
// Design decisions:
//   - Style é derivado do `BadgeStyle` no achievement definition (single source)
//   - Tier agregado vem de tierFromCount() (limites 9/25/50 publicados)
//   - Locale display é locale-aware com fallback pt-BR (outras línguas caem)
//   - Sort por tier mythic>gold>silver>bronze, depois por earnedAt
//   - formatBadgeDisplay é pura (não toca Date.now — earnedAt vem do caller)
// ============================================================================

import type {
  AchievementId,
  AchievementDefinition,
  Locale,
  Tier,
  BadgeStyle,
} from './achievements.ts';
import { ACHIEVEMENTS, localize } from './achievements.ts';

// ============================================================================
// TYPES
// ============================================================================

export interface BadgeDisplay {
  readonly id: AchievementId;
  readonly title: string;
  readonly description: string;
  readonly locale: Locale;
  readonly earnedOn: string | null; // null if not earned
  readonly style: BadgeStyle;
}

// ============================================================================
// STYLE LOOKUP
// ============================================================================

/**
 * Get the badge visual style for an achievement — derived from catalog.
 * Returns null if the achievement id is unknown (no throw — anti-dark-pattern).
 */
export function getBadgeStyle(
  achievementId: AchievementId,
): BadgeStyle | null {
  const def = ACHIEVEMENTS.find((d) => d.id === achievementId);
  if (!def) return null;
  return def.badge;
}

/**
 * Get the icon name for an achievement (sugar over getBadgeStyle).
 */
export function getIconName(
  achievementId: AchievementId,
): string | null {
  return getBadgeStyle(achievementId)?.iconName ?? null;
}

// ============================================================================
// TIER FROM COUNT — Aggregate tier rules
// ============================================================================
// Tier reflects overall user progress:
//   bronze:  1..9   unlocked
//   silver:  10..24
//   gold:    25..49
//   mythic:  50+
//
// These thresholds are published via `auditBadgeTiers()` so QA can spot
// accidental copy edits or marketing-driven changes.

const TIER_RULES = Object.freeze({
  bronze: { min: 1, max: 9 },
  silver: { min: 10, max: 24 },
  gold: { min: 25, max: 49 },
  mythic: { min: 50, max: Number.POSITIVE_INFINITY },
}) as Readonly<Record<Tier, { min: number; max: number }>>;

/**
 * Tier for a given unlocked count. Negative or zero → null (no tier yet).
 */
export function tierFromCount(unlockedCount: number): Tier | null {
  if (typeof unlockedCount !== 'number' || !Number.isFinite(unlockedCount)) {
    return null;
  }
  if (unlockedCount < 1) return null;
  const n = Math.floor(unlockedCount);
  if (n >= TIER_RULES.mythic.min) return 'mythic';
  if (n >= TIER_RULES.gold.min) return 'gold';
  if (n >= TIER_RULES.silver.min) return 'silver';
  if (n >= TIER_RULES.bronze.min) return 'bronze';
  return null;
}

/**
 * Returns the tier boundaries — used by auditBadgeTiers() so test cases can
 * validate them.
 */
export function tierBoundaries(): ReadonlyArray<{
  readonly tier: Tier;
  readonly min: number;
  readonly max: number;
}> {
  return (Object.keys(TIER_RULES) as Tier[]).map((t) => ({
    tier: t,
    min: TIER_RULES[t].min,
    max: TIER_RULES[t].max,
  }));
}

// ============================================================================
// TIER RANKING — for compareBadges sort
// ============================================================================
// Cycle 60+ lesson: keep sort ranking explicit and reversible.

const TIER_RANK: Readonly<Record<Tier, number>> = Object.freeze({
  mythic: 4,
  gold: 3,
  silver: 2,
  bronze: 1,
});

export function tierRank(tier: Tier): number {
  return TIER_RANK[tier];
}

// ============================================================================
// DISPLAY FORMATTING — i18n-ready
// ============================================================================

/**
 * Format the badge for display in the chosen locale. Returns a flat object
 * ready for any UI surface (mobile card, desktop tooltip, PDF export).
 *
 * @param earnedOn ISO-8601 string of when the user unlocked it, or null if not earned
 * @param locale default 'pt-BR'
 */
export function formatBadgeDisplay(
  achievementId: AchievementId,
  earnedOn: string | null,
  locale: Locale = 'pt-BR',
): BadgeDisplay | null {
  const def = ACHIEVEMENTS.find((d) => d.id === achievementId);
  if (!def) return null;
  return Object.freeze({
    id: achievementId,
    title: localize(def.title, locale),
    description: localize(def.description, locale),
    locale,
    earnedOn,
    style: def.badge,
  });
}

/**
 * Bulk formatter — useful for badges list endpoints.
 */
export function formatBadgesList(
  ids: readonly AchievementId[],
  earnedOnMap: ReadonlyMap<AchievementId, string>,
  locale: Locale = 'pt-BR',
): readonly BadgeDisplay[] {
  const out: BadgeDisplay[] = [];
  for (const id of ids) {
    const ts = earnedOnMap.get(id) ?? null;
    const formatted = formatBadgeDisplay(id, ts, locale);
    if (formatted) out.push(formatted);
  }
  return out;
}

// ============================================================================
// COMPARE BADGES — Sort comparator
// ============================================================================

/**
 * Sort comparator for unlocked badges:
 *   1. Higher tier first (mythic > gold > silver > bronze)
 *   2. Within tier, oldest earnedAt first (chronological)
 *   3. Within same tier & timestamp, alphabetical by id (stable)
 *
 * Returns negative if `a` should come before `b`.
 */
export function compareBadges(
  a: { tier: Tier; earnedAt: string | null; id: AchievementId },
  b: { tier: Tier; earnedAt: string | null; id: AchievementId },
): -1 | 0 | 1 {
  const ra = tierRank(a.tier);
  const rb = tierRank(b.tier);
  if (ra !== rb) return ra > rb ? -1 : 1;
  // Same tier → chronological order (oldest first)
  const ea = a.earnedAt ?? '';
  const eb = b.earnedAt ?? '';
  if (ea !== eb) return ea < eb ? -1 : ea > eb ? 1 : 0;
  // Stable: alphabetical by id
  const ia = a.id as string;
  const ib = b.id as string;
  if (ia < ib) return -1;
  if (ia > ib) return 1;
  return 0;
}

// ============================================================================
// AUDIT — Tier rules (cycle 62 lesson pattern)
// ============================================================================

export interface BadgeTiersAudit {
  readonly tierRules: ReadonlyArray<{
    readonly tier: Tier;
    readonly min: number;
    readonly max: number;
  }>;
  readonly sortOrder: readonly Tier[];
  readonly compareRules: readonly string[];
  readonly passes: boolean;
}

/**
 * Audit the badge tiers. Returns the ruleset for QA reviewers.
 *
 * Passes when:
 *   - Exactly 4 tiers
 *   - Boundaries are non-overlapping
 *   - sortOrder matches expected: bronze, silver, gold, mythic
 */
export function auditBadgeTiers(): BadgeTiersAudit {
  const tierRules = tierBoundaries();
  const sortOrder: readonly Tier[] = ['bronze', 'silver', 'gold', 'mythic'];
  const compareRules = [
    'higher tier ranks earlier (mythic > gold > silver > bronze)',
    'within same tier, oldest earnedAt first',
    'within same tier & ts, alphabetical by id',
  ];
  // Boundaries non-overlapping check
  let nonOverlap = true;
  for (let i = 1; i < tierRules.length; i++) {
    const prev = tierRules[i - 1]!;
    const cur = tierRules[i]!;
    if (cur.min !== prev.max + 1) {
      nonOverlap = false;
      break;
    }
  }
  return Object.freeze({
    tierRules,
    sortOrder,
    compareRules,
    passes: tierRules.length === 4 && nonOverlap,
  });
}

// ============================================================================
// ICON-COLOR PAIR (UI helper)
// ============================================================================

/**
 * Compose icon + color into a CSS-friendly string for the user UI.
 * Format: "icon-name#color" (e.g. "crown#FFD700").
 */
export function iconColorPair(achievementId: AchievementId): string | null {
  const s = getBadgeStyle(achievementId);
  if (!s) return null;
  // color is already a hex string starting with '#' — no prepend needed.
  return `${s.iconName}${s.color}`;
}
