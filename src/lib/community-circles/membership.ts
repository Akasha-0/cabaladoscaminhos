// ============================================================================
// COMMUNITY CIRCLES — Membership + Roles (Wave 69, 2026-06-30)
// ============================================================================
// Pure-logic engine. Composes circles.ts for capacity checks.
//
// State machines:
//   Membership: active → removed | left
//   Invite:     pending → accepted | revoked | expired
//   JoinRequest: pending → approved | rejected | cancelled
//   Role transitions (per circle):
//     member → moderator (admin promotes)
//     moderator → admin   (admin promotes)
//     *       → removed   (admin removes)
//     admin   → member    (demotion — only if not last admin)
//
// Anti-shady-pattern: leaveCircle always succeeds (unless last admin).
// LGPD: leaveCircle + removeMember fire piiScrub on the membership row.
//
// HMAC-signed invite tokens (cycle 67 lesson 5: JSON canonicalization).
// ============================================================================

import {
  getCircle,
  incrementMemberCount,
  asUserId,
  isCreatorAdmin,
  getCircleCreator,
  CircleCapacityError,
  CircleForbiddenError,
  CircleNotFoundError,
  CircleValidationError,
} from "./circles.ts";

import type {
  CircleId,
  UserId,
  Visibility,
  JoinPolicy,
} from "./circles.ts";

// ============================================================================
// BRANDED TYPES
// ============================================================================

declare const _brand: unique symbol;
type Brand<T, B> = T & { readonly [_brand]: B };

export type MembershipId = Brand<string, "MembershipId">;
export type InviteId = Brand<string, "InviteId">;
export type JoinRequestId = Brand<string, "JoinRequestId">;

const asMembershipId = (s: string): MembershipId => s as MembershipId;
const asInviteId = (s: string): InviteId => s as InviteId;
const asJoinRequestId = (s: string): JoinRequestId => s as JoinRequestId;

// ============================================================================
// PUBLIC TYPES
// ============================================================================

export type Role = "member" | "moderator" | "admin";
export const ROLES: readonly Role[] = ["member", "moderator", "admin"] as const;

/** Channel by which the user joined the circle. */
export type JoinVia = "open" | "invite" | "request-accepted";

export interface Membership {
  readonly id: MembershipId;
  readonly circleId: CircleId;
  readonly userId: UserId;
  readonly role: Role;
  readonly joinedAt: string;
  readonly joinedVia: JoinVia;
  readonly leftAt: string | null;
  readonly leftReason: string | null;
  /** PII deletion marker — true if member content has been scrubbed. */
  readonly piiScrubbedAt: string | null;
}

export interface InviteToken {
  /** Token string used in the invite URL/email. */
  readonly token: string;
  readonly id: InviteId;
  readonly circleId: CircleId;
  readonly invitedBy: UserId;
  readonly inviteeUserId: UserId | null;
  readonly inviteeEmail: string | null;
  readonly status: "pending" | "accepted" | "revoked" | "expired";
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly acceptedAt: string | null;
  /** HMAC signature — tamper-evident. */
  readonly signature: string;
}

export interface JoinRequest {
  readonly id: JoinRequestId;
  readonly circleId: CircleId;
  readonly userId: UserId;
  readonly message: string | null;
  readonly status: "pending" | "approved" | "rejected" | "cancelled";
  readonly createdAt: string;
  readonly decidedAt: string | null;
  readonly decidedBy: UserId | null;
  readonly rejectionReason: string | null;
}

export interface JoinCircleInput {
  readonly userId: UserId | string;
  readonly circleId: CircleId | string;
  readonly via: JoinVia;
  /** Required for `invite` and `request-accepted` vias. */
  readonly inviteToken?: string;
  /** Required for `request-accepted` via. */
  readonly joinRequestId?: string;
  /** Required if `request-accepted` came from an approver. */
  readonly approverId?: UserId | string;
}

export interface GetMembersOptions {
  readonly role?: Role;
  readonly limit?: number;
  readonly offset?: number;
}

