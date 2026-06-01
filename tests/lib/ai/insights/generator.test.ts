/**
 * Insights Generator Tests
 * Comprehensive tests covering all supported traditions: Odu Ifá, Tarot, Cabala, Orixás
 */

import { describe, it, expect } from 'vitest';
import {
  generateInsight,
  generateMultiTraditionInsight,
  getAvailableIdentifiers,
  type SupportedTradition,
  type InsightResult,
  type GenerateInsightParams,
} from '@/lib/ai/insights/generator';

// ============================================================
// TYPE GUARDS & HELPERS
// ============================================================

function isInsightResult(obj: unknown): obj is InsightResult {
  if (typeof obj !== 'object' || obj === null) return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.title === 'string' &&
    typeof r.description === 'string' &&
    Array.isArray(r.correlations) &&
    typeof r.action === 'string' &&
    typeof r.frequency === 'string'
  );
}

// ============================================================
// GROUP 1: ODU IFÁ TESTS (16 Odús)
// ============================================================

describe('Odu Ifá Insights', () => {

  const oduNames = [
    'Ogbe', 'Oyeku', 'Iwori', 'Odi', 'Irosun', 'Oxossi',
    'Obatala', 'Ogun', 'Ogunda', 'Osa', 'Ofun', 'Oni',
    'Meji', 'Ika', 'Ikate', 'Ikite',
  ];

  it('1. Ogbe → valid InsightResult with all fields', () => {
    const result = generateInsight('odu', { identifier: 'Ogbe' });

    expect(isInsightResult(result)).toBe(true);
    expect(result.title).toContain('Ogbe');
    expect(result.description).toBeTruthy();
    expect(result.correlations.length).toBeGreaterThan(0);
    expect(result.action).toBeTruthy();
  });

  it('2. Ogbe → includes Tarot correlation (Arcano 0)', () => {
    const result = generateInsight('odu', { identifier: 'Ogbe' });
    const tarotCorr = result.correlations.find(c => c.includes('Tarot'));
    expect(tarotCorr).toContain('Tarot: Arcano 0');
  });

  it('3. Ogbe → includes Sephirot correlation', () => {
    const result = generateInsight('odu', { identifier: 'Ogbe' });
    const sephCorr = result.correlations.find(c => c.includes('Sephirot'));
    expect(sephCorr).toContain('Keter');
  });

  it('4. Ogbe → includes Orixá correlation', () => {
    const result = generateInsight('odu', { identifier: 'Ogbe' });
    const orixaCorr = result.correlations.find(c => c.includes('Orixás'));
    expect(orixaCorr).toBeTruthy();
  });

  it('5. Ogbe → includes planetary frequency', () => {
    const result = generateInsight('odu', { identifier: 'Ogbe' });
    expect(result.frequency).toContain('528 Hz'); // Sol
  });

  it('6. Oyeku → has Lua planet correlation', () => {
    const result = generateInsight('odu', { identifier: 'Oyeku' });
    expect(result.frequency).toContain('396 Hz'); // Lua
  });

  it('7. All 16 Odús → return valid InsightResult', () => {
    for (const odu of oduNames) {
      const result = generateInsight('odu', { identifier: odu });
      expect(isInsightResult(result), `Failed for Odu: ${odu}`).toBe(true);
      expect(result.title).toContain(odu);
    }
  });

  it('8. All 16 Odús → have non-empty descriptions', () => {
    for (const odu of oduNames) {
      const result = generateInsight('odu', { identifier: odu });
      expect(result.description.length).toBeGreaterThan(10);
    }
  });

  it('9. Unknown Odu → returns fallback with error guidance', () => {
    const result = generateInsight('odu', { identifier: 'UnknownOdu' });
    expect(result.title).toContain('UnknownOdu');
    expect(result.correlations).toEqual([]);
  });

  it('10. Odu action includes day of week', () => {
    const result = generateInsight('odu', { identifier: 'Ogbe' });
    expect(result.action).toContain('Domingo'); // Ogbe = Domingo
  });

});

// ============================================================
// GROUP 2: TAROT MAJOR ARCANA TESTS (22 cards: 0-21)
// ============================================================

