/**
 * Structured logger — Wave 31.4 Observability MVP
 *
 * Pino-based JSON logger with:
 *  - Level control (debug/info/warn/error) via env LOG_LEVEL
 *  - Per-request child logger via `.child({ requestId, ... })`
 *  - PII redaction (password/token/secret/cookie/jwt/session) at write time
 *  - Optional ANSI pretty-print for local dev (no pino-pretty dep)
 *  - Singleton rootLogger — same instance every module sees
 */

import pino, { type Logger, type LoggerOptions } from 'pino';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LoggerConfig {
  level: LogLevel;
  service: string;
  env: string;
  pretty: boolean;
}

const SERVICE_NAME = process.env['SERVICE_NAME'] ?? 'akasha';
const ENV_NAME = process.env['NODE_ENV'] ?? 'development';

function resolveLevel(): LogLevel {
  const raw = (process.env['LOG_LEVEL'] ?? 'info').toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') {
    return raw;
  }
  return 'info';
}

const baseOptions: LoggerOptions = {
  level: resolveLevel(),
  base: { service: SERVICE_NAME, env: ENV_NAME },
  timestamp: pino.stdTimeFunctions.isoTime,
  messageKey: 'message',
  formatters: {
    level(label: string) {
      return { level: label };
    },
  },
  redact: {
    paths: [
      '*.password',
      '*.token',
      '*.secret',
      '*.authorization',
      '*.cookie',
      '*.jwt',
      '*.session',
      'password',
      'token',
      'secret',
      'authorization',
    ],
    censor: '[REDACTED]',
  },
};

export const rootLogger: Logger = pino(baseOptions);

/** Module-scoped mutable so callers can rewire for tests / pretty mode. */
export const _rootLoggerRef: { value: Logger } = { value: rootLogger };

/** Re-read the root logger (allows installPrettyMode to swap the destination). */
export function getRootLogger(): Logger {
  return _rootLoggerRef.value;
}

/**
 * Get a namespaced child logger. Namespace is attached to every log line
 * so the observability backend can filter / aggregate by subsystem.
 *
 * @param namespace  e.g. 'akasha.mentor', 'akasha.health', 'middleware'
 */
export function getLogger(namespace: string): Logger {
  return _rootLoggerRef.value.child({ namespace });
}

/**
 * Get a request-scoped child logger with `requestId` pre-bound.
 * Combine with `getRequestId(req)` from your middleware.
 *
 * @param namespace  e.g. 'akasha.mentor'
 * @param requestId  from `getRequestId(req)` or `generateRequestId()`
 * @param extra      optional extra context fields (userId, route, ...)
 */
export function getRequestLogger(
  namespace: string,
  requestId: string,
  extra?: LogContext
): Logger {
  return _rootLoggerRef.value.child({ namespace, requestId, ...(extra ?? {}) });
}

/**
 * Pretty-printer shim for dev. Avoids depending on pino-pretty.
 * Pipes through stdout with ANSI color codes.
 */
function prettyFormatter(input: Record<string, unknown>): string {
  const level = String(input['level'] ?? 'info').padEnd(5);
  const time = String(input['time'] ?? new Date().toISOString());
  const ns = String(input['namespace'] ?? input['service'] ?? '');
  const msg = String(input['msg'] ?? input['message'] ?? '');
  const colors: Record<string, string> = {
    debug: '\x1b[90m',
    info: '\x1b[36m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
  };
  const reset = '\x1b[0m';
  const c = colors[String(input['level'] ?? 'info')] ?? '';
  const rest: Record<string, unknown> = { ...input };
  delete rest['level'];
  delete rest['time'];
  delete rest['namespace'];
  delete rest['service'];
  delete rest['env'];
  delete rest['pid'];
  delete rest['hostname'];
  delete rest['msg'];
  delete rest['message'];
  const extraKeys = Object.keys(rest);
  const extraStr =
    extraKeys.length > 0
      ? ' ' + JSON.stringify(rest, (_k, v) => (v instanceof Error ? v.message : v))
      : '';
  return `${c}${level}${reset} ${time} [${ns}] ${msg}${extraStr}`;
}

/**
 * Install a stdout-friendly pretty printer (dev only). Production stays JSON.
 */
export function installPrettyMode(): void {
  if (ENV_NAME === 'production') return;
  // pino accepts a destination stream — intentionally untyped to avoid
  // pulling pino's internal stream types into our public surface.
  _rootLoggerRef.value = pino(baseOptions, {
    write(line: string) {
      try {
        const parsed = JSON.parse(line);
        process.stdout.write(prettyFormatter(parsed) + '\n');
      } catch {
        process.stdout.write(line);
      }
    },
  });
}

/**
 * For tests only — rebuild the root logger using the original stdout destination.
 */
export function __resetRootLoggerForTests(): void {
  _rootLoggerRef.value = rootLogger;
}

/**
 * Snapshot of the resolved logger config (useful for /api/akasha/health output).
 */
export function getLoggerConfig(): LoggerConfig {
  return {
    level: resolveLevel(),
    service: SERVICE_NAME,
    env: ENV_NAME,
    pretty: ENV_NAME !== 'production',
  };
}