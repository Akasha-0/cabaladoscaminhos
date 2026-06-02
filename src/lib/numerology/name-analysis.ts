// @ts-nocheck
// Name analysis - multiple numerology methods

const VOWELS = ['A', 'E', 'I', 'O', 'U', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ã', 'Ẽ', 'Ĩ', 'Õ', 'Ũ', 'Â', 'Ê', 'Î', 'Ô', 'Û'];

import {
  calcularPitagorica,
  calcularCaldeia,
  calcularCabalistica,
  getInterpretacao,
} from '../numerologia/calculos';

export interface NameAnalysis {
  original: string;
  normalized: string;
  vowels: string[];
  consonants: string[];
  vowelCount: number;
  consonantCount: number;
  vowelSum: number;
  consonantSum: number;
}

export interface MethodResult {
  numero: number;
  interpretacao: string;
}

export interface FullNameAnalysis extends NameAnalysis {
  pitagorica: MethodResult;
  caldeia: MethodResult;
  cabalistica: MethodResult;
  expression: number;
  soulUrge: number;
  personality: number;
}

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

function reduceToSingleDigit(num: number): number {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = String(num).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return num;
}

function getInterpretation(num: number): string {
  const interp = getInterpretacao(num);
  return interp?.descricao || `Número ${num}`;
}

export function analyzeName(name: string): NameAnalysis {
  const normalized = normalizeName(name);

  const vowels: string[] = [];
  const consonants: string[] = [];

  for (const char of normalized) {
    if (VOWELS.includes(char)) {
      vowels.push(char);
    } else if (/[A-Z]/.test(char)) {
      consonants.push(char);
    }
  }

  let vowelSum = 0;
  for (const v of vowels) {
    const val = getInterpretacao(v.charCodeAt(0) - 64) || 0;
    vowelSum += val;
  }

  let consonantSum = 0;
  for (const c of consonants) {
    const val = getInterpretacao(c.charCodeAt(0) - 64) || 0;
    consonantSum += val;
  }

  return {
    original: name,
    normalized,
    vowels,
    consonants,
    vowelCount: vowels.length,
    consonantCount: consonants.length,
    vowelSum: reduceToSingleDigit(vowelSum),
    consonantSum: reduceToSingleDigit(consonantSum),
  };
}

export function analyzeNameFull(name: string): FullNameAnalysis {
  const basic = analyzeName(name);

  const pitNum = calcularPitagorica(name);
  const calNum = calcularCaldeia(name);
  const cabNum = calcularCabalistica(name);

  return {
    ...basic,
    pitagorica: { numero: pitNum, interpretacao: getInterpretation(pitNum) },
    caldeia: { numero: calNum, interpretacao: getInterpretation(calNum) },
    cabalistica: { numero: cabNum, interpretacao: getInterpretation(cabNum) },
    expression: reduceToSingleDigit(pitNum),
    soulUrge: reduceToSingleDigit(calNum),
    personality: reduceToSingleDigit(cabNum),
  };
}

export const nameMethods = {
  pitagorica: (name: string): MethodResult => {
    const n = calcularPitagorica(name);
    return { numero: n, interpretacao: getInterpretation(n) };
  },
  caldeia: (name: string): MethodResult => {
    const n = calcularCaldeia(name);
    return { numero: n, interpretacao: getInterpretation(n) };
  },
  cabalistica: (name: string): MethodResult => {
    const n = calcularCabalistica(name);
    return { numero: n, interpretacao: getInterpretation(n) };
  },
};
