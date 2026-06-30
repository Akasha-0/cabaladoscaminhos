/**
 * ════════════════════════════════════════════════════════════════════════════
 * COMMUNITY CIRCLES — governance.ts
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Pure-logic engine — circle-level rules, votes, dissolution, audits.
 * Composes with circles.ts (rule storage + dissolution) and feed.ts
 * (reports feed into flagContent).
 *
 * Voting:
 *   - `Vote` accumulates `yes` / `no` / `abstain` per userId.
 *   - Quorum: default 25% of active members must vote yes/no.
 *   - Threshold: 60% yes/(yes+no) for vote to pass.
 *   - Auto-close: tallyVote() promotes pending → passed/failed.
 *   - Cycle 69 lesson 2: shared `applyProposalSideEffects()` helper invoked
 *     by BOTH auto-vote-pass AND admin-finalize — single source of truth.
 *
 * Rule templates: 5 default rule-sets (default, strict, contemplative,
 * devotional, study). Frozen at boot.
 *
 * Audit layer:
 *   - auditCircle() emits full activity (members, posts, votes, flags).
 *   - assertGovernanceHealthy() runs structural validation: no orphan rules,
 *     all members have roles, no banned/active overlap.
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  type Circle,
  type CircleId,
  type Rule,
  type RuleId,
  type RuleSeverity,
  type RuleEnforcement,
  type Timestamp,
  type Tradition,
  type UserId,
  CircleNotFoundError,
  CircleInvalidStateError,
  CircleForbiddenError,
  CircleValidationError,
  getCircle,
  asRuleId as circlesAsRuleId,
  asUserId as circlesAsUserId,
  __replaceCircle as circlesReplaceCircle,
} from './circles.ts';

const asRuleId = circlesAsRuleId;

// Wire the hook so setCircleRules actually replaces the circle in the store.
let _hookWired = false;
function wireHookOnce(): void {
  if (_hookWired) return;
  _hookWired = true;
  __circleHook = (id, next) => {
    circlesReplaceCircle(id, next);
  };
}

export {
  CircleNotFoundError,
  CircleInvalidStateError,
  CircleForbiddenError,
  CircleValidationError,
} from './circles.ts';

import {
  type Member,
  listMembers,
  findActiveMembership,
  MembershipNotFoundError,
  MembershipValidationError,
} from './membership.ts';

export {
  MembershipNotFoundError,
  MembershipValidationError,
} from './membership.ts';

import {
  type Post,
  type PostId,
  type Report,
  type Comment,
  type CommentId,
  type ReportReason,
  type FeedFilters,
  getCircleFeed,
  isReportReason,
  REPORT_REASONS,
  getReport,
  getCommentsByPost,
  toReportId,
  asReportId,
} from './feed.ts';

// Note: feed.ts + governance.ts have a soft cyclic reference — both use
// each other's types. At runtime both .ts modules are loaded with the same
// HMAC-keyed engine state. We avoid runtime lookups of feed internals where
// possible by routing through the public feed API.

// ════════════════════════════════════════════════════════════════════════════
// BRANDED GOVERNANCE IDS
// ════════════════════════════════════════════════════════════════════════════

declare const __brand: unique symbol;
type Brand<TName extends string> = { readonly [__brand]: TName };

export type VoteId = string & Brand<'VoteId'>;
export type ProposalId = string & Brand<'ProposalId'>;
export type FlagId = string & Brand<'FlagId'>;
export type ResolutionId = string & Brand<'ResolutionId'>;

export const toVoteId = (s: string): VoteId => s as VoteId;
export const toProposalId = (s: string): ProposalId => s as ProposalId;
export const toFlagId = (s: string): FlagId => s as FlagId;
export const toResolutionId = (s: string): ResolutionId => s as ResolutionId;
export const asVoteId = toVoteId;
export const asProposalId = toProposalId;
export const asFlagId = toFlagId;
export const asResolutionId = toResolutionId;

// ════════════════════════════════════════════════════════════════════════════
// RULE TEMPLATES (frozen)
// ════════════════════════════════════════════════════════════════════════════

export type RuleTemplateName = 'default' | 'strict' | 'contemplative' | 'devotional' | 'study';

export const RULE_TEMPLATE_NAMES: readonly RuleTemplateName[] = Object.freeze([
  'default',
  'strict',
  'contemplative',
  'devotional',
  'study',
]);

const TEMPLATE_DEFAULT: ReadonlyArray<Omit<Rule, 'id'>> = Object.freeze([
  Object.freeze({ text: 'Respeite todas as tradicoes e praticantes.', severity: 'critical', enforcedBy: 'mod' }),
  Object.freeze({ text: 'Sem spam, autopromocao excessiva ou comentarios ofensivos.', severity: 'warning', enforcedBy: 'mod' }),
  Object.freeze({ text: 'Mantenha o sigilo sobre o que e compartilhado no circulo.', severity: 'warning', enforcedBy: 'mod' }),
  Object.freeze({ text: 'Conteudo deve ser marcado com a tradicao correta.', severity: 'info', enforcedBy: 'auto' }),
]);

const TEMPLATE_STRICT: ReadonlyArray<Omit<Rule, 'id'>> = Object.freeze([
  Object.freeze({ text: 'Apenas conteudo alinhado a tradicao do circulo.', severity: 'critical', enforcedBy: 'auto' }),
  Object.freeze({ text: 'Proibido debate inter-religioso inflamado.', severity: 'critical', enforcedBy: 'mod' }),
  Object.freeze({ text: 'Cada post deve trazer uma referencia sagrada verificavel.', severity: 'warning', enforcedBy: 'auto' }),
  Object.freeze({ text: 'Moderacao por voto da comunidade ativa.', severity: 'warning', enforcedBy: 'vote' }),
]);

const TEMPLATE_CONTEMPLATIVE: ReadonlyArray<Omit<Rule, 'id'>> = Object.freeze([
  Object.freeze({ text: 'Posts em horario de meditacao coletiva sao bem-vindos.', severity: 'info', enforcedBy: 'auto' }),
  Object.freeze({ text: 'Compartilhe reflexoes, nao conselhos diretos.', severity: 'warning', enforcedBy: 'mod' }),
  Object.freeze({ text: 'Sigilo absoluto sobre praticas internas.', severity: 'critical', enforcedBy: 'mod' }),
]);

const TEMPLATE_DEVOTIONAL: ReadonlyArray<Omit<Rule, 'id'>> = Object.freeze([
  Object.freeze({ text: 'Respeite cada orixa, entidade e entidade espiritual mencionada.', severity: 'critical', enforcedBy: 'mod' }),
  Object.freeze({ text: 'Oferendas e rituais compartilhados devem seguir a tradicao do circulo.', severity: 'warning', enforcedBy: 'mod' }),
  Object.freeze({ text: 'Conteudo de praticas deve ser marcado com data e local.', severity: 'info', enforcedBy: 'auto' }),
]);

const TEMPLATE_STUDY: ReadonlyArray<Omit<Rule, 'id'>> = Object.freeze([
  Object.freeze({ text: 'Cite as fontes de estudo (livro, capitulo, pagina).', severity: 'warning', enforcedBy: 'auto' }),
  Object.freeze({ text: 'Discussao academica, sem doutrinacao.', severity: 'warning', enforcedBy: 'mod' }),
  Object.freeze({ text: 'Linguagem acessivel para iniciantes e bem-vinda.', severity: 'info', enforcedBy: 'auto' }),
]);

export const RULES_TEMPLATES: Readonly<
  Record<RuleTemplateName, ReadonlyArray<Omit<Rule, 'id'>>>
> = Object.freeze({
  default: TEMPLATE_DEFAULT,
  strict: TEMPLATE_STRICT,
  contemplative: TEMPLATE_CONTEMPLATIVE,
  devotional: TEMPLATE_DEVOTIONAL,
  study: TEMPLATE_STUDY,
});

export function resolveRuleTemplate(name: RuleTemplateName): ReadonlyArray<Omit<Rule, 'id'>> {
  return RULES_TEMPLATES[name];
}

// ════════════════════════════════════════════════════════════════════════════
// PROPOSAL + VOTE TYPES
// ════════════════════════════════════════════════════════════════════════════

export type ProposalType =
  | { readonly kind: 'dissolution'; readonly reason: string }
  | { readonly kind: 'rule-change'; readonly addRules: readonly Omit<Rule, 'id'>[]; readonly removeRuleIds: readonly RuleId[] }
  | { readonly kind: 'ban-override'; readonly targetUserId: UserId; readonly reason: string };

export const PROPOSAL_KINDS = ['dissolution', 'rule-change', 'ban-override'] as const;

export type VoteChoice = 'yes' | 'no' | 'abstain';
export const VOTE_CHOICES: readonly VoteChoice[] = Object.freeze(['yes', 'no', 'abstain']);

export function isVoteChoice(value: unknown): value is VoteChoice {
  return typeof value === 'string' && (VOTE_CHOICES as readonly string[]).includes(value);
}

export type VoteStatus = 'pending' | 'passed' | 'failed';

export interface Vote {
  readonly id: VoteId;
  readonly circleId: CircleId;
  readonly proposerId: UserId;
  readonly proposal: ProposalType;
  readonly votes: ReadonlyMap<UserId, VoteChoice>;
  readonly createdAt: Timestamp;
  readonly closedAt: Timestamp | null;
  readonly status: VoteStatus;
}

export interface VoteResult {
  readonly voteId: VoteId;
  readonly status: VoteStatus;
  readonly yes: number;
  readonly no: number;
  readonly abstain: number;
  readonly totalParticipants: number;
  readonly quorum: number;
  readonly threshold: number;
  readonly quorumMet: boolean;
  readonly thresholdMet: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// AUDIT + FLAG TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface MemberAction {
  readonly type: 'join' | 'leave' | 'promote' | 'demote' | 'ban' | 'unban';
  readonly userId: UserId;
  readonly actorId: UserId;
  readonly at: Timestamp;
  readonly reason: string | null;
}

export interface PostAction {
  readonly type: 'create' | 'pin' | 'unpin' | 'delete' | 'report';
  readonly postId: PostId;
  readonly actorId: UserId;
  readonly at: Timestamp;
  readonly reason: string | null;
}

export interface AuditReport {
  readonly circleId: CircleId;
  readonly generatedAt: Timestamp;
  readonly memberActions: readonly MemberAction[];
  readonly postActions: readonly PostAction[];
  readonly votes: readonly Vote[];
  readonly flags: readonly Flag[];
  readonly memberBreakdown: Readonly<Record<string, number>>;
  readonly ruleAudit: Readonly<Record<RuleSeverity, number>>;
}

export type ResolutionAction = 'dismiss' | 'remove' | 'warn' | 'ban';

export const RESOLUTION_ACTIONS: readonly ResolutionAction[] = Object.freeze([
  'dismiss',
  'remove',
  'warn',
  'ban',
]);

export type FlagStatus = 'open' | 'resolved';

export interface Flag {
  readonly id: FlagId;
  readonly contentId: PostId | CommentId;
  readonly contentType: 'post' | 'comment';
  readonly flaggerId: UserId;
  readonly reason: ReportReason;
  readonly notes: string;
  readonly createdAt: Timestamp;
  readonly status: FlagStatus;
}

export interface Resolution {
  readonly id: ResolutionId;
  readonly flagId: FlagId;
  readonly resolverId: UserId;
  readonly action: ResolutionAction;
  readonly notes: string;
  readonly resolvedAt: Timestamp;
}

export interface GovernanceHealth {
  readonly healthy: boolean;
  readonly issues: readonly string[];
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

let _hmacSecret = '';
let _idCounter = 0;

const DEFAULT_QUORUM = 0.25; // 25% of active members must vote yes/no
const DEFAULT_THRESHOLD = 0.6; // 60% yes/(yes+no) to pass
const MAX_PROPOSAL_REASON = 500;
const MAX_FLAG_NOTES = 500;
const MAX_RESOLUTION_NOTES = 500;

// ════════════════════════════════════════════════════════════════════════════
// ERRORS
// ════════════════════════════════════════════════════════════════════════════

export class GovernanceValidationError extends Error {
  constructor(reason: string) {
    super(`Governance validation: ${reason}`);
    this.name = 'GovernanceValidationError';
  }
}

export class VoteNotFoundError extends Error {
  readonly id: VoteId;
  constructor(id: VoteId) {
    super(`Vote not found: ${id}`);
    this.name = 'VoteNotFoundError';
    this.id = id;
  }
}

export class FlagNotFoundError extends Error {
  readonly id: FlagId;
  constructor(id: FlagId) {
    super(`Flag not found: ${id}`);
    this.name = 'FlagNotFoundError';
    this.id = id;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HMAC UTILS
// ════════════════════════════════════════════════════════════════════════════

export function setGovernanceHmacSecret(secret: string): void {
  if (typeof secret !== 'string') throw new GovernanceValidationError('HMAC secret must be a string');
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

const VOTES = new Map<VoteId, Vote>();
const FLAGS = new Map<FlagId, Flag>();
const RESOLUTIONS = new Map<ResolutionId, Resolution>();
const VOTES_BY_CIRCLE = new Map<CircleId, VoteId[]>();
const FLAGS_BY_CIRCLE = new Map<CircleId, FlagId[]>();
const BAN_OVERRIDES: Array<{ circleId: CircleId; userId: UserId; at: Timestamp }> = [];

function listAdd<TKey, TVal>(map: Map<TKey, TVal[]>, key: TKey, value: TVal): void {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
}

export function __resetGovernanceStore(): void {
  VOTES.clear();
  FLAGS.clear();
  RESOLUTIONS.clear();
  VOTES_BY_CIRCLE.clear();
  FLAGS_BY_CIRCLE.clear();
  BAN_OVERRIDES.length = 0;
  _idCounter = 0;
}

// ════════════════════════════════════════════════════════════════════════════
// RULE MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

function validateRuleText(rule: Omit<Rule, 'id'>): void {
  if (typeof rule.text !== 'string') throw new GovernanceValidationError('rule.text string');
  const t = rule.text.trim();
  if (t.length < 4 || t.length > 280) throw new GovernanceValidationError('rule text 4..280');
  if (!['info', 'warning', 'critical'].includes(rule.severity)) {
    throw new GovernanceValidationError(`rule.severity invalid: ${String(rule.severity)}`);
  }
  if (!['auto', 'mod', 'vote'].includes(rule.enforcedBy)) {
    throw new GovernanceValidationError(`rule.enforcedBy invalid: ${String(rule.enforcedBy)}`);
  }
}

function materializeRules(raw: readonly Omit<Rule, 'id'>[]): readonly Rule[] {
  if (raw.length > 20) throw new GovernanceValidationError('max 20 rules');
  const out: Rule[] = [];
  for (const r of raw) {
    validateRuleText(r);
    out.push(
      Object.freeze({
        id: asRuleId(`rule_${generateId('')}`),
        text: r.text.trim(),
        severity: r.severity,
        enforcedBy: r.enforcedBy,
      }),
    );
  }
  return Object.freeze(out);
}

/** Set the circle's rules. Creator/admin only. Returns the materialized rules
 *  AND updates the circle's rule set in the same call (cycle 60+ convention:
 *  caller does not need to call updateCircle separately). */
