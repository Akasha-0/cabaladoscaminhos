// Auth Audit Engine — wave 68
// Append-only audit log of authentication events: login, logout, login_failed, password_reset, 2fa_enabled, 2fa_disabled, oauth_link, session_revoked.
// Supports paginated query by userId + filter.
//
// Sections:
//  1. Types (AuthEvent, AuthEventType, AuditFilter)
//  2. Errors
//  3. Constants
//  4. In-memory append-only ledger
//  5. Public API: logAuthEvent, queryAuthEvents, getAuthEventById, countByType
//  6. Default export audit

/* ───────────────────────── 1. Types ───────────────────────── */

export type AuthEventType =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_reset'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'oauth_link'
  | 'oauth_unlink'
  | 'session_revoked'
  | 'session_refreshed'
  | 'signup';

export const ALL_AUTH_EVENT_TYPES: ReadonlyArray<AuthEventType> = [
  'login', 'logout', 'login_failed', 'password_reset',
  '2fa_enabled', '2fa_disabled', 'oauth_link', 'oauth_unlink',
  'session_revoked', 'session_refreshed', 'signup',
];

export interface AuthEvent {
  readonly id: string;
  readonly userId: string;
  readonly type: AuthEventType;
  readonly ip: string | null;
  readonly userAgent: string | null;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly createdAt: Date;
}

export interface LogAuthEventInput {
  readonly userId: string;
  readonly type: AuthEventType;
  readonly ip?: string | null;
  readonly userAgent?: string | null;
  readonly metadata?: Record<string, string | number | boolean | null>;
  readonly createdAt?: Date;
}

export interface AuthAuditFilter {
  readonly types?: ReadonlyArray<AuthEventType>;
  readonly since?: Date;
  readonly until?: Date;
  readonly ip?: string;
  readonly limit?: number;
  readonly offset?: number;
}

export interface AuthAuditQueryResult {
  readonly events: ReadonlyArray<AuthEvent>;
  readonly total: number;
  readonly hasMore: boolean;
}

/* ───────────────────────── 2. Errors ───────────────────────── */

export class AuditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuditError';
  }
}

export class InvalidAuthEventError extends AuditError {
  constructor(message = 'Invalid auth event') {
    super(message);
    this.name = 'InvalidAuthEventError';
  }
}

/* ───────────────────────── 3. Constants ───────────────────────── */

export const AUDIT_DEFAULT_PAGE_SIZE = 50;
export const AUDIT_MAX_PAGE_SIZE = 500;

/* ───────────────────────── 4. In-memory ledger ───────────────────────── */

const _ledger: AuthEvent[] = [];
const _byUserIndex = new Map<string, number[]>(); // userId -> sorted indices into _ledger
let _eventCounter = 0;

function nextEventId(): string {
  _eventCounter = (_eventCounter + 1) >>> 0;
  return `evt_${Date.now().toString(36)}_${_eventCounter.toString(36).padStart(4, '0')}`;
}

function validateInput(input: LogAuthEventInput): void {
  if (!input || typeof input.userId !== 'string' || input.userId.length === 0) {
    throw new InvalidAuthEventError('userId is required');
  }
  if (!ALL_AUTH_EVENT_TYPES.includes(input.type)) {
    throw new InvalidAuthEventError(`Unknown event type: ${input.type}`);
  }
  if (input.ip !== undefined && input.ip !== null && typeof input.ip !== 'string') {
    throw new InvalidAuthEventError('ip must be a string or null');
  }
  if (input.userAgent !== undefined && input.userAgent !== null && typeof input.userAgent !== 'string') {
    throw new InvalidAuthEventError('userAgent must be a string or null');
  }
}

export function resetAuditLog(): void {
  _ledger.length = 0;
  _byUserIndex.clear();
  _eventCounter = 0;
}

export function logAuthEvent(input: LogAuthEventInput): AuthEvent {
  validateInput(input);
  const event: AuthEvent = {
    id: nextEventId(),
    userId: input.userId,
    type: input.type,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    createdAt: input.createdAt ?? new Date(),
  };
  const idx = _ledger.length;
  _ledger.push(event);
  const arr = _byUserIndex.get(event.userId) ?? [];
  // sorted insert by createdAt (insertion order = chronological in test env)
  let insertAt = arr.length;
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const existing = _ledger[arr[i]!]!;
    if (existing.createdAt <= event.createdAt) break;
    insertAt = i;
  }
  arr.splice(insertAt, 0, idx);
  _byUserIndex.set(event.userId, arr);
  return event;
}

export interface QueryAuthEventsInput {
  readonly userId: string;
  readonly filter?: AuthAuditFilter;
}

export async function queryAuthEvents(input: QueryAuthEventsInput): Promise<AuthAuditQueryResult> {
  if (!input || typeof input.userId !== 'string' || input.userId.length === 0) {
    throw new InvalidAuthEventError('userId required');
  }
  const filter = input.filter ?? {};
  const indices = _byUserIndex.get(input.userId) ?? [];
  const matched: AuthEvent[] = [];
  for (const i of indices) {
    const event = _ledger[i]!;
    if (filter.types && filter.types.length > 0 && !filter.types.includes(event.type)) continue;
    if (filter.since && event.createdAt < filter.since) continue;
    if (filter.until && event.createdAt > filter.until) continue;
    if (filter.ip && filter.ip !== event.ip) continue;
    matched.push(event);
  }
  const offset = Math.max(0, filter.offset ?? 0);
  const limit = Math.min(AUDIT_MAX_PAGE_SIZE, Math.max(1, filter.limit ?? AUDIT_DEFAULT_PAGE_SIZE));
  const slice = matched.slice(offset, offset + limit);
  return {
    events: slice,
    total: matched.length,
    hasMore: offset + limit < matched.length,
  };
}

export function getAuthEventById(id: string): AuthEvent | null {
  if (typeof id !== 'string' || id.length === 0) return null;
  for (const e of _ledger) {
    if (e.id === id) return e;
  }
  return null;
}

export function countByType(userId: string): Readonly<Record<AuthEventType, number>> {
  const out: Record<AuthEventType, number> = ALL_AUTH_EVENT_TYPES.reduce(
    (acc, t) => ({ ...acc, [t]: 0 }),
    {} as Record<AuthEventType, number>,
  );
  const indices = _byUserIndex.get(userId) ?? [];
  for (const i of indices) {
    const e = _ledger[i]!;
    out[e.type] += 1;
  }
  return out;
}

export function totalEventsForUser(userId: string): number {
  return _byUserIndex.get(userId)?.length ?? 0;
}

export function totalEventsInLog(): number {
  return _ledger.length;
}

/* ───────────────────────── 5. Default export audit ───────────────────────── */

export const __ALL_EXPORTS = {
  types: ['AuthEvent', 'AuthEventType', 'AuthAuditFilter', 'AuthAuditQueryResult', 'LogAuthEventInput', 'QueryAuthEventsInput'],
  functions: [
    'logAuthEvent', 'queryAuthEvents', 'getAuthEventById',
    'countByType', 'totalEventsForUser', 'totalEventsInLog',
    'resetAuditLog',
  ],
  constants: ['AUDIT_DEFAULT_PAGE_SIZE', 'AUDIT_MAX_PAGE_SIZE', 'ALL_AUTH_EVENT_TYPES'],
  errors: ['AuditError', 'InvalidAuthEventError'],
} as const;
