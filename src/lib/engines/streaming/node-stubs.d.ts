// Minimal Node.js stubs for type-checking under --experimental-strip-types
// (Node 22 native fetch + WebCrypto subset used at runtime).
// This file MUST remain a "script" (no top-level imports/exports) so that
// `declare global { ... }` augmentation works.

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
  argv: string[];
  stdout: { write(s: string): void };
  stderr: { write(s: string): void };
}

interface ConsoleLike {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
}

declare global {
  const process: ProcessLike;
  const console: ConsoleLike;
  const TextEncoder: TextEncoderCtor;
  const crypto: CryptoLike;
}

export {};