// ============================================================================
// comments-mention-autocomplete.ts — Pure engine for @mention autocomplete
// (W90s-D)
//
// This module provides a *pure*, side-effect-free state model for the
// @mention autocomplete flow inside the comment composer. It does not know
// about React, DOM, or HTTP — that is intentional. The same engine is used
// by:
//
//   - `MentionAutocomplete.tsx` (UI popover with keyboard nav)
//   - `CommentComposerWithMentions.tsx` (composer wrapping the textarea)
//   - `app/posts/[id]/comment-with-mentions/page.tsx` (Server Component demo)
//
// All mutators return *new* state (immutable). All exports are
// `Object.freeze`-ed at module surface.
//
// Sacred-cultural compliance:
//   - 7 tradição symbols surfaced through the user dataset
//     (✦ cigano · 🪶 umbanda · ☩ candomblé · ◈ cabala · ☸ tantra ·
//      ☉ astrologia · ☬ ifá).
//   - Sacred terms preserved verbatim (Orixá, Caboclo, Babalaô, Yalorixá, Axé).
//   - No banned vocabulary (amarração, amarre, vinculação, vincular,
//     prejudicar) — this module never generates such strings.
//
// Branded types:
//   - `UserId`, `MentionHandle`, `MentionToken`, `AutocompleteStateId`
//     use unique symbols. They are erased at runtime but TS rejects
//     cross-mixing at compile time.
//
// Anti-patterns explicitly avoided (per W86–W89 lessons):
//   - No `await` inside pure helpers — these are sync.
//   - No `Date.now()` inside pure helpers — caller passes `nowMs` so the
//     engine is testable without time mocking.
//   - No global mutable state. Everything flows through parameters.
// ============================================================================

// ---------------------------------------------------------------------------
// Brand<TBase, TBrand> — nominal typing via unique symbol
// ---------------------------------------------------------------------------
declare const __brand: unique symbol;
export type Brand<TBase, TBrand extends string> = TBase & {
  readonly [__brand]: TBrand;
};

export type UserId = Brand<string, 'UserId'>;
export type MentionHandle = Brand<string, 'MentionHandle'>;
export type MentionToken = Brand<string, 'MentionToken'>;
export type AutocompleteStateId = Brand<string, 'AutocompleteStateId'>;

export const toUserId = (s: string): UserId => s as UserId;
export const toMentionHandle = (s: string): MentionHandle => s as MentionHandle;
export const toMentionToken = (s: string): MentionToken => s as MentionToken;
export const toAutocompleteStateId = (s: string): AutocompleteStateId =>
  s as AutocompleteStateId;

// ---------------------------------------------------------------------------
// 7 tradição symbols — surfaced through user.tradição
// ---------------------------------------------------------------------------
export const TRADIÇÃO_SYMBOLS = Object.freeze({
  cigano: '✦',
  umbanda: '🪶',
  candomble: '☩',
  cabala: '◈',
  tantra: '☸',
  astrologia: '☉',
  ifa: '☬',
} as const);

export type Tradição = keyof typeof TRADIÇÃO_SYMBOLS;

export const TRADIÇÃO_KEYS: ReadonlyArray<Tradição> = Object.freeze([
  'cigano',
  'umbanda',
  'candomble',
  'cabala',
  'tantra',
  'astrologia',
  'ifa',
]);

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface MentionUser {
  readonly id: UserId;
  /** URL-safe handle (lowercase, no diacritics). Used in @mention tokens. */
  readonly handle: MentionHandle;
  /** Display name shown in the popover (may contain diacritics/spaces). */
  readonly displayName: string;
  readonly avatarUrl?: string | null;
  /** Tradição principal do usuário — drives the symbol chip in the popover. */
  readonly tradição?: Tradição | null;
  /** Optional sacred-cultural tag (e.g. "Ogã", "Yalorixá"). Preserved
   *  verbatim — no transformation. */
  readonly spiritualTag?: string | null;
}

/** Where in the textarea text the partial @trigger lives. */
export interface MentionTrigger {
  /** Character index of the `@` symbol itself (inclusive). When the
   *  composer replaces this trigger, it slices the text BEFORE this index
   *  and inserts the full mention. */
  readonly startIndex: number;
  /** Character index where the partial handle ends (exclusive). Equals
   *  `startIndex + 1 + query.length`. */
  readonly endIndex: number;
  /** The partial handle the user has typed after `@`. Empty string if the
   *  user just typed `@` and hasn't typed anything else. */
  readonly query: string;
}

