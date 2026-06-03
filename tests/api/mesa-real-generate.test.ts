// tests/api/mesa-real-generate.test.ts
// Integração da rota POST /api/mesa-real/generate (AD-18.8).
// Cobre: auth, validação, token budget, SSE dev mode, status transitions,
// duplicate processing guard (AD-18.9).
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import type { Route } from '@/app/api/mesa-real/generate/route';
import type { Mock } from 'vitest';

// vi.hoisted keeps mocks and their data at the same hoisting level.
const { mockOperator } = vi.hoisted(() => ({
  mockOperator: {
    id: 'op-1',
    email: 'r@cabala.com',
    name: 'Ramiro',
    passwordHash: 'h',
    role: 'OPERATOR' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}));

const mockClient = {
  id: 'client-1',
  fullName: 'Maria',
  birthDate: new Date('1986-08-20'),
  birthCity: 'São Paulo',
  birthCountry: 'BR',
  birthTime: '10:00',
  astrologyMap: { sun: { sign: 'Leão' } },
  kabalisticMap: { lifePath: 7 },
  tantricMap: { soul: 2 },
  oduBirth: { oduNumber: 10 },
  consentGiven: true,
  consentAt: new Date(),
  operatorId: 'op-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockReading = {
  id: 'reading-1',
  clientId: 'client-1',
  operatorId: 'op-1',
  status: 'PENDING' as const,
  matrixData: { 1: { carta: { numero: 1 }, odu: { numero: 1 } } },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockReadingGenerating = { ...mockReading, status: 'GENERATING' as const };

const mockReport = {
  id: 'report-1',
  readingId: 'reading-1',
  content: {},
  llmModel: 'gpt-4o',
  tokensUsed: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mocks ----------------------------------------------------------------------------

vi.mock('@/lib/auth/operator-session', () => ({
  requireOperator: vi.fn<() => Promise<typeof mockOperator>>().mockResolvedValue(mockOperator),
}));

vi.mock('@/lib/logging', () => ({
  generateRequestId: vi.fn(() => 'test-request-id'),
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  })),
}));

vi.mock('@/lib/token-budget', () => ({
  checkTokenBudget: vi.fn<() => Promise<{ allowed: boolean; budget: string; used: number; limit: number | null }>>()
    .mockResolvedValue({ allowed: true, budget: 'not_configured', used: 0, limit: null }),
  incrementTokenUsage: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: { findUnique: vi.fn() },
    client: { findUnique: vi.fn(), findFirst: vi.fn() },
    reading: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    report: { upsert: vi.fn(), findUnique: vi.fn() },
  },
}));

import { prisma } from '@/lib/prisma';
import { checkTokenBudget, incrementTokenUsage } from '@/lib/token-budget';
import { requireOperator } from '@/lib/auth/operator-session';

// Setup ----------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  (requireOperator as Mock).mockResolvedValue(mockOperator);
  (checkTokenBudget as Mock).mockResolvedValue({ allowed: true, budget: 'not_configured', used: 0, limit: null });
  (incrementTokenUsage as Mock).mockResolvedValue(undefined);
  // Default Prisma mocks — individual tests override as needed
  (prisma.client.findUnique as Mock).mockResolvedValue(mockClient);
  (prisma.client.findFirst as Mock).mockResolvedValue(mockClient);
  (prisma.reading.create as Mock).mockResolvedValue({ id: 'new-reading' });
  (prisma.reading.findUnique as Mock).mockResolvedValue(null);
  (prisma.reading.update as Mock).mockResolvedValue(mockReadingGenerating);
  (prisma.report.upsert as Mock).mockResolvedValue(mockReport);
});

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/mesa-real/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-dev-operator-id': 'op-1' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  clientId: 'client-1',
  matrixData: {
    1: { carta: { numero: 1, nome: 'Cavaleiro', significado: 'x' }, odu: { numero: 1, nome: 'Ogbe', significado: 'x' } },
    2: { carta: { numero: 2, nome: 'Trevo', significado: 'x' }, odu: { numero: 2, nome: 'Ejiokô', significado: 'x' } },
  },
  mapaFixo: {
    nomeCompleto: 'Maria', dataNascimento: '1986-08-20',
    signoSolar: 'Leão', signoLunar: 'Câncer', ascendente: 'Escorpião',
    caminhoDeVida: 7, numeroAlma: 2, numeroPersonalidade: 8,
    numeroExpressao: 7, dominioTantrico: 5, karmaTantrico: 8, vereditoTantrico: 6,
  },
};

