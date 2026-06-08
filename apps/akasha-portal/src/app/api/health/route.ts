import { NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';
import { getRedisClient } from '@/lib/infrastructure/redis';

const APP_VERSION = process.env.npm_package_version ?? '0.1.0';
const SERVER_START = Date.now();

type CheckStatus = 'ok' | 'error' | 'degraded';

interface HealthCheck {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  checks: {
    db: CheckStatus;
    redis: CheckStatus;
  };
  uptime: number;
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

  const hasError = dbStatus === 'error' || redisStatus === 'error';
  const status = hasError ? 'error' : 'ok';

  const body: HealthCheck = {
    status,
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    checks: {
      db: dbStatus,
      redis: redisStatus,
    },
    uptime: Math.floor((Date.now() - SERVER_START) / 1000),
  };

  return NextResponse.json(body, {
    status: hasError ? 503 : 200,
  });
}
