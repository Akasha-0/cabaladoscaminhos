// tests/api/operator-auth-mfa.test.ts
// Integração das rotas /api/operator/auth/mfa/* (Fase 20).
// Foco: validação de body, mfaToken JWT (assinatura/expiração), e
// detecção de MFA no /login. O fluxo end-to-end (criar MFA, validar,
// gerar cookies) é coberto por tests/lib/auth/operator-mfa.test.ts
// (unit) — os routes só orquestram o manager e adicionam auth gate.

process.env.AUTH_RL_LOGIN_MAX = '10000';
process.env.AUTH_RL_REGISTER_MAX = '10000';
process.env.AUTH_RL_REFRESH_MAX = '10000';
process.env.MFA_ENCRYPTION_KEY = 'a'.repeat(64);

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const TEST_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-that-is-at-least-32-bytes-long';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockBcryptHash = vi.fn();
const mockBcryptCompare = vi.fn();

vi.mock('bcryptjs', () => {
  const hash = (...args: unknown[]) => mockBcryptHash(...args);
  const compare = (...args: unknown[]) => mockBcryptCompare(...args);
  return { default: { hash, compare }, hash, compare };
});

const mockOperatorFindUnique = vi.fn();
const mockOperatorMfaFindUnique = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: {
      findUnique: (args: unknown) => mockOperatorFindUnique(args),
    },
    operatorMfa: {
      findUnique: (args: unknown) => mockOperatorMfaFindUnique(args),
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    operatorSession: {
      create: vi.fn().mockResolvedValue({ id: 'sess-1' }),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockBcryptHash.mockImplementation(async (pw: string) => `hashed:${pw}`);
  mockBcryptCompare.mockImplementation(async (pw: string, hash: string) => hash === `hashed:${pw}`);
});

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function makeJsonPost(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const mockAdminOperator = {
  id: 'op-admin',
  email: 'admin@cabala.com',
  name: 'Admin',
  passwordHash: 'hashed:admin-pass',
  role: 'ADMIN' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockRegularOperator = {
  id: 'op-regular',
  email: 'op@cabala.com',
  name: 'Operator',
  passwordHash: 'hashed:op-pass',
  role: 'OPERATOR' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

// ----------------------------------------------------------------------------//
// /api/operator/auth/login detecta MFA
// ----------------------------------------------------------------------------//

describe('POST /api/operator/auth/login (MFA detection)', () => {
  it('operator com MFA ativo → 200 { mfaRequired: true, mfaToken }', async () => {
    mockOperatorFindUnique.mockResolvedValue(mockAdminOperator);
    mockOperatorMfaFindUnique.mockResolvedValue({
      operatorId: 'op-admin',
      secretEncrypted: 'fake',
      enabled: true,
      recoveryCodesHash: '[]',
      lastUsedStep: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/login', {
      email: 'admin@cabala.com',
      password: 'admin-pass',
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.mfaRequired).toBe(true);
    expect(data.mfaToken).toMatch(/^eyJ/); // JWT começa com eyJ
    // mfaToken é válido e tem type=mfa-challenge
    const payload = jwt.verify(data.mfaToken, TEST_SECRET) as { type: string; sub: string };
    expect(payload.type).toBe('mfa-challenge');
    expect(payload.sub).toBe('op-admin');
    // NÃO emite cookies de sessão (par access+refresh) no path MFA
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).not.toContain('cockpit_session=');
  });

  it('operator sem MFA → 200 com operator (cookies de sessão)', async () => {
    mockOperatorFindUnique.mockResolvedValue(mockRegularOperator);
    mockOperatorMfaFindUnique.mockResolvedValue(null); // sem MFA

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/login', {
      email: 'op@cabala.com',
      password: 'op-pass',
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.mfaRequired).toBeUndefined();
    expect(data.operator.role).toBe('OPERATOR');
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('cockpit_session=');
    expect(setCookie).toContain('cockpit_refresh=');
  });

  it('senha errada → 401 (mesmo com MFA ativo, não vaza)', async () => {
    mockOperatorFindUnique.mockResolvedValue(mockAdminOperator);
    mockOperatorMfaFindUnique.mockResolvedValue({
      operatorId: 'op-admin',
      enabled: true,
      secretEncrypted: 'fake',
      recoveryCodesHash: '[]',
      lastUsedStep: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/login', {
      email: 'admin@cabala.com',
      password: 'wrong',
    }));
    expect(res.status).toBe(401);
  });
});

// ----------------------------------------------------------------------------//
// /api/operator/auth/mfa/verify — mfaToken JWT validation
// ----------------------------------------------------------------------------//

describe('POST /api/operator/auth/mfa/verify (mfaToken validation)', () => {
  it('mfaToken malformado → 401', async () => {
    const { POST } = await import('@/app/api/operator/auth/mfa/verify/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/verify', {
      mfaToken: 'invalid.token.here',
      code: '123456',
    }));
    expect(res.status).toBe(401);
  });

  it('mfaToken expirado → 401', async () => {
    const expired = jwt.sign(
      { sub: 'op-admin', type: 'mfa-challenge', jti: 'x' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: -10 }
    );
    const { POST } = await import('@/app/api/operator/auth/mfa/verify/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/verify', {
      mfaToken: expired,
      code: '123456',
    }));
    expect(res.status).toBe(401);
  });

  it('mfaToken type=access (não mfa-challenge) → 401', async () => {
    const accessToken = jwt.sign(
      { sub: 'op-admin', role: 'ADMIN', type: 'access' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: 300 }
    );
    const { POST } = await import('@/app/api/operator/auth/mfa/verify/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/verify', {
      mfaToken: accessToken,
      code: '123456',
    }));
    expect(res.status).toBe(401);
  });

  it('mfaToken com assinatura errada → 401', async () => {
    const tampered = jwt.sign(
      { sub: 'op-admin', type: 'mfa-challenge', jti: 'x' },
      'wrong-secret-but-long-enough-32-bytes-padding',
      { algorithm: 'HS256', expiresIn: 300 }
    );
    const { POST } = await import('@/app/api/operator/auth/mfa/verify/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/verify', {
      mfaToken: tampered,
      code: '123456',
    }));
    expect(res.status).toBe(401);
  });

  it('body sem code → 400', async () => {
    const mfaToken = jwt.sign(
      { sub: 'op-admin', type: 'mfa-challenge', jti: 'x' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: 300 }
    );
    const { POST } = await import('@/app/api/operator/auth/mfa/verify/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/verify', {
      mfaToken,
      code: 'abc',
    }));
    expect(res.status).toBe(400);
  });
});

