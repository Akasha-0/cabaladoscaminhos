// ============================================================================
// perf/db-queries — Database query optimization toolkit (Wave 36)
// ============================================================================
// Five surgical helpers that prevent the most common DB perf foot-guns
// observed in W27 / W32 audits:
//
//   1. detectN1 — wrap a Prisma callback, count queries, throw if >1.
//   2. batchedFind — coalesce N `findUnique` calls into 1 `findMany`.
//   3. indexHints — surface the recommended index for a Prisma model/where.
//   4. connectionPool — Prisma pool sizing helper.
//   5. queryTimer — production-grade timing wrapper for slow query logs.
//
// The module is SSR-safe and zero-deps. It complements db-patterns.ts
// (cursor pagination + lean selects) by adding detection + tooling.
// ============================================================================

import type { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface N1DetectionResult<T> {
  result: T;
  queryCount: number;
  queryLog: string[];
}

export interface IndexHint {
  table: string;
  columns: string[];
  reason: string;
  /** Suggested migration SQL for documentation. */
  sql: string;
}

export interface PoolConfig {
  /** `connection_limit` — total active connections allowed. */
  connectionLimit: number;
  /** `pool_timeout` — seconds to wait for a free connection. */
  poolTimeout: number;
  /** `connect_timeout` — seconds to wait on initial connect. */
  connectTimeout: number;
}

export interface SlowQueryLog {
  query: string;
  durationMs: number;
  model?: string;
  action?: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// 1. N+1 detection
// ---------------------------------------------------------------------------

/**
 * Run a callback with a Prisma client wrapped to count every query.
 * Throws in dev if more than `maxQueries` are issued (catches N+1 early).
 * Production: just logs the count.
 *
 * Use this in test suites or as a dev-time check on hot paths.
 *
 * @example
 *   const { result, queryCount } = await detectN1(prisma, async (tx) => {
 *     const posts = await tx.post.findMany({ take: 10 });
 *     const authors = await tx.user.findMany({
 *       where: { id: { in: posts.map(p => p.authorId) } },
 *     });
 *     return { posts, authors };
 *   }, { maxQueries: 2 });
 */
export async function detectN1<T>(
  prisma: PrismaClient,
  callback: (tx: PrismaClient) => Promise<T>,
  options: { maxQueries?: number; throwOnViolation?: boolean } = {},
): Promise<N1DetectionResult<T>> {
  const maxQueries = options.maxQueries ?? 1;
  const throwOnViolation = options.throwOnViolation ?? process.env.NODE_ENV !== "production";
  const queryLog: string[] = [];

  // Wrap the `$on('query')` event for the duration of the callback.
  const onQuery = (event: { query: string }) => {
    queryLog.push(event.query);
  };
  // Prisma typing for $on is loose; cast to any to avoid the `unknown` foot-gun.
  (prisma as unknown as { $on: (event: string, cb: (e: { query: string }) => void) => void }).$on("query", onQuery);

  try {
    const result = await callback(prisma);
    const count = queryLog.length;
    if (throwOnViolation && count > maxQueries) {
      throw new Error(
        `detectN1: ${count} queries issued (max=${maxQueries}). ` +
        `Consider batching with \`in: [...ids]\`. ` +
        `First 3 queries: ${queryLog.slice(0, 3).map((q) => q.slice(0, 80)).join(" | ")}`,
      );
    }
    return { result, queryCount: count, queryLog };
  } finally {
    (prisma as unknown as { $off?: (event: string, cb: (e: { query: string }) => void) => void }).$off?.("query", onQuery);
  }
}

// ---------------------------------------------------------------------------
// 2. Batched find — coalesce N findUnique calls into 1 findMany
// ---------------------------------------------------------------------------

/**
 * Batched `findUnique` for a list of ids. Returns a Map<id, record>.
 * Internally issues a single `findMany({ where: { id: { in: ids } } })`.
 *
 * @example
 *   const userMap = await batchedFindUnique(prisma.user, ['u1', 'u2', 'u3']);
 *   const author = userMap.get(post.authorId);
 */
export async function batchedFindUnique<T extends { id: string }>(
  delegate: {
    findMany: (args: { where: { id: { in: string[] } } }) => Promise<T[]>;
  },
  ids: string[],
): Promise<Map<string, T>> {
  const unique = Array.from(new Set(ids)).filter(Boolean);
  if (unique.length === 0) return new Map();
  const rows = await delegate.findMany({ where: { id: { in: unique } } });
  const map = new Map<string, T>();
  for (const row of rows) map.set(row.id, row);
  return map;
}

/**
 * Parallel `Promise.all` wrapper that also times the whole batch. Use
 * instead of `await Promise.all([...])` when you want a slow-query log
 * and a single rejection handling boundary.
 */
export async function parallelBatch<T>(
  tasks: Array<() => Promise<T>>,
  options: { onSlow?: (log: SlowQueryLog) => void; slowMs?: number } = {},
): Promise<T[]> {
  const slowMs = options.slowMs ?? 250;
  const start = Date.now();
  const result = await Promise.all(tasks.map((t) => t()));
  const duration = Date.now() - start;
  if (duration >= slowMs) {
    options.onSlow?.({
      query: `parallelBatch(${tasks.length} tasks)`,
      durationMs: duration,
      timestamp: start,
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// 3. Index hints — recommended indexes for hot query patterns
// ---------------------------------------------------------------------------

/**
 * Catalog of recommended indexes for hot Akasha queries. Add a new entry
 * when a new slow query is discovered in production logs. The `sql` field
 * is documentation — apply via a Prisma migration in
 * `prisma/migrations/<date>_add_<name>/migration.sql`.
 */
export const INDEX_HINTS: IndexHint[] = [
  {
    table: "Post",
    columns: ["authorId", "createdAt(sort: Desc)"],
    reason: "Feed query orders by createdAt and filters by authorId",
    sql: 'CREATE INDEX "Post_authorId_createdAt_idx" ON "Post"("authorId", "createdAt" DESC);',
  },
  {
    table: "Post",
    columns: ["publishedAt(sort: Desc)"],
    reason: "Trending posts query orders by publishedAt desc",
    sql: 'CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt" DESC NULLS LAST);',
  },
  {
    table: "Comment",
    columns: ["postId", "createdAt(sort: Desc)"],
    reason: "Comment thread fetch on post detail page",
    sql: 'CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt" DESC);',
  },
  {
    table: "User",
    columns: ["email"],
    reason: "Auth lookup — must be unique, default index covers it",
    sql: "-- Covered by default @unique on email",
  },
  {
    table: "Notification",
    columns: ["userId", "readAt", "createdAt(sort: Desc)"],
    reason: "Unread badge count + notification list",
    sql: 'CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt" DESC);',
  },
  {
    table: "BetaInvite",
    columns: ["tokenHash"],
    reason: "HMAC-hash-only tokens — every accept validates against this",
    sql: 'CREATE INDEX "BetaInvite_tokenHash_idx" ON "BetaInvite"("tokenHash");',
  },
  {
    table: "Article",
    columns: ["publishedAt(sort: Desc)"],
    reason: "Library page sorts by publishedAt desc",
    sql: 'CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt" DESC NULLS LAST);',
  },
  {
    table: "AuditLog",
    columns: ["userId", "createdAt(sort: Desc)"],
    reason: "User-scoped audit trail queries (admin views)",
    sql: 'CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt" DESC);',
  },
];

/** Look up the index hint for a given table. */
export function getIndexHint(table: string): IndexHint | undefined {
  return INDEX_HINTS.find((h) => h.table === table);
}

// ---------------------------------------------------------------------------
// 4. Connection pool configuration
// ---------------------------------------------------------------------------

/**
 * Recommended Prisma pool sizes by deployment target. Serverless targets
 * (Vercel functions, Cloudflare Workers) need SMALL pools to avoid
 * exhausting Postgres max_connections (typically 100 for shared plans).
 */
export const POOL_PRESETS: Record<string, PoolConfig> = {
  "serverless-low": {
    connectionLimit: 1,
    poolTimeout: 10,
    connectTimeout: 5,
  },
  "serverless-mid": {
    connectionLimit: 5,
    poolTimeout: 10,
    connectTimeout: 5,
  },
  "serverless-high": {
    connectionLimit: 10,
    poolTimeout: 10,
    connectTimeout: 5,
  },
  "long-running": {
    connectionLimit: 20,
    poolTimeout: 30,
    connectTimeout: 10,
  },
  "edge-worker": {
    connectionLimit: 1, // Cloudflare Workers — 1 connection per isolate
    poolTimeout: 5,
    connectTimeout: 5,
  },
};

/**
 * Pick the pool preset for the current runtime. Reads `process.env.PRISMA_PRESET`
 * to allow CI override.
 */
export function pickPoolPreset(runtime: "serverless" | "long-running" | "edge" = "serverless"): PoolConfig {
  const override = process.env.PRISMA_PRESET;
  if (override && override in POOL_PRESETS) return POOL_PRESETS[override];
  if (runtime === "edge") return POOL_PRESETS["edge-worker"];
  if (runtime === "long-running") return POOL_PRESETS["long-running"];
  return POOL_PRESETS["serverless-mid"];
}

/** Build the `DATABASE_URL` query string for a given pool preset. */
export function buildDatabaseUrlWithPool(baseUrl: string, pool: PoolConfig): string {
  const url = new URL(baseUrl);
  url.searchParams.set("connection_limit", String(pool.connectionLimit));
  url.searchParams.set("pool_timeout", String(pool.poolTimeout));
  url.searchParams.set("connect_timeout", String(pool.connectTimeout));
  return url.toString();
}

// ---------------------------------------------------------------------------
// 5. Slow query log — emit structured events for queries >threshold
// ---------------------------------------------------------------------------

const SLOW_QUERY_THRESHOLD_MS = 250;
const slowQueryListeners = new Set<(log: SlowQueryLog) => void>();

export function onSlowQuery(listener: (log: SlowQueryLog) => void): () => void {
  slowQueryListeners.add(listener);
  return () => slowQueryListeners.delete(listener);
}

export function reportSlowQuery(log: SlowQueryLog): void {
  for (const listener of slowQueryListeners) {
    try {
      listener(log);
    } catch {
      /* never break on telemetry */
    }
  }
}

/**
 * Wrap a Prisma operation with a slow-query log. Use as a one-off check
 * on suspect code paths; production code should use Prisma's built-in
 * `log: ['query', 'warn', 'error']` events instead.
 */
export async function timeQuery<T>(
  label: string,
  fn: () => Promise<T>,
  options: { thresholdMs?: number } = {},
): Promise<T> {
  const threshold = options.thresholdMs ?? SLOW_QUERY_THRESHOLD_MS;
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const duration = Date.now() - start;
    if (duration >= threshold) {
      reportSlowQuery({ query: label, durationMs: duration, timestamp: start });
    }
  }
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export const SLOW_QUERY_DEFAULT_THRESHOLD = SLOW_QUERY_THRESHOLD_MS;
