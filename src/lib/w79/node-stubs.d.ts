// Permissive stubs for Node-only globals so isolated TSC checks pass without @types/node.
// At RUNTIME these come from Node's own environment (verified by smoke + spec harness).
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

declare module 'node:perf_hooks' {
  export const performance: any;
}

declare const process: any;
declare const console: any;
declare function setTimeout(cb: (...args: unknown[]) => unknown, ms: number): unknown;
