// ============================================================================
// W85-C · Node type stubs for spec harness
// ----------------------------------------------------------------------------
// `declare global` pattern (cycle 84 W84-C) so TSC accepts `process`,
// `setTimeout` etc. even with `types: []` in tsconfig.
// ============================================================================

declare global {
  var process: {
    exit(code?: number): never;
    env: Record<string, string | undefined>;
  };
  function setTimeout(handler: () => void, ms?: number): unknown;
  function clearTimeout(handle: unknown): void;
  const import_meta_url: string;
}

declare module 'fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function readFileSync(path: string): Uint8Array;
}

declare module 'url' {
  export function fileURLToPath(url: string): string;
  export const pathToFileURL: (path: string) => URL;
}

declare module 'path' {
  export function dirname(p: string): string;
  export function join(...parts: string[]): string;
  export function basename(p: string): string;
}

declare module 'node:fs' {
  export * from 'fs';
}
declare module 'node:url' {
  export * from 'url';
}
declare module 'node:path' {
  export * from 'path';
}

export {};