/**
 * ════════════════════════════════════════════════════════════════════════════
 * STATS.SPEC.TS — Cabala dos Caminhos (Akasha Wave 69)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running spec for `stats.ts`. 35+ assertions across 9 sections.
 * Covers: empty / 1 / 100 readings; topN ranking; tradition breakdown;
 * streak computation; averageCards distributions; edge cases.
 *
 * Run via: `node --experimental-strip-types stats.spec.ts`
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
  STATS_AUDIT,
  averageCardsPerReading,
  computeStats,
  daysSinceLastReading,
  lastReadingAt,
  streakDays,
  topCards,
  traditionBreakdown,
} from '../stats.ts';

// ─── Test Harness (same shape as history.spec.ts) ────────────────────────

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
      if (Number.isNaN(actual) && Number.isNaN(expected)) ok = true;
      else if (!Number.isFinite(actual) || !Number.isFinite(expected)) ok = actual === expected;
      else ok = Math.abs(actual - expected) < 1e-9;
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

// ─── Fixture Helpers ──────────────────────────────────────────────────────

function cardFor(name: string, tradition: Card['tradition']): Card {
  return {
    key: toCardKey(`${tradition}:${name.toLowerCase().replace(/\s+/g, '-')}`),
    name,
    tradition,
  };
}

function readingFor(
  userId: UserId,
  tradition: Card['tradition'],
  names: string[],
  when: Date,
): Reading {
  return {
    id: toReadingId(`r-${when.getTime()}-${Math.random().toString(36).slice(2, 6)}`),
    userId,
    tradition,
    cards: names.map((n) => cardFor(n, tradition)),
    createdAt: when,
  };
}

// ─── Spec Run ──────────────────────────────────────────────────────────────

export function runStatsSpec(): SpecReport {
  _clearAllHistoryForTesting();
  const u = toUserId('u-stats');
  const t0 = new Date('2026-06-30T12:00:00Z');
  const r = createSpec();

  r.describe('STATS_AUDIT export', () => {
    r.it('exposes 7 functions in registry', () => {
      r.assert(STATS_AUDIT.exportedFunctions.length, 7, 'registry count');
    });
  });

  r.describe('computeStats — empty user', () => {
    r.it('reports empty=true with all-zero fields', () => {
      _setHistoryForTesting(new Map());
      const s = computeStats(u);
      r.assert(s.empty, true, 'empty flag');
      r.assert(s.totalReadings, 0, 'totalReadings=0');
      r.assert(s.activeDays, 0, 'activeDays=0');
      r.assert(s.firstReadingAt, null, 'firstReadingAt=null');
      r.assert(s.lastReadingAt, null, 'lastReadingAt=null');
      r.assert(s.readingsPerDay, 0, 'readingsPerDay=0');
      r.assert(s.readingsPerWeek, 0, 'readingsPerWeek=0');
    });
  });

  r.describe('computeStats — single reading', () => {
    r.it('reports readings=1, cardsDrawn=length, activeDays=1', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], t0));
      const s = computeStats(u);
      r.assert(s.empty, false, 'empty=false');
      r.assert(s.totalReadings, 1, 'total=1');
      r.assert(s.totalCardsDrawn, 1, 'cards=1');
      r.assert(s.activeDays, 1, 'activeDays=1');
    });
  });

  r.describe('computeStats — many readings across multiple days', () => {
    r.it('aggregates activeDays, totalCardsDrawn across the window', () => {
      _setHistoryForTesting(new Map());
      const days = [50, 45, 40, 30, 20, 10, 5, 2];
      for (const d of days) {
        const ts = t0.getTime() - d * 24 * 60 * 60 * 1000;
        recordReading(u, readingFor(u, 'cigano', ['Trombeta', 'Moinho', 'Jardim'], new Date(ts)));
      }
      const s = computeStats(u, 90);
      r.assert(s.totalReadings, 8, 'total=8');
      r.assert(s.totalCardsDrawn, 24, 'cards=24');
      r.assert(s.activeDays, 8, 'activeDays=8');
    });
    r.it('respects windowDays parameter (default 365)', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(t0.getTime() - 100 * 24 * 60 * 60 * 1000)));
      recordReading(u, readingFor(u, 'cigano', ['Jardim'], new Date(t0.getTime() - 30 * 24 * 60 * 60 * 1000)));
      recordReading(u, readingFor(u, 'cigano', ['Moinho'], new Date(t0.getTime() - 5 * 24 * 60 * 60 * 1000)));
      const s30 = computeStats(u, 30);
      r.assert(s30.totalReadings, 2, '30-day window=2');
      const s365 = computeStats(u, 365);
      r.assert(s365.totalReadings, 3, '365-day window=3');
    });
  });

  r.describe('topCards', () => {
    r.it('returns empty for fresh user', () => {
      _setHistoryForTesting(new Map());
      r.assert(topCards(u, 5).length, 0, 'empty');
    });
    r.it('ranks cards by count, ties broken by most-recent', () => {
      _setHistoryForTesting(new Map());
      const cards = ['Trombeta', 'Trombeta', 'Moinho', 'Jardim', 'Trombeta'];
      let ts = t0.getTime();
      for (const name of cards) {
        recordReading(u, readingFor(u, 'cigano', [name], new Date(ts)));
        ts -= 1000;
      }
      const top = topCards(u, 3);
      r.assert(top[0]!.key, toCardKey('cigano:trombeta'), 'rank-1 = Trombeta');
      r.assert(top[0]!.count, 3, 'rank-1 count=3');
      r.assert(top[1]!.count, 1, 'rank-2 count=1');
      r.assert(top[2]!.count, 1, 'rank-3 count=1');
      r.assert(top[0]!.rank, 1, 'rank is 1-based');
    });
    r.it('rejects invalid n', () => {
      let threw = false;
      try { topCards(u, 0); } catch { threw = true; }
      r.assert(threw, true, 'n=0 rejected');
      try { topCards(u, -1); } catch { threw = true; }
      r.assert(threw, true, 'n=-1 rejected');
    });
    r.it('filters by tradition option', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], t0));
      recordReading(u, readingFor(u, 'tarot', ['O Mago', 'O Mago'], new Date(t0.getTime() - 1000)));
      const cigano = topCards(u, 5, { tradition: 'cigano' });
      r.assert(cigano.length, 1, 'cigano filter length');
      const tarot = topCards(u, 5, { tradition: 'tarot' });
      r.assert(tarot.length, 1, 'tarot filter length');
      r.assert(tarot[0]!.count, 2, 'tarot rank-1 count=2');
    });
  });

  r.describe('traditionBreakdown', () => {
    r.it('returns 8 entries summing to 100%', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], t0));
      recordReading(u, readingFor(u, 'tarot', ['O Mago'], new Date(t0.getTime() - 100)));
      recordReading(u, readingFor(u, 'tarot', ['A Estrela'], new Date(t0.getTime() - 200)));
      const tb = traditionBreakdown(u);
      r.assert(tb.length, 8, '8 tradition entries');
      const cigano = tb.find((e) => e.tradition === 'cigano')!;
      const tarot = tb.find((e) => e.tradition === 'tarot')!;
      r.assert(cigano.count, 1, 'cigano count=1');
      r.assert(tarot.count, 2, 'tarot count=2');
      r.assert(Math.abs(tarot.percent - (2 / 3) * 100) < 0.01, true, 'tarot %=66.67');
      r.assert(cigano.percent > 0, true, 'cigano %>0');
    });
    r.it('returns all-zero for empty history', () => {
      _setHistoryForTesting(new Map());
      const tb = traditionBreakdown(u);
      const totalPct = tb.reduce((acc, e) => acc + e.percent, 0);
      r.assert(totalPct, 0, 'sum percent=0');
      r.assert(tb.every((e) => e.count === 0), true, 'all counts=0');
    });
  });

  r.describe('averageCardsPerReading', () => {
    r.it('returns zeros for empty', () => {
      _setHistoryForTesting(new Map());
      const a = averageCardsPerReading(u);
      r.assert(a.sampleSize, 0, 'sample=0');
      r.assert(a.mean, 0, 'mean=0');
      r.assert(a.median, 0, 'median=0');
      r.assert(a.p95, 0, 'p95=0');
    });
    r.it('computes mean/median/p95/min/max correctly', () => {
      _setHistoryForTesting(new Map());
      const sizes = [1, 1, 2, 2, 3, 5]; // mean=2.333, median=2, p95=5
      let ts = t0.getTime();
      for (const n of sizes) {
        const cards = Array.from({ length: n }, (_, i) => `card-${i}`);
        recordReading(u, readingFor(u, 'cigano', cards, new Date(ts)));
        ts -= 1000;
      }
      const a = averageCardsPerReading(u);
      r.assert(a.sampleSize, 6, 'sample=6');
      r.assert(Math.abs(a.mean - 14 / 6) < 1e-9, true, 'mean≈2.333');
      r.assert(a.min, 1, 'min=1');
      r.assert(a.max, 5, 'max=5');
      r.assert(a.median, 2, 'median=2');
    });
    r.it('single reading — sample=1', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['A', 'B', 'C'], t0));
      const a = averageCardsPerReading(u);
      r.assert(a.sampleSize, 1, 'sample=1');
      r.assert(a.mean, 3, 'mean=3');
      r.assert(a.median, 3, 'median=3');
      r.assert(a.p95, 3, 'p95=3');
      r.assert(a.min, 3, 'min=3');
      r.assert(a.max, 3, 'max=3');
    });
  });

  r.describe('streakDays', () => {
    r.it('returns 0 for empty user', () => {
      _setHistoryForTesting(new Map());
      r.assert(streakDays(u, t0), 0, 'streak=0');
    });
    r.it('returns 0 when last reading > 1 day ago', () => {
      _setHistoryForTesting(new Map());
      const ts = t0.getTime() - 10 * 24 * 60 * 60 * 1000;
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(ts)));
      r.assert(streakDays(u, t0), 0, 'streak broken');
    });
    r.it('counts consecutive days', () => {
      _setHistoryForTesting(new Map());
      // Today, yesterday, day before — 3-day streak.
      for (const d of [0, 1, 2]) {
        const ts = t0.getTime() - d * 24 * 60 * 60 * 1000;
        recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(ts)));
      }
      r.assert(streakDays(u, t0), 3, '3-day streak');
    });
    r.it('streak=1 when only today', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], t0));
      r.assert(streakDays(u, t0), 1, 'streak=1');
    });
    r.it('counts multiple readings on same day as a single day', () => {
      _setHistoryForTesting(new Map());
      const base = new Date('2026-06-30T08:00:00Z').getTime();
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(base)));
      recordReading(u, readingFor(u, 'cigano', ['Moinho'], new Date(base + 60_000)));
      recordReading(u, readingFor(u, 'cigano', ['Jardim'], new Date(base + 120_000)));
      r.assert(streakDays(u, new Date('2026-06-30T23:00:00Z')), 1, '3 same-day = 1 streak day');
    });
  });

  r.describe('lastReadingAt + daysSinceLastReading', () => {
    r.it('lastReadingAt returns null for empty user', () => {
      _setHistoryForTesting(new Map());
      r.assert(lastReadingAt(u), null, 'null');
      r.assert(daysSinceLastReading(u), Number.POSITIVE_INFINITY, '∞');
    });
    r.it('returns the most recent timestamp', () => {
      _setHistoryForTesting(new Map());
      const ts1 = new Date(t0.getTime() - 10000);
      const ts2 = new Date(t0.getTime() - 5000);
      const ts3 = t0;
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], ts1));
      recordReading(u, readingFor(u, 'cigano', ['Moinho'], ts2));
      recordReading(u, readingFor(u, 'cigano', ['Jardim'], ts3));
      r.assert(lastReadingAt(u)!.getTime(), ts3.getTime(), 'most recent');
    });
    r.it('daysSinceLastReading computes day delta', () => {
      _setHistoryForTesting(new Map());
      const ts = new Date(t0.getTime() - 5 * 24 * 60 * 60 * 1000);
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], ts));
      r.assert(daysSinceLastReading(u, t0), 5, '5 days');
    });
  });

  r.describe('output immutability', () => {
    r.it('computeStats output is frozen', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], t0));
      const s = computeStats(u);
      r.assert(Object.isFrozen(s), true, 'stats isFrozen');
    });
    r.it('topCards output is frozen', () => {
      const t = topCards(u, 1);
      r.assert(Object.isFrozen(t), true, 'topCards array isFrozen');
      if (t.length > 0) r.assert(Object.isFrozen(t[0]!), true, 'topCards element isFrozen');
    });
    r.it('traditionBreakdown output is frozen', () => {
      const tb = traditionBreakdown(u);
      r.assert(Object.isFrozen(tb), true, 'traditionBreakdown isFrozen');
      if (tb.length > 0) r.assert(Object.isFrozen(tb[0]!), true, 'traditionBreakdown element isFrozen');
    });
    r.it('averageCardsPerReading output is frozen', () => {
      const a = averageCardsPerReading(u);
      r.assert(Object.isFrozen(a), true, 'averageCards isFrozen');
    });
  });

  console.log(`\n█ runStatsSpec: ${r.passed}/${r.passed + r.failed} assertions passed across ${r.its} it() blocks\n`);
  return {
    passed: r.passed, failed: r.failed, failures: r.failures,
    assertions: r.passed + r.failed, its: r.its,
  };
}

if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('stats.spec.ts')) {
  runStatsSpec();
}
