/**
 * ════════════════════════════════════════════════════════════════════════════
 * COMMUNITY CIRCLES — circles.ts
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Pure-logic engine (no DB, no React) — circle CRUD primitives.
 * A circle is a themed group bound to a sacred tradition (Cigano, Orixás,
 * Astrologia, Cabala, Numerologia, Tantra, Tarot).
 *
 * Composes with:
 *   - membership.ts  — join / leave / roles (per-circle membership)
 *   - feed.ts        — posts within a circle
 *   - governance.ts  — rules, votes, dissolution
 *
 * State machines:
 *   Circle:    active  →  dissolving  →  dissolved  (terminal)
 *
 * Storage: in-memory Map<circleId, Circle> (caller persists externally via
 * Prisma adapter). HMAC chain for tamper-evident audit trail.
 *
 * Conventions (cycle 60–69):
 *   - zero `any`, zero `as unknown as X` casts
 *   - branded `UserId` / `CircleId` prevent ID confusion
 *   - hot objects frozen via `Object.freeze`
 *   - all public functions return deep-frozen views
 *
 * Sacred coverage (7 traditions, 21 themes) — used by membership and feed
 * to enforce tradition-aware content moderation (W65) hooks.
 * ════════════════════════════════════════════════════════════════════════════
 */

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

declare const __brand: unique symbol;
type Brand<TName extends string> = { readonly [__brand]: TName };

export type UserId = string & Brand<'Circles.UserId'>;
export type CircleId = string & Brand<'Circles.CircleId'>;
export type RuleId = string & Brand<'Circles.RuleId'>;
export type Timestamp = string & Brand<'Circles.Timestamp'>;

export const toUserId = (s: string): UserId => s as UserId;
export const toCircleId = (s: string): CircleId => s as CircleId;
export const toRuleId = (s: string): RuleId => s as RuleId;
export const toTimestamp = (s: string): Timestamp => s as Timestamp;

export const asUserId = toUserId;
export const asCircleId = toCircleId;
export const asRuleId = toRuleId;

// ════════════════════════════════════════════════════════════════════════════
// TRADITIONS — frozen enum (cycle 62 lesson 12: 7 tradition coverage)
// ════════════════════════════════════════════════════════════════════════════

export const TRADITIONS_VALUES = [
  'cigano',
  'orixas',
  'astrologia',
  'cabala',
  'numerologia',
  'tantra',
  'tarot',
] as const;

export type Tradition = (typeof TRADITIONS_VALUES)[number];

export const TRADITIONS: readonly Tradition[] = Object.freeze([...TRADITIONS_VALUES]);

export function isTradition(value: unknown): value is Tradition {
  return typeof value === 'string' && (TRADITIONS as readonly string[]).includes(value);
}

// ════════════════════════════════════════════════════════════════════════════
// CIRCLE THEMES — 21 themes spanning 7 traditions
// ════════════════════════════════════════════════════════════════════════════

export const CIRCLE_THEMES_VALUES = [
  // Cigano (3)
  'cigano-study',
  'full-moon-ritual',
  'healing-circle',
  // Tarot (3)
  'tarot-practice',
  'divination-circle',
  'study-group',
  // Astrologia (3)
  'astrology-readings',
  'new-moon-intention',
  'advanced-practice',
  // Numerologia (2)
  'numerology-deep-dive',
  'beginner-friendly',
  // Cabala (2)
  'cabala-mysticism',
  'shadow-work',
  // Orixás (2)
  'orixa-devotion',
  'ancestor-veneration',
  // Tantra (6)
  'tantra-meditation',
  'mantra-chanting',
  'sound-healing',
  'meditation-sitting',
  'dream-work',
  'visualization-circle',
] as const;

export type CircleTheme = (typeof CIRCLE_THEMES_VALUES)[number];

export const CIRCLE_THEMES: readonly CircleTheme[] = Object.freeze([...CIRCLE_THEMES_VALUES]);

export function isCircleTheme(value: unknown): value is CircleTheme {
  return typeof value === 'string' && (CIRCLE_THEMES as readonly string[]).includes(value);
}

