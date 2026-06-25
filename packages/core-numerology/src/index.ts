/**
 * @akasha/core-numerology
 * Comparação entre sistemas numerológicos — POC F-220 (Wave 16).
 * Pitagórica + Caldeia + Cabala + Tantra, lado a lado.
 *
 * Sem dependências de framework. Input: nome + data. Output: NumerologyComparison.
 *
 * NOTA — Escopo POC:
 *   - Pitagórica e Caldeia: implementações canônicas (domínio público).
 *   - Cabalística e Tântrica: STUBS determinísticos. Integração real com
 *     @akasha/core-cabala e @akasha/core-tantra fica em PR futuro.
 */

// Pitagórica
export {
  PYTHAGOREAN_TABLE,
  reduceNumber,
  isMasterNumber,
  lifePath,
  expression,
  letterSum,
} from './pythagorean';

// Caldeia
export {
  CHALDEAN_TABLE,
  SACRED_NINE,
  letterValue,
  hasLetterValue,
  nameNumber,
  letterSum as chaldeanLetterSum,
} from './chaldean';

// Comparação entre sistemas (stub)
export type { ComparisonInput, NumerologyComparison } from './tantric-comparison';
export { compareSystems } from './tantric-comparison';