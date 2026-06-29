/**
 * Web Push Notifications (Wave 29)
 *
 * VAPID-authenticated push delivery. Types + helper for the API layer.
 * Pure module; the actual fetch / encryption is the responsibility of the
 * web-push library (server-side).
 */

export type NotificationKind =
  | "comment-reply"
  | "mention"
  | "follow"
  | "daily-reflection"
  | "live-stream-started"
  | "mentorship-request"
  | "tradition-celebration"
  | "marketplace-order";

export interface PushSubscriptionKeys {
  /** Base64url-encoded P-256 public key. */
  readonly p256dh: string;
  /** Base64url-encoded shared auth secret. */
  readonly auth: string;
}

export interface PushSubscription {
  readonly id: string;
  readonly userId: string;
  readonly endpoint: string;
  readonly keys: PushSubscriptionKeys;
  readonly userAgent: string;
  readonly createdAt: number;
  readonly lastUsedAt: number | null;
}

export interface WebPushAction {
  readonly action: string;
  readonly title: string;
  readonly icon?: string;
}

export interface WebPushPayload {
  readonly title: string;
  readonly body: string;
  readonly icon: string;
  readonly badge?: string;
  readonly image?: string;
  readonly tag?: string;
  readonly data: {
    readonly kind: NotificationKind;
    readonly url: string; // deep-link on click
    readonly [k: string]: unknown;
  };
  readonly actions?: readonly WebPushAction[];
  readonly ttlSeconds: number;
  readonly urgency: "very-low" | "low" | "normal" | "high";
}

export interface VapidConfig {
  readonly subject: string; // mailto: or https://
  readonly publicKey: string; // base64url
  readonly privateKey: string; // base64url
}

/** Per-kind defaults for icon, TTL and urgency. */
const KIND_DEFAULTS: Readonly<
  Record<NotificationKind, { icon: string; ttlSeconds: number; urgency: WebPushPayload["urgency"] }>
> = {
  "comment-reply": { icon: "/icons/notification-comment.png", ttlSeconds: 60 * 60 * 24, urgency: "normal" },
  mention: { icon: "/icons/notification-mention.png", ttlSeconds: 60 * 60 * 24, urgency: "high" },
  follow: { icon: "/icons/notification-follow.png", ttlSeconds: 60 * 60 * 24 * 3, urgency: "low" },
  "daily-reflection": { icon: "/icons/notification-reflection.png", ttlSeconds: 60 * 60 * 6, urgency: "normal" },
  "live-stream-started": { icon: "/icons/notification-live.png", ttlSeconds: 60 * 60, urgency: "high" },
  "mentorship-request": { icon: "/icons/notification-mentor.png", ttlSeconds: 60 * 60 * 12, urgency: "normal" },
  "tradition-celebration": { icon: "/icons/notification-celebrate.png", ttlSeconds: 60 * 60 * 24, urgency: "low" },
  "marketplace-order": { icon: "/icons/notification-marketplace.png", ttlSeconds: 60 * 60 * 24, urgency: "high" },
};

/** Build a payload for a given kind with safe defaults. */
export function buildPayload(
  kind: NotificationKind,
  partial: Pick<WebPushPayload, "title" | "body" | "data"> &
    Partial<Pick<WebPushPayload, "icon" | "badge" | "image" | "tag" | "actions" | "ttlSeconds" | "urgency">>,
): WebPushPayload {
  const defaults = KIND_DEFAULTS[kind];
  return {
    title: partial.title,
    body: partial.body,
    icon: partial.icon ?? defaults.icon,
    badge: partial.badge,
    image: partial.image,
    tag: partial.tag ?? `${kind}-${partial.data.url}`,
    data: partial.data,
    actions: partial.actions,
    ttlSeconds: partial.ttlSeconds ?? defaults.ttlSeconds,
    urgency: partial.urgency ?? defaults.urgency,
  };
}

/** Validate a push subscription shape. Used by the /api/push/subscribe endpoint. */
export function validateSubscription(input: unknown): { ok: true; value: PushSubscription } | { ok: false; reason: string } {
  if (!input || typeof input !== "object") return { ok: false, reason: "not-an-object" };
  const obj = input as Record<string, unknown>;
  if (typeof obj.endpoint !== "string" || obj.endpoint.length < 8) {
    return { ok: false, reason: "endpoint-invalid" };
  }
  if (!obj.keys || typeof obj.keys !== "object") {
    return { ok: false, reason: "keys-missing" };
  }
  const keys = obj.keys as Record<string, unknown>;
  if (typeof keys.p256dh !== "string" || typeof keys.auth !== "string") {
    return { ok: false, reason: "keys-invalid" };
  }
  // VAPID keys are base64url and have specific lengths.
  if (keys.p256dh.length < 80 || keys.auth.length < 16) {
    return { ok: false, reason: "keys-too-short" };
  }
  return {
    ok: true,
    value: {
      id: typeof obj.id === "string" ? obj.id : cryptoRandomId(),
      userId: typeof obj.userId === "string" ? obj.userId : "anonymous",
      endpoint: obj.endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
      userAgent: typeof obj.userAgent === "string" ? obj.userAgent : "unknown",
      createdAt: typeof obj.createdAt === "number" ? obj.createdAt : Date.now(),
      lastUsedAt: typeof obj.lastUsedAt === "number" ? obj.lastUsedAt : null,
    },
  };
}

/** Tiny URL-safe random id (Node + browser both expose crypto.getRandomValues). */
export function cryptoRandomId(byteLength: number = 16): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  let s = "";
  for (let i = 0; i < byteLength; i += 1) s += bytes[i].toString(16).padStart(2, "0");
  return s;
}

/** Group subscriptions by user for batched fan-out (avoids 1 push per request). */
export function groupByUser(subs: readonly PushSubscription[]): Map<string, PushSubscription[]> {
  const out = new Map<string, PushSubscription[]>();
  for (const s of subs) {
    const list = out.get(s.userId);
    if (list) list.push(s);
    else out.set(s.userId, [s]);
  }
  return out;
}

/** Deduplicate subscriptions by endpoint (browsers sometimes re-register on profile switch). */
export function dedupeSubscriptions(subs: readonly PushSubscription[]): PushSubscription[] {
  const seen = new Set<string>();
  const out: PushSubscription[] = [];
  for (const s of subs) {
    if (seen.has(s.endpoint)) continue;
    seen.add(s.endpoint);
    out.push(s);
  }
  return out;
}
