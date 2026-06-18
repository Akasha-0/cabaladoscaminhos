/**
 * @akasha/core-iching — practices.ts tests
 * Tests the re-export and lookup functions that operate on PRACTICES.
 */
import { PRACTICES } from './practices';
import {
  getPractice,
  getPracticesByElement,
  getPracticesByTradition,
  getPracticesByCategory,
  getPracticesByLifeArea,
  getAllPractices,
  PRACTICES_BY_ID,
} from './practices-lookup';

describe('practices.ts re-export', () => {
  it('should re-export PRACTICES from practices-data', () => {
    expect(Array.isArray(PRACTICES)).toBe(true);
    expect(PRACTICES.length).toBeGreaterThan(0);
  });

  it('should have all practices with valid required fields', () => {
    for (const practice of PRACTICES) {
      expect(practice).toHaveProperty('id');
      expect(practice).toHaveProperty('name');
      expect(practice).toHaveProperty('isSafe');
    }
  });
});

describe('getPractice', () => {
  it('should return a practice by valid id', () => {
    const firstId = PRACTICES[0]!.id;
    const result = getPractice(firstId);
    expect(result).toBeDefined();
    expect(result!.id).toBe(firstId);
  });

  it('should return undefined for unknown id', () => {
    const result = getPractice('unknown-practice-id');
    expect(result).toBeUndefined();
  });
});

describe('getPracticesByElement', () => {
  it('should return practices for a valid element', () => {
    const result = getPracticesByElement('fogo');
    expect(Array.isArray(result)).toBe(true);
    for (const p of result) {
      expect(p.associations.element).toBe('fogo');
    }
  });

  it('should return empty array for unknown element', () => {
    const result = getPracticesByElement('unknown-element' as any);
    expect(result).toEqual([]);
  });
});

describe('getPracticesByTradition', () => {
  it('should return practices for a valid tradition', () => {
    const result = getPracticesByTradition('candomblé');
    expect(Array.isArray(result)).toBe(true);
    for (const p of result) {
      expect(p.tradition).toBe('candomblé');
    }
  });

  it('should return empty array for unknown tradition', () => {
    const result = getPracticesByTradition('unknown-tradition');
    expect(result).toEqual([]);
  });
});

describe('getPracticesByCategory', () => {
  it('should return practices for a valid category', () => {
    const result = getPracticesByCategory('banho_de_ervas');
    expect(Array.isArray(result)).toBe(true);
    for (const p of result) {
      expect(p.category).toBe('banho_de_ervas');
    }
  });

  it('should return empty array for unknown category', () => {
    const result = getPracticesByCategory('unknown_category' as any);
    expect(result).toEqual([]);
  });
});

describe('getPracticesByLifeArea', () => {
  it('should return practices matching a life area', () => {
    const result = getPracticesByLifeArea('saúde');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    for (const p of result) {
      expect(p.lifeAreas.some((area) => area.toLowerCase().includes('saúde'))).toBe(true);
    }
  });

  it('should be case-insensitive', () => {
    const upper = getPracticesByLifeArea('SAÚDE');
    const lower = getPracticesByLifeArea('saúde');
    expect(upper.length).toBe(lower.length);
  });

  it('should return empty array for unknown life area', () => {
    const result = getPracticesByLifeArea('unknown-area-xyz');
    expect(result).toEqual([]);
  });
});

describe('getAllPractices', () => {
  it('should return an array', () => {
    const result = getAllPractices();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all practices', () => {
    const result = getAllPractices();
    expect(result.length).toBe(PRACTICES.length);
  });

  it('should return a copy, not the original array', () => {
    const result = getAllPractices();
    result.push({} as any);
    expect(getAllPractices().length).toBe(PRACTICES.length);
  });
});

describe('PRACTICES_BY_ID lookup index', () => {
  it('should have an entry for every practice id', () => {
    const ids = PRACTICES.map((p) => p.id);
    for (const id of ids) {
      expect(PRACTICES_BY_ID[id]).toBeDefined();
    }
  });

  it('should match getPractice results with PRACTICES_BY_ID', () => {
    const firstId = PRACTICES[0]!.id;
    expect(getPractice(firstId)).toBe(PRACTICES_BY_ID[firstId]);
  });
});
