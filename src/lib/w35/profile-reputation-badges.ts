/**
 * profile-reputation-badges.ts
 *
 * Cycle 35 — Profile Reputation Badges: earned, displayed, sharable.
 *
 * Composes with:
 *   - src/lib/w29/reputation-universalista.ts (tier + score engine)
 *   - src/lib/w34/profile-public-page.ts     (public profile viewmodel)
 *   - src/lib/w34/comments-moderation-appeals.ts (moderation trust signal)
 *
 * Pure TypeScript: no runtime imports from app code, no I/O, no DOM. All
 * timestamps are caller-supplied (`now`) so the module is deterministic
 * under test. Each public helper returns a fresh value or a fresh array.
 *
 * Responsibilities:
 *   1. Catalog — fixed list of badges across 5 families (universalista,
 *      leitura, mentorship, community, moderation).
 *   2. Earn — given a user's reputation snapshot + activity counters,
 *      return the set of badges the user qualifies for right now.
 *   3. Display — pick the "showcase" subset (max 6) for the public
 *      profile, sorted by rarity.
 *   4. Share URL — build a deep link that opens the badge modal.
 *   5. Summary — counts (earned, locked, showcase size, next achievable).
 */

// ---------- TYPES ----------------------------------------------------------

export type BadgeFamily =
  | "universalista"
  | "leitura"
  | "mentorship"
  | "community"
  | "moderation";

export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface BadgeDef {
  id: string;
  name: string;
  family: BadgeFamily;
  rarity: BadgeRarity;
  description: string;
  // Predicate inputs:
  minUniversalistaScore?: number;
  minLeiturasConsumed?: number;
  minMentorshipSessions?: number;
  minHelpfulComments?: number;
  minModerationActions?: number;
  minStreakDays?: number;
  minConsecutiveDays?: number;
  minTier?: "iniciante" | "praticante" | "mentor" | "mestre" | "grao_mestre";
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: number;
  progress: number;        // 0..1 — 1 when fully earned
}

export interface LockedBadge {
  badge: BadgeDef;
  progress: number;        // 0..1
  missingRequirements: string[];
}

export interface ProfileBadgeSnapshot {
  earned: EarnedBadge[];
  locked: LockedBadge[];
  showcase: BadgeDef[];     // max 6
  nextBadge: BadgeDef | null;
  counts: {
    total: number;
    earned: number;
    locked: number;
    showcaseSize: number;
  };
}

export interface UserActivity {
  universalistaScore: number;
  tier: "iniciante" | "praticante" | "mentor" | "mestre" | "grao_mestre";
  leiturasConsumed: number;
  mentorshipSessions: number;
  helpfulComments: number;
  moderationActions: number;
  currentStreakDays: number;
  consecutiveDaysActive: number;
  earnedBadgeIds: string[];
}

export interface BadgeShareUrl {
  url: string;
  badgeId: string;
}

// ---------- CONSTANTS -----------------------------------------------------

export const BADGE_CATALOG: BadgeDef[] = [
  {
    id: "uni_iniciante",
    name: "Iniciante da Trilha",
    family: "universalista",
    rarity: "common",
    description: "Começou sua jornada na Cabala dos Caminhos",
    minUniversalistaScore: 0,
  },
  {
    id: "uni_praticante",
    name: "Praticante Dedicado",
    family: "universalista",
    rarity: "uncommon",
    description: "Alcançou o tier praticante",
    minTier: "praticante",
    minUniversalistaScore: 200,
  },
  {
    id: "uni_mentor",
    name: "Mentor do Caminho",
    family: "universalista",
    rarity: "rare",
    description: "Alcançou o tier mentor",
    minTier: "mentor",
    minUniversalistaScore: 500,
  },
  {
    id: "uni_mestre",
    name: "Mestre da Sabedoria",
    family: "universalista",
    rarity: "epic",
    description: "Alcançou o tier mestre",
    minTier: "mestre",
    minUniversalistaScore: 750,
  },
  {
    id: "uni_grao_mestre",
    name: "Grão-Mestre",
    family: "universalista",
    rarity: "legendary",
    description: "Alcançou o tier grão-mestre",
    minTier: "grao_mestre",
    minUniversalistaScore: 950,
  },
  {
    id: "leit_5",
    name: "Leitor Curioso",
    family: "leitura",
    rarity: "common",
    description: "Consumiu 5 leituras",
    minLeiturasConsumed: 5,
  },
  {
    id: "leit_25",
    name: "Leitor Voraz",
    family: "leitura",
    rarity: "uncommon",
    description: "Consumiu 25 leituras",
    minLeiturasConsumed: 25,
  },
  {
    id: "leit_100",
    name: "Biblioteca Viva",
    family: "leitura",
    rarity: "rare",
    description: "Consumiu 100 leituras",
    minLeiturasConsumed: 100,
  },
  {
    id: "ment_5",
    name: "Aprendiz de Mentor",
    family: "mentorship",
    rarity: "uncommon",
    description: "Participou de 5 sessões de mentoria",
    minMentorshipSessions: 5,
  },
  {
    id: "ment_25",
    name: "Mentee Comprometido",
    family: "mentorship",
    rarity: "rare",
    description: "Participou de 25 sessões de mentoria",
    minMentorshipSessions: 25,
  },
  {
    id: "comm_50",
    name: "Voz da Comunidade",
    family: "community",
    rarity: "uncommon",
    description: "50 comentários marcados como úteis",
    minHelpfulComments: 50,
  },
  {
    id: "comm_500",
    name: "Guardião do Círculo",
    family: "community",
    rarity: "epic",
    description: "500 comentários marcados como úteis",
    minHelpfulComments: 500,
  },
  {
    id: "mod_100",
    name: "Moderador Voluntário",
    family: "moderation",
    rarity: "rare",
    description: "100 ações de moderação responsáveis",
    minModerationActions: 100,
  },
  {
    id: "streak_7",
    name: "Semana de Fogo",
    family: "community",
    rarity: "common",
    description: "7 dias consecutivos ativos",
    minConsecutiveDays: 7,
  },
  {
    id: "streak_30",
    name: "Mês em Chamas",
    family: "community",
    rarity: "uncommon",
    description: "30 dias consecutivos ativos",
    minConsecutiveDays: 30,
  },
  {
    id: "streak_365",
    name: "Ano de Prática",
    family: "community",
    rarity: "legendary",
    description: "365 dias consecutivos ativos",
    minConsecutiveDays: 365,
  },
];

