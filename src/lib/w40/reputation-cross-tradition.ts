/**
 * reputation-cross-tradition.ts
 *
 * Cross-tradition reputation system for Akasha Portal / Cabala dos Caminhos.
 *
 * Extends:
 * - w25/reputation-system (base reputation: karma, badges, weight)
 * - w35/rep-weighting (per-context reputation weighting)
 * - w36/leaderboard (leaderboard ranking)
 * - w38/comments-reputation-trending-v2 (comment-level reputation trending)
 * - w39/comments-deep-thread-viz (per-thread contribution)
 *
 * Responsibilities:
 * - 11 spiritual traditions (Candomblé, Umbanda, Ifá, Cabala, Astrologia,
 *   Tantra, Taoismo, Budismo, Hinduismo, Wicca, Xamanismo)
 * - 12 zodiac signs (Capricornio → Peixes)
 * - 6 matrix contexts (love, work, family, study, health, spiritual)
 * - Cross-tradition recognition — user's primary tradition (house)
 *   vs engaged traditions (visits) vs credible-traditions (study)
 * - Zodiac × Tradition affinity matrix
 * - Per-context reputation with zodiac bonus
 * - Diversification bonus — rewards users who contribute to multiple traditions
 * - 6 reputation tiers (novice, apprentice, practitioner, adept, master, sage)
 * - Tradition-specific endorsement (mentor of tradition X vouches for user)
 * - Standing / risk assessment (excellent, healthy, neutral, low, at_risk)
 * - Reputation transfer (legacy / lineage honoring)
 * - Comparative leaderboard within and across traditions
 * - Audit trail for reputation-changing events
 *
 * This module is **standalone**: no imports from other w3x/w4x modules.
 * All types, constants, and helpers live inside this file.
 *
 * Side-effect free. Pure functions only.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of supported spiritual traditions. */
export const TRADITION_COUNT = 11

/** Number of supported zodiac signs (western tropical). */
export const ZODIAC_COUNT = 12

/** Number of matrix contexts. */
export const CONTEXT_COUNT = 6

/** Number of reputation tiers. */
export const TIER_COUNT = 6

/** Reputation score at which a user crosses into a new tier. */
export const TIER_THRESHOLDS: ReadonlyArray<number> = [
  0, // novice
  100, // apprentice
  500, // practitioner
  2000, // adept
  10000, // master
  50000, // sage
]

/** Cap on cumulative reputation (prevents integer overflow). */
export const MAX_REPUTATION = 1_000_000

/** Cap on tradition-specific endorsement count. */
export const MAX_ENDORSEMENTS_PER_TRADITION = 50

/** Cap on audit trail events per user. */
export const MAX_AUDIT_EVENTS = 200

/** Minimum character length for a tradition endorsement note. */
export const ENDORSEMENT_NOTE_MIN_LENGTH = 20

/** Maximum character length for a tradition endorsement note. */
export const ENDORSEMENT_NOTE_MAX_LENGTH = 500

/**
 * Diversification bonus multiplier — applied per additional tradition
 * (beyond primary). 0.05 means +5% per extra tradition engaged.
 */
export const DIVERSIFICATION_BONUS_PER_TRADITION = 0.05

/** Cap on diversification bonus to prevent runaway scaling. */
export const DIVERSIFICATION_BONUS_CAP = 0.5

/** Risk threshold: a user whose standing is "at_risk" gets a soft flag. */
export const STANDING_AT_RISK_SCORE = -50

/** Maximum length (chars) for a custom tradition label (legacy / lineage). */
export const CUSTOM_TRADITION_LABEL_MAX = 80

/** Maximum length (chars) for an audit event reason. */
export const AUDIT_EVENT_REASON_MAX = 280

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** All supported spiritual traditions in the Akasha universe. */
export type Tradition =
  | "candomble"
  | "umbanda"
  | "ifa"
  | "cabala"
  | "astrologia"
  | "tantra"
  | "taoismo"
  | "budismo"
  | "hinduismo"
  | "wicca"
  | "xamanismo"

