/**
 * Unit Tests — Auth (Wave 26)
 *
 * Cobre src/lib/auth-impl.ts (signUp, signIn, signOut):
 *   - Happy paths (sucesso)
 *   - Error paths (Supabase retorna erro)
 *   - Metadata passada corretamente
 *
 * Supabase é mockado (sem chamada real). As variáveis NEXT_PUBLIC_SUPABASE_URL
 * e NEXT_PUBLIC_SUPABASE_ANON_KEY são injetadas via setup do vitest.config.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// MOCKS — antes dos imports
// ============================================================================

const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
  })),
}));

import { signUp, signIn, signOut, createClient } from '@/lib/auth-impl';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const mockedCreateClient = vi.mocked(createSupabaseClient);

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// createClient
// =============================================================================

describe('createClient', () => {
  it('cria cliente Supabase com env vars públicas', () => {
    createClient();
    expect(mockedCreateClient).toHaveBeenCalledTimes(1);
    const [url, key] = mockedCreateClient.mock.calls[0];
    expect(url).toBeTruthy();
    expect(key).toBeTruthy();
  });
});

// =============================================================================
// signUp
// =============================================================================

describe('signUp', () => {
  const metadata = {
    nomeCompleto: 'João da Silva',
    dataNascimento: '1990-05-15',
    horaNascimento: '14:30',
    localNascimento: 'São Paulo, SP',
  };

  it('passa email, password e metadata para Supabase', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'joao@example.com' }, session: null },
      error: null,
    });

    await signUp('joao@example.com', 'senha123', metadata);

    expect(mockSignUp).toHaveBeenCalledTimes(1);
    const [args] = mockSignUp.mock.calls[0];
    expect(args.email).toBe('joao@example.com');
    expect(args.password).toBe('senha123');
    expect(args.options.data).toEqual(metadata);
  });

  it('retorna data do Supabase em sucesso', async () => {
    const fakeResponse = {
      data: { user: { id: 'u-1' }, session: { access_token: 'tok' } },
      error: null,
    };
    mockSignUp.mockResolvedValue(fakeResponse);

    const result = await signUp('joao@example.com', 'senha123', metadata);
    expect(result).toEqual(fakeResponse.data);
  });

  it('lança erro quando Supabase retorna error', async () => {
    const fakeError = new Error('User already registered');
    mockSignUp.mockResolvedValue({ data: { user: null, session: null }, error: fakeError });

    await expect(signUp('dup@example.com', 'pwd', metadata)).rejects.toThrow(
      'User already registered'
    );
  });

  it('aceita metadata mínimo (só nomeCompleto + dataNascimento)', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: 'u-2' }, session: null }, error: null });

    await signUp('min@example.com', 'pwd', {
      nomeCompleto: 'Min User',
      dataNascimento: '2000-01-01',
    });

    const call = mockSignUp.mock.calls[0][0];
    expect(call.options.data.horaNascimento).toBeUndefined();
    expect(call.options.data.localNascimento).toBeUndefined();
  });
});

// =============================================================================
// signIn
// =============================================================================

describe('signIn', () => {
  it('passa credenciais para Supabase', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'u-1' }, session: { access_token: 'tok' } },
      error: null,
    });

    await signIn('user@example.com', 'pass123');

    expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
    expect(mockSignInWithPassword.mock.calls[0][0]).toEqual({
      email: 'user@example.com',
      password: 'pass123',
    });
  });

  it('retorna data em sucesso', async () => {
    const fakeData = { user: { id: 'u-1' }, session: { access_token: 'abc' } };
    mockSignInWithPassword.mockResolvedValue({ data: fakeData, error: null });

    const result = await signIn('user@example.com', 'pass');
    expect(result).toEqual(fakeData);
  });

  it('lança erro em credenciais inválidas', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('Invalid login credentials'),
    });

    await expect(signIn('bad@example.com', 'wrong')).rejects.toThrow(
      'Invalid login credentials'
    );
  });
});

// =============================================================================
// signOut
// =============================================================================

describe('signOut', () => {
  it('chama signOut no Supabase', async () => {
    mockSignOut.mockResolvedValue({ error: null });
    await signOut();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('lança erro se Supabase falhar', async () => {
    mockSignOut.mockResolvedValue({ error: new Error('Network error') });
    await expect(signOut()).rejects.toThrow('Network error');
  });

  it('retorna void em sucesso', async () => {
    mockSignOut.mockResolvedValue({ error: null });
    const result = await signOut();
    expect(result).toBeUndefined();
  });
});

// =============================================================================
// Re-exports de auth.ts
// =============================================================================

describe('auth.ts re-exports', () => {
  it('signIn é a mesma função de auth-impl', async () => {
    // Import dinâmico para confirmar re-export
    const authReExports = await import('@/lib/auth');
    expect(authReExports.signIn).toBe(signIn);
    expect(authReExports.signUp).toBe(signUp);
    expect(authReExports.signOut).toBe(signOut);
  });
});