/**
 * ════════════════════════════════════════════════════════════════════════════
 * W76-B — REPUTATION UNIVERSALIST ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 76 · 2026-06-30
 * Author: W76-B Coder (Mavis orchestrator session 414698242793714)
 *
 * Multi-domain, time-weighted reputation system that respects ALL 7 traditions
 * WITHOUT ranking one above another. The hard constraint is UNIVERSALISM:
 *
 *   1. Each domain has its OWN leaderboard. There is NEVER a global "top user"
 *      ranking — the API surface does not expose one.
 *   2. Tradition is a TAG on events, not a score dimension. You cannot
 *      "score higher because your tradition is rarer."
 *   3. Users can opt-out of any domain leaderboard (privacy).
 *   4. In the ritual-knowledge domain, a tradition-elder can request removal
 *      of a contributor who violates tradition ethics — requires 2 elders from
 *      the same tradition and is AUDITED, never silent.
 *
 * Public API (cycle 76 contract):
 *   awardReputation(event)                  — apply event with all anti-gaming
 *   getReputation(userId, domain)           — current score for one domain
 *   listTopContributors(tradition, domain)  — domain-scoped leaderboard
 *   requestRemoval(target, tradition, ... ) — tradition-elder veto
 *   listElders(tradition)                   — elder-pool registry (audited)
 *   exportAudit()                           — flat audit log (frozen)
 *   _resetForTests()                        — clear all state
 */

export type UserId = string & { readonly __brand: 'UserId' };
export type EventId = string & { readonly __brand: 'EventId' };
export type RemovalRequestId = string & { readonly __brand: 'RemovalRequestId' };

export type SacredTradition =
  | 'Candomblé'
  | 'Umbanda'
  | 'Ifá'
  | 'Cabala'
  | 'Astrologia'
  | 'Tantra'
  | 'Cigano';

export type ReputationDomain =
  | 'contributions'
  | 'mentorship'
  | 'ritual-knowledge'
  | 'peer-help'
  | 'sacred-content-quality';

export interface ReputationEvent {
  eventId: EventId;
  recipient: UserId;
  fromPeer: UserId;
  domain: ReputationDomain;
  tradition: SacredTradition;
  weight: number;
  occurredAt?: string;
  note?: string;
}

export interface ReputationScore {
  userId: UserId;
  domain: ReputationDomain;
  score: number;
  eventCount: number;
  traditionsContributed: readonly SacredTradition[];
  lastAwardAt: string | null;
}

export interface Contributor {
  userId: UserId;
  score: number;
  traditionsContributed: readonly SacredTradition[];
}

export interface RemovalRequest {
  requestId: RemovalRequestId;
  targetUserId: UserId;
  tradition: SacredTradition;
  reason: string;
  requestedBy: UserId;
  cosignedBy: UserId | null;
  status: 'pending' | 'approved' | 'rejected';
  decidedAt: string | null;
  auditNote: string;
}

export interface Elder {
  userId: UserId;
  tradition: SacredTradition;
  recognizedAt: string;
}

export interface DomainMeta {
  domain: ReputationDomain;
  description: string;
  lambda: number;
  windowDays: number;
  maxWeight: number;
}

export type ReputationErrorCode =
  | 'SELF_AWARD'
  | 'RATE_LIMIT'
  | 'UNKNOWN_TRADITION'
  | 'UNKNOWN_DOMAIN'
  | 'INVALID_WEIGHT'
  | 'VETO_REQUIRES_TWO_ELDERS'
  | 'VETO_NOT_ELDERS'
  | 'VETO_DIFFERENT_TRADITIONS'
  | 'ALREADY_DECIDED'
  | 'OPT_OUT'
  | 'NOT_FOUND'
  | 'NOT_REGISTERED';

export class ReputationError extends Error {
  readonly code: ReputationErrorCode;
  constructor(code: ReputationErrorCode, message: string) {
    super(message);
    this.name = 'ReputationError';
    this.code = code;
  }
}

