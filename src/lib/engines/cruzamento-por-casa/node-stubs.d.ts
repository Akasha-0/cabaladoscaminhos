// Minimal Node.js stubs for type-checking under --experimental-strip-types
// This file MUST remain a "script" (no top-level imports/exports) so that
// `declare global { ... }` augmentation works.

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
  var process: ProcessLike;
  var console: ConsoleLike;
}