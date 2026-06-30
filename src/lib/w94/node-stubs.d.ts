// Minimal Node.js stubs for type-checking under --experimental-strip-types
// W94-A worker — extends cycle 75/73 pattern.
//
// Why this file exists (cycle 73 lesson):
// - The repo's root tsconfig has `"types": ["vitest/globals"]` which hides
//   `process` as a Node global when running `tsc` against individual files
//   via `--noEmit` from outside a Next.js build.
// - We override at the *file* level with `tsconfig.w94.json` (see
//   "../tsconfig.w94.json"), and this `.d.ts` provides the minimal shape of
//   `process`, `AbortController`, `setTimeout`, etc. so the engine type-
//   checks without needing `@types/node`.
// - MUST remain a "script" (no top-level imports/exports) so `declare global`
//   augmentation works under node-strip-types.

interface ProcessLike {
  env: Record<string, string | undefined>;
  cwd(): string;
  exit(code: number): never;
  stdout: { write(s: string): boolean };
  stderr: { write(s: string): boolean };
  argv: string[];
  version: string;
  platform: string;
}

declare const process: ProcessLike;

interface TimeoutHandle {
  unref?: () => void;
  ref?: () => void;
}

interface AbortSignalLike {
  aborted: boolean;
  reason?: unknown;
  addEventListener?(type: 'abort', listener: () => void): void;
  removeEventListener?(type: 'abort', listener: () => void): void;
}

interface AbortControllerLike {
  signal: AbortSignalLike;
  abort(reason?: unknown): void;
}

declare class AbortController {
  constructor();
  signal: AbortSignalLike;
  abort(reason?: unknown): void;
}

declare const AbortSignal: {
  timeout(ms: number): AbortSignalLike;
};

declare function setTimeout(
  cb: (...args: unknown[]) => void,
  ms: number,
  ...args: unknown[]
): TimeoutHandle;
declare function clearTimeout(handle: TimeoutHandle | number | undefined): void;

interface ConsoleLike {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
}

declare const console: ConsoleLike;

// fetch + ReadableStream (Node 22 native)
declare function fetch(
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignalLike;
  },
): Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  headers: { get(name: string): string | null };
  body: ReadableStream<Uint8Array> | null;
  text(): Promise<string>;
  json(): Promise<unknown>;
}>;

interface ReadableStream<R = Uint8Array> {
  getReader(): ReadableStreamDefaultReader<R>;
  cancel(): Promise<void>;
}

interface ReadableStreamDefaultReader<R = Uint8Array> {
  read(): Promise<{ done: true } | { done: false; value: R }>;
  releaseLock(): void;
  cancel(): Promise<void>;
}

declare const TextDecoder: {
  new (encoding?: string): { decode(input: Uint8Array | ArrayBuffer): string };
};

interface TextEncoderCtor {
  new (): { encode(s: string): Uint8Array };
}
declare const TextEncoder: TextEncoderCtor;

// `node:test` types via tsx — lightweight type shape.
declare module 'node:test' {
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function describe(name: string, fn: () => void): void;
  export function before(fn: () => void | Promise<void>): void;
  export function after(fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
}
declare module 'node:assert/strict' {
  export const equal: (actual: unknown, expected: unknown, msg?: string) => void;
  export const notEqual: (actual: unknown, expected: unknown, msg?: string) => void;
  export const ok: (value: unknown, msg?: string) => void;
  export const strictEqual: (actual: unknown, expected: unknown, msg?: string) => void;
  export const deepStrictEqual: (actual: unknown, expected: unknown, msg?: string) => void;
  export const deepEqual: (actual: unknown, expected: unknown, msg?: string) => void;
  export const throws: (fn: () => void, expected?: unknown, msg?: string) => void;
  export const rejects: (fn: () => Promise<unknown>, expected?: unknown, msg?: string) => Promise<void>;
  export const fail: (msg?: string) => never;
  export const match: (actual: string, re: RegExp, msg?: string) => void;
}
