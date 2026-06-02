/**
 * Motor de Numerologia Cabalística
 * ================================
 *
 * Calcula o KabalisticMap (Doc 04 §2.2) a partir do nome completo
 * e data de nascimento do consulente.
 *
 * @see docs/04_data-model.md §2.2
 * @see docs/07_epics-stories.md §S2.2
 *
 * Método:
 *  - Tabela de conversão alfanumérica (A=1, B=2, ... Z=9, cíclico)
 *  - Vogais: A, E, I, O, U (com ou sem acento)
 *  - `reduceToSingleDigit` mantém números mestres 11, 22 e 33
 *  - Algoritmo de Dívidas Kármicas: números de 1 a 9 ausentes no nome
 */

import type { KabalisticMap } from '@/types';

// ============================================================================
// CONSTANTES
// ============================================================================

const MASTER_NUMBERS = new Set([11, 22, 33]);

const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

// ============================================================================
// HELPERS PUROS
// ============================================================================

/**
 * Reduz um número a um único dígito, preservando números mestres.
 * Aceita entradas com qualquer quantidade de dígitos.
 */
export function reduceToSingleDigit(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  let current = Math.abs(Math.round(n));
  while (current > 9 && !MASTER_NUMBERS.has(current)) {
    current = current
      .toString()
      .split('')
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return current;
}

/**
 * Reduz uma lista de dígitos (ex: [2,0,0,8,1,9,8,6]) a um número
 * final que respeita os números mestres.
 */
function reduceDigits(digits: number[]): number {
  return reduceToSingleDigit(digits.reduce((acc, d) => acc + d, 0));
}

/**
 * Converte uma string em uma lista de dígitos, considerando apenas
 * letras (A-Z). Acentos são removidos antes da normalização.
 */
function nameToDigits(name: string): number[] {
  const cleaned = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .toUpperCase();

  const digits: number[] = [];
  for (const ch of cleaned) {
    if (LETTER_VALUES[ch] !== undefined) {
      digits.push(LETTER_VALUES[ch]);
    }
  }
  return digits;
}

function dateToDigits(date: Date | string): number[] {
  const iso =
    typeof date === 'string'
      ? date.length >= 10
        ? date.slice(0, 10)
        : date
      : date.toISOString().slice(0, 10);
  const [yyyy, mm, dd] = iso.split('-');
  if (!yyyy || !mm || !dd) return [];
  return [...yyyy, ...mm, ...dd].map(Number);
}

// ============================================================================
// CÁLCULOS INDIVIDUAIS
// ============================================================================

export function calculateLifePath(date: Date | string): { value: number; master: boolean } {
  const digits = dateToDigits(date);
  const value = reduceDigits(digits);
  return { value, master: MASTER_NUMBERS.has(value) };
}

export function calculateExpression(fullName: string): { value: number; master: boolean } {
  const digits = nameToDigits(fullName);
  if (digits.length === 0) return { value: 0, master: false };
  const value = reduceDigits(digits);
  return { value, master: MASTER_NUMBERS.has(value) };
}

export function calculateMotivation(fullName: string): number {
  const cleaned = fullName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();
  const digits: number[] = [];
  for (const ch of cleaned) {
    if (VOWELS.has(ch) && LETTER_VALUES[ch] !== undefined) {
      digits.push(LETTER_VALUES[ch]);
    }
  }
  if (digits.length === 0) return 0;
  return reduceDigits(digits);
}

export function calculateMission(date: Date | string): number {
  // Missão: dia + mês (reduzidos separadamente, depois somados)
  const iso =
    typeof date === 'string'
      ? date.slice(0, 10)
      : date.toISOString().slice(0, 10);
  const [yyyy, mm, dd] = iso.split('-');
  if (!yyyy || !mm || !dd) return 0;
  const dia = reduceToSingleDigit(Number(dd));
  const mes = reduceToSingleDigit(Number(mm));
  return reduceToSingleDigit(dia + mes);
}

export function calculateNativeDayGifts(date: Date | string): number {
  const iso =
    typeof date === 'string'
      ? date.slice(0, 10)
      : date.toISOString().slice(0, 10);
  const dd = Number(iso.split('-')[2] ?? 0);
  return dd; // 1..31
}

export function calculateChallenges(date: Date | string): KabalisticMap['challenges'] {
  const iso =
    typeof date === 'string'
      ? date.slice(0, 10)
      : date.toISOString().slice(0, 10);
  const [yyyy, mm, dd] = iso.split('-');
  if (!yyyy || !mm || !dd) {
    return { first: 0, second: 0, main: 0, last: 0 };
  }
  const dia = reduceToSingleDigit(Number(dd));
  const mes = reduceToSingleDigit(Number(mm));
  const ano = reduceToSingleDigit(Number(yyyy));
  const first = Math.abs(dia - mes);
  const second = Math.abs(dia - ano);
  const main = Math.abs(first - second);
  const lifePath = reduceDigits([...yyyy, ...mm, ...dd].map(Number));
  const last = Math.abs(dia - lifePath);
  return { first, second, main, last };
}

export function calculateKarmicDebts(fullName: string): number[] {
  const present = new Set(nameToDigits(fullName));
  const debts: number[] = [];
  for (let n = 1; n <= 9; n++) {
    if (!present.has(n)) debts.push(n);
  }
  return debts;
}

// ============================================================================
// FUNÇÃO AGREGADORA
// ============================================================================

/**
 * Constrói o KabalisticMap completo. Útil como ponto de entrada
 * no cadastro do consulente (Doc 02 §B.2, item 1).
 */
export function buildKabalisticMap(
  fullName: string,
  birthDate: Date | string
): KabalisticMap {
  const lifePath = calculateLifePath(birthDate);
  const expression = calculateExpression(fullName);

  return {
    lifePath: lifePath.value,
    lifePathMaster: lifePath.master,
    mission: calculateMission(birthDate),
    expression: expression.value,
    expressionMaster: expression.master,
    motivation: calculateMotivation(fullName),
    nativeDayNumber: calculateNativeDayGifts(birthDate),
    challenges: calculateChallenges(birthDate),
    karmaicDebts: calculateKarmicDebts(fullName),
    lifeCycles: {
      // Ciclos de Vida — implementação conservadora para o MVP.
      // A documentação canônica define 3 grandes períodos que serão
      // detalhados na fase de refinamento (S7).
      first: { number: lifePath.value, ageStart: 0, ageEnd: 27 },
      second: { number: expression.value, ageStart: 28, ageEnd: 53 },
      third: { number: calculateMission(birthDate), ageStart: 54 },
    },
  };
}
