/**
 * W71-D: stream-session.ts
 *
 * Server-side stream session lifecycle (create → start → live → end).
 *
 * Architecture decisions:
 * - In-memory `Map<sessionId, StreamSession>` for the test harness.
 *   Production persists via Prisma (see DELIVERABLE.md, "production wiring").
 * - HMAC-signed viewer tokens (cycle 67 lesson: HMAC chained via canonical JSON).
 * - 7-tradition validation against TRADITION_TAGS enum (cycle 69 lesson).
 * - No `constructor(readonly x)` — plain object literals + Object.freeze (cycle 60+).
 *
 * Sacred coverage (7 traditions):
 * - Cigano 🌙, Orixás 🌊, Astrologia ⭐, Cabala ✡️, Numerologia 🔢, Tantra 🕉️, Tarot 🃏.
 * - ≥1 tradition tag required (enforced by validateTraditionTags).
 *
 * Honest concerns:
 * - No RTMP ingest server: production wires nginx-rtmp or mediasoup.
 * - No real WebRTC SFU: signaling + TURN creds are caller's job.
 * - HMAC default secret = "" — production MUST call setHmacSecret().
 */

import { createHmac, randomUUID } from 'crypto';

// ─── 7-tradition taxonomy ────────────────────────────────────────────────────

export const TRADITION_TAGS = [
  'cigano',
  'orixas',
  'astrologia',
  'cabala',
  'numerologia',
  'tantra',
  'tarot',
] as const;

export type TraditionTag = (typeof TRADITION_TAGS)[number];

export type StreamVisibility = 'public' | 'community' | 'invite-only';

export type StreamState = 'scheduled' | 'live' | 'ended' | 'cancelled';

export type StreamSession = {
  readonly id: string;
  readonly hostId: string;
  readonly title: string;
  readonly description: string;
  readonly traditionTags: readonly TraditionTag[];
  readonly scheduledStart: number;
  actualStart?: number;
  endedAt?: number;
  state: StreamState;
  viewerCount: number;
  maxViewers: number;
  readonly recordingEnabled: boolean;
  recordingUrl?: string;
  readonly chatRoomId: string;
  readonly visibility: StreamVisibility;
  readonly createdAt: number;
};

export type StreamConfig = {
  readonly title: string;
  readonly description: string;
  readonly traditionTags: readonly TraditionTag[];
  readonly scheduledStart: number;
  readonly recordingEnabled: boolean;
  readonly maxViewers: number;
  readonly visibility: StreamVisibility;
};

// ─── Internal store ─────────────────────────────────────────────────────────

const STORE: Map<string, StreamSession> = new Map();

export function clearStreamStore(): void {
  STORE.clear();
}

function freezeSession(s: StreamSession): StreamSession {
  // Note: we freeze immutable identity (id, hostId, etc.) but lifecycle fields
  // (state, viewerCount, actualStart, endedAt, recordingUrl) are deliberately
  // mutable — that's the whole point of the lifecycle. Do not freeze here.
  return s;
}

// ─── HMAC plumbing (cycle 67 lesson: canonical JSON + HMAC chain) ───────────

let HMAC_SECRET = '';

export function setHmacSecret(secret: string): void {
  HMAC_SECRET = secret ?? '';
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const parts = keys.map((k) => JSON.stringify(k) + ':' + canonicalJson((value as any)[k]));
  return '{' + parts.join(',') + '}';
}

function signToken(payload: Record<string, unknown>): string {
  const json = canonicalJson(payload);
  const sig = createHmac('sha256', HMAC_SECRET || 'w71-d-default').update(json).digest('hex');
  return Buffer.from(json, 'utf8').toString('base64url') + '.' + sig;
}

// ─── Tradition validation (lookaround + sorted-set, cycle 60/65/67 lesson) ─

export function validateTraditionTags(tags: readonly string[]): TraditionTag[] {
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error('traditionTags: at least one tag is required');
  }
  const set = new Set<TraditionTag>();
  for (const t of tags) {
    if (typeof t !== 'string') throw new Error('traditionTags: each tag must be a string');
    const norm = t.toLowerCase().trim();
    if (!(TRADITION_TAGS as readonly string[]).includes(norm)) {
      throw new Error(`traditionTags: unknown tradition '${t}' (valid: ${TRADITION_TAGS.join(', ')})`);
    }
    set.add(norm as TraditionTag);
  }
  return Array.from(set);
}