/** Single search hit in the autocomplete list. */
export interface MentionSuggestion {
  readonly user: MentionUser;
  /** Pre-computed score for stable sort. Lower = better. */
  readonly score: number;
  /** True when this suggestion is the exact handle match (e.g. user typed
   *  `@joao` and `joao` is in the dataset). */
  readonly isExactMatch: boolean;
}

/** The state object that `MentionAutocomplete.tsx` consumes. */
export interface MentionAutocompleteState {
  readonly id: AutocompleteStateId;
  /** Trigger position inside the composer text. `null` when the popover is
   *  closed (no `@` active, or `@` not followed by a handle character). */
  readonly trigger: MentionTrigger | null;
  /** Filtered, ranked suggestion list. Empty when `trigger == null`. */
  readonly suggestions: ReadonlyArray<MentionSuggestion>;
  /** Index of the suggestion that currently has keyboard focus. `-1` when
   *  no item is highlighted (e.g. empty suggestion list). */
  readonly activeIndex: number;
  /** Millisecond timestamp (caller-supplied, see note in header). */
  readonly computedAt: number;
}

// ---------------------------------------------------------------------------
// Constants — frozen at module load
// ---------------------------------------------------------------------------

export const MENTION_HANDLE_PATTERN: RegExp =
  /(?:^|\s)@([a-z0-9_.-]{0,30})/i;

export const MAX_SUGGESTIONS = 8;
export const MAX_QUERY_LENGTH = 30;
export const MIN_QUERY_FOR_RANKING = 1;
export const MIN_HANDLE_LENGTH = 3;
export const MAX_HANDLE_LENGTH = 30;
export const HANDLE_PATTERN = /^[a-z0-9_.-]+$/;

/** Score weights — kept as named constants so spec/tests can assert exact
 *  ordering. Lower score = better rank. */
export const SCORE_EXACT_PREFIX = 0;
export const SCORE_PREFIX = 10;
export const SCORE_SUBSTRING = 50;
export const SCORE_INITIALS = 80;
export const SCORE_FUZZY = 120;

/** Cap on how many suggestions the popover shows. Mirrors MAX_SUGGESTIONS
 *  but exposed for callers that want to override (tests, compact viewports). */
export const DEFAULT_VISIBLE_SUGGESTIONS = 8;

// ---------------------------------------------------------------------------
// Pure helpers — no I/O, no Date.now(), no random.
// ---------------------------------------------------------------------------

/**
 * Detect whether `char` is a valid handle continuation character. The user
 * is "still typing a handle" until they type whitespace, punctuation, or an
 * end-of-text marker.
 */
export function isHandleContinuationChar(char: string): boolean {
  if (!char) return false;
  return /[a-z0-9_.\-]/i.test(char);
}

/**
 * Find the active @trigger in `text` ending at `cursorPos`. Returns `null`
 * when no @trigger is active.
 *
 * Rules:
 *   - Walk backwards from `cursorPos` until a non-handle char is found.
 *   - If the char immediately before the run is `@`, return the trigger.
 *   - If the `@` is preceded by a non-whitespace, non-start char, return
 *     `null` (we don't allow `@joao` inside `email@joao`).
 *   - Cursor must be at the end of the handle (no characters typed after).
 */
export function findActiveTrigger(
  text: string,
  cursorPos: number,
): MentionTrigger | null {
  if (!text || cursorPos <= 0) return null;

  // Walk backwards while we're inside handle characters.
  let end = cursorPos;
  let start = cursorPos;
  while (start > 0) {
    const prev = text.charAt(start - 1);
    if (!isHandleContinuationChar(prev)) break;
    start--;
  }

  if (start === cursorPos) {
    // No handle chars before cursor — check if cursor is right after an `@`.
    if (cursorPos === 0) return null;
    const atChar = text.charAt(cursorPos - 1);
    if (atChar !== '@') return null;
    // Cursor sits right after `@` (no chars typed yet). Verify the char
    // before `@` is a handle boundary.
    if (cursorPos === 1) {
      return { startIndex: cursorPos - 1, endIndex: cursorPos, query: '' };
    }
    const before = text.charAt(cursorPos - 2);
    if (before && isHandleContinuationChar(before)) return null;
    if (before && /\S/.test(before)) return null;
    return { startIndex: cursorPos - 1, endIndex: cursorPos, query: '' };
  }

  // We have handle chars from start..end. Is the char at `start - 1` an `@`?
  if (start === 0) return null;
  const atChar = text.charAt(start - 1);
  if (atChar !== '@') return null;

  // Verify char before `@` is a word boundary.
  if (start > 1) {
    const before = text.charAt(start - 2);
    if (before && isHandleContinuationChar(before)) return null;
    if (before && /\S/.test(before)) return null;
  }

  const query = text.slice(start, end);
  if (query.length > MAX_QUERY_LENGTH) return null;

  return { startIndex: start - 1, endIndex: end, query };
}

