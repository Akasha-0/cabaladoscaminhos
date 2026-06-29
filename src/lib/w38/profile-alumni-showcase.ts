// src/lib/w38/profile-alumni-showcase.ts
// Dedicated alumni profile section using the new min-mentor-tenure-months field.
// Composes: w36/w36-profile-mentor-badges-v2 (mentor tiers, min-mentor-tenure-months, longestMenteeMonths),
//           w36/w36-mentorship-graduation-flow-v2 (graduation state, alumni transition),
//           w29/reputation-universalista (REPUTATION_TIERS, tier ordering)

export type MentorTier = "iniciante" | "praticante" | "facilitador" | "mestre" | "grao_mestre";

export interface MentorStats {
  joinedAt: number; // epoch ms
  mentorTenureMonths: number; // computed from joinedAt (uses new min-mentor-tenure-months)
  longestMenteeMonths: number;
  totalMentees: number;
  activeMentees: number;
  completedMentorships: number;
  graduationDate: number | null; // epoch ms or null if not graduated
  averageRating: number; // 0..5
  totalSessions: number;
  specialties: string[];
  languages: string[];
}

export type AlumniLevel = "novato" | "estabelecido" | "veterano" | "lendario";

export interface AlumniAchievement {
  achievementId: string;
  title: string;
  description: string;
  earnedAt: number;
  tier: MentorTier;
}

export interface AlumniTestimonial {
  testimonialId: string;
  menteeId: string;
  menteeName: string;
  rating: number;
  text: string;
  createdAt: number;
  approvedAt: number | null;
}

export interface AlumniSpotlight {
  spotlightId: string;
  title: string;
  description: string;
  startedAt: number;
  endedAt: number | null;
}

export type ShowcaseSectionKind =
  | "achievements"
  | "mentees_trained"
  | "testimonials"
  | "spotlights"
  | "specialties"
  | "graduation_info"
  | "tenure_milestones";

export interface ShowcaseSection {
  kind: ShowcaseSectionKind;
  title: string;
  visible: boolean;
  order: number;
}

export interface AlumniProfile {
  userId: string;
  displayName: string;
  tier: MentorTier;
  isAlumni: boolean;
  alumniLevel: AlumniLevel;
  achievements: AlumniAchievement[];
  menteesTrained: number;
  testimonials: AlumniTestimonial[];
  spotlights: AlumniSpotlight[];
  graduationDate: number | null;
  tenureMonths: number;
  averageRating: number;
  showcase: ShowcaseSection[];
  bioHighlights: string[];
  isPubliclyVisible: boolean;
}

export interface AlumniDirectoryEntry {
  userId: string;
  displayName: string;
  tier: MentorTier;
  alumniLevel: AlumniLevel;
  menteesTrained: number;
  averageRating: number;
  joinedAt: number;
  isPubliclyVisible: boolean;
}

export interface AlumniRosterStats {
  totalAlumni: number;
  byTier: Record<MentorTier, number>;
  byLevel: Record<AlumniLevel, number>;
  totalMenteesTrained: number;
  averageTenureMonths: number;
  averageRating: number;
}

export const TIER_ORDER: MentorTier[] = ["iniciante", "praticante", "facilitador", "mestre", "grao_mestre"];
export const TIER_INDEX: Record<MentorTier, number> = {
  iniciante: 0,
  praticante: 1,
  facilitador: 2,
  mestre: 3,
  grao_mestre: 4,
};

export const ALUMNI_LEVEL_THRESHOLDS: Record<AlumniLevel, number> = {
  novato: 0,
  estabelecido: 12,
  veterano: 24,
  lendario: 36,
};

export const TENURE_MILESTONES_MONTHS: number[] = [3, 6, 12, 18, 24, 36, 48, 60];
export const MIN_TENURE_FOR_ALUMNI_MONTHS = 12;
export const MAX_TESTIMONIALS = 6;
export const MAX_ACHIEVEMENTS = 12;
export const MAX_BIO_HIGHLIGHTS = 4;
export const MIN_RATING_FOR_TESTIMONIAL_FEATURE = 4.0;
export const MIN_MENTEES_FOR_VETERAN = 10;
export const MIN_RATING_FOR_LEGENDARY = 4.5;
export const SPOTLIGHT_MAX_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export function isValidTier(tier: string): tier is MentorTier {
  return TIER_ORDER.includes(tier as MentorTier);
}

export function tierIndex(tier: MentorTier): number {
  return TIER_INDEX[tier];
}

export function tenureMonthsAt(joinedAt: number, now: number): number {
  if (now <= joinedAt) return 0;
  return Math.floor((now - joinedAt) / (30 * 24 * 60 * 60 * 1000));
}

export function meetsAlumniCriteria(stats: MentorStats, now: number): boolean {
  const months = tenureMonthsAt(stats.joinedAt, now);
  return months >= MIN_TENURE_FOR_ALUMNI_MONTHS && stats.totalMentees > 0;
}

