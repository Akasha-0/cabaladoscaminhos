/**
 * globs.d.ts — Type-only Node globals stub.
 *
 * Cycle 68 lesson: no @types/node in worktree; declare just what we use.
 * Node 22 native — Intl.* + Date + Math + Map + Array + Object + RegExp + String + Number.
 */

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference no-default-lib="true" />

declare global {
  // We deliberately avoid depending on @types/node globals.
  // This file is type-only; runtime comes from Node 22.
  interface Intl {
    DateTimeFormat: typeof Intl.DateTimeFormat;
    NumberFormat: typeof Intl.NumberFormat;
    RelativeTimeFormat: typeof Intl.RelativeTimeFormat;
    ListFormat: typeof Intl.ListFormat;
  }

  const Intl: Intl;

  interface DateConstructor {
    new (value: number | string): Date;
  }

  interface Console {
    log(...args: unknown[]): void;
  }

  const console: Console;

  interface Process {
    exit(code?: number): never;
    env: Record<string, string | undefined>;
  }

  const process: Process;
}

export {};