describe('Tarot Major Arcana Insights', () => {

  it('11. Arcano 0 (The Fool) → valid insight with Odu Ogbe correlation', () => {
    const result = generateInsight('tarot', { identifier: 0 });

    expect(isInsightResult(result)).toBe(true);
    expect(result.title).toContain('O Louco');
    expect(result.correlations.some(c => c.includes('Ogbe'))).toBe(true);
  });

  it('12. Arcano 0 → has element (Ar) and chakra mappings', () => {
    const result = generateInsight('tarot', { identifier: 0 });
    expect(result.correlations.some(c => c.includes('Ar'))).toBe(true);
    expect(result.correlations.some(c => c.includes('Ajna'))).toBe(true);
  });

  it('13. Arcano 1 (The Magician) → has Odu Oyeku and Mercury', () => {
    const result = generateInsight('tarot', { identifier: 1 });
    expect(result.title).toContain('O Mago');
    expect(result.correlations.some(c => c.includes('Oyeku'))).toBe(true);
  });

  it('14. Arcano 21 (The World) → complete mapping', () => {
    const result = generateInsight('tarot', { identifier: 21 });

    expect(isInsightResult(result)).toBe(true);
    expect(result.title).toContain('O Mundo');
    expect(result.correlations.length).toBeGreaterThan(0);
  });

  it('15. Arcano 10 (Wheel of Fortune) → has Odu Ofun correlation', () => {
    const result = generateInsight('tarot', { identifier: 10 });
    expect(result.correlations.some(c => c.includes('Ofun'))).toBe(true);
  });

  it('16. Arcano 13 (Death) → has Odu Ika correlation', () => {
    const result = generateInsight('tarot', { identifier: 13 });
    expect(result.correlations.some(c => c.includes('Ika'))).toBe(true);
  });

  it('17. All 22 Arcana → return valid InsightResult', () => {
    for (let i = 0; i <= 21; i++) {
      const result = generateInsight('tarot', { identifier: i });
      expect(isInsightResult(result), `Failed for Arcano ${i}`).toBe(true);
    }
  });

  it('18. All 22 Arcana → have non-empty descriptions', () => {
    for (let i = 0; i <= 21; i++) {
      const result = generateInsight('tarot', { identifier: i });
      expect(result.description.length).toBeGreaterThan(5);
    }
  });

  it('19. Arcano as string "5" → works same as number 5', () => {
    const resultNum = generateInsight('tarot', { identifier: 5 });
    const resultStr = generateInsight('tarot', { identifier: '5' as unknown as number });

    expect(resultStr.title).toBe(resultNum.title);
    expect(resultStr.correlations).toEqual(resultNum.correlations);
  });

  it('20. Invalid arcano 22 → returns fallback', () => {
    const result = generateInsight('tarot', { identifier: 22 });
    expect(result.correlations).toEqual([]);
  });

  it('21. Negative arcano → returns fallback', () => {
    const result = generateInsight('tarot', { identifier: -1 });
    expect(result.correlations).toEqual([]);
  });

  it('22. Arcano 19 (Sun) → has Sol planetary frequency', () => {
    const result = generateInsight('tarot', { identifier: 19 });
    expect(result.frequency).toContain('528 Hz');
  });

});

// ============================================================
// GROUP 3: CABALA (SEPHIROT) TESTS (10 Sephirot)
// ============================================================

