'use client';

import { useState, useEffect, useCallback } from 'react';

export type FonteRef = {
  id?: string;
  path?: string;
  linha?: number;
  conteudo?: string;
  /** Wave 7.4 A.2 — Metadados psicanalíticos opcionais exibidos como badges
   * no CamadaCard (camada 6 - psicanálise). */
  arquetipo_jung?: string;
  /** Wave 7.4 A.2 — Estilo terapêutico recomendado pela fonte (ex: 'psicanalise'). */
  estilo_terapeutico?: string;
};

export interface CamadaResultado {
  id: string;
  titulo: string;
  conteudo: string | null;
  fontes: FonteRef[];
  requires_professional_review: boolean;
}

export interface PassoRaciocinio {
  step: number;
  descricao: string;
  fontes_usadas?: string[];
}

export interface SynthesisOutput {
  versao: string;
  disclaimer: string;
  camadas: Record<string, CamadaResultado>;
  cadeia_pensamento: PassoRaciocinio[];
}

export interface TratamentoInput {
  zeladorId: string;
  caminhadaId: string;
  consulenteNome: string;
  dataNascimento: string;
  horaNascimento: string;
  localNascimento: string;
  respostasPerguntas?: Array<{ pergunta_id: string; resposta: string }>;
  opcoes?: { maxFrases?: number };
}

export interface UseTratamentoResult {
  data: SynthesisOutput | null;
  isLoading: boolean;
  error: string | null;
  cvv188: boolean;
  refetch: () => void;
}

export function useTratamento(input: TratamentoInput | null): UseTratamentoResult {
  const [data, setData] = useState<SynthesisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvv188, setCvv188] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => {
    setTrigger((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!input) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch('/api/akasha/tratamento/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'unknown' }));
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setData(json.output as SynthesisOutput);
        setCvv188(Boolean(json.cvv188));
        setIsLoading(false);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [input, trigger]);

  return { data, isLoading, error, cvv188, refetch };
}
