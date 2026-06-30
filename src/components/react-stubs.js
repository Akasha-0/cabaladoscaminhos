// src/components/react-stubs.js — runtime h() helper and ComponentType alias
// Cycle 78/81/82 lesson: avoid JSX literals in isolated worktree by using h().

export type ComponentType<P = unknown> = (props: P) => JSX.Element | null;

export interface VNodeProps {
  readonly [key: string]: unknown;
  readonly children?: ReadonlyArray<unknown> | unknown;
}

/**
 * h(type, props, ...children) — minimal hyperscript helper.
 * Returns a vnode tree. Mirrors React.createElement shape closely enough for
 * test recorders and the cycle 81 vnode-recorder pattern.
 */
export function h(
  type: any,
  props: any,
  ...children: any[]
): JSX.Element {
  const flatChildren: unknown[] = [];
  for (const c of children) {
    if (Array.isArray(c)) {
      for (const cc of c) flatChildren.push(cc);
    } else if (c !== null && c !== undefined && c !== false) {
      flatChildren.push(c);
    }
  }
  const merged = props ? { ...props } : {};
  if (flatChildren.length > 0) {
    merged.children = flatChildren.length === 1 ? flatChildren[0] : flatChildren;
  }
  return {
    type,
    props: merged,
    key: (props && props.key) ?? null,
  };
}
