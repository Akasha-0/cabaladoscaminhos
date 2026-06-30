// ============================================================================
// W81-B — React ambient module declarations (no @types/react dependency)
// ----------------------------------------------------------------------------
// Declares the shape of the `react` module so .tsx files compile without
// @types/react. Runtime helpers come from _vnode_recorder.ts (re-exported
// via _react_module.ts). Type definitions are exported from react-types.ts.
// ============================================================================

declare global {
  namespace JSX {
    interface Element {
      readonly type: string | ((props: any) => any) | { (props: any): any };
      readonly props: Readonly<Record<string, unknown>>;
      readonly key: string | null;
    }
    interface IntrinsicAttributes {
      key?: string | number | null;
    }
    interface IntrinsicElements {
      readonly [elemName: string]: Readonly<Record<string, unknown>>;
    }
  }
}

// ============================================================================
// `react` module — full type surface used by events-rsvp-ui.tsx
// ============================================================================

declare module 'react' {
  export type {
    ReactNode,
    ReactElement,
    FunctionComponent,
    FC,
    ComponentType,
    Dispatch,
    SetStateAction,
    RefObject,
    RefCallback,
    Ref,
    EffectCallback,
    DependencyList,
  } from './react-types.ts';

  export function createElement(
    type: string | ((props: any) => any),
    props?: Readonly<Record<string, unknown>> | null,
    ...children: ReadonlyArray<any>
  ): any;

  export const Fragment: symbol;

  export function useState<T>(initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>];
  export function useEffect(cb: EffectCallback, deps?: DependencyList): void;
  export function useMemo<T>(factory: () => T, deps?: DependencyList): T;
  export function useId(): string;
  export function useRef<T>(initial: T | null): RefObject<T>;
  export function useCallback<T extends (...args: any[]) => any>(cb: T, deps?: DependencyList): T;
}

// ============================================================================
// react/jsx-runtime — minimal stub for tsconfig `jsx: react-jsx`
// ============================================================================

declare module 'react/jsx-runtime' {
  export const jsx: (type: any, config: any, key?: string | null) => any;
  export const jsxs: (type: any, config: any, key?: string | null) => any;
  export const Fragment: symbol;
}

// ============================================================================
// react-dom — used only for `createRoot` typing in spec harness
// ============================================================================

declare module 'react-dom' {
  export interface Root {
    render(node: unknown): void;
    unmount(): void;
  }
  export function createRoot(container: Element | DocumentFragment): Root;
}

export {};