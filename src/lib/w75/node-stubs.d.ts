// Minimal Node.js stubs for type-checking under --experimental-strip-types
// (Node 22 native fetch + WebCrypto subset used at runtime).
// This file MUST remain a "script" (no top-level imports/exports) so that
// `declare global { ... }` augmentation works.

interface TextEncoderCtor {
  new (): { encode(s: string): Uint8Array };
}

interface SubtleCryptoLike {
  digest(alg: string, data: Uint8Array): Promise<ArrayBuffer>;
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

declare module 'vitest' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function expect<T>(actual: T): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toMatch(re: RegExp): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeGreaterThan(n: number): void;
    toBeGreaterThanOrEqual(n: number): void;
    toBeLessThan(n: number): void;
    toBeLessThanOrEqual(n: number): void;
    toBeCloseTo(expected: number, precision?: number): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toContain(item: unknown): void;
    toHaveLength(n: number): void;
    toThrow(message?: string | RegExp): void;
    not: {
      toBe(expected: unknown): void;
      toEqual(expected: unknown): void;
      toMatch(re: RegExp): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toBeNull(): void;
      toBeUndefined(): void;
    };
  };
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
}
