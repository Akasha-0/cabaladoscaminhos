'use client';

import { useState, useEffect, useCallback } from 'react';

// fallow-ignore-next-line unused-type
export interface MapaNatalData {
  solSigno: string;
  luaSigno: string;
  ascendente: string;
  ascendenteGrau: number;
  planetas: Record<string, { signo: string; casa: number }>;
  casas: { numero: number; signo: string; grauNoSigno: number }[];
  aspectos: { planeta1: string; planeta2: string; tipo: string; orb: number }[];
  interpretacao: string;
}

export interface Transito {
  planeta: string;
  aspecto: string;
  planetaNatal: string;
  impacto: 'alto' | 'medio' | 'baixo';
  descricao: string;
}

export function useMapaNatal() {
  const [data, setData] = useState<MapaNatalData | null>(null);
  const [transitos, setTransitos] = useState<Transito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/astrologia/mapa-natal');
      if (!response.ok) {
        if (response.status === 400) {
          setError('Dados incompletos. Complete seu perfil primeiro.');
          setLoading(false);
          return;
        }
        throw new Error('Erro ao carregar mapa natal');
      }

      const resultado = await response.json();

      setData({
        solSigno: resultado.mapaNatal.planeta.sol.signo,
        luaSigno: resultado.mapaNatal.planeta.lua.signo,
        ascendente: getSigno(resultado.mapaNatal.ascendente),
        ascendenteGrau: resultado.mapaNatal.ascendente,
        planetas: Object.fromEntries(
          Object.entries(resultado.mapaNatal.planeta).map(([k, v]: [string, unknown]) => [k, { signo: (v as { signo: string }).signo, casa: (v as { casa: number }).casa }])
        ),
        casas: resultado.mapaNatal.casas,
        aspectos: resultado.aspectos,
        interpretacao: resultado.interpretacao,
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  }, []);

  const fetchTransitos = useCallback(async () => {
    try {
      const response = await fetch('/api/astrologia/transitos');
      if (!response.ok) return;

      const resultado = await response.json();
      setTransitos(resultado.transitos || []);
    } catch {
      // Silently fail for transitos
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchTransitos();
  }, [fetchData, fetchTransitos]);

  return { data, transitos, loading, error, refetch: fetchData };
}

function getSigno(grau: number): string {
  const signos = ['aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
                  'libra', 'escorpio', 'sagitario', 'capricornio', 'aquario', 'peixes'];
  return signos[Math.floor(grau / 30)];
}