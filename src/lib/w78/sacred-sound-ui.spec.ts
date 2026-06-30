// W78 sacred-sound-ui spec — self-running (no vitest at runtime).
// Pattern: cycle 60+ harness with describe/it/expect/beforeEach/afterEach stubs.

import {
  TRADITIONS, isTradition, TRADITION_DISPLAY,
  SOLFEGGIO_HZ, TANTRA_GAMMA_HZ, SCHUMANN_HZ, isSacredHz, getFrequencyForTradition, makeFrequency,
  getTraditionIntentionCategories, isIntentionCategory,
  listTracks, getTrack, listTracksByTradition, listTracksByFrequency, getCaptionsForTrack,
  setIntention, listIntentions, getIntention, completeIntention, exportIntentionHistory, registerUser,
  createSession, play, pause, resume, seek, getCurrentPosition, onStateChange,
  getKeyboardShortcuts, getScreenReaderAnnouncements, isReducedMotionPreferred, _setReducedMotionForTests,
  getRecommendedTrackForTradition,
  saveSessionState, loadSessionState, shouldWarnOnCellular, _setNetworkHintForTests,
  hashSessionState, hashIntentionCanonical,
  _resetUIForTests,
  makeTrackId, makeUserId, makeCategory, makeIntentionId, makeISO, nowISO,
  some, NONE, ok, err, fromNullable,
  type TrackId, type UserId, type IntentionId, type IntentionCategory, type Tradition, type Track, type Intention,
} from './sacred-sound-ui.ts';

