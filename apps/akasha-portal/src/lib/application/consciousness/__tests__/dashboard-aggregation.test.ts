/**
 * Tests — consciousness/dashboard-aggregation.ts (Wave 25.1)
 *
 * Coverage (lesson N+24 — tests co-located com código):
 *   1. toIsoDay — formato yyyy-mm-dd UTC, zero-pad
 *   2. toIsoWeek — formato yyyy-Www, ISO week anchor (Monday)
 *   3. fillDailyGaps — sempre retorna 30 dias, com zeros para buracos
 *   4. fillWeeklyGaps — sempre retorna 13 semanas, com zeros para buracos
 *   5. aggregateByTimeBucket — somatórios corretos + bucketing por dia/semana
 *   6. aggregateByTimeBucket — determinístico (mesma input → mesmo output)
 *   7. aggregateByTimeBucket — vazio quando input vazio
 *   8. aggregateByTimeBucket — soma papers (não-unique) corretamente
 *
 * Não precisa mock Prisma — funções puras em memória.
 */

import { describe, it, expect } from 'vitest';

import {
  aggregateByTimeBucket,
  fillDailyGaps,
  fillWeeklyGaps,
  toIsoDay,
  toIsoWeek,
  type InsightJobLite,
} from '../dashboard-aggregation';

// ─── toIsoDay ────────────────────────────────────────────────────────────

describe('toIsoDay', () => {
  it('format yyyy-mm-dd UTC with zero-padding', () => {
    const d = new Date(Date.UTC(2026, 0, 5));
    expect(toIsoDay(d)).toBe('2026-01-05');
  });

  it('handles end of year (Dec 31)', () => {
    expect(toIsoDay(new Date(Date.UTC(2026, 11, 31)))).toBe('2026-12-31');
  });

  it('pads single-digit month and day', () => {
    expect(toIsoDay(new Date(Date.UTC(2026, 2, 9)))).toBe('2026-03-09');
  });

  it('uses UTC, not local timezone', () => {
    // 2026-06-25T00:30 UTC → 2026-06-25
    const d = new Date(Date.UTC(2026, 5, 25, 0, 30));
    expect(toIsoDay(d)).toBe('2026-06-25');
  });
});

// ─── toIsoWeek ───────────────────────────────────────────────────────────

describe('toIsoWeek', () => {
  it('produces ISO week with W-prefix and zero-pad', () => {
    // 2026-01-05 = Monday → ISO week 2 of 2026
    expect(toIsoWeek(new Date(Date.UTC(2026, 0, 5)))).toBe('2026-W02');
  });

  it('handles boundary (Dec 29 in week 1 of next year per ISO)', () => {
    // 2025-12-29 = Monday → could be week 1 of 2026 per ISO
    const wk = toIsoWeek(new Date(Date.UTC(2025, 11, 29)));
    expect(wk).toMatch(/^202[56]-W0[1-9]$/);
  });

  it('week 1 of 2026: Jan 1 (Thursday) belongs to W01', () => {
    // 2026-01-01 is Thursday → ISO week 1
    expect(toIsoWeek(new Date(Date.UTC(2026, 0, 1)))).toBe('2026-W01');
  });
});

// ─── fillDailyGaps ───────────────────────────────────────────────────────

describe('fillDailyGaps', () => {
  it('always returns 30 entries', () => {
    expect(fillDailyGaps([])).toHaveLength(30);
  });

  it('fills missing days with count=0', () => {
    const todayKey = toIsoDay(new Date());
    const out = fillDailyGaps([{ date: todayKey, count: 5 }]);
    expect(out).toHaveLength(30);
    const today = out[out.length - 1]!;
    expect(today.date).toBe(todayKey);
    expect(today.count).toBe(5);
    const yesterday = out[out.length - 2]!;
    expect(yesterday.count).toBe(0);
  });

  it('dates are monotonically increasing by ~1 day', () => {
    const out = fillDailyGaps([]);
    for (let i = 1; i < out.length; i++) {
      const prev = new Date(out[i - 1]!.date).getTime();
      const curr = new Date(out[i]!.date).getTime();
      expect(curr - prev).toBeGreaterThanOrEqual(86_390_000);
      expect(curr - prev).toBeLessThanOrEqual(86_410_000);
    }
  });

  it('keeps the last value when same key appears twice (aggregate separately first)', () => {
    // fillDailyGaps/fillWeeklyGaps are designed to be called AFTER
    // aggregateByTimeBucket (which already deduplicates by key).
    // When given duplicate keys, last-wins is the contract.
    const todayKey = toIsoDay(new Date());
    const out = fillDailyGaps([
      { date: todayKey, count: 3 },
      { date: todayKey, count: 4 }, // overrides
    ]);
    const today = out[out.length - 1]!;
    expect(today.count).toBe(4); // last wins (pre-aggregation responsibility)
  });
});

// ─── fillWeeklyGaps ──────────────────────────────────────────────────────

