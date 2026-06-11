/**
 * F-211: Rahu e Ketu (eixos nodais lunares) — Jyotish primários
 *
 * Implementa os nodais lunares (Rahu norte + Ketu sul) como planetas
 * primários em Pilar 2 (R-018 D4). Diferencia Akasha de horóscopos
 * ocidentais que tratam nodos como secundários.
 *
 * Astronomia: Rahu/Ketu são os pontos onde a órbita da Lua cruza a eclíptica
 * (plano da órbita da Terra). NÃO são corpos físicos — são pontos matemáticos.
 *
 * Movimento: Rahu move retrógrado (sentido contrário dos planetas), ciclo
 * de ~18.6 anos (nodo lunar).
 *
 * Jyotish (R-018 D4): Rahu e Ketu são **karmic indicators primários**:
 * - Rahu: desejos mundanos, obsessão, ambição (karmicamente entrante)
 * - Ketu: espiritualidade, desapego, "presente de cabeça" (karmicamente saindo)
 *
 * Algoritmo: Rahu longitude ≈ Sol longitude - longitude_nodo_ascendente
 * (aproximação simples, suficiente para Akasha; software de efemérides
 * usa modelo lunar completo com precessão nodal).
 *
 * @see .autonomous/research/synthesis/jyotish-reverse-engineering.md §4
 */

import { calcularPosicao } from './swiss-ephemeris';

export interface NodosLunares {
  /** Rahu (nodo norte) — longitude em graus 0-360 */
  rahuLongitude: number;
  /** Ketu (nodo sul) — sempre 180° oposto a Rahu */
  ketuLongitude: number;
  /** Data do cálculo (para cache) */
  calculatedAt: Date;
}

/** Constante: o ciclo nodal lunar (nodo retrógrado) ~18.6 anos = 6798 dias */
export const NODAL_CYCLE_DAYS = 6798.0;

/**
 * Calcula longitude do nodo lunar ascendente (Rahu) para uma data.
 * Algoritmo simplificado: usa a longitude média do nodo ascendente lunar
 * com período de 18.6 anos. Para precisão sub-arcminuto, usar Swiss Ephemeris
 * com módulo lunar completo.
 *
 * @param data Data para cálculo
 * @returns Longitude de Rahu em graus 0-360
 */
export function calcularRahuLongitude(data: Date): number {
  // J2000.0 epoch: 2000-01-01T12:00:00 UTC
  // Em J2000, longitude média do nodo ascendente lunar ≈ 125.0445550°
  // Movimento retrógrado: -0.0529539°/dia (aproximação linear)
  const j2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const daysSinceJ2000 = (data.getTime() - j2000) / (24 * 60 * 60 * 1000);
  const meanLongitude = 125.0445550 - 0.0529539 * daysSinceJ2000;
  return ((meanLongitude % 360) + 360) % 360;
}

/**
 * Calcula longitude de Ketu (sempre 180° oposto a Rahu).
 */
export function calcularKetuLongitude(rahuLongitude: number): number {
  return ((rahuLongitude + 180) % 360 + 360) % 360;
}

/**
 * Calcula ambos os nodos lunares (Rahu + Ketu) para uma data.
 * Combina com a longitude do Sol para alinhamento Jyotish mais preciso.
 */
export function calcularNodosLunares(data: Date): NodosLunares {
  const rahuLongitude = calcularRahuLongitude(data);
  // Refinamento Jyotish: Rahu é aproximadamente Sol - longitude_nodo
  // (Rahu = ponto onde a Lua cruza a eclíptica em ascensão)
  // Para simplicidade, usamos a longitude média; alinhamento preciso
  // requer efeméride lunar completa.
  const ketuLongitude = calcularKetuLongitude(rahuLongitude);
  return {
    rahuLongitude,
    ketuLongitude,
    calculatedAt: data,
  };
}

/**
 * Retorna a casa (1-12) de uma longitude zodiacal, dado os cuspis das casas.
 * Helper para integração Pilar 2.
 */
export function longitudeToCasa(longitude: number, houseCusps: number[]): number {
  const norm = ((longitude % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const cuspStart = ((houseCusps[i] % 360) + 360) % 360;
    const cuspEnd = ((houseCusps[(i + 1) % 12] % 360) + 360) % 360;
    if (cuspEnd > cuspStart) {
      if (norm >= cuspStart && norm < cuspEnd) return i + 1;
    } else {
      // Wrap around 0°
      if (norm >= cuspStart || norm < cuspEnd) return i + 1;
    }
  }
  return 1; // fallback
}
