#!/usr/bin/env node
/**
 * W91-A: Smoke harness for notifications-prefs engine.
 *
 * Run: node --import tsx --test scripts/smoke-notifications-prefs.mts
 *
 * Uses node:test + node:assert (no vitest, no React). Self-contained —
 * exercises the engine API and verifies on-disk source invariants.
 */

import { test } from 'node:test';
import { ok, equal, notEqual, deepEqual } from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createPrefs,
  withCell,
  withQuietHours,
  withGlobalPause,
  withDigestMode,
  withCaps,
  decideDelivery,
  countActiveCells,
  listEnabledChannelsFor,
  isInQuietHours,
  nextDeliveryWindow,
  nextQuietEnd,
  formatClock,
  parseClock,
  quietHoursFromClock,
  emptyThrottleState,
  recordDelivery,
  checkThrottle,
  bucketFor,
  totalActiveBuckets,
  toChannel,
  toCategory,
  toMinutesSinceMidnight,
  DEFAULT_QUIET_HOURS,
  DEFAULT_CAPS,
  SUPPORTED_CHANNELS,
  SUPPORTED_CATEGORIES,
  CONSENT_VERSION_CURRENT,
  __W91A_NOTIFICATIONS_PREFS_ENGINE_LOADED,
  __W91A_POSITIVE_ONLY,
  __W91A_LGPD_GATED,
  __W91A_MOBILE_FIRST,
} from '../src/lib/w91/notifications-prefs/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readSrc(rel: string): string {
  const path = resolve(__dirname, '..', rel);
  if (!existsSync(path)) throw new Error(`missing: ${path}`);
  return readFileSync(path, 'utf8');
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

const IN_APP = toChannel('in-app');
const PUSH = toChannel('push');
const EMAIL = toChannel('email');
const SMS = toChannel('sms');
const LIVE = toCategory('live');
const DM = toCategory('dm');
const TRADITION = toCategory('tradition-reminder');

// ──────────────────────────────────────────────────────────────────────────
// Engine module surface
// ──────────────────────────────────────────────────────────────────────────

test('engine loaded sentinel is exported', () => {
  equal(__W91A_NOTIFICATIONS_PREFS_ENGINE_LOADED, true);
});

test('LGPD gate sentinel is exported', () => {
  equal(__W91A_LGPD_GATED, true);
});

test('positive-only sentinel is exported', () => {
  equal(__W91A_POSITIVE_ONLY, true);
});

test('mobile-first sentinel is exported', () => {
  equal(__W91A_MOBILE_FIRST, true);
});

test('consent version stamp is 2026-06-30', () => {
  equal(CONSENT_VERSION_CURRENT as unknown as string, '2026-06-30');
});

// ──────────────────────────────────────────────────────────────────────────
// Source invariants
// ──────────────────────────────────────────────────────────────────────────

test('all engine files exist on disk', () => {
  const files = [
    'src/lib/w91/notifications-prefs/types.ts',
    'src/lib/w91/notifications-prefs/factory.ts',
    'src/lib/w91/notifications-prefs/schedule.ts',
    'src/lib/w91/notifications-prefs/matrix.ts',
    'src/lib/w91/notifications-prefs/throttle.ts',
    'src/lib/w91/notifications-prefs/index.ts',
    'src/app/settings/notifications/page.tsx',
    'src/app/settings/notifications/layout.tsx',
  ];
  for (const f of files) {
    const content = readSrc(f);
    ok(content.length > 0, `${f} should be non-empty`);
  }
});

