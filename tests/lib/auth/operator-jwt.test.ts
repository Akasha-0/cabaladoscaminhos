// tests/lib/auth/operator-jwt.test.ts
// Testes do helper de JWT do Operator (Fase 8 + 15).
// Cobre: sign/verify roundtrip, expiry, tampered token, signature mismatch,
// cookie helpers, JwtSecretMissingError em prod sem secret, e type claim
// (Fase 15: access vs refresh).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  signOperatorAccessToken,
  signOperatorRefreshToken,
  signOperatorToken, // back-compat
  verifyOperatorToken,
  setOperatorSessionCookie,
  setOperatorRefreshCookie,
  clearOperatorSessionCookie,
  clearOperatorRefreshCookie,
  OPERATOR_TOKEN_COOKIE,
  OPERATOR_REFRESH_COOKIE,
  OPERATOR_ACCESS_TTL_SECONDS,
  OPERATOR_REFRESH_TTL_SECONDS,
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
// signOperatorAccessToken + verifyOperatorToken
// ============================================================================

describe('signOperatorAccessToken + verifyOperatorToken (roundtrip)', () => {
  it('signs and verifies a valid access token', () => {
    const token = signOperatorAccessToken({ id: 'op-1', role: 'OPERATOR' });
    const payload = verifyOperatorToken(token);

    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('op-1');
    expect(payload!.role).toBe('OPERATOR');
    expect(payload!.type).toBe('access');
  });

  it('embeds role in payload', () => {
    const token = signOperatorAccessToken({ id: 'admin-1', role: 'ADMIN' });
    const payload = verifyOperatorToken(token);
    expect(payload!.role).toBe('ADMIN');
  });

  it('access token TTL é 15min (Fase 15)', () => {
    const before = Math.floor(Date.now() / 1000);
    const token = signOperatorAccessToken({ id: 'op-1', role: 'OPERATOR' });
    const payload = verifyOperatorToken(token);
    const after = Math.floor(Date.now() / 1000);

    expect(payload!.iat).toBeGreaterThanOrEqual(before);
    expect(payload!.exp).toBeGreaterThan(payload!.iat!);
    // 15min (com margem de 5s)
    expect(payload!.exp! - payload!.iat!).toBeGreaterThanOrEqual(OPERATOR_ACCESS_TTL_SECONDS - 5);
    expect(after).toBeLessThanOrEqual(payload!.exp!);
  });

  it('produces an HS256-signed JWT (3 segmentos separated by dots)', () => {
    const token = signOperatorAccessToken({ id: 'op-1', role: 'OPERATOR' });
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
  });
});

// ============================================================================
// signOperatorRefreshToken (Fase 15)
// ============================================================================

describe('signOperatorRefreshToken (Fase 15)', () => {
  it('assina refresh token com type=refresh', () => {
    const token = signOperatorRefreshToken({ id: 'op-1', role: 'OPERATOR' });
    const payload = verifyOperatorToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.type).toBe('refresh');
    expect(payload!.sub).toBe('op-1');
    expect(payload!.role).toBe('OPERATOR');
  });

  it('refresh token TTL é 30d', () => {
    const token = signOperatorRefreshToken({ id: 'op-1', role: 'OPERATOR' });
    const payload = verifyOperatorToken(token);
    expect(payload!.exp! - payload!.iat!).toBeGreaterThanOrEqual(OPERATOR_REFRESH_TTL_SECONDS - 5);
  });
});

// ============================================================================
// verifyOperatorToken — type check (Fase 15)
// ============================================================================

