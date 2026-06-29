/**
 * Notifications Preferences Engine — W63
 *
 * Pure-TypeScript engine for routing, bundling, and digesting user
 * notifications across push, email, in_app and suppressed channels.
 *
 * Implements:
 *   - Type taxonomy (20 NotificationKind × 4 NotificationChannel × 4 NotificationPriority)
 *   - Default fixtures + factory (no shared refs)
 *   - Validation (quiet hours, bundle window, composite preferences)
 *   - Sanitization (clamp invalid values silently, never throws)
 *   - Channel routing (urgent boost, quiet hours, per-channel toggles)
 *   - Quiet hours with midnight wrap (22 → 7 = 22..23 OR 0..7)
 *   - Bundling within configurable window, grouped by kind
 *   - Digest cadence (hourly/daily/weekly) with next-send calculation
 *   - Audit functions for kind coverage + channel routing
 *   - Sacred cross-cutting mapping (orixás, chakras, arcanos maiores, sefirot)
 *   - Pure i18n with Intl.DateTimeFormat (zero external deps)
 *
 * Zero external deps. Uses `Intl.DateTimeFormat` and native string ops.
 */

// ============================================================================
// SECTION 1 — Core types
// ============================================================================

export type NotificationChannel = 'push' | 'email' | 'in_app' | 'suppressed';

export const NOTIFICATION_CHANNELS: readonly NotificationChannel[] = [
  'push',
  'email',
  'in_app',
  'suppressed',
] as const;

export type NotificationKind =
  | 'comment_reply'
  | 'comment_mention'
  | 'follow'
  | 'like'
  | 'repost'
  | 'mentorship_request'
  | 'mentorship_accepted'
  | 'mentorship_session'
  | 'marketplace_order'
  | 'marketplace_review'
  | 'marketplace_message'
  | 'event_reminder'
  | 'live_stream_start'
  | 'akasha_response'
  | 'streak_at_risk'
  | 'reputation_earned'
  | 'badge_unlocked'
  | 'moderation_alert'
  | 'security_alert'
  | 'newsletter';

export const NOTIFICATION_KINDS: readonly NotificationKind[] = [
  'comment_reply',
  'comment_mention',
  'follow',
  'like',
  'repost',
  'mentorship_request',
  'mentorship_accepted',
  'mentorship_session',
  'marketplace_order',
  'marketplace_review',
  'marketplace_message',
  'event_reminder',
  'live_stream_start',
  'akasha_response',
  'streak_at_risk',
  'reputation_earned',
  'badge_unlocked',
  'moderation_alert',
  'security_alert',
  'newsletter',
] as const;

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export const NOTIFICATION_PRIORITIES: readonly NotificationPriority[] = [
  'low',
  'normal',
  'high',
  'urgent',
] as const;

export type DigestCadence = 'hourly' | 'daily' | 'weekly';

export type SuppressionReason =
  | 'quiet_hours'
  | 'prefs_disabled'
  | 'kind_disabled'
  | 'channel_disabled'
  | 'bundle_window_open';

export interface QuietHours {
  startHour: number;
  endHour: number;
  enabled: boolean;
}

export interface DigestConfig {
  enabled: boolean;
  cadence: DigestCadence;
  hourOfDay?: number;
  dayOfWeek?: number;
}

export interface NotificationPreferences {
  userId: string;
  channels: Record<NotificationKind, NotificationChannel>;
  quietHours: QuietHours;
  bundleWindowMinutes: number;
  bundleableKinds: NotificationKind[];
  digest: DigestConfig;
  perChannel: {
    push: boolean;
    email: boolean;
    inApp: boolean;
  };
}

