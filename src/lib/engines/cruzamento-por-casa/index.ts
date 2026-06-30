/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-A — CRUZAMENTO POR CASA · PUBLIC API
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Re-exports for the cruzamento engine. Consumers should import from
 * `@/lib/engines/cruzamento-por-casa` (or relative `./cruzamento-por-casa`).
 */

// Types
export type {
  CasaId,
  CartaCiganaId,
  Contribuicao,
  ConsulenteId,
  CruzamentoCasa,
  MapaAstrologia,
  MapaCigano,
  MapaConsulente,
  MapaNumerologia,
  MapaOdu,
  MesaCard,
  MesaRealState,
  OduKey,
  OrixaKey,
  PosicaoCarta,
  Tradicao,
} from './types.ts';

// Validation
export {
  validateMapa,
  assertValidMapa,
  casa,
  cartaCigana,
  type Result,
} from './mapa-consulente.ts';

// Constants
export {
  TEMAS_CASAS,
  CASAS_ORDENADAS,
  TRADICOES,
  SACRED_TERMS_BY_TRADICAO,
  NOMES_CARTAS_CIGANAS,
  TEMAS_CASAS_ASTROLOGIA,
  KEYWORDS_ODUS,
} from './constants.ts';

// Main engine
export { cruzamentoPorCasa } from './cruzamento.ts';