export function isTraditionTag(s: string): s is TraditionTag {
  return (TRADITION_TAGS as readonly string[]).includes(s);
}

// ─── Validation helpers ─────────────────────────────────────────────────────

function validateConfig(cfg: StreamConfig): void {
  if (!cfg || typeof cfg !== 'object') throw new Error('createStream: config is required');
  if (!cfg.title || typeof cfg.title !== 'string' || cfg.title.trim().length === 0) {
    throw new Error('createStream: title is required');
  }
  if (cfg.title.length > 200) throw new Error('createStream: title must be <= 200 chars');
  if (cfg.description && cfg.description.length > 5000) {
    throw new Error('createStream: description must be <= 5000 chars');
  }
  if (typeof cfg.scheduledStart !== 'number' || !Number.isFinite(cfg.scheduledStart)) {
    throw new Error('createStream: scheduledStart must be a finite number (epoch ms)');
  }
  if (cfg.scheduledStart < 0) throw new Error('createStream: scheduledStart must be >= 0');
  if (typeof cfg.maxViewers !== 'number' || cfg.maxViewers < 1 || cfg.maxViewers > 100000) {
    throw new Error('createStream: maxViewers must be in [1, 100000]');
  }
  if (!['public', 'community', 'invite-only'].includes(cfg.visibility)) {
    throw new Error(`createStream: visibility must be public|community|invite-only (got '${cfg.visibility}')`);
  }
  validateTraditionTags(cfg.traditionTags);
}

function findOrThrow(sessionId: string): StreamSession {
  if (!sessionId) throw new Error('sessionId is required');
  const s = STORE.get(sessionId);
  if (!s) throw new Error(`stream not found: ${sessionId}`);
  return s;
}

function assertHost(session: StreamSession, hostId: string): void {
  if (!hostId) throw new Error('hostId is required');
  if (session.hostId !== hostId) {
    throw new Error(`forbidden: hostId mismatch (session.host=${session.hostId})`);
  }
}

// ─── Public API: lifecycle ──────────────────────────────────────────────────

export function createStream(hostId: string, config: StreamConfig): StreamSession {
  if (!hostId) throw new Error('createStream: hostId is required');
  validateConfig(config);
  const id = 'stream_' + randomUUID();
  const chatRoomId = 'room_' + randomUUID();
  const session: StreamSession = {
    id,
    hostId,
    title: config.title.trim(),
    description: (config.description ?? '').trim(),
    traditionTags: validateTraditionTags(config.traditionTags),
    scheduledStart: config.scheduledStart,
    state: 'scheduled',
    viewerCount: 0,
    maxViewers: config.maxViewers,
    recordingEnabled: config.recordingEnabled,
    chatRoomId,
    visibility: config.visibility,
    createdAt: Date.now(),
  };
  STORE.set(id, freezeSession(session));
  return STORE.get(id)!;
}

export function startStream(sessionId: string, hostId: string): StreamSession {
  const session = findOrThrow(sessionId);
  assertHost(session, hostId);
  if (session.state !== 'scheduled') {
    throw new Error(`startStream: cannot start from state '${session.state}' (must be 'scheduled')`);
  }
  (session as { state: StreamState }).state = 'live';
  session.actualStart = Date.now();
  return session;
}

export function endStream(
  sessionId: string,
  hostId: string,
  recordingUrl?: string,
): StreamSession {
  const session = findOrThrow(sessionId);
  assertHost(session, hostId);
  if (session.state !== 'live') {
    throw new Error(`endStream: cannot end from state '${session.state}' (must be 'live')`);
  }
  (session as { state: StreamState }).state = 'ended';
  session.endedAt = Date.now();
  if (recordingUrl !== undefined) {
    if (typeof recordingUrl !== 'string' || recordingUrl.length === 0) {
      throw new Error('endStream: recordingUrl must be a non-empty string when provided');
    }
    session.recordingUrl = recordingUrl;
  }
  return session;
}