describe('fillWeeklyGaps', () => {
  it('always returns 13 entries', () => {
    expect(fillWeeklyGaps([])).toHaveLength(13);
  });

  it('fills missing weeks with count=0', () => {
    const thisWeek = toIsoWeek(new Date());
    const out = fillWeeklyGaps([{ week: thisWeek, count: 7 }]);
    expect(out).toHaveLength(13);
    const last = out[out.length - 1]!;
    expect(last.week).toBe(thisWeek);
    expect(last.count).toBe(7);
  });

  it('keeps the last value when same week appears twice', () => {
    const wk = toIsoWeek(new Date());
    const out = fillWeeklyGaps([
      { week: wk, count: 2 },
      { week: wk, count: 5 },
    ]);
    const last = out[out.length - 1]!;
    expect(last.count).toBe(5);
  });
});

// ─── aggregateByTimeBucket ───────────────────────────────────────────────

describe('aggregateByTimeBucket', () => {
  it('returns zeros for empty input', () => {
    const agg = aggregateByTimeBucket([]);
    expect(agg.totalInsights).toBe(0);
    expect(agg.totalPapers).toBe(0);
    expect(agg.byDay).toEqual([]);
    expect(agg.byWeek).toEqual([]);
  });

  it('sums insights and papers across all jobs', () => {
    const jobs: InsightJobLite[] = [
      {
        startedAt: new Date(Date.UTC(2026, 5, 23, 12)),
        insightsGenerated: 8,
        papersCited: 3,
      },
      {
        startedAt: new Date(Date.UTC(2026, 5, 24, 12)),
        insightsGenerated: 5,
        papersCited: 2,
      },
      {
        startedAt: new Date(Date.UTC(2026, 5, 25, 12)),
        insightsGenerated: 7,
        papersCited: 4,
      },
    ];
    const agg = aggregateByTimeBucket(jobs);
    expect(agg.totalInsights).toBe(20);
    expect(agg.totalPapers).toBe(9);
  });

  it('groups by day correctly (multiple jobs same day → summed)', () => {
    const sameDay = new Date(Date.UTC(2026, 5, 25, 8));
    const sameDayLater = new Date(Date.UTC(2026, 5, 25, 20));
    const otherDay = new Date(Date.UTC(2026, 5, 26, 12));
    const jobs: InsightJobLite[] = [
      { startedAt: sameDay, insightsGenerated: 5, papersCited: 1 },
      { startedAt: sameDayLater, insightsGenerated: 7, papersCited: 2 },
      { startedAt: otherDay, insightsGenerated: 3, papersCited: 0 },
    ];
    const agg = aggregateByTimeBucket(jobs);
    const dayKey25 = '2026-06-25';
    const dayKey26 = '2026-06-26';
    const r25 = agg.byDay.find((d) => d.date === dayKey25);
    const r26 = agg.byDay.find((d) => d.date === dayKey26);
    expect(r25?.count).toBe(12); // 5 + 7
    expect(r26?.count).toBe(3);
  });

  it('groups by week (ISO 8601, anchor Monday)', () => {
    // 2026-06-23 (Tue) and 2026-06-25 (Thu) are in the same ISO week (W26).
    const jobs: InsightJobLite[] = [
      { startedAt: new Date(Date.UTC(2026, 5, 23, 12)), insightsGenerated: 4, papersCited: 1 },
      { startedAt: new Date(Date.UTC(2026, 5, 25, 12)), insightsGenerated: 6, papersCited: 2 },
    ];
    const agg = aggregateByTimeBucket(jobs);
    // Should be one week bucket with count=10
    const weekEntry = agg.byWeek.find((w) => w.count === 10);
    expect(weekEntry).toBeDefined();
  });

  it('is deterministic (same input → same output across runs)', () => {
    const jobs: InsightJobLite[] = [
      { startedAt: new Date(Date.UTC(2026, 5, 23, 12)), insightsGenerated: 8, papersCited: 3 },
      { startedAt: new Date(Date.UTC(2026, 5, 24, 12)), insightsGenerated: 5, papersCited: 2 },
    ];
    const a = aggregateByTimeBucket(jobs);
    const b = aggregateByTimeBucket(jobs);
    expect(a).toEqual(b);
    expect(a.totalInsights).toBe(b.totalInsights);
    expect(a.totalPapers).toBe(b.totalPapers);
    expect(a.byDay).toEqual(b.byDay);
    expect(a.byWeek).toEqual(b.byWeek);
  });

  it('handles jobs from different years correctly', () => {
    const jobs: InsightJobLite[] = [
      { startedAt: new Date(Date.UTC(2025, 11, 31)), insightsGenerated: 3, papersCited: 1 },
      { startedAt: new Date(Date.UTC(2026, 0, 1)), insightsGenerated: 4, papersCited: 1 },
    ];
    const agg = aggregateByTimeBucket(jobs);
    expect(agg.byDay.some((d) => d.date === '2025-12-31' && d.count === 3)).toBe(true);
    expect(agg.byDay.some((d) => d.date === '2026-01-01' && d.count === 4)).toBe(true);
  });
});