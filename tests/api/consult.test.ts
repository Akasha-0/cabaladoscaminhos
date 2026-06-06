// tests/api/consult.test.ts
// Integração da rota POST /api/consult (Fase 7).
// Cobre: auth, validação Zod, 404, criação de Consultation,
// RAG-closed routing determinism (AD-19.4 Invariants 2 & 6),
// e fallback SSE quando OPENAI_API_KEY ausente.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

type SSEEvent = { event: string; data: Record<string, unknown> };

// SSE helpers — each consumes res.text() exactly once (Response body is single-use).
// res.text() is async in Node.js/test environments.

async function parseAllSSEvents(res: Response): Promise<SSEEvent[]> {
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
      events.push({ event: eventType, data: JSON.parse(dataJson) });
    }
  }
  return events;
}

async function extractRoutingFromResponse(res: Response): Promise<{ themes: unknown; houses: unknown }> {
  const events = await parseAllSSEvents(res);
  const routing = events.find((e) => e.event === 'routing');
  if (!routing) throw new Error('No routing event found in SSE');
  return routing.data as { themes: unknown; houses: unknown };
}

async function extractDoneFromResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  for (const raw of text.split(/\n\n+/)) {
    const lines = raw.split('\n');
    let eventType = '';
    let dataJson = '';
    for (const line of lines) {
      if (line.startsWith('event:')) eventType = line.slice(6).trim();
      if (line.startsWith('data:')) dataJson = line.slice(5).trim();
    }
    if (eventType === 'done' && dataJson) {
      return JSON.parse(dataJson);
    }
  }
  throw new Error('No done event found in SSE');
}

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

const mockReadingWithContext = {
  id: 'reading-1',
  date: new Date('2026-06-01'),
  status: 'PENDING',
  matrixData: { 1: { carta: 1, odu: 1 } },
  clientId: 'client-1',
  operatorId: 'op-1',
  client: {
    id: 'client-1',
    fullName: 'Maria',
    birthDate: new Date('1990-01-01'),
    astrologyMap: { sun: { sign: 'Touro' } },
    kabalisticMap: { expression: 5 },
    tantricMap: { domain: 3 },
    oduBirth: null,
  },
  report: null,
};

const mockConsultation = {
  id: 'consult-new',
  title: null,
  readingId: 'reading-1',
  operatorId: 'op-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: { findUnique: vi.fn() },
    reading: { findUnique: vi.fn() },
    consultation: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    chatMessage: {
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        chatMessage: { create: vi.fn().mockResolvedValue({ id: 'msg-1' }) },
        consultation: { update: vi.fn().mockResolvedValue({ id: 'consult-new' }) },
      })
    ),
  },
}));
vi.mock('@/lib/logging', () => ({
  generateRequestId: vi.fn(() => 'test-request-id'),
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  })),
}));

import { prisma } from '@/lib/prisma';

// Setup ----------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.current = { 'x-dev-operator-id': 'op-1' };
  // OPENAI_API_KEY ausente por padrão — testa o caminho de fallback
  delete process.env.OPENAI_API_KEY;
  // Habilita dev auth bypass para testes (comportamento secure: opt-in explícito)
  process.env.ALLOW_DEV_AUTH_BYPASS = 'true';
});

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/consult', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-dev-operator-id': 'op-1',
    },
    body: JSON.stringify(body),
  });
}

// Tests ----------------------------------------------------------------------------

