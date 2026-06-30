/**
 * W71-B: Push subscription manager + push delivery.
 *
 * Implements:
 *  - Subscription CRUD (in-memory store; production should swap to Prisma)
 *  - VAPID key generation (EC P-256 keypair)
 *  - Web Push delivery (RFC 8030) with VAPID auth (RFC 8292)
 *  - ECE payload encryption via `./vapid-jwt.ts` (RFC 8188 aes128gcm)
 *  - Batch delivery with per-subscription error reporting
 */

import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { signVapidJwt, encryptPushPayload, base64urlEncode, TRADITION_TAGS, type Tradition } from './vapid-jwt.ts';

// ───────────────────────────────────────────────────────────────────────────
// Public types
// ───────────────────────────────────────────────────────────────────────────

export interface PushSubscription {
  /** Push service endpoint URL */
  endpoint: string;
  /** Receiver public key + auth secret from the browser PushSubscription */
  keys: { p256dh: string; auth: string };
  /** Owning user */
  userId: string;
  /** Created at (epoch ms) */
  createdAt: number;
  /** Last successful push delivery (epoch ms) */
  lastUsed: number;
}

export interface VapidKeys {
  /** base64url P-256 uncompressed public point (65 bytes) */
  publicKey: string;
  /** base64url P-256 private scalar (32 bytes) */
  privateKey: string;
  /** mailto: or https: contact subject (RFC 8292 §2) */
  subject: string;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string }>;
  requireInteraction?: boolean;
}

export interface PushSendResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

export interface BatchResult {
  sent: number;
  failed: number;
  results: Array<{ endpoint: string; success: boolean; error?: string }>;
}

// ───────────────────────────────────────────────────────────────────────────
// In-memory subscription store
// ───────────────────────────────────────────────────────────────────────────

const subscriptionStore: Map<string, PushSubscription> = new Map();
const userIndex: Map<string, Set<string>> = new Map(); // userId → endpoint set

/**
 * Clear all subscriptions. Test-only helper. Production uses Prisma.
 */
export function clearAllSubscriptions(): void {
  subscriptionStore.clear();
  userIndex.clear();
}

/** Save or replace a subscription. */
export function saveSubscription(sub: PushSubscription): void {
  if (!sub || typeof sub.endpoint !== 'string' || sub.endpoint.length === 0) {
    throw new TypeError('saveSubscription: sub.endpoint required');
  }
  if (!sub.keys || typeof sub.keys.p256dh !== 'string' || typeof sub.keys.auth !== 'string') {
    throw new TypeError('saveSubscription: sub.keys.p256dh and sub.keys.auth required');
  }
  if (typeof sub.userId !== 'string' || sub.userId.length === 0) {
    throw new TypeError('saveSubscription: sub.userId required');
  }
  if (typeof sub.createdAt !== 'number' || typeof sub.lastUsed !== 'number') {
    throw new TypeError('saveSubscription: createdAt and lastUsed required');
  }

  const existing = subscriptionStore.get(sub.endpoint);
  subscriptionStore.set(sub.endpoint, { ...sub });

  if (existing && existing.userId !== sub.userId) {
    // Endpoint re-used by different user — update both indexes
    const oldSet = userIndex.get(existing.userId);
    if (oldSet) {
      oldSet.delete(sub.endpoint);
      if (oldSet.size === 0) userIndex.delete(existing.userId);
    }
  }
  let set = userIndex.get(sub.userId);
  if (!set) {
    set = new Set();
    userIndex.set(sub.userId, set);
  }
  set.add(sub.endpoint);
}

/** Get all subscriptions for a user. */
export function getSubscription(userId: string): PushSubscription[] {
  const set = userIndex.get(userId);
  if (!set) return [];
  const out: PushSubscription[] = [];
  for (const endpoint of set) {
    const sub = subscriptionStore.get(endpoint);
    if (sub) out.push(sub);
  }
  return out;
}

