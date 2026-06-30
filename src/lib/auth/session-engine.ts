// Auth Session Engine — wave 68
// Session lifecycle: create, validate, refresh, revoke, list, cleanup.
// Token format: `<sessionId>.<hmac>` where hmac = HMAC-SHA256(secret, sessionId + "." + userId + "." + expiresAtMs)
// Storage: in-process Map (sandbox friendly). Caller maps to Prisma in production.
//
// Sections:
//  1. Types
//  2. Branded type guards
//  3. Errors
//  4. Constants
//  5. Crypto helpers (HMAC, random ids, base64url)
//  6. In-memory ledger + optional Prisma interface
//  7. Public API: create / validate / refresh / revoke / list / cleanup / getById / purge
//  8. Default export audit

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/* ───────────────────────── 1. Types ───────────────────────── */

export interface Session {
  readonly id: string;
  readonly userId: string;
  readonly token: SessionToken;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly revokedAt: Date | null;
  readonly metadata: SessionMetadata;
}

export interface SessionMetadata {
  readonly ip: string | null;
  readonly userAgent: string | null;
  readonly deviceFingerprint: string | null;
  readonly extra?: Readonly<Record<string, string | number | boolean | null>>;
}

export type SessionToken = string & { readonly __brand: 'SessionToken' };

export type SessionRevokeReason =
  | 'user_logout'
  | 'user_requested'
  | 'admin_action'
  | 'expired'
  | 'suspicious_activity'
  | 'password_reset'
  | 'two_factor_disabled'
  | 'unknown';

export interface SessionCreateOptions {
  readonly ttlMs?: number;
  readonly metadata?: SessionMetadata;
}

export interface SessionRevokeOptions {
  readonly reason?: SessionRevokeReason;
  readonly actorId?: string | null;
}

/* ───────────────────────── 2. Branded helpers ───────────────────────── */

export function toSessionToken(raw: string): SessionToken {
  if (typeof raw !== 'string' || raw.length < 16 || !raw.includes('.')) {
    throw new InvalidSessionTokenError('Session token must be a dot-separated string of length >= 16');
  }
  return raw as SessionToken;
}

export function isSessionToken(value: unknown): value is SessionToken {
  return typeof value === 'string' && value.length >= 16 && value.includes('.');
}

/* ───────────────────────── 3. Errors ───────────────────────── */

export class SessionEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionEngineError';
  }
}

export class InvalidSessionTokenError extends SessionEngineError {
  constructor(message = 'Invalid session token') {
    super(message);
    this.name = 'InvalidSessionTokenError';
  }
}

export class SessionExpiredError extends SessionEngineError {
  constructor(message = 'Session has expired') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

export class SessionRevokedError extends SessionEngineError {
  constructor(message = 'Session has been revoked') {
    super(message);
    this.name = 'SessionRevokedError';
  }
}

export class SessionNotFoundError extends SessionEngineError {
  constructor(message = 'Session not found') {
    super(message);
    this.name = 'SessionNotFoundError';
  }
}

/* ───────────────────────── 4. Constants ───────────────────────── */

export const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
export const SESSION_REFRESH_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 2; // 2 days
export const SESSION_ID_BYTES = 24;

const HMAC_ALGO = 'sha256';
const DEFAULT_HMAC_SECRET = ''; // production MUST override via setSessionHmacSecret
let _hmacSecret = DEFAULT_HMAC_SECRET;

let _nextSessionCounter = 0;
function nextSessionId(): string {
  _nextSessionCounter = (_nextSessionCounter + 1) >>> 0;
  return `${Date.now().toString(36)}${_nextSessionCounter.toString(36)}${randomBytes(8).toString('hex')}`;
}

/* ───────────────────────── 5. Crypto helpers ───────────────────────── */

export function setSessionHmacSecret(secret: string): void {
  if (typeof secret !== 'string' || secret.length < 16) {
    throw new SessionEngineError('HMAC secret must be a string of length >= 16');
  }
  _hmacSecret = secret;
}

export function getSessionHmacSecretFingerprint(): string {
  // Non-reversible fingerprint so callers can verify secret was set without leaking it.
  const salt = 'cabala-session-fingerprint';
  return createHmac(HMAC_ALGO, salt).update(_hmacSecret).digest('base64url').slice(0, 12);
}

function computeHmac(payload: string): string {
  if (_hmacSecret.length === 0) {
    throw new SessionEngineError('HMAC secret not configured — call setSessionHmacSecret(secret) first');
  }
  return createHmac(HMAC_ALGO, _hmacSecret).update(payload).digest('base64url');
}

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function encodeToken(sessionId: string, userId: string, expiresAtMs: number, hmac: string): SessionToken {
  return toSessionToken(`${sessionId}.${userId}.${expiresAtMs}.${hmac}`);
}

function decodeToken(token: SessionToken): {
  sessionId: string;
  userId: string;
  expiresAtMs: number;
  hmac: string;
} {
  const parts = token.split('.');
  if (parts.length !== 4) throw new InvalidSessionTokenError('Token must have 4 dot-separated parts');
  const [sessionId, userId, expiresAtRaw, hmac] = parts;
  if (!sessionId || !userId || !expiresAtRaw || !hmac) {
    throw new InvalidSessionTokenError('Token parts cannot be empty');
  }
  const expiresAtMs = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    throw new InvalidSessionTokenError('Token expiry must be a positive integer');
  }
  return { sessionId, userId, expiresAtMs: Math.trunc(expiresAtMs), hmac };
}

