/**
 * Minimal tracing + request ID middleware — Wave 31.4 Observability MVP
 *
 * What it does (intentionally NOT OpenTelemetry — that's Wave 32.1):
 *  1. Reads `X-Request-Id` from the incoming request, or generates a new
 *     one (`req-` prefix + 16 hex chars).
 *  2. Stores it on `headers['x-request-id']` and on a Symbol-keyed field
 *     so downstream code can read it without prop-drilling.
 *  3. Returns a request-scoped child logger pre-bound with `requestId`,
 *     `method`, and `path`.
 *  4. Logs `request.started`, then times the call, then logs
 *     `request.completed` (or `request.failed`) with latencyMs, status,
 *     and (if available) userId.
 *  5. Records duration in `http_request_duration_seconds` and increments
 *     `http_requests_total`. Status comes from whatever the handler sets.
 *
 * Designed to be framework-agnostic at the core: `withRequestContext`
 * accepts a plain object that satisfies the `RequestLike` interface.
 *
 * For Next.js App Router, use `withNextRequest(req, handler)`.
 */

import { randomBytes } from 'node:crypto';
import {
  getRequestLogger,
  type LogContext,
  type LogLevel,
} from './logger.js';
import {
  httpRequestsTotal,
  httpRequestDurationSeconds,
} from './metrics.js';

/** A minimal subset of an HTTP request we need. Compatible with NextRequest. */
export interface RequestLike {
  headers: {
    get(name: string): string | null | undefined;
    set(name: string, value: string): void;
  };
  method?: string;
  url?: string;
  [k: string]: unknown;
}

/** Response-shape we need for logging. */
export interface ResponseLike {
  status?: number;
  [k: string]: unknown;
}

const REQUEST_ID_HEADER = 'x-request-id';
const REQUEST_ID_SYMBOL = Symbol.for('@akasha/request-id');

/** Generate a new request id: `req-` + 16 hex chars. */
export function generateRequestId(): string {
  return `req-${randomBytes(8).toString('hex')}`;
}

/** Read the request id from headers, or generate one. */
export function getRequestId(req: RequestLike): string {
  const fromHeaders = req.headers.get(REQUEST_ID_HEADER);
  if (fromHeaders && fromHeaders.length > 0 && fromHeaders.length <= 200) {
    return fromHeaders;
  }
  return generateRequestId();
}

/**
 * Attach the request id to a request's headers (idempotent). Returns the id.
 *
 * Also stashes the id on the request object via a Symbol key for
 * in-process lookups (avoid re-parsing headers in nested handlers).
 */
export function attachRequestId<T extends RequestLike>(req: T, requestId?: string): string {
  const id = requestId ?? getRequestId(req);
  req.headers.set(REQUEST_ID_HEADER, id);
  try {
    (req as unknown as Record<symbol, unknown>)[REQUEST_ID_SYMBOL] = id;
  } catch {
    /* non-extensible; ignore */
  }
  return id;
}

/** Read the request id we previously attached, if any. */
export function readAttachedRequestId(req: RequestLike): string | undefined {
  return (req as unknown as Record<symbol, string | undefined>)[REQUEST_ID_SYMBOL];
}

/**
 * Build a child logger bound to this request.
 */
export function getRequestScopedLogger(
  namespace: string,
  req: RequestLike
): ReturnType<typeof getRequestLogger> {
  const id = readAttachedRequestId(req) ?? getRequestId(req);
  const extra: LogContext = {
    method: req.method ?? 'UNKNOWN',
    path: req.url ?? '',
  };
  return getRequestLogger(namespace, id, extra);
}

/**
 * Span-like helper. Doesn't use OTel; just creates a logger with `span`/
 * `parentSpan` fields and times the async block.
 */
export interface SpanHandle {
  spanId: string;
  log: ReturnType<typeof getRequestLogger>;
  end(error?: unknown): void;
}

/**
 * Run an async block under a span-like logger. Emits `span.started`,
 * `span.ended`, and (on error) `span.failed`. Returns the block's result.
 */
