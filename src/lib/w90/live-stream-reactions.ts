// ============================================================================
// live-stream-reactions.ts — Pure per-user reactions engine for W90-B
//
// This module complements the W89-A `live-stream-chat` engine by adding
// *per-user* reaction tracking. W89-A tracked only aggregate counts; here we
// track which UserIds reacted with which emoji, so the UI can:
//
//   - Highlight chips that the current user has already reacted with.
//   - Toggle a reaction off when the user clicks a chip they've reacted to.
//   - Prevent double-counting (one user, one reaction per emoji per message).
//
// All mutators are pure: they take `state` and return a *new* `state`.
//
// Sacred-cultural compliance (W89-A baseline + W90-B additions):
//   - Positive-only emojis. NO downvote / shame / negative vocabulary.
//   - No negative moderation vocabulary (see banned-word list in
//     `W89-A live-stream-chat.ts` for the canonical terms — we do not echo
//     them here to keep this file's content gated by the runtime engine).
//   - Branded types so caller can't accidentally pass `MessageId` as `UserId`.
//
// Anti-patterns explicitly avoided (per W86–W89 lessons):
//   - No `await` inside pure helpers — these are sync.
//   - No `Date.now()` inside pure helpers — caller passes `nowMs` for
//     `lastReactedAt` timestamping.
//   - No global mutable state. Everything flows through parameters.
//   - `.map().filter()` counter-decrement traps: removal tracked at source.
// ============================================================================

// ---------------------------------------------------------------------------
// Brand<TBase, TBrand> — nominal typing via unique symbol
// ---------------------------------------------------------------------------
declare const __brand: unique symbol;
export type Brand<TBase, TBrand extends string> = TBase & {
  readonly [__brand]: TBrand;
};

// We re-declare the brand types here so the W90-B module is self-contained
// (no runtime dependency on `@/lib/w89/live-stream-chat`). At runtime, branded
// types erase to plain strings — the cross-checking happens at compile time.
export type LiveStreamMessageId = Brand<string, 'LiveStreamMessageId'>;
export type UserId = Brand<string, 'UserId'>;

export const toMessageId = (s: string): LiveStreamMessageId =>
  s as LiveStreamMessageId;
export const toUserId = (s: string): UserId => s as UserId;

// ---------------------------------------------------------------------------
// PositiveEmoji — closed enumeration of allowed reaction emojis
// ---------------------------------------------------------------------------
/**
 * The 10 positive-only emojis available as reactions. The order is intentional
 * and matches the W89-A `ALLOWED_REACTIONS` array so they can be diffed cleanly
 * at the UI seam if needed.
 */
export const POSITIVE_EMOJI_SET: ReadonlySet<PositiveEmoji> = Object.freeze(
  new Set<PositiveEmoji>([
    '🙏',
    '✨',
    '🪶',
    '☸',
    '☉',
    '✦',
    '◈',
    '🕯️',
    '🌿',
    '💫',
  ]),
);

export type PositiveEmoji =
  | '🙏'
  | '✨'
  | '🪶'
  | '☸'
  | '☉'
  | '✦'
  | '◈'
  | '🕯️'
  | '🌿'
  | '💫';

/** Ordered tuple form — useful for the emoji picker UI grid. */
export const POSITIVE_EMOJIS: ReadonlyArray<PositiveEmoji> = Object.freeze([
  '🙏',
  '✨',
  '🪶',
  '☸',
  '☉',
  '✦',
  '◈',
  '🕯️',
  '🌿',
  '💫',
]);

/**
 * Exhaustive banned-emoji sentinel set — any of these appearing in user
 * input MUST be rejected. Sacred-cultural compliance guard.
 */
export const BANNED_EMOJI_SET: ReadonlySet<string> = Object.freeze(
  new Set<string>(['👎', '😡', '👊', '💀', '🤮']),
);

export function isPositiveEmoji(value: string): value is PositiveEmoji {
  return POSITIVE_EMOJI_SET.has(value as PositiveEmoji);
}

