import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe('GET /api/onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar 400 quando userId ausente (sem searchParams)', async () => {
    const { GET } = await import('@/app/api/onboarding/route');
    
    const request = new NextRequest('http://localhost/api/onboarding');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('userId is required');
  });

  it('deve retornar 404 quando usuário não encontrado', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const { GET } = await import('@/app/api/onboarding/route');
    
    const request = new NextRequest('http://localhost/api/onboarding?userId= nonexist-user');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('User not found');
  });

  it('deve retornar step 1 quando apenas nomeCompleto está preenchido', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user123',
      nomeCompleto: 'Maria da Silva',
      dataNascimento: null,
      horaNascimento: null,
      localNascimento: null,
    } as any);

    const { GET } = await import('@/app/api/onboarding/route');
    
    const request = new NextRequest('http://localhost/api/onboarding?userId=user123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.step).toBe(1);
    expect(data.data.hasName).toBe(true);
    expect(data.data.hasBirthDate).toBe(false);
    expect(data.data.hasBirthTime).toBe(false);
    expect(data.data.hasBirthLocation).toBe(false);
  });

  it('deve retornar step 2 quando dataNascimento está preenchido', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user123',
      nomeCompleto: 'Maria da Silva',
      dataNascimento: new Date('1990-05-15'),
      horaNascimento: null,
      localNascimento: null,
    } as any);

    const { GET } = await import('@/app/api/onboarding/route');
    
    const request = new NextRequest('http://localhost/api/onboarding?userId=user123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.step).toBe(2);
    expect(data.data.hasName).toBe(true);
    expect(data.data.hasBirthDate).toBe(true);
    expect(data.data.hasBirthTime).toBe(false);
    expect(data.data.hasBirthLocation).toBe(false);
  });

  it('deve retornar step 3 quando horaNascimento está preenchido', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user123',
      nomeCompleto: 'Maria da Silva',
      dataNascimento: new Date('1990-05-15'),
      horaNascimento: '14:30',
      localNascimento: null,
    } as any);

    const { GET } = await import('@/app/api/onboarding/route');
    
    const request = new NextRequest('http://localhost/api/onboarding?userId=user123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.step).toBe(3);
    expect(data.data.hasName).toBe(true);
    expect(data.data.hasBirthDate).toBe(true);
    expect(data.data.hasBirthTime).toBe(true);
    expect(data.data.hasBirthLocation).toBe(false);
  });

  it('deve retornar step 4 quando localNascimento está preenchido', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user123',
      nomeCompleto: 'Maria da Silva',
      dataNascimento: new Date('1990-05-15'),
      horaNascimento: '14:30',
      localNascimento: 'São Paulo, SP, Brasil',
    } as any);

    const { GET } = await import('@/app/api/onboarding/route');
    
    const request = new NextRequest('http://localhost/api/onboarding?userId=user123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.step).toBe(4);
    expect(data.data.hasName).toBe(true);
    expect(data.data.hasBirthDate).toBe(true);
    expect(data.data.hasBirthTime).toBe(true);
    expect(data.data.hasBirthLocation).toBe(true);
  });
});

describe('POST /api/onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar 400 quando userId ausente', async () => {
    const { POST } = await import('@/app/api/onboarding/route');
    
    const request = new NextRequest('http://localhost/api/onboarding', {
      method: 'POST',
      body: JSON.stringify({
        step: 0,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request body');
  });

  it('deve retornar 400 quando step é negativo', async () => {
    const { POST } = await import('@/app/api/onboarding/route');
    
    const request = new NextRequest('http://localhost/api/onboarding', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user123',
        step: -1,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request body');
  });

  it('deve retornar 400 quando step não é inteiro', async () => {
    const { POST } = await import('@/app/api/onboarding/route');
    
    const request = new NextRequest('http://localhost/api/onboarding', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user123',
        step: 1.5,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request body');
  });

  it('deve retornar 404 para usuário não encontrado com dados válidos', async () => {
    const { POST } = await import('@/app/api/onboarding/route');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    
    const request = new NextRequest('http://localhost/api/onboarding', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user123',
        step: 0,
        data: {},
      }),
    });

    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(404);
    expect(data.error).toBe('User not found');
  });

  it('deve retornar 200 e atualizar perfil do usuário com dados válidos', async () => {
    const { prisma } = await import('@/lib/prisma');
    
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user123',
      email: 'maria@example.com',
      nomeCompleto: null,
      dataNascimento: null,
      horaNascimento: null,
      localNascimento: null,
    } as any);

    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user123',
      email: 'maria@example.com',
      nomeCompleto: 'Maria da Silva',
      dataNascimento: null,
      horaNascimento: null,
      localNascimento: null,
    } as any);

    const { POST } = await import('@/app/api/onboarding/route');
    
    const request = new NextRequest('http://localhost/api/onboarding', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user123',
        step: 1,
        data: {
          nome: 'Maria da Silva',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.step).toBe(1);
    expect(data.message).toBe('Onboarding data saved successfully');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user123' },
      data: { nomeCompleto: 'Maria da Silva' },
    });
  });

  it('deve retornar 404 quando usuário não encontrado', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const { POST } = await import('@/app/api/onboarding/route');
    
    const request = new NextRequest('http://localhost/api/onboarding', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'nonexist-user',
        step: 0,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('User not found');
  });

  it('deve retornar 500 em erro de banco de dados', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('P1001: Database error'));

    const { GET } = await import('@/app/api/onboarding/route');
    
    const request = new NextRequest('http://localhost/api/onboarding?userId=user123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});