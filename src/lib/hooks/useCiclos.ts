'use client';

import { useState, useEffect } from 'react';

interface CicloInfo {
  numero: number;
  sefirot: string;
  descricao?: { nome: string };
}

interface CiclosResult {
  ano: CicloInfo | null;
  mes: CicloInfo | null;
  dia: CicloInfo | null;
  loading: boolean;
  error: string | null;
}

export function useCiclos(dataNascimento: string): CiclosResult {
  const [result, setResult] = useState<CiclosResult>({
    ano: null,
    mes: null,
    dia: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchData() {
      if (!dataNascimento) {
        setResult(prev => ({ ...prev, loading: false, error: 'Data de nascimento não fornecida' }));
        return;
      }

      try {
        const res = await fetch(`/api/ciclos?data=${dataNascimento}&tipo=todos`);
        
        if (!res.ok) {
          throw new Error('Erro ao buscar ciclos');
        }

        const data = await res.json();
        
        setResult({
          ano: { 
            numero: data.ciclos.anoPessoal, 
            sefirot: data.ciclos.sefirotAno,
            descricao: data.ciclos.descricao?.ano
          },
          mes: { 
            numero: data.ciclos.mesPessoal, 
            sefirot: data.ciclos.sefirotMes,
            descricao: data.ciclos.descricao?.mes
          },
          dia: { 
            numero: data.ciclos.diaPessoal, 
            sefirot: data.ciclos.sefirotDia,
            descricao: data.ciclos.descricao?.dia
          },
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