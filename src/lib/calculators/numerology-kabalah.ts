// ============================================================
// MOTOR DE NUMEROLOGIA CABALÍSTICA
// ============================================================
// Implementação das fórmulas definidas no Doc 04 §2.2.
//
// Teste oficial (Doc 09 §8):
//   "Eliane Simão de Almeida", 20/08/1986
//   → lifePath = 7
//
// Redução:
//   - Reduz para 1 dígito SOMENTE se não for número mestre (11, 22, 33).
//   - Para 11/22/33, mantém-se o valor.
//   - 16/19/26 etc. SÃO reduzidos (não são números mestres oficiais).

import type { KabalisticMap } from '@/types';

// ============================================================================
// TABELA DE CONVERSÃO ALFANUMÉRICA (Pitagórica simplificada)
// ============================================================================
// A=1, B=2, ... I=9, J=1, K=2, ... R=9, S=1, T=2, ... Z=8
// (NR/LS/LL: Vogais = 1)
const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const VOGAIS = new Set(['A', 'E', 'I', 'O', 'U', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Â', 'Ê', 'Ô', 'Ã', 'Õ', 'À']);

// ============================================================================
// REDUÇÃO NUMÉRICA (mantém números mestres 11, 22, 33)
// ============================================================================
export function reduceToSingleDigit(n: number, keepMaster = true): number {
  if (n <= 0) return 0;
  if (n <= 9) return n;
  if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;

  let result = n;
  while (result > 9 && !(keepMaster && (result === 11 || result === 22 || result === 33))) {
    result = String(result)
      .split('')
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return result;
}

function isMaster(n: number): boolean {
  return n === 11 || n === 22 || n === 33;
}

// ============================================================================
// 1. CAMINHO DE VIDA
// ============================================================================
// Soma TODOS os dígitos da data de nascimento, reduzida.
// Para 20/08/1986: 2+0+0+8+1+9+8+6 = 34 → 3+4 = 7
export function calculateLifePath(birthDate: string): { number: number; master: boolean } {
  const digits = birthDate.replace(/\D/g, '');
  const sum = digits.split('').reduce((s, d) => s + parseInt(d, 10), 0);
  const reduced = reduceToSingleDigit(sum);
  return { number: reduced, master: isMaster(reduced) };
}

// ============================================================================
// 2. NÚMERO DE MISSÃO
// ============================================================================
// Variante da data que olha especificamente para o dia + mês + ano reduzidos
// separadamente e depois somados. Geralmente coincide com o Caminho de Vida
// quando o consulente está alinhado com sua missão.
export function calculateMission(birthDate: string): { number: number; master: boolean } {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return { number: 0, master: false };
  const [, y, m, d] = match;
  const yearReduced = reduceToSingleDigit(parseInt(y, 10));
  const monthReduced = reduceToSingleDigit(parseInt(m, 10));
  const dayReduced = reduceToSingleDigit(parseInt(d, 10));
  const sum = yearReduced + monthReduced + dayReduced;
  const reduced = reduceToSingleDigit(sum);
  return { number: reduced, master: isMaster(reduced) };
}

// ============================================================================
// 3. NÚMERO DE EXPRESSÃO
// ============================================================================
// Soma de TODAS as letras do nome completo (consonantes + vogais).
export function calculateExpression(fullName: string): { number: number; master: boolean } {
  const sum = normalizeName(fullName)
    .split('')
    .filter((c) => LETTER_VALUES[c] !== undefined)
    .reduce((s, c) => s + LETTER_VALUES[c], 0);
  const reduced = reduceToSingleDigit(sum);
  return { number: reduced, master: isMaster(reduced) };
}

// ============================================================================
// 4. NÚMERO DE MOTIVAÇÃO (Impulso da Alma)
// ============================================================================
// Soma APENAS das vogais do nome completo.
export function calculateMotivation(fullName: string): { number: number; master: boolean } {
  const sum = normalizeName(fullName)
    .split('')
    .filter((c) => VOGAIS.has(c.toUpperCase()) && LETTER_VALUES[c.toUpperCase()] !== undefined)
    .reduce((s, c) => s + LETTER_VALUES[c.toUpperCase()], 0);
  const reduced = reduceToSingleDigit(sum);
  return { number: reduced, master: isMaster(reduced) };
}

// ============================================================================
// 5. DONS NATIVOS (dia de nascimento NÃO reduzido se for 10-31)
// ============================================================================
export function calculateNativeDayGifts(birthDate: string): number {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return 0;
  return parseInt(match[3], 10);
}

// ============================================================================
// 6. NÚMEROS DE DESAFIO
// ============================================================================
// Calculados a partir do dia, mês e ano de nascimento.
// - first: |dia - mês|
// - second: |dia - ano|
// - main:  |first - second|
// - last:  |ano - mês - dia| (nunca 0, mínimo 1)
export function calculateChallenges(birthDate: string): {
  first: number;
  second: number;
  main: number;
  last: number;
} {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return { first: 0, second: 0, main: 0, last: 1 };
  const [, y, m, d] = match;
  const year = parseInt(y, 10);
  const month = parseInt(m, 10);
  const day = parseInt(d, 10);

  const dayRed = reduceToSingleDigit(day);
  const monthRed = reduceToSingleDigit(month);
  const yearRed = reduceToSingleDigit(year);

  const first = Math.abs(dayRed - monthRed);
  const second = Math.abs(dayRed - yearRed);
  const main = Math.abs(first - second);
  const lastRaw = Math.abs(year - month - day);
  const last = lastRaw === 0 ? 1 : reduceToSingleDigit(lastRaw);

  return { first, second, main, last };
}

// ============================================================================
// 7. DÍVIDAS KÁRMICAS (números ausentes entre 1-9 no nome)
// ============================================================================
export function calculateKarmicDebts(fullName: string): number[] {
  const lettersInName = new Set(
    normalizeName(fullName)
      .split('')
      .map((c) => LETTER_VALUES[c.toUpperCase()])
      .filter((v) => v !== undefined && v > 0)
  );
  const debts: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (!lettersInName.has(i)) debts.push(i);
  }
  return debts;
}

// ============================================================================
// 8. CICLOS DE VIDA (3 grandes períodos)
// ============================================================================
// Primeiro ciclo: da infância até o dia do retorno (28 - dia reduzido)
// Segundo ciclo: até os 56 anos
// Terceiro ciclo: a partir dos 56 anos
export function calculateLifeCycles(birthDate: string): {
  first: { number: number; ageEnd: number };
  second: { number: number; ageStart: number; ageEnd: number };
  third: { number: number; ageStart: number };
} {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return {
      first: { number: 0, ageEnd: 28 },
      second: { number: 0, ageStart: 29, ageEnd: 56 },
      third: { number: 0, ageStart: 57 },
    };
  }
  const [, y, m, d] = match;
  const dayRed = reduceToSingleDigit(parseInt(d, 10));
  const monthRed = reduceToSingleDigit(parseInt(m, 10));
  const yearRed = reduceToSingleDigit(parseInt(y, 10));

  const firstEnd = 36 - dayRed;
  const secondEnd = firstEnd + 27;

  return {
    first: { number: dayRed, ageEnd: firstEnd },
    second: { number: monthRed, ageStart: firstEnd + 1, ageEnd: secondEnd },
    third: { number: yearRed, ageStart: secondEnd + 1 },
  };
}

// ============================================================================
// AGREGADOR — Constrói o mapa cabalístico completo
// ============================================================================
export function buildKabalisticMap(fullName: string, birthDate: string): KabalisticMap {
  const lifePath = calculateLifePath(birthDate);
  const mission = calculateMission(birthDate);
  const expression = calculateExpression(fullName);
  const motivation = calculateMotivation(fullName);

  return {
    lifePath: lifePath.number,
    lifePathMaster: lifePath.master,
    mission: mission.number,
    expression: expression.number,
    expressionMaster: expression.master,
    motivation: motivation.number,
    nativeDayNumber: calculateNativeDayGifts(birthDate),
    challenges: calculateChallenges(birthDate),
    karmaicDebts: calculateKarmicDebts(fullName),
    lifeCycles: calculateLifeCycles(birthDate),
  };
}

// ============================================================================
// HELPERS
// ============================================================================
function normalizeName(name: string): string {
  return name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z]/g, '');
}
