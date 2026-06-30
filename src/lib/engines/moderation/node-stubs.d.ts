// Minimal Node.js stubs for type-checking under --experimental-strip-types
// (Node 22 native fetch + WebCrypto subset used at runtime).
// This file MUST remain a "script" (no top-level imports/exports) so that
// `declare global { ... }` augmentation works.

interface TextEncoderCtor {
  new (): { encode(s: string): Uint8Array };
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

export {};