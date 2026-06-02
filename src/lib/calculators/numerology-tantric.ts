/**
 * Motor de Numerologia Tântrica
 * ==============================
 *
 * Calcula o TantricMap (Doc 04 §2.3) a partir da data de nascimento.
 *
 * @see docs/04_data-model.md §2.3
 * @see docs/07_epics-stories.md §S2.3
 *
 * Os 11 Corpos Tântricos:
 *   1  Corpo Sutil
 *   2  Corpo Negativo
 *   3  Corpo Prânico
 *   4  Corpo Físico
 *   5  Corpo Etérico
 *   6  Corpo Astral
 *   7  Corpo Causal
 *   8  Corpo Mental
 *   9  Corpo Espiritual
 *  10  Corpo Divino
 *  11  Corpo Cósmico
 */

import type { TantricMap } from '@/types';

const TANTRIC_BODIES: Readonly<Record<number, string>> = {
  1: 'Corpo Sutil',
  2: 'Corpo Negativo',
  3: 'Corpo Prânico',
  4: 'Corpo Físico',
  5: 'Corpo Etérico',
  6: 'Corpo Astral',
  7: 'Corpo Causal',
  8: 'Corpo Mental',
  9: 'Corpo Espiritual',
  10: 'Corpo Divino',
  11: 'Corpo Cósmico',
};

/**
 * Reduz para um número entre 1 e 11 (sem zerar). Diferente do
 * cabalístico, o tântrico NÃO preserva números mestres do
 * cabalístico — apenas dobra o intervalo máximo.
 */
function reduceTo1to11(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 1;
  let current = Math.abs(Math.round(n));
  while (current > 11) {
    current = current
      .toString()
      .split('')
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return current;
}

function splitDate(date: Date | string): { year: number; month: number; day: number } {
  const iso =
    typeof date === 'string'
      ? date.slice(0, 10)
      : date.toISOString().slice(0, 10);
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y ?? 0, month: m ?? 0, day: d ?? 0 };
}

function sumDigits(n: number): number {
  return n
    .toString()
    .split('')
    .reduce((acc, d) => acc + Number(d), 0);
}

// ============================================================================
// CÁLCULOS INDIVIDUAIS
// ============================================================================

/** Alma (Corpo Negativo) — dia de nascimento reduzido */
export function calculateSoul(date: Date | string): { value: number; description: string } {
  const { day } = splitDate(date);
  const value = reduceTo1to11(sumDigits(day));
  return { value, description: TANTRIC_BODIES[value] ?? '' };
}

/** Karma (Corpo Prânico) — mês de nascimento */
export function calculateKarma(date: Date | string): { value: number; description: string } {
  const { month } = splitDate(date);
  const value = reduceTo1to11(month);
  return { value, description: TANTRIC_BODIES[value] ?? '' };
}

/**
 * Dom Divino — ano de nascimento, reduzido em dois passos
 * (ex: 1986 → 1+9+8+6=24 → 2+4=6).
 */
export function calculateDivineGift(date: Date | string): { value: number; description: string } {
  const { year } = splitDate(date);
  const first = sumDigits(year);
  const value = reduceTo1to11(first);
  return { value, description: TANTRIC_BODIES[value] ?? '' };
}

/** Destino — ano completo de 4 dígitos, reduzido */
export function calculateDestiny(date: Date | string): number {
  const { year } = splitDate(date);
  return reduceTo1to11(sumDigits(year));
}

/** Caminho Tântrico — soma total dia+mês+ano, reduzida */
export function calculateTantricPath(date: Date | string): number {
  const { year, month, day } = splitDate(date);
  return reduceTo1to11(sumDigits(day) + sumDigits(month) + sumDigits(year));
}

// ============================================================================
// FUNÇÃO AGREGADORA
// ============================================================================

/**
 * Constrói o TantricMap completo. Útil como ponto de entrada no
 * cadastro do consulente (Doc 02 §B.2, item 2).
 */
export function buildTantricMap(date: Date | string): TantricMap {
  const soul = calculateSoul(date);
  const karma = calculateKarma(date);
  const gift = calculateDivineGift(date);
  const destiny = calculateDestiny(date);
  const path = calculateTantricPath(date);

  return {
    soul: soul.value,
    soulDescription: soul.description,
    karma: karma.value,
    karmaDescription: karma.description,
    divineGift: gift.value,
    divineGiftDescription: gift.description,
    destiny,
    tantricPath: path,
    tantricBodies: { ...TANTRIC_BODIES },
  };
}
