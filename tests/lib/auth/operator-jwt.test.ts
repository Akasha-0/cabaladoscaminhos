// tests/lib/auth/operator-jwt.test.ts
// Testes do helper de JWT do Operator (Fase 8).
// Cobre: sign/verify roundtrip, expiry, tampered token, signature mismatch,
// cookie helpers, JwtSecretMissingError em prod sem secret.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  signOperatorToken,
  verifyOperatorToken,
  setOperatorSessionCookie,
  clearOperatorSessionCookie,
  OPERATOR_TOKEN_COOKIE,
  OPERATOR_TOKEN_TTL_SECONDS,
  JwtSecretMissingError,
} from '@/lib/auth/operator-jwt';

// ----------------------------------------------------------------------------
// Setup — usa a env JWT_SECRET do vitest config
// ----------------------------------------------------------------------------

const TEST_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-that-is-at-least-32-bytes-long';
const originalNodeEnv = process.env.NODE_ENV;

beforeEach(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

afterEach(() => {
  // NODE_ENV é readonly; cast para writable
  (process.env as Record<string, string>).NODE_ENV = originalNodeEnv as string;
});

// ============================================================================
// signOperatorToken + verifyOperatorToken
// ============================================================================

describe('signOperatorToken + verifyOperatorToken (roundtrip)', () => {
  it('signs and verifies a valid token', () => {
    const token = signOperatorToken({ id: 'op-1', role: 'OPERATOR' });
    const payload = verifyOperatorToken(token);

    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('op-1');
    expect(payload!.role).toBe('OPERATOR');
  });

  it('embeds role in payload', () => {
    const token = signOperatorToken({ id: 'admin-1', role: 'ADMIN' });
    const payload = verifyOperatorToken(token);
    expect(payload!.role).toBe('ADMIN');
  });

  it('sets iat and exp claims', () => {
    const before = Math.floor(Date.now() / 1000);
    const token = signOperatorToken({ id: 'op-1', role: 'OPERATOR' });
    const payload = verifyOperatorToken(token);
    const after = Math.floor(Date.now() / 1000);

    expect(payload!.iat).toBeGreaterThanOrEqual(before);
    expect(payload!.exp).toBeGreaterThan(payload!.iat!);
    // 7 dias (com margem de 5s)
    expect(payload!.exp! - payload!.iat!).toBeGreaterThanOrEqual(OPERATOR_TOKEN_TTL_SECONDS - 5);
    expect(after).toBeLessThanOrEqual(payload!.exp!);
  });

  it('produces an HS256-signed JWT (3 segmentos separated by dots)', () => {
    const token = signOperatorToken({ id: 'op-1', role: 'OPERATOR' });
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
  });
});

// ============================================================================
// verifyOperatorToken — falhas
// ============================================================================

describe('verifyOperatorToken — invalid inputs', () => {
  it('returns null for null token', () => {
    expect(verifyOperatorToken(null)).toBeNull();
  });

  it('returns null for undefined token', () => {
    expect(verifyOperatorToken(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(verifyOperatorToken('')).toBeNull();
  });

  it('returns null for malformed string (not 3 segments)', () => {
    expect(verifyOperatorToken('not-a-jwt')).toBeNull();
    expect(verifyOperatorToken('a.b')).toBeNull();
    expect(verifyOperatorToken('a.b.c.d')).toBeNull();
  });

  it('returns null when signature was created with different secret', () => {
    const tamperedToken = jwt.sign({ sub: 'op-1', role: 'OPERATOR' }, 'wrong-secret', {
      algorithm: 'HS256',
      expiresIn: '7d',
    });
    expect(verifyOperatorToken(tamperedToken)).toBeNull();
  });

  it('returns null when payload was tampered after signing', () => {
    const token = signOperatorToken({ id: 'op-1', role: 'OPERATOR' });
    // Decodifica header.payload (sem verificação), muda sub, reassina header.payload com mesmo prefix
    const parts = token.split('.');
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    const tamperedPayload = JSON.parse(payloadJson);
    tamperedPayload.sub = 'op-evil';
    const newPayloadB64 = Buffer.from(JSON.stringify(tamperedPayload)).toString('base64url');
    const tamperedToken = `${parts[0]}.${newPayloadB64}.${parts[2]}`;

    expect(verifyOperatorToken(tamperedToken)).toBeNull();
  });

  it('returns null for expired token', () => {
    const expiredToken = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '-1s' }
    );
    expect(verifyOperatorToken(expiredToken)).toBeNull();
  });

  it('returns null for token with wrong algorithm (none)', () => {
    // Previne downgrade attack — algoritmo 'none' é rejeitado por jsonwebtoken
    // quando verify usa algorithms allowlist
    const noneToken = jwt.sign({ sub: 'op-1', role: 'OPERATOR' }, '', {
      algorithm: 'none',
    });
    expect(verifyOperatorToken(noneToken)).toBeNull();
  });

  it('returns null when payload is missing sub', () => {
    const noSub = jwt.sign({ role: 'OPERATOR' }, TEST_SECRET, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });
    expect(verifyOperatorToken(noSub)).toBeNull();
  });

  it('returns null when role is invalid (not OPERATOR or ADMIN)', () => {
    const badRole = jwt.sign({ sub: 'op-1', role: 'GOD' }, TEST_SECRET, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });
    expect(verifyOperatorToken(badRole)).toBeNull();
  });
});

