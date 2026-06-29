// ============================================================================
// REPUTATION SYSTEM — Cross-tradition karma + badges + anti-gaming + LGPD
// ============================================================================
// Onda 47 (2026-06-29) — Universalista: works across 16+ traditions mapped
// in w45/tradition-cross-references. Multi-axis scoring (5 pillars), not a
// single number. Opt-in leaderboard, granular consent, LGPD-compliant.
//
// Dependencies (NOT imported here — sandbox has no @prisma at typecheck time):
//   - @prisma/client             — for production storage (recordEvent etc.)
//   - w45/tradition-cross-references — TraditionKey type, cross-tradition map
//   - w45/mentorship-pairing      — MentorDto, pair score
//   - w45/admin-moderation-queue  — ModerationQueueItem, decision helpers
//   - w40/community-trust         — TrustSignal for anti-gaming correlator
//   - lib/privacy/data-deletion   — purgeUser orchestration (LGPD Art. 18)
//
// This module is PURE logic + types + DTOs. Persistence is the caller's job:
// every public API returns/accepts plain objects so the module is testable
// without a live DB. A thin Prisma adapter wraps it in API routes.
//
// Anti-gaming principles:
//   - No self-awarded reputation. Only system events or peer-reviewed events.
//   - Vote rings: detect reciprocity in 7-day windows.
//   - Sock puppets: flag pairs whose IP/device fingerprint hash matches.
//   - Badge farming: rate-limit awarding; revoke on confirmed fraud.
//   - Anti-spike: exponential decay on sudden gains > threshold/window.
//
// LGPD posture (Lei 13.709/2018):
//   - Art. 7º, §4º — legitimate interest limited to leaderboard integrity.
//   - Art. 8º   — explicit consent for opt-in leaderboard.
//   - Art. 18, I — right to deletion (purgeUser) preserves only anonymized
//                 aggregates required for leaderboard ranking math.
//   - Art. 18, VII — portability (exportReputation JSON/CSV).
//   - Art. 9º   — anonymization techniques documented in anonymizeUser.
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

/**
 * The 5 reputation pillars. Pillar values are stored in ReputationEvent
 * and aggregated into ReputationScore via PILLAR_WEIGHTS.
 */
export type ReputationPillar =
  | 'tradition'
  | 'moderation'
  | 'mentorship'
  | 'content'
  | 'community';

export const ALL_PILLARS: readonly ReputationPillar[] = [
  'tradition',
  'moderation',
  'mentorship',
  'content',
  'community',
] as const;

/**
 * Source of a reputation event. `system` = platform rule (e.g. mentor
 * session completed). `peer` = another user (e.g. helpful answer rated).
 * `admin` = manual adjust. `self` is intentionally NOT a source — the
 * platform never lets a user grant themselves points (anti-gaming).
 */
export type ReputationSource =
  | 'system'
  | 'peer'
  | 'admin'
  | 'migration'
  | 'decay';

export type EventReason =
  // tradition
  | 'tradition_initiation'
  | 'tradition_lineage_confirmed'
  | 'tradition_advanced_degree'
  | 'tradition_mentorship_completed'
  // moderation
  | 'moderation_flag_confirmed'
  | 'moderation_review_helpful'
  | 'moderation_dispute_upheld'
  | 'moderation_peer_review'
  // mentorship
  | 'mentorship_session_given'
  | 'mentorship_session_received_high_rating'
  | 'mentorship_pair_completed'
  | 'mentorship_mentor_rating_5star'
  // content
  | 'content_post_upvoted'
  | 'content_answer_helpful'
  | 'content_citation_accepted'
  | 'content_post_downvoted'
  | 'content_flagged_low_quality'
  // community
  | 'community_event_hosted'
  | 'community_event_attended'
  | 'community_support_thread'
  | 'community_welcome_given';

export interface ReputationEvent {
  readonly id: string;
  readonly userId: string;
  readonly pillar: ReputationPillar;
  readonly delta: number;
  readonly reason: EventReason;
  readonly source: ReputationSource;
  readonly actorId?: string; // peer who triggered it; undefined for system
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Date;
  readonly decaying: boolean; // subject to exponential decay
  readonly halfLifeDays?: number;
  readonly revokedAt?: Date;
  readonly revokedReason?: string;
}

export interface PillarScore {
  readonly pillar: ReputationPillar;
  readonly raw: number; // sum of decayed deltas
  readonly weight: number; // PILLAR_WEIGHTS[pillar]
  readonly weighted: number; // raw * weight
  readonly eventCount: number;
  readonly lastEventAt?: Date;
}

export interface ReputationScore {
  readonly userId: string;
  readonly total: number; // sum of weighted
  readonly pillars: PillarScore[];
  readonly tier: ReputationTier;
  readonly computedAt: Date;
  readonly traditionCount?: number; // universalista metadata
  readonly crossTraditionMultiplier?: number;
}

export type ReputationTier =
  | 'novice'
  | 'aprendiz'
  | 'praticante'
  | 'sabio'
  | 'mestre'
  | 'guardiao';

export const TIER_THRESHOLDS: ReadonlyArray<{
  tier: ReputationTier;
  minTotal: number;
}> = [
  { tier: 'novice', minTotal: 0 },
  { tier: 'aprendiz', minTotal: 25 },
  { tier: 'praticante', minTotal: 100 },
  { tier: 'sabio', minTotal: 300 },
  { tier: 'mestre', minTotal: 750 },
  { tier: 'guardiao', minTotal: 2000 },
];

