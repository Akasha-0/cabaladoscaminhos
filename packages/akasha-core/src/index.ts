/**
 * @akasha/core - Núcleo do Akasha OS
 * 
 * Exporta o Correlation Map, guardrails e tipos fundamentais
 */

export type {
  Tradition,
  CrossTraditionCorrelation,
  CorrelationMap,
  IfaOdu,
  Sefirah,
} from './correlation-map';

export {
  IFA_ODUS,
  SEFIRot,
  ICHING_NAMES,
  ifaToIchingMap,
  ichingToIfaMap,
  sefirotToTrigramMap,
  ifaToCabalaMap,
  correlationMap,
  findCorrelations,
  getIchingsByIfa,
  getIfasByIching,
  getSefirotByTrigram,
  getSefirotByIfa,
  getCorrelationStrength,
  getFullCorrelation,
  buildIchingToIfaMap,
} from './correlation-map';

export {
  isSafePractice,
  validatePractice,
  type Practice,
  type ValidationResult,
} from './practices-guardrails';

// akasha-core.ts
export { AkashaInputSchema, calcular } from './akasha-core';
export type {
  AkashaInput,
  PilarCabala,
  PilarTrinityLevel,
  PilarAstrologia,
  PilarTantrica,
  PilarOdu,
  PilarIChing,
  MandalaResumo,
  MandatoEsqueleto,
  AkashaLeitura,
} from './akasha-core';

// dashboard-service.ts
export { DashboardService, calculateStreak } from './dashboard-service';

// interpretation-engine/queries.ts
export { interpretarVida, interpretarVidaArea } from './interpretation-engine/queries';

// recommendation-generator.ts
export { generateHybrid } from './recommendation-generator';

// ritual-calculator.ts
export { buildRitual } from './ritual-calculator';
