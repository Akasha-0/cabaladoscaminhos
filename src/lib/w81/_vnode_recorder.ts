// ============================================================================
// W81-B — vnode_recorder
// ----------------------------------------------------------------------------
// Minimal React shim that records the virtual DOM tree built by a component
// during a single render. Used by the spec harness (events-rsvp-ui.spec.ts)
// to assert on what the UI rendered WITHOUT requiring a real DOM.
//
// Why this exists: cycle 80 lessons show that calling `React.createElement`
// alone returns an element with `type = Component`, not the rendered tree.
// We need to actually INVOKE the component function (which executes
// useState/useEffect/useId hooks) and walk the resulting tree.
//
// This file is in `.ts` (not `.ts`) so Node 22 `--experimental-strip-types`
// can load it for the smoke script. It is also valid TypeScript.
// ============================================================================

import {
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
} from './react-types.ts';

// ---- Minimal hooks state (per-component) ------------------------------------

interface HookCell<T> {
  value: T;
}

let hookStack: Array<HookCell<unknown>> = [];
let hookIndex = 0;
let currentRender: RenderRecorder | null = null;
let memoState: Array<{ deps: ReadonlyArray<unknown> | undefined; value: unknown }> = [];
let refState: Array<{ current: unknown }> = [];
let idCounter = 0;
let effectQueue: Array<{ cb: () => void | (() => void); deps?: ReadonlyArray<unknown> }> = [];

// ---- React stub (createElement + hooks) -------------------------------------

export function createElement(
  type: string | ((props: any) => ReactElement | null),
  props?: Readonly<Record<string, unknown>> | null,
  ...children: ReadonlyArray<ReactNode | string | number | null | undefined | false | true>
): ReactElement {
  const flatChildren = children.length === 0
    ? (props?.['children'] ?? null)
    : children.length === 1
      ? children[0] ?? null
      : Object.freeze([...children]);
  return Object.freeze({
    type,
    props: Object.freeze({
      ...(props ?? {}),
      children: flatChildren as any,
    }),
    key: ((props as any)?.key ?? null) as string | null,
  });
}

export const Fragment = Symbol.for('react.fragment') as unknown as symbol;

export function useState<T>(initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  if (hookIndex >= hookStack.length) {
    const seed = typeof initial === 'function' ? (initial as () => T)() : initial;
    hookStack.push({ value: seed });
  }
  const cell = hookStack[hookIndex++]! as HookCell<T>;
  const setter: Dispatch<SetStateAction<T>> = (value) => {
    const next = typeof value === 'function' ? (value as (p: T) => T)(cell.value) : value;
    cell.value = next;
  };
  return [cell.value, setter];
}

export function useEffect(cb: () => void | (() => void), deps?: ReadonlyArray<unknown>): void {
  if (hookIndex >= memoState.length) {
    memoState.push({ deps: undefined as any, value: undefined });
    effectQueue.push({ cb, deps: deps ?? [] });
  }
  hookIndex++;
}

export function useMemo<T>(factory: () => T, deps?: ReadonlyArray<unknown>): T {
  if (hookIndex >= memoState.length) {
    memoState.push({ deps, value: factory() });
  }
  hookIndex++;
  return memoState[hookIndex - 1]!.value as T;
}

export function useId(): string {
  if (hookIndex >= refState.length) {
    refState.push({ current: `w81-id-${++idCounter}` });
  }
  hookIndex++;
  return refState[hookIndex - 1]!.current as string;
}

export function useRef<T>(initial: T | null): { readonly current: T | null } {
  if (hookIndex >= refState.length) {
    refState.push({ current: initial });
  }
  hookIndex++;
  return refState[hookIndex - 1]! as { readonly current: T | null };
}

export function useCallback<T extends (...args: any[]) => any>(cb: T, _deps?: ReadonlyArray<unknown>): T {
  return cb;
}

// ---- Render recorder --------------------------------------------------------

export interface RenderedNode {
  readonly type: string | string; // we serialize symbol/component → string
  readonly props: Readonly<Record<string, unknown>>;
  readonly children: ReadonlyArray<RenderedNode | string>;
  readonly key: string | null;
}

export interface RenderRecorder {
  readonly root: RenderedNode | null;
  readonly warnings: ReadonlyArray<string>;
}

