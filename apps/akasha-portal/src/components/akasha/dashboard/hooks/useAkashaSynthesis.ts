'use client';

/**
 * useAkashaSynthesis — busca síntese narrativa do Akasha via API diária.
 *
 * Retorna o perfil de 6 áreas de vida + decisão diária + síntese geral.
 */

import { useState, useEffect, useCallback } from 'react';

export interface DailyRitualUI {
  titulo: string;
  instrucao: string;
  cor: string;
  elemento: string;
}

export interface TensionPointUI {
  pillar: string;
  theme: string;
  intensity: number;
}

export interface SexualidadeUI {
  name: string;
  description: string;
  bodyTantric: string;
  desirePattern: string;
  fantasy: { archetype: string; description: string; trigger: string };
  fetishes: Array<{ type: string; description: string; chakraRelated: string }>;
  hiddenDesires: Array<{ desire: string; fear: string; healing: string }>;
  turnOn: string[];
  turnOff: string[];
  relationshipPattern: string;
  transformationKey: string;
}

export interface TransitOverlayUI {
  planet: string;
  aspect: string;
  energy: string;
  description: string;
  recommendation: string;
}

export interface DailyTransitUI {
  astrologiaTransito: TransitOverlayUI[];
  oduTransito: { odu: string; meaning: string; advice: string } | null;
  tantraEnergia: { element: string; quality: string; recommendation: string };
  todayPhrase: string;
}

export interface AreaNarrativeUI {
  area: string;
  title: string;
  frequency: 'shadow' | 'gift' | 'siddhi';
  intensity: 1 | 2 | 3;
  shadowPattern: string;
  shadowSymptoms: string[];
  giftPattern: string;
  giftStrengths: string[];
  pillarContribution: {
    cabala: string;
    tantra: string;
    odus: string;
    astrologia: string;
  };
  practicalAdvice: string;
  dailyRitual: {
    title: string;
    instruction: string;
    duration: string;
    element: string;
    color: string;
  };
  transformationPrompt: string;
  sexualidade?: SexualidadeUI;
  dailyTransit?: DailyTransitUI;
  /** F-226: Narrativas expandidas por pilar (4 blocos + síntese integrada) */
  expandedNarrative?: ExpandedNarrativeUI;
  /**
   * F-230: Cadeia de raciocínio — "como chegamos aqui"
   * Lista ordenada de passos lógicos: [fator1] + [fator2] → [conclusão]
   * Ex: "Venus em Touro (Astrologia) + Lua em 4º (Astrologia) → afeto profundo pelo lar"
   */
  chainOfReasoning?: string[];
}

export interface ExpandedNarrativeUI {
  cabalaNarrative: string;
  astrologiaNarrative: string;
  tantraNarrative: string;
  oduNarrative: string;
  integratedNarrative: string;
  practicalExample: string;
  sourceLabel: string;
}

export interface TensionPointUI {
}

export interface DailyDecisionUI {
  strategy: string;
  strategyExplanation: string;
  authority: string;
  authorityQuestion: string;
  recommendation: string;
  avoid: string;
}

export interface AkashaTypeProfileUI {
  type: string;
  typeName: string;
  typeIcon: string;
  corePattern: string;
  strategy: string;
  strategyDetail: string;
  authority: string;
  authorityPractice: string;
  dailyDirective: string;
  oneLiner: string;
  dominantPillar: string;
  growthEdge: string;
  shadowTrap: string;
}

export interface AkashaSynthesisUI {
  akashaProfile: {
    dominantFrequency: 'shadow' | 'gift' | 'siddhi';
    overallFrequencyScore: number;
    transformationStage: 'surface' | 'deepening' | 'embodying';
    activeSequence: 'vitality' | 'heart' | 'purpose';
  };
  /** F-227: ONE Akasha Profile — tipo unificado dos 5 pilares */
  oneProfile?: AkashaTypeProfileUI;
  areas: Record<string, AreaNarrativeUI>;
  dailyDecision: DailyDecisionUI;
  synthesisParagraph: string;
}

export interface DailyContentUI {
  date: string;
  climate: string;
  ritual: DailyRitualUI;
  alert: string;
  tensionPoint: TensionPointUI;
  moonPhase: string;
  overallTheme: string;
  synthesis: AkashaSynthesisUI | null;
}

interface UseAkashaSynthesisOptions {
  userId: string;
  enabled?: boolean;
}

interface UseAkashaSynthesisReturn {
  data: DailyContentUI | null;
  synthesis: AkashaSynthesisUI | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAkashaSynthesis({
  userId,
  enabled = true,
}: UseAkashaSynthesisOptions): UseAkashaSynthesisReturn {
  const [data, setData] = useState<DailyContentUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const controller = new AbortController();

    fetch(`/api/akasha/daily`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DailyContentUI>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.name === 'AbortError') return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [userId, enabled, refreshKey]);

  return {
    data,
    synthesis: data?.synthesis ?? null,
    loading,
    error,
    refetch,
  };
}
