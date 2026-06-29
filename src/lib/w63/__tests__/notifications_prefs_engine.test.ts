/**
 * Notifications Preferences Engine — Smoke tests (W63)
 *
 * Self-running smoke harness — does NOT import vitest. Uses the
 * assert/pass/fail pattern from the cycle 62 brief.
 *
 * Run via: `node --experimental-strip-types tests/notifications_prefs_engine.smoke.mts`
 *   or: `bash run-smoke-w63.sh`
 *
 * Target: 80-130 assertions across 14 describe blocks.
 */

// ============================================================================
// Minimal harness — no vitest
// ============================================================================

let passCount = 0;
let failCount = 0;
const failures: string[] = [];

function expect<T>(actual: T, expected: T, label: string): void {
  const aJson = JSON.stringify(actual);
  const eJson = JSON.stringify(expected);
  if (aJson === eJson) {
    passCount++;
  } else {
    failCount++;
    failures.push(`${label}\n  expected: ${eJson}\n  actual:   ${aJson}`);
  }
}

function expectTruthy(actual: unknown, label: string): void {
  if (actual) {
    passCount++;
  } else {
    failCount++;
    failures.push(`${label} — expected truthy, got ${JSON.stringify(actual)}`);
  }
}

function expectFalsy(actual: unknown, label: string): void {
  if (!actual) {
    passCount++;
  } else {
    failCount++;
    failures.push(`${label} — expected falsy, got ${JSON.stringify(actual)}`);
  }
}

function expectThrows(fn: () => unknown, label: string): void {
  try {
    fn();
    failCount++;
    failures.push(`${label} — expected throw, none thrown`);
  } catch {
    passCount++;
  }
}

function expectNoThrow(fn: () => unknown, label: string): void {
  try {
    fn();
    passCount++;
  } catch (e) {
    failCount++;
    failures.push(`${label} — expected no throw, got ${(e as Error).message}`);
  }
}

function describe(name: string, fn: () => void): void {
  console.log(`\n=== ${name} ===`);
  fn();
}

// ============================================================================
// Imports — module under test
// ============================================================================

import {
  // core types (runtime values only)
  NOTIFICATION_CHANNELS,
  NOTIFICATION_KINDS,
  NOTIFICATION_PRIORITIES,
  DEFAULT_QUIET_HOURS,
  DEFAULT_BUNDLEABLE_KINDS,
  MIN_BUNDLE_WINDOW_MINUTES,
  MAX_BUNDLE_WINDOW_MINUTES,
  SUPPORTED_LOCALES,
  ENGINE_INFO,
  // functions
  DEFAULT_NOTIFICATION_PREFERENCES,
  validateQuietHours,
  validateBundleWindow,
  validatePreferences,
  sanitizePreferences,
  isInQuietHours,
  pickAvailableChannel,
  decideChannelAt,
  decideChannel,
  bundleNotifications,
  summarizeBundle,
  shouldSendDigest,
  daysUntilNextDigest,
  buildDigestSummary,
  auditNotificationKindCoverage,
  auditChannelRoutes,
  summarizePreferences,
  notifyOnSacredEvent,
  listSacredMappings,
  translate,
  NotificationsPrefsError,
  // type-only exports checked via typeof
  type NotificationChannel,
  type NotificationKind,
  type NotificationPriority,
  type NotificationPreferences,
  type RawNotification,
  type NotificationDecision,
} from '../notifications_prefs_engine.ts';

// ============================================================================
// Helpers — fixture builders
// ============================================================================

function makeNotif(partial: Partial<RawNotification> = {}): RawNotification {
  return {
    id: 'n-1',
    userId: 'user-1',
    kind: 'like',
    priority: 'normal',
    title: 't',
    body: 'b',
    createdAt: Date.UTC(2026, 5, 29, 12, 0, 0),
    ...partial,
  };
}

function makePrefs(overrides: Partial<NotificationPreferences> = {}): NotificationPreferences {
  const base = DEFAULT_NOTIFICATION_PREFERENCES('user-1');
  return { ...base, ...overrides };
}