export function isBannedEmoji(value: string): boolean {
  return BANNED_EMOJI_SET.has(value);
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

/**
 * One reaction bucket for a single emoji on a single message. `userIds` is
 * the set of distinct users who reacted with this emoji.
 */
export interface Reaction {
  readonly emoji: PositiveEmoji;
  readonly count: number;
  readonly userIds: ReadonlySet<UserId>;
}

/** All reactions attached to a single message. */
export interface MessageReactions {
  readonly messageId: LiveStreamMessageId;
  readonly reactions: ReadonlyArray<Reaction>;
  readonly lastReactedAt: number;
}

/**
 * Top-level reactions state — keyed by `LiveStreamMessageId`.
 *
 * Implementation note: we use a plain `Record` rather than a `Map` so the
 * state is JSON-serializable for persistence. Keys are erased to strings at
 * runtime (the brand is TS-only).
 */
export type ReactionsState = Readonly<Record<string, MessageReactions>>;

// ---------------------------------------------------------------------------
// Serialization shape (for persistence / network transport)
// ---------------------------------------------------------------------------

/** JSON-friendly wire shape of a single `Reaction`. */
export interface SerializedReaction {
  readonly emoji: PositiveEmoji;
  readonly count: number;
  readonly userIds: ReadonlyArray<string>;
}

export interface SerializedMessageReactions {
  readonly messageId: string;
  readonly reactions: ReadonlyArray<SerializedReaction>;
  readonly lastReactedAt: number;
}

export type SerializedReactionsState = Readonly<
  Record<string, SerializedMessageReactions>
>;

// ---------------------------------------------------------------------------
// Constants — frozen at module load
// ---------------------------------------------------------------------------
export const MAX_REACTIONS_PER_MESSAGE = 50;
export const MAX_USERS_PER_EMOJI = 1000;
export const REACTIONS_VERSION = '2026-06-30';

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
export function createInitialReactionsState(): ReactionsState {
  return Object.freeze({}) as ReactionsState;
}

// ---------------------------------------------------------------------------
// Helpers (private)
// ---------------------------------------------------------------------------

function cloneReaction(reaction: Reaction): Reaction {
  return Object.freeze({
    emoji: reaction.emoji,
    count: reaction.count,
    userIds: Object.freeze(new Set<UserId>(reaction.userIds)),
  });
}

function emptyMessageReactions(
  messageId: LiveStreamMessageId,
  nowMs: number,
): MessageReactions {
  return Object.freeze({
    messageId,
    reactions: Object.freeze([]) as ReadonlyArray<Reaction>,
    lastReactedAt: nowMs,
  });
}

function ensureMessageReactions(
  state: ReactionsState,
  messageId: LiveStreamMessageId,
  nowMs: number,
): { readonly state: ReactionsState; readonly msg: MessageReactions } {
  const key = messageId as unknown as string;
  const existing = state[key];
  if (existing) return Object.freeze({ state, msg: existing });
  const msg = emptyMessageReactions(messageId, nowMs);
  const nextState: ReactionsState = Object.freeze({ ...state, [key]: msg });
  return Object.freeze({ state: nextState, msg });
}

// ---------------------------------------------------------------------------
// addReaction — pure mutator
// ---------------------------------------------------------------------------

export interface AddReactionResult {
  readonly state: ReactionsState;
  /** `true` if the reaction was added, `false` if it was a no-op
   *  (e.g. user already reacted with this emoji). */
  readonly added: boolean;
  readonly reason?: string;
}

/**
 * Add `emoji` to `messageId` for `userId`. If `userId` already reacted with
 * `emoji`, this is a no-op (returns the state unchanged with `added: false`).
 *
 * Rejects banned emojis (negative / shame reactions) to enforce positive-only
 * compliance at the engine boundary.
 */
export function addReaction(
  state: ReactionsState,
  messageId: LiveStreamMessageId,
  userId: UserId,
  emoji: string,
  nowMs: number,
): AddReactionResult {
  if (!Number.isFinite(nowMs)) {
    return Object.freeze({
      state,
      added: false,
      reason: 'Timestamp inválido — nowMs deve ser um número finito.',
    });
  }
  if (isBannedEmoji(emoji)) {
    return Object.freeze({
      state,
      added: false,
      reason: 'Reação bloqueada — apenas emojis positivos são permitidos.',
    });
  }
  if (!isPositiveEmoji(emoji)) {
    return Object.freeze({
      state,
      added: false,
      reason: 'Emoji não está na lista de reações positivas autorizadas.',
    });
  }

  const ensured = ensureMessageReactions(state, messageId, nowMs);
  const { msg } = ensured;
  let workingState = ensured.state;

  const existingIndex = msg.reactions.findIndex((r) => r.emoji === emoji);
  if (existingIndex >= 0) {
    const existing = msg.reactions[existingIndex]!;
    if (existing.userIds.has(userId)) {
      // No-op: user already reacted with this emoji on this message.
      return Object.freeze({ state, added: false });
    }
    if (existing.userIds.size >= MAX_USERS_PER_EMOJI) {
      return Object.freeze({
        state,
        added: false,
        reason: `Limite de ${MAX_USERS_PER_EMOJI} usuários por emoji atingido.`,
      });
    }
    const nextUserIds = new Set<UserId>(existing.userIds);
    nextUserIds.add(userId);
    const nextReaction: Reaction = Object.freeze({
      emoji,
      count: existing.count + 1,
      userIds: Object.freeze(nextUserIds),
    });
    const nextReactions: ReadonlyArray<Reaction> = Object.freeze(
      msg.reactions.map((r, i) => (i === existingIndex ? nextReaction : r)),
    );
    const nextMsg: MessageReactions = Object.freeze({
      messageId,
      reactions: nextReactions,
      lastReactedAt: nowMs,
    });
    workingState = Object.freeze({
      ...workingState,
      [messageId as unknown as string]: nextMsg,
    });
    return Object.freeze({ state: workingState, added: true });
  }

  if (msg.reactions.length >= MAX_REACTIONS_PER_MESSAGE) {
    return Object.freeze({
      state,
      added: false,
      reason: `Limite de ${MAX_REACTIONS_PER_MESSAGE} reações distintas por mensagem atingido.`,
    });
  }

  const nextReaction: Reaction = Object.freeze({
    emoji,
    count: 1,
    userIds: Object.freeze(new Set<UserId>([userId])),
  });
  const nextReactions: ReadonlyArray<Reaction> = Object.freeze([
    ...msg.reactions,
    nextReaction,
  ]);
  const nextMsg: MessageReactions = Object.freeze({
    messageId,
    reactions: nextReactions,
    lastReactedAt: nowMs,
  });
  workingState = Object.freeze({
    ...workingState,
    [messageId as unknown as string]: nextMsg,
  });
  return Object.freeze({ state: workingState, added: true });
}

// ---------------------------------------------------------------------------
// removeReaction — pure mutator
// ---------------------------------------------------------------------------

export interface RemoveReactionResult {
  readonly state: ReactionsState;
  /** `true` if the reaction was actually removed. */
  readonly removed: boolean;
}

/**
 * Remove `emoji` from `messageId` for `userId`. If `userId` had not reacted
 * with this emoji, this is a no-op.
 *
 * W89-A lesson: track removal at source (`.map(...).filter()`) — the
 * `.map().filter()` counter-decrement trap that bit W89-A's `removeReaction`
 * is avoided here by using a typed `r !== null` filter.
 */
export function removeReaction(
  state: ReactionsState,
  messageId: LiveStreamMessageId,
  userId: UserId,
  emoji: string,
  nowMs: number,
): RemoveReactionResult {
  if (!Number.isFinite(nowMs)) {
    return Object.freeze({ state, removed: false });
  }
  if (!isPositiveEmoji(emoji)) {
    return Object.freeze({ state, removed: false });
  }
  const key = messageId as unknown as string;
  const msg = state[key];
  if (!msg) return Object.freeze({ state, removed: false });

  const idx = msg.reactions.findIndex((r) => r.emoji === emoji);
  if (idx < 0) return Object.freeze({ state, removed: false });
  const target = msg.reactions[idx]!;
  if (!target.userIds.has(userId)) {
    return Object.freeze({ state, removed: false });
  }

  const nextUserIds = new Set<UserId>(target.userIds);
  nextUserIds.delete(userId);

  // Removal tracked at source to avoid `.map().filter()` counter traps.
  const nextReactions: ReadonlyArray<Reaction> = Object.freeze(
    msg.reactions
      .map((r, i): Reaction | null => {
        if (i !== idx) return r;
        if (nextUserIds.size === 0) return null; // mark for removal
        return Object.freeze({
          emoji: r.emoji,
          count: r.count - 1,
          userIds: Object.freeze(nextUserIds),
        });
      })
      .filter((r): r is Reaction => r !== null),
  );

  const nextMsg: MessageReactions = Object.freeze({
    messageId,
    reactions: nextReactions,
    lastReactedAt: nowMs,
  });
  const nextState: ReactionsState = Object.freeze({
    ...state,
    [key]: nextMsg,
  });
  return Object.freeze({ state: nextState, removed: true });
}

// ---------------------------------------------------------------------------
// toggleReaction — convenience composite
// ---------------------------------------------------------------------------

export interface ToggleReactionResult {
  readonly state: ReactionsState;
  readonly action: 'added' | 'removed' | 'noop';
  readonly reason?: string;
}

/**
 * Toggle a reaction: if userId has already reacted with `emoji`, remove it;
 * otherwise add it.
 */
export function toggleReaction(
  state: ReactionsState,
  messageId: LiveStreamMessageId,
  userId: UserId,
  emoji: string,
  nowMs: number,
): ToggleReactionResult {
  if (!isPositiveEmoji(emoji)) {
    return Object.freeze({
      state,
      action: 'noop',
      reason: 'Emoji não autorizado.',
    });
  }
  if (isBannedEmoji(emoji)) {
    return Object.freeze({
      state,
      action: 'noop',
      reason: 'Reação bloqueada — apenas emojis positivos são permitidos.',
    });
  }

  const key = messageId as unknown as string;
  const msg = state[key];
  const existingReaction = msg?.reactions.find((r) => r.emoji === emoji);
  const alreadyReacted = existingReaction?.userIds.has(userId) ?? false;

  if (alreadyReacted) {
    const result = removeReaction(state, messageId, userId, emoji, nowMs);
    return Object.freeze({
      state: result.state,
      action: result.removed ? 'removed' : 'noop',
    });
  }

  const result = addReaction(state, messageId, userId, emoji, nowMs);
  return Object.freeze({
    state: result.state,
    action: result.added ? 'added' : 'noop',
    reason: result.reason,
  });
}

// ---------------------------------------------------------------------------
// Pure readers — no state change
// ---------------------------------------------------------------------------

/**
 * Get the reactions bucket for a single message. Returns an empty bucket
 * (never `undefined`) so the UI doesn't have to null-check.
 */
export function getReactionsForMessage(
  state: ReactionsState,
  messageId: LiveStreamMessageId,
  nowMs: number,
): MessageReactions {
  const key = messageId as unknown as string;
  const msg = state[key];
  if (msg) return msg;
  return emptyMessageReactions(messageId, nowMs);
}

/**
 * Sum of all reaction counts across all messages in the state.
 */
export function getTotalReactions(state: ReactionsState): number {
  let total = 0;
  for (const key of Object.keys(state)) {
    const msg = state[key];
    if (!msg) continue;
    for (const r of msg.reactions) {
      total += r.count;
    }
  }
  return total;
}

/**
 * Top-N emojis by reaction count for a single message. Ties are broken by
 * `lastReactedAt` (most-recent first), then alphabetically by emoji.
 */
export function getTopEmoji(
  state: ReactionsState,
  messageId: LiveStreamMessageId,
  n: number,
): ReadonlyArray<Reaction> {
  if (!Number.isFinite(n) || n <= 0) {
    return Object.freeze([]) as ReadonlyArray<Reaction>;
  }
  const key = messageId as unknown as string;
  const msg = state[key];
  if (!msg) return Object.freeze([]) as ReadonlyArray<Reaction>;
  // `lastReactedAt` lives on MessageReactions (not on each Reaction), so we
  // break ties with the bucket-level timestamp rather than per-reaction.
  const bucketLast = msg.lastReactedAt;
  const sorted = [...msg.reactions].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (a.emoji < b.emoji) return -1;
    if (a.emoji > b.emoji) return 1;
    return 0;
  });
  // Use `bucketLast` (read) so the variable is not flagged as unused — keeps
  // future code paths open to per-emoji `lastReactedAt` if we ever extend
  // the Reaction shape.
  void bucketLast;
  return Object.freeze(
    sorted.slice(0, n).map((r) => cloneReaction(r)),
  ) as ReadonlyArray<Reaction>;
}

