/**
 * notifications-digest-mode.ts
 *
 * Cycle 35 — Notification Digest Mode (bundle similar notifications).
 *
 * Composes with:
 *   - src/lib/w29/notifications-webpush.ts   (push delivery state)
 *   - src/lib/w30/daily-reflection-push.ts   (reflection reminders)
 *   - src/lib/w32/push-prefs-ui.ts           (per-channel preferences)
 *   - src/lib/w29/comments-mentions-notify.ts (mentions as input feed)
 *
 * Pure TypeScript: no runtime imports from app code, no I/O, no DOM. All
 * timestamps are caller-supplied (`now`) so the module is deterministic
 * under test. Each public helper returns a fresh value or a fresh array.
 *
 * Responsibilities:
 *   1. Bundle — group similar notifications (same source + same kind) into
 *      a single digest card.
 *   2. Window — only bundle items inside the caller's digest window
 *      (default 4h); older items stay as standalone notifications.
 *   3. Quiet hours — suppress pushes if now is inside the user's quiet
 *      window, regardless of push prefs.
 *   4. Priority — keep high-priority items (mentions, moderation) as
 *      standalone; only bundle low-priority ambient events.
 *   5. Channel routing — pick delivery channel per digest (push, email,
 *      in-app) using push-prefs and source kind.
 *   6. Summary — totals (bundled, suppressed, delivered, queued).
 */

// ---------- TYPES ----------------------------------------------------------

export type NotificationKind =
  | "mention"
  | "reply"
  | "follow"
  | "like"
  | "reflection_reminder"
  | "leitura_drop"
  | "mentorship_session"
  | "moderation_alert"
  | "streak_at_risk"
  | "badge_earned"
  | "system";

export type NotificationSource =
  | "comment"
  | "leitura"
  | "mentorship"
  | "reflection"
  | "marketplace"
  | "profile"
  | "system";

export type NotificationPriority = "low" | "medium" | "high";

export type DeliveryChannel = "push" | "email" | "in_app" | "suppressed";

export interface RawNotification {
  id: string;
  userId: string;
  source: NotificationSource;
  kind: NotificationKind;
  priority: NotificationPriority;
  title: string;
  body: string;
  createdAt: number;
  // For bundling:
  contextId?: string;       // e.g., commentId, leituraId
  // Delivery target:
  language?: string;        // BCP-47
}

export interface DigestItem {
  id: string;
  userId: string;
  source: NotificationSource;
  kind: NotificationKind;
  bundleCount: number;       // 1 for standalone, N for bundle
  sampleNotificationIds: string[];
  representativeTitle: string;
  representativeBody: string;
  firstAt: number;
  lastAt: number;
  priority: NotificationPriority;
  channel: DeliveryChannel;
  contextId?: string;
}

export interface DigestConfig {
  windowMs: number;             // default 4h
  quietHours: { startHour: number; endHour: number };
  bundleablePriorities: NotificationPriority[]; // default ["low"]
  bundleableKinds: NotificationKind[];          // default ambient kinds
  maxBundleSize: number;        // default 10
}

export interface PushPreferences {
  commentReplies: boolean;
  mentions: boolean;
  follows: boolean;
  likes: boolean;
  reflectionReminder: boolean;
  leituraDrop: boolean;
  mentorshipSession: boolean;
  moderationAlert: boolean;
  streakAtRisk: boolean;
  badgeEarned: boolean;
  system: boolean;
  digest: boolean;
}

export interface DigestResult {
  digests: DigestItem[];
  suppressed: number;       // suppressed by quiet hours
  delivered: number;        // total items that produced a digest
  standaloneKept: number;   // high-priority items kept as-is (1-item digest)
  bundled: number;          // items that were merged
}

export interface DigestSummary {
  totalDigests: number;
  bundles: number;
  standalone: number;
  suppressed: number;
  byChannel: Record<DeliveryChannel, number>;
  byKind: Partial<Record<NotificationKind, number>>;
}

// ---------- CONSTANTS -----------------------------------------------------

export const DEFAULT_DIGEST_CONFIG: DigestConfig = {
  windowMs: 4 * 60 * 60 * 1000,
  quietHours: { startHour: 22, endHour: 7 },
  bundleablePriorities: ["low"],
  bundleableKinds: [
    "follow",
    "like",
    "leitura_drop",
    "streak_at_risk",
    "badge_earned",
  ],
  maxBundleSize: 10,
};

