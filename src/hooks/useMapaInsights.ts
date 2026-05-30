'use client';
import { useState, useEffect, useCallback } from 'react';
import type { InsightData } from '@/lib/ai/mapa-insights/types';

interface UseMapaInsightsOptions {
  enabled?: boolean;
  usarCache?: boolean;
}

/**
 * Hook to fetch AI-generated MapaAlma insights from /api/mapa/insights
 * Reads the birth profile from localStorage (key: 'mapa_perfil') to make the API call.
 * Returns loading, error, data (InsightData), and refetch function.
 * Graceful fallback: when API fails or profile not found, returns null data (no throw).
 */
export function useMapaInsights(options?: UseMapaInsightsOptions) {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('mapa_perfil');
    if (!savedProfile) {
      setInsight(null);
      setError(null);
      return;
    }

    let profile: { nomeCompleto: string; dataNascimento: string; hora?: string; cidade?: string; estado?: string; pais?: string };
    try {
      profile = JSON.parse(savedProfile);
    } catch {
      setError('Perfil de nascimento inválido');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mapa/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCompleto: profile.nomeCompleto,
          dataNascimento: profile.dataNascimento,
          hora: profile.hora,
          cidade: profile.cidade,
          estado: profile.estado,
          pais: profile.pais,
          usarCache: options?.usarCache ?? true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
      }

      const result = await res.json();
      setInsight(result as InsightData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar insights');
    } finally {
      setLoading(false);
    }
  }, [options?.usarCache]);

  useEffect(() => {
    if (options?.enabled !== false) {
      fetchInsights();
    }
  }, [fetchInsights, options?.enabled]);

  return { insight, loading, error, refetch: fetchInsights };
}
