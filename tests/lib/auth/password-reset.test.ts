// tests/lib/auth/password-reset.test.ts
// Testes unitários para PasswordResetService — Fase 25.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPasswordResetTokenDeleteMany = vi.fn();
const mockPasswordResetTokenCreate = vi.fn();
const mockPasswordResetTokenFindUnique = vi.fn();
const mockPasswordResetTokenUpdate = vi.fn();
const mockOperatorUpdate = vi.fn();
const mockTransaction = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    passwordResetToken: {
      deleteMany: mockPasswordResetTokenDeleteMany,
      create: mockPasswordResetTokenCreate,
      findUnique: mockPasswordResetTokenFindUnique,
      update: mockPasswordResetTokenUpdate,
      updateMany: vi.fn(),
    },
    operator: {
      update: mockOperatorUpdate,
    },
    $transaction: mockTransaction,
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ---------------------------------------------------------------------------
// hashToken
// ---------------------------------------------------------------------------

describe('hashToken', () => {
  it('retorna SHA-256 em hex', async () => {
    const { hashToken } = await import('@/lib/auth/password-reset');
    expect(hashToken('a'.repeat(64))).toHaveLength(64);
    expect(hashToken('a'.repeat(64))).toMatch(/^[0-9a-f]{64}$/);
  });

  it('mesmo token gera mesmo hash (determinístico)', async () => {
    const { hashToken } = await import('@/lib/auth/password-reset');
    const token = makeValidToken();
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it('tokens diferentes geram hashes diferentes', async () => {
    const { hashToken } = await import('@/lib/auth/password-reset');
    expect(hashToken(makeValidToken())).not.toBe(hashToken(makeValidToken()));
  });
});

// ---------------------------------------------------------------------------
// generateResetToken
// ---------------------------------------------------------------------------

describe('generateResetToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPasswordResetTokenDeleteMany.mockResolvedValue({ count: 0 });
    mockPasswordResetTokenCreate.mockResolvedValue({
      id: 'rt-1',
      operatorId: 'op-1',
      tokenHash: 'hash',
      expiresAt: new Date(),
      usedAt: null,
      createdAt: new Date(),
    });
  });

  it('retorna raw token de 64 hex chars', async () => {
    const { generateResetToken } = await import('@/lib/auth/password-reset');
    const raw = await generateResetToken('op-1');
    expect(raw).toHaveLength(64);
    expect(raw).toMatch(/^[0-9a-f]{64}$/);
  });

  it('apaga tokens pendentes anteriores', async () => {
    mockPasswordResetTokenDeleteMany.mockResolvedValue({ count: 1 });
    const { generateResetToken } = await import('@/lib/auth/password-reset');
    await generateResetToken('op-1');
    expect(mockPasswordResetTokenDeleteMany).toHaveBeenCalledWith({
      where: { operatorId: 'op-1', usedAt: null },
    });
  });

  it('cria token com expiresAt de 1h', async () => {
    const before = Date.now();
    const { generateResetToken } = await import('@/lib/auth/password-reset');
    await generateResetToken('op-1');
    const after = Date.now();

    const call = mockPasswordResetTokenCreate.mock.calls[0];
    const expiresAt = call[0].data.expiresAt as Date;
    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + 60 * 60 * 1000 - 2000);
    expect(expiresAt.getTime()).toBeLessThanOrEqual(after + 60 * 60 * 1000 + 2000);
  });
});

// ---------------------------------------------------------------------------
// validateResetToken
// ---------------------------------------------------------------------------

