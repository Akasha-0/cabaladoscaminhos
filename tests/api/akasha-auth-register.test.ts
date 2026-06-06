import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockBcryptHash = vi.fn();

vi.mock('bcryptjs', () => {
  const hash = (...args: unknown[]) => mockBcryptHash(...args);
  return { default: { hash }, hash };
});

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    akashaUser: {
      findUnique: (args: unknown) => mockFindUnique(args),
      create: (args: unknown) => mockCreate(args),
    },
  },
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
  fullName: 'Nome Completo',
  birthDate: '2000-01-02',
  birthTime: '10:30',
  birthCity: 'São Paulo',
  birthState: 'SP',
  birthCountry: 'Brasil',
  consentGiven: true as const,
};

describe('POST /api/akasha/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBcryptHash.mockResolvedValue('hashed:senha12345');
  });

  it('retorna 400 quando consentGiven está ausente', async () => {
    const { POST } = await import('@/app/api/akasha/auth/register/route');
    const { consentGiven: _consentGiven, ...withoutConsent } = validBody;
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/register', withoutConsent));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Dados inválidos');
  });

  it('retorna 201 genérico quando email já existe (anti-enumeração)', async () => {
    mockFindUnique.mockResolvedValue({ id: 'user-1' });
    const { POST } = await import('@/app/api/akasha/auth/register/route');
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/register', validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.message).toMatch(/Conta criada/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('cria usuário e retorna 201 quando payload é válido', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: 'user-1' });
    const { POST } = await import('@/app/api/akasha/auth/register/route');
    const res = await POST(makeJsonRequest('http://l/api/akasha/auth/register', validBody));
    expect(res.status).toBe(201);
    expect(mockBcryptHash).toHaveBeenCalledWith('senha12345', 12);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});

