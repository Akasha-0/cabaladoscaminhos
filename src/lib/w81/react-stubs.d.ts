/**
 * W81-D react-stubs.d.ts — minimal ambient types for isolated tsconfig.
 *
 * Pattern (cycle 80 W80-B/W80-D lesson): with no @types/react + no
 * node_modules, declare a local React namespace with a FunctionComponent<P>
 * whose call signature is intentionally `any`-typed so contravariance
 * fights don't break sub-component assignment. Keep ReactElement generic.
 */

// ════════════════════════════════════════════════════════════════════════════
// Ambient global types — text, fetch-style, etc.
// ════════════════════════════════════════════════════════════════════════════

interface TextEncoderCtor {
  new (): { encode(s: string): Uint8Array };
}
interface ProcessLike {
  env: Record<string, string | undefined>;
  cwd(): string;
  exit(code: number): never;
}
interface ConsoleLike {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
}
interface CryptoLike {
  randomUUID?: () => string;
}

declare global {
  var TextEncoder: TextEncoderCtor;
  var process: ProcessLike;
  var console: ConsoleLike;
  var crypto: CryptoLike;

  function setTimeout(fn: () => void, ms: number): unknown;
  function clearTimeout(handle: unknown): void;

  // React JSX namespace — global so .tsx files compile without imports.
  // Element is aliased to React's ReactElement<unknown> so JSX expressions
  // type-check against our ReactElement signature.
  namespace JSX {
    type ReactElement<P = unknown> = {
      type: unknown;
      props: P;
      key: string | null;
    };

    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element {
      type: unknown;
      props: unknown;
      key: string | null;
    }
    interface ElementClass {}
    interface ElementAttributesProperty {}
    interface ElementChildrenAttribute {
      children: {};
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// node: protocol stubs (canonical-JSON / sha256 helpers if needed)
// ════════════════════════════════════════════════════════════════════════════

declare module 'node:url' {
  export function fileURLToPath(u: { toString(): string }): string;
}
declare module 'node:path' {
  export function basename(p: string): string;
  export function extname(p: string): string;
  export function join(...parts: string[]): string;
}
declare module 'node:fs' {
  export function readFileSync(p: string, enc: 'utf8' | 'binary'): string;
  export function existsSync(p: string): boolean;
  export function writeFileSync(p: string, data: string | Uint8Array): void;
}

declare module 'node:crypto' {
  export function randomUUID(): string;
  export function createHash(alg: 'sha256' | 'sha1' | 'md5'): {
    update(d: string | Uint8Array): { digest(enc: 'hex' | 'base64'): string };
  };
}

// ════════════════════════════════════════════════════════════════════════════
// React ambient module — minimal, generic, FC-call-signature-any
// ════════════════════════════════════════════════════════════════════════════

declare module 'react' {
  export interface ReactElement<P = unknown> {
    type: unknown;
    props: P;
    key: string | null;
  }
  export interface ReactNode {}
  export type ReactFragment = Iterable<ReactNode>;
  export type Key = string | number | bigint;
  export type Ref<T> = { current: T | null } | ((instance: T | null) => void);

  export type CSSProperties = Record<string, string | number | undefined>;

  // FunctionComponent: keep call signature `any`-typed so that
  // `FunctionComponent<StepHeaderProps>` and `FunctionComponent<unknown>`
  // are mutually assignable in our stubs.
  export interface FunctionComponent<P = unknown> {
    (props: P, context?: any): any;
    displayName?: string;
  }

  export function createElement(
    type: unknown,
    props?: Record<string, unknown> | null,
    ...children: unknown[]
  ): ReactElement;

  export function useState<T>(initial: T | (() => T)): [T, (next: T | ((prev: T) => T)) => void];
  export function useEffect(fn: () => void | (() => void), deps?: ReadonlyArray<unknown>): void;
  export function useMemo<T>(fn: () => T, deps: ReadonlyArray<unknown>): T;
  export function useRef<T>(initial: T): { current: T };
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: ReadonlyArray<unknown>): T;
  export function useId(): string;
  export function useReducer<R, I>(reducer: (s: R, a: I) => R, initial: R): [R, (a: I) => void];
}

export {};
