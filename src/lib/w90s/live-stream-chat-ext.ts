// ============================================================================
// live-stream-chat-ext.ts — W90s-A EXTENSION to W89-A live-stream-chat engine
//
// W89-A shipped: createMessage, addReaction (single), removeReaction, pin,
// slow-mode, soft delete.
//
// W90s-A ADDS:
//   1. Emoji reactions (👍 ❤️ 🔥 🙏 ✨) — *canonical* W90s set, explicit.
//   2. Viewer count — increment / decrement / set / get.
//   3. Moderation hooks — muteUser (prevent user from sending), hideMessage
//      (separate from soft-delete: hides from visible list but keeps the slot
//      so reactions/threading aren't disturbed), undoHideMessage.
//
// Design rules inherited from W89-A:
//   - Pure functions only. No current-time global reads, no I/O.
//   - Caller passes `nowMs` for time-based logic.
//   - All exports `Object.freeze`-ed at module surface.
//   - Branded types via unique symbol `Brand<TBase, TBrand>`.
//   - `noUncheckedIndexedAccess` defensive: optional chaining + typed guards.
//   - Banned vocabulary absent: see sacred-cultural compliance section
//     in the source-inspection spec for the exact term list (kept out of
//     source comments so simple grep cannot flag this file).
//
// New vocabulary introduced (positive-only, sacred-cultural neutral):
//   - "muted" — user cannot send messages until unmuted
//   - "hidden" — message body hidden but reaction counts preserved
//   - "viewer" — counted presence in the stream
//
// Why separate "hide" vs "delete"?
//   - `deleteMessage` (W89-A) wipes body and sets deleted=true — kept for
//     irreversible removal (e.g. DMCA).
//   - `hideMessage` (W90s-A) is a lighter moderation gesture: body wiped,
//     but kept in the slot. `undoHideMessage` restores the original text
//     from the snapshot stored on the message itself.
// ============================================================================

// ---------------------------------------------------------------------------
// Brand<TBase, TBrand> — nominal typing via unique symbol
// ---------------------------------------------------------------------------
declare const __brand: unique symbol;
export type Brand<TBase, TBrand extends string> = TBase & {
  readonly [__brand]: TBrand;
};

export type ViewerCount = Brand<number, 'ViewerCount'>;
export type MuteExpiresAt = Brand<number, 'MuteExpiresAt'>;
export type ReactionEmoji = Brand<string, 'ReactionEmoji'>;
export type ModerationActionId = Brand<string, 'ModerationActionId'>;

// ---------------------------------------------------------------------------
// Canonical W90s-A reaction set
// ---------------------------------------------------------------------------
/**
 * The 5 emojis that the W90s-A reactions UI exposes. These are a *strict
 * subset* of the W89-A `ALLOWED_REACTIONS` (which had 10). W90s-A uses
 * these 5 because they are universally rendered on every browser/OS combo
 * without fallback glyphs. They are positive-only.
 */
export const W90S_REACTION_EMOJIS: ReadonlyArray<string> = Object.freeze([
  '👍',
  '❤️',
  '🔥',
  '🙏',
  '✨',
]);

export const MAX_REACTIONS_PER_MESSAGE = 5;
export const MAX_VIEWER_COUNT = 1_000_000;
export const MIN_VIEWER_COUNT = 0;
export const DEFAULT_HIDE_DURATION_MS = 0; // 0 = permanent until undo
export const MAX_HIDE_DURATION_MS = 24 * 60 * 60 * 1000; // 24h ceiling
export const MAX_MUTE_DURATION_MS = 24 * 60 * 60 * 1000; // 24h ceiling

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------
export interface MessageReaction {
  /** Canonical emoji from W90S_REACTION_EMOJIS */
  readonly emoji: string;
  /** Number of distinct users who reacted with this emoji. */
  readonly count: number;
  /** Last update ms (caller-supplied). */
  readonly updatedAt: number;
}

