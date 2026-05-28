'use client';

import { useState, useEffect } from 'react';

interface NumerologiaResult {
  pitagorica: number | null;
  cabalistica: number | null;
  tantrica: number | null;
  loading: boolean;
  error: string | null;
}

function calcularTantricaLocal(dataNascimento: string): number {
  const numeros = dataNascimento.replace(/\D/g, '');
  let soma = 0;
  for (const digito of numeros) {
    soma += parseInt(digito);
  }
  while (soma > 9 && soma !== 11 && soma !== 22 && soma !== 33) {
    soma = soma.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return soma;
}

export function useNumerologia(nome: string, dataNascimento: string): NumerologiaResult {
  const [result, setResult] = useState<NumerologiaResult>({
    pitagorica: null,
    cabalistica: null,
    tantrica: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchData() {
      if (!nome || !dataNascimento) {
        setResult(prev => ({ ...prev, loading: false, error: 'Dados incompletos' }));
        return;
      }

      try {
        const [pitagoricaRes, cabalisticaRes] = await Promise.all([
          fetch(`/api/numerologia?tipo=pitagorica&nome=${encodeURIComponent(nome)}`),
          fetch(`/api/numerologia?tipo=cabalistica&nome=${encodeURIComponent(nome)}`)
        ]);

        if (!pitagoricaRes.ok || !cabalisticaRes.ok) {
          throw new Error('Erro ao buscar dados numerológicos');
        }

        const pitagoricaData = await pitagoricaRes.json();
        const cabalisticaData = await cabalisticaRes.json();
        const tantrica = calcularTantricaLocal(dataNascimento);

        setResult({
          pitagorica: pitagoricaData.numero,
          cabalistica: cabalisticaData.numero,
          tantrica: tantrica,
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
  }, [nome, dataNascimento]);

  return result;
}