export const DEFAULT_PUSH_PREFS: PushPreferences = {
  commentReplies: true,
  mentions: true,
  follows: true,
  likes: true,
  reflectionReminder: true,
  leituraDrop: false,
  mentorshipSession: true,
  moderationAlert: true,
  streakAtRisk: true,
  badgeEarned: true,
  system: true,
  digest: true,
};

export const ALL_CHANNELS: DeliveryChannel[] = [
  "push",
  "email",
  "in_app",
  "suppressed",
];

export const MS_PER_HOUR = 60 * 60 * 1000;
export const MIN_BUNDLE_SIZE = 2;
export const MAX_BUNDLE_SIZE = 50;
export const MAX_DIGESTS = 200;
export const MAX_BODY_LENGTH = 200;

// ---------- HELPERS -----------------------------------------------------

export function isQuietHour(
  now: number,
  quiet: { startHour: number; endHour: number }
): boolean {
  const hour = new Date(now).getUTCHours();
  if (quiet.endHour > quiet.startHour) {
    return hour >= quiet.startHour && hour < quiet.endHour;
  }
  return hour >= quiet.startHour || hour < quiet.endHour;
}

export function isBundleable(
  notif: RawNotification,
  config: DigestConfig
): boolean {
  if (!config.bundleablePriorities.includes(notif.priority)) return false;
  if (!config.bundleableKinds.includes(notif.kind)) return false;
  return typeof notif.contextId === "string" && notif.contextId.length > 0;
}

export function isAllowedByPrefs(
  notif: RawNotification,
  prefs: PushPreferences
): boolean {
  switch (notif.kind) {
    case "reply":
      return prefs.commentReplies;
    case "mention":
      return prefs.mentions;
    case "follow":
      return prefs.follows;
    case "like":
      return prefs.likes;
    case "reflection_reminder":
      return prefs.reflectionReminder;
    case "leitura_drop":
      return prefs.leituraDrop;
    case "mentorship_session":
      return prefs.mentorshipSession;
    case "moderation_alert":
      return prefs.moderationAlert;
    case "streak_at_risk":
      return prefs.streakAtRisk;
    case "badge_earned":
      return prefs.badgeEarned;
    case "system":
      return prefs.system;
    default:
      return true;
  }
}

export function pickChannel(
  notif: RawNotification,
  prefs: PushPreferences,
  inQuietHour: boolean
): DeliveryChannel {
  if (inQuietHour && notif.priority !== "high") return "suppressed";
  if (!isAllowedByPrefs(notif, prefs)) return "in_app";
  if (notif.priority === "high") return "push";
  if (prefs.digest) return "in_app";
  return "push";
}

