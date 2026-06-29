// Ambient declarations for isolated engine TSC (no @types/node installed)
// Per cycle 64 worker C pattern.

declare const import_meta_url: string;
declare const process: {
  exit(code?: number): never;
  getBuiltinModule?: (name: string) => unknown;
};
declare const console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
};

declare module "node:crypto" {
  export function createHash(alg: "sha256"): {
    update(data: string): { digest(enc: "hex" | "base64"): string };
  };
  export function createHmac(alg: "sha256", key: string): {
    update(data: string): { digest(enc: "hex" | "base64"): string };
  };
}

declare module "node:module" {
  export function createRequire(url: string): (id: string) => unknown;
}