// ============================================================================
// W81-B — node ambient declarations (no @types/node)
// ----------------------------------------------------------------------------
// Minimal types for node:crypto + global process. Used by the engine and
// the smoke / spec runners. Production builds replace this with @types/node.
// ============================================================================

declare module 'node:crypto' {
  export function createHmac(algorithm: string, secret: string): {
    update(data: string | Buffer): {
      digest(encoding: 'hex' | 'base64' | 'binary'): string;
    };
  };
  export function randomUUID(): string;
}

declare const process: {
  exit(code?: number): never;
  env: { readonly [key: string]: string | undefined };
  stdout: { write(s: string): void };
  stderr: { write(s: string): void };
  argv: string[];
  cwd(): string;
};

declare const console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
};

declare const setTimeout: (cb: () => void, ms?: number) => unknown;
declare const clearTimeout: (t: unknown) => void;
declare const setInterval: (cb: () => void, ms?: number) => unknown;
declare const clearInterval: (t: unknown) => void;
declare const Promise: PromiseConstructor;

interface PromiseConstructor {
  resolve<T>(value?: T | PromiseLike<T>): Promise<T>;
  reject<T>(reason?: any): Promise<T>;
  all<T>(values: ReadonlyArray<T | PromiseLike<T>>): Promise<ReadonlyArray<T>>;
  race<T>(values: ReadonlyArray<T | PromiseLike<T>>): Promise<T>;
  readonly prototype: Promise<unknown>;
}

interface Promise<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2>;
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
  ): Promise<T | TResult>;
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  readonly [Symbol.toStringTag]: string;
}