// SSE helpers ---------------------------------------------------------------------------

type SSEEvent = { event: string; data: Record<string, unknown> };

async function parseSSEvents(res: Response): Promise<SSEEvent[]> {
  const text = await res.text();
  const events: SSEEvent[] = [];
  for (const raw of text.split(/\n\n+/)) {
    const lines = raw.split('\n');
    let eventType = '';
    let dataJson = '';
    for (const line of lines) {
      if (line.startsWith('event:')) eventType = line.slice(6).trim();
      if (line.startsWith('data:')) dataJson = line.slice(5).trim();
    }
    if (eventType && dataJson) {
      try { events.push({ event: eventType, data: JSON.parse(dataJson) }); } catch { /* ignore */ }
    }
  }
  return events;
}

async function getHouseEvents(res: Response): Promise<SSEEvent[]> {
  return (await parseSSEvents(res)).filter((e) => e.event === 'house');
}

async function getDoneEvent(res: Response): Promise<SSEEvent | undefined> {
  return (await parseSSEvents(res)).find((e) => e.event === 'done');
}

// Tests ----------------------------------------------------------------------------

describe('POST /api/mesa-real/generate', () => {
  it('returns 401 when no auth is provided', async () => {
    (requireOperator as Mock).mockResolvedValueOnce(
      NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) as unknown as Awaited<ReturnType<typeof requireOperator>>
    );
    const req = makeRequest(validBody);
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/não autenticado/i);
  });

  it('returns 400 on Zod validation error (missing clientId)', async () => {
    const req = makeRequest({ matrixData: validBody.matrixData });
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/clientId/i);
    expect(body.details).toBeDefined();
  });
  it('returns 400 when no house is filled', async () => {
    (prisma.client.findUnique as Mock).mockResolvedValue(mockClient);
    (prisma.reading.create as Mock).mockResolvedValue({ ...mockReading, id: 'no-house-reading' });
    (prisma.reading.update as Mock).mockResolvedValue({ ...mockReading, id: 'no-house-reading', status: 'GENERATING' });
    // matrixData with valid house structure but null Carta/Odu → extractFilledHouses returns []
    // Route should return 400 (not SSE stream) with "Nenhuma casa preenchida"
    // Include mapaFixo so it passes Zod validation
    const req = makeRequest({
      clientId: 'client-1',
      mapaFixo: validBody.mapaFixo,
      matrixData: { 1: { carta: null, odu: null } },
    });
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
    // Content-type check: should be JSON, not SSE
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
    const body = await res.json();
    expect(body.error).toMatch(/nenhuma casa/i);
  });
  it('returns 404 when client does not exist', async () => {
    (prisma.client.findUnique as Mock).mockResolvedValue(null);
    const req = makeRequest(validBody);
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/não encontrado/i);
  });
  it('token-budget is called before SSE stream (AD-22.5)', async () => {
    // In dev mode (no OPENAI_API_KEY), checkTokenBudget is still called before SSE.
    // The mock returns { allowed: true } by default. Route proceeds to SSE.
    (prisma.client.findUnique as Mock).mockResolvedValue(mockClient);
    (prisma.reading.create as Mock).mockResolvedValue({ ...mockReading, id: 'budget-sse' });
    (prisma.reading.update as Mock).mockResolvedValue({ ...mockReading, id: 'budget-sse', status: 'GENERATING' });
    const req = makeRequest(validBody);
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    // Dev mode: returns SSE stream (checkTokenBudget called but allowed=true)
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/event-stream/);
    // verify checkTokenBudget was called (via mock)
    expect(checkTokenBudget).toHaveBeenCalled();
  });

  it('creates new reading when no readingId provided (dev mode)', async () => {
    (prisma.client.findUnique as Mock).mockResolvedValue(mockClient);
    (prisma.reading.create as Mock).mockResolvedValue({ ...mockReading, id: 'new-reading' });
    (prisma.reading.update as Mock).mockResolvedValue({ ...mockReading, id: 'new-reading', status: 'GENERATING' });

    const req = makeRequest(validBody);
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    // Dev mode (no OPENAI_API_KEY) → SSE stream
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/event-stream/);
  });

  it('SSE dev mode emits house events for each filled house', async () => {
    (prisma.client.findUnique as Mock).mockResolvedValue(mockClient);
    (prisma.reading.create as Mock).mockResolvedValue({ ...mockReading, id: 'sse-test-reading' });
    (prisma.reading.update as Mock).mockResolvedValue({ ...mockReading, id: 'sse-test-reading', status: 'GENERATING' });

    const req = makeRequest(validBody);
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    const houseEvents = await getHouseEvents(res);
    expect(houseEvents).toHaveLength(2);
    expect(houseEvents[0].data.houseNumber).toBe(1);
    expect(houseEvents[1].data.houseNumber).toBe(2);
  });

  it('SSE dev mode emits done event with readingId and housesGenerated', async () => {
    (prisma.client.findUnique as Mock).mockResolvedValue(mockClient);
    (prisma.reading.create as Mock).mockResolvedValue({ ...mockReading, id: 'done-test-reading' });
    (prisma.reading.update as Mock).mockResolvedValue({ ...mockReading, id: 'done-test-reading', status: 'GENERATING' });

    const req = makeRequest(validBody);
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    const done = await getDoneEvent(res);
    expect(done).toBeDefined();
    expect(done!.data.readingId).toBe('done-test-reading');
    expect(done!.data.housesGenerated).toBe(2);
    expect(done!.data.totalTokens).toBe(0);
  });

  it('rejects already completed reading (AD-18.9)', async () => {
    (prisma.reading.findUnique as Mock).mockResolvedValue({ ...mockReading, status: 'COMPLETED' });
    const req = makeRequest({ ...validBody, readingId: 'completed-reading' });
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.code).toBe('READING_ALREADY_COMPLETED');
  });

  it('rejects already generating reading (AD-18.9)', async () => {
    (prisma.reading.findUnique as Mock).mockResolvedValue({ ...mockReading, status: 'GENERATING' });
    const req = makeRequest({ ...validBody, readingId: 'generating-reading' });
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.code).toBe('READING_ALREADY_GENERATING');
  });

  it('returns 404 for non-existent readingId', async () => {
    (prisma.reading.findUnique as Mock).mockResolvedValue(null);
    const req = makeRequest({ ...validBody, readingId: 'ghost-reading' });
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('uses existing reading when readingId provided (AD-18.5/18.7)', async () => {
    const existingReading = { ...mockReading, id: 'existing-reading', status: 'PENDING' as const };
    (prisma.reading.findUnique as Mock)
      .mockResolvedValueOnce(existingReading)
      .mockResolvedValueOnce({ ...existingReading, client: mockClient });
    (prisma.reading.update as Mock).mockResolvedValue({ ...existingReading, status: 'GENERATING' });

    const req = makeRequest({ ...validBody, readingId: 'existing-reading' });
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    expect(res.status).toBe(200);
    // No new reading created
    expect(prisma.reading.create).not.toHaveBeenCalled();
  });

  it('SSE response has correct streaming headers', async () => {
    (prisma.client.findUnique as Mock).mockResolvedValue(mockClient);
    (prisma.reading.create as Mock).mockResolvedValue({ ...mockReading, id: 'headers-test' });
    (prisma.reading.update as Mock).mockResolvedValue({ ...mockReading, id: 'headers-test', status: 'GENERATING' });

    const req = makeRequest(validBody);
    const { POST }: { POST: Route['POST'] } = await import('@/app/api/mesa-real/generate/route');
    const res = await POST(req);
    expect(res.headers.get('content-type')).toBe('text/event-stream; charset=utf-8');
    expect(res.headers.get('cache-control')).toBe('no-cache, no-transform');
    expect(res.headers.get('connection')).toBe('keep-alive');
    expect(res.headers.get('x-accel-buffering')).toBe('no');
  });
});
