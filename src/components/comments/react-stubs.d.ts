// react-stubs.d.ts — local to comments package.
// Re-exports the global ambient JSX namespace for type-checking.

export type ComponentType<P = unknown> = (props: P) => JSX.Element | null;

export interface VNodeProps {
  readonly [key: string]: unknown;
  readonly children?: ReadonlyArray<unknown> | unknown;
}

export function h(
  type: any,
  props: any,
  ...children: any[]
): JSX.Element;