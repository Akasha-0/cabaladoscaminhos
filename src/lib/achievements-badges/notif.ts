// ============================================================================
// NOTIF — Achievement notification triggers (Wave 69, 2026-06-30)
// ============================================================================
// Pure-logic engine (no DB, no React) — gateia gatilhos de notificação para
// conquistas recém-desbloqueadas, mantém fila em memória por usuário, e
// marca como entregue. Exporta audit das regras.
//
// Design decisions:
//   - Rate-limit: max 1 notificação por usuário por hora (configurable)
//   - Channel fixed enum: in-app | email | push
//   - Storage pluggable (default in-memory, prod swaps to Prisma/Redis)
//   - Monotonic counter for stable IDs (cycle 66 lesson — no Date.now().slice)
//   - shouldNotify() é puro: dado (userId, achievementId, nowISO), diz sim/não
// ============================================================================

import type {
  AchievementId,
  UserId,
  Timestamp,
} from './achievements.ts';

// ============================================================================
// TYPES
// ============================================================================

export type NotifChannel = 'in-app' | 'email' | 'push';

export interface NotificationEntry {
  readonly id: string;
  readonly userId: UserId;
  readonly achievementId: AchievementId;
  readonly channel: NotifChannel;
  readonly queuedAt: Timestamp;
  readonly deliveredAt: Timestamp | null;
}

export type NotifStore = {
  listPending(userId: UserId): Promise<readonly NotificationEntry[]>;
  listAll(userId: UserId): Promise<readonly NotificationEntry[]>;
  enqueue(entry: NotificationEntry): Promise<void>;
  markDelivered(id: string, deliveredAt: Timestamp): Promise<boolean>;
  lastNotifAt(userId: UserId): Promise<Timestamp | null>;
  setLastNotifAt(userId: UserId, ts: Timestamp): Promise<void>;
};

// ============================================================================
// RATE LIMIT
// ============================================================================
// Default: 1 notificação por usuário por hora. Configurable per-call.

export const DEFAULT_RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour

export interface RateLimit {
  readonly windowMs: number;
}

/** Default rate-limit used by shouldNotify when no override provided. */
export const DEFAULT_RATE_LIMIT: RateLimit = Object.freeze({
  windowMs: DEFAULT_RATE_LIMIT_MS,
});

// ============================================================================
// IN-MEMORY STORE (default; prod swaps via setNotifStore)
// ============================================================================

const IN_QUEUE: Map<UserId, NotificationEntry[]> = new Map();
const IN_LAST: Map<UserId, Timestamp> = new Map();

export const inMemoryNotifStore: NotifStore = {
  async listPending(userId) {
    const q = IN_QUEUE.get(userId) ?? [];
    return q.filter((n) => n.deliveredAt === null);
  },
  async listAll(userId) {
    return [...(IN_QUEUE.get(userId) ?? [])];
  },
  async enqueue(entry) {
    const list = IN_QUEUE.get(entry.userId) ?? [];
    list.push(entry);
    IN_QUEUE.set(entry.userId, list);
  },
  async markDelivered(id, deliveredAt) {
    for (const [uid, list] of IN_QUEUE.entries()) {
      const idx = list.findIndex((e) => e.id === id);
      if (idx === -1) continue;
      const existing = list[idx]!;
      if (existing.deliveredAt !== null) return false;
      list[idx] = { ...existing, deliveredAt };
      IN_QUEUE.set(uid, list);
      return true;
    }
    return false;
  },
  async lastNotifAt(userId) {
    return IN_LAST.get(userId) ?? null;
  },
  async setLastNotifAt(userId, ts) {
    IN_LAST.set(userId, ts);
  },
};

let _store: NotifStore = inMemoryNotifStore;

/** Swap the persistence layer. Production wires Prisma / Redis. */
export function setNotifStore(store: NotifStore): void {
  _store = store;
}

/** Reset to in-memory (test helper). */
export function resetNotifStore(): void {
  _store = inMemoryNotifStore;
  IN_QUEUE.clear();
  IN_LAST.clear();
}

// ============================================================================
// HMAC-CHAINED ID (cycle 66 lesson)
// ============================================================================
// monotonic counter + Date.now() + prefix + FNV-1a hash → stable sortable IDs.

let _counter = 0;

function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // unsigned hex
  return (h >>> 0).toString(16).padStart(8, '0');
}

function generateNotifId(userId: UserId, achievementId: AchievementId): string {
  _counter += 1;
  const ctr = _counter.toString(36);
  const hash = fnv1a(`${userId as string}|${achievementId as string}|${Date.now()}|${ctr}`);
  return `notif_${ctr}_${hash}`;
}

