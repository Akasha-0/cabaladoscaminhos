// Ambient declarations for the w65 community-moderation-engine files so they
// can be type-checked in isolation without `@types/node`.
//
// Only declares the subset of node/browser globals we actually touch.

declare const process: {
  exit(code?: number): never
  stdout: { write(s: string): boolean }
  getBuiltinModule?: (m: string) => unknown
}
declare const console: {
  log(...args: unknown[]): void
  error(...args: unknown[]): void
}

declare const import_meta_url: string
