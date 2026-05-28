'use client';

import { useState, useEffect } from 'react';

interface OduInfo {
  numero: number;
  nome: string;
  significado: string;
  elementos: string;
  orixaRegente: string;
  quizilas: string[];
  preceitos: string[];
  ebos: string[];
}

interface OduResult {
  principal: OduInfo | null;
  secundario: { numero: number; nome: string } | null;
  loading: boolean;
  error: string | null;
}

export function useOdus(dataNascimento: string): OduResult {
  const [result, setResult] = useState<OduResult>({
    principal: null,
    secundario: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchData() {
      if (!dataNascimento) {
        setResult(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const res = await fetch(`/api/odus?data=${dataNascimento}`);
        
        if (!res.ok) {
          throw new Error('Erro ao buscar Odú');
        }

        const data = await res.json();
        
        setResult({
          principal: data.principal,
          secundario: data.secundario,
          loading: false,
          error: null
        });
      } catch (err) {
        setResult(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        }));
      }
    }

    fetchData();
  }, [dataNascimento]);

  return result;
}