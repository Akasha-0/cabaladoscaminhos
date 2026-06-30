/**
 * W91-A: Notifications Preferences Engine — schedule
 *
 * Pure functions for quiet-hours + delivery-window math.
 * Inputs are `MinutesSinceMidnight` (no Date) so this module stays pure and
 * trivially testable.
 */

import {
  type MinutesSinceMidnight,
  type QuietHoursWindow,
  toMinutesSinceMidnight,
} from './types';

// ──────────────────────────────────────────────────────────────────────────
// Quiet-hours predicate
// ──────────────────────────────────────────────────────────────────────────

/** True iff `at` falls inside the quiet-hours window. */
export function isInQuietHours(at: MinutesSinceMidnight, window: QuietHoursWindow | null): boolean {
  if (window === null) return false;
  const a = at as unknown as number;
  const s = window.start as unknown as number;
  const e = window.end as unknown as number;
  if (window.wrapsMidnight) {
    return a >= s || a < e;
  }
  return a >= s && a < e;
}

// ──────────────────────────────────────────────────────────────────────────
// Delivery window math
// ──────────────────────────────────────────────────────────────────────────

export interface DeliveryWindowResult {
  readonly allowed: boolean;
  readonly reason: 'allowed' | 'global-pause' | 'digest-mode' | 'quiet-hours' | 'outside-window';
  readonly nextAllowedAt: MinutesSinceMidnight | null;
}

/** Compute the next minute the user is "allowed" to receive a notification. */
export function nextDeliveryWindow(
  at: MinutesSinceMidnight,
  window: QuietHoursWindow | null,
  opts: { globalPause: boolean; digestMode: boolean },
): DeliveryWindowResult {
  if (opts.globalPause) {
    return {
      allowed: false,
      reason: 'global-pause',
      nextAllowedAt: nextQuietEnd(at, window),
    };
  }
  if (opts.digestMode) {
    return {
      allowed: false,
      reason: 'digest-mode',
      nextAllowedAt: nextQuietEnd(at, window),
    };
  }
  if (isInQuietHours(at, window)) {
    return {
      allowed: false,
      reason: 'quiet-hours',
      nextAllowedAt: nextQuietEnd(at, window),
    };
  }
  return { allowed: true, reason: 'allowed', nextAllowedAt: null };
}

/** Compute when quiet hours end starting from `at`. */
export function nextQuietEnd(
  at: MinutesSinceMidnight,
  window: QuietHoursWindow | null,
): MinutesSinceMidnight | null {
  if (window === null) return null;
  const a = at as unknown as number;
  const s = window.start as unknown as number;
  const e = window.end as unknown as number;
  if (!isInQuietHours(at, window)) {
    // Already allowed; the "next" quiet end is at the end of the next quiet block.
    if (window.wrapsMidnight) {
      // Next end is e (tomorrow at e minutes after midnight).
      return e >= a ? toMinutesSinceMidnight(e) : toMinutesSinceMidnight(s);
    }
    return s >= a ? toMinutesSinceMidnight(s) : toMinutesSinceMidnight(e);
  }
  // Currently inside quiet hours → end is `e` of today.
  return toMinutesSinceMidnight(e);
}

// ──────────────────────────────────────────────────────────────────────────
// Display helpers (PT-BR)
// ──────────────────────────────────────────────────────────────────────────

/** Format `MinutesSinceMidnight` as "HH:MM" (24-hour). */
export function formatClock(value: MinutesSinceMidnight): string {
  const v = value as unknown as number;
  const hh = Math.floor(v / 60).toString().padStart(2, '0');
  const mm = (v % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Parse "HH:MM" → `MinutesSinceMidnight`. Throws on invalid input. */
export function parseClock(text: string): MinutesSinceMidnight {
  if (!/^\d{1,2}:\d{2}$/.test(text)) {
    throw new Error(`parseClock: expected HH:MM, got "${text}"`);
  }
  const [hhStr, mmStr] = text.split(':');
  const hh = Number.parseInt(hhStr as string, 10);
  const mm = Number.parseInt(mmStr as string, 10);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
    throw new Error(`parseClock: out of range, got "${text}"`);
  }
  return toMinutesSinceMidnight(hh * 60 + mm);
}

/** Build a default quiet-hours window from "HH:MM" start/end strings. */
export function quietHoursFromClock(
  start: string,
  end: string,
): QuietHoursWindow {
  const s = parseClock(start);
  const e = parseClock(end);
  const wrapsMidnight = (s as unknown as number) >= (e as unknown as number);
  return { start: s, end: e, wrapsMidnight };
}