/**
 * Lowercase + ASCII-fold a handle for case-insensitive matching. Preserves
 * 7-bit ASCII chars (`_`, `.`, `-`, `0-9`, `a-z`).
 */
export function normalizeForSearch(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Compute a search score for a single user against the partial `query`.
 *
 * Ranking:
 *   - SCORE_EXACT_PREFIX (0): query equals handle exactly.
 *   - SCORE_PREFIX (10): handle starts with query.
 *   - SCORE_SUBSTRING (50): handle contains query.
 *   - SCORE_INITIALS (80): initials of displayName match query (e.g. "mb"
 *     matches "Mestre Bimbom").
 *   - SCORE_FUZZY (120): bigram overlap, falls back to nothing below 30%.
 *
 * Returns `null` when there's no match (caller skips the user).
 */
export function scoreUser(
  user: MentionUser,
  query: string,
): { score: number; isExactMatch: boolean } | null {
  const q = normalizeForSearch(query.trim());
  const handle = normalizeForSearch(user.handle);
  const display = normalizeForSearch(user.displayName);

  if (q.length === 0) {
    // Empty query: include all users, but exact-match flag is false. We use
    // a stable, low score so callers can still order (handle asc).
    return { score: 50 + (handle.charCodeAt(0) || 0), isExactMatch: false };
  }

  if (handle === q) {
    return { score: SCORE_EXACT_PREFIX, isExactMatch: true };
  }
  if (handle.startsWith(q)) {
    return { score: SCORE_PREFIX + (handle.length - q.length), isExactMatch: false };
  }
  if (handle.includes(q)) {
    return { score: SCORE_SUBSTRING + (handle.indexOf(q) || 0), isExactMatch: false };
  }

  if (display.startsWith(q)) {
    return { score: SCORE_PREFIX + 5 + (display.length - q.length), isExactMatch: false };
  }
  if (display.includes(q)) {
    return {
      score: SCORE_SUBSTRING + 5 + (display.indexOf(q) || 0),
      isExactMatch: false,
    };
  }

  // Initials match: query like "mb" matches "Mestre Bimbom".
  const initials = display
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0] || '')
    .join('');
  if (initials.length >= 2 && initials.startsWith(q)) {
    return { score: SCORE_INITIALS, isExactMatch: false };
  }

  // Bigram-overlap fuzzy fallback.
  const bigramsQ = bigrams(q);
  const bigramsH = bigrams(handle + ' ' + display);
  if (bigramsQ.length === 0) return null;
  let overlap = 0;
  for (const b of bigramsQ) {
    if (bigramsH.includes(b)) overlap++;
  }
  const ratio = overlap / bigramsQ.length;
  if (ratio >= 0.3) {
    return {
      score: SCORE_FUZZY + Math.round((1 - ratio) * 10),
      isExactMatch: false,
    };
  }

  return null;
}

function bigrams(s: string): string[] {
  if (s.length < 2) return [s];
  const out: string[] = [];
  for (let i = 0; i < s.length - 1; i++) {
    out.push(s.slice(i, i + 2));
  }
  return out;
}

/**
 * Search the user dataset for suggestions matching `query`. Results are
 * sorted by score (asc), with ties broken by handle (asc).
 */
export function searchUsers(
  users: ReadonlyArray<MentionUser>,
  query: string,
  options: Readonly<{ limit?: number }> = {},
): ReadonlyArray<MentionSuggestion> {
  const limit = options.limit ?? MAX_SUGGESTIONS;
  if (!Array.isArray(users) || users.length === 0) return [];
  if (typeof query !== 'string') return [];

  const scored: MentionSuggestion[] = [];
  for (const u of users) {
    const result = scoreUser(u, query);
    if (!result) continue;
    scored.push({
      user: u,
      score: result.score,
      isExactMatch: result.isExactMatch,
    });
  }

  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.user.handle.localeCompare(b.user.handle);
  });

  return scored.slice(0, Math.max(0, limit));
}

