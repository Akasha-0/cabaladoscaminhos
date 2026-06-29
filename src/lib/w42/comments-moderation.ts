/**
 * comments-moderation.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * W42 — Comments Moderation Engine for the Akasha Portal.
 *
 * Provides:
 *  - Rule-based auto-moderation (regex + heuristics) with severity tiers.
 *  - In-memory mod queue (FIFO) for human review of flagged comments.
 *  - BanManager (timed + permanent), TimeoutManager (mute), AuditLog (JSONL).
 *  - Profanity filter (PT-BR + EN), spam detector, sliding-window rate limiter.
 *  - User reputation scorer, auto-mod presets (strict / moderate / lenient).
 *  - Appeal flow, shadowban mode, domain whitelist/blacklist, @akasha priority.
 *  - Cultural-sensitivity detector (axé / orixás / saudação context).
 *
 * Pure TypeScript — no external dependencies. Designed to be portable between
 * Node.js and edge runtimes (Vercel Edge / Cloudflare Workers).
 *
 * @module w42/comments-moderation
 * @since 2026-06-29 (cycle 42)
 */

// ───────────────────────────────────────────────────────────────────────────────
// 1. CORE TYPES
// ───────────────────────────────────────────────────────────────────────────────

/** Severity tier assigned to a moderation rule hit. */
export type ModerationSeverity = 'warn' | 'hide' | 'ban';

/** All possible outcomes of evaluating a comment. */
export const ModerationAction = {
  ALLOW: 'ALLOW',
  FLAG: 'FLAG',
  HIDE: 'HIDE',
  DELETE: 'DELETE',
  WARN: 'WARN',
  TIMEOUT: 'TIMEOUT',
  BAN: 'BAN',
} as const;
export type ModerationAction = (typeof ModerationAction)[keyof typeof ModerationAction];

/** A single auto-moderation rule. Patterns are evaluated case-insensitively. */
export interface ModerationRule {
  /** Stable identifier — e.g. "profanity-pt", "spam-urls". */
  id: string;
  /** Human-readable label shown in admin UI. */
  name: string;
  /** Regex source applied to the normalized text. */
  pattern: string;
  /** Action severity when the rule matches. */
  severity: ModerationSeverity;
  /** Pre-baked ModerationAction mapped from severity. */
  action: ModerationAction;
  /** Optional human-readable reason text (defaults to rule.name). */
  reason?: string;
  /** Multiplier applied to the rule confidence (0–2). 1.0 = neutral. */
  weight?: number;
  /** Tags for grouping in admin dashboards. */
  tags?: string[];
  /** When true, match is treated as a soft signal (lower confidence). */
  soft?: boolean;
  /** ISO timestamp the rule was created (audit trail). */
  createdAt?: string;
}

/** Result of running the auto-mod engine on a single comment. */
export interface ModerationDecision {
  /** Resolved action — the strongest of all matching rules. */
  action: ModerationAction;
  /** Reason text surfaced to moderators and (optionally) the user. */
  reason: string;
  /** Identifier of the rule that triggered the decision, when any. */
  ruleId: string | null;
  /** Confidence score between 0 and 1. */
  confidence: number;
  /** All rule matches during evaluation, in evaluation order. */
  matches: Array<{ ruleId: string; confidence: number; severity: ModerationSeverity }>;
  /** Optional token identifying this decision for appeal/audit. */
  decisionId: string;
  /** ISO timestamp the decision was produced. */
  evaluatedAt: string;
  /** Whether the comment is shadowbanned (author still sees it). */
  shadowbanned: boolean;
}

/** Context passed alongside the comment text for richer decisions. */
export interface ModerationContext {
  authorId: string;
  authorReputation?: number;
  isAkashaMention?: boolean;
  locale?: 'pt-BR' | 'en' | 'es';
  previousDecisions?: ModerationDecision[];
  metadata?: Record<string, string | number | boolean>;
}

/** Public shape of a queued item awaiting human review. */
export interface ModQueueItem {
  decisionId: string;
  text: string;
  authorId: string;
  decision: ModerationDecision;
  enqueuedAt: string;
  priority: number;
  reason: string;
}

/** A ban record. */
export interface BanRecord {
  userId: string;
  reason: string;
  /** ISO timestamp the ban expires (undefined = permanent). */
  expiresAt: string | null;
  /** ISO timestamp the ban was issued. */
  issuedAt: string;
  /** Identifier of the moderator / system that issued the ban. */
  issuedBy: string;
}

