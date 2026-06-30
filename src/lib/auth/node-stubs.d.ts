// Permissive stubs for Node-only globals so isolated TSC checks pass without @types/node.
// At RUNTIME these come from Node's own environment (verified by smoke + spec harness).
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

declare module 'node:crypto' {
  export const createHmac: any;
  export const randomBytes: any;
  export const timingSafeEqual: any;
  export const scrypt: any;
}

declare module 'node:util' {
  export const promisify: any;
}

// Declare Buffer as BOTH a type alias and a runtime const stub.
// Any-typed: keeps engines + spec harness compiling without runtime errors.
declare type Buffer = any;
declare const Buffer: any;

declare const process: any;
declare const console: any;
declare function setTimeout(cb: (...args: unknown[]) => unknown, ms: number): unknown;
