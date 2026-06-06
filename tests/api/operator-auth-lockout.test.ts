// tests/api/operator-auth-lockout.test.ts
// Integração — Account Lockout Bypass Prevention (Fase 56).
// Testa que operators bloqueados NÃO conseguem usar:
//   - POST /api/operator/auth/refresh          (423)
//   - POST /api/operator/auth/mfa/disable     (423)
//   - POST /api/operator/auth/mfa/verify      (423)
//   - POST /api/operator/auth/mfa/recovery-code (423)
// E que login com credenciais corretas limpa tentativas falhas.

process.env.AUTH_RL_LOGIN_MAX = '10000';
process.env.AUTH_RL_REFRESH_MAX = '10000';
process.env.MFA_ENCRYPTION_KEY = 'a'.repeat(64);
process.env.ALLOW_DEV_AUTH_BYPASS = 'true';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const TEST_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-that-is-at-least-32-bytes-long';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

// bcryptjs — mockado para evitar custo real de hashing nos testes
const mockBcryptHash = vi.fn();
const mockBcryptCompare = vi.fn();
vi.mock('bcryptjs', () => {
  const hash = (...args: unknown[]) => mockBcryptHash(...args);
  const compare = (...args: unknown[]) => mockBcryptCompare(...args);
  return { default: { hash, compare }, hash, compare };
});

// audit-service — mockar para evitar console.error (login firing-and-forget)
const mockLogSecurityEvent = vi.fn();
vi.mock('@/lib/auth/audit-service', () => ({
  logSecurityEvent: (...args: unknown[]) => mockLogSecurityEvent(...args),
}));

// account-lockout — mockar isLocked/isLockedById usado nas rotas (incl. dynamic import)
const mockIsLocked = vi.fn();
const mockIsLockedById = vi.fn();
const mockRecordFailedAttempt = vi.fn();
const mockRecordSuccessfulLogin = vi.fn();
vi.mock('@/lib/auth/account-lockout', () => ({
  isLocked: (...args: unknown[]) => mockIsLocked(...args),
  isLockedById: (...args: unknown[]) => mockIsLockedById(...args),
  recordFailedAttempt: (...args: unknown[]) => mockRecordFailedAttempt(...args),
  recordSuccessfulLogin: (...args: unknown[]) => mockRecordSuccessfulLogin(...args),
}));

// Prisma mock — inclui operatorSession.findMany/updateMany usados por rotateRefreshToken
const mockOperatorFindUnique = vi.fn();
const mockOperatorMfaFindUnique = vi.fn();
const mockOperatorSessionFindUnique = vi.fn();
const mockOperatorSessionCreate = vi.fn();
const mockOperatorSessionFindMany = vi.fn();
const mockOperatorSessionUpdateMany = vi.fn();
const mockOperatorMfaUpsert = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: {
      findUnique: (...args: unknown[]) => mockOperatorFindUnique(...args),
    },
    operatorMfa: {
      findUnique: (...args: unknown[]) => mockOperatorMfaFindUnique(...args),
      upsert: (...args: unknown[]) => mockOperatorMfaUpsert(...args),
    },
    operatorSession: {
      findUnique: (...args: unknown[]) => mockOperatorSessionFindUnique(...args),
      create: (...args: unknown[]) => mockOperatorSessionCreate(...args),
      findMany: (...args: unknown[]) => mockOperatorSessionFindMany(...args),
      updateMany: (...args: unknown[]) => mockOperatorSessionUpdateMany(...args),
    },
  },
}));