/** Western tropical zodiac signs. */
export type Zodiac =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces"

/** All matrix contexts the user can earn reputation in. */
export type ReputationContext =
  | "love"
  | "work"
  | "family"
  | "study"
  | "health"
  | "spiritual"

/** Reputation tiers — ordered by ascension. */
export type Tier =
  | "novice"
  | "apprentice"
  | "practitioner"
  | "adept"
  | "master"
  | "sage"

/** Overall standing (qualitative reputation health). */
export type Standing =
  | "excellent"
  | "healthy"
  | "neutral"
  | "low"
  | "at_risk"

/** Type of audit event that mutated reputation. */
export type AuditEventType =
  | "earned"
  | "endorsed"
  | "transferred"
  | "decayed"
  | "deducted"
  | "tier_promoted"
  | "tier_demoted"
  | "tradition_joined"
  | "tradition_left"

/** A user's per-tradition standing and engagement. */
export interface TraditionProfile {
  /** Which tradition this profile is for. */
  readonly tradition: Tradition
  /** Cumulative reputation in this tradition alone. */
  readonly score: number
  /** Number of contributions (posts, comments, replies, rituals) in this tradition. */
  readonly contributions: number
  /** Number of unique mentors who endorsed the user in this tradition. */
  readonly endorsementCount: number
  /** ISO timestamp when the user first engaged this tradition. */
  readonly firstEngagedAt: string
  /** ISO timestamp of last engagement (for recency weighting). */
  readonly lastEngagedAt: string
  /** Whether this is the user's primary (house) tradition. */
  readonly isPrimary: boolean
  /** Whether the user is a recognized mentor of this tradition. */
  readonly isMentor: boolean
}

/** Per-context reputation snapshot. */
export interface ContextReputation {
  readonly context: ReputationContext
  readonly score: number
  readonly contributions: number
  /** Zodiac bonus applied to this context's score (0.0 to 0.3). */
  readonly zodiacBonus: number
}

/** A tradition endorsement from a mentor. */
export interface Endorsement {
  readonly id: string
  readonly mentorId: string
  readonly mentorTradition: Tradition
  readonly note: string
  readonly createdAt: string
  /** Reputation points granted by this endorsement. */
  readonly pointsGranted: number
}

/** An immutable audit log entry. */
export interface AuditEvent {
  readonly id: string
  readonly type: AuditEventType
  readonly tradition: Tradition | null
  readonly context: ReputationContext | null
  readonly delta: number
  readonly reason: string
  readonly createdAt: string
}

/** Full reputation profile for a user. */
export interface ReputationProfile {
  readonly userId: string
  readonly displayName: string
  readonly primaryTradition: Tradition
  readonly zodiac: Zodiac | null
  readonly totalScore: number
  readonly tier: Tier
  readonly standing: Standing
  readonly traditions: ReadonlyArray<TraditionProfile>
  readonly contexts: ReadonlyArray<ContextReputation>
  readonly endorsements: ReadonlyArray<Endorsement>
  readonly audit: ReadonlyArray<AuditEvent>
  /** Multiplier in [0, 1 + cap] applied to total score for diversification. */
  readonly diversificationMultiplier: number
  readonly joinedAt: string
  readonly updatedAt: string
}

/** Compact view of a user for leaderboards. */
export interface LeaderboardEntry {
  readonly userId: string
  readonly displayName: string
  readonly totalScore: number
  readonly tier: Tier
  readonly primaryTradition: Tradition
  readonly context: ReputationContext | null
  readonly rank: number
}

/** A cross-tradition transfer event (legacy / lineage honoring). */
export interface ReputationTransfer {
  readonly fromUserId: string
  readonly toUserId: string
  readonly tradition: Tradition
  readonly points: number
  readonly reason: string
  readonly createdAt: string
}

// ---------------------------------------------------------------------------
// Static lookup tables
// ---------------------------------------------------------------------------

