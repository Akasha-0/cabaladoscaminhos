// h() — hyperscript helper (cycle-78/81/82/84 pattern, avoids JSX literals
// in isolated worktrees where tsx/JSX transform may not be available)
import * as React from 'react';

type Props = Record<string, unknown>;
type Child = React.ReactNode;

export type ReactComponentType =
  | string
  | React.ComponentType<Props>
  | React.ExoticComponent<Props>;

export function h(
  type: ReactComponentType,
  props: Props | null,
  ...children: Child[]
): React.ReactElement {
  return React.createElement(type as string | React.ComponentType<Props>, props ?? {}, ...children);
}