export interface HiddenMessageSnapshot {
  /** Original text that was hidden. */
  readonly text: string;
  /** When it was hidden (caller-supplied ms). */
  readonly hiddenAt: number;
  /** UserId who performed the hide action. */
  readonly hiddenBy: UserId;
  /** Optional auto-restore deadline (0 = permanent). */
  readonly expiresAt: number;
}

export interface LiveStreamMessageExt {
  readonly id: LiveStreamMessageId;
  readonly streamId: LiveStreamId;
  readonly userId: UserId;
  readonly userName: string;
  readonly text: string;
  readonly createdAt: number;
  readonly reactions: ReadonlyArray<MessageReaction>;
  /** True if the message body is currently hidden by a moderator. */
  readonly hidden: boolean;
  /** Non-null when `hidden === true`. Stores the original text + metadata. */
  readonly hiddenSnapshot: HiddenMessageSnapshot | null;
  /** Soft-delete (W89-A inherited). True means irreversible removal. */
  readonly deleted: boolean;
}

export interface ModerationEntry {
  readonly userId: UserId;
  /** When the mute was applied (ms). */
  readonly mutedAt: number;
  /** When the mute auto-expires (ms). 0 means permanent. */
  readonly expiresAt: number;
  /** Who issued the mute (UserId of moderator). */
  readonly mutedBy: UserId;
  /** Non-blaming reason text. */
  readonly reason: string;
}

export interface LiveStreamChatExtState {
  readonly messages: ReadonlyArray<LiveStreamMessageExt>;
  readonly mutedUsers: Readonly<Record<string, ModerationEntry>>;
  readonly viewerCount: number;
  /** Max viewers observed (used for relative "X assistindo agora" UX). */
  readonly peakViewerCount: number;
  /** Last update timestamp (caller-supplied). */
  readonly lastTickAt: number;
  /** Optional stream identifier. */
  readonly streamId: LiveStreamId | null;
}

import type {
  LiveStreamMessageId,
  LiveStreamId,
  UserId,
} from '../w89/live-stream-chat';

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------
export function createInitialExtState(
  options: Readonly<{
    streamId?: LiveStreamId;
    viewerCount?: number;
    nowMs?: number;
  }> = {},
): LiveStreamChatExtState {
  const v = clampViewerCount(options.viewerCount ?? 0);
  return Object.freeze({
    messages: Object.freeze([]) as ReadonlyArray<LiveStreamMessageExt>,
    mutedUsers: Object.freeze({}) as Readonly<Record<string, ModerationEntry>>,
    viewerCount: v,
    peakViewerCount: v,
    lastTickAt: options.nowMs ?? 0,
    streamId: options.streamId ?? null,
  });
}

// ---------------------------------------------------------------------------
// Private helpers — defensive + frozen
// ---------------------------------------------------------------------------
function clampViewerCount(n: number): number {
  // Special case: +Infinity (no ceiling) → MAX. NaN → 0.
  if (Number.isNaN(n)) return MIN_VIEWER_COUNT;
  if (n === Infinity) return MAX_VIEWER_COUNT;
  if (n === -Infinity) return MIN_VIEWER_COUNT;
  if (!Number.isFinite(n)) return MIN_VIEWER_COUNT;
  if (n < MIN_VIEWER_COUNT) return MIN_VIEWER_COUNT;
  if (n > MAX_VIEWER_COUNT) return MAX_VIEWER_COUNT;
  return Math.floor(n);
}

function clampHideExpires(expiresAt: number, nowMs: number): number {
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return 0;
  const ceiling = nowMs + MAX_HIDE_DURATION_MS;
  if (expiresAt > ceiling) return ceiling;
  return Math.floor(expiresAt);
}

function clampMuteExpires(expiresAt: number, nowMs: number): number {
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return 0;
  const ceiling = nowMs + MAX_MUTE_DURATION_MS;
  if (expiresAt > ceiling) return ceiling;
  return Math.floor(expiresAt);
}

function isAllowedReactionEmoji(emoji: string): boolean {
  return W90S_REACTION_EMOJIS.includes(emoji);
}

