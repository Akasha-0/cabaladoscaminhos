/**
 * Correlation Engine - Index
 * Cabala dos Caminhos - Sistema de Correlações Espirituais
 * 
 * Módulo principal que exporta todas as funcionalidades
 * do engine de correlações espirituais
 */

// ============================================
// DEFINITIONS
// ============================================
export {
  // Types
  type ElementType,
  type SignType,
  type ChakraLevel,
  
  // Constants
  CABALISTIC_NUMBERS,
  ELEMENTS,
  ODUS,
  ZODIAC_SIGNS,
  CHAKRAS,
  
  // Functions
  getCabalisticInfo,
  getElementInfo,
  getOduInfo,
  getZodiacInfo,
  getChakraInfo,
  getAllElements,
  getAllZodiacSigns,
  getAllOduNames,
  isMasterNumber
} from './definitions';

// ============================================
// CALCULATOR
// ============================================
export {
  // Types
  type BirthData,
  type CabalisticPathResult,
  type BirthOduResult,
  type ZodiacSignResult,
  type ChakraConfigResult,
  type CompleteProfileInput,
  type CompleteProfile,
  
  // Functions
  sumDigits,
  reduceToRoot,
  dateToString,
  sumDateDigits,
  calculateCabalisticPath,
  calculateBirthOdu,
  getZodiacSign,
  calculateChakraConfig,
  calculateCompleteProfile,
  analyzeCabalisticOduCompatibility,
  analyzeZodiacCabalisticHarmony,
  getPredominantElement
} from './calculator';

// ============================================
// CORRELATION MATRIX
// ============================================
export {
  // Types
  type CorrelationResult,
  type CrossSystemAnalysis,
  type FullProfileCorrelation,
  type CrossSystemInsights,
  
  // Functions
  correlateNumerologyElement,
  correlateOduNumerology,
  correlateZodiacElement,
  correlateChakraElement,
  correlateZodiacChakra,
  generateCrossSystemAnalysis,
  getElementCompatibilityScore,
  getComplementaryElements,
  getConflictingElements,
  generateElementCompatibilityMatrix
} from './correlation-matrix';

// ============================================
// IDENTITY PROFILE
// ============================================
export {
  // Types
  type ConsolidatedProfile,
  type QuickProfile,
  
  // Functions
  generateConsolidatedProfile,
  generateQuickProfile
} from './identity';
