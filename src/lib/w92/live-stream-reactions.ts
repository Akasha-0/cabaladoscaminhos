/**
 * Live Stream Reactions — Engine (W92-B)
 * ========================================================================
 * Curated emoji reactions + real-time SSE + presence indicators.
 *
 * Design principles (sacred-cultural compliance):
 * - Reactions are GIFTS OF PRESENCE, not "likes" or votes
 * - No leaderboards, no "top reactor", no "most reacted" stats
 * - Presence shows COUNT only (no names, no avatars) — privacy by default
 * - Rate limit is HUMAN cadence (1 / 2s / type), not bot cadence (1/s)
 *
 * Curated set (8):
 *   💜🙏✨🌱🔥💧🕊🌟
 *
 * Curadoria (PT-BR):
 *   💜 — Compaixão / Cura
 *   🙏 — Gratidão
 *   ✨ — Insight / Revelação
 *   🌱 — Crescimento
 *   🔥 — Transformação
 *   💧 — Fluir / Limpar
 *   🕊 — Paz
 *   🌟 — Inspiração
 *
 * Why exactly 8: enough variety to express nuance, few enough to keep
 * the bar scannable on mobile. NOT a ranked list, NOT a tier system.
 * Users pick whichever resonates in the moment.
 *
 * Hard rules:
 * - No `any`
 * - Branded IDs (UserId, StreamId, ReactionId)
 * - Pure engine: no Prisma, no fetch — purely in-memory + injectable sinks
 *   so the same engine can be unit-tested and reused in edge runtimes
 * - Rate limit: 1 reaction / 2s / user / type (configurable via RATE_LIMIT_MS)
 * - Presence window: 5 minutes (configurable via PRESENCE_WINDOW_MS)
 * - Float bubble cap: 30 (configurable via MAX_FLOATING_BUBBLES)
 */

import type { SSEController } from '@/lib/sse';

// ============================================================================
// Branded ID types — prevents accidental ID mixing
// ============================================================================

declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type StreamId = Brand<string, 'StreamId'>;
export type ReactionId = Brand<string, 'ReactionId'>;

export function asUserId(s: string): UserId {
  return s as UserId;
}
export function asStreamId(s: string): StreamId {
  return s as StreamId;
}
export function asReactionId(s: string): ReactionId {
  return s as ReactionId;
}

// ============================================================================
// Constants — exported for tests + UI consumers
// ============================================================================

/** Curated emoji set (8). Order = display order on the ReactionBar. */
export const REACTION_TYPES = [
  '💜', // 0
  '🙏', // 1
  '✨', // 2
  '🌱', // 3
  '🔥', // 4
  '💧', // 5
  '🕊', // 6
  '🌟', // 7
] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];

/** Spiritual meaning per emoji (PT-BR + EN). Used in tooltips. */
export const REACTION_MEANINGS_PT: Record<ReactionType, string> = {
  '💜': 'Compaixão',
  '🙏': 'Gratidão',
  '✨': 'Insight',
  '🌱': 'Crescimento',
  '🔥': 'Transformação',
  '💧': 'Fluir',
  '🕊': 'Paz',
  '🌟': 'Inspiração',
};

export const REACTION_MEANINGS_EN: Record<ReactionType, string> = {
  '💜': 'Compassion',
  '🙏': 'Gratitude',
  '✨': 'Insight',
  '🌱': 'Growth',
  '🔥': 'Transformation',
  '💧': 'Flow',
  '🕊': 'Peace',
  '🌟': 'Inspiration',
};

/** Default rate limit: 1 reaction / 2s / user / type — human cadence. */
export const DEFAULT_RATE_LIMIT_MS = 2_000;

/** Presence window: count users active in last 5 minutes. */
export const DEFAULT_PRESENCE_WINDOW_MS = 5 * 60 * 1_000;

/** SSE event channel name (sent in `event:` line). */
export const SSE_EVENT_NAME = 'reaction';

/** SSE presence event name (separate so clients can subscribe independently). */
export const SSE_PRESENCE_EVENT_NAME = 'presence';

/** Max concurrent floating bubbles (client-side cap). */
export const MAX_FLOATING_BUBBLES = 30;

/** Reaction TTL in broadcast history (lets late joiners see recent activity). */
export const REACTION_HISTORY_TTL_MS = 30_000;

