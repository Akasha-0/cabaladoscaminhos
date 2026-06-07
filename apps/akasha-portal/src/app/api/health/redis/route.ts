import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

/**
 * Deep Redis Health Check (AD-22)
 *
 * Purpose: Detailed Redis health monitoring for observability tools.
 * - Multiple PINGs to measure latency
 * - GET/SET test with a dedicated test key
 * - Memory usage if available
 *
 * Used by:
 * - Prometheus/Grafana Redis monitoring
 * - Datadog/Sentry Redis health dashboards
 * - Kubernetes readinessProbe (secondary)
 */

interface RedisHealthResponse {
  status: 'ok' | 'error';
  latencyMs: number;
  memoryMb: number;
  pingLatencyMs: number;
  timestamp: string;
}

interface RedisClientExtended {
  send_command?(cmd: string, args?: unknown[]): Promise<string>;
}

const HEALTH_TEST_KEY = 'health:ping:timestamp';
const HEALTH_TTL_SECONDS = 10;

export async function GET() {
  const start = Date.now();
  let pingLatencyMs = -1;
  let memoryMb = -1;

  try {
    const client = await getRedisClient();

    // Measure PING latency
    const pingStart = Date.now();
    await client.ping();
    pingLatencyMs = Date.now() - pingStart;

    // Test GET/SET functionality
    const testValue = Date.now().toString();
    await client.set(HEALTH_TEST_KEY, testValue, 'EX', HEALTH_TTL_SECONDS);
    const retrieved = await client.get(HEALTH_TEST_KEY);

    if (retrieved !== testValue) {
      throw new Error('Redis GET/SET verification failed');
    }

    // Attempt memory info via INFO command
    try {
      const extClient = client as unknown as RedisClientExtended;
      if (extClient.send_command) {
        const info = await extClient.send_command('INFO', ['memory']);
        if (info && typeof info === 'string') {
          const match = info.match(/used_memory_human:(\S+)/);
          if (match) {
            const memStr = match[1];
            // Parse human-readable size (e.g., "1.5M", "500K")
            if (memStr.endsWith('M')) {
              memoryMb = parseFloat(memStr);
            } else if (memStr.endsWith('K')) {
              memoryMb = parseFloat(memStr) / 1024;
            } else if (memStr.endsWith('G')) {
              memoryMb = parseFloat(memStr) * 1024;
            } else {
              memoryMb = parseFloat(memStr) / (1024 * 1024);
            }
          }
        }
      }
    } catch {
      // Memory info not available - this is fine
      memoryMb = -1;
    }

    const totalLatencyMs = Date.now() - start;

    const body: RedisHealthResponse = {
      status: 'ok',
      latencyMs: totalLatencyMs,
      memoryMb,
      pingLatencyMs,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    const totalLatencyMs = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const body: RedisHealthResponse & { error: string } = {
      status: 'error',
      latencyMs: totalLatencyMs,
      memoryMb,
      pingLatencyMs,
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };

    return NextResponse.json(body, { status: 503 });
  }
}
