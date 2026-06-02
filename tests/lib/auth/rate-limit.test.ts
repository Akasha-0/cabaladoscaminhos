// ============================================================
// TESTES — Rate Limiter de Auth (Fase 18)
// ============================================================
// Foco:
//   1. `checkAuthRateLimit` retorna { allowed, limit, remaining, ... }
//   2. Após max+1 requests, retorna allowed=false
//   3. Janela é respeitada (TTL no Redis; em in-memory também)
//   4. `applyRateLimitHeaders` seta os 3 headers padrão
//   5. `enforceAuthRateLimit` retorna 429 com headers quando bloqueado
//   6. Diferentes IPs são contados independentemente

import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_RATE_LIMITS,
  applyRateLimitHeaders,
  checkAuthRateLimit,
  enforceAuthRateLimit,
  getClientIp,
} from '@/lib/auth/rate-limit';

// Helper: cria um NextRequest fake com IP controlado.
function makeRequest(ip: string | null): NextRequest {
  const headers: Record<string, string> = {};
  if (ip !== null) headers['x-forwarded-for'] = ip;
  return new NextRequest('http://localhost/api/test', {
    method: 'POST',
    headers,
  });
}

describe('AUTH_RATE_LIMITS (Fase 18)', () => {
  it('login: 5 tentativas / 15min', () => {
    expect(AUTH_RATE_LIMITS.login.max).toBe(5);
    expect(AUTH_RATE_LIMITS.login.windowSeconds).toBe(15 * 60);
  });

  it('register: 3 registros / 1h', () => {
    expect(AUTH_RATE_LIMITS.register.max).toBe(3);
    expect(AUTH_RATE_LIMITS.register.windowSeconds).toBe(60 * 60);
  });

  it('refresh: 30 rotações / 1min', () => {
    expect(AUTH_RATE_LIMITS.refresh.max).toBe(30);
    expect(AUTH_RATE_LIMITS.refresh.windowSeconds).toBe(60);
  });
});

describe('getClientIp', () => {
  it('extrai o primeiro IP de x-forwarded-for encadeado', () => {
    const req = new NextRequest('http://localhost/', {
      headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.1, 10.0.0.2' },
    });
    expect(getClientIp(req)).toBe('203.0.113.5');
  });

  it('faz trim de whitespace', () => {
    const req = new NextRequest('http://localhost/', {
      headers: { 'x-forwarded-for': '  198.51.100.7  , 10.0.0.1' },
    });
    expect(getClientIp(req)).toBe('198.51.100.7');
  });

  it('cai em x-real-ip quando x-forwarded-for ausente', () => {
    const req = new NextRequest('http://localhost/', {
      headers: { 'x-real-ip': '198.51.100.42' },
    });
    expect(getClientIp(req)).toBe('198.51.100.42');
  });

  it('retorna "unknown" quando nenhum header de IP presente', () => {
    const req = new NextRequest('http://localhost/');
    expect(getClientIp(req)).toBe('unknown');
  });
});

describe('checkAuthRateLimit', () => {
  // Usa IPs únicos por teste para evitar colisão com o contador
  // (que é por-IP e persistente na instância singleton do Redis/in-memory).
  const TEST_IP = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;

  it('1ª chamada: allowed, remaining = max-1', async () => {
    const r = await checkAuthRateLimit('login', TEST_IP);
    expect(r.allowed).toBe(true);
    expect(r.limit).toBe(5);
    expect(r.remaining).toBe(4);
  });

  it('incrementa remaining a cada chamada', async () => {
    const ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
    const r1 = await checkAuthRateLimit('login', ip);
    const r2 = await checkAuthRateLimit('login', ip);
    const r3 = await checkAuthRateLimit('login', ip);
    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(3);
    expect(r3.remaining).toBe(2);
  });

  it('bloqueia após max+1 requests (login: 6/15min)', async () => {
    const ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
    // 5 allowed
    for (let i = 0; i < 5; i++) {
      const r = await checkAuthRateLimit('login', ip);
      expect(r.allowed).toBe(true);
    }
    // 6ª deve bloquear
    const blocked = await checkAuthRateLimit('login', ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('IPs diferentes têm contadores independentes', async () => {
    const ipA = `198.51.100.${Math.floor(Math.random() * 250) + 1}`;
    const ipB = `198.51.100.${Math.floor(Math.random() * 250) + 1}`;

    // Esgota ipA
    for (let i = 0; i < 5; i++) {
      await checkAuthRateLimit('login', ipA);
    }
    const blockedA = await checkAuthRateLimit('login', ipA);
    expect(blockedA.allowed).toBe(false);

    // ipB ainda tem janela cheia
    const okB = await checkAuthRateLimit('login', ipB);
    expect(okB.allowed).toBe(true);
    expect(okB.remaining).toBe(4);
  });

  it('resetAt é um Unix epoch futuro, em segundos', async () => {
    const ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
    const before = Math.floor(Date.now() / 1000);
    const r = await checkAuthRateLimit('register', ip);
    const after = Math.floor(Date.now() / 1000);
    expect(r.resetAt).toBeGreaterThanOrEqual(before);
    expect(r.resetAt).toBeLessThanOrEqual(after + 60 * 60);
  });
});

describe('applyRateLimitHeaders', () => {
  it('seta os 3 headers padrão (X-RateLimit-Limit, -Remaining, -Reset)', () => {
    const res = NextResponse.json({ ok: true });
    applyRateLimitHeaders(res, {
      allowed: true,
      limit: 5,
      remaining: 3,
      resetAt: 1234567890,
      retryAfterSeconds: 0,
    });
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('3');
    expect(res.headers.get('X-RateLimit-Reset')).toBe('1234567890');
    expect(res.headers.get('Retry-After')).toBeNull();
  });

  it('seta Retry-After quando bloqueado', () => {
    const res = NextResponse.json({ ok: false }, { status: 429 });
    applyRateLimitHeaders(res, {
      allowed: false,
      limit: 5,
      remaining: 0,
      resetAt: 1234567890,
      retryAfterSeconds: 42,
    });
    expect(res.headers.get('Retry-After')).toBe('42');
  });
});

describe('enforceAuthRateLimit', () => {
  it('retorna { kind: "ok" } com result quando abaixo do limite', async () => {
    const ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
    const r = await enforceAuthRateLimit(makeRequest(ip), 'login');
    expect(r.kind).toBe('ok');
    if (r.kind === 'ok') {
      expect(r.result.allowed).toBe(true);
      expect(r.result.limit).toBe(5);
    }
  });

  it('retorna { kind: "blocked" } com 429 quando excede', async () => {
    const ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
    // Esgota
    for (let i = 0; i < 5; i++) {
      await checkAuthRateLimit('login', ip);
    }
    const r = await enforceAuthRateLimit(makeRequest(ip), 'login');
    expect(r.kind).toBe('blocked');
    if (r.kind === 'blocked') {
      expect(r.response.status).toBe(429);
      expect(r.response.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(r.response.headers.get('Retry-After')).not.toBeNull();
    }
  });

  it('extrai IP do request e usa como chave', async () => {
    const ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
    // 1ª chamada com request.setando x-forwarded-for
    const r1 = await enforceAuthRateLimit(makeRequest(ip), 'login');
    expect(r1.kind).toBe('ok');
    if (r1.kind === 'ok') {
      expect(r1.result.remaining).toBe(4); // conta este request
    }
  });
});
