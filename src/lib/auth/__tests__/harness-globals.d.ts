// Stub for node globals so TSC spec checks pass without @types/node.
// At runtime, `node --experimental-strip-types` uses Node's own globals.
declare const process: {
  readonly exit(code: number): never;
};
declare const Buffer: {
  alloc(size: number): unknown;
  from(input: string | Uint8Array, encoding?: string): {
    length: number;
    toString(encoding?: string): string;
    writeBigUInt64BE(value: bigint): unknown;
    slice(start: number, end: number): unknown;
    [index: number]: number;
  };
  readonly prototype: unknown;
};
declare const setTimeout: (cb: () => void, ms: number) => unknown;
declare const setInterval: (cb: () => void, ms: number) => unknown;
declare const clearTimeout: (handle: unknown) => void;