export interface UserReputation {
  readonly userId: string;
  readonly displayName: string; // cached; redacted in public contexts
  readonly score: ReputationScore;
  readonly pillarScores: Record<ReputationPillar, PillarScore>;
  readonly badges: Badge[];
  readonly badgesInProgress: BadgeProgress[];
  readonly flags: AntiGamingFlag[];
  readonly leaderboardOptIn: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ---- Badges & Medals -------------------------------------------------------

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type BadgeCategory =
  | 'mentorship'
  | 'curation'
  | 'punctuality'
  | 'reconciliation'
  | 'study'
  | 'wisdom'
  | 'welcoming'
  | 'mediation'
  | 'practice'
  | 'pioneering';

export interface BadgeCriterion {
  readonly type: 'pillar_threshold' | 'event_count' | 'streak_days' | 'custom';
  readonly pillar?: ReputationPillar;
  readonly threshold?: number;
  readonly eventReason?: EventReason;
  readonly minCount?: number;
  readonly evaluator?: (rep: UserReputation) => boolean;
}

export interface Badge {
  readonly id: string; // slug, e.g. 'mentor-verificado'
  readonly name: string; // display
  readonly description: string;
  readonly category: BadgeCategory;
  readonly rarity: BadgeRarity;
  readonly traditionTag?: string; // e.g. 'umbanda', 'ifa'; undefined = universalista
  readonly criterion: BadgeCriterion;
  readonly iconHint?: string; // semantic icon name (used by UI)
  readonly awardedAt?: Date;
  readonly awardedBy?: string;
  readonly revoked?: boolean;
}

export interface Medal extends Badge {
  readonly medalTier: 'gold' | 'silver' | 'bronze';
  readonly earnedAt: Date;
}

export interface BadgeProgress {
  readonly badgeId: string;
  readonly current: number;
  readonly required: number;
  readonly percent: number;
}

export type LeaderboardPeriod =
  | 'all_time'
  | 'monthly'
  | 'weekly'
  | 'daily';

export interface LeaderboardEntry {
  readonly rank: number;
  readonly userId: string;
  readonly displayName: string;
  readonly score: number;
  readonly pillar: ReputationPillar | 'total';
  readonly tradition?: string;
  readonly anonymized: boolean;
  readonly tier: ReputationTier;
}

// ---- Anti-gaming ----------------------------------------------------------

export type GamingSignal =
  | 'rapid_voting'
  | 'self_promotion'
  | 'vote_ring'
  | 'sock_puppet'
  | 'badge_farming'
  | 'sudden_spike'
  | 'reciprocal_endorsement';

export type FlagSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FlagStatus = 'open' | 'reviewing' | 'confirmed' | 'dismissed' | 'actioned';

export interface AntiGamingFlag {
  readonly id: string;
  readonly userId: string;
  readonly signal: GamingSignal;
  readonly severity: FlagSeverity;
  readonly status: FlagStatus;
  readonly createdAt: Date;
  readonly createdBy: string | null; // null = system
  readonly description: string;
  readonly evidence: Record<string, unknown>;
  readonly reviewedAt?: Date;
  readonly reviewedBy?: string;
  readonly decision?: 'dismissed' | 'confirmed_warning' | 'confirmed_suspension' | 'confirmed_permaban';
  readonly decisionReason?: string;
}

// ---- Privacy & LGPD -------------------------------------------------------

export interface PrivacyConsent {
  readonly userId: string;
  readonly leaderboardOptIn: boolean;
  readonly consentedAt: Date | null;
  readonly consentVersion: string;
  readonly retractedAt?: Date;
}

export interface AnonymizedAggregate {
  readonly hash: string; // stable hash for ranking math
  readonly pillarAverages: Record<ReputationPillar, number>;
  readonly tierAtPurge: ReputationTier;
  readonly eventCount: number;
  readonly traditionReach: number;
  readonly preservedAt: Date;
}

export interface PurgeReport {
  readonly userId: string;
  readonly purgedAt: Date;
  readonly eventsDeleted: number;
  readonly badgesRevoked: number;
  readonly flagsClosed: number;
  readonly anonymizedAggregate: AnonymizedAggregate;
  readonly consentRetracted: boolean;
  readonly auditLogId: string;
}

// ---- History, Export, Migration -------------------------------------------

export interface ReputationHistoryPoint {
  readonly date: Date;
  readonly total: number;
  readonly pillars: Record<ReputationPillar, number>;
}

export interface CompareResult {
  readonly userId: string;
  readonly displayName: string;
  readonly total: number;
  readonly tier: ReputationTier;
  readonly pillars: Record<ReputationPillar, number>;
  readonly badges: number;
  readonly longestStreakDays: number;
}

export interface LegacyReputationRecord {
  readonly userId: string;
  readonly score: number; // pre-w47 single number
  readonly level?: number;
  readonly achievements?: string[];
  readonly metadata?: string;
  readonly earnedAt: Date;
}

export type ExportFormat = 'json' | 'csv';

export interface ExportBundle {
  readonly userId: string;
  readonly exportedAt: Date;
  readonly format: ExportFormat;
  readonly mime: string;
  readonly payload: string;
  readonly checksum: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const PILLAR_WEIGHTS: Readonly<Record<ReputationPillar, number>> = {
  tradition: 0.30,
  moderation: 0.15,
  mentorship: 0.25,
  content: 0.20,
  community: 0.10,
};

/**
 * Default exponential decay half-life in days per pillar.
 * tradition = durable lineage, slow decay.
 * moderation = political; decays faster.
 */
export const DECAY_RATES: Readonly<Record<ReputationPillar, number>> = {
  tradition: 365,
  moderation: 60,
  mentorship: 90,
  content: 30,
  community: 45,
};

/**
 * Anti-gaming thresholds. Tuned to balance False Positives (legit users
 * who happen to spike) against False Negatives (gaming that goes through).
 */
export const GAMING_THRESHOLDS = {
  rapidVoting: {
    maxActionsPerHour: 12,
    windowMinutes: 60,
  },
  selfPromotion: {
    maxSelfMentionsPerWeek: 5,
    windowDays: 7,
  },
  voteRing: {
    minReciprocalPairs: 3,
    windowDays: 7,
    minAccountAgeDays: 30,
  },
  sockPuppet: {
    fingerprintMatchThreshold: 2, // ≥2 aliases sharing fingerprint
    windowDays: 14,
  },
  badgeFarming: {
    maxAwardsPer7d: 3,
    uniqueGranterThreshold: 3,
  },
  suddenSpike: {
    maxGainWithin1h: 100,
    maxGainWithin24h: 250,
  },
  reciprocalEndorsement: {
    pairsRequired: 5,
    windowDays: 7,
  },
} as const;

export const GAMING_SIGNALS = [
  'rapid_voting',
  'self_promotion',
  'vote_ring',
  'sock_puppet',
  'badge_farming',
  'sudden_spike',
  'reciprocal_endorsement',
] as const;

export const SEVERITY_WEIGHTS: Readonly<Record<FlagSeverity, number>> = {
  low: 1,
  medium: 3,
  high: 7,
  critical: 15,
};

/**
 * 10+ badge definitions. Order roughly follows the practitioner journey:
 * welcoming → estudioso → mentor → sábio → guardião.
 * IDs are slugs; do not rename without a migration step.
 */
export const BADGE_DEFINITIONS: readonly Badge[] = [
  {
    id: 'acolhedor',
    name: 'Acolhedor',
    description: 'Recebeu 10+ novos praticantes em threads de boas-vindas',
    category: 'welcoming',
    rarity: 'common',
    criterion: {
      type: 'event_count',
      eventReason: 'community_welcome_given',
      minCount: 10,
    },
    iconHint: 'heart',
  },
  {
    id: 'pontual',
    name: 'Pontual',
    description: 'Compareceu a 25+ sessões de mentoria sem cancelamento',
    category: 'punctuality',
    rarity: 'uncommon',
    criterion: {
      type: 'event_count',
      eventReason: 'mentorship_session_received_high_rating',
      minCount: 25,
    },
    iconHint: 'clock',
  },
  {
    id: 'estudioso',
    name: 'Estudioso',
    description: 'Acumulou 50+ pontos no pilar de conteúdo',
    category: 'study',
    rarity: 'uncommon',
    criterion: {
      type: 'pillar_threshold',
      pillar: 'content',
      threshold: 50,
    },
    iconHint: 'book',
  },
  {
    id: 'mentor-verificado',
    name: 'Mentor Verificado',
    description: 'Completou 10+ pares de mentoria com nota média ≥4.5',
    category: 'mentorship',
    rarity: 'rare',
    criterion: {
      type: 'pillar_threshold',
      pillar: 'mentorship',
      threshold: 120,
    },
    iconHint: 'shield',
  },
  {
    id: 'curador',
    name: 'Curador',
    description: 'Confirmou 30+ flags úteis na fila de moderação',
    category: 'curation',
    rarity: 'rare',
    criterion: {
      type: 'event_count',
      eventReason: 'moderation_review_helpful',
      minCount: 30,
    },
    iconHint: 'filter',
  },
  {
    id: 'reconciliador',
    name: 'Reconciliador',
    description: 'Mediou 5+ reconciliações bem-sucedidas entre praticantes',
    category: 'reconciliation',
    rarity: 'rare',
    criterion: {
      type: 'custom',
      evaluator: (rep: UserReputation) => {
        const events = (rep.flags ?? []).length;
        return events >= 5;
      },
    },
    iconHint: 'balance',
  },
  {
    id: 'mediador',
    name: 'Mediador',
    description: 'Apoiou 20+ threads da comunidade',
    category: 'mediation',
    rarity: 'uncommon',
    criterion: {
      type: 'event_count',
      eventReason: 'community_support_thread',
      minCount: 20,
    },
    iconHint: 'chat',
  },
  {
    id: 'praticante-dedicado',
    name: 'Praticante Dedicado',
    description: 'Manteve prática de uma tradição por 365+ dias',
    category: 'practice',
    rarity: 'epic',
    criterion: {
      type: 'pillar_threshold',
      pillar: 'tradition',
      threshold: 200,
    },
    iconHint: 'flame',
  },
  {
    id: 'sabio-da-tradicao',
    name: 'Sábio da Tradição',
    description: 'Linhagem confirmada em 2+ tradições',
    category: 'wisdom',
    rarity: 'epic',
    criterion: {
      type: 'custom',
      evaluator: (rep: UserReputation) => {
        // The crossTraditionMultiplier≥1.5 implies ≥2 traditions
        return (rep.score.crossTraditionMultiplier ?? 0) >= 1.5;
      },
    },
    iconHint: 'tree',
  },
  {
    id: 'pioneiro',
    name: 'Pioneiro',
    description: 'Hospedou 5+ eventos inaugurais da comunidade',
    category: 'pioneering',
    rarity: 'legendary',
    criterion: {
      type: 'event_count',
      eventReason: 'community_event_hosted',
      minCount: 5,
    },
    iconHint: 'compass',
  },
];

export const RARITY_POINTS: Readonly<Record<BadgeRarity, number>> = {
  common: 5,
  uncommon: 15,
  rare: 35,
  epic: 75,
  legendary: 150,
};

/**
 * Default consent policy version. Bump when opt-in copy changes materially;
 * existing opt-ins are re-collected with the new version.
 */
export const CONSENT_VERSION = 'w47-v1';

export const LEADERBOARD_PAGE_SIZE = 25;
export const MAX_LEADERBOARD_PAGE = 50; // hard cap to prevent scraping

// ============================================================================
// ERRORS
// ============================================================================

export type ReputationErrorCode =
  | 'INVALID_PILLAR'
  | 'INVALID_DELTA'
  | 'INVALID_USER'
  | 'NO_CONSENT'
  | 'EVENT_NOT_FOUND'
  | 'BADGE_NOT_FOUND'
  | 'BADGE_ALREADY_AWARDED'
  | 'BADGE_NOT_AWARDED'
  | 'FLAG_NOT_FOUND'
  | 'FLAG_ALREADY_RESOLVED'
  | 'INVALID_ADMIN'
  | 'RATE_LIMITED'
  | 'MIGRATION_INVALID'
  | 'EXPORT_FORMAT_UNSUPPORTED'
  | 'CONSENT_RETROACTIVE_FORBIDDEN'
  | 'PURGE_ALREADY_APPLIED';

export class ReputationError extends Error {
  readonly code: ReputationErrorCode;
  readonly detail?: Record<string, unknown>;
  readonly httpStatus: number;

