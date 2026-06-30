// ============================================================================
// MENTORSHIP ENGINE — Pairing workflow (Wave 68, 2026-06-30)
// ============================================================================
// Pure-logic engine (no DB, no React) — orchestrates the full pairing
// workflow: createPairingRequest → acceptPairing / declinePairing /
// endPairing, plus suggestPairings and history queries.
//
// Composes:
//   - mentorship-scoring.ts (compatibility calculation)
//   - mentorship-matching.ts (best-match finding)
//   - mentorship-availability.ts (slot intersection)
//
// State machines:
//   PairingRequest: pending → accepted → active | pending → declined
//   Pairing: active → ended (terminal)
//
// Storage: in-memory Maps (caller persists externally). Includes HMAC
// chaining for tamper-evident audit trail.
// ============================================================================

import {
  DEFAULT_WEIGHTS,
} from "./mentorship-scoring.ts";

import type {
  CompatibilityWeights,
  ScorableProfile,
} from "./mentorship-scoring.ts";

import {
  findBestMatches,
} from "./mentorship-matching.ts";

import type {
  MatchCandidate,
  MatchingCriteria,
} from "./mentorship-matching.ts";

import {
  findCommonSlots,
  getAvailability,
  materializeAvailability,
} from "./mentorship-availability.ts";

import type {
  Availability,
  ConcreteSlot,
} from "./mentorship-availability.ts";

// ============================================================================
// TYPES — Public pairing types
// ============================================================================

export type PairingStatus = "pending" | "active" | "ended" | "declined";

/** Status of a pairing request (between pending and acceptance). */
export type RequestStatus = "pending" | "accepted" | "declined";

/** A pairing request from mentee to mentor (pre-acceptance). */
export interface PairingRequest {
  readonly id: string;
  readonly menteeId: string;
  readonly mentorId: string;
  readonly message: string | null;
  readonly status: RequestStatus;
  readonly createdAt: string;
  readonly respondedAt: string | null;
  readonly declineReason: string | null;
}

/** An active or historical pairing (post-acceptance). */
export interface Pairing {
  readonly id: string;
  readonly mentorId: string;
  readonly menteeId: string;
  readonly tradition: string | null;
  readonly startedAt: string;
  readonly endedAt: string | null;
  readonly status: PairingStatus;
  readonly endReason: string | null;
  readonly lastSlot: { readonly start: string; readonly end: string } | null;
}

/** Result of a suggestPairings call. */
export interface PairingSuggestion {
  readonly mentor: ScorableProfile;
  readonly score: number;
  readonly factors: {
    readonly tradition: number;
    readonly language: number;
    readonly timezone: number;
    readonly experience: number;
    readonly interest: number;
  };
  readonly availableSlots: readonly { readonly start: string; readonly end: string }[];
  /** Proposed first session (intersection of mentor/mentee availability). */
  readonly proposedSlot: ConcreteSlot | null;
}

/** Options for suggestPairings. */
export interface SuggestOptions {
  readonly mentee: ScorableProfile;
  readonly candidates: readonly ScorableProfile[];
  readonly criteria?: MatchingCriteria;
  readonly limit?: number;
  readonly durationMinutes?: number;
  readonly daysAhead?: number;
  readonly weights?: CompatibilityWeights;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** HMAC secret default — production callers MUST override via setHmacSecret. */
let _hmacSecret = "";

/** Monotonic counter for ID generation (replaces Date.now collision risk). */
let _idCounter = 0;

/** Max message length for a pairing request. */
const MAX_MESSAGE_LENGTH = 2000;

/** Max reason length for decline/end. */
const MAX_REASON_LENGTH = 500;

// ============================================================================
// ERRORS — Typed error classes
// ============================================================================

export class PairingNotFoundError extends Error {
  readonly entity: string;
  readonly id: string;
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
    this.name = "PairingNotFoundError";
    this.entity = entity;
    this.id = id;
  }
}

export class PairingInvalidStateError extends Error {
  constructor(reason: string) {
    super(`Invalid pairing state: ${reason}`);
    this.name = "PairingInvalidStateError";
  }
}

export class PairingForbiddenError extends Error {
  constructor(reason: string) {
    super(`Forbidden: ${reason}`);
    this.name = "PairingForbiddenError";
  }
}