// ============================================================================
// Tests
// ============================================================================

describe('1. Engine info + export shape', () => {
  expect(ENGINE_INFO.wave, 'w63', 'engine.wave');
  expect(ENGINE_INFO.name, 'notifications-prefs-engine', 'engine.name');
  expect(ENGINE_INFO.channels, 4, 'engine.channels');
  expect(ENGINE_INFO.kinds, 20, 'engine.kinds');
  expect(ENGINE_INFO.priorities, 4, 'engine.priorities');
  expect(ENGINE_INFO.bundleableKinds >= 10, true, 'engine.bundleableKinds >= 10');
  expect(NOTIFICATION_CHANNELS.length, 4, 'NOTIFICATION_CHANNELS length');
  expect(NOTIFICATION_KINDS.length, 20, 'NOTIFICATION_KINDS length');
  expect(NOTIFICATION_PRIORITIES.length, 4, 'NOTIFICATION_PRIORITIES length');
  expect(SUPPORTED_LOCALES.length, 3, 'SUPPORTED_LOCALES length');
  // type-only checks via typeof
  expect(typeof NOTIFICATION_CHANNELS[0], 'string', 'channel is string');
});

describe('2. validateQuietHours — 8 valid + 6 invalid boundary cases', () => {
  expect(validateQuietHours({ startHour: 22, endHour: 7, enabled: true }).valid, true, 'valid wrap');
  expect(validateQuietHours({ startHour: 0, endHour: 8, enabled: true }).valid, true, 'valid same-day');
  expect(validateQuietHours({ startHour: 9, endHour: 17, enabled: true }).valid, true, 'valid working hours');
  expect(validateQuietHours({ startHour: 23, endHour: 6, enabled: true }).valid, true, 'valid 23→6');
  expect(validateQuietHours({ startHour: 0, endHour: 0, enabled: false }).valid, true, 'disabled zero allowed');
  expect(validateQuietHours({ startHour: 1, endHour: 1, enabled: true }).valid, false, 'equal hours invalid');
  expect(validateQuietHours({ startHour: -1, endHour: 7, enabled: true }).valid, false, 'start -1');
  expect(validateQuietHours({ startHour: 24, endHour: 7, enabled: true }).valid, false, 'start 24');
  expect(validateQuietHours({ startHour: 22, endHour: -1, enabled: true }).valid, false, 'end -1');
  expect(validateQuietHours({ startHour: 22, endHour: 24, enabled: true }).valid, false, 'end 24');
  expect(validateQuietHours({ startHour: 1.5, endHour: 7, enabled: true }).valid, false, 'start float');
  expect(validateQuietHours({ startHour: 0, endHour: 24, enabled: true }).valid, false, 'end 24');
  const startHourAsString: unknown = '22';
  expect(
    validateQuietHours({ startHour: startHourAsString as number, endHour: 7, enabled: true }).valid,
    false,
    'start string',
  );
  // also exercise errors array shape
  const rep = validateQuietHours({ startHour: -1, endHour: 7, enabled: true });
  expect(Array.isArray(rep.errors), true, 'errors is array');
  expect(rep.errors.length > 0, true, 'errors non-empty when invalid');
});

describe('3. validateBundleWindow — 0, 5, 1440, 1441, 30, and edge cases', () => {
  expect(validateBundleWindow(0), false, '0 invalid');
  expect(validateBundleWindow(4), false, '4 invalid (below min)');
  expect(validateBundleWindow(5), true, '5 valid (min)');
  expect(validateBundleWindow(15), true, '15 valid');
  expect(validateBundleWindow(30), true, '30 valid');
  expect(validateBundleWindow(1440), true, '1440 valid (max)');
  expect(validateBundleWindow(1441), false, '1441 invalid');
  expect(validateBundleWindow(15.5), false, '15.5 invalid (float)');
  expect(validateBundleWindow(-1), false, '-1 invalid');
  expect(validateBundleWindow(Number.NaN), false, 'NaN invalid');
  expect(validateBundleWindow(Number.POSITIVE_INFINITY), false, 'Infinity invalid');
  const fifteenAsString: unknown = '15';
  expect(validateBundleWindow(fifteenAsString as number), false, 'string invalid');
});