// Cookie store mockado
const cookieStore: { current: Record<string, string> } = { current: {} };
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const v = cookieStore.current[name];
      return v ? { name, value: v } : undefined;
    },
  })),
  headers: vi.fn(async () => ({
    get: () => null,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.current = {};

  // bcrypt mock: password123 → hashed:password123
  mockBcryptHash.mockImplementation(async (pw: string) => `hashed:${pw}`);
  mockBcryptCompare.mockImplementation(async (pw: string, hash: string) => hash === `hashed:${pw}`);

  // Default: operador não bloqueado
  mockIsLocked.mockResolvedValue({ locked: false });
  mockIsLockedById.mockResolvedValue({ locked: false });
  mockRecordFailedAttempt.mockResolvedValue(undefined);
  mockRecordSuccessfulLogin.mockResolvedValue(undefined);
  mockLogSecurityEvent.mockResolvedValue(undefined);

  // Reset find mocks — cada teste configura explicitamente
  mockOperatorFindUnique.mockReset();
  mockOperatorMfaFindUnique.mockReset();
  mockOperatorSessionFindUnique.mockReset();
  mockOperatorSessionCreate.mockReset();
  mockOperatorSessionFindMany.mockReset();
  mockOperatorSessionUpdateMany.mockReset();
  mockOperatorMfaUpsert.mockReset();

  // Safe defaults
  mockOperatorFindUnique.mockResolvedValue(null);
  mockOperatorMfaFindUnique.mockResolvedValue(null);
  mockOperatorSessionFindUnique.mockResolvedValue(null);
  mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-1' });
  mockOperatorSessionFindMany.mockResolvedValue([]);
  mockOperatorSessionUpdateMany.mockResolvedValue({ count: 0 });
  mockOperatorMfaUpsert.mockResolvedValue({});
});

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const LOCKED_UNTIL = new Date(Date.now() + 30 * 60 * 1000); // 30min ahead

/** Operador com lockout ativo (failedLoginAttempts >= 5, lockedUntil futuro) */
function lockedOperatorRecord(id = 'op-locked', email = 'locked@cabala.com') {
  return {
    id,
    email,
    name: 'Locked Operator',
    passwordHash: 'hashed:password123', // matches bcrypt mock
    role: 'OPERATOR' as const,
    failedLoginAttempts: 5,
    lockedUntil: LOCKED_UNTIL,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

/** Operador desbloqueado (para testes de login com credenciais corretas) */
function unlockedOperatorRecord(id = 'op-normal', email = 'normal@cabala.com') {
  return {
    id,
    email,
    name: 'Normal Operator',
    passwordHash: 'hashed:password123', // matches bcrypt mock
    role: 'OPERATOR' as const,
    failedLoginAttempts: 0,
    lockedUntil: null as Date | null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

function makeJsonPost(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeJsonPostWithCookie(url: string, body: unknown, cookie: string): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `cockpit_session=${cookie}`,
    },
    body: JSON.stringify(body),
  });
}

// ============================================================================
// POST /api/operator/auth/refresh — locked operator → 423
// ============================================================================

describe('POST /api/operator/auth/refresh (locked operator)', () => {
  it('retorna 423 quando operator está bloqueado (Fase 56)', async () => {
    mockIsLockedById.mockResolvedValue({ locked: true, until: LOCKED_UNTIL });

    const refreshToken = jwt.sign(
      { sub: 'op-locked', role: 'OPERATOR', type: 'refresh' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_refresh: refreshToken };

    const { POST } = await import('@/app/api/operator/auth/refresh/route');
    const res = await POST(makeJsonPostWithCookie(
      'http://test/api/operator/auth/refresh',
      {},
      refreshToken
    ));

    expect(res.status).toBe(423);
    const body = await res.json();
    expect(body.error).toMatch(/bloqueada/i);
    expect(body.lockedUntil).toBeDefined();
    // Cookies devem ser limpos
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toMatch(/cockpit_session=;/);
    expect(setCookie).toMatch(/cockpit_refresh=;/);
  });

  it('isLockedById é chamado com o operatorId do refresh token (Fase 56)', async () => {
    mockIsLockedById.mockResolvedValue({ locked: false });

    const refreshToken = jwt.sign(
      { sub: 'op-normal', role: 'OPERATOR', type: 'refresh' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_refresh: refreshToken };

    // mockFindUnique para rotateRefreshToken
    mockOperatorSessionFindUnique.mockResolvedValue({
      id: 'sess-1',
      tokenHash: 'hash',
      operatorId: 'op-normal',
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    });
    mockOperatorFindUnique
      .mockResolvedValueOnce({ id: 'op-normal', role: 'OPERATOR' })   // rotateRefreshToken internal
      .mockResolvedValueOnce({                                         // post-rotation lookup
        id: 'op-normal',
        email: 'normal@cabala.com',
        name: 'Normal',
        role: 'OPERATOR',
      });

    const { POST } = await import('@/app/api/operator/auth/refresh/route');
    await POST(makeJsonPostWithCookie(
      'http://test/api/operator/auth/refresh',
      {},
      refreshToken
    ));

    expect(mockIsLockedById).toHaveBeenCalledWith('op-normal');
  });
});

// ============================================================================
// POST /api/operator/auth/mfa/disable — locked operator → 423
// ============================================================================

describe('POST /api/operator/auth/mfa/disable (locked operator)', () => {
  it('retorna 423 quando operator está bloqueado (Fase 56)', async () => {
    mockIsLockedById.mockResolvedValue({ locked: true, until: LOCKED_UNTIL });
    // loadOperator via dev header → prisma.operator.findUnique
    mockOperatorFindUnique.mockResolvedValue(lockedOperatorRecord());

    const { POST } = await import('@/app/api/operator/auth/mfa/disable/route');
    const res = await POST(
      new NextRequest('http://test/api/operator/auth/mfa/disable', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-dev-operator-id': 'op-locked',
        },
        body: JSON.stringify({ password: 'password123' }),
      })
    );

    expect(res.status).toBe(423);
    const body = await res.json();
    expect(body.error).toMatch(/bloqueada/i);
    expect(body.lockedUntil).toBeDefined();
  });

  it('isLockedById é chamado após requireOperatorApi (Fase 56)', async () => {
    mockIsLockedById.mockResolvedValue({ locked: false });
    mockOperatorFindUnique.mockResolvedValue(unlockedOperatorRecord());

    const { POST } = await import('@/app/api/operator/auth/mfa/disable/route');
    await POST(
      new NextRequest('http://test/api/operator/auth/mfa/disable', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-dev-operator-id': 'op-normal',
        },
        body: JSON.stringify({ password: 'password123' }),
      })
    );

    expect(mockIsLockedById).toHaveBeenCalledWith('op-normal');
  });
});