describe('POST /api/consult', () => {
  it('returns 401 when not authenticated', async () => {
    cookieStore.current = {}; // no auth
    const req = makeRequest({ readingId: 'r1', question: 'oi' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/Não autenticado/);
  });

  it('returns 400 on missing readingId', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);
    const req = makeRequest({ question: 'oi' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Validação|obrigatório/);
  });

  it('returns 400 on empty question', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);
    const req = makeRequest({ readingId: 'r1', question: '' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 when reading not found', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = makeRequest({ readingId: 'ghost', question: 'oi' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/ghost|não encontrada/);
  });

  it('creates a new consultation and persists user message when consultationId not provided', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockReadingWithContext);
    (prisma.consultation.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockConsultation);
    const req = makeRequest({ readingId: 'reading-1', question: 'O que significa a casa 1?' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(200);
    const done = await extractDoneFromResponse(res);
    expect(done.consultationId).toBe('consult-new');
    expect(done.fullAnswer).toBe(''); // fallback mode (sem OPENAI_API_KEY)
    expect((done.routedThemes as unknown[])).toBeDefined();
    expect((done.routedHouses as unknown[])).toBeDefined();
    expect(done.tokensUsed).toBe(0);
    expect(prisma.consultation.create).toHaveBeenCalled();
  });

  it('reuses existing consultation when consultationId provided', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockReadingWithContext);
    (prisma.consultation.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'consult-existing',
      readingId: 'reading-1',
    });
    const req = makeRequest({
      readingId: 'reading-1',
      consultationId: 'consult-existing',
      question: 'continua',
    });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    const done = await extractDoneFromResponse(res);
    expect(done.consultationId).toBe('consult-existing');
    expect(prisma.consultation.create).not.toHaveBeenCalled();
  });

  it('returns 400 when consultationId belongs to a different reading', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockReadingWithContext);
    (prisma.consultation.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'consult-other',
      readingId: 'reading-DIFFERENT',
    });
    const req = makeRequest({
      readingId: 'reading-1',
      consultationId: 'consult-other',
      question: 'oi',
    });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('does NOT accept legacy client/matrixData in body (Fase 7 fix)', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockReadingWithContext);
    (prisma.consultation.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockConsultation);
    // Tenta enviar dados no body (comportamento da Fase 4) — deve ser IGNORADO,
    // e tudo deve vir do banco.
    const req = makeRequest({
      readingId: 'reading-1',
      question: 'oi',
      client: { fullName: 'WRONG NAME FROM BODY' },
      matrixData: { 99: { carta: 99, odu: 99 } },
    });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

// =============================================================================
// AD-19.4 Invariant 6 — RAG-closed SSE routing structure
// =============================================================================