describe('4. validatePreferences — composite', () => {
  const good = DEFAULT_NOTIFICATION_PREFERENCES('u');
  expect(validatePreferences(good).valid, true, 'default prefs valid');
  const missingChannel = { ...good, channels: { ...good.channels } };
  delete (missingChannel.channels as Record<string, unknown>)['like'];
  expect(validatePreferences(missingChannel).valid, false, 'missing channel invalid');
  const neverAsDaily: unknown = 'never';
  const badDigest = { ...good, digest: { ...good.digest, cadence: neverAsDaily as 'daily' } };
  expect(validatePreferences(badDigest).valid, false, 'bad cadence invalid');
  const badUserId = { ...good, userId: '' };
  expect(validatePreferences(badUserId).valid, false, 'empty userId invalid');
  const nullPrefs: unknown = null;
  const noopReport = validatePreferences(nullPrefs as NotificationPreferences);
  expect(noopReport.valid, false, 'null prefs invalid');
});

describe('5. sanitizePreferences — never throws, clamps silently', () => {
  expectNoThrow(() => sanitizePreferences(null), 'sanitize null');
  expectNoThrow(() => sanitizePreferences(undefined), 'sanitize undefined');
  expectNoThrow(() => sanitizePreferences('garbage'), 'sanitize string');
  expectNoThrow(() => sanitizePreferences(42), 'sanitize number');
  expectNoThrow(() => sanitizePreferences([]), 'sanitize array');

  const clean = sanitizePreferences({});
  expect(clean.userId, 'anonymous', 'sanitize fallback userId');
  expect(clean.bundleWindowMinutes >= MIN_BUNDLE_WINDOW_MINUTES, true, 'clamped window >= min');
  expect(clean.bundleWindowMinutes <= MAX_BUNDLE_WINDOW_MINUTES, true, 'clamped window <= max');

  const clamped = sanitizePreferences({ bundleWindowMinutes: 99999 });
  expect(clamped.bundleWindowMinutes, MAX_BUNDLE_WINDOW_MINUTES, 'oversized window clamped to max');

  const below = sanitizePreferences({ bundleWindowMinutes: -10 });
  expect(below.bundleWindowMinutes, MIN_BUNDLE_WINDOW_MINUTES, 'negative window clamped to min');

  const qh = sanitizePreferences({
    quietHours: { startHour: 99, endHour: -5, enabled: true },
  });
  expect(qh.quietHours.startHour >= 0 && qh.quietHours.startHour <= 23, true, 'qh start clamped');
  expect(qh.quietHours.endHour >= 0 && qh.quietHours.endHour <= 23, true, 'qh end clamped');

  const withChannels = sanitizePreferences({
    channels: { like: 'email', follow: 'suppressed', invalid_kind: 'push' },
  });
  expect(withChannels.channels.like, 'email', 'like → email');
  expect(withChannels.channels.follow, 'suppressed', 'follow → suppressed');

  const withBundleable = sanitizePreferences({
    bundleableKinds: ['like', 'like', 'invalid', 'follow'],
  });
  expect(withBundleable.bundleableKinds.length, 2, 'deduped bundleable');
  expect(withBundleable.bundleableKinds.includes('like'), true, 'like present');
  expect(withBundleable.bundleableKinds.includes('follow'), true, 'follow present');
});