export function buildTokenPayload(sessionId: string, userId: string, expiresAtMs: number): string {
  return `${sessionId}.${userId}.${expiresAtMs}`;
}

/* ───────────────────────── 6. Storage abstraction ───────────────────────── */

export interface SessionStore {
  insert(session: Session): Promise<void>;
  update(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<ReadonlyArray<Session>>;
}

class InMemorySessionStore implements SessionStore {
  private readonly byId = new Map<string, Session>();
  private readonly byUser = new Map<string, Set<string>>();

  async insert(session: Session): Promise<void> {
    if (this.byId.has(session.id)) {
      throw new SessionEngineError(`Session id collision: ${session.id}`);
    }
    this.byId.set(session.id, session);
    const set = this.byUser.get(session.userId) ?? new Set<string>();
    set.add(session.id);
    this.byUser.set(session.userId, set);
  }

  async update(session: Session): Promise<void> {
    if (!this.byId.has(session.id)) {
      throw new SessionNotFoundError(`Session not found for update: ${session.id}`);
    }
    this.byId.set(session.id, session);
  }

  async findById(id: string): Promise<Session | null> {
    return this.byId.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<ReadonlyArray<Session>> {
    const ids = this.byUser.get(userId);
    if (!ids) return [];
    const out: Session[] = [];
    for (const id of ids) {
      const s = this.byId.get(id);
      if (s) out.push(s);
    }
    return out;
  }
}

let _store: SessionStore = new InMemorySessionStore();

export function setSessionStore(store: SessionStore): void {
  if (!store) throw new SessionEngineError('Session store cannot be null');
  _store = store;
}

export function getSessionStoreInfo(): { kind: 'in-memory' | 'custom' } {
  return _store instanceof InMemorySessionStore ? { kind: 'in-memory' } : { kind: 'custom' };
}

export function resetSessionEngine(): void {
  _store = new InMemorySessionStore();
  _hmacSecret = DEFAULT_HMAC_SECRET;
  _nextSessionCounter = 0;
}

/* ───────────────────────── 7. Public API ───────────────────────── */

export interface CreateSessionInput {
  readonly userId: string;
  readonly metadata?: SessionMetadata;
  readonly ttlMs?: number;
}

export async function createSession(
  userId: string,
  options: SessionCreateOptions = {},
): Promise<Session> {
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new SessionEngineError('userId must be a non-empty string');
  }
  const ttlMs = options.ttlMs ?? DEFAULT_SESSION_TTL_MS;
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
    throw new SessionEngineError('ttlMs must be a positive integer');
  }
  const id = nextSessionId();
  const expiresAtMs = Date.now() + ttlMs;
  const hmac = computeHmac(buildTokenPayload(id, userId, expiresAtMs));
  const token = encodeToken(id, userId, expiresAtMs, hmac);
  const metadata = options.metadata ?? { ip: null, userAgent: null, deviceFingerprint: null };
  const session: Session = {
    id,
    userId,
    token,
    expiresAt: new Date(expiresAtMs),
    createdAt: new Date(),
    revokedAt: null,
    metadata,
  };
  await _store.insert(session);
  return session;
}

export type ValidateResult =
  | { readonly status: 'valid'; readonly session: Session }
  | { readonly status: 'expired'; readonly session: Session }
  | { readonly status: 'revoked'; readonly session: Session }
  | { readonly status: 'invalid'; readonly reason: string };

export async function validateSession(token: SessionToken | string): Promise<ValidateResult> {
  let tok: SessionToken;
  try {
    tok = typeof token === 'string' ? toSessionToken(token) : token;
  } catch (err) {
    return { status: 'invalid', reason: err instanceof Error ? err.message : 'token format invalid' };
  }
  let decoded;
  try {
    decoded = decodeToken(tok);
  } catch (err) {
    return { status: 'invalid', reason: err instanceof Error ? err.message : 'decode failed' };
  }
  const expectedHmac = computeHmac(buildTokenPayload(decoded.sessionId, decoded.userId, decoded.expiresAtMs));
  if (!constantTimeEqual(expectedHmac, decoded.hmac)) {
    return { status: 'invalid', reason: 'hmac mismatch' };
  }
  const session = await _store.findById(decoded.sessionId);
  if (!session) return { status: 'invalid', reason: 'session not found' };
  if (session.revokedAt) return { status: 'revoked', session };
  if (session.expiresAt.getTime() <= Date.now()) return { status: 'expired', session };
  return { status: 'valid', session };
}