describe('AD-19.4 Invariant 6 — RAG-closed SSE routing structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore.current = { 'x-dev-operator-id': 'op-1' };
    delete process.env.OPENAI_API_KEY;
    process.env.ALLOW_DEV_AUTH_BYPASS = 'true';
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockReadingWithContext);
    (prisma.consultation.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockConsultation);
  });

  it('emits event:routing with themes and houses before any other event', async () => {
    const req = makeRequest({ readingId: 'reading-1', question: 'Fale sobre meu amor' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');

    // routing event must be the FIRST named event (before done/error)
    const events = await parseAllSSEvents(res);
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events[0].event).toBe('routing');
    expect(events[0].data.themes).toBeDefined();
    expect(events[0].data.houses).toBeDefined();
    expect(Array.isArray(events[0].data.themes)).toBe(true);
    expect(Array.isArray(events[0].data.houses)).toBe(true);
  });

  it('routes "amor" question to Casa 24 (Coração)', async () => {
    const req = makeRequest({ readingId: 'reading-1', question: 'Fale sobre meu amor e relacionamentos' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(200);
    const routing = await extractRoutingFromResponse(res);
    const houses = routing.houses as number[];
    expect(houses).toContain(24);
  });

  it('routes "dinheiro" question to Casa 34 (finanças)', async () => {
    const req = makeRequest({ readingId: 'reading-1', question: 'Minhas finanças e dinheiro este mês' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(200);
    const routing = await extractRoutingFromResponse(res);
    const houses = routing.houses as number[];
    expect(houses).toContain(34);
  });

  it('routes "trabalho" question to Casa 35 (trabalho/serviço)', async () => {
    const req = makeRequest({ readingId: 'reading-1', question: 'Meu trabalho e emprego profissional' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(200);
    const routing = await extractRoutingFromResponse(res);
    const houses = routing.houses as number[];
    // primary house for trabalho is Casa 35 (House 35 = Work/Service)
    expect(houses).toContain(35);
  });

  it('routing is deterministic — identical question produces identical themes and houses', async () => {
    const question = 'Como está minha vida amorosa?';
    const { POST } = await import('@/app/api/consult/route');

    const req1 = makeRequest({ readingId: 'reading-1', question });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);
    const routing1 = await extractRoutingFromResponse(res1);

    const req2 = makeRequest({ readingId: 'reading-1', question });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
    const routing2 = await extractRoutingFromResponse(res2);

    expect(routing1.themes).toEqual(routing2.themes);
    expect(routing1.houses).toEqual(routing2.houses);
  });

  it('routing is deterministic across 3 identical calls', async () => {
    const question = 'Fale sobre minha espiritualidade';
    const { POST } = await import('@/app/api/consult/route');

    const req1 = makeRequest({ readingId: 'reading-1', question });
    const req2 = makeRequest({ readingId: 'reading-1', question });
    const req3 = makeRequest({ readingId: 'reading-1', question });

    const res1 = await POST(req1);
    const res2 = await POST(req2);
    const res3 = await POST(req3);

    const routing1 = await extractRoutingFromResponse(res1);
    const routing2 = await extractRoutingFromResponse(res2);
    const routing3 = await extractRoutingFromResponse(res3);

    expect(routing1.themes).toEqual(routing2.themes);
    expect(routing2.themes).toEqual(routing3.themes);
    expect(routing1.houses).toEqual(routing2.houses);
    expect(routing2.houses).toEqual(routing3.houses);
  });

  it('different questions produce different routing themes', async () => {
    const { POST } = await import('@/app/api/consult/route');

    const reqAmor = makeRequest({ readingId: 'reading-1', question: 'Meu amor e romance' });
    const reqDin = makeRequest({ readingId: 'reading-1', question: 'Minhas finanças' });

    const resAmor = await POST(reqAmor);
    const resDin = await POST(reqDin);

    const routingAmor = await extractRoutingFromResponse(resAmor);
    const routingDin = await extractRoutingFromResponse(resDin);

    // The two questions are clearly different — routing must not be byte-identical
    expect(JSON.stringify(routingAmor.themes) !== JSON.stringify(routingDin.themes)).toBe(true);
    expect(JSON.stringify(routingAmor.houses) !== JSON.stringify(routingDin.houses)).toBe(true);
  });

  it('done event carries the same routing as the routing event', async () => {
    const req = makeRequest({ readingId: 'reading-1', question: 'Saúde e bem-estar' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(200);

    // Parse all events once — extract both routing and done from the same text
    const events = await parseAllSSEvents(res);
    const routingEvent = events.find((e) => e.event === 'routing');
    const doneEvent = events.find((e) => e.event === 'done');

    expect(routingEvent).toBeDefined();
    expect(doneEvent).toBeDefined();
    expect(doneEvent!.data.routedThemes).toEqual(routingEvent!.data.themes);
    expect(doneEvent!.data.routedHouses).toEqual(routingEvent!.data.houses);
  });

  it('content-type header is text/event-stream', async () => {
    const req = makeRequest({ readingId: 'reading-1', question: 'oi' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.headers.get('content-type')).toMatch(/text\/event-stream/);
  });

  it('dev mode without OPENAI_API_KEY emits error event and valid done event', async () => {
    delete process.env.OPENAI_API_KEY;
    const req = makeRequest({ readingId: 'reading-1', question: 'Fale sobre trabalho' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');

    const events = await parseAllSSEvents(res);
    const eventNames = events.map((e) => e.event);

    // Must have routing, error, and done in dev mode
    expect(eventNames).toContain('routing');
    expect(eventNames).toContain('error');
    expect(eventNames).toContain('done');

    const errorEvent = events.find((e) => e.event === 'error');
    expect(errorEvent?.data.message as string).toMatch(/OPENAI_API_KEY|api.key/i);

    const doneEvent = events.find((e) => e.event === 'done');
    expect(doneEvent?.data.fullAnswer).toBe('');
    expect(doneEvent?.data.tokensUsed).toBe(0);
  });
});
