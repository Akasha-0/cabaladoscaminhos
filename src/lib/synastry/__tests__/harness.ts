// W70 Synastry — self-running expect harness (cycle 60-68 pattern).
// Pattern: each section is wrapped in `it(label, () => { expect(...)... })` and
// passes/fails tracked via the outer Spec. Failures collected for diagnostics.

export interface SpecFailure {
  readonly assertion: string;
  readonly expected: unknown;
  readonly actual: unknown;
  readonly detail?: string;
}

export interface SpecResult {
  readonly name: string;
  readonly passed: number;
  readonly failed: number;
  readonly assertions: number;
  readonly failures: readonly SpecFailure[];
}

export class AssertionError extends Error {
  expected: unknown;
  actual: unknown;
  constructor(message: string, expected: unknown, actual: unknown) {
    super(message);
    this.expected = expected;
    this.actual = actual;
  }
}

interface Matcher {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toBeCloseTo(expected: number, digits?: number): void;
  toBeGreaterThan(expected: number): void;
  toBeLessThan(expected: number): void;
  toBeGreaterThanOrEqual(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
  toContain(expected: unknown): void;
  toHaveLength(expected: number): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toBeNull(): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toMatch(re: RegExp): void;
  not: Matcher;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  const aKeys = Object.keys(a as Record<string, unknown>);
  const bKeys = Object.keys(b as Record<string, unknown>);
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
}

export class Spec {
  private readonly name: string;
  private passedCount = 0;
  private failedCount = 0;
  private assertionCount = 0;
  private readonly failures: SpecFailure[] = [];

  constructor(name: string) {
    this.name = name;
  }

  expect<T>(actual: T): Matcher {
    const build = (negate: boolean): Matcher => {
      function assertIt(cond: boolean, msg: string, expected: unknown, actualLocal: unknown): void {
        // cond == pass, assertIt throws if the assertion fails.
        // With not: cond == fail, throw if not cond (i.e. cond is true).
        if (!negate) {
          if (!cond) throw new AssertionError(msg, expected, actualLocal);
        } else {
          if (cond) throw new AssertionError(msg, expected, actualLocal);
        }
      }
      return {
        toBe(expected: unknown): void {
          assertIt(Object.is(actual as unknown, expected), 'toBe failed', expected, actual);
        },
        toEqual(expected: unknown): void {
          assertIt(deepEqual(actual, expected), 'toEqual failed', expected, actual);
        },
        toBeCloseTo(expected: number, digits = 2): void {
          if (typeof actual !== 'number') {
            assertIt(false, 'toBeCloseTo expected number', expected, actual);
          } else {
            assertIt(
              Math.abs(actual - expected) <= Math.pow(10, -digits),
              `toBeCloseTo failed (digits=${digits})`,
              expected,
              actual,
            );
          }
        },
        toBeGreaterThan(expected: number): void {
          assertIt(typeof actual === 'number' && (actual as unknown as number) > expected, 'toBeGreaterThan failed', expected, actual);
        },
        toBeLessThan(expected: number): void {
          assertIt(typeof actual === 'number' && (actual as unknown as number) < expected, 'toBeLessThan failed', expected, actual);
        },
        toBeGreaterThanOrEqual(expected: number): void {
          assertIt(typeof actual === 'number' && (actual as unknown as number) >= expected, 'toBeGreaterThanOrEqual failed', expected, actual);
        },
        toBeLessThanOrEqual(expected: number): void {
          assertIt(typeof actual === 'number' && (actual as unknown as number) <= expected, 'toBeLessThanOrEqual failed', expected, actual);
        },
        toContain(expected: unknown): void {
          if (typeof actual === 'string') {
            assertIt(actual.includes(String(expected)), 'toContain failed (string)', expected, actual);
          } else if (Array.isArray(actual)) {
            assertIt(
              actual.some((x) => deepEqual(x, expected)),
              'toContain failed (array)',
              expected,
              actual,
            );
          } else {
            assertIt(false, 'toContain unsupported type', expected, actual);
          }
        },
        toHaveLength(expected: number): void {
          const len = (actual as unknown as { length: number }).length;
          assertIt(len === expected, 'toHaveLength failed', expected, len);
        },
        toBeDefined(): void { assertIt(actual !== undefined, 'toBeDefined failed', actual, actual); },
        toBeUndefined(): void { assertIt(actual === undefined, 'toBeUndefined failed', undefined, actual); },
        toBeNull(): void { assertIt(actual === null, 'toBeNull failed', null, actual); },
        toBeTruthy(): void { assertIt(!!actual, 'toBeTruthy failed', actual, actual); },
        toBeFalsy(): void { assertIt(!actual, 'toBeFalsy failed', false, actual); },
        toMatch(re: RegExp): void {
          assertIt(typeof actual === 'string' && re.test(actual), 'toMatch failed', re.source, actual);
        },
        not: Object.create(null), // filled below to avoid infinite recursion
      } as Matcher;
    };
    const m = build(false);
    (m as { not: Matcher }).not = build(true);
    return m;
  }

  async it(label: string, fn: () => void | Promise<void>): Promise<void> {
    this.assertionCount++;
    try {
      await fn();
      this.passedCount++;
    } catch (err) {
      this.failedCount++;
      const e = err instanceof AssertionError
        ? err
        : new AssertionError(err instanceof Error ? err.message : String(err), undefined, undefined);
      this.failures.push({
        assertion: label,
        expected: e.expected,
        actual: e.actual,
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async run(label: string, fn: (spec: Spec) => Promise<void> | void): Promise<void> {
    await this.it(label, async () => {
      await fn(this);
    });
  }

  getResult(): SpecResult {
    return Object.freeze({
      name: this.name,
      passed: this.passedCount,
      failed: this.failedCount,
      assertions: this.assertionCount,
      failures: Object.freeze([...this.failures]),
    });
  }
}
