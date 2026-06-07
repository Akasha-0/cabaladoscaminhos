import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

process.env.AKASHA_ADMIN_SECRET = 'secret';

const mockRequireAkashaApi = vi.fn();
vi.mock('@/lib/auth/akasha-guard', () => ({
  requireAkashaApi: (req: NextRequest) => mockRequireAkashaApi(req),
}));

const mockCreditAggregate = vi.fn();
const mockCreditCreate = vi.fn();
const mockUserFindUnique = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    creditEntry: {
      aggregate: (...args: unknown[]) => mockCreditAggregate(...args),
      create: (...args: unknown[]) => mockCreditCreate(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
  },
}));

function makeGetRequest(): NextRequest {
  return new NextRequest('http://localhost/api/akasha/credits', { method: 'GET' });
}

function makePostRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/akasha/credits', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('GET /api/akasha/credits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 quando não autenticado', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    );

    const { GET } = await import('@/app/api/akasha/credits/route');
    const res = await GET(makeGetRequest());

    expect(res.status).toBe(401);
  });

  it('retorna balance agregado do ledger', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce({ id: 'user-1' });
    mockCreditAggregate.mockResolvedValueOnce({ _sum: { delta: 7 } });

    const { GET } = await import('@/app/api/akasha/credits/route');
    const res = await GET(makeGetRequest());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ balance: 7 });
  });
});

describe('POST /api/akasha/credits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 403 quando x-admin-secret é inválido', async () => {
    const { POST } = await import('@/app/api/akasha/credits/route');
    const res = await POST(makePostRequest({ userId: 'user-1', amount: 10 }, { 'x-admin-secret': 'nope' }));

    expect(res.status).toBe(403);
  });

  it('retorna 400 quando body é inválido', async () => {
    const { POST } = await import('@/app/api/akasha/credits/route');
    const res = await POST(makePostRequest({ amount: 10 }, { 'x-admin-secret': 'secret' }));

    expect(res.status).toBe(400);
  });

  it('retorna 404 quando usuário não existe', async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);

    const { POST } = await import('@/app/api/akasha/credits/route');
    const res = await POST(makePostRequest({ userId: 'user-404', amount: 10 }, { 'x-admin-secret': 'secret' }));

    expect(res.status).toBe(404);
  });

  it('credita e retorna o novo saldo', async () => {
    mockUserFindUnique.mockResolvedValueOnce({ id: 'user-1' });
    mockCreditAggregate.mockResolvedValueOnce({ _sum: { delta: 5 } });
    mockCreditCreate.mockResolvedValueOnce({ id: 'ce-1' });

    const { POST } = await import('@/app/api/akasha/credits/route');
    const res = await POST(
      makePostRequest(
        { userId: 'user-1', amount: 3, reason: 'admin_credit' },
        { 'x-admin-secret': 'secret' }
      )
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.balance).toBe(8);
    expect(mockCreditCreate).toHaveBeenCalledWith({
      data: { userId: 'user-1', delta: 3, reason: 'admin_credit', balance: 8 },
    });
  });
});
