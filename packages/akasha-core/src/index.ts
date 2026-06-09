/**
 * @akasha/core - Núcleo do Akasha OS
 * 
 * Exporta o Correlation Map e tipos fundamentais
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
  buildIchingToIfaMap,
} from './correlation-map.js';