export function classifyAlumniLevel(stats: MentorStats, now: number): AlumniLevel {
  const months = tenureMonthsAt(stats.joinedAt, now);
  if (months >= ALUMNI_LEVEL_THRESHOLDS.lendario && stats.totalMentees >= MIN_RATING_FOR_LEGENDARY * 10) {
    return "lendario";
  }
  if (months >= ALUMNI_LEVEL_THRESHOLDS.veterano) return "veterano";
  if (months >= ALUMNI_LEVEL_THRESHOLDS.estabelecido) return "estabelecido";
  return "novato";
}

export function tenureMilestonesReached(stats: MentorStats, now: number): number[] {
  const months = tenureMonthsAt(stats.joinedAt, now);
  return TENURE_MILESTONES_MONTHS.filter((m) => months >= m);
}

export function buildAchievements(stats: MentorStats, now: number): AlumniAchievement[] {
  const out: AlumniAchievement[] = [];
  const months = tenureMonthsAt(stats.joinedAt, now);
  for (const m of tenureMilestonesReached(stats, now)) {
    out.push({
      achievementId: `tenure-${m}mo`,
      title: `${m} months mentor tenure`,
      description: `Sustained mentoring for ${m} consecutive months`,
      earnedAt: stats.joinedAt + m * 30 * 24 * 60 * 60 * 1000,
      tier: tierForTenure(m),
    });
  }
  if (stats.totalMentees >= 5) {
    out.push({
      achievementId: "mentees-5",
      title: "5 mentees trained",
      description: "Guided 5 mentees through their journey",
      earnedAt: now,
      tier: "praticante",
    });
  }
  if (stats.totalMentees >= MIN_MENTEES_FOR_VETERAN) {
    out.push({
      achievementId: "mentees-10",
      title: "10 mentees trained",
      description: "Guided 10 mentees through their journey",
      earnedAt: now,
      tier: "mestre",
    });
  }
  if (stats.averageRating >= MIN_RATING_FOR_LEGENDARY) {
    out.push({
      achievementId: "rating-legendary",
      title: "Legendary rating",
      description: `Maintained ${stats.averageRating.toFixed(1)}+ average rating`,
      earnedAt: now,
      tier: "grao_mestre",
    });
  }
  if (stats.graduationDate !== null) {
    out.push({
      achievementId: "graduated",
      title: "Graduated mentor",
      description: "Completed formal mentorship graduation",
      earnedAt: stats.graduationDate,
      tier: "mestre",
    });
  }
  return out.slice(0, MAX_ACHIEVEMENTS);
}

export function tierForTenure(months: number): MentorTier {
  if (months >= 36) return "grao_mestre";
  if (months >= 24) return "mestre";
  if (months >= 12) return "facilitador";
  if (months >= 6) return "praticante";
  return "iniciante";
}

export function pickFeaturedTestimonials(testimonials: AlumniTestimonial[]): AlumniTestimonial[] {
  const approved = testimonials.filter((t) => t.approvedAt !== null);
  approved.sort((a, b) => {
    if (a.rating !== b.rating) return b.rating - a.rating;
    return (b.approvedAt ?? 0) - (a.approvedAt ?? 0);
  });
  return approved.slice(0, MAX_TESTIMONIALS);
}

export function buildBioHighlights(stats: MentorStats): string[] {
  const out: string[] = [];
  if (stats.totalMentees > 0) out.push(`Mentored ${stats.totalMentees} practitioners`);
  if (stats.averageRating >= MIN_RATING_FOR_LEGENDARY) out.push(`Top-rated mentor (${stats.averageRating.toFixed(1)}★)`);
  if (stats.totalSessions >= 100) out.push(`${stats.totalSessions}+ sessions facilitated`);
  if (stats.specialties.length > 0) out.push(`Specializes in ${stats.specialties.slice(0, 3).join(", ")}`);
  return out.slice(0, MAX_BIO_HIGHLIGHTS);
}

export function defaultShowcaseOrder(): ShowcaseSectionKind[] {
  return [
    "graduation_info",
    "achievements",
    "tenure_milestones",
    "mentees_trained",
    "testimonials",
    "spotlights",
    "specialties",
  ];
}

export function buildShowcaseSections(
  stats: MentorStats,
  isPubliclyVisible: boolean,
): ShowcaseSection[] {
  const order = defaultShowcaseOrder();
  return order.map((kind, idx) => ({
    kind,
    title: titleForSection(kind),
    visible: isSectionVisible(kind, stats, isPubliclyVisible),
    order: idx,
  }));
}

export function titleForSection(kind: ShowcaseSectionKind): string {
  switch (kind) {
    case "achievements": return "Achievements";
    case "mentees_trained": return "Mentees Trained";
    case "testimonials": return "Testimonials";
    case "spotlights": return "Spotlights";
    case "specialties": return "Specialties";
    case "graduation_info": return "Graduation";
    case "tenure_milestones": return "Tenure Milestones";
  }
}