/** Max reactions kept in per-stream history. */
export const REACTION_HISTORY_MAX = 50;

// ============================================================================
// Type guards
// ============================================================================

export function isReactionType(value: unknown): value is ReactionType {
  return (
    typeof value === 'string' && (REACTION_TYPES as readonly string[]).includes(value)
  );
}

// ============================================================================
// Domain types
// ============================================================================

/**
 * SendReactionCtx — minimum context required to send a reaction.
 *
 * Engine intentionally does NOT do auth — caller (API route / server action)
 * must validate userId and streamId before invoking. Engine validates:
 * - type is in REACTION_TYPES
 * - rate limit (1 / 2s / user / type)
 */
export interface SendReactionCtx {
  userId: UserId;
  streamId: StreamId;
  type: ReactionType;
  /** Optional client-supplied reaction id (for idempotency). */
  reactionId?: ReactionId;
  /** Optional override (ms since epoch). Defaults to Date.now(). */
  now?: number;
}

/**
 * ReactionEvent — emitted on every accepted reaction.
 * Shape is intentionally minimal — no user names, no avatars (privacy).
 */
export interface ReactionEvent {
  reactionId: ReactionId;
  streamId: StreamId;
  type: ReactionType;
  /** Epoch ms when accepted. */
  timestamp: number;
  /** Aggregate counts AFTER this reaction was applied (per type). */
  aggregates: Record<ReactionType, number>;
  /** Total reactions on stream AFTER this reaction. */
  total: number;
}

/**
 * PresenceEvent — emitted whenever presence changes (debounced 1s).
 * Count-only: no names, no avatars.
 */
export interface PresenceEvent {
  streamId: StreamId;
  count: number;
  timestamp: number;
}

/**
 * EngineOptions — injectable config (rate limit, presence window).
 * All optional with sensible defaults.
 */
export interface EngineOptions {
  rateLimitMs?: number;
  presenceWindowMs?: number;
  /** Injectable id factory (defaults to crypto.randomUUID). */
  generateId?: () => string;
  /** Injectable clock (defaults to () => Date.now()). */
  now?: () => number;
}

// ============================================================================
// Errors
// ============================================================================

export class ReactionValidationError extends Error {
  public readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ReactionValidationError';
  }
}