/** All supported traditions in display order. */
export const ALL_TRADITIONS: ReadonlyArray<Tradition> = [
  "candomble",
  "umbanda",
  "ifa",
  "cabala",
  "astrologia",
  "tantra",
  "taoismo",
  "budismo",
  "hinduismo",
  "wicca",
  "xamanismo",
]

/** Display names (PT-BR) for traditions. */
export const TRADITION_LABELS: Readonly<Record<Tradition, string>> = {
  candomble: "Candomblé",
  umbanda: "Umbanda",
  ifa: "Ifá",
  cabala: "Cabala",
  astrologia: "Astrologia",
  tantra: "Tantra",
  taoismo: "Taoismo",
  budismo: "Budismo",
  hinduismo: "Hinduismo",
  wicca: "Wicca",
  xamanismo: "Xamanismo",
}

/** All zodiac signs in calendar order. */
export const ALL_ZODIACS: ReadonlyArray<Zodiac> = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
]

/** Display names (PT-BR) for zodiac signs. */
export const ZODIAC_LABELS: Readonly<Record<Zodiac, string>> = {
  aries: "Áries",
  taurus: "Touro",
  gemini: "Gêmeos",
  cancer: "Câncer",
  leo: "Leão",
  virgo: "Virgem",
  libra: "Libra",
  scorpio: "Escorpião",
  sagittarius: "Sagitário",
  capricorn: "Capricórnio",
  aquarius: "Aquário",
  pisces: "Peixes",
}

/** All supported matrix contexts. */
export const ALL_CONTEXTS: ReadonlyArray<ReputationContext> = [
  "love",
  "work",
  "family",
  "study",
  "health",
  "spiritual",
]

/** Display names (PT-BR) for contexts. */
export const CONTEXT_LABELS: Readonly<Record<ReputationContext, string>> = {
  love: "Amor",
  work: "Trabalho",
  family: "Família",
  study: "Estudo",
  health: "Saúde",
  spiritual: "Espiritual",
}

/** Tier display labels (PT-BR). */
export const TIER_LABELS: Readonly<Record<Tier, string>> = {
  novice: "Iniciante",
  apprentice: "Aprendiz",
  practitioner: "Praticante",
  adept: "Adepto",
  master: "Mestre",
  sage: "Sábio",
}

/** Standing display labels (PT-BR). */
export const STANDING_LABELS: Readonly<Record<Standing, string>> = {
  excellent: "Excelente",
  healthy: "Saudável",
  neutral: "Neutro",
  low: "Baixo",
  at_risk: "Em risco",
}

/**
 * Zodiac × Tradition affinity matrix — 0.0 to 0.3 zodiac bonus per
 * context for that tradition. Higher = stronger archetypal resonance.
 *
 * Encoded as nested readonly record: AFFINITY[zodiac][tradition] = bonus.
 * 0.0 means no bonus, 0.3 means maximum natural resonance.
 */
