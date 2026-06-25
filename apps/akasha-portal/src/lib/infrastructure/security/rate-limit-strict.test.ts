// Co-located unit tests for Wave 12.5 strict rate limits.
//
// LGPD-safe: tests não logam IPs em texto puro — usam identifier
// derivado que já passa por hashIp() internamente.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the rate-limit module so we don't depend on real Redis.
// We test the strict module's identifier extraction and config
// selection; the underlying checkRedisRateLimit is mocked.
vi.mock('@/lib/infrastructure/rate-limit', () => ({
  checkMemoryRateLimit: vi.fn((identifier: string, config: { maxRequests: number; windowMs: number }) => {
    // Simple in-memory mock: count how many times this identifier was called.
    if (!mockCounts.has(identifier)) mockCounts.set(identifier, { count: 0, resetAt: Date.now() + config.windowMs });
    const entry = mockCounts.get(identifier)!;
    entry.count += 1;
    return {
      allowed: entry.count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetIn: Math.max(0, entry.resetAt - Date.now()),
      resetAt: new Date(entry.resetAt),
      limit: config.maxRequests,
    };
  }),
  checkRedisRateLimit: vi.fn(async (key: string, maxRequests: number, windowSeconds: number) => {
    // Just delegate to checkMemoryRateLimit for tests
    if (!mockCounts.has(key)) mockCounts.set(key, { count: 0, resetAt: Date.now() + windowSeconds * 1000 });
    const entry = mockCounts.get(key)!;
    entry.count += 1;
    return {
      allowed: entry.count <= maxRequests,
      remaining: Math.max(0, maxRequests - entry.count),
      resetIn: Math.max(0, entry.resetAt - Date.now()),
      resetAt: new Date(entry.resetAt),
      limit: maxRequests,
    };
  }),
  formatMentorRateLimitError: () => 'mock',
  resetRateLimitState: () => mockCounts.clear(),
}));

const mockCounts = new Map<string, { count: number; resetAt: number }>();

import {
  STRICT_RATE_LIMIT_CONFIGS,
  buildStrictRateLimitResponse,
  checkStrictRateLimit,
  extractStrictIdentifier,
} from './rate-limit-strict';

const fakeHeaders = (overrides: Record<string, string> = {}) => ({
  get: (name: string) => {
    const lower = name.toLowerCase();
    for (const [k, v] of Object.entries(overrides)) {
      if (k.toLowerCase() === lower) return v;
    }
    return null;
  },
});

describe('STRICT_RATE_LIMIT_CONFIGS', () => {
  it('AUTH_LOGIN=5 req/min', () => {
    expect(STRICT_RATE_LIMIT_CONFIGS.AUTH_LOGIN).toEqual({ windowMs: 60_000, maxRequests: 5 });
  });

  it('AUTH_REGISTER=3 req/hour', () => {
    expect(STRICT_RATE_LIMIT_CONFIGS.AUTH_REGISTER).toEqual({ windowMs: 3_600_000, maxRequests: 3 });
  });

  it('AUTH_ME=30 req/min', () => {
    expect(STRICT_RATE_LIMIT_CONFIGS.AUTH_ME).toEqual({ windowMs: 60_000, maxRequests: 30 });
  });

  it('MCP = 100 req/min', () => {
    expect(STRICT_RATE_LIMIT_CONFIGS.MCP).toEqual({ windowMs: 60_000, maxRequests: 100 });
  });
});

describe('extractStrictIdentifier', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-for-hashing';
  });

  it('returns user-prefixed identifier when preferUserId=true and x-user-id present', () => {
    const id = extractStrictIdentifier(
      fakeHeaders({ 'x-user-id': 'user-abc-123' }),
      { preferUserId: true }
    );
    expect(id).toBe('user:user-abc-123');
  });

  it('falls back to ip-prefixed hash when preferUserId=true but no x-user-id', () => {
    const id = extractStrictIdentifier(
      fakeHeaders({ 'x-forwarded-for': '203.0.113.42' }),
      { preferUserId: true }
    );
    expect(id).toMatch(/^ip:[a-f0-9]{64}$/);
  });

  it('uses IP hash when preferUserId=false', () => {
    const id = extractStrictIdentifier(
      fakeHeaders({ 'x-forwarded-for': '203.0.113.42', 'x-user-id': 'user-x' }),
      { preferUserId: false }
    );
    // User header is ignored when preferUserId=false
    expect(id).toMatch(/^ip:[a-f0-9]{64}$/);
  });

  it('produces deterministic hashes for the same IP (LGPD-safe rate limiting)', () => {
    const a = extractStrictIdentifier(fakeHeaders({ 'x-forwarded-for': '10.0.0.1' }), { preferUserId: false });
    const b = extractStrictIdentifier(fakeHeaders({ 'x-forwarded-for': '10.0.0.1' }), { preferUserId: false });
    expect(a).toBe(b);
  });

  it('produces DIFFERENT hashes for different IPs', () => {
    const a = extractStrictIdentifier(fakeHeaders({ 'x-forwarded-for': '10.0.0.1' }), { preferUserId: false });
    const b = extractStrictIdentifier(fakeHeaders({ 'x-forwarded-for': '10.0.0.2' }), { preferUserId: false });
    expect(a).not.toBe(b);
  });
});