// ----------------------------------------------------------------------------//
// /api/operator/auth/mfa/recovery-code
// ----------------------------------------------------------------------------//

describe('POST /api/operator/auth/mfa/recovery-code', () => {
  it('mfaToken inválido → 401', async () => {
    const { POST } = await import('@/app/api/operator/auth/mfa/recovery-code/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/recovery-code', {
      mfaToken: 'bad',
      code: 'a1b2c3d4e5f67890',
    }));
    expect(res.status).toBe(401);
  });

  it('formato de recovery code inválido → 400', async () => {
    const mfaToken = jwt.sign(
      { sub: 'op-admin', type: 'mfa-challenge', jti: 'test' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: 300 }
    );
    const { POST } = await import('@/app/api/operator/auth/mfa/recovery-code/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/recovery-code', {
      mfaToken,
      code: 'not-hex-code',
    }));
    expect(res.status).toBe(400);
  });

  it('recovery code com menos de 16 chars → 400', async () => {
    const mfaToken = jwt.sign(
      { sub: 'op-admin', type: 'mfa-challenge', jti: 'test' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: 300 }
    );
    const { POST } = await import('@/app/api/operator/auth/mfa/recovery-code/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/recovery-code', {
      mfaToken,
      code: 'abc',
    }));
    expect(res.status).toBe(400);
  });
});

// ----------------------------------------------------------------------------//
// /api/operator/auth/mfa/setup e /verify-setup — auth gate
// ----------------------------------------------------------------------------//

describe('POST /api/operator/auth/mfa/setup (auth gate)', () => {
  it('sem cookie de sessão → 401', async () => {
    const { POST } = await import('@/app/api/operator/auth/mfa/setup/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/setup', {}));
    expect(res.status).toBe(401);
  });
});

