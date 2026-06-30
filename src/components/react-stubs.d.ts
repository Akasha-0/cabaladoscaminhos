// react-stubs.d.ts — companion types for react-stubs.js

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