// ============================================================
// MESA REAL READINGS — Authorization Tests
// Cabala Dos Caminhos
//
// Tests CRITICAL-1: ownership check on GET/PATCH/DELETE by readingId
// Tests CRITICAL-2: operatorId from session, not body
//
// Run with: pnpm test -- --project integration tests/integration/mesa-real-auth.test.ts
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ----------------------------------------------------------------------------
// Mock operators
// ----------------------------------------------------------------------------

const OPERATOR_A = {
  id: 'op-operator-a',
  email: 'operatora@cabala.com',
  name: 'Operator A',
  passwordHash: 'hash',
  role: 'OPERATOR' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  failedLoginAttempts: 0,
  lockedUntil: null,
};

const OPERATOR_B = {
  id: 'op-operator-b',
  email: 'operatorb@cabala.com',
  name: 'Operator B',
  passwordHash: 'hash',
  role: 'OPERATOR' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  failedLoginAttempts: 0,
  lockedUntil: null,
};

const CLIENT = {
  id: 'client-1',
  fullName: 'João Cliente',
  birthDate: new Date('1990-01-01'),
  birthTime: '10:00',
  birthCity: 'São Paulo',
  birthState: 'SP',
  birthCountry: 'BR',
  consentGiven: true,
  consentAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ----------------------------------------------------------------------------
// Mock reading (owned by Operator B)
// ----------------------------------------------------------------------------

const READING_BY_B = {
  id: 'reading-b-1',
  clientId: 'client-1',
  operatorId: OPERATOR_B.id, // NOT operator A
  matrixData: {},
  status: 'PENDING' as const,
  date: new Date(),
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  client: CLIENT,
  report: null,
};

// ----------------------------------------------------------------------------
// Mock functions
// ----------------------------------------------------------------------------

const requireOperatorMock = vi.fn<(request: NextRequest) => ReturnType<typeof import('@/lib/auth/operator-session').requireOperator>>();
const getReadingMock = vi.fn<(id: string) => ReturnType<typeof import('@/lib/db/reading-actions').getReading>>();
const createReadingMock = vi.fn<(input: unknown) => ReturnType<typeof import('@/lib/db/reading-actions').createReading>>();
const updateMatrixDataMock = vi.fn<(id: string, data: unknown) => ReturnType<typeof import('@/lib/db/reading-actions').updateMatrixData>>();
const updateReadingStatusMock = vi.fn<(id: string, status: unknown) => ReturnType<typeof import('@/lib/db/reading-actions').updateReadingStatus>>();
const deleteReadingMock = vi.fn<(id: string) => ReturnType<typeof import('@/lib/db/reading-actions').deleteReading>>();
const saveReportMock = vi.fn<(input: unknown) => ReturnType<typeof import('@/lib/db/reading-actions').saveReport>>();
const getReadingsByClientMock = vi.fn<(id: string) => ReturnType<typeof import('@/lib/db/reading-actions').getReadingsByClient>>();
const getReadingsByOperatorMock = vi.fn<(id: string) => ReturnType<typeof import('@/lib/db/reading-actions').getReadingsByOperator>>();
const getReportByReadingMock = vi.fn<(id: string) => ReturnType<typeof import('@/lib/db/reading-actions').getReportByReading>>;

// ----------------------------------------------------------------------------
// Module mocks (must be top-level)
// ----------------------------------------------------------------------------

vi.mock('@/lib/auth/operator-session', () => ({
  requireOperator: (request: NextRequest) => requireOperatorMock(request) as ReturnType<typeof import('@/lib/auth/operator-session').requireOperator>,
}));

vi.mock('@/lib/db/reading-actions', () => ({
  getReading: (id: string) => getReadingMock(id),
  createReading: (input: unknown) => createReadingMock(input),
  updateMatrixData: (id: string, data: unknown) => updateMatrixDataMock(id, data),
  updateReadingStatus: (id: string, status: unknown) => updateReadingStatusMock(id, status),
  deleteReading: (id: string) => deleteReadingMock(id),
  saveReport: (input: unknown) => saveReportMock(input),
  getReadingsByClient: (id: string) => getReadingsByClientMock(id),
  getReadingsByOperator: (id: string) => getReadingsByOperatorMock(id),
  getReportByReading: (id: string) => getReportByReadingMock(id),
}));

// ----------------------------------------------------------------------------
// Route handlers (imported after mocks)
// ----------------------------------------------------------------------------

let routeHandlers: {
  GET: (request: NextRequest) => Promise<Response>;
  POST: (request: NextRequest) => Promise<Response>;
  PATCH: (request: NextRequest) => Promise<Response>;
  DELETE: (request: NextRequest) => Promise<Response>;
};

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  const mod = await import('@/app/api/mesa-real/readings/route');
  routeHandlers = mod;
});

