// tests/api/mesa-real-pdf.test.ts
// Integração da rota POST /api/mesa-real/pdf (Fase 55 + 57).
// Cobre: auth (401), content-type (application/json), validação de readingId (400),
// rate-limit (429), leitura não encontrada (404), acesso negado (403).
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import type { Mock } from 'vitest';

// ── Data ─────────────────────────────────────────────────────────────────────────

const mockOperator = {
  id: 'op-1',
  email: 'r@cabala.com',
  name: 'Ramiro',
  passwordHash: 'h',
  role: 'OPERATOR' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockClient = {
  id: 'client-1',
  fullName: 'Maria Silva',
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
  status: 'COMPLETED' as const,
  matrixData: { 1: { carta: { numero: 1 }, odu: { numero: 1 } } },
  date: new Date('2025-01-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockReport = {
  id: 'report-1',
  readingId: 'reading-1',
  content: '<p>Olá Maria</p>',
  llmModel: 'gpt-4o',
  tokensUsed: 100,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date(),
};

// ── Mocks ───────────────────────────────────────────────────────────────────────

vi.mock('@/lib/auth/operator-session', () => ({
  requireOperator: vi.fn<() => Promise<typeof mockOperator | NextResponse>>(),
}));

vi.mock('@/lib/auth/rate-limit', () => ({
  checkOperatorRateLimit: vi.fn<() => Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: number;
    retryAfterSeconds: number;
  }>>(),
  OPERATOR_RATE_LIMITS: {
    'pdf-export': { windowSeconds: 60, max: 5 },
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    reading: {
      findUnique: vi.fn<() => Promise<unknown>>(),
    },
  },
}));

// ── Imports ────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';
import { checkOperatorRateLimit } from '@/lib/auth/rate-limit';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/mesa-real/pdf', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Setup ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  (requireOperator as Mock).mockResolvedValue(mockOperator);
  (checkOperatorRateLimit as Mock).mockResolvedValue({
    allowed: true,
    limit: 5,
    remaining: 4,
    resetAt: Math.floor(Date.now() / 1000) + 60,
    retryAfterSeconds: 0,
  });
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('POST /api/mesa-real/pdf', () => {

  it('returns 401 without operator auth', async () => {
    (requireOperator as Mock).mockResolvedValue(
      NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    );

    const req = makeRequest({ readingId: 'reading-1' });
    const { POST } = await import('@/app/api/mesa-real/pdf/route');
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('returns 400 when readingId is missing', async () => {
    const req = makeRequest({});
    const { POST } = await import('@/app/api/mesa-real/pdf/route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('returns 400 when readingId is empty string', async () => {
    const req = makeRequest({ readingId: '' });
    const { POST } = await import('@/app/api/mesa-real/pdf/route');
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 404 when reading does not exist', async () => {
    (prisma.reading.findUnique as Mock).mockResolvedValue(null);

    const req = makeRequest({ readingId: 'ghost' });
    const { POST } = await import('@/app/api/mesa-real/pdf/route');
    const res = await POST(req);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Leitura não encontrada');
  });

  it('returns 403 when operator does not own the reading', async () => {
    const foreignReading = {
      ...mockReading,
      id: 'foreign-reading',
      operatorId: 'other-operator',
      client: mockClient,
      report: mockReport,
    };
    (prisma.reading.findUnique as Mock).mockResolvedValue(foreignReading);

    const req = makeRequest({ readingId: 'foreign-reading' });
    const { POST } = await import('@/app/api/mesa-real/pdf/route');
    const res = await POST(req);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Acesso negado');
  });

  it('returns 400 when reading has no report (dossiê not yet generated)', async () => {
    const noReportReading = {
      ...mockReading,
      id: 'reading-no-report',
      client: mockClient,
      report: null,
    };
    (prisma.reading.findUnique as Mock).mockResolvedValue(noReportReading);

    const req = makeRequest({ readingId: 'reading-no-report' });
    const { POST } = await import('@/app/api/mesa-real/pdf/route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Dossiê ainda não foi gerado');
  });

  it('returns JSON with correct fields when reading is valid', async () => {
    const fullReading = {
      ...mockReading,
      client: mockClient,
      report: mockReport,
    };
    (prisma.reading.findUnique as Mock).mockResolvedValue(fullReading);

    const req = makeRequest({ readingId: 'reading-1' });
    const { POST } = await import('@/app/api/mesa-real/pdf/route');
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);

    const body = await res.json();
    expect(body.clientName).toBe('Maria Silva');
    expect(body.readingDate).toBeDefined();
    expect(body.reportContent).toBe('<p>Olá Maria</p>');
    expect(body.matrixData).toEqual({ 1: { carta: { numero: 1 }, odu: { numero: 1 } } });
    expect(body.maps).toEqual({
      astrology: { sun: { sign: 'Leão' } },
      kabalistic: { lifePath: 7 },
      tantric: { soul: 2 },
      odu: { oduNumber: 10 },
    });
  });

  it('returns 429 when rate limit is exceeded', async () => {
    (checkOperatorRateLimit as Mock).mockResolvedValue({
      allowed: false,
      limit: 5,
      remaining: 0,
      resetAt: Math.floor(Date.now() / 1000) + 60,
      retryAfterSeconds: 30,
    });

    const req = makeRequest({ readingId: 'reading-1' });
    const { POST } = await import('@/app/api/mesa-real/pdf/route');
    const res = await POST(req);

    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');

    const body = await res.json();
    expect(body.error).toContain('Limite');
    expect(body.retryAfter).toBe(30);
  });

  it('rate-limit 429 includes all required headers', async () => {
    (checkOperatorRateLimit as Mock).mockResolvedValue({
      allowed: false,
      limit: 5,
      remaining: 0,
      resetAt: Math.floor(Date.now() / 1000) + 60,
      retryAfterSeconds: 45,
    });

    const req = makeRequest({ readingId: 'reading-1' });
    const { POST } = await import('@/app/api/mesa-real/pdf/route');
    const res = await POST(req);

    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('45');
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(res.headers.get('X-RateLimit-Reset')).toBeTruthy();
  });

  it('calls prisma with correct include arguments for authenticated request', async () => {
    const fullReading = {
      ...mockReading,
      client: mockClient,
      report: mockReport,
    };
    (prisma.reading.findUnique as Mock).mockResolvedValue(fullReading);

    const req = makeRequest({ readingId: 'reading-1' });
    const { POST } = await import('@/app/api/mesa-real/pdf/route');
    await POST(req);

    expect(prisma.reading.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'reading-1' },
        include: {
          client: {
            select: {
              fullName: true,
              birthDate: true,
              astrologyMap: true,
              kabalisticMap: true,
              tantricMap: true,
              oduBirth: true,
            },
          },
          report: {
            select: {
              content: true,
              createdAt: true,
            },
          },
        },
      })
    );
  });

});
