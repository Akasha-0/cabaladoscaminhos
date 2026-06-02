// tests/components/providers/OperatorAuthProvider.test.tsx
// Testes do OperatorAuthProvider (Fase 11).
// Cobre: boot fetch, signIn, signOut, register, isAuthenticated.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { OperatorAuthProvider, useOperatorAuth } from '@/components/providers/OperatorAuthProvider';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: vi.fn() }),
}));

const mockOperator = {
  id: 'op-1',
  email: 'ramiro@cabala.com',
  name: 'Ramiro',
  role: 'OPERATOR' as const,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OperatorAuthProvider>{children}</OperatorAuthProvider>
);

beforeEach(() => {
  mockFetch.mockReset();
  mockRouterPush.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// Boot: fetch /me
// ============================================================================

describe('OperatorAuthProvider — boot', () => {
  it('busca /me na hidratação e seta operator quando autenticado', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ operator: mockOperator }),
    });

    const { result } = renderHook(() => useOperatorAuth(), { wrapper });

    // Antes da hidratação: isLoading=true, operator=null
    expect(result.current.isLoading).toBe(true);
    expect(result.current.operator).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/operator/auth/me', expect.objectContaining({
      credentials: 'include',
    }));
    expect(result.current.operator).toEqual(mockOperator);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('fica null quando /me retorna 401', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    const { result } = renderHook(() => useOperatorAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.operator).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('trata erro de rede graciosamente', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useOperatorAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.operator).toBeNull();
  });

  it('faz apenas 1 fetch mesmo após múltiplos re-renders', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ operator: mockOperator }),
    });

    const { result, rerender } = renderHook(() => useOperatorAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    rerender();
    rerender();
    rerender();

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// signIn
// ============================================================================

describe('OperatorAuthProvider — signIn', () => {
  it('seta operator e retorna ok=true em sucesso', async () => {
    // Boot: /me retorna 401
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    // signIn: /login retorna operator
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ operator: mockOperator }),
    });

    const { result } = renderHook(() => useOperatorAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let res: { ok: boolean; error?: string } | undefined;
    await act(async () => {
      res = await result.current.signIn('ramiro@cabala.com', 'secret123');
    });

    expect(res).toEqual({ ok: true });
    expect(result.current.operator).toEqual(mockOperator);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/operator/auth/login', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ email: 'ramiro@cabala.com', password: 'secret123' }),
    }));
  });

  it('retorna ok=false e mensagem de erro do server em falha', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) }); // boot
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Credenciais inválidas' }),
    });

    const { result } = renderHook(() => useOperatorAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let res: { ok: boolean; error?: string } | undefined;
    await act(async () => {
      res = await result.current.signIn('bad@cabala.com', 'wrong');
    });

    expect(res?.ok).toBe(false);
    expect(res?.error).toBe('Credenciais inválidas');
    expect(result.current.operator).toBeNull();
  });

  it('retorna ok=false com fallback em resposta sem error field', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) }); // boot
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => { throw new Error('bad json'); } });

    const { result } = renderHook(() => useOperatorAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let res: { ok: boolean; error?: string } | undefined;
    await act(async () => {
      res = await result.current.signIn('x@y.com', 'p');
    });

    expect(res?.ok).toBe(false);
    expect(res?.error).toBe('Falha no login');
  });

  it('trata erro de rede no signIn', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) }); // boot
    mockFetch.mockRejectedValueOnce(new Error('connection refused'));

    const { result } = renderHook(() => useOperatorAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let res: { ok: boolean; error?: string } | undefined;
    await act(async () => {
      res = await result.current.signIn('x@y.com', 'p');
    });

    expect(res?.ok).toBe(false);
    expect(res?.error).toMatch(/connection refused/);
  });
});

// ============================================================================
// signOut
// ============================================================================

describe('OperatorAuthProvider — signOut', () => {
  it('limpa operator, chama /logout, e redireciona para /operator/login', async () => {
    // boot: autenticado
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ operator: mockOperator }),
    });

    const { result } = renderHook(() => useOperatorAuth(), { wrapper });
    await waitFor(() => expect(result.current.operator).toEqual(mockOperator));

    // signOut: /logout retorna ok
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockFetch).toHaveBeenLastCalledWith('/api/operator/auth/logout', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
    }));
    expect(result.current.operator).toBeNull();
    expect(mockRouterPush).toHaveBeenCalledWith('/operator/login');
  });

  it('limpa estado mesmo se /logout falhar (best-effort)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ operator: mockOperator }),
    });

    const { result } = renderHook(() => useOperatorAuth(), { wrapper });
    await waitFor(() => expect(result.current.operator).toEqual(mockOperator));

    mockFetch.mockRejectedValueOnce(new Error('network'));

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.operator).toBeNull();
    expect(mockRouterPush).toHaveBeenCalledWith('/operator/login');
  });
});

// ============================================================================
// register
// ============================================================================

describe('OperatorAuthProvider — register', () => {
  it('seta operator e retorna ok=true em sucesso', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) }); // boot
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ operator: mockOperator }),
    });

    const { result } = renderHook(() => useOperatorAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let res: { ok: boolean; error?: string } | undefined;
    await act(async () => {
      res = await result.current.register('Ramiro', 'ramiro@cabala.com', 'secret123');
    });

    expect(res).toEqual({ ok: true });
    expect(result.current.operator).toEqual(mockOperator);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/operator/auth/register', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'Ramiro', email: 'ramiro@cabala.com', password: 'secret123' }),
    }));
  });

  it('retorna ok=false com erro do server', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Email já cadastrado' }),
    });

    const { result } = renderHook(() => useOperatorAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let res: { ok: boolean; error?: string } | undefined;
    await act(async () => {
      res = await result.current.register('X', 'x@y.com', 'password123');
    });

    expect(res?.ok).toBe(false);
    expect(res?.error).toBe('Email já cadastrado');
  });
});

// ============================================================================
// refresh
// ============================================================================

describe('OperatorAuthProvider — refresh', () => {
  it('refaz a query de /me e atualiza operator', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) }); // boot
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ operator: mockOperator }),
    });

    const { result } = renderHook(() => useOperatorAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.operator).toBeNull();

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.operator).toEqual(mockOperator);
  });
});

// ============================================================================
// erro quando usado fora do provider
// ============================================================================

describe('useOperatorAuth — fora do provider', () => {
  it('lança erro explícito', () => {
    // Suprime o erro do console.error durante este teste
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useOperatorAuth());
    }).toThrow(/OperatorAuthProvider/);

    consoleError.mockRestore();
  });
});
