/**
 * @akasha/core - Núcleo do Akasha OS
 * 
 * Exporta o Correlation Map, guardrails e tipos fundamentais
 */

export {
  // Tipos
  type Tradition,
  type CrossTraditionCorrelation,
  type CorrelationMap,
  type IfaOdu,
  type Sefirah,
  
  // Constantes
  IFA_ODUS,
  SEFIRot,
  ICHING_NAMES,
  
  // Mapas
  ifaToIchingMap,
  ichingToIfaMap,
  sefirotToTrigramMap,
  ifaToCabalaMap,
  correlationMap,
  
  // Funções
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
  // Funções de guardrails
  isSafePractice,
  validatePractice,
  
  // Tipos
  type Practice,
  type ValidationResult,
} from './practices-guardrails';

export {
  // Classes
  CorrelationEngine,
  
  // Funções
  createCorrelationEngine,
  quickScore,
  
  // Tipos
  type AkashaCode,
  type LifeArea,
  type CodeLevel,
  type ScoredPractice,
  type PracticeRecommendation,
  type RecommendationContext,
} from './correlation-engine';

export {
  // Classes
  RecommendationGenerator,
  
  // Funções
  createRecommendationGenerator,
  generateFromRules,
  generateFromRAG,
  generateHybrid,
  
  // Tipos
  type RecommendationSource,
  type PracticeRecommendationWithConfidence,
} from './recommendation-generator';

export {
  // Funções
  calculateCodeOfDay,
  buildRitual,
  getAfirmacaoDoDia,
  getOracaoDoDia,
} from './ritual-calculator';

export {
  // Tipos
  type RitualConfig,
  type RitualComponentes,
  type RitualCode,
  type RitualResponse,
  type Quizila,
  type CodeOfDayResult,
} from './ritual-types';

export {
  // Tipos
  type DashboardStats,
  type StreakDay,
  type RitualHistoryItem,
  type RitualCompletionData,
  type RitualCompletionResponse,
  type DashboardViewConfig,
} from './dashboard-types';

export {
  // Classes
  DashboardService,

  // Funções
  calculateStreak,
} from './dashboard-service';

// ─── R-030: Akasha Core Algorithm (orquestrador) ────────────────────────────

export {
  // Schema
  AkashaInputSchema,

  // Função principal
  calcular,

  // Tipos
  type AkashaInput,
  type AkashaLeitura,
  type PilarCabala,
  type PilarAstrologia,
  type PilarTantrica,
  type PilarOdu,
  type PilarIChing,
  type MandalaResumo,
  type MandatoEsqueleto,
} from './akasha-core';

export {
  // Funções
  interpretarVida,
  interpretarVidaArea,
} from './interpretation-engine';

export type {
  // Tipos — vivem em @akasha/types, não em interpretation-engine
  VidaInterpretation,
  AkashaLevel,
} from '@akasha/types';