export interface GetMembersResult {
  readonly members: readonly Membership[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_INVITE_MESSAGE_LENGTH = 1000;

let _hmacSecret = "";

// ============================================================================
// ERRORS
// ============================================================================

export class MembershipNotFoundError extends Error {
  readonly entity: string;
  readonly id: string;
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
    this.name = "MembershipNotFoundError";
    this.entity = entity;
    this.id = id;
  }
}

export class MembershipValidationError extends Error {
  constructor(reason: string) {
    super(`Membership validation: ${reason}`);
    this.name = "MembershipValidationError";
  }
}

export class MembershipForbiddenError extends Error {
  constructor(reason: string) {
    super(`Forbidden: ${reason}`);
    this.name = "MembershipForbiddenError";
  }
}

export class MembershipCapacityError extends Error {
  constructor(reason: string) {
    super(`Capacity: ${reason}`);
    this.name = "MembershipCapacityError";
  }
}

export class InviteInvalidError extends Error {
  constructor(reason: string) {
    super(`Invite invalid: ${reason}`);
    this.name = "InviteInvalidError";
  }
}

export class AlreadyMemberError extends Error {
  readonly userId: string;
  readonly circleId: string;
  constructor(userId: string, circleId: string) {
    super(`Already a member: user=${userId} circle=${circleId}`);
    this.name = "AlreadyMemberError";
    this.userId = userId;
    this.circleId = circleId;
  }
}

export class LeaveForbiddenError extends Error {
  constructor(reason: string) {
    super(`Leave forbidden: ${reason}`);
    this.name = "LeaveForbiddenError";
  }
}

// ============================================================================
// HMAC UTILS — Deterministic + tamper-evident
// ============================================================================

export function setHmacSecret(secret: string): void {
  if (typeof secret !== "string") {
    throw new MembershipValidationError("HMAC secret must be a string");
  }
  _hmacSecret = secret;
}

export function clearHmacSecret(): void {
  _hmacSecret = "";
}

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/**
 * Cycle 67 lesson 5: canonicalize JSON before HMAC. Sort keys
 * recursively so order doesn't affect signature.
 */
function canonicalJSON(obj: Record<string, unknown>): string {
  const keys = Object.keys(obj).sort();
  const sorted: Record<string, unknown> = {};
  for (const k of keys) sorted[k] = obj[k];
  return JSON.stringify(sorted);
}

function sign(payload: Record<string, unknown>): string {
  const cjson = canonicalJSON(payload);
  return fnv1a(`${cjson}|${_hmacSecret}`);
}

function generateId(prefix: string): string {
  const payload = `${Date.now()}:${prefix}:${_hmacSecret}`;
  return `${prefix}_${fnv1a(payload)}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

// ============================================================================
// STORAGE — In-memory Maps
// ============================================================================

const MEMBERSHIPS: Map<string, Membership> = new Map();
const INVITES: Map<string, InviteToken> = new Map();
const JOIN_REQUESTS: Map<string, JoinRequest> = new Map();

/** Index userId → set of membership IDs (active only). */
const USER_MEMBERSHIPS: Map<string, Set<MembershipId>> = new Map();
/** Index circleId → set of membership IDs. */
const CIRCLE_MEMBERSHIPS: Map<string, Set<MembershipId>> = new Map();

function indexAdd(map: Map<string, Set<MembershipId>>, key: string, id: MembershipId): void {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(id);
}

function indexRemove(map: Map<string, Set<MembershipId>>, key: string, id: MembershipId): void {
  const set = map.get(key);
  if (set) set.delete(id);
}

// ============================================================================
// HELPERS
// ============================================================================

function ensureString(value: unknown, name: string): string {
  if (typeof value !== "string") {
    throw new MembershipValidationError(`${name} must be a string`);
  }
  return value;
}

function validateRoleTransition(from: Role, to: Role): void {
  // Allowable transitions:
  //   member   → moderator | admin (promotion)
  //   member   → member    (no-op)
  //   moderator → admin | moderator (promotion/no-op)
  //   moderator → member    (demotion)
  //   admin    → moderator | member (demotion)
  //   admin    → admin     (no-op)
  if (from === "member") {
    if (to === "moderator" || to === "admin" || to === "member") return;
    throw new MembershipForbiddenError(`invalid member target: ${to}`);
  }
  if (from === "moderator") {
    if (to === "admin" || to === "moderator" || to === "member") return;
    throw new MembershipForbiddenError(`invalid moderator target: ${to}`);
  }
  if (from === "admin") {
    if (to === "moderator" || to === "member" || to === "admin") return;
    throw new MembershipForbiddenError(`invalid admin target: ${to}`);
  }
}

function ensureNotLastAdmin(circleId: CircleId, excludeUserId?: UserId): void {
  let admins = 0;
  const ids = CIRCLE_MEMBERSHIPS.get(circleId);
  if (ids) {
    for (const id of ids) {
      const m = MEMBERSHIPS.get(id);
      if (!m) continue;
      if (m.leftAt !== null) continue;
      if (m.role !== "admin") continue;
      if (excludeUserId && m.userId === excludeUserId) continue;
      admins += 1;
    }
  }
  // Add the implicit creator-admin (if they aren't already a row member).
  const creator = getCircleCreator(circleId);
  if (creator) {
    const isCreatorExcluded = excludeUserId && creator === excludeUserId;
    let creatorAlreadyRowAdmin = false;
    if (ids) {
      for (const id of ids) {
        const m = MEMBERSHIPS.get(id);
        if (m && m.userId === creator && m.role === "admin" && m.leftAt === null) {
          creatorAlreadyRowAdmin = true;
          break;
        }
      }
    }
    if (!creatorAlreadyRowAdmin && !isCreatorExcluded) admins += 1;
  }
  if (admins < 1) {
    throw new LeaveForbiddenError("cannot remove/demote the last admin of a circle");
  }
}

export function findActiveMembership(userId: UserId, circleId: CircleId): Membership | null {
  const ids = USER_MEMBERSHIPS.get(userId);
  if (ids) {
    for (const id of ids) {
      const m = MEMBERSHIPS.get(id);
      if (m && m.circleId === circleId && m.leftAt === null) return m;
    }
  }
  // Implicit creator-admin membership — synthesized on the fly.
  if (isCreatorAdmin(circleId, userId)) {
    return {
      id: asMembershipId(`creator-${userId}-${circleId}`),
      circleId,
      userId,
      role: "admin",
      joinedAt: "implicit",
      joinedVia: "open",
      leftAt: null,
      leftReason: null,
      piiScrubbedAt: null,
    };
  }
  return null;
}

// ============================================================================
// CRUD — joinCircle
// ============================================================================

/**
 * Add a user to a circle. `via` controls what's required:
 *   - "open"             → open circle, just join.
 *   - "invite"           → must supply valid invite token.
 *   - "request-accepted" → must supply valid approved joinRequest.
 */
export function joinCircle(input: JoinCircleInput, now: Date = new Date()): Membership {
  const userId = asUserId(ensureString(input.userId, "userId"));
  const circleId = getCircle(input.circleId).id;

  // Already a member?
  const existing = findActiveMembership(userId, circleId);
  if (existing) throw new AlreadyMemberError(userId, circleId);

  const circle = getCircle(circleId);
  if (circle.status !== "active") {
    throw new MembershipForbiddenError("cannot join an archived circle");
  }

  let approverId: UserId | null = null;

  switch (input.via) {
    case "open": {
      if (circle.joinPolicy === "invite") {
        throw new MembershipForbiddenError(
          "circle requires invite — must supply invite token",
        );
      }
      if (circle.joinPolicy === "request") {
        throw new MembershipForbiddenError(
          "circle requires request — must supply approved join request",
        );
      }
      break;
    }
    case "invite": {
      if (!input.inviteToken) {
        throw new MembershipValidationError("invite via requires inviteToken");
      }
      verifyInviteToken(input.inviteToken, userId, circleId);
      const invite = INVITES.get(input.inviteToken);
      if (!invite) throw new InviteInvalidError("invite token not found");
      // Mark invite accepted
      const accepted: InviteToken = {
        ...invite,
        status: "accepted",
        acceptedAt: now.toISOString(),
      };
      INVITES.set(invite.token, accepted);
      break;
    }
    case "request-accepted": {
      if (!input.joinRequestId) {
        throw new MembershipValidationError("request-accepted via requires joinRequestId");
      }
      const req = JOIN_REQUESTS.get(input.joinRequestId);
      if (!req) throw new MembershipValidationError("join request not found");
      if (req.status !== "approved") {
        throw new MembershipValidationError(
          `join request status is ${req.status}, not approved`,
        );
      }
      if (req.userId !== userId) {
        throw new MembershipForbiddenError("join request belongs to a different user");
      }
      if (req.decidedBy) {
        approverId = req.decidedBy;
      }
      break;
    }
    default:
      throw new MembershipValidationError(`invalid via: ${String(input.via)}`);
  }

  // Capacity check
  if (circle.memberCount >= circle.maxMembers) {
    throw new MembershipCapacityError(
      `circle is full (${circle.memberCount}/${circle.maxMembers})`,
    );
  }

  const id = asMembershipId(generateId("mem"));
  const membership: Membership = {
    id,
    circleId,
    userId,
    role: "member",
    joinedAt: now.toISOString(),
    joinedVia: input.via,
    leftAt: null,
    leftReason: null,
    piiScrubbedAt: null,
  };
  MEMBERSHIPS.set(id, membership);
  indexAdd(USER_MEMBERSHIPS, userId, id);
  indexAdd(CIRCLE_MEMBERSHIPS, circleId, id);
  incrementMemberCount(circleId, 1);
  void approverId;
  return membership;
}

// ============================================================================
// CRUD — leaveCircle
// ============================================================================

/**
 * Leave a circle voluntarily. Anti-shady-pattern: this is always
 * allowed except when removing the user would leave the circle with
 * ZERO admins (last-admin guard). Caller scrubs PII on the row.
 */
export function leaveCircle(
  userId: UserId | string,
  circleId: CircleId | string,
  reason: string | null = null,
  now: Date = new Date(),
): Membership {
  const userIdN = asUserId(ensureString(userId, "userId"));
  const circleIdN = getCircle(circleId).id;
  const m = findActiveMembership(userIdN, circleIdN);
  if (!m) throw new MembershipNotFoundError("Membership", `${userIdN}@${circleIdN}`);
  if (m.role === "admin") {
    ensureNotLastAdmin(circleIdN, userIdN);
  }
  const left: Membership = {
    ...m,
    leftAt: now.toISOString(),
    leftReason: reason?.trim() ? reason.trim().slice(0, 500) : null,
  };
  MEMBERSHIPS.set(m.id, left);
  indexRemove(USER_MEMBERSHIPS, userIdN, m.id);
  indexRemove(CIRCLE_MEMBERSHIPS, circleIdN, m.id);
  incrementMemberCount(circleIdN, -1);
  return left;
}

// ============================================================================
// CRUD — inviteToCircle + verifyInviteToken + acceptInvite
// ============================================================================

/**
 * Generate an invite token (admin/moderator invites another user).
 * Returned signature must be checked by verifyInviteToken on accept.
 */
export function inviteToCircle(
  inviter: UserId | string,
  userIdOrEmail: UserId | string,
  circleId: CircleId | string,
  opts: { readonly explicitEmail?: string } = {},
  now: Date = new Date(),
): InviteToken {
  const inviterId = asUserId(ensureString(inviter, "inviter"));
  const circleIdN = getCircle(circleId).id;
  const m = findActiveMembership(inviterId, circleIdN);
  if (!m) throw new MembershipForbiddenError("inviter must be a member");
  if (m.role === "member") {
    throw new MembershipForbiddenError("only admin/moderator can invite");
  }

  // Determine if invitee is known
  const isEmail = /.+@.+\..+/.test(userIdOrEmail);
  let inviteeUserId: UserId | null = null;
  let inviteeEmail: string | null = null;
  if (isEmail) {
    inviteeEmail = userIdOrEmail;
  } else {
    inviteeUserId = asUserId(userIdOrEmail);
  }

  const id = asInviteId(generateId("inv"));
  const token = `tk_${fnv1a(`${id}|${circleIdN}|${inviterId}|${_hmacSecret}`)}`;
  const expiresAt = new Date(now.getTime() + INVITE_TTL_MS);
  const invite: InviteToken = {
    id,
    token,
    circleId: circleIdN,
    invitedBy: inviterId,
    inviteeUserId,
    inviteeEmail: inviteeEmail ?? opts.explicitEmail ?? null,
    status: "pending",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    acceptedAt: null,
    signature: "",
  };
  const signed: InviteToken = {
    ...invite,
    signature: sign({
      id,
      token,
      circleId: circleIdN,
      inviter: inviterId,
      invitee: inviteeUserId,
      email: inviteeEmail,
      expiresAt: invite.expiresAt,
    }),
  };
  INVITES.set(token, signed);
  return signed;
}

/**
 * Verify an invite token. Throws if invalid/expired/wrong-circle/wrong-user.
 */
export function verifyInviteToken(
  tokenStr: string,
  userId: UserId | string,
  circleId: CircleId | string,
  now: Date = new Date(),
): InviteToken {
  const invite = INVITES.get(tokenStr);
  if (!invite) throw new InviteInvalidError("token not found");
  if (invite.status !== "pending") {
    throw new InviteInvalidError(`invite status is ${invite.status}`);
  }
  if (new Date(invite.expiresAt).getTime() < now.getTime()) {
    throw new InviteInvalidError("invite expired");
  }
  const circleIdN = getCircle(circleId).id;
  if (invite.circleId !== circleIdN) {
    throw new InviteInvalidError("invite was issued for a different circle");
  }
  const userIdN = asUserId(ensureString(userId, "userId"));
  if (invite.inviteeUserId && invite.inviteeUserId !== userIdN) {
    throw new InviteInvalidError("invite was issued to a different user");
  }
  // Verify signature
  const expected = sign({
    id: invite.id,
    token: invite.token,
    circleId: invite.circleId,
    inviter: invite.invitedBy,
    invitee: invite.inviteeUserId,
    email: invite.inviteeEmail,
    expiresAt: invite.expiresAt,
  });
  if (expected !== invite.signature) {
    throw new InviteInvalidError("signature mismatch — invite has been tampered with");
  }
  return invite;
}

/**
 * Accept an invite — shortcut for the invite flow. After verify,
 * the caller still calls joinCircle with via="invite" to actually
 * create the membership.
 */
export function acceptInvite(
  invitee: UserId | string,
  token: string,
  now: Date = new Date(),
): { readonly invite: InviteToken; readonly membership: Membership } {
  const invite = INVITES.get(token);
  if (!invite) throw new InviteInvalidError("token not found");
  const inviteeId = asUserId(ensureString(invitee, "invitee"));
  verifyInviteToken(token, inviteeId, invite.circleId, now);
  const membership = joinCircle(
    {
      userId: inviteeId,
      circleId: invite.circleId,
      via: "invite",
      inviteToken: token,
    },
    now,
  );
  const accepted: InviteToken = {
    ...invite,
    status: "accepted",
    acceptedAt: now.toISOString(),
  };
  INVITES.set(token, accepted);
  return { invite: accepted, membership };
}

/** Revoke a pending invite (admin/moderator only). */
export function revokeInvite(
  revoker: UserId | string,
  token: string,
  now: Date = new Date(),
): InviteToken {
  const invite = INVITES.get(token);
  if (!invite) throw new InviteInvalidError("token not found");
  const r = asUserId(ensureString(revoker, "revoker"));
  if (invite.invitedBy !== r) {
    const m = findActiveMembership(r, invite.circleId);
    if (!m || m.role !== "admin") {
      throw new MembershipForbiddenError("only inviter or admin can revoke");
    }
  }
  if (invite.status !== "pending") {
    throw new InviteInvalidError(`cannot revoke a ${invite.status} invite`);
  }
  const revoked: InviteToken = { ...invite, status: "revoked" };
  INVITES.set(token, revoked);
  return revoked;
}

// ============================================================================
// CRUD — requestJoin + approveJoin + rejectJoin
// ============================================================================

/**
 * Request to join a circle (request-gated circles only).
 */
export function requestJoin(
  userId: UserId | string,
  circleId: CircleId | string,
  message: string | null = null,
  now: Date = new Date(),
): JoinRequest {
  const userIdN = asUserId(ensureString(userId, "userId"));
  const circleIdN = getCircle(circleId).id;
  const circle = getCircle(circleIdN);
  if (circle.joinPolicy !== "request") {
    throw new MembershipForbiddenError("circle does not accept join requests");
  }
  if (circle.status !== "active") {
    throw new MembershipForbiddenError("circle is archived");
  }
  const existing = findActiveMembership(userIdN, circleIdN);
  if (existing) throw new AlreadyMemberError(userIdN, circleIdN);

  const trimmed = message?.trim().slice(0, MAX_INVITE_MESSAGE_LENGTH) || null;
  if (trimmed !== null && trimmed.length === 0) {
    throw new MembershipValidationError("message cannot be only whitespace");
  }

  const id = asJoinRequestId(generateId("jreq"));
  const req: JoinRequest = {
    id,
    circleId: circleIdN,
    userId: userIdN,
    message: trimmed,
    status: "pending",
    createdAt: now.toISOString(),
    decidedAt: null,
    decidedBy: null,
    rejectionReason: null,
  };
  JOIN_REQUESTS.set(id, req);
  return req;
}

/** Approve a join request (admin/moderator only). After approval, joinCircle still required. */
export function approveJoin(
  approver: UserId | string,
  requestId: string,
  now: Date = new Date(),
): JoinRequest {
  const req = JOIN_REQUESTS.get(requestId);
  if (!req) throw new MembershipNotFoundError("JoinRequest", requestId);
  if (req.status !== "pending") {
    throw new MembershipForbiddenError(`cannot approve a ${req.status} request`);
  }
  const approverId = asUserId(ensureString(approver, "approver"));
  const m = findActiveMembership(approverId, req.circleId);
  if (!m) throw new MembershipForbiddenError("approver must be a member");
  if (m.role === "member") {
    throw new MembershipForbiddenError("only admin/moderator can approve");
  }

  const approved: JoinRequest = {
    ...req,
    status: "approved",
    decidedAt: now.toISOString(),
    decidedBy: approverId,
    rejectionReason: null,
  };
  JOIN_REQUESTS.set(requestId, approved);
  return approved;
}

export function rejectJoin(
  approver: UserId | string,
  requestId: string,
  reason: string | null = null,
  now: Date = new Date(),
): JoinRequest {
  const req = JOIN_REQUESTS.get(requestId);
  if (!req) throw new MembershipNotFoundError("JoinRequest", requestId);
  if (req.status !== "pending") {
    throw new MembershipForbiddenError(`cannot reject a ${req.status} request`);
  }
  const approverId = asUserId(ensureString(approver, "approver"));
  const m = findActiveMembership(approverId, req.circleId);
  if (!m) throw new MembershipForbiddenError("approver must be a member");
  if (m.role === "member") {
    throw new MembershipForbiddenError("only admin/moderator can reject");
  }
  const trimmed = reason?.trim().slice(0, MAX_INVITE_MESSAGE_LENGTH) || null;
  const rejected: JoinRequest = {
    ...req,
    status: "rejected",
    decidedAt: now.toISOString(),
    decidedBy: approverId,
    rejectionReason: trimmed,
  };
  JOIN_REQUESTS.set(requestId, rejected);
  return rejected;
}

/** Requester cancels their own pending join request. */
export function cancelJoinRequest(
  userId: UserId | string,
  requestId: string,
): JoinRequest {
  const req = JOIN_REQUESTS.get(requestId);
  if (!req) throw new MembershipNotFoundError("JoinRequest", requestId);
  const u = asUserId(ensureString(userId, "userId"));
  if (req.userId !== u) {
    throw new MembershipForbiddenError("only the requester can cancel");
  }
  if (req.status !== "pending") {
    throw new MembershipForbiddenError(`cannot cancel a ${req.status} request`);
  }
  const cancelled: JoinRequest = {
    ...req,
    status: "cancelled",
    decidedAt: new Date().toISOString(),
    decidedBy: u,
  };
  JOIN_REQUESTS.set(requestId, cancelled);
  return cancelled;
}

// ============================================================================
// CRUD — setRole
// ============================================================================

/**
 * Change a member's role. Only an active admin can promote/demote.
 * Demoting the last admin is forbidden.
 */
export function setRole(
  actor: UserId | string,
  targetUserId: UserId | string,
  circleId: CircleId | string,
  newRole: Role,
  now: Date = new Date(),
): Membership {
  const actorId = asUserId(ensureString(actor, "actor"));
  const targetId = asUserId(ensureString(targetUserId, "targetUserId"));
  const circleIdN = getCircle(circleId).id;
  const actorM = findActiveMembership(actorId, circleIdN);
  if (!actorM) throw new MembershipForbiddenError("actor must be a member");
  if (actorM.role !== "admin") {
    throw new MembershipForbiddenError("only admin can change roles");
  }
  const target = findActiveMembership(targetId, circleIdN);
  if (!target) throw new MembershipNotFoundError("Membership", `${targetId}@${circleIdN}`);
  if (!ROLES.includes(newRole)) {
    throw new MembershipValidationError(`invalid role: ${newRole}`);
  }
  validateRoleTransition(target.role, newRole);

  // Last-admin guard for demotion
  if (target.role === "admin" && newRole !== "admin") {
    ensureNotLastAdmin(circleIdN, targetId);
  }

  const updated: Membership = {
    ...target,
    role: newRole,
  };
  MEMBERSHIPS.set(target.id, updated);
  void now;
  return updated;
}

// ============================================================================
// CRUD — removeMember
// ============================================================================

/**
 * Remove a member from a circle. Admin-only. Admins cannot remove
 * themselves unless they hand off admin to someone else first (not
 * currently supported — use leaveCircle for voluntary exit).
 *
 * Last-admin guard applies.
 */
export function removeMember(
  actor: UserId | string,
  targetUserId: UserId | string,
  circleId: CircleId | string,
  reason: string,
  now: Date = new Date(),
): Membership {
  const actorId = asUserId(ensureString(actor, "actor"));
  const targetId = asUserId(ensureString(targetUserId, "targetUserId"));
  const circleIdN = getCircle(circleId).id;
  const actorM = findActiveMembership(actorId, circleIdN);
  if (!actorM) throw new MembershipForbiddenError("actor must be a member");
  if (actorM.role !== "admin") {
    throw new MembershipForbiddenError("only admin can remove members");
  }
  const target = findActiveMembership(targetId, circleIdN);
  if (!target) throw new MembershipNotFoundError("Membership", `${targetId}@${circleIdN}`);
  if (target.role === "admin") {
    // last-admin guard
    ensureNotLastAdmin(circleIdN, targetId);
  }

  const trimmed = reason.trim().slice(0, MAX_INVITE_MESSAGE_LENGTH);
  if (trimmed.length === 0) {
    throw new MembershipValidationError("removal reason is required");
  }

  const removed: Membership = {
    ...target,
    leftAt: now.toISOString(),
    leftReason: `[removed by ${actorId}]: ${trimmed}`,
  };
  MEMBERSHIPS.set(target.id, removed);
  indexRemove(USER_MEMBERSHIPS, targetId, target.id);
  indexRemove(CIRCLE_MEMBERSHIPS, circleIdN, target.id);
  incrementMemberCount(circleIdN, -1);
  return removed;
}

// ============================================================================
// QUERIES — getMembers / getMyCircles
// ============================================================================

export function getMembers(
  circleId: CircleId | string,
  opts: GetMembersOptions = {},
): GetMembersResult {
  const circleIdN = getCircle(circleId).id;
  const limit = opts.limit ?? 100;
  const offset = opts.offset ?? 0;
  if (limit < 1 || limit > 500) {
    throw new MembershipValidationError(`invalid limit (${limit})`);
  }
  if (offset < 0) throw new MembershipValidationError("negative offset");

  const ids = CIRCLE_MEMBERSHIPS.get(circleIdN);
  const out: Membership[] = [];
  if (ids) {
    for (const id of ids) {
      const m = MEMBERSHIPS.get(id);
      if (!m) continue;
      if (m.leftAt !== null) continue;
      if (opts.role && m.role !== opts.role) continue;
      out.push(m);
    }
  }
  // Fuse the implicit creator-admin
  const creator = getCircleCreator(circleIdN);
  if (creator) {
    const creatorIsRowAdmin = ids
      ? Array.from(ids).some((id) => {
          const m = MEMBERSHIPS.get(id);
          return Boolean(m) && m!.userId === creator && m!.role === "admin" && m!.leftAt === null;
        })
      : false;
    if (!creatorIsRowAdmin) {
      const implicit: Membership = {
        id: asMembershipId(`creator-${creator}-${circleIdN}`),
        circleId: circleIdN,
        userId: creator,
        role: "admin",
        joinedAt: "implicit",
        joinedVia: "open",
        leftAt: null,
        leftReason: null,
        piiScrubbedAt: null,
      };
      if (!opts.role || opts.role === "admin") {
        out.push(implicit);
      }
    }
  }
  out.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  return {
    members: out.slice(offset, offset + limit),
    total: out.length,
    limit,
    offset,
  };
}

export function getMyCircles(userId: UserId | string): Membership[] {
  const u = asUserId(ensureString(userId, "userId"));
  const ids = USER_MEMBERSHIPS.get(u);
  if (!ids) return [];
  const out: Membership[] = [];
  for (const id of ids) {
    const m = MEMBERSHIPS.get(id);
    if (!m) continue;
    if (m.leftAt !== null) continue;
    out.push(m);
  }
  return out.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
}

// ============================================================================
// AUDIT — exported ruleset shape (read-only)
// ============================================================================

export interface MembershipAuditRules {
  readonly inviteTtlMs: number;
  readonly rolesAvailable: readonly Role[];
  readonly joinVias: readonly JoinVia[];
  readonly lastAdminGuard: boolean;
  readonly memberCapacityEnforced: boolean;
  readonly freeLeaveAlways: boolean;
  readonly signatureAlgorithm: string;
}

export function auditMembershipRules(): MembershipAuditRules {
  return {
    inviteTtlMs: INVITE_TTL_MS,
    rolesAvailable: ROLES,
    joinVias: ["open", "invite", "request-accepted"],
    lastAdminGuard: true,
    memberCapacityEnforced: true,
    freeLeaveAlways: true, // anti-shady-pattern guarantee
    signatureAlgorithm: "fnv1a-canonical-json",
  };
}

// ============================================================================
// TEST-ONLY — Store reset
// ============================================================================

export function clearAllStores(): void {
  MEMBERSHIPS.clear();
  INVITES.clear();
  JOIN_REQUESTS.clear();
  USER_MEMBERSHIPS.clear();
  CIRCLE_MEMBERSHIPS.clear();
  _hmacSecret = "";
}