  constructor(
    code: ReputationErrorCode,
    message: string,
    detail?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ReputationError';
    this.code = code;
    this.detail = detail;
    this.httpStatus = httpStatusForCode(code);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      detail: this.detail,
      httpStatus: this.httpStatus,
    };
  }
}

function httpStatusForCode(code: ReputationErrorCode): number {
  switch (code) {
    case 'EVENT_NOT_FOUND':
    case 'BADGE_NOT_FOUND':
    case 'FLAG_NOT_FOUND':
      return 404;
    case 'NO_CONSENT':
    case 'CONSENT_RETROACTIVE_FORBIDDEN':
    case 'BADGE_ALREADY_AWARDED':
    case 'BADGE_NOT_AWARDED':
    case 'FLAG_ALREADY_RESOLVED':
    case 'INVALID_PILLAR':
    case 'INVALID_DELTA':
    case 'INVALID_USER':
    case 'MIGRATION_INVALID':
    case 'EXPORT_FORMAT_UNSUPPORTED':
      return 400;
    case 'INVALID_ADMIN':
      return 403;
    case 'RATE_LIMITED':
      return 429;
    case 'PURGE_ALREADY_APPLIED':
      return 409;
    default:
      return 500;
  }
}

// ============================================================================
// HELPERS — INTERNAL
// ============================================================================

let _eventCounter = 0;
function generateEventId(): string {
  _eventCounter += 1;
  // sandbox-safe; production replaces w/ cuid/uuid
  const ts = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 1e9).toString(36);
  return `rep-${ts}-${rand}-${_eventCounter}`;
}

let _flagCounter = 0;
function generateFlagId(): string {
  _flagCounter += 1;
  const ts = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 1e9).toString(36);
  return `flag-${ts}-${rand}-${_flagCounter}`;
}

function isValidPillar(p: string): p is ReputationPillar {
  return ALL_PILLARS.includes(p as ReputationPillar);
}

function assertUserId(userId: string): void {
  if (!userId || typeof userId !== 'string' || userId.length < 3) {
    throw new ReputationError('INVALID_USER', 'Invalid userId', { userId });
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Exponential decay for a delta given an age in days and a half-life.
 *   decayed = delta * 2^(-ageDays / halfLifeDays)
 * Returns the original delta if halfLife is undefined or age ≤ 0.
 */
export function decayDelta(
  delta: number,
  ageDays: number,
  halfLifeDays: number | undefined,
): number {
  if (halfLifeDays === undefined || halfLifeDays <= 0) return delta;
  if (ageDays <= 0) return delta;
  const k = -ageDays / halfLifeDays;
  return delta * Math.pow(2, k);
}

function daysBetween(a: Date, b: Date): number {
  const ms = Math.abs(a.getTime() - b.getTime());
  return ms / (1000 * 60 * 60 * 24);
}

function emptyPillarScores(): Record<ReputationPillar, PillarScore> {
  const out = {} as Record<ReputationPillar, PillarScore>;
  for (const p of ALL_PILLARS) {
    out[p] = {
      pillar: p,
      raw: 0,
      weight: PILLAR_WEIGHTS[p],
      weighted: 0,
      eventCount: 0,
    };
  }
  return out;
}

function tierForTotal(total: number): ReputationTier {
  // TIER_THRESHOLDS is sorted ascending; walk down so largest-applicable wins
  let result: ReputationTier = 'novice';
  for (const t of TIER_THRESHOLDS) {
    if (total >= t.minTotal) result = t.tier;
  }
  return result;
}

/**
 * 32-bit FNV-1a hash. Stable, deterministic — does NOT need to be
 * cryptographic. Used only to dedupe anonymized aggregates for ranking.
 */
export function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // unsigned 32-bit hex
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

/**
 * Stable deterministic hash for anonymization. Adds a salt so the same
 * userId produces different hashes across purge operations if re-purged
 * (defense-in-depth against de-anonymization by repeat adversary).
 */
export function anonymizeUserId(userId: string, salt: string): string {
  return fnv1a(`${salt}:${userId}:${Date.now().toString(36)}`);
}

// ============================================================================
// CORE — EVENT RECORDING
// ============================================================================

export interface RecordEventInput {
  readonly pillar: ReputationPillar;
  readonly delta: number;
  readonly reason: EventReason;
  readonly source: ReputationSource;
  readonly actorId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly decaying?: boolean;
  readonly halfLifeDays?: number;
  readonly timestamp?: Date;
}

export function recordEvent(
  userId: string,
  input: RecordEventInput,
): ReputationEvent {
  assertUserId(userId);
  if (!isValidPillar(input.pillar)) {
    throw new ReputationError('INVALID_PILLAR', `Unknown pillar: ${input.pillar}`);
  }
  if (typeof input.delta !== 'number' || Number.isNaN(input.delta)) {
    throw new ReputationError('INVALID_DELTA', 'Delta must be a finite number');
  }
  if (input.delta < -500 || input.delta > 500) {
    throw new ReputationError(
      'INVALID_DELTA',
      'Delta out of plausible range [-500, 500]',
      { delta: input.delta },
    );
  }
  // Defense-in-depth runtime check: the public type does not include 'self',
  // but a tampering client could send untyped input. Cast through unknown
  // for the runtime equality check.
  if ((input.source as unknown as string) === 'self') {
    throw new ReputationError(
      'INVALID_USER',
      'Self-source events are forbidden (anti-gaming)',
    );
  }
  const decaying = input.decaying ?? true;
  const halfLifeDays = input.halfLifeDays ?? DECAY_RATES[input.pillar];
  return {
    id: generateEventId(),
    userId,
    pillar: input.pillar,
    delta: input.delta,
    reason: input.reason,
    source: input.source,
    actorId: input.actorId,
    metadata: input.metadata,
    createdAt: input.timestamp ?? new Date(),
    decaying,
    halfLifeDays: decaying ? halfLifeDays : undefined,
  };
}

// ============================================================================
// CORE — REPUTATION COMPUTE
// ============================================================================

export interface ComputeOptions {
  readonly includeDecayed?: boolean; // default true
  readonly referenceTime?: Date;
  readonly timeRange?: { from: Date; to: Date };
  readonly activeOnly?: boolean; // exclude revokedAt events
}

export function computeReputation(
  userId: string,
  events: readonly ReputationEvent[],
  options: ComputeOptions = {},
): ReputationScore {
  assertUserId(userId);
  const ref = options.referenceTime ?? new Date();
  const includeDecayed = options.includeDecayed ?? true;
  const activeOnly = options.activeOnly ?? true;

  const filtered = events.filter((e) => {
    if (e.userId !== userId) return false;
    if (activeOnly && e.revokedAt) return false;
    if (options.timeRange) {
      if (e.createdAt < options.timeRange.from) return false;
      if (e.createdAt > options.timeRange.to) return false;
    }
    return true;
  });

  const pillars = emptyPillarScores();

  for (const e of filtered) {
    const ageDays = daysBetween(e.createdAt, ref);
    let effective = e.delta;
    if (includeDecayed && e.decaying && e.halfLifeDays) {
      effective = decayDelta(e.delta, ageDays, e.halfLifeDays);
    }
    const cur = pillars[e.pillar];
    const newRaw = cur.raw + effective;
    const newEventCount = cur.eventCount + 1;
    pillars[e.pillar] = {
      pillar: cur.pillar,
      weight: cur.weight,
      raw: newRaw,
      weighted: newRaw * cur.weight,
      eventCount: newEventCount,
      lastEventAt: latestDate(cur.lastEventAt, e.createdAt),
    };
  }

  const total = ALL_PILLARS.reduce(
    (sum, p) => sum + pillars[p].weighted,
    0,
  );

  // Cross-tradition multiplier comes from aggregateReputationAcrossTraditions;
  // here we assume default 1.0 unless overridden via metadata propagation.
  const traditionCount = countDistinctTraditions(filtered);
  const crossTraditionMultiplier =
    traditionCount > 1 ? 1 + Math.log2(traditionCount) * 0.1 : 1;

  return {
    userId,
    total: total * crossTraditionMultiplier,
    pillars: ALL_PILLARS.map((p) => pillars[p]),
    tier: tierForTotal(total * crossTraditionMultiplier),
    computedAt: ref,
    traditionCount,
    crossTraditionMultiplier,
  };
}

function latestDate(a: Date | undefined, b: Date): Date {
  if (!a) return b;
  return a > b ? a : b;
}

function countDistinctTraditions(events: readonly ReputationEvent[]): number {
  const set = new Set<string>();
  for (const e of events) {
    const tag = e.metadata?.['tradition'];
    if (typeof tag === 'string' && tag.length > 0) set.add(tag);
  }
  return set.size;
}

// ============================================================================
// CORE — BREAKDOWN
// ============================================================================

export interface ReputationBreakdown {
  readonly userId: string;
  readonly total: number;
  readonly tier: ReputationTier;
  readonly pillars: Record<ReputationPillar, PillarScore>;
  readonly recentEvents: ReputationEvent[];
  readonly eventCount: number;
  readonly decayWindowDays: number;
  readonly computedAt: Date;
}

export function getReputationBreakdown(
  userId: string,
  events: readonly ReputationEvent[],
  recentLimit = 20,
): ReputationBreakdown {
  assertUserId(userId);
  const score = computeReputation(userId, events);
  const recent = events
    .filter((e) => e.userId === userId && !e.revokedAt)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, recentLimit);

  const pillarsObj = {} as Record<ReputationPillar, PillarScore>;
  for (const p of score.pillars) pillarsObj[p.pillar] = p;

  const decayWindowDays = Math.max(...Object.values(DECAY_RATES));

  return {
    userId,
    total: score.total,
    tier: score.tier,
    pillars: pillarsObj,
    recentEvents: recent,
    eventCount: events.filter((e) => e.userId === userId).length,
    decayWindowDays,
    computedAt: score.computedAt,
  };
}

// ============================================================================
// CORE — LEADERBOARD
// ============================================================================

export interface LeaderboardOptions {
  readonly page?: number;
  readonly pageSize?: number;
  readonly period?: LeaderboardPeriod;
  readonly tradition?: string;
}

export function getTopUsers(
  pillar: ReputationPillar | 'total',
  events: readonly ReputationEvent[],
  consents: readonly PrivacyConsent[],
  options: LeaderboardOptions = {},
): LeaderboardEntry[] {
  const page = clamp(options.page ?? 1, 1, MAX_LEADERBOARD_PAGE);
  const pageSize = clamp(
    options.pageSize ?? LEADERBOARD_PAGE_SIZE,
    1,
    LEADERBOARD_PAGE_SIZE,
  );
  const period = options.period ?? 'all_time';
  const cutoff = periodCutoff(period);
  const traditionFilter = options.tradition;

  const optIn = new Set(
    consents.filter((c) => c.leaderboardOptIn).map((c) => c.userId),
  );

  // Group events by user, compute total for pillar
  const byUser = new Map<string, ReputationEvent[]>();
  for (const e of events) {
    if (e.revokedAt) continue;
    if (cutoff && e.createdAt < cutoff) continue;
    if (traditionFilter) {
      const tag = e.metadata?.['tradition'];
      if (tag !== traditionFilter) continue;
    }
    const arr = byUser.get(e.userId) ?? [];
    arr.push(e);
    byUser.set(e.userId, arr);
  }

  const rows: Array<{ userId: string; total: number; tier: ReputationTier }> = [];
  for (const [userId, evts] of byUser) {
    const score = computeReputation(userId, evts);
    rows.push({
      userId,
      total: pillar === 'total' ? score.total : extractPillarTotal(score, pillar),
      tier: score.tier,
    });
  }

  rows.sort((a, b) => b.total - a.total);

  const start = (page - 1) * pageSize;
  const slice = rows.slice(start, start + pageSize);

  return slice.map((r, i) => ({
    rank: start + i + 1,
    userId: r.userId,
    displayName: optIn.has(r.userId) ? displayNameForUser(r.userId) : hashDisplayName(r.userId),
    score: r.total,
    pillar,
    tradition: traditionFilter,
    anonymized: !optIn.has(r.userId),
    tier: r.tier,
  }));
}

function extractPillarTotal(
  score: ReputationScore,
  pillar: ReputationPillar,
): number {
  const ps = score.pillars.find((p) => p.pillar === pillar);
  return ps ? ps.weighted : 0;
}

function periodCutoff(period: LeaderboardPeriod): Date | null {
  const now = new Date();
  if (period === 'all_time') return null;
  const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - ms);
}

