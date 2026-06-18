/**
 * useAkashaSynthesis — Test coverage
 *
 * Tests the React hook that fetches daily Akasha synthesis.
 * The hook is a client component that:
 * 1. Calls fetch('/api/akasha/daily') on mount / refresh
 * 2. Tracks loading / error / data state
 * 3. Exposes refetch() to invalidate
 * 4. Skips network when disabled=true
 */
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAkashaSynthesis } from './useAkashaSynthesis';

// ─── fetch mock ───────────────────────────────────────────────────────

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeDailyContent() {
  return {
    date: '2026-06-16',
    climate: 'Dia de colheita',
    ritual: {
      titulo: 'Ritual do Fogo',
      instrucao: 'Acenda uma vela e respire 3 vezes',
      cor: '#FF9500',
      elemento: 'fogo',
    },
    alert: 'Lua cheia em Capricórnio',
    tensionPoint: {
      dimension: 'carreiraProsperidade',
      theme: 'Pressão interna',
      intensity: 65,
    },
    moonPhase: 'cheia',
    overallTheme: 'Manifestação',
    synthesis: {
      akashaProfile: {
        dominantFrequency: 'gift',
        overallFrequencyScore: 75,
        transformationStage: 'embodying',
        activeSequence: 'purpose',
      },
      lifePath: 3,
      areas: {},
      dailyDecision: {
        strategy: 'Aguardar',
        strategyExplanation: 'Respire antes de agir',
        authority: 'Emocional',
        authorityQuestion: 'O que sinto agora?',
        recommendation: 'Mova com calma',
        avoid: 'Decisões impulsivas',
      },
      synthesisParagraph: 'Sua síntese geral do dia.',
    },
  };
}

// ─── Initial state ─────────────────────────────────────────────────────

describe('useAkashaSynthesis — initial state', () => {
  it('starts with loading=true and null data, then resolves to data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeDailyContent(),
    });

    const { result } = renderHook(() => useAkashaSynthesis({ userId: 'user-1' }));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe('function');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.date).toBe('2026-06-16');
    expect(result.current.synthesis).not.toBeNull();
  });

  it('exposes synthesis derived from data (synthesis = data?.synthesis ?? null)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeDailyContent(),
    });

    const { result } = renderHook(() => useAkashaSynthesis({ userId: 'user-2' }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.synthesis).toBe(result.current.data?.synthesis);
    expect(result.current.synthesis?.lifePath).toBe(3);
  });
});

// ─── Error handling ────────────────────────────────────────────────────

describe('useAkashaSynthesis — error handling', () => {
  it('captures HTTP error when response.ok is false (error case)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useAkashaSynthesis({ userId: 'user-3' }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('500');
    expect(result.current.data).toBeNull();
    expect(result.current.synthesis).toBeNull();
  });

  it('captures network failure (fetch throws)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network down'));

    const { result } = renderHook(() => useAkashaSynthesis({ userId: 'user-4' }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network down');
  });
});

// ─── disabled flag (edge case) ────────────────────────────────────────

describe('useAkashaSynthesis — disabled flag', () => {
  it('skips fetch and resolves loading=false when enabled=false (edge case)', async () => {
    const { result } = renderHook(() => useAkashaSynthesis({ userId: 'user-5', enabled: false }));

    // No fetch should have been issued
    expect(mockFetch).not.toHaveBeenCalled();

    // Loading should be false (no in-flight request)
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

// ─── refetch ──────────────────────────────────────────────────────────

describe('useAkashaSynthesis — refetch', () => {
  it('refetch() triggers a new fetch call', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeDailyContent(),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...makeDailyContent(), date: '2026-06-17' }),
      });

    const { result } = renderHook(() => useAkashaSynthesis({ userId: 'user-6' }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.date).toBe('2026-06-16');

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data?.date).toBe('2026-06-17');
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