function findMessageExt(
  state: LiveStreamChatExtState,
  id: LiveStreamMessageId,
): LiveStreamMessageExt | undefined {
  return state.messages.find((m) => m.id === id);
}

function replaceMessageExt(
  state: LiveStreamChatExtState,
  updated: LiveStreamMessageExt,
): LiveStreamChatExtState {
  const next = state.messages.map((m) => (m.id === updated.id ? updated : m));
  return Object.freeze({
    ...state,
    messages: Object.freeze(next),
    lastTickAt: updated.createdAt,
  });
}

// ---------------------------------------------------------------------------
// (1) Reactions — addReaction, removeReaction, toggleReaction
// ---------------------------------------------------------------------------
export interface ReactionResult {
  readonly state: LiveStreamChatExtState;
  readonly reacted: boolean;
  readonly reason?: string;
}

export function addReaction(
  state: LiveStreamChatExtState,
  messageId: LiveStreamMessageId,
  emoji: string,
  nowMs: number,
): ReactionResult {
  if (!isAllowedReactionEmoji(emoji)) {
    return Object.freeze({
      state,
      reacted: false,
      reason: 'Emoji fora do conjunto W90s permitido.',
    });
  }
  const msg = findMessageExt(state, messageId);
  if (!msg || msg.deleted) {
    return Object.freeze({
      state,
      reacted: false,
      reason: 'Mensagem não encontrada.',
    });
  }
  const existing = msg.reactions.find((r) => r.emoji === emoji);
  let nextReactions: ReadonlyArray<MessageReaction>;
  if (existing) {
    if (msg.reactions.length === 0 && existing.count < 0) {
      // Defensive: never reduce below 0 even if state was corrupted.
      nextReactions = Object.freeze([
        { emoji, count: 1, updatedAt: nowMs },
      ]);
    } else {
      nextReactions = Object.freeze(
        msg.reactions.map((r) =>
          r.emoji === emoji
            ? Object.freeze({ emoji, count: r.count + 1, updatedAt: nowMs })
            : r,
        ),
      );
    }
  } else {
    if (msg.reactions.length >= MAX_REACTIONS_PER_MESSAGE) {
      return Object.freeze({
        state,
        reacted: false,
        reason: 'Limite de reações por mensagem atingido.',
      });
    }
    nextReactions = Object.freeze([
      ...msg.reactions,
      Object.freeze({ emoji, count: 1, updatedAt: nowMs }),
    ]);
  }

  const nextMsg: LiveStreamMessageExt = Object.freeze({
    ...msg,
    reactions: nextReactions,
  });
  return Object.freeze({
    state: Object.freeze({
      ...replaceMessageExt(state, nextMsg),
      lastTickAt: nowMs,
    }),
    reacted: true,
  });
}

export function removeReaction(
  state: LiveStreamChatExtState,
  messageId: LiveStreamMessageId,
  emoji: string,
  nowMs: number,
): ReactionResult {
  if (!isAllowedReactionEmoji(emoji)) {
    return Object.freeze({
      state,
      reacted: false,
      reason: 'Emoji fora do conjunto W90s permitido.',
    });
  }
  const msg = findMessageExt(state, messageId);
  if (!msg || msg.deleted) {
    return Object.freeze({
      state,
      reacted: false,
      reason: 'Mensagem não encontrada.',
    });
  }
  // Source-of-removal pattern (W89-A lesson): null out at map() step,
  // then typed-filter. Avoids the .map().filter() counter-decrement trap.
  const nextReactions: ReadonlyArray<MessageReaction> = msg.reactions
    .map((r): MessageReaction | null => {
      if (r.emoji !== emoji) return r;
      if (r.count <= 1) return null;
      return Object.freeze({ emoji, count: r.count - 1, updatedAt: nowMs });
    })
    .filter((r): r is MessageReaction => r !== null);

  const nextMsg: LiveStreamMessageExt = Object.freeze({
    ...msg,
    reactions: nextReactions,
  });
  return Object.freeze({
    state: Object.freeze({
      ...replaceMessageExt(state, nextMsg),
      lastTickAt: nowMs,
    }),
    reacted: true,
  });
}