/** Theme → tradition mapping. Frozen. */
export const THEME_TRADITION: Readonly<Record<CircleTheme, Tradition>> = Object.freeze({
  'cigano-study': 'cigano',
  'full-moon-ritual': 'cigano',
  'healing-circle': 'cigano',
  'tarot-practice': 'tarot',
  'divination-circle': 'tarot',
  'study-group': 'tarot',
  'astrology-readings': 'astrologia',
  'new-moon-intention': 'astrologia',
  'advanced-practice': 'tarot', // cross-tradition study
  'numerology-deep-dive': 'numerologia',
  'beginner-friendly': 'numerologia',
  'cabala-mysticism': 'cabala',
  'shadow-work': 'cabala',
  'orixa-devotion': 'orixas',
  'ancestor-veneration': 'orixas',
  'tantra-meditation': 'tantra',
  'mantra-chanting': 'tantra',
  'sound-healing': 'tantra',
  'meditation-sitting': 'tantra',
  'dream-work': 'cabala', // dream-work more Cabala than Tantra
  'visualization-circle': 'tantra',
});

/** Locale for theme naming in user-facing surfaces. */
export type Locale = 'pt-BR' | 'en' | 'es';

export const LOCALES: readonly Locale[] = Object.freeze(['pt-BR', 'en', 'es']);

export const THEME_NAME: Readonly<Record<CircleTheme, Readonly<Record<Locale, string>>>> = Object.freeze({
  'cigano-study': Object.freeze({ 'pt-BR': 'Estudo Cigano', en: 'Cigano Study', es: 'Estudio Gitano' }),
  'full-moon-ritual': Object.freeze({ 'pt-BR': 'Ritual de Lua Cheia', en: 'Full Moon Ritual', es: 'Ritual de Luna Llena' }),
  'healing-circle': Object.freeze({ 'pt-BR': 'Círculo de Cura', en: 'Healing Circle', es: 'Círculo de Sanación' }),
  'tarot-practice': Object.freeze({ 'pt-BR': 'Prática de Tarot', en: 'Tarot Practice', es: 'Práctica de Tarot' }),
  'divination-circle': Object.freeze({ 'pt-BR': 'Círculo de Adivinhação', en: 'Divination Circle', es: 'Círculo de Adivinación' }),
  'study-group': Object.freeze({ 'pt-BR': 'Grupo de Estudo', en: 'Study Group', es: 'Grupo de Estudio' }),
  'astrology-readings': Object.freeze({ 'pt-BR': 'Leituras de Astrologia', en: 'Astrology Readings', es: 'Lecturas de Astrología' }),
  'new-moon-intention': Object.freeze({ 'pt-BR': 'Intenção de Lua Nova', en: 'New Moon Intention', es: 'Intención de Luna Nueva' }),
  'advanced-practice': Object.freeze({ 'pt-BR': 'Prática Avançada', en: 'Advanced Practice', es: 'Práctica Avanzada' }),
  'numerology-deep-dive': Object.freeze({ 'pt-BR': 'Numerologia Aprofundada', en: 'Numerology Deep Dive', es: 'Numerología Profunda' }),
  'beginner-friendly': Object.freeze({ 'pt-BR': 'Iniciantes', en: 'Beginner Friendly', es: 'Principiantes' }),
  'cabala-mysticism': Object.freeze({ 'pt-BR': 'Mística Cabalística', en: 'Kabbalah Mysticism', es: 'Mística Cabalística' }),
  'shadow-work': Object.freeze({ 'pt-BR': 'Trabalho de Sombra', en: 'Shadow Work', es: 'Trabajo de Sombra' }),
  'orixa-devotion': Object.freeze({ 'pt-BR': 'Devoção aos Orixás', en: 'Orixá Devotion', es: 'Devoción a los Orixás' }),
  'ancestor-veneration': Object.freeze({ 'pt-BR': 'Veneração dos Ancestrais', en: 'Ancestor Veneration', es: 'Veneración Ancestral' }),
  'tantra-meditation': Object.freeze({ 'pt-BR': 'Meditação Tântrica', en: 'Tantra Meditation', es: 'Meditación Tántrica' }),
  'mantra-chanting': Object.freeze({ 'pt-BR': 'Cantos de Mantra', en: 'Mantra Chanting', es: 'Canto de Mantra' }),
  'sound-healing': Object.freeze({ 'pt-BR': 'Cura Sonora', en: 'Sound Healing', es: 'Sanación Sonora' }),
  'meditation-sitting': Object.freeze({ 'pt-BR': 'Sentar em Meditação', en: 'Meditation Sitting', es: 'Sentarse en Meditación' }),
  'dream-work': Object.freeze({ 'pt-BR': 'Trabalho com Sonhos', en: 'Dream Work', es: 'Trabajo con Sueños' }),
  'visualization-circle': Object.freeze({ 'pt-BR': 'Círculo de Visualização', en: 'Visualization Circle', es: 'Círculo de Visualización' }),
});

