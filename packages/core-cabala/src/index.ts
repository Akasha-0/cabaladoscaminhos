/**
 * @akasha/core-cabala
 * Motor determinístico de Numerologia Cabalística
 * Sem dependências de framework. Input: nome + data. Output: KabalisticMap.
 */

// Numerologia Cabalística — motor principal
export {
  calculateLifePath,
  calculateExpression,
  calculateMotivation,
  calculateImpression,
  calculateNativeDayGifts,
  calculateChallenges,
  calculateKarmicLessons,
  calculateKarmicDebts,
  calculatePinnacles,
  calculateRulingArcana,
  calculatePersonalCycles,
  calculateLifeCycles,
  buildKabalisticMap,
} from './numerology-kabalah';

// Numerologia auxiliar
// Numerologia auxiliar — cálculos base
export { somarDigitos, calcularPitagorica, calcularCaldeia, calcularCabalistica, calcularTantrica, calcularPitagoricaData, isMasterNumber, tabelaPitagorica, tabelaCaldeia, tabelaCabalistica, getInterpretacao } from './calculos';
export { getMeaning, getMeanings, getMasterNumbers, getCoreNumbers } from './number-meanings';
export { getCiclosTemporais, calcularAnoPessoal } from './ciclos';
export { calcularCaminhoVida } from './life-path';

// Generator
export type { NumerologyResult, NumerologyReport } from './generator';
export { calculateNumerology, numerologyMethods } from './generator';

// Sefirot — Árvore da Vida
export type { SefiraMeaning } from './sefirot-meanings';
export { getMeanings as getSefirotMeanings } from './sefirot-meanings';

// Odu Correlations
export { NUMEROLOGY_ODU_CORRELATIONS } from './odu-correlations';
export type { NumerologyOdúCorrelation } from './odu-correlations';

