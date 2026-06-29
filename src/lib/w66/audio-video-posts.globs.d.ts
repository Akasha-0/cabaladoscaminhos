// Ambient declarations for the w66 audio-video-posts files so they
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

declare const Buffer: {
  from(input: string, encoding: string): Uint8Array & {
    toString(encoding?: string): string
    length: number
    [index: number]: number
  }
}

declare const globalThis: unknown