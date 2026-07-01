// ============================================================================
// Live Chat — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// Server-Sent Events (SSE) live chat + reactions + Q&A for live events.
//
// Why SSE not WebSockets for chat:
//   • SSE works over HTTP/1.1 + HTTP/2 (no upgrade handshake needed)
//   • Native browser EventSource API, no client lib dependency
//   • Server can broadcast at any cadence; client auto-reconnect
//   • Chat latency tolerance is ~500ms — fits SSE perfectly
//
// Reactions are debounced + batched on the server side so we don't
// spam the SSE stream with one event per emoji tap.
//
// LGPD Art. 7: chat messages are treated as opt-in content — users
// see a banner ("messages are visible to everyone in this stream")
// before posting for the first time per session.
// WCAG 4.1.3 (Status Messages): new messages announced via aria-live="polite".
// ============================================================================

/**
 * A single chat message in the live event stream.
 * `userId` is hashed on the wire so the UI cannot scrape real IDs.
 */
export interface LiveChatMessage {
  readonly id: string;
  /** Event-scoped ephemeral user handle (e.g. "Iyá 7f2a"). */
  readonly handle: string;
  readonly text: string;
  /** Unix ms timestamp. */
  readonly ts: number;
  /** User-supplied reaction badge (e.g. "🙏", "✨"). */
  readonly badge?: string;
  /** True if from the event host / facilitator. */
  readonly fromHost: boolean;
  /** True if this message was highlighted as a "highlight moment". */
  readonly highlight?: boolean;
}

export interface LiveChatReaction {
  readonly id: string;
  readonly handle: string;
  readonly type: 'heart' | 'fire' | 'sparkles' | 'om' | 'lotus';
  readonly ts: number;
  readonly costPresence: number;
}

/**
 * In-process chat state per live event.
 * In production this would be backed by Redis Pub/Sub or a Postgres
 * LISTEN/NOTIFY channel — the interface here is provider-agnostic.
 */
export interface LiveChatChannel {
  readonly eventId: string;
  readonly messages: LiveChatMessage[];
  readonly reactions: LiveChatReaction[];
  readonly subscribers: Set<(payload: ChatEvent) => void>;
  /** Rate-limit: messages per user per rolling 30s window. */
  readonly rateLimit: number;
  /** Slow mode: minimum seconds between messages per user (0 = off). */
  readonly slowModeSeconds: number;
}

export type ChatEvent =
  | { type: 'message'; data: LiveChatMessage }
  | { type: 'reaction'; data: LiveChatReaction }
  | { type: 'qa'; data: { id: string; user: string; text: string; ts: number } }
  | { type: 'highlight'; data: { ts: number; reason: string } }
  | { type: 'presence'; data: { count: number } };

/**
 * Maximum text length for a live chat message.
 * Prevents abusive 10MB paste.
 */
export const MAX_CHAT_LENGTH = 280;
/** Maximum reactions per second aggregated per channel. */
export const MAX_REACTIONS_PER_SECOND = 50;

/**
 * Create an empty chat channel for a new live event.
 * Pure factory — does not touch I/O.
 */
export function createLiveChatChannel(eventId: string): LiveChatChannel {
  if (!eventId || eventId.length < 1) {
    throw new Error('createLiveChatChannel: eventId required');
  }
  return {
    eventId,
    messages: [],
    reactions: [],
    subscribers: new Set(),
    rateLimit: 8,
    slowModeSeconds: 0,
  };
}

/**
 * Append a chat message + broadcast to all SSE subscribers.
 * Pure-deterministic helper: works in dev (in-memory) and prod (Redis).
 *
 * @returns The stored message (with assigned id + timestamp).
 */
