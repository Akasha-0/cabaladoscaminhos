/**
 * Unit Tests — Rate Limit (Wave 26)
 *
 * Cobre:
 *   - src/lib/rate-limit.ts        (checkRateLimit — por IP)
 *   - src/lib/rate-limit-user.ts   (checkUserRateLimit, getRateLimitConfig, userRateLimitMessage)
 *
 * Funções puras (sem I/O) — não precisa mockar Prisma.
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { checkRateLimit } from '@/lib/rate-limit';
import {
  checkUserRateLimit,
  getRateLimitConfig,
  userRateLimitMessage,
} from '@/lib/rate-limit-user';

// =============================================================================
// checkRateLimit — Rate limit por IP
// =============================================================================

describe('checkRateLimit (IP-based)', () => {
  const config = { windowMs: 60_000, maxRequests: 3 };

  it('permite a primeira requisição e decrementa o remaining', () => {
    const r = checkRateLimit('1.2.3.4', config);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
    expect(r.resetIn).toBeGreaterThan(0);
    expect(r.resetIn).toBeLessThanOrEqual(config.windowMs);
  });

  it('decrementa o remaining a cada chamada dentro da janela', () => {
    const ip = '10.0.0.1';
    const r1 = checkRateLimit(ip, config);
    const r2 = checkRateLimit(ip, config);
    const r3 = checkRateLimit(ip, config);
    expect(r1.remaining).toBe(2);
    expect(r2.remaining).toBe(1);
    expect(r3.remaining).toBe(0);
    expect(r1.allowed && r2.allowed && r3.allowed).toBe(true);
  });

  it('bloqueia requisições após maxRequests', () => {
    const ip = '10.0.0.2';
    checkRateLimit(ip, config);
    checkRateLimit(ip, config);
    checkRateLimit(ip, config);
    const r4 = checkRateLimit(ip, config);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.resetIn).toBeGreaterThan(0);
  });

  it('identifica diferentes IPs como buckets independentes', () => {
    const a = checkRateLimit('a.a.a.a', config);
    const b = checkRateLimit('b.b.b.b', config);
    expect(a.remaining).toBe(2);
    expect(b.remaining).toBe(2);
  });

  it('respeita resetIn dentro da janela de 60s', () => {
    const r = checkRateLimit('1.1.1.1', config);
    expect(r.resetIn).toBeGreaterThan(0);
    expect(r.resetIn).toBeLessThanOrEqual(config.windowMs);
  });
});

// =============================================================================
// getRateLimitConfig — Limites por ação (Wave 11, Caio)
// =============================================================================

describe('getRateLimitConfig', () => {
  it('post-create = 10/hora', () => {
    const c = getRateLimitConfig('post-create');
    expect(c.maxRequests).toBe(10);
    expect(c.windowMs).toBe(60 * 60 * 1000);
  });

  it('comment-create = 30/hora', () => {
    const c = getRateLimitConfig('comment-create');
    expect(c.maxRequests).toBe(30);
  });

  it('like = 100/hora', () => {
    const c = getRateLimitConfig('like');
    expect(c.maxRequests).toBe(100);
  });

  it('follow = 50/hora', () => {
    const c = getRateLimitConfig('follow');
    expect(c.maxRequests).toBe(50);
  });
});

// =============================================================================
// checkUserRateLimit — Por usuário autenticado
// =============================================================================

describe('checkUserRateLimit', () => {
  beforeEach(() => {
    // Cada teste usa userId único pra evitar interferência do Map interno
  });

  it('permite primeira ação e retorna limit correto', () => {
    const uid = `u-${Math.random()}`;
    const r = checkUserRateLimit(uid, 'post-create');
    expect(r.allowed).toBe(true);
    expect(r.limit).toBe(10);
    expect(r.remaining).toBe(9);
  });

  it('bloqueia após exceder maxRequests', () => {
    const uid = `u-${Math.random()}`;
    for (let i = 0; i < 10; i++) {
      checkUserRateLimit(uid, 'post-create');
    }
    const r = checkUserRateLimit(uid, 'post-create');
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it('isola buckets entre ações para o mesmo usuário', () => {
    const uid = `u-${Math.random()}`;
    // Esgota post-create
    for (let i = 0; i < 10; i++) {
      checkUserRateLimit(uid, 'post-create');
    }
    // Mas like ainda deve estar disponível
    const likeR = checkUserRateLimit(uid, 'like');
    expect(likeR.allowed).toBe(true);
    expect(likeR.remaining).toBe(99);
  });

  it('isola buckets entre usuários', () => {
    const uidA = `u-A-${Math.random()}`;
    const uidB = `u-B-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      checkUserRateLimit(uidA, 'comment-create');
    }
    const rB = checkUserRateLimit(uidB, 'comment-create');
    expect(rB.allowed).toBe(true);
    expect(rB.remaining).toBe(29);
  });

  it('expira bucket e libera após resetIn', () => {
    const uid = `u-${Math.random()}`;
    // Esgota
    for (let i = 0; i < 10; i++) {
      checkUserRateLimit(uid, 'post-create');
    }
    const r = checkUserRateLimit(uid, 'post-create');
    expect(r.allowed).toBe(false);
    expect(r.resetIn).toBeGreaterThan(0);
  });
});

// =============================================================================
// userRateLimitMessage — Helper de resposta pt-BR
// =============================================================================

describe('userRateLimitMessage', () => {
  it('formata mensagem com minutos pra >= 1min', () => {
    const msg = userRateLimitMessage('post-create', 5 * 60_000);
    expect(msg).toContain('post-create');
    expect(msg).toContain('5');
    expect(msg.toLowerCase()).toContain('min');
  });

  it('arredonda pra cima (Math.ceil) pra < 1min', () => {
    const msg = userRateLimitMessage('like', 30_000); // 30s = 0.5min → 1
    expect(msg).toContain('1');
  });

  it('lida com 0ms (sem arredondamento estranho)', () => {
    const msg = userRateLimitMessage('follow', 0);
    expect(msg).toContain('follow');
  });
});