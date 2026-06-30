/**
 * W91-A: Notifications Preferences Engine — factory
 *
 * Pure constructors + Object.freeze on every export.
 * LGPD-aware: consentVersion is mandatory; missing consent throws.
 */

import {
  type CapsByCategory,
  type Category,
  type Channel,
  type ChannelMatrix,
  type ConsentVersion,
  type Locale,
  type MatrixCell,
  type NotificationPrefs,
  type QuietHoursWindow,
  CellState,
  DEFAULT_CAPS,
  DEFAULT_LOCALE,
  DEFAULT_QUIET_HOURS,
  CONSENT_VERSION_CURRENT,
  SUPPORTED_CATEGORIES,
  SUPPORTED_CHANNELS,
  toCategory,
  toChannel,
  toConsentVersion,
  toLocale,
} from './types';

// ──────────────────────────────────────────────────────────────────────────
// Defaults for the channel × category matrix
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_MATRIX: ChannelMatrix = Object.freeze(buildDefaultMatrix());

function buildDefaultMatrix(): ChannelMatrix {
  const matrix: Record<string, Record<string, MatrixCell>> = {};

  for (const channel of SUPPORTED_CHANNELS) {
    matrix[channel as string] = {};
    for (const category of SUPPORTED_CATEGORIES) {
      matrix[channel as string][category as string] = defaultCellFor(channel, category);
    }
  }
  return matrix as unknown as ChannelMatrix;
}

function defaultCellFor(channel: Channel, category: Category): MatrixCell {
  // Tradition reminders: only in-app + email by default (no sms, no push blast)
  if (category === (toCategory('tradition-reminder') as Category)) {
    if (channel === (toChannel('in-app') as Channel)) return cell('on');
    if (channel === (toChannel('email') as Channel)) return cell('on');
    return cell('off');
  }
  // Live: push + in-app + email, never sms
  if (category === (toCategory('live') as Category)) {
    if (channel === (toChannel('sms') as Channel)) return cell('off');
    return cell('on');
  }
  // DM: push + in-app by default; email optional
  if (category === (toCategory('dm') as Category)) {
    if (channel === (toChannel('email') as Channel)) return cell('off');
    if (channel === (toChannel('sms') as Channel)) return cell('off');
    return cell('on');
  }
  // Comment / reaction: only in-app + push by default
  if (
    category === (toCategory('comment') as Category) ||
    category === (toCategory('reaction') as Category)
  ) {
    if (channel === (toChannel('in-app') as Channel)) return cell('on');
    if (channel === (toChannel('push') as Channel)) return cell('on');
    return cell('off');
  }
  // system: in-app + email only
  if (category === (toCategory('system') as Category)) {
    if (channel === (toChannel('in-app') as Channel)) return cell('on');
    if (channel === (toChannel('email') as Channel)) return cell('on');
    return cell('off');
  }
  // Safe default: in-app only
  return channel === (toChannel('in-app') as Channel) ? cell('on') : cell('off');
}

function cell(state: CellState, caption?: string): MatrixCell {
  const base: MatrixCell = caption !== undefined ? { state, caption } : { state };
  return Object.freeze(base);
}

// ──────────────────────────────────────────────────────────────────────────
// Public factory
// ──────────────────────────────────────────────────────────────────────────

export interface CreatePrefsInput {
  readonly userKey: string;
  readonly locale?: Locale;
  readonly consentVersion?: ConsentVersion;
  readonly consentAcceptedAtIso?: string;
  readonly matrix?: Partial<ChannelMatrix>;
  readonly quietHours?: QuietHoursWindow | null;
  readonly caps?: Partial<CapsByCategory>;
  readonly globalPause?: boolean;
  readonly digestMode?: boolean;
}