/** Delete a subscription by endpoint. */
export function deleteSubscription(endpoint: string): void {
  const sub = subscriptionStore.get(endpoint);
  if (!sub) return;
  subscriptionStore.delete(endpoint);
  const set = userIndex.get(sub.userId);
  if (set) {
    set.delete(endpoint);
    if (set.size === 0) userIndex.delete(sub.userId);
  }
}

/** Total subscription count (for testing/audit). */
export function subscriptionCount(): number {
  return subscriptionStore.size;
}

// ───────────────────────────────────────────────────────────────────────────
// VAPID key generation
// ───────────────────────────────────────────────────────────────────────────

/**
 * Generate a fresh VAPID keypair.
 * - EC P-256
 * - Public key: base64url uncompressed point (65 bytes, leading 0x04)
 * - Private key: base64url scalar (32 bytes)
 * - Subject: defaults to "mailto:admin@cabaladoscaminhos.local"
 */
export function generateVapidKeys(subject?: string): VapidKeys {
  const subj = subject ?? 'mailto:admin@cabaladoscaminhos.local';
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });

  // Export public key as DER (SPKI) then strip the 0x04-prefixed uncompressed form
  const pubDer = publicKey.export({ type: 'spki', format: 'der' }) as Buffer;
  // SPKI for P-256 is 65 bytes including the 0x04 prefix we want
  const pubRaw = pubDer.subarray(pubDer.length - 65);
  const publicKeyB64 = base64urlEncode(pubRaw);

  // Export private key as DER (PKCS8) then extract the 32-byte scalar
  const privDer = privateKey.export({ type: 'pkcs8', format: 'der' }) as Buffer;
  // PKCS8 for P-256 ends with: 0x04 || x(32) || y(32) for pub, but the d (scalar) is just before
  // Simpler: export JWK and use the `d` field directly
  const privJwk = privateKey.export({ format: 'jwk' }) as { d?: string };
  if (!privJwk.d) {
    throw new Error('generateVapidKeys: failed to export private scalar');
  }
  // The JWK `d` is already base64url; normalize to no-padding
  const privateKeyB64 = privJwk.d.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

  // Reference privDer so TS doesn't flag the unused variable (kept for future audit)
  if (privDer.length < 32) {
    throw new Error('generateVapidKeys: unexpected PKCS8 length');
  }

  return { publicKey: publicKeyB64, privateKey: privateKeyB64, subject: subj };
}

// ───────────────────────────────────────────────────────────────────────────
// Push delivery
// ───────────────────────────────────────────────────────────────────────────

/**
 * Send a push notification to a single subscription.
 *
 * Returns a structured result so callers can decide whether to retry, delete,
 * or mark the subscription as expired (HTTP 404 / 410).
 */
