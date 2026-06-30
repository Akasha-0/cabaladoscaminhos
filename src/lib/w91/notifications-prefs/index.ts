/**
 * W91-A: Notifications Preferences Engine — barrel
 *
 * Single import surface for the engine. UI / pages should import from here.
 * No React, no DOM, no I/O.
 */

export * from './types';
export * from './factory';
export * from './schedule';
export * from './matrix';
export * from './throttle';

// Explicit re-exports (named) so downstream ESM consumers see them
// even when module-resolution heuristics drop wildcard re-exports.
export {
  CONSENT_VERSION_CURRENT,
  DEFAULT_LOCALE,
  DEFAULT_QUIET_HOURS,
  DEFAULT_CAPS,
  SUPPORTED_CHANNELS,
  SUPPORTED_CATEGORIES,
  toChannel,
  toCategory,
  toConsentVersion,
  toLocale,
  toMinutesSinceMidnight,
  type Brand,
  type Channel,
  type Category,
  type ConsentVersion,
  type Locale,
  type MinutesSinceMidnight,
  type QuietHoursWindow,
  type MatrixCell,
  type ChannelMatrix,
  type CapsByCategory,
  type CellState,
  type NotificationPrefs,
  type ThrottleBucket,
  type ThrottleState,
} from './types';
export {
  createPrefs,
  withCell,
  withQuietHours,
  withGlobalPause,
  withDigestMode,
  withCaps,
  type CreatePrefsInput,
  CONSENT_VERSION_STAMP,
} from './factory';
export {
  isInQuietHours,
  nextDeliveryWindow,
  nextQuietEnd,
  formatClock,
  parseClock,
  quietHoursFromClock,
  type DeliveryWindowResult,
} from './schedule';
export {
  decideDelivery,
  getCell,
  countActiveCells,
  listEnabledChannelsFor,
  assertMatrixImmutable,
  type DeliveryDecision,
  __matrixPositiveOnly,
} from './matrix';
export {
  emptyThrottleState,
  recordDelivery,
  checkThrottle,
  bucketFor,
  totalActiveBuckets,
  LIVE_CATEGORY,
  type ThrottleBucket,
  type ThrottleState,
  type ThrottleDecision,
  __throttlePositiveOnly,
} from './throttle';

// Sentinels (re-exported so spec can assert presence in one place).
export const __W91A_NOTIFICATIONS_PREFS_ENGINE_LOADED = true;
export const __W91A_POSITIVE_ONLY = true;
export const __W91A_LGPD_GATED = true;
export const __W91A_MOBILE_FIRST = true;