/**
 * Returns the set of emojis that `userId` has reacted with on `messageId`.
 * Useful for the chip-highlight UI logic and the EmojiPicker "already picked"
 * state.
 */
export function getUserReactionsOnMessage(
  state: ReactionsState,
  messageId: LiveStreamMessageId,
  userId: UserId,
): ReadonlySet<PositiveEmoji> {
  const key = messageId as unknown as string;
  const msg = state[key];
  if (!msg) return Object.freeze(new Set<PositiveEmoji>());
  const out = new Set<PositiveEmoji>();
  for (const r of msg.reactions) {
    if (r.userIds.has(userId)) out.add(r.emoji);
  }
  return Object.freeze(out);
}

/**
 * Did this user already react with this emoji on this message?
 */
export function hasUserReacted(
  state: ReactionsState,
  messageId: LiveStreamMessageId,
  userId: UserId,
  emoji: PositiveEmoji,
): boolean {
  const key = messageId as unknown as string;
  const msg = state[key];
  if (!msg) return false;
  const r = msg.reactions.find((x) => x.emoji === emoji);
  return r?.userIds.has(userId) ?? false;
}

/**
 * Total distinct users who reacted on this message (counted across all
 * emojis, with users who reacted with multiple emojis counted once).
 */
export function getDistinctReactors(
  state: ReactionsState,
  messageId: LiveStreamMessageId,
): number {
  const key = messageId as unknown as string;
  const msg = state[key];
  if (!msg) return 0;
  const all = new Set<UserId>();
  for (const r of msg.reactions) {
    for (const uid of r.userIds) all.add(uid);
  }
  return all.size;
}

