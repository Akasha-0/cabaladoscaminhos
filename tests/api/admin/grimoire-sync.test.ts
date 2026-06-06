import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockRequireAkashaApi = vi.fn();
vi.mock('@/lib/auth/akasha-guard', () => ({
  requireAkashaApi: (req: NextRequest) => mockRequireAkashaApi(req),
}));

const mockUserFindUnique = vi.fn();
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => mockUserFindUnique(...args) },
  },
}));

const mockSyncGrimoire = vi.fn();
vi.mock('@/lib/grimoire/sync', () => ({
  syncGrimoire: () => mockSyncGrimoire(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GRIMOIRE_SYNC_SECRET = 'super-secret-sync-key';
  process.env.GITHUB_WEBHOOK_SECRET = 'github-webhook-secret-123';
});

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function makePostRequest(
  body: string,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest('http://localhost:3000/api/admin/webhooks/grimoire-sync', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  });
}

function hmacSign(body: string, secret: string): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
}

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe('POST /api/admin/webhooks/grimoire-sync', () => {
  it('retorna 401 quando nao autenticado e sem token de autorizacao', async () => {
    mockRequireAkashaApi.mockResolvedValue(
      NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    );

    const { POST } = await import('@/app/api/admin/webhooks/grimoire-sync/route');
    const res = await POST(makePostRequest('{}'));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/Não autorizado/);
  });

  it('retorna 200 e executa sync quando Bearer token de webhook e valido', async () => {
    mockSyncGrimoire.mockResolvedValue({
      success: true,
      count: 16,
      warnings: [],
    });

    const { POST } = await import('@/app/api/admin/webhooks/grimoire-sync/route');
    const res = await POST(makePostRequest('{}', {
      authorization: 'Bearer super-secret-sync-key',
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/Sincronização concluída/);
    expect(body.count).toBe(16);
    expect(mockSyncGrimoire).toHaveBeenCalled();
  });

  it('retorna 200 e executa sync quando HMAC-SHA256 do GitHub e valido', async () => {
    const rawBody = JSON.stringify({ ref: 'refs/heads/main' });
    const signature = hmacSign(rawBody, 'github-webhook-secret-123');

    mockSyncGrimoire.mockResolvedValue({
      success: true,
      count: 39,
      warnings: [],
    });

    const { POST } = await import('@/app/api/admin/webhooks/grimoire-sync/route');
    const res = await POST(makePostRequest(rawBody, {
      'x-hub-signature-256': signature,
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/Sincronização concluída/);
    expect(body.count).toBe(39);
    expect(mockSyncGrimoire).toHaveBeenCalled();
  });

  it('retorna 401 quando HMAC-SHA256 e invalido (assinatura incorreta)', async () => {
    mockRequireAkashaApi.mockResolvedValue(
      NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    );

    const { POST } = await import('@/app/api/admin/webhooks/grimoire-sync/route');
    const res = await POST(makePostRequest('{}', {
      'x-hub-signature-256': 'sha256=' + 'a'.repeat(64), // assinatura inválida
    }));

    expect(res.status).toBe(401);
    expect(mockSyncGrimoire).not.toHaveBeenCalled();
  });

  it('retorna 200 e executa sync quando operador e ADMIN autenticado', async () => {
    mockRequireAkashaApi.mockResolvedValue({ id: 'user-admin-1' });
    mockUserFindUnique.mockResolvedValue({ role: 'ADMIN' });
    mockSyncGrimoire.mockResolvedValue({
      success: true,
      count: 10,
      warnings: ['Some minor warning'],
    });

    const { POST } = await import('@/app/api/admin/webhooks/grimoire-sync/route');
    const res = await POST(makePostRequest('{}'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/Sincronização concluída/);
    expect(body.count).toBe(10);
    expect(body.warnings).toContain('Some minor warning');
    expect(mockSyncGrimoire).toHaveBeenCalled();
  });

  it('retorna 500 quando syncGrimoire falha', async () => {
    mockSyncGrimoire.mockRejectedValue(new Error('disk full'));

    const { POST } = await import('@/app/api/admin/webhooks/grimoire-sync/route');
    const res = await POST(makePostRequest('{}', {
      authorization: 'Bearer super-secret-sync-key',
    }));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/Falha durante a sincronização/);
    expect(body.details).toBe('disk full');
  });
});