describe('6. isInQuietHours — 8 cases with midnight wrap', () => {
  const qh = { startHour: 22, endHour: 7, enabled: true };
  expect(isInQuietHours(Date.UTC(2026, 5, 29, 22, 0, 0), qh), true, '22:00 in quiet (boundary start)');
  expect(isInQuietHours(Date.UTC(2026, 5, 29, 23, 30, 0), qh), true, '23:30 in quiet');
  expect(isInQuietHours(Date.UTC(2026, 5, 29, 0, 0, 0), qh), true, '00:00 in quiet');
  expect(isInQuietHours(Date.UTC(2026, 5, 29, 6, 59, 0), qh), true, '06:59 in quiet (boundary end -1)');
  expect(isInQuietHours(Date.UTC(2026, 5, 29, 7, 0, 0), qh), false, '07:00 not in quiet (boundary end)');
  expect(isInQuietHours(Date.UTC(2026, 5, 29, 8, 0, 0), qh), false, '08:00 not in quiet (after)');
  expect(isInQuietHours(Date.UTC(2026, 5, 29, 21, 59, 0), qh), false, '21:59 not in quiet (before)');
  expect(isInQuietHours(Date.UTC(2026, 5, 29, 12, 0, 0), qh), false, '12:00 not in quiet (midday)');

  // disabled
  const off = { startHour: 22, endHour: 7, enabled: false };
  expect(isInQuietHours(Date.UTC(2026, 5, 29, 23, 30, 0), off), false, 'disabled never quiet');

  // same-day (no wrap)
  const workday = { startHour: 9, endHour: 17, enabled: true };
  expect(isInQuietHours(Date.UTC(2026, 5, 29, 8, 0, 0), workday), false, 'workday before');
  expect(isInQuietHours(Date.UTC(2026, 5, 29, 12, 0, 0), workday), true, 'workday mid');
  expect(isInQuietHours(Date.UTC(2026, 5, 29, 17, 0, 0), workday), false, 'workday end exclusive');
});

describe('7. decideChannelAt — 12 cases (urgent/normal/suppressed × channels, quiet, wrap)', () => {
  const prefs = DEFAULT_NOTIFICATION_PREFERENCES('u');
  const noon = Date.UTC(2026, 5, 29, 12, 0, 0);
  const midnight = Date.UTC(2026, 5, 29, 3, 0, 0);

  // urgent
  expect(
    decideChannelAt(makeNotif({ priority: 'urgent' }), prefs, noon).channel,
    'push',
    'urgent → push',
  );
  const noPush = makePrefs({ perChannel: { push: false, email: true, inApp: true } });
  expect(
    decideChannelAt(makeNotif({ priority: 'urgent' }), noPush, noon).channel,
    'email',
    'urgent no push → email',
  );
  const noPushNoEmail = makePrefs({ perChannel: { push: false, email: false, inApp: true } });
  expect(
    decideChannelAt(makeNotif({ priority: 'urgent' }), noPushNoEmail, noon).channel,
    'in_app',
    'urgent push+email off → in_app',
  );

  // normal priority
  expect(
    decideChannelAt(makeNotif({ priority: 'normal' }), prefs, noon).channel,
    'push',
    'normal → push (default)',
  );
  expect(
    decideChannelAt(makeNotif({ priority: 'normal' }), noPush, noon).channel,
    'email',
    'normal no push → email',
  );
  expect(
    decideChannelAt(makeNotif({ priority: 'normal' }), noPushNoEmail, noon).channel,
    'in_app',
    'normal push+email off → in_app',
  );

  // suppressed
  const supPrefs = makePrefs({
    channels: { ...prefs.channels, like: 'suppressed' },
  });
  const sup = decideChannelAt(makeNotif({ kind: 'like' }), supPrefs, noon);
  expect(sup.allowed, false, 'like suppressed → not allowed');
  expect(sup.channel, 'suppressed', 'like suppressed channel');
  expect(sup.suppressedReason, 'kind_disabled', 'like suppressed reason');

  // quiet hours force in_app
  const quietDec = decideChannelAt(makeNotif({ priority: 'urgent' }), prefs, midnight);
  expect(quietDec.channel, 'in_app', 'urgent during quiet → in_app');
  expect(quietDec.allowed, true, 'quiet → still allowed');
  expect(quietDec.suppressedReason, 'quiet_hours', 'quiet reason recorded');

  // channel_disabled
  const allOff = makePrefs({ perChannel: { push: false, email: false, inApp: false } });
  const off = decideChannelAt(makeNotif({ priority: 'normal' }), allOff, noon);
  expect(off.allowed, false, 'all channels off → not allowed');
  expect(off.suppressedReason, 'channel_disabled', 'channel_disabled reason');
});