// ============================================================================
// POST /api/operator/auth/mfa/verify — locked operator → 423
// ============================================================================

describe('POST /api/operator/auth/mfa/verify (locked operator)', () => {
  it('retorna 423 quando operator está bloqueado (Fase 56)', async () => {
    mockIsLockedById.mockResolvedValue({ locked: true, until: LOCKED_UNTIL });

    const mfaToken = jwt.sign(
      { sub: 'op-locked', type: 'mfa-challenge', jti: 'challenge-1' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: 300 }
    );

    const { POST } = await import('@/app/api/operator/auth/mfa/verify/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/verify', {
      mfaToken,
      code: '123456',
    }));

    expect(res.status).toBe(423);
    const body = await res.json();
    expect(body.error).toMatch(/bloqueada/i);
    expect(body.lockedUntil).toBeDefined();
  });

  it('lockout é verificado ANTES da validação MFA (Fase 56)', async () => {
    // Com locked=true, esperamos 423 mesmo que o código MFA fosse válido.
    // Prova que a verificação de lockout ocorre antes de consumeMfaChallenge.
    mockIsLockedById.mockResolvedValue({ locked: true, until: LOCKED_UNTIL });

    const mfaToken = jwt.sign(
      { sub: 'op-locked', type: 'mfa-challenge', jti: 'challenge-2' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: 300 }
    );

    const { POST } = await import('@/app/api/operator/auth/mfa/verify/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/verify', {
      mfaToken,
      code: '000000', // código inválido — MAS 423 vem antes da validação MFA
    }));

    // 423 do lockout (não 401 do MFA inválido) — prova ordem de verificação
    expect(res.status).toBe(423);
  });

  it('isLockedById é chamado com sub do mfaToken (Fase 56)', async () => {
    mockIsLockedById.mockResolvedValue({ locked: false });

    const mfaToken = jwt.sign(
      { sub: 'op-normal', type: 'mfa-challenge', jti: 'challenge-n' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: 300 }
    );

    const { POST } = await import('@/app/api/operator/auth/mfa/verify/route');
    await POST(makeJsonPost('http://test/api/operator/auth/mfa/verify', {
      mfaToken,
      code: '123456',
    }));

    expect(mockIsLockedById).toHaveBeenCalledWith('op-normal');
  });
});

// ============================================================================
// POST /api/operator/auth/mfa/recovery-code — locked operator → 423
// ============================================================================

describe('POST /api/operator/auth/mfa/recovery-code (locked operator)', () => {
  it('retorna 423 quando operator está bloqueado (Fase 56)', async () => {
    mockIsLockedById.mockResolvedValue({ locked: true, until: LOCKED_UNTIL });

    const mfaToken = jwt.sign(
      { sub: 'op-locked', type: 'mfa-challenge', jti: 'challenge-3' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: 300 }
    );

    const { POST } = await import('@/app/api/operator/auth/mfa/recovery-code/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/recovery-code', {
      mfaToken,
      code: 'a1b2c3d4e5f67890', // 16-char hex recovery code
    }));

    expect(res.status).toBe(423);
    const body = await res.json();
    expect(body.error).toMatch(/bloqueada/i);
    expect(body.lockedUntil).toBeDefined();
  });

  it('lockout é verificado ANTES da validação recovery code (Fase 56)', async () => {
    mockIsLockedById.mockResolvedValue({ locked: true, until: LOCKED_UNTIL });

    const mfaToken = jwt.sign(
      { sub: 'op-locked', type: 'mfa-challenge', jti: 'challenge-4' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: 300 }
    );

    const { POST } = await import('@/app/api/operator/auth/mfa/recovery-code/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/mfa/recovery-code', {
      mfaToken,
      code: '0000000000000000', // recovery code inválido — MAS 423 vem antes
    }));

    // 423 do lockout (não 400 do formato inválido) — lockout é verificado primeiro
    expect(res.status).toBe(423);
  });
});

