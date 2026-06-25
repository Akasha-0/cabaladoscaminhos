/**
 * /api/export/usage — testes
 *
 * Cobre:
 *   - 401 sem auth
 *   - 400 com format inválido
 *   - 200 CSV (default) com header RFC 4180 e BOM
 *   - 200 JSON via ?format=json com summary correto
 *   - CSV escapa vírgulas e aspas
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockRequireAkashaApi = vi.fn();
const mockCreditEntryFindMany = vi.fn();
const mockCreditEntryAggregate = vi.fn();
const mockSubscriptionFindUnique = vi.fn();

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: (...args: unknown[]) => mockRequireAkashaApi(...args),
}));

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    creditEntry: {
      findMany: (...args: unknown[]) => mockCreditEntryFindMany(...args),
      aggregate: (...args: unknown[]) => mockCreditEntryAggregate(...args),
    },
    subscription: {
      findUnique: (...args: unknown[]) => mockSubscriptionFindUnique(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(url: string) {
  return new NextRequest(url);
}

describe('GET /api/export/usage', () => {
  it('retorna 401 sem auth', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    );
    const { GET } = await import('./route');
    const res = await GET(makeRequest('http://localhost/api/export/usage'));
    expect(res.status).toBe(401);
  });

  it('retorna 400 com format inválido', async () => {
    mockRequireAkashaApi.mockResolvedValue({
      id: 'user-1',
      email: 'x@y.com',
      name: 'X',
    });
    mockCreditEntryFindMany.mockResolvedValue([]);
    mockCreditEntryAggregate.mockResolvedValue({ _sum: { delta: 0 }, _count: { _all: 0 } });
    mockSubscriptionFindUnique.mockResolvedValue(null);

    const { GET } = await import('./route');
    const res = await GET(makeRequest('http://localhost/api/export/usage?format=xml'));
    expect(res.status).toBe(400);
  });

  it('retorna CSV (default) com BOM e header', async () => {
    mockRequireAkashaApi.mockResolvedValue({
      id: 'user-2',
      email: 'csv@example.com',
      name: 'CSV User',
    });
    mockCreditEntryFindMany.mockResolvedValue([
      {
        id: 'e1',
        delta: 10,
        reason: 'signup_bonus',
        balance: 10,
        createdAt: new Date('2025-01-01T10:00:00Z'),
      },
      {
        id: 'e2',
        delta: -1,
        reason: 'consult, oracle', // vírgula no reason — testa escape
        balance: 9,
        createdAt: new Date('2025-01-02T10:00:00Z'),
      },
    ]);
    mockCreditEntryAggregate.mockResolvedValue({ _sum: { delta: 9 }, _count: { _all: 2 } });
    mockSubscriptionFindUnique.mockResolvedValue({
      plan: 'FREEMIUM',
      status: 'ACTIVE',
      monthlyCreditQuota: 0,
      currentPeriodEnd: null,
    });

    const { GET } = await import('./route');
    const res = await GET(makeRequest('http://localhost/api/export/usage'));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/csv');
    expect(res.headers.get('Content-Disposition')).toMatch(/\.csv/);

    const csvBytes = new Uint8Array(await res.arrayBuffer());
    // BOM para Excel (0xEF, 0xBB, 0xBF em UTF-8 — bytes; equivalente a U+FEFF)
    expect(csvBytes[0]).toBe(0xef);
    expect(csvBytes[1]).toBe(0xbb);
    expect(csvBytes[2]).toBe(0xbf);
    // Header (decode manually para checar BOM separado do header)
    const csv = new TextDecoder('utf-8').decode(csvBytes);
    expect(csv).toContain('id,createdAt,delta,reason,balance');
    // Linha com vírgula dentro de aspas (RFC 4180)
    expect(csv).toContain('"consult, oracle"');
  });

  it('retorna JSON via ?format=json', async () => {
    mockRequireAkashaApi.mockResolvedValue({
      id: 'user-3',
      email: 'json@example.com',
      name: 'JSON User',
    });
    mockCreditEntryFindMany.mockResolvedValue([
      {
        id: 'e1',
        delta: 30,
        reason: 'pro_bonus',
        balance: 30,
        createdAt: new Date('2025-02-01T00:00:00Z'),
      },
    ]);
    mockCreditEntryAggregate.mockResolvedValue({ _sum: { delta: 30 }, _count: { _all: 1 } });
    mockSubscriptionFindUnique.mockResolvedValue({
      plan: 'AKASHA_PRO',
      status: 'ACTIVE',
      monthlyCreditQuota: 30,
      currentPeriodEnd: new Date('2026-12-31'),
    });

    const { GET } = await import('./route');
    const res = await GET(
      makeRequest('http://localhost/api/export/usage?format=json'),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');

    const payload = await res.json();
    expect(payload.version).toBe('1.0');
    expect(payload.userId).toBe('user-3');
    expect(payload.summary.totalEntries).toBe(1);
    expect(payload.summary.totalCreditsDelta).toBe(30);
    expect(payload.summary.currentBalance).toBe(30);
    expect(payload.summary.plan).toBe('AKASHA_PRO');
    expect(payload.entries).toHaveLength(1);
    expect(payload.entries[0].reason).toBe('pro_bonus');
  });
});