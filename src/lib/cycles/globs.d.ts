// Minimal Node type stubs for the cycles directory's tsconfig (no @types/node).
// Per cycle 60-71 lesson: keep declarations lean — only what spec/smoke actually touch.

declare const console: {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
};

declare const process: {
  exit(code?: number): never;
  env: Record<string, string | undefined>;
};
