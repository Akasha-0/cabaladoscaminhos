// Co-located unit test for the in-memory rate limiter.
//
// There is also an INTEGRATION test at `tests/infrastructure/rate-limit.test.ts`
// that exercises the Redis + memory fallback path with `vi.mock` and
// `vi.useFakeTimers`. This file is the simpler companion — just the
// memory path, no Redis mock, runs in vitest co-located config.
//
// See `tests/infrastructure/AGENTS.md` §"Note on test duplication"
// for the full picture. Do not delete one without updating the other.

import { beforeEach, describe, expect, it } from 'vitest';
import {
  checkMemoryRateLimit,
  formatMentorRateLimitError,
  resetRateLimitState,
} from './rate-limit';

describe('checkMemoryRateLimit', () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  it('bloqueia quando ultrapassa o maximo', () => {
    const config = { windowMs: 60_000, maxRequests: 2 };

    expect(checkMemoryRateLimit('ip-1', config).allowed).toBe(true);
    expect(checkMemoryRateLimit('ip-1', config).allowed).toBe(true);
    expect(checkMemoryRateLimit('ip-1', config).allowed).toBe(false);
  });
});

describe('formatMentorRateLimitError', () => {
  it('retorna a mensagem fixa do mentor', () => {
    expect(formatMentorRateLimitError()).toContain('10 mensagens por minuto');
  });
});
