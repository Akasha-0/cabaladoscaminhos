// W91-B: reputation-leaderboard — factory module
// Public entrypoint for assembling a frozen LeaderboardSnapshot from the
// curated mock member list. Pure: no I/O, no Date.now() at module scope,
// deterministic for given inputs.
//
// Sacred-cultural compliance:
//   - All exported values are `Object.freeze`-d
//   - Position is described as "Posição" in copy (no "rank")
//   - Bottom tier is labeled "Testemunhas" (honor, not shame)
//   - Generated label uses "Reconhecimento" (not "competition")
//
// LGPD:
//   - Snapshot exposes only: generatedAt, window, category, entries
//     (each entry: position, compositeScore, percentile, member
//     with userId + displayName + tradição + yearsOfAxé + scores)
//   - No e-mail, telefone, IP, or any contact data

import type {
  CategoryId,
  LeaderboardEntry,
  LeaderboardFilter,
  LeaderboardSnapshot,
  ReputationMember,
  TimeWindowId,
} from "./types";
import {
  W91B_CATEGORY_LABELS,
  W91B_WINDOW_LABELS,
} from "./types";
import { W91B_MOCK_MEMBERS, W91B_WINDOW_MULTIPLIERS } from "./mock";
import {
  DESCENDING_BY_COMPOSITE,
  assignPositions,
  buildCategoryScores,
  compositeScore,
  filterByCategory,
  normalizeWindow,
  percentileOf,
  stableSort,
  topN,
  witnessTier,
} from "./rank";

/**
 * Assemble a LeaderboardSnapshot from the curated mock list. The factory is
 * pure: pass an explicit `generatedAt` (or accept the default empty string
 * for the deterministic path used by tests).
 */
export function createLeaderboard(
  filter: Partial<LeaderboardFilter> = {},
  generatedAt: string = "",
  members: ReadonlyArray<ReputationMember> = W91B_MOCK_MEMBERS,
): LeaderboardSnapshot {
  const window: TimeWindowId = normalizeWindow(filter.window ?? "all");
  const category: CategoryId | "all" =
    filter.category && (filter.category === "all" || isCategoryId(filter.category))
      ? filter.category
      : "all";

  const filtered = filterByCategory(members, category);
  const multiplier = W91B_WINDOW_MULTIPLIERS[window] ?? 1;

  const partialEntries: LeaderboardEntry[] = filtered.map((member) =>
    Object.freeze({
      position: 0,
      member,
      compositeScore: compositeScore(member, multiplier),
      percentile: 0,
      categoryScores: buildCategoryScores(member),
    }) as LeaderboardEntry,
  );

  const sorted = stableSort(partialEntries, DESCENDING_BY_COMPOSITE);
  const withPositions = assignPositions(sorted);
  const withPercentile = Object.freeze(
    withPositions.map((entry) =>
      Object.freeze({
        ...entry,
        percentile: percentileOf(entry.compositeScore, filtered.length),
      }) as LeaderboardEntry,
    ),
  );

  const topThree = Object.freeze(topN(withPercentile, 3)) as ReadonlyArray<LeaderboardEntry>;
  const witnesses = Object.freeze(witnessTier(withPercentile)) as ReadonlyArray<LeaderboardEntry>;

  const snapshot: LeaderboardSnapshot = Object.freeze({
    generatedAt: generatedAt || "",
    window,
    category,
    entries: Object.freeze(withPercentile),
    totalMembers: filtered.length,
    topThree,
    witnesses,
  });

  return snapshot;
}

/**
 * Compose the human-readable header label for the leaderboard view. Uses
 * positive framing ("Reconhecimento" + window + category).
 */
export function leaderboardTitle(
  filter: Partial<LeaderboardFilter> = {},
): string {
  const window = normalizeWindow(filter.window ?? "all");
  const category = filter.category ?? "all";
  const windowLabel = W91B_WINDOW_LABELS[window];
  if (category === "all") return `Reconhecimento · ${windowLabel}`;
  const catLabel = W91B_CATEGORY_LABELS[category as CategoryId]?.label ?? "Comunidade";
  return `${catLabel} reconhecida · ${windowLabel}`;
}

/**
 * Build the small descriptor string that appears below the leaderboard
 * title. Honors the cumulative, non-competitive framing.
 */
export function leaderboardSubtitle(
  snapshot: LeaderboardSnapshot,
): string {
  const n = snapshot.totalMembers;
  if (n === 0) return "Sem membros reconhecidos no recorte.";
  const plural = n === 1 ? "membro reconhecido" : "membros reconhecidos";
  return `${n} ${plural} pela comunidade. Posição é testemunho de prática.`;
}

/**
 * Defensive helper: narrow a string into a CategoryId or null.
 */
function isCategoryId(value: string): value is CategoryId {
  return (
    value === "tradição" ||
    value === "sabedoria" ||
    value === "axé" ||
    value === "comunidade"
  );
}

/**
 * Returns the canonical icon + label pair for a category id. Falls back
 * to "Comunidade / ◈" if the input is unknown.
 */
export function categoryPresentation(
  category: CategoryId | "all",
): { label: string; icon: string } {
  if (category === "all") return { label: "Comunidade", icon: "◈" };
  const entry = W91B_CATEGORY_LABELS[category];
  return { label: entry.label, icon: entry.icon };
}

/**
 * Build the canonical witness label for the bottom tier.
 */
export function witnessLabel(): string {
  return "Testemunhas da Comunidade";
}

export const W91B_LEADERBOARD_VERSION = "2026-06-30" as const;
export const W91B_RECONHECIMENTO_TITLE = "Reconhecimento da Comunidade" as const;