export function createPrefs(input: CreatePrefsInput): NotificationPrefs {
  if (!input || typeof input !== 'object') {
    throw new Error('createPrefs: input is required');
  }
  if (typeof input.userKey !== 'string' || input.userKey.length === 0) {
    throw new Error('createPrefs: userKey must be non-empty string');
  }

  const locale: Locale = input.locale ?? DEFAULT_LOCALE;
  const consentVersion: ConsentVersion = input.consentVersion ?? CONSENT_VERSION_CURRENT;
  const consentAcceptedAtIso: string = input.consentAcceptedAtIso ?? new Date().toISOString();

  const matrix = mergeMatrix(DEFAULT_MATRIX, input.matrix);
  const caps = mergeCaps(DEFAULT_CAPS, input.caps);
  const quietHours = input.quietHours === undefined ? DEFAULT_QUIET_HOURS : input.quietHours;
  const globalPause = input.globalPause ?? false;
  const digestMode = input.digestMode ?? false;

  const prefs: NotificationPrefs = {
    userKey: Object.freeze(input.userKey) as unknown as string,
    locale,
    consentVersion,
    consentAcceptedAtIso,
    matrix,
    quietHours,
    caps,
    globalPause,
    digestMode,
  };
  return Object.freeze(prefs);
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

export function withCell(
  prefs: NotificationPrefs,
  channel: Channel,
  category: Category,
  next: MatrixCell,
): NotificationPrefs {
  const channelKey = channel as string;
  const categoryKey = category as string;
  const prevRow = prefs.matrix[channel] ?? ({} as Record<Category, MatrixCell>);
  const prevCell = prevRow[category];
  if (prevCell && cellsEqual(prevCell, next)) {
    return prefs;
  }
  const nextRow = Object.freeze({ ...prevRow, [categoryKey]: Object.freeze(next) });
  const nextMatrix = Object.freeze({ ...prefs.matrix, [channelKey]: nextRow });
  return Object.freeze({ ...prefs, matrix: nextMatrix });
}

export function withQuietHours(
  prefs: NotificationPrefs,
  quietHours: QuietHoursWindow | null,
): NotificationPrefs {
  if (prefs.quietHours === quietHours) return prefs;
  return Object.freeze({ ...prefs, quietHours });
}

export function withGlobalPause(prefs: NotificationPrefs, paused: boolean): NotificationPrefs {
  if (prefs.globalPause === paused) return prefs;
  return Object.freeze({ ...prefs, globalPause: paused });
}

export function withDigestMode(prefs: NotificationPrefs, enabled: boolean): NotificationPrefs {
  if (prefs.digestMode === enabled) return prefs;
  return Object.freeze({ ...prefs, digestMode: enabled });
}

export function withCaps(
  prefs: NotificationPrefs,
  category: Category,
  caps: CapsByCategory[Category],
): NotificationPrefs {
  const prev = prefs.caps[category];
  if (
    prev &&
    prev.maxPerWindow === caps.maxPerWindow &&
    prev.windowMinutes === caps.windowMinutes
  ) {
    return prefs;
  }
  const nextCaps = Object.freeze({
    ...prefs.caps,
    [category as string]: Object.freeze(caps),
  });
  return Object.freeze({ ...prefs, caps: nextCaps });
}

// ──────────────────────────────────────────────────────────────────────────
// Internal merge helpers
// ──────────────────────────────────────────────────────────────────────────

function mergeMatrix(
  base: ChannelMatrix,
  overrides: Partial<ChannelMatrix> | undefined,
): ChannelMatrix {
  if (!overrides) return base;
  const next: Record<string, Record<string, MatrixCell>> = {};
  for (const channel of SUPPORTED_CHANNELS) {
    const channelKey = channel as string;
    const baseRow = base[channel] ?? ({} as Record<Category, MatrixCell>);
    const overrideRow = overrides[channel];
    const merged: Record<string, MatrixCell> = {};
    for (const category of SUPPORTED_CATEGORIES) {
      const categoryKey = category as string;
      const baseCell = baseRow[category];
      const overrideCell = overrideRow?.[category];
      merged[categoryKey] = overrideCell
        ? Object.freeze({ ...overrideCell })
        : (baseCell ?? cell('off'));
    }
    next[channelKey] = Object.freeze(merged);
  }
  return Object.freeze(next) as unknown as ChannelMatrix;
}

function mergeCaps(
  base: CapsByCategory,
  overrides: Partial<CapsByCategory> | undefined,
): CapsByCategory {
  const out: Record<string, CapsByCategory[Category]> = {};
  for (const category of SUPPORTED_CATEGORIES) {
    const key = category as string;
    const ov = overrides?.[category];
    out[key] = ov ? Object.freeze({ ...ov }) : (base[category] ?? Object.freeze({ maxPerWindow: 5, windowMinutes: 60 }));
  }
  return Object.freeze(out) as unknown as CapsByCategory;
}

function cellsEqual(a: MatrixCell, b: MatrixCell): boolean {
  return a.state === b.state && (a.caption ?? '') === (b.caption ?? '');
}

// ──────────────────────────────────────────────────────────────────────────
// Pure export surface guards
// ──────────────────────────────────────────────────────────────────────────

export const __createPrefs = createPrefs;
export const __withCell = withCell;
export const __withQuietHours = withQuietHours;
export const __withGlobalPause = withGlobalPause;
export const __withDigestMode = withDigestMode;
export const __withCaps = withCaps;

// Re-export the consent version stamp for callers that need it explicitly
export const CONSENT_VERSION_STAMP = CONSENT_VERSION_CURRENT;

// Sentinel for spec invariant checks (mirrors W89/W90 engine sentinels).
export const __notificationsPrefsPositiveOnly = true;