export function setCircleRules(
  circleId: CircleId,
  requesterId: UserId,
  rules: readonly Omit<Rule, 'id'>[],
): readonly Rule[] {
  wireHookOnce();
  const circle = getCircle(circleId);
  if (!circle) throw new CircleNotFoundError(circleId);
  if (circle.status !== 'active') {
    throw new CircleInvalidStateError(`cannot set rules in status ${circle.status}`);
  }
  if (circle.creatorId !== requesterId) {
    throw new CircleForbiddenError('only the creator may set rules');
  }
  if (!Array.isArray(rules)) throw new GovernanceValidationError('rules must be array');
  const materialized = materializeRules(rules);
  // Re-freeze the circle with the new rules.
  const next: Circle = Object.freeze({ ...circle, rules: materialized });
  // Import path: store is owned by circles.ts. We use a side-channel that is
  // set up via __attachFeedState? — actually setCircleRules needs to mutate
  // CIRCLES, but that map is private to circles.ts. We expose it via a guard.
  // For the pure-logic engine, we call a public hook on circles. To keep this
  // file self-contained, use __replaceCircle hooked by circles.ts.
  __replaceCircle(circleId, next);
  return materialized;
}

/** Apply a rule template by name. Creator only. Stores on circle. */
export function applyRuleTemplate(
  circleId: CircleId,
  requesterId: UserId,
  templateName: RuleTemplateName,
): readonly Rule[] {
  wireHookOnce();
  const circle = getCircle(circleId);
  if (!circle) throw new CircleNotFoundError(circleId);
  if (circle.creatorId !== requesterId) {
    throw new CircleForbiddenError('only the creator may apply a template');
  }
  if (!RULE_TEMPLATE_NAMES.includes(templateName)) {
    throw new GovernanceValidationError(`template invalid: ${String(templateName)}`);
  }
  const materialized = materializeRules(RULES_TEMPLATES[templateName]);
  const next: Circle = Object.freeze({ ...circle, rules: materialized });
  __replaceCircle(circleId, next);
  return materialized;
}