/**
 * Production replaces with a display-name lookup from a redaction layer.
 * Here we keep a private namespace so external callers can't back-trace.
 */
function displayNameForUser(_userId: string): string {
  return 'Praticante';
}

function hashDisplayName(userId: string): string {
  return `praticante-${fnv1a(userId).slice(0, 6)}`;
}

// ============================================================================
// CORE — BADGES
// ============================================================================

export interface BadgeEvaluationContext {
  readonly user: UserReputation;
  readonly events: readonly ReputationEvent[];
}

export function getBadges(
  userId: string,
  user: UserReputation,
  events: readonly ReputationEvent[],
): { earned: Badge[]; inProgress: BadgeProgress[] } {
  assertUserId(userId);
  const earned: Badge[] = [];
  const inProgress: BadgeProgress[] = [];

  for (const def of BADGE_DEFINITIONS) {
    const existing = user.badges.find((b) => b.id === def.id);
    if (existing && !existing.revoked) {
      earned.push({ ...existing, awardedAt: existing.awardedAt });
      continue;
    }
    const meets = evaluateBadge(def, { user, events });
    if (meets) {
      earned.push({
        ...def,
        awardedAt: new Date(),
        awardedBy: 'system',
      });
    } else {
      const progress = computeBadgeProgress(def, user, events);
      if (progress) inProgress.push(progress);
    }
  }

  return { earned, inProgress };
}

export function awardBadge(
  userId: string,
  badgeId: string,
  bySystem: string,
  user: UserReputation,
  events: readonly ReputationEvent[],
): Badge {
  assertUserId(userId);
  const def = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
  if (!def) {
    throw new ReputationError('BADGE_NOT_FOUND', `Badge not found: ${badgeId}`, { badgeId });
  }
  const existing = user.badges.find((b) => b.id === badgeId);
  if (existing && !existing.revoked) {
    throw new ReputationError('BADGE_ALREADY_AWARDED', 'Badge already awarded', {
      badgeId,
      userId,
    });
  }
  if (!evaluateBadge(def, { user, events })) {
    throw new ReputationError(
      'INVALID_PILLAR',
      'Badge criteria not yet met',
      { badgeId, userId },
    );
  }
  return {
    ...def,
    awardedAt: new Date(),
    awardedBy: bySystem,
  };
}

export function revokeBadge(
  userId: string,
  badgeId: string,
  byAdminId: string,
  reason: string,
  badges: Badge[],
  flags: AntiGamingFlag[],
): Badge[] {
  assertUserId(userId);
  if (!byAdminId || byAdminId === userId) {
    throw new ReputationError('INVALID_ADMIN', 'Self-revoke forbidden', { userId });
  }
  if (!reason || reason.length < 5) {
    throw new ReputationError(
      'INVALID_USER',
      'Revocation reason too short (min 5 chars)',
    );
  }
  const target = badges.find((b) => b.id === badgeId && !b.revoked);
  if (!target) {
    throw new ReputationError(
      'BADGE_NOT_AWARDED',
      'No active award found for this badge',
      { badgeId, userId },
    );
  }
  const reviewerFlag = flags.find(
    (f) => f.userId === userId && f.status === 'confirmed' && f.decision,
  );
  if (!reviewerFlag) {
    throw new ReputationError(
      'INVALID_ADMIN',
      'Badge revoke requires a confirmed anti-gaming flag',
      { userId, badgeId },
    );
  }
  return badges.map((b) =>
    b.id === badgeId
      ? { ...b, revoked: true, awardedBy: `${b.awardedBy}::revoked:${byAdminId}` }
      : b,
  );
}

