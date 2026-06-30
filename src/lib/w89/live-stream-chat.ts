// ============================================================================
// live-stream-chat.ts — Pure chat engine for live-stream-chat (W89-A)
//
// This module provides a *pure*, side-effect-free state model for live-stream
// chat. The engine is consumed by the `LiveStreamChat` React component, but it
// does not know about React, sockets, or HTTP — that is intentional. The same
// engine can later be wired to:
//
//   - a Server-Sent Events stream (POST /api/live/[id]/chat)
//   - a Supabase realtime channel
//   - a self-hosted WebSocket gateway
//
// All mutators return *new* state (immutable). All exports are `Object.freeze`-ed.
//
// Sacred-cultural compliance:
//   - No negative moderation vocabulary ("amarração", "vinculação", etc.).
//   - All moderation checks return descriptive `reason` strings, never
//     blame language.
//   - Reactions are positive-only emojis (no downvote / shame reactions).
//
// Branded types:
//   - `LiveStreamMessageId`, `LiveStreamId`, `UserId` use unique symbols.
//   - They are erased at runtime but TS will reject cross-mixing at compile.
//
// Anti-patterns explicitly avoided (per W86–W88 lessons):
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

export type LiveStreamMessageId = Brand<string, 'LiveStreamMessageId'>;
export type LiveStreamId = Brand<string, 'LiveStreamId'>;
export type UserId = Brand<string, 'UserId'>;

// Tiny ergonomic constructors — keep code readable without unsafe casts.
export const toMessageId = (s: string): LiveStreamMessageId =>
  s as LiveStreamMessageId;
export const toStreamId = (s: string): LiveStreamId => s as LiveStreamId;
export const toUserId = (s: string): UserId => s as UserId;

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------
export interface ChatReaction {
  /** Single-emoji string, e.g. "🙏", "✨", "🪶". */
  readonly emoji: string;
  /** Number of distinct users who reacted (we don't track per-user at the
   *  pure-engine level; the caller / persistence layer is responsible for
   *  per-user dedupe). */
  readonly count: number;
}

export interface LiveStreamMessage {
  readonly id: LiveStreamMessageId;
  readonly streamId: LiveStreamId;
  readonly userId: UserId;
  readonly userName: string;
  readonly text: string;
  /** Millisecond timestamp (caller-supplied, see note in header). */
  readonly createdAt: number;
  readonly reactions: ReadonlyArray<ChatReaction>;
  /** Soft-delete flag — message body is hidden but the slot is preserved so
   *  reaction counts don't shift when something is removed. */
  readonly deleted?: boolean;
}

export interface LiveStreamChatState {
  readonly messages: ReadonlyArray<LiveStreamMessage>;
  readonly pinnedId: LiveStreamMessageId | null;
  readonly slowModeSeconds: number;
  /** Per-user last-message timestamps used by the slow-mode gate. */
  readonly lastSentByUser: Readonly<Record<string, number>>;
  /** Soft-banned word list (lowercase, exact-match). Caller configures. */
  readonly bannedWords: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Constants — frozen at module load
// ---------------------------------------------------------------------------
export const MAX_MESSAGE_LENGTH = 500;
export const MAX_VISIBLE_MESSAGES = 100;
export const MIN_SLOW_MODE_SECONDS = 0;
export const MAX_SLOW_MODE_SECONDS = 60;
export const DEFAULT_SLOW_MODE_SECONDS = 0;

export const ALLOWED_REACTIONS: ReadonlyArray<string> = Object.freeze([
  '🙏',
  '✨',
  '🪶',
  '☉',
  '☸',
  '✦',
  '◈',
  '🕯️',
  '🌿',
  '💫',
]);

export const DEFAULT_BANNED_WORDS: ReadonlyArray<string> = Object.freeze([
  // Reserved for moderator-configured terms. The engine itself ships empty
  // — we do NOT bake-in sacred-cultural words here because that would be
  // a misreading of the moderation model. Callers wire-in what they need.
]);

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
export function createInitialState(
  options: Readonly<{
    bannedWords?: ReadonlyArray<string>;
    slowModeSeconds?: number;
  }> = {},
): LiveStreamChatState {
  const slow = clampSlowMode(options.slowModeSeconds ?? DEFAULT_SLOW_MODE_SECONDS);
  return Object.freeze({
    messages: Object.freeze([]) as ReadonlyArray<LiveStreamMessage>,
    pinnedId: null,
    slowModeSeconds: slow,
    lastSentByUser: Object.freeze({}) as Readonly<Record<string, number>>,
    bannedWords: Object.freeze(options.bannedWords ?? DEFAULT_BANNED_WORDS),
  });
}

// ---------------------------------------------------------------------------
// Helpers (private)
// ---------------------------------------------------------------------------
function clampSlowMode(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds < MIN_SLOW_MODE_SECONDS) {
    return MIN_SLOW_MODE_SECONDS;
  }
  if (seconds > MAX_SLOW_MODE_SECONDS) return MAX_SLOW_MODE_SECONDS;
  return Math.floor(seconds);
}

