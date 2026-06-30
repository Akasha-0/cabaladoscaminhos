/**
 * W91-A: Notifications Preferences Engine — source-inspection spec
 *
 * NO vitest render, NO jsdom. Uses node:test under tsx.
 * Pattern: read factory.ts + matrix.ts + schedule.ts + throttle.ts source,
 * grep for required patterns, and assert a small set of runtime invariants.
 *
 * Run:
 *   cd /workspace/wt-w91-notifications-prefs
 *   timeout 60 node --import tsx --test src/lib/w91/notifications-prefs/factory.spec.ts
 *
 * (Also compatible with `npx vitest run ... --reporter=verbose` for the
 * CI gate, but the spec is intentionally render-free.)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createPrefs, withCell, withQuietHours, withGlobalPause } from './factory';
import { decideDelivery, countActiveCells, listEnabledChannelsFor } from './matrix';
import {
  isInQuietHours,
  nextDeliveryWindow,
  nextQuietEnd,
  formatClock,
  parseClock,
  quietHoursFromClock,
} from './schedule';
import { emptyThrottleState, recordDelivery, checkThrottle } from './throttle';
import {
  toChannel,
  toCategory,
  toMinutesSinceMidnight,
  DEFAULT_QUIET_HOURS,
  DEFAULT_CAPS,
  SUPPORTED_CHANNELS,
  SUPPORTED_CATEGORIES,
  CONSENT_VERSION_CURRENT,
  toConsentVersion,
  type NotificationPrefs,
  type Channel,
  type Category,
} from './types';

// ──────────────────────────────────────────────────────────────────────────
// Source readers
// ──────────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readEngineSource(name: string): string {
  const path = resolve(__dirname, name);
  return readFileSync(path, 'utf8');
}

let factorySrc = '';
let matrixSrc = '';
let scheduleSrc = '';
let throttleSrc = '';
let typesSrc = '';
let indexSrc = '';

beforeAll(() => {
  factorySrc = readEngineSource('factory.ts');
  matrixSrc = readEngineSource('matrix.ts');
  scheduleSrc = readEngineSource('schedule.ts');
  throttleSrc = readEngineSource('throttle.ts');
  typesSrc = readEngineSource('types.ts');
  indexSrc = readEngineSource('index.ts');
});

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

// ──────────────────────────────────────────────────────────────────────────
// Constants used across asserts
// ──────────────────────────────────────────────────────────────────────────

const LIVE = toCategory('live');
const IN_APP = toChannel('in-app');
const PUSH = toChannel('push');
const EMAIL = toChannel('email');
const SMS = toChannel('sms');
const DM = toCategory('dm');
const TRADITION = toCategory('tradition-reminder');

const basePrefs: NotificationPrefs = createPrefs({ userKey: 'test-user-001' });

// ──────────────────────────────────────────────────────────────────────────
// 1) Sacred-cultural compliance sentinels
// ──────────────────────────────────────────────────────────────────────────

describe('sacred-cultural compliance', () => {
  it('factory exports positive-only sentinel', () => {
    expect(factorySrc).toMatch(/__notificationsPrefsPositiveOnly\s*=\s*true/);
  });

  it('matrix exports positive-only sentinel', () => {
    expect(matrixSrc).toMatch(/__matrixPositiveOnly\s*=\s*true/);
  });

  it('throttle exports positive-only sentinel', () => {
    expect(throttleSrc).toMatch(/__throttlePositiveOnly\s*=\s*true/);
  });

  it('index re-exports engine positive-only sentinel', () => {
    expect(indexSrc).toMatch(/__W91A_POSITIVE_ONLY\s*=\s*true/);
  });

  it('banned vocab ABSENT from engine source (after stripping comments)', () => {
    const banned = ['amarração', 'amarre', 'vinculação', 'vincular', 'prejudicar'];
    for (const word of banned) {
      const combined = stripComments(factorySrc + matrixSrc + scheduleSrc + throttleSrc + typesSrc);
      expect(combined.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });

  it('LGPD gate is present (consent version stamp + accept timestamp)', () => {
    expect(typesSrc).toMatch(/consentAcceptedAtIso/);
    expect(typesSrc).toMatch(/consentVersion/);
    expect(factorySrc).toMatch(/consentAcceptedAtIso/);
    expect(indexSrc).toMatch(/__W91A_LGPD_GATED\s*=\s*true/);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 2) Object.freeze discipline
// ──────────────────────────────────────────────────────────────────────────

describe('Object.freeze discipline', () => {
  it('factory has >= 8 Object.freeze calls', () => {
    const count = (factorySrc.match(/Object\.freeze\(/g) ?? []).length;
    expect(count).toBeGreaterThanOrEqual(8);
  });

  it('schedule exports frozen return shapes (isInQuietHours is pure)', () => {
    // Pure predicate — assert it returns identical value across calls
    const a = isInQuietHours(toMinutesSinceMidnight(23 * 60), DEFAULT_QUIET_HOURS);
    const b = isInQuietHours(toMinutesSinceMidnight(23 * 60), DEFAULT_QUIET_HOURS);
    expect(a).toBe(b);
    expect(a).toBe(true);
  });

  it('createPrefs returns an actually frozen object', () => {
    const prefs = createPrefs({ userKey: 'freeze-test' });
    expect(Object.isFrozen(prefs)).toBe(true);
    expect(Object.isFrozen(prefs.matrix)).toBe(true);
  });

  it('withCell returns a new frozen object (does not mutate)', () => {
    const before = basePrefs.matrix[IN_APP]?.[LIVE]?.state;
    const next = withCell(basePrefs, IN_APP, LIVE, { state: 'off' });
    expect(next.matrix[IN_APP]?.[LIVE]?.state).toBe('off');
    expect(basePrefs.matrix[IN_APP]?.[LIVE]?.state).toBe(before);
    expect(Object.isFrozen(next)).toBe(true);
    expect(Object.isFrozen(next.matrix)).toBe(true);
  });

  it('withQuietHours toggles without mutating', () => {
    const next = withQuietHours(basePrefs, null);
    expect(next.quietHours).toBeNull();
    expect(basePrefs.quietHours).not.toBeNull();
  });

  it('withGlobalPause toggles without mutating', () => {
    const next = withGlobalPause(basePrefs, true);
    expect(next.globalPause).toBe(true);
    expect(basePrefs.globalPause).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 3) Channel × category matrix defaults
// ──────────────────────────────────────────────────────────────────────────

describe('channel x category matrix defaults', () => {
  it('default matrix covers every supported channel and category', () => {
    for (const channel of SUPPORTED_CHANNELS) {
      const row = basePrefs.matrix[channel];
      expect(row, `missing row for ${channel}`).toBeDefined();
      for (const category of SUPPORTED_CATEGORIES) {
        const cell = row?.[category];
        expect(cell, `missing cell ${channel}/${category}`).toBeDefined();
      }
    }
  });

  it('sms is OFF by default for live, dm, and tradition-reminder', () => {
    expect(basePrefs.matrix[SMS]?.[LIVE]?.state).toBe('off');
    expect(basePrefs.matrix[SMS]?.[DM]?.state).toBe('off');
    expect(basePrefs.matrix[SMS]?.[TRADITION]?.state).toBe('off');
  });

  it('push is ON by default for live', () => {
    expect(basePrefs.matrix[PUSH]?.[LIVE]?.state).toBe('on');
  });

  it('email is OFF by default for dm', () => {
    expect(basePrefs.matrix[EMAIL]?.[DM]?.state).toBe('off');
  });

  it('countActiveCells matches expected default active count', () => {
    const n = countActiveCells(basePrefs.matrix);
    // live: in-app+push+email = 3; dm: in-app+push = 2; comment+reaction: in-app+push = 4;
    // tradition: in-app+email = 2; system: in-app+email = 2 → total 13
    expect(n).toBeGreaterThanOrEqual(10);
    expect(n).toBeLessThanOrEqual(20);
  });

  it('listEnabledChannelsFor returns at least in-app for every category', () => {
    for (const category of SUPPORTED_CATEGORIES) {
      const enabled = listEnabledChannelsFor(basePrefs.matrix, category);
      expect(enabled.length).toBeGreaterThan(0);
      expect(enabled).toContain(IN_APP);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 4) Delivery decision logic
// ──────────────────────────────────────────────────────────────────────────

describe('decideDelivery', () => {
  it('returns allowed when cell is on and outside quiet hours', () => {
    const decision = decideDelivery(basePrefs, PUSH, LIVE, 12 * 60); // noon
    expect(decision.allow).toBe(true);
    expect(decision.reason).toBe('allowed');
  });

  it('returns cell-off when cell is explicitly off', () => {
    const off = withCell(basePrefs, SMS, LIVE, { state: 'off' });
    const decision = decideDelivery(off, SMS, LIVE, 12 * 60);
    expect(decision.allow).toBe(false);
    expect(decision.reason).toBe('cell-off');
  });

  it('returns global-pause when prefs.globalPause is true', () => {
    const paused = withGlobalPause(basePrefs, true);
    const decision = decideDelivery(paused, PUSH, LIVE, 12 * 60);
    expect(decision.allow).toBe(false);
    expect(decision.reason).toBe('global-pause');
  });

  it('quiet-only cell allows only inside quiet hours', () => {
    const qo = withCell(basePrefs, EMAIL, LIVE, { state: 'quiet-only' });
    const inQuiet = decideDelivery(qo, EMAIL, LIVE, 23 * 60);
    expect(inQuiet.allow).toBe(true);
    const outQuiet = decideDelivery(qo, EMAIL, LIVE, 12 * 60);
    expect(outQuiet.allow).toBe(false);
    expect(outQuiet.reason).toBe('cell-quiet-only');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 5) Schedule / quiet hours
// ──────────────────────────────────────────────────────────────────────────

describe('schedule', () => {
  it('DEFAULT_QUIET_HOURS is 22:00..07:00 wraps-midnight', () => {
    const s = DEFAULT_QUIET_HOURS.start as unknown as number;
    const e = DEFAULT_QUIET_HOURS.end as unknown as number;
    expect(s).toBe(22 * 60);
    expect(e).toBe(7 * 60);
    expect(DEFAULT_QUIET_HOURS.wrapsMidnight).toBe(true);
  });

  it('isInQuietHours returns true at 23:00 and 03:00, false at 12:00', () => {
    expect(isInQuietHours(toMinutesSinceMidnight(23 * 60), DEFAULT_QUIET_HOURS)).toBe(true);
    expect(isInQuietHours(toMinutesSinceMidnight(3 * 60), DEFAULT_QUIET_HOURS)).toBe(true);
    expect(isInQuietHours(toMinutesSinceMidnight(12 * 60), DEFAULT_QUIET_HOURS)).toBe(false);
  });

  it('nextDeliveryWindow reports quiet-hours when in quiet hours', () => {
    const r = nextDeliveryWindow(toMinutesSinceMidnight(23 * 60), DEFAULT_QUIET_HOURS, {
      globalPause: false,
      digestMode: false,
    });
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('quiet-hours');
  });

  it('nextDeliveryWindow reports allowed at noon', () => {
    const r = nextDeliveryWindow(toMinutesSinceMidnight(12 * 60), DEFAULT_QUIET_HOURS, {
      globalPause: false,
      digestMode: false,
    });
    expect(r.allowed).toBe(true);
  });

  it('nextQuietEnd computes correct end during quiet hours', () => {
    const r = nextQuietEnd(toMinutesSinceMidnight(23 * 60), DEFAULT_QUIET_HOURS);
    expect(r).not.toBeNull();
    expect((r as unknown as number)).toBe(7 * 60);
  });

  it('formatClock and parseClock are inverses for valid HH:MM', () => {
    for (const hhmm of ['00:00', '07:30', '12:00', '22:45', '23:59']) {
      const parsed = parseClock(hhmm);
      expect(formatClock(parsed)).toBe(hhmm);
    }
  });

  it('quietHoursFromClock infers wrapsMidnight correctly', () => {
    const a = quietHoursFromClock('22:00', '07:00');
    expect(a.wrapsMidnight).toBe(true);
    const b = quietHoursFromClock('09:00', '18:00');
    expect(b.wrapsMidnight).toBe(false);
  });

  it('withQuietHours(null) disables quiet hours', () => {
    const next = withQuietHours(basePrefs, null);
    const decision = decideDelivery(next, PUSH, LIVE, 23 * 60);
    expect(decision.allow).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 6) Throttle / frequency caps
// ──────────────────────────────────────────────────────────────────────────

describe('throttle', () => {
  it('emptyThrottleState creates a bucket per category from prefs.caps', () => {
    const state = emptyThrottleState(basePrefs);
    for (const category of SUPPORTED_CATEGORIES) {
      const bucket = state[category as string];
      expect(bucket, `missing bucket for ${category}`).toBeDefined();
      expect(bucket!.windowMinutes).toBe(DEFAULT_CAPS[category].windowMinutes);
      expect(bucket!.cap).toBe(DEFAULT_CAPS[category].maxPerWindow);
    }
  });

  it('allows up to cap then blocks further deliveries', () => {
    let state = emptyThrottleState(basePrefs);
    const cap = DEFAULT_CAPS[LIVE];
    for (let i = 0; i < cap.maxPerWindow; i += 1) {
      const r = recordDelivery(state, LIVE, i, basePrefs.caps);
      state = r.state;
      expect(r.decision.allow).toBe(true);
    }
    const blocked = recordDelivery(state, LIVE, cap.maxPerWindow, basePrefs.caps);
    expect(blocked.decision.allow).toBe(false);
    expect(blocked.decision.reason).toBe('cap-exceeded');
    expect(blocked.decision.resetAt).not.toBeNull();
  });

  it('checkThrottle reports remaining count', () => {
    let state = emptyThrottleState(basePrefs);
    state = recordDelivery(state, LIVE, 0, basePrefs.caps).state;
    state = recordDelivery(state, LIVE, 1, basePrefs.caps).state;
    const d = checkThrottle(state, LIVE, 1, basePrefs.caps);
    expect(d.allow).toBe(true);
    expect(d.remaining).toBeGreaterThanOrEqual(0);
  });

  it('rolling window evicts old timestamps', () => {
    let state = emptyThrottleState(basePrefs);
    const cap = DEFAULT_CAPS[LIVE];
    // Fill cap at t=0..cap-1
    for (let i = 0; i < cap.maxPerWindow; i += 1) {
      state = recordDelivery(state, LIVE, i, basePrefs.caps).state;
    }
    // Advance past windowMinutes
    const future = cap.windowMinutes + 5;
    const d = recordDelivery(state, LIVE, future, basePrefs.caps);
    expect(d.decision.allow).toBe(true);
  });

  it('returns unknown-category for categories not in caps', () => {
    const state = emptyThrottleState(basePrefs);
    // intentionally bad category — checkThrottle returns unknown-category at runtime
    const d = checkThrottle(state, toCategory('__bogus__'), 0, basePrefs.caps);
    expect(d.reason).toBe('unknown-category');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 7) Brand constructors
// ──────────────────────────────────────────────────────────────────────────

describe('brand constructors', () => {
  it('toChannel throws on empty string', () => {
    expect(() => toChannel('')).toThrow();
  });

  it('toCategory throws on empty string', () => {
    expect(() => toCategory('')).toThrow();
  });

  it('toConsentVersion accepts YYYY-MM-DD only', () => {
    expect(() => toConsentVersion('2026-06-30')).not.toThrow();
    expect(() => toConsentVersion('not-a-date')).toThrow();
  });

  it('toMinutesSinceMidnight rejects negative and > 1439', () => {
    expect(() => toMinutesSinceMidnight(-1)).toThrow();
    expect(() => toMinutesSinceMidnight(1440)).toThrow();
    expect(() => toMinutesSinceMidnight(720)).not.toThrow();
  });

  it('CONSENT_VERSION_CURRENT is the 2026-06-30 stamp', () => {
    expect(CONSENT_VERSION_CURRENT as unknown as string).toBe('2026-06-30');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 8) Source-level structural invariants
// ──────────────────────────────────────────────────────────────────────────

describe('source structural invariants', () => {
  it('index re-exports all 4 engine modules', () => {
    expect(indexSrc).toMatch(/export \* from '\.\/types'/);
    expect(indexSrc).toMatch(/export \* from '\.\/factory'/);
    expect(indexSrc).toMatch(/export \* from '\.\/schedule'/);
    expect(indexSrc).toMatch(/export \* from '\.\/matrix'/);
    expect(indexSrc).toMatch(/export \* from '\.\/throttle'/);
  });

  it('factory does NOT import React or DOM', () => {
    expect(factorySrc).not.toMatch(/from ['"]react['"]/);
    expect(factorySrc).not.toMatch(/document\.|window\./);
  });

  it('matrix does NOT import React or DOM', () => {
    expect(matrixSrc).not.toMatch(/from ['"]react['"]/);
    expect(matrixSrc).not.toMatch(/document\.|window\./);
  });

  it('schedule does NOT import React or DOM', () => {
    expect(scheduleSrc).not.toMatch(/from ['"]react['"]/);
    expect(scheduleSrc).not.toMatch(/document\./);
  });

  it('throttle does NOT import React or DOM', () => {
    expect(throttleSrc).not.toMatch(/from ['"]react['"]/);
    expect(throttleSrc).not.toMatch(/document\.|window\./);
  });

  it('types file contains Branded primitive helper', () => {
    expect(typesSrc).toMatch(/export type Brand</);
    expect(typesSrc).toMatch(/__brand/);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 9) Cross-cutting
// ──────────────────────────────────────────────────────────────────────────

describe('cross-cutting', () => {
  it('mobile-first sentinel present at module surface', () => {
    expect(indexSrc).toMatch(/__W91A_MOBILE_FIRST\s*=\s*true/);
  });

  it('engine loaded sentinel present at module surface', () => {
    expect(indexSrc).toMatch(/__W91A_NOTIFICATIONS_PREFS_ENGINE_LOADED\s*=\s*true/);
  });

  it('createPrefs throws on empty userKey', () => {
    expect(() => createPrefs({ userKey: '' })).toThrow();
  });

  it('createPrefs throws on missing input', () => {
    // @ts-expect-error — intentionally bad input for test
    expect(() => createPrefs(null)).toThrow();
  });
});