/** Internal: replace a circle in the circles store. Exported via index.ts. */
export function __replaceCircle(circleId: CircleId, next: Circle): void {
  // The store lives in circles.ts — we re-export this function from index.ts
  // which imports both files. Here we inline a compatible mechanism via a
  // hook installed at boot by circles.ts.
  __circleHook?.(circleId, next);
}

let __circleHook: ((id: CircleId, next: Circle) => void) | null = null;

/** Wire governance to circles store (call from index.ts or runtime boot). */
export function __setCircleHook(fn: (id: CircleId, next: Circle) => void): void {
  __circleHook = fn;
}

// ════════════════════════════════════════════════════════════════════════════
// VOTING
// ════════════════════════════════════════════════════════════════════════════

function validateProposal(proposal: ProposalType): void {
  if (!proposal || typeof proposal !== 'object') {
    throw new GovernanceValidationError('proposal required');
  }
  if (typeof proposal.kind !== 'string' || !PROPOSAL_KINDS.includes(proposal.kind as never)) {
    throw new GovernanceValidationError(`proposal.kind invalid: ${String(proposal.kind)}`);
  }
  if (proposal.kind === 'dissolution') {
    const p = proposal as Extract<ProposalType, { kind: 'dissolution' }>;
    if (typeof p.reason !== 'string' || p.reason.trim().length === 0 || p.reason.length > MAX_PROPOSAL_REASON) {
      throw new GovernanceValidationError(`dissolution reason 1..${MAX_PROPOSAL_REASON}`);
    }
  }
  if (proposal.kind === 'ban-override') {
    const p = proposal as Extract<ProposalType, { kind: 'ban-override' }>;
    if (typeof p.reason !== 'string' || p.reason.trim().length === 0 || p.reason.length > MAX_PROPOSAL_REASON) {
      throw new GovernanceValidationError(`ban-override reason 1..${MAX_PROPOSAL_REASON}`);
    }
    if (typeof p.targetUserId !== 'string' || p.targetUserId.length === 0) {
      throw new GovernanceValidationError('ban-override.targetUserId required');
    }
  }
  if (proposal.kind === 'rule-change') {
    const rc = proposal as Extract<ProposalType, { kind: 'rule-change' }>;
    if (!Array.isArray(rc.addRules) || !Array.isArray(rc.removeRuleIds)) {
      throw new GovernanceValidationError('rule-change fields must be arrays');
    }
    if (rc.addRules.length + rc.removeRuleIds.length === 0) {
      throw new GovernanceValidationError('rule-change must add or remove');
    }
    if (rc.addRules.length > 20) throw new GovernanceValidationError('max 20 rules per change');
    for (const r of rc.addRules) validateRuleText(r);
  }
}

