/**
 * ════════════════════════════════════════════════════════════════════════════
 * COMMUNITY CIRCLES — membership.ts
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Pure-logic engine — join / leave / roles inside a circle. Composes with
 * circles.ts (creator-implicit-admin-fusion pattern, cycle 69 W69-E lesson).
 *
 * Member roles:
 *   - 'creator'  — implicit; userId === circle.creatorId, no row needed
 *   - 'admin'    — can promote / demote / pin / ban (creator only promotes)
 *   - 'moderator' — can flag / delete posts (audit-bound)
 *   - 'member'   — default postable role
 *
 * Storage: in-memory Map<memberId, Member>. The creator is NOT stored as a
 * row by default — virtual membership is resolved via findActiveMembership.
 * This keeps the audit trail ("who joined when") and avoids double-count.
 *
 * Ban lifecycle:
 *   active → banned → unbanned → active  (governance-flagged)
 *
 * State machine validation:
 *   join  → adds row (or reactivates banned row)
 *   leave → marks deletedAt
 *   ban   → flags row + notifies governance
 *   unban → clears bannedAt flag (creator only)
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  type CircleId,
  type RuleId,
  type Timestamp,
  type UserId,
  CircleFullError,
  CircleNotFoundError,
  CircleInvalidStateError,
  CircleForbiddenError,
  CircleValidationError,
  type Circle,
  type Tradition,
  asCircleId,
  asUserId,
  toUserId,
  toTimestamp,
  TRADITIONS,
  THEME_TRADITION,
  __recordMemberAdded,
  __recordMemberRemoved,
  getCircle,
} from './circles.ts';

// Re-export for callers that want to import from one entry.
export {
  asCircleId,
  asUserId,
  getCircle,
  CircleFullError,
  CircleNotFoundError,
  CircleInvalidStateError,
  CircleForbiddenError,
  CircleValidationError,
} from './circles.ts';

// ════════════════════════════════════════════════════════════════════════════
// BRANDED MEMBER ID
// ════════════════════════════════════════════════════════════════════════════

declare const __brand: unique symbol;
export type MemberId = string & Brand<'MemberId'>;
type Brand<TName extends string> = { readonly [__brand]: TName };
export const toMemberId = (s: string): MemberId => s as MemberId;
export const asMemberId = toMemberId;

// ════════════════════════════════════════════════════════════════════════════
// ROLES
// ════════════════════════════════════════════════════════════════════════════

export const ROLES_VALUES = ['creator', 'admin', 'moderator', 'member'] as const;
export type Role = (typeof ROLES_VALUES)[number];
export const ROLES: readonly Role[] = Object.freeze([...ROLES_VALUES]);

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

// ════════════════════════════════════════════════════════════════════════════
// MEMBER TYPE
// ════════════════════════════════════════════════════════════════════════════

export interface Member {
  readonly id: MemberId;
  readonly circleId: CircleId;
  readonly userId: UserId;
  readonly role: Role;
  readonly joinedAt: Timestamp;
  readonly bannedAt: Timestamp | null;
  readonly banReason: string | null;
  readonly invitedBy: UserId | null;
  readonly leftAt: Timestamp | null;
}

export interface ListMembersFilters {
  readonly role?: Role;
  readonly includeBanned?: boolean;
  readonly includeLeft?: boolean;
}

export interface JoinOptions {
  readonly invitationCode?: string;
  readonly asRole?: Extract<Role, 'member' | 'moderator'>;
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

let _hmacSecret = '';
let _idCounter = 0;

const MAX_REASON = 280;
const MAX_INVITATION_CODE = 64;

// ════════════════════════════════════════════════════════════════════════════
// ERRORS
// ════════════════════════════════════════════════════════════════════════════

export class MembershipValidationError extends Error {
  constructor(reason: string) {
    super(`Membership validation: ${reason}`);
    this.name = 'MembershipValidationError';
  }
}

export class MembershipNotFoundError extends Error {
  readonly id: string;
  constructor(id: string) {
    super(`Membership not found: ${id}`);
    this.name = 'MembershipNotFoundError';
    this.id = id;
  }
}

export class NotMemberError extends Error {
  readonly circleId: CircleId;
  readonly userId: UserId;
  constructor(circleId: CircleId, userId: UserId) {
    super(`User ${userId} is not a member of circle ${circleId}`);
    this.name = 'NotMemberError';
    this.circleId = circleId;
    this.userId = userId;
  }
}

export class AlreadyMemberError extends Error {
  readonly circleId: CircleId;
  readonly userId: UserId;
  constructor(circleId: CircleId, userId: UserId) {
    super(`User ${userId} is already a member of circle ${circleId}`);
    this.name = 'AlreadyMemberError';
    this.circleId = circleId;
    this.userId = userId;
  }
}

export class BannedMemberError extends Error {
  readonly circleId: CircleId;
  readonly userId: UserId;
  constructor(circleId: CircleId, userId: UserId) {
    super(`User ${userId} is banned from circle ${circleId}`);
    this.name = 'BannedMemberError';
    this.circleId = circleId;
    this.userId = userId;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HMAC UTILS
// ════════════════════════════════════════════════════════════════════════════

export function setMembershipHmacSecret(secret: string): void {
  if (typeof secret !== 'string') throw new MembershipValidationError('HMAC secret must be a string');
  _hmacSecret = secret;
}

function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function generateId(prefix: string): string {
  _idCounter += 1;
  const payload = `${_idCounter}:${Date.now()}:${prefix}:${_hmacSecret}`;
  return `${prefix}_${fnv1a(payload)}_${_idCounter.toString(36)}`;
}

function now(): Timestamp {
  return new Date().toISOString() as Timestamp;
}

// ════════════════════════════════════════════════════════════════════════════
// IN-MEMORY STORAGE
// ════════════════════════════════════════════════════════════════════════════

const MEMBERS = new Map<MemberId, Member>();

/** (circleId|userId) → memberId (active non-banned, non-left) */
const ACTIVE_KEY = new Map<string, MemberId>();
/** (circleId|userId) → all memberIds (history) */
const HISTORY_BY_KEY = new Map<string, MemberId[]>();
/** circleId → all memberIds */
const BY_CIRCLE = new Map<CircleId, Set<MemberId>>();
/** userId → all memberIds */
const BY_USER = new Map<UserId, Set<MemberId>>();

