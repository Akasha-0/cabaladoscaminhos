/**
 * AD-22.2 — IP Hash Helper Tests
 *
 * LGPD compliance: IP é PII indireto (LGPD art. 5º, II). Não pode
 * aparecer em texto puro em logs, Redis keys, ou audit events.
 *
 * Valida:
 *   1. Determinismo: mesmo IP → mesmo hash
 *   2. Unicidade: IPs diferentes → hashes diferentes
 *   3. Unidirecionalidade: hash não contém o IP original
 *   4. Edge cases: 'unknown', vazio, IPv6
 *   5. Erro em produção sem JWT_SECRET
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { hashIp, getClientIpInfo } from '@/lib/security/ip-hash';

describe('AD-22.2 — IP Hash Helper', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    // Resetar env antes de cada teste (alguns testes setam JWT_SECRET)
    delete process.env.JWT_SECRET;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  describe('determinism', () => {
    it('same IP produces same hash (dev mode, no JWT_SECRET)', () => {
      const ip = '192.168.1.42';
      const h1 = hashIp(ip);
      const h2 = hashIp(ip);
      expect(h1).toBe(h2);
    });

    it('hash is 64 hex chars (SHA-256 output)', () => {
      const h = hashIp('192.168.1.42');
      expect(h).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('uniqueness', () => {
    it('different IPs produce different hashes', () => {
      const h1 = hashIp('192.168.1.1');
      const h2 = hashIp('192.168.1.2');
      expect(h1).not.toBe(h2);
    });

    it('IPv4 and IPv6 produce different hashes', () => {
      const ipv4 = hashIp('10.0.0.1');
      const ipv6 = hashIp('::1');
      expect(ipv4).not.toBe(ipv6);
    });
  });

  describe('unidirectional (cannot recover IP from hash)', () => {
    it('hash does not contain the original IP as a substring', () => {
      const ip = '203.0.113.42';
      const h = hashIp(ip);
      // O IP completo nunca aparece no hash (HMAC-SHA256 unidirecional).
      // Não testamos componentes individuais (ex: "42", "203") porque
      // hex de 64 chars naturalmente pode conter essas substrings.
      expect(h).not.toContain('203.0.113.42');
      expect(h).not.toContain(ip);
    });

    it('different secrets produce different hashes for same IP', () => {
      const secretA = 'secret-alpha-' + 'x'.repeat(32);
      const secretB = 'secret-beta-' + 'y'.repeat(32);
      process.env.JWT_SECRET = secretA;
      const h1 = hashIp('1.2.3.4');

      process.env.JWT_SECRET = secretB;
      const h2 = hashIp('1.2.3.4');

      expect(h1).not.toBe(h2);
    });
  });

  describe('edge cases', () => {
    it('"unknown" produces a deterministic (but non-revealing) hash', () => {
      const h1 = hashIp('unknown');
      const h2 = hashIp('unknown');
      expect(h1).toBe(h2);
      // Não deve expor a string literal
      expect(h1).not.toContain('unknown');
    });

    it('empty string produces a deterministic hash', () => {
      // Útil para casos onde o IP não pôde ser extraído do request.
      const h1 = hashIp('');
      const h2 = hashIp('');
      expect(h1).toBe(h2);
    });
  });

  describe('production safety', () => {
    it('throws in production without JWT_SECRET', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;

      expect(() => hashIp('1.2.3.4')).toThrowError(
        /JWT_SECRET.*production.*LGPD/i,
      );
    });

    it('works in production WITH JWT_SECRET set', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'a-real-secret-32-bytes-long-here!';

      const h = hashIp('1.2.3.4');
      expect(h).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('getClientIpInfo', () => {
    it('returns both ip (for debug) and hash (for persistence)', () => {
      process.env.JWT_SECRET = 'test-secret';
      const req = {
        headers: {
          get(name: string): string | null {
            if (name === 'x-forwarded-for') return '203.0.113.99, 10.0.0.1';
            if (name === 'x-real-ip') return null;
            return null;
          },
        },
      };
      const info = getClientIpInfo(req);
      expect(info.ip).toBe('203.0.113.99');
      expect(info.hash).toMatch(/^[0-9a-f]{64}$/);
      expect(info.hash).not.toContain('203.0.113.99');
    });

    it('returns "unknown" when request is null', () => {
      const info = getClientIpInfo(null);
      expect(info.ip).toBe('unknown');
      expect(info.hash).toBeDefined();
    });

    it('returns "unknown" when x-forwarded-for and x-real-ip are missing', () => {
      const req = {
        headers: {
          get(_name: string): string | null {
            return null;
          },
        },
      };
      const info = getClientIpInfo(req);
      expect(info.ip).toBe('unknown');
    });
  });
});
