/**
 * node-stubs.d.ts — declares globals used by spec + smoke without @types/node.
 *
 * `declare global` + `export {}` makes this a module WHILE still augmenting
 * the global scope (lesson from cycle 82 W82-B).
 */
declare global {
  // eslint-disable-next-line no-var
  var process: {
    env: { readonly [k: string]: string | undefined };
    stdout: { write(s: string): boolean };
    stderr: { write(s: string): boolean };
    exit(code: number): never;
  };
  // eslint-disable-next-line no-var
  var console: {
    log(...args: unknown[]): void;
    error(...args: unknown[]): void;
    warn(...args: unknown[]): void;
  };
}
export {};