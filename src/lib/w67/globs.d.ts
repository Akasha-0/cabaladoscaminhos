// Type stubs for Node built-ins used in engine (cycle 65 lesson: process.getBuiltinModule)
// These are only needed for tsc; runtime uses node:crypto directly.

declare module "node:crypto" {
  export interface Hmac {
    update(data: string): Hmac;
    digest(encoding: string): string;
  }
  export function createHmac(algorithm: string, key: string): Hmac;
  export interface Hash {
    update(data: string): Hash;
    digest(encoding: string): string;
  }
  export function createHash(algorithm: string): Hash;
  export function randomBytes(size: number): Buffer;
}

declare module "node:module" {
  export function createRequire(url: string): (id: string) => any;
}

declare const process: {
  getBuiltinModule?(name: string): any;
};

declare const import_meta_url: string;
interface ImportMeta {
  readonly url: string;
}