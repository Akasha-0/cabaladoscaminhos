// fallow-ignore-file unused-file
// @ts-nocheck
// Destiny Calculator - Name-based numerology calculation
import {
  calcularPitagorica,
  calcularCaldeia,
  getInterpretacao,
} from '../numerologia/calculos';

export interface DestinyResult {
  numero: number;
  interpretacao: string;
  metodo: string;
}

/**
 * Reduces a number to single digit or master number (11, 22, 33)
 */
function reduzirNumero(num: number): number {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = String(num).split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
}

/**
 * Calculates the Destiny Number from a full name using chosen method
 * Destiny Number reveals your life's purpose and what you're meant to accomplish
 * 
 * @param nomeCompleto - Full birth name as registered
 * @param metodo - 'pitagorica' | 'caldeia' | 'cabalistica'
 * @returns Destiny result with number and interpretation
 */
export function calculate(nomeCompleto: string, metodo: 'pitagorica' | 'caldeia' | 'cabalistica' = 'pitagorica'): DestinyResult {
  const nome = nomeCompleto.trim().toUpperCase();

  if (!nome) {
    return { numero: 0, interpretacao: 'Nome não fornecido', metodo };
  }

  let numero: number;

  switch (metodo) {
    case 'caldeia':
      numero = calcularCaldeia(nomeCompleto);
      break;
    case 'cabalistica':
      numero = calcularPitagorica(nomeCompleto);
      break;
    case 'pitagorica':
    default:
      numero = calcularPitagorica(nomeCompleto);
      break;
  }

  const reducao = reduzirNumero(numero);
  const interpretacao = getInterpretacao(reducao);

  return {
    numero: reducao,
    interpretacao,
    metodo,
  };
}

export default calculate;
