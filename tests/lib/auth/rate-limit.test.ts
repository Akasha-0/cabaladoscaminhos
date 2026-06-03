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

// ============================================================
// TESTES — Per-Operator Rate Limiting (Phase 24)
// ============================================================
import {
  checkOperatorRateLimit,
  checkBothRateLimits,
  OPERATOR_RATE_LIMITS,
  resetOperatorRateLimit,
} from '@/lib/auth/rate-limit';

describe('OPERATOR_RATE_LIMITS (Phase 24)', () => {
  it('sessions/revoke-all: 3 revogacoes / 60s', () => {
    expect(OPERATOR_RATE_LIMITS['sessions/revoke-all'].max).toBe(3);
    expect(OPERATOR_RATE_LIMITS['sessions/revoke-all'].windowSeconds).toBe(60);
  });
  it('sessions/delete: 10 delecoes / 60s', () => {
    expect(OPERATOR_RATE_LIMITS['sessions/delete'].max).toBe(10);
    expect(OPERATOR_RATE_LIMITS['sessions/delete'].windowSeconds).toBe(60);
  });
  it('logout: 10 logout / 60s', () => {
    expect(OPERATOR_RATE_LIMITS['logout'].max).toBe(10);
    expect(OPERATOR_RATE_LIMITS['logout'].windowSeconds).toBe(60);
  });
  it('refresh: 30 rotacoes / 60s', () => {
    expect(OPERATOR_RATE_LIMITS['refresh'].max).toBe(30);
    expect(OPERATOR_RATE_LIMITS['refresh'].windowSeconds).toBe(60);
  });
});

