/**
 * Mentorship 1-on-1 Pairing (Wave 29)
 *
 * Greedy weighted-tag matching between mentors and mentees.
 * Respects capacity, language overlap, and schedule compatibility.
 * Pure functions; no DB / no fetch.
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

export type Language = "pt-BR" | "en" | "es";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "initiate";

export interface MentorProfile {
  readonly id: string;
  readonly displayName: string;
  readonly traditions: readonly Tradition[];
  readonly languages: readonly Language[];
  readonly level: ExperienceLevel;
  /** Tags describe specific focus areas (e.g. "runas", "Odu", "kundalini"). */
  readonly tags: readonly string[];
  /** Max concurrent mentees this mentor is willing to host. */
  readonly capacity: number;
  /** Hours mentor is available per ISO week. */
  readonly weeklyHours: number;
  /** ISO weekday numbers (1-7) when mentor accepts sessions. */
  readonly availableDays: readonly number[];
}

export interface MenteeProfile {
  readonly id: string;
  readonly displayName: string;
  readonly traditions: readonly Tradition[];
  readonly languages: readonly Language[];
  readonly level: ExperienceLevel;
  readonly goals: readonly string[];
  /** How many hours per week the mentee wants to invest. */
  readonly weeklyHours: number;
  /** ISO weekday numbers (1-7) when mentee is available. */
  readonly availableDays: readonly number[];
}

export interface MentorshipPair {
  readonly mentorId: string;
  readonly menteeId: string;
  readonly score: number;
  readonly sharedTraditions: readonly Tradition[];
  readonly sharedLanguages: readonly Language[];
  readonly sharedDays: readonly number[];
}

export interface MatchingResult {
  readonly pairs: readonly MentorshipPair[];
  readonly waitingList: readonly string[]; // menteeIds that could not be paired
  readonly overCapacityMentors: readonly string[]; // mentors whose capacity was fully used
}

/** Normalise a tag string for comparison: lowercase, strip accents, collapse whitespace. */
export function normaliseTag(tag: string): string {
  return tag
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

/** Cosine-like score for two tag lists. Returns 0..1. */
export function tagOverlapScore(a: readonly string[], b: readonly string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a.map(normaliseTag));
  const setB = new Set(b.map(normaliseTag));
  let intersection = 0;
  for (const t of setA) if (setB.has(t)) intersection += 1;
  const denom = Math.sqrt(setA.size) * Math.sqrt(setB.size);
  return denom === 0 ? 0 : intersection / denom;
}

/** Intersection of two readonly arrays preserving order of the first. */
export function intersectPreserveFirst<T>(a: readonly T[], b: readonly T[]): T[] {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
}

/** Composite match score (0..1) for a (mentor, mentee) pair. */
export function matchScore(mentor: MentorProfile, mentee: MenteeProfile): number {
  const tag = tagOverlapScore(mentor.tags, mentee.goals);
  const traditions = intersectPreserveFirst(mentor.traditions, mentee.traditions);
  const traditionBonus = Math.min(traditions.length, 3) * 0.1;
  const languages = intersectPreserveFirst(mentor.languages, mentee.languages);
  const langBonus = languages.length > 0 ? 0.15 : -0.2;
  const days = intersectPreserveFirst([...mentor.availableDays], [...mentee.availableDays]);
  const dayBonus = days.length > 0 ? 0.1 : -0.25;
  // Level match: mentor above mentee is good, equal is neutral, below is bad.
  const order: Record<ExperienceLevel, number> = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
    initiate: 3,
  };
  const levelDelta = order[mentor.level] - order[mentee.level];
  const levelBonus = levelDelta >= 0 ? Math.min(levelDelta, 2) * 0.05 : -0.15;
  const raw = 0.5 * tag + traditionBonus + langBonus + dayBonus + levelBonus;
  return Math.max(0, Math.min(1, raw));
}

/** Greedy matching — each mentee assigned to highest-scoring compatible mentor with capacity. */
export function pairMentorMentee(
  mentors: readonly MentorProfile[],
  mentees: readonly MenteeProfile[],
): MatchingResult {
  // Stable copies with mutable capacity.
  const mentorState = new Map(mentors.map((m) => [m.id, { profile: m, remaining: m.capacity }]));
  const pairs: MentorshipPair[] = [];
  const waitingList: string[] = [];
  const overCapacity: string[] = [];

  // Sort mentees by goal specificity desc (more tags = more constrained = pair first).
  const orderedMentees = [...mentees].sort((a, b) => b.goals.length - a.goals.length);

  for (const mentee of orderedMentees) {
    let best: { mentorId: string; score: number } | null = null;
    for (const m of mentors) {
      const state = mentorState.get(m.id);
      if (!state || state.remaining <= 0) continue;
      // Hard filter: at least one shared language OR mentor speaks pt-BR and mentee is pt-BR.
      const sharedLang = intersectPreserveFirst(m.languages, mentee.languages).length > 0;
      if (!sharedLang) continue;
      const s = matchScore(m, mentee);
      if (s <= 0) continue;
      if (!best || s > best.score) best = { mentorId: m.id, score: s };
    }
    if (!best) {
      waitingList.push(mentee.id);
      continue;
    }
    const state = mentorState.get(best.mentorId)!;
    state.remaining -= 1;
    if (state.remaining === 0) overCapacity.push(best.mentorId);
    const mentor = state.profile;
    pairs.push({
      mentorId: mentor.id,
      menteeId: mentee.id,
      score: Number(best.score.toFixed(4)),
      sharedTraditions: intersectPreserveFirst(mentor.traditions, mentee.traditions),
      sharedLanguages: intersectPreserveFirst(mentor.languages, mentee.languages),
      sharedDays: intersectPreserveFirst([...mentor.availableDays], [...mentee.availableDays]),
    });
  }
  return { pairs, waitingList, overCapacityMentors: overCapacity };
}
