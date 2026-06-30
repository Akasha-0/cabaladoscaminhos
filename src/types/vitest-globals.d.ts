// ============================================================================
// VITEST GLOBALS — stub for tsc when node_modules is missing
// ============================================================================
// Cycle 60-67 pattern: when sandbox lacks `npm install`, the `vitest/globals`
// type package isn't resolvable. This stub provides minimal `describe`, `it`,
// `expect`, `beforeEach`, `vi`, etc. types so `tsc --noEmit` succeeds.
//
// Real types come from `vitest/globals` once `npm install` is run.
// This stub is ONLY for tsc; vitest runtime uses the real package.
// ============================================================================

declare global {
  type TestFn = () => void | Promise<void>;
  type HookFn = () => void | Promise<void>;

  function describe(name: string, fn: TestFn): void;
  function describe(name: string, options: { skip?: boolean; only?: boolean; concurrent?: boolean; sequential?: boolean }, fn: TestFn): void;
  function it(name: string, fn: TestFn): void;
  function it(name: string, options: { skip?: boolean; only?: boolean; timeout?: number; concurrent?: boolean; sequential?: boolean }, fn: TestFn): void;
  function test(name: string, fn: TestFn): void;
  function test(name: string, options: { skip?: boolean; only?: boolean; timeout?: number; concurrent?: boolean; sequential?: boolean }, fn: TestFn): void;
  function beforeEach(fn: HookFn): void;
  function afterEach(fn: HookFn): void;
  function beforeAll(fn: HookFn): void;
  function afterAll(fn: HookFn): void;

  // expect
  interface ExpectStatic {
    <T>(actual: T): {
      toBe(expected: T): void;
      toEqual(expected: unknown): void;
      toStrictEqual(expected: unknown): void;
      toBeNull(): void;
      toBeUndefined(): void;
      toBeDefined(): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toContain(item: unknown): void;
      toHaveLength(n: number): void;
      toHaveProperty(key: string | string[]): void;
      toHaveProperty(key: string | string[], value: unknown): void;
      toMatchObject(expected: object): void;
      toThrow(message?: string | RegExp | Error): void;
      toThrowError(message?: string | RegExp | Error): void;
      rejects: {
        toBe(expected: unknown): void;
        toEqual(expected: unknown): void;
        toThrow(message?: string | RegExp | Error): void;
      };
      resolves: {
        toBe(expected: unknown): void;
        toEqual(expected: unknown): void;
      };
      not: Omit<this, 'not'>;
    };
  }
  const expect: ExpectStatic;

  // vi
  interface ViMock {
    (...args: unknown[]): unknown;
    mockImplementation(impl: (...args: unknown[]) => unknown): this;
    mockResolvedValue(value: unknown): this;
    mockRejectedValue(error: unknown): this;
    mockReturnValue(value: unknown): this;
    mockClear(): this;
    mockReset(): this;
    mockRestore(): this;
    calls: unknown[][];
    results: Array<{ type: string; value: unknown }>;
  }
  interface ViStatic {
    fn(): ViMock;
    fn<T>(impl: T): ViMock;
    mock(path: string, factory?: () => unknown): void;
    clearAllMocks(): void;
    resetAllMocks(): void;
    restoreAllMocks(): void;
  }
  const vi: ViStatic;
}

export {};