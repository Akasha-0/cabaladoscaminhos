import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import type { GET as GETType } from '@/app/api/akasha/mandato-do-dia/route';

// Import dinâmico (estilo do projeto) para garantir que os mocks
// declarados acima estejam registrados quando o módulo for carregado.
const getHandler = async () =>
  (await import('@/app/api/akasha/mandato-do-dia/route')).GET as typeof GETType;

// ----------------------------------------------------------------------------
// Mocks — vi.mock é hoisted ao topo do módulo pelo vitest. As const
// abaixo são referenciadas via closure dentro dos factories; a factory
// só executa quando o módulo mockado é importado (após as const existirem).
// ----------------------------------------------------------------------------

const mockRequireAkashaApi = vi.fn();
const mockCalcular = vi.fn();
const mockPrisma = {
  birthChart: { findUnique: vi.fn() },
  user: { findUnique: vi.fn() },
};

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: mockRequireAkashaApi,
}));

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: mockPrisma,
}));

// O alias `@akasha/core` é resolvido pelo vitest para o path TS bruto;
// mockamos AMBAS as formas para garantir aplicação em qualquer ordem de
// resolução (alias → arquivo, ou path direto).
vi.mock('@akasha/core', () => ({
  // Stub mínimo: a rota usa safeParse, o teste precisa apenas de
  // (success: true, data: input) para chegar até calcular().
  AkashaInputSchema: {
    safeParse: (input: unknown) => ({ success: true, data: input }),
  },
  calcular: mockCalcular,
}));

vi.mock('../../../../packages/akasha-core/src/index.ts', () => ({
  AkashaInputSchema: {
    safeParse: (input: unknown) => ({ success: true, data: input }),
  },
  calcular: mockCalcular,
}));

const FAKE_USER_ID = 'user-mandato-001';
const FAKE_BIRTH_DATE = new Date('1990-05-12T00:00:00.000Z');
const FAKE_LEITURA = {
  pilares: {},
  mandala: {},
  mandato: {
    escala: 'D' as const,
    pilares_relevantes: ['astrologia', 'iching', 'cabala'],
    redacao_bruta: '[D] Lua cheia, hex 1, vida 7. (LLM redige.)',
    cita_fontes: [
      'Pilar 1, Gematria (Sefer Yetzirah)',
      'Pilar 2, Astrologia (Whole Sign, Brennan 2017)',
      'Pilar 5, I Ching (Wilhelm/Baynes 1950)',
    ],
  },
  mentor_hook: { intencao: 'claridade', crise_detectada: false, recurso: null },
};

function makeRequest(intencao?: string) {
  const url = `http://localhost/api/akasha/mandato-do-dia${intencao ? `?intencao=${encodeURIComponent(intencao)}` : ''}`;
  return new NextRequest(url, { method: 'GET' });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAkashaApi.mockResolvedValue({
    id: FAKE_USER_ID,
    email: 'user@test.com',
    name: 'Test User',
  });
  mockPrisma.birthChart.findUnique.mockResolvedValue({ id: 'chart-1' });
  mockPrisma.user.findUnique.mockResolvedValue({
    birthDate: FAKE_BIRTH_DATE,
    birthTime: '14:30',
    birthCity: 'São Paulo, BR',
  });
  mockCalcular.mockResolvedValue(FAKE_LEITURA);
});

// ----------------------------------------------------------------------------
// GET /api/akasha/mandato-do-dia
// ----------------------------------------------------------------------------

describe('GET /api/akasha/mandato-do-dia', () => {
  it('retorna 401 quando usuário não autenticado', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(
      new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    );
    const res = await (await getHandler())(makeRequest());
    expect(res.status).toBe(401);
  });

  it('retorna 404 quando birthChart ausente (onboarding não concluído)', async () => {
    mockPrisma.birthChart.findUnique.mockResolvedValueOnce(null);
    const res = await (await getHandler())(makeRequest());
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/onboarding/i);
  });

  it('retorna 400 quando birthDate ausente no user', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ birthDate: null });
    const res = await (await getHandler())(makeRequest());
    expect(res.status).toBe(400);
  });

  it('retorna 200 com MandatoEsqueleto no shape esperado', async () => {
    const res = await (await getHandler())(makeRequest('buscar paz'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.mandato).toMatchObject({
      escala: 'D',
      pilares_relevantes: ['astrologia', 'iching', 'cabala'],
      redacao_bruta: expect.stringContaining('[D]'),
      cita_fontes: expect.arrayContaining([expect.stringContaining('I Ching')]),
    });
    expect(body.mentor_hook).toEqual({
      intencao: 'claridade',
      crise_detectada: false,
      recurso: null,
    });
  });

  it('usa intencao default quando query param ausente', async () => {
    await (
      await getHandler()
    )(makeRequest());
    expect(mockCalcular).toHaveBeenCalledTimes(1);
    const callArg = mockCalcular.mock.calls[0][0];
    expect(callArg.intencao_inicial).toBe('buscar clareza para o dia');
    expect(callArg.data_nascimento).toBe('1990-05-12');
    expect(callArg.hora_nascimento).toBe('14:30');
  });

  it('aceita intencao via query param', async () => {
    await (
      await getHandler()
    )(makeRequest('  honrar minha intuição  '));
    const callArg = mockCalcular.mock.calls[0][0];
    expect(callArg.intencao_inicial).toBe('honrar minha intuição');
  });

  it('trunca hora "HH:MM:SS" para "HH:MM"', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      birthDate: FAKE_BIRTH_DATE,
      birthTime: '14:30:00',
      birthCity: 'SP',
    });
    await (
      await getHandler()
    )(makeRequest());
    expect(mockCalcular.mock.calls[0][0].hora_nascimento).toBe('14:30');
  });

  it('omite hora_nascimento quando user.birthTime null', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      birthDate: FAKE_BIRTH_DATE,
      birthTime: null,
      birthCity: 'SP',
    });
    await (
      await getHandler()
    )(makeRequest());
    expect(mockCalcular.mock.calls[0][0].hora_nascimento).toBeUndefined();
  });

  it('retorna 200 + recurso CVV-188 quando intencao dispara crise', async () => {
    mockCalcular.mockResolvedValueOnce({
      ...FAKE_LEITURA,
      mentor_hook: {
        intencao: 'não aguento mais',
        crise_detectada: true,
        recurso: 'CVV-188',
      },
    });
    const res = await (await getHandler())(makeRequest('não aguento mais'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mentor_hook.recurso).toBe('CVV-188');
    expect(body.mentor_hook.crise_detectada).toBe(true);
  });

  it('retorna 500 quando calcular() lança erro', async () => {
    mockCalcular.mockRejectedValueOnce(new Error('engine down'));
    const res = await (await getHandler())(makeRequest());
    expect(res.status).toBe(500);
  });

  it('NÃO inclui pilares nem mandala completos no response (PII mínima)', async () => {
    const res = await (await getHandler())(makeRequest());
    const body = await res.json();
    expect(body.pilares).toBeUndefined();
    expect(body.mandala).toBeUndefined();
    expect(body.input_normalizado).toBeUndefined();
  });
});
