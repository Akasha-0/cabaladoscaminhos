// Worktree-isolated ambient declarations for W77 translation-tooling harness.
// Provides Node globals + crypto/process so cycle-77 spec/smoke can run with
// `--experimental-strip-types` against a clean ES2022 module graph.
//
// Cycle 75+ lesson (confirmed cycle 76): vitest types are NOT available under
// `types: []` configs. We use a tiny custom harness instead, so we omit
// vitest/globals entirely.
declare global {
  // ---- Node globals ---------------------------------------------------------
  const process: {
    env: Record<string, string | undefined>;
    platform: string;
    version: string;
    cwd(): string;
    exit(code?: number): never;
    stdout: { write(s: string): boolean };
    stderr: { write(s: string): boolean };
  };
  const console: {
    log(...args: unknown[]): void;
    error(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    info(...args: unknown[]): void;
  };
  const setTimeout: (cb: () => void, ms?: number) => unknown;
  const clearTimeout: (handle: unknown) => void;
  const Buffer: {
    from(data: string, encoding?: string): Buffer;
    from(data: ArrayBuffer | Uint8Array): Buffer;
    alloc(size: number): Buffer;
    toString(buf: Buffer, encoding?: string): string;
  };
  type Buffer = Uint8Array & { toString(encoding?: string): string };
  const crypto: {
    createHash(algorithm: string): {
      update(data: string | Uint8Array, encoding?: string): unknown;
      digest(encoding?: string): string;
    };
  };

  // ---- Custom harness matchers (cycle 60+ self-running pattern) ------------
  interface HarnessAssertionError extends Error {
    readonly code: 'HARNESS_ASSERTION';
  }
  function expectEqual<T>(actual: T, expected: T, message?: string): void;
  function expectClose(actual: number, expected: number, precision?: number, message?: string): void;
  function expectTrue(actual: unknown, message?: string): void;
  function expectFalse(actual: unknown, message?: string): void;
  function expectThrows(fn: () => unknown, pattern?: RegExp | string, message?: string): void;
  function expectDefined<T>(actual: T | undefined | null, message?: string): asserts actual is T;
  function it(name: string, fn: () => void | Promise<void>): void;
  function test(name: string, fn: () => void | Promise<void>): void;
  function describe(name: string, fn: () => void): void;
  function beforeEach(fn: () => void | Promise<void>): void;
  function afterEach(fn: () => void | Promise<void>): void;
  function check(label: string, cond: unknown, detail?: string): void;
  function expectThrow(label: string, fn: () => unknown, pattern: RegExp | string): void;
}

declare module 'node:crypto' {
  export function createHash(algorithm: string): {
    update(data: string | Uint8Array, encoding?: string): unknown;
    digest(encoding?: string): string;
  };
}

declare module 'node:process' {
  export const env: Record<string, string | undefined>;
  export const platform: string;
  export const version: string;
  export function cwd(): string;
  export function exit(code?: number): never;
}

export {};
