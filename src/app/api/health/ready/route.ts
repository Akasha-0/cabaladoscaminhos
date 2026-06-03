import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis';

/**
 * Readiness Probe Endpoint (AD-22)
 *
 * Purpose: Kubernetes/load balancer readiness check.
 * Returns 200 ONLY if both DB AND Redis are reachable.
 * This is the primary check for traffic routing decisions.
 *
 * Key differences from /health:
 * - NO latency measurement (fast check for frequent probes)
 * - Strict pass/fail (no "degraded" state)
 * - Both dependencies MUST be healthy
 *
 * Used by:
 * - Kubernetes readinessProbe
 * - Load balancer health checks
 * - Rolling deployment gates
 */

type CheckStatus = 'ok' | 'error';

interface ReadinessResponse {
  status: 'ok' | 'error';
  checks: {
    db: CheckStatus;
    redis: CheckStatus;
  };
  timestamp: string;
}

async function checkDb(): Promise<CheckStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'ok';
  } catch {
    return 'error';
  }
}

async function checkRedis(): Promise<CheckStatus> {
  try {
    const client = await getRedisClient();
    await client.ping();
    return 'ok';
  } catch {
    return 'error';
  }
}

export async function GET() {
  const [dbStatus, redisStatus] = await Promise.all([checkDb(), checkRedis()]);

  const isReady = dbStatus === 'ok' && redisStatus === 'ok';
  const status: CheckStatus = isReady ? 'ok' : 'error';

  const body: ReadinessResponse = {
    status,
    checks: {
      db: dbStatus,
      redis: redisStatus,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: isReady ? 200 : 503,
  });
}