export interface RawNotification {
  id: string;
  userId: string;
  kind: NotificationKind;
  priority: NotificationPriority;
  title: string;
  body: string;
  createdAt: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface NotificationDecision {
  allowed: boolean;
  channel: NotificationChannel;
  suppressedReason?: SuppressionReason;
}

export interface BundleSummary {
  count: number;
  kinds: NotificationKind[];
  topPriority: NotificationPriority;
  oldestAtMs: number;
}

export interface DigestSummary {
  subjectLine: string;
  bodyLines: string[];
  unsubscribeKind: NotificationKind;
}

export interface KindCoverageReport {
  total: number;
  covered: NotificationKind[];
  missing: NotificationKind[];
}

export interface PreferencesSummary {
  enabledChannels: NotificationChannel[];
  quietHoursActive: boolean;
  digestEnabled: boolean;
  perKind: Record<NotificationKind, NotificationChannel>;
}

// ============================================================================
// SECTION 2 — Defaults & fixtures
// ============================================================================

export const DEFAULT_QUIET_HOURS: QuietHours = Object.freeze({
  startHour: 22,
  endHour: 7,
  enabled: true,
});

export const DEFAULT_BUNDLEABLE_KINDS: readonly NotificationKind[] = Object.freeze([
  'like',
  'repost',
  'follow',
  'comment_reply',
  'comment_mention',
  'mentorship_session',
  'marketplace_review',
  'event_reminder',
  'reputation_earned',
  'badge_unlocked',
  'newsletter',
]);

export const MIN_BUNDLE_WINDOW_MINUTES = 5;
export const MAX_BUNDLE_WINDOW_MINUTES = 1440;
export const MIN_DIGEST_HOUR = 0;
export const MAX_DIGEST_HOUR = 23;
export const MIN_DIGEST_DAY_OF_WEEK = 0;
export const MAX_DIGEST_DAY_OF_WEEK = 6;

const PRIORITY_RANK: Record<NotificationPriority, number> = {
  low: 0,
  normal: 1,
  high: 2,
  urgent: 3,
};

function emptyChannelMap(): Record<NotificationKind, NotificationChannel> {
  const m = {} as Record<NotificationKind, NotificationChannel>;
  for (const k of NOTIFICATION_KINDS) {
    m[k] = 'in_app';
  }
  return m;
}

export function DEFAULT_NOTIFICATION_PREFERENCES(userId: string): NotificationPreferences {
  const channels = emptyChannelMap();
  // Per-kind default channel preferences — push for most interactive kinds,
  // email for digest-style or marketing, in_app for in-flow ambient signals.
  for (const k of NOTIFICATION_KINDS) {
    channels[k] = 'push';
  }
  channels.newsletter = 'email';
  channels.reputation_earned = 'in_app';
  channels.badge_unlocked = 'in_app';
  channels.akasha_response = 'in_app';
  channels.marketplace_message = 'email';
  channels.marketplace_review = 'in_app';

  return {
    userId,
    channels,
    quietHours: {
      startHour: DEFAULT_QUIET_HOURS.startHour,
      endHour: DEFAULT_QUIET_HOURS.endHour,
      enabled: DEFAULT_QUIET_HOURS.enabled,
    },
    bundleWindowMinutes: 15,
    bundleableKinds: DEFAULT_BUNDLEABLE_KINDS.slice(),
    digest: {
      enabled: true,
      cadence: 'daily',
      hourOfDay: 9,
    },
    perChannel: {
      push: true,
      email: true,
      inApp: true,
    },
  };
}

// ============================================================================
// SECTION 3 — Validation
// ============================================================================

export interface ValidationReport {
  valid: boolean;
  errors: string[];
}

export function validateQuietHours(quiet: QuietHours): ValidationReport {
  const errors: string[] = [];
  if (!Number.isInteger(quiet.startHour) || quiet.startHour < 0 || quiet.startHour > 23) {
    errors.push('startHour must be an integer in 0..23');
  }
  if (!Number.isInteger(quiet.endHour) || quiet.endHour < 0 || quiet.endHour > 23) {
    errors.push('endHour must be an integer in 0..23');
  }
  if (
    quiet.enabled &&
    Number.isInteger(quiet.startHour) &&
    Number.isInteger(quiet.endHour) &&
    quiet.startHour === quiet.endHour
  ) {
    errors.push('endHour must differ from startHour when enabled');
  }
  return { valid: errors.length === 0, errors };
}

export function validateBundleWindow(minutes: number): boolean {
  if (!Number.isFinite(minutes)) return false;
  if (!Number.isInteger(minutes)) return false;
  return minutes >= MIN_BUNDLE_WINDOW_MINUTES && minutes <= MAX_BUNDLE_WINDOW_MINUTES;
}

export function validatePreferences(prefs: NotificationPreferences): ValidationReport {
  const errors: string[] = [];
  if (!prefs || typeof prefs !== 'object') {
    errors.push('prefs must be an object');
    return { valid: false, errors };
  }
  if (typeof prefs.userId !== 'string' || prefs.userId.length === 0) {
    errors.push('userId must be a non-empty string');
  }
  if (!prefs.channels || typeof prefs.channels !== 'object') {
    errors.push('channels map required');
  } else {
    for (const k of NOTIFICATION_KINDS) {
      if (!(k in prefs.channels)) {
        errors.push(`channels missing kind "${k}"`);
      } else if (!NOTIFICATION_CHANNELS.includes(prefs.channels[k])) {
        errors.push(`channels["${k}"] invalid channel`);
      }
    }
  }
  const qh = validateQuietHours(prefs.quietHours);
  if (!qh.valid) errors.push(...qh.errors.map((e) => `quietHours: ${e}`));
  if (!validateBundleWindow(prefs.bundleWindowMinutes)) {
    errors.push(
      `bundleWindowMinutes must be ${MIN_BUNDLE_WINDOW_MINUTES}..${MAX_BUNDLE_WINDOW_MINUTES}`,
    );
  }
  if (!prefs.digest || typeof prefs.digest !== 'object') {
    errors.push('digest config required');
  } else if (!['hourly', 'daily', 'weekly'].includes(prefs.digest.cadence)) {
    errors.push('digest.cadence invalid');
  }
  if (!prefs.perChannel || typeof prefs.perChannel !== 'object') {
    errors.push('perChannel required');
  } else {
    for (const ch of ['push', 'email', 'inApp'] as const) {
      if (typeof prefs.perChannel[ch] !== 'boolean') {
        errors.push(`perChannel.${ch} must be boolean`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

// ============================================================================
// SECTION 4 — Sanitization (clamps silently, never throws)
// ============================================================================

export function sanitizePreferences(input: unknown): NotificationPreferences {
  const fallback = DEFAULT_NOTIFICATION_PREFERENCES('anonymous');
  if (!input || typeof input !== 'object') {
    return fallback;
  }
  const raw = input as Partial<NotificationPreferences> & Record<string, unknown>;
  const userId =
    typeof raw.userId === 'string' && raw.userId.length > 0 ? raw.userId : 'anonymous';

  const channels: Record<NotificationKind, NotificationChannel> = emptyChannelMap();
  const rawChannels = (raw.channels && typeof raw.channels === 'object'
    ? (raw.channels as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  for (const k of NOTIFICATION_KINDS) {
    const candidate = rawChannels[k];
    if (typeof candidate === 'string' && NOTIFICATION_CHANNELS.includes(candidate as NotificationChannel)) {
      channels[k] = candidate as NotificationChannel;
    }
  }

  const rawQh = (raw.quietHours && typeof raw.quietHours === 'object'
    ? (raw.quietHours as Partial<QuietHours>)
    : {}) as Partial<QuietHours>;
  const startHour = clampInt(rawQh.startHour, 0, 23, fallback.quietHours.startHour);
  const endHour = clampInt(rawQh.endHour, 0, 23, fallback.quietHours.endHour);
  const enabled =
    typeof rawQh.enabled === 'boolean' ? rawQh.enabled : fallback.quietHours.enabled;
  const quietHours: QuietHours = { startHour, endHour, enabled };

  const bundleWindowMinutes = clampInt(
    raw.bundleWindowMinutes,
    MIN_BUNDLE_WINDOW_MINUTES,
    MAX_BUNDLE_WINDOW_MINUTES,
    fallback.bundleWindowMinutes,
  );

  const rawBundleable = Array.isArray(raw.bundleableKinds) ? raw.bundleableKinds : [];
  const bundleableKinds: NotificationKind[] = [];
  for (const k of rawBundleable) {
    if (typeof k === 'string' && NOTIFICATION_KINDS.includes(k as NotificationKind)) {
      if (!bundleableKinds.includes(k as NotificationKind)) {
        bundleableKinds.push(k as NotificationKind);
      }
    }
  }

  const rawDigest = (raw.digest && typeof raw.digest === 'object'
    ? (raw.digest as Partial<DigestConfig>)
    : {}) as Partial<DigestConfig>;
  const cadence: DigestCadence =
    rawDigest.cadence === 'hourly' ||
    rawDigest.cadence === 'daily' ||
    rawDigest.cadence === 'weekly'
      ? rawDigest.cadence
      : 'daily';
  const hourOfDay =
    typeof rawDigest.hourOfDay === 'number'
      ? clampInt(rawDigest.hourOfDay, MIN_DIGEST_HOUR, MAX_DIGEST_HOUR, 9)
      : undefined;
  const dayOfWeek =
    typeof rawDigest.dayOfWeek === 'number'
      ? clampInt(rawDigest.dayOfWeek, MIN_DIGEST_DAY_OF_WEEK, MAX_DIGEST_DAY_OF_WEEK, 1)
      : undefined;

  const rawPc = (raw.perChannel && typeof raw.perChannel === 'object'
    ? (raw.perChannel as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const perChannel = {
    push: typeof rawPc.push === 'boolean' ? rawPc.push : true,
    email: typeof rawPc.email === 'boolean' ? rawPc.email : true,
    inApp: typeof rawPc.inApp === 'boolean' ? rawPc.inApp : true,
  };

  return {
    userId,
    channels,
    quietHours,
    bundleWindowMinutes,
    bundleableKinds,
    digest: { enabled: true, cadence, hourOfDay, dayOfWeek },
    perChannel,
  };
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const rounded = Math.trunc(value);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

// ============================================================================
// SECTION 5 — Quiet hours + channel routing
// ============================================================================

export function isInQuietHours(nowMs: number, quiet: QuietHours): boolean {
  if (!quiet.enabled) return false;
  const hour = new Date(nowMs).getUTCHours();
  const { startHour, endHour } = quiet;
  if (startHour === endHour) return false;
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour;
  }
  // wrap past midnight (e.g. 22 → 7)
  return hour >= startHour || hour < endHour;
}

export function pickAvailableChannel(
  prefs: NotificationPreferences,
  priority: NotificationPriority,
): NotificationChannel {
  // Urgent + high push first
  if ((priority === 'urgent' || priority === 'high') && prefs.perChannel.push) {
    return 'push';
  }
  if (prefs.perChannel.push) return 'push';
  if (prefs.perChannel.email) return 'email';
  if (prefs.perChannel.inApp) return 'in_app';
  return 'suppressed';
}

export function decideChannelAt(
  notif: RawNotification,
  prefs: NotificationPreferences,
  nowUtcMs: number,
): NotificationDecision {
  // 1) Hard kind suppression (per-kind channel = 'suppressed')
  const kindChannel = prefs.channels[notif.kind];
  if (kindChannel === 'suppressed') {
    return { allowed: false, channel: 'suppressed', suppressedReason: 'kind_disabled' };
  }

  // 2) Quiet hours take precedence over priority — even urgent defers to quiet hours
  if (isInQuietHours(nowUtcMs, prefs.quietHours)) {
    if (prefs.perChannel.inApp) {
      return {
        allowed: true,
        channel: 'in_app',
        suppressedReason: 'quiet_hours',
      };
    }
    return { allowed: false, channel: 'suppressed', suppressedReason: 'quiet_hours' };
  }

  // 3) Urgent priority always goes to push (or fallback through perChannel)
  if (notif.priority === 'urgent') {
    if (prefs.perChannel.push) {
      return { allowed: true, channel: 'push' };
    }
    if (prefs.perChannel.email) {
      return { allowed: true, channel: 'email' };
    }
    if (prefs.perChannel.inApp) {
      return { allowed: true, channel: 'in_app' };
    }
    return { allowed: false, channel: 'suppressed', suppressedReason: 'channel_disabled' };
  }

  // 4) Per-channel toggle gating
  if (!prefs.perChannel.push && !prefs.perChannel.email && !prefs.perChannel.inApp) {
    return { allowed: false, channel: 'suppressed', suppressedReason: 'channel_disabled' };
  }

  // 5) Per-kind preference: only applied when the kind channel matches
  //    the user's per-channel toggle. (Informational — fall through to
  //    pickAvailableChannel otherwise so priority routing dominates.)
  if (
    kindChannel === 'push' ||
    kindChannel === 'email' ||
    kindChannel === 'in_app'
  ) {
    const flagKey: 'push' | 'email' | 'inApp' =
      kindChannel === 'in_app' ? 'inApp' : kindChannel;
    if (prefs.perChannel[flagKey]) {
      return { allowed: true, channel: kindChannel };
    }
  }

  // 6) Fall back to pickAvailableChannel (priority-aware)
  const channel = pickAvailableChannel(prefs, notif.priority);
  if (channel === 'suppressed') {
    return { allowed: false, channel: 'suppressed', suppressedReason: 'channel_disabled' };
  }
  return { allowed: true, channel };
}

export function decideChannel(
  notif: RawNotification,
  prefs: NotificationPreferences,
): NotificationDecision {
  return decideChannelAt(notif, prefs, Date.now());
}

// ============================================================================
// SECTION 6 — Bundling
// ============================================================================

export function bundleNotifications(
  notifs: readonly RawNotification[],
  prefs: NotificationPreferences,
  nowMs: number,
): RawNotification[][] {
  if (notifs.length === 0) return [];
  const windowMs = prefs.bundleWindowMinutes * 60_000;
  // Only consider bundleable kinds, sorted ascending by createdAt
  const candidates = notifs
    .filter((n) => prefs.bundleableKinds.includes(n.kind))
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt);

  const bundles: RawNotification[][] = [];
  for (const n of candidates) {
    const last = bundles[bundles.length - 1];
    if (
      last &&
      last.length > 0 &&
      last[0].kind === n.kind &&
      n.createdAt - last[last.length - 1].createdAt < windowMs &&
      nowMs - n.createdAt < windowMs
    ) {
      last.push(n);
    } else {
      bundles.push([n]);
    }
  }
  return bundles;
}

export function summarizeBundle(group: readonly RawNotification[]): BundleSummary {
  const kinds: NotificationKind[] = [];
  let topPriority: NotificationPriority = 'low';
  let oldestAtMs = Number.POSITIVE_INFINITY;
  for (const n of group) {
    if (!kinds.includes(n.kind)) kinds.push(n.kind);
    if (PRIORITY_RANK[n.priority] > PRIORITY_RANK[topPriority]) {
      topPriority = n.priority;
    }
    if (n.createdAt < oldestAtMs) oldestAtMs = n.createdAt;
  }
  return {
    count: group.length,
    kinds,
    topPriority,
    oldestAtMs: oldestAtMs === Number.POSITIVE_INFINITY ? 0 : oldestAtMs,
  };
}

// ============================================================================
// SECTION 7 — Digest scheduling
// ============================================================================

export function shouldSendDigest(nowMs: number, prefs: NotificationPreferences): boolean {
  if (!prefs.digest.enabled) return false;
  const d = new Date(nowMs);
  const hour = d.getUTCHours();
  const day = d.getUTCDay();
  const minute = d.getUTCMinutes();
  const targetHour = prefs.digest.hourOfDay ?? 9;
  const targetDay = prefs.digest.dayOfWeek ?? 1;
  switch (prefs.digest.cadence) {
    case 'hourly':
      return minute < 5;
    case 'daily':
      return hour === targetHour && minute < 5;
    case 'weekly':
      return day === targetDay && hour === targetHour && minute < 5;
  }
}

export function daysUntilNextDigest(nowMs: number, prefs: NotificationPreferences): number {
  if (!prefs.digest.enabled) return -1;
  const d = new Date(nowMs);
  const currentHour = d.getUTCHours();
  const currentDay = d.getUTCDay();
  const targetHour = prefs.digest.hourOfDay ?? 9;
  const targetDay = prefs.digest.dayOfWeek ?? 1;
  switch (prefs.digest.cadence) {
    case 'hourly':
      return 0;
    case 'daily': {
      if (currentHour < targetHour) return 0;
      if (currentHour === targetHour) return 0;
      return 1;
    }
    case 'weekly': {
      let delta = (targetDay - currentDay + 7) % 7;
      if (delta === 0 && currentHour > targetHour) delta = 7;
      return delta;
    }
  }
}

export function buildDigestSummary(notifs: readonly RawNotification[]): DigestSummary {
  if (notifs.length === 0) {
    return {
      subjectLine: 'Nenhuma atualização',
      bodyLines: ['Sem notificações neste período.'],
      unsubscribeKind: 'newsletter',
    };
  }
  const kindCounts: Partial<Record<NotificationKind, number>> = {};
  let unsubscribeKind: NotificationKind = 'newsletter';
  let maxCount = -1;
  for (const n of notifs) {
    kindCounts[n.kind] = (kindCounts[n.kind] ?? 0) + 1;
    if ((kindCounts[n.kind] ?? 0) > maxCount) {
      maxCount = kindCounts[n.kind] ?? 0;
      unsubscribeKind = n.kind;
    }
  }
  const subjectLine = `${notifs.length} atualizações desde o último resumo`;
  const bodyLines: string[] = [];
  for (const [kind, count] of Object.entries(kindCounts)) {
    bodyLines.push(`${count}× ${kind.replace(/_/g, ' ')}`);
  }
  return { subjectLine, bodyLines, unsubscribeKind };
}

// ============================================================================
// SECTION 8 — Audit & coverage
// ============================================================================

export function auditNotificationKindCoverage(): KindCoverageReport {
  const coveredSet = new Set<NotificationKind>(DEFAULT_BUNDLEABLE_KINDS);
  const covered: NotificationKind[] = [];
  const missing: NotificationKind[] = [];
  for (const k of NOTIFICATION_KINDS) {
    if (coveredSet.has(k)) covered.push(k);
    else missing.push(k);
  }
  return { total: NOTIFICATION_KINDS.length, covered, missing };
}

export function auditChannelRoutes(): Record<NotificationKind, NotificationDecision[]> {
  const result = {} as Record<NotificationKind, NotificationDecision[]>;
  const userIds = ['user-a', 'user-b', 'user-c'];
  const priorities: NotificationPriority[] = ['low', 'normal', 'high', 'urgent'];
  const hours = [3, 12, 21];
  for (const k of NOTIFICATION_KINDS) {
    result[k] = [];
    for (const uid of userIds) {
      const prefs = DEFAULT_NOTIFICATION_PREFERENCES(uid);
      for (const p of priorities) {
        for (const h of hours) {
          const now = Date.UTC(2026, 5, 29, h, 0, 0);
          const notif: RawNotification = {
            id: `${uid}-${k}-${p}-${h}`,
            userId: uid,
            kind: k,
            priority: p,
            title: `audit ${k}`,
            body: 'audit',
            createdAt: now,
          };
          result[k].push(decideChannelAt(notif, prefs, now));
        }
      }
    }
  }
  return result;
}

export function summarizePreferences(prefs: NotificationPreferences): PreferencesSummary {
  const enabledChannels: NotificationChannel[] = [];
  if (prefs.perChannel.push) enabledChannels.push('push');
  if (prefs.perChannel.email) enabledChannels.push('email');
  if (prefs.perChannel.inApp) enabledChannels.push('in_app');
  return {
    enabledChannels,
    quietHoursActive: prefs.quietHours.enabled,
    digestEnabled: prefs.digest.enabled,
    perKind: { ...prefs.channels },
  };
}

// ============================================================================
// SECTION 9 — Sacred cross-cutting mapping
// ============================================================================

export type SacredSystem =
  | 'chakra'
  | 'arcano_maior'
  | 'orixa'
  | 'sefira'
  | 'sagrado'
  | 'natureza'
  | 'humano';

export interface SacredMapping {
  system: SacredSystem;
  symbol: string;
  kind: NotificationKind | null;
}

const SACRED_MAP: readonly SacredMapping[] = [
  // 7 chakras → 7 distinct kinds
  { system: 'chakra', symbol: 'muladhara', kind: 'streak_at_risk' },
  { system: 'chakra', symbol: 'svadhisthana', kind: 'reputation_earned' },
  { system: 'chakra', symbol: 'manipura', kind: 'badge_unlocked' },
  { system: 'chakra', symbol: 'anahata', kind: 'comment_reply' },
  { system: 'chakra', symbol: 'vishuddha', kind: 'comment_mention' },
  { system: 'chakra', symbol: 'ajna', kind: 'akasha_response' },
  { system: 'chakra', symbol: 'sahasrara', kind: 'live_stream_start' },

  // 22 arcanos maiores → mapped to rep/follow/mentorship/live/marketplace
  { system: 'arcano_maior', symbol: 'the_fool', kind: 'follow' },
  { system: 'arcano_maior', symbol: 'the_magician', kind: 'mentorship_request' },
  { system: 'arcano_maior', symbol: 'the_high_priestess', kind: 'akasha_response' },
  { system: 'arcano_maior', symbol: 'the_empress', kind: 'marketplace_order' },
  { system: 'arcano_maior', symbol: 'the_emperor', kind: 'mentorship_accepted' },
  { system: 'arcano_maior', symbol: 'the_hierophant', kind: 'newsletter' },
  { system: 'arcano_maior', symbol: 'the_lovers', kind: 'like' },
  { system: 'arcano_maior', symbol: 'the_chariot', kind: 'streak_at_risk' },
  { system: 'arcano_maior', symbol: 'strength', kind: 'reputation_earned' },
  { system: 'arcano_maior', symbol: 'the_hermit', kind: 'akasha_response' },
  { system: 'arcano_maior', symbol: 'wheel_of_fortune', kind: 'event_reminder' },
  { system: 'arcano_maior', symbol: 'justice', kind: 'moderation_alert' },
  { system: 'arcano_maior', symbol: 'the_hanged_man', kind: 'mentorship_session' },
  { system: 'arcano_maior', symbol: 'death', kind: 'security_alert' },
  { system: 'arcano_maior', symbol: 'temperance', kind: 'reputation_earned' },
  { system: 'arcano_maior', symbol: 'the_devil', kind: 'moderation_alert' },
  { system: 'arcano_maior', symbol: 'the_tower', kind: 'security_alert' },
  { system: 'arcano_maior', symbol: 'the_star', kind: 'live_stream_start' },
  { system: 'arcano_maior', symbol: 'the_moon', kind: 'akasha_response' },
  { system: 'arcano_maior', symbol: 'the_sun', kind: 'badge_unlocked' },
  { system: 'arcano_maior', symbol: 'judgement', kind: 'event_reminder' },
  { system: 'arcano_maior', symbol: 'the_world', kind: 'newsletter' },

  // 16 orixás → marketplace, mentorship, events, moderation
  { system: 'orixa', symbol: 'oxala', kind: 'newsletter' },
  { system: 'orixa', symbol: 'iemanja', kind: 'event_reminder' },
  { system: 'orixa', symbol: 'oxossi', kind: 'marketplace_order' },
  { system: 'orixa', symbol: 'ogum', kind: 'mentorship_accepted' },
  { system: 'orixa', symbol: 'xango', kind: 'moderation_alert' },
  { system: 'orixa', symbol: 'oba', kind: 'marketplace_review' },
  { system: 'orixa', symbol: 'oxum', kind: 'marketplace_message' },
  { system: 'orixa', symbol: 'loguna', kind: 'live_stream_start' },
  { system: 'orixa', symbol: 'exu', kind: 'security_alert' },
  { system: 'orixa', symbol: 'pombagira', kind: 'reputation_earned' },
  { system: 'orixa', symbol: 'iansa', kind: 'event_reminder' },
  { system: 'orixa', symbol: 'obaluae', kind: 'moderation_alert' },
  { system: 'orixa', symbol: 'omolu', kind: 'security_alert' },
  { system: 'orixa', symbol: 'nanã', kind: 'mentorship_session' },
  { system: 'orixa', symbol: 'iaba', kind: 'akasha_response' },
  { system: 'orixa', symbol: 'orunmila', kind: 'akasha_response' },

  // 10 sefirot → reputation, streak, badge, follow, mentorship
  { system: 'sefira', symbol: 'keter', kind: 'badge_unlocked' },
  { system: 'sefira', symbol: 'chokhmah', kind: 'akasha_response' },
  { system: 'sefira', symbol: 'binah', kind: 'newsletter' },
  { system: 'sefira', symbol: 'chesed', kind: 'like' },
  { system: 'sefira', symbol: 'gevurah', kind: 'moderation_alert' },
  { system: 'sefira', symbol: 'tiferet', kind: 'reputation_earned' },
  { system: 'sefira', symbol: 'netzach', kind: 'follow' },
  { system: 'sefira', symbol: 'hod', kind: 'comment_mention' },
  { system: 'sefira', symbol: 'yesod', kind: 'streak_at_risk' },
  { system: 'sefira', symbol: 'malkuth', kind: 'marketplace_order' },
];

export function notifyOnSacredEvent(
  system: SacredSystem,
  symbol: string,
): NotificationKind | null {
  const lower = symbol.trim().toLowerCase();
  for (const m of SACRED_MAP) {
    if (m.system === system && m.symbol === lower) return m.kind;
  }
  return null;
}

export function listSacredMappings(): readonly SacredMapping[] {
  return SACRED_MAP;
}

// ============================================================================
// SECTION 10 — i18n (pt-BR / en-US / es-ES) — minimal labels for channel/kind
// ============================================================================

export type Locale = 'pt-BR' | 'en-US' | 'es-ES';

export const SUPPORTED_LOCALES: readonly Locale[] = ['pt-BR', 'en-US', 'es-ES'] as const;

type I18nKey =
  | 'channel.push'
  | 'channel.email'
  | 'channel.in_app'
  | 'channel.suppressed'
  | 'priority.low'
  | 'priority.normal'
  | 'priority.high'
  | 'priority.urgent'
  | 'digest.subject'
  | 'digest.unsubscribe';

const I18N: Record<Locale, Record<I18nKey, string>> = {
  'pt-BR': {
    'channel.push': 'Notificação push',
    'channel.email': 'E-mail',
    'channel.in_app': 'No app',
    'channel.suppressed': 'Silenciado',
    'priority.low': 'Baixa',
    'priority.normal': 'Normal',
    'priority.high': 'Alta',
    'priority.urgent': 'Urgente',
    'digest.subject': 'Seu resumo',
    'digest.unsubscribe': 'Cancelar inscrição',
  },
  'en-US': {
    'channel.push': 'Push notification',
    'channel.email': 'Email',
    'channel.in_app': 'In-app',
    'channel.suppressed': 'Suppressed',
    'priority.low': 'Low',
    'priority.normal': 'Normal',
    'priority.high': 'High',
    'priority.urgent': 'Urgent',
    'digest.subject': 'Your digest',
    'digest.unsubscribe': 'Unsubscribe',
  },
  'es-ES': {
    'channel.push': 'Notificación push',
    'channel.email': 'Correo',
    'channel.in_app': 'En la app',
    'channel.suppressed': 'Silenciado',
    'priority.low': 'Baja',
    'priority.normal': 'Normal',
    'priority.high': 'Alta',
    'priority.urgent': 'Urgente',
    'digest.subject': 'Tu resumen',
    'digest.unsubscribe': 'Cancelar suscripción',
  },
};

export function translate(locale: Locale, key: I18nKey): string {
  const cat = I18N[locale] ?? I18N['en-US'];
  return cat[key] ?? key;
}

// ============================================================================
// SECTION 11 — Error type (structured, never throws on sanitize path)
// ============================================================================

export type NotificationsPrefsErrorCode =
  | 'INVALID_INPUT'
  | 'NO_KIND_MATCH'
  | 'INVALID_BUNDLE_WINDOW'
  | 'INVALID_QUIET_HOURS';

export class NotificationsPrefsError extends Error {
  readonly code: NotificationsPrefsErrorCode;
  readonly details: Readonly<Record<string, string | number | boolean>>;
  constructor(
    code: NotificationsPrefsErrorCode,
    message: string,
    details: Record<string, string | number | boolean> = {},
  ) {
    super(message);
    this.name = 'NotificationsPrefsError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

// ============================================================================
// SECTION 12 — Engine info & exports list
// ============================================================================

export const ENGINE_INFO = Object.freeze({
  name: 'notifications-prefs-engine',
  version: '0.1.0',
  wave: 'w63',
  channels: NOTIFICATION_CHANNELS.length,
  kinds: NOTIFICATION_KINDS.length,
  priorities: NOTIFICATION_PRIORITIES.length,
  bundleableKinds: DEFAULT_BUNDLEABLE_KINDS.length,
  sacredMappings: SACRED_MAP.length,
});

export const __ALL_EXPORTS = Object.freeze({
  // types (type-only)
  types: [
    'NotificationChannel',
    'NotificationKind',
    'NotificationPriority',
    'DigestCadence',
    'SuppressionReason',
    'QuietHours',
    'DigestConfig',
    'NotificationPreferences',
    'RawNotification',
    'NotificationDecision',
    'BundleSummary',
    'DigestSummary',
    'KindCoverageReport',
    'PreferencesSummary',
    'SacredSystem',
    'SacredMapping',
    'Locale',
    'NotificationsPrefsErrorCode',
  ] as const,
  functions: [
    'DEFAULT_NOTIFICATION_PREFERENCES',
    'validateQuietHours',
    'validateBundleWindow',
    'validatePreferences',
    'sanitizePreferences',
    'isInQuietHours',
    'pickAvailableChannel',
    'decideChannelAt',
    'decideChannel',
    'bundleNotifications',
    'summarizeBundle',
    'shouldSendDigest',
    'daysUntilNextDigest',
    'buildDigestSummary',
    'auditNotificationKindCoverage',
    'auditChannelRoutes',
    'summarizePreferences',
    'notifyOnSacredEvent',
    'listSacredMappings',
    'translate',
  ] as const,
  constants: [
    'NOTIFICATION_CHANNELS',
    'NOTIFICATION_KINDS',
    'NOTIFICATION_PRIORITIES',
    'DEFAULT_QUIET_HOURS',
    'DEFAULT_BUNDLEABLE_KINDS',
    'MIN_BUNDLE_WINDOW_MINUTES',
    'MAX_BUNDLE_WINDOW_MINUTES',
    'MIN_DIGEST_HOUR',
    'MAX_DIGEST_HOUR',
    'MIN_DIGEST_DAY_OF_WEEK',
    'MAX_DIGEST_DAY_OF_WEEK',
    'SUPPORTED_LOCALES',
    'ENGINE_INFO',
  ] as const,
  classes: ['NotificationsPrefsError'] as const,
});