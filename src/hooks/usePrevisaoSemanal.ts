'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PrevisaoDiaria {
  dia: string;
  data: string;
  energia: 'alta' | 'media' | 'baixa';
  tema: string;
  orientacaoEspiritual: string;
  planetasInfluentes: string[];
  conselho: string;
}

// fallow-ignore-next-line unused-type
export interface PrevisaoSemanalData {
  semana: string;
  previsoes: PrevisaoDiaria[];
  temaGeral: string;
  mensagemInspiracional: string;
}

export function usePrevisaoSemanal() {
  const [data, setData] = useState<PrevisaoSemanalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/astrologia/previsao-semanal');
      if (!response.ok) {
        throw new Error('Erro ao carregar previsão semanal');
      }

      const resultado = await response.json();
      setData(resultado);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}