describe('validateResetToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function validRecord(tokenHash: string) {
    return {
      id: 'rt-1',
      operatorId: 'op-valid',
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      usedAt: null,
      createdAt: new Date(),
    };
  }

  it('retorna operatorId para token válido', async () => {
    const { hashToken } = await import('@/lib/auth/password-reset');
    const token = makeValidToken();
    mockPasswordResetTokenFindUnique.mockResolvedValue(validRecord(hashToken(token)));

    const { validateResetToken } = await import('@/lib/auth/password-reset');
    expect(await validateResetToken(token)).toEqual({ operatorId: 'op-valid' });
  });

  it('retorna null para token inexistente', async () => {
    mockPasswordResetTokenFindUnique.mockResolvedValue(null);
    const { validateResetToken } = await import('@/lib/auth/password-reset');
    expect(await validateResetToken(makeValidToken())).toBeNull();
  });

  it('retorna null para token expirado', async () => {
    const { hashToken } = await import('@/lib/auth/password-reset');
    mockPasswordResetTokenFindUnique.mockResolvedValue({
      ...validRecord(hashToken(makeValidToken())),
      expiresAt: new Date(Date.now() - 1000),
    });
    const { validateResetToken } = await import('@/lib/auth/password-reset');
    expect(await validateResetToken(makeValidToken())).toBeNull();
  });

  it('retorna null para token já usado', async () => {
    const { hashToken } = await import('@/lib/auth/password-reset');
    mockPasswordResetTokenFindUnique.mockResolvedValue({
      ...validRecord(hashToken(makeValidToken())),
      usedAt: new Date(Date.now() - 1000),
    });
    const { validateResetToken } = await import('@/lib/auth/password-reset');
    expect(await validateResetToken(makeValidToken())).toBeNull();
  });

  it('retorna null para token vazio', async () => {
    const { validateResetToken } = await import('@/lib/auth/password-reset');
    expect(await validateResetToken('')).toBeNull();
  });

  it('retorna null para token undefined', async () => {
    const { validateResetToken } = await import('@/lib/auth/password-reset');
    expect(await validateResetToken(undefined as unknown as string)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// resetPassword
// ---------------------------------------------------------------------------

describe('resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(async (ops) => {
      return (ops as never[]).map(() => ({}));
    });
  });

  it('retorna ok=true com token e senha válidos', async () => {
    const { hashToken } = await import('@/lib/auth/password-reset');
    const token = makeValidToken();
    mockPasswordResetTokenFindUnique.mockResolvedValue({
      id: 'rt-1',
      operatorId: 'op-123',
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      usedAt: null,
      createdAt: new Date(),
    });
    mockOperatorUpdate.mockResolvedValue({});
    mockPasswordResetTokenUpdate.mockResolvedValue({});

    const { resetPassword } = await import('@/lib/auth/password-reset');
    const result = await resetPassword(token, 'NovaSenha123!');

    expect(result).toEqual({ ok: true });
    expect(mockTransaction).toHaveBeenCalled();
  });

  it('retorna reason=invalid-token para token inexistente', async () => {
    mockPasswordResetTokenFindUnique.mockResolvedValue(null);
    const { resetPassword } = await import('@/lib/auth/password-reset');
    expect(await resetPassword(makeValidToken(), 'NovaSenha123!')).toEqual({
      ok: false,
      reason: 'invalid-token',
    });
  });

  it('retorna reason=expired para token expirado', async () => {
    const { hashToken } = await import('@/lib/auth/password-reset');
    const token = makeValidToken();
    mockPasswordResetTokenFindUnique.mockResolvedValue({
      id: 'rt-expired',
      operatorId: 'op-123',
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
      createdAt: new Date(),
    });

    const { resetPassword } = await import('@/lib/auth/password-reset');
    expect(await resetPassword(token, 'NovaSenha123!')).toEqual({
      ok: false,
      reason: 'expired',
    });
  });

  it('retorna reason=used para token já usado', async () => {
    const { hashToken } = await import('@/lib/auth/password-reset');
    const token = makeValidToken();
    mockPasswordResetTokenFindUnique.mockResolvedValue({
      id: 'rt-used',
      operatorId: 'op-123',
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      usedAt: new Date(Date.now() - 1000),
      createdAt: new Date(),
    });

    const { resetPassword } = await import('@/lib/auth/password-reset');
    expect(await resetPassword(token, 'NovaSenha123!')).toEqual({
      ok: false,
      reason: 'used',
    });
  });

  it('retorna reason=invalid-token para senha curta', async () => {
    const { resetPassword } = await import('@/lib/auth/password-reset');
    expect(await resetPassword(makeValidToken(), 'curta')).toEqual({
      ok: false,
      reason: 'invalid-token',
    });
  });

  it('retorna reason=invalid-token para senha vazia', async () => {
    const { resetPassword } = await import('@/lib/auth/password-reset');
    expect(await resetPassword(makeValidToken(), '')).toEqual({
      ok: false,
      reason: 'invalid-token',
    });
  });
});
