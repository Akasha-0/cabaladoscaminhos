/**
 * useAuth hook tests
 * ----------------------------------------------------------------------------
 * Cobertura:
 *   - Estado inicial (loading, user, isAuthenticated)
 *   - signIn com sucesso / erro (mensagem traduzida)
 *   - signUp com sucesso / erro (signup "already registered")
 *   - signInWithGoogle delega para supabase.auth.signInWithOAuth
 *   - signOut chama supabase.auth.signOut e retorna ok
 *   - Quando Supabase não está configurado (supabase === null), todos os
 *     métodos devolvem `{ ok: false, error: '...' }` sem explodir.
 *
 * Estratégia: mockar `@/components/providers/SupabaseProvider` injetando um
 * cliente Supabase fake e capturando as chamadas.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';

import type { User, SupabaseClient } from '@supabase/supabase-js';

// ----- Mock do next/navigation -----
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
}));

// ----- Fake Supabase client -----
function makeFakeSupabase(): {
  client: SupabaseClient;
  signInWithPassword: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  signInWithOAuth: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
} {
  const signInWithPassword = vi.fn();
  const signUp = vi.fn();
  const signInWithOAuth = vi.fn();
  const signOut = vi.fn();

  const client = {
    auth: {
      signInWithPassword,
      signUp,
      signInWithOAuth,
      signOut,
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  } as unknown as SupabaseClient;

  return { client, signInWithPassword, signUp, signInWithOAuth, signOut };
}

function makeFakeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-abc-123',
    email: 'teste@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides,
  } as User;
}

// ----- Mock do SupabaseProvider (controlado por teste) -----
let fakeClient: SupabaseClient | null = null;
let fakeUser: User | null = null;
let fakeLoading = true;

vi.mock('@/components/providers/SupabaseProvider', () => ({
  useAuth: () => ({
    user: fakeUser,
    isLoading: fakeLoading,
    isAuthenticated: !!fakeUser && !fakeLoading,
    signOut: vi.fn(),
    supabase: fakeClient,
  }),
}));

// Import after mocks
import { useAuth } from '@/hooks/useAuth';

function wrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

beforeEach(() => {
  vi.clearAllMocks();
  fakeClient = null;
  fakeUser = null;
  fakeLoading = true;
  mockPush.mockReset();
});

describe('useAuth', () => {
  describe('Estado inicial', () => {
    it('expõe loading=true e user=null antes de hidratar', () => {
      fakeClient = makeFakeSupabase().client;
      fakeLoading = true;
      fakeUser = null;

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('expõe loading=false e user preenchido quando hidratado', () => {
      fakeClient = makeFakeSupabase().client;
      fakeLoading = false;
      fakeUser = makeFakeUser();

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(false);
      expect(result.current.user?.id).toBe('user-abc-123');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('signIn', () => {
    it('delega para supabase.auth.signInWithPassword e devolve ok=true', async () => {
      const fake = makeFakeSupabase();
      fakeClient = fake.client;
      fakeLoading = false;
      fake.signInWithPassword.mockResolvedValue({ data: { user: makeFakeUser(), session: null }, error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: Awaited<ReturnType<typeof result.current.signIn>> | undefined;
      await act(async () => {
        response = await result.current.signIn('a@b.com', 'senha123');
      });

      expect(fake.signInWithPassword).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'senha123',
      });
      expect(response).toEqual({ ok: true });
    });

    it('traduz mensagem "Invalid login credentials" para português', async () => {
      const fake = makeFakeSupabase();
      fakeClient = fake.client;
      fakeLoading = false;
      fake.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { name: 'AuthError', message: 'Invalid login credentials' } as never,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: Awaited<ReturnType<typeof result.current.signIn>> | undefined;
      await act(async () => {
        response = await result.current.signIn('x@x.com', 'wrong');
      });

      expect(response?.ok).toBe(false);
      expect(response?.error).toBe('Email ou senha incorretos');
    });

    it('devolve erro quando supabase não está configurado', async () => {
      fakeClient = null;
      fakeLoading = false;

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: Awaited<ReturnType<typeof result.current.signIn>> | undefined;
      await act(async () => {
        response = await result.current.signIn('a@b.com', 'x');
      });

      expect(response?.ok).toBe(false);
      expect(response?.error).toMatch(/indispon/i);
    });
  });

  describe('signUp', () => {
    it('envia emailRedirectTo /onboarding e metadata.full_name', async () => {
      const fake = makeFakeSupabase();
      fakeClient = fake.client;
      fakeLoading = false;
      fake.signUp.mockResolvedValue({ data: { user: makeFakeUser(), session: null }, error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signUp('a@b.com', 'senha123', { fullName: 'Ana Cabral' });
      });

      const call = fake.signUp.mock.calls[0][0];
      expect(call.email).toBe('a@b.com');
      expect(call.password).toBe('senha123');
      expect(call.options?.data?.full_name).toBe('Ana Cabral');
      expect(call.options?.emailRedirectTo).toMatch(/\/onboarding$/);
    });

    it('traduz "user already registered" para português', async () => {
      const fake = makeFakeSupabase();
      fakeClient = fake.client;
      fakeLoading = false;
      fake.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { name: 'AuthError', message: 'User already registered' } as never,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: Awaited<ReturnType<typeof result.current.signUp>> | undefined;
      await act(async () => {
        response = await result.current.signUp('a@b.com', 'senha123', { fullName: 'Ana' });
      });

      expect(response?.ok).toBe(false);
      expect(response?.error).toMatch(/já está cadastrado/);
    });

    it('devolve erro quando supabase não está configurado', async () => {
      fakeClient = null;
      fakeLoading = false;

      const { result } = renderHook(() => useAuth(), { wrapper });

      const response = await result.current.signUp('a@b.com', 'senha123', { fullName: 'Ana' });
      expect(response.ok).toBe(false);
    });
  });

  describe('signInWithGoogle', () => {
    it('delega para signInWithOAuth com provider=google', async () => {
      const fake = makeFakeSupabase();
      fakeClient = fake.client;
      fakeLoading = false;
      fake.signInWithOAuth.mockResolvedValue({ data: { provider: 'google', url: 'https://x' }, error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(fake.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' })
      );
    });

    it('devolve erro quando supabase não está configurado', async () => {
      fakeClient = null;
      fakeLoading = false;
      const { result } = renderHook(() => useAuth(), { wrapper });
      const response = await result.current.signInWithGoogle();
      expect(response.ok).toBe(false);
    });
  });

  describe('signOut', () => {
    it('chama supabase.auth.signOut', async () => {
      const fake = makeFakeSupabase();
      fakeClient = fake.client;
      fakeLoading = false;
      fake.signOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(fake.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('redirectAfterAuth', () => {
    it('redireciona para /feed por padrão', () => {
      fakeClient = makeFakeSupabase().client;
      fakeLoading = false;
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.redirectAfterAuth();
      });

      expect(mockPush).toHaveBeenCalledWith('/feed');
    });

    it('redireciona para o caminho custom quando fornecido', () => {
      fakeClient = makeFakeSupabase().client;
      fakeLoading = false;
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.redirectAfterAuth('/onboarding');
      });

      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });
  });
});