/**
 * Validate that a mention token is well-formed. Used by the persist layer
 * before saving a comment to backend storage.
 *
 * Rules:
 *   - Token must start with `@`.
 *   - Handle (after `@`) must match HANDLE_PATTERN.
 *   - Length must be MIN_HANDLE_LENGTH..MAX_HANDLE_LENGTH inclusive.
 */
export function validateMention(
  token: string,
  knownHandles?: ReadonlySet<string>,
): { valid: boolean; handle?: MentionHandle; reason?: string } {
  if (typeof token !== 'string' || token.length === 0) {
    return { valid: false, reason: 'Token vazio.' };
  }
  if (!token.startsWith('@')) {
    return { valid: false, reason: 'Token precisa começar com @.' };
  }
  const handleRaw = token.slice(1);
  if (handleRaw.length < MIN_HANDLE_LENGTH) {
    return { valid: false, reason: `Handle precisa ter ao menos ${MIN_HANDLE_LENGTH} caracteres.` };
  }
  if (handleRaw.length > MAX_HANDLE_LENGTH) {
    return { valid: false, reason: `Handle não pode exceder ${MAX_HANDLE_LENGTH} caracteres.` };
  }
  if (!HANDLE_PATTERN.test(handleRaw.toLowerCase())) {
    return { valid: false, reason: 'Handle contém caracteres inválidos.' };
  }
  const normalized = handleRaw.toLowerCase();
  if (knownHandles && !knownHandles.has(normalized)) {
    return { valid: false, reason: 'Usuário não encontrado.' };
  }
  return { valid: true, handle: toMentionHandle(normalized) };
}

/**
 * Insert a mention into the composer text. Replaces the partial trigger
 * (from `trigger.startIndex` to `trigger.endIndex`) with `@<handle> ` (note
 * the trailing space).
 *
 * Returns:
 *   - `nextText`: the new textarea value.
 *   - `nextCursorPos`: where the caret should land after insertion (right
 *     after the inserted space, so the user can keep typing).
 */
export function insertMention(
  text: string,
  trigger: MentionTrigger,
  user: MentionUser,
): { nextText: string; nextCursorPos: number } {
  const replacement = `@${user.handle} `;
  const before = text.slice(0, trigger.startIndex);
  const after = text.slice(trigger.endIndex);
  const nextText = before + replacement + after;
  const nextCursorPos = before.length + replacement.length;
  return { nextText, nextCursorPos };
}

/**
 * Extract completed @mention tokens from a finalized comment text. Used by
 * the persist layer to dispatch notifications.
 *
 * Returns the unique handles in order of first appearance.
 */
