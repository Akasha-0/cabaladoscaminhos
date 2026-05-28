import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNumerologia } from '@/lib/hooks/useNumerologia';
import { mockFetch, setupFetchMock, clearFetchMock } from '../mocks/handlers';

describe('useNumerologia', () => {
  beforeEach(() => {
    setupFetchMock();
    clearFetchMock();
  });

  it('deve iniciar com estado de loading', () => {
    const { result } = renderHook(() => useNumerologia('Maria', '1990-06-15'));
    expect(result.current.loading).toBe(true);
  });

  it('deve carregar dados corretamente quando fetch succeeds', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch({ numero: 7 })
    ).mockResolvedValueOnce(
      mockFetch({ numero: 3 })
    );

    const { result } = renderHook(() => useNumerologia('Maria', '1990-06-15'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pitagorica).toBe(7);
    expect(result.current.cabalistica).toBe(3);
    expect(result.current.error).toBeNull();
  });

  it('deve mostrar erro quando fetch falha', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch({ error: 'Erro' }, false)
    );

    const { result } = renderHook(() => useNumerologia('Maria', '1990-06-15'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('deve calcular tantrica localmente', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch({ numero: 5 })
    ).mockResolvedValueOnce(
      mockFetch({ numero: 8 })
    );

    const { result } = renderHook(() => useNumerologia('Teste', '1990-06-15'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.tantrica).toBe('number');
    expect(result.current.tantrica).toBeGreaterThanOrEqual(1);
    expect(result.current.tantrica).toBeLessThanOrEqual(9);
  });
});