function flattenChildren(c: unknown): ReadonlyArray<RenderedNode | string> {
  if (c === null || c === undefined || c === false || c === true) return [];
  if (typeof c === 'string' || typeof c === 'number') return [String(c)];
  if (Array.isArray(c)) return Object.freeze(c.flat(Infinity).map((x) => normalizeChild(x)));
  return [normalizeChild(c)];
}

function normalizeChild(c: unknown): RenderedNode | string {
  if (typeof c === 'string' || typeof c === 'number') return String(c);
  if (c && typeof c === 'object' && 'type' in (c as any)) {
    return serialize(c as ReactElement);
  }
  if (c && typeof c === 'object' && 'props' in (c as any) && 'type' in (c as any)) {
    return serialize(c as unknown as ReactElement);
  }
  return String(c);
}

function serialize(el: ReactElement | null | undefined): RenderedNode {
  if (!el) {
    return Object.freeze({ type: '__null__', props: {}, children: [], key: null });
  }
  const t = el.type;
  let typeName: string;
  if (typeof t === 'string') {
    typeName = t;
  } else if (typeof t === 'function') {
    typeName = (t as any).displayName ?? t.name ?? 'Anonymous';
  } else {
    typeName = String(t);
  }
  // unwrap component invocation — actually invoke the function so hooks fire
  if (typeof t === 'function') {
    const inner = (t as any)(el.props ?? {});
    if (inner === null || inner === undefined) {
      return Object.freeze({ type: typeName, props: Object.freeze({ ...el.props, children: undefined }), children: [], key: el.key });
    }
    if (typeof inner === 'object' && 'type' in inner) {
      return serialize(inner as ReactElement);
    }
    return Object.freeze({
      type: typeName,
      props: Object.freeze({ ...(el.props as any), children: undefined }),
      children: Object.freeze([String(inner)]),
      key: el.key,
    });
  }
  // host element
  const props = Object.freeze({ ...(el.props as any), children: undefined });
  const children = flattenChildren((el.props as any)?.children);
  return Object.freeze({ type: typeName, props, children, key: el.key });
}

/** Render a component to a flat tree, executing hooks. */
export function renderOnce<P>(
  Component: (props: P) => ReactElement | null,
  props: P,
): RenderRecorder {
  hookStack = [];
  hookIndex = 0;
  memoState = [];
  refState = [];
  effectQueue = [];
  idCounter = 0;
  const warnings: string[] = [];
  const prevRecorder = currentRender;
  try {
    currentRender = null;
    const el = Component(props);
    const root = el ? serialize(el) : null;
    return Object.freeze({ root, warnings: Object.freeze(warnings) });
  } finally {
    currentRender = prevRecorder;
  }
}

// ---- Tree walking helpers (used by spec assertions) -------------------------

export function findByType(root: RenderedNode | null, typeName: string): RenderedNode[] {
  const out: RenderedNode[] = [];
  if (!root) return out;
  const walk = (n: RenderedNode) => {
    if (n.type === typeName) out.push(n);
    n.children.forEach((c) => {
      if (typeof c !== 'string') walk(c);
    });
  };
  walk(root);
  return out;
}

export function findByText(root: RenderedNode | null, needle: string): boolean {
  if (!root) return false;
  // NFD-normalize + strip combining marks so 'no' matches 'no' regardless of accents
  const norm = (s: string): string => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const n = norm(needle);
  const walk = (node: RenderedNode): boolean => {
    for (const c of node.children) {
      if (typeof c === 'string' && norm(c).includes(n)) return true;
      if (typeof c !== 'string' && walk(c)) return true;
    }
    return false;
  };
  return walk(root);
}

export function getProp<T = unknown>(node: RenderedNode, name: string): T | undefined {
  return (node.props as any)?.[name] as T | undefined;
}

export function walkAll(root: RenderedNode | null, cb: (n: RenderedNode) => void): void {
  if (!root) return;
  const stack: RenderedNode[] = [root];
  while (stack.length > 0) {
    const n = stack.pop()!;
    cb(n);
    for (const c of n.children) {
      if (typeof c !== 'string') stack.push(c);
    }
  }
}

export function countNodes(root: RenderedNode | null): number {
  if (!root) return 0;
  let count = 0;
  walkAll(root, () => count++);
  return count;
}