import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/akasha/auth/register/route';

const mockBcryptHash = vi.fn();
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock('bcryptjs', () => {
  const hash = (...args: unknown[]) => mockBcryptHash(...args);
  return { default: { hash }, hash };
});

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

// Wave 12.5 §12.5: mock strict rate-limit for register tests (auth/register
// now applies 3 req/hour limit). Tests of the rate-limit module itself
// live in rate-limit-strict.test.ts.
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
    body: { error: 'rate limit', scope: 'AUTH_REGISTER', retryAfterSeconds: 3600 },
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

const validBody = {
  email: 'novo@akasha.com',
  password: 'senha12345',
  name: 'Nome Completo',
  birthDate: '2000-01-02',
  birthTime: '10:30',
  birthCity: 'São Paulo',
  birthLatitude: -23.5505,
  birthLongitude: -46.6333,
  birthTimezone: 'America/Sao_Paulo',
  consent: true as const,
};

describe('POST /api/akasha/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBcryptHash.mockResolvedValue('hashed:senha12345');
  });

  it('retorna 400 quando payload é inválido', async () => {
    const { name: _name, consent: _c, ...invalid } = validBody;
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/register', invalid));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Dados inválidos');
  });

  it('retorna 400 quando consent não é true (LGPD)', async () => {
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/register', { ...validBody, consent: false }));
    expect(res.status).toBe(400);
  });

  it('retorna 201 genérico quando email já existe (anti-enumeração)', async () => {
    mockFindUnique.mockResolvedValue({ id: 'user-1' });
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/register', validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.message).toMatch(/Conta criada/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('cria usuário e retorna 201 quando payload é válido (consentAt persistido)', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: 'user-1' });
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/register', validBody));
    expect(res.status).toBe(201);
    expect(mockBcryptHash).toHaveBeenCalledWith('senha12345', 12);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const createCall = mockCreate.mock.calls[0][0] as { data: { consentAt: Date } };
    expect(createCall.data.consentAt).toBeInstanceOf(Date);
  });
});
