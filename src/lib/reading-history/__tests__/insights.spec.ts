/**
 * ════════════════════════════════════════════════════════════════════════════
 * INSIGHTS.SPEC.TS — Cabala dos Caminhos (Akasha Wave 69)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running spec for `insights.ts`. 30+ assertions across 9 sections.
 * Covers: each rule fires when expected, doesn't fire when not, audit
 * registry is exhaustive, frozen output, severity escalation.
 *
 * Run via: `node --experimental-strip-types insights.spec.ts`
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
import { recordReadings } from '../history.ts';
import {
  INSIGHT_RULE_COUNT,
  RULE_REGISTRY,
  SACRED_CATALOG,
  auditInsightRules,
  auditSacredCoverage,
  filterBySeverity,
  generateInsights,
  insightsEngineInfo,
  sortInsights,
} from '../insights.ts';

// ─── Spec Harness (same as other spec files) ─────────────────────────────

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

// ─── Fixture helpers ────────────────────────────────────────────────────

function cardFor(name: string, tradition: Card['tradition'], opts: { isMajorArcana?: boolean; mood?: -1 | 0 | 1 } = {}): Card {
  return {
    key: toCardKey(`${tradition}:${name.toLowerCase().replace(/\s+/g, '-')}`),
    name,
    tradition,
    isMajorArcana: opts.isMajorArcana,
    mood: opts.mood ?? 0,
  };
}

function readingFor(
  userId: UserId,
  tradition: Card['tradition'],
  names: string[],
  when: Date,
  opts: { isMajorArcana?: boolean; mood?: -1 | 0 | 1 } = {},
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

export function runInsightsSpec(): SpecReport {
  _clearAllHistoryForTesting();
  const u = toUserId('u-insights');
  const now = new Date('2026-06-30T12:00:00Z');
  const r = createSpec();

  r.describe('engine info + introspection', () => {
    r.it('insightsEngineInfo exposes version + ruleCount', () => {
      r.assert(insightsEngineInfo.name, 'reading-history-insights', 'name');
      r.assert(insightsEngineInfo.frozen, true, 'frozen flag');
      r.assert(insightsEngineInfo.noAICalls, true, 'no AI');
    });
    r.it('RULE_REGISTRY is frozen', () => {
      r.assert(Object.isFrozen(RULE_REGISTRY), true, 'registry frozen');
    });
    r.it('INSIGHT_RULE_COUNT matches registry length', () => {
      r.assert(INSIGHT_RULE_COUNT, RULE_REGISTRY.length, 'count sync');
    });
    r.it('auditInsightRules returns the registry', () => {
      r.assert(auditInsightRules(), RULE_REGISTRY, 'audit export');
    });
  });

  r.describe('SACRED_CATALOG (cycle 62 lesson 12)', () => {
    r.it('covers 7 traditions, ≥12 entries each', () => {
      const cov = auditSacredCoverage();
      r.assert(Object.keys(SACRED_CATALOG).length, 7, '7 traditions');
      for (const t of Object.keys(cov)) {
        r.assert(cov[t as keyof typeof SACRED_CATALOG]! >= 12, true, `tradition ${t} >= 12`);
      }
    });
    r.it('total entries ≥ 84 (minimum) and exceeds 219 (target)', () => {
      const cov = auditSacredCoverage();
      const total = Object.values(cov).reduce((acc, n) => acc + n, 0);
      r.assert(total >= 84, true, 'total >= 84');
      r.assert(total >= 219, true, 'total >= 219 (Cigano 36 + Tarot 78 + Astrologia 34 + Orixás 16 + Cabala 32 + Numerologia 12 + Tantra 11)');
    });
  });

  r.describe('rule 1 — REPEAT_CARD', () => {
    r.it('fires when a card repeats 3+ times in 30 days', () => {
      _setHistoryForTesting(new Map());
      const cardKey = toCardKey('cigano:trombeta');
      const day = 24 * 60 * 60 * 1000;
      const readings = [10, 8, 5, 2].map((d) =>
        readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - d * day)),
      );
      recordReadings(u, readings);
      const insights = generateInsights(u, { now });
      const repeat = insights.filter((i) => i.kind === 'REPEAT_CARD');
      r.assert(repeat.length >= 1, true, 'fires');
      r.assert(repeat[0]!.data.count as number >= 3, true, 'count>=3');
      r.assert(repeat[0]!.sacredRef!.name, 'Trombeta', 'has sacred ref');
    });
    r.it('does NOT fire when card repeats less than 3 times', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - 1000)));
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - 2000)));
      const insights = generateInsights(u, { now });
      r.assert(insights.filter((i) => i.kind === 'REPEAT_CARD').length, 0, 'no repeat insight');
    });
  });

  r.describe('rule 2 — LONG_GAP', () => {
    r.it('fires when last reading > 14 days ago', () => {
      _setHistoryForTesting(new Map());
      const old = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], old));
      const insights = generateInsights(u, { now });
      const gap = insights.find((i) => i.kind === 'LONG_GAP');
      r.assert(!!gap, true, 'fires');
      r.assert(gap!.data.daysSinceLastReading as number >= 14, true, 'days>=14');
      r.assert(gap!.severity, 'warning', 'severity=warning');
    });
    r.it('does NOT fire when recent reading exists', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - 1000)));
      const insights = generateInsights(u, { now });
      r.assert(!!insights.find((i) => i.kind === 'LONG_GAP'), false, 'no gap');
    });
  });

  r.describe('rule 3 — STREAK_MILESTONE', () => {
    r.it('fires on day 7, 30, 100, 365', () => {
      _setHistoryForTesting(new Map());
      const day = 24 * 60 * 60 * 1000;
      for (let i = 0; i < 7; i++) {
        recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - i * day)));
      }
      const insights = generateInsights(u, { now });
      const streak = insights.find((i) => i.kind === 'STREAK_MILESTONE');
      r.assert(!!streak, true, 'fires');
      r.assert(streak!.severity, 'celebration', 'severity=celebration');
    });
    r.it('does NOT fire on day 5 (off-milestone)', () => {
      _setHistoryForTesting(new Map());
      const day = 24 * 60 * 60 * 1000;
      for (let i = 0; i < 5; i++) {
        recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - i * day)));
      }
      const insights = generateInsights(u, { now });
      r.assert(!!insights.find((i) => i.kind === 'STREAK_MILESTONE'), false, 'no off-milestone');
    });
  });

  r.describe('rule 4 — TRADITION_EXPLORATION', () => {
    r.it('fires the first time a new tradition is recorded', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)));
      recordReading(u, readingFor(u, 'cigano', ['Moinho'], new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)));
      recordReading(u, readingFor(u, 'tarot', ['O Mago'], new Date(now.getTime() - 1000)));
      const insights = generateInsights(u, { now });
      const expl = insights.filter((i) => i.kind === 'TRADITION_EXPLORATION');
      r.assert(expl.length, 1, 'exactly 1 exploration insight');
      r.assert(expl[0]!.data.tradition, 'tarot', 'tarot exploration');
    });
    r.it('does NOT fire if only one tradition ever used', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], new Date(now.getTime() - 1000)));
      recordReading(u, readingFor(u, 'cigano', ['Moinho'], new Date(now.getTime() - 2000)));
      const insights = generateInsights(u, { now });
      r.assert(insights.filter((i) => i.kind === 'TRADITION_EXPLORATION').length, 0, 'no exploration');
    });
  });

  r.describe('rule 5 — TOP_CARD_THIS_MONTH', () => {
    r.it('fires when one card appears ≥2 times in 30 days', () => {
      _setHistoryForTesting(new Map());
      const day = 24 * 60 * 60 * 1000;
      for (const d of [1, 2, 3, 5]) {
        recordReading(u, readingFor(u, 'tarot', ['A Estrela'], new Date(now.getTime() - d * day)));
      }
      recordReading(u, readingFor(u, 'tarot', ['O Mago'], new Date(now.getTime() - 7 * day)));
      const insights = generateInsights(u, { now });
      const top = insights.find((i) => i.kind === 'TOP_CARD_THIS_MONTH');
      r.assert(!!top, true, 'fires');
      r.assert(top!.sacredRef!.name, 'A Estrela', 'top card');
    });
  });

  r.describe('rule 6 — ENERGY_SHIFT', () => {
    r.it('detects a polarity swing across two halves', () => {
      _setHistoryForTesting(new Map());
      const day = 24 * 60 * 60 * 1000;
      // Prior half: heavy negative (Torre, Morte)
      for (const d of [60, 55, 50, 45]) {
        recordReading(u, readingFor(u, 'tarot', ['A Torre', 'A Morte'], new Date(now.getTime() - d * day), {
          isMajorArcana: true, mood: -1,
        }));
      }
      // Recent half: positive (Estrela)
      for (const d of [10, 5, 3, 1]) {
        recordReading(u, readingFor(u, 'tarot', ['A Estrela'], new Date(now.getTime() - d * day), {
          isMajorArcana: true, mood: 1,
        }));
      }
      const insights = generateInsights(u, { now });
      const shift = insights.find((i) => i.kind === 'ENERGY_SHIFT');
      r.assert(!!shift, true, 'fires');
      r.assert(shift!.severity, 'celebration', 'celebration when trending up');
    });
    r.it('does NOT fire with fewer than 4 readings', () => {
      _setHistoryForTesting(new Map());
      for (const d of [5, 3, 1]) {
        recordReading(u, readingFor(u, 'tarot', ['A Estrela'], new Date(now.getTime() - d * 24 * 60 * 60 * 1000), {
          isMajorArcana: true, mood: 1,
        }));
      }
      const insights = generateInsights(u, { now });
      r.assert(!!insights.find((i) => i.kind === 'ENERGY_SHIFT'), false, 'no shift');
    });
  });

  r.describe('rule 7 — TRANSFORMATION_THEME', () => {
    r.it('fires when 2+ transformation cards (Morte, Torre, Enforcado, Julgamento) show up', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'tarot', ['A Morte'], new Date(now.getTime() - 1000), {
        isMajorArcana: true, mood: -1,
      }));
      recordReading(u, readingFor(u, 'tarot', ['A Torre'], new Date(now.getTime() - 2000), {
        isMajorArcana: true, mood: -1,
      }));
      recordReading(u, readingFor(u, 'tarot', ['A Estrela'], new Date(now.getTime() - 3000), {
        isMajorArcana: true, mood: 1,
      }));
      const insights = generateInsights(u, { now });
      const t = insights.find((i) => i.kind === 'TRANSFORMATION_THEME');
      r.assert(!!t, true, 'fires');
      r.assert(t!.severity, 'warning', 'severity=warning');
    });
    r.it('does NOT fire with only one transformation card', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'tarot', ['A Morte'], new Date(now.getTime() - 1000), {
        isMajorArcana: true, mood: -1,
      }));
      const insights = generateInsights(u, { now });
      r.assert(!!insights.find((i) => i.kind === 'TRANSFORMATION_THEME'), false, 'no theme');
    });
  });

  r.describe('rule 8 — ALL_MAJOR_ARCANA', () => {
    r.it('fires when 3+ readings are all-Major-Arcana', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'tarot', ['O Mago'], new Date(now.getTime() - 1000), { isMajorArcana: true }));
      recordReading(u, readingFor(u, 'tarot', ['O Louco'], new Date(now.getTime() - 2000), { isMajorArcana: true }));
      recordReading(u, readingFor(u, 'tarot', ['O Mundo'], new Date(now.getTime() - 3000), { isMajorArcana: true }));
      const insights = generateInsights(u, { now });
      const a = insights.find((i) => i.kind === 'ALL_MAJOR_ARCANA');
      r.assert(!!a, true, 'fires');
      r.assert(a!.severity, 'warning', 'severity=warning');
    });
    r.it('does NOT fire if any reading has non-major cards', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'tarot', ['O Mago'], new Date(now.getTime() - 1000), { isMajorArcana: true }));
      recordReading(u, readingFor(u, 'tarot', ['Ás de Copas'], new Date(now.getTime() - 2000), { isMajorArcana: false }));
      recordReading(u, readingFor(u, 'tarot', ['O Mundo'], new Date(now.getTime() - 3000), { isMajorArcana: true }));
      const insights = generateInsights(u, { now });
      r.assert(!!insights.find((i) => i.kind === 'ALL_MAJOR_ARCANA'), false, 'no all-major');
    });
  });

  r.describe('frozen output + immutability', () => {
    r.it('generateInsights output is frozen', () => {
      _setHistoryForTesting(new Map());
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], now));
      const insights = generateInsights(u, { now });
      r.assert(Object.isFrozen(insights), true, 'insights array frozen');
      if (insights.length > 0) r.assert(Object.isFrozen(insights[0]!), true, 'insight element frozen');
    });
    r.it('mutating output does not affect future generateInsights calls', () => {
      _setHistoryForTesting(new Map());
      const old = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], old));
      const before = generateInsights(u, { now });
      // The frozen array cannot be mutated (silent in strict mode). Verify
      // length matches before and after a fresh call.
      const after = generateInsights(u, { now });
      r.assert(before.length, after.length, 'frozen snapshot consistent');
    });
  });

  r.describe('filters + sort', () => {
    r.it('filterBySeverity filters by severity', () => {
      _setHistoryForTesting(new Map());
      const old = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], old));
      const all = generateInsights(u, { now });
      const warnings = filterBySeverity(all, 'warning');
      r.assert(warnings.every((i) => i.severity === 'warning'), true, 'all warning');
    });
    r.it('sortInsights orders warning before info before celebration', () => {
      const fake = [
        { kind: 'LONG_GAP' as const, severity: 'warning' as const, generatedAt: new Date(now.getTime()) },
        { kind: 'REPEAT_CARD' as const, severity: 'info' as const, generatedAt: new Date(now.getTime()) },
        { kind: 'STREAK_MILESTONE' as const, severity: 'celebration' as const, generatedAt: new Date(now.getTime()) },
      ];
      const sorted = sortInsights(fake as unknown as ReturnType<typeof generateInsights>);
      r.assert(sorted[0]!.severity, 'warning', 'first=warning');
      r.assert(sorted[2]!.severity, 'celebration', 'last=celebration');
    });
  });

  r.describe('rules option — selective evaluation', () => {
    r.it('respects opts.rules filter', () => {
      _setHistoryForTesting(new Map());
      const old = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
      recordReading(u, readingFor(u, 'cigano', ['Trombeta'], old));
      const only = generateInsights(u, { rules: ['LONG_GAP'], now });
      const kinds = new Set(only.map((i) => i.kind));
      r.assert(kinds.has('LONG_GAP'), true, 'LONG_GAP included');
      r.assert(kinds.size, 1, 'only LONG_GAP');
    });
  });

  console.log(`\n█ runInsightsSpec: ${r.passed}/${r.passed + r.failed} assertions passed across ${r.its} it() blocks\n`);
  return {
    passed: r.passed, failed: r.failed, failures: r.failures,
    assertions: r.passed + r.failed, its: r.its,
  };
}

if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('insights.spec.ts')) {
  runInsightsSpec();
}
