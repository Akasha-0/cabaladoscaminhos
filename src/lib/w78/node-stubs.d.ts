// node-stubs.d.ts
// Minimal Node 22 type stubs for worktree-isolated tsconfig (types: []).
// Matches what cycle 60-77 spec/smoke harnesses actually consume.

declare global {
  // -- Node globals (used in cycle 60-77 harnesses) ------------------------
  // eslint-disable-next-line no-var
  var console: {
    log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
  };
  // eslint-disable-next-line no-var
  var process: {
    exit(code?: number): never;
    env: Record<string, string | undefined>;
    argv: string[];
    cwd(): string;
    platform: string;
  };
  // eslint-disable-next-line no-var
  var setTimeout: (cb: () => void, ms?: number) => unknown;
  // eslint-disable-next-line no-var
  var clearTimeout: (handle: unknown) => void;
}

interface DataView {
  readonly buffer: ArrayBufferLike;
  getUint32(byteOffset: number, littleEndian?: boolean): number;
  setUint32(byteOffset: number, value: number, littleEndian?: boolean): void;
}

interface Uint8ArrayConstructor {
  new (length: number): Uint8Array;
  new (array: ArrayLike<number>): Uint8Array;
  new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): Uint8Array;
  readonly prototype: Uint8Array;
}

declare const Uint8Array: Uint8ArrayConstructor;

// -- vitest matchers (cycle 77 lesson: extended for vitest 2.x surface) -----
declare module 'vitest' {
  export type AnyFn = (...args: any[]) => any;
  export interface TestFn {
    (name: string, fn: () => void | Promise<void>): void;
    only(name: string, fn: () => void | Promise<void>): void;
    skip(name: string, fn: () => void | Promise<void>): void;
    todo(name: string): void;
  }
  export interface DescribeFn {
    (name: string, fn: () => void): void;
    only(name: string, fn: () => void): void;
    skip(name: string, fn: () => void): void;
    todo(name: string): void;
  }
  export interface Expect {
    (actual: unknown): Assertion;
  }
  export interface Assertion extends Matchers {}
  export interface Matchers {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toStrictEqual(expected: unknown): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toContain(item: unknown): void;
    toHaveLength(n: number): void;
    toThrow(msg?: string | RegExp): void;
    toMatch(pattern: string | RegExp): void;
    toBeGreaterThan(n: number): void;
    toBeGreaterThanOrEqual(n: number): void;
    toBeLessThan(n: number): void;
    toBeLessThanOrEqual(n: number): void;
    toMatchObject(obj: object): void;
    not: Matchers;
  }
  export const describe: DescribeFn;
  export const it: TestFn;
  export const test: TestFn;
  export const expect: Expect;
  export const beforeEach: (fn: AnyFn) => void;
  export const afterEach: (fn: AnyFn) => void;
  export const beforeAll: (fn: AnyFn) => void;
  export const afterAll: (fn: AnyFn) => void;
}

// -- Self-running harness registry (cycle 60-77 pattern) -------------------
// The spec files DO NOT use vitest at runtime (cycle 73 lesson — vitest is
// only for editor LSP/typecheck). They implement their own `it()` registry
// that collects tests, then runs them at the end of the file.

// (No external declarations needed; harness uses inline `it`/`describe`.)

export {};