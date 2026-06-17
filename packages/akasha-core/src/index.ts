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

// dashboard-types.ts
export type {
  DashboardStats,
  StreakDay,
  RitualHistoryItem,
  RitualCompletionData,
  RitualCompletionResponse,
  DashboardViewConfig,
} from './dashboard-types';

// ritual-types.ts
export type { AkashaCode } from './correlation-engine';
export type {
  RitualComponentes,
  RitualConfig,
  Quizila,
  RitualCode,
  RitualResponse,
  CodeOfDayResult,
} from './ritual-types';

// interpretation-engine/queries.ts
export { interpretarVida, interpretarVidaArea } from './interpretation-engine/queries';

// recommendation-generator.ts
export { generateHybrid } from './recommendation-generator';

export { buildRitual, calculateCodeOfDay } from './ritual-calculator';
// conexoes.ts
export { compareAkashaMaps } from './conexoes';
export type {
  ConexaoMap,
  AkashaAuthorityInput,
  DominantConnectionType,
  AuthorityMatch,
  ConnectionDimension,
  ConexaoResult,
} from './conexoes';
// mapeamentos/ — Primitive synthesis engine
export { synthesizePrimitives, getTradicaoWeights, setTradicaoWeights } from './mapeamentos';
export type {
  SynthesizedProfile,
  SynthesizedPrimitivo,
  Tensao,
  PrimitiveContribution,
  Polaridade,
  Primitivo,
  Tradicao,
  ProcedenciaEntry,
} from './mapeamentos';