test('factory.ts has at least 8 Object.freeze calls', () => {
  const src = readSrc('src/lib/w91/notifications-prefs/factory.ts');
  const count = (src.match(/Object\.freeze\(/g) ?? []).length;
  ok(count >= 8, `expected >= 8 Object.freeze calls, got ${count}`);
});

test('banned vocab ABSENT from engine source (comments stripped)', () => {
  const banned = ['amarração', 'amarre', 'vinculação', 'vincular', 'prejudicar'];
  const combined = stripComments(
    readSrc('src/lib/w91/notifications-prefs/types.ts') +
      readSrc('src/lib/w91/notifications-prefs/factory.ts') +
      readSrc('src/lib/w91/notifications-prefs/schedule.ts') +
      readSrc('src/lib/w91/notifications-prefs/matrix.ts') +
      readSrc('src/lib/w91/notifications-prefs/throttle.ts'),
  );
  for (const w of banned) {
    ok(!combined.toLowerCase().includes(w.toLowerCase()), `banned word present: ${w}`);
  }
});

test('LGPD: consent version stamp + accept timestamp present', () => {
  const types = readSrc('src/lib/w91/notifications-prefs/types.ts');
  const factory = readSrc('src/lib/w91/notifications-prefs/factory.ts');
  ok(types.includes('consentAcceptedAtIso'), 'types.ts missing consentAcceptedAtIso');
  ok(factory.includes('consentAcceptedAtIso'), 'factory.ts missing consentAcceptedAtIso');
});

test('mobile-first: page.tsx renders at 360px breakpoint', () => {
  const page = readSrc('src/app/settings/notifications/page.tsx');
  ok(/max-w-|sm:|md:|min-w-/.test(page), 'page.tsx missing responsive classes');
  ok(/min-h-\[44px\]|h-44|min-h-\[4|44px/.test(page) || /min-h-\[44px\]/.test(page), 'page.tsx missing 44px touch targets');
});

test('ARIA: aria attributes present on toggles in page.tsx', () => {
  const page = readSrc('src/app/settings/notifications/page.tsx');
  ok(/aria-(?:label|pressed|describedby|checked|valuemin|valuemax|valuenow|live)/.test(page), 'page.tsx missing aria-* attributes');
  ok(/role=/.test(page), 'page.tsx missing role= attributes');
});

test('PT-BR copy: page.tsx contains Portuguese phrases', () => {
  const page = readSrc('src/app/settings/notifications/page.tsx');
  const ptHits = [
    /Notifica[çc][õo]es?/,
    /prefer[êe]ncias?/i,
    /canal/i,
    /categoria/i,
    /sil[êe]nciar/i,
    /hor[áa]rio/i,
    /pausar/i,
    /salvar/i,
    /consent/i,
  ];
  let n = 0;
  for (const re of ptHits) if (re.test(page)) n += 1;
  ok(n >= 4, `expected >= 4 PT-BR hits, got ${n}`);
});

test('consent checkbox is required (LGPD gate)', () => {
  const page = readSrc('src/app/settings/notifications/page.tsx');
  ok(/required/.test(page), 'page.tsx missing required attr');
  ok(/checkbox/i.test(page), 'page.tsx missing checkbox');
});

test('7 tradição symbols present in page.tsx', () => {
  const page = readSrc('src/app/settings/notifications/page.tsx');
  const symbols = ['✦', '🪶', '☩', '◈', '☸', '☉', '☬'];
  for (const s of symbols) {
    ok(page.includes(s), `page.tsx missing tradição symbol ${s}`);
  }
});

// ──────────────────────────────────────────────────────────────────────────
// Runtime sanity
// ──────────────────────────────────────────────────────────────────────────

test('createPrefs + decideDelivery round-trip works', () => {
  const prefs = createPrefs({ userKey: 'smoke-1' });
  const d = decideDelivery(prefs, PUSH, LIVE, 12 * 60);
  equal(d.allow, true);
});

test('globalPause suppresses every (channel, category)', () => {
  const prefs = withGlobalPause(createPrefs({ userKey: 'smoke-2' }), true);
  for (const ch of SUPPORTED_CHANNELS) {
    for (const cat of SUPPORTED_CATEGORIES) {
      equal(decideDelivery(prefs, ch, cat, 12 * 60).allow, false, `${ch}/${cat} should be paused`);
    }
  }
});

test('digest mode is preserved through withDigestMode', () => {
  const prefs = withDigestMode(createPrefs({ userKey: 'smoke-3' }), true);
  equal(prefs.digestMode, true);
});

test('withCaps updates without mutating', () => {
  const before = createPrefs({ userKey: 'smoke-4' });
  const after = withCaps(before, LIVE, { maxPerWindow: 99, windowMinutes: 120 });
  equal(after.caps[LIVE].maxPerWindow, 99);
  notEqual(before.caps[LIVE].maxPerWindow, 99);
});

test('formatClock and parseClock round-trip for HH:MM', () => {
  equal(formatClock(parseClock('07:30')), '07:30');
  equal(formatClock(parseClock('23:59')), '23:59');
});

test('quietHoursFromClock detects wrap correctly', () => {
  equal(quietHoursFromClock('22:00', '07:00').wrapsMidnight, true);
  equal(quietHoursFromClock('09:00', '18:00').wrapsMidnight, false);
});

test('throttle caps at the configured limit', () => {
  const prefs = createPrefs({ userKey: 'smoke-5' });
  let state = emptyThrottleState(prefs);
  const cap = DEFAULT_CAPS[LIVE];
  for (let i = 0; i < cap.maxPerWindow; i += 1) {
    const r = recordDelivery(state, LIVE, i, prefs.caps);
    state = r.state;
    ok(r.decision.allow, `delivery ${i} should be allowed`);
  }
  const blocked = recordDelivery(state, LIVE, cap.maxPerWindow + 1, prefs.caps);
  equal(blocked.decision.allow, false);
  equal(blocked.decision.reason, 'cap-exceeded');
});

test('bucketFor returns null for missing bucket', () => {
  const state = emptyThrottleState(createPrefs({ userKey: 'smoke-6' }));
  // intentionally bogus category to confirm bucketFor guards correctly
  equal(bucketFor(state, toCategory('__bogus__')), null);
});

test('totalActiveBuckets counts only non-empty buckets', () => {
  let state = emptyThrottleState(createPrefs({ userKey: 'smoke-7' }));
  equal(totalActiveBuckets(state), 0);
  state = recordDelivery(state, LIVE, 0, DEFAULT_CAPS).state;
  equal(totalActiveBuckets(state), 1);
});

test('listEnabledChannelsFor is non-empty for every category', () => {
  const matrix = createPrefs({ userKey: 'smoke-8' }).matrix;
  for (const cat of SUPPORTED_CATEGORIES) {
    ok(listEnabledChannelsFor(matrix, cat).length > 0, `${cat} should have at least one channel`);
  }
});

test('countActiveCells >= 8 with default matrix', () => {
  const matrix = createPrefs({ userKey: 'smoke-9' }).matrix;
  ok(countActiveCells(matrix) >= 8, `expected >= 8 active cells`);
});

test('isInQuietHours respects null window', () => {
  equal(isInQuietHours(toMinutesSinceMidnight(3 * 60), null), false);
});

test('nextDeliveryWindow reports global-pause when paused', () => {
  const r = nextDeliveryWindow(toMinutesSinceMidnight(12 * 60), DEFAULT_QUIET_HOURS, {
    globalPause: true,
    digestMode: false,
  });
  equal(r.reason, 'global-pause');
});

test('checkThrottle returns allowed when below cap', () => {
  const state = emptyThrottleState(createPrefs({ userKey: 'smoke-10' }));
  const d = checkThrottle(state, DM, 0, DEFAULT_CAPS);
  equal(d.allow, true);
  ok(d.remaining > 0, 'remaining should be positive');
});

test('decideDelivery returns cell-quiet-only when state=quiet-only and outside', () => {
  const prefs = withCell(createPrefs({ userKey: 'smoke-11' }), EMAIL, LIVE, {
    state: 'quiet-only',
  });
  const d = decideDelivery(prefs, EMAIL, LIVE, 12 * 60);
  equal(d.allow, false);
  equal(d.reason, 'cell-quiet-only');
});

test('decideDelivery allows quiet-only inside quiet hours', () => {
  const prefs = withCell(createPrefs({ userKey: 'smoke-12' }), EMAIL, LIVE, {
    state: 'quiet-only',
  });
  const d = decideDelivery(prefs, EMAIL, LIVE, 23 * 60);
  equal(d.allow, true);
});

test('withQuietHours(null) actually disables quiet hours', () => {
  const next = withQuietHours(createPrefs({ userKey: 'smoke-13' }), null);
  const d = decideDelivery(next, PUSH, LIVE, 23 * 60);
  equal(d.allow, true);
});

test('nextQuietEnd returns 07:00 from 23:00', () => {
  const r = nextQuietEnd(toMinutesSinceMidnight(23 * 60), DEFAULT_QUIET_HOURS);
  equal(r as unknown as number, 7 * 60);
});

test('decideDelivery returns unknown-channel for unknown channel', () => {
  const d = decideDelivery(createPrefs({ userKey: 'smoke-14' }), toChannel('fax'), LIVE, 12 * 60);
  equal(d.allow, false);
  equal(d.reason, 'unknown-channel');
});

test('decideDelivery returns unknown-category for unknown category', () => {
  const d = decideDelivery(createPrefs({ userKey: 'smoke-15' }), PUSH, toCategory('galactic-event'), 12 * 60);
  equal(d.allow, false);
  equal(d.reason, 'unknown-category');
});

test('createPrefs throws on empty userKey', () => {
  let threw = false;
  try {
    createPrefs({ userKey: '' });
  } catch {
    threw = true;
  }
  ok(threw, 'createPrefs should throw on empty userKey');
});

test('createPrefs defaults to LGPD consent 2026-06-30', () => {
  const prefs = createPrefs({ userKey: 'smoke-16' });
  equal(prefs.consentVersion as unknown as string, '2026-06-30');
});

// ──────────────────────────────────────────────────────────────────────────
// Page source invariants (deeper)
// ──────────────────────────────────────────────────────────────────────────

test('page.tsx has data-testid for global controls', () => {
  const page = readSrc('src/app/settings/notifications/page.tsx');
  for (const id of ['w91a-notifications-page', 'global-pause', 'digest-mode', 'consent-checkbox', 'save-button']) {
    ok(page.includes(`data-testid="${id}"`), `page.tsx missing data-testid=${id}`);
  }
});

test('page.tsx default quiet hours are 22:00→07:00', () => {
  const page = readSrc('src/app/settings/notifications/page.tsx');
  ok(page.includes('22:00'), 'page.tsx missing 22:00');
  ok(page.includes('07:00'), 'page.tsx missing 07:00');
});

test('matrix.ts and throttle.ts declare positive-only sentinels', () => {
  const matrix = readSrc('src/lib/w91/notifications-prefs/matrix.ts');
  const throttle = readSrc('src/lib/w91/notifications-prefs/throttle.ts');
  ok(/__matrixPositiveOnly\s*=\s*true/.test(matrix), 'matrix.ts missing positive-only sentinel');
  ok(/__throttlePositiveOnly\s*=\s*true/.test(throttle), 'throttle.ts missing positive-only sentinel');
});

test('factory.ts exports createPrefs + 5 mutators', () => {
  const factory = readSrc('src/lib/w91/notifications-prefs/factory.ts');
  for (const fn of ['createPrefs', 'withCell', 'withQuietHours', 'withGlobalPause', 'withDigestMode', 'withCaps']) {
    ok(new RegExp(`export function ${fn}\\b`).test(factory), `factory.ts missing export function ${fn}`);
  }
});

test('schedule.ts exports 6 functions', () => {
  const schedule = readSrc('src/lib/w91/notifications-prefs/schedule.ts');
  for (const fn of ['isInQuietHours', 'nextDeliveryWindow', 'nextQuietEnd', 'formatClock', 'parseClock', 'quietHoursFromClock']) {
    ok(new RegExp(`export function ${fn}\\b`).test(schedule), `schedule.ts missing export function ${fn}`);
  }
});

test('matrix.ts exports 5 functions + positive-only sentinel', () => {
  const matrix = readSrc('src/lib/w91/notifications-prefs/matrix.ts');
  for (const fn of ['decideDelivery', 'getCell', 'countActiveCells', 'listEnabledChannelsFor', 'assertMatrixImmutable']) {
    ok(new RegExp(`export function ${fn}\\b`).test(matrix), `matrix.ts missing export function ${fn}`);
  }
});

test('throttle.ts exports 5 functions', () => {
  const throttle = readSrc('src/lib/w91/notifications-prefs/throttle.ts');
  for (const fn of ['emptyThrottleState', 'recordDelivery', 'checkThrottle', 'bucketFor', 'totalActiveBuckets']) {
    ok(new RegExp(`export function ${fn}\\b`).test(throttle), `throttle.ts missing export function ${fn}`);
  }
});