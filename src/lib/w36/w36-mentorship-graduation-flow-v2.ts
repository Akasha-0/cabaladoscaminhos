/**
 * w36/mentorship-graduation-flow-v2.ts
 *
 * PATCH of w36/mentorship-graduation-flow.ts (cycle 36 audit fix #3).
 *
 * **Bug fixed (Verifier cycle 36 audit, non-blocking nit):**
 *   - `suggestFollowUpCadence(track, level, customCadences?)` declared a
 *     `track: MentorshipTrack` parameter that was never read in the body
 *     (the cadence is driven entirely by `level`). Would fail
 *     `--noUnusedParameters` / `--noUnusedLocals` under strict CI gate.
 *   - `trackPipeline(mentees, now)` declared a `now: number` parameter
 *     that was never read in the body (the function is a pure aggregation
 *     over the current state, not a time-windowed query).
 *   - v2 drops both unused parameters. Behavior is unchanged; only the
 *     public API surface is tightened.
 *
 * **Compatibility:** the two function signatures are narrower than v1.
 * Callers passing the old (unused) arguments are no longer type-correct.
 * Migrate by removing the now-unused argument at the call site.
 *
 * Pure TS, no runtime imports. Safe to import from server / edge / tests.
 *
 * Composes (same as v1):
 *   - w35/mentorship-goal-tracking (SMART goals, progress %, action items)
 *   - w33/mentorship-session-detail (session view model, action items)
 *   - w29/mentorship-matching (initial pair formation)
 */

// ============================================================================
// TYPES
// ============================================================================

export type MentorshipTrack =
  | "iniciante" // 0-3 months
  | "intermediario" // 3-9 months
  | "avancado" // 9-18 months
  | "mestre"; // 18+ months

export type GraduationLevel = "bronze" | "prata" | "ouro" | "diamante";

export type MentorshipMilestone = {
  id: string;
  label: string;
  description: string;
  track: MentorshipTrack;
  weight: number; // 1-10, contribution to graduation score
  required: boolean;
  achievedAt: number | null; // epoch ms
  evidence: string; // link / quote / artifact reference
};

export type GraduationCriteria = {
  track: MentorshipTrack;
  minMilestones: number;
  minRequiredMilestones: number;
  minGoalCompletionPct: number; // 0-100
  minSessionsAttended: number;
  minDaysEngaged: number;
  minFeedbackScore: number; // 0-5
};

export type MenteeProfile = {
  id: string;
  displayName: string;
  track: MentorshipTrack;
  enrolledAt: number;
  milestones: MentorshipMilestone[];
  sessionsAttended: number;
  goalCompletionPct: number;
  daysEngaged: number;
  feedbackScore: number; // 0-5
  feedbackCount: number;
};

export type GraduationCertificate = {
  id: string;
  menteeId: string;
  track: MentorshipTrack;
  level: GraduationLevel;
  issuedAt: number;
  milestonesCompleted: number;
  milestonesRequired: number;
  goalCompletionPct: number;
  certificateNumber: string; // e.g. CERT-2026-001337
  signatureLine: string;
  validUntil: number | null; // null = lifetime
  shareUrl: string;
};

export type AlumniStatus = {
  userId: string;
  isAlumni: boolean;
  alumniSince: number | null;
  track: MentorshipTrack;
  level: GraduationLevel;
  canMentor: boolean;
  canAccessAdvancedResources: boolean;
  mentorshipQuota: number; // mentees they can take
  perksUnlocked: string[];
};

export type FollowUpCadence = {
  intervalDays: number;
  channel: "email" | "push" | "in-app";
  template: string;
  enabled: boolean;
};

export type GraduationFlowState =
  | "enrolled"
  | "in-progress"
  | "eligible"
  | "graduated"
  | "alumni";

// ============================================================================
// CONSTANTS
// ============================================================================

