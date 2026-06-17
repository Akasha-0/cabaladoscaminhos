// ============================================================
// LIFE AREAS ENGINE - Transformation Helpers
// ============================================================
// Helpers para transformar/agregar dados das áreas da vida.
// Extraídos do index.ts principal para manter arquivo focado.
// ============================================================

import type { LifeArea, LifeAreaId } from './index';
import { LIFE_AREAS } from './index';

// ============================================================
// KEYWORD HELPERS
// ============================================================

/**
 * Gets all keywords from a life area across all systems
 */
export function getAllKeywords(areaId: LifeAreaId): string[] {
  const area = LIFE_AREAS[areaId];
  const keywords = new Set<string>();
  
  // Astrology keywords
  area.astrology.keywords.forEach(k => keywords.add(k));
  
  // Numerology keywords
  if (area.numerology) {
    area.numerology.keywords.forEach(k => keywords.add(k));
  }
  
  // Odu keywords
  if (area.odu) {
    area.odu.keywords.forEach(k => keywords.add(k));
  }
  
  return Array.from(keywords);
}

/**
 * Gets all unique keywords from multiple life areas
 */
export function getKeywordsUnion(areaIds: LifeAreaId[]): string[] {
  const keywords = new Set<string>();
  areaIds.forEach(id => {
    getAllKeywords(id).forEach(k => keywords.add(k));
  });
  return Array.from(keywords);
}

// ============================================================
// CONTENT HELPERS
// ============================================================

/**
 * Gets all questions for a life area
 */
export function getQuestions(areaId: LifeAreaId): string[] {
  return LIFE_AREAS[areaId].questions;
}

/**
 * Gets all practices for a life area
 */
export function getPractices(areaId: LifeAreaId): string[] {
  return LIFE_AREAS[areaId].practices;
}

/**
 * Gets all affirmations for a life area
 */
export function getAffirmations(areaId: LifeAreaId): string[] {
  return LIFE_AREAS[areaId].affirmations;
}

/**
 * Gets all crystals for a life area
 */
export function getCrystals(areaId: LifeAreaId): string[] {
  return LIFE_AREAS[areaId].crystals;
}

// ============================================================
// AGGREGATION HELPERS
// ============================================================

/**
 * Gets all practices across multiple life areas
 */
export function getAllPractices(areaIds: LifeAreaId[]): string[] {
  const practices = new Set<string>();
  areaIds.forEach(id => {
    LIFE_AREAS[id].practices.forEach(p => practices.add(p));
  });
  return Array.from(practices);
}

/**
 * Gets all affirmations across multiple life areas
 */
export function getAllAffirmations(areaIds: LifeAreaId[]): string[] {
  const affirmations = new Set<string>();
  areaIds.forEach(id => {
    LIFE_AREAS[id].affirmations.forEach(a => affirmations.add(a));
  });
  return Array.from(affirmations);
}

/**
 * Gets all crystals across multiple life areas
 */
export function getAllCrystals(areaIds: LifeAreaId[]): string[] {
  const crystals = new Set<string>();
  areaIds.forEach(id => {
    LIFE_AREAS[id].crystals.forEach(c => crystals.add(c));
  });
  return Array.from(crystals);
}

/**
 * Gets a combined summary of all life areas
 */
export function getLifeAreasSummary(): { id: LifeAreaId; name: string; keywords: number; practices: number }[] {
  return Object.keys(LIFE_AREAS).map(id => {
    const area = LIFE_AREAS[id as LifeAreaId];
    return {
      id: id as LifeAreaId,
      name: area.name,
      keywords: getAllKeywords(id as LifeAreaId).length,
      practices: area.practices.length,
    };
  });
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Checks if a life area has complete data
 */
export function isComplete(areaId: LifeAreaId): boolean {
  const area = LIFE_AREAS[areaId];
  return (
    area.questions.length > 0 &&
    area.practices.length > 0 &&
    area.crystals.length > 0 &&
    area.affirmations.length > 0 &&
    area.astrology.planets.length > 0
  );
}

/**
 * Gets missing data fields for a life area
 */
export function getMissingFields(areaId: LifeAreaId): string[] {
  const area = LIFE_AREAS[areaId];
  const missing: string[] = [];
  
  if (area.questions.length === 0) missing.push('questions');
  if (area.practices.length === 0) missing.push('practices');
  if (area.crystals.length === 0) missing.push('crystals');
  if (area.affirmations.length === 0) missing.push('affirmations');
  if (area.astrology.planets.length === 0) missing.push('astrology.planets');
  if (area.numerology && area.numerology.lifePath.length === 0) missing.push('numerology.lifePath');
  if (area.odu && area.odu.primaryOdus.length === 0) missing.push('odu.primaryOdus');
  if (area.orixa && area.orixa.primary.length === 0) missing.push('orixa.primary');
  
  return missing;
}

/**
 * Gets all incomplete life areas
 */
export function getIncompleteAreas(): LifeAreaId[] {
  return Object.keys(LIFE_AREAS).filter(id => !isComplete(id as LifeAreaId)) as LifeAreaId[];
}

// ============================================================
// SEARCH HELPERS
// ============================================================

/**
 * Searches for a term in questions, practices, and affirmations
 */
export function searchContent(term: string): { areaId: LifeAreaId; field: string; content: string }[] {
  const results: { areaId: LifeAreaId; field: string; content: string }[] = [];
  const lowerTerm = term.toLowerCase();
  
  Object.keys(LIFE_AREAS).forEach(id => {
    const area = LIFE_AREAS[id as LifeAreaId];
    
    area.questions.forEach(q => {
      if (q.toLowerCase().includes(lowerTerm)) {
        results.push({ areaId: id as LifeAreaId, field: 'questions', content: q });
      }
    });
    
    area.practices.forEach(p => {
      if (p.toLowerCase().includes(lowerTerm)) {
        results.push({ areaId: id as LifeAreaId, field: 'practices', content: p });
      }
    });
    
    area.affirmations.forEach(a => {
      if (a.toLowerCase().includes(lowerTerm)) {
        results.push({ areaId: id as LifeAreaId, field: 'affirmations', content: a });
      }
    });
  });
  
  return results;
}
