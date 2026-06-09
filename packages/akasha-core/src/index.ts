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
