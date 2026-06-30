/**
 * react-stubs.d.ts — minimal React + Node ambient types for worktree test runs
 *
 * Cycle 81 · mirrors W80-C W80-c node-stubs.d.ts pattern (proven to compile
 * worktree-only with `jsx: "react"` + `jsxFactory: "React.createElement"`).
 *
 * Strategy: This file is a SCRIPT (no top-level imports/exports beyond
 * `declare module 'X'` blocks), so all declarations are ambient/global.
 * We declare:
 *   - node:crypto, node:url, node:path — node module shims for tests
 *   - react + react/jsx-runtime — minimal ambient modules
 *
 * We deliberately do NOT declare JSX.IntrinsicElements. With
 * `noImplicitAny: false` (the default in `strict: true` doesn't enable it),
 * intrinsic JSX elements are accepted as `any`. The W80-C pattern that
 * shipped successfully uses this same omission.
 */

interface ProcessLike {
  env: Record<string, string | undefined>;
  cwd(): string;
  exit(code: number): never;
}

interface ConsoleLike {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
}

interface TextEncoderCtor {
  new (): { encode(s: string): Uint8Array };
}

interface SubtleCryptoLike {
  digest(alg: string, data: Uint8Array): Promise<ArrayBuffer>;
}

interface CryptoLike {
  randomUUID?: () => string;
  subtle?: SubtleCryptoLike;
}

// Ambient script-level globals.
var TextEncoder: TextEncoderCtor;
var crypto: CryptoLike;
var process: ProcessLike;
var console: ConsoleLike;
var require: (id: string) => unknown;
var module: { exports: unknown };
function setTimeout(fn: () => void, ms: number): unknown;
function clearTimeout(handle: unknown): void;

// ── Node.js modules (cycle 73 #2 pattern) ──────────────────────────────────
declare module 'node:crypto' {
  export function randomUUID(): string;
  export function createHash(alg: 'sha256' | 'sha1' | 'md5'): {
    update(d: string | Uint8Array, enc?: 'utf-8' | 'utf8'): { digest(enc: 'hex' | 'base64'): string };
  };
  export function createHmac(alg: 'sha256' | 'sha1', key: string): {
    update(d: string | Uint8Array, enc?: 'utf-8' | 'utf8'): { digest(enc: 'hex' | 'base64'): string };
  };
}

declare module 'node:url' {
  export function fileURLToPath(u: { toString(): string }): string;
}

declare module 'node:path' {
  export function basename(p: string): string;
  export function extname(p: string): string;
  export function join(...parts: string[]): string;
}

// ── React ambient module (cycle 80 W80-C pattern) ──────────────────────────
declare module 'react' {
  export type ReactNode = unknown;

  export interface ComponentProps {
    [key: string]: unknown;
    children?: ReactNode;
  }

  export interface CSSProperties {
    [key: string]: string | number | undefined;
  }

  export interface ReactElement<P = ComponentProps> {
    type: string | FunctionComponent<P> | ComponentClass<P>;
    props: P;
    key?: string | number | null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export interface FunctionComponent<P = ComponentProps> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any): any;
    displayName?: string;
  }

  export interface ComponentClass<P = ComponentProps> {
    new (props: P): { render(): ReactNode };
    displayName?: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ComponentType<P = any> = FunctionComponent<P> | ComponentClass<P>;

  export function createElement(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: string | ComponentType<any>,
    props?: ComponentProps | null,
    ...children: ReactNode[]
  ): ReactElement<ComponentProps>;

  export const Fragment: ComponentType<ComponentProps>;

  export function useState<T>(initial: T | (() => T)): [T, (v: T | ((p: T) => T)) => void];
  export function useState<T>(): [T | undefined, (v: T | ((p: T | undefined) => T | undefined)) => void];

  export function useEffect(
    effect: () => void | (() => void),
    deps?: ReadonlyArray<unknown>,
  ): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function useCallback<T extends (...args: any[]) => unknown>(
    fn: T,
    deps: ReadonlyArray<unknown>,
  ): T;

  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<unknown>): T;

  export function useRef<T>(initial: T | null): { current: T | null };
  export function useRef<T>(initial: T): { current: T };

  export function useReducer<S, A>(
    reducer: (state: S, action: A) => S,
    initial: S,
  ): [S, (action: A) => void];

  export function useId(): string;

  export function cloneElement(
    element: ReactElement,
    props?: ComponentProps,
    ...children: ReactNode[]
  ): ReactElement;

  export function isValidElement(value: unknown): boolean;

  export const version: string;
  export const StrictMode: ComponentType<ComponentProps>;
}

declare module 'react/jsx-runtime' {
  export const jsx: typeof import('react').createElement;
  export const jsxs: typeof import('react').createElement;
  export const Fragment: typeof import('react').Fragment;
}