export function toggleReaction(
  state: LiveStreamChatExtState,
  messageId: LiveStreamMessageId,
  emoji: string,
  nowMs: number,
): ReactionResult {
  const msg = findMessageExt(state, messageId);
  if (!msg || msg.deleted) {
    return Object.freeze({
      state,
      reacted: false,
      reason: 'Mensagem não encontrada.',
    });
  }
  const existing = msg.reactions.find((r) => r.emoji === emoji);
  return existing
    ? removeReaction(state, messageId, emoji, nowMs)
    : addReaction(state, messageId, emoji, nowMs);
}

// ---------------------------------------------------------------------------
// (2) Viewer count — increment / decrement / set
// ---------------------------------------------------------------------------
export function incrementViewerCount(
  state: LiveStreamChatExtState,
  delta = 1,
  nowMs = state.lastTickAt,
): LiveStreamChatExtState {
  const d = Number.isFinite(delta) ? Math.floor(delta) : 0;
  const next = clampViewerCount(state.viewerCount + d);
  return Object.freeze({
    ...state,
    viewerCount: next,
    peakViewerCount: Math.max(state.peakViewerCount, next),
    lastTickAt: nowMs,
  });
}

export function decrementViewerCount(
  state: LiveStreamChatExtState,
  delta = 1,
  nowMs = state.lastTickAt,
): LiveStreamChatExtState {
  return incrementViewerCount(state, -Math.abs(delta), nowMs);
}

export function setViewerCount(
  state: LiveStreamChatExtState,
  count: number,
  nowMs = state.lastTickAt,
): LiveStreamChatExtState {
  const next = clampViewerCount(count);
  return Object.freeze({
    ...state,
    viewerCount: next,
    peakViewerCount: Math.max(state.peakViewerCount, next),
    lastTickAt: nowMs,
  });
}

export function getViewerCount(state: LiveStreamChatExtState): number {
  return state.viewerCount;
}

export function getPeakViewerCount(state: LiveStreamChatExtState): number {
  return state.peakViewerCount;
}

// ---------------------------------------------------------------------------
// (3) Moderation — muteUser / unmuteUser / hideMessage / undoHideMessage
// ---------------------------------------------------------------------------
export interface MuteUserInput {
  readonly userId: UserId;
  readonly moderatorId: UserId;
  readonly reason: string;
  readonly nowMs: number;
  /** Auto-unmute timestamp (ms). 0 means permanent until manually unmuted. */
  readonly expiresAt?: number;
}

export interface MuteUserResult {
  readonly state: LiveStreamChatExtState;
  readonly muted: boolean;
  readonly reason?: string;
}

export function muteUser(
  state: LiveStreamChatExtState,
  input: MuteUserInput,
): MuteUserResult {
  if (!input.userId || !input.moderatorId) {
    return Object.freeze({
      state,
      muted: false,
      reason: 'IDs de usuário inválidos.',
    });
  }
  const userKey = input.userId as unknown as string;
  const cleanReason = (input.reason ?? '').toString().trim().slice(0, 140) ||
    'Silenciado pela moderação do espaço.';
  const expiresAt = clampMuteExpires(input.expiresAt ?? 0, input.nowMs);

  const entry: ModerationEntry = Object.freeze({
    userId: input.userId,
    mutedAt: input.nowMs,
    expiresAt,
    mutedBy: input.moderatorId,
    reason: cleanReason,
  });

  const nextMuted = Object.freeze({
    ...state.mutedUsers,
    [userKey]: entry,
  });

  return Object.freeze({
    state: Object.freeze({
      ...state,
      mutedUsers: nextMuted,
      lastTickAt: input.nowMs,
    }),
    muted: true,
  });
}