export async function sendPush(
  sub: PushSubscription,
  payload: PushPayload,
  vapid: VapidKeys,
  fetcher: typeof fetch = fetch,
): Promise<PushSendResult> {
  if (!sub || !sub.endpoint) {
    return { success: false, error: 'invalid subscription' };
  }
  if (!payload || typeof payload.title !== 'string' || typeof payload.body !== 'string') {
    return { success: false, error: 'invalid payload' };
  }
  if (!vapid || !vapid.publicKey || !vapid.privateKey) {
    return { success: false, error: 'invalid VAPID keys' };
  }

  let audience: string;
  try {
    audience = extractAudience(sub.endpoint);
  } catch (e) {
    return { success: false, error: `invalid endpoint: ${(e as Error).message}` };
  }

  let jwt: string;
  try {
    jwt = signVapidJwt(audience, vapid.subject, vapid.privateKey);
  } catch (e) {
    return { success: false, error: `vapid-jwt: ${(e as Error).message}` };
  }

  let encrypted: { ciphertext: Buffer; headers: Record<string, string> };
  try {
    const body = JSON.stringify(payload);
    encrypted = encryptPushPayload(body, sub.keys.p256dh, sub.keys.auth);
  } catch (e) {
    return { success: false, error: `ece: ${(e as Error).message}` };
  }

  const headers: Record<string, string> = {
    ...encrypted.headers,
    'Authorization': `vapid t=${jwt}, k=${vapid.publicKey}`,
    'TTL': '86400',
    'Topic': payload.tag ?? 'general',
  };

  try {
    const f = fetcher ?? fetch;
    if (!f) return { success: false, error: 'no fetch implementation' };
    const res = await f(sub.endpoint, {
      method: 'POST',
      headers,
      body: new Uint8Array(encrypted.ciphertext),
    });
    if (res.ok) {
      sub.lastUsed = Date.now();
      return { success: true, statusCode: res.status };
    }
    return { success: false, statusCode: res.status, error: `HTTP ${res.status}` };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

/** Send a push to all of a user's subscriptions. */
export async function sendBatchPush(
  subs: PushSubscription[],
  payload: PushPayload,
  vapid: VapidKeys,
  fetcher: typeof fetch = fetch,
): Promise<BatchResult> {
  if (!Array.isArray(subs)) {
    return { sent: 0, failed: 0, results: [] };
  }
  const results: BatchResult['results'] = [];
  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    const r = await sendPush(sub, payload, vapid, fetcher);
    if (r.success) sent += 1;
    else failed += 1;
    results.push({ endpoint: sub.endpoint, success: r.success, error: r.error });
  }

  return { sent, failed, results };
}

// ───────────────────────────────────────────────────────────────────────────
// Sacred helpers
// ───────────────────────────────────────────────────────────────────────────

/**
 * Apply the tradition-specific tag to a payload.
 * Defaults to `'general'` if no tradition matched.
 */
export function tagForTradition(tradition: Tradition): string {
  return TRADITION_TAGS[tradition] ?? 'general';
}

/**
 * Build a sacred-anchored payload for a given tradition + base event.
 */
export function buildTraditionPayload(
  tradition: Tradition,
  base: { title: string; body: string; data?: Record<string, unknown>; actions?: PushPayload['actions'] },
): PushPayload {
  return {
    ...base,
    tag: tagForTradition(tradition),
    icon: base.data?.icon as string | undefined,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Internal
// ───────────────────────────────────────────────────────────────────────────

/**
 * Extract audience from a push endpoint URL.
 * "https://fcm.googleapis.com/foo" → "https://fcm.googleapis.com"
 */
export function extractAudience(endpoint: string): string {
  const u = new URL(endpoint);
  return `${u.protocol}//${u.host}`;
}

/** Generate a unique endpoint (test helper). */
export function makeFakeEndpoint(seed?: number): string {
  const buf = randomBytes(8);
  const hex = buf.toString('hex');
  return `https://fcm.googleapis.com/fcm/send/${seed?.toString(16) ?? hex}`;
}

// ───────────────────────────────────────────────────────────────────────────
// Audit / detection
// ───────────────────────────────────────────────────────────────────────────

/**
 * Audit subscription pool. Returns counts for diagnostics.
 */
export function auditSubscriptions(): {
  total: number;
  perUser: Array<{ userId: string; count: number }>;
  lastUsedRangeMs: { min: number; max: number } | null;
} {
  const perUser: Array<{ userId: string; count: number }> = [];
  let minUsed = Number.POSITIVE_INFINITY;
  let maxUsed = Number.NEGATIVE_INFINITY;
  for (const [userId, set] of userIndex) {
    perUser.push({ userId, count: set.size });
  }
  for (const sub of subscriptionStore.values()) {
    if (sub.lastUsed < minUsed) minUsed = sub.lastUsed;
    if (sub.lastUsed > maxUsed) maxUsed = sub.lastUsed;
  }
  return {
    total: subscriptionStore.size,
    perUser: perUser.sort((a, b) => b.count - a.count),
    lastUsedRangeMs:
      subscriptionStore.size === 0
        ? null
        : { min: minUsed, max: maxUsed },
  };
}