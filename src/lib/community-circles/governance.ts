// ============================================================================
// COMMUNITY CIRCLES — Governance (Wave 69, 2026-06-30)
// ============================================================================
// Pure-logic engine.
//
// Lightweight governance:
//   - DEFAULT_RULES: 8+ community-standards rules applied to every circle
//   - canPost pre-flight: membership + rules + rate limit
//   - rate-limit per (user, circle, hour)
//   - addCustomRule / removeCustomRule: admin-only
//   - proposeRuleChange + voteOnProposal: democratic-governance flows
//
// Custom rules are stored per circle and override/extend DEFAULT_RULES.
// Proposals are stored per circle with quorum (configurable; default 50%
// of active members must vote "yes" with >50% yes/no ratio).
// ============================================================================

import {
  getCircle,
} from "./circles.ts";

import type {
  CircleId,
  UserId,
} from "./circles.ts";

import {
  findActiveMembership,
} from "./membership.ts";

// ============================================================================
// BRANDED TYPES
// ============================================================================

declare const _brand: unique symbol;
type Brand<T, B> = T & { readonly [_brand]: B };

export type RuleId = Brand<string, "RuleId">;
export type ProposalId = Brand<string, "ProposalId">;
export type VoteId = Brand<string, "VoteId">;

const asRuleId = (s: string): RuleId => s as RuleId;
const asProposalId = (s: string): ProposalId => s as ProposalId;
const asVoteId = (s: string): VoteId => s as VoteId;

// ============================================================================
// PUBLIC TYPES
// ============================================================================

export type PostVisibility = "members-only" | "public-preview";

export interface CircleRule {
  readonly id: RuleId;
  readonly circleId: CircleId | null; // null = default
  readonly code: string; // 'no-proselytizing' — stable identifier
  readonly title: string;
  readonly description: string;
  readonly severity: "low" | "medium" | "high";
  readonly addedBy: UserId | null; // null = built-in
  readonly addedAt: string;
  readonly removable: boolean;
}

export interface CircleRuleProposal {
  readonly id: ProposalId;
  readonly circleId: CircleId;
  readonly proposedBy: UserId;
  readonly type: "add" | "remove" | "modify";
  readonly ruleId: RuleId | null; // for remove/modify
  readonly payload: {
    readonly code: string;
    readonly title: string;
    readonly description: string;
    readonly severity: CircleRule["severity"];
  } | null; // for add/modify
  readonly status: "open" | "passed" | "failed" | "cancelled";
  readonly createdAt: string;
  readonly decidedAt: string | null;
  readonly quorumRequired: number;
  readonly yesVotes: number;
  readonly noVotes: number;
  readonly abstainVotes: number;
  readonly voters: readonly UserId[];
}

export interface CircleVote {
  readonly id: VoteId;
  readonly proposalId: ProposalId;
  readonly voterId: UserId;
  readonly vote: "yes" | "no" | "abstain";
  readonly createdAt: string;
}

export interface CanPostCheck {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly ruleViolated?: RuleId | string;
}

