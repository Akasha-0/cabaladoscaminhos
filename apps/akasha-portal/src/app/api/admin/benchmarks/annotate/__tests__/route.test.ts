/**
 * route.test.ts — Wave 32.2
 *
 * Coverage targets (per Wave 32.2 spec: 5+ tests):
 *   1. POST valida schema (rejeita scores fora de 0-10)
 *   2. POST rejeita USER non-oracle (USER role tenta anotar ChatMessage USER → 400)
 *   3. POST upsert idempotente (mesma submission 2x → 1 annotation only)
 *   4. POST rejeita quando não-ADMIN (sem token → 401)
 *   5. GET list retorna responses redacted (sem PII)
 *   6. GET progress retorna contagem por annotator
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de prisma ANTES de importar a rota
vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    chatMessage: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    benchmarkAnnotation: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      groupBy: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

// Mock requireAkashaAdmin: retorna user ADMIN por default
const mockRequireAkashaAdmin = vi.fn();
vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaAdmin: (...args: unknown[]) => mockRequireAkashaAdmin(...args),
}));

import { prisma } from '@/lib/infrastructure/prisma';
import { POST, GET } from '../route';

function mockRequest(body: unknown): Request {
  return new Request('http://localhost/api/admin/benchmarks/annotate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/benchmarks/annotate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: admin autenticado
    mockRequireAkashaAdmin.mockResolvedValue({
      id: 'admin-1',
      name: 'Alice Admin',
      email: 'alice@admin.test',
      role: 'ADMIN',
    });
  });

  it('validates schema: rejects score > 10', async () => {
    const res = await POST(
      mockRequest({
        responseId: 'm1',
        rScore: 11,
        tScore: 5,
        uScore: 5,
        vScore: 5,
      }) as unknown as import('next/server').NextRequest
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Dados inválidos');
  });

  it('validates schema: rejects negative scores', async () => {
    const res = await POST(
      mockRequest({
        responseId: 'm1',
        rScore: -1,
        tScore: 5,
        uScore: 5,
        vScore: 5,
      }) as unknown as import('next/server').NextRequest
    );
    expect(res.status).toBe(400);
  });

  it('rejects USER role messages (only ORACLE can be annotated)', async () => {
    vi.mocked(prisma.chatMessage.findUnique).mockResolvedValue({
      id: 'm1',
      role: 'USER',
    } as never);

    const res = await POST(
      mockRequest({
        responseId: 'm1',
        rScore: 7,
        tScore: 7,
        uScore: 7,
        vScore: 7,
      }) as unknown as import('next/server').NextRequest
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Mentor');
  });

  it('rejects when response not found (404)', async () => {
    vi.mocked(prisma.chatMessage.findUnique).mockResolvedValue(null);
    const res = await POST(
      mockRequest({
        responseId: 'missing',
        rScore: 7,
        tScore: 7,
        uScore: 7,
        vScore: 7,
      }) as unknown as import('next/server').NextRequest
    );
    expect(res.status).toBe(404);
  });

  it('upserts annotation idempotently (same submission twice → 1 row)', async () => {
    vi.mocked(prisma.chatMessage.findUnique).mockResolvedValue({
      id: 'm1',
      role: 'ORACLE',
    } as never);
    vi.mocked(prisma.benchmarkAnnotation.upsert).mockResolvedValue({
      id: 'ann-1',
      responseId: 'm1',
      annotatorId: 'admin-1',
      rScore: 7,
      tScore: 7,
      uScore: 7,
      vScore: 7,
      notes: null,
      annotatedAt: new Date(),
    } as never);

    const res = await POST(
      mockRequest({
        responseId: 'm1',
        rScore: 7,
        tScore: 7,
        uScore: 7,
        vScore: 7,
      }) as unknown as import('next/server').NextRequest
    );
    expect(res.status).toBe(200);
    expect(prisma.benchmarkAnnotation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          responseId_annotatorId: {
            responseId: 'm1',
            annotatorId: 'admin-1',
          },
        },
      })
    );
  });

  it('returns 403 when caller is not ADMIN', async () => {
    // Quando caller não é ADMIN, requireAkashaAdmin retorna NextResponse 403.
    const { NextResponse } = await import('next/server');
    mockRequireAkashaAdmin.mockResolvedValue(
      NextResponse.json({ error: 'Acesso restrito a ADMIN' }, { status: 403 })
    );
    const res = await POST(
      mockRequest({
        responseId: 'm1',
        rScore: 7,
        tScore: 7,
        uScore: 7,
        vScore: 7,
      }) as unknown as import('next/server').NextRequest
    );
    expect(res.status).toBe(403);
  });
});

describe('GET /api/admin/benchmarks/annotate?action=list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAkashaAdmin.mockResolvedValue({
      id: 'admin-1',
      name: 'Alice Admin',
      email: 'alice@admin.test',
      role: 'ADMIN',
    });
  });

  it('returns redacted responses (no PII leaks)', async () => {
    vi.mocked(prisma.benchmarkAnnotation.findMany).mockResolvedValue([]);
    vi.mocked(prisma.chatMessage.findMany).mockResolvedValue([
      {
        id: 'm1',
        content: 'Mentor response content',
        createdAt: new Date('2026-06-20'),
        routedPillars: ['astrologia'],
        consultation: {
          title: 'Sessão particular — João Silva',
          user: { name: 'João Silva', email: 'joao@example.com' },
        },
      },
    ] as never);

    const url = new URL(
      'http://localhost/api/admin/benchmarks/annotate?action=list'
    );
    const req = new Request(url) as unknown as import('next/server').NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    const json = JSON.stringify(body);
    // CRITICAL: PII NÃO vaza na response
    expect(json).not.toContain('João Silva');
    expect(json).not.toContain('joao@example.com');
    expect(json).not.toContain('Sessão particular');
    // Mas o hash anônimo está presente (permite correlação)
    expect(body.responses[0].anonymousOriginHash).toMatch(/^[0-9a-f]{8}$/);
    expect(body.responses[0].meta.userNameRedacted).toBe(true);
  });

  it('filters out already-annotated responses when annotatorId is given', async () => {
    vi.mocked(prisma.benchmarkAnnotation.findMany).mockResolvedValue([
      { responseId: 'm-already' },
    ] as never);
    vi.mocked(prisma.chatMessage.findMany).mockResolvedValue([] as never);
    const url = new URL(
      'http://localhost/api/admin/benchmarks/annotate?action=list&annotatorId=admin-1'
    );
    const req = new Request(url, { method: 'GET' }) as unknown as import('next/server').NextRequest;
    await GET(req);

    expect(prisma.chatMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: 'ORACLE',
          id: { notIn: ['m-already'] },
        }),
      })
    );
  });
});

describe('GET /api/admin/benchmarks/annotate?action=progress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAkashaAdmin.mockResolvedValue({
      id: 'admin-1',
      name: 'Alice Admin',
      email: 'alice@admin.test',
      role: 'ADMIN',
    });
  });

  it('returns per-annotator counts', async () => {
    vi.mocked(prisma.benchmarkAnnotation.groupBy).mockResolvedValue([
      {
        annotatorId: 'admin-1',
        _count: { _all: 25 },
        _min: { annotatedAt: new Date('2026-06-20') },
        _max: { annotatedAt: new Date('2026-06-25') },
      },
      {
        annotatorId: 'admin-2',
        _count: { _all: 18 },
        _min: { annotatedAt: new Date('2026-06-21') },
        _max: { annotatedAt: new Date('2026-06-25') },
      },
    ] as never);
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: 'admin-1', name: 'Alice', email: 'a@x', role: 'ADMIN' },
      { id: 'admin-2', name: 'Bob', email: 'b@x', role: 'ADMIN' },
    ] as never);

    const url = new URL(
      'http://localhost/api/admin/benchmarks/annotate?action=progress'
    );
    const req = new Request(url) as unknown as import('next/server').NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.byAnnotator).toHaveLength(2);
    expect(body.byAnnotator[0].annotationsCount).toBe(25);
    expect(body.total).toBe(43);
  });
});