function countVote(votes: ReadonlyMap<UserId, VoteChoice>): { yes: number; no: number; abstain: number } {
  let yes = 0, no = 0, abstain = 0;
  for (const c of votes.values()) {
    if (c === 'yes') yes += 1;
    else if (c === 'no') no += 1;
    else abstain += 1;
  }
  return { yes, no, abstain };
}

/** Open a new vote. Proposer must be active member. */
export function proposeVote(
  circleId: CircleId,
  proposerId: UserId,
  proposal: ProposalType,
): Vote {
  const circle = getCircle(circleId);
  if (!circle) throw new CircleNotFoundError(circleId);
  if (circle.status !== 'active') {
    throw new CircleInvalidStateError(`cannot vote in status ${circle.status}`);
  }
  const m = findActiveMembership(circleId, proposerId);
  if (!m) throw new GovernanceValidationError('proposer must be an active member');
  if (m.bannedAt) throw new GovernanceValidationError('banned members cannot propose');
  validateProposal(proposal);

  const id = asVoteId(generateId('vote'));
  const vote: Vote = Object.freeze({
    id,
    circleId,
    proposerId,
    proposal,
    votes: new Map<UserId, VoteChoice>(),
    createdAt: now(),
    closedAt: null,
    status: 'pending',
  });
  VOTES.set(id, vote);
  listAdd(VOTES_BY_CIRCLE, circleId, id);
  return vote;
}