export interface RateLimitState {
  readonly userId: string;
  readonly circleId: string;
  readonly windowStart: string;
  readonly postsInWindow: number;
  readonly postsRemaining: number;
  readonly resetAt: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Default rate limit: posts per (user, circle) per hour. */
export const DEFAULT_RATE_LIMIT_PER_HOUR = 5;

/** Quorum: minimum participation ratio (0-1) before a proposal can pass. */
export const DEFAULT_QUORUM = 0.25; // 25% of active members must vote
/** Majority threshold for yes/no (excludes abstain). */
export const DEFAULT_PASS_THRESHOLD = 0.6; // 60% yes (out of yes+no)

export const POST_VISIBILITY_OPTIONS: readonly PostVisibility[] = [
  "members-only",
  "public-preview",
];

let _hmacSecret = "";

// ============================================================================
// DEFAULT RULES — 8+ community standards
// ============================================================================

export const DEFAULT_RULES: readonly CircleRule[] = Object.freeze([
  {
    id: asRuleId("rule-default-respect"),
    circleId: null,
    code: "respect-all-paths",
    title: "Respeitar todos os caminhos",
    description: "Não desqualificar, ridicularizar ou diminuir tradições, práticas ou crenças de outros membros.",
    severity: "high",
    addedBy: null,
    addedAt: "2026-06-30T00:00:00.000Z",
    removable: false,
  },
  {
    id: asRuleId("rule-default-no-harassment"),
    circleId: null,
    code: "no-harassment",
    title: "Sem assédio",
    description: "Não toleramos assédio, discurso de ódio ou comportamento intimidador.",
    severity: "high",
    addedBy: null,
    addedAt: "2026-06-30T00:00:00.000Z",
    removable: false,
  },
  {
    id: asRuleId("rule-default-no-proselytizing"),
    circleId: null,
    code: "no-proselytizing",
    title: "Sem proselitismo",
    description: "Não usar o círculo para converter membros a outras tradições ou práticas.",
    severity: "medium",
    addedBy: null,
    addedAt: "2026-06-30T00:00:00.000Z",
    removable: false,
  },
  {
    id: asRuleId("rule-default-no-commercial"),
    circleId: null,
    code: "no-commercial-without-approval",
    title: "Sem conteúdo comercial sem aprovação",
    description: "Promoção de produtos ou serviços requer aprovação explícita de admin ou moderador.",
    severity: "medium",
    addedBy: null,
    addedAt: "2026-06-30T00:00:00.000Z",
    removable: false,
  },
  {
    id: asRuleId("rule-default-ptbr-primary"),
    circleId: null,
    code: "pt-br-primary",
    title: "Português como idioma primário",
    description: "Posts em outros idiomas são bem-vindos, mas o conteúdo primário deve ser em Português.",
    severity: "low",
    addedBy: null,
    addedAt: "2026-06-30T00:00:00.000Z",
    removable: true, // removable per-circle
  },
  {
    id: asRuleId("rule-default-no-spam"),
    circleId: null,
    code: "no-spam",
    title: "Sem spam",
    description: "Não publicar conteúdo repetido, irrelevante ou auto-promocional em excesso.",
    severity: "medium",
    addedBy: null,
    addedAt: "2026-06-30T00:00:00.000Z",
    removable: false,
  },
  {
    id: asRuleId("rule-default-respect-privacy"),
    circleId: null,
    code: "respect-privacy",
    title: "Respeitar a privacidade",
    description: "Não compartilhar informações pessoais, fotos ou conteúdo privado de outros membros sem consentimento.",
    severity: "high",
    addedBy: null,
    addedAt: "2026-06-30T00:00:00.000Z",
    removable: false,
  },
  {
    id: asRuleId("rule-default-no-medical-advice"),
    circleId: null,
    code: "no-medical-advice",
    title: "Sem conselhos médicos",
    description: "Compartilhamentos são reflexivos. Não substituir orientação médica, psicológica ou jurídica profissional.",
    severity: "high",
    addedBy: null,
    addedAt: "2026-06-30T00:00:00.000Z",
    removable: false,
  },
  {
    id: asRuleId("rule-default-pii-careful"),
    circleId: null,
    code: "pii-careful",
    title: "Cuidado com dados pessoais (LGPD)",
    description: "Membros podem sair a qualquer momento com remoção de PII. Conteúdo pode ser anonimizado se o círculo for arquivado.",
    severity: "low",
    addedBy: null,
    addedAt: "2026-06-30T00:00:00.000Z",
    removable: false,
  },
]);

// ============================================================================
// ERRORS
// ============================================================================

export class GovernanceValidationError extends Error {
  constructor(reason: string) {
    super(`Governance validation: ${reason}`);
    this.name = "GovernanceValidationError";
  }
}

export class GovernanceForbiddenError extends Error {
  constructor(reason: string) {
    super(`Forbidden: ${reason}`);
    this.name = "GovernanceForbiddenError";
  }
}

export class ProposalNotFoundError extends Error {
  constructor(id: string) {
    super(`Proposal not found: ${id}`);
    this.name = "ProposalNotFoundError";
  }
}

export class RuleNotFoundError extends Error {
  constructor(id: string) {
    super(`Rule not found: ${id}`);
    this.name = "RuleNotFoundError";
  }
}

// ============================================================================
// HMAC
// ============================================================================

export function setHmacSecret(secret: string): void {
  if (typeof secret !== "string") throw new GovernanceValidationError("HMAC secret must be a string");
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

function generateId(prefix: string): string {
  const payload = `${Date.now()}:${prefix}:${_hmacSecret}`;
  return `${prefix}_${fnv1a(payload)}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

// ============================================================================
// STORAGE
// ============================================================================

/** Default rules + per-circle custom rules. */
const CUSTOM_RULES: Map<string, CircleRule[]> = new Map(); // circleId → rules[]

const PROPOSALS: Map<string, CircleRuleProposal> = new Map();
const VOTES: Map<string, CircleVote[]> = new Map(); // proposalId → votes[]

/** Rate limit windows. Key = `${userId}@${circleId}`. */
interface RateWindow {
  windowStart: number;
  posts: number;
}
const RATE_WINDOWS: Map<string, RateWindow> = new Map();

/** Per-circle active member count (cached). Used for quorum sizing. */
const CIRCLE_ACTIVE_MEMBERS: Map<string, number> = new Map();

/** Per-circle rate-limit override. */
const CIRCLE_RATE_LIMITS: Map<string, number> = new Map();

function customRules(circleId: CircleId): CircleRule[] {
  let list = CUSTOM_RULES.get(circleId);
  if (!list) {
    list = [];
    CUSTOM_RULES.set(circleId, list);
  }
  return list;
}

// ============================================================================
// HELPERS
// ============================================================================

function ensureString(value: unknown, name: string): string {
  if (typeof value !== "string") {
    throw new GovernanceValidationError(`${name} must be a string`);
  }
  return value;
}

function rateKey(userId: string, circleId: string): string {
  return `${userId}@${circleId}`;
}

function isAdmin(actor: UserId, circleId: CircleId): boolean {
  const m = findActiveMembership(actor, circleId);
  return Boolean(m) && m!.role === "admin";
}

function isMember(actor: UserId, circleId: CircleId): boolean {
  return findActiveMembership(actor, circleId) !== null;
}

function effectiveRules(circleId: CircleId): CircleRule[] {
  return [...DEFAULT_RULES, ...customRules(circleId)];
}

// ============================================================================
// CRUD — addCustomRule / removeCustomRule / getRules
// ============================================================================

/** Add a custom rule to a circle (admin only). */
export function addCustomRule(
  actor: UserId | string,
  circleId: CircleId | string,
  code: string,
  title: string,
  description: string,
  severity: CircleRule["severity"] = "medium",
  now: Date = new Date(),
): CircleRule {
  const actorId = ensureString(actor, "actor") as UserId;
  const circleIdN = getCircle(circleId).id;

  if (!isAdmin(actorId, circleIdN)) {
    throw new GovernanceForbiddenError("only admin can add rules");
  }
  const rawCode = ensureString(code, "code").trim();
  const codeTrim = rawCode.toLowerCase();
  const titleTrim = ensureString(title, "title").trim();
  const descTrim = ensureString(description, "description").trim();
  if (rawCode.length < 3 || rawCode.length > 60) {
    throw new GovernanceValidationError(
      `code length must be 3-60 (got ${rawCode.length})`,
    );
  }
  // Validate kebab-case on the original (lowercase) form. If rawCode has
  // any uppercase, the lowercase form would hide it — so check the raw
  // form too.
  if (rawCode !== codeTrim) {
    throw new GovernanceValidationError(
      `code must be lowercase (got "${rawCode}")`,
    );
  }
  if (!/^[a-z0-9-]+$/.test(codeTrim)) {
    throw new GovernanceValidationError(
      `code must be kebab-case (a-z0-9 only): ${codeTrim}`,
    );
  }
  if (titleTrim.length === 0 || titleTrim.length > 200) {
    throw new GovernanceValidationError("title must be 1-200 chars");
  }
  if (descTrim.length === 0 || descTrim.length > 2000) {
    throw new GovernanceValidationError("description must be 1-2000 chars");
  }
  if (!["low", "medium", "high"].includes(severity)) {
    throw new GovernanceValidationError(`invalid severity: ${severity}`);
  }

  const allRules = effectiveRules(circleIdN);
  if (allRules.some((r) => r.code === codeTrim)) {
    throw new GovernanceValidationError(`rule already exists: ${codeTrim}`);
  }

  const id = asRuleId(generateId("rule"));
  const rule: CircleRule = {
    id,
    circleId: circleIdN,
    code: codeTrim,
    title: titleTrim,
    description: descTrim,
    severity,
    addedBy: actorId,
    addedAt: now.toISOString(),
    removable: true,
  };
  customRules(circleIdN).push(rule);
  return rule;
}

/** Remove a custom rule (admin only). Cannot remove built-in defaults. */
export function removeCustomRule(
  actor: UserId | string,
  circleId: CircleId | string,
  ruleId: string,
): CircleRule {
  const actorId = ensureString(actor, "actor") as UserId;
  const circleIdN = getCircle(circleId).id;
  if (!isAdmin(actorId, circleIdN)) {
    throw new GovernanceForbiddenError("only admin can remove rules");
  }
  const list = customRules(circleIdN);
  const idx = list.findIndex((r) => r.id === ruleId);
  if (idx === -1) {
    throw new RuleNotFoundError(ruleId);
  }
  const [removed] = list.splice(idx, 1);
  CUSTOM_RULES.set(circleIdN, list);
  return removed;
}

/** Get effective rules (defaults + customs) for a circle. */
export function getRules(circleId: CircleId | string): readonly CircleRule[] {
  const circleIdN = getCircle(circleId).id;
  return effectiveRules(circleIdN);
}

/** Adjust active member count (called by membership engine). */
export function setActiveMemberCount(circleId: CircleId | string, count: number): void {
  const circleIdN = getCircle(circleId).id;
  CIRCLE_ACTIVE_MEMBERS.set(circleIdN, Math.max(0, Math.floor(count)));
}

/** Override rate limit for a circle. */
export function setCircleRateLimit(circleId: CircleId | string, limit: number): void {
  const circleIdN = getCircle(circleId).id;
  if (limit < 1 || limit > 1000) {
    throw new GovernanceValidationError(`invalid rate limit: ${limit}`);
  }
  CIRCLE_RATE_LIMITS.set(circleIdN, limit);
}

// ============================================================================
// RATE-LIMIT
// ============================================================================

/** Per-circle rate limit (default 5/hour). */
export function getCircleRateLimit(circleId: CircleId | string): number {
  const circleIdN = getCircle(circleId).id;
  return CIRCLE_RATE_LIMITS.get(circleIdN) ?? DEFAULT_RATE_LIMIT_PER_HOUR;
}

const HOUR_MS = 60 * 60 * 1000;

/**
 * Read-only inspection: how many posts has the user made in the
 * current hour window for this circle?
 */
export function rateLimitStatus(
  userId: UserId | string,
  circleId: CircleId | string,
  now: Date = new Date(),
): RateLimitState {
  const userIdStr = ensureString(userId, "userId");
  const circleIdStr = ensureString(circleId, "circleId");
  const key = rateKey(userIdStr, circleIdStr);
  const limit = getCircleRateLimit(circleIdStr);
  const window = RATE_WINDOWS.get(key);
  const nowMs = now.getTime();
  if (!window || nowMs - window.windowStart >= HOUR_MS) {
    return {
      userId: userIdStr,
      circleId: circleIdStr,
      windowStart: now.toISOString(),
      postsInWindow: 0,
      postsRemaining: limit,
      resetAt: new Date(nowMs + HOUR_MS).toISOString(),
    };
  }
  return {
    userId: userIdStr,
    circleId: circleIdStr,
    windowStart: new Date(window.windowStart).toISOString(),
    postsInWindow: window.posts,
    postsRemaining: Math.max(0, limit - window.posts),
    resetAt: new Date(window.windowStart + HOUR_MS).toISOString(),
  };
}

/** Increment the rate-limit counter (called by feed.postToCircle). */
export function recordPostForRateLimit(
  userId: UserId | string,
  circleId: CircleId | string,
  now: Date = new Date(),
): void {
  const userIdStr = ensureString(userId, "userId");
  const circleIdStr = ensureString(circleId, "circleId");
  const key = rateKey(userIdStr, circleIdStr);
  const nowMs = now.getTime();
  const window = RATE_WINDOWS.get(key);
  if (!window || nowMs - window.windowStart >= HOUR_MS) {
    RATE_WINDOWS.set(key, { windowStart: nowMs, posts: 1 });
    return;
  }
  window.posts += 1;
  RATE_WINDOWS.set(key, window);
}

/** Clear rate-limit store (test-only helper). */
export function clearRateLimitsForTest(): void {
  RATE_WINDOWS.clear();
}

// ============================================================================
// PRE-FLIGHT — canPost
// ============================================================================

/**
 * Pre-flight check before posting. Returns violation reason if denied.
 * Pure — never throws on rule violation (returns CanPostCheck).
 *
 * Checks (in order):
 *   1. Membership
 *   2. Content shape (length, lowercase)
 *   3. Rule violations (severity-aware)
 *   4. Rate limit
 *
 * Note: rate-limit check uses `rateLimitStatus` which is a READ; the
 * actual increment happens in `recordPostForRateLimit` AFTER post
 * creation in feed.ts.
 */
export function canPost(
  userId: UserId | string,
  circleId: CircleId | string,
  content: string,
  now: Date = new Date(),
): CanPostCheck {
  const userIdStr = ensureString(userId, "userId");
  const circleIdN = getCircle(circleId).id;
  const contentStr = ensureString(content, "content").trim();

  if (contentStr.length === 0) {
    return { allowed: false, reason: "content cannot be empty" };
  }
  if (contentStr.length > 10000) {
    return { allowed: false, reason: "content exceeds 10000 chars" };
  }

  // Membership required
  const userIdN = userIdStr as UserId;
  if (!isMember(userIdN, circleIdN)) {
    return { allowed: false, reason: "membership required to post" };
  }

  // Rule violations
  const ruleViolations = checkRules(contentStr, effectiveRules(circleIdN));
  if (ruleViolations) {
    return ruleViolations;
  }

  // Rate limit
  const state = rateLimitStatus(userIdStr, circleIdN, now);
  if (state.postsInWindow >= state.postsRemaining + state.postsInWindow) {
    // Already at limit
    return {
      allowed: false,
      reason: `rate limit reached (${state.postsInWindow} posts this hour, limit ${state.postsRemaining + state.postsInWindow})`,
    };
  }

  return { allowed: true };
}

/**
 * Inspect content against rules. Returns the first violation.
 * Heuristics by rule code:
 *   no-proselytizing: detect phrases promoting other traditions.
 *   no-spam: detect repetition + url density + all-caps density.
 *   no-harassment: detected via hotword scan.
 *   no-medical-advice: detected via medical advice keywords.
 *   no-commercial-without-approval: detect payment/sell phrases.
 *   pii-careful: detect email/phone patterns.
 *
 * Heuristic is intentionally light-touch: severe rules only catch
 * obvious patterns. Real moderation happens in the moderation engine.
 */
export function checkRules(
  content: string,
  rules: readonly CircleRule[],
): CanPostCheck | null {
  const lower = content.toLowerCase();

  // Spam heuristics
  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    // Repetition: same word > 50% of body
    const freq = new Map<string, number>();
    for (const w of words) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
    let maxRepeat = 0;
    for (const v of freq.values()) if (v > maxRepeat) maxRepeat = v;
    if (words.length >= 10 && maxRepeat / words.length > 0.5) {
      const spamRule = rules.find((r) => r.code === "no-spam");
      if (spamRule) return { allowed: false, reason: "possible spam (high word repetition)", ruleViolated: spamRule.id };
    }
    // URL density
    const urls = content.match(/https?:\/\/\S+/g);
    if (urls && urls.length > 5) {
      const spamRule = rules.find((r) => r.code === "no-spam");
      if (spamRule) return { allowed: false, reason: "too many URLs in one post", ruleViolated: spamRule.id };
    }
  }

  // Commercial phrases
  const commercialRegex = /\b(compr[ae]|vend[ae]|promo[cç][aã]o|preço|r\$|r\$ ?\d|pix)\b/i;
  if (commercialRegex.test(content)) {
    const rule = rules.find((r) => r.code === "no-commercial-without-approval");
    if (rule) return { allowed: false, reason: "commercial content needs admin approval", ruleViolated: rule.id };
  }

  // Medical advice
  const medicalRegex = /\b(diagn[oó]stic[oa]|receit[ao] (?:m[eé]dic[oa]|rem[eé]dio)|tom[ae] (?:este|esse) (?:rem[eé]dio|medicamento))\b/i;
  if (medicalRegex.test(content)) {
    const rule = rules.find((r) => r.code === "no-medical-advice");
    if (rule) return { allowed: false, reason: "medical advice is not allowed", ruleViolated: rule.id };
  }

  // Harassment (heavier wordlist)
  const HARASSMENT = [
    "merda", "lixo", "imbecil", "idiota", "nojento", "abasal",
    "burra", "burro", "feia", "feio",
  ];
  for (const w of HARASSMENT) {
    if (lower.includes(w)) {
      const rule = rules.find((r) => r.code === "no-harassment");
      if (rule) return { allowed: false, reason: "harassment detected", ruleViolated: rule.id };
    }
  }

  // PII (email + brazilian phone patterns)
  const piiRegex = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})|(?:\+?55\s?\(?\d{2}\)?\s?9?\d{4}-?\d{4})/i;
  if (piiRegex.test(content)) {
    const rule = rules.find((r) => r.code === "pii-careful");
    if (rule) return { allowed: false, reason: "PII detected (email or phone) — please remove", ruleViolated: rule.id };
  }

  // Proselytizing — match "Converta-se para X" / "Deixe-se levar à X"
  const proselyRegex =
    /\b(?:deixe[\s-]?[a-z]*|converta[\s-]?[a-z]*|abandone)\b[^.\n!?]{0,80}\b(?:para|\u00e0)\s+\w/i;
  if (proselyRegex.test(content)) {
    const rule = rules.find((r) => r.code === "no-proselytizing");
    if (rule) return { allowed: false, reason: "proselytizing is not allowed", ruleViolated: rule.id };
  }

  return null;
}

// ============================================================================
// PROPOSALS — proposeRuleChange + voteOnProposal + tallyProposal
// ============================================================================

/**
 * Propose a rule change (democratic circle only).
 */
export function proposeRuleChange(
  actor: UserId | string,
  circleId: CircleId | string,
  type: "add" | "remove" | "modify",
  options: {
    readonly ruleId?: string;
    readonly code?: string;
    readonly title?: string;
    readonly description?: string;
    readonly severity?: CircleRule["severity"];
  },
  now: Date = new Date(),
): CircleRuleProposal {
  const actorId = ensureString(actor, "actor") as UserId;
  const circleIdN = getCircle(circleId).id;
  const circle = getCircle(circleIdN);
  if (circle.governance !== "democratic") {
    throw new GovernanceForbiddenError(
      "circle governance is not democratic — admins decide directly",
    );
  }
  if (!isMember(actorId, circleIdN)) {
    throw new GovernanceForbiddenError("must be a member to propose");
  }

  let ruleId: RuleId | null = null;
  let payload: CircleRuleProposal["payload"] = null;
  if (type === "add") {
    if (!options.code || !options.title || !options.description || !options.severity) {
      throw new GovernanceValidationError("add proposal requires code, title, description, severity");
    }
    payload = {
      code: options.code.trim().toLowerCase(),
      title: options.title.trim(),
      description: options.description.trim(),
      severity: options.severity,
    };
  } else if (type === "remove") {
    if (!options.ruleId) throw new GovernanceValidationError("remove proposal requires ruleId");
    ruleId = asRuleId(options.ruleId);
  } else {
    if (!options.ruleId) throw new GovernanceValidationError("modify proposal requires ruleId");
    if (!options.code || !options.title || !options.description || !options.severity) {
      throw new GovernanceValidationError("modify proposal requires all fields");
    }
    ruleId = asRuleId(options.ruleId);
    payload = {
      code: options.code.trim().toLowerCase(),
      title: options.title.trim(),
      description: options.description.trim(),
      severity: options.severity,
    };
  }

  const id = asProposalId(generateId("prop"));
  const activeMembers = CIRCLE_ACTIVE_MEMBERS.get(circleIdN) ?? 1;
  const quorumRequired = Math.max(1, Math.ceil(activeMembers * DEFAULT_QUORUM));

  const proposal: CircleRuleProposal = {
    id,
    circleId: circleIdN,
    proposedBy: actorId,
    type,
    ruleId,
    payload,
    status: "open",
    createdAt: now.toISOString(),
    decidedAt: null,
    quorumRequired,
    yesVotes: 0,
    noVotes: 0,
    abstainVotes: 0,
    voters: [],
  };
  PROPOSALS.set(id, proposal);
  VOTES.set(id, []);
  return proposal;
}

/** Vote on a proposal. Each member votes once. */
export function voteOnProposal(
  actor: UserId | string,
  proposalId: string,
  vote: "yes" | "no" | "abstain",
  now: Date = new Date(),
): { readonly vote: CircleVote; readonly proposal: CircleRuleProposal } {
  const actorId = ensureString(actor, "actor") as UserId;
  const proposal = PROPOSALS.get(proposalId);
  if (!proposal) throw new ProposalNotFoundError(proposalId);
  if (proposal.status !== "open") {
    throw new GovernanceForbiddenError(`proposal is ${proposal.status}`);
  }
  if (!isMember(actorId, proposal.circleId)) {
    throw new GovernanceForbiddenError("voter must be a member");
  }
  const existing = VOTES.get(proposalId) ?? [];
  if (existing.some((v) => v.voterId === actorId)) {
    throw new GovernanceForbiddenError("voter has already voted");
  }

  const voteId = asVoteId(generateId("vote"));
  const v: CircleVote = {
    id: voteId,
    proposalId: proposal.id,
    voterId: actorId,
    vote,
    createdAt: now.toISOString(),
  };
  existing.push(v);
  VOTES.set(proposalId, existing);

  // Tally
  const yes = existing.filter((x) => x.vote === "yes").length;
  const no = existing.filter((x) => x.vote === "no").length;
  const abs = existing.filter((x) => x.vote === "abstain").length;

  const updatedProposal: CircleRuleProposal = {
    ...proposal,
    yesVotes: yes,
    noVotes: no,
    abstainVotes: abs,
    voters: existing.map((x) => x.voterId),
  };

  // Check pass/fail based on quorum + majority
  const totalVoters = yes + no + abs;
  const yesVsNo = yes + no;
  const meetsQuorum = totalVoters >= proposal.quorumRequired;
  const majorityPass = yesVsNo > 0 && yes / yesVsNo >= DEFAULT_PASS_THRESHOLD;
  if (meetsQuorum) {
    if (majorityPass) {
      const passed: CircleRuleProposal = {
        ...updatedProposal,
        status: "passed",
        decidedAt: now.toISOString(),
      };
      PROPOSALS.set(proposalId, passed);
      applyProposalSideEffects(passed, proposal.id as never, now);
      return { vote: v, proposal: passed };
    }
    const failed: CircleRuleProposal = {
      ...updatedProposal,
      status: "failed",
      decidedAt: now.toISOString(),
    };
    PROPOSALS.set(proposalId, failed);
    return { vote: v, proposal: failed };
  }

  PROPOSALS.set(proposalId, updatedProposal);
  return { vote: v, proposal: updatedProposal };
}

/**
 * Apply side-effects of a "passed" proposal — mutates CUSTOM_RULES.
 * Extracted so both voteOnProposal (auto-pass) and finalizeProposal
 * (manual admin override) use the same code path.
 */
function applyProposalSideEffects(
  proposal: CircleRuleProposal,
  proposalId: ProposalId,
  now: Date = new Date(),
): void {
  if (proposal.status !== "passed") return;
  if (proposal.type === "add" && proposal.payload) {
    const id = asRuleId(generateId("rule"));
    const newRule: CircleRule = {
      id,
      circleId: proposal.circleId,
      code: proposal.payload.code,
      title: proposal.payload.title,
      description: proposal.payload.description,
      severity: proposal.payload.severity,
      addedBy: proposal.proposedBy,
      addedAt: proposal.decidedAt ?? now.toISOString(),
      removable: true,
    };
    customRules(proposal.circleId).push(newRule);
  } else if (proposal.type === "remove" && proposal.ruleId) {
    const list = customRules(proposal.circleId);
    const idx = list.findIndex((r) => r.id === proposal.ruleId);
    if (idx !== -1) {
      const [r] = list.splice(idx, 1);
      void r;
    }
    CUSTOM_RULES.set(proposal.circleId, list);
  } else if (proposal.type === "modify" && proposal.ruleId && proposal.payload) {
    const list = customRules(proposal.circleId);
    const idx = list.findIndex((r) => r.id === proposal.ruleId);
    if (idx !== -1) {
      const existing = list[idx]!;
      list[idx] = {
        ...existing,
        code: proposal.payload.code,
        title: proposal.payload.title,
        description: proposal.payload.description,
        severity: proposal.payload.severity,
      };
    }
    CUSTOM_RULES.set(proposal.circleId, list);
  }
  void proposalId;
}

/** Force-finalize a proposal (admin shortcut — for `creator-decides` fallback). */
export function finalizeProposal(
  actor: UserId | string,
  proposalId: string,
  decision: "pass" | "fail" | "cancel",
  now: Date = new Date(),
): CircleRuleProposal {
  const actorId = ensureString(actor, "actor") as UserId;
  const proposal = PROPOSALS.get(proposalId);
  if (!proposal) throw new ProposalNotFoundError(proposalId);
  if (!isAdmin(actorId, proposal.circleId)) {
    throw new GovernanceForbiddenError("only admin can finalize");
  }
  if (proposal.status !== "open") return proposal;

  let status: CircleRuleProposal["status"];
  if (decision === "cancel") status = "cancelled";
  else if (decision === "pass") status = "passed";
  else status = "failed";

  const updated: CircleRuleProposal = {
    ...proposal,
    status,
    decidedAt: now.toISOString(),
  };
  PROPOSALS.set(proposalId, updated);

  applyProposalSideEffects(updated, proposal.id, now);

  return updated;
}

/** Read-only: tally a proposal. */
export function tallyProposal(proposalId: string): {
  readonly yes: number;
  readonly no: number;
  readonly abstain: number;
  readonly totalVoters: number;
  readonly quorumRequired: number;
  readonly quorumMet: boolean;
  readonly majorityPass: boolean;
} {
  const p = PROPOSALS.get(proposalId);
  if (!p) throw new ProposalNotFoundError(proposalId);
  const yesVsNo = p.yesVotes + p.noVotes;
  return {
    yes: p.yesVotes,
    no: p.noVotes,
    abstain: p.abstainVotes,
    totalVoters: p.yesVotes + p.noVotes + p.abstainVotes,
    quorumRequired: p.quorumRequired,
    quorumMet: p.yesVotes + p.noVotes + p.abstainVotes >= p.quorumRequired,
    majorityPass: yesVsNo > 0 && p.yesVotes / yesVsNo >= DEFAULT_PASS_THRESHOLD,
  };
}

/** Get all proposals (optionally filter by status). */
export function listProposals(
  circleId: CircleId | string,
  status?: CircleRuleProposal["status"],
): readonly CircleRuleProposal[] {
  const circleIdN = getCircle(circleId).id;
  const out: CircleRuleProposal[] = [];
  for (const p of PROPOSALS.values()) {
    if (p.circleId !== circleIdN) continue;
    if (status && p.status !== status) continue;
    out.push(p);
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ============================================================================
// AUDIT — exported shape
// ============================================================================

export interface GovernanceAuditRules {
  readonly defaultRuleCount: number;
  readonly rateLimitDefault: number;
  readonly quorumDefault: number;
  readonly passThresholdDefault: number;
  readonly proposalTypes: readonly string[];
  readonly voteOptions: readonly string[];
  readonly maxDescriptionLength: number;
  readonly circleCustomRulesCount: number;
}

export function auditGovernanceRules(): GovernanceAuditRules {
  let customCount = 0;
  for (const list of CUSTOM_RULES.values()) customCount += list.length;
  return {
    defaultRuleCount: DEFAULT_RULES.length,
    rateLimitDefault: DEFAULT_RATE_LIMIT_PER_HOUR,
    quorumDefault: DEFAULT_QUORUM,
    passThresholdDefault: DEFAULT_PASS_THRESHOLD,
    proposalTypes: ["add", "remove", "modify"],
    voteOptions: ["yes", "no", "abstain"],
    maxDescriptionLength: 2000,
    circleCustomRulesCount: customCount,
  };
}

// ============================================================================
// TEST-ONLY
// ============================================================================

export function clearAllStores(): void {
  CUSTOM_RULES.clear();
  PROPOSALS.clear();
  VOTES.clear();
  RATE_WINDOWS.clear();
  CIRCLE_ACTIVE_MEMBERS.clear();
  CIRCLE_RATE_LIMITS.clear();
  _hmacSecret = "";
}
