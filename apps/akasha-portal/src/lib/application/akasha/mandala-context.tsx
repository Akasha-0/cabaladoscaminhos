'use client';

/**
 * mandala-context.tsx — MandalaContext provider (Phase 3)
 *
 * Provides mandala layer state + Akasha synthesis/authority to all child
 * components of the Mandala chart without prop-drilling.
 *
 * Layer state comes from useLayerState() (Phase 1 contract).
 * Synthesis comes from useAkashaSynthesis() — fetched once per mount.
 * AkashaAuthority is derived server-side from the 5 pilares, surfaced
 * through synthesis.dailyDecision (F-227).
 */
import { createContext, useContext, useMemo } from 'react';
import type { Layer } from '@/components/akasha/mandala-geometry';
import { useLayerState } from '@/components/akasha/hooks/useLayerState';
import { useAkashaSynthesis } from '@/components/akasha/dashboard/hooks/useAkashaSynthesis';
import type {
  AkashaSynthesisUI,
  DailyContentUI,
} from '@/components/akasha/dashboard/hooks/useAkashaSynthesis';
import type { AkashaAuthorityPromptProps } from '@/components/akasha/AkashaAuthorityPrompt/AkashaAuthorityPrompt';

// ─── Context value ────────────────────────────────────────────────────────────

/** Shape exposed by MandalaContext. */
export interface MandalaContextValue {
  // Layer interaction state
  activeLayer: Layer | null;
  hoveredLayer: Layer | null;
  ringPaused: boolean;
  opacity: (layer: Layer) => number;
  setActiveLayer: (layer: Layer) => void;
  setHoveredLayer: (layer: Layer | null) => void;
  // Akasha synthesis (from /api/akasha/daily)
  dailyContent: DailyContentUI | null;
  synthesis: AkashaSynthesisUI | null;
  synthesisLoading: boolean;
  synthesisError: Error | null;
  refetchSynthesis: () => void;
  // F-227: Akasha Authority derived from synthesis
  authority: AkashaAuthorityPromptProps['authority'] | null;
}

// ─── Context ─────────────────────────────────────────────────────────────────

export const MandalaContext = createContext<MandalaContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────────────

/** Consume MandalaContext. Throws in isolation (unit test guard). */
export function useMandalaContext(): MandalaContextValue {
  const ctx = useContext(MandalaContext);
  if (!ctx) {
    throw new Error(
      'useMandalaContext must be used inside <MandalaProvider>. ' +
      'Wrap your tree with MandalaProvider first.'
    );
  }
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface MandalaProviderProps {
  children: React.ReactNode;
  /** userId passed to useAkashaSynthesis. Defaults to 'me'. */
  userId?: string;
}

/**
 * MandalaProvider — wraps the Mandala chart sub-tree.
 *
 * Manages:
 * - Layer selection / hover state (via useLayerState)
 * - Akasha synthesis fetch (via useAkashaSynthesis)
 * - F-227 authority derivation from synthesis.dailyDecision
 *
 * All child components (layers, info panels, AkashaAuthorityPrompt) read
 * from this context instead of receiving props individually.
 */
export function MandalaProvider({ children, userId = 'me' }: MandalaProviderProps) {
  const layerState = useLayerState();
  const { data, loading, error, refetch } = useAkashaSynthesis({ userId });

  const synthesis = data?.synthesis ?? null;

  // Derive F-227 authority from synthesis — mirrors what
  // MandalaAuthorityBlock fetches from /api/akasha/daily directly.
  const authority = useMemo<AkashaAuthorityPromptProps['authority'] | null>(() => {
    if (!synthesis?.dailyDecision) return null;
    const dd = synthesis.dailyDecision;
    return {
      estrategia: dd.strategy,
      autoridade: dd.authority,
      decisaoHoje: dd.recommendation,
    };
  }, [synthesis]);

  const value = useMemo<MandalaContextValue>(
    () => ({
      activeLayer: layerState.activeLayer,
      hoveredLayer: layerState.hoveredLayer,
      ringPaused: layerState.ringPaused,
      opacity: layerState.opacity,
      setActiveLayer: layerState.setActiveLayer,
      setHoveredLayer: layerState.setHoveredLayer,
      dailyContent: data ?? null,
      synthesis,
      synthesisLoading: loading,
      synthesisError: error,
      refetchSynthesis: refetch,
      authority,
    }),
    [layerState, data, synthesis, loading, error, refetch, authority]
  );

  return <MandalaContext.Provider value={value}>{children}</MandalaContext.Provider>;
}