export function isSectionVisible(
  kind: ShowcaseSectionKind,
  stats: MentorStats,
  isPubliclyVisible: boolean,
): boolean {
  if (!isPubliclyVisible && kind === "testimonials") return false;
  switch (kind) {
    case "graduation_info": return stats.graduationDate !== null;
    case "achievements": return true;
    case "tenure_milestones": return true;
    case "mentees_trained": return stats.totalMentees > 0;
    case "testimonials": return stats.totalMentees > 0;
    case "spotlights": return true;
    case "specialties": return stats.specialties.length > 0;
  }
}

export function buildAlumniProfile(
  userId: string,
  displayName: string,
  tier: MentorTier,
  stats: MentorStats,
  testimonials: AlumniTestimonial[],
  spotlights: AlumniSpotlight[],
  isPubliclyVisible: boolean,
  now: number,
): AlumniProfile {
  const isAlumni = meetsAlumniCriteria(stats, now);
  const alumniLevel = isAlumni ? classifyAlumniLevel(stats, now) : "novato";
  const achievements = buildAchievements(stats, now);
  const featured = pickFeaturedTestimonials(testimonials);
  const showcase = buildShowcaseSections(stats, isPubliclyVisible);
  return {
    userId,
    displayName,
    tier,
    isAlumni,
    alumniLevel,
    achievements,
    menteesTrained: stats.totalMentees,
    testimonials: featured,
    spotlights,
    graduationDate: stats.graduationDate,
    tenureMonths: tenureMonthsAt(stats.joinedAt, now),
    averageRating: stats.averageRating,
    showcase,
    bioHighlights: buildBioHighlights(stats),
    isPubliclyVisible,
  };
}

export function buildAlumniDirectory(
  profiles: AlumniProfile[],
): AlumniDirectoryEntry[] {
  return profiles
    .filter((p) => p.isAlumni)
    .map((p) => ({
      userId: p.userId,
      displayName: p.displayName,
      tier: p.tier,
      alumniLevel: p.alumniLevel,
      menteesTrained: p.menteesTrained,
      averageRating: p.averageRating,
      joinedAt: 0,
      isPubliclyVisible: p.isPubliclyVisible,
    }))
    .sort((a, b) => {
      const tierDiff = tierIndex(b.tier) - tierIndex(a.tier);
      if (tierDiff !== 0) return tierDiff;
      return b.menteesTrained - a.menteesTrained;
    });
}

export function buildRosterStats(profiles: AlumniProfile[], now: number): AlumniRosterStats {
  const alumni = profiles.filter((p) => p.isAlumni);
  const byTier: Record<MentorTier, number> = {
    iniciante: 0, praticante: 0, facilitador: 0, mestre: 0, grao_mestre: 0,
  };
  const byLevel: Record<AlumniLevel, number> = {
    novato: 0, estabelecido: 0, veterano: 0, lendario: 0,
  };
  let totalMentees = 0;
  let totalTenure = 0;
  let totalRating = 0;
  for (const p of alumni) {
    byTier[p.tier] = (byTier[p.tier] || 0) + 1;
    byLevel[p.alumniLevel] = (byLevel[p.alumniLevel] || 0) + 1;
    totalMentees += p.menteesTrained;
    totalTenure += p.tenureMonths;
    totalRating += p.averageRating;
  }
  return {
    totalAlumni: alumni.length,
    byTier,
    byLevel,
    totalMenteesTrained: totalMentees,
    averageTenureMonths: alumni.length === 0 ? 0 : totalTenure / alumni.length,
    averageRating: alumni.length === 0 ? 0 : totalRating / alumni.length,
  };
}

export function summarizeAlumniProfile(profile: AlumniProfile): string {
  const visibleSections = profile.showcase.filter((s) => s.visible).length;
  return [
    `alumni[${profile.displayName}]: tier=${profile.tier}`,
    `level=${profile.alumniLevel}`,
    `tenure=${profile.tenureMonths}mo`,
    `mentees=${profile.menteesTrained}`,
    `rating=${profile.averageRating.toFixed(2)}`,
    `ach=${profile.achievements.length}`,
    `test=${profile.testimonials.length}`,
    `sec_vis=${visibleSections}/${profile.showcase.length}`,
  ].join(" | ");
}

export function summarizeRosterStats(stats: AlumniRosterStats): string {
  return [
    `roster: alumni=${stats.totalAlumni}`,
    `mentees_total=${stats.totalMenteesTrained}`,
    `avg_tenure=${stats.averageTenureMonths.toFixed(0)}mo`,
    `avg_rating=${stats.averageRating.toFixed(2)}`,
    `tiers[I/P/F/M/G]=${stats.byTier.iniciante}/${stats.byTier.praticante}/${stats.byTier.facilitador}/${stats.byTier.mestre}/${stats.byTier.grao_mestre}`,
    `levels[N/E/V/L]=${stats.byLevel.novato}/${stats.byLevel.estabelecido}/${stats.byLevel.veterano}/${stats.byLevel.lendario}`,
  ].join(" | ");
}
