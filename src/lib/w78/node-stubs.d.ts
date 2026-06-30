// Minimal Node stubs for TS --noEmit under worktree-isolated tsconfig.
declare module 'vitest' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function expect<T>(actual: T): {
    toBe(expected: T): void;
    toEqual(expected: unknown): void;
    toStrictEqual(expected: unknown): void;
    toThrow(msg?: string | RegExp): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeDefined(): void;
    toBeUndefined(): void;
    toBeNull(): void;
    toContain(item: unknown): void;
    toMatchObject(obj: unknown): void;
    toHaveLength(n: number): void;
    toBeGreaterThan(n: number): void;
    toBeGreaterThanOrEqual(n: number): void;
    toBeLessThan(n: number): void;
    toBeLessThanOrEqual(n: number): void;
  };
}
declare const process: {
  env: Record<string, string | undefined>;
  platform: string;
  readonly versions?: { readonly node?: string };
  readonly pid?: number;
  exit(code?: number): never;
};
declare namespace NodeJS {
  interface Process {
    env: Record<string, string | undefined>;
  }
  interface ProcessEnv {}
}