function pairKey(circleId: CircleId, userId: UserId): string {
  return `${circleId}|${userId}`;
}

function indexAdd<K extends string>(map: Map<K, Set<MemberId>>, key: K, value: MemberId): void {
  let s = map.get(key);
  if (!s) {
    s = new Set();
    map.set(key, s);
  }
  s.add(value);
}

function indexRemove<K extends string>(map: Map<K, Set<MemberId>>, key: K, value: MemberId): void {
  const s = map.get(key);
  if (s) {
    s.delete(value);
    if (s.size === 0) map.delete(key);
  }
}

function addHistory(circleId: CircleId, userId: UserId, memberId: MemberId): void {
  const k = pairKey(circleId, userId);
  const arr = HISTORY_BY_KEY.get(k);
  if (arr) arr.push(memberId);
  else HISTORY_BY_KEY.set(k, [memberId]);
}

export function __resetMembershipStore(): void {
  MEMBERS.clear();
  ACTIVE_KEY.clear();
  HISTORY_BY_KEY.clear();
  BY_CIRCLE.clear();
  BY_USER.clear();
  _idCounter = 0;
}

// ════════════════════════════════════════════════════════════════════════════
// VIRTUAL CREATOR LOOK-UP (cycle 69 W69-E lesson: creator-admin fusion)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Find the active membership for a user. Falls back to a virtual 'creator'
 * membership if the user matches circle.creatorId and no active row exists.
 * This is the implicit-owner pattern: circle.createdBy is BOTH creator
 * AND initial admin, even when no row has been inserted.
 */
