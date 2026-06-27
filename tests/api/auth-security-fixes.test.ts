/**
 * Auth Security Fixes — Wave 10
 *
 * Testa os fixes aplicados em `docs/SECURITY-FIXES-WAVE10.md`:
 * - F2: /api/auth/logout usa supabase.auth.signOut() real
 * - F3: /api/auth/login-form é bloqueada em prod (NODE_ENV !== 'development')
 * - F11: /api/auth/status + /api/auth/create-test bloqueados em prod
 * - F1: MiniMax lança erro quando MINIMAX_API_TOKEN ausente (fail-closed)
 *
 * Os testes de middleware (F6, F8) ficam em tests/middleware/security-headers.test.ts
 * e tests/middleware/cors-allowed-origins.test.ts.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================
// Mocks globais
// ============================================

// Mock next/headers (cookies)
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    setAll: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

// Mock Supabase server client
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockAdminCreateUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      signOut: mockSignOut,
      getSession: mockGetSession,
    },
  }),
  createAdminClient: vi.fn().mockReturnValue({
    auth: {
      admin: {
        createUser: mockAdminCreateUser,
      },
    },
  }),
}));

// ============================================
// F2 — /api/auth/logout
// ============================================

describe('POST /api/auth/logout (F2 — real Supabase signOut)', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('calls supabase.auth.signOut() on logout', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    const { POST } = await import('@/app/api/auth/logout/route');
    const req = new Request('http://localhost:3000/api/auth/logout', { method: 'POST' });
    const res = await POST(req);

    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(res.status).toBe(303); // See Other (POST-redirect-GET)
    expect(res.headers.get('location')).toContain('/login');
  });

  it('redirects with ?error=logout when signOut fails (does not leak details)', async () => {
    mockSignOut.mockResolvedValue({ error: { message: 'session_expired' } });

    const { POST } = await import('@/app/api/auth/logout/route');
    const req = new Request('http://localhost:3000/api/auth/logout', { method: 'POST' });
    const res = await POST(req);

    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toContain('/login?error=logout');
    // Body should NOT include the raw Supabase error message (F14 — no reconnaissance).
    const body = await res.text();
    expect(body).not.toContain('session_expired');
  });

  it('redirects to /login even if Supabase is not configured (sandbox mode)', async () => {
    vi.doMock('@/lib/supabase/server', () => ({
      createClient: vi.fn().mockResolvedValue(null),
      createAdminClient: vi.fn().mockReturnValue(null),
    }));

    const { POST } = await import('@/app/api/auth/logout/route');
    const req = new Request('http://localhost:3000/api/auth/logout', { method: 'POST' });
    const res = await POST(req);

    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toContain('/login');
  });
});

// ============================================
// F3 — /api/auth/login-form (gated)
// ============================================

describe('POST /api/auth/login-form (F3 — demo bypass gated to dev)', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('returns 404 in production (fail-closed)', async () => {
    process.env.NODE_ENV = 'production';

    const { POST } = await import('@/app/api/auth/login-form/route');
    const formData = new FormData();
    formData.set('email', 'demo@cabala.com');
    formData.set('password', 'Demo123456');

    const req = new Request('http://localhost:3000/api/auth/login-form', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);

    expect(res.status).toBe(404);
  });

  it('returns 404 in test environment (anything other than development)', async () => {
    process.env.NODE_ENV = 'test';

    const { POST } = await import('@/app/api/auth/login-form/route');
    const formData = new FormData();
    formData.set('email', 'demo@cabala.com');
    formData.set('password', 'Demo123456');

    const req = new Request('http://localhost:3000/api/auth/login-form', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);

    expect(res.status).toBe(404);
  });

  it('allows demo bypass only in development', async () => {
    process.env.NODE_ENV = 'development';

    const { POST } = await import('@/app/api/auth/login-form/route');
    const formData = new FormData();
    formData.set('email', 'demo@cabala.com');
    formData.set('password', 'Demo123456');

    const req = new Request('http://localhost:3000/api/auth/login-form', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);

    // Em dev, fluxo cai pro branch de demo bypass — redirect pra /dashboard.
    expect(res.status).toBe(307); // Temporary Redirect (NextResponse.redirect default)
    expect(res.headers.get('location')).toContain('/dashboard');
  });
});

// ============================================
// F11 — /api/auth/status (gated)
// ============================================

describe('GET /api/auth/status (F11 — debug endpoint gated to dev)', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('returns 404 in production', async () => {
    process.env.NODE_ENV = 'production';

    const { GET } = await import('@/app/api/auth/status/route');
    const res = await GET();

    expect(res.status).toBe(404);
    // Confirma que NÃO vaza cookie/session info mesmo no body
    const body = await res.text();
    expect(body).not.toContain('cookies');
    expect(body).not.toContain('userEmail');
  });

  it('returns 404 in test', async () => {
    process.env.NODE_ENV = 'test';

    const { GET } = await import('@/app/api/auth/status/route');
    const res = await GET();

    expect(res.status).toBe(404);
  });

  it('returns session info in development', async () => {
    process.env.NODE_ENV = 'development';
    mockGetSession.mockResolvedValue({
      data: { session: { user: { email: 'dev@cabala.dev', id: 'user-123' } } },
    });

    const { GET } = await import('@/app/api/auth/status/route');
    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.configured).toBe(true);
    expect(body.hasSession).toBe(true);
    expect(body.userEmail).toBe('dev@cabala.dev');
  });
});

// ============================================
// F11 — /api/auth/create-test (gated)
// ============================================

describe('POST /api/auth/create-test (F11 — admin user creation gated to dev)', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('returns 404 in production', async () => {
    process.env.NODE_ENV = 'production';

    const { POST } = await import('@/app/api/auth/create-test/route');
    const res = await POST();

    expect(res.status).toBe(404);
    // Garante que NÃO chama admin.createUser em prod
    expect(mockAdminCreateUser).not.toHaveBeenCalled();
  });

  it('creates user in development', async () => {
    process.env.NODE_ENV = 'development';
    mockAdminCreateUser.mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    });

    const { POST } = await import('@/app/api/auth/create-test/route');
    const res = await POST();

    expect(res.status).toBe(200);
    expect(mockAdminCreateUser).toHaveBeenCalledOnce();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.email).toMatch(/^test\d+@testlogin\.com$/);
  });
});

// ============================================
// F1 — MiniMax token fail-closed
// ============================================

describe('MiniMax API token (F1 — env var only, fail-closed)', () => {
  const originalToken = process.env.MINIMAX_API_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.MINIMAX_API_TOKEN;
    } else {
      process.env.MINIMAX_API_TOKEN = originalToken;
    }
    // Reset fetch mock
    vi.restoreAllMocks();
  });

  it('throws MinimaxError when MINIMAX_API_TOKEN is unset', async () => {
    delete process.env.MINIMAX_API_TOKEN;

    const { generateMinimaxResponse, MinimaxError } = await import('@/lib/ai/minimax');

    await expect(
      generateMinimaxResponse([{ role: 'user', content: 'hi' }])
    ).rejects.toThrow(MinimaxError);

    // Garante que fetch NÃO foi chamado (token ausente = no network call)
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('throws MinimaxError when MINIMAX_API_TOKEN is empty string', async () => {
    process.env.MINIMAX_API_TOKEN = '';

    const { generateMinimaxResponse, MinimaxError } = await import('@/lib/ai/minimax');

    await expect(
      generateMinimaxResponse([{ role: 'user', content: 'hi' }])
    ).rejects.toThrow(MinimaxError);
  });

  it('uses MINIMAX_API_TOKEN from env when set', async () => {
    process.env.MINIMAX_API_TOKEN = 'test-token-from-env-12345';

    // Mock fetch
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'resposta teste' } }],
      }),
    });
    globalThis.fetch = fetchMock as any;

    const { generateMinimaxResponse } = await import('@/lib/ai/minimax');

    const result = await generateMinimaxResponse([{ role: 'user', content: 'hi' }]);

    expect(fetchMock).toHaveBeenCalledOnce();
    const callHeaders = fetchMock.mock.calls[0][1].headers;
    expect(callHeaders.Authorization).toBe('Bearer test-token-from-env-12345');
    expect(result.content).toBe('resposta teste');
  });
});
