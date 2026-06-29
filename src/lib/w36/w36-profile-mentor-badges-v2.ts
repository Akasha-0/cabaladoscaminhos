/**
 * w36/profile-mentor-badges-v2.ts
 *
 * PATCH of w36/profile-mentor-badges.ts (cycle 36 audit fix).
 *
 * **Bug fixed (Verifier cycle 36 audit, real logic bug #2):**
 *   - Original `checkRequirement` for `min-tenure-months` used
 *     `Math.max(months, stats.longestMenteeMonths)`. This conflates two
 *     semantically different fields:
 *       (a) mentor's own tenure (months since joinedAt) — should be the gate
 *           for tier badges like "mentor-iv-master" (18mo) and
 *           "mentor-v-legend" (36mo).
 *       (b) the longest single mentee relationship (`longestMenteeMonths`) —
 *           should be the gate for relationship-longevity badges like
 *           "long-haul-mentor" (24mo with a single mentee).
 *     The Math.max allowed a brand-new mentor who happens to have a 3-year
 *     mentee to earn "mentor-v-legend" — clearly wrong.
 *   - This v2 splits the requirement into two explicit types:
 *       - `min-mentor-tenure-months` → uses `months` (time since joinedAt)
 *       - `min-mentee-tenure-months` → uses `stats.longestMenteeMonths`
 *     The 3 affected badge entries are updated to use the correct type. The
 *     old `min-tenure-months` type is removed (breaking change, but only
 *     affects the badge catalog, not the public API).
 *
 * **Compatibility:** the public function surface is unchanged. `MentorRequirement`
 * is an internal type; the change is additive in spirit (one type replaced by
 * two more specific types) and removes an ambiguity, not a feature.
 *
 * Pure TS, no runtime imports. Safe to import from server / edge / tests.
 *
 * Composes (same as v1):
 *   - w35/profile-reputation-badges
 *   - w29/mentorship-matching
 *   - w33/mentorship-session-detail
 *   - w36/mentorship-graduation-flow
 */

export type MentorTier = "I" | "II" | "III" | "IV" | "V";

export type MentorSpecialty =
  | "iniciante"
  | "intermediario"
  | "avancado"
  | "mestre"
  | "ritualista"
  | "terapeuta"
  | "curador"
  | "streamer"
  | "escritor"
  | "pesquisador";

export type MentorStats = {
  userId: string;
  displayName: string;
  tier: MentorTier;
  specialties: MentorSpecialty[];
  menteesActive: number;
  menteesGraduated: number;
  totalSessions: number;
  totalHours: number;
  averageRating: number; // 0-5
  ratingCount: number;
  retentionPct: number; // 0-100, mentees who stayed
  longestMenteeMonths: number;
  joinedAt: number;
};

export type MentorBadge = {
  id: string;
  label: string;
  description: string;
  tier: MentorTier;
  specialty: MentorSpecialty | "all";
  rarity: "comum" | "incomum" | "rara" | "epica" | "lendaria";
  requirements: MentorRequirement[];
  iconEmoji: string;
};

/**
 * v2 fix: split the ambiguous `min-tenure-months` into two specific types.
 * The old type is removed; consumers using the v1 catalog must migrate.
 */
export type MentorRequirement = {
  type:
    | "min-mentees-graduated"
    | "min-sessions"
    | "min-hours"
    | "min-rating"
    | "min-rating-count"
    | "min-retention"
    | "min-mentor-tenure-months" // NEW in v2 — mentor's own tenure
    | "min-mentee-tenure-months" // NEW in v2 — longest single mentee relationship
    | "specialty-match"
    | "tier-match";
  threshold: number;
  specialty?: MentorSpecialty;
  tier?: MentorTier;
};

export type BadgeProgress = {
  badge: MentorBadge;
  earned: boolean;
  metRequirements: number;
  totalRequirements: number;
  percent: number; // 0-100
  missing: string[];
};