export const AFFINITY: Readonly<Record<Zodiac, Readonly<Record<Tradition, number>>>> = {
  aries: {
    candomble: 0.20, umbanda: 0.20, ifa: 0.25, cabala: 0.10, astrologia: 0.30,
    tantra: 0.15, taoismo: 0.10, budismo: 0.05, hinduismo: 0.15, wicca: 0.20,
    xamanismo: 0.20,
  },
  taurus: {
    candomble: 0.15, umbanda: 0.20, ifa: 0.15, cabala: 0.25, astrologia: 0.30,
    tantra: 0.30, taoismo: 0.20, budismo: 0.15, hinduismo: 0.20, wicca: 0.20,
    xamanismo: 0.10,
  },
  gemini: {
    candomble: 0.10, umbanda: 0.15, ifa: 0.10, cabala: 0.30, astrologia: 0.30,
    tantra: 0.10, taoismo: 0.15, budismo: 0.15, hinduismo: 0.15, wicca: 0.15,
    xamanismo: 0.10,
  },
  cancer: {
    candomble: 0.25, umbanda: 0.25, ifa: 0.20, cabala: 0.20, astrologia: 0.30,
    tantra: 0.15, taoismo: 0.10, budismo: 0.10, hinduismo: 0.15, wicca: 0.25,
    xamanismo: 0.20,
  },
  leo: {
    candomble: 0.30, umbanda: 0.25, ifa: 0.30, cabala: 0.15, astrologia: 0.30,
    tantra: 0.20, taoismo: 0.15, budismo: 0.10, hinduismo: 0.25, wicca: 0.25,
    xamanismo: 0.20,
  },
  virgo: {
    candomble: 0.10, umbanda: 0.15, ifa: 0.20, cabala: 0.30, astrologia: 0.30,
    tantra: 0.15, taoismo: 0.20, budismo: 0.20, hinduismo: 0.20, wicca: 0.15,
    xamanismo: 0.10,
  },
  libra: {
    candomble: 0.10, umbanda: 0.15, ifa: 0.10, cabala: 0.30, astrologia: 0.30,
    tantra: 0.25, taoismo: 0.20, budismo: 0.20, hinduismo: 0.15, wicca: 0.15,
    xamanismo: 0.05,
  },
  scorpio: {
    candomble: 0.20, umbanda: 0.20, ifa: 0.25, cabala: 0.30, astrologia: 0.30,
    tantra: 0.30, taoismo: 0.15, budismo: 0.10, hinduismo: 0.20, wicca: 0.25,
    xamanismo: 0.25,
  },
  sagittarius: {
    candomble: 0.10, umbanda: 0.15, ifa: 0.15, cabala: 0.20, astrologia: 0.30,
    tantra: 0.15, taoismo: 0.20, budismo: 0.30, hinduismo: 0.30, wicca: 0.10,
    xamanismo: 0.20,
  },
  capricorn: {
    candomble: 0.10, umbanda: 0.15, ifa: 0.20, cabala: 0.30, astrologia: 0.30,
    tantra: 0.05, taoismo: 0.20, budismo: 0.20, hinduismo: 0.15, wicca: 0.10,
    xamanismo: 0.10,
  },
  aquarius: {
    candomble: 0.05, umbanda: 0.10, ifa: 0.10, cabala: 0.30, astrologia: 0.30,
    tantra: 0.15, taoismo: 0.20, budismo: 0.20, hinduismo: 0.10, wicca: 0.15,
    xamanismo: 0.20,
  },
  pisces: {
    candomble: 0.20, umbanda: 0.20, ifa: 0.15, cabala: 0.25, astrologia: 0.30,
    tantra: 0.30, taoismo: 0.15, budismo: 0.25, hinduismo: 0.25, wicca: 0.20,
    xamanismo: 0.25,
  },
}

// ---------------------------------------------------------------------------
// Helpers — tier & standing classification
// ---------------------------------------------------------------------------

/** Clamp a numeric value to the [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}

/** Internal: tier index → tier name. */
const TIER_INDEX_TO_TIER: ReadonlyArray<Tier> = [
  "novice",
  "apprentice",
  "practitioner",
  "adept",
  "master",
  "sage",
]

/** Map a cumulative score to its tier. */
export function tierForScore(score: number): Tier {
  let assigned: Tier = "novice"
  for (let i = 0; i < TIER_THRESHOLDS.length; i += 1) {
    if (score >= TIER_THRESHOLDS[i]) {
      assigned = TIER_INDEX_TO_TIER[i] ?? "novice"
    }
  }
  return assigned
}

/** Map a recent-trend score (delta over window) to a standing. */
export function standingForDelta(delta: number, totalScore: number): Standing {
  if (delta >= 200 && totalScore > 1000) return "excellent"
  if (delta >= 50) return "healthy"
  if (delta >= -25) return "neutral"
  if (delta >= STANDING_AT_RISK_SCORE) return "low"
  return "at_risk"
}

