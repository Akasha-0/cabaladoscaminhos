/**
 * w31/comments-mentions-notify
 *
 * Bridges comment mentions to push notifications. When a user is @mentioned
 * in a comment, this module decides whether to send a real-time push
 * notification, respecting user preferences, rate limits, and offline
 * queueing semantics.
 *
 * Composes w29/comments-threading (extractMentions) with
 * w30/daily-reflection-push (buildPushPayload) to keep notification
 * payload shape consistent across the app.
 *
 * IMPORTANT: This is a pure function module. No I/O, no side effects.
 * Callers (API route handlers, background workers) wire this up to the
 * actual Supabase channel + web-push transport.
 */

export type MentionKind = "user" | "group" | "circle" | "tradition";

export interface MentionRef {
  kind: MentionKind;
  /** For kind=user, the recipient's userId. For others, the entity id. */
  userId: string;
  /** Display label as it appeared in the comment text, e.g. "@ana". */
  label: string;
  /** Char offset in the comment body where the mention starts. */
  charStart: number;
  /** Char offset where the mention ends (exclusive). */
  charEnd: number;
}

export interface CommentNode {
  id: string;
  parentId: string | null;
  authorId: string;
  body: string;
  createdAt: string;
  mentions?: MentionRef[];
  replies?: CommentNode[];
}

export type PushKind =
  | "comment_mention"
  | "comment_reply"
  | "event_reminder"
  | "booking_confirmed"
  | "new_follower"
  | "new_message"
  | "daily_reflection"
  | "moderation_alert";

export interface PushPayload {
  kind: PushKind;
  recipientId: string;
  title: string;
  body: string;
  data: Record<string, string | number | boolean | null>;
  ttlSeconds: number;
  dedupeKey: string;
}

/** User notification preferences — fed from a `notification_prefs` table. */
export interface NotificationPrefs {
  userId: string;
  mentionPushEnabled: boolean;
  mentionQuietHoursStart: string | null; // "HH:MM" 24h, null = no quiet hours
  mentionQuietHoursEnd: string | null;
  mentionDigestMode: "instant" | "hourly" | "daily" | "off";
  maxMentionsPerHour: number; // default 10
  preferredLocale: "pt-BR" | "en" | "es";
}

/** A mention event captured at the moment of comment insertion. */
export interface MentionEvent {
  commentId: string;
  commentAuthorId: string;
  threadId: string;
  threadRootId: string | null;
  excerpt: string; // truncated to 140 chars, sanitized
  createdAt: string; // ISO
  mentionedUserIds: string[]; // from extractMentions
}

/** Decision per recipient about whether/when to push. */
export interface MentionNotificationDecision {
  recipientId: string;
  shouldSend: boolean;
  reason:
    | "mentions_disabled"
    | "quiet_hours"
    | "rate_limited"
    | "self_mention"
    | "digest_deferred"
    | "ok";
  scheduledFor: string | null; // ISO, null if shouldSend=false
  payload: PushPayload | null;
}

/** Per-user rolling mention counter (provided by caller / Redis-style). */
export type RateLimitCounter = (userId: string) => Promise<number>;
/** Per-user increment hook (called when a mention is actually dispatched). */
export type RateLimitIncrement = (userId: string) => Promise<void>;