export function userId(s: string): UserId {
  if (!s || typeof s !== 'string') throw new Error('userId: empty');
  if (!/^u_[a-zA-Z0-9_-]{2,40}$/.test(s)) {
    throw new Error(`userId: invalid format "${s}" (expected u_...)`);
  }
  return s as UserId;
}

export function eventId(s: string): EventId {
  if (!s || !/^e_[a-zA-Z0-9_-]{2,40}$/.test(s)) {
    throw new Error(`eventId: invalid format "${s}"`);
  }
  return s as EventId;
}

export function removalRequestId(s: string): RemovalRequestId {
  if (!s || !/^r_[a-zA-Z0-9_-]{2,40}$/.test(s)) {
    throw new Error(`removalRequestId: invalid format "${s}"`);
  }
  return s as RemovalRequestId;
}

export const SACRED_TRADITIONS: ReadonlyArray<SacredTradition> = Object.freeze([
  'Candomblé',
  'Umbanda',
  'Ifá',
  'Cabala',
  'Astrologia',
  'Tantra',
  'Cigano',
]);

export const REPUTATION_DOMAINS: ReadonlyArray<ReputationDomain> = Object.freeze([
  'contributions',
  'mentorship',
  'ritual-knowledge',
  'peer-help',
  'sacred-content-quality',
]);

export const DOMAIN_METADATA: ReadonlyArray<DomainMeta> = Object.freeze([
  Object.freeze({ domain: 'contributions' as ReputationDomain, description: 'Posts, comments, shared readings', lambda: 0.003, windowDays: 365, maxWeight: 25 }),
  Object.freeze({ domain: 'mentorship' as ReputationDomain, description: 'W76-A pair completions, mentee feedback', lambda: 0.002, windowDays: 365, maxWeight: 50 }),
  Object.freeze({ domain: 'ritual-knowledge' as ReputationDomain, description: 'Tradition-specific validations from elder peers', lambda: 0.001, windowDays: 365, maxWeight: 75 }),
  Object.freeze({ domain: 'peer-help' as ReputationDomain, description: 'Answers, code contributions, translations', lambda: 0.005, windowDays: 365, maxWeight: 15 }),
  Object.freeze({ domain: 'sacred-content-quality' as ReputationDomain, description: 'Akashia readings rated by community', lambda: 0.0025, windowDays: 365, maxWeight: 30 }),
]);

export const SACRED_TERM_WHITELIST: ReadonlyArray<string> = Object.freeze([
  'Orixá', 'Babalorixá', 'Yalorixá', 'Oxalá', 'Iansã', 'Oxum', 'Exu', 'Ogum',
  'Caboclo', 'Preto-Velho', 'Pomba-Gira', 'Sete Linhas', 'Três Reis',
  'Ifá', 'Orunmila', 'Bàbá',
  'Sephirot', 'Kether', 'Chokmah', 'Binah', 'Tiferet',
  'Ascendente', 'Lilith', 'Meio-do-Céu', 'Nodo Lunar',
  'Bodhisattva', 'Mantra', 'Kundalini',
  'Cigano', 'Tarô',
]);

interface UserDomainBucket {
  events: ReputationEvent[];
  traditions: Set<SacredTradition>;
  lastAwardAt: string | null;
}

const EVENTS = new Map<UserId, Map<ReputationDomain, UserDomainBucket>>();
const OPT_OUTS = new Set<string>();
const ELDERS: Elder[] = [];
const REMOVAL_REQUESTS = new Map<RemovalRequestId, RemovalRequest>();
const AUDIT: Array<Record<string, unknown>> = [];

let eventCounter = 0;
let removalCounter = 0;

function synthEventId(): EventId {
  eventCounter += 1;
  return eventId(`e_synth_${eventCounter.toString(36)}_${Date.now().toString(36)}`);
}

function synthRemovalId(): RemovalRequestId {
  removalCounter += 1;
  return removalRequestId(`r_synth_${removalCounter.toString(36)}_${Date.now().toString(36)}`);
}