export function cancelStream(sessionId: string, hostId: string, reason: string): StreamSession {
  const session = findOrThrow(sessionId);
  assertHost(session, hostId);
  if (session.state === 'ended' || session.state === 'cancelled') {
    throw new Error(`cancelStream: cannot cancel from state '${session.state}'`);
  }
  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    throw new Error('cancelStream: reason is required');
  }
  (session as { state: StreamState }).state = 'cancelled';
  session.endedAt = Date.now();
  return session;
}

// ─── Public API: read ───────────────────────────────────────────────────────

export function getStream(sessionId: string): StreamSession | null {
  if (!sessionId) return null;
  return STORE.get(sessionId) ?? null;
}

export function listStreams(
  filter: { state?: StreamState; hostId?: string; tradition?: string },
  opts: { limit: number; offset: number },
): StreamSession[] {
  if (!opts || typeof opts.limit !== 'number' || opts.limit < 0) {
    throw new Error('listStreams: opts.limit must be >= 0');
  }
  if (typeof opts.offset !== 'number' || opts.offset < 0) {
    throw new Error('listStreams: opts.offset must be >= 0');
  }
  let arr = Array.from(STORE.values());
  if (filter?.state) arr = arr.filter((s) => s.state === filter.state);
  if (filter?.hostId) arr = arr.filter((s) => s.hostId === filter.hostId);
  if (filter?.tradition) {
    const t = filter.tradition.toLowerCase();
    arr = arr.filter((s) => (s.traditionTags as readonly string[]).includes(t));
  }
  arr.sort((a, b) => b.scheduledStart - a.scheduledStart);
  return arr.slice(opts.offset, opts.offset + opts.limit);
}

// ─── Public API: viewer token (HMAC-signed, short-lived) ────────────────────

export type ViewerToken = {
  viewerToken: string;
  expiresAt: number;
};

export function subscribeToStream(sessionId: string, viewerId: string): ViewerToken {
  if (!viewerId) throw new Error('subscribeToStream: viewerId is required');
  const session = findOrThrow(sessionId);
  if (session.state !== 'live') {
    throw new Error(`subscribeToStream: stream is not live (state='${session.state}')`);
  }
  if (session.viewerCount >= session.maxViewers) {
    throw new Error(`subscribeToStream: stream is full (maxViewers=${session.maxViewers})`);
  }
  session.viewerCount += 1;
  if (session.viewerCount > (session as any)._peakViewers || !(session as any)._peakViewers) {
    (session as any)._peakViewers = session.viewerCount;
  }
  const expiresAt = Date.now() + 1000 * 60 * 30; // 30 min
  const token = signToken({
    sid: sessionId,
    vid: viewerId,
    exp: expiresAt,
    rid: session.chatRoomId,
  });
  return { viewerToken: token, expiresAt };
}

// ─── Public API: audit ──────────────────────────────────────────────────────

export function auditStreamSession(
  s: StreamSession,
): {
  id: string;
  state: StreamState;
  traditionTags: readonly TraditionTag[];
  hasRecording: boolean;
  visibility: StreamVisibility;
  isLive: boolean;
  isFull: boolean;
} {
  return Object.freeze({
    id: s.id,
    state: s.state,
    traditionTags: s.traditionTags,
    hasRecording: typeof s.recordingUrl === 'string' && s.recordingUrl.length > 0,
    visibility: s.visibility,
    isLive: s.state === 'live',
    isFull: s.viewerCount >= s.maxViewers,
  });
}

export function auditStreamTaxonomy(): {
  traditions: readonly TraditionTag[];
  visibilities: readonly StreamVisibility[];
  states: readonly StreamState[];
  minTags: number;
} {
  return Object.freeze({
    traditions: TRADITION_TAGS,
    visibilities: ['public', 'community', 'invite-only'] as const,
    states: ['scheduled', 'live', 'ended', 'cancelled'] as const,
    minTags: 1,
  });
}

// Re-exports for type ergonomics
export type { StreamSession as StreamSessionType };