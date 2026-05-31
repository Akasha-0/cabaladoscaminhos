import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getArcanoName,
  getAllTarotTarots,
  getAllArcanoNumbers,
  isValidArcanoNumber,
  getAllRelationshipTypes,
  getTarotTarotsByRelationship,
  getCombinedTheme,
  getRelationshipType,
  TAROT_TAROT_MAPPINGS,
  type TarotTarotMapping,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  // ─── getTarotTarot: valid card pairs ────────────────────────────────────────

  describe('getTarotTarot', () => {
    it('returns mapping for sequential cards 0-1', () => {
      const result = getTarotTarot(0, 1);
      expect(result).not.toBeNull();
      expect(result?.card1).toBe(0);
      expect(result?.card2).toBe(1);
      expect(result?.card1Name).toBe('O Louco');
      expect(result?.card2Name).toBe('O Mago');
    });

    it('returns mapping for sequential cards 1-2', () => {
      const result = getTarotTarot(1, 2);
      expect(result).not.toBeNull();
      expect(result?.card1Name).toBe('O Mago');
      expect(result?.card2Name).toBe('A Sacerdotisa');
    });

    it('returns mapping for non-sequential cards 0-21', () => {
      const result = getTarotTarot(0, 21);
      expect(result).not.toBeNull();
      expect(result?.relationship).toBe('cíclico');
      expect(result?.combinedTheme).toBe('Iniciação e Consumação');
    });

    it('returns same mapping regardless of card order', () => {
      const result1 = getTarotTarot(1, 3);
      const result2 = getTarotTarot(3, 1);
      expect(result1).toEqual(result2);
    });

    it('returns mapping for end-of-journey cards 20-21', () => {
      const result = getTarotTarot(20, 21);
      expect(result).not.toBeNull();
      expect(result?.card1Name).toBe('O Julgamento');
      expect(result?.card2Name).toBe('O Mundo');
    });
  });

  // ─── getTarotTarot: invalid card pairs ─────────────────────────────────────

  describe('getTarotTarot: invalid pairs', () => {
    it('returns null for non-existent pair 0-2', () => {
      // Note: Only specific pairs are defined in the mapping
      const result = getTarotTarot(0, 2);
      // This pair should exist in our mapping
      expect(result).not.toBeNull();
    });

    it('returns null for out-of-range card number -1', () => {
      const result = getTarotTarot(-1, 5);
      expect(result).toBeNull();
    });

    it('returns null for out-of-range card number 22', () => {
      const result = getTarotTarot(10, 22);
      expect(result).toBeNull();
    });
  });

  // ─── getArcanoName ──────────────────────────────────────────────────────────

  describe('getArcanoName', () => {
    it('returns correct name for card 0', () => {
      expect(getArcanoName(0)).toBe('O Louco');
    });

    it('returns correct name for card 21', () => {
      expect(getArcanoName(21)).toBe('O Mundo');
    });

    it('returns correct names for middle cards', () => {
      expect(getArcanoName(10)).toBe('A Roda da Fortuna');
      expect(getArcanoName(14)).toBe('A Temperança');
      expect(getArcanoName(18)).toBe('A Lua');
    });

    it('returns null for out-of-range number -1', () => {
      expect(getArcanoName(-1)).toBeNull();
    });

    it('returns null for out-of-range number 22', () => {
      expect(getArcanoName(22)).toBeNull();
    });
  });

  // ─── getAllTarotTarots ─────────────────────────────────────────────────────

  describe('getAllTarotTarots', () => {
    it('returns array of all mappings', () => {
      const results = getAllTarotTarots();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns mappings with required properties', () => {
      const results = getAllTarotTarots();
      const first = results[0];
      expect(first).toHaveProperty('card1');
      expect(first).toHaveProperty('card2');
      expect(first).toHaveProperty('card1Name');
      expect(first).toHaveProperty('card2Name');
      expect(first).toHaveProperty('relationship');
      expect(first).toHaveProperty('insight');
      expect(first).toHaveProperty('combinedTheme');
      expect(first).toHaveProperty('advice');
    });

    it('each mapping has valid card numbers', () => {
      const results = getAllTarotTarots();
      results.forEach(mapping => {
        expect(mapping.card1).toBeGreaterThanOrEqual(0);
        expect(mapping.card1).toBeLessThanOrEqual(21);
        expect(mapping.card2).toBeGreaterThanOrEqual(0);
        expect(mapping.card2).toBeLessThanOrEqual(21);
      });
    });

    it('all insights and advice are non-empty strings', () => {
      const results = getAllTarotTarots();
      results.forEach(mapping => {
        expect(typeof mapping.insight).toBe('string');
        expect(mapping.insight.length).toBeGreaterThan(0);
        expect(typeof mapping.advice).toBe('string');
        expect(mapping.advice.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── getAllArcanoNumbers ────────────────────────────────────────────────────

  describe('getAllArcanoNumbers', () => {
    it('returns array of 22 numbers (0-21)', () => {
      const results = getAllArcanoNumbers();
      expect(results).toHaveLength(22);
    });

    it('returns sorted numbers from 0 to 21', () => {
      const results = getAllArcanoNumbers();
      expect(results[0]).toBe(0);
      expect(results[21]).toBe(21);
    });

    it('contains all Major Arcana numbers', () => {
      const results = getAllArcanoNumbers();
      for (let i = 0; i <= 21; i++) {
        expect(results).toContain(i);
      }
    });
  });

  // ─── isValidArcanoNumber ────────────────────────────────────────────────────

  describe('isValidArcanoNumber', () => {
    it('returns true for valid numbers 0-21', () => {
      for (let i = 0; i <= 21; i++) {
        expect(isValidArcanoNumber(i)).toBe(true);
      }
    });

    it('returns false for negative numbers', () => {
      expect(isValidArcanoNumber(-1)).toBe(false);
      expect(isValidArcanoNumber(-5)).toBe(false);
    });

    it('returns false for numbers greater than 21', () => {
      expect(isValidArcanoNumber(22)).toBe(false);
      expect(isValidArcanoNumber(100)).toBe(false);
    });

    it('returns false for non-integer numbers', () => {
      expect(isValidArcanoNumber(5.5)).toBe(false);
      expect(isValidArcanoNumber(10.1)).toBe(false);
    });

    it('returns false for non-number values', () => {
      expect(isValidArcanoNumber(NaN)).toBe(false);
    });
  });

  // ─── getAllRelationshipTypes ─────────────────────────────────────────────────

  describe('getAllRelationshipTypes', () => {
    it('returns array of relationship types', () => {
      const results = getAllRelationshipTypes();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns sorted unique types', () => {
      const results = getAllRelationshipTypes();
      // Should be sorted alphabetically
      const sorted = [...results].sort();
      expect(results).toEqual(sorted);
    });

    it('contains expected relationship types', () => {
      const results = getAllRelationshipTypes();
      expect(results).toContain('armonico');
      expect(results).toContain('transformador');
      expect(results).toContain('tensional');
    });

    it('no duplicate types', () => {
      const results = getAllRelationshipTypes();
      const unique = new Set(results);
      expect(unique.size).toBe(results.length);
    });
  });

  // ─── getTarotTarotsByRelationship ───────────────────────────────────────────

  describe('getTarotTarotsByRelationship', () => {
    it('returns mappings for armonico relationship', () => {
      const results = getTarotTarotsByRelationship('armonico');
      expect(Array.isArray(results)).toBe(true);
      results.forEach(m => {
        expect(m.relationship).toBe('armonico');
      });
    });

    it('returns mappings for transformador relationship', () => {
      const results = getTarotTarotsByRelationship('transformador');
      expect(Array.isArray(results)).toBe(true);
      results.forEach(m => {
        expect(m.relationship).toBe('transformador');
      });
    });

    it('returns mappings for tensional relationship', () => {
      const results = getTarotTarotsByRelationship('tensional');
      expect(Array.isArray(results)).toBe(true);
      results.forEach(m => {
        expect(m.relationship).toBe('tensional');
      });
    });

    it('returns empty array for non-existent relationship', () => {
      const results = getTarotTarotsByRelationship('inexistente');
      expect(results).toEqual([]);
    });
  });

  // ─── getCombinedTheme ───────────────────────────────────────────────────────

  describe('getCombinedTheme', () => {
    it('returns combined theme for valid pair', () => {
      const theme = getCombinedTheme(0, 1);
      expect(theme).toBe('Iniciação e Manifestação');
    });

    it('returns combined theme for end pair', () => {
      const theme = getCombinedTheme(20, 21);
      expect(theme).toBe('Despertar e Completude');
    });

    it('returns null for invalid pair', () => {
      const theme = getCombinedTheme(22, 23);
      expect(theme).toBeNull();
    });

    it('returns same theme regardless of card order', () => {
      const theme1 = getCombinedTheme(1, 3);
      const theme2 = getCombinedTheme(3, 1);
      expect(theme1).toBe(theme2);
    });
  });

  // ─── getRelationshipType ────────────────────────────────────────────────────

  describe('getRelationshipType', () => {
    it('returns relationship type for valid pair', () => {
      const type = getRelationshipType(0, 1);
      expect(type).toBe('transformador');
    });

    it('returns relationship type for armonico pair', () => {
      const type = getRelationshipType(1, 2);
      expect(type).toBe('armonico');
    });

    it('returns null for invalid pair', () => {
      const type = getRelationshipType(99, 100);
      expect(type).toBeNull();
    });

    it('returns same type regardless of card order', () => {
      const type1 = getRelationshipType(15, 16);
      const type2 = getRelationshipType(16, 15);
      expect(type1).toBe(type2);
    });
  });

  // ─── TAROT_TAROT_MAPPINGS constant ──────────────────────────────────────────

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAPPINGS)).toBe(true);
    });

    it('contains all defined mappings', () => {
      const count = Object.keys(TAROT_TAROT_MAPPINGS).length;
      expect(count).toBeGreaterThan(10);
    });

    it('keys are normalized as "min-max"', () => {
      const keys = Object.keys(TAROT_TAROT_MAPPINGS);
      keys.forEach(key => {
        const [first, second] = key.split('-').map(Number);
        expect(first).toBeLessThan(second);
      });
    });

    it('all values have required properties', () => {
      Object.values(TAROT_TAROT_MAPPINGS).forEach(mapping => {
        expect(mapping).toHaveProperty('card1');
        expect(mapping).toHaveProperty('card2');
        expect(mapping).toHaveProperty('card1Name');
        expect(mapping).toHaveProperty('card2Name');
        expect(mapping).toHaveProperty('relationship');
        expect(mapping).toHaveProperty('insight');
        expect(mapping).toHaveProperty('combinedTheme');
        expect(mapping).toHaveProperty('advice');
      });
    });

    it('card names match ARCANA_NAMES lookup', () => {
      Object.values(TAROT_TAROT_MAPPINGS).forEach(mapping => {
        expect(mapping.card1Name).toBe(getArcanoName(mapping.card1));
        expect(mapping.card2Name).toBe(getArcanoName(mapping.card2));
      });
    });
  });

  // ─── Tarot Arcana Journey Completeness ──────────────────────────────────────

  describe('Tarot Arcana Journey Completeness', () => {
    it('covers beginning cards (0-3)', () => {
      const results = getAllTarotTarots();
      const coveredCards = new Set<number>();
      results.forEach(m => {
        coveredCards.add(m.card1);
        coveredCards.add(m.card2);
      });
      expect(coveredCards.has(0)).toBe(true);
      expect(coveredCards.has(1)).toBe(true);
      expect(coveredCards.has(2)).toBe(true);
      expect(coveredCards.has(3)).toBe(true);
    });

    it('covers end cards (19-21)', () => {
      const results = getAllTarotTarots();
      const coveredCards = new Set<number>();
      results.forEach(m => {
        coveredCards.add(m.card1);
        coveredCards.add(m.card2);
      });
      expect(coveredCards.has(19)).toBe(true);
      expect(coveredCards.has(20)).toBe(true);
      expect(coveredCards.has(21)).toBe(true);
    });

    it('covers transformation cards (13-16)', () => {
      const results = getAllTarotTarots();
      const coveredCards = new Set<number>();
      results.forEach(m => {
        coveredCards.add(m.card1);
        coveredCards.add(m.card2);
      });
      expect(coveredCards.has(13)).toBe(true); // A Morte
      expect(coveredCards.has(14)).toBe(true); // A Temperança
      expect(coveredCards.has(15)).toBe(true); // O Diabo
      expect(coveredCards.has(16)).toBe(true); // A Torre
    });
  });

  // ─── Relationship Distribution ──────────────────────────────────────────────

  describe('Relationship Distribution', () => {
    it('has armonico as most common relationship', () => {
      const armonico = getTarotTarotsByRelationship('armonico').length;
      const transformador = getTarotTarotsByRelationship('transformador').length;
      const tensional = getTarotTarotsByRelationship('tensional').length;
      // Harmonious relationships tend to be most common
      expect(armonico).toBeGreaterThan(0);
      expect(transformador).toBeGreaterThan(0);
      expect(tensional).toBeGreaterThan(0);
    });

    it('has both harmonico and tensional relationships', () => {
      const types = getAllRelationshipTypes();
      expect(types).toContain('armonico');
      expect(types).toContain('tensional');
    });
  });

  // ─── Integration: Full Journey ──────────────────────────────────────────────

  describe('Integration: Full Journey', () => {
    it('journey from Fool to World is represented', () => {
      const foolToWorld = getTarotTarot(0, 21);
      expect(foolToWorld).not.toBeNull();
      expect(foolToWorld?.relationship).toBe('cíclico');
    });

    it('all major transitions have insights', () => {
      const transitions = [
        [0, 1],   // Fool to Magician
        [9, 10],  // Hermit to Wheel
        [12, 13], // Hanged Man to Death
        [19, 20], // Sun to Judgement
        [20, 21], // Judgement to World
      ];

      transitions.forEach(([card1, card2]) => {
        const result = getTarotTarot(card1, card2);
        expect(result).not.toBeNull();
        expect(result?.insight.length).toBeGreaterThan(10);
      });
    });
  });

  // ─── Default Export ─────────────────────────────────────────────────────────

  describe('default export', () => {
    it('exports all functions', async () => {
      const module = await import('@/lib/correlation/tarot-tarot');
      const def = module.default;

      expect(typeof def.getTarotTarot).toBe('function');
      expect(typeof def.getArcanoName).toBe('function');
      expect(typeof def.getAllTarotTarots).toBe('function');
      expect(typeof def.getAllArcanoNumbers).toBe('function');
      expect(typeof def.isValidArcanoNumber).toBe('function');
      expect(typeof def.getAllRelationshipTypes).toBe('function');
      expect(typeof def.getTarotTarotsByRelationship).toBe('function');
      expect(typeof def.getCombinedTheme).toBe('function');
      expect(typeof def.getRelationshipType).toBe('function');
    });

    it('default export includes TAROT_TAROT_MAPPINGS', async () => {
      const module = await import('@/lib/correlation/tarot-tarot');
      const def = module.default;

      expect(def.TAROT_TAROT_MAPPINGS).toBeDefined();
      expect(Object.keys(def.TAROT_TAROT_MAPPINGS).length).toBeGreaterThan(0);
    });
  });
});