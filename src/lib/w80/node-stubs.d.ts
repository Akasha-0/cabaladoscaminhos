// ════════════════════════════════════════════════════════════════════════════
// W80-A — REPUTATION ENGINE · NODE STUBS
// ════════════════════════════════════════════════════════════════════════════
//
// Minimal Node.js + WebCrypto type stubs for isolated worktree TSC.
// Engine is pure ESM, no runtime deps; these exist only so `deno`-style
// imports and top-level await are type-clean.

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
  var crypto: { subtle?: { digest(alg: string, data: Uint8Array): Promise<ArrayBuffer> } };
  var process: ProcessLike;
  var console: ConsoleLike;
}

export {};
