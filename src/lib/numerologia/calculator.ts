// @ts-nocheck
// Numerology calculator - multiple methods

import {
  calcularPitagorica,
  calcularCaldeia,
  calcularCabalistica,
  calcularTantrica,
  calcularPitagoricaData,
  getInterpretacao,
  calculateLifePath,
  calculateExpression,
  calculateSoulUrge,
  calculatePersonality,
} from './calculos';

// fallow-ignore-next-line unused-type
export interface NumerologyInput {
  name: string;
  date: string;
}

export interface NumerologyMethodResult {
  numero: number;
  interpretacao?: string;
}

export interface NumerologyResult {
  vida: number;
  expressao: number;
  motivacao: number;
  impressao: number;
  pitagorica: NumerologyMethodResult;
  caldeia: NumerologyMethodResult;
  cabalistica: NumerologyMethodResult;
  tantrica: NumerologyMethodResult;
  destino: NumerologyMethodResult;
}

function reduceToDigits(num: number): number {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = String(num).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return num;
}

function interpret(num: number): string {
  const interp = getInterpretacao(num);
  return interp?.descricao || `Número ${num}`;
}

const methods = {
  pitagorica: (name: string): NumerologyMethodResult => {
    const n = calcularPitagorica(name);
    return { numero: n, interpretacao: interpret(n) };
  },
  caldeia: (name: string): NumerologyMethodResult => {
    const n = calcularCaldeia(name);
    return { numero: n, interpretacao: interpret(n) };
  },
  cabalistica: (name: string): NumerologyMethodResult => {
    const n = calcularCabalistica(name);
    return { numero: n, interpretacao: interpret(n) };
  },
  tantrica: (date: string): NumerologyMethodResult => {
    const n = calcularTantrica(date);
    return { numero: n, interpretacao: interpret(n) };
  },
  destino: (date: string): NumerologyMethodResult => {
    const n = calcularPitagoricaData(date);
    return { numero: n, interpretacao: interpret(n) };
  },
  vida: (date: string): number => reduceToDigits(calculateLifePath(date)),
  expressao: (name: string): number => reduceToDigits(calculateExpression(name)),
  motivacao: (name: string): number => reduceToDigits(calculateSoulUrge(name)),
  impressao: (name: string): number => reduceToDigits(calculatePersonality(name)),
};

