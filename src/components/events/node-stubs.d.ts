// ============================================================================
// RSVP FORM — NODE STUBS for isolated TSC
// ----------------------------------------------------------------------------
// W80-B · Cycle 80 · 2026-06-30
// Type-only declarations used by the spec harness to compile under
// `--experimental-strip-types` (Node 22) without pulling @types/react.
// Pattern (W79-B): declare namespace + ambient module WITHOUT `export {}`
// so namespaces remain globally visible.
// ============================================================================

// ----- React (minimal, permissive) ----------------------------------------
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ReactNode = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export interface ReactElement<P = any> {
    type: string | ((props: P) => unknown);
    props: P & { children?: unknown };
    key?: string | number;
  }
  export type CSSProperties = Record<string, string | number>;

  export interface ReactChildren {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map<T, R>(children: any, fn: (child: T, index: number) => R): R[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forEach(children: any, fn: (child: any, index: number) => void): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    count(children: any): number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toArray(children: any): unknown[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    only(children: any): unknown;
  }

  export const Children: ReactChildren;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function createElement(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props?: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...children: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ReactElement<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function cloneElement(el: ReactElement<any>, props?: any, ...children: any[]): ReactElement<any>;
  export function isValidElement(value: unknown): value is ReactElement;

  export function useState<T>(initial: T | (() => T)): [T, (next: T | ((prev: T) => T)) => void];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void];
  export function useEffect(fn: () => void | (() => void), deps?: ReadonlyArray<unknown>): void;
  export function useLayoutEffect(fn: () => void | (() => void), deps?: ReadonlyArray<unknown>): void;
  export function useCallback<T extends (...args: never[]) => unknown>(fn: T, deps: ReadonlyArray<unknown>): T;
  export function useMemo<T>(fn: () => T, deps: ReadonlyArray<unknown>): T;
  export function useRef<T>(initial: T | null): { current: T | null };
  export const Fragment: (props: { children?: unknown }) => ReactElement;
  export const StrictMode: (props: { children?: unknown }) => ReactElement;
}

// ----- Global namespace (for JSX.Element references) -----------------------
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [elem: string]: any;
    }
    interface Element {}
    interface ElementClass {}
    interface ElementAttributesProperty {}
    interface ElementChildrenAttribute { children: {} }
  }

  namespace React {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type ReactNode = any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface ReactElement<P = any> {
      type: string | ((props: P) => unknown);
      props: P & { children?: unknown };
      key?: string | number;
    }
    interface FormEvent<T = unknown> {
      preventDefault: () => void;
    }
    interface ChangeEvent<T = unknown> {
      target: { value: string; checked?: boolean };
    }
  }

  // Browser globals (for window.location in component)
  interface Window {
    location: {
      assign(url: string): void;
      href: string;
    };
  }
  var window: Window | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var document: any;
}

// ----- process (for exit code in spec) ------------------------------------
declare const process: {
  exit(code: number): never;
  env: Record<string, string | undefined>;
};
