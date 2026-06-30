/**
 * W71-D: livestream-chat.ts
 *
 * Low-latency chat engine for live streams.
 *
 * Architecture decisions:
 * - Per-stream ring buffer (max 500 messages, FIFO eviction).
 * - Rate limit: per-user sliding window (rateLimitPerMinute config).
 * - Slow mode: per-user last-sent timestamp + slowModeSeconds.
 * - Content moderation: lookaround regex (cycle 60/65/67 lesson) for
 *   the configured `moderatedWords` list.
 * - Tradition-specific emoji packs: cigano 🌙⭐🔮, orixas 🌊🔥🌿,
 *   astrologia ⭐🌞🌙, cabala ✡️🕎🔯, numerologia 🔢✨, tantra 🕉️🪷,
 *   tarot 🃏🌟.
 * - Pub/sub via per-stream listener array (in-process). Production flag:
 *   swap for Redis pub/sub (cycle 62 lesson).
 *
 * Honest concerns:
 * - Rate-limit window uses Date.now() — production uses server-side clock.
 * - Pub/sub is in-process — cross-replica delivery is Redis pub/sub's job.
 * - Moderated-word regex uses /i flag; no stemming, no transliteration.
 */

import { randomUUID } from 'crypto';
import type { TraditionTag } from './stream-session.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ChatMessageType =
  | 'text'
  | 'reaction'
  | 'system'
  | 'moderator'
  | 'donation';

export type ChatMessage = {
  readonly id: string;
  readonly streamId: string;
  readonly userId: string;
  readonly userDisplayName: string;
  readonly body: string;
  readonly timestampMs: number;
  readonly type: ChatMessageType;
  readonly parentMessageId?: string;
  readonly traditionTag?: TraditionTag;
  readonly reactions: Record<string, number>;
  readonly moderated: boolean;
  readonly pinned: boolean;
};

export type ChatConfig = {
  readonly maxMessageLength: number;
  readonly rateLimitPerMinute: number;
  readonly slowModeSeconds: number;
  readonly moderatedWords: readonly string[];
  readonly allowedEmojis: readonly string[];
  readonly requireTraditionTag: boolean;
};

// ─── 7-tradition emoji packs ────────────────────────────────────────────────