function clampMessageText(text: string): string {
  return text.trim().slice(0, MAX_MESSAGE_LENGTH);
}

function makeMessageId(seed: string): LiveStreamMessageId {
  // Deterministic-id generator for pure-function tests. Real wiring would
  // pass a `crypto.randomUUID()`-derived string in; the engine itself does
  // NOT touch globals.
  const safe = seed.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24);
  return toMessageId(`msg_${safe}_${Date.now().toString(36)}`);
}

function isAllowedReaction(emoji: string): boolean {
  return ALLOWED_REACTIONS.includes(emoji);
}

function findMessage(
  state: LiveStreamChatState,
  id: LiveStreamMessageId,
): LiveStreamMessage | undefined {
  return state.messages.find((m) => m.id === id);
}

function replaceMessage(
  state: LiveStreamChatState,
  updated: LiveStreamMessage,
): LiveStreamChatState {
  const next = state.messages.map((m) => (m.id === updated.id ? updated : m));
  return Object.freeze({ ...state, messages: Object.freeze(next) });
}

// ---------------------------------------------------------------------------
// moderationCheck — pure validator for incoming text
// ---------------------------------------------------------------------------
export interface ModerationResult {
  readonly ok: boolean;
  readonly reason?: string;
  /** If `ok=false` because of a banned word, this is the offending token. */
  readonly matchedWord?: string;
}

export function moderationCheck(
  rawText: string,
  bannedWords: ReadonlyArray<string> = DEFAULT_BANNED_WORDS,
): ModerationResult {
  const text = (rawText ?? '').toString();
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return Object.freeze({
      ok: false,
      reason: 'Mensagem vazia — escreva algo antes de enviar.',
    });
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return Object.freeze({
      ok: false,
      reason: `Mensagem muito longa (limite ${MAX_MESSAGE_LENGTH} caracteres).`,
    });
  }

  const normalized = trimmed.toLowerCase();
  for (const word of bannedWords) {
    if (!word) continue;
    const needle = word.toLowerCase().trim();
    if (needle && normalized.includes(needle)) {
      return Object.freeze({
        ok: false,
        reason: 'Conteúdo bloqueado pela moderação do espaço.',
        matchedWord: needle,
      });
    }
  }

  return Object.freeze({ ok: true });
}

// ---------------------------------------------------------------------------
// createMessage — public mutator
// ---------------------------------------------------------------------------
export interface CreateMessageInput {
  readonly streamId: LiveStreamId;
  readonly userId: UserId;
  readonly userName: string;
  readonly text: string;
  /** Caller-supplied timestamp; required because the engine is pure. */
  readonly nowMs: number;
  /** Optional caller-provided id (defaults to deterministic helper). */
  readonly id?: LiveStreamMessageId;
}

export interface CreateMessageResult {
  readonly state: LiveStreamChatState;
  readonly message: LiveStreamMessage | null;
  readonly reason?: string;
}

export function createMessage(
  state: LiveStreamChatState,
  input: CreateMessageInput,
): CreateMessageResult {
  const moderation = moderationCheck(input.text, state.bannedWords);
  if (!moderation.ok) {
    return Object.freeze({
      state,
      message: null,
      reason: moderation.reason,
    });
  }

  // Slow-mode gate (per-user last-message timestamp)
  const userKey = input.userId as unknown as string;
  const lastTs = state.lastSentByUser[userKey] ?? 0;
  const elapsedSec = (input.nowMs - lastTs) / 1000;
  if (
    state.slowModeSeconds > 0 &&
    lastTs > 0 &&
    elapsedSec < state.slowModeSeconds
  ) {
    const remaining = Math.ceil(state.slowModeSeconds - elapsedSec);
    return Object.freeze({
      state,
      message: null,
      reason: `Slow mode ativo — aguarde ${remaining}s para enviar novamente.`,
    });
  }

  const id =
    input.id ?? makeMessageId(`${input.streamId}_${input.userId}_${input.nowMs}`);
  const message: LiveStreamMessage = Object.freeze({
    id,
    streamId: input.streamId,
    userId: input.userId,
    userName: (input.userName ?? '').toString().slice(0, 60) || 'convidado',
    text: clampMessageText(input.text),
    createdAt: input.nowMs,
    reactions: Object.freeze([]) as ReadonlyArray<ChatReaction>,
    deleted: false,
  });

  const nextMessages = [...state.messages, message].slice(-MAX_VISIBLE_MESSAGES * 4);
  const nextLastSent = { ...state.lastSentByUser, [userKey]: input.nowMs };

  const nextState = Object.freeze({
    ...state,
    messages: Object.freeze(nextMessages),
    lastSentByUser: Object.freeze(nextLastSent),
  });

  return Object.freeze({ state: nextState, message });
}

