// react-stubs.d.ts — ambient JSX namespace + h() helper for isolated worktrees.
// Cycle 78/81/82 lesson: avoid JSX literals, use h() everywhere.
// We declare JSX globally with IntrinsicElements and Element so .ts files can
// type-check h(...) returns as JSX.Element.

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elem: string]: any;
    }
    interface Element {
      type: any;
      props: any;
      key: any;
    }
    type ReactElement<P = unknown> = { type: any; props: P; key: any };
  }
}

export {};