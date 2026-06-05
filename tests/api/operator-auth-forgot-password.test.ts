// tests/api/operator-auth-forgot-password.test.ts
// Testes para POST /api/operator/auth/forgot-password — Fase 25.

process.env.AUTH_RL_FORGOT_PASSWORD_MAX = '10000';
process.env.AUTH_RL_LOGIN_MAX = '10000';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks (vi.mock é hoisted para o topo)
// ---------------------------------------------------------------------------

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

const mockOperatorFindUnique = vi.fn();
const mockDeleteMany = vi.fn();
const mockCreate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: { findUnique: mockOperatorFindUnique },
    passwordResetToken: {
      deleteMany: mockDeleteMany,
      create: mockCreate,
    },
  },
}));

const mockLogSecurityEvent = vi.fn();
vi.mock('@/lib/auth/audit-service', () => ({
  logSecurityEvent: (...args: unknown[]) => mockLogSecurityEvent(...args),
}));

const mockConsoleInfo = vi.spyOn(console, 'info').mockReturnValue(undefined);

beforeEach(() => {
  vi.clearAllMocks();
  mockLogSecurityEvent.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeJsonRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/operator/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// POST /api/operator/auth/forgot-password
// ---------------------------------------------------------------------------

describe('POST /api/operator/auth/forgot-password', () => {
  it('retorna 200 para email inexistente (silencioso)', async () => {
    mockOperatorFindUnique.mockResolvedValue(null);

    const req = makeJsonRequest({ email: 'naoexiste@test.com' });
    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mockDeleteMany).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('cria token e retorna 200 para email existente', async () => {
    const operator = { id: 'op-123', email: 'admin@test.com', name: 'Admin' };
    mockOperatorFindUnique.mockResolvedValue(operator);
    mockDeleteMany.mockResolvedValue({ count: 0 });
    mockCreate.mockResolvedValue({
      id: 'token-id',
      operatorId: operator.id,
      tokenHash: 'hashed',
      expiresAt: new Date(),
      usedAt: null,
      createdAt: new Date(),
    });

    const req = makeJsonRequest({ email: 'admin@test.com' });
    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const response = await POST(req);

    expect(response.status).toBe(200);
    // deleteMany recebe { where: { operatorId, usedAt: null } }
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { operatorId: operator.id, usedAt: null },
    });
    expect(mockCreate).toHaveBeenCalled();
    expect(mockConsoleInfo).toHaveBeenCalledWith(
      expect.stringContaining('[password-reset] Reset solicitado')
    );
    // Fase 57: PASSWORD_RESET_REQUESTED security event
    expect(mockLogSecurityEvent).toHaveBeenCalled();
    const resetEvent = mockLogSecurityEvent.mock.calls.find(
      (call: unknown[]) => (call[0] as { type?: string })?.type === 'PASSWORD_RESET_REQUESTED'
    );
    expect(resetEvent).toBeDefined();
    expect((resetEvent[0] as { operatorId: string }).operatorId).toBe(operator.id);
  });

  it('NÃO loga PASSWORD_RESET_REQUESTED quando email não existe', async () => {
    mockOperatorFindUnique.mockResolvedValue(null);

    const req = makeJsonRequest({ email: 'naoexiste@test.com' });
    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const response = await POST(req);

    expect(response.status).toBe(200);
    const resetEvent = mockLogSecurityEvent.mock.calls.find(
      (call: unknown[]) => (call[0] as { type?: string })?.type === 'PASSWORD_RESET_REQUESTED'
    );
    expect(resetEvent).toBeUndefined();
  });

  it('normaliza email para lowercase antes da busca', async () => {
    const operator = { id: 'op-456', email: 'admin@test.com', name: 'Admin' };
    mockOperatorFindUnique.mockResolvedValue(operator);
    mockDeleteMany.mockResolvedValue({ count: 0 });
    mockCreate.mockResolvedValue({
      id: 'token-id',
      operatorId: operator.id,
      tokenHash: 'hashed',
      expiresAt: new Date(),
      usedAt: null,
      createdAt: new Date(),
    });

    const req = makeJsonRequest({ email: '  ADMIN@TEST.COM  ' });
    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mockOperatorFindUnique).toHaveBeenCalledWith({
      where: { email: 'admin@test.com' },
      select: { id: true, email: true, name: true },
    });
  });

  it('retorna 400 para email mal formatado', async () => {
    const req = makeJsonRequest({ email: 'não-é-email' });
    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it('retorna 400 quando corpo é vazio', async () => {
    const req = new NextRequest('http://localhost/api/operator/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '',
    });
    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it('retorna 400 quando corpo é JSON inválido', async () => {
    const req = new NextRequest('http://localhost/api/operator/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it('retorna 400 quando email está ausente', async () => {
    const req = makeJsonRequest({});
    const { POST } = await import('@/app/api/operator/auth/forgot-password/route');
    const response = await POST(req);

    expect(response.status).toBe(400);
  });
});
