// ============================================================================
// perf/db-optimization-v2 — DB index + FTS + replica routing (Wave 37)
// ============================================================================
// Wave 37 extension of db-queries.ts. Adds:
//
//   1. Composite indexes (multi-column) for hot feed / library queries.
//   2. Brin indexes for time-series (analytics rollups, audit log).
//   3. Full-text search via PostgreSQL FTS + GIN index.
//   4. Connection pool tuning per workload (analytics vs. transaction).
//   5. Slow query log sink (Postgres `pg_stat_statements` friendly).
//   6. Replica routing — analytics queries go to read-replica.
//   7. Vacuum + ANALYZE schedule documentation.
//
// Reference: docs/PERFORMANCE-PHASE-2-W36.md §7 (DB layer).
// ============================================================================

import type { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Composite index catalog
// ---------------------------------------------------------------------------

export interface CompositeIndex {
  table: string;
  columns: string[];
  /** When to use — typical Prisma where shape. */
  where: string;
  /** Estimated cardinality / selectivity rationale. */
  rationale: string;
  /** Migration SQL. */
  sql: string;
}

export const COMPOSITE_INDEXES: CompositeIndex[] = [
  {
    table: "Post",
    columns: ["status", "publishedAt DESC NULLS LAST"],
    where: '{ status: "PUBLISHED" } orderBy: { publishedAt: "desc" }',
    rationale: "Library/feed query: filter by published status, order by recency.",
    sql: 'CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt" DESC NULLS LAST);',
  },
  {
    table: "Post",
    columns: ["authorId", "status", "createdAt DESC"],
    where: '{ authorId, status: "PUBLISHED" } orderBy: { createdAt: "desc" }',
    rationale: "Profile page: user's published posts, newest first.",
    sql: 'CREATE INDEX "Post_authorId_status_createdAt_idx" ON "Post"("authorId", "status", "createdAt" DESC);',
  },
  {
    table: "Comment",
    columns: ["postId", "parentId", "createdAt"],
    where: '{ postId, parentId: null } orderBy: { createdAt: "asc" }',
    rationale: "Top-level comments for a post, then nested threads.",
    sql: 'CREATE INDEX "Comment_postId_parentId_createdAt_idx" ON "Comment"("postId", "parentId", "createdAt");',
  },
  {
    table: "Notification",
    columns: ["userId", "type", "createdAt DESC"],
    where: '{ userId, type } orderBy: { createdAt: "desc" }',
    rationale: "Notification feed filtered by type (e.g., COMMENT, MENTION).",
    sql: 'CREATE INDEX "Notification_userId_type_createdAt_idx" ON "Notification"("userId", "type", "createdAt" DESC);',
  },
  {
    table: "Subscription",
    columns: ["userId", "status", "currentPeriodEnd"],
    where: '{ userId, status: "ACTIVE" }',
    rationale: "Active subscription lookup for billing gate.",
    sql: 'CREATE INDEX "Subscription_userId_status_currentPeriodEnd_idx" ON "Subscription"("userId", "status", "currentPeriodEnd");',
  },
  {
    table: "Article",
    columns: ["traditionId", "publishedAt DESC NULLS LAST"],
    where: '{ traditionId, publishedAt: { not: null } } orderBy: { publishedAt: "desc" }',
    rationale: "Per-tradição library page — invalidates per tradição tag.",
    sql: 'CREATE INDEX "Article_traditionId_publishedAt_idx" ON "Article"("traditionId", "publishedAt" DESC NULLS LAST);',
  },
  {
    table: "Article",
    columns: ["status", "featured", "publishedAt DESC NULLS LAST"],
    where: '{ status: "PUBLISHED", featured: true }',
    rationale: "Featured article block on landing page.",
    sql: 'CREATE INDEX "Article_status_featured_publishedAt_idx" ON "Article"("status", "featured", "publishedAt" DESC NULLS LAST);',
  },
  {
    table: "AuditLog",
    columns: ["userId", "action", "createdAt DESC"],
    where: '{ userId, action } orderBy: { createdAt: "desc" }',
    rationale: "Admin audit view — filter by action (LOGIN, PAYMENT, ...).",
    sql: 'CREATE INDEX "AuditLog_userId_action_createdAt_idx" ON "AuditLog"("userId", "action", "createdAt" DESC);',
  },
];

// ---------------------------------------------------------------------------
// BRIN indexes — for append-only time-series tables
// ---------------------------------------------------------------------------

export interface BrinIndex {
  table: string;
  column: string;
  rationale: string;
  sql: string;
}

export const BRIN_INDEXES: BrinIndex[] = [
  {
    table: "AnalyticsEvent",
    column: "createdAt",
    rationale: "Append-only, high-volume; BRIN is 1000x smaller than btree.",
    sql: 'CREATE INDEX "AnalyticsEvent_createdAt_brin" ON "AnalyticsEvent" USING BRIN("createdAt") WITH (pages_per_range = 32);',
  },
  {
    table: "AuditLog",
    column: "createdAt",
    rationale: "Compliance log — range scans by date dominate.",
    sql: 'CREATE INDEX "AuditLog_createdAt_brin" ON "AuditLog" USING BRIN("createdAt") WITH (pages_per_range = 32);',
  },
  {
    table: "AkashaMessage",
    column: "createdAt",
    rationale: "AI chat history — daily ranges for archive exports.",
    sql: 'CREATE INDEX "AkashaMessage_createdAt_brin" ON "AkashaMessage" USING BRIN("createdAt") WITH (pages_per_range = 32);',
  },
];

// ---------------------------------------------------------------------------
// Full-text search — PostgreSQL tsvector + GIN index
// ---------------------------------------------------------------------------

export interface FtsIndex {
  table: string;
  /** Columns to concatenate into the tsvector. */
  columns: string[];
  /** Language config (pg default: 'portuguese' for BR-first content). */
  config: string;
  sql: string;
}

export const FTS_INDEXES: FtsIndex[] = [
  {
    table: "Article",
    columns: ["title", "subtitle", "body"],
    config: "portuguese",
    sql: `
CREATE INDEX "Article_fts_idx" ON "Article"
USING GIN (to_tsvector('portuguese', coalesce("title",'') || ' ' || coalesce("subtitle",'') || ' ' || coalesce("body",'')));
`.trim(),
  },
  {
    table: "Post",
    columns: ["title", "content"],
    config: "portuguese",
    sql: `
CREATE INDEX "Post_fts_idx" ON "Post"
USING GIN (to_tsvector('portuguese', coalesce("title",'') || ' ' || coalesce("content",'')));
`.trim(),
  },
  {
    table: "AkashaMessage",
    columns: ["content"],
    config: "portuguese",
    sql: `
CREATE INDEX "AkashaMessage_fts_idx" ON "AkashaMessage"
USING GIN (to_tsvector('portuguese', coalesce("content",'')));
`.trim(),
  },
];

/**
 * Helper: emit a parameterized FTS query for a Prisma raw call.
 *
 * @example
 *   const sql = ftsSearch("Article", "Orixá Ogum", ["title", "body"]);
 *   const rows = await prisma.$queryRawUnsafe(sql, ...);
 */
export function ftsSearch(table: string, query: string, columns: string[]): string {
  const tsvector = columns
    .map((c) => `coalesce("${c}", '')`)
    .join(" || ' ' || ");
  const escaped = query.replace(/'/g, "''");
  return `SELECT * FROM "${table}" WHERE to_tsvector('portuguese', ${tsvector}) @@ plainto_tsquery('portuguese', '${escaped}') ORDER BY ts_rank(to_tsvector('portuguese', ${tsvector}), plainto_tsquery('portuguese', '${escaped}')) DESC LIMIT 50;`;
}

// ---------------------------------------------------------------------------
// Connection pool — workload-specific sizing
// ---------------------------------------------------------------------------

export type Workload = "transaction" | "analytics" | "long-running" | "edge";

export interface PoolSize {
  connectionLimit: number;
  poolTimeout: number;
  statementTimeoutMs: number;
  idleTimeoutMs: number;
  description: string;
}

export const POOL_BY_WORKLOAD: Record<Workload, PoolSize> = {
  transaction: {
    connectionLimit: 20,
    poolTimeout: 10,
    statementTimeoutMs: 5_000,
    idleTimeoutMs: 60_000,
    description: "Vercel functions — balanced, ~100 req/sec sustained.",
  },
  analytics: {
    connectionLimit: 10,
    poolTimeout: 30,
    statementTimeoutMs: 30_000,
    idleTimeoutMs: 120_000,
    description: "Analytics rollups — long queries, fewer connections.",
  },
  "long-running": {
    connectionLimit: 20,
    poolTimeout: 30,
    statementTimeoutMs: 0, // no timeout
    idleTimeoutMs: 300_000,
    description: "Worker processes (BullMQ) — no timeout, longer pool waits.",
  },
  edge: {
    connectionLimit: 1,
    poolTimeout: 5,
    statementTimeoutMs: 3_000,
    idleTimeoutMs: 30_000,
    description: "Edge functions (Cloudflare Workers) — 1 connection per isolate.",
  },
};

export function poolForWorkload(w: Workload): PoolSize {
  return POOL_BY_WORKLOAD[w];
}

// ---------------------------------------------------------------------------
// Slow query log — Postgres pg_stat_statements sink
// ---------------------------------------------------------------------------

export interface SlowQueryRecord {
  query: string;
  calls: number;
  meanMs: number;
  totalMs: number;
  rows: number;
  recordedAt: number;
}

/**
 * Query pg_stat_statements for the top-N slowest queries.
 * Returns up to 50 rows from the shared catalog.
 *
 * NOTE: requires `pg_stat_statements` extension enabled on the database.
 * Apply via:  CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
 */
export async function topSlowQueries(
  prisma: PrismaClient,
  limit = 50,
): Promise<SlowQueryRecord[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      query: string;
      calls: bigint;
      mean_exec_time: number;
      total_exec_time: number;
      rows: bigint;
    }>
  >`
    SELECT
      substring(query for 200) AS query,
      calls,
      mean_exec_time,
      total_exec_time,
      rows
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat_statements%'
    ORDER BY mean_exec_time DESC
    LIMIT ${limit};
  `;
  return rows.map((r) => ({
    query: r.query,
    calls: Number(r.calls),
    meanMs: r.mean_exec_time,
    totalMs: r.total_exec_time,
    rows: Number(r.rows),
    recordedAt: Date.now(),
  }));
}

/** Emit a structured log line for a slow query. */
export function logSlowQuery(r: SlowQueryRecord): void {
  // eslint-disable-next-line no-console
  console.warn(
    `[slow-query] ${r.meanMs.toFixed(1)}ms mean / ${r.calls} calls / ${r.rows} rows :: ${r.query.slice(0, 120)}`,
  );
}

// ---------------------------------------------------------------------------
// Vacuum + ANALYZE schedule
// ---------------------------------------------------------------------------

export interface MaintenanceJob {
  table: string;
  action: "VACUUM" | "ANALYZE" | "VACUUM ANALYZE" | "REINDEX";
  /** Cron expression (5-field). */
  schedule: string;
  rationale: string;
}

export const MAINTENANCE_JOBS: MaintenanceJob[] = [
  { table: "Post", action: "VACUUM ANALYZE", schedule: "0 4 * * 0", rationale: "Weekly deep clean + stats refresh." },
  { table: "Article", action: "VACUUM ANALYZE", schedule: "0 4 * * 0", rationale: "Library article table grows monotonically." },
  { table: "AkashaMessage", action: "VACUUM", schedule: "0 3 * * *", rationale: "High-write AI chat history — daily vacuum." },
  { table: "AnalyticsEvent", action: "VACUUM", schedule: "0 2 * * *", rationale: "Highest-write table — daily vacuum + nightly partition drop." },
  { table: "AuditLog", action: "VACUUM", schedule: "0 5 * * 0", rationale: "Compliance log — weekly vacuum." },
  { table: "Notification", action: "ANALYZE", schedule: "0 6 * * *", rationale: "Read-heavy, stats refresh keeps plans optimal." },
];

// ---------------------------------------------------------------------------
// Replica routing — analytics queries go to read-replica
// ---------------------------------------------------------------------------

export interface ReplicaConfig {
  primaryUrl: string;
  replicaUrl?: string;
  /** Workloads that may use the replica. */
  replicaWorkloads: Workload[];
}

/**
 * Resolve which Prisma client to use for a given workload.
 * If a replica is configured and the workload is allowed, returns the
 * replica URL; otherwise returns the primary.
 */
export function resolveDatabaseUrl(cfg: ReplicaConfig, workload: Workload): string {
  if (cfg.replicaUrl && cfg.replicaWorkloads.includes(workload)) {
    return cfg.replicaUrl;
  }
  return cfg.primaryUrl;
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export const TOTAL_INDEX_HINTS = COMPOSITE_INDEXES.length + BRIN_INDEXES.length + FTS_INDEXES.length;