import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

// Mock do akasha-guard
const mockRequireAkashaApi = vi.hoisted(() => vi.fn());

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: mockRequireAkashaApi,
}));

// Mock do storage in-memory
const ritualStorage = new Map<string, unknown>();

vi.mock('@/lib/application/akasha/ritual-storage', () => ({
  getRitualConfig: (userId: string) => ritualStorage.get(userId),
  setRitualConfig: (userId: string, config: unknown) => ritualStorage.set(userId, config),
  deleteRitualConfig: (userId: string) => ritualStorage.delete(userId),
}));

// Mock do ritual-calculator
vi.mock('@akasha/core/ritual-calculator', () => ({
  calculateCodeOfDay: vi.fn().mockReturnValue({
    code: {
      hexagram: 1,
      level: 'gift',
      lifeArea: 'espiritualidade',
    },
    timestamp: Date.now(),
  }),
  buildRitual: vi.fn().mockReturnValue({
    data: new Date(),
    codigo: {
      hexagrama: {
        number: 1,
        name: 'Hexagrama 1',
        chineseName: 'Criação',
        judgment: 'O creativo age.',
        image: 'O céu.',
        upperTrigram: 1,
        lowerTrigram: 1,
        lines: [true, true, true, true, true, true],
      },
      nivel: 'gift',
    },
    pratica: {
      id: 'pratica-1',
      name: 'Meditação',
      description: 'Prática de meditação.',
      associations: {},
    },
    quizilas: [],
    afirmacao: 'Eu sou a criação em movimento.',
    oracao: 'Criador de tudo, que teu impulso inicial guia meus passos hoje.',
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  ritualStorage.clear();
  mockRequireAkashaApi.mockResolvedValue({ id: 'user-123', email: 'test@test.com', name: 'Test User' });
});

afterEach(() => {
  ritualStorage.clear();
});
import { GET as ritualGet } from '@/app/api/akasha/ritual/route';
import { POST as ritualConfigPost } from '@/app/api/akasha/ritual/config/route';
import { GET as ritualTodayGet } from '@/app/api/akasha/ritual/today/route';
import { getRitualConfig, setRitualConfig } from '@/lib/application/akasha/ritual-storage';

// ----------------------------------------------------------------------------
// GET /api/akasha/ritual
// ----------------------------------------------------------------------------

describe('GET /api/akasha/ritual', () => {
  it('retorna 401 quando usuário não autenticado', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(
      new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    );

    const res = await ritualGet(new Request('http://localhost/api/akasha/ritual'));

    expect(res.status).toBe(401);
  });

  it('retorna 404 quando ritual não configurado', async () => {
    const res = await ritualGet(new Request('http://localhost/api/akasha/ritual'));

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain('não configurado');
  });

  it('retorna ritual configurado com sucesso', async () => {
    setRitualConfig('user-123', {
      horario: '07:00',
      timezone: 'America/Sao_Paulo',
      componentes: {
        codigoDoDia: true,
        praticaPrincipal: true,
        quizilas: true,
        afirmacao: true,
      },
      ativo: true,
    });

    const res = await ritualGet(new Request('http://localhost/api/akasha/ritual'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('codigo');
    expect(body).toHaveProperty('pratica');
    expect(body).toHaveProperty('afirmacao');
    expect(body).toHaveProperty('oracao');
  });
});

// ----------------------------------------------------------------------------
// POST /api/akasha/ritual/config
// ----------------------------------------------------------------------------

describe('POST /api/akasha/ritual/config', () => {
  it('retorna 400 quando body inválido', async () => {
    const req = new Request('http://localhost/api/akasha/ritual/config', {
      method: 'POST',
      body: JSON.stringify({ horario: 'invalid' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await ritualConfigPost(req);

    expect(res.status).toBe(400);
  });

  it('salva config com sucesso', async () => {
    const config = {
      horario: '07:00',
      timezone: 'America/Sao_Paulo',
      componentes: {
        codigo: true,
        pratica: true,
        quizilas: false,
        afirmacao: true,
        oracao: true,
      },
      ativo: true,
    };
    const req = new Request('http://localhost/api/akasha/ritual/config', {
      method: 'POST',
      body: JSON.stringify(config),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await ritualConfigPost(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.horario).toBe('07:00');
    expect(body.timezone).toBe('America/Sao_Paulo');
  });

  it('atualiza config existente', async () => {
    setRitualConfig('user-123', {
      horario: '06:00',
      timezone: 'UTC',
      componentes: { codigoDoDia: false, praticaPrincipal: false, quizilas: false, afirmacao: false },
      ativo: false,
    });

    const config = {
      horario: '08:30',
      timezone: 'America/Sao_Paulo',
      componentes: {
        codigo: true,
        pratica: true,
        quizilas: true,
        afirmacao: true,
        oracao: true,
      },
      ativo: true,
    };
    const req = new Request('http://localhost/api/akasha/ritual/config', {
      method: 'POST',
      body: JSON.stringify(config),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await ritualConfigPost(req);

    expect(res.status).toBe(200);
    const updated = getRitualConfig('user-123') as { horario: string } | undefined;
    expect(updated?.horario).toBe('08:30');
  });
});

// ----------------------------------------------------------------------------
// GET /api/akasha/ritual/today
// ----------------------------------------------------------------------------

describe('GET /api/akasha/ritual/today', () => {
  it('retorna ritual do dia com config default quando não configurado', async () => {
    const res = await ritualTodayGet(new Request('http://localhost/api/akasha/ritual/today'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('codigo');
    expect(body).toHaveProperty('pratica');
    expect(body).toHaveProperty('afirmacao');
  });

  it('retorna ritual do dia usando config customizada', async () => {
    setRitualConfig('user-123', {
      horario: '06:00',
      timezone: 'Europe/London',
      componentes: {
        codigoDoDia: true,
        praticaPrincipal: true,
        quizilas: true,
        afirmacao: true,
      },
      ativo: true,
    });

    const res = await ritualTodayGet(new Request('http://localhost/api/akasha/ritual/today'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('codigo');
  });
});