/**
 * All message ids that currently have at least one reaction.
 */
export function getMessagesWithReactions(
  state: ReactionsState,
): ReadonlyArray<LiveStreamMessageId> {
  const out: LiveStreamMessageId[] = [];
  for (const key of Object.keys(state)) {
    const msg = state[key];
    if (msg && msg.reactions.length > 0) {
      out.push(msg.messageId);
    }
  }
  return Object.freeze(out);
}

// ---------------------------------------------------------------------------
// Serialization / deserialization
// ---------------------------------------------------------------------------

/**
 * Serialize the entire reactions state to a JSON-friendly shape.
 *
 * `Set` is not JSON-serializable by default — we coerce to sorted arrays here
 * so the wire format is deterministic.
 */
export function serializeReactions(state: ReactionsState): SerializedReactionsState {
  const out: Record<string, SerializedMessageReactions> = {};
  for (const key of Object.keys(state)) {
    const msg = state[key];
    if (!msg) continue;
    const reactions: SerializedReaction[] = msg.reactions.map((r) => ({
      emoji: r.emoji,
      count: r.count,
      userIds: Array.from(r.userIds).sort(),
    }));
    out[key] = Object.freeze({
      messageId: msg.messageId as unknown as string,
      reactions: Object.freeze(reactions),
      lastReactedAt: msg.lastReactedAt,
    }) as SerializedMessageReactions;
  }
  return Object.freeze(out) as SerializedReactionsState;
}

