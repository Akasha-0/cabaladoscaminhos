import { NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';

/**
 * Deep DB Health Check (AD-22)
 *
 * Purpose: Detailed database health monitoring for observability tools.
 * - Executes a raw query to verify DB connectivity
 * - Measures query latency
 * - Exposes Prisma connection pool stats
 *
 * Used by:
 * - Prometheus/Grafana database monitoring
 * - Datadog/Sentry database health dashboards
 * - Kubernetes readinessProbe (secondary)
 */

interface PoolStats {
  total: number;
  idle: number;
  pending: number;
}

interface DbHealthResponse {
  status: 'ok' | 'error';
  latencyMs: number;
  pool: PoolStats;
  timestamp: string;
}

interface PrismaConnector {
  pool?: PgPool;
}

interface PgPool {
  totalCount?: number;
  idleCount?: number;
  pendingCount?: number;
}

export async function GET() {
  const start = Date.now();

  try {
    // Execute raw query to verify connectivity
    await prisma.$queryRaw`SELECT 1`;

    const latencyMs = Date.now() - start;

    // Attempt to get pool stats from the underlying pg Pool
    // Note: Prisma v7 with adapter doesn't expose pool stats directly,
    // so we provide estimates based on typical operation
    let pool: PoolStats = { total: 0, idle: 0, pending: 0 };

    try {
      // Try to access internal pool state via $connector
      const connector = prisma as unknown as { $connector?: PrismaConnector };
      if (connector.$connector?.pool) {
        const pgPool = connector.$connector.pool;
        pool = {
          total: pgPool.totalCount ?? 0,
          idle: pgPool.idleCount ?? 0,
          pending: pgPool.pendingCount ?? 0,
        };
      }
    } catch {
      // Pool stats not available - this is fine for basic monitoring
      // Provide placeholder values indicating unknown state
      pool = { total: -1, idle: -1, pending: -1 };
    }

    const body: DbHealthResponse = {
      status: 'ok',
      latencyMs,
      pool,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    const latencyMs = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const body: DbHealthResponse & { error: string } = {
      status: 'error',
      latencyMs,
      pool: { total: -1, idle: -1, pending: -1 },
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };

    return NextResponse.json(body, { status: 503 });
  }
}