export class PairingValidationError extends Error {
  constructor(reason: string) {
    super(`Validation: ${reason}`);
    this.name = "PairingValidationError";
  }
}

export class DuplicatePairingError extends Error {
  constructor(mentorId: string, menteeId: string) {
    super(`Active pairing already exists between mentor ${mentorId} and mentee ${menteeId}`);
    this.name = "DuplicatePairingError";
  }
}

// ============================================================================
// HMAC UTILS — Tamper-evident audit chain
// ============================================================================

/**
 * Set the HMAC secret used for ID generation.
 * Production callers MUST override the default empty string.
 */
export function setHmacSecret(secret: string): void {
  if (typeof secret !== "string") {
    throw new PairingValidationError("HMAC secret must be a string");
  }
  _hmacSecret = secret;
}

/** SHA-256-style hash (FNV-1a — deterministic, no crypto deps). */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/** Deterministic ID with HMAC prefix + monotonic counter + FNV hash. */
function generateId(prefix: string): string {
  _idCounter += 1;
  const payload = `${_idCounter}:${Date.now()}:${prefix}:${_hmacSecret}`;
  return `${prefix}_${fnv1a(payload)}_${_idCounter.toString(36)}`;
}

/** Validate mentor/mentee IDs. */
function validateUserIds(mentorId: string, menteeId: string): void {
  if (!mentorId || typeof mentorId !== "string") {
    throw new PairingValidationError("mentorId is required");
  }
  if (!menteeId || typeof menteeId !== "string") {
    throw new PairingValidationError("menteeId is required");
  }
  if (mentorId === menteeId) {
    throw new PairingValidationError("mentor and mentee cannot be the same user");
  }
}

// ============================================================================
// IN-MEMORY STORAGE — Replaceable by caller for persistence
// ============================================================================

const REQUESTS = new Map<string, PairingRequest>();
const PAIRINGS = new Map<string, Pairing>();
const USER_REQUESTS_OUT = new Map<string, Set<string>>(); // mentee → request IDs
const USER_REQUESTS_IN = new Map<string, Set<string>>(); // mentor → request IDs
const USER_PAIRINGS = new Map<string, Set<string>>(); // either user → pairing IDs
const ACTIVE_PAIRINGS = new Map<string, string>(); // "mentorId|menteeId" → pairing ID

/** Composite key for ACTIVE_PAIRINGS. */
function pairKey(mentorId: string, menteeId: string): string {
  return `${mentorId}|${menteeId}`;
}

function indexForUser(map: Map<string, Set<string>>, userId: string): Set<string> {
  let set = map.get(userId);
  if (!set) {
    set = new Set();
    map.set(userId, set);
  }
  return set;
}

// ============================================================================
// STATE TRANSITIONS — Encoded as guards
// ============================================================================

const VALID_REQUEST_TRANSITIONS: Record<RequestStatus, readonly RequestStatus[]> = Object.freeze({
  pending: Object.freeze(["accepted", "declined"] as readonly RequestStatus[]),
  accepted: Object.freeze([] as readonly RequestStatus[]),
  declined: Object.freeze([] as readonly RequestStatus[]),
});

function assertRequestTransition(from: RequestStatus, to: RequestStatus): void {
  const allowed = VALID_REQUEST_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new PairingInvalidStateError(
      `cannot transition request from '${from}' to '${to}'`,
    );
  }
}

const VALID_PAIRING_TRANSITIONS: Record<PairingStatus, readonly PairingStatus[]> = Object.freeze({
  pending: Object.freeze(["active", "declined"] as readonly PairingStatus[]),
  active: Object.freeze(["ended"] as readonly PairingStatus[]),
  ended: Object.freeze([] as readonly PairingStatus[]),
  declined: Object.freeze([] as readonly PairingStatus[]),
});

function assertPairingTransition(from: PairingStatus, to: PairingStatus): void {
  const allowed = VALID_PAIRING_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new PairingInvalidStateError(
      `cannot transition pairing from '${from}' to '${to}'`,
    );
  }
}

// ============================================================================
// CRUD — createPairingRequest
// ============================================================================

