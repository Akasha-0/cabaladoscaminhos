// node-stubs.d.ts — minimal ambient types so isolated tsconfig works
// without @types/node. We use these only in self-running specs.

declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exit(code?: number): never;
  cwd(): string;
};

declare const console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
};

declare const setTimeout: (fn: () => void, ms: number) => unknown;
declare const clearTimeout: (h: unknown) => void;