export function unmuteUser(
  state: LiveStreamChatExtState,
  userId: UserId,
  nowMs = state.lastTickAt,
): LiveStreamChatExtState {
  const userKey = userId as unknown as string;
  if (!state.mutedUsers[userKey]) return state;
  const next = Object.freeze(
    Object.fromEntries(
      Object.entries(state.mutedUsers).filter(([k]) => k !== userKey),
    ) as Record<string, ModerationEntry>,
  );
  return Object.freeze({ ...state, mutedUsers: next, lastTickAt: nowMs });
}

export function isUserMuted(
  state: LiveStreamChatExtState,
  userId: UserId,
  nowMs: number,
): boolean {
  const userKey = userId as unknown as string;
  const entry = state.mutedUsers[userKey];
  if (!entry) return false;
  if (entry.expiresAt > 0 && nowMs >= entry.expiresAt) return false;
  return true;
}

/** Returns the mute entry if the user is currently muted; null otherwise. */
export function getMuteEntry(
  state: LiveStreamChatExtState,
  userId: UserId,
  nowMs: number,
): ModerationEntry | null {
  const userKey = userId as unknown as string;
  const entry = state.mutedUsers[userKey];
  if (!entry) return null;
  if (entry.expiresAt > 0 && nowMs >= entry.expiresAt) return null;
  return entry;
}

// ---------------------------------------------------------------------------
// hideMessage — separate from soft-delete; reversible via undoHideMessage
// ---------------------------------------------------------------------------
export interface HideMessageInput {
  readonly messageId: LiveStreamMessageId;
  readonly moderatorId: UserId;
  readonly nowMs: number;
  /** Auto-restore deadline (ms). 0 means permanent until undo. */
  readonly expiresAt?: number;
}

export interface HideMessageResult {
  readonly state: LiveStreamChatExtState;
  readonly hidden: boolean;
  readonly reason?: string;
}

export function hideMessage(
  state: LiveStreamChatExtState,
  input: HideMessageInput,
): HideMessageResult {
  const msg = findMessageExt(state, input.messageId);
  if (!msg) {
    return Object.freeze({
      state,
      hidden: false,
      reason: 'Mensagem não encontrada.',
    });
  }
  if (msg.deleted) {
    return Object.freeze({
      state,
      hidden: false,
      reason: 'Mensagem já removida — não pode ser ocultada.',
    });
  }
  if (msg.hidden) {
    return Object.freeze({
      state,
      hidden: false,
      reason: 'Mensagem já está oculta.',
    });
  }
  const expiresAt = clampHideExpires(input.expiresAt ?? 0, input.nowMs);
  const snapshot: HiddenMessageSnapshot = Object.freeze({
    text: msg.text,
    hiddenAt: input.nowMs,
    hiddenBy: input.moderatorId,
    expiresAt,
  });
  const nextMsg: LiveStreamMessageExt = Object.freeze({
    ...msg,
    text: '',
    hidden: true,
    hiddenSnapshot: snapshot,
  });
  return Object.freeze({
    state: Object.freeze({
      ...replaceMessageExt(state, nextMsg),
      lastTickAt: input.nowMs,
    }),
    hidden: true,
  });
}

export interface UndoHideMessageResult {
  readonly state: LiveStreamChatExtState;
  readonly restored: boolean;
  readonly reason?: string;
}

export function undoHideMessage(
  state: LiveStreamChatExtState,
  messageId: LiveStreamMessageId,
  nowMs: number,
): UndoHideMessageResult {
  const msg = findMessageExt(state, messageId);
  if (!msg) {
    return Object.freeze({
      state,
      restored: false,
      reason: 'Mensagem não encontrada.',
    });
  }
  if (!msg.hidden || !msg.hiddenSnapshot) {
    return Object.freeze({
      state,
      restored: false,
      reason: 'Mensagem não está oculta.',
    });
  }
  const nextMsg: LiveStreamMessageExt = Object.freeze({
    ...msg,
    text: msg.hiddenSnapshot.text,
    hidden: false,
    hiddenSnapshot: null,
  });
  return Object.freeze({
    state: Object.freeze({
      ...replaceMessageExt(state, nextMsg),
      lastTickAt: nowMs,
    }),
    restored: true,
  });
}

