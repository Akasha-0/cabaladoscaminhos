// Minimal Node.js stubs for type-checking under --experimental-strip-types
// (Node 22 native fetch + WebCrypto subset used at runtime).
// Cycle 76 lesson: extends cycle-73 stub with toBeDefined/toThrow/toBeCloseTo
// and `process.exit` overload so spec/audit-harness can use them.

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
  function setTimeout(fn: () => void, ms: number): unknown;
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
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toThrow(message?: string | RegExp): void;
    toBeCloseTo(expected: number, precision?: number): void;
    toContain(item: unknown): void;
    toHaveLength(n: number): void;
    not: {
      toBe(expected: unknown): void;
      toEqual(expected: unknown): void;
      toMatch(re: RegExp): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toBeNull(): void;
      toThrow(): void;
    };
  };
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
}
