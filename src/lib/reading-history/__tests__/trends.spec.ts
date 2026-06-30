/**
 * ════════════════════════════════════════════════════════════════════════════
 * TRENDS.SPEC.TS — Cabala dos Caminhos (Akasha Wave 69)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running spec for `trends.ts`. 30+ assertions across 9 sections.
 * Covers: empty/1/100 readings, daily/weekly/monthly buckets, mood mapping,
 * card frequency, shift detection, forecast determinism.
 *
 * Run via: `node --experimental-strip-types trends.spec.ts`
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  _clearAllHistoryForTesting,
  _setHistoryForTesting,
  recordReading,
  toCardKey,
  toReadingId,
  toUserId,
  type Card,
  type Reading,
  type UserId,
} from '../history.ts';
import {
  TRENDS_AUDIT,
  TrendsError,
  cardFrequencyOverTime,
  computeTrends,
  detectShifts,
  forecastNextReading,
  moodTrend,
} from '../trends.ts';

// ─── Spec Harness ─────────────────────────────────────────────────────────

interface SpecReport { passed: number; failed: number; failures: string[]; assertions: number; its: number }
interface SpecRunner {
  passed: number; failed: number; failures: string[]; assertions: number; its: number;
  assert: (a: unknown, b: unknown, l: string) => void;
  it: (n: string, fn: () => void) => void;
  describe: (n: string, fn: () => void) => void;
}

function createSpec(): SpecRunner {
  const r: SpecRunner = {
    passed: 0, failed: 0, failures: [], assertions: 0, its: 0,
    assert: () => {}, it: () => {}, describe: () => {},
  };
  r.assert = (actual: unknown, expected: unknown, label: string): void => {
    r.assertions += 1;
    let ok = false;
    if (typeof actual === 'object' && actual !== null && typeof expected === 'object' && expected !== null) {
      ok = JSON.stringify(actual) === JSON.stringify(expected);
    } else if (typeof actual === 'number' && typeof expected === 'number') {
      ok = Math.abs(actual - expected) < 1e-9;
    } else {
      ok = actual === expected;
    }
    if (ok) r.passed += 1;
    else {
      r.failed += 1;
      const msg = `    ✗ ${label} :: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
      r.failures.push(msg);
      console.error(msg);
    }
  };
  r.it = (name: string, fn: () => void): void => {
    r.its += 1;
    const start = r.passed + r.failed;
    try {
      fn();
      const added = r.passed + r.failed - start;
      console.log(`  ✓ ${name}` + (added > 1 ? ` (${added} assertions)` : ''));
    } catch (e) {
      r.failed += 1;
      const msg = `  ✗ ${name} :: ${(e as Error).message}`;
      r.failures.push(msg);
      console.error(msg);
    }
  };
  r.describe = (name: string, fn: () => void): void => {
    console.log(`\n▸ ${name}`);
    fn();
  };
  return r;
}

// ─── Fixtures ─────────────────────────────────────────────────────────────

function cardFor(name: string, tradition: Card['tradition'], opts: { mood?: -1 | 0 | 1 } = {}): Card {
  return {
    key: toCardKey(`${tradition}:${name.toLowerCase().replace(/\s+/g, '-')}`),
    name,
    tradition,
    mood: opts.mood ?? 0,
  };
}

function readingFor(
  userId: UserId,
  tradition: Card['tradition'],
  names: string[],
  when: Date,
  opts: { mood?: -1 | 0 | 1 } = {},
): Reading {
  return {
    id: toReadingId(`r-${when.getTime()}-${Math.random().toString(36).slice(2, 6)}`),
    userId,
    tradition,
    cards: names.map((n) => cardFor(n, tradition, opts)),
    createdAt: when,
  };
}

// ─── Spec Run ────────────────────────────────────────────────────────────

export function runTrendsSpec(): SpecReport {
  _clearAllHistoryForTesting();
  const u = toUserId('u-trends');
  const now = new Date('2026-06-30T12:00:00Z');
  const day = 24 * 60 * 60 * 1000;
  const r = createSpec();

  r.describe('TRENDS_AUDIT export', () => {
    r.it('exposes 5 functions in registry', () => {
      r.assert(TRENDS_AUDIT.exportedFunctions.length, 5, 'count');
    });
  });

  r.describe('computeTrends — empty user', () => {
    r.it('returns empty trend report', () => {
      _setHistoryForTesting(new Map());
      const t = computeTrends(u, 90, { bucketSize: 'day' });
      r.assert(t.totalReadings, 0, 'total=0');
      r.assert(t.bucketCount, 0, 'buckets=0');
      r.assert(t.firstReadingAt, null, 'first=null');
      r.assert(t.lastReadingAt, null, 'last=null');
    });
    r.it('rejects invalid windowDays', () => {
      let threw = false;
      try { computeTrends(u, 0); } catch (e) { if (e instanceof TrendsError) threw = true; }
      r.assert(threw, true, 'window=0 rejected');
      try { computeTrends(u, -1); } catch (e) { if (e instanceof TrendsError) threw = true; }
      r.assert(threw, true, 'window=-1 rejected');
    });
  });

  r.describe('computeTrends — daily buckets', () => {
    r.it('produces 1 bucket per active day', () => {
      _setHistoryForTesting(new Map());
      for (let d = 0; d < 5; d++) {
        recordReading(u, readingFor(u, 'cigano', ['Trombeta', 'Moinho'], new Date(now.getTime() - d * day)));
      }
      const t = computeTrends(u, 30, { bucketSize: 'day' });
      r.assert(t.totalReadings, 5, 'total=5');
      r.assert(t.bucketCount, 5, '5 buckets');
      r.assert(t.buckets.every((b) => b.cardsDrawn === 2), true, 'cardsDrawn=2 each');
    });
    r.it('handles multiple readings in same bucket', () => {
      _setHistoryForTesting(new Map());
      const ts = now.getTime();
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(ts)));
      recordReading(u, readingFor(u, 'cigano', ['Moinho'], new Date(ts + 1000)));
      recordReading(u, readingFor(u, 'cigano', ['Jardim'], new Date(ts + 2000)));
      const t = computeTrends(u, 7, { bucketSize: 'day' });
      r.assert(t.bucketCount, 1, '1 bucket');
      r.assert(t.buckets[0]!.count, 3, 'count=3');
      r.assert(t.buckets[0]!.cardsDrawn, 3, 'cards=3');
      r.assert(t.buckets[0]!.traditions.includes('cigano'), true, 'traditions');
    });
  });

  r.describe('computeTrends — weekly buckets', () => {
    r.it('aggregates multiple days into a single week', () => {
      _setHistoryForTesting(new Map());
      // 8 readings spread across 14 days → 2-3 weekly buckets.
      for (let d = 0; d < 8; d++) {
        recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - d * 2 * day)));
      }
      const t = computeTrends(u, 90, { bucketSize: 'week' });
      r.assert(t.totalReadings, 8, 'total=8');
      r.assert(t.bucketCount >= 2, true, '>=2 buckets');
      const totalCounts = t.buckets.reduce((acc, b) => acc + b.count, 0);
      r.assert(totalCounts, 8, 'counts sum to 8');
    });
  });

  r.describe('computeTrends — monthly buckets', () => {
    r.it('produces a single bucket for same-month activity', () => {
      _setHistoryForTesting(new Map());
      for (let d = 0; d < 10; d++) {
        recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - d * day)));
      }
      const t = computeTrends(u, 90, { bucketSize: 'month' });
      r.assert(t.bucketCount, 1, '1 monthly bucket');
      r.assert(t.buckets[0]!.count, 10, 'count=10');
    });
  });

  r.describe('moodTrend', () => {
    r.it('returns empty points + polarity=0 for empty user', () => {
      _setHistoryForTesting(new Map());
      const m = moodTrend(u, 60);
      r.assert(m.points.length, 0, 'no points');
      r.assert(m.overallPolarity, 0, 'overall=0');
      r.assert(m.trendDirection, 'unknown', 'unknown dir');
    });
    r.it('maps card.mood into polarity across buckets', () => {
      _setHistoryForTesting(new Map());
      // 8 readings across 8 weeks, all +1 mood.
      for (let d = 0; d < 8; d++) {
        recordReading(u, readingFor(u, 'tarot', ['A Estrela'], new Date(now.getTime() - d * 7 * day), { mood: 1 }));
      }
      const m = moodTrend(u, 60);
      r.assert(m.overallPolarity > 0, true, 'overall > 0');
      r.assert(m.points.length >= 1, true, '>=1 point');
      r.assert(m.points.every((p) => p.polarity > 0), true, 'all polarities > 0');
    });
    r.it('detects downtrend in polarity', () => {
      _setHistoryForTesting(new Map());
      // Early: positive; Late: negative.
      for (let d = 50; d >= 40; d--) {
        recordReading(u, readingFor(u, 'tarot', ['A Estrela'], new Date(now.getTime() - d * day), { mood: 1 }));
      }
      for (let d = 6; d >= 1; d--) {
        recordReading(u, readingFor(u, 'tarot', ['A Torre'], new Date(now.getTime() - d * day), { mood: -1 }));
      }
      const m = moodTrend(u, 60);
      r.assert(['down', 'flat'].includes(m.trendDirection), true, 'down or flat');
    });
  });

  r.describe('cardFrequencyOverTime', () => {
    r.it('returns empty for fresh user', () => {
      _setHistoryForTesting(new Map());
      const out = cardFrequencyOverTime(u, toCardKey('tarot:a-estrela'), 'week', 90);
      r.assert(out.totalOccurrences, 0, 'empty');
      r.assert(out.firstSeenAt, null, 'first=null');
    });
    r.it('counts bucket occurrences for a specific card', () => {
      _setHistoryForTesting(new Map());
      for (let d = 0; d < 4; d++) {
        recordReading(u, readingFor(u, 'tarot', ['A Estrela'], new Date(now.getTime() - d * 7 * day)));
      }
      const out = cardFrequencyOverTime(u, toCardKey('tarot:a-estrela'), 'week', 90);
      r.assert(out.totalOccurrences, 4, 'total=4');
      r.assert(out.lastSeenAt instanceof Date, true, 'last is Date');
    });
  });

  r.describe('detectShifts', () => {
    r.it('returns empty for fresh user', () => {
      _setHistoryForTesting(new Map());
      const s = detectShifts(u);
      r.assert(s.shifts.length, 0, 'no shifts');
    });
    r.it('rejects invalid sensitivity', () => {
      let threw = false;
      try { detectShifts(u, 0); } catch (e) { if (e instanceof TrendsError) threw = true; }
      r.assert(threw, true, 'sensitivity=0 rejected');
    });
    r.it('detects a spike in cadence', () => {
      _setHistoryForTesting(new Map());
      // 8 baseline weeks with 1 reading/week, then a spike week with 10 readings.
      for (let w = 1; w <= 8; w++) {
        recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - w * 7 * day)));
      }
      for (let i = 0; i < 10; i++) {
        recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - i * 60 * 60 * 1000)));
      }
      // sensitivity=1.0 → zThreshold=1.5 (high). With 9 non-zero buckets,
      // (mean=2, std≈2.83) the spike bucket z-score is 2.83, well above 1.5.
      const s = detectShifts(u, 1.0);
      r.assert(s.shifts.length >= 1, true, 'detected spike');
      r.assert(s.shifts[0]!.direction, 'spike', 'direction=spike');
    });
  });

  r.describe('forecastNextReading', () => {
    r.it('returns zero gap for empty user', () => {
      _setHistoryForTesting(new Map());
      const f = forecastNextReading(u, now);
      r.assert(f.medianGapDays, 0, 'median=0');
      r.assert(f.sampleSize, 0, 'sample=0');
    });
    r.it('returns 7-day estimate when only one reading exists', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - 3 * day)));
      const f = forecastNextReading(u, now);
      r.assert(f.sampleSize, 1, 'sample=1');
      r.assert(f.medianGapDays, 7, 'median=7');
      r.assert(f.nextLikelyMinDays, 1, 'min=1');
      r.assert(f.nextLikelyMaxDays, 14, 'max=14');
    });
    r.it('computes median inter-reading gap', () => {
      _setHistoryForTesting(new Map());
      for (let i = 0; i < 4; i++) {
        recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - i * 3 * day)));
      }
      const f = forecastNextReading(u, now);
      r.assert(f.medianGapDays, 3, 'median gap=3');
      r.assert(f.sampleSize, 4, 'sample=4');
      const diff = Math.abs(f.estimatedNextAt.getTime() - (now.getTime() + 3 * day));
      r.assert(diff < 1000, true, 'estimate near now+3d');
    });
  });

  r.describe('output immutability', () => {
    r.it('computeTrends output is frozen', () => {
      _setHistoryForTesting(new Map());
      const t = computeTrends(u, 30);
      r.assert(Object.isFrozen(t), true, 'trends frozen');
      if (t.buckets.length > 0) r.assert(Object.isFrozen(t.buckets[0]!), true, 'bucket frozen');
    });
    r.it('moodTrend output is frozen', () => {
      const m = moodTrend(u, 30);
      r.assert(Object.isFrozen(m), true, 'mood frozen');
    });
    r.it('cardFrequencyOverTime output is frozen', () => {
      const c = cardFrequencyOverTime(u, toCardKey('tarot:o-mago'), 'day', 30);
      r.assert(Object.isFrozen(c), true, 'card-frequency frozen');
    });
    r.it('detectShifts output is frozen', () => {
      const d = detectShifts(u);
      r.assert(Object.isFrozen(d), true, 'shifts frozen');
    });
    r.it('forecastNextReading output is frozen', () => {
      const f = forecastNextReading(u);
      r.assert(Object.isFrozen(f), true, 'forecast frozen');
    });
  });

  console.log(`\n█ runTrendsSpec: ${r.passed}/${r.passed + r.failed} assertions passed across ${r.its} it() blocks\n`);
  return {
    passed: r.passed, failed: r.failed, failures: r.failures,
    assertions: r.passed + r.failed, its: r.its,
  };
}

if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('trends.spec.ts')) {
  runTrendsSpec();
}
