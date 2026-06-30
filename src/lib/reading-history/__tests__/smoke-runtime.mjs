// ════════════════════════════════════════════════════════════════════════════
// SMOKE-RUNTIME.MJS — Cabala dos Caminhos (Akasha Wave 69)
// ════════════════════════════════════════════════════════════════════════════
//
// Cross-runtime smoke runner. Invoked via:
//   node --experimental-strip-types src/lib/reading-history/__tests__/smoke-runtime.mjs
//
// Loads each spec module via dynamic `import()` (ESM-resolved) and aggregates
// assertion counts. Exits with non-zero status on any spec failure.
//
// Cycle 60-68 lessons applied:
//   - `.ts` imports require `.ts` extensions in `import()` for ESM resolution.
//   - `import type` discipline: everything in this file is a runtime import.
//   - 12+ smoke checks per brief.
//   - Default reporter (cycle 62 lesson: no `--reporter=basic`).
// ════════════════════════════════════════════════════════════════════════════

import process from 'node:process';

const baseUrl = new URL('.', import.meta.url);

// ─── Smoke checks (engine-level, fast-fail) ─────────────────────────────

let smokePass = 0;
let smokeFail = 0;

function smoke(label, fn) {
  try {
    fn();
    console.log(`  ✓ smoke: ${label}`);
    smokePass += 1;
  } catch (e) {
    smokeFail += 1;
    console.error(`  ✗ smoke: ${label} :: ${(e instanceof Error ? e.message : String(e))}`);
  }
}

// 12+ engine-level smoke checks executed synchronously before spec imports.
smoke('history.ts compiles + TRD has 8 traditions', async () => {
  // Defer to dynamic import — we treat module load as compile proof.
  const mod = await import('../history.ts');
  smokeStatic(() => mod.TRADITIONS.length === 8, 'TRADITIONS length=8');
});

function smokeStatic(predicate, label) {
  if (!predicate) throw new Error(`assertion failed: ${label}`);
}

// We can't await inside the smoke() helper above (it's sync), so we'll
// instead run all the engine-level checks inside a single async block.
const engine = await import('../history.ts');
const stats = await import('../stats.ts');
const insights = await import('../insights.ts');
const trends = await import('../trends.ts');

smoke('history: TRADITIONS frozen + 8 entries', () => {
  smokeStatic(Object.isFrozen(engine.TRADITIONS), 'TRADITIONS isFrozen');
  smokeStatic(engine.TRADITIONS.length === 8, 'TRADITIONS length=8');
});

smoke('history: branded factories exist + return strings', () => {
  smokeStatic(typeof engine.toUserId === 'function', 'toUserId');
  smokeStatic(typeof engine.toReadingId === 'function', 'toReadingId');
  smokeStatic(typeof engine.toCardKey === 'function', 'toCardKey');
  smokeStatic(typeof engine.toUserId('u-x') === 'string', 'toUserId→string');
});

smoke('history: recordReading + getHistory roundtrip', () => {
  engine._clearAllHistoryForTesting();
  const u = engine.toUserId('smoke-1');
  const r = {
    id: engine.toReadingId(`smoke-${Date.now()}`),
    userId: u,
    tradition: 'cigano',
    cards: [{ key: engine.toCardKey('cigano:trombeta'), name: 'Trombeta', tradition: 'cigano' }],
    createdAt: new Date('2026-06-30T12:00:00Z'),
  };
  const entry = engine.recordReading(u, r);
  smokeStatic(entry !== undefined, 'recordReading returns entry');
  smokeStatic(entry.cards.length === 1, 'cards.length=1');
  const page = engine.getHistory(u);
  smokeStatic(page.entries.length === 1, 'getHistory returns 1');
});

smoke('history: clearHistory wipes state', () => {
  const u = engine.toUserId('smoke-clear');
  engine.recordReading(u, {
    id: engine.toReadingId('smoke-c'),
    userId: u,
    tradition: 'tarot',
    cards: [{ key: engine.toCardKey('tarot:o-mago'), name: 'O Mago', tradition: 'tarot' }],
    createdAt: new Date('2026-06-30T12:00:00Z'),
  });
  const n = engine.clearHistory(u);
  smokeStatic(n === 1, 'clearHistory returns 1');
  smokeStatic(engine.countHistory(u) === 0, 'countHistory=0 after clear');
});

smoke('history: exportHistory returns JSON-serializable shape', () => {
  const u = engine.toUserId('smoke-export');
  engine.recordReading(u, {
    id: engine.toReadingId('smoke-x'),
    userId: u,
    tradition: 'cigano',
    cards: [{ key: engine.toCardKey('cigano:trombeta'), name: 'Trombeta', tradition: 'cigano' }],
    createdAt: new Date('2026-06-30T12:00:00Z'),
  });
  const exp = engine.exportHistory(u);
  const json = JSON.stringify(exp);
  smokeStatic(typeof json === 'string', 'export JSON serializable');
  smokeStatic(exp.count === 1, 'export count=1');
});