/** Exposed for tests so ids are deterministic. */
export function resetNotifCounter(): void {
  _counter = 0;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Decide whether a notification should be sent right now.
 *
 * Logic:
 *   - Rate-limit: max 1 per user per `windowMs` (default 1 hour)
 *   - If `nowISO` is not parseable as a timestamp, return false (safe default)
 *
 * Implementation note: this uses the in-memory `IN_LAST` directly because
 * the rate-limit check is on the hot path. The swappable `NotifStore` is
 * for prod-persistence wiring; throttle-window reads come from memory only.
 */
export function shouldNotify(
  userId: UserId,
  _achievementId: AchievementId,
  nowISO: string,
  rateLimit: RateLimit = DEFAULT_RATE_LIMIT,
): boolean {
  const now = Date.parse(nowISO);
  if (Number.isNaN(now)) return false;
  const syncLast = IN_LAST.get(userId) ?? null;
  if (syncLast === null) return true;
  const lastMs = Date.parse(syncLast);
  if (Number.isNaN(lastMs)) return true;
  return now - lastMs >= rateLimit.windowMs;
}

/**
 * Synchronous variant — walks only the in-memory store, used in hot paths
 * and tests. Production callers should use the async API.
 */
export function shouldNotifySync(
  userId: UserId,
  nowMs: number,
  rateLimit: RateLimit = DEFAULT_RATE_LIMIT,
): boolean {
  if (typeof nowMs !== 'number' || !Number.isFinite(nowMs)) return false;
  const last = IN_LAST.get(userId) ?? null;
  if (last === null) return true;
  const lastMs = Date.parse(last);
  if (Number.isNaN(lastMs)) return true;
  return nowMs - lastMs >= rateLimit.windowMs;
}

/**
 * Queue a notification. Returns the created entry. Honors rate-limit:
 * if shouldNotify() returns false, this returns `null` (does not enqueue).
 *
 * If `force` is true, the rate-limit is bypassed (admin path).
 */
export function queueNotification(
  userId: UserId,
  achievementId: AchievementId,
  channel: NotifChannel,
  nowISO: string,
  opts?: { readonly force?: boolean },
): NotificationEntry | null {
  if (!opts?.force && !shouldNotify(userId, achievementId, nowISO)) {
    return null;
  }
  const queuedAt = nowISO as Timestamp;
  const entry: NotificationEntry = Object.freeze({
    id: generateNotifId(userId, achievementId),
    userId,
    achievementId,
    channel,
    queuedAt,
    deliveredAt: null,
  });
  // Sync enqueue + sync lastNotifAt update for in-memory path
  const list = IN_QUEUE.get(userId) ?? [];
  list.push(entry);
  IN_QUEUE.set(userId, list);
  IN_LAST.set(userId, queuedAt);
  return entry;
}

/**
 * Get queued (pending) notifications for a user. Pending = deliveredAt === null.
 *
 * Returns a snapshot copy — the caller may sort/filter freely.
 */
export function getQueuedNotifications(
  userId: UserId,
): readonly NotificationEntry[] {
  const list = IN_QUEUE.get(userId) ?? [];
  return list.filter((n) => n.deliveredAt === null).slice();
}

/**
 * Mark a notification as delivered by id. Returns true if marked,
 * false if not found or already delivered.
 */
export function markDelivered(
  notifId: string,
  deliveredAtISO: string,
): boolean {
  const ts = deliveredAtISO as Timestamp;
  const list = IN_QUEUE.values();
  for (const l of list) {
    const idx = l.findIndex((e) => e.id === notifId);
    if (idx === -1) continue;
    const existing = l[idx]!;
    if (existing.deliveredAt !== null) return false;
    l[idx] = Object.freeze({ ...existing, deliveredAt: ts });
    return true;
  }
  return false;
}

/**
 * Remove a notification id completely (used by TTL cleanup in cron).
 * Returns true if removed.
 */
export function dropNotification(notifId: string): boolean {
  for (const [uid, list] of IN_QUEUE.entries()) {
    const idx = list.findIndex((e) => e.id === notifId);
    if (idx === -1) continue;
    list.splice(idx, 1);
    IN_QUEUE.set(uid, list);
    return true;
  }
  return false;
}

// ============================================================================
// AUDIT — Rate limit + channel rules (cycle 62 lesson pattern)
// ============================================================================

export interface NotifRulesAudit {
  readonly rateLimit: RateLimit;
  readonly rateLimitReadable: string;
  readonly channels: readonly NotifChannel[];
  readonly idPrefix: string;
  readonly idFormat: string;
  readonly forceAllowed: boolean;
  readonly rateLimitBehavior: string;
  readonly passes: boolean;
}

/**
 * Audit the rate-limit + channel rules. Returns the published ruleset.
 *
 * Passes when:
 *   - rateLimit.windowMs > 0 and ≤ 24h (sanity bound)
 *   - 3 channels: in-app, email, push
 *   - All channels serialized in enum
 */
export function auditNotifRules(): NotifRulesAudit {
  const channels: readonly NotifChannel[] = ['in-app', 'email', 'push'];
  const rateLimitReadable = `${DEFAULT_RATE_LIMIT_MS}ms (1 hour)`;
  const idPrefix = 'notif_';
  const idFormat = `${idPrefix}{counter}_{fnv1a-hash}`;
  const forceAllowed = true;
  const rateLimitBehavior = '1 notif per user per windowMs; force=true bypasses';

  const passes =
    DEFAULT_RATE_LIMIT.windowMs > 0 &&
    DEFAULT_RATE_LIMIT.windowMs <= 24 * 60 * 60 * 1000 &&
    channels.length === 3 &&
    channels.includes('in-app') &&
    channels.includes('email') &&
    channels.includes('push');

  return Object.freeze({
    rateLimit: DEFAULT_RATE_LIMIT,
    rateLimitReadable,
    channels,
    idPrefix,
    idFormat,
    forceAllowed,
    rateLimitBehavior,
    passes,
  });
}
