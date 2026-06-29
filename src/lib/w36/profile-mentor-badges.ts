/**
 * w36/profile-mentor-badges.ts
 *
 * Mentor-specific badge specialization. Extends the w35 badge system with
 * mentor-tier badges (mentor I → V), milestone-based mentorship awards,
 * and showcase selection.
 *
 * Composes:
 *   - w35/profile-reputation-badges (universalista badges, badge catalog)
 *   - w29/mentorship-matching (mentor profile + pairing)
 *   - w33/mentorship-session-detail (session view model)
 *   - w36/mentorship-graduation-flow (graduation level)
 *
 * Pure TS, no runtime imports.
 */

// ============================================================================
// TYPES
// ============================================================================

export type MentorTier = "I" | "II" | "III" | "IV" | "V";

export type MentorSpecialty =
  | "iniciante" // beginners
  | "intermediario" // intermediate
  | "avancado" // advanced
  | "mestre" // masters
  | "curador" // content curation
  | "terapeuta" // therapy/healing
  | "ritualista" // ritual facilitation
  | "escritor" // writing/content
  | "tradutor" // translation
  | "tecnologo"; // digital tools

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

export type MentorRequirement = {
  type:
    | "min-mentees-graduated"
    | "min-sessions"
    | "min-hours"
    | "min-rating"
    | "min-rating-count"
    | "min-retention"
    | "min-tenure-months"
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
    description: "Conduziu 10+ mentorias com qualidade consistente.",
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
      { type: "min-tenure-months", threshold: 18 },
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
      { type: "min-tenure-months", threshold: 36 },
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
      { type: "min-tenure-months", threshold: 24 },
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
 * Check if a single requirement is met.
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
    case "min-tenure-months": {
      const months = (now - stats.joinedAt) / (30 * 24 * 3600 * 1000);
      // also use longestMenteeMonths for some interpretations
      const tenure = Math.max(months, stats.longestMenteeMonths);
      return {
        met: tenure >= req.threshold,
        reason: `tenure ${Math.round(tenure)}mo/${req.threshold}mo`,
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
 * Build the showcase — top 6 badges by rarity + tier.
 */
export function buildShowcase(
  stats: MentorStats,
  now: number,
): MentorShowcase {
  const earned = listEarnedBadges(stats, now);
  // sort by rarity desc, then by tier
  const sorted = [...earned].sort((a, b) => {
    const ra = RARITY_ORDER.indexOf(a.rarity);
    const rb = RARITY_ORDER.indexOf(b.rarity);
    if (ra !== rb) return rb - ra;
    return b.tier.localeCompare(a.tier);
  });
  const top = sorted.slice(0, SHOWCASE_MAX);
  return {
    userId: stats.userId,
    selected: top,
    displayOrder: top.map((b) => b.id),
  };
}

/**
 * Pick the badge progression summary for a mentor.
 */
export function summarizeMentorBadges(
  stats: MentorStats,
  now: number,
): {
  earned: number;
  locked: number;
  totalCatalog: number;
  tier: MentorTier;
  showcaseCount: number;
  nextBadge: BadgeProgress | null;
} {
  const earned = listEarnedBadges(stats, now);
  const locked = listLockedBadges(stats, now);
  return {
    earned: earned.length,
    locked: locked.length,
    totalCatalog: MENTOR_BADGE_CATALOG.length,
    tier: computeMentorTier(stats.menteesGraduated),
    showcaseCount: Math.min(earned.length, SHOWCASE_MAX),
    nextBadge: findNextAchievable(stats, now),
  };
}

/**
 * Validate a mentor profile.
 */
export function validateMentorStats(stats: MentorStats): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!stats.userId) errors.push("userId is required");
  if (stats.averageRating < 0 || stats.averageRating > 5) {
    errors.push("averageRating must be 0-5");
  }
  if (stats.retentionPct < 0 || stats.retentionPct > 100) {
    errors.push("retentionPct must be 0-100");
  }
  if (stats.menteesActive < 0) {
    errors.push("menteesActive must be >= 0");
  }
  if (stats.totalSessions < 0) {
    errors.push("totalSessions must be >= 0");
  }
  return { ok: errors.length === 0, errors };
}
