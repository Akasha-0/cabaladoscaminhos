// src/lib/w38/mentorship-mentor-matching-v2.ts
// ML-style mentor-mentee matching: specialty × availability × tier composite score.
// Composes: w29/mentorship-matching (basic match), w36/w36-mentorship-graduation-flow-v2 (graduation state),
//           w36/w36-profile-mentor-badges-v2 (mentor tiers, min-mentor-tenure-months),
//           w33/mentorship-session-detail (cadence, format)

export type MentorTier = "iniciante" | "praticante" | "facilitador" | "mestre" | "grao_mestre";
export type MatchFormat = "1on1" | "group" | "async" | "hybrid";

export interface MentorProfile {
  mentorId: string;
  displayName: string;
  tier: MentorTier;
  specialties: string[];
  languages: string[];
  timezoneOffset: number; // hours from UTC, e.g. -3 for BRT
  availableHoursPerWeek: number;
  preferredFormats: MatchFormat[];
  mentorTenureMonths: number; // since joinedAt (uses new min-mentor-tenure-months field)
  maxMentees: number;
  currentMentees: number;
  averageRating: number; // 0..5
  completedMentorships: number;
  bioTags: string[];
  isAlumni: boolean;
}

export interface MenteeProfile {
  menteeId: string;
  displayName: string;
  desiredSpecialties: string[];
  languages: string[];
  timezoneOffset: number;
  desiredHoursPerWeek: number;
  preferredFormats: MatchFormat[];
  goalTags: string[];
  desiredTier: MentorTier | "any";
  urgency: "low" | "medium" | "high";
  experienceLevel: "beginner" | "intermediate" | "advanced";
}

export type MatchReasonKind =
  | "specialty_match"
  | "language_match"
  | "timezone_match"
  | "format_match"
  | "tier_preference"
  | "tier_upgrade"
  | "high_rating"
  | "available_capacity"
  | "alumni_bonus"
  | "tenure_bonus"
  | "low_experience_match"
  | "high_urgency_priority"
  | "format_mismatch"
  | "timezone_mismatch"
  | "tier_mismatch"
  | "no_specialty_overlap"
  | "capacity_full"
  | "low_rating";

export interface MatchReason {
  kind: MatchReasonKind;
  weight: number; // contribution to composite
  detail: string;
}

export interface MentorMatch {
  mentorId: string;
  displayName: string;
  score: number; // 0..1
  specialtyScore: number;
  availabilityScore: number;
  tierScore: number;
  formatScore: number;
  languageScore: number;
  capacityOk: boolean;
  reasons: MatchReason[];
  warnings: MatchReason[];
}

export interface MatchingWeights {
  specialty: number;
  availability: number;
  tier: number;
  format: number;
  language: number;
  rating: number;
  tenure: number;
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  specialty: 0.35,
  availability: 0.15,
  tier: 0.15,
  format: 0.1,
  language: 0.1,
  rating: 0.1,
  tenure: 0.05,
};

export const TIER_ORDER: MentorTier[] = ["iniciante", "praticante", "facilitador", "mestre", "grao_mestre"];

export const TIER_INDEX: Record<MentorTier, number> = {
  iniciante: 0,
  praticante: 1,
  facilitador: 2,
  mestre: 3,
  grao_mestre: 4,
};

export const TZ_OVERLAP_MIN_HOURS = 2;
export const HOURS_TOLERANCE = 0.5;
export const LOW_RATING_THRESHOLD = 3.5;
export const HIGH_RATING_THRESHOLD = 4.5;
export const ALUMNI_BONUS = 0.05;
export const TENURE_BONUS_PER_YEAR = 0.02;
export const TENURE_BONUS_CAP = 0.1;
export const URGENCY_HIGH_BONUS = 0.05;
export const EXPERIENCE_TIER_TARGET_OFFSET = 1; // mentee intermediate -> mentor praticante/facilitador

export function isValidTier(tier: string): tier is MentorTier {
  return TIER_ORDER.includes(tier as MentorTier);
}

export function tierIndex(tier: MentorTier): number {
  return TIER_INDEX[tier];
}