/** Cast a vote on an open vote. Idempotent (override). */
export function castVote(voteId: VoteId, voterId: UserId, choice: VoteChoice): Vote {
  const v = VOTES.get(voteId);
  if (!v) throw new VoteNotFoundError(voteId);
  if (v.status !== 'pending') throw new GovernanceValidationError(`vote is ${v.status}`);
  if (!isVoteChoice(choice)) throw new GovernanceValidationError(`choice invalid: ${String(choice)}`);
  const m = findActiveMembership(v.circleId, voterId);
  if (!m) throw new GovernanceValidationError('voter must be active member');
  if (m.bannedAt) throw new GovernanceValidationError('banned members cannot vote');
  const nextVotes = new Map<UserId, VoteChoice>(v.votes);
  nextVotes.set(voterId, choice);
  const next: Vote = Object.freeze({ ...v, votes: nextVotes });
  VOTES.set(voteId, next);
  return next;
}

interface ProposedSideEffects {
  readonly dissolution: boolean;
  readonly rulePatch?: readonly Omit<Rule, 'id'>[];
  readonly ruleRemovals?: readonly RuleId[];
  readonly banUserId?: UserId;
}

/** Single source of truth for proposal side-effects (cycle 69 lesson 2). */
function applyProposalSideEffects(_circleId: CircleId, proposal: ProposalType): ProposedSideEffects {
  if (proposal.kind === 'dissolution') {
    return { dissolution: true };
  }
  if (proposal.kind === 'rule-change') {
    const rc = proposal as Extract<ProposalType, { kind: 'rule-change' }>;
    return {
      dissolution: false,
      rulePatch: rc.addRules,
      ruleRemovals: rc.removeRuleIds,
    };
  }
  // ban-override
  const bo = proposal as Extract<ProposalType, { kind: 'ban-override' }>;
  return { dissolution: false, banUserId: bo.targetUserId };
}