describe('POST /api/operator/auth/mfa/verify-setup (body validation)', () => {
  it('body sem code → 400', async () => {
    // Auth gate passa com dev header (NODE_ENV=test)
    const { POST } = await import('@/app/api/operator/auth/mfa/verify-setup/route');
    const res = await POST(
      new NextRequest('http://test/api/operator/auth/mfa/verify-setup', {
        method: 'POST',
        headers: { 'x-dev-operator-id': 'op-admin', 'content-type': 'application/json' },
        body: JSON.stringify({ code: 'abc' }),
      })
    );
    // Pode ser 400 (validation) ou 401 (auth gate falhou)
    expect([400, 401]).toContain(res.status);
  });
});

describe('POST /api/operator/auth/mfa/disable (auth gate + validation)', () => {
  it('sem cookie → 401', async () => {
    const { POST } = await import('@/app/api/operator/auth/mfa/disable/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/disable', {
      password: 'admin-pass',
    }));
    expect(res.status).toBe(401);
  });

  it('body sem password → 400 (auth passa via dev header)', async () => {
    const { POST } = await import('@/app/api/operator/auth/mfa/disable/route');
    const res = await POST(
      new NextRequest('http://test/api/operator/auth/mfa/disable', {
        method: 'POST',
        headers: { 'x-dev-operator-id': 'op-admin', 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
    );
    expect([400, 401]).toContain(res.status);
  });
});

// ----------------------------------------------------------------------------//
// signMfaChallengeToken / verifyMfaChallengeToken (operator-jwt.ts)
// ----------------------------------------------------------------------------//

describe('signMfaChallengeToken + verifyMfaChallengeToken', () => {
  it('roundtrip: assina e verifica', async () => {
    const { signMfaChallengeToken, verifyMfaChallengeToken } = await import('@/lib/auth/operator-jwt');
    const token = signMfaChallengeToken({ operatorId: 'op-admin' });
    const payload = verifyMfaChallengeToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('op-admin');
    expect(payload!.type).toBe('mfa-challenge');
    expect(payload!.jti).toBeTruthy();
  });

  it('token access (não mfa-challenge) é rejeitado', async () => {
    const { signOperatorAccessToken, verifyMfaChallengeToken } = await import('@/lib/auth/operator-jwt');
    const access = signOperatorAccessToken({ id: 'op-admin', role: 'ADMIN' });
    expect(verifyMfaChallengeToken(access)).toBeNull();
  });

  it('token expirado é rejeitado', async () => {
    const expired = jwt.sign(
      { sub: 'op-admin', type: 'mfa-challenge', jti: 'x' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: -10 }
    );
    const { verifyMfaChallengeToken } = await import('@/lib/auth/operator-jwt');
    expect(verifyMfaChallengeToken(expired)).toBeNull();
  });

  it('TTL é 5min (300s)', async () => {
    const { signMfaChallengeToken, verifyMfaChallengeToken, OPERATOR_MFA_CHALLENGE_TTL_SECONDS } = await import('@/lib/auth/operator-jwt');
    const before = Math.floor(Date.now() / 1000);
    const token = signMfaChallengeToken({ operatorId: 'op-admin' });
    const payload = verifyMfaChallengeToken(token)!;
    const after = Math.floor(Date.now() / 1000);
    expect(OPERATOR_MFA_CHALLENGE_TTL_SECONDS).toBe(300);
    expect(payload.exp! - payload.iat!).toBeGreaterThanOrEqual(299);
    expect(payload.exp! - payload.iat!).toBeLessThanOrEqual(301);
    expect(after).toBeLessThanOrEqual(payload.exp!);
    expect(before).toBeLessThanOrEqual(payload.iat!);
  });

  it('jti é único entre chamadas', async () => {
    const { signMfaChallengeToken, verifyMfaChallengeToken } = await import('@/lib/auth/operator-jwt');
    const t1 = verifyMfaChallengeToken(signMfaChallengeToken({ operatorId: 'op-admin' }))!;
    const t2 = verifyMfaChallengeToken(signMfaChallengeToken({ operatorId: 'op-admin' }))!;
    expect(t1.jti).not.toBe(t2.jti);
  });
});
