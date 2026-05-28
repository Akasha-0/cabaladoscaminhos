'use client';

import { useState, useEffect, useCallback } from 'react';
import { TipoOperacao, obterCusto } from '@/lib/credits/custos';

interface TransacaoCredito {
  id: string;
  tipo: 'CREDITO' | 'DEBITO';
  quantidade: number;
  descricao: string | null;
  operacao: string | null;
  createdAt: string;
}

interface CreditosInfo {
  saldo: number;
  transacoes: TransacaoCredito[];
}

interface CreditosState {
  saldo: number;
  transacoes: TransacaoCredito[];
  loading: boolean;
  error: string | null;
}

interface UseCreditosReturn extends CreditosState {
  recarregar: () => Promise<void>;
  usarCreditos: (quantidade: number, operacao: string) => Promise<boolean>;
  temCreditosSuficientes: (quantidade: number) => boolean;
}

export function useCreditos(): UseCreditosReturn {
  const [state, setState] = useState<CreditosState>({
    saldo: 0,
    transacoes: [],
    loading: true,
    error: null,
  });

  const fetchCreditos = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const res = await fetch('/api/creditos?completo=true');

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao buscar créditos');
      }

      const data: CreditosInfo = await res.json();

      setState({
        saldo: data.saldo,
        transacoes: data.transacoes || [],
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      }));
    }
  }, []);

  useEffect(() => {
    fetchCreditos();
  }, [fetchCreditos]);

  const usarCreditos = useCallback(
    async (quantidade: number, operacao: string): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const res = await fetch('/api/creditos/debitar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantidade, operacao }),
        });

        const data = await res.json();

        if (!res.ok) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: data.error || 'Erro ao usar créditos',
          }));
          return false;
        }

        await fetchCreditos();
        return true;
      } catch (err) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido',
        }));
        return false;
      }
    },
    [fetchCreditos]
  );

  const temCreditosSuficientes = useCallback(
    (quantidade: number): boolean => {
      return state.saldo >= quantidade;
    },
    [state.saldo]
  );

  return {
    ...state,
    recarregar: fetchCreditos,
    usarCreditos,
    temCreditosSuficientes,
  };
}

export function useCustoOperacao(
  operacao: TipoOperacao,
  callback: () => Promise<boolean>
): {
  custo: number;
  podeUsar: boolean;
  usar: () => Promise<boolean>;
} {
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);

  const custo = obterCusto(operacao);

  useEffect(() => {
    async function fetchSaldo() {
      try {
        const res = await fetch('/api/creditos');
        if (res.ok) {
          const data = await res.json();
          setSaldo(data.saldo);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchSaldo();
  }, []);

  const podeUsar = !loading && saldo >= custo;

  const usar = async (): Promise<boolean> => {
    if (!podeUsar) return false;
    return callback();
  };

  return { custo, podeUsar, usar };
}