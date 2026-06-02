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
function reduceToSingleDigit(n: number, keepMaster = true): number {
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
// fallow-ignore-next-line unused-export
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
function calculateMission(birthDate: string): { number: number; master: boolean } {
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
function calculateExpression(fullName: string): { number: number; master: boolean } {
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
function calculateMotivation(fullName: string): { number: number; master: boolean } {
  const sum = normalizeName(fullName)
    .split('')
    .filter((c) => VOGAIS.has(c.toUpperCase()) && LETTER_VALUES[c.toUpperCase()] !== undefined)
    .reduce((s, c) => s + LETTER_VALUES[c.toUpperCase()], 0);
  const reduced = reduceToSingleDigit(sum);
  return { number: reduced, master: isMaster(reduced) };
}

// ============================================================================
// 4b. NÚMERO DE IMPRESSÃO (apenas consoantes do nome) — Doc 11 §2.4
// ============================================================================
// fallow-ignore-next-line unused-export
export function calculateImpression(fullName: string): { number: number; master: boolean } {
  const sum = normalizeName(fullName)
    .split('')
    .filter((c) => !VOGAIS.has(c) && LETTER_VALUES[c] !== undefined)
    .reduce((s, c) => s + LETTER_VALUES[c], 0);
  const reduced = reduceToSingleDigit(sum);
  return { number: reduced, master: isMaster(reduced) };
}

// ============================================================================
// 5. DONS NATIVOS (dia de nascimento NÃO reduzido se for 10-31)
// ============================================================================
// fallow-ignore-next-line unused-export
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
// fallow-ignore-next-line unused-export
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
// 7. LIÇÕES KÁRMICAS (números de 1-9 AUSENTES no nome) — Doc 11 §2.4
// ============================================================================
// fallow-ignore-next-line unused-export
export function calculateKarmicLessons(fullName: string): number[] {
  const lettersInName = new Set(
    normalizeName(fullName)
      .split('')
      .map((c) => LETTER_VALUES[c])
      .filter((v) => v !== undefined && v > 0)
  );
  const lessons: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (!lettersInName.has(i)) lessons.push(i);
  }
  return lessons;
}

// ============================================================================
// 7b. DÍVIDAS KÁRMICAS (presença de 13/14/16/19 nos totais intermediários)
//     Doc 11 §2.4 — uma dívida existe quando o total ANTES da redução final
//     é 13, 14, 16 ou 19.
// ============================================================================
const KARMIC_DEBT_NUMBERS = [13, 14, 16, 19];

/** Coleta dívidas kármicas a partir dos totais (somas) brutos informados. */
function collectKarmicDebts(rawSums: number[]): number[] {
  const found = new Set<number>();
  for (const sum of rawSums) {
    let n = sum;
    while (n > 9) {
      if (KARMIC_DEBT_NUMBERS.includes(n)) found.add(n);
      n = String(n).split('').reduce((s, d) => s + parseInt(d, 10), 0);
    }
  }
  return [...found].sort((a, b) => a - b);
}
// fallow-ignore-next-line unused-export
export function calculateKarmicDebts(fullName: string, birthDate: string): number[] {
  const norm = normalizeName(fullName);
  const expressionSum = norm.split('').reduce((s, c) => s + (LETTER_VALUES[c] ?? 0), 0);
  const motivationSum = norm
    .split('')
    .filter((c) => VOGAIS.has(c))
    .reduce((s, c) => s + (LETTER_VALUES[c] ?? 0), 0);
  const impressionSum = norm
    .split('')
    .filter((c) => !VOGAIS.has(c))
    .reduce((s, c) => s + (LETTER_VALUES[c] ?? 0), 0);
  const dateSum = birthDate.replace(/\D/g, '').split('').reduce((s, d) => s + parseInt(d, 10), 0);
  const dayNum = (() => {
    const m = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? parseInt(m[3], 10) : 0;
  })();

  return collectKarmicDebts([expressionSum, motivationSum, impressionSum, dateSum, dayNum]);
}

// ============================================================================
// 7c. PINÁCULOS / CICLOS DE REALIZAÇÃO — Doc 11 §2.6
// ============================================================================
// fallow-ignore-next-line unused-export
export function calculatePinnacles(
  birthDate: string,
  lifePath: number
): {
  first: { number: number; ageEnd: number };
  second: { number: number; ageStart: number; ageEnd: number };
  third: { number: number; ageStart: number; ageEnd: number };
  fourth: { number: number; ageStart: number };
} {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const day = match ? reduceToSingleDigit(parseInt(match[3], 10), false) : 0;
  const month = match ? reduceToSingleDigit(parseInt(match[2], 10), false) : 0;
  const year = match ? reduceToSingleDigit(parseInt(match[1], 10), false) : 0;

  const first = reduceToSingleDigit(day + month, false);
  const second = reduceToSingleDigit(day + year, false);
  const third = reduceToSingleDigit(first + second, false);
  const fourth = reduceToSingleDigit(month + year, false);

  const firstEnd = 36 - (isMaster(lifePath) ? reduceToSingleDigit(lifePath, false) : lifePath);
  return {
    first: { number: first, ageEnd: firstEnd },
    second: { number: second, ageStart: firstEnd + 1, ageEnd: firstEnd + 9 },
    third: { number: third, ageStart: firstEnd + 10, ageEnd: firstEnd + 18 },
    fourth: { number: fourth, ageStart: firstEnd + 19 },
  };
}

// ============================================================================
// 7d. ARCANOS REGENTES (correspondência com o Tarô) — Doc 11/Doc 04 §2.2
// ============================================================================
function arcanaFor(n: number): number {
  return n <= 21 ? n : reduceToSingleDigit(n, false);
}
// fallow-ignore-next-line unused-export
export function calculateRulingArcana(
  lifePath: number,
  expression: number
): { lifePathArcana: number; expressionArcana: number } {
  return { lifePathArcana: arcanaFor(lifePath), expressionArcana: arcanaFor(expression) };
}

// ============================================================================
// 7e. CICLOS PESSOAIS (VOLÁTEIS — dependem da data atual) — Doc 11 §2.4
// ============================================================================
// fallow-ignore-next-line unused-export
export function calculatePersonalCycles(
  birthDate: string,
  referenceDate: Date = new Date()
): { personalYear: number; personalMonth: number; personalDay: number; referenceDate: string } {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const birthDay = match ? parseInt(match[3], 10) : 0;
  const birthMonth = match ? parseInt(match[2], 10) : 0;

  const curYear = referenceDate.getFullYear();
  const curMonth = referenceDate.getMonth() + 1;
  const curDay = referenceDate.getDate();
  const yearReduced = reduceToSingleDigit(
    String(curYear).split('').reduce((s, d) => s + parseInt(d, 10), 0),
    false
  );

  const personalYear = reduceToSingleDigit(birthDay + birthMonth + yearReduced, false);
  const personalMonth = reduceToSingleDigit(personalYear + curMonth, false);
  const personalDay = reduceToSingleDigit(personalMonth + curDay, false);

  return {
    personalYear,
    personalMonth,
    personalDay,
    referenceDate: referenceDate.toISOString().slice(0, 10),
  };
}

// ============================================================================
// 8. CICLOS DE VIDA (3 grandes períodos)
// ============================================================================
// Primeiro ciclo: da infância até o dia do retorno (28 - dia reduzido)
// Segundo ciclo: até os 56 anos
// Terceiro ciclo: a partir dos 56 anos
function calculateLifeCycles(birthDate: string): {
  first: { number: number; ageStart: number; ageEnd: number };
  second: { number: number; ageStart: number; ageEnd: number };
  third: { number: number; ageStart: number };
} {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return {
      first: { number: 0, ageStart: 0, ageEnd: 28 },
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
    first: { number: dayRed, ageStart: 0, ageEnd: firstEnd },
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
  const impression = calculateImpression(fullName);

  return {
    lifePath: lifePath.number,
    lifePathMaster: lifePath.master,
    mission: mission.number,
    expression: expression.number,
    expressionMaster: expression.master,
    motivation: motivation.number,
    impression: impression.number,
    nativeDayNumber: calculateNativeDayGifts(birthDate),
    challenges: calculateChallenges(birthDate),
    pinnacles: calculatePinnacles(birthDate, lifePath.number),
    karmicLessons: calculateKarmicLessons(fullName),
    karmaicDebts: calculateKarmicDebts(fullName, birthDate),
    rulingArcana: calculateRulingArcana(lifePath.number, expression.number),
    lifeCycles: calculateLifeCycles(birthDate),
    personalCycles: calculatePersonalCycles(birthDate),
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
