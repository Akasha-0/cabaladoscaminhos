// Minimal Node globals stub for isolated tsconfig check (cycle 68 lesson #5).
// Avoids `npm i --save-dev @types/node` requirement.

declare const process: {
  argv: readonly string[];
  exit(code?: number): never;
  env: { readonly [k: string]: string | undefined };
  cwd(): string;
  pid: number;
  platform: string;
  version: string;
};

declare const console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
};

declare const require: (id: string) => unknown;

declare const module: {
  exports: unknown;
};

declare const __dirname: string;
declare const __filename: string;

declare namespace NodeJS {
  interface Module {
    readonly id: string;
    readonly filename: string;
    exports: unknown;
  }
}