export type MentorShowcase = {
  userId: string;
  selected: MentorBadge[]; // max 6
  displayOrder: string[]; // badge IDs in order
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const MENTOR_TIER_THRESHOLDS: Record<MentorTier, number> = {
  I: 10, // 10+ mentees graduated
  II: 25,
  III: 50,
  IV: 100,
  V: 200,
};

export const TIER_LABELS: Record<MentorTier, string> = {
  I: "Mentor I",
  II: "Mentor II",
  III: "Mentor III",
  IV: "Mentor IV",
  V: "Mentor V",
};

export const MENTOR_BADGE_CATALOG: MentorBadge[] = [
  {
    id: "mentor-i-initiation",
    label: "Mentor Iniciante",
    description: "Concluiu a primeira mentoria com sucesso.",
    tier: "I",
    specialty: "all",
    rarity: "comum",
    iconEmoji: "🌱",
    requirements: [
      { type: "min-mentees-graduated", threshold: 1 },
      { type: "min-sessions", threshold: 4 },
      { type: "min-rating", threshold: 3.5 },
    ],
  },
  {
    id: "mentor-ii-developing",
    label: "Mentor Desenvolvendo",
    description: "Concluiu 10+ mentorias com qualidade consistente.",
    tier: "II",
    specialty: "all",
    rarity: "comum",
    iconEmoji: "🌿",
    requirements: [
      { type: "min-mentees-graduated", threshold: 10 },
      { type: "min-sessions", threshold: 40 },
      { type: "min-hours", threshold: 30 },
      { type: "min-rating", threshold: 4.0 },
      { type: "min-rating-count", threshold: 5 },
    ],
  },
  {
    id: "mentor-iii-established",
    label: "Mentor Estabelecido",
    description: "50+ mentees formados, retenção comprovada.",
    tier: "III",
    specialty: "all",
    rarity: "incomum",
    iconEmoji: "🌳",
    requirements: [
      { type: "min-mentees-graduated", threshold: 50 },
      { type: "min-sessions", threshold: 200 },
      { type: "min-hours", threshold: 150 },
      { type: "min-rating", threshold: 4.2 },
      { type: "min-rating-count", threshold: 25 },
      { type: "min-retention", threshold: 70 },
    ],
  },
  {
    id: "mentor-iv-master",
    label: "Mentor Mestre",
    description: "100+ formações, autoridade reconhecida.",
    tier: "IV",
    specialty: "all",
    rarity: "rara",
    iconEmoji: "🏛️",
    requirements: [
      { type: "min-mentees-graduated", threshold: 100 },
      { type: "min-sessions", threshold: 500 },
      { type: "min-hours", threshold: 400 },
      { type: "min-rating", threshold: 4.5 },
      { type: "min-rating-count", threshold: 50 },
      { type: "min-retention", threshold: 80 },
      // v2 fix: was `min-tenure-months` (Math.max bug). Mentor tier badges
      // must use the mentor's own tenure, not mentee tenure.
      { type: "min-mentor-tenure-months", threshold: 18 },
    ],
  },
  {
    id: "mentor-v-legend",
    label: "Mentor Lendário",
    description: "200+ formações, contribuição transformadora.",
    tier: "V",
    specialty: "all",
    rarity: "lendaria",
    iconEmoji: "✨",
    requirements: [
      { type: "min-mentees-graduated", threshold: 200 },
      { type: "min-sessions", threshold: 1200 },
      { type: "min-hours", threshold: 1000 },
      { type: "min-rating", threshold: 4.7 },
      { type: "min-rating-count", threshold: 100 },
      { type: "min-retention", threshold: 85 },
      // v2 fix: was `min-tenure-months` (Math.max bug). Mentor tier badges
      // must use the mentor's own tenure, not mentee tenure.
      { type: "min-mentor-tenure-months", threshold: 36 },
    ],
  },
  {
    id: "specialty-iniciante",
    label: "Especialista em Iniciantes",
    description: "Mentor focado em receber novos praticantes.",
    tier: "I",
    specialty: "iniciante",
    rarity: "comum",
    iconEmoji: "🌅",
    requirements: [
      { type: "specialty-match", threshold: 1, specialty: "iniciante" },
      { type: "min-mentees-graduated", threshold: 5 },
    ],
  },
  {
    id: "specialty-mestre",
    label: "Mentor de Mestres",
    description: "Forma praticantes avançados e mestres.",
    tier: "IV",
    specialty: "mestre",
    rarity: "epica",
    iconEmoji: "🔮",
    requirements: [
      { type: "specialty-match", threshold: 1, specialty: "mestre" },
      { type: "min-mentees-graduated", threshold: 30 },
      { type: "tier-match", threshold: 4, tier: "IV" },
    ],
  },
  {
    id: "specialty-ritualista",
    label: "Facilitador de Rituais",
    description: "Conduz rituais e ceremonies de passagem.",
    tier: "III",
    specialty: "ritualista",
    rarity: "rara",
    iconEmoji: "🕯️",
    requirements: [
      { type: "specialty-match", threshold: 1, specialty: "ritualista" },
      { type: "min-sessions", threshold: 100 },
    ],
  },
  {
    id: "retention-champion",
    label: "Campeão de Retenção",
    description: "90%+ dos seus mentees continuam engajados.",
    tier: "III",
    specialty: "all",
    rarity: "rara",
    iconEmoji: "🛡️",
    requirements: [
      { type: "min-retention", threshold: 90 },
      { type: "min-mentees-graduated", threshold: 20 },
    ],
  },
  {
    id: "long-haul-mentor",
    label: "Mentor de Longa Data",
    description: "Mentee mais antigo passou 2+ anos com você.",
    tier: "III",
    specialty: "all",
    rarity: "incomum",
    iconEmoji: "⏳",
    requirements: [
      // v2 fix: was `min-tenure-months` (Math.max bug). Relationship-longevity
      // badges must use the longest single mentee relationship duration, not
      // the mentor's own tenure.
      { type: "min-mentee-tenure-months", threshold: 24 },
    ],
  },
];

export const RARITY_ORDER = [
  "comum",
  "incomum",
  "rara",
  "epica",
  "lendaria",
] as const;

export const SHOWCASE_MAX = 6;

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Compute the mentor tier from mentee count.
 */
export function computeMentorTier(menteesGraduated: number): MentorTier {
  let chosen: MentorTier = "I";
  for (const tier of ["I", "II", "III", "IV", "V"] as MentorTier[]) {
    if (menteesGraduated >= MENTOR_TIER_THRESHOLDS[tier]) {
      chosen = tier;
    }
  }
  return chosen;
}

/**
 * Compute mentor's own tenure in months (time since joinedAt).
 */
function mentorTenureMonths(stats: MentorStats, now: number): number {
  return (now - stats.joinedAt) / (30 * 24 * 3600 * 1000);
}

/**
 * Check if a single requirement is met.
 *
 * v2 fix: the `min-tenure-months` case is replaced by two explicit cases
 * that use the correct field. `Math.max` is gone.
 */
export function checkRequirement(
  req: MentorRequirement,
  stats: MentorStats,
  now: number,
): { met: boolean; reason: string } {
  switch (req.type) {
    case "min-mentees-graduated":
      return {
        met: stats.menteesGraduated >= req.threshold,
        reason: `menteesGraduated ${stats.menteesGraduated}/${req.threshold}`,
      };
    case "min-sessions":
      return {
        met: stats.totalSessions >= req.threshold,
        reason: `sessions ${stats.totalSessions}/${req.threshold}`,
      };
    case "min-hours":
      return {
        met: stats.totalHours >= req.threshold,
        reason: `hours ${stats.totalHours}/${req.threshold}`,
      };
    case "min-rating":
      return stats.ratingCount === 0
        ? { met: false, reason: "no ratings yet" }
        : {
            met: stats.averageRating >= req.threshold,
            reason: `rating ${stats.averageRating.toFixed(1)}/${req.threshold}`,
          };
    case "min-rating-count":
      return {
        met: stats.ratingCount >= req.threshold,
        reason: `ratingCount ${stats.ratingCount}/${req.threshold}`,
      };
    case "min-retention":
      return {
        met: stats.retentionPct >= req.threshold,
        reason: `retention ${stats.retentionPct}%/${req.threshold}%`,
      };
    case "min-mentor-tenure-months": {
      // v2 NEW: uses the mentor's own tenure, NOT mentee tenure.
      const months = mentorTenureMonths(stats, now);
      return {
        met: months >= req.threshold,
        reason: `mentorTenure ${Math.round(months)}mo/${req.threshold}mo`,
      };
    }
    case "min-mentee-tenure-months": {
      // v2 NEW: uses the longest single mentee relationship, NOT mentor tenure.
      const months = stats.longestMenteeMonths;
      return {
        met: months >= req.threshold,
        reason: `longestMenteeTenure ${Math.round(months)}mo/${req.threshold}mo`,
      };
    }
    case "specialty-match":
      return req.specialty !== undefined
        ? {
            met: stats.specialties.includes(req.specialty),
            reason: `specialty ${req.specialty}`,
          }
        : { met: false, reason: "no specialty specified" };
    case "tier-match":
      return req.tier !== undefined
        ? {
            met: stats.tier >= req.tier,
            reason: `tier ${stats.tier}/${req.tier}`,
          }
        : { met: false, reason: "no tier specified" };
  }
}

/**
 * Check if a badge is earned and how close.
 */
export function evaluateBadge(
  badge: MentorBadge,
  stats: MentorStats,
  now: number,
): BadgeProgress {
  const metRequirements: number = badge.requirements.filter((r) =>
    checkRequirement(r, stats, now).met,
  ).length;
  const totalRequirements = badge.requirements.length;
  const missing: string[] = badge.requirements
    .filter((r) => !checkRequirement(r, stats, now).met)
    .map((r) => checkRequirement(r, stats, now).reason);
  return {
    badge,
    earned: missing.length === 0,
    metRequirements,
    totalRequirements,
    percent:
      totalRequirements > 0
        ? Math.round((metRequirements / totalRequirements) * 100)
        : 0,
    missing,
  };
}

/**
 * Get all earned badges for a mentor.
 */
export function listEarnedBadges(
  stats: MentorStats,
  now: number,
): MentorBadge[] {
  return MENTOR_BADGE_CATALOG.filter(
    (b) => evaluateBadge(b, stats, now).earned,
  );
}

/**
 * Get all locked badges (not yet earned).
 */
export function listLockedBadges(
  stats: MentorStats,
  now: number,
): BadgeProgress[] {
  return MENTOR_BADGE_CATALOG
    .filter((b) => !evaluateBadge(b, stats, now).earned)
    .map((b) => evaluateBadge(b, stats, now));
}

/**
 * Get the next achievable badge (highest progress < 100%).
 */
export function findNextAchievable(
  stats: MentorStats,
  now: number,
): BadgeProgress | null {
  const locked = listLockedBadges(stats, now);
  if (locked.length === 0) return null;
  locked.sort((a, b) => b.percent - a.percent);
  return locked[0];
}

/**
 * Build a showcase from earned badges (max 6, ordered by rarity).
 */
export function buildShowcase(
  stats: MentorStats,
  now: number,
  preferredOrder: string[] = [],
): MentorShowcase {
  const earned = listEarnedBadges(stats, now);
  earned.sort((a, b) => {
    const ra = RARITY_ORDER.indexOf(a.rarity);
    const rb = RARITY_ORDER.indexOf(b.rarity);
    if (ra !== rb) return rb - ra;
    // honor preferred order
    const ia = preferredOrder.indexOf(a.id);
    const ib = preferredOrder.indexOf(b.id);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return 0;
  });
  const selected = earned.slice(0, SHOWCASE_MAX);
  return {
    userId: stats.userId,
    selected,
    displayOrder: selected.map((b) => b.id),
  };
}

/**
 * Summarize a mentor's badge portfolio.
 */
export function summarizeMentorBadges(
  stats: MentorStats,
  now: number,
): {
  total: number;
  earned: number;
  locked: number;
  byRarity: Record<"comum" | "incomum" | "rara" | "epica" | "lendaria", number>;
  nextBadge: BadgeProgress | null;
} {
  const all = MENTOR_BADGE_CATALOG;
  const earned = listEarnedBadges(stats, now);
  const locked = all.length - earned.length;
  const byRarity: Record<
    "comum" | "incomum" | "rara" | "epica" | "lendaria",
    number
  > = { comum: 0, incomum: 0, rara: 0, epica: 0, lendaria: 0 };
  for (const b of earned) byRarity[b.rarity]++;
  return {
    total: all.length,
    earned: earned.length,
    locked,
    byRarity,
    nextBadge: findNextAchievable(stats, now),
  };
}

/**
 * Validate that a MentorStats object has sensible values.
 */
export function validateMentorStats(stats: MentorStats): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (stats.averageRating < 0 || stats.averageRating > 5) {
    errors.push("averageRating must be between 0 and 5");
  }
  if (stats.retentionPct < 0 || stats.retentionPct > 100) {
    errors.push("retentionPct must be between 0 and 100");
  }
  if (stats.longestMenteeMonths < 0) {
    errors.push("longestMenteeMonths must be >= 0");
  }
  if (stats.joinedAt <= 0) {
    errors.push("joinedAt must be a positive epoch ms");
  }
  if (stats.ratingCount < 0) {
    errors.push("ratingCount must be >= 0");
  }
  if (stats.menteesGraduated < 0 || stats.menteesActive < 0) {
    errors.push("mentee counts must be >= 0");
  }
  if (stats.totalSessions < 0 || stats.totalHours < 0) {
    errors.push("session metrics must be >= 0");
  }
  return { ok: errors.length === 0, errors };
}
