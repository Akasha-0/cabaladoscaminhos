/**
 * @akasha/core-tantra
 * Motor determinístico de Numerologia Tântrica (11 Corpos Espirituais)
 * Sem dependências de framework. Input: data de nascimento. Output: TantricMap.
 */

// Numerologia Tântrica — motor principal
export {
  calculateSoul,
  calculateKarma,
  calculateDivineGift,
  calculateDestiny,
  calculateTantricPath,
  buildTantricMap,
} from './numerology-tantric';

// F-220: 4 Temperamentos Gregos (R-019) — Pilar 3 sub-framework opt-in
export type { Temperamento } from './temperaments';
export {
  TEMPERAMENTOS,
  TEMPERAMENTO_PILAR_MAP,
  TEMPERAMENTO_CARACTERISTICAS,
  isTemperamento,
  inferirTemperamentoAtual,
} from './temperaments';
