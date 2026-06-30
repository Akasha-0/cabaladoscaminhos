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
  info(...args: unknown[]): void;
}

interface TimeoutHandle {
  ref(): TimeoutHandle;
  unref(): TimeoutHandle;
}

declare global {
  var TextEncoder: TextEncoderCtor;
  var crypto: CryptoLike;
  var process: ProcessLike;
  var console: ConsoleLike;
  function setTimeout(fn: () => void, ms: number): TimeoutHandle;
  function clearTimeout(h: TimeoutHandle): void;
}