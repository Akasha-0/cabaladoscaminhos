// tests/api/mesa-real-save.test.ts
// Integração da rota POST /api/mesa-real/save (Fase 7).
// Cobre: auth, validação, criação de Reading.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

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

const mockReading = {
  id: 'reading-new',
  date: new Date('2026-06-01'),
  status: 'PENDING',
  matrixData: { 1: { carta: { numero: 1 }, odu: { numero: 1 } } },
  clientId: 'client-1',
  operatorId: 'op-1',
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
  client: { id: 'client-1', fullName: 'Maria' },
};

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operator: {
      findUnique: vi.fn(),
    },
    client: {
      findUnique: vi.fn(),
    },
    reading: {
      create: vi.fn(),
    },
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
  cookieStore.current = {};
  // Por padrão, o operator está autenticado via dev header
  cookieStore.current['x-dev-operator-id'] = 'op-1';
});

function makeRequest(body: unknown, auth: 'cookie' | 'dev' | 'none' = 'dev'): NextRequest {
  cookieStore.current = {};
  if (auth === 'cookie') cookieStore.current['cockpit_session'] = 'op-1';
  if (auth === 'dev') cookieStore.current['x-dev-operator-id'] = 'op-1';

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (auth === 'cookie') headers['cookie'] = 'cockpit_session=op-1';
  if (auth === 'dev') headers['x-dev-operator-id'] = 'op-1';

  return new NextRequest('http://localhost/api/mesa-real/save', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

// Tests ----------------------------------------------------------------------------

describe('POST /api/mesa-real/save', () => {
  it('returns 401 when no auth is provided', async () => {
    const req = makeRequest({ clientId: 'client-1', matrixData: { 1: { carta: { numero: 1 }, odu: { numero: 1 } } } }, 'none');
    const { POST } = await import('@/app/api/mesa-real/save/route');
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/Não autenticado/);
  });

  it('returns 400 on invalid input (missing clientId)', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);

    const req = makeRequest({ matrixData: { 1: { carta: { numero: 1 }, odu: { numero: 1 } } } });
    const { POST } = await import('@/app/api/mesa-real/save/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when no house is filled', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);

    const req = makeRequest({
      clientId: 'client-1',
      matrixData: { 1: { carta: null, odu: null } },
    });
    const { POST } = await import('@/app/api/mesa-real/save/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.details).toBeDefined();
  });

  it('returns 404 when client does not exist', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);
    (prisma.client.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = makeRequest({
      clientId: 'ghost',
      matrixData: { 1: { carta: { numero: 1, nome: 'A', significado: 'x' }, odu: { numero: 1, nome: 'O', significado: 'x' } } },
    });
    const { POST } = await import('@/app/api/mesa-real/save/route');
    const res = await POST(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/ghost/);
  });

  it('creates reading and returns 201 with reading + filledHouses', async () => {
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);
    (prisma.client.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'client-1' });
    (prisma.reading.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockReading);

    const req = makeRequest({
      clientId: 'client-1',
      matrixData: {
        1: { carta: { numero: 1, nome: 'A', significado: 'x' }, odu: { numero: 1, nome: 'O', significado: 'x' } },
        2: { carta: { numero: 2, nome: 'B', significado: 'x' }, odu: { numero: 2, nome: 'P', significado: 'x' } },
      },
    });
    const { POST } = await import('@/app/api/mesa-real/save/route');
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.filledHouses).toBe(2);
    // NextResponse.json serializa Date → string; comparamos campos-chave.
    expect(body.reading).toMatchObject({
      id: 'reading-new',
      clientId: 'client-1',
      operatorId: 'op-1',
      status: 'PENDING',
      client: { id: 'client-1', fullName: 'Maria' },
    });
    expect(prisma.reading.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clientId: 'client-1',
          operatorId: 'op-1',
          status: 'PENDING',
        }),
      })
    );
  });

  it('authenticates via JWT cookie (not just dev header)', async () => {
    // Fase 8: o cookie precisa ser um JWT válido assinado, não mais um
    // id cru.
    const validToken = jwt.sign(
      { sub: 'op-1', role: 'OPERATOR', type: 'access' },
      process.env.JWT_SECRET || 'dev-only-fallback-secret-do-not-use-in-prod',
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    cookieStore.current = { cockpit_session: validToken };

    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockOperator);
    (prisma.client.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'client-1' });
    (prisma.reading.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockReading);

    const req = new NextRequest('http://localhost/api/mesa-real/save', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `cockpit_session=${validToken}`,
      },
      body: JSON.stringify({
        clientId: 'client-1',
        matrixData: {
          1: { carta: { numero: 1, nome: 'A', significado: 'x' }, odu: { numero: 1, nome: 'O', significado: 'x' } },
        },
      }),
    });
    const { POST } = await import('@/app/api/mesa-real/save/route');
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(prisma.reading.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ operatorId: 'op-1' }),
      })
    );
  });
});
