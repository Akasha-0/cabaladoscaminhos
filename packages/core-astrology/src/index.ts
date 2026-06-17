/**
 * @akasha/core-astrology
 * Motor de Astrologia — Mapa Natal e Trânsitos.
 *
 * Usado pelo portal em: spiritual-engine.ts, transit-engine.ts, daily-context-builder.ts, mapa-alma.ts.
 */

// Tipos públicos
export type { BirthChart } from './birth-chart';
export type {
  MapaNatal,
  Planeta,
  Signo,
  Aspecto,
  Casa,
  PosicaoPlaneta,
} from './tipos';

// Mapa natal e trânsitos
export { getBirthChart } from './birth-chart';
export { getPositions, type PlanetPosition } from './planet-positions';
export { findAspects } from './aspect-finder';

// Utilitários
export { getSigno, getGrauNoSigno, normalizeDegrees, calcularPosicao } from './swiss-ephemeris';