export interface RefreshResult {
  readonly refreshed: boolean;
  readonly session: Session;
}

export async function refreshSession(
  token: SessionToken | string,
  options: SessionCreateOptions = {},
): Promise<RefreshResult> {
  const result = await validateSession(token);
  if (result.status === 'invalid') {
    throw new InvalidSessionTokenError(`Cannot refresh: ${result.reason}`);
  }
  if (result.status === 'revoked') {
    throw new SessionRevokedError('Cannot refresh a revoked session');
  }
  // Expired → auto-revoke as housekeeping
  if (result.status === 'expired') {
    if (!result.session.revokedAt) {
      await _store.update({ ...result.session, revokedAt: new Date() });
    }
  }
  const ttlMs = options.ttlMs ?? DEFAULT_SESSION_TTL_MS;
  const expiresAtMs = Date.now() + ttlMs;
  const hmac = computeHmac(buildTokenPayload(result.session.id, result.session.userId, expiresAtMs));
  const newToken = encodeToken(result.session.id, result.session.userId, expiresAtMs, hmac);
  const refreshed: Session = {
    ...result.session,
    token: newToken,
    expiresAt: new Date(expiresAtMs),
    metadata: options.metadata ?? result.session.metadata,
  };
  await _store.update(refreshed);
  return { refreshed: true, session: refreshed };
}

export async function revokeSession(
  token: SessionToken | string,
  options: SessionRevokeOptions = {},
): Promise<Session> {
  const result = await validateSession(token);
  if (result.status === 'invalid') {
    throw new InvalidSessionTokenError(`Cannot revoke: ${result.reason}`);
  }
  if (result.session.revokedAt) return result.session;
  const revoked: Session = { ...result.session, revokedAt: new Date() };
  await _store.update(revoked);
  void options.reason;
  void options.actorId;
  return revoked;
}

export async function getActiveSessions(userId: string, now: number = Date.now()): Promise<ReadonlyArray<Session>> {
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new SessionEngineError('userId must be a non-empty string');
  }
  const all = await _store.findByUserId(userId);
  return all.filter(s => s.revokedAt === null && s.expiresAt.getTime() > now);
}

export async function getAllSessions(userId: string): Promise<ReadonlyArray<Session>> {
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new SessionEngineError('userId must be a non-empty string');
  }
  return _store.findByUserId(userId);
}

export async function getSessionById(id: string): Promise<Session | null> {
  if (typeof id !== 'string' || id.length === 0) {
    throw new SessionEngineError('id must be a non-empty string');
  }
  return _store.findById(id);
}

export interface CleanupResult {
  readonly removed: number;
  readonly scanned: number;
}

export async function cleanupExpiredSessions(now: number = Date.now()): Promise<CleanupResult> {
  let removed = 0;
  let scanned = 0;
  // In-memory store walk: traverse all known users via internal reflection fallback.
  // For external stores, callers implement their own background job.
  if (_store instanceof InMemorySessionStore) {
    const mem = _store as unknown as InMemorySessionStore;
    const internal = (mem as unknown as { byId: Map<string, Session> }).byId;
    const expiredIds: string[] = [];
    for (const [id, s] of internal) {
      scanned += 1;
      if (s.revokedAt !== null || s.expiresAt.getTime() <= now) {
        if (s.revokedAt === null) {
          await mem.update({ ...s, revokedAt: new Date(now) });
          removed += 1;
        } else {
          // already revoked & expired — count as cleanup candidate
          removed += 1;
        }
        expiredIds.push(id);
      }
    }
    // Compact in-memory index for already-handled sessions:
    for (const id of expiredIds) {
      const s = internal.get(id);
      if (s) {
        internal.delete(id);
        const userSet = (mem as unknown as { byUser: Map<string, Set<string>> }).byUser.get(s.userId);
        userSet?.delete(id);
      }
    }
  }
  return { removed, scanned };
}

/* ───────────────────────── 8. Default export audit ───────────────────────── */

export const __ALL_EXPORTS = {
  types: ['Session', 'SessionMetadata', 'SessionToken', 'SessionRevokeReason', 'SessionCreateOptions', 'SessionRevokeOptions', 'ValidateResult', 'RefreshResult', 'CleanupResult', 'CreateSessionInput'],
  functions: [
    'toSessionToken', 'isSessionToken',
    'setSessionHmacSecret', 'getSessionHmacSecretFingerprint', 'buildTokenPayload',
    'setSessionStore', 'getSessionStoreInfo', 'resetSessionEngine',
    'createSession', 'validateSession', 'refreshSession', 'revokeSession',
    'getActiveSessions', 'getAllSessions', 'getSessionById', 'cleanupExpiredSessions',
  ],
  constants: ['DEFAULT_SESSION_TTL_MS', 'SESSION_REFRESH_THRESHOLD_MS', 'SESSION_ID_BYTES'],
  errors: ['SessionEngineError', 'InvalidSessionTokenError', 'SessionExpiredError', 'SessionRevokedError', 'SessionNotFoundError'],
} as const;
