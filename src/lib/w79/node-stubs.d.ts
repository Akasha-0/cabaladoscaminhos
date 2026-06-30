// Minimal Node/React/Vitest stubs for TS --noEmit under worktree-isolated tsconfig.
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

// React type stubs for worktree-isolated TSX compilation.
declare namespace JSX {
  interface IntrinsicElements {
    [elem: string]: unknown;
  }
  interface Element {}
  interface ElementClass {}
  interface ElementAttributesProperty {}
  interface ElementChildrenAttribute { children: {}; }
}
declare module 'react' {
  export type ReactNode = unknown;
  export type ReactElement = { type: unknown; props: unknown; key: string | null };
  export type FC<P = unknown> = (props: P) => ReactElement | null;
  export type PropsWithChildren<P = unknown> = P & { children?: ReactNode };
  export function useState<T>(initial: T | (() => T)): [T, (v: T | ((p: T) => T)) => void];
  export function useState<T = undefined>(): [T | undefined, (v: T | undefined) => void];
  export function useEffect(fn: () => void | (() => void), deps?: ReadonlyArray<unknown>): void;
  export function useRef<T>(initial: T): { current: T };
  export function useRef<T>(initial: T | null): { current: T | null };
  export function useCallback<T extends (...args: never[]) => unknown>(fn: T, deps: ReadonlyArray<unknown>): T;
  export function useMemo<T>(fn: () => T, deps: ReadonlyArray<unknown>): T;
  export function createElement(type: unknown, props?: unknown, ...children: unknown[]): ReactElement;
  export const Fragment: unique symbol;

  export class Component<P = unknown, S = unknown> {
    props: P;
    state: S;
    constructor(props: P);
    setState(updater: Partial<S> | ((prev: S) => Partial<S>)): void;
    forceUpdate(): void;
    render(): ReactNode;
    componentDidMount?(): void;
    componentDidUpdate?(prevProps: P, prevState: S): void;
    componentDidCatch?(error: Error, info: unknown): void;
    componentWillUnmount?(): void;
  }
}