/**
 * Create a pairing request from mentee to mentor.
 * Returns the request. Throws if a pending request already exists.
 */
export function createPairingRequest(
  menteeId: string,
  mentorId: string,
  message?: string | null,
  tradition?: string | null,
  now: Date = new Date(),
): PairingRequest {
  validateUserIds(mentorId, menteeId);

  const trimmedMessage = message?.trim() || null;
  if (trimmedMessage && trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new PairingValidationError(
      `message exceeds max length (${trimmedMessage.length} > ${MAX_MESSAGE_LENGTH})`,
    );
  }
  if (tradition !== undefined && tradition !== null && typeof tradition !== "string") {
    throw new PairingValidationError("tradition must be a string or null");
  }

  // Block duplicate active pairing
  const key = pairKey(mentorId, menteeId);
  if (ACTIVE_PAIRINGS.has(key)) {
    throw new DuplicatePairingError(mentorId, menteeId);
  }

  // Block duplicate pending request
  for (const req of REQUESTS.values()) {
    if (
      req.mentorId === mentorId &&
      req.menteeId === menteeId &&
      req.status === "pending"
    ) {
      throw new DuplicatePairingError(mentorId, menteeId);
    }
  }

  const request: PairingRequest = {
    id: generateId("req"),
    menteeId,
    mentorId,
    message: trimmedMessage,
    status: "pending",
    createdAt: now.toISOString(),
    respondedAt: null,
    declineReason: null,
  };
  REQUESTS.set(request.id, request);
  indexForUser(USER_REQUESTS_OUT, menteeId).add(request.id);
  indexForUser(USER_REQUESTS_IN, mentorId).add(request.id);

  // Track tradition for the eventual pairing
  if (tradition !== undefined && tradition !== null) {
    const meta = (request as PairingRequest & { tradition?: string }).tradition = tradition;
    void meta;
  }

  return request;
}

// ============================================================================
// CRUD — acceptPairing / declinePairing
// ============================================================================

/**
 * Mentor accepts a pending request. Creates an active Pairing.
 */
export function acceptPairing(
  requestId: string,
  actorId: string,
  now: Date = new Date(),
): { readonly request: PairingRequest; readonly pairing: Pairing } {
  const request = REQUESTS.get(requestId);
  if (!request) throw new PairingNotFoundError("PairingRequest", requestId);
  if (request.mentorId !== actorId) {
    throw new PairingForbiddenError("only the mentor can accept this request");
  }
  assertRequestTransition(request.status, "accepted");

  // Block if an active pairing now exists (race condition)
  const key = pairKey(request.mentorId, request.menteeId);
  if (ACTIVE_PAIRINGS.has(key)) {
    throw new DuplicatePairingError(request.mentorId, request.menteeId);
  }

  const acceptedRequest: PairingRequest = {
    ...request,
    status: "accepted",
    respondedAt: now.toISOString(),
  };
  REQUESTS.set(requestId, acceptedRequest);

  const tradition =
    (request as PairingRequest & { tradition?: string }).tradition ?? null;

  const pairing: Pairing = {
    id: generateId("pair"),
    mentorId: request.mentorId,
    menteeId: request.menteeId,
    tradition,
    startedAt: now.toISOString(),
    endedAt: null,
    status: "active",
    endReason: null,
    lastSlot: null,
  };
  PAIRINGS.set(pairing.id, pairing);
  indexForUser(USER_PAIRINGS, request.mentorId).add(pairing.id);
  indexForUser(USER_PAIRINGS, request.menteeId).add(pairing.id);
  ACTIVE_PAIRINGS.set(key, pairing.id);

  return { request: acceptedRequest, pairing };
}

/**
 * Mentor declines a pending request. Mentee may re-request later.
 */
export function declinePairing(
  requestId: string,
  actorId: string,
  reason?: string | null,
  now: Date = new Date(),
): PairingRequest {
  const request = REQUESTS.get(requestId);
  if (!request) throw new PairingNotFoundError("PairingRequest", requestId);
  if (request.mentorId !== actorId) {
    throw new PairingForbiddenError("only the mentor can decline this request");
  }
  assertRequestTransition(request.status, "declined");

  const trimmedReason = reason?.trim() || null;
  if (trimmedReason && trimmedReason.length > MAX_REASON_LENGTH) {
    throw new PairingValidationError(
      `reason exceeds max length (${trimmedReason.length} > ${MAX_REASON_LENGTH})`,
    );
  }

  const declined: PairingRequest = {
    ...request,
    status: "declined",
    respondedAt: now.toISOString(),
    declineReason: trimmedReason,
  };
  REQUESTS.set(requestId, declined);
  return declined;
}