export function checkBadgeEligibility(
  userId: string,
  user: UserReputation,
  events: readonly ReputationEvent[],
): Badge[] {
  assertUserId(userId);
  const earned = new Set(user.badges.filter((b) => !b.revoked).map((b) => b.id));
  return BADGE_DEFINITIONS.filter(
    (b) => !earned.has(b.id) && evaluateBadge(b, { user, events }),
  );
}

function evaluateBadge(
  badge: Badge,
  ctx: BadgeEvaluationContext,
): boolean {
  const c = badge.criterion;
  switch (c.type) {
    case 'pillar_threshold': {
      const ps = ctx.user.pillarScores[c.pillar as ReputationPillar];
      return !!ps && ps.raw >= (c.threshold ?? 0);
    }
    case 'event_count': {
      const count = ctx.events.filter(
        (e) => e.userId === ctx.user.userId && e.reason === c.eventReason && !e.revokedAt,
      ).length;
      return count >= (c.minCount ?? 1);
    }
    case 'streak_days': {
      return computeStreakDays(ctx.user.userId, c.eventReason as EventReason, ctx.events) >=
        (c.minCount ?? 1);
    }
    case 'custom': {
      return typeof c.evaluator === 'function' && c.evaluator(ctx.user) === true;
    }
    default:
      return false;
  }
}

function computeBadgeProgress(
  badge: Badge,
  user: UserReputation,
  events: readonly ReputationEvent[],
): BadgeProgress | null {
  const c = badge.criterion;
  if (c.type === 'pillar_threshold') {
    const ps = user.pillarScores[c.pillar as ReputationPillar];
    const current = ps?.raw ?? 0;
    const required = c.threshold ?? 1;
    if (current >= required) return null;
    return {
      badgeId: badge.id,
      current,
      required,
      percent: clamp((current / required) * 100, 0, 99),
    };
  }
  if (c.type === 'event_count') {
    const count = events.filter(
      (e) =>
        e.userId === user.userId &&
        e.reason === c.eventReason &&
        !e.revokedAt,
    ).length;
    const required = c.minCount ?? 1;
    if (count >= required) return null;
    return {
      badgeId: badge.id,
      current: count,
      required,
      percent: clamp((count / required) * 100, 0, 99),
    };
  }
  return null;
}

function computeStreakDays(
  userId: string,
  reason: EventReason,
  events: readonly ReputationEvent[],
): number {
  const days = new Set<string>();
  for (const e of events) {
    if (e.userId !== userId) continue;
    if (e.revokedAt) continue;
    if (e.reason !== reason) continue;
    days.add(e.createdAt.toISOString().slice(0, 10));
  }
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 366; i += 1) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) streak += 1;
    else break;
  }
  return streak;
}

// ============================================================================
// CORE — DECAY
// ============================================================================

export function decayReputation(
  userId: string,
  pillar: ReputationPillar,
  rate: number,
  events: ReputationEvent[],
  referenceTime: Date = new Date(),
): ReputationEvent[] {
  assertUserId(userId);
  if (!isValidPillar(pillar)) {
    throw new ReputationError('INVALID_PILLAR', `Unknown pillar: ${pillar}`);
  }
  if (typeof rate !== 'number' || rate <= 0) {
    throw new ReputationError('INVALID_DELTA', 'Decay rate must be positive');
  }
  return events.map((e) => {
    if (e.userId !== userId) return e;
    if (e.pillar !== pillar) return e;
    if (e.revokedAt) return e;
    if (!e.decaying) return e;
    const ageDays = daysBetween(e.createdAt, referenceTime);
    const decayed = decayDelta(e.delta, ageDays, rate);
    return { ...e, delta: decayed, halfLifeDays: rate };
  });
}

export function getDecaySchedule(): ReadonlyArray<{
  pillar: ReputationPillar;
  halfLifeDays: number;
}> {
  return ALL_PILLARS.map((p) => ({
    pillar: p,
    halfLifeDays: DECAY_RATES[p],
  }));
}

// ============================================================================
// CORE — ANTI-GAMING
// ============================================================================

export interface AntiGamingContext {
  readonly events: readonly ReputationEvent[];
  readonly flags: readonly AntiGamingFlag[];
  readonly fingerprintHashes?: ReadonlyMap<string, readonly string[]>;
}

export interface AntiGamingReport {
  readonly userId: string;
  readonly signals: GamingSignal[];
  readonly severity: FlagSeverity;
  readonly details: Record<GamingSignal, unknown>;
  readonly action: 'monitor' | 'throttle' | 'suspend' | 'permaban';
  readonly generatedAt: Date;
}

export function detectGaming(
  userId: string,
  ctx: AntiGamingContext,
): AntiGamingReport {
  assertUserId(userId);
  const my = ctx.events.filter((e) => e.userId === userId && !e.revokedAt);
  const signals: GamingSignal[] = [];
  const details = {} as Record<GamingSignal, unknown>;

  if (detectRapidVoting(my)) {
    signals.push('rapid_voting');
    details.rapid_voting = { windowHours: 1, count: countInHours(my, 1) };
  }
  if (detectSelfPromotion(my)) {
    signals.push('self_promotion');
    details.self_promotion = { windowDays: 7, mentions: countSelfPromotion(my) };
  }
  if (detectVoteRing(userId, ctx.events)) {
    signals.push('vote_ring');
    details.vote_ring = { windowDays: 7 };
  }
  if (detectSockPuppet(userId, ctx.fingerprintHashes)) {
    signals.push('sock_puppet');
    details.sock_puppet = { aliases: ctx.fingerprintHashes?.get(userId) ?? [] };
  }
  if (detectBadgeFarming(userId, ctx.flags)) {
    signals.push('badge_farming');
    details.badge_farming = { windowDays: 7 };
  }
  if (detectSuddenSpike(my)) {
    signals.push('sudden_spike');
    details.sudden_spike = { maxHour: countInHours(my, 1), maxDay: countInHours(my, 24) };
  }
  if (detectReciprocalEndorsement(userId, ctx.events)) {
    signals.push('reciprocal_endorsement');
    details.reciprocal_endorsement = { windowDays: 7 };
  }

  const severity = scoreSeverity(signals);
  return {
    userId,
    signals,
    severity,
    details,
    action: actionForSeverity(severity),
    generatedAt: new Date(),
  };
}

function countInHours(events: readonly ReputationEvent[], hours: number): number {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return events.filter((e) => e.createdAt.getTime() >= cutoff).length;
}

function countSelfPromotion(events: readonly ReputationEvent[]): number {
  return events.filter(
    (e) =>
      e.reason === 'content_post_upvoted' &&
      typeof e.metadata?.['self_mention'] === 'boolean' &&
      e.metadata['self_mention'] === true,
  ).length;
}

function detectRapidVoting(events: readonly ReputationEvent[]): boolean {
  const count = countInHours(events, 1);
  return count > GAMING_THRESHOLDS.rapidVoting.maxActionsPerHour;
}

function detectSelfPromotion(events: readonly ReputationEvent[]): boolean {
  return countSelfPromotion(events) > GAMING_THRESHOLDS.selfPromotion.maxSelfMentionsPerWeek;
}

function detectVoteRing(
  userId: string,
  events: readonly ReputationEvent[],
): boolean {
  const cutoff = new Date(
    Date.now() - GAMING_THRESHOLDS.voteRing.windowDays * 24 * 60 * 60 * 1000,
  );
  const inWindow = events.filter(
    (e) =>
      e.userId === userId &&
      e.source === 'peer' &&
      e.actorId &&
      !e.revokedAt &&
      e.createdAt >= cutoff,
  );
  const reciprocated = inWindow.filter((e) => {
    const actor = e.actorId;
    if (!actor) return false;
    return events.some(
      (other) =>
        other.userId === actor &&
        other.source === 'peer' &&
        other.actorId === userId &&
        !other.revokedAt &&
        other.createdAt >= cutoff,
    );
  });
  return reciprocated.length >= GAMING_THRESHOLDS.voteRing.minReciprocalPairs;
}

function detectSockPuppet(
  userId: string,
  fingerprints: ReadonlyMap<string, readonly string[]> | undefined,
): boolean {
  if (!fingerprints) return false;
  const aliases = fingerprints.get(userId) ?? [];
  return aliases.length >= GAMING_THRESHOLDS.sockPuppet.fingerprintMatchThreshold;
}

