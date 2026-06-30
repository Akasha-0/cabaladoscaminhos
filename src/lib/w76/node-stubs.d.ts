// Minimal Node.js stubs for type-checking under --experimental-strip-types
// (Node 22 native fetch + WebCrypto subset used at runtime).
// This file MUST remain a "script" (no top-level imports/exports) so that
// `declare global { ... }` augmentation works.
//
// Extended for cycle 76: vitest module declares describe/it/expect with the
// full matcher set so spec files compile under the worktree-isolated tsconfig
// (which excludes the root vitest/globals types).

interface TextEncoderCtor {
  new (): { encode(s: string): Uint8Array };
}

interface SubtleCryptoLike {
  digest(alg: string, data: Uint8Array): Promise<ArrayBuffer>;
  importKey(
    fmt: string,
    keyData: ArrayBuffer | Uint8Array,
    algo: { name: string; hash: string },
    extractable: boolean,
    usages: string[],
  ): Promise<unknown>;
  sign(algo: string, key: unknown, data: ArrayBuffer | Uint8Array): Promise<ArrayBuffer>;
}

interface CryptoLike {
  randomUUID?: () => string;
  subtle?: SubtleCryptoLike;
}

interface ProcessLike {
  env: Record<string, string | undefined>;
  cwd(): string;
  exit(code: number): never;
}

interface ConsoleLike {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
}

declare global {
  var TextEncoder: TextEncoderCtor;
  var crypto: CryptoLike;
  var process: ProcessLike;
  var console: ConsoleLike;

  interface URLLike {
    toString(): string;
    readonly pathname: string;
    readonly searchParams: { get(k: string): string | null };
  }
  function setTimeout(fn: () => void, ms: number): unknown;
}

declare module 'node:url' {
  export function fileURLToPath(u: URLLike): string;
}

declare module 'node:path' {
  export function basename(p: string): string;
  export function extname(p: string): string;
  export function join(...parts: string[]): string;
}

declare module 'node:crypto' {
  export function randomUUID(): string;
  export function createHash(alg: 'sha256' | 'sha1' | 'md5'): {
    update(d: string | Uint8Array): { digest(enc: 'hex' | 'base64'): string };
  };
}

declare module 'node:test' {
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function before(fn: () => void | Promise<void>): void;
  export function after(fn: () => void | Promise<void>): void;
}

interface VitestMatchers {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toMatch(re: RegExp): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeGreaterThan(n: number): void;
  toBeGreaterThanOrEqual(n: number): void;
  toBeLessThan(n: number): void;
  toBeLessThanOrEqual(n: number): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  toContain(item: unknown): void;
  toContainEqual(item: unknown): void;
  toHaveLength(n: number): void;
  toThrow(message?: string | RegExp): void;
  toBeCloseTo(expected: number, precision?: number): void;
  toHaveProperty(key: string | string[]): void;
  rejects: {
    toBe(expected: unknown): void;
    toThrow(message?: string | RegExp): void;
  };
  resolves: {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
  };
  not: {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toMatch(re: RegExp): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toContain(item: unknown): void;
    toThrow(message?: string | RegExp): void;
  };
}

declare module 'vitest' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function expect<T>(actual: T): VitestMatchers;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
  export const vi: {
    fn(): unknown;
    fn<T>(impl: T): unknown;
    fn<TArgs extends unknown[], TReturn>(
      impl: (...args: TArgs) => TReturn,
    ): ((...args: TArgs) => TReturn) & { mock: { calls: unknown[][]; results: unknown[] } };
  };
}