function appendAudit(entry: Record<string, unknown>): void {
  AUDIT.push(Object.freeze(entry));
}

function key(u: UserId, d: ReputationDomain): string {
  return `${u}::${d}`;
}

export function registerElder(u: UserId, tradition: SacredTradition, now?: string): Elder {
  if (!SACRED_TRADITIONS.includes(tradition)) {
    throw new ReputationError('UNKNOWN_TRADITION', `tradition "${tradition}" not in registry`);
  }
  const recognizedAt = now ?? new Date().toISOString();
  const elder: Elder = Object.freeze({ userId: u, tradition, recognizedAt });
  ELDERS.push(elder);
  appendAudit({
    kind: 'elder-registered',
    userId: u,
    tradition,
    recognizedAt,
    sacredTermNote: `Tradition ${tradition} honors its elders.`,
  });
  return elder;
}

export function listElders(tradition?: SacredTradition): ReadonlyArray<Elder> {
  if (!tradition) return Object.freeze(ELDERS.slice());
  return Object.freeze(ELDERS.filter((e) => e.tradition === tradition));
}

export function isElder(u: UserId, tradition: SacredTradition): boolean {
  return ELDERS.some((e) => e.userId === u && e.tradition === tradition);
}

export function elderCount(tradition: SacredTradition): number {
  return ELDERS.filter((e) => e.tradition === tradition).length;
}

export function optOut(u: UserId, d: ReputationDomain): void {
  if (!REPUTATION_DOMAINS.includes(d)) {
    throw new ReputationError('UNKNOWN_DOMAIN', `domain "${d}" not in registry`);
  }
  OPT_OUTS.add(key(u, d));
  appendAudit({ kind: 'opt-out', userId: u, domain: d });
}

export function optIn(u: UserId, d: ReputationDomain): void {
  if (!REPUTATION_DOMAINS.includes(d)) {
    throw new ReputationError('UNKNOWN_DOMAIN', `domain "${d}" not in registry`);
  }
  OPT_OUTS.delete(key(u, d));
  appendAudit({ kind: 'opt-in', userId: u, domain: d });
}

export function isOptedOut(u: UserId, d: ReputationDomain): boolean {
  return OPT_OUTS.has(key(u, d));
}

function dayBucket(iso: string): string {
  return iso.slice(0, 10);
}

function eventsFromPeerToday(peer: UserId, now: string): number {
  const today = dayBucket(now);
  let n = 0;
  for (const userMap of EVENTS.values()) {
    for (const bucket of userMap.values()) {
      for (const e of bucket.events) {
        if (e.fromPeer === peer && dayBucket(e.occurredAt ?? now) === today) n += 1;
      }
    }
  }
  return n;
}

const MAX_EVENTS_PER_PEER_PER_DAY = 5;

export interface AwardResult {
  applied: boolean;
  reason?: 'OPT_OUT' | 'SELF_AWARD' | 'RATE_LIMIT' | 'UNKNOWN_TRADITION' | 'UNKNOWN_DOMAIN' | 'INVALID_WEIGHT';
  eventId: EventId;
}

