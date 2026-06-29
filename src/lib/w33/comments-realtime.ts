// src/lib/w33/comments-realtime.ts
// Cycle 33 worker C — comments real-time (websocket subscription + typing + presence)
// Composes w29/comments-threading + w30/comments-moderation + w31/comments-mentions-notify
// Scope: subscribe/unsubscribe lifecycle, typing indicator aggregation, presence, backpressure
// Namespace: w33 — self-contained, type-only deps on other waves

export type RealtimeEventKind =
  | "comment_created"
  | "comment_updated"
  | "comment_deleted"
  | "reaction_added"
  | "reaction_removed"
  | "typing_start"
  | "typing_stop"
  | "presence_join"
  | "presence_leave"
  | "mention_notification";

export interface RealtimeEvent {
  readonly id: string;
  readonly kind: RealtimeEventKind;
  readonly postId: string;
  readonly threadId: string;
  readonly authorId: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly emittedAt: number;
  readonly sequence: number;
}

export interface TypingState {
  readonly userId: string;
  readonly displayName: string;
  readonly startedAt: number;
  readonly lastUpdateAt: number;
  readonly parentCommentId: string | null; // null = top-level
}

export const TYPING_TIMEOUT_MS = 6000;

export interface RealtimeSubscription {
  readonly subscriptionId: string;
  readonly postId: string;
  readonly userId: string;
  readonly createdAt: number;
  readonly isActive: boolean;
}

export interface PresenceRecord {
  readonly userId: string;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly joinedAt: number;
  readonly lastHeartbeatAt: number;
  readonly isOnline: boolean;
}

export const HEARTBEAT_STALE_MS = 30000;

export function isHeartbeatStale(presence: PresenceRecord, now: number): boolean {
  return now - presence.lastHeartbeatAt > HEARTBEAT_STALE_MS;
}

export interface RealtimeQueue {
  readonly subscriptionId: string;
  readonly pending: ReadonlyArray<RealtimeEvent>;
  readonly inFlight: ReadonlyArray<RealtimeEvent>;
  readonly dropped: number;
  readonly lastDrainAt: number;
}

export const MAX_PENDING = 200;
export const MAX_INFLIGHT = 50;

export function enqueueEvent(
  queue: RealtimeQueue,
  event: RealtimeEvent,
): RealtimeQueue {
  if (queue.pending.length >= MAX_PENDING) {
    return { ...queue, dropped: queue.dropped + 1 };
  }
  return { ...queue, pending: [...queue.pending, event] };
}

export function drainQueue(
  queue: RealtimeQueue,
  now: number,
  capacity: number = MAX_INFLIGHT,
): { queue: RealtimeQueue; drained: ReadonlyArray<RealtimeEvent> } {
  const drainCount = Math.min(queue.pending.length, capacity - queue.inFlight.length);
  if (drainCount <= 0) {
    return { queue, drained: [] };
  }
  const drained = queue.pending.slice(0, drainCount);
  const remaining = queue.pending.slice(drainCount);
  return {
    queue: {
      ...queue,
      pending: remaining,
      inFlight: [...queue.inFlight, ...drained],
      lastDrainAt: now,
    },
    drained,
  };
}

export function ackDrained(
  queue: RealtimeQueue,
  drainedIds: ReadonlyArray<string>,
): RealtimeQueue {
  const idSet = new Set(drainedIds);
  return { ...queue, inFlight: queue.inFlight.filter((e) => !idSet.has(e.id)) };
}

export interface TypingAggregate {
  readonly active: ReadonlyArray<TypingState>;
  readonly label: string; // "Ana digitando…" / "Ana e Bruno digitando…" / "3 pessoas digitando…"
  readonly isAnyoneTyping: boolean;
}

export function aggregateTyping(
  states: ReadonlyArray<TypingState>,
  now: number,
  selfUserId: string,
  maxNames: number = 2,
): TypingAggregate {
  const active = states.filter(
    (t) => t.userId !== selfUserId && now - t.lastUpdateAt < TYPING_TIMEOUT_MS,
  );
  const isAnyoneTyping = active.length > 0;
  if (active.length === 0) {
    return { active: [], label: "", isAnyoneTyping: false };
  }
  if (active.length === 1) {
    return { active, label: `${active[0].displayName} digitando…`, isAnyoneTyping };
  }
  const names = active.slice(0, maxNames).map((t) => t.displayName);
  let label: string;
  if (active.length <= maxNames) {
    const last = names.pop();
    label = `${names.join(", ")} e ${last} digitando…`;
  } else {
    label = `${active.length} pessoas digitando…`;
  }
  return { active, label, isAnyoneTyping };
}

export interface OnlineUserCount {
  readonly online: number;
  readonly browsing: number;
  readonly replying: number;
}

export function countOnlinePresence(
  records: ReadonlyArray<PresenceRecord>,
  now: number,
  replyingUserIds: ReadonlySet<string>,
): OnlineUserCount {
  let online = 0;
  let browsing = 0;
  let replying = 0;
  for (const r of records) {
    if (!isHeartbeatStale(r, now)) {
      online++;
      if (replyingUserIds.has(r.userId)) replying++;
      else browsing++;
    }
  }
  return { online, browsing, replying };
}

export function dedupeEvents(
  events: ReadonlyArray<RealtimeEvent>,
): ReadonlyArray<RealtimeEvent> {
  const seen = new Set<string>();
  const out: RealtimeEvent[] = [];
  for (const e of events) {
    if (!seen.has(e.id)) {
      seen.add(e.id);
      out.push(e);
    }
  }
  return out;
}

export function sequenceGap(
  last: number | null,
  next: number,
): { hasGap: boolean; missedCount: number } {
  if (last === null) return { hasGap: false, missedCount: 0 };
  const expected = last + 1;
  if (next === expected) return { hasGap: false, missedCount: 0 };
  if (next < expected) return { hasGap: false, missedCount: 0 };
  return { hasGap: true, missedCount: next - expected };
}