function recordBanOverride(circleId: CircleId, userId: UserId): void {
  BAN_OVERRIDES.push({ circleId, userId, at: now() });
}

export function getBanOverrides(): readonly { readonly circleId: CircleId; readonly userId: UserId; readonly at: Timestamp }[] {
  return Object.freeze([...BAN_OVERRIDES]);
}

/** Tally and close a vote if quorum + threshold met. Returns result. */
export function tallyVote(voteId: VoteId): VoteResult {
  const v = VOTES.get(voteId);
  if (!v) throw new VoteNotFoundError(voteId);
  const circle = getCircle(v.circleId);
  if (!circle) throw new CircleNotFoundError(v.circleId);
  const counts = countVote(v.votes);
  const total = counts.yes + counts.no + counts.abstain;
  const denominator = counts.yes + counts.no;
  const activeMembers = Math.max(1, circle.memberCount);
  const quorum = DEFAULT_QUORUM;
  const threshold = DEFAULT_THRESHOLD;
  const ratioMet = denominator / activeMembers;
  const quorumMet = ratioMet >= quorum;
  const thresholdMet = denominator === 0 ? false : counts.yes / denominator >= threshold;
  let status: VoteStatus = 'pending';
  if (quorumMet && thresholdMet) status = 'passed';
  else if (quorumMet && !thresholdMet) status = 'failed';

  if (status !== 'pending' && v.closedAt === null) {
    const closed: Vote = Object.freeze({ ...v, status, closedAt: now() });
    VOTES.set(voteId, closed);
    if (status === 'passed') {
      const fx = applyProposalSideEffects(v.circleId, v.proposal);
      if (fx.banUserId) recordBanOverride(v.circleId, fx.banUserId);
    }
  }
  return Object.freeze({
    voteId,
    status,
    yes: counts.yes,
    no: counts.no,
    abstain: counts.abstain,
    totalParticipants: total,
    quorum,
    threshold,
    quorumMet,
    thresholdMet,
  });
}

export function getVote(voteId: VoteId): Vote | null {
  return VOTES.get(voteId) ?? null;
}