afterEach(() => {
  vi.clearAllMocks();
});

// ----------------------------------------------------------------------------
// Test helpers
// ----------------------------------------------------------------------------

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(url, init);
}

// ----------------------------------------------------------------------------
// CRITICAL-1 Tests: Ownership check on GET by readingId
// ----------------------------------------------------------------------------

describe('GET /api/mesa-real/readings?readingId=X — CRITICAL-1', () => {
  it('retorna 403 quando operator tenta ler leitura de outro operator', async () => {
    requireOperatorMock.mockResolvedValue(OPERATOR_A);
    getReadingMock.mockResolvedValue(READING_BY_B);

    const req = makeRequest('GET', 'http://localhost/api/mesa-real/readings?readingId=reading-b-1');
    const res = await routeHandlers.GET(req);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Acesso negado');
  });

  it('retorna 404 quando leitura não existe', async () => {
    requireOperatorMock.mockResolvedValue(OPERATOR_A);
    getReadingMock.mockResolvedValue(null);

    const req = makeRequest('GET', 'http://localhost/api/mesa-real/readings?readingId=nonexistent');
    const res = await routeHandlers.GET(req);

    expect(res.status).toBe(404);
  });

  it('retorna 200 quando operator tenta ler sua própria leitura', async () => {
    const ownReading = { ...READING_BY_B, operatorId: OPERATOR_A.id };
    requireOperatorMock.mockResolvedValue(OPERATOR_A);
    getReadingMock.mockResolvedValue(ownReading);

    const req = makeRequest('GET', 'http://localhost/api/mesa-real/readings?readingId=reading-a-1');
    const res = await routeHandlers.GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reading).toBeDefined();
    expect(body.reading.operatorId).toBe(OPERATOR_A.id);
  });
});

// ----------------------------------------------------------------------------
// CRITICAL-1 Tests: Ownership check on PATCH by readingId
// ----------------------------------------------------------------------------