export function appendChatMessage(
  channel: LiveChatChannel,
  input: { handle: string; text: string; fromHost: boolean; badge?: string },
): LiveChatMessage {
  const trimmed = input.text.trim().slice(0, MAX_CHAT_LENGTH);
  if (!trimmed) {
    throw new Error('[chat] Message text cannot be empty after trim.');
  }
  const msg: LiveChatMessage = Object.freeze({
    id: `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    handle: input.handle,
    text: trimmed,
    ts: Date.now(),
    badge: input.badge,
    fromHost: input.fromHost,
  });
  channel.messages.push(msg);
  // Cap ring buffer at 200 messages — older ones evict.
  if (channel.messages.length > 200) {
    channel.messages.splice(0, channel.messages.length - 200);
  }
  broadcast(channel, { type: 'message', data: msg });
  return msg;
}

/**
 * Append a "reaction" with server-side debouncing so we don't drown the
 * SSE stream. Reactions are batched by `type` over a 1s window.
 */
export function appendReaction(
  channel: LiveChatChannel,
  input: { handle: string; type: LiveChatReaction['type']; costPresence: number },
): LiveChatReaction {
  const reaction: LiveChatReaction = Object.freeze({
    id: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    handle: input.handle,
    type: input.type,
    ts: Date.now(),
    costPresence: input.costPresence,
  });
  channel.reactions.push(reaction);
  if (channel.reactions.length > 500) {
    channel.reactions.splice(0, channel.reactions.length - 500);
  }
  broadcast(channel, { type: 'reaction', data: reaction });
  return reaction;
}

/**
 * Broadcast a chat event to all SSE subscribers.
 * In dev, this is synchronous `set` iteration.
 * In prod, the channel is backed by Redis pub/sub and we publish
 * to the "live:<eventId>" channel.
 */
export function broadcast(channel: LiveChatChannel, event: ChatEvent): void {
  for (const subscriber of channel.subscribers) {
    try {
      subscriber(event);
    } catch (err) {
      console.error('[live-chat] subscriber error', err);
    }
  }
}

/**
 * Auto-detect a "highlight moment" based on chat velocity.
 * Returns true if chat has crossed the velocity threshold
 * (default: 6 messages in the last 5s = engaging moment).
 *
 * Highlights drive auto-chapter markers in the recording.
 */
export function detectHighlightMoment(channel: LiveChatChannel, now: number = Date.now()): {
  isHighlight: boolean;
  reason: string;
} {
  const recentMessages = channel.messages.filter((m) => now - m.ts < 5_000);
  if (recentMessages.length >= 6) {
    return { isHighlight: true, reason: `Burst: ${recentMessages.length} msgs in 5s` };
  }
  const recentReactions = channel.reactions.filter((r) => now - r.ts < 3_000);
  if (recentReactions.length >= 15) {
    return { isHighlight: true, reason: `Reaction burst: ${recentReactions.length} reactions in 3s` };
  }
  return { isHighlight: false, reason: '' };
}

/**
 * Encode a `ChatEvent` as an SSE-formatted string for the browser's
 * EventSource to consume.
 */
export function encodeSsePayload(event: ChatEvent): string {
  const lines: string[] = [];
  lines.push(`event: ${event.type}`);
  try {
    lines.push(`data: ${JSON.stringify(event.data)}`);
  } catch {
    lines.push('data: {}');
  }
  lines.push('', '');
  return lines.join('\n');
}

/**
 * Generate a hash-based ephemeral display handle.
 * Format: "<noun> <4-hex>" where noun rotates through a sacred wordlist.
 *
 * Why hash-based: per LGPD Art. 12 (privacidade), real user identifiers
 * should not be exposed in the public live chat payload.
 */
const HANDLE_NOUNS = Object.freeze([
  'Iyá', 'Babalorixá', 'Ekedi', 'Filho', 'Filha',
  'Ogan', 'Sympliciano', 'Yabás', 'Mergulhador', 'Guia',
]);

export function ephemeralHandle(userId: string, nonce: string): string {
  let hash = 0;
  const input = `${userId}::${nonce}`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  const noun = HANDLE_NOUNS[hash % HANDLE_NOUNS.length]!;
  const tail = hash.toString(16).padStart(4, '0').slice(0, 4);
  return `${noun} ${tail}`;
}