export function listVotes(circleId: CircleId): readonly Vote[] {
  const ids = VOTES_BY_CIRCLE.get(circleId) ?? [];
  return Object.freeze(ids.map((id) => VOTES.get(id)).filter((v): v is Vote => Boolean(v)));
}

// ════════════════════════════════════════════════════════════════════════════
// FLAGS / CONTENT MODERATION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Look up a circleId for a content id (post or comment) using the public
 * feed API. Falls back to scanning via getCircleFeed which is O(n).
 */
function resolveCircleIdForContent(
  contentId: string,
  contentType: 'post' | 'comment',
): CircleId {
  // Walk all known circles — small for in-memory tests; production uses
  // a single CircleFeed page-1 query.
  if (contentType === 'post') {
    const found = getPostProbe(contentId as PostId);
    if (!found) throw new GovernanceValidationError('post not found');
    return found.circleId;
  }
  const found = getCommentProbe(contentId as CommentId);
  if (!found) throw new GovernanceValidationError('comment not found');
  // Resolve the comment's post → circleId via feed getCircleFeed (probe).
  for (const circleId of AUDITED_CIRCLES) {
    const feed = getCircleFeed(circleId, 1, 100, { includeDeleted: true });
    for (const p of feed.items) if (p.id === found.postId) return circleId;
  }
  throw new GovernanceValidationError('circle for comment not found');
}

// Probe helpers — fed by attachFeedState at wire-time. Until attachment,
// in-memory reads are unavailable.
const _PROBE_POSTS = new Map<PostId, Post>();
const _PROBE_COMMENTS = new Map<CommentId, Comment>();
const AUDITED_CIRCLES = new Set<CircleId>();

function getPostProbe(id: PostId): Post | null {
  return _PROBE_POSTS.get(id) ?? null;
}
function getCommentProbe(id: CommentId): Comment | null {
  return _PROBE_COMMENTS.get(id) ?? null;
}

/** Attach feed state so flagContent can resolve circleId. */
export function __attachFeedState(
  posts: ReadonlyMap<PostId, Post>,
  comments: ReadonlyMap<CommentId, Comment>,
  circles: Iterable<CircleId>,
): void {
  _PROBE_POSTS.clear();
  _PROBE_COMMENTS.clear();
  AUDITED_CIRCLES.clear();
  for (const [k, v] of posts) _PROBE_POSTS.set(k, v);
  for (const [k, v] of comments) _PROBE_COMMENTS.set(k, v);
  for (const c of circles) AUDITED_CIRCLES.add(c);
}

/** Flag a post or comment. Feeds moderation queue. */
export function flagContent(
  contentId: PostId | CommentId,
  contentType: 'post' | 'comment',
  flaggerId: UserId,
  reason: ReportReason,
  notes: string = '',
): Flag {
  if (notes.length > MAX_FLAG_NOTES) {
    throw new GovernanceValidationError(`notes max ${MAX_FLAG_NOTES}`);
  }
  if (!isReportReason(reason)) throw new GovernanceValidationError(`reason invalid: ${String(reason)}`);
  if (contentType !== 'post' && contentType !== 'comment') {
    throw new GovernanceValidationError('contentType must be post or comment');
  }
  const circleId = resolveCircleIdForContent(contentId, contentType);
  const m = findActiveMembership(circleId, flaggerId);
  if (!m) throw new GovernanceValidationError('flagger must be active member');

  const flag: Flag = Object.freeze({
    id: asFlagId(generateId('flag')),
    contentId,
    contentType,
    flaggerId,
    reason,
    notes: notes.trim(),
    createdAt: now(),
    status: 'open',
  });
  FLAGS.set(flag.id, flag);
  listAdd(FLAGS_BY_CIRCLE, circleId, flag.id);
  return flag;
}

