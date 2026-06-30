// react-stubs.d.ts
// Cycle 78/81/82/83 lesson: avoid JSX literals in isolated worktree.
// We use h() helper everywhere. The .d.ts only provides ambient types.

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