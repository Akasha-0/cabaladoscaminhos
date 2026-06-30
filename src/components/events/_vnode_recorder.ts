// ============================================================================
// VNODE RECORDER — utility for capturing React component trees as JSON
// ============================================================================
// W80-B · Cycle 80 · 2026-06-30
// Provides a minimal `element()` helper that:
//   1. Invokes the component function with provided props
//   2. Captures the resulting tree via React.createElement (used by component)
//   3. Exposes utilities to walk the resulting tree
// ============================================================================

import * as React from './_react_stub.ts';

export interface VNode {
  type: string | (() => unknown);
  props: Record<string, unknown>;
  children: ReadonlyArray<VNode>;
}

export interface VNodeRecorder {
  element: (type: unknown, props: unknown, ...children: unknown[]) => unknown;
  renderToTree: (el: unknown) => VNode;
  findByType: (tree: VNode, type: string) => VNode[];
  findByTestId: (tree: VNode, testId: string) => VNode | null;
  findAll: (tree: VNode) => VNode[];
}

export function createRecorder(): VNodeRecorder {
  // element() — invokes component OR wraps in createElement for intrinsic tags
  const element = (type: unknown, props: unknown, ...children: unknown[]): unknown => {
    if (typeof type === 'function') {
      // It's a component function — invoke it directly to render the tree
      const componentFn = type as (p: unknown) => unknown;
      // Merge children into props (React convention)
      let mergedProps: Record<string, unknown> = {};
      if (props && typeof props === 'object') {
        mergedProps = { ...(props as Record<string, unknown>) };
      }
      if (children.length > 0) {
        mergedProps.children = children.length === 1 ? children[0] : children;
      }
      // Reset hooks state for this render
      return React.renderOnce(componentFn as React.ComponentFn, mergedProps);
    }
    // Intrinsic tag — just call createElement
    const cleanProps: Record<string, unknown> = {};
    if (props && typeof props === 'object') {
      const p = props as Record<string, unknown>;
      for (const [k, v] of Object.entries(p)) {
        if (k === 'children') continue;
        if (k === 'key') continue;
        cleanProps[k] = v;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return React.createElement(type as any, cleanProps as any, ...children as any) as unknown;
  };

  const toVNode = (el: unknown): VNode => {
    if (!React.isValidElement(el)) {
      return { type: '__text__', props: { value: String(el) }, children: [] };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reactEl = el as React.ReactElement;
    const typeStr =
      typeof reactEl.type === 'string'
        ? reactEl.type
        : (reactEl.type as { displayName?: string; name?: string })?.displayName
          ?? (reactEl.type as { name?: string })?.name
          ?? 'Component';

    const children: VNode[] = [];
    const props = reactEl.props ?? {};
    if (props.children !== undefined) {
      const c = Array.isArray(props.children) ? props.children : [props.children];
      for (const cc of c) {
        if (cc === null || cc === undefined || cc === false) continue;
        children.push(toVNode(cc));
      }
    }
    const propsCopy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(props)) {
      if (k === 'children') continue;
      propsCopy[k] = v;
    }
    return { type: typeStr, props: propsCopy, children };
  };

  const renderToTree = (el: unknown): VNode => toVNode(el);

  const findByType = (tree: VNode, type: string): VNode[] => {
    const out: VNode[] = [];
    const walk = (n: VNode): void => {
      if (n.type === type) out.push(n);
      for (const c of n.children) walk(c);
    };
    walk(tree);
    return out;
  };

  const findByTestId = (tree: VNode, testId: string): VNode | null => {
    let found: VNode | null = null;
    const walk = (n: VNode): boolean => {
      if (n.props['data-testid'] === testId) {
        found = n;
        return true;
      }
      for (const c of n.children) {
        if (walk(c)) return true;
      }
      return false;
    };
    walk(tree);
    return found;
  };

  const findAll = (tree: VNode): VNode[] => {
    const out: VNode[] = [tree];
    const walk = (n: VNode): void => {
      for (const c of n.children) {
        out.push(c);
        walk(c);
      }
    };
    walk(tree);
    return out;
  };

  return { element, renderToTree, findByType, findByTestId, findAll };
}
