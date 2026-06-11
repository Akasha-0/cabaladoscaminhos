/**
 * @akasha/core-astrology
 * Motor determinístico de Astrologia — Swiss Ephemeris (puro TypeScript)
 * Sem dependências de framework. Input: Date + coordenadas. Output: JSON.
 */

// Tipos
export type { PosicaoPlaneta, Casa, MapaNatal, Planeta, Signo, Aspecto, AspectoTipo, AspectoNature } from './tipos';

// Swiss Ephemeris
// 88° Solar Arc (F-208) — Momento Pré-natal Akasha
export { findPrenatalMoment } from './prenatal-date';
// Tríade Sombra/Dom/Graça (F-209) — Pilar 2 sub-estados
export type { TrinityLevel, TrinityCount } from './trinity';
export { classifyAspect, countTrinity, dominantTrinity } from './trinity';


export { toJulianDate, normalizeDegrees, getSigno, getGrauNoSigno, calcularPosicao, calcularCasas } from './swiss-ephemeris';

// Posições planetárias
export type { PlanetPosition } from './planet-positions';
// Vimshottari Dasha (F-210) — Pilar 2 dimensão temporal Jyotish
export type { Graha, DashaPeriod, VimshottariResult } from './dasha';
export {
  MAHADASHA_DURATIONS,
  DASHA_ORDER,
  TOTAL_DASHA_YEARS,
  NAKSHATRA_LORDS,
  NAKSHATRA_SPAN,
  getNakshatra,
  getNakshatraLord,
  calcularVimshottari,
} from './dasha';

export { getPositions } from './planet-positions';

// Posições avançadas
export type { PlanetaryPosition } from './planetas/positions';
export { getPlanetaryPositions } from './planetas/positions';

// Mapa natal
export { calcularMapaNatal } from './planetas/posicoes';

// Casas
export type { HouseSystem, HouseCusp, Houses } from './houses';
export { calculateHouses } from './houses';

// Aspectos
export { findAspects } from './aspect-finder';
export { calcularAspectos } from './planetas/aspectos';

// Birth chart
export type { BirthChartInput, BirthChart } from './birth-chart';
export { getBirthChart } from './birth-chart';

// Trânsitos
export type { Transito } from './trânsitos/calculator';
export { calcularTrânsitosAtivos } from './trânsitos/calculator';
