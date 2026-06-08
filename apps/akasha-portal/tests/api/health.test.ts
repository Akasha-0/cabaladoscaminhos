/**
 * Health Endpoints Tests (AD-22)
 *
 * Tests all health check endpoints:
 * - GET /api/health        - Basic health with DB + Redis status
 * - GET /api/health/db     - Deep DB health with latency and pool stats
 * - GET /api/health/redis  - Deep Redis health with latency and memory
 * - GET /api/health/ready  - Kubernetes readiness probe
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

// Mock Prisma
const mockQueryRaw = vi.fn();
const mockPrismaConnector = {
  pool: {
    totalCount: 3,
    idleCount: 2,
    pendingCount: 0,
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: mockQueryRaw,
    $connector: mockPrismaConnector,
  },
}));

// Mock Redis client
const mockRedisGet = vi.fn();
const mockRedisSet = vi.fn();
const mockRedisPing = vi.fn();
const mockRedisSendCommand = vi.fn();

const mockRedisClient = {
  get: mockRedisGet,
  set: mockRedisSet,
  ping: mockRedisPing,
  send_command: mockRedisSendCommand,
};

vi.mock('@/lib/redis', () => ({
  getRedisClient: vi.fn().mockResolvedValue(mockRedisClient),
}));

// ----------------------------------------------------------------------------
// Health Endpoint Tests
// ----------------------------------------------------------------------------

describe('GET /api/health', () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Setup default healthy mocks
    mockQueryRaw.mockResolvedValue([{ '?column?': 1 }]);
    mockRedisPing.mockResolvedValue('PONG');

    const healthModule = await import('@/app/api/health/route');
    GET = healthModule.GET;
  });

  it('returns 200 when both DB and Redis are healthy', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.checks.db).toBe('ok');
    expect(body.checks.redis).toBe('ok');
  });

  it('returns 503 when DB is unhealthy', async () => {
    mockQueryRaw.mockRejectedValue(new Error('DB connection failed'));

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET();

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(body.checks.db).toBe('error');
    expect(body.checks.redis).toBe('ok');
  });

  it('returns 503 when Redis is unhealthy', async () => {
    mockRedisPing.mockRejectedValue(new Error('Redis connection failed'));

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET();

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(body.checks.db).toBe('ok');
    expect(body.checks.redis).toBe('error');
  });

  it('includes timestamp and version in response', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET();

    const body = await response.json();
    expect(body.timestamp).toBeDefined();
    expect(body.version).toBeDefined();
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });
});

// ----------------------------------------------------------------------------
// DB Health Endpoint Tests
// ----------------------------------------------------------------------------

describe('GET /api/health/db', () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    mockQueryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const dbHealthModule = await import('@/app/api/health/db/route');
    GET = dbHealthModule.GET;
  });

  it('returns 200 with ok status when DB is healthy', async () => {
    const request = new NextRequest('http://localhost:3000/api/health/db');
    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.latencyMs).toBeGreaterThanOrEqual(0);
    expect(body.pool).toBeDefined();
    expect(body.pool.total).toBe(3);
    expect(body.pool.idle).toBe(2);
    expect(body.pool.pending).toBe(0);
  });

  it('returns 503 with error status when DB query fails', async () => {
    mockQueryRaw.mockRejectedValue(new Error('Connection timeout'));

    const request = new NextRequest('http://localhost:3000/api/health/db');
    const response = await GET();

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(body.error).toBe('Connection timeout');
    expect(body.pool.total).toBe(-1);
  });

  it('measures latency of DB query', async () => {
    mockQueryRaw.mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return [{ '?column?': 1 }];
    });

    const request = new NextRequest('http://localhost:3000/api/health/db');
    const response = await GET();

    const body = await response.json();
    expect(body.latencyMs).toBeGreaterThanOrEqual(10);
  });

  it('includes timestamp in response', async () => {
    const request = new NextRequest('http://localhost:3000/api/health/db');
    const response = await GET();

    const body = await response.json();
    expect(body.timestamp).toBeDefined();
  });
});

// ----------------------------------------------------------------------------
// Redis Health Endpoint Tests
// ----------------------------------------------------------------------------

describe('GET /api/health/redis', () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Setup default healthy mocks
    mockRedisPing.mockResolvedValue('PONG');
    mockRedisSet.mockResolvedValue('OK');
    mockRedisGet.mockResolvedValue('test-value');
    mockRedisSendCommand.mockResolvedValue('used_memory_human:1.5M');

    const redisHealthModule = await import('@/app/api/health/redis/route');
    GET = redisHealthModule.GET;
  });

  it('returns 200 with ok status when Redis is healthy', async () => {
    const request = new NextRequest('http://localhost:3000/api/health/redis');
    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.latencyMs).toBeGreaterThanOrEqual(0);
    expect(body.pingLatencyMs).toBeGreaterThanOrEqual(0);
  });

  it('returns 503 with error status when Redis ping fails', async () => {
    mockRedisPing.mockRejectedValue(new Error('Redis connection refused'));

    const request = new NextRequest('http://localhost:3000/api/health/redis');
    const response = await GET();

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(body.error).toBe('Redis connection refused');
  });

  it('returns 503 when GET/SET verification fails', async () => {
    mockRedisGet.mockResolvedValue('different-value');

    const request = new NextRequest('http://localhost:3000/api/health/redis');
    const response = await GET();

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(body.error).toBe('Redis GET/SET verification failed');
  });

  it('measures ping latency', async () => {
    mockRedisPing.mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
      return 'PONG';
    });

    const request = new NextRequest('http://localhost:3000/api/health/redis');
    const response = await GET();

    const body = await response.json();
    expect(body.pingLatencyMs).toBeGreaterThanOrEqual(5);
  });

  it('parses memory info when available', async () => {
    mockRedisSendCommand.mockResolvedValue('used_memory_human:2048K');

    const request = new NextRequest('http://localhost:3000/api/health/redis');
    const response = await GET();

    const body = await response.json();
    expect(body.memoryMb).toBe(2); // 2048K = 2MB
  });

  it('sets memoryMb to -1 when memory info is unavailable', async () => {
    mockRedisSendCommand.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/health/redis');
    const response = await GET();

    const body = await response.json();
    expect(body.memoryMb).toBe(-1);
  });

  it('includes timestamp in response', async () => {
    const request = new NextRequest('http://localhost:3000/api/health/redis');
    const response = await GET();

    const body = await response.json();
    expect(body.timestamp).toBeDefined();
  });
});

// ----------------------------------------------------------------------------
// Readiness Probe Tests
// ----------------------------------------------------------------------------

describe('GET /api/health/ready', () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Setup default healthy mocks
    mockQueryRaw.mockResolvedValue([{ '?column?': 1 }]);
    mockRedisPing.mockResolvedValue('PONG');

    const readyModule = await import('@/app/api/health/ready/route');
    GET = readyModule.GET;
  });

  it('returns 200 when both DB and Redis are ready', async () => {
    const request = new NextRequest('http://localhost:3000/api/health/ready');
    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.checks.db).toBe('ok');
    expect(body.checks.redis).toBe('ok');
  });

  it('returns 503 when DB is not ready', async () => {
    mockQueryRaw.mockRejectedValue(new Error('DB unavailable'));

    const request = new NextRequest('http://localhost:3000/api/health/ready');
    const response = await GET();

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(body.checks.db).toBe('error');
    expect(body.checks.redis).toBe('ok');
  });

  it('returns 503 when Redis is not ready', async () => {
    mockRedisPing.mockRejectedValue(new Error('Redis unavailable'));

    const request = new NextRequest('http://localhost:3000/api/health/ready');
    const response = await GET();

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(body.checks.db).toBe('ok');
    expect(body.checks.redis).toBe('error');
  });

  it('returns 503 when both are unavailable', async () => {
    mockQueryRaw.mockRejectedValue(new Error('DB down'));
    mockRedisPing.mockRejectedValue(new Error('Redis down'));

    const request = new NextRequest('http://localhost:3000/api/health/ready');
    const response = await GET();

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(body.checks.db).toBe('error');
    expect(body.checks.redis).toBe('error');
  });

  it('includes timestamp in response', async () => {
    const request = new NextRequest('http://localhost:3000/api/health/ready');
    const response = await GET();

    const body = await response.json();
    expect(body.timestamp).toBeDefined();
  });

  it('is fast - no latency measurement', async () => {
    mockQueryRaw.mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return [{ '?column?': 1 }];
    });

    const start = Date.now();
    const request = new NextRequest('http://localhost:3000/api/health/ready');
    await GET();
    const elapsed = Date.now() - start;

    // Should still complete even with slow DB (no latency measurement)
    expect(elapsed).toBeGreaterThanOrEqual(50);
  });
});