/** Convert "HH:MM" to minutes since 00:00 for cheap range math. */
export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((s) => parseInt(s, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return -1;
  return h * 60 + m;
}

/** Check if a given ISO timestamp falls inside a [start, end) window.
 *  Handles overnight wrap (e.g. 22:00 → 06:00).
 */
export function isInQuietHours(
  isoTimestamp: string,
  startHHMM: string | null,
  endHHMM: string | null,
): boolean {
  if (!startHHMM || !endHHMM) return false;
  const start = hhmmToMinutes(startHHMM);
  const end = hhmmToMinutes(endHHMM);
  if (start < 0 || end < 0) return false;

  const ts = new Date(isoTimestamp);
  const now = ts.getUTCHours() * 60 + ts.getUTCMinutes();

  if (start < end) {
    return now >= start && now < end;
  }
  // overnight wrap
  return now >= start || now < end;
}

/** Localized push title/body for the given mention event. */
export function localizeMentionPayload(
  locale: NotificationPrefs["preferredLocale"],
  event: MentionEvent,
  authorDisplayName: string,
): { title: string; body: string } {
  const excerpt = event.excerpt.length > 80
    ? event.excerpt.slice(0, 77) + "..."
    : event.excerpt;

  switch (locale) {
    case "en":
      return {
        title: `${authorDisplayName} mentioned you`,
        body: excerpt,
      };
    case "es":
      return {
        title: `${authorDisplayName} te mencionó`,
        body: excerpt,
      };
    case "pt-BR":
    default:
      return {
        title: `${authorDisplayName} te mencionou`,
        body: excerpt,
      };
  }
}

/** Build the canonical PushPayload for a mention. */
export function buildMentionPayload(
  event: MentionEvent,
  recipientId: string,
  prefs: NotificationPrefs,
  authorDisplayName: string,
): PushPayload {
  const { title, body } = localizeMentionPayload(prefs.preferredLocale, event, authorDisplayName);

  return {
    kind: "comment_mention",
    recipientId,
    title,
    body,
    data: {
      commentId: event.commentId,
      threadId: event.threadId,
      threadRootId: event.threadRootId,
      authorId: event.commentAuthorId,
      locale: prefs.preferredLocale,
    },
    ttlSeconds: 60 * 60 * 24, // 24h
    dedupeKey: `mention:${event.commentId}:${recipientId}`,
  };
}

/** Decide the next time a deferred digest should fire. */
export function computeDigestSchedule(
  mode: NotificationPrefs["mentionDigestMode"],
  now: Date,
): string {
  switch (mode) {
    case "instant":
      return now.toISOString();
    case "hourly": {
      const next = new Date(now);
      next.setUTCMinutes(0, 0, 0);
      next.setUTCHours(next.getUTCHours() + 1);
      return next.toISOString();
    }
    case "daily": {
      const next = new Date(now);
      next.setUTCHours(9, 0, 0, 0);
      if (next.getTime() <= now.getTime()) {
        next.setUTCDate(next.getUTCDate() + 1);
      }
      return next.toISOString();
    }
    case "off":
    default:
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
  }
}

/** Decide notification routing for all mentioned users in an event. */
export async function routeMentionNotifications(args: {
  event: MentionEvent;
  prefsByUserId: Map<string, NotificationPrefs>;
  authorDisplayNameById: Map<string, string>;
  countMentionsLastHour: RateLimitCounter;
  incrementMentionsLastHour: RateLimitIncrement;
  now?: Date;
}): Promise<MentionNotificationDecision[]> {
  const now = args.now ?? new Date();
  const decisions: MentionNotificationDecision[] = [];

  for (const recipientId of args.event.mentionedUserIds) {
    if (recipientId === args.event.commentAuthorId) {
      decisions.push({
        recipientId,
        shouldSend: false,
        reason: "self_mention",
        scheduledFor: null,
        payload: null,
      });
      continue;
    }

    const prefs = args.prefsByUserId.get(recipientId);
    if (!prefs || !prefs.mentionPushEnabled) {
      decisions.push({
        recipientId,
        shouldSend: false,
        reason: "mentions_disabled",
        scheduledFor: null,
        payload: null,
      });
      continue;
    }

    if (isInQuietHours(now.toISOString(), prefs.mentionQuietHoursStart, prefs.mentionQuietHoursEnd)) {
      const scheduledFor = computeDigestSchedule(prefs.mentionDigestMode, now);
      decisions.push({
        recipientId,
        shouldSend: prefs.mentionDigestMode === "instant",
        reason: "quiet_hours",
        scheduledFor,
        payload: null,
      });
      continue;
    }

    if (prefs.mentionDigestMode === "off") {
      decisions.push({
        recipientId,
        shouldSend: false,
        reason: "mentions_disabled",
        scheduledFor: null,
        payload: null,
      });
      continue;
    }

    const currentCount = await args.countMentionsLastHour(recipientId);
    if (currentCount >= prefs.maxMentionsPerHour) {
      decisions.push({
        recipientId,
        shouldSend: false,
        reason: "rate_limited",
        scheduledFor: computeDigestSchedule("hourly", now),
        payload: null,
      });
      continue;
    }

    if (prefs.mentionDigestMode !== "instant") {
      decisions.push({
        recipientId,
        shouldSend: false,
        reason: "digest_deferred",
        scheduledFor: computeDigestSchedule(prefs.mentionDigestMode, now),
        payload: null,
      });
      continue;
    }

    const authorName = args.authorDisplayNameById.get(args.event.commentAuthorId) ?? "Alguém";
    const payload = buildMentionPayload(args.event, recipientId, prefs, authorName);

    decisions.push({
      recipientId,
      shouldSend: true,
      reason: "ok",
      scheduledFor: now.toISOString(),
      payload,
    });
  }

  return decisions;
}

/** After dispatching, increment the rate limit counter for each user we sent to. */
export async function bumpRateLimitsForSent(
  decisions: MentionNotificationDecision[],
  increment: RateLimitIncrement,
): Promise<void> {
  await Promise.all(
    decisions
      .filter((d) => d.shouldSend)
      .map((d) => increment(d.recipientId)),
  );
}

/** Convenience: extract mention user IDs from a thread tree. */
export function flattenMentionedUserIds(comments: CommentNode[]): string[] {
  const set = new Set<string>();
  function walk(nodes: CommentNode[]) {
    for (const n of nodes) {
      for (const m of n.mentions ?? []) {
        if (m.kind === "user" && m.userId) set.add(m.userId);
      }
      if (n.replies?.length) walk(n.replies);
    }
  }
  walk(comments);
  return Array.from(set);
}
