// Worktree-isolated node stubs — script file (NO top-level imports/exports).
// Required by tsconfig.w75-b.json so spec/smoke can reference node globals
// without polluting root tsconfig (which uses vitest + Next.js types).

declare global {
  // The `process` global is intentionally minimal: smoke uses `process.exit`.
  // `node --experimental-strip-types` already provides a real `process`, but
  // we declare it for tsc worktree-isolated runs that don't include @types/node.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Process {
      exit(code?: number): never;
      env: { [key: string]: string | undefined };
    }
  }
  var process: NodeJS.Process;

  // setTimeout / clearTimeout are global in Node, but we declare them so
  // SMOKE timing tests don't need @types/node pulled into the worktree tsconfig.
  function setTimeout(handler: (...args: unknown[]) => void, ms?: number): unknown;
  function clearTimeout(handle: unknown): void;

  // crypto.subtle is used for HMAC-SHA256 (LGPD-grade journal cache key).
  // We declare only the methods we use — no full @types/web-crypto needed.
  interface SubtleCrypto {
    importKey(
      format: 'raw',
      keyData: Uint8Array,
      algo: { name: 'HMAC'; hash: 'SHA-256' },
      extractable: boolean,
      usages: ('sign' | 'verify')[],
    ): Promise<unknown>;
    sign(algo: 'HMAC', key: unknown, data: Uint8Array): Promise<ArrayBuffer>;
    digest(algo: 'SHA-256', data: Uint8Array): Promise<ArrayBuffer>;
  }
  interface Crypto {
    readonly subtle: SubtleCrypto;
    randomUUID(): string;
  }
  var crypto: Crypto;
  var console: {
    log(...args: unknown[]): void;
    error(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    info(...args: unknown[]): void;
  };
}

export {};
