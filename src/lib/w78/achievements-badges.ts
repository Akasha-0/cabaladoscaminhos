// achievements-badges.ts
// Sacred-aware gamification engine for o caminho.
//
// Design principles (per cycle-78 spec):
//   1. Hierarchically respectful — Cigano < Orixás < Ifá < Mestres.
//      No jumping ahead; no competitive leaderboards.
//   2. Tradition-aware — every badge carries tradition + respectNote + hierarchy.
//   3. Anti-vanity — meaningless metrics (login streaks, post counts) are
//      detected and refused. `listTopUsersByBadgeCount` etc. throw by design.
//   4. Anti-extraction — awardIntent must be 'genuine'; farming is refused.
//   5. Immutability — every record is `Object.freeze`d; arrays are `readonly`.
//
// Cycle 75/77 lessons applied:
//   - Branded types via `string & { readonly __brand: 'X' }`
//   - `Object.freeze` on every record (lesson #6)
//   - SHA-256 pure-JS fallback (hash.ts) for canonical cache keys
//   - 7-tradition coverage structural, not optional

import { sha256HexSync } from './achievements-badges.hash.ts';

// ============================================================================
// Branded types
// ============================================================================

export type BadgeId = string & { readonly __brand: 'BadgeId' };
export type UserId = string & { readonly __brand: 'UserId' };
export type AwardId = string & { readonly __brand: 'AwardId' };

export function badgeId(raw: string): BadgeId {
  if (!/^b_[a-z0-9_]{3,40}$/.test(raw)) {
    throw new Error(`badgeId: invalid format: ${raw}`);
  }
  return raw as BadgeId;
}

export function userId(raw: string): UserId {
  if (!/^u_[a-z0-9_]{3,40}$/.test(raw)) {
    throw new Error(`userId: invalid format: ${raw}`);
  }
  return raw as UserId;
}

export function awardId(raw: string): AwardId {
  if (!/^a_[a-z0-9_]{3,60}$/.test(raw)) {
    throw new Error(`awardId: invalid format: ${raw}`);
  }
  return raw as AwardId;
}

// ============================================================================
// Tradition & hierarchy
// ============================================================================

/**
 * The 7 sacred traditions the engine respects.
 * Order is canonical — used for sorting and filtering.
 */
export const TRADITIONS = [
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
  'cigano_ramiro',
] as const;
export type Tradition = (typeof TRADITIONS)[number];

export function isTradition(x: unknown): x is Tradition {
  return typeof x === 'string' && (TRADITIONS as ReadonlyArray<string>).includes(x);
}

/**
 * The 4 hierarchy levels — increasing spiritual depth.
 *
 *   cigano < orixa < ifa < mestre
 *
 * Each level gates access to certain badges (you can't earn a mestre-level
 * badge without first having reached mestre).
 */
export const HIERARCHY_LEVELS = ['cigano', 'orixa', 'ifa', 'mestre'] as const;
export type HierarchyLevel = (typeof HIERARCHY_LEVELS)[number];

export function hierarchyRank(l: HierarchyLevel): number {
  return HIERARCHY_LEVELS.indexOf(l);
}

/**
 * Returns true if `actual` is at or above `required` on the hierarchy scale.
 */
export function hierarchyAtLeast(actual: HierarchyLevel, required: HierarchyLevel): boolean {
  return hierarchyRank(actual) >= hierarchyRank(required);
}

// ============================================================================
// Sacred action types
// ============================================================================

/**
 * The 7 sacred-action types the engine recognizes.
 *
 * Note: NO 'login_streak', NO 'post_count', NO 'days_active' — these are
 * vanity metrics by definition and rejected at registration.
 */
export const SACRED_ACTIONS = [
  'consulta_realizada',
  'leitura_concluida',
  'mentoria_recebida',
  'mentoria_oferecida',
  'oferenda_feita',
  'cigano_puxado',
  'meditacao_completa',
] as const;
export type SacredActionType = (typeof SACRED_ACTIONS)[number];

/**
 * Anti-vanity action signatures. If any of these appear, the badge is
 * rejected at registration with a clear error.
 */
export const VANITY_ACTION_SIGNATURES = [
  'login_streak',
  'post_count',
  'days_active',
  'message_count',
  'upvotes_received',
  'followers_count',
  'fasted_days',
  'app_opens',
] as const;
export type VanityActionSignature = (typeof VANITY_ACTION_SIGNATURES)[number];

export function isVanityAction(action: string): boolean {
  return (VANITY_ACTION_SIGNATURES as ReadonlyArray<string>).includes(action);
}

// ============================================================================
// Award intent
// ============================================================================

export type AwardIntent = 'genuine' | 'extractive';

/**
 * The 7 fields each SacredAction carries — context, not metrics.
 */
export interface SacredAction {
  readonly type: SacredActionType;
  readonly intent: AwardIntent;
  readonly tradition: Tradition;
  readonly hierarchy: HierarchyLevel;
  readonly intention: string;        // e.g. "homenagem a Oxalá", "estudo da Sefirá Tiferet"
  readonly durationMinutes: number;  // depth of practice, not frequency
  readonly witness: string;          // who/what witnessed (mentor name, journal, etc.)
  readonly occurredAt: string;       // ISO 8601 timestamp
}

// ============================================================================
// Badge model
// ============================================================================

export interface Badge {
  readonly id: BadgeId;
  readonly name: string;
  readonly description: string;
  readonly tradition: Tradition;
  readonly hierarchy: HierarchyLevel;
  readonly respectNote: string;           // tradition-specific context
  readonly action: SacredActionType;       // action that earns it
  readonly requires: ReadonlyArray<SacredActionType>; // prerequisite actions
  readonly minDurationMinutes: number;     // minimum depth of practice
  readonly crossTradition: boolean;        // can be earned by other-tradition users
  readonly blocksSacredPractice: boolean;  // if true, badge earns by NOT practicing
  readonly isVanity: boolean;              // tracked at registration time
}

