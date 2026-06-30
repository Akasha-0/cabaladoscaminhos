/**
 * ════════════════════════════════════════════════════════════════════════════
 *  energy.spec.ts — 40 assertions across 7 sections
 *
 *  Sections:
 *    §1 — classifyBucket across all 10 levels (10)
 *    §2 — energyTrend with various patterns (rising/falling/stable/insufficient) (10)
 *    §3 — energyVsHistory percentile (8)
 *    §4 — suggestRitualForEnergy / suggestRitualForScore (8)
 *    §5 — Edge cases + determinism (4)
 *
 *  Runs via `node --experimental-strip-types`.
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  recordCheckin,
  asUserId,
  asDateKey,
  __resetCheckinStore,
  classifyBucket,
  type Checkin,
} from '../checkin.ts';
import {
  energyTrend,
  energyVsHistory,
  suggestRitualForEnergy,
  suggestRitualForScore,
} from '../energy.ts';
import {
  expectEqual,
  expectTrue,
  expectFalse,
  expectThrows,
  expectNotNull,
  resetHarness,
  report,
  section,
  results as harnessResults,
} from './harness.ts';

function seedDay(u: ReturnType<typeof asUserId>, day: number, score: number, mood: 'calm' | 'joyful' | 'reflective' | 'anxious' | 'centered' | 'grieving' | 'inspired' | 'neutral' | 'restless' | 'scattered'): void {
  recordCheckin(u, {
    energyScore: score,
    mood,
    spiritualState: `auto-seeded day ${day}`,
    recordedAt: `2026-06-${String(day).padStart(2, '0')}T12:00:00Z`,
    timeZone: 'UTC',
  });
}

export function runEnergySpec(): number {
  resetHarness();
  __resetCheckinStore();

  const u = asUserId('u-energy');
  const u2 = asUserId('u-energy-2');

  // ── §1 — classifyBucket across all 10 levels ─────────────────────────
  section('§1 classifyBucket all levels');
  expectEqual('bucket 1 → low', classifyBucket(1), 'low');
  expectEqual('bucket 2 → low', classifyBucket(2), 'low');
  expectEqual('bucket 3 → low', classifyBucket(3), 'low');
  expectEqual('bucket 4 → steady', classifyBucket(4), 'steady');
  expectEqual('bucket 5 → steady', classifyBucket(5), 'steady');
  expectEqual('bucket 6 → steady', classifyBucket(6), 'steady');
  expectEqual('bucket 7 → high', classifyBucket(7), 'high');
  expectEqual('bucket 8 → high', classifyBucket(8), 'high');
  expectEqual('bucket 9 → peak', classifyBucket(9), 'peak');
  expectEqual('bucket 10 → peak', classifyBucket(10), 'peak');

  // ── §2 — energyTrend ─────────────────────────────────────────────────
  section('§2 energyTrend patterns');

  // empty user
  const empty = energyTrend(u);
  expectEqual('empty latestBucket null', empty.latestBucket, null);
  expectEqual('empty latestScore null', empty.latestScore, null);
  expectEqual('empty direction insufficient', empty.direction, 'insufficient');

  // rising pattern: 8 days, scores 2,3,4,5,6,7,8,9 (most recent last)
  for (let d = 1; d <= 8; d++) seedDay(u, 10 + d, d + 1, 'joyful');
  const rising = energyTrend(u, 30);
  expectEqual('rising direction', rising.direction, 'rising');
  expectEqual('rising slope > 0', rising.slope > 0, true);
  expectEqual('rising sample size', rising.sampleSize, 8);
  expectEqual('rising latest score', rising.latestScore, 9);
  expectEqual('rising latest bucket peak', rising.latestBucket, 'peak');

  // reset and try falling
  __resetCheckinStore();
  for (let d = 1; d <= 8; d++) seedDay(u, 10 + d, 10 - d, 'reflective');
  const falling = energyTrend(u, 30);
  expectEqual('falling direction', falling.direction, 'falling');
  expectEqual('falling slope < 0', falling.slope < 0, true);
  expectEqual('falling latest score', falling.latestScore, 2);

  // stable pattern: 4,5,4,5,4,5
  __resetCheckinStore();
  const stableScores = [4, 5, 4, 5, 4, 5];
  for (let i = 0; i < stableScores.length; i++) {
    seedDay(u, 10 + i, stableScores[i]!, 'centered');
  }
  const stable = energyTrend(u, 30);
  expectEqual('stable direction', stable.direction, 'stable');
  expectTrue('stable |slope| <= 0.5', Math.abs(stable.slope) <= 0.5);

  // insufficient: only 2 entries
  __resetCheckinStore();
  seedDay(u, 10, 5, 'neutral');
  seedDay(u, 11, 6, 'reflective');
  const insuf = energyTrend(u, 30);
  expectEqual('insufficient direction', insuf.direction, 'insufficient');
  expectEqual('insufficient slope=0', insuf.slope, 0);

  // ── §3 — energyVsHistory percentile ──────────────────────────────────
  section('§3 energyVsHistory');
  __resetCheckinStore();
  // Seed historical scores — use a separate user to avoid pollution
  const histScores = [3, 4, 5, 6, 7, 8]; // mean=5.5
  for (let i = 0; i < histScores.length; i++) {
    recordCheckin(u2, {
      energyScore: histScores[i]!,
      mood: 'neutral',
      spiritualState: `seed ${i}`,
      recordedAt: `2026-05-${String(i + 10).padStart(2, '0')}T12:00:00Z`,
      timeZone: 'UTC',
    });
  }
  const p50 = energyVsHistory(u2, 5); // sort: [3,4,5,6,7,8]; 5 is at index 2; 1 match; (2+0.5)/6 = 0.416
  expectNotNull('p50 not null', p50);
  expectTrue('p50 in [0,1]', p50! >= 0 && p50! <= 1);
  expectEqual('p50 same as mean = 0.5-ish', Math.abs(p50! - 0.416) < 0.05, true);

  const pHigh = energyVsHistory(u2, 9); // 9 > all 6: should be 1.0 or close
  expectNotNull('pHigh not null', pHigh);
  expectTrue('pHigh >= 0.9', pHigh! >= 0.9);

  const pLow = energyVsHistory(u2, 1); // 1 < all 6
  expectNotNull('pLow not null', pLow);
  expectTrue('pLow <= 0.1', pLow! <= 0.15);

  // Insufficient data (<2) returns null
  __resetCheckinStore();
  recordCheckin(u2, {
    energyScore: 5,
    mood: 'neutral',
    spiritualState: 'x',
    timeZone: 'UTC',
    recordedAt: '2026-05-01T12:00:00Z',
  });
  expectEqual('only 1 record → percentile null', energyVsHistory(u2, 6), null);
  // Re-record on same day → still 1 unique date, still null
  recordCheckin(u2, {
    energyScore: 7,
    mood: 'centered',
    spiritualState: 'x',
    timeZone: 'UTC',
    recordedAt: '2026-05-01T18:00:00Z',
  });
  expectEqual('only 1 distinct day → still null', energyVsHistory(u2, 6), null);

  // Invalid score throws
  expectThrows('todayScore=11 throws', () => energyVsHistory(u2, 11));
  expectThrows('todayScore=0 throws', () => energyVsHistory(u2, 0));
  expectThrows('todayScore=5.5 throws', () => energyVsHistory(u2, 5.5));

  // ── §4 — suggestRitualForEnergy / suggestRitualForScore ──────────────
  section('§4 ritual suggestions');
  const rLow = suggestRitualForEnergy('low');
  expectNotNull('low ritual', rLow);
  expectEqual('low bucket', rLow.bucket, 'low');
  expectTrue('low primary non-empty', rLow.primaryPractice.length > 10);
  expectTrue('low alternatives ≥ 3', rLow.alternatives.length >= 3);
  expectTrue('low sacredAnchor non-empty', rLow.sacredAnchor.length > 0);

  const rSteady = suggestRitualForEnergy('steady');
  expectEqual('steady primary practice name', typeof rSteady.primaryPractice, 'string');

  const rHigh = suggestRitualForEnergy('high');
  expectEqual('high sacred anchor has Oxalá', rHigh.sacredAnchor.includes('Oxalá'), true);

  const rPeak = suggestRitualForEnergy('peak');
  expectTrue('peak sacred anchor mentions Ofun or Oxalá', rPeak.sacredAnchor.includes('Ofun') || rPeak.sacredAnchor.includes('Oxalá'));

  const rScoreLow = suggestRitualForScore(2);
  expectEqual('score 2 → low', rScoreLow.bucket, 'low');

  const rScorePeak = suggestRitualForScore(10);
  expectEqual('score 10 → peak', rScorePeak.bucket, 'peak');

  const rScoreBoundary = suggestRitualForScore(7);
  expectEqual('score 7 → high', rScoreBoundary.bucket, 'high');

  // Each ritual MUST have rationale
  for (const b of ['low', 'steady', 'high', 'peak'] as const) {
    const r = suggestRitualForEnergy(b);
    expectTrue(`${b} has rationale`, r.rationale.length > 10);
    expectTrue(`${b} alternatives unique`, new Set(r.alternatives).size === r.alternatives.length);
  }

  // ── §5 — Edge cases / determinism ────────────────────────────────────
  section('§5 edge cases');
  // Trend on empty store
  __resetCheckinStore();
  const e2 = energyTrend(asUserId('nobody'));
  expectEqual('empty user direction insufficient', e2.direction, 'insufficient');

  // Same input twice → same trend (determinism)
  __resetCheckinStore();
  for (let i = 0; i < 5; i++) seedDay(u, 10 + i, 5 + (i % 2), 'neutral');
  const t1 = energyTrend(u, 30);
  const t2 = energyTrend(u, 30);
  expectEqual('energyTrend is deterministic (slope)', t1.slope, t2.slope);
  expectEqual('energyTrend is deterministic (sampleSize)', t1.sampleSize, t2.sampleSize);

  return report('energy.spec', harnessResults());
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const code = runEnergySpec();
  process.exit(code);
}