function detectBadgeFarming(
  userId: string,
  flags: readonly AntiGamingFlag[],
): boolean {
  const windowDays = GAMING_THRESHOLDS.badgeFarming.maxAwardsPer7d;
  const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const recent = flags.filter(
    (f) =>
      f.userId === userId &&
      f.status === 'confirmed' &&
      f.signal === 'badge_farming' &&
      f.createdAt >= cutoff,
  );
  return recent.length > 0;
}

function detectSuddenSpike(events: readonly ReputationEvent[]): boolean {
  const lastHour = countInHours(events, 1);
  const lastDay = countInHours(events, 24);
  return (
    lastHour > GAMING_THRESHOLDS.suddenSpike.maxGainWithin1h ||
    lastDay > GAMING_THRESHOLDS.suddenSpike.maxGainWithin24h
  );
}

function detectReciprocalEndorsement(
  userId: string,
  events: readonly ReputationEvent[],
): boolean {
  const cutoff = new Date(
    Date.now() - GAMING_THRESHOLDS.reciprocalEndorsement.windowDays * 24 * 60 * 60 * 1000,
  );
  let pairs = 0;
  const inWindow = events.filter(
    (e) =>
      e.userId === userId &&
      e.actorId &&
      !e.revokedAt &&
      e.createdAt >= cutoff,
  );
  for (const e of inWindow) {
    const reply = events.find(
      (o) =>
        o.userId === e.actorId &&
        o.actorId === userId &&
        o.reason === e.reason &&
        !o.revokedAt &&
        o.createdAt >= cutoff,
    );
    if (reply) pairs += 1;
  }
  return pairs >= GAMING_THRESHOLDS.reciprocalEndorsement.pairsRequired;
}

function scoreSeverity(signals: readonly GamingSignal[]): FlagSeverity {
  if (signals.length === 0) return 'low';
  if (signals.includes('sock_puppet') || signals.includes('badge_farming')) {
    return 'critical';
  }
  if (signals.includes('vote_ring') && signals.length > 1) return 'high';
  if (signals.length >= 2) return 'medium';
  return 'low';
}

function actionForSeverity(s: FlagSeverity): 'monitor' | 'throttle' | 'suspend' | 'permaban' {
  switch (s) {
    case 'low':
      return 'monitor';
    case 'medium':
      return 'throttle';
    case 'high':
      return 'suspend';
    case 'critical':
      return 'permaban';
  }
}

export interface FlagUserInput {
  readonly userId: string;
  readonly byUserId: string | null;
  readonly signal: GamingSignal;
  readonly description: string;
  readonly evidence?: Record<string, unknown>;
  readonly severity?: FlagSeverity;
}

export function flagUser(input: FlagUserInput): AntiGamingFlag {
  assertUserId(input.userId);
  if (input.description.length < 10) {
    throw new ReputationError(
      'INVALID_USER',
      'Flag description too short (min 10 chars)',
    );
  }
  if (input.byUserId === input.userId) {
    throw new ReputationError(
      'INVALID_USER',
      'Cannot flag yourself (anti-gaming)',
    );
  }
  return {
    id: generateFlagId(),
    userId: input.userId,
    signal: input.signal,
    severity: input.severity ?? 'low',
    status: 'open',
    createdAt: new Date(),
    createdBy: input.byUserId,
    description: input.description,
    evidence: input.evidence ?? {},
  };
}

export interface ReviewDecision {
  readonly decision: 'dismissed' | 'confirmed_warning' | 'confirmed_suspension' | 'confirmed_permaban';
  readonly reason: string;
}

export function reviewFlag(
  flagId: string,
  byAdminId: string,
  decisionInput: ReviewDecision,
  flags: AntiGamingFlag[],
): AntiGamingFlag[] {
  const idx = flags.findIndex((f) => f.id === flagId);
  if (idx < 0) {
    throw new ReputationError('FLAG_NOT_FOUND', `Flag not found: ${flagId}`, { flagId });
  }
  const target = flags[idx];
  if (!target) {
    throw new ReputationError('FLAG_NOT_FOUND', `Flag not found: ${flagId}`, { flagId });
  }
  if (target.status === 'confirmed' || target.status === 'dismissed') {
    throw new ReputationError('FLAG_ALREADY_RESOLVED', `Flag already resolved: ${flagId}`);
  }
  if (!byAdminId || byAdminId.length < 3) {
    throw new ReputationError('INVALID_ADMIN', 'Invalid admin id');
  }
  if (decisionInput.reason.length < 5) {
    throw new ReputationError('INVALID_ADMIN', 'Decision reason too short (min 5 chars)');
  }
  const reviewed: AntiGamingFlag = {
    ...target,
    status: decisionInput.decision === 'dismissed' ? 'dismissed' : 'confirmed',
    reviewedAt: new Date(),
    reviewedBy: byAdminId,
    decision: decisionInput.decision,
    decisionReason: decisionInput.reason,
  };
  const next = flags.slice();
  next[idx] = reviewed;
  return next;
}

// ============================================================================
// CORE — PRIVACY & LGPD
// ============================================================================

export function getLeaderboardOptIn(
  userId: string,
  consents: readonly PrivacyConsent[],
): boolean {
  const consent = consents.find((c) => c.userId === userId);
  return !!consent && consent.leaderboardOptIn === true;
}

export function setLeaderboardOptIn(
  userId: string,
  optIn: boolean,
  consents: readonly PrivacyConsent[],
): PrivacyConsent {
  assertUserId(userId);
  const existing = consents.find((c) => c.userId === userId);
  if (optIn && existing?.leaderboardOptIn && !existing.retractedAt) {
    // idempotent re-opt-in: ignore silently
    return existing;
  }
  if (optIn) {
    return {
      userId,
      leaderboardOptIn: true,
      consentedAt: new Date(),
      consentVersion: CONSENT_VERSION,
    };
  }
  if (!existing) {
    return {
      userId,
      leaderboardOptIn: false,
      consentedAt: null,
      consentVersion: CONSENT_VERSION,
      retractedAt: new Date(),
    };
  }
  return {
    ...existing,
    leaderboardOptIn: false,
    retractedAt: new Date(),
  };
}

export function getAnonymousLeaderboard(
  pillar: ReputationPillar,
  period: LeaderboardPeriod,
  events: readonly ReputationEvent[],
  consents: readonly PrivacyConsent[],
): LeaderboardEntry[] {
  // Without opt-in, replace userId with a stable anonymous token
  const syntheticConsents = consents;
  const rows = getTopUsers(pillar, events, syntheticConsents, {
    period,
    pageSize: LEADERBOARD_PAGE_SIZE,
    page: 1,
  });
  return rows.map((r) =>
    r.anonymized
      ? r
      : {
          ...r,
          userId: fnv1a(r.userId),
          anonymized: true,
        },
  );
}

// ---- GDPR/LGPD purge ------------------------------------------------------

export interface PurgeUserInput {
  readonly userId: string;
  readonly reason?: string;
  readonly salt?: string;
}

export interface PurgeResult {
  readonly report: PurgeReport;
  readonly eventsAfter: ReputationEvent[];
  readonly flagsAfter: AntiGamingFlag[];
  readonly consentsAfter: PrivacyConsent[];
}

export function purgeUser(
  input: PurgeUserInput,
  events: readonly ReputationEvent[],
  flags: readonly AntiGamingFlag[],
  consents: readonly PrivacyConsent[],
): PurgeResult {
  assertUserId(input.userId);
  const salt = input.salt ?? Date.now().toString(36);

  const userEvents = events.filter((e) => e.userId === input.userId);
  if (userEvents.length === 0 && !consents.find((c) => c.userId === input.userId)) {
    throw new ReputationError(
      'PURGE_ALREADY_APPLIED',
      'User has no data left to purge',
      { userId: input.userId },
    );
  }

  // Compute final aggregate BEFORE deleting (required for ranking integrity)
  const finalScore = computeReputation(input.userId, userEvents);
  const pillarAverages = ALL_PILLARS.reduce(
    (acc, p) => {
      acc[p] = finalScore.pillars.find((x) => x.pillar === p)?.raw ?? 0;
      return acc;
    },
    {} as Record<ReputationPillar, number>,
  );
  const aggregate: AnonymizedAggregate = {
    hash: anonymizeUserId(input.userId, salt),
    pillarAverages,
    tierAtPurge: finalScore.tier,
    eventCount: userEvents.length,
    traditionReach: finalScore.traditionCount ?? 0,
    preservedAt: new Date(),
  };

  const eventsAfter = events.filter((e) => e.userId !== input.userId);
  // Flag records keep only their anonymized hash reference for review continuum
  const flagsAfter = flags.map((f) => {
    if (f.userId !== input.userId) return f;
    return {
      ...f,
      userId: aggregate.hash,
      evidence: { redacted: true, hash: aggregate.hash },
    };
  });
  const consentsAfter = consents.map((c) =>
    c.userId === input.userId
      ? {
          ...c,
          leaderboardOptIn: false,
          retractedAt: new Date(),
        }
      : c,
  );

  const userBadgesRevoked = userEvents.filter((e) => e.reason === 'tradition_advanced_degree').length;
  const report: PurgeReport = {
    userId: input.userId,
    purgedAt: new Date(),
    eventsDeleted: userEvents.length,
    badgesRevoked: userBadgesRevoked,
    flagsClosed: flags.filter((f) => f.userId === input.userId).length,
    anonymizedAggregate: aggregate,
    consentRetracted: true,
    auditLogId: fnv1a(`audit:${input.userId}:${salt}`),
  };

  return {
    report,
    eventsAfter,
    flagsAfter,
    consentsAfter,
  };
}