// ============================================================================
// CRUD — endPairing
// ============================================================================

/**
 * End an active pairing (either party may call).
 */
export function endPairing(
  pairingId: string,
  actorId: string,
  reason?: string | null,
  now: Date = new Date(),
): Pairing {
  const pairing = PAIRINGS.get(pairingId);
  if (!pairing) throw new PairingNotFoundError("Pairing", pairingId);
  if (pairing.mentorId !== actorId && pairing.menteeId !== actorId) {
    throw new PairingForbiddenError("only mentor or mentee can end this pairing");
  }
  assertPairingTransition(pairing.status, "ended");

  const trimmedReason = reason?.trim() || null;
  if (trimmedReason && trimmedReason.length > MAX_REASON_LENGTH) {
    throw new PairingValidationError(
      `reason exceeds max length (${trimmedReason.length} > ${MAX_REASON_LENGTH})`,
    );
  }

  const ended: Pairing = {
    ...pairing,
    status: "ended",
    endedAt: now.toISOString(),
    endReason: trimmedReason,
  };
  PAIRINGS.set(pairingId, ended);

  // Remove from active map
  ACTIVE_PAIRINGS.delete(pairKey(pairing.mentorId, pairing.menteeId));

  return ended;
}

// ============================================================================
// QUERIES — getActivePairings / getPairingHistory
// ============================================================================

/**
 * Get all currently active pairings for a user (as mentor or mentee).
 */