/** A timeout / mute record. */
export interface TimeoutRecord {
  userId: string;
  expiresAt: string;
  reason: string;
  issuedAt: string;
}

/** An audit-log entry. */
export interface AuditEvent {
  id: string;
  type:
    | 'decision'
    | 'ban'
    | 'unban'
    | 'timeout'
    | 'clear-timeout'
    | 'appeal'
    | 'queue-enqueue'
    | 'queue-dequeue'
    | 'reputation';
  userId?: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

/** Filter accepted by {@link AuditLog.query}. */
export interface AuditQuery {
  type?: AuditEvent['type'];
  userId?: string;
  from?: string;
  to?: string;
  limit?: number;
}

// ───────────────────────────────────────────────────────────────────────────────
// 2. UTILITIES
// ───────────────────────────────────────────────────────────────────────────────

let __idCounter = 0;

/** Generate a short, monotonic identifier — no crypto dependency. */
export function generateId(prefix = 'mod'): string {
  __idCounter += 1;
  const ts = Date.now().toString(36);
  const seq = __idCounter.toString(36).padStart(3, '0');
  const rand = Math.floor(Math.random() * 0xfff).toString(36).padStart(3, '0');
  return `${prefix}_${ts}${seq}${rand}`;
}

/** Normalize text for rule evaluation: NFKD, lowercase, strip diacritics. */
export function normalizeText(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Clamp a number into [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/** Current ISO timestamp. */
export function nowIso(): string {
  return new Date().toISOString();
}

// ───────────────────────────────────────────────────────────────────────────────
// 3. ACTION RANKING
// ───────────────────────────────────────────────────────────────────────────────

const ACTION_RANK: Record<ModerationAction, number> = {
  [ModerationAction.ALLOW]: 0,
  [ModerationAction.FLAG]: 1,
  [ModerationAction.WARN]: 2,
  [ModerationAction.HIDE]: 3,
  [ModerationAction.DELETE]: 4,
  [ModerationAction.TIMEOUT]: 5,
  [ModerationAction.BAN]: 6,
};

/** Return the more severe of two actions. */
export function strongerAction(a: ModerationAction, b: ModerationAction): ModerationAction {
  return ACTION_RANK[a] >= ACTION_RANK[b] ? a : b;
}

/** Map severity tier to its canonical action. */
export function severityToAction(severity: ModerationSeverity): ModerationAction {
  switch (severity) {
    case 'warn':
      return ModerationAction.WARN;
    case 'hide':
      return ModerationAction.HIDE;
    case 'ban':
      return ModerationAction.BAN;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// 4. PROFANITY FILTER (PT-BR + EN)
// ───────────────────────────────────────────────────────────────────────────────

/** Default wordlist — extend at runtime via {@link extendProfanityWordlist}. */
const DEFAULT_PROFANITY_PT: readonly string[] = [
  'porcaria',
  'merda',
  'bosta',
  'caralho',
  'foda-se',
  'vai se foder',
  'puta',
  'puto',
  'viado',
  'cuzão',
  'desgraça',
  'desgraçado',
  'piranha',
  'vagabunda',
  'vagabundo',
  'fdp',
  'tnc',
  'pqp',
];

const DEFAULT_PROFANITY_EN: readonly string[] = [
  'fuck',
  'shit',
  'bitch',
  'bastard',
  'asshole',
  'dick',
  'cunt',
  'damn',
  'wtf',
  'stfu',
  'motherfucker',
];

/** Combined active wordlist (mutable copy). */
let activeWordlist: string[] = [...DEFAULT_PROFANITY_PT, ...DEFAULT_PROFANITY_EN];

/** Append additional words to the active profanity wordlist. */
export function extendProfanityWordlist(words: readonly string[]): void {
  for (const w of words) {
    if (w && !activeWordlist.includes(w)) activeWordlist.push(w);
  }
}

/** Reset the profanity wordlist back to the PT-BR + EN defaults. */
export function resetProfanityWordlist(): void {
  activeWordlist = [...DEFAULT_PROFANITY_PT, ...DEFAULT_PROFANITY_EN];
}

/** Return a snapshot of the current profanity wordlist. */
export function getProfanityWordlist(): readonly string[] {
  return [...activeWordlist];
}

/** Build a regex matching any word in the wordlist with whole-word boundaries. */
export function buildProfanityRegex(wordlist: readonly string[] = activeWordlist): RegExp {
  if (wordlist.length === 0) return /(?!)/; // never matches
  const escaped = wordlist.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'i');
}

/** Detect profanity hits in text. */
export function detectProfanity(
  text: string,
  wordlist: readonly string[] = activeWordlist,
): string[] {
  const normalized = normalizeText(text);
  const hits: string[] = [];
  for (const word of wordlist) {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(normalized)) hits.push(word);
  }
  return hits;
}

// ───────────────────────────────────────────────────────────────────────────────
// 5. SPAM DETECTOR
// ───────────────────────────────────────────────────────────────────────────────

/** Statistics returned by {@link detectSpam}. */
export interface SpamStats {
  urlCount: number;
  uniqueDomains: number;
  repetitionRatio: number;
  allCapsRatio: number;
  emojiCount: number;
  hasRepeatedChars: boolean;
  spamScore: number; // 0-1
  signals: string[];
}

const URL_RE = /https?:\/\/[^\s<>"']+/gi;
const DOMAIN_RE = /https?:\/\/([^/\s?#]+)/i;
const REPEAT_CHAR_RE = /(.)\1{4,}/;

/** Count words (ignoring whitespace, urls, and punctuation). */
export function countWords(text: string): number {
  const stripped = text.replace(URL_RE, ' ').replace(/[^\p{L}\p{N}'\-\s]/gu, ' ');
  const tokens = stripped.split(/\s+/).filter(Boolean);
  return tokens.length;
}

/** Compute heuristic spam statistics. */
export function detectSpam(text: string): SpamStats {
  const signals: string[] = [];
  const urls = text.match(URL_RE) ?? [];
  const urlCount = urls.length;
  if (urlCount >= 3) signals.push('too-many-urls');

  const domains = new Set<string>();
  for (const u of urls) {
    const m = u.match(DOMAIN_RE);
    if (m && m[1]) domains.add(m[1].toLowerCase());
  }
  const uniqueDomains = domains.size;
  if (uniqueDomains >= 2 && urlCount >= 2) signals.push('multi-domain');

  const totalLen = text.length;
  const letters = text.replace(/[^A-Za-zÀ-ÿ]/g, '');
  const upperLetters = letters.replace(/[^A-ZÁÉÍÓÚÂÊÔÃÕÇ]/g, '');
  const allCapsRatio = letters.length > 0 ? upperLetters.length / letters.length : 0;
  if (allCapsRatio > 0.6 && letters.length > 12) signals.push('all-caps');

  const emojiCount = (text.match(/\p{Extended_Pictographic}/gu) ?? []).length;
  if (emojiCount > 8) signals.push('emoji-spam');

  const hasRepeatedChars = REPEAT_CHAR_RE.test(text);
  if (hasRepeatedChars) signals.push('repeated-chars');

  // Repetition ratio — most-common-word frequency / total words.
  const wordCount = countWords(text);
  let repetitionRatio = 0;
  if (wordCount >= 4) {
    const tokens = text
      .replace(URL_RE, ' ')
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);
    if (tokens.length > 0) {
      const freq = new Map<string, number>();
      for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
      const top = Math.max(...freq.values());
      repetitionRatio = top / tokens.length;
      if (repetitionRatio > 0.5) signals.push('word-repetition');
    }
  }

  // Aggregate score: weighted sum, clamped to [0, 1].
  let score = 0;
  score += Math.min(urlCount, 5) * 0.12;
  score += uniqueDomains * 0.05;
  score += Math.max(0, allCapsRatio - 0.4) * 0.6;
  score += Math.max(0, repetitionRatio - 0.4) * 0.6;
  score += hasRepeatedChars ? 0.2 : 0;
  score += Math.max(0, emojiCount - 6) * 0.04;
  return { urlCount, uniqueDomains, repetitionRatio, allCapsRatio, emojiCount, hasRepeatedChars, spamScore: clamp(score, 0, 1), signals };
}

// ───────────────────────────────────────────────────────────────────────────────
// 6. RATE LIMITER (sliding window)
// ───────────────────────────────────────────────────────────────────────────────

/** Sliding-window per-user rate limiter. */
export class RateLimiter {
  private readonly windows = new Map<string, number[]>();
  constructor(
    private readonly windowMs: number = 60_000,
    private readonly maxEvents: number = 5,
  ) {}

  /** Record an event for a key. Returns true if within the limit. */
  hit(key: string): boolean {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    const arr = this.windows.get(key) ?? [];
    const filtered = arr.filter((t) => t > cutoff);
    if (filtered.length >= this.maxEvents) {
      this.windows.set(key, filtered);
      return false;
    }
    filtered.push(now);
    this.windows.set(key, filtered);
    return true;
  }

  /** Remaining quota for a key (best-effort, does not record). */
  remaining(key: string): number {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    const arr = (this.windows.get(key) ?? []).filter((t) => t > cutoff);
    return Math.max(0, this.maxEvents - arr.length);
  }

  /** Wipe the record for a single key. */
  reset(key: string): void {
    this.windows.delete(key);
  }

  /** Wipe the entire limiter state. */
  clear(): void {
    this.windows.clear();
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// 7. REPUTATION SCORER
// ───────────────────────────────────────────────────────────────────────────────

/** Per-user reputation. Score is unbounded but typically lives in [-50, +50]. */
export class ReputationScorer {
  private readonly scores = new Map<string, number>();

  /** Increment (or decrement) a user's score. */
  adjust(userId: string, delta: number): number {
    const next = (this.scores.get(userId) ?? 0) + delta;
    this.scores.set(userId, next);
    return next;
  }

  /** Current score for a user (0 if unseen). */
  get(userId: string): number {
    return this.scores.get(userId) ?? 0;
  }

  /** Map reputation into a [0, 1] trust weight. */
  trust(userId: string): number {
    const score = this.get(userId);
    // logistic-ish mapping: -20 → 0, 0 → 0.5, +20 → ~0.88
    return clamp(1 / (1 + Math.exp(-score / 10)), 0, 1);
  }

  /** Threshold above which a user is considered trusted (default +5). */
  isTrusted(userId: string, threshold = 5): boolean {
    return this.get(userId) >= threshold;
  }

  /** Wipe a single user. */
  reset(userId: string): void {
    this.scores.delete(userId);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// 8. PRESET RULE PACKS
// ───────────────────────────────────────────────────────────────────────────────

/** Strict preset — hide on first signal, ban on second. */
export const STRICT_PRESET: ModerationRule[] = [
  { id: 'strict-profanity', name: 'Profanity (strict)', pattern: '', severity: 'hide', action: ModerationAction.HIDE, tags: ['profanity'] },
  { id: 'strict-url', name: 'External URL', pattern: URL_RE.source, severity: 'hide', action: ModerationAction.HIDE, tags: ['spam'] },
  { id: 'strict-repeat', name: 'Repeated characters', pattern: REPEAT_CHAR_RE.source, severity: 'hide', action: ModerationAction.HIDE, tags: ['spam'] },
];

/** Moderate preset — flag suspicious content, hide only on strong signals. */
export const MODERATE_PRESET: ModerationRule[] = [
  { id: 'moderate-profanity', name: 'Profanity', pattern: '', severity: 'warn', action: ModerationAction.WARN, tags: ['profanity'] },
  { id: 'moderate-spam', name: 'Spam heuristics', pattern: '', severity: 'warn', action: ModerationAction.FLAG, tags: ['spam'], soft: true },
];

/** Lenient preset — only act on the most egregious content. */
export const LENIENT_PRESET: ModerationRule[] = [
  { id: 'lenient-profanity', name: 'Profanity (lenient)', pattern: '', severity: 'warn', action: ModerationAction.WARN, tags: ['profanity'], soft: true },
];

/** Resolve a preset by name. */
export function getPreset(name: 'strict' | 'moderate' | 'lenient'): ModerationRule[] {
  switch (name) {
    case 'strict':
      return STRICT_PRESET.map((r) => ({ ...r }));
    case 'moderate':
      return MODERATE_PRESET.map((r) => ({ ...r }));
    case 'lenient':
      return LENIENT_PRESET.map((r) => ({ ...r }));
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// 9. EVALUATOR
// ───────────────────────────────────────────────────────────────────────────────

export interface EvaluateOptions {
  rules?: ModerationRule[];
  reputation?: ReputationScorer;
  rateLimiter?: RateLimiter;
  shadowbannedAuthors?: Set<string>;
  appealsUnderReview?: Set<string>;
  bypassForTrustedUsers?: boolean;
  trustedThreshold?: number;
}

/** Run all enabled rules against the comment and return a decision. */
export function evaluateComment(
  text: string,
  context: ModerationContext,
  options: EvaluateOptions = {},
): ModerationDecision {
  const decisionId = generateId('dec');
  const matches: ModerationDecision['matches'] = [];
  let action: ModerationAction = ModerationAction.ALLOW;
  let ruleId: string | null = null;
  let reason = 'no-rule-matched';
  let confidence = 0;

  const rules = options.rules ?? getPreset('moderate');
  const normalized = normalizeText(text);

  // Rate limit (per-user). Burns a token and produces a soft signal.
  if (options.rateLimiter && context.authorId) {
    const allowed = options.rateLimiter.hit(context.authorId);
    if (!allowed) {
      matches.push({ ruleId: 'rate-limit', confidence: 0.7, severity: 'warn' });
      action = strongerAction(action, ModerationAction.TIMEOUT);
      ruleId = 'rate-limit';
      reason = 'rate-limit-exceeded';
      confidence = Math.max(confidence, 0.7);
    }
  }

  // Trusted-user bypass (reputation > threshold).
  const trust = options.reputation?.trust(context.authorId ?? '') ?? 0.5;
  const trusted =
    options.bypassForTrustedUsers === true &&
    options.reputation?.isTrusted(context.authorId ?? '', options.trustedThreshold ?? 10);

  for (const rule of rules) {
    if (trusted && rule.tags?.includes('profanity')) continue;
    const conf = scoreRule(rule, text, normalized);
    if (conf <= 0) continue;
    const weighted = clamp(conf * (rule.weight ?? 1) * (rule.soft ? 0.5 : 1), 0, 1);
    matches.push({ ruleId: rule.id, confidence: weighted, severity: rule.severity });
    if (weighted > confidence) {
      confidence = weighted;
      ruleId = rule.id;
      reason = rule.reason ?? rule.name;
    }
    action = strongerAction(action, rule.action);
  }

  // @akasha priority: never ban, never timeout. Demote to WARN at worst.
  if (context.isAkashaMention) {
    if (action === ModerationAction.BAN || action === ModerationAction.TIMEOUT) {
      action = ModerationAction.WARN;
      reason = 'akasha-priority-override';
    }
  }

  // Shadowban: visible to author, hidden from others.
  const shadowbanned =
    !!options.shadowbannedAuthors?.has(context.authorId ?? '') && action !== ModerationAction.ALLOW;

  // Empty text → allow but mark.
  if (!text || text.trim().length === 0) {
    return {
      action: ModerationAction.ALLOW,
      reason: 'empty-text',
      ruleId: null,
      confidence: 0,
      matches: [],
      decisionId,
      evaluatedAt: nowIso(),
      shadowbanned: false,
    };
  }

  return {
    action,
    reason,
    ruleId,
    confidence: clamp(confidence, 0, 1),
    matches,
    decisionId,
    evaluatedAt: nowIso(),
    shadowbanned,
  };
}

/** Score a single rule against the text. Returns confidence 0–1. */
export function scoreRule(rule: ModerationRule, text: string, normalized: string): number {
  if (!rule.pattern) return 0;
  try {
    const re = new RegExp(rule.pattern, 'i');
    if (!re.test(text) && !re.test(normalized)) return 0;
    // Base 0.6 confidence; pattern specificity bumps it up.
    const lengthFactor = Math.min(rule.pattern.length / 30, 1);
    return clamp(0.6 + lengthFactor * 0.3, 0, 1);
  } catch {
    return 0;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// 10. MOD QUEUE
// ───────────────────────────────────────────────────────────────────────────────

/** FIFO mod queue with priority insertion for high-severity items. */
export class ModQueue {
  private items: ModQueueItem[] = [];
  private readonly maxSize: number;
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  /** Add an item to the queue. Returns false if the queue is full. */
  enqueue(item: Omit<ModQueueItem, 'enqueuedAt' | 'priority'> & { priority?: number }): boolean {
    if (this.items.length >= this.maxSize) return false;
    const full: ModQueueItem = {
      decisionId: item.decisionId,
      text: item.text,
      authorId: item.authorId,
      decision: item.decision,
      reason: item.reason,
      enqueuedAt: nowIso(),
      priority: item.priority ?? derivePriority(item.decision.action),
    };
    this.items.push(full);
    this.items.sort((a, b) => b.priority - a.priority);
    return true;
  }

  /** Remove and return the highest-priority item. */
  dequeue(): ModQueueItem | undefined {
    return this.items.shift();
  }

  /** Peek at the highest-priority item without removing it. */
  peek(): ModQueueItem | undefined {
    return this.items[0];
  }

  /** Current queue size. */
  size(): number {
    return this.items.length;
  }

  /** Drain up to `n` items. */
  drain(n: number): ModQueueItem[] {
    const taken = this.items.splice(0, Math.max(0, n));
    return taken;
  }

  /** List items (read-only copy). */
  list(): readonly ModQueueItem[] {
    return [...this.items];
  }

  /** Drop everything. */
  clear(): void {
    this.items = [];
  }
}

function derivePriority(action: ModerationAction): number {
  switch (action) {
    case ModerationAction.BAN:
      return 100;
    case ModerationAction.TIMEOUT:
      return 80;
    case ModerationAction.DELETE:
      return 60;
    case ModerationAction.HIDE:
      return 40;
    case ModerationAction.WARN:
      return 20;
    case ModerationAction.FLAG:
      return 10;
    default:
      return 0;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// 11. BAN MANAGER
// ───────────────────────────────────────────────────────────────────────────────

/** Manages timed + permanent bans. */
export class BanManager {
  private readonly bans = new Map<string, BanRecord>();

  /** Issue a ban. Pass 0 / negative durationMs for a permanent ban. */
  ban(userId: string, durationMs: number, reason: string, issuedBy = 'system'): BanRecord {
    const record: BanRecord = {
      userId,
      reason,
      expiresAt: durationMs > 0 ? new Date(Date.now() + durationMs).toISOString() : null,
      issuedAt: nowIso(),
      issuedBy,
    };
    this.bans.set(userId, record);
    return record;
  }

  /** Whether a user is currently banned (considers expiry). */
  isBanned(userId: string): boolean {
    const r = this.bans.get(userId);
    if (!r) return false;
    if (r.expiresAt === null) return true;
    if (Date.parse(r.expiresAt) > Date.now()) return true;
    // Expired — auto-clean.
    this.bans.delete(userId);
    return false;
  }

  /** Lift a ban. Returns the removed record or undefined. */
  unban(userId: string): BanRecord | undefined {
    const r = this.bans.get(userId);
    if (!r) return undefined;
    this.bans.delete(userId);
    return r;
  }

  /** Inspect a ban record (without mutating). */
  inspect(userId: string): BanRecord | undefined {
    return this.bans.get(userId);
  }

  /** List all currently active bans. */
  listActive(): BanRecord[] {
    const out: BanRecord[] = [];
    for (const r of this.bans.values()) {
      if (r.expiresAt === null || Date.parse(r.expiresAt) > Date.now()) {
        out.push(r);
      }
    }
    return out;
  }

  /** Wipe all ban state. */
  clear(): void {
    this.bans.clear();
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// 12. TIMEOUT MANAGER
// ───────────────────────────────────────────────────────────────────────────────

/** Manages short-form mutes (timeouts). */
export class TimeoutManager {
  private readonly timeouts = new Map<string, TimeoutRecord>();

  /** Apply a timeout. durationMs must be > 0. */
  timeout(userId: string, durationMs: number, reason = 'rate-limit'): TimeoutRecord {
    if (durationMs <= 0) throw new Error('durationMs must be > 0');
    const record: TimeoutRecord = {
      userId,
      reason,
      expiresAt: new Date(Date.now() + durationMs).toISOString(),
      issuedAt: nowIso(),
    };
    this.timeouts.set(userId, record);
    return record;
  }

  /** Whether the user is currently timed out. */
  isTimedOut(userId: string): boolean {
    const r = this.timeouts.get(userId);
    if (!r) return false;
    if (Date.parse(r.expiresAt) > Date.now()) return true;
    this.timeouts.delete(userId);
    return false;
  }

  /** Remaining milliseconds (0 if expired / not set). */
  remainingMs(userId: string): number {
    const r = this.timeouts.get(userId);
    if (!r) return 0;
    const ms = Date.parse(r.expiresAt) - Date.now();
    return ms > 0 ? ms : 0;
  }

  /** Lift a timeout early. */
  clear(userId: string): TimeoutRecord | undefined {
    const r = this.timeouts.get(userId);
    if (!r) return undefined;
    this.timeouts.delete(userId);
    return r;
  }

  /** List all active timeouts. */
  listActive(): TimeoutRecord[] {
    const out: TimeoutRecord[] = [];
    const now = Date.now();
    for (const r of this.timeouts.values()) {
      if (Date.parse(r.expiresAt) > now) out.push(r);
    }
    return out;
  }

  /** Wipe all timeouts. */
  clearAll(): void {
    this.timeouts.clear();
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// 13. AUDIT LOG
// ───────────────────────────────────────────────────────────────────────────────

/** Append-only JSONL audit log. */
export class AuditLog {
  private events: AuditEvent[] = [];
  constructor(private readonly maxEvents = 10_000) {}

  /** Append an event. */
  append(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const full: AuditEvent = {
      id: generateId('aud'),
      timestamp: nowIso(),
      type: event.type,
      userId: event.userId,
      payload: event.payload,
    };
    this.events.push(full);
    if (this.events.length > this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents);
    }
    return full;
  }

  /** Query the log with optional filters. */
  query(filter: AuditQuery = {}): AuditEvent[] {
    let out = this.events;
    if (filter.type) out = out.filter((e) => e.type === filter.type);
    if (filter.userId) out = out.filter((e) => e.userId === filter.userId);
    if (filter.from) {
      const fromMs = Date.parse(filter.from);
      out = out.filter((e) => Date.parse(e.timestamp) >= fromMs);
    }
    if (filter.to) {
      const toMs = Date.parse(filter.to);
      out = out.filter((e) => Date.parse(e.timestamp) <= toMs);
    }
    if (typeof filter.limit === 'number') out = out.slice(-filter.limit);
    return out;
  }

  /** Serialize the log to JSONL. */
  export(): string {
    return this.events.map((e) => JSON.stringify(e)).join('\n');
  }

  /** Total number of events currently stored. */
  size(): number {
    return this.events.length;
  }

  /** Wipe the log. */
  clear(): void {
    this.events = [];
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// 14. APPEAL FLOW
// ───────────────────────────────────────────────────────────────────────────────

/** A single appeal submitted by a user. */
export interface Appeal {
  id: string;
  decisionId: string;
  appellantId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  resolvedAt: string | null;
}

/** Manages user appeals against moderation decisions. */
export class AppealFlow {
  private appeals: Appeal[] = [];
  private queue = new ModQueue(500);
  constructor(private readonly auditLog?: AuditLog) {}

  /** File an appeal. Returns the created appeal record. */
  appeal(decisionId: string, appellantId: string, reason: string): Appeal {
    const record: Appeal = {
      id: generateId('app'),
      decisionId,
      appellantId,
      reason,
      status: 'pending',
      submittedAt: nowIso(),
      resolvedAt: null,
    };
    this.appeals.push(record);
    this.queue.enqueue({
      decisionId: record.id,
      text: reason,
      authorId: appellantId,
      decision: {
        action: ModerationAction.FLAG,
        reason: 'appeal',
        ruleId: null,
        confidence: 0.5,
        matches: [],
        decisionId: record.id,
        evaluatedAt: record.submittedAt,
        shadowbanned: false,
      },
      reason: 'appeal',
    });
    this.auditLog?.append({
      type: 'appeal',
      userId: appellantId,
      payload: { decisionId, reason, appealId: record.id },
    });
    return record;
  }

  /** Resolve an appeal. */
  resolve(appealId: string, status: 'approved' | 'rejected'): Appeal | undefined {
    const a = this.appeals.find((x) => x.id === appealId);
    if (!a) return undefined;
    a.status = status;
    a.resolvedAt = nowIso();
    this.auditLog?.append({
      type: 'appeal',
      userId: a.appellantId,
      payload: { appealId, status, decisionId: a.decisionId },
    });
    return a;
  }

  /** List all pending appeals. */
  pending(): readonly Appeal[] {
    return this.appeals.filter((a) => a.status === 'pending');
  }

  /** List appeals for a user. */
  forUser(userId: string): Appeal[] {
    return this.appeals.filter((a) => a.appellantId === userId);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// 15. DOMAIN LISTS
// ───────────────────────────────────────────────────────────────────────────────

/** Domain whitelist / blacklist helper. */
export class DomainList {
  private readonly set = new Set<string>();
  constructor(initial: readonly string[] = []) {
    for (const d of initial) this.set.add(d.toLowerCase());
  }

  add(...domains: string[]): void {
    for (const d of domains) this.set.add(d.toLowerCase());
  }

  remove(...domains: string[]): void {
    for (const d of domains) this.set.delete(d.toLowerCase());
  }

  has(domain: string): boolean {
    return this.set.has(domain.toLowerCase());
  }

  size(): number {
    return this.set.size;
  }

  values(): string[] {
    return [...this.set];
  }
}

/** Extract all domains referenced in the text. */
export function extractDomains(text: string): string[] {
  const out = new Set<string>();
  const matches = text.match(/https?:\/\/([^/\s?#]+)/gi) ?? [];
  for (const m of matches) {
    const dm = m.match(DOMAIN_RE);
    if (dm && dm[1]) out.add(dm[1].toLowerCase());
  }
  return [...out];
}

// ───────────────────────────────────────────────────────────────────────────────
// 16. CULTURAL SENSITIVITY (PT-BR axé context)
// ───────────────────────────────────────────────────────────────────────────────

const AXE_TERMS_PT: readonly string[] = [
  'axé',
  'axé axé',
  'pai oxalá',
  'mãe oxum',
  'mãe iemanjá',
  'oxalá',
  'oxum',
  'ogum',
  'xangô',
  'iansã',
  'obaluaê',
  'omulu',
  'exu',
  'pombagira',
  'preto velho',
  'caboclo',
  'baiana',
  'terreiro',
  'orixá',
  'orixas',
  'orixás',
  'pontos cantados',
  'oração de proteção',
  'salve rainha',
  'salve o rei',
];

/** Score cultural-axé signals in the text (PT-BR). */
export function detectCulturalContext(text: string): { isCultural: boolean; signals: string[] } {
  const normalized = normalizeText(text);
  const signals: string[] = [];
  for (const term of AXE_TERMS_PT) {
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (re.test(normalized)) signals.push(term);
  }
  return { isCultural: signals.length > 0, signals };
}

// ───────────────────────────────────────────────────────────────────────────────
// 17. SHADOWBAN
// ───────────────────────────────────────────────────────────────────────────────

/** Tracks authors currently in shadowban. */
export class ShadowbanList {
  private readonly set = new Set<string>();
  add(userId: string): void {
    this.set.add(userId);
  }
  remove(userId: string): void {
    this.set.delete(userId);
  }
  has(userId: string): boolean {
    return this.set.has(userId);
  }
  list(): string[] {
    return [...this.set];
  }
  size(): number {
    return this.set.size;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// 18. @AKASHA PRIORITY
// ───────────────────────────────────────────────────────────────────────────────

const AKASHA_HANDLE = '@akasha';

/** Detect whether a text mentions @akasha. */
export function isAkashaMention(text: string): boolean {
  if (!text) return false;
  return new RegExp(`\\B${AKASHA_HANDLE.replace('@', '\\@')}\\b`, 'i').test(text);
}

// ───────────────────────────────────────────────────────────────────────────────
// 19. CONVENIENCE FACTORY
// ───────────────────────────────────────────────────────────────────────────────

/** Aggregate bag of all moderation subsystems, ready to wire into routes. */
export interface ModerationKit {
  queue: ModQueue;
  bans: BanManager;
  timeouts: TimeoutManager;
  audit: AuditLog;
  appeals: AppealFlow;
  reputation: ReputationScorer;
  rateLimiter: RateLimiter;
  shadowban: ShadowbanList;
  whitelist: DomainList;
  blacklist: DomainList;
}

/** Build a fresh moderation kit. */
export function createModerationKit(opts: { whitelist?: string[]; blacklist?: string[] } = {}): ModerationKit {
  const audit = new AuditLog();
  return {
    queue: new ModQueue(),
    bans: new BanManager(),
    timeouts: new TimeoutManager(),
    audit,
    appeals: new AppealFlow(audit),
    reputation: new ReputationScorer(),
    rateLimiter: new RateLimiter(),
    shadowban: new ShadowbanList(),
    whitelist: new DomainList(opts.whitelist ?? ['akasha.app', 'github.com', 'wikipedia.org']),
    blacklist: new DomainList(opts.blacklist ?? []),
  };
}