export const TRADITION_EMOJI_PACKS: Readonly<Record<TraditionTag, readonly string[]>> =
  Object.freeze({
    cigano: ['🌙', '⭐', '🔮', '🃏', '✨', '🕯️', '🌹'],
    orixas: ['🌊', '🔥', '🌿', '⚡', '🌬️', '🪘', '🌽'],
    astrologia: ['⭐', '🌞', '🌙', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'],
    cabala: ['✡️', '🕎', '🔯', '🌳', '🪔', '📜'],
    numerologia: ['🔢', '✨', '🔮', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'],
    tantra: ['🕉️', '🪷', '🔥', '💧', '🌬️', '🌍', '🌌'],
    tarot: ['🃏', '🌟', '⚖️', '☀️', '🌙', '⭐', '🔮'],
  });

// ─── Internal state ─────────────────────────────────────────────────────────

type RoomState = {
  config: ChatConfig;
  ringBuffer: ChatMessage[]; // FIFO, max 500
  userLastSentAt: Map<string, number>; // for slow mode
  userWindowTimestamps: Map<string, number[]>; // for rate limit
  userRoomMembership: Set<string>; // currently joined
  userPeakConcurrent: number;
  totalMessages: number;
};

const ROOMS: Map<string, RoomState> = new Map();
const HANDLERS: Map<string, Set<(msg: ChatMessage) => void>> = new Map();

const DEFAULT_RING_BUFFER_CAP = 500;

export function clearAllChatRooms(): void {
  ROOMS.clear();
  HANDLERS.clear();
}

function getOrCreateRoom(streamId: string, config?: Partial<ChatConfig>): RoomState {
  let r = ROOMS.get(streamId);
  if (!r) {
    r = {
      config: normalizeConfig(config ?? {}),
      ringBuffer: [],
      userLastSentAt: new Map(),
      userWindowTimestamps: new Map(),
      userRoomMembership: new Set(),
      userPeakConcurrent: 0,
      totalMessages: 0,
    };
    ROOMS.set(streamId, r);
  } else if (config) {
    r.config = normalizeConfig({ ...r.config, ...config });
  }
  return r;
}

function normalizeConfig(c: Partial<ChatConfig>): ChatConfig {
  return {
    maxMessageLength:
      typeof c.maxMessageLength === 'number' && c.maxMessageLength > 0
        ? c.maxMessageLength
        : 500,
    rateLimitPerMinute:
      typeof c.rateLimitPerMinute === 'number' && c.rateLimitPerMinute >= 0
        ? c.rateLimitPerMinute
        : 30,
    slowModeSeconds:
      typeof c.slowModeSeconds === 'number' && c.slowModeSeconds >= 0
        ? c.slowModeSeconds
        : 0,
    moderatedWords: Array.isArray(c.moderatedWords) ? [...c.moderatedWords] : [],
    allowedEmojis: Array.isArray(c.allowedEmojis) ? [...c.allowedEmojis] : [],
    requireTraditionTag:
      typeof c.requireTraditionTag === 'boolean' ? c.requireTraditionTag : false,
  };
}

// ─── Validation helpers ─────────────────────────────────────────────────────

/**
 * Build a single regex covering all moderated words with word boundaries.
 * Cycle 60/65/67 lesson: lookaround regex for word boundaries; raw input
 * validated BEFORE lowercase normalization.
 */
function buildModerationRegex(words: readonly string[]): RegExp | null {
  if (!words || words.length === 0) return null;
  const cleaned = words
    .filter((w) => typeof w === 'string' && w.trim().length > 0)
    .map((w) => w.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (cleaned.length === 0) return null;
  // Word-boundary anchored alternation; case-insensitive.
  return new RegExp('\\b(?:' + cleaned.join('|') + ')\\b', 'iu');
}

function findModeratedHit(body: string, regex: RegExp | null): string | null {
  if (!regex) return null;
  const m = body.match(regex);
  return m ? m[0] : null;
}

// ─── Public API: room membership ────────────────────────────────────────────

export type JoinResult = {
  roomId: string;
  userId: string;
  joinedAt: number;
};

export function joinChatRoom(
  streamId: string,
  userId: string,
  config?: Partial<ChatConfig>,
): JoinResult {
  if (!streamId) throw new Error('joinChatRoom: streamId is required');
  if (!userId) throw new Error('joinChatRoom: userId is required');
  const room = getOrCreateRoom(streamId, config);
  const wasNew = !room.userRoomMembership.has(userId);
  room.userRoomMembership.add(userId);
  if (wasNew && room.userRoomMembership.size > room.userPeakConcurrent) {
    room.userPeakConcurrent = room.userRoomMembership.size;
  }
  return { roomId: streamId, userId, joinedAt: Date.now() };
}

export function leaveChatRoom(streamId: string, userId: string): void {
  if (!streamId) throw new Error('leaveChatRoom: streamId is required');
  if (!userId) throw new Error('leaveChatRoom: userId is required');
  const room = ROOMS.get(streamId);
  if (!room) return;
  room.userRoomMembership.delete(userId);
  room.userLastSentAt.delete(userId);
  room.userWindowTimestamps.delete(userId);
}

// ─── Public API: send message ───────────────────────────────────────────────

export type SendMessageOpts = {
  type?: ChatMessageType;
  parentMessageId?: string;
  traditionTag?: TraditionTag;
  userDisplayName?: string;
};

export function sendMessage(
  streamId: string,
  userId: string,
  body: string,
  opts?: SendMessageOpts,
): ChatMessage {
  if (!streamId) throw new Error('sendMessage: streamId is required');
  if (!userId) throw new Error('sendMessage: userId is required');
  if (typeof body !== 'string') throw new Error('sendMessage: body must be a string');

  const room = getOrCreateRoom(streamId);
  const cfg = room.config;
  const trimmed = body.trim();

  // Length check
  if (trimmed.length === 0) {
    throw new Error('sendMessage: body cannot be empty');
  }
  if (trimmed.length > cfg.maxMessageLength) {
    throw new Error(
      `sendMessage: body exceeds maxMessageLength (${trimmed.length} > ${cfg.maxMessageLength})`,
    );
  }

  // Type validation
  const type: ChatMessageType = opts?.type ?? 'text';
  if (!['text', 'reaction', 'system', 'moderator', 'donation'].includes(type)) {
    throw new Error(`sendMessage: invalid type '${type}'`);
  }

  // Tradition tag validation
  if (opts?.traditionTag !== undefined) {
    const validTraditions = Object.keys(TRADITION_EMOJI_PACKS);
    if (!validTraditions.includes(opts.traditionTag)) {
      throw new Error(
        `sendMessage: traditionTag must be one of ${validTraditions.join(', ')}`,
      );
    }
  }
  if (cfg.requireTraditionTag && opts?.traditionTag === undefined) {
    throw new Error('sendMessage: traditionTag is required by room config');
  }

  // Emoji allowlist (if configured)
  if (cfg.allowedEmojis.length > 0) {
    const emojiMatches = trimmed.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu) ?? [];
    const emojiSet = new Set(cfg.allowedEmojis);
    for (const e of emojiMatches) {
      if (!emojiSet.has(e)) {
        throw new Error(`sendMessage: emoji '${e}' is not in allowedEmojis`);
      }
    }
  }

  // Moderation
  const regex = buildModerationRegex(cfg.moderatedWords);
  const hit = findModeratedHit(trimmed, regex);
  const moderated = hit !== null;

  // Rate limit (sliding 60s window)
  if (cfg.rateLimitPerMinute > 0) {
    const now = Date.now();
    const arr = room.userWindowTimestamps.get(userId) ?? [];
    while (arr.length > 0 && now - arr[0] > 60_000) arr.shift();
    if (arr.length >= cfg.rateLimitPerMinute) {
      throw new Error(
        `sendMessage: rate limit exceeded (${cfg.rateLimitPerMinute}/min for user '${userId}')`,
      );
    }
    arr.push(now);
    room.userWindowTimestamps.set(userId, arr);
  }

  // Slow mode (per-user last sent timestamp)
  if (cfg.slowModeSeconds > 0) {
    const last = room.userLastSentAt.get(userId) ?? 0;
    const since = (Date.now() - last) / 1000;
    if (last > 0 && since < cfg.slowModeSeconds) {
      const wait = Math.ceil(cfg.slowModeSeconds - since);
      throw new Error(`sendMessage: slow mode active, wait ${wait}s (user '${userId}')`);
    }
    room.userLastSentAt.set(userId, Date.now());
  } else {
    room.userLastSentAt.set(userId, Date.now());
  }

  // Build message
  const id = 'msg_' + randomUUID();
  const message: ChatMessage = {
    id,
    streamId,
    userId,
    userDisplayName: opts?.userDisplayName ?? userId,
    body: moderated ? '[redacted]' : trimmed,
    timestampMs: Date.now(),
    type,
    ...(opts?.parentMessageId ? { parentMessageId: opts.parentMessageId } : {}),
    ...(opts?.traditionTag ? { traditionTag: opts.traditionTag } : {}),
    reactions: {},
    moderated,
    pinned: false,
  };

  // Push to ring buffer
  room.ringBuffer.push(message);
  while (room.ringBuffer.length > DEFAULT_RING_BUFFER_CAP) {
    room.ringBuffer.shift();
  }
  room.totalMessages += 1;

  // Notify subscribers
  const handlers = HANDLERS.get(streamId);
  if (handlers && handlers.size > 0) {
    for (const h of Array.from(handlers)) {
      try {
        h(message);
      } catch {
        // listener errors must not block message delivery
      }
    }
  }
  return message;
}

// ─── Public API: moderation ─────────────────────────────────────────────────

export function moderateMessage(
  messageId: string,
  moderatorId: string,
  action: 'redact' | 'delete' | 'pin' | 'unpin',
): void {
  if (!messageId) throw new Error('moderateMessage: messageId is required');
  if (!moderatorId) throw new Error('moderateMessage: moderatorId is required');
  if (!['redact', 'delete', 'pin', 'unpin'].includes(action)) {
    throw new Error(`moderateMessage: invalid action '${action}'`);
  }
  // Find across all rooms (production: streamId index; here linear scan).
  for (const room of ROOMS.values()) {
    const idx = room.ringBuffer.findIndex((m) => m.id === messageId);
    if (idx >= 0) {
      const msg = room.ringBuffer[idx];
      if (action === 'redact') {
        room.ringBuffer[idx] = Object.freeze({
          ...msg,
          body: '[redacted]',
          moderated: true,
        });
      } else if (action === 'delete') {
        room.ringBuffer.splice(idx, 1);
      } else if (action === 'pin') {
        room.ringBuffer[idx] = Object.freeze({ ...msg, pinned: true });
      } else {
        room.ringBuffer[idx] = Object.freeze({ ...msg, pinned: false });
      }
      return;
    }
  }
  throw new Error(`moderateMessage: message not found '${messageId}'`);
}

// ─── Public API: reactions ──────────────────────────────────────────────────

export function addReaction(messageId: string, userId: string, emoji: string): void {
  if (!messageId) throw new Error('addReaction: messageId is required');
  if (!userId) throw new Error('addReaction: userId is required');
  if (typeof emoji !== 'string' || emoji.length === 0) {
    throw new Error('addReaction: emoji is required');
  }
  for (const room of ROOMS.values()) {
    const idx = room.ringBuffer.findIndex((m) => m.id === messageId);
    if (idx >= 0) {
      const msg = room.ringBuffer[idx];
      const next = { ...msg.reactions };
      next[emoji] = (next[emoji] ?? 0) + 1;
      room.ringBuffer[idx] = Object.freeze({ ...msg, reactions: next });
      return;
    }
  }
  throw new Error(`addReaction: message not found '${messageId}'`);
}

// ─── Public API: read ───────────────────────────────────────────────────────

export function getRecentMessages(
  streamId: string,
  limit: number,
  opts?: { since?: number; type?: ChatMessageType },
): ChatMessage[] {
  if (!streamId) throw new Error('getRecentMessages: streamId is required');
  if (typeof limit !== 'number' || limit < 0) {
    throw new Error('getRecentMessages: limit must be >= 0');
  }
  const room = ROOMS.get(streamId);
  if (!room) return [];
  let arr = room.ringBuffer.slice();
  if (typeof opts?.since === 'number') {
    arr = arr.filter((m) => m.timestampMs >= opts.since!);
  }
  if (opts?.type) {
    arr = arr.filter((m) => m.type === opts.type);
  }
  return arr.slice(-limit);
}

export function subscribeToChat(
  streamId: string,
  handler: (msg: ChatMessage) => void,
): () => void {
  if (!streamId) throw new Error('subscribeToChat: streamId is required');
  if (typeof handler !== 'function') {
    throw new Error('subscribeToChat: handler must be a function');
  }
  let set = HANDLERS.get(streamId);
  if (!set) {
    set = new Set();
    HANDLERS.set(streamId, set);
  }
  set.add(handler);
  return () => {
    const s = HANDLERS.get(streamId);
    if (s) {
      s.delete(handler);
      if (s.size === 0) HANDLERS.delete(streamId);
    }
  };
}

export type ChatStats = {
  totalMessages: number;
  uniqueUsers: number;
  peakConcurrent: number;
  messagesPerMinute: number;
  topReactions: Array<{ emoji: string; count: number }>;
};

export function getChatStats(streamId: string): ChatStats {
  if (!streamId) throw new Error('getChatStats: streamId is required');
  const room = ROOMS.get(streamId);
  if (!room) {
    return Object.freeze({
      totalMessages: 0,
      uniqueUsers: 0,
      peakConcurrent: 0,
      messagesPerMinute: 0,
      topReactions: [],
    });
  }
  const reactionTotals: Record<string, number> = {};
  for (const m of room.ringBuffer) {
    for (const [k, v] of Object.entries(m.reactions)) {
      reactionTotals[k] = (reactionTotals[k] ?? 0) + v;
    }
  }
  const topReactions = Object.entries(reactionTotals)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  // messagesPerMinute = totalMessages / max(minutesActive, 1)
  const minutesActive = Math.max(
    1,
    Math.ceil((Date.now() - (room.ringBuffer[0]?.timestampMs ?? Date.now())) / 60_000),
  );
  return Object.freeze({
    totalMessages: room.totalMessages,
    uniqueUsers: room.userRoomMembership.size,
    peakConcurrent: room.userPeakConcurrent,
    messagesPerMinute: room.totalMessages / minutesActive,
    topReactions,
  });
}

// ─── Public API: room config update ─────────────────────────────────────────

export function updateChatConfig(
  streamId: string,
  patch: Partial<ChatConfig>,
): ChatConfig {
  if (!streamId) throw new Error('updateChatConfig: streamId is required');
  const room = getOrCreateRoom(streamId, patch);
  return room.config;
}

export function getChatConfig(streamId: string): ChatConfig | null {
  const room = ROOMS.get(streamId);
  return room ? room.config : null;
}

// ─── Public API: audit ──────────────────────────────────────────────────────

export function auditChatTraditions(): Readonly<Record<TraditionTag, readonly string[]>> {
  return TRADITION_EMOJI_PACKS;
}

export function auditChatSurface(): {
  types: readonly ChatMessageType[];
  traditions: readonly TraditionTag[];
  ringBufferCap: number;
  defaultMaxLength: number;
} {
  return Object.freeze({
    types: ['text', 'reaction', 'system', 'moderator', 'donation'] as const,
    traditions: Object.keys(TRADITION_EMOJI_PACKS) as TraditionTag[],
    ringBufferCap: DEFAULT_RING_BUFFER_CAP,
    defaultMaxLength: 500,
  });
}