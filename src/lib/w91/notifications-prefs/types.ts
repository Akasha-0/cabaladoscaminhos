/**
 * W91-A: Notifications Preferences Engine — types
 *
 * Sacred-cultural compliance:
 *  - Copy: PT-BR only (display strings live in callers; this file is type-only)
 *  - Banned vocab ABSENT: amarração, amarre, vinculação, vincular, prejudicar
 *  - 7 tradição symbols are NOT stored here — they are referenced in UI copy only
 *
 * Design constraints:
 *  - All types are deep-readonly where possible; arrays are `readonly T[]`
 *  - Branded primitives prevent accidental string mixups (Channel vs Category)
 *  - No Date/Time I/O — engines accept `MinutesSinceMidnight` to stay pure
 */

// ──────────────────────────────────────────────────────────────────────────
// Branded primitives — make string mixups a type error
// ──────────────────────────────────────────────────────────────────────────

export type Brand<T, B extends string> = T & { readonly __brand: B };

/** Notification delivery channel: push | email | sms | in-app. */
export type Channel = Brand<string, 'Channel'>;

/** Notification category: a logical grouping of triggers (e.g. "live", "dm"). */
export type Category = Brand<string, 'Category'>;

/** LGPD consent version stamp (e.g. "2026-06-30"). */
export type ConsentVersion = Brand<string, 'ConsentVersion'>;

/** ISO 4217 currency code (currently only "BRL" is supported, but typed broadly). */
export type Locale = Brand<string, 'Locale'>;

/** Minutes since midnight in user's local TZ. 0..1439. */
export type MinutesSinceMidnight = Brand<number, 'MinutesSinceMidnight'>;

/** Quiet-hours window — inclusive start, exclusive end. */
export interface QuietHoursWindow {
  readonly start: MinutesSinceMidnight;
  readonly end: MinutesSinceMidnight;
  /** When true, window wraps past midnight (e.g. 22:00→06:00). */
  readonly wrapsMidnight: boolean;
}

// ──────────────────────────────────────────────────────────────────────────
// Channel + Category registries
// ──────────────────────────────────────────────────────────────────────────

/** All supported delivery channels. Order matters for UI rendering. */
export const SUPPORTED_CHANNELS: readonly Channel[] = Object.freeze([
  toChannel('in-app'),
  toChannel('push'),
  toChannel('email'),
  toChannel('sms'),
] as const);

/** All supported notification categories. Order matters for UI rendering. */
export const SUPPORTED_CATEGORIES: readonly Category[] = Object.freeze([
  toCategory('live'),
  toCategory('dm'),
  toCategory('comment'),
  toCategory('reaction'),
  toCategory('tradition-reminder'),
  toCategory('system'),
] as const);

// ──────────────────────────────────────────────────────────────────────────
// Matrix cell: per-channel x per-category settings
// ──────────────────────────────────────────────────────────────────────────

export type CellState = 'on' | 'off' | 'quiet-only';

export interface MatrixCell {
  readonly state: CellState;
  /** Optional override caption (e.g. "Apenas ao vivo"). */
  readonly caption?: string;
}

export type ChannelMatrix = Readonly<Record<Channel, Readonly<Record<Category, MatrixCell>>>>;

// ──────────────────────────────────────────────────────────────────────────
// Per-category caps
// ──────────────────────────────────────────────────────────────────────────

export interface CategoryCaps {
  /** Max notifications per category in `windowMinutes` rolling window. */
  readonly maxPerWindow: number;
  /** Window length in minutes (e.g. 60 for hourly cap). */
  readonly windowMinutes: number;
}

export type CapsByCategory = Readonly<Record<Category, CategoryCaps>>;

// ──────────────────────────────────────────────────────────────────────────
// Top-level user preferences
// ──────────────────────────────────────────────────────────────────────────

export interface NotificationPrefs {
  /** Stable user key (anonymous device id is fine; never store email here). */
  readonly userKey: string;
  readonly locale: Locale;
  readonly consentVersion: ConsentVersion;
  readonly consentAcceptedAtIso: string;

  readonly matrix: ChannelMatrix;
  readonly quietHours: QuietHoursWindow | null;
  readonly caps: CapsByCategory;
  /** True when the user has globally paused notifications. */
  readonly globalPause: boolean;
  /** True when the user wants a daily digest summary instead of individual pings. */
  readonly digestMode: boolean;
}

// ──────────────────────────────────────────────────────────────────────────
// Brand constructors (runtime-checked where possible)
// ──────────────────────────────────────────────────────────────────────────

function isMinutesValue(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 1439;
}

export function toChannel(value: string): Channel {
  if (value.length === 0) {
    throw new Error('Channel must be non-empty');
  }
  return value as Channel;
}

export function toCategory(value: string): Category {
  if (value.length === 0) {
    throw new Error('Category must be non-empty');
  }
  return value as Category;
}

export function toConsentVersion(value: string): ConsentVersion {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`ConsentVersion must match YYYY-MM-DD, got: ${value}`);
  }
  return value as ConsentVersion;
}

export function toLocale(value: string): Locale {
  if (value.length === 0) {
    throw new Error('Locale must be non-empty');
  }
  return value as Locale;
}

export function toMinutesSinceMidnight(n: number): MinutesSinceMidnight {
  if (!isMinutesValue(n)) {
    throw new Error(`MinutesSinceMidnight must be integer 0..1439, got: ${n}`);
  }
  return n as MinutesSinceMidnight;
}

// ──────────────────────────────────────────────────────────────────────────
// Frozen constants — module surface must be immutable
// ──────────────────────────────────────────────────────────────────────────

export const CONSENT_VERSION_CURRENT: ConsentVersion = toConsentVersion('2026-06-30');

export const DEFAULT_LOCALE: Locale = toLocale('pt-BR');

export const DEFAULT_QUIET_HOURS: QuietHoursWindow = Object.freeze({
  start: toMinutesSinceMidnight(22 * 60),
  end: toMinutesSinceMidnight(7 * 60),
  wrapsMidnight: true,
});

export const DEFAULT_CAPS: CapsByCategory = Object.freeze({
  [toCategory('live')]: Object.freeze({ maxPerWindow: 5, windowMinutes: 60 }),
  [toCategory('dm')]: Object.freeze({ maxPerWindow: 20, windowMinutes: 60 }),
  [toCategory('comment')]: Object.freeze({ maxPerWindow: 10, windowMinutes: 60 }),
  [toCategory('reaction')]: Object.freeze({ maxPerWindow: 30, windowMinutes: 60 }),
  [toCategory('tradition-reminder')]: Object.freeze({ maxPerWindow: 2, windowMinutes: 60 }),
  [toCategory('system')]: Object.freeze({ maxPerWindow: 5, windowMinutes: 60 }),
} as CapsByCategory);