describe('PATCH /api/mesa-real/readings — CRITICAL-1', () => {
  it('retorna 403 quando operator tenta modificar leitura de outro operator', async () => {
    requireOperatorMock.mockResolvedValue(OPERATOR_A);
    getReadingMock.mockResolvedValue(READING_BY_B);

    const req = makeRequest('PATCH', 'http://localhost/api/mesa-real/readings', {
      readingId: 'reading-b-1',
      matrixData: { 1: { carta: 1, odu: 1 } },
    });
    const res = await routeHandlers.PATCH(req);

    expect(res.status).toBe(403);
    expect(getReadingMock).toHaveBeenCalledWith('reading-b-1');
    // Não deve chamar updateMatrixData — abortou por falta de ownership
    expect(updateMatrixDataMock).not.toHaveBeenCalled();
  });

  it('retorna 403 ao tentar atualizar status de leitura de outro operator', async () => {
    requireOperatorMock.mockResolvedValue(OPERATOR_A);
    getReadingMock.mockResolvedValue(READING_BY_B);

    const req = makeRequest('PATCH', 'http://localhost/api/mesa-real/readings', {
      readingId: 'reading-b-1',
      status: 'COMPLETED',
    });
    const res = await routeHandlers.PATCH(req);

    expect(res.status).toBe(403);
    expect(updateReadingStatusMock).not.toHaveBeenCalled();
  });

  it('retorna 404 quando leitura não existe', async () => {
    requireOperatorMock.mockResolvedValue(OPERATOR_A);
    getReadingMock.mockResolvedValue(null);

    const req = makeRequest('PATCH', 'http://localhost/api/mesa-real/readings', {
      readingId: 'nonexistent',
      matrixData: { 1: { carta: 1, odu: 1 } },
    });
    const res = await routeHandlers.PATCH(req);

    expect(res.status).toBe(404);
  });

  it('retorna 200 quando operator modifica sua própria leitura', async () => {
    const ownReading = { ...READING_BY_B, operatorId: OPERATOR_A.id };
    requireOperatorMock.mockResolvedValue(OPERATOR_A);
    getReadingMock.mockResolvedValue(ownReading);
    const updated = { ...ownReading, matrixData: { 1: { carta: 1, odu: 1 } } };
    updateMatrixDataMock.mockResolvedValue(updated);

    const req = makeRequest('PATCH', 'http://localhost/api/mesa-real/readings', {
      readingId: 'reading-a-1',
      matrixData: { 1: { carta: 1, odu: 1 } },
    });
    const res = await routeHandlers.PATCH(req);

    expect(res.status).toBe(200);
    expect(updateMatrixDataMock).toHaveBeenCalledWith('reading-a-1', { 1: { carta: 1, odu: 1 } });
  });
});

// ----------------------------------------------------------------------------
// CRITICAL-1 Tests: Ownership check on DELETE by readingId
// ----------------------------------------------------------------------------

describe('DELETE /api/mesa-real/readings?readingId=X — CRITICAL-1', () => {
  it('retorna 403 quando operator tenta deletar leitura de outro operator', async () => {
    requireOperatorMock.mockResolvedValue(OPERATOR_A);
    getReadingMock.mockResolvedValue(READING_BY_B);

    const req = makeRequest('DELETE', 'http://localhost/api/mesa-real/readings?readingId=reading-b-1');
    const res = await routeHandlers.DELETE(req);

    expect(res.status).toBe(403);
    expect(deleteReadingMock).not.toHaveBeenCalled();
  });

  it('retorna 404 quando leitura não existe', async () => {
    requireOperatorMock.mockResolvedValue(OPERATOR_A);
    getReadingMock.mockResolvedValue(null);

    const req = makeRequest('DELETE', 'http://localhost/api/mesa-real/readings?readingId=nonexistent');
    const res = await routeHandlers.DELETE(req);

    expect(res.status).toBe(404);
  });

  it('retorna 200 quando operator deleta sua própria leitura', async () => {
    const ownReading = { ...READING_BY_B, operatorId: OPERATOR_A.id };
    requireOperatorMock.mockResolvedValue(OPERATOR_A);
    getReadingMock.mockResolvedValue(ownReading);
    deleteReadingMock.mockResolvedValue(ownReading);

    const req = makeRequest('DELETE', 'http://localhost/api/mesa-real/readings?readingId=reading-a-1');
    const res = await routeHandlers.DELETE(req);

    expect(res.status).toBe(200);
    expect(deleteReadingMock).toHaveBeenCalledWith('reading-a-1');
  });
});

// ----------------------------------------------------------------------------
// CRITICAL-2 Tests: operatorId from session, not body
// ----------------------------------------------------------------------------