/** Return the next tier above the given one, or null if already at the top. */
export function nextTier(current: Tier): Tier | null {
  const idx = TIER_INDEX_TO_TIER.indexOf(current)
  if (idx < 0 || idx >= TIER_INDEX_TO_TIER.length - 1) return null
  return TIER_INDEX_TO_TIER[idx + 1] ?? null
}

/** Return the previous tier below the given one, or null if already at the bottom. */
export function previousTier(current: Tier): Tier | null {
  const idx = TIER_INDEX_TO_TIER.indexOf(current)
  if (idx <= 0) return null
  return TIER_INDEX_TO_TIER[idx - 1] ?? null
}

// ---------------------------------------------------------------------------
// Helpers — zodiac & diversification
// ---------------------------------------------------------------------------

/** Return the zodiac × tradition affinity bonus (0.0 to 0.3). */
export function affinityBonus(zodiac: Zodiac | null, tradition: Tradition): number {
  if (zodiac === null) return 0
  const row = AFFINITY[zodiac]
  if (!row) return 0
  return row[tradition] ?? 0
}

/** Compute the diversification multiplier for a list of engaged traditions. */
export function diversificationMultiplier(
  engagedTraditions: ReadonlyArray<Tradition>,
  primaryTradition: Tradition,
): number {
  const extras = engagedTraditions.filter((t) => t !== primaryTradition).length
  const raw = extras * DIVERSIFICATION_BONUS_PER_TRADITION
  const capped = Math.min(raw, DIVERSIFICATION_BONUS_CAP)
  return 1 + capped
}

// ---------------------------------------------------------------------------
// Helpers — profile construction
// ---------------------------------------------------------------------------

/** Build an empty TraditionProfile for a given tradition. */
export function emptyTraditionProfile(
  tradition: Tradition,
  isPrimary: boolean,
  now: string,
): TraditionProfile {
  return {
    tradition,
    score: 0,
    contributions: 0,
    endorsementCount: 0,
    firstEngagedAt: now,
    lastEngagedAt: now,
    isPrimary,
    isMentor: false,
  }
}

/** Build an empty ContextReputation for a given context. */
export function emptyContextReputation(
  context: ReputationContext,
  zodiac: Zodiac | null,
  tradition: Tradition,
): ContextReputation {
  const bonus = zodiac === null ? 0 : affinityBonus(zodiac, tradition)
  return {
    context,
    score: 0,
    contributions: 0,
    zodiacBonus: bonus,
  }
}

/** Build a new, empty reputation profile for a freshly-onboarded user. */
export function createProfile(
  userId: string,
  displayName: string,
  primaryTradition: Tradition,
  zodiac: Zodiac | null,
  now: string,
): ReputationProfile {
  const tradition = emptyTraditionProfile(primaryTradition, true, now)
  const contexts = ALL_CONTEXTS.map((c) => emptyContextReputation(c, zodiac, primaryTradition))
  return {
    userId,
    displayName,
    primaryTradition,
    zodiac,
    totalScore: 0,
    tier: "novice",
    standing: "neutral",
    traditions: [tradition],
    contexts,
    endorsements: [],
    audit: [
      {
        id: `${userId}-init-${now}`,
        type: "tradition_joined",
        tradition: primaryTradition,
        context: null,
        delta: 0,
        reason: "Onboarding",
        createdAt: now,
      },
    ],
    diversificationMultiplier: 1,
    joinedAt: now,
    updatedAt: now,
  }
}

// ---------------------------------------------------------------------------
// Helpers — earning / mutation
// ---------------------------------------------------------------------------

/**
 * Apply a reputation-earning event to a profile. Pure function —
 * returns a new profile with the mutation applied. The audit log is
 * also returned for caller-side persistence.
 */