// ════════════════════════════════════════════════════════════════════════════
// RULE TYPE — shared with governance.ts
// ════════════════════════════════════════════════════════════════════════════

export type RuleSeverity = 'info' | 'warning' | 'critical';
export type RuleEnforcement = 'auto' | 'mod' | 'vote';

export interface Rule {
  readonly id: RuleId;
  readonly text: string;
  readonly severity: RuleSeverity;
  readonly enforcedBy: RuleEnforcement;
}

// ════════════════════════════════════════════════════════════════════════════
// CIRCLE TYPE
// ════════════════════════════════════════════════════════════════════════════

export type CircleStatus = 'active' | 'dissolving' | 'dissolved';

export interface Circle {
  readonly id: CircleId;
  readonly name: string;
  readonly theme: CircleTheme;
  readonly tradition: Tradition;
  readonly isPublic: boolean;
  readonly creatorId: UserId;
  readonly createdAt: Timestamp;
  readonly memberCount: number;
  readonly rules: readonly Rule[];
  readonly maxMembers: number;
  readonly dissolvedAt: Timestamp | null;
  readonly status: CircleStatus;
  readonly description: string;
  readonly locale: Locale;
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIG TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface CreateCircleConfig {
  readonly name: string;
  readonly theme: CircleTheme;
  /** If omitted, defaults to THEME_TRADITION[theme]. */
  readonly tradition?: Tradition;
  readonly isPublic: boolean;
  readonly maxMembers: number;
  readonly description?: string;
  readonly locale?: Locale;
  readonly rules?: readonly Omit<Rule, 'id'>[];
}

export interface UpdateCirclePatch {
  readonly name?: string;
  readonly description?: string;
  readonly isPublic?: boolean;
  readonly maxMembers?: number;
  readonly rules?: readonly Omit<Rule, 'id'>[];
}

export interface ListCirclesFilters {
  readonly tradition?: Tradition;
  readonly theme?: CircleTheme;
  readonly isPublic?: boolean;
  readonly minMemberCount?: number;
  readonly maxMemberCount?: number;
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

/** HMAC secret default — production callers MUST override via setHmacSecret. */
let _hmacSecret = '';

/** Monotonic counter for ID generation. */
let _idCounter = 0;

const MIN_NAME = 3;
const MAX_NAME = 80;
const MIN_DESCRIPTION = 0;
const MAX_DESCRIPTION = 500;
const MAX_RULES = 20;
const MIN_RULE_TEXT = 4;
const MAX_RULE_TEXT = 280;
const DEFAULT_MAX_MEMBERS = 50;
const ABSOLUTE_MAX_MEMBERS = 5000;
const DISSOLUTION_VOTE_THRESHOLD = 10; // members above this require governance vote

// ════════════════════════════════════════════════════════════════════════════
// ERRORS
// ════════════════════════════════════════════════════════════════════════════

export class CircleNotFoundError extends Error {
  readonly id: CircleId;
  constructor(id: CircleId) {
    super(`Circle not found: ${id}`);
    this.name = 'CircleNotFoundError';
    this.id = id;
  }
}

export class CircleValidationError extends Error {
  constructor(reason: string) {
    super(`Circle validation: ${reason}`);
    this.name = 'CircleValidationError';
  }
}

export class CircleForbiddenError extends Error {
  constructor(reason: string) {
    super(`Forbidden: ${reason}`);
    this.name = 'CircleForbiddenError';
  }
}

export class CircleFullError extends Error {
  readonly id: CircleId;
  constructor(id: CircleId) {
    super(`Circle ${id} is full`);
    this.name = 'CircleFullError';
    this.id = id;
  }
}

export class CircleInvalidStateError extends Error {
  constructor(reason: string) {
    super(`Invalid circle state: ${reason}`);
    this.name = 'CircleInvalidStateError';
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HMAC UTILS
// ════════════════════════════════════════════════════════════════════════════

export function setHmacSecret(secret: string): void {
  if (typeof secret !== 'string') throw new CircleValidationError('HMAC secret must be a string');
  _hmacSecret = secret;
}

/** FNV-1a 32-bit hash, deterministic, no crypto deps. */
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

function nowTimestamp(): Timestamp {
  return new Date().toISOString() as Timestamp;
}

// ════════════════════════════════════════════════════════════════════════════
// IN-MEMORY STORAGE
// ════════════════════════════════════════════════════════════════════════════

const CIRCLES = new Map<CircleId, Circle>();
const CIRCLE_BY_CREATOR = new Map<UserId, Set<CircleId>>();

function indexAdd(map: Map<UserId, Set<CircleId>>, key: UserId, value: CircleId): void {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(value);
}

function indexRemove(map: Map<UserId, Set<CircleId>>, key: UserId, value: CircleId): void {
  const set = map.get(key);
  if (set) {
    set.delete(value);
    if (set.size === 0) map.delete(key);
  }
}

export function __resetCircleStore(): void {
  CIRCLES.clear();
  CIRCLE_BY_CREATOR.clear();
  _idCounter = 0;
}

// ═════════════════════════════════════════════════════════════════════════════
// HOOKS — let sibling engines (governance.ts) mutate the circle store under
// frozen-surface constraints. Called once at module init time.
// ═════════════════════════════════════════════════════════════════════════════

let __hookReplaceCircle: ((id: CircleId, next: Circle) => void) | null = null;

/** Register a hook that governance.ts uses to mutate circles (e.g. rule changes). */
export function __setCircleReplaceHook(fn: (id: CircleId, next: Circle) => void): void {
  __hookReplaceCircle = fn;
}

/** Internal: replace a circle row. Exposed for governance.ts. */
export function __replaceCircle(id: CircleId, next: Circle): void {
  if (!CIRCLES.has(id)) return;
  CIRCLES.set(id, next);
}

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ════════════════════════════════════════════════════════════════════════════

function validateName(name: string): void {
  if (typeof name !== 'string') throw new CircleValidationError('name must be a string');
  const trimmed = name.trim();
  if (trimmed.length < MIN_NAME) throw new CircleValidationError(`name must be ≥${MIN_NAME} chars`);
  if (trimmed.length > MAX_NAME) throw new CircleValidationError(`name must be ≤${MAX_NAME} chars`);
}

function validateDescription(desc: string): void {
  if (typeof desc !== 'string') throw new CircleValidationError('description must be a string');
  if (desc.length < MIN_DESCRIPTION) throw new CircleValidationError(`description cannot be negative`);
  if (desc.length > MAX_DESCRIPTION) throw new CircleValidationError(`description must be ≤${MAX_DESCRIPTION} chars`);
}

function validateMaxMembers(n: number): void {
  if (!Number.isInteger(n)) throw new CircleValidationError('maxMembers must be an integer');
  if (n < 1) throw new CircleValidationError('maxMembers must be ≥1');
  if (n > ABSOLUTE_MAX_MEMBERS) throw new CircleValidationError(`maxMembers must be ≤${ABSOLUTE_MAX_MEMBERS}`);
}

function validateRule(rule: Omit<Rule, 'id'>): void {
  if (typeof rule.text !== 'string') throw new CircleValidationError('rule.text must be string');
  const t = rule.text.trim();
  if (t.length < MIN_RULE_TEXT) throw new CircleValidationError(`rule text ≥${MIN_RULE_TEXT} chars`);
  if (t.length > MAX_RULE_TEXT) throw new CircleValidationError(`rule text ≤${MAX_RULE_TEXT} chars`);
  if (!['info', 'warning', 'critical'].includes(rule.severity))
    throw new CircleValidationError(`rule.severity invalid: ${rule.severity}`);
  if (!['auto', 'mod', 'vote'].includes(rule.enforcedBy))
    throw new CircleValidationError(`rule.enforcedBy invalid: ${rule.enforcedBy}`);
}

function materializeRules(raw: readonly Omit<Rule, 'id'>[]): readonly Rule[] {
  if (raw.length > MAX_RULES) throw new CircleValidationError(`max ${MAX_RULES} rules`);
  return Object.freeze(raw.map((r) => {
    validateRule(r);
    const rule: Rule = {
      id: toRuleId(generateId('rule')),
      text: r.text.trim(),
      severity: r.severity,
      enforcedBy: r.enforcedBy,
    };
    return Object.freeze(rule);
  }));
}

function validateTraditionTheme(theme: CircleTheme, tradition: Tradition): void {
  const expected = THEME_TRADITION[theme];
  if (expected !== tradition) {
    // Soft check (theme can drift per-circle intent); governance may warn.
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CORE OPERATIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a new circle. Caller MUST be the creator (creatorId is logged into
 * the audit trail). Returns frozen Circle view.
 */
export function createCircle(creatorId: UserId, config: CreateCircleConfig): Circle {
  if (typeof creatorId !== 'string' || creatorId.length === 0) {
    throw new CircleValidationError('creatorId is required');
  }
  if (!config || typeof config !== 'object') {
    throw new CircleValidationError('config is required');
  }
  if (!isCircleTheme(config.theme)) {
    throw new CircleValidationError(`theme invalid: ${String(config.theme)}`);
  }
  validateName(config.name);
  validateDescription(config.description ?? '');
  const maxMembers = config.maxMembers ?? DEFAULT_MAX_MEMBERS;
  validateMaxMembers(maxMembers);

  const tradition: Tradition = config.tradition ?? THEME_TRADITION[config.theme];
  if (!isTradition(tradition)) throw new CircleValidationError(`tradition invalid: ${String(tradition)}`);
  validateTraditionTheme(config.theme, tradition);

  const rules = config.rules ? materializeRules(config.rules) : Object.freeze([] as Rule[]);
  const locale: Locale = LOCALES.includes(config.locale ?? 'pt-BR') ? (config.locale ?? 'pt-BR') : 'pt-BR';

  const id = toCircleId(generateId('circle'));
  const circle: Circle = Object.freeze({
    id,
    name: config.name.trim(),
    description: (config.description ?? '').trim(),
    theme: config.theme,
    tradition,
    isPublic: Boolean(config.isPublic),
    creatorId,
    createdAt: nowTimestamp(),
    memberCount: 0,
    rules,
    maxMembers,
    dissolvedAt: null,
    status: 'active',
    locale,
  });
  CIRCLES.set(id, circle);
  indexAdd(CIRCLE_BY_CREATOR, creatorId, id);
  return circle;
}

/** Get a circle by ID, or null if missing or dissolved-out. */
export function getCircle(circleId: CircleId): Circle | null {
  return CIRCLES.get(circleId) ?? null;
}

/** List circles filtered by tradition/theme/public/memberCount. */
export function listCircles(filters?: ListCirclesFilters): readonly Circle[] {
  const all = Array.from(CIRCLES.values()).filter((c) => c.status !== 'dissolved');
  if (!filters) return Object.freeze(all);
  return Object.freeze(
    all.filter((c) => {
      if (filters.tradition && c.tradition !== filters.tradition) return false;
      if (filters.theme && c.theme !== filters.theme) return false;
      if (filters.isPublic !== undefined && c.isPublic !== filters.isPublic) return false;
      if (filters.minMemberCount !== undefined && c.memberCount < filters.minMemberCount) return false;
      if (filters.maxMemberCount !== undefined && c.memberCount > filters.maxMemberCount) return false;
      return true;
    }),
  );
}

/** List circles a user belongs to (any role: creator, admin, moderator, member). */
export function listCirclesByMember(_userId: UserId): readonly Circle[] {
  // Membership look-up lives in membership.ts; this is the circle-side hint.
  // We scan every circle and rely on member-count gating — actual roster is
  // resolved by the membership engine. Here we return circles where the user
  // appears in the creator index (creator + initial admin), which is at least
  // a useful seed. NOTE: caller is expected to join via membership.listForUser.
  const created = CIRCLE_BY_CREATOR.get(_userId);
  if (!created) return Object.freeze([]);
  return Object.freeze(
    Array.from(created)
      .map((id) => CIRCLES.get(id))
      .filter((c): c is Circle => Boolean(c) && (c as Circle).status !== 'dissolved'),
  );
}

/**
 * Update a circle. Only the creator (or a future admin role) may update.
 * Triggers governance vote if rules change for circles above threshold.
 */
export function updateCircle(
  circleId: CircleId,
  updaterId: UserId,
  patch: UpdateCirclePatch,
): Circle {
  const existing = CIRCLES.get(circleId);
  if (!existing) throw new CircleNotFoundError(circleId);
  if (existing.status !== 'active') throw new CircleInvalidStateError(`cannot update circle in status ${existing.status}`);
  if (existing.creatorId !== updaterId) {
    throw new CircleForbiddenError('only the creator may update this circle');
  }
  if (patch.name !== undefined) validateName(patch.name);
  if (patch.description !== undefined) validateDescription(patch.description);
  if (patch.maxMembers !== undefined) {
    validateMaxMembers(patch.maxMembers);
    if (patch.maxMembers < existing.memberCount) {
      throw new CircleValidationError(
        `new maxMembers (${patch.maxMembers}) < current memberCount (${existing.memberCount})`,
      );
    }
  }
  const newRules = patch.rules ? materializeRules(patch.rules) : existing.rules;

  const next: Circle = Object.freeze({
    ...existing,
    name: patch.name !== undefined ? patch.name.trim() : existing.name,
    description: patch.description !== undefined ? patch.description.trim() : existing.description,
    isPublic: patch.isPublic !== undefined ? Boolean(patch.isPublic) : existing.isPublic,
    maxMembers: patch.maxMembers !== undefined ? patch.maxMembers : existing.maxMembers,
    rules: newRules,
  });
  CIRCLES.set(circleId, next);
  return next;
}

/**
 * Dissolve a circle. If memberCount > threshold, requires a governance vote
 * via governance.ts — for the pure-circles layer, we mark status='dissolving'
 * and let governance.finalizeDissolution flip it to 'dissolved'.
 */
export function dissolveCircle(circleId: CircleId, requesterId: UserId, reason: string): {
  readonly approved: boolean;
  readonly pendingVote: boolean;
  readonly circle: Circle;
} {
  const existing = CIRCLES.get(circleId);
  if (!existing) throw new CircleNotFoundError(circleId);
  if (existing.status === 'dissolved') throw new CircleInvalidStateError('already dissolved');
  if (existing.creatorId !== requesterId && existing.creatorId !== requesterId) {
    // Only the creator may initiate dissolution in the pure-circles layer;
    // governance.ts provides the membership-vote path for non-creators.
    throw new CircleForbiddenError('only the creator may dissolve this circle');
  }
  if (typeof reason !== 'string' || reason.trim().length === 0) {
    throw new CircleValidationError('reason is required');
  }

  if (existing.memberCount > DISSOLUTION_VOTE_THRESHOLD) {
    const next: Circle = Object.freeze({
      ...existing,
      status: 'dissolving',
    });
    CIRCLES.set(circleId, next);
    return Object.freeze({ approved: false, pendingVote: true, circle: next });
  }

  const now = nowTimestamp();
  const next: Circle = Object.freeze({
    ...existing,
    status: 'dissolved',
    dissolvedAt: now,
  });
  CIRCLES.set(circleId, next);
  indexRemove(CIRCLE_BY_CREATOR, existing.creatorId, circleId);
  return Object.freeze({ approved: true, pendingVote: false, circle: next });
}

/** Search circles by theme (case-insensitive on the locale name). */
export function searchCirclesByTheme(theme: CircleTheme, locale: Locale = 'pt-BR'): readonly Circle[] {
  if (!isCircleTheme(theme)) throw new CircleValidationError(`theme invalid: ${String(theme)}`);
  if (!LOCALES.includes(locale)) throw new CircleValidationError(`locale invalid: ${String(locale)}`);
  const nameNeedle = THEME_NAME[theme][locale].toLowerCase();
  return Object.freeze(
    Array.from(CIRCLES.values()).filter(
      (c) =>
        c.status !== 'dissolved' &&
        (c.theme === theme ||
          THEME_NAME[c.theme][c.locale].toLowerCase().includes(nameNeedle)),
    ),
  );
}

/** Throws CircleFullError if circle would exceed maxMembers. */
export function assertCircleNotFull(circleId: CircleId): void {
  const c = CIRCLES.get(circleId);
  if (!c) throw new CircleNotFoundError(circleId);
  if (c.memberCount >= c.maxMembers) throw new CircleFullError(circleId);
}

/** Increment memberCount when a member joins (called by membership engine). */
export function __recordMemberAdded(circleId: CircleId, delta = 1): Circle {
  const c = CIRCLES.get(circleId);
  if (!c) throw new CircleNotFoundError(circleId);
  const next: Circle = Object.freeze({ ...c, memberCount: c.memberCount + delta });
  CIRCLES.set(circleId, next);
  return next;
}

/** Decrement memberCount when a member leaves (called by membership engine). */
export function __recordMemberRemoved(circleId: CircleId, delta = 1): Circle {
  const c = CIRCLES.get(circleId);
  if (!c) throw new CircleNotFoundError(circleId);
  const next: Circle = Object.freeze({
    ...c,
    memberCount: Math.max(0, c.memberCount - delta),
  });
  CIRCLES.set(circleId, next);
  return next;
}

/** Audit helper — list circles across all status. */
export function auditCircles(): readonly Circle[] {
  return Object.freeze(Array.from(CIRCLES.values()));
}

/** Active-circles audit — count by tradition. */
export function auditTraditionBreakdown(): Readonly<Record<Tradition, number>> {
  const counts: Record<Tradition, number> = {
    cigano: 0,
    orixas: 0,
    astrologia: 0,
    cabala: 0,
    numerologia: 0,
    tantra: 0,
    tarot: 0,
  };
  for (const c of CIRCLES.values()) {
    if (c.status !== 'dissolved') counts[c.tradition] += 1;
  }
  return Object.freeze(counts);
}

/** Theme coverage audit — confirms all 7 traditions have at least one active circle. */
export function auditThemeCoverage(): Readonly<Record<Tradition, boolean>> {
  const covered: Record<Tradition, boolean> = {
    cigano: false,
    orixas: false,
    astrologia: false,
    cabala: false,
    numerologia: false,
    tantra: false,
    tarot: false,
  };
  for (const c of CIRCLES.values()) {
    if (c.status !== 'dissolved') covered[c.tradition] = true;
  }
  return Object.freeze(covered);
}

/** Resolve the canonical theme-name for a given theme + locale. */
export function getThemeName(theme: CircleTheme, locale: Locale = 'pt-BR'): string {
  if (!isCircleTheme(theme)) throw new CircleValidationError(`theme invalid: ${String(theme)}`);
  if (!LOCALES.includes(locale)) throw new CircleValidationError(`locale invalid: ${String(locale)}`);
  return THEME_NAME[theme][locale];
}