export const TRACK_CRITERIA: Record<MentorshipTrack, GraduationCriteria> = {
  iniciante: {
    track: "iniciante",
    minMilestones: 5,
    minRequiredMilestones: 3,
    minGoalCompletionPct: 60,
    minSessionsAttended: 6,
    minDaysEngaged: 60,
    minFeedbackScore: 3.5,
  },
  intermediario: {
    track: "intermediario",
    minMilestones: 8,
    minRequiredMilestones: 5,
    minGoalCompletionPct: 70,
    minSessionsAttended: 12,
    minDaysEngaged: 120,
    minFeedbackScore: 3.8,
  },
  avancado: {
    track: "avancado",
    minMilestones: 10,
    minRequiredMilestones: 7,
    minGoalCompletionPct: 80,
    minSessionsAttended: 20,
    minDaysEngaged: 240,
    minFeedbackScore: 4.0,
  },
  mestre: {
    track: "mestre",
    minMilestones: 12,
    minRequiredMilestones: 9,
    minGoalCompletionPct: 90,
    minSessionsAttended: 30,
    minDaysEngaged: 365,
    minFeedbackScore: 4.3,
  },
};

export const LEVEL_THRESHOLDS: { level: GraduationLevel; minPct: number }[] = [
  { level: "bronze", minPct: 60 },
  { level: "prata", minPct: 70 },
  { level: "ouro", minPct: 80 },
  { level: "diamante", minPct: 90 },
];

export const DEFAULT_FOLLOW_UP_CADENCES: FollowUpCadence[] = [
  {
    intervalDays: 7,
    channel: "email",
    template: "mentorship.alumni.week-1",
    enabled: true,
  },
  {
    intervalDays: 30,
    channel: "email",
    template: "mentorship.alumni.month-1",
    enabled: true,
  },
  {
    intervalDays: 90,
    channel: "email",
    template: "mentorship.alumni.quarter-1",
    enabled: true,
  },
  {
    intervalDays: 180,
    channel: "in-app",
    template: "mentorship.alumni.semi-annual",
    enabled: false,
  },
];

export const ALUMNI_MENTOR_QUOTA: Record<GraduationLevel, number> = {
  bronze: 1,
  prata: 2,
  ouro: 3,
  diamante: 5,
};