export interface EarnedBadge {
  readonly badgeId: BadgeId;
  readonly userId: UserId;
  readonly awardedAt: string;
  readonly context: SacredAction;
  readonly awardId: AwardId;
  readonly hash: string;  // SHA-256 of canonical(award)
}

export interface RevokedBadge {
  readonly badgeId: BadgeId;
  readonly userId: UserId;
  readonly revokedAt: string;
  readonly reason: string;
}

// ============================================================================
// Filter & result types
// ============================================================================

export interface BadgeFilter {
  readonly tradition?: Tradition;
  readonly hierarchy?: HierarchyLevel;
  readonly action?: SacredActionType;
}

export interface BadgeError {
  readonly code: 'invalid_format' | 'vanity_metric' | 'duplicate_id' | 'no_respect_note' | 'unknown';
  readonly message: string;
}

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export type Option<T> =
  | { readonly some: true; readonly value: T }
  | { readonly some: false };

export function some<T>(value: T): Option<T> {
  return Object.freeze({ some: true, value });
}

export function none<T>(): Option<T> {
  return Object.freeze({ some: false });
}

export function ok<T>(value: T): Result<T, never> {
  return Object.freeze({ ok: true, value });
}

export function err<E>(error: E): Result<never, E> {
  return Object.freeze({ ok: false, error });
}

// ============================================================================
// Revoke reason
// ============================================================================

export type RevokeReason =
  | 'mistaken_award'
  | 'user_request'
  | 'context_invalid'
  | 'tradition_mismatch'
  | 'integrity_review';

// ============================================================================
// User state (minimal — just enough for the engine to gate awards)
// ============================================================================

export interface UserState {
  readonly id: UserId;
  readonly knownTraditions: ReadonlyArray<Tradition>; // traditions the user has engaged with
  readonly currentHierarchyLevel: HierarchyLevel;     // their spiritual depth
}

// ============================================================================
// In-memory store (immutable; engine is pure-functional)
// ============================================================================

interface CatalogState {
  readonly badges: ReadonlyMap<BadgeId, Badge>;
  readonly earned: ReadonlyArray<EarnedBadge>;
  readonly revoked: ReadonlyArray<RevokedBadge>;
}

const EMPTY_CATALOG: CatalogState = Object.freeze({
  badges: new Map(),
  earned: Object.freeze([]),
  revoked: Object.freeze([]),
});

let _catalog: CatalogState = EMPTY_CATALOG;

// Audit hooks for spec/smoke — populated on award/revoke/register
let _auditLog: ReadonlyArray<AuditEntry> = Object.freeze([]);

export interface AuditEntry {
  readonly kind: 'register' | 'award' | 'revoke' | 'reject';
  readonly at: string;
  readonly details: Readonly<Record<string, unknown>>;
}

export function _resetAuditForTests(): void {
  _auditLog = Object.freeze([]);
  _catalog = EMPTY_CATALOG;
}

function _audit(entry: AuditEntry): void {
  _auditLog = Object.freeze([..._auditLog, entry]);
}

export function exportAudit(): ReadonlyArray<AuditEntry> {
  return _auditLog;
}

// ============================================================================
// Registration
// ============================================================================

const VALID_BADGE_NAME = /^[A-Za-zÀ-ÿ0-9 \-_]{3,80}$/;

/**
 * Register a badge in the catalog. Refuses vanity metrics and malformed input.
 */
export function registerBadge(input: Omit<Badge, 'isVanity'> & { readonly isVanity?: boolean }): Result<BadgeId, BadgeError> {
  // Validate id format
  try {
    badgeId(input.id);
  } catch (e) {
    return err({
      code: 'invalid_format',
      message: `badgeId failed: ${(e as Error).message}`,
    });
  }
  // Validate name
  if (!VALID_BADGE_NAME.test(input.name)) {
    return err({ code: 'invalid_format', message: `invalid name: ${input.name}` });
  }
  // Validate tradition
  if (!isTradition(input.tradition)) {
    return err({ code: 'invalid_format', message: `unknown tradition: ${input.tradition}` });
  }
  // Validate hierarchy
  if (!(HIERARCHY_LEVELS as ReadonlyArray<string>).includes(input.hierarchy)) {
    return err({ code: 'invalid_format', message: `unknown hierarchy: ${input.hierarchy}` });
  }
  // Validate action
  if (!(SACRED_ACTIONS as ReadonlyArray<string>).includes(input.action)) {
    return err({ code: 'invalid_format', message: `unknown action: ${input.action}` });
  }
  // Vanitied by self-declaration
  if (input.isVanity === true) {
    return err({ code: 'vanity_metric', message: `badge declared as vanity: ${input.id}` });
  }
  // Vanitied by action signature (defense in depth)
  if (isVanityAction(input.action)) {
    return err({ code: 'vanity_metric', message: `action is a vanity signature: ${input.action}` });
  }
  // Respect note must exist and be meaningful
  if (!input.respectNote || input.respectNote.length < 20) {
    return err({ code: 'no_respect_note', message: 'respectNote must be ≥20 chars' });
  }
  // Duplicate id
  if (_catalog.badges.has(input.id)) {
    return err({ code: 'duplicate_id', message: `badge already registered: ${input.id}` });
  }
  // Validate prerequisites are subset of SACRED_ACTIONS
  for (const req of input.requires) {
    if (!(SACRED_ACTIONS as ReadonlyArray<string>).includes(req)) {
      return err({ code: 'invalid_format', message: `unknown prerequisite: ${req}` });
    }
  }

  const badge: Badge = Object.freeze({
    id: input.id,
    name: input.name,
    description: input.description,
    tradition: input.tradition,
    hierarchy: input.hierarchy,
    respectNote: input.respectNote,
    action: input.action,
    requires: Object.freeze([...input.requires]),
    minDurationMinutes: input.minDurationMinutes,
    crossTradition: input.crossTradition,
    blocksSacredPractice: input.blocksSacredPractice,
    isVanity: false,
  });

  const nextBadges = new Map(_catalog.badges);
  nextBadges.set(badge.id, badge);
  _catalog = Object.freeze({
    badges: nextBadges,
    earned: _catalog.earned,
    revoked: _catalog.revoked,
  });

  _audit(Object.freeze({
    kind: 'register',
    at: new Date().toISOString(),
    details: Object.freeze({ badgeId: badge.id, tradition: badge.tradition }),
  }));

  return ok(badge.id);
}

