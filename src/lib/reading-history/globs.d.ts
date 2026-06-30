// Type-only stub for Node globals (sandbox-friendly, no @types/node needed).
declare namespace NodeJS {
  interface Process {
    argv: string[];
    exit(code?: number): never;
  }
  interface Console {
    log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  }
}

declare const process: NodeJS.Process;
declare const console: NodeJS.Console;
declare const globalThis: {
  readonly Buffer?: unknown;
  [key: string]: unknown;
};

declare function require(name: string): unknown;
declare function require(id: string, parent?: unknown): unknown;
declare const module: { exports: unknown };