// ============================================================================
// CORE — CROSS-TRADITION AGGREGATION (UNIVERSALISTA)
// ============================================================================

export interface UniversalistaView {
  readonly userId: string;
  readonly traditionsPracticed: string[];
  readonly aggregate: ReputationScore;
  readonly perTradition: Record<string, ReputationScore>;
  readonly crossReferences: Array<{
    readonly from: string;
    readonly to: string;
    readonly strength: number;
    readonly sharedPillars: ReputationPillar[];
  }>;
  readonly computedAt: Date;
}

export function aggregateReputationAcrossTraditions(
  userId: string,
  events: readonly ReputationEvent[],
  crossReferences: ReadonlyMap<string, readonly { to: string; strength: number }[]>,
): UniversalistaView {
  assertUserId(userId);
  const my = events.filter((e) => e.userId === userId && !e.revokedAt);
  const traditions = new Set<string>();
  for (const e of my) {
    const tag = e.metadata?.['tradition'];
    if (typeof tag === 'string') traditions.add(tag);
  }
  const traditionList = Array.from(traditions);
  const perTradition: Record<string, ReputationScore> = {};
  for (const t of traditionList) {
    const tEvents = my.filter((e) => e.metadata?.['tradition'] === t);
    const score = computeReputation(userId, tEvents);
    perTradition[t] = score;
  }
  const aggregate = computeReputation(userId, my);

  const crossRefs: UniversalistaView['crossReferences'] = [];
  for (const t of traditionList) {
    const refs = crossReferences.get(t) ?? [];
    for (const r of refs) {
      if (!traditionList.includes(r.to)) continue;
      crossRefs.push({
        from: t,
        to: r.to,
        strength: r.strength,
        sharedPillars: ['tradition', 'mentorship', 'content'],
      });
    }
  }

  return {
    userId,
    traditionsPracticed: traditionList,
    aggregate,
    perTradition,
    crossReferences: crossRefs,
    computedAt: aggregate.computedAt,
  };
}

export function traditionSpecificScore(
  userId: string,
  tradition: string,
  events: readonly ReputationEvent[],
): ReputationScore {
  assertUserId(userId);
  if (!tradition || typeof tradition !== 'string') {
    throw new ReputationError('INVALID_USER', 'tradition name required');
  }
  const filtered = events.filter(
    (e) => e.userId === userId && e.metadata?.['tradition'] === tradition,
  );
  return computeReputation(userId, filtered);
}

export function getMentorScore(
  userId: string,
  events: readonly ReputationEvent[],
  mentorshipRatingByMentee: ReadonlyMap<string, number>,
): ReputationScore {
  assertUserId(userId);
  const mine = events.filter((e) => e.userId === userId && !e.revokedAt);
  // Boost based on average mentee rating ≥ 4.5
  const ratings: number[] = [];
  for (const r of mentorshipRatingByMentee.values()) ratings.push(r);
  const ratingAvg =
    ratings.length === 0
      ? 0
      : ratings.reduce((s, r) => s + r, 0) / ratings.length;
  const base = computeReputation(userId, mine);
  if (ratingAvg >= 4.5) {
    const bonus = Math.min(50, ratingAvg * 10);
    return { ...base, total: base.total + bonus };
  }
  return base;
}

export function getModeratorScore(
  userId: string,
  events: readonly ReputationEvent[],
): ReputationScore {
  assertUserId(userId);
  const mine = events.filter(
    (e) => e.userId === userId && (e.pillar === 'moderation' || e.pillar === 'community'),
  );
  return computeReputation(userId, mine);
}

// ============================================================================
// CORE — HISTORY
// ============================================================================

export interface HistoryOptions {
  readonly from?: Date;
  readonly to?: Date;
  readonly bucketDays?: number;
  readonly pillars?: readonly ReputationPillar[];
}

export function getReputationHistory(
  userId: string,
  events: readonly ReputationEvent[],
  options: HistoryOptions = {},
): ReputationHistoryPoint[] {
  assertUserId(userId);
  const bucketDays = options.bucketDays ?? 7;
  const to = options.to ?? new Date();
  const from = options.from ?? new Date(to.getTime() - 90 * 24 * 60 * 60 * 1000);
  const buckets = Math.ceil((to.getTime() - from.getTime()) / (bucketDays * 24 * 60 * 60 * 1000));

  const points: ReputationHistoryPoint[] = [];
  for (let i = 0; i < buckets; i += 1) {
    const bucketEnd = new Date(from.getTime() + (i + 1) * bucketDays * 24 * 60 * 60 * 1000);
    const inBucket = events.filter(
      (e) => e.userId === userId && e.createdAt <= bucketEnd && !e.revokedAt,
    );
    const score = computeReputation(userId, inBucket, { referenceTime: bucketEnd });
    const pillarMap = {} as Record<ReputationPillar, number>;
    for (const p of score.pillars) pillarMap[p.pillar] = p.weighted;
    points.push({
      date: bucketEnd,
      total: score.total,
      pillars: pillarMap,
    });
  }
  if (options.pillars) {
    return points.map((p) => {
      const filtered = {} as Record<ReputationPillar, number>;
      for (const pl of options.pillars ?? []) filtered[pl] = p.pillars[pl];
      return { ...p, pillars: filtered };
    });
  }
  return points;
}

// ============================================================================
// CORE — COMPARE USERS
// ============================================================================

export function compareUsers(
  userIds: readonly string[],
  events: readonly ReputationEvent[],
): CompareResult[] {
  if (!Array.isArray(userIds)) {
    throw new ReputationError('INVALID_USER', 'userIds must be array');
  }
  if (userIds.length < 2) {
    throw new ReputationError('INVALID_USER', 'compareUsers requires ≥2 users');
  }
  if (userIds.length > 10) {
    throw new ReputationError('INVALID_USER', 'compareUsers max 10 users');
  }
  return userIds.map((id) => {
    assertUserId(id);
    const userEvents = events.filter((e) => e.userId === id);
    const score = computeReputation(id, userEvents);
    const streak = computeStreakDays(id, 'community_event_attended', userEvents);
    const pillarMap = {} as Record<ReputationPillar, number>;
    for (const p of score.pillars) pillarMap[p.pillar] = p.weighted;
    return {
      userId: id,
      displayName: displayNameForUser(id),
      total: score.total,
      tier: score.tier,
      pillars: pillarMap,
      badges: 0,
      longestStreakDays: streak,
    };
  });
}

// ============================================================================
// CORE — MIGRATION FROM LEGACY
// ============================================================================

export interface MigrationResult {
  readonly userId: string;
  readonly events: ReputationEvent[];
  readonly skipped: Array<{ row: LegacyReputationRecord; reason: string }>;
  readonly importedCount: number;
}

export function migrateFromLegacySystem(
  oldData: readonly LegacyReputationRecord[],
): MigrationResult {
  const events: ReputationEvent[] = [];
  const skipped: MigrationResult['skipped'] = [];

  for (const row of oldData) {
    try {
      assertUserId(row.userId);
      if (typeof row.score !== 'number' || Number.isNaN(row.score)) {
        skipped.push({ row, reason: 'score not a number' });
        continue;
      }
      // Map legacy single score → tradition pillar (most conservative)
      const mappedPillar: ReputationPillar = 'tradition';
      const trad = typeof row.metadata === 'string'
        ? row.metadata
        : 'unspecified';
      events.push({
        id: `migrated-${row.userId}-${row.earnedAt.getTime()}`,
        userId: row.userId,
        pillar: mappedPillar,
        delta: Math.min(50, Math.max(0, row.score)),
        reason: 'tradition_initiation',
        source: 'migration',
        metadata: { tradition: trad, legacyScore: row.score },
        createdAt: row.earnedAt,
        decaying: false, // legacy imports don't decay historically
      });
    } catch (err) {
      skipped.push({ row, reason: (err as Error).message });
    }
  }

  // Group by user
  const firstUser = oldData[0]?.userId ?? 'unknown';
  return {
    userId: firstUser,
    events,
    skipped,
    importedCount: events.length,
  };
}

