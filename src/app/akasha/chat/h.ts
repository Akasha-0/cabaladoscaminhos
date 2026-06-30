// h.ts — minimal hyperscript helper for the W85-D Akasha streaming page.
// Cycle 78/81/82/84 lesson: avoid JSX literals in isolated worktree. We use
// h() everywhere instead. Mirrors React.createElement shape closely enough
// for the vnode-recorder test pattern in the spec.

import type { ReactElement, ReactNode, Key, ReactComponentType } from 'react';

export function h(
  type: string | symbol | ReactComponentType<unknown> | ((props: any) => ReactElement | null),
  props: Record<string, unknown> | null,
  ...children: ReactNode[]
): ReactElement {
  const flat: ReactNode[] = [];
  for (const c of children) {
    if (Array.isArray(c)) {
      for (const cc of c) flat.push(cc);
    } else if (c !== null && c !== undefined && c !== false && c !== true) {
      flat.push(c);
    }
  }
  const merged: Record<string, unknown> = props ? { ...props } : {};
  if (flat.length > 0) {
    merged['children'] = flat.length === 1 ? flat[0] : flat;
  }
  const key = (props && (props['key'] as Key | null)) ?? null;
  return {
    type: type as string | ReactComponentType<unknown> | symbol,
    props: merged,
    key,
  };
}

/**
 * Fragment shorthand — h(Fragment, null, ...children).
 * Used to wrap multiple top-level children without a DOM node.
 */
export const Fragment: unique symbol = Symbol.for('react.fragment');