export function applyEarn(
  profile: ReputationProfile,
  tradition: Tradition,
  context: ReputationContext,
  rawPoints: number,
  reason: string,
  now: string,
): { profile: ReputationProfile; event: AuditEvent } {
  const cappedPoints = clamp(rawPoints, -MAX_REPUTATION, MAX_REPUTATION)
  const zodiacBonus = profile.zodiac === null
    ? 0
    : affinityBonus(profile.zodiac, tradition)
  const adjusted = Math.round(cappedPoints * (1 + zodiacBonus))

  const newTraditions = profile.traditions.map((t) => {
    if (t.tradition !== tradition) return t
    return {
      ...t,
      score: clamp(t.score + adjusted, -MAX_REPUTATION, MAX_REPUTATION),
      contributions: t.contributions + 1,
      lastEngagedAt: now,
    }
  })

  const engagedTraditions = newTraditions.map((t) => t.tradition)
  const newMultiplier = diversificationMultiplier(
    engagedTraditions,
    profile.primaryTradition,
  )

  const newContexts = profile.contexts.map((c) => {
    if (c.context !== context) return c
    return {
      ...c,
      score: clamp(c.score + adjusted, -MAX_REPUTATION, MAX_REPUTATION),
      contributions: c.contributions + 1,
    }
  })

  const newTotal = clamp(
    profile.totalScore + Math.round(adjusted * newMultiplier),
    -MAX_REPUTATION,
    MAX_REPUTATION,
  )
  const oldTier = profile.tier
  const newTier = tierForScore(newTotal)
  const newStanding = standingForDelta(adjusted, newTotal)
  const event: AuditEvent = {
    id: `${profile.userId}-earn-${now}-${tradition}-${context}`,
    type: "earned",
    tradition,
    context,
    delta: adjusted,
    reason: reason.slice(0, AUDIT_EVENT_REASON_MAX),
    createdAt: now,
  }
  const newAudit = appendAudit(profile.audit, event)
  let auditWithTier = newAudit
  if (newTier !== oldTier) {
    auditWithTier = appendAudit(auditWithTier, {
      id: `${profile.userId}-tier-${now}`,
      type: newTier > oldTier ? "tier_promoted" : "tier_demoted",
      tradition: null,
      context: null,
      delta: 0,
      reason: `Tier ${oldTier} → ${newTier}`,
      createdAt: now,
    })
  }

  const updated: ReputationProfile = {
    ...profile,
    totalScore: newTotal,
    tier: newTier,
    standing: newStanding,
    traditions: newTraditions,
    contexts: newContexts,
    audit: auditWithTier,
    diversificationMultiplier: newMultiplier,
    updatedAt: now,
  }
  return { profile: updated, event }
}

/**
 * Apply a tradition endorsement (mentor of tradition X vouches for user).
 * Grants raw points scaled by the mentor's tier rank and the user's standing.
 */
