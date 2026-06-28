/**
 * SupabaseProvider — useAuth hook test (Wave 11)
 * ----------------------------------------------------------------------------
 * Garante que o provider expõe tanto `useSupabase` (legacy) quanto `useAuth`
 * (usado por src/hooks/useAuth.ts). Valida que o shape está compatível com
 * os consumidores existentes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  })),
}));

import { SupabaseProvider, useSupabase, useAuth } from '../SupabaseProvider';

function wrapper({ children }: { children: React.ReactNode }) {
  return <SupabaseProvider>{children}</SupabaseProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

// ============================================================================
// Tests
// ============================================================================

describe('SupabaseProvider', () => {
  describe('useAuth (wave 11)', () => {
    it('expõe user=null + isAuthenticated=false antes da sessão carregar', async () => {
      mockGetSession.mockResolvedValueOnce({ data: { session: null } });
      const { result } = renderHook(() => useAuth(), { wrapper });
      // Antes do useEffect rodar, isLoading=true
      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.supabase).not.toBeNull();
    });

    it('expõe user populado + isAuthenticated=true quando sessão existe', async () => {
      const mockUser = { id: 'u-1', email: 'a@b.c' };
      mockGetSession.mockResolvedValueOnce({
        data: { session: { user: mockUser } },
      });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('useSupabase (legacy)', () => {
    it('continua exportado com shape { supabase, session, isLoading }', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'u-1' } } },
      });
      const { result } = renderHook(() => useSupabase(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.supabase).not.toBeNull();
      expect(result.current.session).toEqual({ user: { id: 'u-1' } });
    });
  });
});