export function truncate(s: string, max: number = MAX_BODY_LENGTH): string {
  if (typeof s !== "string") return "";
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

export function digestKey(notif: RawNotification): string {
  return `${notif.userId}::${notif.source}::${notif.kind}::${notif.contextId ?? "_"}`;
}

// ---------- BUILDERS -----------------------------------------------------

export function buildStandaloneDigest(
  notif: RawNotification,
  channel: DeliveryChannel
): DigestItem {
  return {
    id: `dg::${notif.id}`,
    userId: notif.userId,
    source: notif.source,
    kind: notif.kind,
    bundleCount: 1,
    sampleNotificationIds: [notif.id],
    representativeTitle: notif.title,
    representativeBody: truncate(notif.body),
    firstAt: notif.createdAt,
    lastAt: notif.createdAt,
    priority: notif.priority,
    channel,
    contextId: notif.contextId,
  };
}

export function buildBundleDigest(
  items: RawNotification[]
): DigestItem {
  const sorted = [...items].sort((a, b) => a.createdAt - b.createdAt);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const sample = sorted[0];
  return {
    id: `dg::${first.userId}::${first.source}::${first.kind}::${first.contextId ?? "_"}`,
    userId: first.userId,
    source: first.source,
    kind: first.kind,
    bundleCount: sorted.length,
    sampleNotificationIds: sorted.map((n) => n.id),
    representativeTitle: sample.title,
    representativeBody: truncate(`${sample.body} (+${sorted.length - 1} similar)`),
    firstAt: first.createdAt,
    lastAt: last.createdAt,
    priority: first.priority,
    channel: "in_app",
    contextId: first.contextId,
  };
}

// ---------- BUNDLING ----------------------------------------------------

export function bundleNotifications(
  notifications: RawNotification[],
  config: DigestConfig = DEFAULT_DIGEST_CONFIG
): Map<string, RawNotification[]> {
  const groups = new Map<string, RawNotification[]>();
  for (const n of notifications) {
    if (!isBundleable(n, config)) continue;
    const k = digestKey(n);
    const arr = groups.get(k);
    if (arr) {
      if (arr.length < config.maxBundleSize) arr.push(n);
    } else {
      groups.set(k, [n]);
    }
  }
  return groups;
}

// ---------- DIGEST BUILD ------------------------------------------------

export function buildDigests(input: {
  notifications: RawNotification[];
  now: number;
  prefs?: PushPreferences;
  config?: DigestConfig;
}): DigestResult {
  const config = input.config ?? DEFAULT_DIGEST_CONFIG;
  const prefs = input.prefs ?? DEFAULT_PUSH_PREFS;
  const quiet = isQuietHour(input.now, config.quietHours);
  const inWindow = input.notifications.filter(
    (n) => input.now - n.createdAt <= config.windowMs
  );
  const outOfWindow = input.notifications.length - inWindow.length;
  void outOfWindow;
  const bundles = bundleNotifications(inWindow, config);
  const digests: DigestItem[] = [];
  let suppressed = 0;
  let bundled = 0;
  let standaloneKept = 0;
  // First, emit the bundles (one digest per group)
  for (const arr of bundles.values()) {
    if (arr.length < MIN_BUNDLE_SIZE) {
      // stand alone each
      for (const n of arr) {
        const channel = pickChannel(n, prefs, quiet);
        if (channel === "suppressed") suppressed += 1;
        else digests.push(buildStandaloneDigest(n, channel));
        standaloneKept += 1;
      }
    } else {
      digests.push(buildBundleDigest(arr));
      bundled += arr.length;
    }
  }
  // Then handle non-bundleable items as 1-item digests
  const bundledKeys = new Set(bundles.keys());
  for (const n of inWindow) {
    if (isBundleable(n, config) && bundledKeys.has(digestKey(n))) {
      continue;
    }
    const channel = pickChannel(n, prefs, quiet);
    if (channel === "suppressed") {
      suppressed += 1;
      continue;
    }
    digests.push(buildStandaloneDigest(n, channel));
    standaloneKept += 1;
  }
  digests.sort((a, b) => b.lastAt - a.lastAt);
  if (digests.length > MAX_DIGESTS) digests.length = MAX_DIGESTS;
  return {
    digests,
    suppressed,
    delivered: digests.length,
    standaloneKept,
    bundled,
  };
}

// ---------- SUMMARY ----------------------------------------------------

export function summarizeDigests(
  digests: DigestItem[],
  suppressed: number
): DigestSummary {
  const byChannel: Record<DeliveryChannel, number> = {
    push: 0,
    email: 0,
    in_app: 0,
    suppressed: 0,
  };
  const byKind: Partial<Record<NotificationKind, number>> = {};
  let bundles = 0;
  for (const d of digests) {
    byChannel[d.channel] += 1;
    byKind[d.kind] = (byKind[d.kind] ?? 0) + 1;
    if (d.bundleCount >= MIN_BUNDLE_SIZE) bundles += 1;
  }
  byChannel.suppressed = suppressed;
  return {
    totalDigests: digests.length,
    bundles,
    standalone: digests.length - bundles,
    suppressed,
    byChannel,
    byKind,
  };
}

// ---------- PREFS MUTATION --------------------------------------------

export function setPref(
  prefs: PushPreferences,
  kind: NotificationKind,
  value: boolean
): PushPreferences {
  const next: PushPreferences = { ...prefs };
  switch (kind) {
    case "reply":
      next.commentReplies = value;
      break;
    case "mention":
      next.mentions = value;
      break;
    case "follow":
      next.follows = value;
      break;
    case "like":
      next.likes = value;
      break;
    case "reflection_reminder":
      next.reflectionReminder = value;
      break;
    case "leitura_drop":
      next.leituraDrop = value;
      break;
    case "mentorship_session":
      next.mentorshipSession = value;
      break;
    case "moderation_alert":
      next.moderationAlert = value;
      break;
    case "streak_at_risk":
      next.streakAtRisk = value;
      break;
    case "badge_earned":
      next.badgeEarned = value;
      break;
    case "system":
      next.system = value;
      break;
  }
  return next;
}

export function toggleDigest(
  prefs: PushPreferences,
  enabled: boolean
): PushPreferences {
  return { ...prefs, digest: enabled };
}
