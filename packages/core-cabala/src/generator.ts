// Numerology calculation generator
// Export calculateNumerology(name, date)
// Includes all methods: pitagorica, caldeia, cabalistica, tantrica, destino

import {
  calcularPitagorica,
  calcularCaldeia,
  calcularCabalistica,
  calcularTantrica,
  calcularPitagoricaData,
  getInterpretacao,
  type InterpretacaoNumerologia,
} from './calculos';
import {
  calculateLifePath,
  calculateExpression,
  calculateMotivation,
  calculateImpression,
} from './numerology-kabalah';

export interface NumerologyResult {
  numero: number;
  tipo: string;
  interpretacao: InterpretacaoNumerologia;
}

export interface NumerologyReport {
  name: string;
  date: string;
  pitagorica: NumerologyResult;
  caldeia: NumerologyResult;
  cabalistica: NumerologyResult;
  tantrica: NumerologyResult;
  destino: NumerologyResult;
  vida: number;
  expressao: number;
  motivacao: number;
  impressao: number;
}

/**
 * Main generator function for complete numerology calculation
 * @param name - Full name for calculation
 * @param date - Birth date in YYYY-MM-DD format
 * @returns Complete numerology report with all methods
 */
export function calculateNumerology(name: string, date: string): NumerologyReport {
  const pitagoricaNum = calcularPitagorica(name);
  const caldeiaNum = calcularCaldeia(name);
  const cabalisticaNum = calcularCabalistica(name);
  const tantricaNum = calcularTantrica(date);
  const destinoNum = calcularPitagoricaData(date);

  return {
    name,
    date,
    pitagorica: {
      numero: pitagoricaNum,
      tipo: 'pitagorica',
      interpretacao: getInterpretacao(pitagoricaNum),
    },
    caldeia: {
      numero: caldeiaNum,
      tipo: 'caldeia',
      interpretacao: getInterpretacao(caldeiaNum),
    },
    cabalistica: {
      numero: cabalisticaNum,
      tipo: 'cabalistica',
      interpretacao: getInterpretacao(cabalisticaNum),
    },
    tantrica: {
      numero: tantricaNum,
      tipo: 'tantrica',
      interpretacao: getInterpretacao(tantricaNum),
    },
    destino: {
      numero: destinoNum,
      tipo: 'destino',
      interpretacao: getInterpretacao(destinoNum),
    },
    vida: calculateLifePath(date).number,
    expressao: calculateExpression(name).number,
    motivacao: calculateMotivation(name).number,
    impressao: calculateImpression(name).number,
  };
}

// Individual calculation methods
export const numerologyMethods = {
  pitagorica: (name: string) => ({
    numero: calcularPitagorica(name),
    interpretacao: getInterpretacao(calcularPitagorica(name)),
  }),
  caldeia: (name: string) => ({
    numero: calcularCaldeia(name),
    interpretacao: getInterpretacao(calcularCaldeia(name)),
  }),
  cabalistica: (name: string) => ({
    numero: calcularCabalistica(name),
    interpretacao: getInterpretacao(calcularCabalistica(name)),
  }),
  tantrica: (date: string) => ({
    numero: calcularTantrica(date),
    interpretacao: getInterpretacao(calcularTantrica(date)),
  }),
  destino: (date: string) => ({
    numero: calcularPitagoricaData(date),
    interpretacao: getInterpretacao(calcularPitagoricaData(date)),
  }),
  vida: (date: string) => calculateLifePath(date).number,
  expressao: (name: string) => calculateExpression(name).number,
  motivacao: (name: string) => calculateMotivation(name).number,
  impressao: (name: string) => calculateImpression(name).number,
};