describe('checkOperatorRateLimit', () => {
  const testOpId = () => 'test-op-' + Date.now() + '-' + Math.floor(Math.random() * 99999);

  it('1a chamada: allowed, remaining = max-1', async () => {
    const opId = testOpId();
    const r = await checkOperatorRateLimit(opId, 'refresh', 30, 60);
    expect(r.allowed).toBe(true);
    expect(r.limit).toBe(30);
    expect(r.remaining).toBe(29);
    await resetOperatorRateLimit(opId, 'refresh');
  });

  it('incrementa remaining a cada chamada', async () => {
    const opId = testOpId();
    const r1 = await checkOperatorRateLimit(opId, 'logout', 10, 60);
    const r2 = await checkOperatorRateLimit(opId, 'logout', 10, 60);
    const r3 = await checkOperatorRateLimit(opId, 'logout', 10, 60);
    expect(r1.remaining).toBe(9);
    expect(r2.remaining).toBe(8);
    expect(r3.remaining).toBe(7);
    await resetOperatorRateLimit(opId, 'logout');
  });

  it('bloqueia apos max+1 requests', async () => {
    const opId = testOpId();
    const limit = 10;
    for (let i = 0; i < limit; i++) {
      const r = await checkOperatorRateLimit(opId, 'logout', limit, 60);
      expect(r.allowed).toBe(true);
    }
    const blocked = await checkOperatorRateLimit(opId, 'logout', limit, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    await resetOperatorRateLimit(opId, 'logout');
  });

  it('operadores diferentes tem contadores independentes', async () => {
    const opA = testOpId();
    const opB = testOpId();
    const limit = 5;
    for (let i = 0; i < limit; i++) {
      await checkOperatorRateLimit(opA, 'sessions/delete', limit, 60);
    }
    const blockedA = await checkOperatorRateLimit(opA, 'sessions/delete', limit, 60);
    expect(blockedA.allowed).toBe(false);
    const okB = await checkOperatorRateLimit(opB, 'sessions/delete', limit, 60);
    expect(okB.allowed).toBe(true);
    expect(okB.remaining).toBe(limit - 1);
    await resetOperatorRateLimit(opA, 'sessions/delete');
    await resetOperatorRateLimit(opB, 'sessions/delete');
  });

  it('acoes diferentes para mesmo operador tem contadores independentes', async () => {
    const opId = testOpId();
    const limit = 5;
    for (let i = 0; i < limit; i++) {
      await checkOperatorRateLimit(opId, 'logout', limit, 60);
    }
    const blockedLogout = await checkOperatorRateLimit(opId, 'logout', limit, 60);
    expect(blockedLogout.allowed).toBe(false);
    const okRefresh = await checkOperatorRateLimit(opId, 'refresh', limit, 60);
    expect(okRefresh.allowed).toBe(true);
    expect(okRefresh.remaining).toBe(limit - 1);
    await resetOperatorRateLimit(opId, 'logout');
    await resetOperatorRateLimit(opId, 'refresh');
  });

  it('resetAt e Unix epoch futuro em segundos', async () => {
    const opId = testOpId();
    const before = Math.floor(Date.now() / 1000);
    const r = await checkOperatorRateLimit(opId, 'refresh', 30, 60);
    const after = Math.floor(Date.now() / 1000);
    expect(r.resetAt).toBeGreaterThanOrEqual(before);
    expect(r.resetAt).toBeLessThanOrEqual(after + 61);
    await resetOperatorRateLimit(opId, 'refresh');
  });

  it('falha aberta se operatorId vazio retorna allowed=true', async () => {
    const r1 = await checkOperatorRateLimit('', 'refresh', 30, 60);
    const r2 = await checkOperatorRateLimit('  ', 'refresh', 30, 60);
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });
});

describe('checkBothRateLimits (dual-layer IP + Operator)', () => {
  const testOpId = () => 'test-op-' + Date.now() + '-' + Math.floor(Math.random() * 99999);
  const testIp = () => '203.0.113.' + (Math.floor(Math.random() * 250) + 1);

  function makeRequest(ip) {
    const headers = {};
    if (ip !== null) headers['x-forwarded-for'] = ip;
    return new NextRequest('http://localhost/api/test', { method: 'POST', headers });
  }

  it('retorna ok quando ambas as camadas abaixo do limite', async () => {
    const opId = testOpId();
    const ip = testIp();
    const r = await checkBothRateLimits(makeRequest(ip), opId, 'refresh', 5, 60, 5, 60);
    expect(r.kind).toBe('ok');
    if (r.kind === 'ok') {
      expect(r.ipResult.allowed).toBe(true);
      expect(r.operatorResult.allowed).toBe(true);
    }
    await resetOperatorRateLimit(opId, 'refresh');
  });

  it('retorna blocked by ip quando IP excede', async () => {
    const opId = testOpId();
    const ip = testIp();
    const ipLimit = 3;
    for (let i = 0; i < ipLimit; i++) {
      await checkBothRateLimits(makeRequest(ip), opId, 'refresh', ipLimit, 60, 100, 60);
    }
    const blocked = await checkBothRateLimits(makeRequest(ip), opId, 'refresh', ipLimit, 60, 100, 60);
    expect(blocked.kind).toBe('blocked');
    if (blocked.kind === 'blocked') {
      expect(blocked.by).toBe('ip');
      expect(blocked.response.status).toBe(429);
    }
    await resetOperatorRateLimit(opId, 'refresh');
  });

  it('retorna blocked by operator quando Operator excede', async () => {
    const opId = testOpId();
    const ip = testIp();
    const opLimit = 3;
    for (let i = 0; i < opLimit; i++) {
      await checkBothRateLimits(makeRequest(ip), opId, 'logout', 100, 60, opLimit, 60);
    }
    const blocked = await checkBothRateLimits(makeRequest(ip), opId, 'logout', 100, 60, opLimit, 60);
    expect(blocked.kind).toBe('blocked');
    if (blocked.kind === 'blocked') {
      expect(blocked.by).toBe('operator');
      expect(blocked.response.status).toBe(429);
      expect(blocked.response.headers.get('X-RateLimit-Remaining')).toBe('0');
    }
    await resetOperatorRateLimit(opId, 'logout');
  });

  it('IP e Operator sao independentes', async () => {
    const opId1 = testOpId();
    const opId2 = testOpId();
    const ip = testIp();
    const ipLimit = 2;
    for (let i = 0; i < ipLimit; i++) {
      await checkBothRateLimits(makeRequest(ip), opId1, 'refresh', ipLimit, 60, 100, 60);
    }
    const blocked = await checkBothRateLimits(makeRequest(ip), opId2, 'refresh', ipLimit, 60, 100, 60);
    expect(blocked.kind).toBe('blocked');
    if (blocked.kind === 'blocked') expect(blocked.by).toBe('ip');
    await resetOperatorRateLimit(opId1, 'refresh');
    await resetOperatorRateLimit(opId2, 'refresh');
  });

  it('bloqueio por Operator nao afeta IP de outro operador', async () => {
    const opId1 = testOpId();
    const opId2 = testOpId();
    const ip1 = testIp();
    const ip2 = testIp();
    const opLimit = 2;
    for (let i = 0; i < opLimit; i++) {
      await checkBothRateLimits(makeRequest(ip1), opId1, 'logout', 100, 60, opLimit, 60);
    }
    const ok = await checkBothRateLimits(makeRequest(ip2), opId2, 'logout', 100, 60, opLimit, 60);
    expect(ok.kind).toBe('ok');
    if (ok.kind === 'ok') expect(ok.operatorResult.remaining).toBe(opLimit - 1);
    await resetOperatorRateLimit(opId1, 'logout');
    await resetOperatorRateLimit(opId2, 'logout');
  });

  it('operadores diferentes com mesmo IP tem limites independentes', async () => {
    const opId1 = testOpId();
    const opId2 = testOpId();
    const ip = testIp();
    const opLimit = 3;
    for (let i = 0; i < opLimit; i++) {
      await checkBothRateLimits(makeRequest(ip), opId1, 'sessions/delete', 100, 60, opLimit, 60);
    }
    const ok = await checkBothRateLimits(makeRequest(ip), opId2, 'sessions/delete', 100, 60, opLimit, 60);
    expect(ok.kind).toBe('ok');
    if (ok.kind === 'ok') {
      expect(ok.operatorResult.allowed).toBe(true);
      expect(ok.operatorResult.remaining).toBe(opLimit - 1);
    }
    await resetOperatorRateLimit(opId1, 'sessions/delete');
    await resetOperatorRateLimit(opId2, 'sessions/delete');
  });

  it('operador anonimo retorna ok', async () => {
    const r = await checkBothRateLimits(makeRequest('203.0.113.1'), 'anonymous', 'refresh', 30, 60, 30, 60);
    expect(r.kind).toBe('ok');
  });
});