export function jaccardOverlap(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a.map((s) => s.toLowerCase()));
  const setB = new Set(b.map((s) => s.toLowerCase()));
  let inter = 0;
  for (const v of setA) if (setB.has(v)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function timezoneOverlapHours(mentorTz: number, menteeTz: number): number {
  const diff = Math.abs(mentorTz - menteeTz);
  const overlap = 24 - diff;
  return Math.max(0, Math.min(24, overlap));
}

export function hoursFitScore(mentorHours: number, menteeHours: number): number {
  if (mentorHours <= 0) return 0;
  const min = Math.min(mentorHours, menteeHours);
  const max = Math.max(mentorHours, menteeHours);
  if (min >= max) return 1;
  return min / max;
}

export function formatScore(mentor: MentorProfile, mentee: MenteeProfile): number {
  if (mentee.preferredFormats.length === 0) return 1;
  if (mentor.preferredFormats.length === 0) return 0.5;
  const set = new Set(mentor.preferredFormats);
  let match = 0;
  for (const f of mentee.preferredFormats) if (set.has(f)) match++;
  return match / mentee.preferredFormats.length;
}

export function languageScore(mentor: MentorProfile, mentee: MenteeProfile): number {
  if (mentee.languages.length === 0) return 1;
  if (mentor.languages.length === 0) return 0;
  const set = new Set(mentor.languages.map((s) => s.toLowerCase()));
  let match = 0;
  for (const l of mentee.languages) if (set.has(l.toLowerCase())) match++;
  return match / mentee.languages.length;
}

export function specialtyScore(mentor: MentorProfile, mentee: MenteeProfile): number {
  return jaccardOverlap(mentor.specialties, mentee.desiredSpecialties);
}

export function tierScore(mentor: MentorProfile, mentee: MenteeProfile): number {
  if (mentee.desiredTier === "any") return 0.7;
  const mIdx = tierIndex(mentor.tier);
  const dIdx = tierIndex(mentee.desiredTier);
  const diff = Math.abs(mIdx - dIdx);
  if (diff === 0) return 1;
  if (diff === 1) return 0.75;
  if (diff === 2) return 0.45;
  if (diff === 3) return 0.2;
  return 0.05;
}

export function ratingScore(mentor: MentorProfile): number {
  if (mentor.averageRating <= 0) return 0.5;
  return Math.max(0, Math.min(1, mentor.averageRating / 5));
}

export function tenureBonus(mentor: MentorProfile): number {
  const years = mentor.mentorTenureMonths / 12;
  return Math.min(TENURE_BONUS_CAP, years * TENURE_BONUS_PER_YEAR);
}

export function hasCapacity(mentor: MentorProfile): boolean {
  return mentor.currentMentees < mentor.maxMentees;
}

export function scoreMatch(
  mentor: MentorProfile,
  mentee: MenteeProfile,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS,
): MentorMatch {
  const reasons: MatchReason[] = [];
  const warnings: MatchReason[] = [];

  const sSpec = specialtyScore(mentor, mentee);
  if (sSpec > 0) {
    reasons.push({
      kind: "specialty_match",
      weight: sSpec * weights.specialty,
      detail: `specialty overlap ${(sSpec * 100).toFixed(0)}%`,
    });
  } else {
    warnings.push({
      kind: "no_specialty_overlap",
      weight: 0,
      detail: "no specialty overlap",
    });
  }

  const tzHours = timezoneOverlapHours(mentor.timezoneOffset, mentee.timezoneOffset);
  const sAvail = Math.min(1, tzHours / 8) * 0.5 + hoursFitScore(mentor.availableHoursPerWeek, mentee.desiredHoursPerWeek) * 0.5;
  if (tzHours >= TZ_OVERLAP_MIN_HOURS) {
    reasons.push({
      kind: "timezone_match",
      weight: (tzHours / 24) * weights.availability,
      detail: `${tzHours.toFixed(0)}h tz overlap`,
    });
  } else {
    warnings.push({
      kind: "timezone_mismatch",
      weight: 0,
      detail: `only ${tzHours.toFixed(0)}h tz overlap`,
    });
  }
  if (Math.abs(mentor.availableHoursPerWeek - mentee.desiredHoursPerWeek) <= HOURS_TOLERANCE) {
    reasons.push({
      kind: "available_capacity",
      weight: hoursFitScore(mentor.availableHoursPerWeek, mentee.desiredHoursPerWeek) * weights.availability * 0.5,
      detail: `hours fit`,
    });
  }

  const sTier = tierScore(mentor, mentee);
  if (mentee.desiredTier !== "any") {
    if (sTier >= 0.75) {
      reasons.push({
        kind: "tier_preference",
        weight: sTier * weights.tier,
        detail: `tier ${mentor.tier} matches`,
      });
    } else {
      warnings.push({
        kind: "tier_mismatch",
        weight: 0,
        detail: `tier ${mentor.tier} differs from desired ${mentee.desiredTier}`,
      });
    }
  } else {
    const mIdx = tierIndex(mentor.tier);
    const targetMenteeTierIdx = menteeIndexTier(mentee);
    if (mIdx >= targetMenteeTierIdx) {
      reasons.push({
        kind: "tier_upgrade",
        weight: 0.05,
        detail: `tier ${mentor.tier} supports ${mentee.experienceLevel}`,
      });
    }
  }

  const sFmt = formatScore(mentor, mentee);
  if (sFmt >= 0.5) {
    reasons.push({
      kind: "format_match",
      weight: sFmt * weights.format,
      detail: `format overlap ${(sFmt * 100).toFixed(0)}%`,
    });
  } else if (sFmt < 0.34) {
    warnings.push({
      kind: "format_mismatch",
      weight: 0,
      detail: "no overlapping format",
    });
  }

  const sLang = languageScore(mentor, mentee);
  if (sLang >= 0.5) {
    reasons.push({
      kind: "language_match",
      weight: sLang * weights.language,
      detail: `language overlap ${(sLang * 100).toFixed(0)}%`,
    });
  }

  const sRating = ratingScore(mentor);
  if (mentor.averageRating >= HIGH_RATING_THRESHOLD) {
    reasons.push({
      kind: "high_rating",
      weight: sRating * weights.rating,
      detail: `rating ${mentor.averageRating.toFixed(1)}`,
    });
  } else if (mentor.averageRating > 0 && mentor.averageRating < LOW_RATING_THRESHOLD) {
    warnings.push({
      kind: "low_rating",
      weight: 0,
      detail: `rating ${mentor.averageRating.toFixed(1)} below threshold`,
    });
  }

  const capacity = hasCapacity(mentor);
  if (!capacity) {
    warnings.push({
      kind: "capacity_full",
      weight: 0,
      detail: `mentor at capacity (${mentor.currentMentees}/${mentor.maxMentees})`,
    });
  }

  let total =
    sSpec * weights.specialty +
    sAvail * weights.availability +
    sTier * weights.tier +
    sFmt * weights.format +
    sLang * weights.language +
    sRating * weights.rating;
  const tb = tenureBonus(mentor);
  total += tb * weights.tenure;
  if (mentor.isAlumni) {
    reasons.push({
      kind: "alumni_bonus",
      weight: ALUMNI_BONUS,
      detail: "alumni mentor",
    });
    total += ALUMNI_BONUS;
  }
  if (tb > 0) {
    reasons.push({
      kind: "tenure_bonus",
      weight: tb * weights.tenure,
      detail: `${mentor.mentorTenureMonths}mo tenure`,
    });
  }
  if (mentee.urgency === "high") {
    reasons.push({
      kind: "high_urgency_priority",
      weight: URGENCY_HIGH_BONUS,
      detail: "high urgency",
    });
    total += URGENCY_HIGH_BONUS;
  }
  if (mentee.experienceLevel === "beginner" && tierIndex(mentor.tier) >= 2) {
    reasons.push({
      kind: "low_experience_match",
      weight: 0.03,
      detail: "experienced mentor for beginner",
    });
    total += 0.03;
  }
  if (!capacity) {
    total = total * 0.3;
  }
  const score = Math.max(0, Math.min(1, total));

  return {
    mentorId: mentor.mentorId,
    displayName: mentor.displayName,
    score,
    specialtyScore: sSpec,
    availabilityScore: sAvail,
    tierScore: sTier,
    formatScore: sFmt,
    languageScore: sLang,
    capacityOk: capacity,
    reasons,
    warnings,
  };
}

export function menteeIndexTier(mentee: MenteeProfile): number {
  switch (mentee.experienceLevel) {
    case "beginner": return 1;
    case "intermediate": return 2;
    case "advanced": return 3;
  }
}

export function rankMatches(matches: MentorMatch[]): MentorMatch[] {
  return [...matches].sort((a, b) => {
    if (a.capacityOk !== b.capacityOk) return a.capacityOk ? -1 : 1;
    return b.score - a.score;
  });
}

export function topMatches(
  mentors: MentorProfile[],
  mentee: MenteeProfile,
  limit: number = 5,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS,
): MentorMatch[] {
  const matches = mentors.map((m) => scoreMatch(m, mentee, weights));
  return rankMatches(matches).slice(0, limit);
}

export function buildMatchingWeights(overrides: Partial<MatchingWeights> = {}): MatchingWeights {
  return { ...DEFAULT_MATCHING_WEIGHTS, ...overrides };
}

export function summarizeMatch(match: MentorMatch): string {
  const top = [...match.reasons]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((r) => r.detail)
    .join("; ");
  const warn = match.warnings.length > 0 ? ` [warn: ${match.warnings[0].detail}]` : "";
  return `match[${match.displayName}]: score=${match.score.toFixed(2)} cap=${match.capacityOk ? "ok" : "full"} | ${top}${warn}`;
}

export function summarizeMatches(matches: MentorMatch[]): string {
  if (matches.length === 0) return "matches: none";
  const avg = matches.reduce((s, m) => s + m.score, 0) / matches.length;
  const capOk = matches.filter((m) => m.capacityOk).length;
  return `matches: n=${matches.length} avg=${avg.toFixed(2)} cap_ok=${capOk} top=${matches[0].displayName}(${matches[0].score.toFixed(2)})`;
}
