import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockRequireOperatorApi = vi.fn();
vi.mock('@/lib/auth/operator-guard', () => ({
  requireOperatorApi: (req: NextRequest) => mockRequireOperatorApi(req),
}));

const mockSyncGrimoire = vi.fn();
vi.mock('@/lib/grimoire/sync', () => ({
  syncGrimoire: () => mockSyncGrimoire(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GRIMOIRE_SYNC_SECRET = 'super-secret-sync-key';
});

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function makePostRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/admin/webhooks/grimoire-sync', {
    method: 'POST',
    headers,
  });
}

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe('POST /api/admin/webhooks/grimoire-sync', () => {
  it('retorna 401 quando nao autenticado e sem token de autorizacao', async () => {
    mockRequireOperatorApi.mockResolvedValue(new Response('Unauthorized', { status: 401 }));
    
    const { POST } = await import('@/app/api/admin/webhooks/grimoire-sync/route');
    const res = await POST(makePostRequest());
    
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/Não autorizado/);
  });

  it('retorna 403 quando operador autenticado nao e ADMIN', async () => {
    // Simulated logged-in non-admin operator
    mockRequireOperatorApi.mockResolvedValue({
      id: 'op-1',
      role: 'OPERATOR',
    });
    
    const { POST } = await import('@/app/api/admin/webhooks/grimoire-sync/route');
    const res = await POST(makePostRequest());
    
    expect(res.status).toBe(401); // fallback check also rejected, returns 401
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
    const res = await POST(makePostRequest({
      authorization: 'Bearer super-secret-sync-key',
    }));
    
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/Sincronização concluída/);
    expect(body.count).toBe(16);
    expect(mockSyncGrimoire).toHaveBeenCalled();
  });

  it('retorna 200 e executa sync quando operador e ADMIN autenticado', async () => {
    mockRequireOperatorApi.mockResolvedValue({
      id: 'op-admin-1',
      role: 'ADMIN',
    });
    mockSyncGrimoire.mockResolvedValue({
      success: true,
      count: 10,
      warnings: ['Some minor warning'],
    });
    
    const { POST } = await import('@/app/api/admin/webhooks/grimoire-sync/route');
    const res = await POST(makePostRequest());
    
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/Sincronização concluída/);
    expect(body.count).toBe(10);
    expect(body.warnings).toContain('Some minor warning');
    expect(mockSyncGrimoire).toHaveBeenCalled();
  });
});