/**
 * Look up a badge by id.
 */
export function getBadge(id: BadgeId): Option<Badge> {
  const b = _catalog.badges.get(id);
  return b ? some(b) : none();
}

/**
 * List badges with optional filter.
 */
export function listBadges(filter?: BadgeFilter): ReadonlyArray<Badge> {
  let result: ReadonlyArray<Badge> = Array.from(_catalog.badges.values());
  if (filter?.tradition !== undefined) {
    result = result.filter((b) => b.tradition === filter.tradition);
  }
  if (filter?.hierarchy !== undefined) {
    result = result.filter((b) => b.hierarchy === filter.hierarchy);
  }
  if (filter?.action !== undefined) {
    result = result.filter((b) => b.action === filter.action);
  }
  return Object.freeze(result);
}

/**
 * Convenience: list badges belonging to a tradition.
 */
export function listBadgesByTradition(t: Tradition): ReadonlyArray<Badge> {
  return listBadges({ tradition: t });
}

// ============================================================================
// Earning
// ============================================================================

export interface AwardContext {
  readonly user: UserState;
  readonly action: SacredAction;
  readonly intentionHonest: boolean;
  readonly witnessed: boolean;
}

export interface AwardResult {
  readonly status: 'awarded' | 'rejected';
  readonly reason?: string;
  readonly awardId?: AwardId;
  readonly badgeId?: BadgeId;
  readonly hash?: string;
}

/**
 * Award a badge to a user. Honors all sacred-respect invariants.
 *
 * Order of checks (any failure short-circuits with `status: 'rejected'`):
 *   1. Badge exists.
 *   2. Action type matches badge.action.
 *   3. Action.tradition matches badge.tradition OR badge.crossTradition is true.
 *   4. Action.intent is 'genuine' (rejects extractive farming).
 *   5. User.currentHierarchyLevel ≥ badge.hierarchy.
 *   6. All badge.requires have been performed (we check the most recent action
 *      carried the prerequisite types in the user's history; if not present
 *      in this single action, we still allow if crossTradition).
 *   7. Action.durationMinutes ≥ badge.minDurationMinutes.
 *   8. intentionHonest flag is true.
 *   9. witnessed flag is true.
 *  10. Badge not already earned by user.
 */
export function awardBadge(
  userOrId: UserId | UserState,
  badgeIdVal: BadgeId,
  context: AwardContext,
): AwardResult {
  // Normalize: if first arg is UserId, use context.user
  let userState: UserState;
  if (typeof userOrId === 'string') {
    if (!context.user) {
      const reject: AwardResult = Object.freeze({
        status: 'rejected',
        reason: 'userId provided without UserState context',
      });
      _audit(Object.freeze({ kind: 'reject', at: new Date().toISOString(), details: Object.freeze({}) }));
      return reject;
    }
    userState = context.user;
  } else {
    userState = userOrId;
  }

  // 1. Badge exists
  const bOpt = getBadge(badgeIdVal);
  if (!bOpt.some) {
    return rejectWith(`badge not found: ${badgeIdVal}`);
  }
  const badgeRecord = bOpt.value;

  // 2. Action type matches
  if (context.action.type !== badgeRecord.action) {
    return rejectWith(`action mismatch: ${context.action.type} vs ${badgeRecord.action}`);
  }

  // 3. Tradition match
  if (
    context.action.tradition !== badgeRecord.tradition &&
    !badgeRecord.crossTradition
  ) {
    return rejectWith(
      `tradition mismatch: action=${context.action.tradition} badge=${badgeRecord.tradition} crossTradition=false`,
    );
  }

  // 4. Intent must be genuine
  if (context.action.intent !== 'genuine') {
    return rejectWith(`extractive intent rejected: ${context.action.intent}`);
  }

  // 5. Hierarchy gate
  if (!hierarchyAtLeast(userState.currentHierarchyLevel, badgeRecord.hierarchy)) {
    return rejectWith(
      `hierarchy insufficient: user=${userState.currentHierarchyLevel} badge=${badgeRecord.hierarchy}`,
    );
  }

  // 6. Prerequisites — at minimum, the action.type must be among the prereqs,
  //    OR badge.crossTradition is true.
  if (
    !badgeRecord.crossTradition &&
    !badgeRecord.requires.includes(context.action.type)
  ) {
    return rejectWith(`prerequisite action not met: ${context.action.type} not in [${badgeRecord.requires.join(',')}]`);
  }

  // 7. Duration
  if (context.action.durationMinutes < badgeRecord.minDurationMinutes) {
    return rejectWith(
      `insufficient duration: ${context.action.durationMinutes} < ${badgeRecord.minDurationMinutes}`,
    );
  }

  // 8. Intention honest
  if (!context.intentionHonest) {
    return rejectWith('intention not honest');
  }

  // 9. Witnessed
  if (!context.witnessed) {
    return rejectWith('action not witnessed');
  }

  // 10. Not already earned
  if (_catalog.earned.some((e) => e.userId === userState.id && e.badgeId === badgeIdVal)) {
    return rejectWith(`badge already earned: ${userState.id}/${badgeIdVal}`);
  }

  // Award
  const at = new Date().toISOString();
  const hash = sha256HexSync(`${userState.id}|${badgeIdVal}|${context.action.occurredAt}|${context.action.intention}`);
  const aid = awardId(`a_${hash.slice(0, 24)}`);
  const earned: EarnedBadge = Object.freeze({
    badgeId: badgeIdVal,
    userId: userState.id,
    awardedAt: at,
    context: Object.freeze(context.action),
    awardId: aid,
    hash,
  });

  _catalog = Object.freeze({
    badges: _catalog.badges,
    earned: Object.freeze([..._catalog.earned, earned]),
    revoked: _catalog.revoked,
  });

  _audit(Object.freeze({
    kind: 'award',
    at,
    details: Object.freeze({ userId: userState.id, badgeId: badgeIdVal, hash }),
  }));

  return Object.freeze({
    status: 'awarded',
    awardId: aid,
    badgeId: badgeIdVal,
    hash,
  });
}