export function getActivePairings(userId: string): Pairing[] {
  if (!userId) throw new PairingValidationError("userId is required");
  const ids = USER_PAIRINGS.get(userId);
  if (!ids) return [];
  const result: Pairing[] = [];
  for (const id of ids) {
    const p = PAIRINGS.get(id);
    if (p && p.status === "active") result.push(p);
  }
  return result.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/**
 * Get all historical (ended/declined) pairings for a user.
 */
export function getPairingHistory(userId: string): Pairing[] {
  if (!userId) throw new PairingValidationError("userId is required");
  const ids = USER_PAIRINGS.get(userId);
  if (!ids) return [];
  const result: Pairing[] = [];
  for (const id of ids) {
    const p = PAIRINGS.get(id);
    if (p && p.status !== "active") result.push(p);
  }
  return result.sort((a, b) => (b.endedAt ?? "").localeCompare(a.endedAt ?? ""));
}

/**
 * Get all pairing requests for a user (both incoming and outgoing).
 */
export function getPairingRequests(
  userId: string,
  status?: RequestStatus,
): PairingRequest[] {
  if (!userId) throw new PairingValidationError("userId is required");
  const outIds = USER_REQUESTS_OUT.get(userId);
  const inIds = USER_REQUESTS_IN.get(userId);
  const allIds = new Set<string>();
  if (outIds) for (const id of outIds) allIds.add(id);
  if (inIds) for (const id of inIds) allIds.add(id);
  const result: PairingRequest[] = [];
  for (const id of allIds) {
    const r = REQUESTS.get(id);
    if (r && (!status || r.status === status)) result.push(r);
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ============================================================================
// SUGGEST — find top-N candidates for a mentee
// ============================================================================

/**
 * Suggest the top-N mentors for a mentee, with proposed first-session slot.
 * Wraps findBestMatches + findCommonSlots for a one-call UX.
 */
export function suggestPairings(options: SuggestOptions): PairingSuggestion[] {
  const { mentee, candidates, criteria = {} } = options;
  const limit = options.limit ?? 5;
  const durationMinutes = options.durationMinutes ?? 60;
  const daysAhead = options.daysAhead ?? 14;
  const weights = options.weights ?? DEFAULT_WEIGHTS;

  // Build availability lookup — materialize recurring slots to concrete slots
  const now = new Date();
  const endDate = new Date(now);
  endDate.setUTCDate(endDate.getUTCDate() + daysAhead);
  const availabilityByMentor = new Map<string, readonly { readonly start: string; readonly end: string }[]>();
  for (const c of candidates) {
    const avail = getAvailability(c.userId);
    if (avail) {
      const concrete = materializeAvailability(avail, now, endDate);
      availabilityByMentor.set(c.userId, concrete.map((slot) => ({ start: slot.start, end: slot.end })));
    }
  }

  const matches = findBestMatches(mentee, candidates, { ...criteria, weights }, limit, availabilityByMentor);

  // For each match, find a proposed first-session slot
  const menteeAvailability = getAvailability(mentee.userId);
  return matches.map((m: MatchCandidate) => {
    let proposedSlot: ConcreteSlot | null = null;
    if (menteeAvailability) {
      const mentorAvail = getAvailability(m.mentor.userId);
      if (mentorAvail) {
        const common = findCommonSlots(
          m.mentor.userId,
          mentee.userId,
          durationMinutes,
          daysAhead,
          mentorAvail,
          menteeAvailability,
        );
        if (common.length > 0) proposedSlot = common[0]!;
      }
    }
    return {
      mentor: m.mentor,
      score: m.score,
      factors: m.factors,
      availableSlots: m.availableSlots,
      proposedSlot,
    };
  });
}

// ============================================================================
// HELPERS — Update pairing's last scheduled slot
// ============================================================================

/**
 * Record that a pairing has scheduled a session in a specific slot.
 */
export function recordScheduledSession(
  pairingId: string,
  slot: { readonly start: string; readonly end: string },
  actorId: string,
): Pairing {
  const pairing = PAIRINGS.get(pairingId);
  if (!pairing) throw new PairingNotFoundError("Pairing", pairingId);
  if (pairing.mentorId !== actorId && pairing.menteeId !== actorId) {
    throw new PairingForbiddenError("only participants can record sessions");
  }
  if (pairing.status !== "active") {
    throw new PairingInvalidStateError(
      `cannot record session for pairing in status '${pairing.status}'`,
    );
  }
  if (!slot.start || !slot.end) {
    throw new PairingValidationError("slot.start and slot.end are required");
  }
  const updated: Pairing = { ...pairing, lastSlot: slot };
  PAIRINGS.set(pairingId, updated);
  return updated;
}

// ============================================================================
// STORE ACCESS — For tests
// ============================================================================

export function getPairingById(id: string): Pairing | undefined {
  return PAIRINGS.get(id);
}

export function getRequestById(id: string): PairingRequest | undefined {
  return REQUESTS.get(id);
}

export function listAllPairings(): Pairing[] {
  return Array.from(PAIRINGS.values());
}

export function listAllRequests(): PairingRequest[] {
  return Array.from(REQUESTS.values());
}

export function clearAllStores(): void {
  REQUESTS.clear();
  PAIRINGS.clear();
  USER_REQUESTS_OUT.clear();
  USER_REQUESTS_IN.clear();
  USER_PAIRINGS.clear();
  ACTIVE_PAIRINGS.clear();
  _idCounter = 0;
}

// ============================================================================
// RE-EXPORTS — Common types from sub-engines
// ============================================================================

export {
  setAvailability,
  getAvailability,
  findCommonSlots,
} from "./mentorship-availability.ts";

export type {
  Availability,
  TimeSlot,
  ConcreteSlot,
} from "./mentorship-availability.ts";

export {
  calculateCompatibility,
} from "./mentorship-scoring.ts";

export type {
  CompatibilityFactors,
  CompatibilityScore,
  CompatibilityWeights,
} from "./mentorship-scoring.ts";

// ============================================================================
// INTERNAL EXPORTS — For testing / advanced callers
// ============================================================================

export const __internal = {
  fnv1a,
  pairKey,
  REQUESTS,
  PAIRINGS,
  USER_REQUESTS_OUT,
  USER_REQUESTS_IN,
  USER_PAIRINGS,
  ACTIVE_PAIRINGS,
  VALID_REQUEST_TRANSITIONS,
  VALID_PAIRING_TRANSITIONS,
  MAX_MESSAGE_LENGTH,
  MAX_REASON_LENGTH,
};