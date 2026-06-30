// ════════════════════════════════════════════════════════════════════════════
// W80-C — MARKETPLACE BOOKING UI · NODE STUBS
// ════════════════════════════════════════════════════════════════════════════
// Worktree-isolated type stubs. This file is a SCRIPT (no top-level exports),
// so ambient `var X` declarations are global to the TS program.
// `declare module 'X'` blocks at script level create AMBIENT modules that
// are merged with any actual package.json resolution.
// Pattern: cycle 73 lesson #2.
// ════════════════════════════════════════════════════════════════════════════

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

// Ambient script-level globals (no `declare` needed since this is a script).
var TextEncoder: TextEncoderCtor;
var crypto: CryptoLike;
var process: ProcessLike;
var console: ConsoleLike;
var require: (id: string) => unknown;
var module: { exports: unknown };

function setTimeout(fn: () => void, ms: number): unknown;
function clearTimeout(handle: unknown): void;

declare module 'node:crypto' {
  export function randomUUID(): string;
  export function createHash(alg: 'sha256' | 'sha1' | 'md5'): {
    update(d: string | Uint8Array, enc?: 'utf-8' | 'ascii' | 'utf8' | 'binary' | 'hex' | 'base64'): { digest(enc: 'hex' | 'base64'): string };
  };
  export function createHmac(alg: 'sha256' | 'sha1', key: string): {
    update(d: string | Uint8Array, enc?: 'utf-8' | 'ascii' | 'utf8' | 'binary' | 'hex' | 'base64'): { digest(enc: 'hex' | 'base64'): string };
  };
}

// React — minimal stubs. FunctionComponent uses `any` for params + return to
// dodge contravariance + covariance fights in the worktree.
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
}

declare module 'react/jsx-runtime' {
  export const jsx: typeof import('react').createElement;
  export const jsxs: typeof import('react').createElement;
  export const Fragment: typeof import('react').Fragment;
}

declare module 'react-dom' {
  export function render(element: import('react').ReactElement, container: unknown): void;
  export function createRoot(container: unknown): {
    render(element: import('react').ReactElement): void;
    unmount(): void;
  };
}
