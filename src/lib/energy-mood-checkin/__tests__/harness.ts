/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SELF-RUNNING TEST HARNESS — cycle 68 pattern (reusable for any spec)
 *  Cabala dos Caminhos — wave 69, 2026-06-30
 *
 *  Standalone assertion library so specs can run via `node --experimental-strip-types`
 *  without vitest. Also compatible with vitest when the binary becomes available
 *  (Cycle 67 lesson — specs are runnable in two modes).
 *
 *  Provides: expectEqual, expectClose (float), expectTrue, expectFalse, expectNull,
 *            expectNotNull, expectThrows, expectMatches, expectLen, runXxxSpec().
 *  Each spec file declares a `runXxxSpec()` that returns the total assertions run.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface TestResult {
  passed: number;
  failed: number;
  failures: readonly string[];
}

export class SpecHarnessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpecHarnessError';
  }
}

let PASSED = 0;
let FAILED = 0;
const FAILURES: string[] = [];
let SECTION = '<root>';

export function section(name: string): void {
  SECTION = name;
}

/**
 * Reset counters — call at the top of each runXxxSpec() so concurrent runs
 * (rare; mostly from --eval sanity) don't pollute each other.
 */
export function resetHarness(): void {
  PASSED = 0;
  FAILED = 0;
  FAILURES.length = 0;
}

function recordFailure(label: string, msg: string): void {
  FAILED++;
  FAILURES.push(`[${SECTION}] ${label}: ${msg}`);
}

function assert(label: string, ok: boolean, msg: string): void {
  if (ok) {
    PASSED++;
  } else {
    recordFailure(label, msg);
  }
}

export function expectEqual<T>(label: string, actual: T, expected: T): void {
  assert(
    label,
    Object.is(actual, expected),
    `actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`,
  );
}

export function expectNotEqual<T>(label: string, actual: T, expected: T): void {
  assert(
    label,
    !Object.is(actual, expected),
    `expected NOT equal, got ${JSON.stringify(actual)}`,
  );
}

export function expectClose(label: string, actual: number, expected: number, tol = 1e-6): void {
  assert(
    label,
    Math.abs(actual - expected) <= tol,
    `actual=${actual} not within ${tol} of expected=${expected}`,
  );
}

export function expectTrue(label: string, actual: unknown): void {
  assert(label, actual === true, `expected true, got ${JSON.stringify(actual)}`);
}

export function expectFalse(label: string, actual: unknown): void {
  assert(label, actual === false, `expected false, got ${JSON.stringify(actual)}`);
}

export function expectNull(label: string, actual: unknown): void {
  assert(label, actual === null, `expected null, got ${JSON.stringify(actual)}`);
}

export function expectNotNull<T>(label: string, actual: T | null | undefined): asserts actual is T {
  assert(label, actual !== null && actual !== undefined, `expected non-null, got ${JSON.stringify(actual)}`);
}

export function expectThrows(label: string, fn: () => unknown, errorName?: string): unknown {
  try {
    fn();
    recordFailure(label, 'no error thrown');
    return null;
  } catch (e) {
    if (errorName !== undefined) {
      const ok = e instanceof Error && e.name === errorName;
      assert(`${label}/throwsType`, ok, `expected error.name=${errorName}, got ${e instanceof Error ? e.name : String(e)}`);
    } else {
      assert(`${label}/threw`, true, '');
    }
    return e;
  }
}

export function expectMatches(label: string, actual: string, re: RegExp): void {
  assert(label, re.test(actual), `actual "${actual}" does not match ${re}`);
}

export function expectLen(label: string, actual: unknown, length: number): void {
  const n = Array.isArray(actual) ? actual.length : (typeof actual === 'string' ? actual.length : null);
  assert(
    label,
    n === length,
    `expected length ${length}, got ${n === null ? typeof actual : n}`,
  );
}

export function expectContains<T>(label: string, arr: readonly T[], item: T): void {
  assert(label, arr.includes(item), `expected array to contain ${JSON.stringify(item)}`);
}

export function results(): TestResult {
  return { passed: PASSED, failed: FAILED, failures: FAILURES.slice() };
}

/**
 * Pretty-print results. Returns exit code (0 = all green).
 */
export function report(specName: string, res: TestResult): number {
  const total = res.passed + res.failed;
  console.log(
    `[${specName}] ${res.passed}/${total} PASS` +
      (res.failed > 0 ? ` (${res.failed} FAIL)` : ''),
  );
  for (const f of res.failures) console.log('  ✗ ' + f);
  return res.failed === 0 ? 0 : 1;
}
