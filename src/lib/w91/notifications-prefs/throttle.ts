/**
 * W91-A: Notifications Preferences Engine — throttle
 *
 * Pure rolling-window frequency caps. Inputs are timestamps as plain numbers
 * (MinutesSinceMidnight for "since midnight" or epoch ms for "since epoch"),
 * so the engine has zero Date/Time I/O.
 */

import {
  type CapsByCategory,
  type Category,
  type NotificationPrefs,
  toCategory,
} from './types';

// ──────────────────────────────────────────────────────────────────────────
// Rolling-window state
// ──────────────────────────────────────────────────────────────────────────

export interface ThrottleBucket {
  /** History of delivery timestamps within the rolling window (ascending). */
  readonly timestamps: readonly number[];
  /** Window length in the SAME unit as the timestamps. */
  readonly windowMinutes: number;
  readonly cap: number;
}

export type ThrottleState = Readonly<Record<string, ThrottleBucket>>;

export function emptyThrottleState(prefs: NotificationPrefs): ThrottleState {
  const out: Record<string, ThrottleBucket> = {};
  for (const category of Object.keys(prefs.caps) as Category[]) {
    const cap = prefs.caps[category];
    out[category as string] = Object.freeze({
      timestamps: Object.freeze([]),
      windowMinutes: cap.windowMinutes,
      cap: cap.maxPerWindow,
    });
  }
  return Object.freeze(out);
}

// ──────────────────────────────────────────────────────────────────────────
// Record + check
// ──────────────────────────────────────────────────────────────────────────

export interface ThrottleDecision {
  readonly allow: boolean;
  readonly remaining: number;
  readonly reason: 'allowed' | 'cap-exceeded' | 'unknown-category';
  readonly resetAt: number | null;
}

/** Record a delivery attempt. Returns the new state and the decision. */
export function recordDelivery(
  state: ThrottleState,
  category: Category,
  now: number,
  caps: CapsByCategory,
): { state: ThrottleState; decision: ThrottleDecision } {
  const key = category as string;
  const bucket = state[key];
  const cap = caps[category];
  if (!bucket || !cap) {
    return {
      state,
      decision: { allow: false, remaining: 0, reason: 'unknown-category', resetAt: null },
    };
  }
  const cutoff = now - cap.windowMinutes;
  const trimmed = bucket.timestamps.filter((t) => t > cutoff);
  if (trimmed.length >= cap.maxPerWindow) {
    const oldest = trimmed[0] ?? now;
    const resetAt = oldest + cap.windowMinutes;
    return {
      state,
      decision: { allow: false, remaining: 0, reason: 'cap-exceeded', resetAt },
    };
  }
  const nextTimestamps = Object.freeze([...trimmed, now]);
  const nextBucket: ThrottleBucket = Object.freeze({
    timestamps: nextTimestamps,
    windowMinutes: bucket.windowMinutes,
    cap: bucket.cap,
  });
  const nextState: ThrottleState = Object.freeze({
    ...state,
    [key]: nextBucket,
  });
  return {
    state: nextState,
    decision: {
      allow: true,
      remaining: cap.maxPerWindow - nextTimestamps.length,
      reason: 'allowed',
      resetAt: null,
    },
  };
}

/** Check without recording. */
export function checkThrottle(
  state: ThrottleState,
  category: Category,
  now: number,
  caps: CapsByCategory,
): ThrottleDecision {
  const bucket = state[category as string];
  const cap = caps[category];
  if (!bucket || !cap) {
    return { allow: false, remaining: 0, reason: 'unknown-category', resetAt: null };
  }
  const cutoff = now - cap.windowMinutes;
  const trimmed = bucket.timestamps.filter((t) => t > cutoff);
  if (trimmed.length >= cap.maxPerWindow) {
    const oldest = trimmed[0] ?? now;
    return {
      allow: false,
      remaining: 0,
      reason: 'cap-exceeded',
      resetAt: oldest + cap.windowMinutes,
    };
  }
  return {
    allow: true,
    remaining: cap.maxPerWindow - trimmed.length - 1,
    reason: 'allowed',
    resetAt: null,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

export function bucketFor(state: ThrottleState, category: Category): ThrottleBucket | null {
  return state[category as string] ?? null;
}

export function totalActiveBuckets(state: ThrottleState): number {
  let n = 0;
  for (const key of Object.keys(state)) {
    const b = state[key];
    if (b && b.timestamps.length > 0) n += 1;
  }
  return n;
}

// Sentinel for spec invariant checks (mirrors W89/W90 engine sentinels).
export const __throttlePositiveOnly = true;

// Default category helper — re-exported so callers can `import { LIVE } from 'throttle'`.
export const LIVE_CATEGORY = toCategory('live');