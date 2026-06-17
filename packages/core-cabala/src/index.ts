/**
 * @akasha/core-cabala
 * Motor determinístico de Numerologia Cabalística
 * Sem dependências de framework. Input: nome + data. Output: KabalisticMap.
 *
 * Usado pelo portal em: spiritual-engine.ts, daily-context-builder.ts, energy-healing.ts.
 * Usado internamente pelo mentor (buildKabalisticMap).
 */

// Numerologia Cabalística — motor principal
export {
  buildKabalisticMap,
} from './numerology-kabalah';

// Generator — API de alto nível para o portal
export type { NumerologyResult, NumerologyReport } from './generator';
export { calculateNumerology, numerologyMethods } from './generator';
