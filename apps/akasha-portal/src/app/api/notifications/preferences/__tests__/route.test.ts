/** @vitest-environment node */
/**
 * /api/notifications/preferences route tests — D-048 (Wave 18.2).
 *
 * Cobre:
 *   - GET retorna todas as 5 prefs (default all enabled quando user sem rows)
 *   - GET retorna mix de prefs persistidas + defaults
 *   - PATCH upsert: cria quando não existe
 *   - PATCH upsert: atualiza quando existe
 *   - PATCH rejeita type inválido (400)
 *   - PATCH rejeita enabled não-boolean (400)
 *   - PATCH rejeita body malformado (400)
 *   - Auth: 401 quando requireAkashaApi retorna erro
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn(),
}));

const mockFindMany = vi.fn();
const mockUpsert = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    notificationPreference: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
  },
}));

import { GET, PATCH } from '../route';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import type { NotificationType } from '@prisma/client';

const mockRequireAkashaApi = vi.mocked(requireAkashaApi);

function makeRequest(
  method: 'GET' | 'PATCH',
  body?: unknown
): NextRequest {
  // Next.js 16's NextRequest constructor expects its own RequestInit (slightly
  // stricter than DOM). Cast keeps the call site readable for tests.
  const init: ConstructorParameters<typeof NextRequest>[1] = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  return new NextRequest('http://localhost/api/notifications/preferences', init);
}

const fakeUser = { id: 'user-1', email: 'u@akasha.app', name: 'User' };

beforeEach(() => {
  mockFindMany.mockReset();
  mockUpsert.mockReset();
  mockRequireAkashaApi.mockReset();
  mockRequireAkashaApi.mockResolvedValue(fakeUser);
});

// ─── GET ─────────────────────────────────────────────────────────────
describe('GET /api/notifications/preferences', () => {
  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as never
    );
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(401);
  });

  it('returns all 5 prefs default-enabled when user has no rows', async () => {
    mockFindMany.mockResolvedValueOnce([]);
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.preferences).toHaveLength(5);
    expect(data.preferences.map((p: { type: string; enabled: boolean }) => p.type)).toEqual([
      'DIARIO',
      'MENTOR',
      'CONEXOES',
      'CREDITS',
      'SYSTEM',
    ]);
    for (const p of data.preferences) {
      expect(p.enabled).toBe(true);
    }
  });

  it('merges persisted rows with defaults', async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        type: 'DIARIO' as NotificationType,
        enabled: false,
        updatedAt: new Date('2026-06-20T10:00:00Z'),
      },
    ]);
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(200);
    const data = await res.json();
    const diario = data.preferences.find(
      (p: { type: string }) => p.type === 'DIARIO'
    );
    const mentor = data.preferences.find(
      (p: { type: string }) => p.type === 'MENTOR'
    );
    expect(diario.enabled).toBe(false);
    expect(mentor.enabled).toBe(true); // default
  });
});

// ─── PATCH ────────────────────────────────────────────────────────────
describe('PATCH /api/notifications/preferences', () => {
  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as never
    );
    const res = await PATCH(makeRequest('PATCH', { type: 'DIARIO', enabled: false }));
    expect(res.status).toBe(401);
  });

  it('rejects malformed JSON body', async () => {
    const init: ConstructorParameters<typeof NextRequest>[1] = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: '{not-json',
    };
    const req = new NextRequest(
      'http://localhost/api/notifications/preferences',
      init
    );
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('rejects body without type', async () => {
    const res = await PATCH(makeRequest('PATCH', { enabled: false }));
    expect(res.status).toBe(400);
  });

  it('rejects invalid type', async () => {
    const res = await PATCH(
      makeRequest('PATCH', { type: 'BOGUS', enabled: false })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/type/);
  });

  it('rejects non-boolean enabled', async () => {
    const res = await PATCH(
      makeRequest('PATCH', { type: 'DIARIO', enabled: 'yes' })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/enabled/);
  });

  it('upserts with composite key userId_type', async () => {
    mockUpsert.mockResolvedValueOnce({
      type: 'DIARIO' as NotificationType,
      enabled: false,
      updatedAt: new Date('2026-06-24T10:00:00Z'),
    });
    const res = await PATCH(
      makeRequest('PATCH', { type: 'DIARIO', enabled: false })
    );
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { userId_type: { userId: 'user-1', type: 'DIARIO' } },
      create: { userId: 'user-1', type: 'DIARIO', enabled: false },
      update: { enabled: false },
      select: { type: true, enabled: true, updatedAt: true },
    });
    const data = await res.json();
    expect(data.preference).toMatchObject({
      type: 'DIARIO',
      enabled: false,
    });
    expect(data.preference.updatedAt).toBe('2026-06-24T10:00:00.000Z');
  });

  it('accepts each of the 5 canonical types', async () => {
    const types = ['DIARIO', 'MENTOR', 'CONEXOES', 'CREDITS', 'SYSTEM'];
    for (const t of types) {
      mockUpsert.mockResolvedValueOnce({
        type: t as NotificationType,
        enabled: true,
        updatedAt: new Date(),
      });
      const res = await PATCH(makeRequest('PATCH', { type: t, enabled: true }));
      expect(res.status).toBe(200);
    }
  });
});
