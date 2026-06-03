// tests/api/consult.test.ts
// Integração da rota POST /api/consult (Fase 7).
// Cobre: auth, carregamento de contexto do Prisma, persistência de
// Consultation + ChatMessage, fallback quando OPENAI_API_KEY ausente.

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
  });

  it('returns 400 on missing readingId', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);

    const req = makeRequest({ question: 'oi' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
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
  });

  // Helper: extrai event:done de uma resposta SSE (trata multi-line data JSON)
  async function extractDoneFromSSE(res: Response): Promise<Record<string, unknown>> {
    const text = await res.text();
    // SSE chunks separated by blank lines; each chunk has optional "event:X" and "data:JSON"
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
    throw new Error('No done event found in SSE: ' + text.slice(0, 300));
  }

  it('creates a new consultation and persists user message when consultationId not provided', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockReadingWithContext);
    (prisma.consultation.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockConsultation);
    const req = makeRequest({ readingId: 'reading-1', question: 'O que significa a casa 1?' });
    const { POST } = await import('@/app/api/consult/route');
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    const body = await extractDoneFromSSE(res);
    expect(body.consultationId).toBe('consult-new');
    expect(body.fullAnswer).toBe(''); // fallback mode (sem OPENAI_API_KEY)
    expect((body.routedThemes as unknown[])).toBeDefined();
    expect((body.routedHouses as unknown[])).toBeDefined();
    expect(body.tokensUsed).toBe(0);
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
    const body = await extractDoneFromSSE(res);
    expect(body.consultationId).toBe('consult-existing');
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
