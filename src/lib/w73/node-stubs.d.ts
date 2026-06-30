declare const Buffer: any;
declare type Buffer = any;
declare const process: {
  env: Record<string, string | undefined>;
  hrtime: () => [number, number];
  exit: (code?: number) => never;
  stdin: { read: (buf: Uint8Array) => number | null; on: (e: string, cb: (chunk: any) => void) => void };
  stdout: { write: (s: string) => boolean };
  stderr: { write: (s: string) => boolean };
  cwd: () => string;
  platform: string;
};
declare const setTimeout: (cb: (...a: unknown[]) => unknown, ms?: number) => unknown;
declare const clearTimeout: (id: unknown) => void;
declare const console: { log: (...args: unknown[]) => void; error: (...args: unknown[]) => void; warn: (...args: unknown[]) => void; info: (...args: unknown[]) => void };
declare const crypto: { subtle: { importKey: (fmt: string, k: any, algo: any, ext: boolean, ops: string[]) => Promise<any>; sign: (algo: string, key: any, data: any) => Promise<ArrayBuffer> } };
