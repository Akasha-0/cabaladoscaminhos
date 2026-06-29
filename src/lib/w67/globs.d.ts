// src/lib/w67/globs.d.ts
// Cycle 67 Worker A — minimal ambient types for node:crypto + test globals.
// Avoids requiring @types/node or vitest as TS deps.
// Per brief: only acceptable TSC errors are vitest TS2307 (which we don't emit —
// we mock globals via declare global so TS sees them).

declare global {
  // Minimal node types used by cigano-spread-visualizer.ts
  const process: {
    getBuiltinModule?(m: string): unknown;
  };
  // NodeModule-style stubs to satisfy strict-mode
  type NodeRequire = (id: string) => unknown;

  // Test runner globals for vitest spec compilation
  // (when running tests, vitest installs these; here we just declare them
  // so TSC is happy with the .spec.ts file)
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): Promise<void> | void;
  function expect(actual: unknown): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toContain(expected: unknown): void;
    toMatch(re: RegExp): void;
    toThrow(message?: string | RegExp): void;
    toBeGreaterThan(n: number): void;
    toBeGreaterThanOrEqual(n: number): void;
    toBeLessThan(n: number): void;
    toBeLessThanOrEqual(n: number): void;
    toBeNull(): void;
    toBeDefined(): void;
    not: {
      toBe(expected: unknown): void;
      toEqual(expected: unknown): void;
      toContain(expected: unknown): void;
      toBeNull(): void;
    };
  };
}

export {};