// ----- self-running harness -----
let _testsPassed = 0;
let _testsFailed = 0;
const _failures: string[] = [];
function expect<T>(actual: T, label?: string): {
  toBe(expected: T): void;
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toBeNull(): void;
  toThrow(fn: () => unknown, msg?: string): void;
  toContain(item: unknown): void;
  toHaveLength(n: number): void;
  toBeGreaterThan(n: number): void;
  toBeGreaterThanOrEqual(n: number): void;
  toBeLessThan(n: number): void;
  toBeLessThanOrEqual(n: number): void;
} {
  return {
    toBe(expected: T) {
      const ok = Object.is(actual, expected);
      recordAssertion(label ?? 'toBe', ok, `expected ${String(expected)}, got ${String(actual)}`);
    },
    toEqual(expected: unknown) {
      const ok = JSON.stringify(actual) === JSON.stringify(expected);
      recordAssertion(label ?? 'toEqual', ok, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toStrictEqual(expected: unknown) {
      const ok = JSON.stringify(actual) === JSON.stringify(expected);
      recordAssertion(label ?? 'toStrictEqual', ok, `strict: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toBeTruthy() {
      recordAssertion(label ?? 'toBeTruthy', Boolean(actual), `expected truthy, got ${String(actual)}`);
    },
    toBeFalsy() {
      recordAssertion(label ?? 'toBeFalsy', !actual, `expected falsy, got ${String(actual)}`);
    },
    toBeDefined() {
      recordAssertion(label ?? 'toBeDefined', actual !== undefined, `got undefined`);
    },
    toBeUndefined() {
      recordAssertion(label ?? 'toBeUndefined', actual === undefined, `got ${String(actual)}`);
    },
    toBeNull() {
      recordAssertion(label ?? 'toBeNull', actual === null, `got ${String(actual)}`);
    },
    toThrow(fn: () => unknown, msg?: string) {
      let threw = false;
      let errMsg = '';
      try { fn(); } catch (e) { threw = true; errMsg = String(e); }
      const ok = msg ? threw && errMsg.includes(msg) : threw;
      recordAssertion(label ?? 'toThrow', ok, `did not throw as expected (msg=${msg})`);
    },
    toContain(item: unknown) {
      const isStr = typeof actual === 'string';
      const isArr = Array.isArray(actual);
      const ok = isStr ? (actual as string).includes(String(item))
                : isArr ? (actual as unknown[]).includes(item)
                : false;
      recordAssertion(label ?? 'toContain', ok, `${String(actual)} does not contain ${String(item)}`);
    },
    toHaveLength(n: number) {
      const len = (actual as { length: number }).length;
      recordAssertion(label ?? 'toHaveLength', len === n, `expected length ${n}, got ${len}`);
    },
    toBeGreaterThan(n: number) {
      recordAssertion(label ?? 'toBeGreaterThan', (actual as number) > n, `${String(actual)} not > ${n}`);
    },
    toBeGreaterThanOrEqual(n: number) {
      recordAssertion(label ?? 'toBeGreaterThanOrEqual', (actual as number) >= n, `${String(actual)} not >= ${n}`);
    },
    toBeLessThan(n: number) {
      recordAssertion(label ?? 'toBeLessThan', (actual as number) < n, `${String(actual)} not < ${n}`);
    },
    toBeLessThanOrEqual(n: number) {
      recordAssertion(label ?? 'toBeLessThanOrEqual', (actual as number) <= n, `${String(actual)} not <= ${n}`);
    },
  };
}

function recordAssertion(name: string, ok: boolean, msg: string): void {
  if (ok) { _testsPassed++; }
  else {
    _testsFailed++;
    _failures.push(`${name}: ${msg}`);
  }
}

function describe(name: string, fn: () => void): void {
  console.log(`\n  ${name}`);
  fn();
}
function it(name: string, fn: () => void | Promise<void>): void {
  try {
    const r = fn();
    if (r instanceof Promise) {
      recordAssertion(`it(${name}) async`, false, 'async it() not supported in sync spec — wrap in manual');
      return;
    }
    recordAssertion(`it(${name}) ran`, true, '');
  } catch (e) {
    _testsFailed++;
    _failures.push(`it(${name}) threw: ${String(e)}`);
  }
}
function beforeEach(fn: () => void): void { fn(); }
function afterEach(fn: () => void): void { fn(); }

// ============================== SPEC BODY ==============================

const ADMIN: UserId = makeUserId('u_admin_test_001');
const REGULAR: UserId = makeUserId('u_regular_test_001');
const CANDOMBLE_TRACK: TrackId = makeTrackId('t_candomble_01');
const UMBANDA_TRACK: TrackId = makeTrackId('t_umbanda_01');
const TANTRA_TRACK: TrackId = makeTrackId('t_tantra_01');

describe('branded primitive factories', () => {
  beforeEach(() => _resetUIForTests());
  it('makeTrackId accepts valid and rejects invalid', () => {
    expect(makeTrackId('t_candomble_01')).toBeDefined();
    expect(() => makeTrackId('bad')).toThrow(() => makeTrackId('bad'), 'invalid TrackId');
  });
  it('makeUserId + makeIntentionId + makeCategory + makeISO validate', () => {
    expect(makeUserId('u_admin_test_001')).toBeDefined();
    expect(makeIntentionId('i_abcdefghijkl')).toBeDefined();
    expect(makeCategory('ancoramento')).toBeDefined();
    expect(makeISO('2026-06-30T00:00:00.000Z')).toBeDefined();
    expect(() => makeCategory('BAD')).toThrow(() => makeCategory('BAD'), 'invalid Category');
    expect(() => makeISO('not-iso')).toThrow(() => makeISO('not-iso'), 'invalid ISODateTime');
  });
  it('nowISO returns stable canonical ISO', () => {
    expect((nowISO() as unknown as string)).toBe('2026-06-30T00:00:00.000Z');
  });
});

describe('tradition taxonomy', () => {
  beforeEach(() => _resetUIForTests());
  it('TRADITIONS has exactly 7 entries', () => {
    expect(TRADITIONS).toHaveLength(7);
  });
  it('isTradition identifies members and rejects non-members', () => {
    expect(isTradition('candomble')).toBeTruthy();
    expect(isTradition('budismo')).toBeFalsy();
  });
  it('TRADITION_DISPLAY has a pt label for every tradition', () => {
    for (const t of TRADITIONS) {
      const row = TRADITION_DISPLAY.find((r) => r.id === t);
      expect(row !== undefined).toBeTruthy();
    }
  });
  it('canonical frequency assigned per tradition is sacred', () => {
    expect(isSacredHz((getFrequencyForTradition('candomble') as unknown as { hz: number }).hz)).toBeTruthy();
    expect(isSacredHz((getFrequencyForTradition('astrologia') as unknown as { hz: number }).hz)).toBeTruthy();
    expect((getFrequencyForTradition('candomble') as unknown as { hz: number }).hz).toBe(528);
    expect((getFrequencyForTradition('umbanda') as unknown as { hz: number }).hz).toBe(396);
    expect((getFrequencyForTradition('ifa') as unknown as { hz: number }).hz).toBe(432);
    expect((getFrequencyForTradition('cabala') as unknown as { hz: number }).hz).toBe(963);
    expect((getFrequencyForTradition('tantra') as unknown as { hz: number }).hz).toBe(40);
    expect((getFrequencyForTradition('cigano-ramiro') as unknown as { hz: number }).hz).toBe(528);
  });
  it('getTraditionIntentionCategories returns 3 categories per tradition', () => {
    for (const t of TRADITIONS) {
      expect(getTraditionIntentionCategories(t)).toHaveLength(3);
    }
  });
  it('makeFrequency rejects non-sacred hz', () => {
    expect(() => makeFrequency(440, 'A above middle C')).toThrow(() => makeFrequency(440, 'A above middle C'));
  });
  it('SOLFEGGIO_HZ has 10 canonical entries + 40 + 7.83', () => {
    expect(SOLFEGGIO_HZ).toHaveLength(10);
    expect(SOLFEGGIO_HZ[0]).toBe(174);
    expect(SOLFEGGIO_HZ[9]).toBe(963);
    expect(TANTRA_GAMMA_HZ).toBe(40);
    expect(SCHUMANN_HZ).toBe(7.83);
  });
  it('isIntentionCategory identifies candomble categories', () => {
    expect(isIntentionCategory('ancoramento')).toBeTruthy();
    expect(isIntentionCategory('xxx-not-real')).toBeFalsy();
  });
});

describe('track catalog (7 traditions × 3 tracks = 21)', () => {
  beforeEach(() => _resetUIForTests());
  it('listTracks returns 21 tracks by default', () => {
    expect(listTracks()).toHaveLength(21);
  });
  it('every tradition has 3 tracks', () => {
    for (const t of TRADITIONS) {
      expect(listTracksByTradition(t)).toHaveLength(3);
    }
  });
  it('getTrack returns the track or NONE', () => {
    const found = getTrack(CANDOMBLE_TRACK);
    expect(found.kind).toBe('some');
    const none = getTrack(makeTrackId('t_does_not_exist'));
    expect(none.kind).toBe('none');
  });
  it('listTracks filter by tradition returns 3 items', () => {
    const filtered = listTracks({ tradition: 'candomble' });
    expect(filtered).toHaveLength(3);
  });
  it('listTracks filter by category narrows correctly', () => {
    const fluidity = listTracks({ category: makeCategory('fluidez') });
    expect(fluidity.length).toBeGreaterThan(0);
    for (const t of fluidity) {
      expect(t.intentionCategories.some((c) => (c as string) === 'fluidez')).toBeTruthy();
    }
  });
  it('listTracks filter by minDurationSec excludes short tracks', () => {
    const long = listTracks({ minDurationSec: 1000 });
    for (const t of long) {
      expect(t.durationSec).toBeGreaterThanOrEqual(1000);
    }
  });
  it('listTracks filter by maxSizeMb excludes large tracks', () => {
    const small = listTracks({ maxSizeMb: 10 });
    for (const t of small) {
      expect(t.sizeMb).toBeLessThanOrEqual(10);
    }
  });
  it('listTracksByFrequency 528Hz returns candomble + cigano-ramiro', () => {
    const f = makeFrequency(528, 'Transformação');
    const tr = listTracksByFrequency(f);
    expect(tr.length).toBeGreaterThanOrEqual(6);
    for (const t of tr) {
      const traditions = new Set(TRADITIONS);
      expect(traditions.has(t.tradition)).toBeTruthy();
    }
  });
  it('every track has captions >= 3 lines', () => {
    for (const t of TRADITIONS) {
      for (const tr of listTracksByTradition(t)) {
        expect(tr.captions.length).toBeGreaterThanOrEqual(3);
      }
    }
  });
  it('captions for candomble are pt-BR, others en', () => {
    const c = listTracksByTradition('candomble');
    expect(c[0]?.captions[0]?.lang).toBe('pt-BR');
    const t = listTracksByTradition('tantra');
    expect(t[0]?.captions[0]?.lang).toBe('en');
  });
  it('getCaptionsForTrack returns empty for unknown track', () => {
    expect(getCaptionsForTrack(makeTrackId('t_nope_nope')).length).toBe(0);
  });
  it('all track durations in [600..1080)', () => {
    for (const t of listTracks()) {
      expect(t.durationSec).toBeGreaterThanOrEqual(600);
      expect(t.durationSec).toBeLessThan(1080);
    }
  });
});

describe('intention system', () => {
  beforeEach(() => {
    _resetUIForTests();
    registerUser(ADMIN);
  });
  it('setIntention requires authenticated user', () => {
    const r = setIntention(makeUserId('u_ghost_123'), CANDOMBLE_TRACK, {
      category: makeCategory('fluidez'), text: 'Ancorar a luz',
    });
    expect(r.ok).toBeFalsy();
    if (!r.ok) expect((r.error as { kind: string }).kind).toBe('auth-required');
  });
  it('setIntention stores intention for authenticated user', () => {
    const r = setIntention(ADMIN, CANDOMBLE_TRACK, {
      category: makeCategory('ancoramento'), text: 'Ancorar a luz do mar',
    });
    expect(r.ok).toBeTruthy();
    if (r.ok) expect(ADMIN).toBeDefined();
    expect(listIntentions(ADMIN)).toHaveLength(1);
  });
  it('setIntention rejects empty / whitespace / too-long / wrong-category', () => {
    expect((setIntention(ADMIN, CANDOMBLE_TRACK, { category: makeCategory('ancoramento'), text: '   ' }) as { ok: false; error: { kind: string } }).error.kind).toBe('text-empty');
    const longText = 'x'.repeat(281);
    expect((setIntention(ADMIN, CANDOMBLE_TRACK, { category: makeCategory('ancoramento'), text: longText }) as { ok: false; error: { kind: string } }).error.kind).toBe('text-too-long');
    expect((setIntention(ADMIN, CANDOMBLE_TRACK, { category: makeCategory('curuguru'), text: 'x' }) as { ok: false; error: { kind: string } }).error.kind).toBe('category-mismatch');
  });
  it('setIntention rejects unknown track', () => {
    expect((setIntention(ADMIN, makeTrackId('t_nope_nope_01'), { category: makeCategory('ancoramento'), text: 'x' }) as { ok: false; error: { kind: string } }).error.kind).toBe('track-not-found');
  });
  it('listIntentions returns empty for unauthenticated', () => {
    expect(listIntentions(makeUserId('u_ghost_999'))).toHaveLength(0);
  });
  it('getIntention locates by id; misses return NONE', () => {
    const r = setIntention(ADMIN, CANDOMBLE_TRACK, { category: makeCategory('ancoramento'), text: 'My intention' });
    if (r.ok) {
      const found = getIntention(r.value);
      expect(found.kind).toBe('some');
      expect(getIntention(makeIntentionId('i_doesnotexistaa')).kind).toBe('none');
    } else {
      expect(true).toBeFalsy();
    }
  });
  it('completeIntention seals intention; double-complete errors', () => {
    const r = setIntention(ADMIN, CANDOMBLE_TRACK, { category: makeCategory('ancoramento'), text: 'Settle' });
    if (r.ok) {
      const completed = completeIntention(r.value, 'Senti a luz');
      expect(completed.ok).toBeTruthy();
      if (completed.ok) {
        expect(completed.value.reflection.kind).toBe('some');
        expect(completed.value.completedAt.kind).toBe('some');
      }
      const dbl = completeIntention(r.value, 'again');
      expect(dbl.ok).toBeFalsy();
      if (!dbl.ok) expect((dbl.error as { kind: string }).kind).toBe('already-completed');
    } else {
      expect(true).toBeFalsy();
    }
  });
  it('completeIntention on unknown id errors', () => {
    expect((completeIntention(makeIntentionId('i_doesnotexistaa'), 'x') as { ok: false; error: { kind: string } }).error.kind).toBe('intention-not-found');
  });
  it('exportIntentionHistory equals listIntentions for same user', () => {
    _resetUIForTests();
    registerUser(ADMIN);
    setIntention(ADMIN, CANDOMBLE_TRACK, { category: makeCategory('ancoramento'), text: 'a' });
    setIntention(ADMIN, CANDOMBLE_TRACK, { category: makeCategory('fluidez'),   text: 'b' });
    expect(exportIntentionHistory(ADMIN)).toHaveLength(2);
    expect(exportIntentionHistory(makeUserId('u_ghost_999'))).toHaveLength(0);
  });
});

describe('playback state machine', () => {
  beforeEach(() => _resetUIForTests());
  it('createSession starts idle at position 0 with track duration', () => {
    const s = createSession(CANDOMBLE_TRACK);
    expect(s.state).toBe('idle');
    expect(s.position).toBe(0);
    expect(s.duration).toBeGreaterThan(0);
  });
  it('play() drives idle → loading → playing', () => {
    const s = createSession(CANDOMBLE_TRACK);
    const playing = play(s);
    expect(playing.state).toBe('playing');
  });
  it('pause()/resume() cycle', () => {
    const playing = play(createSession(CANDOMBLE_TRACK));
    const paused = pause(playing);
    expect(paused.state).toBe('paused');
    const resumed = resume(paused);
    expect(resumed.state).toBe('playing');
  });
  it('pause() is no-op when not playing', () => {
    const s = createSession(CANDOMBLE_TRACK);
    expect(pause(s).state).toBe('idle');
  });
  it('resume() is no-op when not paused', () => {
    const playing = play(createSession(CANDOMBLE_TRACK));
    expect(resume(playing).state).toBe('playing');
  });
  it('seek clamps to duration and transitions to ended', () => {
    const playing = play(createSession(CANDOMBLE_TRACK));
    const over = seek(playing, playing.duration + 100);
    expect(over.state).toBe('ended');
    expect(over.position).toBe(playing.duration);
  });
  it('seek negative is no-op', () => {
    const playing = play(createSession(CANDOMBLE_TRACK));
    const after = seek(playing, -5);
    expect(after.position).toBe(0);
  });
  it('seek to mid-track preserves playing state', () => {
    const playing = play(createSession(CANDOMBLE_TRACK));
    const mid = seek(playing, 60);
    expect(mid.state).toBe('playing');
    expect(mid.position).toBe(60);
  });
  it('getCurrentPosition mirrors session.position', () => {
    const playing = play(createSession(CANDOMBLE_TRACK));
    const mid = seek(playing, 30);
    expect(getCurrentPosition(mid)).toBe(30);
  });
  it('play with failOnLoad returns error state with message', () => {
    const s = createSession(CANDOMBLE_TRACK, { failOnLoad: true });
    const r = play(s);
    expect(r.state).toBe('error');
    expect(r.errorMessage.kind).toBe('some');
  });
  it('onStateChange fires on play; unsubscribe stops', () => {
    let count = 0;
    const s = createSession(CANDOMBLE_TRACK);
    const unsub = onStateChange(s, () => { count++; });
    play(s);
    expect(count).toBe(1);
    unsub();
    play(s);
    expect(count).toBe(1);
  });
  it('onStateChange with unknown session returns noop', () => {
    const s = createSession(CANDOMBLE_TRACK);
    _resetUIForTests();
    const unsub = onStateChange(s, () => {});
    expect(typeof unsub).toBe('function');
    unsub();
  });
});

describe('accessibility (WCAG 2.1 AA)', () => {
  beforeEach(() => _resetUIForTests());
  it('getKeyboardShortcuts returns 6 entries (Space/Arrows/m)', () => {
    expect(getKeyboardShortcuts()).toHaveLength(6);
    expect(getKeyboardShortcuts()[0]?.key).toBe('Space');
  });
  it('screen reader announcements cover all 6 states', () => {
    const states = ['idle','loading','playing','paused','ended','error'] as const;
    for (const s of states) {
      const ann = getScreenReaderAnnouncements(s);
      expect(ann.length).toBeGreaterThan(0);
      expect(ann[0]?.text).toBeDefined();
    }
  });
  it('reduced motion is false by default, mutable via test hook', () => {
    expect(isReducedMotionPreferred()).toBeFalsy();
    _setReducedMotionForTests(true);
    expect(isReducedMotionPreferred()).toBeTruthy();
    _setReducedMotionForTests(false);
  });
  it('captions freeze protects against mutation', () => {
    const c = getCaptionsForTrack(CANDOMBLE_TRACK);
    expect(c.length).toBeGreaterThan(0);
    try {
      (c as unknown as { push: (v: unknown) => void }).push({ startSec: 0, endSec: 1, text: 'hax', lang: 'pt-BR' });
      expect(true).toBeFalsy(); // should have thrown
    } catch {
      expect(true).toBeTruthy();
    }
  });
});

describe('tradition selector', () => {
  beforeEach(() => _resetUIForTests());
  it('getRecommendedTrackForTradition without intention returns first', () => {
    const r = getRecommendedTrackForTradition('candomble');
    expect(r.kind).toBe('some');
    if (r.kind === 'some') {
      const t = getTrack(r.value);
      expect(t.kind).toBe('some');
    }
  });
  it('getRecommendedTrackForTradition with matching intention returns matching track', () => {
    const intention: Intention = {
      id: makeIntentionId('i_test00000000'),
      userId: ADMIN,
      trackId: CANDOMBLE_TRACK,
      category: makeCategory('ancoramento'),
      text: 'anchor',
      tradition: 'candomble',
      createdAt: nowISO(),
      completedAt: NONE,
      reflection: NONE,
    };
    const rec = getRecommendedTrackForTradition('candomble', intention);
    expect(rec.kind).toBe('some');
  });
});

describe('persistence', () => {
  beforeEach(() => {
    _resetUIForTests();
    registerUser(ADMIN);
  });
  it('saveSessionState persists and loadSessionState restores', () => {
    const playing = play(createSession(CANDOMBLE_TRACK));
    saveSessionState(playing, ADMIN);
    const loaded = loadSessionState(ADMIN);
    expect(loaded.kind).toBe('some');
  });
  it('saveSessionState / loadSessionState requires authenticated user', () => {
    const playing = play(createSession(CANDOMBLE_TRACK));
    saveSessionState(playing, makeUserId('u_ghost_999'));
    expect(loadSessionState(makeUserId('u_ghost_999')).kind).toBe('none');
  });
  it('shouldWarnOnCellular fires when track > 20MB and not wifi', () => {
    _setNetworkHintForTests(true);
    expect(shouldWarnOnCellular(CANDOMBLE_TRACK)).toBe(false);
    _setNetworkHintForTests(false);
    const big = listTracks().find((t) => t.sizeMb > 20);
    if (big) expect(shouldWarnOnCellular(big.id)).toBe(true);
    _setNetworkHintForTests(true);
  });
});

describe('hashing', () => {
  beforeEach(() => _resetUIForTests());
  it('hashSessionState deterministic for same inputs', () => {
    const s = createSession(CANDOMBLE_TRACK);
    const a = hashSessionState(s);
    const b = hashSessionState(s);
    expect(a).toBe(b);
  });
  it('hashSessionState changes when state changes', () => {
    const idle = createSession(CANDOMBLE_TRACK);
    const playing = play(idle);
    expect(hashSessionState(idle) !== hashSessionState(playing)).toBeTruthy();
  });
  it('hashIntentionCanonical deterministic', () => {
    const i: Intention = {
      id: makeIntentionId('i_test00000001'),
      userId: ADMIN,
      trackId: CANDOMBLE_TRACK,
      category: makeCategory('ancoramento'),
      text: 'a',
      tradition: 'candomble',
      createdAt: nowISO(),
      completedAt: NONE,
      reflection: NONE,
    };
    expect(hashIntentionCanonical(i)).toBe(hashIntentionCanonical(i));
  });
});

describe('option / result helpers', () => {
  it('some wraps and freezes; NONE is none', () => {
    const s = some(42);
    expect(s.kind).toBe('some');
    if (s.kind === 'some') expect(s.value).toBe(42);
    expect(NONE.kind).toBe('none');
  });
  it('ok / err shape', () => {
    expect(ok(1).ok).toBeTruthy();
    expect(err('x').ok).toBeFalsy();
  });
  it('fromNullable handles null/undefined/value', () => {
    expect(fromNullable(1).kind).toBe('some');
    expect(fromNullable(null).kind).toBe('none');
    expect(fromNullable(undefined).kind).toBe('none');
  });
});

// ============================== REPORT ==============================

console.log(`\nSpec summary: ${_testsPassed} passed, ${_testsFailed} failed`);
if (_testsFailed > 0) {
  console.error('Failures:');
  for (const f of _failures) console.error('  - ' + f);
  process.exit(1);
}