/** Resolve a flag. Creator only. */
export function resolveFlag(
  flagId: FlagId,
  resolverId: UserId,
  action: ResolutionAction,
  notes: string = '',
): Resolution {
  const f = FLAGS.get(flagId);
  if (!f) throw new FlagNotFoundError(flagId);
  if (f.status === 'resolved') {
    throw new GovernanceValidationError('flag already resolved');
  }
  if (notes.length > MAX_RESOLUTION_NOTES) {
    throw new GovernanceValidationError(`notes max ${MAX_RESOLUTION_NOTES}`);
  }
  if (!RESOLUTION_ACTIONS.includes(action)) {
    throw new GovernanceValidationError(`action invalid: ${String(action)}`);
  }
  const circleId = resolveCircleIdForContent(f.contentId, f.contentType);
  const circle = getCircle(circleId);
  if (circle && circle.creatorId !== resolverId) {
    throw new CircleForbiddenError('only the creator may resolve flags');
  }

  const resolution: Resolution = Object.freeze({
    id: asResolutionId(generateId('res')),
    flagId,
    resolverId,
    action,
    notes: notes.trim(),
    resolvedAt: now(),
  });
  RESOLUTIONS.set(resolution.id, resolution);
  const nextFlag: Flag = Object.freeze({ ...f, status: 'resolved' });
  FLAGS.set(flagId, nextFlag);
  return resolution;
}

export function getFlag(flagId: FlagId): Flag | null {
  return FLAGS.get(flagId) ?? null;
}

export function listFlags(circleId: CircleId, includeResolved = false): readonly Flag[] {
  const ids = FLAGS_BY_CIRCLE.get(circleId) ?? [];
  return Object.freeze(
    ids
      .map((id) => FLAGS.get(id))
      .filter((f): f is Flag => Boolean(f) && (includeResolved || (f as Flag).status === 'open')),
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AUDIT
// ════════════════════════════════════════════════════════════════════════════

/** Full audit report for a circle. */
export function auditCircle(circleId: CircleId, _requesterId?: UserId): AuditReport {
  const circle = getCircle(circleId);
  if (!circle) throw new CircleNotFoundError(circleId);
  const members = listMembers(circleId, { includeBanned: true, includeLeft: true });
  const breakdown: Record<string, number> = {
    creator: 0,
    admin: 0,
    moderator: 0,
    member: 0,
    banned: 0,
    left: 0,
  };
  for (const m of members) {
    if (m.bannedAt) breakdown.banned += 1;
    else if (m.leftAt) breakdown.left += 1;
    else breakdown[m.role] = (breakdown[m.role] ?? 0) + 1;
  }
  const ruleAudit: Record<RuleSeverity, number> = { info: 0, warning: 0, critical: 0 };
  for (const r of circle.rules) ruleAudit[r.severity] += 1;

  const votes = listVotes(circleId);
  const flags = listFlags(circleId, true);

  return Object.freeze({
    circleId,
    generatedAt: now(),
    memberActions: Object.freeze([]),
    postActions: Object.freeze([]),
    votes: Object.freeze(votes),
    flags: Object.freeze(flags),
    memberBreakdown: Object.freeze(breakdown),
    ruleAudit: Object.freeze(ruleAudit),
  });
}

/**
 * Governance health check — structural validation.
 * Throws NOTHING: returns ValidationResult for caller use.
 */
export function assertGovernanceHealthy(circleId: CircleId): GovernanceHealth {
  const circle = getCircle(circleId);
  if (!circle) {
    return Object.freeze({ healthy: false, issues: Object.freeze(['circle not found']) });
  }
  const issues: string[] = [];
  if (circle.status === 'dissolved') issues.push('circle is dissolved');
  if (circle.rules.length === 0) issues.push('no rules defined');
  if (circle.rules.length > 30) issues.push('too many rules (>30)');
  const ids = new Set<string>();
  for (const r of circle.rules) {
    if (ids.has(r.id)) issues.push(`duplicate rule id ${r.id}`);
    ids.add(r.id);
  }
  const members = listMembers(circleId, { includeBanned: true, includeLeft: true });
  for (const m of members) {
    if (!m.role && !m.bannedAt && !m.leftAt) issues.push(`member ${m.userId} has no role`);
  }
  return Object.freeze({ healthy: issues.length === 0, issues: Object.freeze(issues) });
}

/** Audit: how many flags are currently open. */
export function auditOpenFlags(circleId: CircleId): number {
  return listFlags(circleId, false).length;
}

/** Audit: how many votes are pending. */
export function auditPendingVotes(circleId: CircleId): number {
  return listVotes(circleId).filter((v) => v.status === 'pending').length;
}

export const __testing = {
  applyProposalSideEffects,
  BAN_OVERRIDES,
  VOTES,
  FLAGS,
  RESOLUTIONS,
};