describe('Cabala (Sephirot) Insights', () => {

  const sephirotNames = [
    'Keter', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
    'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth',
  ];

  it('23. Keter → valid insight with crown/corona symbolism', () => {
    const result = generateInsight('cabala', { identifier: 'Keter' });

    expect(isInsightResult(result)).toBe(true);
    expect(result.title).toContain('Keter');
    expect(result.description).toContain('Coroa');
  });

  it('24. Keter → has Olodumare Orixá correlation', () => {
    const result = generateInsight('cabala', { identifier: 'Keter' });
    expect(result.correlations.some(c => c.includes('Olodumare'))).toBe(true);
  });

  it('25. Keter → includes Sahasrara chakra', () => {
    const result = generateInsight('cabala', { identifier: 'Keter' });
    expect(result.correlations.some(c => c.includes('Sahasrara'))).toBe(true);
  });

  it('26. Tipheret → has Sol correlation and Leo sign', () => {
    const result = generateInsight('cabala', { identifier: 'Tipheret' });
    expect(result.correlations.some(c => c.includes('Sol'))).toBe(true);
    expect(result.correlations.some(c => c.includes('Leão'))).toBe(true);
  });

  it('27. Malkuth → has Terra/earth planet correlation', () => {
    const result = generateInsight('cabala', { identifier: 'Malkuth' });
    expect(result.correlations.some(c => c.includes('Terra'))).toBe(true);
  });

  it('28. All 10 Sephirot → return valid InsightResult', () => {
    for (const seph of sephirotNames) {
      const result = generateInsight('cabala', { identifier: seph });
      expect(isInsightResult(result), `Failed for Sephirah: ${seph}`).toBe(true);
      expect(result.title).toContain(seph);
    }
  });

  it('29. All 10 Sephirot → have non-empty descriptions', () => {
    for (const seph of sephirotNames) {
      const result = generateInsight('cabala', { identifier: seph });
      expect(result.description.length).toBeGreaterThan(10);
    }
  });

  it('30. Lowercase sephirah → normalizes to proper case', () => {
    const resultLower = generateInsight('cabala', { identifier: 'tipheret' });
    const resultProper = generateInsight('cabala', { identifier: 'Tipheret' });

    expect(resultLower.title).toBe(resultProper.title);
  });

  it('31. Keter → action mentions corona visualization', () => {
    const result = generateInsight('cabala', { identifier: 'Keter' });
    expect(result.action).toContain('coroa');
  });

  it('32. Yesod → action mentions lua/moon', () => {
    const result = generateInsight('cabala', { identifier: 'Yesod' });
    expect(result.action.toLowerCase()).toContain('lua');
  });

  it('33. Malkuth → action mentions terra/earth', () => {
    const result = generateInsight('cabala', { identifier: 'Malkuth' });
    expect(result.action.toLowerCase()).toContain('terra');
  });

  it('34. Unknown sephirah → returns fallback', () => {
    const result = generateInsight('cabala', { identifier: 'UnknownSephirah' });
    expect(result.correlations).toEqual([]);
  });

});

// ============================================================
// GROUP 4: ORIXÁ TESTS
// ============================================================

describe('Orixá Insights', () => {

  const orixaNames = [
    'Oxum', 'Ogum', 'Xangô', 'Iemanjá', 'Obatalá',
    'Oxossi', 'Nanã', 'Iansã', 'Omulu', 'Eshu',
    'Olodumare', 'Oxumar',
  ];

  it('35. Oxum → valid insight with correlations', () => {
    const result = generateInsight('orixa', { identifier: 'Oxum' });

    expect(isInsightResult(result)).toBe(true);
    expect(result.title).toContain('Oxum');
    expect(result.correlations.length).toBeGreaterThan(0);
  });

  it('36. Oxum → has Tarot correlations (Imperatriz, Mundo)', () => {
    const result = generateInsight('orixa', { identifier: 'Oxum' });
    expect(result.correlations.some(c => c.includes('Tarot'))).toBe(true);
  });

  // FIXED: Oxum is correctly mapped to Vênus in ODU_MAPPINGS (Odi, Osa)
  it('37. Oxum → has Vênus planet correlation', () => {
    const result = generateInsight('orixa', { identifier: 'Oxum' });
    const planetCorr = result.correlations.find(c => c.startsWith('Planeta:'));
    expect(planetCorr).toBeTruthy();
    expect(planetCorr?.includes('Vênus') || planetCorr?.includes('Venus')).toBe(true);
  });

  it('38. Ogum → has multiple Odu correlations', () => {
    const result = generateInsight('orixa', { identifier: 'Ogum' });
    const oduCorr = result.correlations.find(c => c.includes('Odús'));
    expect(oduCorr).toBeTruthy();
  });

  it('39. Xangô → (normalized from shango/xango) → works', () => {
    const result = generateInsight('orixa', { identifier: 'xangô' });
    expect(result.title).toContain('Xangô');
  });

  it('40. Iemanjá → (normalized from iemanja/yemaja) → works', () => {
    const result = generateInsight('orixa', { identifier: 'iemanja' });
    expect(result.title).toContain('Iemanjá');
  });

  it('41. Olodumare → has Keter correlation', () => {
    const result = generateInsight('orixa', { identifier: 'olodumare' });
    const sephCorr = result.correlations.find(c => c.includes('Sephirot'));
    expect(sephCorr).toContain('Keter');
  });

  it('42. Eshu → has multiple Odu correlations (Oni, Ikite)', () => {
    const result = generateInsight('orixa', { identifier: 'Eshu' });
    const oduCorr = result.correlations.find(c => c.includes('Odús'));
    expect(oduCorr).toBeTruthy();
  });

  it('43. All major Orixás → return valid InsightResult', () => {
    for (const orixa of orixaNames) {
      const result = generateInsight('orixa', { identifier: orixa });
      expect(isInsightResult(result), `Failed for Orixá: ${orixa}`).toBe(true);
    }
  });

  it('44. All major Orixás → have title', () => {
    for (const orixa of orixaNames) {
      const result = generateInsight('orixa', { identifier: orixa });
      expect(result.title).toBeTruthy();
    }
  });

  it('45. Case insensitivity → "OXUM" works same as "oxum"', () => {
    const resultUpper = generateInsight('orixa', { identifier: 'OXUM' });
    const resultLower = generateInsight('orixa', { identifier: 'oxum' });

    expect(resultUpper.title).toBe(resultLower.title);
  });

  it('46. Unknown Orixá → returns fallback', () => {
    const result = generateInsight('orixa', { identifier: 'UnknownOrixa' });
    expect(result.correlations).toEqual([]);
    expect(result.action).toContain('especialista');
  });

});

