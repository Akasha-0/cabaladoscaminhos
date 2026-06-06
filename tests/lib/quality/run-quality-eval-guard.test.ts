/**
 * Guard test: validates the PUBLIC CONTRACT of `runQualityEval`.
 *
 * Cycle 496 attempt was reverted because the assertions referenced fields
 * that don't exist in the real `QualityReport` (e.g. `report.overallScore`,
 * `cs.grade`) and tried to `vi.mock` internal helpers that aren't exported
 * from `runner.ts`. This version:
 *
 *   1. Uses the REAL `QualityReport` shape exported from runner.ts.
 *   2. Mocks ONLY the underlying Node modules (`child_process`, `fs`) that
 *      the internal helpers (`runTypeScriptCheck`, `runTests`,
 *      `runFallowAnalysis`, `checkForSecrets`, etc.) depend on.
 *   3. Validates structural invariants: required fields, score range, known
 *      grade set, weightedScore = round(score * weight), and the 7-key
 *      `details` map.
 *
 * The point is a regression guard: if someone renames or removes a field on
 * `QualityReport`/`CategoryScore` in runner.ts, this test fails.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CategoryScore, QualityReport } from '@/lib/quality/runner';
import { runQualityEval } from '@/lib/quality/runner';

// Mocks MUST come before the import of the module under test (vi.mock is
// hoisted by vitest, but we keep the order explicit for readability).
vi.mock('child_process', () => ({
  execSync: vi.fn(() => ''),
}));

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    existsSync: vi.fn(() => true),
    readdirSync: vi.fn(() => []),
    readFileSync: vi.fn(() => ''),
  };
});

const VALID_GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'F'] as const;

type Grade = (typeof VALID_GRADES)[number];

const DETAIL_KEYS = [
  'testCoverage',
  'typescriptClean',
  'secretsFound',
  'todosFound',
  'conflictsFound',
  'fallowIssues',
  'auditCoverage',
] as const;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('runQualityEval — public contract guard', () => {
  it('returns a QualityReport with all required top-level fields', async () => {
    const report = (await runQualityEval({
      output: 'silent',
    })) as QualityReport;

    expect(report).toBeDefined();
    expect(typeof report.score).toBe('number');
    expect(typeof report.grade).toBe('string');
    expect(Array.isArray(report.categoryScores)).toBe(true);
    expect(Array.isArray(report.issues)).toBe(true);
    expect(Array.isArray(report.recommendations)).toBe(true);
    expect(report.timestamp).toBeInstanceOf(Date);
    expect(typeof report.details).toBe('object');
  });

  it('produces a score within [0, 100]', async () => {
    const report = await runQualityEval({ output: 'silent' });
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
  });

  it('produces a grade from the known set (A+|A|A-|B+|B|B-|C+|C|C-|F)', async () => {
    const report = await runQualityEval({ output: 'silent' });
    expect(VALID_GRADES).toContain(report.grade as Grade);
  });

  it('exposes a details object with the 7 documented fields', async () => {
    const report = await runQualityEval({ output: 'silent' });
    for (const key of DETAIL_KEYS) {
      expect(report.details).toHaveProperty(key);
    }
  });

  it('each CategoryScore has consistent weightedScore = round(score * weight)', async () => {
    const report = await runQualityEval({ output: 'silent' });
    expect(report.categoryScores.length).toBeGreaterThan(0);

    for (const cs of report.categoryScores as CategoryScore[]) {
      expect(typeof cs.category).toBe('string');
      expect(cs.category.length).toBeGreaterThan(0);
      expect(typeof cs.score).toBe('number');
      expect(typeof cs.weight).toBe('number');
      expect(typeof cs.weightedScore).toBe('number');

      // The runner computes weightedScore as Math.round(avgScore * thresholds.weight).
      // We assert the invariant holds within rounding tolerance.
      const expected = Math.round(cs.score * cs.weight);
      const diff = Math.abs(cs.weightedScore - expected);
      expect(diff).toBeLessThanOrEqual(1);
    }
  });
});
