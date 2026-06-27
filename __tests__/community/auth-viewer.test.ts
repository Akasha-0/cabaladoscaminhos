// ============================================================================
// COMMUNITY AUTH — Testes do viewer (getViewer + requireViewer)
// ============================================================================
// Foco em src/lib/community/auth.ts:
//   - getViewer retorna null quando não autenticado (sem header dev + sem Supabase)
//   - requireViewer lança erro quando não autenticado
//   - getViewer retorna viewer correto quando há header dev OU sessão Supabase
//
// Mock strategy:
//   - `next/headers` → headers() retorna objeto com get()
//   - `@/lib/supabase-server` → createClient retorna stub { auth.getUser() }
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================================
// Mock setup
// ============================================================================

const headerGetMock = vi.fn();
const headersFnMock = vi.fn(async () => ({
  get: (key: string) => headerGetMock(key),
}));

vi.mock('next/headers', () => ({
  headers: (...args: unknown[]) => headersFnMock(...args),
}));

const getUserMock = vi.fn();

vi.mock('@/lib/supabase-server', () => ({
  createClient: async () => ({
    auth: {
      getUser: (...args: unknown[]) => getUserMock(...args),
    },
  }),
}));

// Import dinâmico DEPOIS dos mocks
const { getViewer, requireViewer } = await import('@/lib/community/auth');

beforeEach(() => {
  vi.clearAllMocks();
  // Default: nenhum header dev, Supabase retorna user null
  headerGetMock.mockReturnValue(null);
  getUserMock.mockResolvedValue({ data: { user: null }, error: null });
});

// ============================================================================
// getViewer — não autenticado
// ============================================================================

describe('getViewer', () => {
  it('retorna null quando não autenticado (sem header dev + Supabase sem user)', async () => {
    const viewer = await getViewer();
    expect(viewer).toBeNull();
  });

  it('retorna user correto via header x-dev-user-id', async () => {
    headerGetMock.mockImplementation((key: string) =>
      key === 'x-dev-user-id' ? 'dev-user-12345' : null
    );

    const viewer = await getViewer();

    expect(viewer).not.toBeNull();
    expect(viewer?.id).toBe('dev-user-12345');
    expect(viewer?.email).toBeNull();
    expect(viewer?.displayName).toMatch(/^Dev dev-us/); // primeiros 6 chars
  });

  it('retorna user correto com sessão Supabase ativa', async () => {
    // Sem header dev
    headerGetMock.mockReturnValue(null);
    // Supabase retorna user autenticado
    getUserMock.mockResolvedValueOnce({
      data: {
        user: {
          id: 'supabase-uid-abc',
          email: 'maria@example.com',
          user_metadata: { display_name: 'Maria de Iansã' },
        },
      },
      error: null,
    });

    const viewer = await getViewer();

    expect(viewer).not.toBeNull();
    expect(viewer?.id).toBe('supabase-uid-abc');
    expect(viewer?.email).toBe('maria@example.com');
    expect(viewer?.displayName).toBe('Maria de Iansã');
  });

  it('fallback para prefixo do email quando display_name ausente', async () => {
    headerGetMock.mockReturnValue(null);
    getUserMock.mockResolvedValueOnce({
      data: {
        user: {
          id: 'u-2',
          email: 'joao@example.com',
          user_metadata: {},
        },
      },
      error: null,
    });

    const viewer = await getViewer();

    expect(viewer?.displayName).toBe('joao');
  });
});

// ============================================================================
// requireViewer — lança erro se não autenticado
// ============================================================================

describe('requireViewer', () => {
  it('lança erro com statusCode 401 quando não autenticado', async () => {
    await expect(requireViewer()).rejects.toMatchObject({
      message: 'Não autenticado',
      statusCode: 401,
    });
  });

  it('retorna viewer quando autenticado via header dev', async () => {
    headerGetMock.mockImplementation((key: string) =>
      key === 'x-dev-user-id' ? 'u-membro-001' : null
    );

    const viewer = await requireViewer();

    expect(viewer.id).toBe('u-membro-001');
    expect(viewer.displayName).toMatch(/^Dev u-mem/);
  });

  it('retorna viewer quando autenticado via Supabase', async () => {
    headerGetMock.mockReturnValue(null);
    getUserMock.mockResolvedValueOnce({
      data: {
        user: {
          id: 'supabase-uid',
          email: 'cigano@example.com',
          user_metadata: {},
        },
      },
      error: null,
    });

    const viewer = await requireViewer();

    expect(viewer.id).toBe('supabase-uid');
    expect(viewer.displayName).toBe('cigano');
  });
});