// ============================================================================
// Successful login — clears failed attempts + fires LOGIN_SUCCESS
// ============================================================================

describe('Successful login clears failed attempts (Fase 56)', () => {
  it('login com credenciais corretas chama recordSuccessfulLogin', async () => {
    const operator = unlockedOperatorRecord('op-unlock', 'unlock@cabala.com');
    mockOperatorFindUnique.mockResolvedValue(operator);
    mockOperatorMfaFindUnique.mockResolvedValue(null); // sem MFA
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-unlock' });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/login', {
      email: 'unlock@cabala.com',
      password: 'password123',
    }));

    expect(res.status).toBe(200);
    expect(mockRecordSuccessfulLogin).toHaveBeenCalledWith('unlock@cabala.com');
  });

  it('login com credenciais corretas dispara LOGIN_SUCCESS', async () => {
    const operator = unlockedOperatorRecord('op-success', 'success@cabala.com');
    mockOperatorFindUnique.mockResolvedValue(operator);
    mockOperatorMfaFindUnique.mockResolvedValue(null);
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-success' });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/login', {
      email: 'success@cabala.com',
      password: 'password123',
    }));

    expect(res.status).toBe(200);
    expect(mockLogSecurityEvent).toHaveBeenCalled();
    const eventCall = mockLogSecurityEvent.mock.calls.find(
      (call: unknown[]) => (call[0] as { type?: string })?.type === 'LOGIN_SUCCESS'
    );
    expect(eventCall).toBeDefined();
    expect((eventCall[0] as { operatorId: string }).operatorId).toBe('op-success');
  });

  it('login com credenciais corretas retorna operator sem passwordHash', async () => {
    const operator = unlockedOperatorRecord('op-clean', 'clean@cabala.com');
    mockOperatorFindUnique.mockResolvedValue(operator);
    mockOperatorMfaFindUnique.mockResolvedValue(null);
    mockOperatorSessionCreate.mockResolvedValue({ id: 'sess-clean' });

    const { POST } = await import('@/app/api/operator/auth/login/route');
    const res = await POST(makeJsonPost('http://test/api/operator/auth/login', {
      email: 'clean@cabala.com',
      password: 'password123',
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.operator.passwordHash).toBeUndefined();
    expect(body.operator.id).toBe('op-clean');
  });
});

// ============================================================================
// Unlocked operator — bypass routes work normally
// ============================================================================

describe('Unlocked operator — bypass routes work normally (Fase 56)', () => {
  it('refresh funciona para operador desbloqueado (não retorna 423)', async () => {
    mockIsLockedById.mockResolvedValue({ locked: false });

    const refreshToken = jwt.sign(
      { sub: 'op-normal', role: 'OPERATOR', type: 'refresh' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_refresh: refreshToken };

    mockOperatorSessionFindUnique.mockResolvedValue({
      id: 'sess-1',
      tokenHash: 'hash',
      operatorId: 'op-normal',
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    });
    mockOperatorFindUnique
      .mockResolvedValueOnce({ id: 'op-normal', role: 'OPERATOR' })
      .mockResolvedValueOnce({
        id: 'op-normal',
        email: 'normal@cabala.com',
        name: 'Normal',
        role: 'OPERATOR',
      });

    const { POST } = await import('@/app/api/operator/auth/refresh/route');
    const res = await POST(makeJsonPostWithCookie(
      'http://test/api/operator/auth/refresh',
      {},
      refreshToken
    ));

    // Não deve retornar 423 (lockout)
    expect(res.status).not.toBe(423);
  });

  it('lockedUntil é retornado como string ISO no body 423 (serialização JSON)', async () => {
    // JSON.stringify serializa Date como string ISO, então o body contém string
    const futureLock = new Date(Date.now() + 15 * 60 * 1000); // 15min
    mockIsLockedById.mockResolvedValue({ locked: true, until: futureLock });

    const refreshToken = jwt.sign(
      { sub: 'op-locked', role: 'OPERATOR', type: 'refresh' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_refresh: refreshToken };

    const { POST } = await import('@/app/api/operator/auth/refresh/route');
    const res = await POST(makeJsonPostWithCookie(
      'http://test/api/operator/auth/refresh',
      {},
      refreshToken
    ));

    expect(res.status).toBe(423);
    const body = await res.json();
    // lockedUntil vem como string ISO após JSON serialization
    expect(body.lockedUntil).toBeDefined();
    expect(typeof body.lockedUntil).toBe('string');
    const bodyDate = new Date(body.lockedUntil);
    const diff = Math.abs(bodyDate.getTime() - futureLock.getTime());
    expect(diff).toBeLessThan(5000); // dentro de 5s
  });
});
