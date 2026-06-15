import { beforeEach, describe, expect, it, vi } from 'vitest';

const getRedisClient = vi.fn();
const resetMemoryStore = vi.fn();

vi.mock('@/lib/infrastructure/redis', () => ({
  getRedisClient,
  resetMemoryStore,
}));

async function loadRateLimitModule() {
  return import('@/lib/infrastructure/rate-limit');
}

describe('Infrastructure Rate Limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.useRealTimers();
  });

  it('usa Redis quando o cliente está disponível', async () => {
    const redis = {
      incr: vi.fn()
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3),
      expire: vi.fn().mockResolvedValue(1),
      ttl: vi.fn().mockResolvedValue(5),
    };

    getRedisClient.mockResolvedValue(redis);

    const { checkRateLimit } = await loadRateLimitModule();
    const config = { keyPrefix: 'rate:test', windowMs: 5000, maxRequests: 2 };

    const first = await checkRateLimit('user-1', config);
    const second = await checkRateLimit('user-1', config);
    const third = await checkRateLimit('user-1', config);

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    expect(first.resetIn).toBe(5000);

    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    expect(second.resetIn).toBe(5000);

    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);

    expect(redis.expire).toHaveBeenCalledTimes(1);
    expect(redis.expire).toHaveBeenCalledWith('rate:test:user-1', 5);
    expect(redis.ttl).toHaveBeenCalledTimes(2);
  });

  it('cai para memória quando o Redis falha e reseta após a janela', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    getRedisClient.mockRejectedValue(new Error('redis offline'));

    const { checkRateLimit, resetRateLimitState } = await loadRateLimitModule();
    const config = { keyPrefix: 'rate:test', windowMs: 1000, maxRequests: 2 };

    resetRateLimitState();

    const first = await checkRateLimit('user-2', config);
    const second = await checkRateLimit('user-2', config);
    const blocked = await checkRateLimit('user-2', config);

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(1001);

    const afterReset = await checkRateLimit('user-2', config);
    expect(afterReset.allowed).toBe(true);
    expect(afterReset.remaining).toBe(1);
  });

  it('limpa o estado em memória entre testes quando solicitado', async () => {
    getRedisClient.mockRejectedValue(new Error('redis offline'));

    const { checkRateLimit, resetRateLimitState } = await loadRateLimitModule();
    const config = { keyPrefix: 'rate:test', windowMs: 1000, maxRequests: 1 };

    resetRateLimitState();

    const first = await checkRateLimit('user-3', config);
    const blocked = await checkRateLimit('user-3', config);

    expect(first.allowed).toBe(true);
    expect(blocked.allowed).toBe(false);

    resetRateLimitState();

    const afterClear = await checkRateLimit('user-3', config);
    expect(afterClear.allowed).toBe(true);
    expect(resetMemoryStore).toHaveBeenCalled();
  });
});
