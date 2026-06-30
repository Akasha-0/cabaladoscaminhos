// node-stubs.d.ts — minimal Node.js ambient types
// Cycle 82 lesson: avoid @types/node to keep bundle small.

declare const process: {
  exit(code?: number): never;
  env: { readonly [key: string]: string | undefined };
  stdout: { write(s: string): boolean };
  stderr: { write(s: string): boolean };
};
declare const console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
};