export class ReactionRateLimitError extends Error {
  public readonly statusCode = 429;
  public readonly retryAfterMs: number;
  constructor(userId: UserId, type: ReactionType, retryAfterMs: number) {
    super(
      `Rate limit: user ${userId} cannot send ${type} for ${retryAfterMs}ms`
    );
    this.name = 'ReactionRateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

// ============================================================================
// Internal state — per-stream
// ============================================================================

interface StreamState {
  /** Last reaction timestamp per (userId, type) — for rate limit. */
  lastReaction: Map<string, number>;
  /** Aggregate count per type. */
  aggregates: Record<ReactionType, number>;
  /** Recent reaction history (bounded, ring buffer). */
  history: ReactionEvent[];
  /** Active presence: userId → lastSeen (epoch ms). */
  presence: Map<UserId, number>;
  /** SSE subscribers (one per connected client). */
  subscribers: Set<SSEController>;
  /** Presence subscribers (separate channel). */
  presenceSubscribers: Set<SSEController>;
  /** Last presence broadcast (epoch ms). */
  lastPresenceBroadcast: number;
  /** Pending presence broadcast timer. */
  presenceTimer: ReturnType<typeof setTimeout> | null;
}

function newStreamState(): StreamState {
  const aggregates = Object.fromEntries(
    REACTION_TYPES.map((t) => [t, 0])
  ) as Record<ReactionType, number>;
  return {
    lastReaction: new Map(),
    aggregates,
    history: [],
    presence: new Map(),
    subscribers: new Set(),
    presenceSubscribers: new Set(),
    lastPresenceBroadcast: 0,
    presenceTimer: null,
  };
}

// ============================================================================
// Engine
// ============================================================================

/**
 * LiveStreamReactionsEngine — in-memory engine for a single Node process.
 *
 * Multi-instance deployments would need a shared broker (Redis pub/sub)
 * — that's a deployment concern, NOT an engine concern. Engine is pure
 * and testable in isolation.
 */
export class LiveStreamReactionsEngine {
  private readonly streams: Map<StreamId, StreamState> = new Map();
  private readonly rateLimitMs: number;
  private readonly presenceWindowMs: number;
  private readonly generateId: () => string;
  private readonly now: () => number;

  constructor(options: EngineOptions = {}) {
    this.rateLimitMs = options.rateLimitMs ?? DEFAULT_RATE_LIMIT_MS;
    this.presenceWindowMs =
      options.presenceWindowMs ?? DEFAULT_PRESENCE_WINDOW_MS;
    this.generateId =
      options.generateId ??
      ((): string => {
        // Node 18+ has crypto.randomUUID; fallback for older envs.
        if (typeof globalThis.crypto?.randomUUID === 'function') {
          return globalThis.crypto.randomUUID();
        }
        return `rxn_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
      });
    this.now = options.now ?? ((): number => Date.now());
  }

  // ============================================================
  // Stream state accessor (lazy init)
  // ============================================================

  private getStream(streamId: StreamId): StreamState {
    let s = this.streams.get(streamId);
    if (!s) {
      s = newStreamState();
      this.streams.set(streamId, s);
    }
    return s;
  }

  // ============================================================
  // sendReaction
  // ============================================================

  /**
   * Send a reaction. Validates type, applies rate limit, broadcasts to
   * subscribers (reaction channel) and presence channel.
   *
   * Returns the ReactionEvent that was broadcast (also useful for the
   * caller to confirm to the originating client).
   *
   * Throws:
   *  - ReactionValidationError if type invalid or userId/streamId empty
   *  - ReactionRateLimitError if user is sending too fast (caller should
   *    surface retryAfterMs to the client)
   */
  sendReaction(ctx: SendReactionCtx): ReactionEvent {
    // Validate inputs
    if (!isReactionType(ctx.type)) {
      throw new ReactionValidationError(
        `Invalid reaction type: ${String(ctx.type)}. Must be one of ${REACTION_TYPES.join(' ')}`
      );
    }
    if (!ctx.userId || (ctx.userId as string).length === 0) {
      throw new ReactionValidationError('userId is required');
    }
    if (!ctx.streamId || (ctx.streamId as string).length === 0) {
      throw new ReactionValidationError('streamId is required');
    }

    const stream = this.getStream(ctx.streamId);
    const now = ctx.now ?? this.now();

    // Rate limit check: 1 reaction / rateLimitMs / user / type
    const rateKey = `${ctx.userId}::${ctx.type}`;
    const lastTs = stream.lastReaction.get(rateKey);
    if (lastTs !== undefined) {
      const elapsed = now - lastTs;
      if (elapsed < this.rateLimitMs) {
        throw new ReactionRateLimitError(
          ctx.userId,
          ctx.type,
          this.rateLimitMs - elapsed
        );
      }
    }
    stream.lastReaction.set(rateKey, now);

    // Apply aggregate
    stream.aggregates[ctx.type] += 1;
    const total = REACTION_TYPES.reduce(
      (acc, t) => acc + stream.aggregates[t],
      0
    );

    // Build event
    const reactionId = ctx.reactionId ?? asReactionId(this.generateId());
    const event: ReactionEvent = {
      reactionId,
      streamId: ctx.streamId,
      type: ctx.type,
      timestamp: now,
      aggregates: { ...stream.aggregates },
      total,
    };

    // Append to history (bounded)
    stream.history.push(event);
    if (stream.history.length > REACTION_HISTORY_MAX) {
      // Cull oldest
      stream.history.splice(0, stream.history.length - REACTION_HISTORY_MAX);
    }
    // Cull history older than TTL
    const cutoff = now - REACTION_HISTORY_TTL_MS;
    while (
      stream.history.length > 0 &&
      stream.history[0]!.timestamp < cutoff
    ) {
      stream.history.shift();
    }

    // Broadcast to reaction channel
    this.broadcastReactions(ctx.streamId, event);

    // Also update presence — sending a reaction is strong presence signal
    this.touchPresence(ctx.streamId, ctx.userId, now);

    return event;
  }

  // ============================================================
  // subscribeReactions
  // ============================================================

  /**
   * Register an SSE controller to receive reaction events for a stream.
   * Caller is responsible for keeping the controller alive; calling
   * controller.close() will automatically remove the subscription.
   *
   * Sends an initial snapshot of recent history (last REACTION_HISTORY_TTL_MS).
   */
  subscribeReactions(streamId: StreamId, controller: SSEController): void {
    const stream = this.getStream(streamId);
    stream.subscribers.add(controller);

    // Send initial snapshot — last 10 reactions, capped at history length
    const snapshot = stream.history.slice(-10);
    try {
      controller.send({
        kind: 'snapshot',
        events: snapshot,
        aggregates: { ...stream.aggregates },
      });
    } catch {
      // Controller already closed; ignore
    }
  }

  unsubscribeReactions(streamId: StreamId, controller: SSEController): void {
    const stream = this.streams.get(streamId);
    if (!stream) return;
    stream.subscribers.delete(controller);
  }

  private broadcastReactions(streamId: StreamId, event: ReactionEvent): void {
    const stream = this.streams.get(streamId);
    if (!stream) return;
    const payload = { kind: 'reaction', event };
    const dead: SSEController[] = [];
    for (const sub of stream.subscribers) {
      try {
        sub.send(payload);
      } catch {
        dead.push(sub);
      }
    }
    for (const d of dead) {
      stream.subscribers.delete(d);
    }
  }

  // ============================================================
  // getActivePresence
  // ============================================================

  /**
   * Returns the count of unique users who reacted or touched presence
   * in the last presenceWindowMs. Names/avatars are NEVER returned —
   * just the count.
   *
   * Note: this is a snapshot. For real-time updates, subscribe via
   * subscribePresence().
   */
  getActivePresence(streamId: StreamId): number {
    const stream = this.streams.get(streamId);
    if (!stream) return 0;
    const cutoff = this.now() - this.presenceWindowMs;
    this.cullPresence(stream, cutoff);
    return stream.presence.size;
  }

  /**
   * Record that a user is currently watching / interacting with a stream.
   * Idempotent — multiple touches within the window don't inflate count.
   * Triggers a debounced presence broadcast.
   */
  touchPresence(streamId: StreamId, userId: UserId, nowOverride?: number): void {
    const stream = this.getStream(streamId);
    const now = nowOverride ?? this.now();
    const cutoff = now - this.presenceWindowMs;

    // Cull stale presence first
    this.cullPresence(stream, cutoff);

    // Upsert
    stream.presence.set(userId, now);

    // Schedule debounced broadcast (1s coalesce window)
    this.schedulePresenceBroadcast(streamId, now);
  }

  /**
   * Explicitly remove a user from presence (e.g., on disconnect).
   */
  leavePresence(streamId: StreamId, userId: UserId): void {
    const stream = this.streams.get(streamId);
    if (!stream) return;
    stream.presence.delete(userId);
    this.schedulePresenceBroadcast(streamId, this.now());
  }

  /**
   * Subscribe to presence updates (debounced, 1s coalesce).
   */
  subscribePresence(streamId: StreamId, controller: SSEController): void {
    const stream = this.getStream(streamId);
    stream.presenceSubscribers.add(controller);
    // Send initial snapshot
    try {
      controller.send({
        kind: 'snapshot',
        count: stream.presence.size,
        timestamp: this.now(),
      });
    } catch {
      // Controller already closed
    }
  }

  unsubscribePresence(streamId: StreamId, controller: SSEController): void {
    const stream = this.streams.get(streamId);
    if (!stream) return;
    stream.presenceSubscribers.delete(controller);
  }

  private cullPresence(stream: StreamState, cutoff: number): void {
    for (const [uid, ts] of stream.presence) {
      if (ts < cutoff) {
        stream.presence.delete(uid);
      }
    }
  }

  private schedulePresenceBroadcast(streamId: StreamId, now: number): void {
    const stream = this.streams.get(streamId);
    if (!stream) return;

    // If we just broadcast < 1s ago, defer.
    if (now - stream.lastPresenceBroadcast < 1_000) {
      if (stream.presenceTimer !== null) return; // already scheduled
      const delay = 1_000 - (now - stream.lastPresenceBroadcast);
      stream.presenceTimer = setTimeout(() => {
        stream.presenceTimer = null;
        this.flushPresence(streamId);
      }, delay);
      return;
    }

    this.flushPresence(streamId);
  }

  private flushPresence(streamId: StreamId): void {
    const stream = this.streams.get(streamId);
    if (!stream) return;
    const now = this.now();
    const cutoff = now - this.presenceWindowMs;
    this.cullPresence(stream, cutoff);
    const count = stream.presence.size;
    const event: PresenceEvent = {
      streamId,
      count,
      timestamp: now,
    };
    stream.lastPresenceBroadcast = now;
    const payload = { kind: 'presence', event };
    const dead: SSEController[] = [];
    for (const sub of stream.presenceSubscribers) {
      try {
        sub.send(payload);
      } catch {
        dead.push(sub);
      }
    }
    for (const d of dead) {
      stream.presenceSubscribers.delete(d);
    }
  }

  // ============================================================
  // Introspection (read-only — used by /watch server page)
  // ============================================================

  /** Aggregated reaction counts per type for a stream. */
  getAggregates(streamId: StreamId): Record<ReactionType, number> {
    const stream = this.streams.get(streamId);
    if (!stream) {
      return Object.fromEntries(
        REACTION_TYPES.map((t) => [t, 0])
      ) as Record<ReactionType, number>;
    }
    return { ...stream.aggregates };
  }

  /** Total reactions on stream (sum across types). */
  getTotal(streamId: StreamId): number {
    return REACTION_TYPES.reduce(
      (acc, t) => acc + (this.streams.get(streamId)?.aggregates[t] ?? 0),
      0
    );
  }

  /** Recent reaction history for a stream (read-only snapshot). */
  getRecentHistory(streamId: StreamId, limit = 10): ReactionEvent[] {
    const stream = this.streams.get(streamId);
    if (!stream) return [];
    return stream.history.slice(-limit);
  }

  /** Active stream IDs (for health checks / cleanup). */
  getActiveStreamIds(): StreamId[] {
    return Array.from(this.streams.keys());
  }

  // ============================================================
  // Cleanup — for tests + graceful shutdown
  // ============================================================

  /** Clear all state for a single stream (test helper). */
  resetStream(streamId: StreamId): void {
    const stream = this.streams.get(streamId);
    if (!stream) return;
    if (stream.presenceTimer !== null) {
      clearTimeout(stream.presenceTimer);
      stream.presenceTimer = null;
    }
    for (const sub of stream.subscribers) {
      try {
        sub.close();
      } catch {
        // ignore
      }
    }
    for (const sub of stream.presenceSubscribers) {
      try {
        sub.close();
      } catch {
        // ignore
      }
    }
    this.streams.delete(streamId);
  }

  /** Clear ALL state (test helper). */
  resetAll(): void {
    for (const id of Array.from(this.streams.keys())) {
      this.resetStream(id);
    }
  }

  // ============================================================
  // Config getters (for UI/test consumers)
  // ============================================================

  getRateLimitMs(): number {
    return this.rateLimitMs;
  }

  getPresenceWindowMs(): number {
    return this.presenceWindowMs;
  }
}

// ============================================================================
// Singleton (process-wide) — for production use, instantiated lazily.
// Server actions / API routes import `getEngine()` and call methods.
// Tests construct their own engine instance directly.
// ============================================================================

let __singleton: LiveStreamReactionsEngine | null = null;

export function getEngine(): LiveStreamReactionsEngine {
  if (__singleton === null) {
    __singleton = new LiveStreamReactionsEngine();
  }
  return __singleton;
}

/** Reset singleton (test helper only). */
export function _resetEngineSingleton(): void {
  if (__singleton !== null) {
    __singleton.resetAll();
    __singleton = null;
  }
}

// ============================================================================
// SSE event payload shapes (for client-side typing)
// ============================================================================

export interface SSEEventReaction {
  kind: 'reaction';
  event: ReactionEvent;
}

export interface SSEEventSnapshot {
  kind: 'snapshot';
  events?: ReactionEvent[];
  aggregates?: Record<ReactionType, number>;
  count?: number;
  timestamp?: number;
}

export interface SSEEventPresence {
  kind: 'presence';
  event: PresenceEvent;
}

export type SSEEvent = SSEEventReaction | SSEEventSnapshot | SSEEventPresence;