describe('verifyOperatorToken — type check (Fase 15)', () => {
  it('verifyOperatorToken(access, "access") OK', () => {
    const token = signOperatorAccessToken({ id: 'op-1', role: 'OPERATOR' });
    expect(verifyOperatorToken(token, 'access')).not.toBeNull();
  });

  it('verifyOperatorToken(refresh, "refresh") OK', () => {
    const token = signOperatorRefreshToken({ id: 'op-1', role: 'OPERATOR' });
    expect(verifyOperatorToken(token, 'refresh')).not.toBeNull();
  });

  it('verifyOperatorToken(access, "refresh") retorna null (rejeita)', () => {
    const token = signOperatorAccessToken({ id: 'op-1', role: 'OPERATOR' });
    expect(verifyOperatorToken(token, 'refresh')).toBeNull();
  });

  it('verifyOperatorToken(refresh, "access") retorna null (rejeita)', () => {
    const token = signOperatorRefreshToken({ id: 'op-1', role: 'OPERATOR' });
    expect(verifyOperatorToken(token, 'access')).toBeNull();
  });

  it('verifyOperatorToken sem expectedType aceita ambos', () => {
    const access = signOperatorAccessToken({ id: 'op-1', role: 'OPERATOR' });
    const refresh = signOperatorRefreshToken({ id: 'op-1', role: 'OPERATOR' });
    expect(verifyOperatorToken(access)).not.toBeNull();
    expect(verifyOperatorToken(refresh)).not.toBeNull();
  });

  it('rejeita token sem claim type (compat Fase 13)', () => {
    // Token Fase 13: assinado com a mesma secret mas sem type
    const oldToken = jwt.sign({ sub: 'op-1', role: 'OPERATOR' }, TEST_SECRET, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });
    expect(verifyOperatorToken(oldToken)).toBeNull();
  });

  it('rejeita token com type inválido', () => {
    const weird = jwt.sign({ sub: 'op-1', role: 'OPERATOR', type: 'banana' }, TEST_SECRET, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });
    expect(verifyOperatorToken(weird)).toBeNull();
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
    const tamperedToken = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      'wrong-secret',
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    expect(verifyOperatorToken(tamperedToken)).toBeNull();
  });

  it('returns null when payload was tampered after signing', () => {
    const token = signOperatorAccessToken({ id: 'op-1', role: 'OPERATOR' });
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
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '-1s' }
    );
    expect(verifyOperatorToken(expiredToken)).toBeNull();
  });

  it('returns null for token with wrong algorithm (none)', () => {
    // Previne downgrade attack — algoritmo 'none' é rejeitado por jsonwebtoken
    // quando verify usa algorithms allowlist
    const noneToken = jwt.sign({ sub: 'op-1', role: 'OPERATOR', type: 'access' }, '', {
      algorithm: 'none',
    });
    expect(verifyOperatorToken(noneToken)).toBeNull();
  });

  it('returns null when payload is missing sub', () => {
    const noSub = jwt.sign({ role: 'OPERATOR', type: 'access' }, TEST_SECRET, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });
    expect(verifyOperatorToken(noSub)).toBeNull();
  });

  it('returns null when role is invalid (not OPERATOR or ADMIN)', () => {
    const badRole = jwt.sign({ sub: 'op-1', role: 'GOD', type: 'access' }, TEST_SECRET, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });
    expect(verifyOperatorToken(badRole)).toBeNull();
  });
});

// ============================================================================
// signOperatorToken (back-compat Fase 8/13)
// ============================================================================

describe('signOperatorToken (back-compat)', () => {
  it('mantém contrato Fase 8: assina como access', () => {
    const token = signOperatorToken({ id: 'op-1', role: 'OPERATOR' });
    const payload = verifyOperatorToken(token);
    expect(payload!.type).toBe('access');
  });
});

// ============================================================================
// signOperatorToken — produção sem secret
// ============================================================================

describe('signOperatorAccessToken — sem JWT_SECRET', () => {
  it('lança JwtSecretMissingError em produção', () => {
    const savedSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    (process.env as Record<string, string>).NODE_ENV = 'production';

    expect(() => signOperatorAccessToken({ id: 'op-1', role: 'OPERATOR' })).toThrow(JwtSecretMissingError);

    process.env.JWT_SECRET = savedSecret;
  });

  it('lança JwtSecretMissingError também em dev', () => {
    const savedSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    (process.env as Record<string, string>).NODE_ENV = 'development';

    expect(() => signOperatorAccessToken({ id: 'op-1', role: 'OPERATOR' })).toThrow(JwtSecretMissingError);

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
    // Fase 15: access cookie TTL = 15min
    expect(res._calls[0].opts?.maxAge).toBe(OPERATOR_ACCESS_TTL_SECONDS);
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

  // -------- refresh cookie (Fase 15) --------

  it('setOperatorRefreshCookie sets cockpit_refresh cookie', () => {
    const res = makeResponse();
    setOperatorRefreshCookie(res, 'refresh-abc');

    expect(res._calls).toHaveLength(1);
    expect(res._calls[0].name).toBe(OPERATOR_REFRESH_COOKIE);
    expect(res._calls[0].value).toBe('refresh-abc');
  });

  it('setOperatorRefreshCookie TTL = 30d', () => {
    const res = makeResponse();
    setOperatorRefreshCookie(res, 'refresh-abc');
    expect(res._calls[0].opts?.maxAge).toBe(OPERATOR_REFRESH_TTL_SECONDS);
  });

  it('setOperatorRefreshCookie httpOnly=true', () => {
    const res = makeResponse();
    setOperatorRefreshCookie(res, 'refresh-abc');
    expect(res._calls[0].opts).toMatchObject({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });
  });

  it('clearOperatorRefreshCookie zera value e maxAge', () => {
    const res = makeResponse();
    clearOperatorRefreshCookie(res);

    expect(res._calls[0].name).toBe(OPERATOR_REFRESH_COOKIE);
    expect(res._calls[0].value).toBe('');
    expect(res._calls[0].opts?.maxAge).toBe(0);
  });
});