describe('checkStrictRateLimit', () => {
  beforeEach(() => {
    mockCounts.clear();
    process.env.JWT_SECRET = 'test-secret-for-hashing';
  });

  afterEach(() => {
    mockCounts.clear();
  });

  it('blocks after maxRequests for AUTH_LOGIN (5/min)', async () => {
    const req = fakeHeaders({ 'x-forwarded-for': '198.51.100.7' });
    // First 5 allowed
    for (let i = 0; i < 5; i++) {
      const r = await checkStrictRateLimit(req, 'AUTH_LOGIN', { preferUserId: false });
      expect(r.allowed).toBe(true);
    }
    // 6th blocked
    const blocked = await checkStrictRateLimit(req, 'AUTH_LOGIN', { preferUserId: false });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.limit).toBe(5);
  });

  it('isolates scopes — AUTH_LOGIN block does not affect AUTH_REGISTER', async () => {
    const req = fakeHeaders({ 'x-forwarded-for': '198.51.100.8' });
    // Burn AUTH_LOGIN quota
    for (let i = 0; i < 5; i++) {
      await checkStrictRateLimit(req, 'AUTH_LOGIN', { preferUserId: false });
    }
    // AUTH_REGISTER should still be allowed
    const reg = await checkStrictRateLimit(req, 'AUTH_REGISTER', { preferUserId: false });
    expect(reg.allowed).toBe(true);
  });

  it('AUTH_REGISTER = 3/hour — blocks after 3', async () => {
    const req = fakeHeaders({ 'x-forwarded-for': '198.51.100.9' });
    for (let i = 0; i < 3; i++) {
      const r = await checkStrictRateLimit(req, 'AUTH_REGISTER', { preferUserId: false });
      expect(r.allowed).toBe(true);
    }
    const blocked = await checkStrictRateLimit(req, 'AUTH_REGISTER', { preferUserId: false });
    expect(blocked.allowed).toBe(false);
  });

  it('isolates identifiers — different IPs have separate quotas', async () => {
    const a = fakeHeaders({ 'x-forwarded-for': '198.51.100.10' });
    const b = fakeHeaders({ 'x-forwarded-for': '198.51.100.11' });
    // Burn quota on IP A
    for (let i = 0; i < 5; i++) {
      await checkStrictRateLimit(a, 'AUTH_LOGIN', { preferUserId: false });
    }
    // IP B is unaffected
    const blocked = await checkStrictRateLimit(b, 'AUTH_LOGIN', { preferUserId: false });
    expect(blocked.allowed).toBe(true);
  });
});

describe('buildStrictRateLimitResponse', () => {
  it('AUTH_LOGIN message in PT-BR with retry hint', () => {
    const res = buildStrictRateLimitResponse('AUTH_LOGIN');
    expect(res.status).toBe(429);
    expect(res.body.scope).toBe('AUTH_LOGIN');
    expect(res.body.retryAfterSeconds).toBe(60);
    expect(res.body.error).toContain('login');
    expect(res.body.error).toContain('1 minuto');
  });

  it('AUTH_REGISTER retry = 1 hour', () => {
    const res = buildStrictRateLimitResponse('AUTH_REGISTER');
    expect(res.body.retryAfterSeconds).toBe(3600);
    expect(res.body.error).toContain('1 hora');
  });

  it('does NOT leak IP or identifier in error message (LGPD)', () => {
    for (const scope of ['AUTH_LOGIN', 'AUTH_REGISTER', 'AUTH_ME', 'MCP'] as const) {
      const res = buildStrictRateLimitResponse(scope);
      expect(res.body.error).not.toMatch(/\d+\.\d+\.\d+\.\d+/); // no IPv4
      expect(res.body.error).not.toContain('unknown');
      expect(res.body.error).not.toMatch(/[a-f0-9]{32,}/i); // no hex hash
    }
  });
});