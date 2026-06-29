// Local ambient declarations for w67 namespace.
// vitest types are stubbed here so the spec file compiles in isolation;
// when vitest is installed in CI, the real types take precedence.

declare module "vitest" {
  export const describe: (name: string, fn: () => void | Promise<void>) => void;
  export const it: (name: string, fn: () => void | Promise<void>) => void;
  export const expect: <T>(actual: T) => {
    toBe: (expected: T) => void;
    toEqual: (expected: T) => void;
    toBeDefined: () => void;
    toBeUndefined: () => void;
    toBeGreaterThanOrEqual: (n: number) => void;
    toBeGreaterThan: (n: number) => void;
    toBeLessThanOrEqual: (n: number) => void;
    toBeLessThan: (n: number) => void;
    toMatch: (re: RegExp | string) => void;
    toContain: (s: string) => void;
    toThrow: (err?: unknown) => void;
    not: {
      toBe: (expected: T) => void;
      toEqual: (expected: T) => void;
      toBeDefined: () => void;
      toBeUndefined: () => void;
      toContain: (s: string) => void;
      toThrow: (err?: unknown) => void;
    };
    each: <U>(cases: readonly U[]) => (name: string, fn: (c: U) => void) => void;
  };
}

declare module "*.mjs" {
  const m: { [k: string]: unknown };
  export default m;
}

declare module "*.ts" {
  const m: { [k: string]: unknown };
  export default m;
}