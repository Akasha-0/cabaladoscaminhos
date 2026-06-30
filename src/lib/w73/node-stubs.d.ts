// ============================================================================
// W73 — node-stubs.d.ts (cycle 60+ lessons: both VALUE and TYPE declarations)
// ============================================================================
// Provides Node global declarations so .ts files can compile under
// `tsc --noEmit -p tsconfig.json` with `types: []` (no @types/node).
// ============================================================================

declare const Buffer: any;
declare type Buffer = any;

declare const process: {
  env: Record<string, string | undefined>;
  hrtime: () => [number, number];
  platform?: string;
  version?: string;
  exit: (code?: number) => never;
  cwd: () => string;
  pid: number;
  stdout: { write: (s: string) => void };
  stderr: { write: (s: string) => void };
};

declare const setTimeout: (cb: (...args: any[]) => any, ms?: number) => unknown;
declare const clearTimeout: (id: unknown) => void;
declare const setInterval: (cb: (...args: any[]) => any, ms?: number) => unknown;
declare const clearInterval: (id: unknown) => void;

declare const console: {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
};

declare const global: { [key: string]: unknown };
declare const __dirname: string;
declare const __filename: string;