export const TIER_ORDER: Record<UserActivity["tier"], number> = {
  iniciante: 0,
  praticante: 1,
  mentor: 2,
  mestre: 3,
  grao_mestre: 4,
};

export const RARITY_ORDER: Record<BadgeRarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

export const SHOWCASE_MAX = 6;
export const MAX_SHARE_URL_LENGTH = 256;
export const MIN_UNIVERSALISTA_SCORE = 0;
export const MAX_UNIVERSALISTA_SCORE = 1000;

// ---------- HELPERS -----------------------------------------------------

export function findBadge(badgeId: string): BadgeDef | null {
  return BADGE_CATALOG.find((b) => b.id === badgeId) ?? null;
}

export function tierMeetsRequirement(
  userTier: UserActivity["tier"],
  required: BadgeDef["minTier"]
): boolean {
  if (!required) return true;
  return TIER_ORDER[userTier] >= TIER_ORDER[required];
}

export function isEarned(
  activity: UserActivity,
  badge: BadgeDef,
  now: number
): EarnedBadge | null {
  if (activity.earnedBadgeIds.includes(badge.id)) {
    return { badgeId: badge.id, earnedAt: now, progress: 1 };
  }
  const missing = missingRequirements(activity, badge);
  if (missing.length === 0) {
    return { badgeId: badge.id, earnedAt: now, progress: 1 };
  }
  return null;
}

export function missingRequirements(
  activity: UserActivity,
  badge: BadgeDef
): string[] {
  const out: string[] = [];
  if (
    typeof badge.minUniversalistaScore === "number" &&
    activity.universalistaScore < badge.minUniversalistaScore
  ) {
    out.push(`score>=${badge.minUniversalistaScore}`);
  }
  if (
    typeof badge.minLeiturasConsumed === "number" &&
    activity.leiturasConsumed < badge.minLeiturasConsumed
  ) {
    out.push(`leituras>=${badge.minLeiturasConsumed}`);
  }
  if (
    typeof badge.minMentorshipSessions === "number" &&
    activity.mentorshipSessions < badge.minMentorshipSessions
  ) {
    out.push(`mentoria>=${badge.minMentorshipSessions}`);
  }
  if (
    typeof badge.minHelpfulComments === "number" &&
    activity.helpfulComments < badge.minHelpfulComments
  ) {
    out.push(`uteis>=${badge.minHelpfulComments}`);
  }
  if (
    typeof badge.minModerationActions === "number" &&
    activity.moderationActions < badge.minModerationActions
  ) {
    out.push(`moderacao>=${badge.minModerationActions}`);
  }
  if (
    typeof badge.minConsecutiveDays === "number" &&
    activity.consecutiveDaysActive < badge.minConsecutiveDays
  ) {
    out.push(`dias_consecutivos>=${badge.minConsecutiveDays}`);
  }
  if (!tierMeetsRequirement(activity.tier, badge.minTier)) {
    out.push(`tier>=${badge.minTier}`);
  }
  return out;
}