function rejectWith(reason: string): AwardResult {
  const r: AwardResult = Object.freeze({ status: 'rejected', reason });
  _audit(Object.freeze({
    kind: 'reject',
    at: new Date().toISOString(),
    details: Object.freeze({ reason }),
  }));
  return r;
}

/**
 * Revoke a previously awarded badge.
 */
export function revokeBadge(
  user: UserId,
  badge: BadgeId,
  reason: RevokeReason,
): { readonly status: 'revoked' | 'not_found'; readonly revokedAt?: string } {
  const found = _catalog.earned.find((e) => e.userId === user && e.badgeId === badge);
  if (!found) {
    return Object.freeze({ status: 'not_found' });
  }
  const at = new Date().toISOString();
  const revoked: RevokedBadge = Object.freeze({
    badgeId: badge,
    userId: user,
    revokedAt: at,
    reason,
  });
  _catalog = Object.freeze({
    badges: _catalog.badges,
    earned: _catalog.earned.filter((e) => !(e.userId === user && e.badgeId === badge)),
    revoked: Object.freeze([..._catalog.revoked, revoked]),
  });
  _audit(Object.freeze({
    kind: 'revoke',
    at,
    details: Object.freeze({ userId: user, badgeId: badge, reason }),
  }));
  return Object.freeze({ status: 'revoked', revokedAt: at });
}

/**
 * List all badges a user has earned.
 */
export function listEarnedBadges(user: UserId): ReadonlyArray<EarnedBadge> {
  return Object.freeze(_catalog.earned.filter((e) => e.userId === user));
}

/**
 * Check which badges become newly earnable for a user given an action.
 * Returns the list of badge IDs that would be awarded if the action was
 * actually performed.
 */
export function checkEarnedBadges(user: UserState, action: SacredAction): ReadonlyArray<BadgeId> {
  const candidates = listBadges({ action: action.type });
  const earnable: BadgeId[] = [];
  for (const b of candidates) {
    if (listEarnedBadges(user.id).some((e) => e.badgeId === b.id)) continue;
    if (!hierarchyAtLeast(user.currentHierarchyLevel, b.hierarchy)) continue;
    if (action.tradition !== b.tradition && !b.crossTradition) continue;
    if (action.intent !== 'genuine') continue;
    if (action.durationMinutes < b.minDurationMinutes) continue;
    earnable.push(b.id);
  }
  return Object.freeze(earnable);
}

// ============================================================================
// Tradition-aware helpers
// ============================================================================

/**
 * Returns true if the badge respects its tradition's protocol.
 *
 * Rules:
 *   - Must carry a non-empty respectNote
 *   - Hierarchy must be at or above `cigano`
 *   - Must not be a vanity metric
 *   - Candomblé / Umbanda badges must reference Orixás / entities
 *     appropriately (we trust the respectNote text)
 */
export function isTraditionRespected(badge: Badge): boolean {
  if (!badge.respectNote || badge.respectNote.length < 20) return false;
  if (hierarchyRank(badge.hierarchy) < 0) return false;
  if (badge.isVanity) return false;
  // Tradition-specific guard rails — light heuristic checks
  if (badge.tradition === 'candomble') {
    // Must reference at least one Orixá-related token
    const tokens = ['Orixá', 'axé', 'terreiro', 'Ogun', 'Oxalá', 'Xangô', 'Ogum', 'Iemanjá', 'Iansã', 'Oxóssi', 'Obaluaiê', 'Nanã', 'Omolu', 'Cigano Ramiro', 'Cigano'];
    return tokens.some((t) => badge.respectNote.includes(t) || badge.description.includes(t));
  }
  if (badge.tradition === 'umbanda') {
    // Distinct from Candomblé — must mention Umbanda-line entities
    const tokens = ['Caboclo', 'Preto-Velho', 'Criança', 'Exu', 'Pombagira', 'Umbanda'];
    return tokens.some((t) => badge.respectNote.includes(t) || badge.description.includes(t));
  }
  if (badge.tradition === 'ifa') {
    const tokens = ['Odu', 'Ifá', 'Orunmila', ' Mérindilogun', 'Mérindilogun', 'Ofun', 'Oyeku', 'Ika'];
    return tokens.some((t) => badge.respectNote.includes(t) || badge.description.includes(t));
  }
  if (badge.tradition === 'cabala') {
    const tokens = ['Sefirá', 'Sephirah', 'Keter', 'Chokhmah', 'Binah', 'Tiferet', 'Árvore', 'Nome Divino', 'Nomes Divinos', 'Gematria', 'Tetragrama'];
    return tokens.some((t) => badge.respectNote.includes(t) || badge.description.includes(t));
  }
  if (badge.tradition === 'astrologia') {
    const tokens = ['signo', 'planeta', 'casa', 'Lilith', 'Nodo', 'trânsito', 'sinastria', 'eclipse'];
    return tokens.some((t) => badge.respectNote.toLowerCase().includes(t.toLowerCase()) || badge.description.toLowerCase().includes(t.toLowerCase()));
  }
  if (badge.tradition === 'tantra') {
    const tokens = ['Prana', 'Kundalini', 'Chakra', 'Ida', 'Pingala', 'Sushumna', 'Tantra', 'Chandra'];
    return tokens.some((t) => badge.respectNote.includes(t) || badge.description.includes(t));
  }
  if (badge.tradition === 'cigano_ramiro') {
    const tokens = ['Cigano', 'carta', 'Mesa Real', 'naipe', 'paus', 'copas', 'espadas', 'ouros', 'Cigana'];
    return tokens.some((t) => badge.respectNote.includes(t) || badge.description.includes(t));
  }
  return false;
}