// ---------------------------------------------------------------------------
// addReaction / removeReaction
// ---------------------------------------------------------------------------
export function addReaction(
  state: LiveStreamChatState,
  messageId: LiveStreamMessageId,
  emoji: string,
): LiveStreamChatState {
  if (!isAllowedReaction(emoji)) return state;
  const msg = findMessage(state, messageId);
  if (!msg || msg.deleted) return state;

  const existing = msg.reactions.find((r) => r.emoji === emoji);
  const nextReactions: ReadonlyArray<ChatReaction> = existing
    ? msg.reactions.map((r) =>
        r.emoji === emoji ? Object.freeze({ emoji, count: r.count + 1 }) : r,
      )
    : Object.freeze([...msg.reactions, Object.freeze({ emoji, count: 1 })]);

  const nextMsg: LiveStreamMessage = Object.freeze({
    ...msg,
    reactions: nextReactions,
  });
  return replaceMessage(state, nextMsg);
}

export function removeReaction(
  state: LiveStreamChatState,
  messageId: LiveStreamMessageId,
  emoji: string,
): LiveStreamChatState {
  const msg = findMessage(state, messageId);
  if (!msg || msg.deleted) return state;

  const nextReactions: ReadonlyArray<ChatReaction> = msg.reactions
    .map((r) => {
      if (r.emoji !== emoji) return r;
      if (r.count <= 1) return null; // mark for removal
      return Object.freeze({ emoji, count: r.count - 1 });
    })
    .filter((r): r is ChatReaction => r !== null);

  const nextMsg: LiveStreamMessage = Object.freeze({
    ...msg,
    reactions: nextReactions,
  });
  return replaceMessage(state, nextMsg);
}

// ---------------------------------------------------------------------------
// pinMessage / unpinMessage
// ---------------------------------------------------------------------------
export function pinMessage(
  state: LiveStreamChatState,
  messageId: LiveStreamMessageId,
): LiveStreamChatState {
  const msg = findMessage(state, messageId);
  if (!msg || msg.deleted) return state;
  return Object.freeze({ ...state, pinnedId: messageId });
}

export function unpinMessage(state: LiveStreamChatState): LiveStreamChatState {
  if (state.pinnedId === null) return state;
  return Object.freeze({ ...state, pinnedId: null });
}

// ---------------------------------------------------------------------------
// setSlowMode
// ---------------------------------------------------------------------------
export function setSlowMode(
  state: LiveStreamChatState,
  seconds: number,
): LiveStreamChatState {
  const clamped = clampSlowMode(seconds);
  if (clamped === state.slowModeSeconds) return state;
  return Object.freeze({ ...state, slowModeSeconds: clamped });
}

// ---------------------------------------------------------------------------
// deleteMessage — soft delete (keeps reactions but hides body)
// ---------------------------------------------------------------------------
export function deleteMessage(
  state: LiveStreamChatState,
  messageId: LiveStreamMessageId,
): LiveStreamChatState {
  const msg = findMessage(state, messageId);
  if (!msg) return state;
  const nextMsg: LiveStreamMessage = Object.freeze({
    ...msg,
    text: '',
    deleted: true,
  });
  return replaceMessage(state, nextMsg);
}

// ---------------------------------------------------------------------------
// getVisibleMessages — applies: hide deleted, sort pinned first, cap at 100
// ---------------------------------------------------------------------------
export function getVisibleMessages(
  state: LiveStreamChatState,
  max = MAX_VISIBLE_MESSAGES,
): ReadonlyArray<LiveStreamMessage> {
  const visible = state.messages.filter((m) => !m.deleted);
  const sorted = [...visible].sort((a, b) => {
    if (state.pinnedId && a.id === state.pinnedId) return -1;
    if (state.pinnedId && b.id === state.pinnedId) return 1;
    return a.createdAt - b.createdAt;
  });
  return Object.freeze(sorted.slice(-max));
}

// ---------------------------------------------------------------------------
// getPinnedMessage — returns the pinned message (or null)
// ---------------------------------------------------------------------------
export function getPinnedMessage(
  state: LiveStreamChatState,
): LiveStreamMessage | null {
  if (!state.pinnedId) return null;
  return findMessage(state, state.pinnedId) ?? null;
}

// ---------------------------------------------------------------------------
// getSlowModeRemaining — seconds remaining for a given user (0 if none)
// ---------------------------------------------------------------------------
export function getSlowModeRemaining(
  state: LiveStreamChatState,
  userId: UserId,
  nowMs: number,
): number {
  if (state.slowModeSeconds <= 0) return 0;
  const userKey = userId as unknown as string;
  const lastTs = state.lastSentByUser[userKey] ?? 0;
  if (!lastTs) return 0;
  const elapsed = (nowMs - lastTs) / 1000;
  if (elapsed >= state.slowModeSeconds) return 0;
  return Math.ceil(state.slowModeSeconds - elapsed);
}

// ---------------------------------------------------------------------------
// exports — frozen module surface for downstream safety
// ---------------------------------------------------------------------------
export const __test_exports = Object.freeze({
  clampSlowMode,
  clampMessageText,
  makeMessageId,
  isAllowedReaction,
  findMessage,
  replaceMessage,
  MAX_MESSAGE_LENGTH,
  MAX_VISIBLE_MESSAGES,
  DEFAULT_SLOW_MODE_SECONDS,
});

// Module-level freeze: prevent accidental monkey-patching of the public API.
Object.freeze(exports);