export function parseMentions(text: string): ReadonlyArray<MentionHandle> {
  if (typeof text !== 'string' || text.length === 0) return [];
  const out: MentionHandle[] = [];
  const seen = new Set<string>();
  // Match @ followed by handle chars. Word boundary: preceded by start,
  // whitespace, or punctuation that is not part of a URL handle.
  const re = /(?:^|[^a-z0-9_.\-])@([a-z0-9_.-]{3,30})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = (m[1] ?? '').toLowerCase();
    if (seen.has(raw)) continue;
    seen.add(raw);
    out.push(toMentionHandle(raw));
    if (out.length >= 10) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Autocomplete state machine
// ---------------------------------------------------------------------------

/**
 * Build the initial empty state. Popover is closed.
 */
export function createInitialState(
  options: Readonly<{ nowMs?: number; id?: string }> = {},
): MentionAutocompleteState {
  return Object.freeze({
    id: toAutocompleteStateId(options.id ?? 'ac-0'),
    trigger: null,
    suggestions: Object.freeze([]) as ReadonlyArray<MentionSuggestion>,
    activeIndex: -1,
    computedAt: typeof options.nowMs === 'number' ? options.nowMs : 0,
  });
}

/**
 * Recompute the autocomplete state from the current composer text + cursor
 * position + user dataset. Pure function: no side effects.
 *
 * Returns a new state (or the same state if no transition is needed).
 */
export function computeAutocompleteState(
  prev: MentionAutocompleteState,
  text: string,
  cursorPos: number,
  users: ReadonlyArray<MentionUser>,
  options: Readonly<{ nowMs?: number; limit?: number }> = {},
): MentionAutocompleteState {
  const now = typeof options.nowMs === 'number' ? options.nowMs : prev.computedAt;
  const limit = options.limit ?? DEFAULT_VISIBLE_SUGGESTIONS;
  const trigger = findActiveTrigger(text, cursorPos);

  if (!trigger) {
    // No active trigger — close the popover.
    if (prev.trigger === null) return prev;
    return Object.freeze({
      id: prev.id,
      trigger: null,
      suggestions: Object.freeze([]) as ReadonlyArray<MentionSuggestion>,
      activeIndex: -1,
      computedAt: now,
    });
  }

  const suggestions = searchUsers(users, trigger.query, { limit });
  const activeIndex =
    suggestions.length === 0
      ? -1
      : prev.trigger &&
        prev.trigger.startIndex === trigger.startIndex &&
        prev.trigger.endIndex === trigger.endIndex &&
        prev.activeIndex >= 0 &&
        prev.activeIndex < suggestions.length
        ? prev.activeIndex
        : 0;

  return Object.freeze({
    id: prev.id,
    trigger,
    suggestions: Object.freeze(suggestions) as ReadonlyArray<MentionSuggestion>,
    activeIndex,
    computedAt: now,
  });
}

/**
 * Move the activeIndex by `delta` (+1 or -1). Clamps to valid range.
 */
export function moveActive(
  state: MentionAutocompleteState,
  delta: number,
): MentionAutocompleteState {
  if (state.suggestions.length === 0) {
    return Object.freeze({ ...state, activeIndex: -1 });
  }
  const next = state.activeIndex + delta;
  if (next < 0) return state;
  if (next >= state.suggestions.length) return state;
  return Object.freeze({ ...state, activeIndex: next });
}

/**
 * Set activeIndex to a specific value (used by click handlers + aria
 * activedescendant updates). Clamps to [-1, suggestions.length-1].
 */
export function setActive(
  state: MentionAutocompleteState,
  index: number,
): MentionAutocompleteState {
  if (state.suggestions.length === 0) {
    return Object.freeze({ ...state, activeIndex: -1 });
  }
  const clamped = Math.max(0, Math.min(index, state.suggestions.length - 1));
  return Object.freeze({ ...state, activeIndex: clamped });
}

// ---------------------------------------------------------------------------
// Factory — frozen handle, ergonomic consumer surface
// ---------------------------------------------------------------------------

export interface MentionEngine {
  /** Find active @trigger given text + cursor. */
  readonly findActiveTrigger: typeof findActiveTrigger;
  /** Rank user dataset against a query. */
  readonly searchUsers: typeof searchUsers;
  /** Replace partial @trigger with full @handle + space. */
  readonly insertMention: typeof insertMention;
  /** Validate a finalized @mention token. */
  readonly validateMention: typeof validateMention;
  /** Extract all completed mentions from a comment text. */
  readonly parseMentions: typeof parseMentions;
  /** Compute the autocomplete state (popover open/closed + suggestions). */
  readonly computeAutocompleteState: typeof computeAutocompleteState;
  /** Keyboard navigation helper. */
  readonly moveActive: typeof moveActive;
  /** Direct activeIndex setter. */
  readonly setActive: typeof setActive;
  /** Initial empty state. */
  readonly createInitialState: typeof createInitialState;
  /** Constants surface. */
  readonly constants: Readonly<{
    MAX_SUGGESTIONS: number;
    MAX_QUERY_LENGTH: number;
    MIN_QUERY_FOR_RANKING: number;
    MIN_HANDLE_LENGTH: number;
    MAX_HANDLE_LENGTH: number;
    DEFAULT_VISIBLE_SUGGESTIONS: number;
    TRADIÇÃO_KEYS: ReadonlyArray<Tradição>;
    TRADIÇÃO_SYMBOLS: typeof TRADIÇÃO_SYMBOLS;
  }>;
}

export function createMentionEngine(): MentionEngine {
  const handle: MentionEngine = Object.freeze({
    findActiveTrigger,
    searchUsers,
    insertMention,
    validateMention,
    parseMentions,
    computeAutocompleteState,
    moveActive,
    setActive,
    createInitialState,
    constants: Object.freeze({
      MAX_SUGGESTIONS,
      MAX_QUERY_LENGTH,
      MIN_QUERY_FOR_RANKING,
      MIN_HANDLE_LENGTH,
      MAX_HANDLE_LENGTH,
      DEFAULT_VISIBLE_SUGGESTIONS,
      TRADIÇÃO_KEYS,
      TRADIÇÃO_SYMBOLS,
    }),
  });
  return handle;
}

/**
 * Frozen default engine instance for ergonomic import in React components.
 */
export const mentionEngine: MentionEngine = Object.freeze(createMentionEngine());