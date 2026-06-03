  
'use client';
import { useState, useEffect } from 'react';
import type { InsightData } from '@/lib/ai/mapa-insights/types';

interface UseMapaInsightsOptions {
  enabled?: boolean;
  usarCache?: boolean;
}
// fallow-ignore-next-line unused-file
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

  useEffect(() => {
    if (options?.enabled !== false) {
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

      fetch('/api/mapa/insights', {
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
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().catch(() => ({}));
          }
          return res.json();
        })
        .then((data) => {
          if (data && data.error) {
            throw new Error(data.error);
          }
          setInsight(data as InsightData);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Erro ao gerar insights');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [options?.enabled, options?.usarCache]);

  const refetch = () => {
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

    fetch('/api/mapa/insights', {
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
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().catch(() => ({}));
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.error) {
          throw new Error(data.error);
        }
        setInsight(data as InsightData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao gerar insights');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { insight, loading, error, refetch };
}