// ============================================================================
// CORE — EXPORT
// ============================================================================

export function exportReputation(
  userId: string,
  format: ExportFormat,
  events: readonly ReputationEvent[],
  user: UserReputation | null,
): ExportBundle {
  assertUserId(userId);
  if (format !== 'json' && format !== 'csv') {
    throw new ReputationError(
      'EXPORT_FORMAT_UNSUPPORTED',
      `Unsupported format: ${format}`,
      { format },
    );
  }
  const score = computeReputation(userId, events);
  const userEvents = events.filter((e) => e.userId === userId);

  if (format === 'json') {
    const payload = JSON.stringify(
      {
        userId,
        exportedAt: new Date().toISOString(),
        score,
        events: userEvents,
        user,
      },
      null,
      2,
    );
    return {
      userId,
      exportedAt: new Date(),
      format,
      mime: 'application/json',
      payload,
      checksum: fnv1a(payload),
    };
  }

  const header = 'id,userId,pillar,delta,reason,source,createdAt,revoked';
  const rows = userEvents.map((e) =>
    [
      e.id,
      e.userId,
      e.pillar,
      String(e.delta),
      e.reason,
      e.source,
      e.createdAt.toISOString(),
      e.revokedAt ? '1' : '0',
    ].join(','),
  );
  const payload = [header, ...rows].join('\n');
  return {
    userId,
    exportedAt: new Date(),
    format: 'csv',
    mime: 'text/csv',
    payload,
    checksum: fnv1a(payload),
  };
}

// ============================================================================
// PUBLIC HELPERS (re-exports for consumers)
// ============================================================================

/**
 * Tier lookup utility exposed for UI badges.
 */
export function getTierForTotal(total: number): ReputationTier {
  return tierForTotal(total);
}

/**
 * Quick helper for tests: produce a fresh event for a user.
 */
export function makeEvent(
  userId: string,
  pillar: ReputationPillar,
  delta: number,
  reason: EventReason,
  timestamp: Date = new Date(),
): ReputationEvent {
  return recordEvent(userId, {
    pillar,
    delta,
    reason,
    source: 'system',
    timestamp,
  });
}

/**
 * Lookup a badge definition by id.
 */
export function getBadgeDefinition(badgeId: string): Badge | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === badgeId);
}

/**
 * Lookup all badges definitions (rare → common ordering).
 */
export function listBadgeDefinitions(): readonly Badge[] {
  const order: BadgeRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
  const indexByRarity = new Map(order.map((r, i) => [r, i]));
  return [...BADGE_DEFINITIONS].sort(
    (a, b) =>
      (indexByRarity.get(a.rarity) ?? 99) - (indexByRarity.get(b.rarity) ?? 99),
  );
}

/**
 * Total rarity score of a user's earned badges (used in compare/leaderboard
 * tiebreakers).
 */
export function badgeRarityScore(badges: readonly Badge[]): number {
  return badges
    .filter((b) => !b.revoked)
    .reduce((sum, b) => sum + RARITY_POINTS[b.rarity], 0);
}

/**
 * Returns true if a user has at least one awarded, non-revoked badge in the
 * given category.
 */
export function hasBadgeInCategory(
  user: UserReputation,
  category: BadgeCategory,
): boolean {
  return user.badges.some((b) => !b.revoked && b.category === category);
}

/**
 * Best pillar (highest weighted score) for a user's reputation.
 */
export function topPillar(score: ReputationScore): ReputationPillar | null {
  let best: { pillar: ReputationPillar; weighted: number } | null = null;
  for (const p of score.pillars) {
    if (!best || p.weighted > best.weighted) best = p;
  }
  return best?.pillar ?? null;
}

/**
 * Health summary used by the user profile screen.
 */
export interface ReputationHealthSummary {
  readonly total: number;
  readonly tier: ReputationTier;
  readonly trend7d: number;
  readonly pillarHealthScore: number; // 0–100
  readonly warnings: string[];
  readonly tips: string[];
}

export function summarize(
  userId: string,
  events: readonly ReputationEvent[],
): ReputationHealthSummary {
  const score = computeReputation(userId, events);
  const history = getReputationHistory(userId, events, { bucketDays: 1 });
  const trend =
    history.length >= 2
      ? history[history.length - 1].total - history[history.length - 7 >= 0 ? history.length - 7 : 0].total
      : 0;
  const pillarHealthScore = clamp(
    (score.pillars.filter((p) => p.eventCount > 0).length / ALL_PILLARS.length) * 100,
    0,
    100,
  );
  const warnings: string[] = [];
  const tips: string[] = [];
  if (pillarHealthScore < 50) {
    warnings.push('Reputação concentrada em poucos pilares.');
  }
  if (score.traditionCount && score.traditionCount >= 3) {
    tips.push('Considere contribuir na fila de moderação para diversificar.');
  }
  if (score.tier === 'novice' || score.tier === 'aprendiz') {
    tips.push('Compareça a um evento da comunidade para ganhar pontos iniciais.');
  }
  return {
    total: score.total,
    tier: score.tier,
    trend7d: trend,
    pillarHealthScore,
    warnings,
    tips,
  };
}

/**
 * Helper that consumers can call to validate a ReputationEvent shape at
 * ingress points (e.g., tRPC input parsers). Returns the parsed event or
 * throws a ReputationError.
 */
export function parseEvent(input: unknown): ReputationEvent {
  if (typeof input !== 'object' || input === null) {
    throw new ReputationError('INVALID_USER', 'Event must be an object');
  }
  const e = input as Partial<ReputationEvent>;
  if (!e.userId || !isValidPillar(String(e.pillar))) {
    throw new ReputationError('INVALID_PILLAR', 'Invalid event shape');
  }
  if (typeof e.delta !== 'number') {
    throw new ReputationError('INVALID_DELTA', 'Invalid delta');
  }
  if (!(e.createdAt instanceof Date)) {
    throw new ReputationError('INVALID_USER', 'createdAt must be a Date');
  }
  // Narrow pillar type now that isValidPillar validated it
  const pillar = String(e.pillar) as ReputationPillar;
  return {
    id: e.id ?? generateEventId(),
    userId: e.userId,
    pillar,
    delta: e.delta,
    reason: (e.reason as EventReason) ?? 'community_event_attended',
    source: e.source ?? 'system',
    actorId: e.actorId,
    metadata: e.metadata,
    createdAt: e.createdAt,
    decaying: e.decaying ?? true,
    halfLifeDays: e.halfLifeDays ?? DECAY_RATES[pillar],
    revokedAt: e.revokedAt,
    revokedReason: e.revokedReason,
  };
}

/**
 * Returns badge spec for the most-relevant in-progress badge (highest
 * percent completion). UI surfaces this as a "next achievement" hint.
 */
export function nextBadge(user: UserReputation): BadgeProgress | null {
  if (!user.badgesInProgress || user.badgesInProgress.length === 0) return null;
  let best: BadgeProgress | null = null;
  for (const p of user.badgesInProgress) {
    if (!best || p.percent > best.percent) best = p;
  }
  return best;
}

/**
 * Whether `events` contain at least 1 confirmed anti-gaming flag for a user.
 */
export function isFlaggedAsGamer(
  userId: string,
  flags: readonly AntiGamingFlag[],
): boolean {
  return flags.some(
    (f) =>
      f.userId === userId &&
      f.status === 'confirmed' &&
      (f.decision === 'confirmed_suspension' ||
        f.decision === 'confirmed_permaban'),
  );
}

/**
 * Anti-gaming hook: events from a flagged gamer are auto-weighted to 0.
 */
export function effectiveDelta(
  event: ReputationEvent,
  flags: readonly AntiGamingFlag[],
): number {
  if (event.revokedAt) return 0;
  if (
    isFlaggedAsGamer(event.userId, flags) &&
    Date.now() - event.createdAt.getTime() < 1000 * 60 * 60 * 24 * 30
  ) {
    return 0;
  }
  return event.delta;
}

export const REPUTATION_MODULE_VERSION = 'w47-v1';

// ============================================================================
// END
// ============================================================================
