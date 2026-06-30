/**
 * W91-A: Notifications Preferences Engine — matrix
 *
 * Resolves "should this notification fire on this channel?" given a
 * NotificationPrefs, a Channel, a Category, and a current MinutesSinceMidnight.
 */

import {
  type Category,
  type Channel,
  type ChannelMatrix,
  type MatrixCell,
  type NotificationPrefs,
  CellState,
} from './types';
import { isInQuietHours } from './schedule';

// ──────────────────────────────────────────────────────────────────────────
// Public decision API
// ──────────────────────────────────────────────────────────────────────────

export interface DeliveryDecision {
  readonly allow: boolean;
  readonly reason:
    | 'allowed'
    | 'global-pause'
    | 'cell-off'
    | 'cell-quiet-only'
    | 'quiet-hours'
    | 'unknown-channel'
    | 'unknown-category';
  readonly cell: MatrixCell | null;
}

/** Decide whether a notification is allowed on (channel, category) right now. */
export function decideDelivery(
  prefs: NotificationPrefs,
  channel: Channel,
  category: Category,
  now: number, // MinutesSinceMidnight as raw number
): DeliveryDecision {
  if (prefs.globalPause) {
    return { allow: false, reason: 'global-pause', cell: null };
  }

  const row = prefs.matrix[channel];
  if (!row) {
    return { allow: false, reason: 'unknown-channel', cell: null };
  }
  const cell = row[category];
  if (!cell) {
    return { allow: false, reason: 'unknown-category', cell: null };
  }

  if (cell.state === 'off') {
    return { allow: false, reason: 'cell-off', cell };
  }
  if (cell.state === 'quiet-only') {
    const inQuiet = isInQuietHours(now as never, prefs.quietHours);
    if (inQuiet) {
      return { allow: true, reason: 'quiet-hours', cell };
    }
    return { allow: false, reason: 'cell-quiet-only', cell };
  }
  // state === 'on'
  // If we're inside quiet hours, allow but tag the reason so callers can
  // optionally suppress (e.g. buffer into digest).
  const inQuiet = isInQuietHours(now as never, prefs.quietHours);
  return inQuiet
    ? { allow: true, reason: 'quiet-hours', cell }
    : { allow: true, reason: 'allowed', cell };
}

// ──────────────────────────────────────────────────────────────────────────
// Matrix-level helpers
// ──────────────────────────────────────────────────────────────────────────

export function getCell(
  matrix: ChannelMatrix,
  channel: Channel,
  category: Category,
): MatrixCell | null {
  return matrix[channel]?.[category] ?? null;
}

export function countActiveCells(matrix: ChannelMatrix): number {
  let n = 0;
  for (const channel of Object.keys(matrix) as Channel[]) {
    const row = matrix[channel];
    if (!row) continue;
    for (const category of Object.keys(row) as Category[]) {
      const c = row[category];
      if (c && c.state === 'on') n += 1;
    }
  }
  return n;
}

export function listEnabledChannelsFor(
  matrix: ChannelMatrix,
  category: Category,
): readonly Channel[] {
  const out: Channel[] = [];
  for (const channel of Object.keys(matrix) as Channel[]) {
    const row = matrix[channel];
    const cell = row?.[category];
    if (cell && cell.state !== 'off') {
      out.push(channel);
    }
  }
  return Object.freeze(out);
}

// ──────────────────────────────────────────────────────────────────────────
// Matrix mutation guard (defense-in-depth — engine callers go through factory.ts)
// ──────────────────────────────────────────────────────────────────────────

export function assertMatrixImmutable(matrix: ChannelMatrix): boolean {
  try {
    Object.freeze(matrix);
    for (const channel of Object.keys(matrix) as Channel[]) {
      const row = matrix[channel];
      if (!row) continue;
      Object.freeze(row);
      for (const category of Object.keys(row) as Category[]) {
        Object.freeze(row[category]);
      }
    }
    return true;
  } catch {
    return false;
  }
}

// Sentinel for spec invariant checks (mirrors W89/W90 engine sentinels).
export const __matrixPositiveOnly = true;

// Re-export CellState for convenience at the module surface
export { CellState };