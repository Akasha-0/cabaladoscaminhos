import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/error-handling';
import { prisma } from '@/lib/prisma';

const startTime = Date.now();

interface HealthCheck {
  status: 'ok' | 'error';
  latencyMs?: number;
  error?: string;
}

async function checkDatabase(): Promise<HealthCheck> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

async function checkExternalServices(): Promise<HealthCheck> {
  const checks: Record<string, HealthCheck> = {};

  // Check OpenAI
  try {
    const start = Date.now();
    if (process.env.OPENAI_API_KEY) {
      checks.openai = { status: 'ok', latencyMs: Date.now() - start };
    } else {
      checks.openai = { status: 'error', error: 'OPENAI_API_KEY not configured' };
    }
  } catch (error) {
    checks.openai = {
      status: 'error',
      error: error instanceof Error ? error.message : 'OpenAI check failed',
    };
  }

  // Check Supabase
  try {
    const start = Date.now();
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      checks.supabase = { status: 'ok', latencyMs: Date.now() - start };
    } else {
      checks.supabase = { status: 'error', error: 'Supabase credentials not configured' };
    }
  } catch (error) {
    checks.supabase = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Supabase check failed',
    };
  }

  const hasErrors = Object.values(checks).some((c) => c.status === 'error');
  return hasErrors
    ? { status: 'error' }
    : { status: 'ok' };
}

async function getHealthStatus() {
  const [database, externalServices] = await Promise.all([
    checkDatabase(),
    checkExternalServices(),
  ]);

  const checks = { database, externalServices };

  let status: 'ok' | 'degraded' | 'error' = 'ok';
  if (database.status === 'error' || externalServices.status === 'error') {
    status = 'error';
  } else if (database.latencyMs && database.latencyMs > 1000) {
    status = 'degraded';
  }

  return {
    status,
    checks,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };
}

const handler = async () => {
  const health = await getHealthStatus();
  const statusCode = health.status === 'error' ? 503 : 200;
  return NextResponse.json(health, { status: statusCode });
};

export const GET = withErrorHandler(handler);