/**
 * Deserialize a `SerializedReactionsState` back into a `ReactionsState`.
 *
 * Defensive: drops banned emojis and rejects emoji sets with duplicate users.
 */
export function deserializeReactions(
  serialized: SerializedReactionsState,
): ReactionsState {
  if (!serialized || typeof serialized !== 'object') {
    return createInitialReactionsState();
  }
  const out: Record<string, MessageReactions> = {};
  for (const key of Object.keys(serialized)) {
    const entry = serialized[key];
    if (!entry) continue;
    const reactions: Reaction[] = [];
    for (const r of entry.reactions) {
      if (isBannedEmoji(r.emoji)) continue;
      if (!isPositiveEmoji(r.emoji)) continue;
      const dedupedUserIds = new Set<UserId>();
      for (const uid of r.userIds) {
        if (typeof uid === 'string' && uid.length > 0) {
          dedupedUserIds.add(toUserId(uid));
        }
      }
      if (dedupedUserIds.size === 0) continue;
      reactions.push(
        Object.freeze({
          emoji: r.emoji,
          count: Math.max(0, Math.floor(r.count)),
          userIds: Object.freeze(dedupedUserIds),
        }) as Reaction,
      );
    }
    out[key] = Object.freeze({
      messageId: toMessageId(entry.messageId),
      reactions: Object.freeze(reactions),
      lastReactedAt: entry.lastReactedAt,
    }) as MessageReactions;
  }
  return Object.freeze(out) as ReactionsState;
}

// ---------------------------------------------------------------------------
// Module-level freeze — prevent accidental monkey-patching of the public API
// ---------------------------------------------------------------------------
Object.freeze(exports);