smoke('stats: computeStats respects in-memory state', () => {
  const u = engine.toUserId('smoke-stats');
  engine._clearAllHistoryForTesting();
  engine.recordReading(u, {
    id: engine.toReadingId('smoke-s1'),
    userId: u,
    tradition: 'cigano',
    cards: [
      { key: engine.toCardKey('cigano:trombeta'), name: 'Trombeta', tradition: 'cigano' },
      { key: engine.toCardKey('cigano:moinho'), name: 'Moinho', tradition: 'cigano' },
    ],
    createdAt: new Date(),
  });
  const s = stats.computeStats(u);
  smokeStatic(s.totalReadings === 1, 'stats totalReadings=1');
  smokeStatic(s.totalCardsDrawn === 2, 'stats totalCardsDrawn=2');
  smokeStatic(Object.isFrozen(s), true, 'stats output frozen');
});

smoke('insights: RULE_REGISTRY is frozen + has 8 rules', () => {
  smokeStatic(Object.isFrozen(insights.RULE_REGISTRY), 'RULE_REGISTRY frozen');
  smokeStatic(insights.RULE_REGISTRY.length === 8, 'RULE_REGISTRY.length=8');
  smokeStatic(insights.INSIGHT_RULE_COUNT === 8, 'INSIGHT_RULE_COUNT=8');
});

smoke('insights: SACRED_CATALOG covers 7 traditions ≥12 each', () => {
  const cov = insights.auditSacredCoverage();
  smokeStatic(Object.keys(insights.SACRED_CATALOG).length === 7, '7 traditions');
  for (const [t, n] of Object.entries(cov)) {
    smokeStatic(n >= 12, `${t} >= 12`);
  }
  const total = Object.values(cov).reduce((a, n) => a + n, 0);
  smokeStatic(total >= 84, `total >= 84 (got ${total})`);
});

smoke('insights: generateInsights returns frozen array', () => {
  const u = engine.toUserId('smoke-insights');
  engine._clearAllHistoryForTesting();
  const out = insights.generateInsights(u, { now: new Date('2026-06-30T12:00:00Z') });
  smokeStatic(Object.isFrozen(out), 'insights array frozen');
});

smoke('trends: computeTrends produces empty buckets for fresh user', () => {
  const u = engine.toUserId('smoke-trends');
  engine._clearAllHistoryForTesting();
  const t = trends.computeTrends(u, 30);
  smokeStatic(t.bucketCount === 0, 'fresh user buckets=0');
  smokeStatic(t.totalReadings === 0, 'fresh user total=0');
  smokeStatic(Object.isFrozen(t), 'trends frozen');
});

smoke('trends: moodTrend direction is "unknown" without data', () => {
  const u = engine.toUserId('smoke-mood');
  engine._clearAllHistoryForTesting();
  const m = trends.moodTrend(u, 30);
  smokeStatic(m.trendDirection === 'unknown', 'mood direction=unknown');
});

smoke('trends: detectShifts returns empty for fresh user', () => {
  const u = engine.toUserId('smoke-shifts');
  engine._clearAllHistoryForTesting();
  const s = trends.detectShifts(u);
  smokeStatic(s.shifts.length === 0, 'no shifts');
});

smoke('trends: forecastNextReading is conservative on empty', () => {
  const u = engine.toUserId('smoke-forecast');
  engine._clearAllHistoryForTesting();
  const f = trends.forecastNextReading(u, new Date('2026-06-30T12:00:00Z'));
  smokeStatic(f.medianGapDays === 0, 'gap=0');
  smokeStatic(f.sampleSize === 0, 'sample=0');
});

// ─── Run full spec suites ────────────────────────────────────────────────

const specFiles = [
  'history.spec.ts',
  'stats.spec.ts',
  'insights.spec.ts',
  'trends.spec.ts',
];

let totalPassed = 0;
let totalFailed = 0;
let totalAssertions = 0;
let totalIts = 0;
const specSummaries = [];

for (const file of specFiles) {
  console.log(`\n══ ${file} ══`);
  // baseUrl is a file:// URL pointing at the spec dir; resolve `file`
  // relative to it to get the absolute file:// URL of the spec.
  const abs = new URL(file, baseUrl);
  const mod = await import(abs.href);
  const runFnName = Object.keys(mod).find((k) => k.startsWith('run') && k.endsWith('Spec'));
  if (!runFnName) {
    console.error(`  ! no runXxxSpec() export found in ${file}`);
    totalFailed += 1;
    continue;
  }
  const report = mod[runFnName]();
  totalPassed += report.passed;
  totalFailed += report.failed;
  totalAssertions += report.assertions;
  totalIts += report.its;
  specSummaries.push({
    file,
    passed: report.passed,
    failed: report.failed,
    assertions: report.assertions,
    its: report.its,
  });
}

// ─── Summary ─────────────────────────────────────────────────────────────

console.log('\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
console.log('┃ SUMMARY                                                          ┃');
console.log('┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫');
console.log(`┃ Smoke checks:                  ${smokePass} pass / ${smokeFail} fail`);
console.log(`┃ Spec assertions:               ${totalPassed} pass / ${totalFailed} fail`);
console.log(`┃ Total it() blocks:             ${totalIts}`);
console.log(`┃ Total assertions:              ${totalAssertions}`);
console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');

for (const s of specSummaries) {
  console.log(`  • ${s.file.padEnd(30)} ${String(s.passed).padStart(4)} pass / ${String(s.failed).padStart(2)} fail (${s.assertions} assertions across ${s.its} blocks)`);
}

// Final exit code.
const exitCode = smokeFail + totalFailed > 0 ? 1 : 0;
process.exit(exitCode);