export function applyEndorsement(
  profile: ReputationProfile,
  mentor: { id: string; tradition: Tradition; tier: Tier },
  note: string,
  now: string,
): { profile: ReputationProfile; endorsement: Endorsement } {
  if (note.length < ENDORSEMENT_NOTE_MIN_LENGTH) {
    throw new Error("endorsement note too short")
  }
  if (note.length > ENDORSEMENT_NOTE_MAX_LENGTH) {
    throw new Error("endorsement note too long")
  }

  const tierIdx = TIER_INDEX_TO_TIER.indexOf(mentor.tier)
  const tierMultiplier = 1 + tierIdx * 0.5
  const standingMultiplier = standingToMultiplier(profile.standing)
  const rawPoints = Math.round(50 * tierMultiplier * standingMultiplier)
  const endorsement: Endorsement = {
    id: `${mentor.id}-${profile.userId}-${now}`,
    mentorId: mentor.id,
    mentorTradition: mentor.tradition,
    note: note.slice(0, ENDORSEMENT_NOTE_MAX_LENGTH),
    createdAt: now,
    pointsGranted: rawPoints,
  }

  const newEndorsements = [endorsement, ...profile.endorsements].slice(
    0,
    MAX_ENDORSEMENTS_PER_TRADITION,
  )

  const newTraditions = profile.traditions.map((t) => {
    if (t.tradition !== mentor.tradition) return t
    return {
      ...t,
      endorsementCount: t.endorsementCount + 1,
      score: clamp(t.score + rawPoints, -MAX_REPUTATION, MAX_REPUTATION),
      lastEngagedAt: now,
    }
  })

  const oldTier = profile.tier
  const newTotal = clamp(profile.totalScore + rawPoints, -MAX_REPUTATION, MAX_REPUTATION)
  const newTier = tierForScore(newTotal)

  const audit = appendAudit(profile.audit, {
    id: `${profile.userId}-endorse-${now}`,
    type: "endorsed",
    tradition: mentor.tradition,
    context: null,
    delta: rawPoints,
    reason: `Endorsed by mentor ${mentor.id} of ${mentor.tradition}`,
    createdAt: now,
  })

  let newAudit = audit
  if (newTier !== oldTier) {
    newAudit = appendAudit(audit, {
      id: `${profile.userId}-tier-${now}`,
      type: newTier > oldTier ? "tier_promoted" : "tier_demoted",
      tradition: null,
      context: null,
      delta: 0,
      reason: `Tier ${oldTier} → ${newTier}`,
      createdAt: now,
    })
  }

  const updated: ReputationProfile = {
    ...profile,
    totalScore: newTotal,
    tier: newTier,
    traditions: newTraditions,
    endorsements: newEndorsements,
    audit: newAudit,
    updatedAt: now,
  }
  return { profile: updated, endorsement }
}

/**
 * Transfer reputation from one user to another — used for legacy
 * honoring, lineage transfers (pai-de-santo → filho-de-santo), or
 * admin-mediated rebalances. Both profiles must be passed in.
 */
export function applyTransfer(
  from: ReputationProfile,
  to: ReputationProfile,
  tradition: Tradition,
  points: number,
  reason: string,
  now: string,
): { from: ReputationProfile; to: ReputationProfile; event: ReputationTransfer } {
  if (points <= 0) {
    throw new Error("transfer points must be positive")
  }
  const fromTradition = from.traditions.find((t) => t.tradition === tradition)
  if (!fromTradition || fromTradition.score < points) {
    throw new Error("insufficient tradition-specific reputation")
  }

  const newFromScore = clamp(fromTradition.score - points, 0, MAX_REPUTATION)
  const newFromTraditions = from.traditions.map((t) =>
    t.tradition === tradition ? { ...t, score: newFromScore } : t,
  )
  const fromUpdated: ReputationProfile = {
    ...from,
    totalScore: clamp(from.totalScore - points, 0, MAX_REPUTATION),
    traditions: newFromTraditions,
    audit: appendAudit(from.audit, {
      id: `${from.userId}-transfer-out-${now}`,
      type: "transferred",
      tradition,
      context: null,
      delta: -points,
      reason: reason.slice(0, AUDIT_EVENT_REASON_MAX),
      createdAt: now,
    }),
    updatedAt: now,
  }

  const toTraditionExists = to.traditions.some((t) => t.tradition === tradition)
  const newToTraditions = toTraditionExists
    ? to.traditions.map((t) =>
        t.tradition === tradition
          ? { ...t, score: clamp(t.score + points, 0, MAX_REPUTATION) }
          : t,
      )
    : [
        ...to.traditions,
        emptyTraditionProfile(tradition, false, now),
      ]

  const toUpdated: ReputationProfile = {
    ...to,
    totalScore: clamp(to.totalScore + points, 0, MAX_REPUTATION),
    traditions: newToTraditions,
    audit: appendAudit(to.audit, {
      id: `${to.userId}-transfer-in-${now}`,
      type: "transferred",
      tradition,
      context: null,
      delta: points,
      reason: reason.slice(0, AUDIT_EVENT_REASON_MAX),
      createdAt: now,
    }),
    updatedAt: now,
  }

  const event: ReputationTransfer = {
    fromUserId: from.userId,
    toUserId: to.userId,
    tradition,
    points,
    reason: reason.slice(0, AUDIT_EVENT_REASON_MAX),
    createdAt: now,
  }
  return { from: fromUpdated, to: toUpdated, event }
}

