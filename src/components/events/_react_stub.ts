// ============================================================================
// MINIMAL REACT STUB for runtime execution
// ============================================================================
// W80-B · Cycle 80 · 2026-06-30
// This stub provides just enough React API for the spec harness to run
// under Node 22 with --experimental-strip-types. It's used in place of
// the real react package (which isn't installed in the isolated worktree).
//
// The TS types come from node-stubs.d.ts (compile-time only).
// This stub provides the runtime behavior (createElement + state hooks).
// ============================================================================

// ============================================================================
// Internal bookkeeping for state hooks
// ============================================================================
type StateSlot<T> = { value: T; setter: (next: T | ((prev: T) => T)) => void };
const STATE_REGISTRY = new Map<number, StateSlot<unknown>>();
const STATE_KEYS = new Map<string, number>();
let nextStateId = 0;
let currentRenderId = 0;
let pendingEffects: Array<{ fn: () => void | (() => void); deps?: ReadonlyArray<unknown> }> = [];
let memoRegistry = new Map<string, unknown>();
let refRegistry = new Map<string, unknown>();

// Get a per-component instance key (we use call stack frame heuristic)
// For simplicity we use the order of hook calls within a single render

let hookOrder = 0;
let hookCache = new Map<number, unknown>();

function getHookOrder(): number {
  return hookOrder++;
}

export function createElement(
  type: unknown,
  props: Record<string, unknown> | null | undefined,
  ...children: unknown[]
): unknown {
  // Strip out special keys (key, ref, __self, __source)
  const cleanProps: Record<string, unknown> = {};
  if (props) {
    for (const k of Object.keys(props)) {
      if (k === 'key' || k === 'ref' || k === '__self' || k === '__source') continue;
      cleanProps[k] = props[k];
    }
  }
  // Flatten children
  const allChildren: unknown[] = [];
  for (const c of children) {
    if (Array.isArray(c)) {
      for (const cc of c) {
        if (cc === null || cc === undefined || cc === false) continue;
        allChildren.push(cc);
      }
    } else {
      if (c === null || c === undefined || c === false) continue;
      allChildren.push(c);
    }
  }
  return {
    $$typeof: Symbol.for('react.element'),
    type,
    props: { ...cleanProps, children: allChildren.length === 0 ? undefined : allChildren.length === 1 ? allChildren[0] : allChildren },
    key: props?.key as string | number | undefined,
  };
}

export function cloneElement(el: unknown, props: Record<string, unknown>, ...children: unknown[]): unknown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reactEl = el as any;
  return createElement(
    reactEl.type,
    { ...(reactEl.props || {}), ...props },
    ...children
  );
}

export function isValidElement(value: unknown): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof value === 'object' && value !== null && (value as any).$$typeof === Symbol.for('react.element');
}

export function useState<T>(initial: T | (() => T)): [T, (next: T | ((prev: T) => T)) => void] {
  const id = getHookOrder();
  if (!hookCache.has(id)) {
    const value = typeof initial === 'function' ? (initial as () => T)() : initial;
    hookCache.set(id, value);
  }
  const setter = (next: T | ((prev: T) => T)): void => {
    const old = hookCache.get(id) as T;
    const newValue = typeof next === 'function' ? (next as (prev: T) => T)(old) : next;
    hookCache.set(id, newValue);
  };
  return [hookCache.get(id) as T, setter];
}

export function useEffect(fn: () => void | (() => void), deps?: ReadonlyArray<unknown>): void {
  const id = getHookOrder();
  const key = `effect:${id}`;
  const prevDeps = memoRegistry.get(key) as ReadonlyArray<unknown> | undefined;
  let shouldRun = false;
  if (!prevDeps || !deps) {
    shouldRun = true;
  } else {
    shouldRun = deps.length !== prevDeps.length || deps.some((d, i) => !Object.is(d, prevDeps[i]));
  }
  if (shouldRun) {
    memoRegistry.set(key, deps);
    pendingEffects.push({ fn, deps });
  }
}

export function useLayoutEffect(fn: () => void | (() => void), deps?: ReadonlyArray<unknown>): void {
  return useEffect(fn, deps);
}

export function useCallback<T extends (...args: never[]) => unknown>(fn: T, deps: ReadonlyArray<unknown>): T {
  const id = getHookOrder();
  const key = `cb:${id}`;
  const prevDeps = memoRegistry.get(key) as ReadonlyArray<unknown> | undefined;
  if (!prevDeps || deps.length !== prevDeps.length || deps.some((d, i) => !Object.is(d, prevDeps[i]))) {
    memoRegistry.set(key, deps);
    memoRegistry.set(`cbval:${id}`, fn);
  }
  return memoRegistry.get(`cbval:${id}`) as T;
}

export function useMemo<T>(fn: () => T, deps: ReadonlyArray<unknown>): T {
  const id = getHookOrder();
  const key = `memo:${id}`;
  const prevDeps = memoRegistry.get(key) as ReadonlyArray<unknown> | undefined;
  if (!prevDeps || deps.length !== prevDeps.length || deps.some((d, i) => !Object.is(d, prevDeps[i]))) {
    memoRegistry.set(key, deps);
    memoRegistry.set(`memoval:${id}`, fn());
  }
  return memoRegistry.get(`memoval:${id}`) as T;
}

export function useRef<T>(initial: T | null): { current: T | null } {
  const id = getHookOrder();
  const key = `ref:${id}`;
  if (!refRegistry.has(key)) {
    refRegistry.set(key, { current: initial });
  }
  return refRegistry.get(key) as { current: T | null };
}

export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void] {
  const [state, setState] = useState<S>(initialState);
  const dispatch = (action: A): void => setState((prev) => reducer(prev, action));
  return [state, dispatch];
}

export const Fragment = (props: { children?: unknown }): unknown => props.children;
export const StrictMode = (props: { children?: unknown }): unknown => props.children;

export const Children = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map<T, R>(children: any, fn: (child: T, index: number) => R): R[] {
    if (children === null || children === undefined) return [];
    const arr = Array.isArray(children) ? children : [children];
    return arr.map((c, i) => fn(c as T, i));
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forEach(children: any, fn: (child: any, index: number) => void): void {
    if (children === null || children === undefined) return;
    const arr = Array.isArray(children) ? children : [children];
    arr.forEach((c, i) => fn(c, i));
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  count(children: any): number {
    if (children === null || children === undefined) return 0;
    return Array.isArray(children) ? children.length : 1;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toArray(children: any): unknown[] {
    if (children === null || children === undefined) return [];
    return Array.isArray(children) ? children : [children];
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  only(children: any): unknown {
    if (Array.isArray(children)) {
      if (children.length !== 1) throw new Error('Children.only expected single child');
      return children[0];
    }
    return children;
  },
};

// Helper: invoke a component once and return the rendered tree
export function renderOnce<P>(component: (props: P) => unknown, props: P): unknown {
  hookOrder = 0;
  hookCache = new Map();
  memoRegistry = new Map();
  refRegistry = new Map();
  pendingEffects = [];
  const result = component(props);
  // Run effects after render
  for (const eff of pendingEffects) {
    try { eff.fn(); } catch { /* swallow */ }
  }
  pendingEffects = [];
  return result;
}

export type ComponentFn = (props: unknown) => unknown;
export type ReactNode = unknown;
export type ReactElement = {
  $$typeof: symbol;
  type: unknown;
  props: Record<string, unknown>;
  key?: string | number;
};
export type CSSProperties = Record<string, string | number>;
