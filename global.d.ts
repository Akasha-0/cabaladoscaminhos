/**
 * Minimal Node globals stub (no @types/node dependency).
 * Used by isolated tsconfig.w83-d.json so we don't pull in Next/React types.
 */
declare global {
  // eslint-disable-next-line no-var
  var process: {
    env: Record<string, string | undefined>
    exit(code?: number): never
    cwd(): string
    stdout: { write(s: string): boolean }
    stderr: { write(s: string): boolean }
    argv: string[]
    platform: NodeJS.Platform
  }
  // eslint-disable-next-line no-var
  var console: {
    log(...args: unknown[]): void
    error(...args: unknown[]): void
    warn(...args: unknown[]): void
    info(...args: unknown[]): void
    debug(...args: unknown[]): void
  }
}

export {}