// ---------------------------------------------------------------------------
// Helpers — internal
// ---------------------------------------------------------------------------

/** Convert standing to a numeric multiplier for endorsement scaling. */
function standingToMultiplier(standing: Standing): number {
  switch (standing) {
    case "excellent": return 1.5
    case "healthy": return 1.2
    case "neutral": return 1.0
    case "low": return 0.8
    case "at_risk": return 0.5
  }
}

/** Append an audit event to a list, respecting MAX_AUDIT_EVENTS cap. */
function appendAudit(
  list: ReadonlyArray<AuditEvent>,
  event: AuditEvent,
): ReadonlyArray<AuditEvent> {
  const next = [event, ...list]
  return next.length > MAX_AUDIT_EVENTS ? next.slice(0, MAX_AUDIT_EVENTS) : next
}

// ---------------------------------------------------------------------------
// Helpers — leaderboard & summary
// ---------------------------------------------------------------------------

/**
 * Build a leaderboard for a single tradition, ranked by tradition-specific
 * score, then total score, then display name. Tie-breaks are deterministic.
 */
export function traditionLeaderboard(
  profiles: ReadonlyArray<ReputationProfile>,
  tradition: Tradition,
  context: ReputationContext | null,
  limit: number,
): ReadonlyArray<LeaderboardEntry> {
  const filtered = profiles
    .filter((p) => p.traditions.some((t) => t.tradition === tradition))
    .map((p) => {
      const t = p.traditions.find((x) => x.tradition === tradition)
      return { profile: p, tScore: t ? t.score : 0 }
    })
    .sort((a, b) => {
      if (a.tScore !== b.tScore) return b.tScore - a.tScore
      if (a.profile.totalScore !== b.profile.totalScore) {
        return b.profile.totalScore - a.profile.totalScore
      }
      return a.profile.displayName.localeCompare(b.profile.displayName)
    })

  const top = filtered.slice(0, limit)
  return top.map((entry, idx) => ({
    userId: entry.profile.userId,
    displayName: entry.profile.displayName,
    totalScore: entry.profile.totalScore,
    tier: entry.profile.tier,
    primaryTradition: entry.profile.primaryTradition,
    context,
    rank: idx + 1,
  }))
}

/**
 * Build a cross-tradition leaderboard (totals across all traditions).
 */
export function globalLeaderboard(
  profiles: ReadonlyArray<ReputationProfile>,
  limit: number,
): ReadonlyArray<LeaderboardEntry> {
  const sorted = [...profiles]
    .sort((a, b) => {
      if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore
      return a.displayName.localeCompare(b.displayName)
    })
    .slice(0, limit)
  return sorted.map((p, idx) => ({
    userId: p.userId,
    displayName: p.displayName,
    totalScore: p.totalScore,
    tier: p.tier,
    primaryTradition: p.primaryTradition,
    context: null,
    rank: idx + 1,
  }))
}

/**
 * Return the top N traditions the user has contributed to, ranked
 * by score then by contributions.
 */
export function topTraditions(
  profile: ReputationProfile,
  limit: number,
): ReadonlyArray<TraditionProfile> {
  return [...profile.traditions]
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score
      return b.contributions - a.contributions
    })
    .slice(0, limit)
}

/**
 * Compute a tradition-diversification summary — counts of engaged,
 * credible, and primary traditions.
 */
export function diversificationSummary(profile: ReputationProfile): {
  engaged: number
  credible: number
  primary: Tradition | null
  multiplier: number
} {
  const engaged = profile.traditions.length
  const credible = profile.traditions.filter((t) => t.score >= 100).length
  return {
    engaged,
    credible,
    primary: profile.primaryTradition,
    multiplier: profile.diversificationMultiplier,
  }
}