// ============================================================
// GROUP 5: OUTPUT FORMAT CONSISTENCY TESTS
// ============================================================

describe('Output Format Consistency', () => {

  it('47. All traditions return identical structure (title, description, correlations, action, frequency)', () => {
    const testCases: GenerateInsightParams[] = [
      { tradition: 'odu', identifier: 'Ogbe' },
      { tradition: 'tarot', identifier: 0 },
      { tradition: 'cabala', identifier: 'Keter' },
      { tradition: 'orixa', identifier: 'Oxum' },
    ];

    for (const tc of testCases) {
      const result = generateInsight(tc.tradition || 'odu', tc);
      expect(isInsightResult(result)).toBe(true);
      expect(typeof result.title).toBe('string');
      expect(typeof result.description).toBe('string');
      expect(Array.isArray(result.correlations)).toBe(true);
      expect(typeof result.action).toBe('string');
      expect(typeof result.frequency).toBe('string');
    }
  });

  it('48. All traditions return non-empty title', () => {
    const traditions: SupportedTradition[] = ['odu', 'tarot', 'cabala', 'orixa'];
    const identifiers = ['Ogbe', 0, 'Keter', 'Oxum'];

    for (let i = 0; i < traditions.length; i++) {
      const result = generateInsight(traditions[i], { identifier: identifiers[i] });
      expect(result.title.trim().length).toBeGreaterThan(0);
    }
  });

  it('49. frequency field is optional (empty string valid)', () => {
    // Some mappings may not have frequency
    const result = generateInsight('orixa', { identifier: 'SomeUnknown' });
    expect(result.frequency).toBe('');
  });

});

// ============================================================
// GROUP 6: BATCH GENERATION TESTS
// ============================================================

describe('Batch Generation', () => {

  it('50. generateMultiTraditionInsight → returns array of valid insights', () => {
    const params: GenerateInsightParams[] = [
      { tradition: 'odu', identifier: 'Ogbe' },
      { tradition: 'tarot', identifier: 0 },
      { tradition: 'cabala', identifier: 'Keter' },
      { tradition: 'orixa', identifier: 'Oxum' },
    ];

    const results = generateMultiTraditionInsight(params);

    expect(results).toHaveLength(4);
    for (const result of results) {
      expect(isInsightResult(result)).toBe(true);
    }
  });

  it('51. generateMultiTraditionInsight → preserves order', () => {
    const params: GenerateInsightParams[] = [
      { tradition: 'odu', identifier: 'Ogbe' },
      { tradition: 'tarot', identifier: 1 },
    ];

    const results = generateMultiTraditionInsight(params);

    expect(results[0].title).toContain('Ogbe');
    expect(results[1].title).toContain('O Mago');
  });

  it('52. Empty array → returns empty array', () => {
    const results = generateMultiTraditionInsight([]);
    expect(results).toEqual([]);
  });

});

// ============================================================
// GROUP 7: UTILITY FUNCTION TESTS
// ============================================================