describe('POST /api/mesa-real/readings — CRITICAL-2', () => {
  it('cria leitura com operatorId da sessão, ignorando qualquer operatorId no body', async () => {
    requireOperatorMock.mockResolvedValue(OPERATOR_A);
    const createdReading = { ...READING_BY_B, operatorId: OPERATOR_A.id };
    createReadingMock.mockResolvedValue(createdReading);

    // Enviar body com operatorId malicioso (tentativa de forjar ownership)
    const req = makeRequest('POST', 'http://localhost/api/mesa-real/readings', {
      clientId: 'client-1',
      operatorId: OPERATOR_B.id, // Tentativa de forjar para Operator B
      matrixData: {},
    });

    const res = await routeHandlers.POST(req);

    expect(res.status).toBe(201);
    // O operatorId usado deve ser o do OPERATOR_A (da sessão), não o do body
    expect(createReadingMock).toHaveBeenCalledWith({
      clientId: 'client-1',
      operatorId: OPERATOR_A.id, // CORRETO: extraído da sessão
      matrixData: {},
    });
  });

  it('cria leitura com sucesso mesmo quando body contém operatorId ausente ou vazio', async () => {
    requireOperatorMock.mockResolvedValue(OPERATOR_A);
    const createdReading = { ...READING_BY_B, operatorId: OPERATOR_A.id };
    createReadingMock.mockResolvedValue(createdReading);

    // Body sem operatorId (schema agora só exige clientId)
    const req = makeRequest('POST', 'http://localhost/api/mesa-real/readings', {
      clientId: 'client-1',
    });

    const res = await routeHandlers.POST(req);

    expect(res.status).toBe(201);
    expect(createReadingMock).toHaveBeenCalledWith({
      clientId: 'client-1',
      operatorId: OPERATOR_A.id,
      matrixData: undefined,
    });
  });

  it('retorna 400 quando clientId falta no body (schema validation)', async () => {
    requireOperatorMock.mockResolvedValue(OPERATOR_A);

    const req = makeRequest('POST', 'http://localhost/api/mesa-real/readings', {
      // clientId ausente — operatorId no body é ignorado
      operatorId: OPERATOR_B.id,
    });

    const res = await routeHandlers.POST(req);

    expect(res.status).toBe(400);
    expect(createReadingMock).not.toHaveBeenCalled();
  });
});

// ----------------------------------------------------------------------------
// Auth guard: unauthenticated requests return 401
// ----------------------------------------------------------------------------

describe('Auth guard — unauthenticated requests', () => {
  it('GET retorna 401 sem sessão', async () => {
    const unauthorizedResponse = new NextResponse(JSON.stringify({ error: 'Não autenticado' }), { status: 401 });
    requireOperatorMock.mockResolvedValue(unauthorizedResponse);

    const req = makeRequest('GET', 'http://localhost/api/mesa-real/readings?readingId=reading-b-1');
    const res = await routeHandlers.GET(req);

    expect(res.status).toBe(401);
  });

  it('POST retorna 401 sem sessão', async () => {
    const unauthorizedResponse = new NextResponse(JSON.stringify({ error: 'Não autenticado' }), { status: 401 });
    requireOperatorMock.mockResolvedValue(unauthorizedResponse);

    const req = makeRequest('POST', 'http://localhost/api/mesa-real/readings', { clientId: 'client-1' });
    const res = await routeHandlers.POST(req);

    expect(res.status).toBe(401);
    expect(createReadingMock).not.toHaveBeenCalled();
  });

  it('PATCH retorna 401 sem sessão', async () => {
    const unauthorizedResponse = new NextResponse(JSON.stringify({ error: 'Não autenticado' }), { status: 401 });
    requireOperatorMock.mockResolvedValue(unauthorizedResponse);

    const req = makeRequest('PATCH', 'http://localhost/api/mesa-real/readings', { readingId: 'reading-b-1', matrixData: {} });
    const res = await routeHandlers.PATCH(req);

    expect(res.status).toBe(401);
  });

  it('DELETE retorna 401 sem sessão', async () => {
    const unauthorizedResponse = new NextResponse(JSON.stringify({ error: 'Não autenticado' }), { status: 401 });
    requireOperatorMock.mockResolvedValue(unauthorizedResponse);

    const req = makeRequest('DELETE', 'http://localhost/api/mesa-real/readings?readingId=reading-b-1');
    const res = await routeHandlers.DELETE(req);

    expect(res.status).toBe(401);
  });
});
