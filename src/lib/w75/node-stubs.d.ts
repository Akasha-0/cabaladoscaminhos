// Minimal global declarations for `node --experimental-strip-types` spec/smoke harness.
// Script file (no top-level imports/exports) so `declare global` works.
declare global {
  const process: { exit(code: number): never };
  const console: {
    log(...args: unknown[]): void;
    error(...args: unknown[]): void;
    warn(...args: unknown[]): void;
  };
}
export {};
