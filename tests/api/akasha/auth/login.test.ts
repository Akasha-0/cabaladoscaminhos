/**
 * Login Route Tests
 *
 * Tests POST /api/akasha/auth/login — cookie setting, return param,
 * open-redirect protection, and credential validation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/akasha/auth/login/route';

const mockBcryptCompare = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockSign = vi.fn();
const mockDecode = vi.fn();

vi.mock('bcryptjs', () => ({
  default: { compare: (...args: unknown[]) => mockBcryptCompare(...args) },
  compare: (...args: unknown[]) => mockBcryptCompare(...args),
}));

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: (...args: unknown[]) => mockSign(...args),
    decode: (...args: unknown[]) => mockDecode(...args),
  },
  sign: (...args: unknown[]) => mockSign(...args),
  decode: (...args: unknown[]) => mockDecode(...args),
}));

// Wave 12.5 §12.5: mock strict rate-limit so login tests don't hit the 5/min
// limit while iterating through scenarios. Tests of the rate-limit module
// itself live in rate-limit-strict.test.ts and have their own setup.
vi.mock('@/lib/infrastructure/security/rate-limit-strict', () => ({
  STRICT_RATE_LIMIT_CONFIGS: {
    AUTH_LOGIN: { windowMs: 60_000, maxRequests: 5 },
    AUTH_REGISTER: { windowMs: 3_600_000, maxRequests: 3 },
    AUTH_ME: { windowMs: 60_000, maxRequests: 30 },
    MCP: { windowMs: 60_000, maxRequests: 100 },
  },
  checkStrictRateLimit: vi.fn(async () => ({
    allowed: true,
    remaining: 100,
    resetIn: 60_000,
    resetAt: new Date(Date.now() + 60_000),
    limit: 100,
  })),
  buildStrictRateLimitResponse: vi.fn(() => ({
    status: 429,
    body: { error: 'rate limit', scope: 'AUTH_LOGIN', retryAfterSeconds: 60 },
  })),
  extractStrictIdentifier: vi.fn(() => 'mock-id'),
}));

function makeJsonRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validCredentials = { email: 'user@akasha.com', password: 'senha123' };

describe('POST /api/akasha/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBcryptCompare.mockResolvedValue(true);
    mockFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@akasha.com',
      passwordHash: 'hashed',
    });
    mockUpdate.mockResolvedValue({ id: 'user-1' });
    mockSign.mockReturnValue('signed-token');
    mockDecode.mockReturnValue({ jti: 'jti-1' });
  });

  it('retorna 400 quando email é omitido', async () => {
    const { email: _e, ...invalid } = validCredentials;
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/login', invalid));
    expect(res.status).toBe(400);
  });

  it('retorna 400 quando password é omitido', async () => {
    const { password: _p, ...invalid } = validCredentials;
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/login', invalid));
    expect(res.status).toBe(400);
  });

  it('retorna 401 quando usuário não existe', async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/login', validCredentials));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Credenciais inválidas');
  });

  it('retorna 401 quando senha é incorreta', async () => {
    mockBcryptCompare.mockResolvedValue(false);
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/login', validCredentials));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Credenciais inválidas');
  });

  it('retorna 307 redirecionando para /conta quando return param não fornecido', async () => {
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/login', validCredentials));
    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toMatch(/\/conta/);
  });

  it('retorna 307 redirecionando para return param quando fornecido', async () => {
    const req = new NextRequest('http://l/api/akasha/auth/login?return=/dashboard', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validCredentials),
    });
    const res = await POST(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/dashboard');
  });

  it('bloqueia open redirect off-origin (return param não pode escapar do origin)', async () => {
    const req = new NextRequest('http://l/api/akasha/auth/login?return=https://evil.com/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validCredentials),
    });
    const res = await POST(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).not.toContain('evil.com');
    expect(location).toMatch(/\/conta/);
  });

  it('define cookies akasha_session e akasha_refresh no redirect', async () => {
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/login', validCredentials));
    expect(res.status).toBe(307);
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('akasha_session');
    expect(setCookie).toContain('akasha_refresh');
  });

  it('armazena jti do refresh token no banco para rotation tracking', async () => {
    await POST(makeJsonRequest('http://l/api/akasha/auth/login', validCredentials));
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { currentRefreshTokenJti: 'jti-1' },
    });
  });
});