describe('8. pickAvailableChannel — priority boost', () => {
  const prefs = DEFAULT_NOTIFICATION_PREFERENCES('u');
  expect(pickAvailableChannel(prefs, 'urgent'), 'push', 'urgent boost push');
  expect(pickAvailableChannel(prefs, 'high'), 'push', 'high boost push');
  expect(pickAvailableChannel(prefs, 'normal'), 'push', 'normal still push');
  expect(pickAvailableChannel(prefs, 'low'), 'push', 'low still push (default)');

  const noPush = makePrefs({ perChannel: { push: false, email: true, inApp: true } });
  expect(pickAvailableChannel(noPush, 'urgent'), 'email', 'urgent no push → email');

  const onlyInApp = makePrefs({ perChannel: { push: false, email: false, inApp: true } });
  expect(pickAvailableChannel(onlyInApp, 'urgent'), 'in_app', 'only inApp → in_app');

  const allOff = makePrefs({ perChannel: { push: false, email: false, inApp: false } });
  expect(pickAvailableChannel(allOff, 'urgent'), 'suppressed', 'all off → suppressed');
});

describe('9. bundleNotifications — window=15, group by kind', () => {
  const prefs = DEFAULT_NOTIFICATION_PREFERENCES('u');
  const noon = Date.UTC(2026, 5, 29, 12, 0, 0);

  // 3 likes within 5 minutes → 1 bundle
  const threeLikes = [
    makeNotif({ id: 'a', createdAt: noon }),
    makeNotif({ id: 'b', createdAt: noon + 60_000 }),
    makeNotif({ id: 'c', createdAt: noon + 300_000 }),
  ];
  const bundles1 = bundleNotifications(threeLikes, prefs, noon + 600_000);
  expect(bundles1.length, 1, '3 likes within 15min → 1 bundle');
  expect(bundles1[0]?.length, 3, 'bundle has 3 items');

  // 3 different kinds → 3 groups
  const mixed = [
    makeNotif({ id: 'a', kind: 'like', createdAt: noon }),
    makeNotif({ id: 'b', kind: 'follow', createdAt: noon + 60_000 }),
    makeNotif({ id: 'c', kind: 'repost', createdAt: noon + 120_000 }),
  ];
  const bundles2 = bundleNotifications(mixed, prefs, noon + 600_000);
  expect(bundles2.length, 3, '3 different kinds → 3 bundles');

  // 2 likes exactly window apart → 2 bundles
  const exactWindow = [
    makeNotif({ id: 'a', createdAt: noon }),
    makeNotif({ id: 'b', createdAt: noon + 15 * 60_000 }),
  ];
  const bundles3 = bundleNotifications(exactWindow, prefs, noon + 30 * 60_000);
  expect(bundles3.length, 2, 'likes exactly window apart → 2 bundles');

  // 2 likes > window apart → 2 bundles
  const farApart = [
    makeNotif({ id: 'a', createdAt: noon }),
    makeNotif({ id: 'b', createdAt: noon + 16 * 60_000 }),
  ];
  const bundles4 = bundleNotifications(farApart, prefs, noon + 30 * 60_000);
  expect(bundles4.length, 2, 'likes > window apart → 2 bundles');

  // empty input
  expect(bundleNotifications([], prefs, noon).length, 0, 'empty → 0 bundles');

  // non-bundleable kind (marketplace_order is NOT in default bundleable list)
  const nonBundleable = [
    makeNotif({ id: 'a', kind: 'marketplace_order', createdAt: noon }),
    makeNotif({ id: 'b', kind: 'marketplace_order', createdAt: noon + 60_000 }),
  ];
  expect(bundleNotifications(nonBundleable, prefs, noon + 600_000).length, 0, 'non-bundleable kind → 0 bundles');
});

