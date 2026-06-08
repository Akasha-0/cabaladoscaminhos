import { NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';
import { getRedisClient } from '@/lib/infrastructure/redis';

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
 *
 * Doc 25 §10 / Doc 22 AD-22.8: também verifica a presença do céu do dia
 * (chave `transitos_diarios:YYYY-MM-DD`) como **sinal extra** — a ausência
 * NÃO falha o readiness (a app continua servindo) mas é reportada para
 * alerting.
 */

type CheckStatus = 'ok' | 'missing' | 'error';

interface ReadinessResponse {
  status: 'ok' | 'degraded' | 'error';
  checks: {
    db: CheckStatus;
    redis: CheckStatus;
    transits: { status: CheckStatus; date: string };
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

async function checkTransits(): Promise<{ status: CheckStatus; date: string }> {
  const date = new Date().toISOString().split('T')[0];
  const cacheKey = `transitos_diarios:${date}`;
  try {
    const client = await getRedisClient();
    const value = await client.get(cacheKey);
    return { status: value ? 'ok' : 'missing', date };
  } catch {
    return { status: 'missing', date };
  }
}

export async function GET() {
  const [dbStatus, redisStatus, transits] = await Promise.all([
    checkDb(),
    checkRedis(),
    checkTransits(),
  ]);

  const isReady = dbStatus === 'ok' && redisStatus === 'ok';
  // degraded: deps OK mas trânsitos ainda não computados (cronjob atrasado)
  const isDegraded = isReady && transits.status === 'missing';

  const status: ReadinessResponse['status'] = isDegraded
    ? 'degraded'
    : isReady
      ? 'ok'
      : 'error';

  const body: ReadinessResponse = {
    status,
    checks: {
      db: dbStatus,
      redis: redisStatus,
      transits,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: isReady ? 200 : 503,
  });
}