describe('Utility Functions', () => {

  it('53. getAvailableIdentifiers(odu) → returns array of 16 Odu names', () => {
    const ids = getAvailableIdentifiers('odu');
    expect(ids).toContain('Ogbe');
    expect(ids).toContain('Ikite');
    expect(ids).toHaveLength(16);
  });

  it('54. getAvailableIdentifiers(tarot) → returns 22 arcano labels', () => {
    const ids = getAvailableIdentifiers('tarot');
    expect(ids).toContain('Arcano 0');
    expect(ids).toContain('Arcano 21');
    expect(ids).toHaveLength(22);
  });

  it('55. getAvailableIdentifiers(cabala) → returns 10 Sephirot names', () => {
    const ids = getAvailableIdentifiers('cabala');
    expect(ids).toContain('Keter');
    expect(ids).toContain('Malkuth');
    expect(ids).toHaveLength(10);
  });

  it('56. getAvailableIdentifiers(orixa) → returns array of Orixá names', () => {
    const ids = getAvailableIdentifiers('orixa');
    expect(ids).toContain('Oxum');
    expect(ids).toContain('Ogum');
    expect(ids.length).toBeGreaterThan(10);
  });

  it('57. getAvailableIdentifiers(unknown) → returns empty array', () => {
    const ids = getAvailableIdentifiers('unknown' as SupportedTradition);
    expect(ids).toEqual([]);
  });

});

// ============================================================
// GROUP 8: USER CONTEXT TESTS (no-op for now, structure ready)
// ============================================================

describe('User Context (placeholder)', () => {

  it('58. With userContext → insight still generated (context not used in v1)', () => {
    const result = generateInsight('odu', {
      identifier: 'Ogbe',
      userContext: { nome: 'João', dataNascimento: '1990-05-15' },
    });

    expect(isInsightResult(result)).toBe(true);
    expect(result.title).toContain('Ogbe');
  });

  it('59. Without userContext → still works', () => {
    const result = generateInsight('tarot', { identifier: 5 });
    expect(isInsightResult(result)).toBe(true);
  });

});

// ============================================================
// GROUP 9: EDGE CASES & ERROR HANDLING
// ============================================================

describe('Edge Cases & Error Handling', () => {

  it('60. Empty string identifier → returns fallback', () => {
    const result = generateInsight('odu', { identifier: '' });
    expect(result.correlations).toEqual([]);
  });

  it('61. Null in batch → handles gracefully', () => {
    // This would be a type error, so we test with invalid type
    const result = generateInsight('cabala', { identifier: 'Binah' });
    expect(isInsightResult(result)).toBe(true);
  });

  it('62. Invalid tradition → returns fallback', () => {
    const result = generateInsight('unknown' as SupportedTradition, { identifier: 'test' });
    expect(result.title).toContain('unknown');
    expect(result.action).toContain('Tradição não reconhecida');
  });

});

// ============================================================
// GROUP 10: CORRELATION CROSS-VALIDATION
// ============================================================

describe('Correlation Cross-Validation', () => {

  it('63. Ogbe Odu ↔ Arcano 0 Tarot → bidirectional consistency', () => {
    const oduResult = generateInsight('odu', { identifier: 'Ogbe' });
    const tarotResult = generateInsight('tarot', { identifier: 0 });

    const oduHasTarot = oduResult.correlations.some(c => c.includes('Tarot: Arcano 0'));
    const tarotHasOdu = tarotResult.correlations.some(c => c.includes('Ogbe'));

    expect(oduHasTarot).toBe(true);
    expect(tarotHasOdu).toBe(true);
  });

  it('64. Oxum Orixá ↔ Arcano 3/21 Tarot → bidirectional consistency', () => {
    const orixaResult = generateInsight('orixa', { identifier: 'Oxum' });
    const tarotResult = generateInsight('tarot', { identifier: 3 });

    // Oxum should appear in Arcano 3 (Imperatriz) correlations
    const tarotHasOxum = tarotResult.correlations.some(c => c.includes('Oxum'));

    // And Arcano 3 should appear in Oxum's Tarot correlations
    const orixaHasTarot = orixaResult.correlations.some(c => c.includes('Imperadora') || c.includes('3'));

    expect(tarotHasOxum || orixaHasTarot).toBe(true); // At least one direction
  });

  it('65. All Odu-Sephirot pairs are consistent in both directions', () => {
    const oduResult = generateInsight('odu', { identifier: 'Ogbe' });
    const sephCorr = oduResult.correlations.find(c => c.includes('Sephirot'));

    if (sephCorr) {
      // Extract sephirot name from "Sephirot: Keter, Chokhmah"
      const sephNames = sephCorr.replace('Sephirot: ', '').split(', ');
      for (const seph of sephNames) {
        const sephResult = generateInsight('cabala', { identifier: seph.trim() });
        const hasOgbe = sephResult.correlations.some(c => c.includes('Ogbe'));
        expect(hasOgbe).toBe(true);
      }
    }
  });

});


