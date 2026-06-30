// Stub for sandbox-isolated TSC (no @types/node needed)
// ============================================================================

declare global {
  var process: {
    exit(code?: number): never;
    env: Record<string, string | undefined>;
  };
  var console: {
    log(...args: unknown[]): void;
    error(...args: unknown[]): void;
  };
}

// Globals used in spec files (exit, error reporting)
declare const process: {
  exit(code?: number): never;
  env: Record<string, string | undefined>;
};

// Module-level exports so TypeScript treats them as values, not just types.
declare module "node:crypto" {
  export function createHash(algo: string): { update(s: string): { digest(enc: string): string } };
}

declare module "next/headers" {
  export function headers(): Headers;
}
