import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the spiritual engine
vi.mock('@/lib/engines/spiritual-engine', () => ({
  gerarMapaAlmaCompleto: vi.fn().mockResolvedValue({
    numerologia: {
      numeroVida: 5,
      caminhoDeVida: 5,
      destino: 8,
      alma: 3,
      personalidade: 7,
    },
    odu: {
      numero: 5,
      nome: 'Oxé',
      significado: 'O ouro, a doçura, a feitiçaria',
      orixas: ['Oxum', 'Logun Edé'],
      quizilas: ['ovos', 'comidas muito salgadas ou azedas'],
      preceitos: ['Cuidar da autoestima', 'Usar perfumes'],
    },
    astrologia: {
      sol: { signo: 'Leão', grau: 15 },
      lua: { signo: 'Câncer', grau: 22 },
      ascendente: { signo: 'Escorpião', grau: 8 },
    },
    tarot: {
      cartaNascimento: { numero: 11, nome: 'A Força', significado: 'Coragem e controle' },
      cartaAno: { numero: 7, nome: 'O Carro', significado: 'Vitória e progresso' },
    },
    chakras: {
      dominantes: [4, 6],
      bloqueados: [1],
      praticas: ['meditação', 'afirmações'],
    },
    convergencias: [],
  }),
}));

// Mock Redis
vi.mock('@/lib/redis', () => ({
  getRedisClient: vi.fn().mockResolvedValue({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
  }),
}));

describe('POST /api/mapa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar 200 com mapa completo para dados válidos', async () => {
    const { POST } = await import('@/app/api/mapa/route');
    
    const request = new NextRequest('http://localhost/api/mapa', {
      method: 'POST',
      body: JSON.stringify({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1990-05-15',
        hora: '14:30',
        cidade: 'São Paulo',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('numerologia');
    expect(data).toHaveProperty('odu');
    expect(data).toHaveProperty('astrologia');
    expect(data).toHaveProperty('tarot');
    expect(data).toHaveProperty('chakras');
  });

  it('deve retornar 400 para nome ausente', async () => {
    const { POST } = await import('@/app/api/mapa/route');
    
    const request = new NextRequest('http://localhost/api/mapa', {
      method: 'POST',
      body: JSON.stringify({
        dataNascimento: '1990-05-15',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('deve retornar 400 para nome muito curto', async () => {
    const { POST } = await import('@/app/api/mapa/route');
    
    const request = new NextRequest('http://localhost/api/mapa', {
      method: 'POST',
      body: JSON.stringify({
        nomeCompleto: 'A',
        dataNascimento: '1990-05-15',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('deve retornar 400 para data de nascimento ausente', async () => {
    const { POST } = await import('@/app/api/mapa/route');
    
    const request = new NextRequest('http://localhost/api/mapa', {
      method: 'POST',
      body: JSON.stringify({
        nomeCompleto: 'Maria da Silva',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('deve retornar 400 para data de nascimento em formato inválido', async () => {
    const { POST } = await import('@/app/api/mapa/route');
    
    const request = new NextRequest('http://localhost/api/mapa', {
      method: 'POST',
      body: JSON.stringify({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '15/05/1990', // Formato errado
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('deve aceitar hora opcional', async () => {
    const { POST } = await import('@/app/api/mapa/route');
    
    const request = new NextRequest('http://localhost/api/mapa', {
      method: 'POST',
      body: JSON.stringify({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1990-05-15',
        cidade: 'São Paulo',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('deve aceitar cidade opcional', async () => {
    const { POST } = await import('@/app/api/mapa/route');
    
    const request = new NextRequest('http://localhost/api/mapa', {
      method: 'POST',
      body: JSON.stringify({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1990-05-15',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('deve usar cache quando disponível', async () => {
    const { getRedisClient } = await import('@/lib/redis');
    const mockRedis = {
      get: vi.fn().mockResolvedValue(JSON.stringify({ numerologia: { numeroVida: 5 } })),
      set: vi.fn().mockResolvedValue('OK'),
    };
    vi.mocked(getRedisClient).mockResolvedValue(mockRedis as any);

    const { POST } = await import('@/app/api/mapa/route');
    
    const request = new NextRequest('http://localhost/api/mapa', {
      method: 'POST',
      body: JSON.stringify({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1990-05-15',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.numerologia.numeroVida).toBe(5);
    expect(mockRedis.get).toHaveBeenCalled();
  });
});

describe('GET /api/mapa', () => {
  it('deve retornar 400 quando userId ausente', async () => {
    const { GET } = await import('@/app/api/mapa/route');
    
    const request = new NextRequest('http://localhost/api/mapa');

    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('deve retornar 404 quando mapa não encontrado no cache', async () => {
    const { getRedisClient } = await import('@/lib/redis');
    const mockRedis = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
    };
    vi.mocked(getRedisClient).mockResolvedValue(mockRedis as any);

    const { GET } = await import('@/app/api/mapa/route');
    
    const request = new NextRequest('http://localhost/api/mapa?userId=user123');

    const response = await GET(request);
    expect(response.status).toBe(404);
  });

  it('deve retornar 200 com dados do cache quando encontrados', async () => {
    const { getRedisClient } = await import('@/lib/redis');
    const cachedData = { numerologia: { numeroVida: 7 }, odu: { numero: 3 } };
    const mockRedis = {
      get: vi.fn().mockResolvedValue(JSON.stringify(cachedData)),
      set: vi.fn().mockResolvedValue('OK'),
    };
    vi.mocked(getRedisClient).mockResolvedValue(mockRedis as any);

    const { GET } = await import('@/app/api/mapa/route');
    
    const request = new NextRequest('http://localhost/api/mapa?userId=user123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.numerologia.numeroVida).toBe(7);
  });
});