export function awardReputation(
  eventInput: Omit<ReputationEvent, 'eventId'> & { eventId?: EventId },
): AwardResult {
  const e: ReputationEvent = {
    eventId: eventInput.eventId ?? synthEventId(),
    recipient: eventInput.recipient,
    fromPeer: eventInput.fromPeer,
    domain: eventInput.domain,
    tradition: eventInput.tradition,
    weight: eventInput.weight,
    occurredAt: eventInput.occurredAt ?? new Date().toISOString(),
    ...(eventInput.note !== undefined ? { note: eventInput.note } : {}),
  };

  if (!SACRED_TRADITIONS.includes(e.tradition)) {
    throw new ReputationError('UNKNOWN_TRADITION', `tradition "${e.tradition}" not registered`);
  }
  if (!REPUTATION_DOMAINS.includes(e.domain)) {
    throw new ReputationError('UNKNOWN_DOMAIN', `domain "${e.domain}" not registered`);
  }
  if (e.fromPeer === e.recipient) {
    throw new ReputationError('SELF_AWARD', `user ${e.fromPeer} cannot award themselves`);
  }
  const meta = DOMAIN_METADATA.find((m) => m.domain === e.domain);
  if (!meta) throw new ReputationError('UNKNOWN_DOMAIN', `domain "${e.domain}" not in metadata`);
  if (!Number.isFinite(e.weight) || e.weight <= 0 || e.weight > meta.maxWeight) {
    throw new ReputationError(
      'INVALID_WEIGHT',
      `weight ${e.weight} not in (0, ${meta.maxWeight}] for domain ${e.domain}`,
    );
  }
  if (eventsFromPeerToday(e.fromPeer, e.occurredAt ?? new Date().toISOString()) >= MAX_EVENTS_PER_PEER_PER_DAY) {
    throw new ReputationError(
      'RATE_LIMIT',
      `peer ${e.fromPeer} exceeded ${MAX_EVENTS_PER_PEER_PER_DAY} events/day`,
    );
  }
  if (isOptedOut(e.recipient, e.domain)) {
    appendAudit({
      kind: 'award-blocked',
      eventId: e.eventId,
      reason: 'OPT_OUT',
      recipient: e.recipient,
      domain: e.domain,
      tradition: e.tradition,
    });
    return Object.freeze({ applied: false, reason: 'OPT_OUT' as const, eventId: e.eventId });
  }

  let userMap = EVENTS.get(e.recipient);
  if (!userMap) {
    userMap = new Map();
    EVENTS.set(e.recipient, userMap);
  }
  let bucket = userMap.get(e.domain);
  if (!bucket) {
    bucket = { events: [], traditions: new Set(), lastAwardAt: null };
    userMap.set(e.domain, bucket);
  }
  bucket.events.push(Object.freeze({ ...e }));
  bucket.traditions.add(e.tradition);
  bucket.lastAwardAt = e.occurredAt ?? new Date().toISOString();

  appendAudit({
    kind: 'award-applied',
    eventId: e.eventId,
    recipient: e.recipient,
    fromPeer: e.fromPeer,
    domain: e.domain,
    tradition: e.tradition,
    weight: e.weight,
    sacredTermSnapshot: SACRED_TERM_WHITELIST.length,
    occurredAt: e.occurredAt,
  });

  return Object.freeze({ applied: true, eventId: e.eventId });
}

export function scoreWithDecay(
  events: readonly ReputationEvent[],
  lambda: number,
  windowDays: number,
  now: Date,
): number {
  if (!Number.isFinite(lambda) || lambda < 0) {
    throw new ReputationError('INVALID_WEIGHT', `lambda must be ≥ 0, got ${lambda}`);
  }
  if (!Number.isFinite(windowDays) || windowDays <= 0) {
    throw new ReputationError('INVALID_WEIGHT', `windowDays must be > 0, got ${windowDays}`);
  }
  const nowMs = now.getTime();
  const windowMs = windowDays * 86_400_000;
  let total = 0;
  for (const e of events) {
    const t = new Date(e.occurredAt ?? now.toISOString()).getTime();
    const ageMs = nowMs - t;
    if (ageMs < 0 || ageMs > windowMs) continue;
    const days = ageMs / 86_400_000;
    total += e.weight * Math.exp(-lambda * days);
  }
  return total;
}

