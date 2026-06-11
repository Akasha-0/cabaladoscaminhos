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
} from './correlation-map.js';

export {
  // Funções de guardrails
  isSafePractice,
  validatePractice,
  
  // Tipos
  type Practice,
  type ValidationResult,
} from './practices-guardrails.js';

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
} from './correlation-engine.js';

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
} from './recommendation-generator.js';

export {
  // Funções
  calculateCodeOfDay,
  buildRitual,
  getAfirmacaoDoDia,
  getOracaoDoDia,
} from './ritual-calculator.js';

export {
  // Tipos
  type RitualConfig,
  type RitualComponentes,
  type RitualCode,
  type RitualResponse,
  type Quizila,
  type CodeOfDayResult,
} from './ritual-types.js';

export {
  // Tipos
  type DashboardStats,
  type StreakDay,
  type RitualHistoryItem,
  type RitualCompletionData,
  type RitualCompletionResponse,
  type DashboardViewConfig,
} from './dashboard-types.js';

export {
  // Classes
  DashboardService,

  // Funções
  calculateStreak,
} from './dashboard-service.js';

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
} from './akasha-core.js';
