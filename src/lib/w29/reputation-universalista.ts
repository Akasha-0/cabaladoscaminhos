/**
 * Universalista Reputation System (Wave 29)
 *
 * Multi-tradition participation scoring. Members earn karma across several
 * sacred lineages (Candomblé, Umbanda, Ifá, Cabala, Astrologia, Tantra);
 * the universalista badge honours cross-tradition practice.
 *
 * Pure functions; no DB.
 */

export type Tradition =
  | "candomble"
  | "umbanda"
  | "ifa"
  | "cabala"
  | "astrologia"
  | "tantra"
  | "umbanda-cristã"
  | "espiritismo";

export type KarmaEventKind =
  | "post-created"
  | "comment-created"
  | "helpful-reaction"
  | "mentorship-session"
  | "celebrate-given"
  | "tradition-explained"
  | "daily-reflection";

export interface KarmaEvent {
  readonly id: string;
  readonly userId: string;
  readonly kind: KarmaEventKind;
  readonly tradition: Tradition | null; // null = cross-cutting (e.g. daily reflection)
  readonly weight: number; // base weight before caps
  readonly at: number; // unix ms
}

export interface UserKarma {
  readonly userId: string;
  readonly total: number;
  readonly perTradition: Readonly<Partial<Record<Tradition, number>>>;
  readonly universalistaScore: number; // 0..1 cross-tradition diversity
  readonly badge: ReputationBadge;
}

export type ReputationBadge = "semente" | "broto" | "fruto" | "arvore" | "mestre" | "universalista";

const TRADITION_LIST: readonly Tradition[] = [
  "candomble",
  "umbanda",
  "ifa",
  "cabala",
  "astrologia",
  "tantra",
  "umbanda-cristã",
  "espiritismo",
];

/** Default per-event weights. */
const DEFAULT_WEIGHTS: Readonly<Record<KarmaEventKind, number>> = {
  "post-created": 5,
  "comment-created": 2,
  "helpful-reaction": 1,
  "mentorship-session": 12,
  "celebrate-given": 1,
  "tradition-explained": 8,
  "daily-reflection": 2,
};

/** Daily cap per event kind to prevent farming. */
const DAILY_CAPS: Readonly<Record<KarmaEventKind, number>> = {
  "post-created": 25,
  "comment-created": 30,
  "helpful-reaction": 15,
  "mentorship-session": 36,
  "celebrate-given": 10,
  "tradition-explained": 40,
  "daily-reflection": 6,
};

/** Sum a user's karma events into a UserKarma snapshot, applying caps. */
export function computeReputation(
  userId: string,
  events: readonly KarmaEvent[],
  weights: Readonly<Record<KarmaEventKind, number>> = DEFAULT_WEIGHTS,
  caps: Readonly<Record<KarmaEventKind, number>> = DAILY_CAPS,
): UserKarma {
  const perTradition = new Map<Tradition, number>();
  let total = 0;
  // Per-day accumulator.
  const dayCounter = new Map<string, Map<KarmaEventKind, number>>();
  const dayKey = (at: number): string => {
    const d = new Date(at);
    return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
  };
  for (const e of events) {
    if (e.userId !== userId) continue;
    const baseWeight = weights[e.kind] ?? 1;
    const cap = caps[e.kind] ?? Number.POSITIVE_INFINITY;
    const day = dayKey(e.at);
    const dayMap = dayCounter.get(day) ?? new Map<KarmaEventKind, number>();
    const used = dayMap.get(e.kind) ?? 0;
    const room = Math.max(0, cap - used);
    const applied = Math.min(e.weight * baseWeight, room);
    dayMap.set(e.kind, used + applied);
    dayCounter.set(day, dayMap);
    if (applied <= 0) continue;
    total += applied;
    if (e.tradition) {
      perTradition.set(e.tradition, (perTradition.get(e.tradition) ?? 0) + applied);
    }
  }
  const universalistaScore = computeUniversalistaScore(perTradition, total);
  const badge = badgeFor(total, universalistaScore);
  return { userId, total, perTradition, universalistaScore, badge };
}

/** Diversity score — how many traditions the user has participated in, weighted by share. */
export function computeUniversalistaScore(
  perTradition: ReadonlyMap<Tradition, number>,
  total: number,
): number {
  if (total <= 0) return 0;
  // Shannon entropy normalised by ln(#traditions).
  const present = TRADITION_LIST.filter((t) => (perTradition.get(t) ?? 0) > 0);
  if (present.length <= 1) return 0;
  let entropy = 0;
  for (const t of present) {
    const p = (perTradition.get(t) ?? 0) / total;
    if (p > 0) entropy -= p * Math.log(p);
  }
  const maxEntropy = Math.log(TRADITION_LIST.length);
  return Math.min(1, entropy / maxEntropy);
}

/** Badge promotion ladder. */
export function badgeFor(total: number, universalistaScore: number): ReputationBadge {
  if (universalistaScore >= 0.85 && total >= 1500) return "universalista";
  if (total >= 1500) return "mestre";
  if (total >= 600) return "arvore";
  if (total >= 200) return "fruto";
  if (total >= 50) return "broto";
  return "semente";
}

/** Pretty label for the badge (PT-BR default). */
export function badgeLabel(badge: ReputationBadge): string {
  switch (badge) {
    case "semente":
      return "Semente";
    case "broto":
      return "Broto";
    case "fruto":
      return "Fruto";
    case "arvore":
      return "Árvore";
    case "mestre":
      return "Mestre";
    case "universalista":
      return "Universalista";
  }
}

/** Human-readable progress to next badge. */
export interface BadgeProgress {
  readonly current: ReputationBadge;
  readonly next: ReputationBadge | null;
  readonly karmaToNext: number;
  readonly universalistaToNext: number; // 0..1
}

const THRESHOLDS: ReadonlyArray<{ badge: ReputationBadge; min: number; minUni: number }> = [
  { badge: "semente", min: 0, minUni: 0 },
  { badge: "broto", min: 50, minUni: 0 },
  { badge: "fruto", min: 200, minUni: 0 },
  { badge: "arvore", min: 600, minUni: 0 },
  { badge: "mestre", min: 1500, minUni: 0 },
  { badge: "universalista", min: 1500, minUni: 0.85 },
];

export function badgeProgress(total: number, universalistaScore: number): BadgeProgress {
  let currentIdx = 0;
  for (let i = 0; i < THRESHOLDS.length; i += 1) {
    const t = THRESHOLDS[i];
    if (total >= t.min && universalistaScore >= t.minUni) currentIdx = i;
  }
  const current = THRESHOLDS[currentIdx].badge;
  const nextIdx = currentIdx + 1;
  if (nextIdx >= THRESHOLDS.length) {
    return { current, next: null, karmaToNext: 0, universalistaToNext: 0 };
  }
  const next = THRESHOLDS[nextIdx];
  return {
    current,
    next: next.badge,
    karmaToNext: Math.max(0, next.min - total),
    universalistaToNext: Math.max(0, next.minUni - universalistaScore),
  };
}