export function getReputation(
  u: UserId,
  d: ReputationDomain,
  now: Date = new Date(),
): ReputationScore {
  if (!REPUTATION_DOMAINS.includes(d)) {
    throw new ReputationError('UNKNOWN_DOMAIN', `domain "${d}" not registered`);
  }
  const userMap = EVENTS.get(u);
  const bucket = userMap?.get(d);
  const meta = DOMAIN_METADATA.find((m) => m.domain === d);
  if (!meta) throw new ReputationError('UNKNOWN_DOMAIN', `domain "${d}" not in metadata`);

  const events = bucket?.events ?? [];
  const score = bucket && !isOptedOut(u, d)
    ? scoreWithDecay(events, meta.lambda, meta.windowDays, now)
    : 0;
  const traditions = bucket ? Array.from(bucket.traditions).sort() : [];
  return Object.freeze({
    userId: u,
    domain: d,
    score: Math.round(score * 1000) / 1000,
    eventCount: events.length,
    traditionsContributed: Object.freeze(traditions),
    lastAwardAt: bucket?.lastAwardAt ?? null,
  });
}

export function listTopContributors(
  tradition: SacredTradition,
  d: ReputationDomain,
  limit: number = 10,
  now: Date = new Date(),
): ReadonlyArray<Contributor> {
  if (!SACRED_TRADITIONS.includes(tradition)) {
    throw new ReputationError('UNKNOWN_TRADITION', `tradition "${tradition}" not registered`);
  }
  if (!REPUTATION_DOMAINS.includes(d)) {
    throw new ReputationError('UNKNOWN_DOMAIN', `domain "${d}" not registered`);
  }
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new ReputationError('INVALID_WEIGHT', `limit must be positive integer, got ${limit}`);
  }
  const meta = DOMAIN_METADATA.find((m) => m.domain === d);
  if (!meta) throw new ReputationError('UNKNOWN_DOMAIN', `domain "${d}" not in metadata`);

  const rows: Contributor[] = [];
  for (const [u, userMap] of EVENTS.entries()) {
    if (isOptedOut(u, d)) continue;
    const bucket = userMap.get(d);
    if (!bucket) continue;
    const matchingEvents = bucket.events.filter((e) => e.tradition === tradition);
    if (matchingEvents.length === 0) continue;
    const s = scoreWithDecay(bucket.events, meta.lambda, meta.windowDays, now);
    if (s <= 0) continue;
    rows.push(Object.freeze({
      userId: u,
      score: Math.round(s * 1000) / 1000,
      traditionsContributed: Object.freeze(Array.from(bucket.traditions).sort()),
    }));
  }
  rows.sort((a, b) => b.score - a.score);
  return Object.freeze(rows.slice(0, limit));
}

export function listTopContributorsGlobal(): never {
  throw new ReputationError(
    'UNKNOWN_DOMAIN',
    'Global ranking forbidden by universalism principle. Use listTopContributors(tradition, domain).',
  );
}

export interface RemovalRequestInput {
  targetUserId: UserId;
  tradition: SacredTradition;
  reason: string;
  requestedBy: UserId;
  cosignedBy?: UserId;
  now?: string;
}

export function requestRemoval(input: RemovalRequestInput): RemovalRequest {
  const { targetUserId, tradition, reason, requestedBy } = input;
  const cosignedBy = input.cosignedBy ?? null;
  const now = input.now ?? new Date().toISOString();

  if (!SACRED_TRADITIONS.includes(tradition)) {
    throw new ReputationError('UNKNOWN_TRADITION', `tradition "${tradition}" not registered`);
  }
  if (!isElder(requestedBy, tradition)) {
    throw new ReputationError(
      'VETO_NOT_ELDERS',
      `requester ${requestedBy} is not a registered elder of ${tradition}`,
    );
  }
  if (cosignedBy !== null && !isElder(cosignedBy, tradition)) {
    throw new ReputationError(
      'VETO_NOT_ELDERS',
      `cosigner ${cosignedBy} is not a registered elder of ${tradition}`,
    );
  }
  if (cosignedBy !== null && requestedBy === cosignedBy) {
    throw new ReputationError(
      'VETO_REQUIRES_TWO_ELDERS',
      'cosigner must be a different elder than the requester',
    );
  }
  if (cosignedBy === null) {
    throw new ReputationError(
      'VETO_REQUIRES_TWO_ELDERS',
      `tradition-elder veto in ${tradition} requires TWO elders from the same tradition`,
    );
  }

  const req: RemovalRequest = Object.freeze({
    requestId: synthRemovalId(),
    targetUserId,
    tradition,
    reason,
    requestedBy,
    cosignedBy,
    status: 'pending',
    decidedAt: null,
    auditNote: `Removal of ${targetUserId} from ${tradition} elder-knowledge stream pending review.`,
  });
  REMOVAL_REQUESTS.set(req.requestId, req);

  appendAudit({
    kind: 'removal-requested',
    requestId: req.requestId,
    targetUserId,
    tradition,
    requestedBy,
    cosignedBy,
    reason,
    sacredTermNote: `${tradition} councils speak with two voices, never one.`,
  });

  return req;
}

