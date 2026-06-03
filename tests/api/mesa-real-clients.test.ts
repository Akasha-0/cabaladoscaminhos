// tests/api/mesa-real-clients.test.ts
// Integração da rota POST /api/mesa-real/clients (Fase 18 - AD-18.5).
// Verifica: auth, validação, e cálculo server-side dos 4 mapas.
// AD-18.5: Onda D - Wire 4 Mapas — cálculo no cadastro via createClientWithMaps.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ----------------------------------------------------------------------------
// Mocks — inline within factories to avoid vi.mock hoisting issues
// ----------------------------------------------------------------------------

vi.mock('@/lib/auth/operator-session', () => ({
  requireOperator: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    client: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';

// ----------------------------------------------------------------------------
// Shared mock data factories
// ----------------------------------------------------------------------------

const OPERATOR_MOCK = {
  id: 'op-1',
  email: 'test@test.com',
  name: 'Test Operator',
  passwordHash: 'h',
  role: 'OPERATOR' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeClientWithMaps(overrides = {}) {
  return {
    id: 'client-abc123',
    fullName: 'Eliane Simão de Almeida',
    birthDate: new Date('1986-08-20'),
    birthTime: '09:00',
    birthCity: 'Recife',
    birthState: 'PE',
    birthCountry: 'Brasil',
    birthLatitude: null,
    birthLongitude: null,
    birthTimezone: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    astrologyMap: {
      note: 'Coordenadas ausentes; mapa simplificado.',
      sun: '—',
      moon: '—',
      ascendant: '—',
    },
    kabalisticMap: {
      lifePath: 7,
      expression: 9,
      soul: 5,
      personality: 4,
      mission: 7,
      maturity: 9,
      helixing: 0,
      triangular: null,
    },
    tantricMap: {
      soul: 2,
      karma: 8,
      personality: 7,
      hiddenPassion: 4,
      recurringLesson: 1,
    },
    oduBirth: {
      odu: 7,
      sign: 'Ogunda Oyeku',
    },
    readings: [],
    ...overrides,
  };
}

// ----------------------------------------------------------------------------
// Setup
// ----------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireOperator).mockResolvedValue(OPERATOR_MOCK);
});

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/mesa-real/clients', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-dev-operator-id': 'op-1',
    },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: 'GET',
    headers: {
      'x-dev-operator-id': 'op-1',
    },
  });
}

// ----------------------------------------------------------------------------
// Tests — POST /api/mesa-real/clients
// ----------------------------------------------------------------------------

