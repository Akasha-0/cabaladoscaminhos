/**
 * Auth Wave 11 Endpoints — Reset Password, Resend Verification, Profile Auto-Create
 * ----------------------------------------------------------------------------
 * Cobre os 3 novos endpoints criados em Wave 11:
 *   - POST /api/auth/reset-password
 *   - POST /api/auth/resend-verification
 *   - POST /api/auth/profile-auto-create
 *
 * Foco em:
 *   - Validação Zod (body inválido → 400)
 *   - Anti-enumeração (sempre retorna 200 OK para emails válidos, mesmo
 *     quando Supabase reporta "user not found")
 *   - Sandbox (Supabase não configurado → 503 explícito)
 *   - Profile auto-create: auth obrigatório (401 sem sessão)
 *   - Profile auto-create: upsert idempotente
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ----------------------------------------------------------------------------
// Mocks globais
// ----------------------------------------------------------------------------

const mockResetPasswordForEmail = vi.fn();
const mockResend = vi.fn();
const mockGetUser = vi.fn();
const mockSpiritualProfileFindUnique = vi.fn();
const mockSpiritualProfileUpsert = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    setAll: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
      resend: mockResend,
      getUser: mockGetUser,
    },
  }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    spiritualProfile: {
      findUnique: mockSpiritualProfileFindUnique,
      upsert: mockSpiritualProfileUpsert,
    },
  },
}));

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function postRequest(url: string, body: Record<string, unknown>) {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
});

// ============================================================================
// POST /api/auth/reset-password
// ============================================================================

describe('POST /api/auth/reset-password', () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('@/app/api/auth/reset-password/route');
    POST = mod.POST;
  });

  it('retorna 400 quando body não é JSON válido', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('retorna 400 quando email é inválido', async () => {
    const res = await POST(postRequest('http://localhost:3000/api/auth/reset-password', { email: 'not-an-email' }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error.toLowerCase()).toContain('email');
  });

  it('retorna 200 OK quando Supabase envia email com sucesso', async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });
    const res = await POST(postRequest('http://localhost:3000/api/auth/reset-password', { email: 'user@example.com' }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.objectContaining({ redirectTo: expect.stringContaining('/login?reset=success') })
    );
  });

  it('retorna 200 OK mesmo quando Supabase reporta erro (anti-enumeração)', async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: { message: 'User not found' },
    });
    const res = await POST(postRequest('http://localhost:3000/api/auth/reset-password', { email: 'ghost@example.com' }));
    expect(res.status).toBe(200);
  });

  it('retorna 503 quando Supabase não está configurado', async () => {
    vi.resetModules();
    vi.doMock('@/lib/supabase/server', () => ({
      createClient: vi.fn().mockResolvedValue(null),
    }));
    const mod = await import('@/app/api/auth/reset-password/route');
    const res = await mod.POST(postRequest('http://localhost:3000/api/auth/reset-password', { email: 'user@example.com' }));
    expect(res.status).toBe(503);
  });
});

// ============================================================================
// POST /api/auth/resend-verification
// ============================================================================

describe('POST /api/auth/resend-verification', () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('@/app/api/auth/resend-verification/route');
    POST = mod.POST;
  });

  it('retorna 400 quando body é inválido (email ausente)', async () => {
    const res = await POST(postRequest('http://localhost:3000/api/auth/resend-verification', {}));
    expect(res.status).toBe(400);
  });

  it('retorna 200 OK quando Supabase reenvia com sucesso', async () => {
    mockResend.mockResolvedValueOnce({ error: null });
    const res = await POST(postRequest('http://localhost:3000/api/auth/resend-verification', { email: 'new@example.com' }));
    expect(res.status).toBe(200);
    expect(mockResend).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'signup',
        email: 'new@example.com',
        options: expect.objectContaining({ emailRedirectTo: expect.any(String) }),
      })
    );
  });

  it('retorna 200 OK mesmo quando Supabase reporta erro (anti-enumeração)', async () => {
    mockResend.mockResolvedValueOnce({ error: { message: 'rate limit exceeded' } });
    const res = await POST(postRequest('http://localhost:3000/api/auth/resend-verification', { email: 'someone@example.com' }));
    expect(res.status).toBe(200);
  });
});

// ============================================================================
// POST /api/auth/profile-auto-create
// ============================================================================

describe('POST /api/auth/profile-auto-create', () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('@/app/api/auth/profile-auto-create/route');
    POST = mod.POST;
  });

  it('retorna 401 quando user não está autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'no session' } });
    const res = await POST(postRequest('http://localhost:3000/api/auth/profile-auto-create', { fullName: 'Maria Silva' }));
    expect(res.status).toBe(401);
  });

  it('retorna 400 quando body é inválido (fullName ausente)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u-1', email: 'a@b.c' } }, error: null });
    const res = await POST(postRequest('http://localhost:3000/api/auth/profile-auto-create', {}));
    expect(res.status).toBe(400);
  });

  it('cria SpiritualProfile quando user autenticado e body válido', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u-123', email: 'a@b.c' } }, error: null });
    mockSpiritualProfileFindUnique.mockResolvedValueOnce(null);
    mockSpiritualProfileUpsert.mockResolvedValueOnce({ id: 'sp-abc' });

    const res = await POST(
      postRequest('http://localhost:3000/api/auth/profile-auto-create', {
        fullName: 'Maria Silva',
        birthDate: '1990-04-15',
      })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; profileId: string; created: boolean };
    expect(body.ok).toBe(true);
    expect(body.profileId).toBe('sp-abc');
    expect(body.created).toBe(true);

    // birthDate foi parseado para Date ISO
    expect(mockSpiritualProfileUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u-123' },
        create: expect.objectContaining({
          userId: 'u-123',
          birthName: 'Maria Silva',
          birthDate: new Date('1990-04-15T00:00:00.000Z'),
        }),
      })
    );
  });

  it('marca created=false quando SpiritualProfile já existe (upsert idempotente)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u-existing', email: 'a@b.c' } }, error: null });
    mockSpiritualProfileFindUnique.mockResolvedValueOnce({ id: 'sp-existing' });
    mockSpiritualProfileUpsert.mockResolvedValueOnce({ id: 'sp-existing' });

    const res = await POST(
      postRequest('http://localhost:3000/api/auth/profile-auto-create', { fullName: 'João Souza' })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; created: boolean };
    expect(body.created).toBe(false);
  });

  it('retorna 503 quando Supabase não está configurado', async () => {
    vi.resetModules();
    vi.doMock('@/lib/supabase/server', () => ({
      createClient: vi.fn().mockResolvedValue(null),
    }));
    const mod = await import('@/app/api/auth/profile-auto-create/route');
    const res = await mod.POST(postRequest('http://localhost:3000/api/auth/profile-auto-create', { fullName: 'X' }));
    expect(res.status).toBe(503);
  });
});