export function decideRemoval(
  requestId: RemovalRequestId,
  decision: 'approved' | 'rejected',
  decidedBy: UserId,
  now?: string,
): RemovalRequest {
  const req = REMOVAL_REQUESTS.get(requestId);
  if (!req) throw new ReputationError('NOT_FOUND', `removal request ${requestId} not found`);
  if (req.status !== 'pending') {
    throw new ReputationError(
      'ALREADY_DECIDED',
      `removal request ${requestId} already ${req.status}`,
    );
  }
  if (!isElder(decidedBy, req.tradition)) {
    throw new ReputationError(
      'VETO_NOT_ELDERS',
      `decider ${decidedBy} is not a registered elder of ${req.tradition}`,
    );
  }

  const decidedAt = now ?? new Date().toISOString();
  const updated: RemovalRequest = Object.freeze({
    ...req,
    status: decision,
    decidedAt,
    auditNote:
      decision === 'approved'
        ? `${req.targetUserId} removed from ${req.tradition} ritual-knowledge stream by elder council.`
        : `${req.targetUserId} cleared by ${req.tradition} elder council.`,
  });
  REMOVAL_REQUESTS.set(requestId, updated);

  if (decision === 'approved') {
    optOut(req.targetUserId, 'ritual-knowledge');
  }

  appendAudit({
    kind: 'removal-decided',
    requestId,
    decision,
    decidedBy,
    targetUserId: req.targetUserId,
    tradition: req.tradition,
    decidedAt,
  });

  return updated;
}

export function listRemovalRequests(): ReadonlyArray<RemovalRequest> {
  return Object.freeze(Array.from(REMOVAL_REQUESTS.values()));
}

export function getRemovalRequest(requestId: RemovalRequestId): RemovalRequest | null {
  const r = REMOVAL_REQUESTS.get(requestId);
  return r ? Object.freeze({ ...r }) : null;
}

export function exportAudit(): ReadonlyArray<Readonly<Record<string, unknown>>> {
  return Object.freeze(AUDIT.slice());
}

export function _resetForTests(): void {
  EVENTS.clear();
  OPT_OUTS.clear();
  ELDERS.length = 0;
  REMOVAL_REQUESTS.clear();
  AUDIT.length = 0;
  eventCounter = 0;
  removalCounter = 0;
}

export function decayWeight(weight: number, ageDays: number, lambda: number): number {
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new ReputationError('INVALID_WEIGHT', `weight must be > 0, got ${weight}`);
  }
  if (!Number.isFinite(ageDays) || ageDays < 0) {
    throw new ReputationError('INVALID_WEIGHT', `ageDays must be ≥ 0, got ${ageDays}`);
  }
  if (!Number.isFinite(lambda) || lambda < 0) {
    throw new ReputationError('INVALID_WEIGHT', `lambda must be ≥ 0, got ${lambda}`);
  }
  return weight * Math.exp(-lambda * ageDays);
}

export function decaysSlowerThan(a: number, b: number): boolean {
  return a < b;
}

export const CYCLE = 76;
export const ENGINE_ID = 'W76-B-reputation-universalist';