describe('POST /api/mesa-real/clients', () => {

  it('returns 401 when no auth is provided', async () => {
    vi.mocked(requireOperator).mockResolvedValueOnce(
      new NextResponse(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401 }
      ) as unknown as typeof OPERATOR_MOCK
    );

    const req = makeRequest({ fullName: 'Test', birthDate: '2020-01-01T12:00:00.000Z' });
    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when fullName is missing', async () => {
    const req = makeRequest({ birthDate: '2020-01-01T12:00:00.000Z' });
    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/inválidos|Dados inválidos/);
  });

  it('returns 400 when birthDate has invalid format', async () => {
    const req = makeRequest({ fullName: 'Test', birthDate: 'not-a-date' });
    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/inválidos|Dados inválidos/);
  });

  it('returns 400 when birthDate is a date-only string (missing time component)', async () => {
    const req = makeRequest({ fullName: 'Test', birthDate: '2020-01-01' });
    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('creates client with all 4 maps calculated (AD-18.5)', async () => {
    const clientWithMaps = makeClientWithMaps();

    vi.mocked(prisma.client.create).mockResolvedValueOnce({ id: 'client-abc123' });
    vi.mocked(prisma.client.findUnique).mockResolvedValueOnce(clientWithMaps);

    const req = makeRequest({
      fullName: 'Eliane Simão de Almeida',
      birthDate: '1986-08-20T12:00:00.000Z',
      birthCity: 'Recife',
      birthCountry: 'Brasil',
    });

    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.client).toBeDefined();
    expect(body.client.id).toBe('client-abc123');
    expect(body.client.astrologyMap).toBeDefined();
    expect(body.client.astrologyMap).toHaveProperty('sun');
    expect(body.client.astrologyMap).toHaveProperty('moon');
    expect(body.client.astrologyMap).toHaveProperty('ascendant');
    expect(body.client.kabalisticMap).toBeDefined();
    expect(body.client.kabalisticMap).toHaveProperty('lifePath');
    expect(body.client.kabalisticMap).toHaveProperty('expression');
    expect(body.client.kabalisticMap).toHaveProperty('soul');
    expect(body.client.tantricMap).toBeDefined();
    expect(body.client.tantricMap).toHaveProperty('soul');
    expect(body.client.tantricMap).toHaveProperty('karma');
    expect(body.client.oduBirth).toBeDefined();
  });

  it('birth date 1986-08-20 determines lifePath = 7 (determinism anchor)', async () => {
    const clientWithMaps = makeClientWithMaps();

    vi.mocked(prisma.client.create).mockResolvedValueOnce({ id: 'client-determinism' });
    vi.mocked(prisma.client.findUnique).mockResolvedValueOnce(clientWithMaps);

    const req = makeRequest({
      fullName: 'Eliane Simão de Almeida',
      birthDate: '1986-08-20T12:00:00.000Z',
    });

    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.client.kabalisticMap.lifePath).toBe(7);
  });

  it('birth date 1986-08-20 determines tântrica: soul=2, karma=8 (determinism anchor)', async () => {
    const clientWithMaps = makeClientWithMaps();

    vi.mocked(prisma.client.create).mockResolvedValueOnce({ id: 'client-tantric' });
    vi.mocked(prisma.client.findUnique).mockResolvedValueOnce(clientWithMaps);

    const req = makeRequest({
      fullName: 'Eliane Simão de Almeida',
      birthDate: '1986-08-20T12:00:00.000Z',
    });

    const { POST } = await import('@/app/api/mesa-real/clients/route');
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.client.tantricMap.soul).toBe(2);
    expect(body.client.tantricMap.karma).toBe(8);
  });

});

// ----------------------------------------------------------------------------
// Tests — GET /api/mesa-real/clients
// ----------------------------------------------------------------------------

describe('GET /api/mesa-real/clients', () => {

  it('returns client with maps when fetching by clientId', async () => {
    const clientWithMaps = makeClientWithMaps();

    vi.mocked(prisma.client.findUnique).mockResolvedValueOnce(clientWithMaps);

    const req = makeGetRequest('/api/mesa-real/clients?clientId=client-abc123');

    const { GET } = await import('@/app/api/mesa-real/clients/route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.client).toBeDefined();
    expect(body.client.id).toBe('client-abc123');
    expect(body.client.astrologyMap).toBeDefined();
    expect(body.client.kabalisticMap).toBeDefined();
    expect(body.client.kabalisticMap.lifePath).toBe(7);
    expect(body.client.tantricMap).toBeDefined();
    expect(body.client.tantricMap.soul).toBe(2);
    expect(body.client.tantricMap.karma).toBe(8);
    expect(body.client.oduBirth).toBeDefined();
  });

  it('returns 404 when client does not exist', async () => {
    vi.mocked(prisma.client.findUnique).mockResolvedValueOnce(null);

    const req = makeGetRequest('/api/mesa-real/clients?clientId=nonexistent');

    const { GET } = await import('@/app/api/mesa-real/clients/route');
    const res = await GET(req);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/não encontrado/);
  });

  it('returns 401 when no auth is provided on GET', async () => {
    vi.mocked(requireOperator).mockResolvedValueOnce(
      new NextResponse(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401 }
      ) as unknown as typeof OPERATOR_MOCK
    );

    const req = new NextRequest('http://localhost/api/mesa-real/clients?clientId=client-1', {
      method: 'GET',
      headers: {},
    });

    const { GET } = await import('@/app/api/mesa-real/clients/route');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

});
