// Ambient declarations for the w66 live-streams files so they can be
// type-checked in isolation without `@types/node`.

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
