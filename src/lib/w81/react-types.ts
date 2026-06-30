// ============================================================================
// W81-B — React type definitions (exportable)
// ----------------------------------------------------------------------------
// Exports the types needed by _vnode_recorder and the UI components.
// Runtime stub comes from _vnode_recorder.ts; this file is types-only
// (pure interfaces, no runtime side-effects).
// ============================================================================

export type ReactNode =
  | string
  | number
  | boolean
  | null
  | undefined
  | ReactElement
  | ReadonlyArray<ReactNode>
  | Iterable<ReactNode>;

export interface ReactElement<P = any> {
  readonly type: string | ((props: any) => ReactElement<any> | null);
  readonly props: Readonly<P & { children?: ReactNode }>;
  readonly key: string | null;
}

export interface FunctionComponent<P = any> {
  (props: P): ReactElement<any> | null;
  displayName?: string;
}

export type FC<P = any> = FunctionComponent<P>;
export type ComponentType<P = any> = FunctionComponent<P>;

export interface Dispatch<T> {
  (value: T): void;
}
export interface SetStateAction<T> {
  (value: T | ((prev: T) => T)): void;
}
export interface RefObject<T> {
  readonly current: T | null;
}
export type RefCallback<T> = (instance: T | null) => void;
export type Ref<T> = RefObject<T> | RefCallback<T>;
export type EffectCallback = () => void | (() => void);
export type DependencyList = ReadonlyArray<unknown>;