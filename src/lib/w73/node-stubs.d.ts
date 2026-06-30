// node-stubs.d.ts — minimal ambient declarations for node --experimental-strip-types
// Declare Node globals we touch in moderation-queue / audit-log so TSC is happy.

declare namespace NodeJS {
  interface Global {
    __w73_crypto?: Crypto;
  }
}

declare const process: {
  stdout: { write: (s: string) => void };
  exit: (code: number) => never;
  stderr: { write: (s: string) => void };
  env: Record<string, string | undefined>;
  platform: string;
};

declare const Buffer: {
  from: (s: string | Uint8Array, enc?: string) => Uint8Array;
};

declare const console: {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

interface Crypto {
  subtle: {
    digest: (alg: string, data: Uint8Array) => Promise<ArrayBuffer>;
  };
}
declare const crypto: Crypto;
