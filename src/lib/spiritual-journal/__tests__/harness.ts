// ============================================================================
// SPIRITUAL JOURNAL — test harness (Wave 70, 2026-06-30)
// Self-running spec pattern (cycle 60+ lesson).
// Mirrors vitest API 1:1 — vitest-runnable when binary is available.
// ============================================================================

let _passed = 0;
let _failed = 0;
const _log: string[] = [];
const _failures: { label: string; expected: unknown; actual: unknown }[] = [];

export function check(label: string, cond: boolean): void {
  if (cond) {
    _passed += 1;
    _log.push(`  ✓ ${label}`);
  } else {
    _failed += 1;
    _failures.push({ label, expected: true, actual: cond });
    _log.push(`  ✗ ${label}`);
  }
}

export function section(name: string): void {
  _log.push(`\n[${name}]`);
}

export function expectEqual<T>(label: string, actual: T, expected: T): void {
  check(label, actual === expected);
}

export function expectDeepEqual<T>(label: string, actual: T, expected: T): void {
  try {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    check(label, a === e);
  } catch {
    check(label, false);
  }
}

export function expectThrows(
  label: string,
  fn: () => unknown,
  expectedName?: string,
): void {
  try {
    fn();
    _failed += 1;
    _log.push(`  ✗ ${label} (did not throw)`);
  } catch (e) {
    if (expectedName) {
      check(`${label} (${expectedName})`, (e as Error).name === expectedName);
    } else {
      _passed += 1;
      _log.push(`  ✓ ${label} (threw ${(e as Error).message.slice(0, 80)})`);
    }
  }
}

export function expectArrayLength<T>(
  label: string,
  arr: readonly T[],
  expected: number,
): void {
  check(label, arr.length === expected);
}

export function expectArrayContains<T>(
  label: string,
  arr: readonly T[],
  predicate: (item: T) => boolean,
): void {
  check(label, arr.some(predicate));
}

export function getLog(): readonly string[] {
  return _log;
}

export function getStats(): { passed: number; failed: number } {
  return { passed: _passed, failed: _failed };
}

export function getFailures(): readonly { label: string; expected: unknown; actual: unknown }[] {
  return _failures;
}

export function resetStats(): void {
  _passed = 0;
  _failed = 0;
  _log.length = 0;
  _failures.length = 0;
}