export async function withSpan<T>(
  namespace: string,
  spanName: string,
  reqOrId: RequestLike | string,
  block: (h: SpanHandle) => Promise<T>
): Promise<T> {
  const parentId =
    typeof reqOrId === 'string' ? reqOrId : (readAttachedRequestId(reqOrId) ?? getRequestId(reqOrId));
  const spanId = `${parentId}.${randomBytes(3).toString('hex')}`;
  const extra: LogContext =
    typeof reqOrId === 'string'
      ? { span: spanName, parentSpan: parentId }
      : {
          span: spanName,
          parentSpan: parentId,
          method: reqOrId.method ?? 'UNKNOWN',
          path: reqOrId.url ?? '',
        };
  const log = getRequestLogger(namespace, parentId, extra);
  log.debug({ event: 'span.started', spanId }, `${spanName} started`);
  const startedAt = Date.now();
  let outcome: 'ok' | 'failed' = 'ok';
  const handle: SpanHandle = {
    spanId,
    log,
    end(error?: unknown) {
      const latencyMs = Date.now() - startedAt;
      if (outcome === 'failed') return;
      if (error !== undefined) {
        outcome = 'failed';
        log.error(
          { event: 'span.failed', spanId, latencyMs, err: error instanceof Error ? error.message : String(error) },
          `${spanName} failed`
        );
      } else {
        log.debug(
          { event: 'span.ended', spanId, latencyMs },
          `${spanName} ended`
        );
      }
    },
  };
  try {
    const result = await block(handle);
    handle.end();
    return result;
  } catch (err) {
    outcome = 'failed';
    handle.end(err);
    throw err;
  }
}

/**
 * Convenience wrapper around `attachRequestId` + per-request logging +
 * duration metric. Use from Next.js route handlers, Express middlewares,
 * or anywhere you have a `req`/`res`-like pair.
 */
export async function withRequestContext<T extends ResponseLike>(
  namespace: string,
  req: RequestLike,
  block: (
    log: ReturnType<typeof getRequestLogger>,
    ctx: { requestId: string; log: ReturnType<typeof getRequestLogger> }
  ) => Promise<T>
): Promise<{ response: T; requestId: string }> {
  const requestId = attachRequestId(req);
  const log = getRequestLogger(namespace, requestId, {
    method: req.method ?? 'UNKNOWN',
    path: req.url ?? '',
  });
  log.debug({ event: 'request.started' }, 'request started');
  const startedAt = Date.now();
  let status: number | undefined;
  try {
    const response = await block(log, { requestId, log });
    status = response.status;
    const latencyMs = Date.now() - startedAt;
    const labels = {
      method: (req.method ?? 'UNKNOWN').toUpperCase(),
      route: extractRoute(req.url),
      status: String(status ?? 0),
    };
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, latencyMs / 1000);
    log.info(
      { event: 'request.completed', latencyMs, status, level: logLevelForStatus(status) },
      `request completed ${latencyMs}ms`
    );
    return { response, requestId };
  } catch (err) {
    const latencyMs = Date.now() - startedAt;
    const labels = {
      method: (req.method ?? 'UNKNOWN').toUpperCase(),
      route: extractRoute(req.url),
      status: '500',
    };
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, latencyMs / 1000);
    log.error(
      {
        event: 'request.failed',
        latencyMs,
        err: err instanceof Error ? err.message : String(err),
      },
      'request failed'
    );
    throw err;
  }
}

function logLevelForStatus(status: number | undefined): LogLevel {
  if (status === undefined) return 'info';
  if (status >= 500) return 'error';
  if (status >= 400) return 'warn';
  return 'info';
}

function extractRoute(url: string | undefined): string {
  if (!url) return 'unknown';
  try {
    const path = new URL(url, 'http://localhost').pathname;
    // Collapse dynamic segments: `/api/users/123` → `/api/users/:id`
    return path.replace(/\/[0-9a-f]{8,}/gi, '/:id').replace(/\/[^/]+\.(js|css|map|png|jpg|svg|ico)$/i, '/:file');
  } catch {
    return 'unknown';
  }
}