export function badgeProgress(
  activity: UserActivity,
  badge: BadgeDef
): number {
  const checks: Array<[number, number]> = [];
  if (typeof badge.minUniversalistaScore === "number") {
    checks.push([
      clamp01(activity.universalistaScore / Math.max(1, badge.minUniversalistaScore)),
      1,
    ]);
  }
  if (typeof badge.minLeiturasConsumed === "number") {
    checks.push([
      clamp01(activity.leiturasConsumed / Math.max(1, badge.minLeiturasConsumed)),
      1,
    ]);
  }
  if (typeof badge.minMentorshipSessions === "number") {
    checks.push([
      clamp01(activity.mentorshipSessions / Math.max(1, badge.minMentorshipSessions)),
      1,
    ]);
  }
  if (typeof badge.minHelpfulComments === "number") {
    checks.push([
      clamp01(activity.helpfulComments / Math.max(1, badge.minHelpfulComments)),
      1,
    ]);
  }
  if (typeof badge.minModerationActions === "number") {
    checks.push([
      clamp01(activity.moderationActions / Math.max(1, badge.minModerationActions)),
      1,
    ]);
  }
  if (typeof badge.minConsecutiveDays === "number") {
    checks.push([
      clamp01(activity.consecutiveDaysActive / Math.max(1, badge.minConsecutiveDays)),
      1,
    ]);
  }
  if (badge.minTier) {
    checks.push([
      clamp01(TIER_ORDER[activity.tier] / Math.max(1, TIER_ORDER[badge.minTier])),
      1,
    ]);
  }
  if (checks.length === 0) return 1;
  let total = 0;
  let weight = 0;
  for (const [a, b] of checks) {
    total += a;
    weight += b;
  }
  return clamp01(total / weight);
}

// ---------- EARN + LOCK -------------------------------------------------

export function listEarned(
  activity: UserActivity,
  now: number
): EarnedBadge[] {
  const earned: EarnedBadge[] = [];
  for (const b of BADGE_CATALOG) {
    const e = isEarned(activity, b, now);
    if (e) earned.push(e);
  }
  return earned;
}

export function listLocked(activity: UserActivity): LockedBadge[] {
  const locked: LockedBadge[] = [];
  for (const b of BADGE_CATALOG) {
    if (activity.earnedBadgeIds.includes(b.id)) continue;
    const missing = missingRequirements(activity, b);
    if (missing.length === 0) continue; // earned but not in earnedBadgeIds
    locked.push({ badge: b, progress: badgeProgress(activity, b), missingRequirements: missing });
  }
  return locked.sort((a, b) => b.progress - a.progress);
}

export function nextAchievable(activity: UserActivity): BadgeDef | null {
  const locked = listLocked(activity);
  if (locked.length === 0) return null;
  return locked[0].badge;
}

// ---------- SHOWCASE ---------------------------------------------------

export function pickShowcase(
  earned: EarnedBadge[],
  catalog: BadgeDef[] = BADGE_CATALOG
): BadgeDef[] {
  const byId = new Map(catalog.map((b) => [b.id, b]));
  const defs: BadgeDef[] = [];
  for (const e of earned) {
    const d = byId.get(e.badgeId);
    if (d) defs.push(d);
  }
  // sort by rarity desc, then by id asc for determinism
  defs.sort((a, b) => {
    const r = RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
    if (r !== 0) return r;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return defs.slice(0, SHOWCASE_MAX);
}

// ---------- SHARE URL --------------------------------------------------

export function buildShareUrl(
  userId: string,
  badgeId: string,
  baseUrl: string = "https://cabala.app"
): BadgeShareUrl {
  const safe = baseUrl.replace(/\/+$/, "");
  const url = `${safe}/u/${encodeURIComponent(userId)}/badge/${encodeURIComponent(
    badgeId
  )}`;
  if (url.length > MAX_SHARE_URL_LENGTH) {
    return {
      url: url.slice(0, MAX_SHARE_URL_LENGTH),
      badgeId,
    };
  }
  return { url, badgeId };
}

// ---------- SNAPSHOT + SUMMARY ----------------------------------------

export function buildSnapshot(
  activity: UserActivity,
  now: number
): ProfileBadgeSnapshot {
  const earned = listEarned(activity, now);
  const locked = listLocked(activity);
  const showcase = pickShowcase(earned);
  return {
    earned,
    locked,
    showcase,
    nextBadge: nextAchievable(activity),
    counts: {
      total: BADGE_CATALOG.length,
      earned: earned.length,
      locked: locked.length,
      showcaseSize: showcase.length,
    },
  };
}

export function summarizeByFamily(
  earned: EarnedBadge[],
  catalog: BadgeDef[] = BADGE_CATALOG
): Record<BadgeFamily, number> {
  const out: Record<BadgeFamily, number> = {
    universalista: 0,
    leitura: 0,
    mentorship: 0,
    community: 0,
    moderation: 0,
  };
  const byId = new Map(catalog.map((b) => [b.id, b]));
  for (const e of earned) {
    const d = byId.get(e.badgeId);
    if (!d) continue;
    out[d.family] += 1;
  }
  return out;
}

// ---------- INTERNAL ---------------------------------------------------

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