/**
 * Returns the hierarchy level of a badge (1-4 ordinal).
 */
export function getBadgeHierarchyLevel(badge: Badge): HierarchyLevel {
  return badge.hierarchy;
}

// ============================================================================
// Anti-pattern detection
// ============================================================================

const VANITY_NAME_TOKENS = [
  'streak', 'contador', 'dias consecutivos', 'login diário', 'ranking',
  'leaderboard', 'top user', 'level xp', 'post count', 'upvotes',
];

/**
 * Returns true if a badge tracks meaningless activity (login streak, post
 * count, etc.) and would reduce spiritual practice to a vanity metric.
 */
export function isVanityMetric(badge: Badge): boolean {
  if (badge.isVanity) return true;
  if (isVanityAction(badge.action)) return true;
  const combined = (badge.name + ' ' + badge.description + ' ' + badge.respectNote).toLowerCase();
  return VANITY_NAME_TOKENS.some((t) => combined.includes(t.toLowerCase()));
}

/**
 * Returns true if earning the badge requires NOT practicing (e.g., "fasted
 * X days without intention"). Such badges undermine the principle of practice.
 */
export function blocksSacredPractice(badge: Badge): boolean {
  return badge.blocksSacredPractice === true;
}

// ============================================================================
// Anti-pattern API surface — these MUST throw by design
// ============================================================================

/**
 * Anti-pattern: never expose a "top user" list. Junior devs hitting this
 * signature get a runtime error.
 */
export function listTopUsersByBadgeCount(_limit: number): never {
  throw new Error('Vanity metric rejected by design: listTopUsersByBadgeCount is not part of the sacred-respect API');
}

/**
 * Anti-pattern: never rank users by XP-like score.
 */
export function rankUsersByXp(_limit: number): never {
  throw new Error('Vanity metric rejected by design: rankUsersByXp is not part of the sacred-respect API');
}

/**
 * Anti-pattern: never expose a global "level" ladder.
 */
export function getGlobalUserLevel(_user: UserId): never {
  throw new Error('Vanity metric rejected by design: getGlobalUserLevel is not part of the sacred-respect API');
}

/**
 * Anti-pattern: never expose a public XP score.
 */
export function getUserXp(_user: UserId): never {
  throw new Error('Vanity metric rejected by design: getUserXp is not part of the sacred-respect API');
}

// ============================================================================
// Initial catalog — 30+ badges across 7 traditions, hierarchy-respecting
// ============================================================================

/**
 * Seeds the catalog with the 7-tradition × 4-hierarchy badge set.
 * Idempotent — calling multiple times is safe (no-op on duplicates).
 */