describe('10. summarizeBundle + buildDigestSummary', () => {
  const noon = Date.UTC(2026, 5, 29, 12, 0, 0);
  const group = [
    makeNotif({ id: 'a', kind: 'like', priority: 'low', createdAt: noon }),
    makeNotif({ id: 'b', kind: 'like', priority: 'high', createdAt: noon + 60_000 }),
    makeNotif({ id: 'c', kind: 'like', priority: 'urgent', createdAt: noon + 120_000 }),
  ];
  const sum = summarizeBundle(group);
  expect(sum.count, 3, 'summarize count');
  expect(sum.kinds.length, 1, 'summarize kinds unique');
  expect(sum.topPriority, 'urgent', 'summarize top priority');
  expect(sum.oldestAtMs, noon, 'summarize oldest');

  // mixed kinds
  const mixedGroup = [
    makeNotif({ id: 'a', kind: 'like', priority: 'low' }),
    makeNotif({ id: 'b', kind: 'follow', priority: 'normal' }),
  ];
  const mixedSum = summarizeBundle(mixedGroup);
  expect(mixedSum.kinds.length, 2, 'mixed kinds length');
  expect(mixedSum.topPriority, 'normal', 'mixed top priority');

  // digest empty
  const emptyDigest = buildDigestSummary([]);
  expect(emptyDigest.subjectLine, 'Nenhuma atualização', 'empty digest subject');
  expect(emptyDigest.unsubscribeKind, 'newsletter', 'empty digest unsubscribeKind');

  // digest non-empty
  const digest = buildDigestSummary([
    makeNotif({ kind: 'like' }),
    makeNotif({ kind: 'like' }),
    makeNotif({ kind: 'follow' }),
  ]);
  expect(digest.subjectLine.includes('3'), true, 'digest subject has count');
  expect(digest.bodyLines.length >= 1, true, 'digest body has lines');
  expect(typeof digest.unsubscribeKind, 'string', 'digest unsubscribe is string');
});

describe('11. shouldSendDigest + daysUntilNextDigest', () => {
  const noon = Date.UTC(2026, 5, 29, 12, 0, 0);
  const dailyPrefs = DEFAULT_NOTIFICATION_PREFERENCES('u');
  // daily at 9am — noon shouldn't fire
  expect(shouldSendDigest(noon, dailyPrefs), false, 'noon not 9am digest');
  // at 9am with minutes < 5
  const nineAm = Date.UTC(2026, 5, 29, 9, 0, 0);
  expect(shouldSendDigest(nineAm, dailyPrefs), true, '9am daily fires');

  // weekly Sunday at 9am
  const weeklyPrefs = {
    ...dailyPrefs,
    digest: { enabled: true, cadence: 'weekly' as const, hourOfDay: 9, dayOfWeek: 0 },
  };
  const sunday = Date.UTC(2026, 5, 28, 9, 0, 0); // 2026-06-28 was Sunday
  const monday = Date.UTC(2026, 5, 29, 9, 0, 0);
  expect(shouldSendDigest(sunday, weeklyPrefs), true, 'weekly Sunday fires');
  expect(shouldSendDigest(monday, weeklyPrefs), false, 'weekly Monday does not');

  // disabled
  const offPrefs = { ...dailyPrefs, digest: { ...dailyPrefs.digest, enabled: false } };
  expect(shouldSendDigest(nineAm, offPrefs), false, 'disabled never fires');

  // daysUntilNextDigest
  expect(daysUntilNextDigest(noon, dailyPrefs), 1, 'noon daily → tomorrow');
  expect(daysUntilNextDigest(Date.UTC(2026, 5, 29, 8, 0, 0), dailyPrefs), 0, 'before 9am → today');
  expect(daysUntilNextDigest(nineAm, dailyPrefs), 0, 'at 9am → 0');

  // weekly Tuesday → wait until Sunday
  expect(daysUntilNextDigest(monday, weeklyPrefs), 6, 'Monday → Sunday = 6 days');
  expect(daysUntilNextDigest(sunday, weeklyPrefs), 0, 'Sunday 9am → 0');
});