/** Auto-restore helper: if any hidden messages have expired, restore them. */
export function autoRestoreExpiredHides(
  state: LiveStreamChatExtState,
  nowMs: number,
): LiveStreamChatExtState {
  let working = state;
  for (const msg of state.messages) {
    if (
      msg.hidden &&
      msg.hiddenSnapshot &&
      msg.hiddenSnapshot.expiresAt > 0 &&
      nowMs >= msg.hiddenSnapshot.expiresAt
    ) {
      const r = undoHideMessage(working, msg.id, nowMs);
      working = r.state;
    }
  }
  return working;
}

// ---------------------------------------------------------------------------
// Convenience: append a new message into ext state (engine is otherwise
// message-agnostic — this lets the UI hydrate the chat with seeded content
// without importing the W89-A createMessage mutator directly).
// ---------------------------------------------------------------------------
export interface AppendMessageInput {
  readonly id: LiveStreamMessageId;
  readonly streamId: LiveStreamId;
  readonly userId: UserId;
  readonly userName: string;
  readonly text: string;
  readonly createdAt: number;
}

export interface AppendMessageResult {
  readonly state: LiveStreamChatExtState;
  readonly message: LiveStreamMessageExt | null;
  readonly reason?: string;
}

export function appendMessage(
  state: LiveStreamChatExtState,
  input: AppendMessageInput,
): AppendMessageResult {
  const cleanText = (input.text ?? '').toString().trim().slice(0, 500);
  if (cleanText.length === 0) {
    return Object.freeze({
      state,
      message: null,
      reason: 'Mensagem vazia — nada para adicionar.',
    });
  }
  if (isUserMuted(state, input.userId, input.createdAt)) {
    const entry = getMuteEntry(state, input.userId, input.createdAt);
    const muteReason = entry?.reason ?? 'sem motivo registrado';
    return Object.freeze({
      state,
      message: null,
      reason: `Você está silenciado(a) e não pode enviar mensagens — ${muteReason}.`,
    });
  }
  const message: LiveStreamMessageExt = Object.freeze({
    id: input.id,
    streamId: input.streamId,
    userId: input.userId,
    userName: (input.userName ?? '').toString().slice(0, 60) || 'convidado',
    text: cleanText,
    createdAt: input.createdAt,
    reactions: Object.freeze([]) as ReadonlyArray<MessageReaction>,
    hidden: false,
    hiddenSnapshot: null,
    deleted: false,
  });
  const nextMessages = [...state.messages, message];
  return Object.freeze({
    state: Object.freeze({
      ...state,
      messages: Object.freeze(nextMessages),
      lastTickAt: input.createdAt,
    }),
    message,
  });
}

// ---------------------------------------------------------------------------
// Convenience: get visible messages (filters out hidden + deleted)
// ---------------------------------------------------------------------------
export function getVisibleExtMessages(
  state: LiveStreamChatExtState,
  max = 100,
): ReadonlyArray<LiveStreamMessageExt> {
  // Hidden messages are filtered out — the React component renders
  // a placeholder for them via its own logic, but getVisibleExtMessages
  // is the canonical "what the viewer sees" function.
  const visible = state.messages.filter((m) => !m.deleted && !m.hidden);
  const sorted = [...visible].sort((a, b) => a.createdAt - b.createdAt);
  return Object.freeze(sorted.slice(-max));
}

// ---------------------------------------------------------------------------
// exports — frozen module surface
// ---------------------------------------------------------------------------
export const __test_exports = Object.freeze({
  clampViewerCount,
  clampHideExpires,
  clampMuteExpires,
  isAllowedReactionEmoji,
  MAX_REACTIONS_PER_MESSAGE,
  MAX_VIEWER_COUNT,
  MIN_VIEWER_COUNT,
  DEFAULT_HIDE_DURATION_MS,
  MAX_HIDE_DURATION_MS,
  MAX_MUTE_DURATION_MS,
});

// Module-level freeze: prevent accidental monkey-patching.
Object.freeze(exports);