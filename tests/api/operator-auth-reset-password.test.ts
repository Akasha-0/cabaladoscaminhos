// tests/api/operator-auth-reset-password.test.ts
// Testes para POST /api/operator/auth/reset-password — Fase 25.

process.env.AUTH_RL_RESET_PASSWORD_MAX = '10000';
process.env.AUTH_RL_LOGIN_MAX = '10000';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn(),
  },
}));

const mockFindUnique = vi.fn();
const mockOperatorUpdate = vi.fn();
const mockTokenUpdate = vi.fn();
const mockTransaction = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    passwordResetToken: {
      findUnique: mockFindUnique,
      update: mockTokenUpdate,
      updateMany: vi.fn(),
    },
    operator: {
      update: mockOperatorUpdate,
    },
    $transaction: mockTransaction,
  },
}));

vi.spyOn(console, 'info').mockReturnValue(undefined);
vi.spyOn(console, 'error').mockReturnValue(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function makeJsonRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/operator/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// POST /api/operator/auth/reset-password
// ---------------------------------------------------------------------------

describe('POST /api/operator/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(async (ops) => {
      return (ops as never[]).map(() => ({}));
    });
  });

  it('retorna 200 e reseta senha com token válido', async () => {
    const token = makeValidToken();
    mockFindUnique.mockResolvedValue({
      id: 'rt-1',
      operatorId: 'op-123',
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      usedAt: null,
      createdAt: new Date(),
    });
    mockOperatorUpdate.mockResolvedValue({});
    mockTokenUpdate.mockResolvedValue({});

    const req = makeJsonRequest({ token, newPassword: 'NovaSenha123!' });
    const { POST } = await import('@/app/api/operator/auth/reset-password/route');
    const response = await POST(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toContain('sucesso');
    expect(mockTransaction).toHaveBeenCalled();
  });

  it('retorna 400 para token inexistente', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = makeJsonRequest({ token: makeValidToken(), newPassword: 'NovaSenha123!' });
    const { POST } = await import('@/app/api/operator/auth/reset-password/route');
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it('retorna 400 com mensagem específica para token expirado', async () => {
    const token = makeValidToken();
    mockFindUnique.mockResolvedValue({
      id: 'rt-expired',
      operatorId: 'op-123',
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
      createdAt: new Date(),
    });

    const req = makeJsonRequest({ token, newPassword: 'NovaSenha123!' });
    const { POST } = await import('@/app/api/operator/auth/reset-password/route');
    const response = await POST(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('expirado');
  });

  it('retorna 400 com mensagem específica para token já usado', async () => {
    const token = makeValidToken();
    mockFindUnique.mockResolvedValue({
      id: 'rt-used',
      operatorId: 'op-123',
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      usedAt: new Date(Date.now() - 1000),
      createdAt: new Date(),
    });

    const req = makeJsonRequest({ token, newPassword: 'NovaSenha123!' });
    const { POST } = await import('@/app/api/operator/auth/reset-password/route');
    const response = await POST(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('já utilizado');
  });

  it('retorna 400 para senha curta', async () => {
    const req = makeJsonRequest({ token: makeValidToken(), newPassword: 'curta' });
    const { POST } = await import('@/app/api/operator/auth/reset-password/route');
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it('retorna 400 para newPassword ausente', async () => {
    const req = makeJsonRequest({ token: makeValidToken() });
    const { POST } = await import('@/app/api/operator/auth/reset-password/route');
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it('retorna 400 para token vazio', async () => {
    const req = makeJsonRequest({ token: '', newPassword: 'NovaSenha123!' });
    const { POST } = await import('@/app/api/operator/auth/reset-password/route');
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it('retorna 400 para newPassword vazia', async () => {
    const req = makeJsonRequest({ token: makeValidToken(), newPassword: '' });
    const { POST } = await import('@/app/api/operator/auth/reset-password/route');
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it('retorna 400 para corpo JSON inválido', async () => {
    const req = new NextRequest('http://localhost/api/operator/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const { POST } = await import('@/app/api/operator/auth/reset-password/route');
    const response = await POST(req);

    expect(response.status).toBe(400);
  });
});
