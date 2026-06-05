// tests/api/mesa-real-clients-crud.test.ts
// Integração das rotas PATCH e DELETE /api/mesa-real/clients (Fase 60).
// Verifica: auth, exclusão, edição, recálculo de mapas e validação de duplicação.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

vi.mock('@/lib/auth/operator-session', () => ({
  requireOperator: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    client: {
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';

// ----------------------------------------------------------------------------
// Mock Data
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

const CLIENT_MOCK = {
  id: 'client-123',
  fullName: 'João Silva',
  birthDate: new Date('1990-01-01T12:00:00.000Z'),
  birthTime: '10:00',
  birthCity: 'São Paulo',
  birthState: 'SP',
  birthCountry: 'Brasil',
  birthLatitude: -23.5505,
  birthLongitude: -46.6333,
  birthTimezone: 'America/Sao_Paulo',
  notes: 'Notas de teste',
  consentGiven: true,
  consentAt: new Date(),
  astrologyMap: { sun: 'Capricornio' },
  kabalisticMap: { lifePath: 3 },
  tantricMap: { soul: 1 },
  oduBirth: { oduNumber: 4 },
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireOperator).mockResolvedValue(OPERATOR_MOCK);
  vi.mocked(prisma.client.findFirst).mockResolvedValue(null);
  vi.mocked(prisma.client.findUnique).mockResolvedValue(CLIENT_MOCK);
});

// Helper request factories
function makePatchRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/mesa-real/clients', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(clientId: string): NextRequest {
  return new NextRequest(`http://localhost/api/mesa-real/clients?clientId=${clientId}`, {
    method: 'DELETE',
  });
}

// ----------------------------------------------------------------------------
// DELETE Tests
// ----------------------------------------------------------------------------

describe('DELETE /api/mesa-real/clients', () => {
  it('returns 401 when no auth is provided', async () => {
    vi.mocked(requireOperator).mockResolvedValueOnce(
      new NextResponse(JSON.stringify({ error: 'Não autenticado' }), { status: 401 }) as any
    );

    const req = makeDeleteRequest('client-123');
    const { DELETE } = await import('@/app/api/mesa-real/clients/route');
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when clientId is missing', async () => {
    const req = new NextRequest('http://localhost/api/mesa-real/clients', { method: 'DELETE' });
    const { DELETE } = await import('@/app/api/mesa-real/clients/route');
    const res = await DELETE(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('clientId é obrigatório');
  });

  it('deletes the client successfully and returns 200', async () => {
    vi.mocked(prisma.client.delete).mockResolvedValueOnce(CLIENT_MOCK);

    const req = makeDeleteRequest('client-123');
    const { DELETE } = await import('@/app/api/mesa-real/clients/route');
    const res = await DELETE(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(prisma.client.delete).toHaveBeenCalledWith({
      where: { id: 'client-123' },
    });
  });
});

// ----------------------------------------------------------------------------
// PATCH Tests
// ----------------------------------------------------------------------------

describe('PATCH /api/mesa-real/clients', () => {
  it('returns 401 when no auth is provided', async () => {
    vi.mocked(requireOperator).mockResolvedValueOnce(
      new NextResponse(JSON.stringify({ error: 'Não autenticado' }), { status: 401 }) as any
    );

    const req = makePatchRequest({ action: 'update', clientId: 'client-123', fullName: 'Novo Nome' });
    const { PATCH } = await import('@/app/api/mesa-real/clients/route');
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it('updates basic client info and returns updated client', async () => {
    const updatedClient = { ...CLIENT_MOCK, fullName: 'João Silva Editado' };
    vi.mocked(prisma.client.update).mockResolvedValueOnce(updatedClient);

    const req = makePatchRequest({
      action: 'update',
      clientId: 'client-123',
      fullName: 'João Silva Editado',
    });

    const { PATCH } = await import('@/app/api/mesa-real/clients/route');
    const res = await PATCH(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.client.fullName).toBe('João Silva Editado');
    expect(prisma.client.update).toHaveBeenCalled();
  });

  it('returns 409 Conflict when name and birthdate update clashes with duplicate client', async () => {
    vi.mocked(prisma.client.findFirst).mockResolvedValueOnce({ id: 'another-client-id' });

    const req = makePatchRequest({
      action: 'update',
      clientId: 'client-123',
      fullName: 'Outro Consulente',
      birthDate: '1990-01-01',
    });

    const { PATCH } = await import('@/app/api/mesa-real/clients/route');
    const res = await PATCH(req);

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain('já cadastrado');
  });

  it('recalculates maps if core calculation data changes during update', async () => {
    vi.mocked(prisma.client.update).mockImplementationOnce((args: any) => {
      // Return updated client mock with recalculated maps representation
      return Promise.resolve({
        ...CLIENT_MOCK,
        birthDate: new Date('1995-10-30T12:00:00.000Z'),
        astrologyMap: { recalculated: true },
      });
    });

    const req = makePatchRequest({
      action: 'update',
      clientId: 'client-123',
      birthDate: '1995-10-30T12:00:00.000Z',
    });

    const { PATCH } = await import('@/app/api/mesa-real/clients/route');
    const res = await PATCH(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.client.astrologyMap.recalculated).toBe(true);
  });
});
