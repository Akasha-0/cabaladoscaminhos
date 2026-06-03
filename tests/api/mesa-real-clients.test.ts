// tests/api/mesa-real-clients.test.ts
// Integração da rota POST /api/mesa-real/clients (Onda D).
// Cobre: auth, validação, cálculo dos 4 mapas, criação do cliente.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mocks ----------------------------------------------------------------------------

const cookieStore: { current: Record<string, string> } = { current: {} };
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const v = cookieStore.current[name];
      return v ? { name, value: v } : undefined;
    },
  })),
  headers: vi.fn(async () => ({
    get: () => null,
  })),
}));

const mockOperator = {
  id: 'op-1',
  email: 'r@cabala.com',
  name: 'Ramiro',
  passwordHash: 'h',
  role: 'OPERATOR',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock calculator outputs so tests are deterministic
const mockKabalisticMap = { lifePath: 7, expression: 3 };
const mockTantricMap = { soul: 2, destiny: 9 };
const mockOduBirth = { principal: { numero: 8, nome: 'Ogunda' } };
const mockAstrologyMap = { sun: 'Libra', moon: 'Cancer', ascendant: 'Capricorn' };

vi.mock('@/lib/calculators/numerology-kabalah', () => ({
  buildKabalisticMap: vi.fn(() => mockKabalisticMap),
}));

vi.mock('@/lib/calculators/numerology-tantric', () => ({
  buildTantricMap: vi.fn(() => mockTantricMap),
}));

vi.mock('@/lib/calculators/odu-birth', () => ({
  calculateBirthOdu: vi.fn(() => mockOduBirth),
}));

vi.mock('@/lib/astrologia/birth-chart', () => ({
  getBirthChart: vi.fn(() => mockAstrologyMap),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: { findUnique: vi.fn() },
    client: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    reading: { create: vi.fn() },
  },
}));

import { prisma } from '@/lib/prisma';

// Setup ----------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.current = {};
  // Authenticated by default via dev header
  cookieStore.current['x-dev-operator-id'] = 'op-1';
  vi.mocked(prisma.operator.findUnique).mockResolvedValue(mockOperator as never);
  vi.mocked(prisma.client.create).mockResolvedValue({
    id: 'client-new',
    fullName: 'Maria da Silva',
    birthDate: new Date('1985-10-07T00:00:00Z'),
    birthTime: '14:30',
    birthCity: 'São Paulo',
    birthState: 'SP',
    birthCountry: 'Brasil',
    birthLatitude: -23.5505,
    birthLongitude: -46.6333,
    birthTimezone: 'America/Sao_Paulo',
    astrologyMap: mockAstrologyMap,
    kabalisticMap: mockKabalisticMap,
    tantricMap: mockTantricMap,
    oduBirth: mockOduBirth,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as never);
  vi.mocked(prisma.client.findUnique).mockResolvedValue({
    id: 'client-new',
    fullName: 'Maria da Silva',
    birthDate: new Date('1985-10-07T00:00:00Z'),
    birthTime: '14:30',
    birthCity: 'São Paulo',
    birthState: 'SP',
    birthCountry: 'Brasil',
    birthLatitude: -23.5505,
    birthLongitude: -46.6333,
    birthTimezone: 'America/Sao_Paulo',
    astrologyMap: mockAstrologyMap,
    kabalisticMap: mockKabalisticMap,
    tantricMap: mockTantricMap,
    oduBirth: mockOduBirth,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    readings: [],
  } as never);
});

function makeRequest(body: unknown, auth: 'cookie' | 'dev' | 'none' = 'dev'): NextRequest {
  cookieStore.current = {};
  if (auth === 'cookie') cookieStore.current['cockpit_session'] = 'op-1';
  if (auth === 'dev') cookieStore.current['x-dev-operator-id'] = 'op-1';

  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (auth === 'cookie') headers['cookie'] = 'cockpit_session=op-1';
  if (auth === 'dev') headers['x-dev-operator-id'] = 'op-1';

  return new NextRequest('http://localhost/api/mesa-real/clients', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

// Tests ----------------------------------------------------------------------------

describe('POST /api/mesa-real/clients', () => {
  it('returns 401 when no auth is provided', async () => {
    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const req = makeRequest({ fullName: 'Maria', birthDate: '1985-10-07T00:00:00.000Z' }, 'none');
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when fullName is missing', async () => {
    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const req = makeRequest({ birthDate: '1985-10-07T00:00:00.000Z' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Dados inválidos');
  });

  it('returns 400 when birthDate is invalid', async () => {
    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const req = makeRequest({ fullName: 'Maria', birthDate: 'not-a-date' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Dados inválidos');
  });

  it('creates client with all 4 maps calculated and persisted', async () => {
    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const req = makeRequest({
      fullName: 'Maria da Silva',
      birthDate: '1985-10-07T00:00:00.000Z',
      birthTime: '14:30',
      birthCity: 'São Paulo',
      birthState: 'SP',
      birthCountry: 'Brasil',
      birthLatitude: -23.5505,
      birthLongitude: -46.6333,
      birthTimezone: 'America/Sao_Paulo',
    });
    const res = await POST(req);
    expect(res.status).toBe(201);

    // Verify Prisma create received all 4 map fields
    const createCall = vi.mocked(prisma.client.create).mock.calls[0];
    const createData = createCall[0]?.data as Record<string, unknown>;
    expect(createData.astrologyMap).toEqual(mockAstrologyMap);
    expect(createData.kabalisticMap).toEqual(mockKabalisticMap);
    expect(createData.tantricMap).toEqual(mockTantricMap);
    expect(createData.oduBirth).toEqual(mockOduBirth);
  });

  it('creates client without optional coordinates (simplified astrology map)', async () => {
    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const req = makeRequest({
      fullName: 'João dos Santos',
      birthDate: '1990-03-15T00:00:00.000Z',
    });
    const res = await POST(req);
    expect(res.status).toBe(201);

    // Without coordinates, astrologyMap should be the fallback object
    const createCall = vi.mocked(prisma.client.create).mock.calls[0];
    const createData = createCall[0]?.data as Record<string, unknown>;
    expect(createData.astrologyMap).toHaveProperty('note');
    expect(createData.astrologyMap).toHaveProperty('sun', '—');
    expect(createData.kabalisticMap).toBeTruthy();
    expect(createData.tantricMap).toBeTruthy();
    expect(createData.oduBirth).toBeTruthy();
  });

  it('returns full client with maps in response body', async () => {
    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const req = makeRequest({
      fullName: 'Maria da Silva',
      birthDate: '1985-10-07T00:00:00.000Z',
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.client).toBeDefined();
    expect(body.client.id).toBe('client-new');
    expect(body.client.kabalisticMap).toEqual(mockKabalisticMap);
    expect(body.client.tantricMap).toEqual(mockTantricMap);
    expect(body.client.oduBirth).toEqual(mockOduBirth);
    expect(body.client.astrologyMap).toEqual(mockAstrologyMap);
  });
});
