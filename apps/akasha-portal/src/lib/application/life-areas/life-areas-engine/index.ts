// ============================================================
// LIFE AREAS ENGINE - Motor de Áreas da Vida
// ============================================================
// Sistema completo que correlaciona TODAS as áreas da vida com:
// - Astrologia (planetas, casas, signos, aspectos, Lilith, nodos)
// - Numerologia Cabalística
// - Odu de Ifá
// - Orixás
// ============================================================

import type { LifeAreaId, LifeArea } from './types';

// ============================================================
// TYPES (re-exported from ./types)
// ============================================================
export type { LifeAreaId, LifeArea, AstrologicalMapping, NumerologyMapping, OduMapping, OrixaMapping, ChakraMapping, ElementMapping } from './types';

// ============================================================
// LIFE AREAS DATA (re-exported from data file)
// ============================================================
export { LIFE_AREAS } from './life-areas-data';

// ============================================================
// RE-EXPORTS from queries helper
// ============================================================
export { getLifeArea, getAllLifeAreas } from './queries';
export { getLifeAreasByPlanet, getLifeAreasByHouse, getLifeAreasByOdu, getLifeAreasByOrixa } from './queries';

// ============================================================
// RE-EXPORTS from order helper
// ============================================================
export { LIFE_AREA_ORDER, getLifeAreaOrderIndex, sortLifeAreasByOrder } from './life-areas-order';

// ============================================================
// RE-EXPORTS from transformations helper
// ============================================================
export {
  getAllKeywords,
  getKeywordsUnion,
  getQuestions,
  getPractices,
  getAffirmations,
  getCrystals,
  getAllPractices,
  getAllAffirmations,
  getAllCrystals,
  getLifeAreasSummary,
  isComplete,
  getMissingFields,
  getIncompleteAreas,
  searchContent,
} from './transformations';