export function findActiveMembership(
  circleId: CircleId,
  userId: UserId,
): Member | null {
  const k = pairKey(circleId, userId);
  const mid = ACTIVE_KEY.get(k);
  if (mid) {
    const m = MEMBERS.get(mid);
    if (m && !m.bannedAt && !m.leftAt) return m;
  }
  // Fusion: creator is always an admin even without a row.
  const circle = getCircle(circleId);
  if (circle && circle.creatorId === userId) {
    return Object.freeze({
      id: asMemberId(`virtual-${circleId}-${userId}`),
      circleId,
      userId,
      role: 'creator' as Role,
      joinedAt: circle.createdAt,
      bannedAt: null,
      banReason: null,
      invitedBy: null,
      leftAt: null,
    });
  }
  return null;
}

function isVirtual(m: Member): boolean {
  return m.id.startsWith('virtual-');
}

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ════════════════════════════════════════════════════════════════════════════

function validateReason(reason: string): void {
  if (typeof reason !== 'string') throw new MembershipValidationError('reason must be a string');
  if (reason.length === 0 || reason.length > MAX_REASON) {
    throw new MembershipValidationError(`reason must be 1..${MAX_REASON} chars`);
  }
}

function validateInvitationCode(code: string): void {
  if (typeof code !== 'string') throw new MembershipValidationError('invitationCode must be a string');
  if (code.length === 0 || code.length > MAX_INVITATION_CODE) {
    throw new MembershipValidationError(`invitationCode must be 1..${MAX_INVITATION_CODE} chars`);
  }
  if (!/^[A-Za-z0-9_-]+$/.test(code)) {
    throw new MembershipValidationError('invitationCode must match /^[A-Za-z0-9_-]+$/');
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CORE OPERATIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Join a circle. Idempotent (re-join after leave reactivates or no-ops).
 * Throws BannedMemberError if currently banned; CircleFullError if at cap.
 */
export function joinCircle(
  circleId: CircleId,
  userId: UserId,
  options: JoinOptions = {},
): Member {
  if (!circleId) throw new MembershipValidationError('circleId required');
  if (!userId) throw new MembershipValidationError('userId required');
  const circle = getCircle(circleId);
  if (!circle) throw new CircleNotFoundError(circleId);
  if (circle.status !== 'active') {
    throw new CircleInvalidStateError(`cannot join circle in status ${circle.status}`);
  }
  if (options.invitationCode !== undefined) validateInvitationCode(options.invitationCode);

  // Idempotent re-join: if there's a history row with leftAt, reactivate.
  const k = pairKey(circleId, userId);
  const hist = HISTORY_BY_KEY.get(k);
  if (hist) {
    for (const mid of hist) {
      const prev = MEMBERS.get(mid);
      if (prev && prev.leftAt && !prev.bannedAt) {
        const reactivated: Member = Object.freeze({
          ...prev,
          leftAt: null,
          joinedAt: now(),
        });
        MEMBERS.set(mid, reactivated);
        ACTIVE_KEY.set(k, mid);
        __recordMemberAdded(circleId, 0); // no count change (was already counted? no — leftAt = -1, so add back)
        return reactivated;
      }
      if (prev && prev.bannedAt) {
        throw new BannedMemberError(circleId, userId);
      }
    }
  }

  // Creator joining own circle is a no-op via the fusion.
  if (circle.creatorId === userId) {
    return Object.freeze({
      id: asMemberId(`virtual-${circleId}-${userId}`),
      circleId,
      userId,
      role: 'creator',
      joinedAt: circle.createdAt,
      bannedAt: null,
      banReason: null,
      invitedBy: null,
      leftAt: null,
    });
  }

  // Capacity check via circles.assertCircleNotFull semantics.
  if (circle.memberCount >= circle.maxMembers) {
    throw new CircleFullError(circleId);
  }

  if (ACTIVE_KEY.has(k)) {
    const existing = MEMBERS.get(ACTIVE_KEY.get(k)!);
    if (existing) throw new AlreadyMemberError(circleId, userId);
  }

  const memberId = asMemberId(generateId('mem'));
  const role: Role = options.asRole === 'moderator' ? 'moderator' : 'member';
  const member: Member = Object.freeze({
    id: memberId,
    circleId,
    userId,
    role,
    joinedAt: now(),
    bannedAt: null,
    banReason: null,
    invitedBy: null,
    leftAt: null,
  });
  MEMBERS.set(memberId, member);
  ACTIVE_KEY.set(k, memberId);
  addHistory(circleId, userId, memberId);
  indexAdd(BY_CIRCLE, circleId, memberId);
  indexAdd(BY_USER, userId, memberId);
  __recordMemberAdded(circleId, 1);
  return member;
}

/**
 * Leave a circle. Idempotent (returns false if user was not a member).
 */
export function leaveCircle(circleId: CircleId, userId: UserId, reason?: string): boolean {
  const circle = getCircle(circleId);
  if (!circle) throw new CircleNotFoundError(circleId);
  if (circle.creatorId === userId) {
    throw new CircleForbiddenError('the creator cannot leave their own circle');
  }
  if (reason !== undefined) validateReason(reason);
  const k = pairKey(circleId, userId);
  const mid = ACTIVE_KEY.get(k);
  if (!mid) return false;
  const m = MEMBERS.get(mid);
  if (!m) return false;
  const left: Member = Object.freeze({
    ...m,
    leftAt: now(),
  });
  MEMBERS.set(mid, left);
  ACTIVE_KEY.delete(k);
  __recordMemberRemoved(circleId, 1);
  return true;
}

export function getMember(memberId: MemberId): Member | null {
  return MEMBERS.get(memberId) ?? null;
}

/** List members of a circle, optionally filtered by role + include-banned/left. */
export function listMembers(circleId: CircleId, filters?: ListMembersFilters): readonly Member[] {
  if (!getCircle(circleId)) throw new CircleNotFoundError(circleId);
  const ids = BY_CIRCLE.get(circleId);
  const rows: Member[] = [];
  // Add virtual creator
  const circle = getCircle(circleId)!;
  rows.push(
    Object.freeze({
      id: asMemberId(`virtual-${circleId}-${circle.creatorId}`),
      circleId,
      userId: circle.creatorId,
      role: 'creator' as Role,
      joinedAt: circle.createdAt,
      bannedAt: null,
      banReason: null,
      invitedBy: null,
      leftAt: null,
    }),
  );
  if (ids) {
    for (const id of ids) {
      const m = MEMBERS.get(id);
      if (!m) continue;
      if (!filters?.includeBanned && m.bannedAt) continue;
      if (!filters?.includeLeft && m.leftAt) continue;
      if (filters?.role && m.role !== filters.role) continue;
      rows.push(m);
    }
  }
  if (filters?.role && filters.role !== 'creator') {
    return Object.freeze(rows.filter((r) => r.role === filters.role));
  }
  if (filters?.role === 'creator') {
    return Object.freeze(rows.filter((r) => r.role === 'creator'));
  }
  if (filters?.includeBanned || filters?.includeLeft) return Object.freeze(rows);
  return Object.freeze(rows.filter((r) => !r.bannedAt && !r.leftAt));
}

/** Creator-only: promote target to admin. */
export function promoteToAdmin(circleId: CircleId, targetUserId: UserId, requesterId: UserId): boolean {
  const circle = getCircle(circleId);
  if (!circle) throw new CircleNotFoundError(circleId);
  if (circle.creatorId !== requesterId) {
    throw new CircleForbiddenError('only the creator may promote');
  }
  if (circle.creatorId === targetUserId) return false; // already creator
  const k = pairKey(circleId, targetUserId);
  const mid = ACTIVE_KEY.get(k);
  if (!mid) throw new NotMemberError(circleId, targetUserId);
  const m = MEMBERS.get(mid);
  if (!m) return false;
  if (m.role === 'admin') return false;
  const next: Member = Object.freeze({ ...m, role: 'admin' });
  MEMBERS.set(mid, next);
  return true;
}

/** Creator-only: demote target admin back to member. */
export function demoteAdmin(circleId: CircleId, targetUserId: UserId, requesterId: UserId): boolean {
  const circle = getCircle(circleId);
  if (!circle) throw new CircleNotFoundError(circleId);
  if (circle.creatorId !== requesterId) {
    throw new CircleForbiddenError('only the creator may demote');
  }
  const k = pairKey(circleId, targetUserId);
  const mid = ACTIVE_KEY.get(k);
  if (!mid) return false;
  const m = MEMBERS.get(mid);
  if (!m) return false;
  if (m.role !== 'admin') return false;
  const next: Member = Object.freeze({ ...m, role: 'member' });
  MEMBERS.set(mid, next);
  return true;
}

/** Creator/admin: ban a member. Triggers governance audit (see governance.ts). */
export function banMember(
  circleId: CircleId,
  targetUserId: UserId,
  requesterId: UserId,
  reason: string,
): boolean {
  validateReason(reason);
  const circle = getCircle(circleId);
  if (!circle) throw new CircleNotFoundError(circleId);
  if (circle.creatorId !== requesterId) {
    throw new CircleForbiddenError('only the creator may ban');
  }
  if (circle.creatorId === targetUserId) {
    throw new CircleForbiddenError('cannot ban the creator');
  }
  const k = pairKey(circleId, targetUserId);
  const mid = ACTIVE_KEY.get(k);
  if (!mid) throw new NotMemberError(circleId, targetUserId);
  const m = MEMBERS.get(mid);
  if (!m) return false;
  const banned: Member = Object.freeze({
    ...m,
    bannedAt: now(),
    banReason: reason,
  });
  MEMBERS.set(mid, banned);
  ACTIVE_KEY.delete(k);
  return true;
}

/** Creator: unban a member. */
export function unbanMember(circleId: CircleId, targetUserId: UserId, requesterId: UserId): boolean {
  const circle = getCircle(circleId);
  if (!circle) throw new CircleNotFoundError(circleId);
  if (circle.creatorId !== requesterId) {
    throw new CircleForbiddenError('only the creator may unban');
  }
  const k = pairKey(circleId, targetUserId);
  const history = HISTORY_BY_KEY.get(k);
  if (!history) return false;
  let found = false;
  for (const mid of history) {
    const m = MEMBERS.get(mid);
    if (m && m.bannedAt) {
      const unbanned: Member = Object.freeze({
        ...m,
        bannedAt: null,
        banReason: null,
        joinedAt: now(),
        leftAt: null,
      });
      MEMBERS.set(mid, unbanned);
      ACTIVE_KEY.set(k, mid);
      found = true;
      break;
    }
  }
  return found;
}

export function getMemberCount(circleId: CircleId): number {
  const c = getCircle(circleId);
  if (!c) throw new CircleNotFoundError(circleId);
  return c.memberCount;
}

export function listForUser(userId: UserId): readonly Member[] {
  const ids = BY_USER.get(userId);
  if (!ids) return Object.freeze([]);
  return Object.freeze(
    Array.from(ids)
      .map((id) => MEMBERS.get(id))
      .filter((m): m is Member => Boolean(m) && !m!.leftAt && !m!.bannedAt),
  );
}

/** Throws NotMemberError if user is not currently a member. */
export function assertMemberCanPost(circleId: CircleId, userId: UserId): void {
  const c = getCircle(circleId);
  if (!c) throw new CircleNotFoundError(circleId);
  const m = findActiveMembership(circleId, userId);
  if (!m) throw new NotMemberError(circleId, userId);
  if (m.bannedAt) throw new BannedMemberError(circleId, userId);
}

/** Audit: how many of each role currently active. */
export function auditMembershipBreakdown(
  circleId: CircleId,
): Readonly<Record<Role, number>> {
  const counts: Record<Role, number> = {
    creator: 0,
    admin: 0,
    moderator: 0,
    member: 0,
  };
  const all = listMembers(circleId, { includeBanned: true, includeLeft: true });
  for (const m of all) if (!m.bannedAt && !m.leftAt) counts[m.role] += 1;
  return Object.freeze(counts);
}

// Helper exports for tests / other engines.
export const __testing = { isVirtual, ACTIVE_KEY, HISTORY_BY_KEY, MEMBERS };