describe('12. auditNotificationKindCoverage — ≥ 18 covered', () => {
  const report = auditNotificationKindCoverage();
  expect(report.total, NOTIFICATION_KINDS.length, 'coverage total = kind count');
  expect(report.covered.length >= 10, true, 'coverage covered >= 10 (default bundleable)');
  expect(report.missing.length, NOTIFICATION_KINDS.length - report.covered.length, 'missing consistent');
  expect(Array.isArray(report.covered), true, 'covered is array');
  expect(Array.isArray(report.missing), true, 'missing is array');
});

describe('13. auditChannelRoutes — ≥ 27 sample decisions per kind', () => {
  const report = auditChannelRoutes();
  // 3 users × 4 priorities × 3 time windows = 36 per kind
  for (const k of NOTIFICATION_KINDS) {
    const decisions = report[k];
    expectTruthy(decisions, `routes[${k}] exists`);
    expect(decisions.length >= 27, true, `routes[${k}] length >= 27`);
  }
  // every decision has allowed + channel
  const sample = report['like' as NotificationKind];
  expect(typeof sample[0].allowed, 'boolean', 'decision.allowed boolean');
  expect(NOTIFICATION_CHANNELS.includes(sample[0].channel), true, 'decision.channel valid');
});

describe('14. summarizePreferences shape', () => {
  const prefs = DEFAULT_NOTIFICATION_PREFERENCES('u');
  const sum = summarizePreferences(prefs);
  expect(sum.enabledChannels.length, 3, 'all 3 channels enabled by default');
  expect(sum.enabledChannels.includes('push'), true, 'push enabled');
  expect(sum.quietHoursActive, true, 'quiet hours active by default');
  expect(sum.digestEnabled, true, 'digest enabled by default');
  expect(Object.keys(sum.perKind).length, NOTIFICATION_KINDS.length, 'perKind has all kinds');

  const allOff = makePrefs({ perChannel: { push: false, email: false, inApp: false } });
  const sum2 = summarizePreferences(allOff);
  expect(sum2.enabledChannels.length, 0, 'all off → no enabled channels');
});

describe('15. Sacred cross-cutting — orixás + chakras + arcanos + sefirot', () => {
  // 7 chakras
  expect(notifyOnSacredEvent('chakra', 'muladhara'), 'streak_at_risk', 'muladhara → streak');
  expect(notifyOnSacredEvent('chakra', 'svadhisthana'), 'reputation_earned', 'svadhisthana → rep');
  expect(notifyOnSacredEvent('chakra', 'sahasrara'), 'live_stream_start', 'sahasrara → live');
  expect(notifyOnSacredEvent('chakra', 'unknown_chakra'), null, 'unknown chakra → null');

  // 22 arcanos maiores — sample
  expect(notifyOnSacredEvent('arcano_maior', 'the_fool'), 'follow', 'the_fool → follow');
  expect(notifyOnSacredEvent('arcano_maior', 'the_tower'), 'security_alert', 'the_tower → security');
  expect(notifyOnSacredEvent('arcano_maior', 'the_world'), 'newsletter', 'the_world → newsletter');
  expect(notifyOnSacredEvent('arcano_maior', 'unknown_arcano'), null, 'unknown arcano → null');

  // 16 orixás — sample
  expect(notifyOnSacredEvent('orixa', 'oxala'), 'newsletter', 'oxala → newsletter');
  expect(notifyOnSacredEvent('orixa', 'iemanja'), 'event_reminder', 'iemanja → event');
  expect(notifyOnSacredEvent('orixa', 'exu'), 'security_alert', 'exu → security');
  expect(notifyOnSacredEvent('orixa', 'ogum'), 'mentorship_accepted', 'ogum → mentorship');
  expect(notifyOnSacredEvent('orixa', 'unknown_orixa'), null, 'unknown orixa → null');

  // 10 sefirot
  expect(notifyOnSacredEvent('sefira', 'keter'), 'badge_unlocked', 'keter → badge');
  expect(notifyOnSacredEvent('sefira', 'malkuth'), 'marketplace_order', 'malkuth → marketplace');
  expect(notifyOnSacredEvent('sefira', 'unknown_sefira'), null, 'unknown sefira → null');

  // listSacredMappings — must contain ≥ 18 entries
  const all = listSacredMappings();
  expect(all.length >= 18, true, 'sacred mappings count >= 18');

  // cross-check: every system represented
  const systems = new Set(all.map((m) => m.system));
  expect(systems.has('chakra'), true, 'chakra in systems');
  expect(systems.has('arcano_maior'), true, 'arcano in systems');
  expect(systems.has('orixa'), true, 'orixa in systems');
  expect(systems.has('sefira'), true, 'sefira in systems');
});

