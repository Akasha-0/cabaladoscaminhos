import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

// Mock do akasha-guard
const mockRequireAkashaApi = vi.fn();

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: mockRequireAkashaApi,
}));

// Mock do prisma
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
};

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: mockPrisma,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAkashaApi.mockResolvedValue({ id: 'user-123', email: 'test@test.com', name: 'Test User' });
  mockPrisma.user.findUnique.mockResolvedValue({ ichingEnabled: false, ichingMap: null });
});

// ----------------------------------------------------------------------------
// POST /api/akasha/chat
// ----------------------------------------------------------------------------

describe('POST /api/akasha/chat', () => {
  it('retorna 401 quando usuário não autenticado', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(
      new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    );

    const { POST } = await import('@/app/api/akasha/chat/route');
    const req = new Request('http://localhost/api/akasha/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Olá mentor' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('retorna 400 quando message está vazia', async () => {
    const { POST } = await import('@/app/api/akasha/chat/route');
    const req = new Request('http://localhost/api/akasha/chat', {
      method: 'POST',
      body: JSON.stringify({ message: '' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('retorna 400 quando body é inválido', async () => {
    const { POST } = await import('@/app/api/akasha/chat/route');
    const req = new Request('http://localhost/api/akasha/chat', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('retorna 400 para intent inválido', async () => {
    const { POST } = await import('@/app/api/akasha/chat/route');
    const req = new Request('http://localhost/api/akasha/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Olá', intent: 'invalid' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('retorna 200 com resposta do mentor (integração)', async () => {
    const { POST } = await import('@/app/api/akasha/chat/route');
    const req = new Request('http://localhost/api/akasha/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Olá mentor' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('message');
    expect(typeof body.message).toBe('string');
  });
});

// ----------------------------------------------------------------------------
// POST /api/akasha/chat/practice
// ----------------------------------------------------------------------------

describe('POST /api/akasha/chat/practice', () => {
  it('retorna 401 quando usuário não autenticado', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(
      new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    );

    const { POST } = await import('@/app/api/akasha/chat/practice/route');
    const req = new Request('http://localhost/api/akasha/chat/practice', {
      method: 'POST',
      body: JSON.stringify({ message: 'Sugira práticas' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('retorna 400 quando body é inválido', async () => {
    const { POST } = await import('@/app/api/akasha/chat/practice/route');
    const req = new Request('http://localhost/api/akasha/chat/practice', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('retorna 200 com suggestedPractices (integração)', async () => {
    const { POST } = await import('@/app/api/akasha/chat/practice/route');
    const req = new Request('http://localhost/api/akasha/chat/practice', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('suggestedPractices');
    expect(Array.isArray(body.suggestedPractices)).toBe(true);
  });
});

// ----------------------------------------------------------------------------
// POST /api/akasha/chat/ritual
// ----------------------------------------------------------------------------

describe('POST /api/akasha/chat/ritual', () => {
  it('retorna 401 quando usuário não autenticado', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(
      new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    );

    const { POST } = await import('@/app/api/akasha/chat/ritual/route');
    const req = new Request('http://localhost/api/akasha/chat/ritual', {
      method: 'POST',
      body: JSON.stringify({ message: 'Sugira um ritual' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('retorna 400 quando body é inválido', async () => {
    const { POST } = await import('@/app/api/akasha/chat/ritual/route');
    const req = new Request('http://localhost/api/akasha/chat/ritual', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('retorna 200 com ritual (integração)', async () => {
    const { POST } = await import('@/app/api/akasha/chat/ritual/route');
    const req = new Request('http://localhost/api/akasha/chat/ritual', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('ritual');
  });
});
