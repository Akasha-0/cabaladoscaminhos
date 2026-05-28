/**
 * Frequency Analysis Module
 * Provides analysis utilities for Solfeggio frequencies
 */

import type { FrequenciaSolfeggio } from '../frequencias/dados';

export interface AnaliseFrequencia {
  frequencia: FrequenciaSolfeggio;
  posicao: number;
  total: number;
  categoria: 'fundamental' | 'ampliada' | 'extendida';
  hzArredondado: number;
  oitava: number;
}

export interface ResultadoAnalise {
  data: AnaliseFrequencia[];
  totalFrequencias: number;
  faixaHz: { min: number; max: number };
  porCategoria: Record<string, number>;
}

/**
 * Analyze frequencies and return structured analysis results
 */
export function analyze(frequencias: FrequenciaSolfeggio[]): ResultadoAnalise {
  if (!frequencias || frequencias.length === 0) {
    return {
      data: [],
      totalFrequencias: 0,
      faixaHz: { min: 0, max: 0 },
      porCategoria: {},
    };
  }

  const FREQUENCIAS_SOLFEGGIO_IDS = new Set([
    '174', '285', '396', '417', '528', '639', '741', '852', '963',
  ]);

  const analiseData: AnaliseFrequencia[] = frequencias.map((freq, index) => {
    const hzArredondado = Math.round(freq.hz);
    const oitava = Math.floor(Math.log2(freq.hz / 440) + 4);

    let categoria: 'fundamental' | 'ampliada' | 'extendida';
    if (FREQUENCIAS_SOLFEGGIO_IDS.has(freq.id)) {
      categoria = 'fundamental';
    } else if (freq.hz >= 396 && freq.hz <= 963) {
      categoria = 'ampliada';
    } else {
      categoria = 'extendida';
    }

    return {
      frequencia: freq,
      posicao: index + 1,
      total: frequencias.length,
      categoria,
      hzArredondado,
      oitava,
    };
  });

  const porCategoria = analiseData.reduce(
    (acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const hzValues = frequencias.map((f) => f.hz);

  return {
    data: analiseData,
    totalFrequencias: frequencias.length,
    faixaHz: {
      min: Math.min(...hzValues),
      max: Math.max(...hzValues),
    },
    porCategoria,
  };
}
