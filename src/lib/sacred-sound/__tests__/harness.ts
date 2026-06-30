// ============================================================================
// SACRED SOUND — TEST HARNESS
// ============================================================================
// Self-running harness — vitest-compatible API. Each spec file exposes
// runXxxSpec() that takes a `h` harness and pushes results.
//
// Cycle 60+ canonical pattern (w69 confirmed): exposes describe/it/expect
// as plain TS functions, aggregated by smoke-runtime.mjs.
// ============================================================================

export interface SpecResult {
  readonly name: string;
  readonly passed: boolean;
  readonly error?: string;
}

interface BaseAssertions<T> {
  toBe(expected: T): void;
  toEqual(expected: unknown): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  toBeNull(): void;
  toBeGreaterThan(n: number): void;
  toBeGreaterThanOrEqual(n: number): void;
  toBeLessThan(n: number): void;
  toBeLessThanOrEqual(n: number): void;
  toContain(item: unknown): void;
  toMatch(re: RegExp): void;
  toHaveLength(n: number): void;
  toThrow(msg?: string | RegExp): void;
}

export interface Assertions<T> extends BaseAssertions<T> {
  not: BaseAssertions<T>;
}

export interface Harness {
  readonly results: SpecResult[];
  describe(name: string, fn: () => void | Promise<void>): Promise<void>;
  it(name: string, fn: () => void | Promise<void>): Promise<void>;
  expect<T>(actual: T): Assertions<T>;
}

function buildBase<T>(actual: T): BaseAssertions<T> {
  return {
    toBe: (expected: T) => {
      if (!Object.is(actual, expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`,
        );
      }
    },
    toEqual: (expected: unknown) => {
      const a = JSON.stringify(actual);
      const e = JSON.stringify(expected);
      if (a !== e) {
        throw new Error(`toEqual failed: ${a} ≠ ${e}`);
      }
    },
    toBeTruthy: () => {
      if (!actual) throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
    },
    toBeFalsy: () => {
      if (actual) throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
    },
    toBeUndefined: () => {
      if (actual !== undefined) throw new Error(`Expected undefined, got ${JSON.stringify(actual)}`);
    },
    toBeDefined: () => {
      if (actual === undefined) throw new Error(`Expected defined`);
    },
    toBeNull: () => {
      if (actual !== null) throw new Error(`Expected null`);
    },
    toBeGreaterThan: (n: number) => {
      if (typeof actual !== "number" || !(actual as number > n)) {
        throw new Error(`Expected ${String(actual)} > ${n}`);
      }
    },
    toBeGreaterThanOrEqual: (n: number) => {
      if (typeof actual !== "number" || !(actual as number >= n)) {
        throw new Error(`Expected ${String(actual)} ≥ ${n}`);
      }
    },
    toBeLessThan: (n: number) => {
      if (typeof actual !== "number" || !(actual as number < n)) {
        throw new Error(`Expected ${String(actual)} < ${n}`);
      }
    },
    toBeLessThanOrEqual: (n: number) => {
      if (typeof actual !== "number" || !(actual as number <= n)) {
        throw new Error(`Expected ${String(actual)} ≤ ${n}`);
      }
    },
    toContain: (item: unknown) => {
      if (Array.isArray(actual)) {
        if (!actual.includes(item as T)) {
          throw new Error(`Expected array to contain ${JSON.stringify(item)}`);
        }
      } else if (typeof actual === "string") {
        if (!(actual as unknown as string).includes(String(item))) {
          throw new Error(`Expected string to contain "${String(item)}"`);
        }
      } else {
        throw new Error(`toContain not supported on ${typeof actual}`);
      }
    },
    toMatch: (re: RegExp) => {
      if (typeof actual !== "string" || !re.test(actual)) {
        throw new Error(`Expected "${actual}" to match ${re}`);
      }
    },
    toHaveLength: (n: number) => {
      const len = (actual as unknown as { length: number }).length;
      if (len !== n) throw new Error(`Expected length ${n}, got ${len}`);
    },
    toThrow: (msg?: string | RegExp) => {
      if (typeof actual !== "function") {
        throw new Error(`toThrow requires function, got ${typeof actual}`);
      }
      try {
        (actual as unknown as () => unknown)();
      } catch (e) {
        if (msg === undefined) return;
        const errMsg = e instanceof Error ? e.message : String(e);
        if (typeof msg === "string") {
          if (!errMsg.includes(msg)) throw new Error(`Error msg "${errMsg}" doesn't include "${msg}"`);
        } else {
          if (!msg.test(errMsg)) throw new Error(`Error msg "${errMsg}" doesn't match ${msg}`);
        }
        return;
      }
      throw new Error(`Expected function to throw, but did not`);
    },
  };
}

/**
 * Build a NOT-inverted copy of a base assertion set.
 * Each method on the `not` copy throws when its base counterpart PASSES
 * (i.e., succeeds without throwing), instead of throwing when it fails.
 * Reusable across any vitest-style harness — cycle 70 lesson learned.
 */
function buildNot<T>(base: BaseAssertions<T>): BaseAssertions<T> {
  function invert(methodName: keyof BaseAssertions<T>, method: Function): (...args: unknown[]) => void {
    return (...args: unknown[]) => {
      try {
        method.apply(base, args);
        // Base passed → `not` should fail
        throw new Error(
          `Expected NOT to ${methodName} but assertion passed (actual=${JSON.stringify(base)}). Args=${JSON.stringify(args)}`,
        );
      } catch (e) {
        // If our thrown `Expected NOT to...` error, rethrow it as a real failure.
        // If the base threw (because assertion failed), swallow it: `not` should pass.
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("Expected NOT to")) throw e;
        // Otherwise the base method threw → not-method should succeed.
      }
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any = {};
  const methodNames: (keyof BaseAssertions<T>)[] = [
    "toBe",
    "toEqual",
    "toBeTruthy",
    "toBeFalsy",
    "toBeUndefined",
    "toBeDefined",
    "toBeNull",
    "toBeGreaterThan",
    "toBeGreaterThanOrEqual",
    "toBeLessThan",
    "toBeLessThanOrEqual",
    "toContain",
    "toMatch",
    "toHaveLength",
    "toThrow",
  ];
  for (const n of methodNames) {
    out[n] = invert(n, base[n]);
  }
  return out as BaseAssertions<T>;
}

function buildAssertions<T>(actual: T): Assertions<T> {
  const base = buildBase(actual);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (base as any).not = buildNot(base);
  return base as Assertions<T>;
}

export function buildHarness(): Harness {
  const results: SpecResult[] = [];
  let currentDescribe = "";

  const h: Harness = {
    results,
    describe: async (name, fn) => {
      const prev = currentDescribe;
      currentDescribe = prev ? `${prev} > ${name}` : name;
      try {
        await fn();
      } finally {
        currentDescribe = prev;
      }
    },
    it: async (name, fn) => {
      const fullName = currentDescribe ? `${currentDescribe} > ${name}` : name;
      try {
        await fn();
        results.push({ name: fullName, passed: true });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ name: fullName, passed: false, error: msg });
      }
    },
    expect: <T>(actual: T) => buildAssertions(actual),
  };
  return h;
}