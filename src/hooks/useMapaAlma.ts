'use client';
import { useState, useEffect, useCallback } from 'react';
import type { BirthProfile, MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

interface UseMapaAlmaOptions {
  enabled?: boolean;
}

export function useMapaAlma(profile: BirthProfile | null, options?: UseMapaAlmaOptions) {
  const [data, setData] = useState<MapaAlmaCompleto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMapa = useCallback(async () => {
    if (!profile) { setData(null); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mapa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error('Erro ao gerar Mapa da Alma');
      const result = await res.json();
      setData(result as MapaAlmaCompleto);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (options?.enabled !== false) fetchMapa();
  }, [fetchMapa, options?.enabled]);

  return { data, loading, error, refetch: fetchMapa };
}