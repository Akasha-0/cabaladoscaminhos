/**
 * useAuth hook tests
 * ----------------------------------------------------------------------------
 * Testa o hook canônico em `src/hooks/useAuth.ts` (wrapper sobre
 * SupabaseProvider) com mocks de @supabase/ssr.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  })),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  })),
}));

import { useAuth } from '../useAuth';
import { SupabaseProvider } from '@/components/providers/SupabaseProvider';
import { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <SupabaseProvider>{children}</SupabaseProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

// ============================================================================
// Tests
// ============================================================================

describe('useAuth', () => {
  describe('initial state', () => {
    it('começa com user null e loading=true, e vira loading=false após init', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.user).toBeNull();
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('signIn', () => {
    it('retorna ok=true quando Supabase responde sem erro', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });

      let r: { ok: boolean; error?: string } = { ok: false };
      await act(async () => {
        r = await result.current.signIn('user@example.com', 'senha123');
      });
      expect(r.ok).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('mapeia "Invalid login credentials" para mensagem PT-BR', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        error: { message: 'Invalid login credentials' },
      });
      const { result } = renderHook(() => useAuth(), { wrapper });

      let r: { ok: boolean; error?: string } = { ok: false };
      await act(async () => {
        r = await result.current.signIn('user@example.com', 'wrong');
      });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/senha|incorretos/i);
      expect(result.current.error).toMatch(/senha|incorretos/i);
    });

    it('retorna erro genérico quando Supabase falha com mensagem incomum', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        error: { message: 'Database connection failed' },
      });
      const { result } = renderHook(() => useAuth(), { wrapper });

      let r: { ok: boolean; error?: string } = { ok: false };
      await act(async () => {
        r = await result.current.signIn('user@example.com', 'senha');
      });
      expect(r.ok).toBe(false);
      expect(r.error).toBe('Database connection failed');
    });
  });

  describe('signUp', () => {
    it('passa fullName nos metadata', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: 'u1' }, session: null },
        error: null,
      });
      const { result } = renderHook(() => useAuth(), { wrapper });

      let r: { ok: boolean; error?: string } = { ok: false };
      await act(async () => {
        r = await result.current.signUp('user@example.com', 'senha123', 'Fulano');
      });
      expect(r.ok).toBe(true);
      expect(mockSignUp).toHaveBeenCalledWith(
        'user@example.com',
        'senha123',
        expect.objectContaining({
          data: expect.objectContaining({ full_name: 'Fulano' }),
        }),
      );
    });

    it('retorna erro quando Supabase falha', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      });
      const { result } = renderHook(() => useAuth(), { wrapper });

      let r: { ok: boolean; error?: string } = { ok: false };
      await act(async () => {
        r = await result.current.signUp('user@example.com', 'senha123', 'Fulano');
      });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/cadastrado/i);
    });
  });

  describe('signInWithGoogle', () => {
    it('chama signInWithOAuth com provider google', async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signInWithGoogle();
      });
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' }),
      );
    });
  });

  describe('signOut', () => {
    it('chama supabase.auth.signOut e retorna ok=true', async () => {
      mockSignOut.mockResolvedValueOnce({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });

      let r: { ok: boolean; error?: string } = { ok: false };
      await act(async () => {
        r = await result.current.signOut();
      });
      expect(r.ok).toBe(true);
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('sem Supabase configurado', () => {
    it('retorna erro claro quando envs ausentes', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { result } = renderHook(() => useAuth(), { wrapper });

      let r: { ok: boolean; error?: string } = { ok: true };
      await act(async () => {
        r = await result.current.signIn('a@b.c', '12345678');
      });
      expect(r.ok).toBe(false);
      expect(r.error).toMatch(/indispon/i);
    });
  });
});