// ============================================================================
// signOperatorToken — produção sem secret
// ============================================================================

describe('signOperatorToken — produção sem JWT_SECRET', () => {
  it('lança JwtSecretMissingError em produção', () => {
    const savedSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    (process.env as Record<string, string>).NODE_ENV = 'production';

    expect(() => signOperatorToken({ id: 'op-1', role: 'OPERATOR' })).toThrow(JwtSecretMissingError);

    process.env.JWT_SECRET = savedSecret;
  });

  it('usa fallback DEV (com warning) quando secret ausente em dev', () => {
    const savedSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    (process.env as Record<string, string>).NODE_ENV = 'development';
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const token = signOperatorToken({ id: 'op-1', role: 'OPERATOR' });
    expect(token).toBeTruthy();
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringMatching(/JWT_SECRET/));

    consoleWarn.mockRestore();
    process.env.JWT_SECRET = savedSecret;
  });
});

// ============================================================================
// Cookie helpers
// ============================================================================

describe('cookie helpers', () => {
  function makeResponse() {
    const calls: Array<{ name: string; value: string; opts?: Record<string, unknown> }> = [];
    return {
      cookies: {
        set: (name: string, value: string, opts?: Record<string, unknown>) => {
          calls.push({ name, value, opts });
        },
      },
      _calls: calls,
    };
  }

  it('setOperatorSessionCookie sets the right cookie name + value', () => {
    const res = makeResponse();
    setOperatorSessionCookie(res, 'jwt-abc');

    expect(res._calls).toHaveLength(1);
    expect(res._calls[0].name).toBe(OPERATOR_TOKEN_COOKIE);
    expect(res._calls[0].value).toBe('jwt-abc');
  });

  it('setOperatorSessionCookie sets httpOnly, path, sameSite', () => {
    const res = makeResponse();
    setOperatorSessionCookie(res, 'jwt-abc');

    expect(res._calls[0].opts).toMatchObject({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });
    expect(res._calls[0].opts?.maxAge).toBe(OPERATOR_TOKEN_TTL_SECONDS);
  });

  it('setOperatorSessionCookie sets secure=true em produção', () => {
    const savedEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'production';

    const res = makeResponse();
    setOperatorSessionCookie(res, 'jwt-abc');
    expect(res._calls[0].opts?.secure).toBe(true);

    (process.env as Record<string, string>).NODE_ENV = savedEnv as string;
  });

  it('setOperatorSessionCookie sets secure=false em dev', () => {
    const savedEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'development';

    const res = makeResponse();
    setOperatorSessionCookie(res, 'jwt-abc');
    expect(res._calls[0].opts?.secure).toBe(false);

    (process.env as Record<string, string>).NODE_ENV = savedEnv as string;
  });

  it('clearOperatorSessionCookie zera value e maxAge', () => {
    const res = makeResponse();
    clearOperatorSessionCookie(res);

    expect(res._calls[0].name).toBe(OPERATOR_TOKEN_COOKIE);
    expect(res._calls[0].value).toBe('');
    expect(res._calls[0].opts?.maxAge).toBe(0);
  });
});