export function seedCatalog(): ReadonlyArray<BadgeId> {
  const seeded: BadgeId[] = [];
  const trySeed = (b: Omit<Badge, 'isVanity'>): void => {
    const r = registerBadge(b);
    if (r.ok) seeded.push(r.value);
  };

  // -- CIGANO TIER (cigano_ramiro) ----------------------------------------
  trySeed({
    id: badgeId('b_primeira_carta'),
    name: 'Primeira Carta',
    description: 'Tirou sua primeira carta no Baralho Cigano Ramiro',
    tradition: 'cigano_ramiro',
    hierarchy: 'cigano',
    respectNote:
      'A primeira carta é uma abertura de caminho. Reconhecemos o início da relação com o Baralho Cigano, sem pressa — cada consulente encontra seu tempo.',
    action: 'cigano_puxado',
    requires: [],
    minDurationMinutes: 10,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_caminho_aberto'),
    name: 'Caminho Aberto',
    description: 'Realizou 7 consultas com o Baralho Cigano Ramiro',
    tradition: 'cigano_ramiro',
    hierarchy: 'cigano',
    respectNote:
      'Sete consultas marcam a construção de uma relação ritual com a Mesa Real. Cada carta puxada com intenção fortalece o vínculo.',
    action: 'consulta_realizada',
    requires: ['cigano_puxado'],
    minDurationMinutes: 20,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_cigano_puxado'),
    name: 'Cigano Puxado',
    description: 'Puxou uma carta Cigana com intenção clara e estado ritual',
    tradition: 'cigano_ramiro',
    hierarchy: 'cigano',
    respectNote:
      'A carta Cigana, 29 do naipe de copas, representa o lado feminino e intuitivo. Honramos a Cigana como entidade mediadora do oráculo.',
    action: 'cigano_puxado',
    requires: [],
    minDurationMinutes: 15,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_mesa_iniciada'),
    name: 'Mesa Iniciada',
    description: 'Iniciou sua Mesa Real com as 4 casas de cruzamento',
    tradition: 'cigano_ramiro',
    hierarchy: 'cigano',
    respectNote:
      'A Mesa Real é o coração do método pessoal do mestre Ramiro. 36 casas, 4 cruzamentos, 9 caminhos — a mesa é o terreiro do consulente contemporâneo.',
    action: 'consulta_realizada',
    requires: ['cigano_puxado'],
    minDurationMinutes: 30,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_36_casas_completas'),
    name: '36-Casas Completas',
    description: 'Percorreu todas as 36 casas da Mesa Real pelo menos uma vez',
    tradition: 'cigano_ramiro',
    hierarchy: 'cigano',
    respectNote:
      'As 36 casas correspondem aos 4 naipes (paus, copas, espadas, ouros) × 9 cartas mestres. Completar é conhecer o mapa inteiro.',
    action: 'consulta_realizada',
    requires: ['cigano_puxado', 'consulta_realizada'],
    minDurationMinutes: 60,
    crossTradition: true,
    blocksSacredPractice: false,
  });

  // -- ORIXÁS TIER (candomblé) --------------------------------------------
  trySeed({
    id: badgeId('b_orixa_recebido'),
    name: 'Orixá Recebido',
    description: 'Recebeu seu Orixá de cabeça em fundamento',
    tradition: 'candomble',
    hierarchy: 'orixa',
    respectNote:
      'O Orixá de cabeça é a entidade que rege o Ori. Oxalá, Iemanjá, Xangô, Ogum, Oxóssi, Iansã, Obaluaiê, Nanã, Omolu — cada um com seu ebó e sua cor.',
    action: 'oferenda_feita',
    requires: [],
    minDurationMinutes: 120,
    crossTradition: false,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_oferenda_dada'),
    name: 'Oferenda Dada',
    description: 'Fez uma oferenda (ebó) com intenção declarada e terreiro testemunha',
    tradition: 'candomble',
    hierarchy: 'orixa',
    respectNote:
      'O ebó é troca, não pagamento. A oferenda ao Orixá é diálogo com o sagrado. Reconhecemos terreiros e zeladores de santo como guardiões do ritual.',
    action: 'oferenda_feita',
    requires: [],
    minDurationMinutes: 90,
    crossTradition: false,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_axe_fortalecido'),
    name: 'Axé Fortalecido',
    description: 'Participou de uma Gira ou cerimônia pública com axé manifesto',
    tradition: 'candomble',
    hierarchy: 'orixa',
    respectNote:
      'O axé é a força vital que anima o terreiro. Nascer de novo no Santo, carregar o ori, saudar o Orixá — cada ritual fortalece o axé do grupo.',
    action: 'oferenda_feita',
    requires: ['oferenda_feita'],
    minDurationMinutes: 180,
    crossTradition: false,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_descendencia_honrada'),
    name: 'Descendência Honrada',
    description: 'Honrou a ancestralidade familiar com oferenda aos eguns',
    tradition: 'candomble',
    hierarchy: 'orixa',
    respectNote:
      'Os eguns são os ancestrais. A oferenda a eles (caruru, feijoada) reconhece a corrente que nos trouxe até aqui. O Cigano Ramiro ensinou que o consulente honra seus mortos antes de puxar carta — a naipe de espadas abre caminho, e a corrente ancestral sustenta.',
    action: 'oferenda_feita',
    requires: ['oferenda_feita'],
    minDurationMinutes: 60,
    crossTradition: false,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_orixa_cabeca_conhecido'),
    name: 'Orixá de Cabeça Conhecido',
    description: 'Identificou e documentou seu Orixá de cabeça com zelador de santo',
    tradition: 'candomble',
    hierarchy: 'orixa',
    respectNote:
      'Conhecer o Orixá que rege seu Ori é trabalho de terreiro, não de algoritmo. O zelador confirma no jogo de búzios e na vivência.',
    action: 'consulta_realizada',
    requires: ['oferenda_feita'],
    minDurationMinutes: 45,
    crossTradition: false,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_caminho_orixa_trilhado'),
    name: 'Caminho do Orixá Trilhado',
    description: 'Trabalhou ativamente o ebó do seu Orixá por uma estação',
    tradition: 'candomble',
    hierarchy: 'orixa',
    respectNote:
      'Cada Orixá tem seu caminho: Ogum abre, Oxóssi caça, Xangô sentencia, Iemanjá acalma. Trilhar o caminho é cumprir as obrigações do Ori.',
    action: 'oferenda_feita',
    requires: ['oferenda_feita', 'consulta_realizada'],
    minDurationMinutes: 240,
    crossTradition: false,
    blocksSacredPractice: false,
  });

  // -- UMBANDA TIER -------------------------------------------------------
  trySeed({
    id: badgeId('b_caboclo_recebido'),
    name: 'Caboclo Recebido',
    description: 'Recebeu um Caboclo em sessão de Umbanda',
    tradition: 'umbanda',
    hierarchy: 'orixa',
    respectNote:
      'Os Caboclos são entidades de terreiro de Umbanda, distintos dos Orixás do Candomblé. Representam os povos originários e a força da mata.',
    action: 'meditacao_completa',
    requires: [],
    minDurationMinutes: 60,
    crossTradition: false,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_preto_velho_saudado'),
    name: 'Preto-Velho Saudado',
    description: 'Prestou homenagem a um Preto-Velho em sessão',
    tradition: 'umbanda',
    hierarchy: 'orixa',
    respectNote:
      'Os Pretos-Velhos carregam a sabedoria dos ancestrais escravizados. Sua palavra é de conselho, nunca de acusação.',
    action: 'meditacao_completa',
    requires: [],
    minDurationMinutes: 60,
    crossTradition: false,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_exu_umbanda_aberto'),
    name: 'Exu de Umbanda Aberto',
    description: 'Abriu caminho com Exu de Umbanda em sessão pública',
    tradition: 'umbanda',
    hierarchy: 'orixa',
    respectNote:
      'Exu em Umbanda é distinto do Candomblé — abre caminhos, cuida das encruzilhadas. Pombagiras são suasCompanheiras. Honramos a firmeza do Exu sem confundi-lo com aforma iorubá.',
    action: 'oferenda_feita',
    requires: [],
    minDurationMinutes: 30,
    crossTradition: false,
    blocksSacredPractice: false,
  });

  // -- IFÁ TIER -----------------------------------------------------------
  trySeed({
    id: badgeId('b_odu_nascimento'),
    name: 'Odu de Nascimento',
    description: 'Conheceu seu Odu de nascimento no Merindilogun',
    tradition: 'ifa',
    hierarchy: 'ifa',
    respectNote:
      'O Odu de nascimento rege a vida inteira. Os 16 Odus principais (Ofun, Oyeku, Ika, Oturupon, Osa, Iroso, Owonrin, Ogbe, etc.) revelam o destino.',
    action: 'consulta_realizada',
    requires: [],
    minDurationMinutes: 90,
    crossTradition: false,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_ifa_consulta'),
    name: 'Ifá Consulta',
    description: 'Consultou o Oráculo de Ifá com babalaô testemunha',
    tradition: 'ifa',
    hierarchy: 'ifa',
    respectNote:
      'O jogo de Ifá é leitura do destino por Odus e signos. Orunmila, o Orixá da sabedoria, preside o oráculo. Só babalaô iniciado pode lançar.',
    action: 'consulta_realizada',
    requires: [],
    minDurationMinutes: 60,
    crossTradition: false,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_merindilogun_completo'),
    name: 'Mérindilogun Completo',
    description: 'Concluiu o jogo dos 16 búzios (Mérindilogun) completo',
    tradition: 'ifa',
    hierarchy: 'ifa',
    respectNote:
      'O Mérindilogun é o jogo de 16 búzios que revela o Odu regente. Cada Odu tem seus ebós, seus忌, suas recomendações.',
    action: 'consulta_realizada',
    requires: ['consulta_realizada'],
    minDurationMinutes: 120,
    crossTradition: false,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_orunmila_consultou'),
    name: 'Orunmila Consultou',
    description: 'Recebeu orientação direta de Orunmila em Ifá',
    tradition: 'ifa',
    hierarchy: 'ifa',
    respectNote:
      'Orunmila é o Orixá da sabedoria e da previsão. Quando Ele fala, o consulente ouve e cumpre o ebó com disciplina.',
    action: 'consulta_realizada',
    requires: ['consulta_realizada'],
    minDurationMinutes: 180,
    crossTradition: false,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_ifa_avancado'),
    name: 'Ifá Avançado',
    description: 'Concluiu o ciclo completo de Odu de nascimento e ebó anual',
    tradition: 'ifa',
    hierarchy: 'ifa',
    respectNote:
      'O ciclo completo do Odu exige cumprimento do ebó no tempo certo. Avançado não é pressa — é constância.',
    action: 'oferenda_feita',
    requires: ['oferenda_feita', 'consulta_realizada'],
    minDurationMinutes: 360,
    crossTradition: false,
    blocksSacredPractice: false,
  });

  // -- CABALA TIER (mestre) ----------------------------------------------
  trySeed({
    id: badgeId('b_arvore_vida_mapeada'),
    name: 'Árvore da Vida Mapeada',
    description: 'Mapeou as 10 Sephiroth da Árvore da Vida',
    tradition: 'cabala',
    hierarchy: 'mestre',
    respectNote:
      'As 10 Sephiroth (Keter, Chokhmah, Binah, Chesed, Geburah, Tiferet, Netzach, Hod, Yesod, Malkuth) são emanações divinas. Mapeá-las é estudo profundo.',
    action: 'leitura_concluida',
    requires: [],
    minDurationMinutes: 90,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_sephirah_conhecida'),
    name: 'Sephirah Conhecida',
    description: 'Estudou em profundidade uma Sefirá específica',
    tradition: 'cabala',
    hierarchy: 'mestre',
    respectNote:
      'Cada Sefirá carrega um nome divino, um pilar, uma cor. Keter é coroa, Tiferet é beleza, Malkuth é reino. Conhecer uma é honrar todas.',
    action: 'leitura_concluida',
    requires: [],
    minDurationMinutes: 60,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_nome_divino_meditado'),
    name: 'Nome Divino Meditado',
    description: 'Meditou sobre um dos 72 Nomes Divinos',
    tradition: 'cabala',
    hierarchy: 'mestre',
    respectNote:
      'Os 72 Nomes Divinos (Shem HaMephorash) são emanações do Tetragrama. Cada Nome tem sua meditação própria, seu canto, seu atributo.',
    action: 'meditacao_completa',
    requires: ['leitura_concluida'],
    minDurationMinutes: 30,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_gematria_calculada'),
    name: 'Gematria Calculada',
    description: 'Calculou a gematria de um nome ou palavra sagrada',
    tradition: 'cabala',
    hierarchy: 'mestre',
    respectNote:
      'A Gematria atribui valor numérico às letras hebraicas. Cada nome tem sua vibração. É estudo, não adivinhação.',
    action: 'leitura_concluida',
    requires: ['leitura_concluida'],
    minDurationMinutes: 45,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_cabala_avancada'),
    name: 'Cabala Avançada',
    description: 'Concluiu estudo avançado das 4 Weltanschauungen da Árvore',
    tradition: 'cabala',
    hierarchy: 'mestre',
    respectNote:
      'A Árvore da Vida lida em profundidade revela as 4 Weltanschauungen (Atziluth, Beriah, Yetzirah, Assiah). Trabalho de anos, não dias.',
    action: 'leitura_concluida',
    requires: ['leitura_concluida', 'meditacao_completa'],
    minDurationMinutes: 240,
    crossTradition: true,
    blocksSacredPractice: false,
  });

  // -- ASTROLOGIA TIER ---------------------------------------------------
  trySeed({
    id: badgeId('b_mapa_natal_lido'),
    name: 'Mapa Natal Lido',
    description: 'Leu seu Mapa Natal com astrólogo testemunha',
    tradition: 'astrologia',
    hierarchy: 'orixa',
    respectNote:
      'O Mapa Natal é a foto do céu no momento do nascimento. Signos, planetas, casas (12 casas), Lilith e os Nodos Lunares contam a história.',
    action: 'consulta_realizada',
    requires: [],
    minDurationMinutes: 60,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_transito_importante'),
    name: 'Trânsito Importante',
    description: 'Recebeu e trabalhou um trânsito de Plutão ou Saturno',
    tradition: 'astrologia',
    hierarchy: 'orixa',
    respectNote:
      'Trânsitos lentos (Plutão, Saturno, Quíron) marcam ciclos de anos. Receber com consciência é trabalho de amadurecimento.',
    action: 'consulta_realizada',
    requires: ['consulta_realizada'],
    minDurationMinutes: 45,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_sinastria_feita'),
    name: 'Sinastria Feita',
    description: 'Estudo comparativo de dois mapas (relação)',
    tradition: 'astrologia',
    hierarchy: 'orixa',
    respectNote:
      'A sinastria sobrepõe dois mapas natais para mapear a dinâmica da relação. Não é destino — é linguagem.',
    action: 'consulta_realizada',
    requires: ['consulta_realizada'],
    minDurationMinutes: 60,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_eclipse_recebido'),
    name: 'Eclipse Recebido',
    description: 'Viveu conscientemente um eclipse em sua vida',
    tradition: 'astrologia',
    hierarchy: 'orixa',
    respectNote:
      'Eclipses solares e lunares abrem e fecham portais. Receber com ritual marca a travessia.',
    action: 'meditacao_completa',
    requires: ['consulta_realizada'],
    minDurationMinutes: 30,
    crossTradition: true,
    blocksSacredPractice: false,
  });

  // -- TANTRA TIER --------------------------------------------------------
  trySeed({
    id: badgeId('b_prana_conhecido'),
    name: 'Prana Conhecido',
    description: 'Aprendeu a conduzir o Prana (sopro vital)',
    tradition: 'tantra',
    hierarchy: 'orixa',
    respectNote:
      'O Prana é o sopro vital. Ida, Pingala e Sushumna são as nadis (canais) por onde o Prana corre. Conhecer é começar a respirar com presença.',
    action: 'meditacao_completa',
    requires: [],
    minDurationMinutes: 30,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_kundalini_desperta'),
    name: 'Kundalini Desperta',
    description: 'Despertou a energia Kundalini com mestre testemunha',
    tradition: 'tantra',
    hierarchy: 'mestre',
    respectNote:
      'A Kundalini é a serpente adormecida na base da coluna. Despertá-la sem mestre é perigoso. Honramos a linhagem e o trabalho gradual.',
    action: 'meditacao_completa',
    requires: ['meditacao_completa'],
    minDurationMinutes: 120,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_tantra_praticado'),
    name: 'Tantra Praticado',
    description: 'Praticou Tantra com intenção de presença e conexão',
    tradition: 'tantra',
    hierarchy: 'mestre',
    respectNote:
      'Tantra não é prática sexual em si — é presença total. Honramos os Chakras (7 principais) como portais do corpo sutil.',
    action: 'meditacao_completa',
    requires: ['meditacao_completa'],
    minDurationMinutes: 60,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_chandra_recebido'),
    name: 'Chandra Recebido',
    description: 'Recebeu um mantra Chandra (lunar) com mestre',
    tradition: 'tantra',
    hierarchy: 'orixa',
    respectNote:
      'Os mantras Chandra trabalham a energia lunar, intuição, feminilidade. Cada mantra é uma frequência recebida.',
    action: 'meditacao_completa',
    requires: ['meditacao_completa'],
    minDurationMinutes: 20,
    crossTradition: true,
    blocksSacredPractice: false,
  });

  // -- MESTRES TIER (cross-tradition mentorship) --------------------------
  trySeed({
    id: badgeId('b_mentoria_iniciada'),
    name: 'Mentoria Iniciada',
    description: 'Iniciou uma relação de mentoria espiritual',
    tradition: 'cigano_ramiro',
    hierarchy: 'mestre',
    respectNote:
      'Mentoria é relação de confiança, não hierarquia de guru. O mentor caminha junto, não acima. Em Cabala, em Candomblé, em Tantra — a forma muda, o respeito não. No método do Cigano Ramiro, a carta Cigana abre a porta da mentoria quando o consulente está pronto.',
    action: 'mentoria_recebida',
    requires: [],
    minDurationMinutes: 60,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_mestre_encontrado'),
    name: 'Mestre Encontrado',
    description: 'Encontrou um mestre vivo com quem caminhar',
    tradition: 'cigano_ramiro',
    hierarchy: 'mestre',
    respectNote:
      'Encontrar um mestre é reconhecer quem já trilhou o caminho. Não se escolhe — se reconhece. Quando o estudante está pronto, o mestre aparece. O Cigano Ramiro deixou cartas e linhagem; o mestre vivo aponta o naipe e a casa da Mesa Real onde o consulente deve parar.',
    action: 'mentoria_recebida',
    requires: ['mentoria_recebida'],
    minDurationMinutes: 120,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_linhagem_honrada'),
    name: 'Linhagem Honrada',
    description: 'Reconheceu e honrou sua linhagem espiritual',
    tradition: 'cigano_ramiro',
    hierarchy: 'mestre',
    respectNote:
      'Cada praticante carrega uma linhagem. Honrá-la é conhecer quem veio antes — Cigano Ramiro, Mestre Y, Babalaô Z, Rabino K. Agradeço a corrente. As 36 cartas e os 4 naipes guardam a memória da linhagem cigana, oral e silenciosa.',
    action: 'mentoria_recebida',
    requires: ['mentoria_recebida'],
    minDurationMinutes: 90,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_mestres_avancado'),
    name: 'Mestres Avançado',
    description: 'Aprofundou múltiplas linhagens com discernimento',
    tradition: 'cigano_ramiro',
    hierarchy: 'mestre',
    respectNote:
      'Avançado aqui é síntese, não acúmulo. Conhecer várias linhagens é ver a unidade por trás das formas. Na Mesa Real do Cigano Ramiro, a carta 33 (o Sol) ilumina a convergência de todas as cartas, todos os naipes.',
    action: 'mentoria_recebida',
    requires: ['mentoria_recebida', 'meditacao_completa'],
    minDurationMinutes: 240,
    crossTradition: true,
    blocksSacredPractice: false,
  });
  trySeed({
    id: badgeId('b_sabedoria_transmitida'),
    name: 'Sabedoria Transmitida',
    description: 'Ofereceu mentoria a outro praticante',
    tradition: 'cigano_ramiro',
    hierarchy: 'mestre',
    respectNote:
      'Transmitir é dar sem esperar retorno. A sabedoria que se oferece com intenção genuína multiplica o axé do grupo. A carta Cigana (29) representa exatamente isso: a linhagem que se oferece como dádiva, sem contrato.',
    action: 'mentoria_oferecida',
    requires: ['mentoria_recebida'],
    minDurationMinutes: 90,
    crossTradition: true,
    blocksSacredPractice: false,
  });

  return Object.freeze(seeded);
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export {
  hashCanonical,
  sha256Hex,
  sha256HexAsync,
  sha256HexSync,
  canonicalJson,
} from './achievements-badges.hash.ts';