export const TRACK_DURATION_DAYS: Record<MentorshipTrack, number> = {
  iniciante: 90,
  intermediario: 180,
  avancado: 270,
  mestre: 365,
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Compute current graduation level from overall completion percentage.
 */
export function computeGraduationLevel(completionPct: number): GraduationLevel {
  let chosen: GraduationLevel = "bronze";
  for (const t of LEVEL_THRESHOLDS) {
    if (completionPct >= t.minPct) {
      chosen = t.level;
    }
  }
  return chosen;
}

/**
 * Compute overall graduation completion percentage (0-100).
 * Weighted: 40% milestones + 30% goal completion + 30% session/engagement.
 */
export function computeCompletionPct(
  mentee: MenteeProfile,
  criteria: GraduationCriteria,
): number {
  const achievedMilestones = mentee.milestones.filter(
    (m) => m.achievedAt !== null,
  ).length;
  const requiredMilestones = mentee.milestones.filter((m) => m.required).length;
  const achievedRequired = mentee.milestones.filter(
    (m) => m.required && m.achievedAt !== null,
  ).length;

  const milestonePct =
    requiredMilestones > 0
      ? Math.min(100, (achievedRequired / criteria.minRequiredMilestones) * 100)
      : Math.min(100, (achievedMilestones / criteria.minMilestones) * 100);

  const goalPct = Math.min(100, mentee.goalCompletionPct);

  const sessionPct = Math.min(
    100,
    (mentee.sessionsAttended / criteria.minSessionsAttended) * 100,
  );

  const overall =
    milestonePct * 0.4 + goalPct * 0.3 + sessionPct * 0.3;
  return Math.round(overall * 100) / 100;
}

/**
 * Check if a mentee is eligible for graduation.
 */
export function checkGraduationEligibility(
  mentee: MenteeProfile,
  criteria: GraduationCriteria = TRACK_CRITERIA[mentee.track],
): { eligible: boolean; missing: string[] } {
  const missing: string[] = [];
  const achieved = mentee.milestones.filter((m) => m.achievedAt !== null);
  const achievedRequired = mentee.milestones.filter(
    (m) => m.required && m.achievedAt !== null,
  );

  if (achieved.length < criteria.minMilestones) {
    missing.push(
      `Faltam ${criteria.minMilestones - achieved.length} marcos`,
    );
  }
  if (achievedRequired.length < criteria.minRequiredMilestones) {
    missing.push(
      `Faltam ${criteria.minRequiredMilestones - achievedRequired.length} marcos obrigatórios`,
    );
  }
  if (mentee.goalCompletionPct < criteria.minGoalCompletionPct) {
    missing.push(
      `Conclusão de metas: ${mentee.goalCompletionPct}% (mín ${criteria.minGoalCompletionPct}%)`,
    );
  }
  if (mentee.sessionsAttended < criteria.minSessionsAttended) {
    missing.push(
      `Sessões: ${mentee.sessionsAttended} (mín ${criteria.minSessionsAttended})`,
    );
  }
  if (mentee.daysEngaged < criteria.minDaysEngaged) {
    missing.push(
      `Dias engajados: ${mentee.daysEngaged} (mín ${criteria.minDaysEngaged})`,
    );
  }
  if (mentee.feedbackCount > 0 && mentee.feedbackScore < criteria.minFeedbackScore) {
    missing.push(
      `Feedback: ${mentee.feedbackScore.toFixed(1)} (mín ${criteria.minFeedbackScore})`,
    );
  }

  return { eligible: missing.length === 0, missing };
}

/**
 * Determine the current state of the graduation flow.
 */
export function determineFlowState(mentee: MenteeProfile): GraduationFlowState {
  const criteria = TRACK_CRITERIA[mentee.track];
  const { eligible } = checkGraduationEligibility(mentee, criteria);
  if (eligible) return "eligible";
  const completionPct = computeCompletionPct(mentee, criteria);
  if (completionPct >= 100) return "eligible";
  if (mentee.milestones.some((m) => m.achievedAt !== null)) return "in-progress";
  return "enrolled";
}

/**
 * Generate a certificate for a graduating mentee.
 */
export function generateCertificate(
  mentee: MenteeProfile,
  now: number,
  certificateCounter: number = 1,
): GraduationCertificate {
  const criteria = TRACK_CRITERIA[mentee.track];
  const completionPct = computeCompletionPct(mentee, criteria);
  const level = computeGraduationLevel(completionPct);
  const achieved = mentee.milestones.filter((m) => m.achievedAt !== null);
  const required = mentee.milestones.filter((m) => m.required);
  const year = new Date(now).getUTCFullYear();
  const certNumber = `CERT-${year}-${String(certificateCounter).padStart(6, "0")}`;
  return {
    id: `cert-${mentee.id}-${now}`,
    menteeId: mentee.id,
    track: mentee.track,
    level,
    issuedAt: now,
    milestonesCompleted: achieved.length,
    milestonesRequired: required.length,
    goalCompletionPct: completionPct,
    certificateNumber: certNumber,
    signatureLine: `Mentoria Cabala dos Caminhos • ${level.toUpperCase()}`,
    validUntil: null,
    shareUrl: `https://cabaladoscaminhos.com/certificates/${certNumber}`,
  };
}

/**
 * Assign alumni status after graduation.
 */
export function assignAlumniStatus(
  mentee: MenteeProfile,
  certificate: GraduationCertificate,
  now: number,
): AlumniStatus {
  return {
    userId: mentee.id,
    isAlumni: true,
    alumniSince: now,
    track: certificate.track,
    level: certificate.level,
    canMentor: true,
    canAccessAdvancedResources: true,
    mentorshipQuota: ALUMNI_MENTOR_QUOTA[certificate.level],
    perksUnlocked: buildPerksList(certificate.level),
  };
}

/**
 * Build perks unlocked for a graduation level.
 */
export function buildPerksList(level: GraduationLevel): string[] {
  const base = ["Perfil com badge de alumni", "Acesso à comunidade de egressos"];
  const levelPerks: Record<GraduationLevel, string[]> = {
    bronze: ["Desconto de 10% em cursos avançados"],
    prata: [
      "Desconto de 15% em cursos avançados",
      "Acesso a eventos exclusivos mensais",
    ],
    ouro: [
      "Desconto de 25% em cursos avançados",
      "Acesso a retiros sazonais",
      "Sessão de mentoria 1:1 trimestral",
    ],
    diamante: [
      "Desconto de 40% em cursos avançados",
      "Acesso vitalício a conteúdo premium",
      "Pode co-criar trilhas de mentoria",
      "Convite para conselho consultivo",
    ],
  };
  return [...base, ...levelPerks[level]];
}

/**
 * Suggest a follow-up cadence for an alumnus.
 *
 * v2 fix: `track` parameter removed. The cadence is fully driven by `level`;
 * `track` was unused. Callers that previously passed `track` should simply
 * drop the argument.
 */
export function suggestFollowUpCadence(
  level: GraduationLevel,
  customCadences: FollowUpCadence[] = DEFAULT_FOLLOW_UP_CADENCES,
): FollowUpCadence[] {
  // Higher level alumni get less frequent touchpoints
  const intervalMultiplier: Record<GraduationLevel, number> = {
    bronze: 1.0,
    prata: 1.5,
    ouro: 2.0,
    diamante: 3.0,
  };
  const mult = intervalMultiplier[level];
  return customCadences.map((c) => ({
    ...c,
    intervalDays: Math.round(c.intervalDays * mult),
  }));
}

/**
 * Compute the next follow-up date for an alumnus.
 */
export function computeNextFollowUp(
  lastFollowUp: number,
  cadence: FollowUpCadence,
): number {
  return lastFollowUp + cadence.intervalDays * 24 * 3600 * 1000;
}

/**
 * Track graduation pipeline across many mentees.
 *
 * v2 fix: `now` parameter removed. The function is a pure aggregation over
 * the current state of each `MenteeProfile`; it does not perform any
 * time-windowed query. Callers that previously passed `now` should simply
 * drop the argument.
 */
export function trackPipeline(
  mentees: MenteeProfile[],
): {
  enrolled: number;
  inProgress: number;
  eligible: number;
  totalCompletion: number;
  averageTrack: MentorshipTrack;
} {
  let enrolled = 0;
  let inProgress = 0;
  let eligible = 0;
  let totalCompletion = 0;
  const trackScores = new Map<MentorshipTrack, number>();

  for (const m of mentees) {
    const state = determineFlowState(m);
    if (state === "enrolled") enrolled++;
    else if (state === "in-progress") inProgress++;
    else if (state === "eligible") eligible++;

    const completion = computeCompletionPct(m, TRACK_CRITERIA[m.track]);
    totalCompletion += completion;
    trackScores.set(m.track, (trackScores.get(m.track) ?? 0) + completion);
  }

  const avg = mentees.length > 0 ? totalCompletion / mentees.length : 0;
  const averageTrack = pickDominantTrack(trackScores);

  return {
    enrolled,
    inProgress,
    eligible,
    totalCompletion: Math.round(avg * 100) / 100,
    averageTrack,
  };
}

/**
 * Pick the most common track from a score map.
 */
function pickDominantTrack(
  scores: Map<MentorshipTrack, number>,
): MentorshipTrack {
  let best: MentorshipTrack = "iniciante";
  let bestScore = -1;
  for (const [track, score] of scores) {
    if (score > bestScore) {
      bestScore = score;
      best = track;
    }
  }
  return best;
}

/**
 * Validate a mentee profile shape.
 */
export function validateMenteeProfile(profile: MenteeProfile): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!profile.id) errors.push("id is required");
  if (!profile.displayName) errors.push("displayName is required");
  if (!TRACK_CRITERIA[profile.track]) {
    errors.push(`unknown track: ${profile.track}`);
  }
  if (profile.goalCompletionPct < 0 || profile.goalCompletionPct > 100) {
    errors.push("goalCompletionPct must be 0-100");
  }
  if (profile.feedbackScore < 0 || profile.feedbackScore > 5) {
    errors.push("feedbackScore must be 0-5");
  }
  if (profile.sessionsAttended < 0) {
    errors.push("sessionsAttended must be >= 0");
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Summarize a graduation certificate for display.
 */
export function summarizeCertificate(cert: GraduationCertificate): {
  number: string;
  level: string;
  track: string;
  milestones: string;
  validUntil: string;
} {
  return {
    number: cert.certificateNumber,
    level: cert.level,
    track: cert.track,
    milestones: `${cert.milestonesCompleted}/${cert.milestonesRequired}`,
    validUntil: cert.validUntil
      ? new Date(cert.validUntil).toISOString().slice(0, 10)
      : "vitalício",
  };
}