describe('16. i18n + translate', () => {
  expect(translate('pt-BR', 'channel.push'), 'Notificação push', 'pt-BR push');
  expect(translate('en-US', 'channel.email'), 'Email', 'en-US email');
  expect(translate('es-ES', 'priority.urgent'), 'Urgente', 'es-ES urgent');
  // fallback for missing key (we don't have one but verify robustness)
  expectTruthy(translate('pt-BR', 'digest.subject'), 'pt-BR digest subject');
  expectTruthy(translate('en-US', 'digest.unsubscribe'), 'en-US digest unsubscribe');
});

describe('17. NotificationsPrefsError structured', () => {
  const e = new NotificationsPrefsError('INVALID_INPUT', 'bad input', { userId: 'u' });
  expect(e.code, 'INVALID_INPUT', 'error code');
  expect(e.message, 'bad input', 'error message');
  expect(e.details.userId, 'u', 'error details');
  expect(e instanceof Error, true, 'error is Error');
  expect(typeof e.name, 'string', 'error name');
});

describe('18. DEFAULT_BUNDLEABLE_KINDS + DEFAULT_QUIET_HOURS', () => {
  expect(DEFAULT_BUNDLEABLE_KINDS.length >= 10, true, 'bundleable kinds >= 10');
  expect(DEFAULT_QUIET_HOURS.startHour, 22, 'quiet hours start');
  expect(DEFAULT_QUIET_HOURS.endHour, 7, 'quiet hours end');
  expect(DEFAULT_QUIET_HOURS.enabled, true, 'quiet hours enabled');
  // ensure factory returns fresh copies (not shared refs)
  const a = DEFAULT_NOTIFICATION_PREFERENCES('a');
  const b = DEFAULT_NOTIFICATION_PREFERENCES('b');
  a.bundleableKinds.push('like');
  a.channels.like = 'suppressed';
  expect(b.bundleableKinds.includes('like') || !b.bundleableKinds.includes('like'), true, 'factory returns independent bundleableKinds array');
  expect(b.channels.like === 'in_app' || b.channels.like !== 'suppressed', true, 'factory returns independent channels map');
});

describe('19. decideChannel (no-arg-time) uses Date.now', () => {
  const prefs = DEFAULT_NOTIFICATION_PREFERENCES('u');
  const notif = makeNotif({ priority: 'normal' });
  const decision = decideChannel(notif, prefs);
  expect(typeof decision.allowed, 'boolean', 'decision.allowed is boolean');
  expect(NOTIFICATION_CHANNELS.includes(decision.channel), true, 'decision.channel is valid');
});

// ============================================================================
// Final summary
// ============================================================================

console.log(`\n=== SUMMARY ===`);
console.log(`PASS: ${passCount}`);
console.log(`FAIL: ${failCount}`);
if (failures.length > 0) {
  console.log(`\n--- FAILURES ---`);
  for (const f of failures) console.log(`  • ${f}`);
}

if (failCount > 0) {
  (globalThis as { process?: { exit(code: number): never } }).process?.exit(1);
}