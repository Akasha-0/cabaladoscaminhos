/**
 * /api/export/map — testes
 *
 * Cobre:
 *   - 401 sem auth
 *   - 200 + JSON versionado com schema 1.0
 *   - LGPD: campos sensíveis omitidos (passwordHash, stripeCustomerId,
 *     currentRefreshTokenJti, push subscription auth/p256dh)
 *   - Content-Disposition com filename .json
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockRequireAkashaApi = vi.fn();
const mockUserFindUnique = vi.fn();
const mockBirthChartFindUnique = vi.fn();
const mockSubscriptionFindUnique = vi.fn();
const mockManifestoFindUnique = vi.fn();
const mockDailyReadingFindFirst = vi.fn();

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: (...args: unknown[]) => mockRequireAkashaApi(...args),
}));

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => mockUserFindUnique(...args) },
    birthChart: {
      findUnique: (...args: unknown[]) => mockBirthChartFindUnique(...args),
    },
    subscription: {
      findUnique: (...args: unknown[]) => mockSubscriptionFindUnique(...args),
    },
    manifesto: {
      findUnique: (...args: unknown[]) => mockManifestoFindUnique(...args),
    },
    dailyReading: {
      findFirst: (...args: unknown[]) => mockDailyReadingFindFirst(...args),
    },
  },
}));

function makeRequest() {
  return new NextRequest('http://localhost/api/export/map');
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/export/map', () => {
  it('retorna 401 sem auth', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    );
    const { GET } = await import('./route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('retorna 200 com payload versionado e sem campos sensíveis', async () => {
    mockRequireAkashaApi.mockResolvedValue({
      id: 'user-789',
      email: 'maria@example.com',
      name: 'Maria Silva',
    });

    // Simula user completo (incluindo campos sensíveis) — verifica que NÃO
    // aparecem no payload.
    mockUserFindUnique.mockResolvedValue({
      id: 'user-789',
      email: 'maria@example.com',
      emailVerified: true,
      name: 'Maria Silva',
      locale: 'pt-BR',
      role: 'MEMBER',
      birthDate: new Date('1985-03-10'),
      birthTime: '08:15',
      birthCity: 'Rio de Janeiro',
      birthLatitude: -22.9,
      birthLongitude: -43.2,
      birthTimezone: 'America/Sao_Paulo',
      ichingMap: { hexagram: 2 },
      ichingEnabled: true,
      intentionProfile: { focus: 'career' },
      consentAt: new Date('2025-01-01'),
      pushEnabled: false,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2026-01-01'),
    });
    mockBirthChartFindUnique.mockResolvedValue({
      id: 'chart-1',
      astrologyMap: { sun: 'Peixes' },
      kabalisticMap: null,
      tantricMap: null,
      oduBirth: null,
      ichingMap: null,
      incomplete: false,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    });
    mockSubscriptionFindUnique.mockResolvedValue({
      plan: 'AKASHA_PRO',
      status: 'ACTIVE',
      monthlyCreditQuota: 30,
      currentPeriodEnd: new Date('2026-07-01'),
      dashboardUntil: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    });
    mockManifestoFindUnique.mockResolvedValue(null);
    mockDailyReadingFindFirst.mockResolvedValue(null);

    const { GET } = await import('./route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    expect(res.headers.get('X-Export-Schema-Version')).toBe('1.0');
    expect(res.headers.get('Content-Disposition')).toMatch(/\.json/);

    const payload = await res.json();
    expect(payload.version).toBe('1.0');
    expect(payload.lgpd).toBeDefined();
    expect(payload.user.email).toBe('maria@example.com');
    expect(payload.user.name).toBe('Maria Silva');
    expect(payload.birth.birthCity).toBe('Rio de Janeiro');
    expect(payload.mandala).toBeTruthy();
    expect(payload.subscription.plan).toBe('AKASHA_PRO');

    // LGPD: serialize completo e busca strings sensíveis — NUNCA devem aparecer
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain('passwordHash');
    expect(serialized).not.toContain('currentRefreshTokenJti');
    expect(serialized).not.toContain('stripeCustomerId');
    expect(serialized).not.toContain('stripeSubscriptionId');
    expect(serialized).not.toContain('p256dh');
  });
});