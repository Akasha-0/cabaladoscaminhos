// Minimal type stubs to allow tsc strict check without vitest/globals or @types/node.
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void | Promise<void>): void;
declare function expect(value: unknown): {
  toBe(v: unknown): void;
  toEqual(v: unknown): void;
  toThrow(e?: unknown): void;
  toBeCloseTo(v: number, tol?: number): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
};

// Node.js globals for spec self-runner (smoke spec also uses these via ESM)
declare const require: { (id: string): unknown; main: unknown };
declare const module: { exports: Record<string, unknown> };
declare const process: {
  exit(code?: number): never;
  stdout: { write(s: string): boolean };
  stderr: { write(s: string): boolean };
  env: Record<string, string | undefined>;
  argv: string[];
  cwd(): string;
};
declare const console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
};