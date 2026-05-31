import { describe, it, expect } from 'vitest';
import {
  getZodiacZodiac,
  getAllZodiacRelations,
  getRelationsForSign,
  getRelationsByAspect,
  getAllAspectTypes,
  getAllRelatedSigns,
  getRelationBetweenSigns,
  getAspectBetweenSigns,
  ZODIAC_ZODIAC_MAP,
  type ZodiacZodiacMapping,
  type AspectType,
  type SignoZodiac,
} from '@/lib/correlation/zodiac-zodiac';

describe('ZodiacZodiac Correlation', () => {
  // ─── ZODIAC_ZODIAC_MAP: structure validation ─────────────────────────────

  describe('ZODIAC_ZODIAC_MAP', () => {
    it('contains relation mappings', () => {
      expect(ZODIAC_ZODIAC_MAP).toBeDefined();
      expect(Array.isArray(ZODIAC_ZODIAC_MAP)).toBe(true);
    });

    it('has entries for all zodiac signs', () => {
      const signs = new Set<SignoZodiac>();
      ZODIAC_ZODIAC_MAP.forEach((mapping) => {
        signs.add(mapping.sign);
        signs.add(mapping.related_sign);
      });

      const expectedSigns: SignoZodiac[] = [
        'Áries',
        'Touro',
        'Gémeos',
        'Câncer',
        'Leão',
        'Virgem',
        'Libra',
        'Escorpião',
        'Sagitário',
        'Capricórnio',
        'Aquário',
        'Peixes',
      ];

      expectedSigns.forEach((sign) => {
        expect(signs.has(sign)).toBe(true);
      });
    });

    it('each mapping has required fields', () => {
      ZODIAC_ZODIAC_MAP.forEach((mapping) => {
        expect(mapping.sign).toBeDefined();
        expect(mapping.related_sign).toBeDefined();
        expect(mapping.aspect_type).toBeDefined();
        expect(mapping.spiritual_meaning).toBeDefined();
        expect(mapping.spiritual_meaning.significado).toBeDefined();
        expect(mapping.spiritual_meaning.crescimento).toBeDefined();
        expect(mapping.spiritual_meaning.desafio).toBeDefined();
      });
    });

    it('has trine mappings for all four elements', () => {
      const trines = ZODIAC_ZODIAC_MAP.filter((m) => m.aspect_type === 'Trino');

      // Fogo trine (Áries-Leão, Áries-Sagitário, Leão-Sagitário)
      const fogoPairs = trines.filter(
        (m) =>
          (['Áries', 'Leão', 'Sagitário'].includes(m.sign) &&
            ['Áries', 'Leão', 'Sagitário'].includes(m.related_sign)),
      );
      expect(fogoPairs.length).toBeGreaterThanOrEqual(3);

      // Terra trine (Touro-Virgem, Touro-Capricórnio, Virgem-Capricórnio)
      const terraPairs = trines.filter(
        (m) =>
          (['Touro', 'Virgem', 'Capricórnio'].includes(m.sign) &&
            ['Touro', 'Virgem', 'Capricórnio'].includes(m.related_sign)),
      );
      expect(terraPairs.length).toBeGreaterThanOrEqual(3);

      // Ar trine (Gémeos-Libra, Gémeos-Aquário, Libra-Aquário)
      const arPairs = trines.filter(
        (m) =>
          (['Gémeos', 'Libra', 'Aquário'].includes(m.sign) &&
            ['Gémeos', 'Libra', 'Aquário'].includes(m.related_sign)),
      );
      expect(arPairs.length).toBeGreaterThanOrEqual(3);

      // Água trine (Câncer-Escorpião, Câncer-Peixes, Escorpião-Peixes)
      const aguaPairs = trines.filter(
        (m) =>
          (['Câncer', 'Escorpião', 'Peixes'].includes(m.sign) &&
            ['Câncer', 'Escorpião', 'Peixes'].includes(m.related_sign)),
      );
      expect(aguaPairs.length).toBeGreaterThanOrEqual(3);
    });

    it('has at least 50 relationship mappings', () => {
      expect(ZODIAC_ZODIAC_MAP.length).toBeGreaterThanOrEqual(50);
    });
  });

  // ─── getZodiacZodiac ──────────────────────────────────────────────────────

  describe('getZodiacZodiac', () => {
    it('returns mappings for Áries', () => {
      const result = getZodiacZodiac('Áries');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      const ariesMappings = result.filter(
        (m) => m.sign === 'Áries' || m.related_sign === 'Áries',
      );
      expect(ariesMappings.length).toBeGreaterThan(0);
    });

    it('returns mappings for Touro', () => {
      const result = getZodiacZodiac('Touro');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for Gémeos', () => {
      const result = getZodiacZodiac('Gémeos');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for Câncer', () => {
      const result = getZodiacZodiac('Câncer');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for Leão', () => {
      const result = getZodiacZodiac('Leão');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for Virgem', () => {
      const result = getZodiacZodiac('Virgem');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for Libra', () => {
      const result = getZodiacZodiac('Libra');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for Escorpião', () => {
      const result = getZodiacZodiac('Escorpião');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for Sagitário', () => {
      const result = getZodiacZodiac('Sagitário');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for Capricórnio', () => {
      const result = getZodiacZodiac('Capricórnio');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for Aquário', () => {
      const result = getZodiacZodiac('Aquário');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for Peixes', () => {
      const result = getZodiacZodiac('Peixes');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles case-insensitive input', () => {
      const upper = getZodiacZodiac('ÁRIES');
      const lower = getZodiacZodiac('aries');
      const mixed = getZodiacZodiac('aRiEs');

      expect(upper.length).toBe(lower.length);
      expect(lower.length).toBe(mixed.length);
    });

    it('handles accented variations', () => {
      const result = getZodiacZodiac('aries');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for invalid sign', () => {
      const result = getZodiacZodiac('InvalidSign');
      expect(result).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      const result = getZodiacZodiac('');
      expect(result).toEqual([]);
    });
  });

  // ─── getAllZodiacRelations ──────────────────────────────────────────────

  describe('getAllZodiacRelations', () => {
    it('returns all mappings', () => {
      const result = getAllZodiacRelations();
      expect(result).toBeDefined();
      expect(result.length).toBe(ZODIAC_ZODIAC_MAP.length);
    });

    it('returns readonly array', () => {
      const result = getAllZodiacRelations();
      expect(Array.isArray(result)).toBe(true);
    });

    it('contains mappings for all aspect types', () => {
      const result = getAllZodiacRelations();
      const aspectTypes = new Set(result.map((m) => m.aspect_type));

      expect(aspectTypes.has('Trino')).toBe(true);
      expect(aspectTypes.has('Sextil')).toBe(true);
      expect(aspectTypes.has('Quadratura')).toBe(true);
      expect(aspectTypes.has('Oposição')).toBe(true);
      expect(aspectTypes.has('Complementar')).toBe(true);
    });
  });

  // ─── getRelationsForSign ─────────────────────────────────────────────────

  describe('getRelationsForSign', () => {
    it('returns outgoing relations for Áries', () => {
      const result = getRelationsForSign('Áries');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach((rel) => {
        expect(rel.sign).toBeDefined();
        expect(rel.aspect_type).toBeDefined();
        expect(rel.spiritual_meaning).toBeDefined();
      });
    });

    it('returns outgoing relations for Touro', () => {
      const result = getRelationsForSign('Touro');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes aspect type in results', () => {
      const result = getRelationsForSign('Áries');
      expect(result[0].aspect_type).toBeDefined();
    });

    it('returns empty array for invalid sign', () => {
      const result = getRelationsForSign('Invalid');
      expect(result).toEqual([]);
    });

    it('handles case-insensitive input', () => {
      const upper = getRelationsForSign('ÁRIES');
      const lower = getRelationsForSign('aries');

      expect(upper.length).toBe(lower.length);
    });
  });

  // ─── getRelationsByAspect ────────────────────────────────────────────────

  describe('getRelationsByAspect', () => {
    it('returns trine relations', () => {
      const result = getRelationsByAspect('Trino');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach((mapping) => {
        expect(mapping.aspect_type).toBe('Trino');
      });
    });

    it('returns sextile relations', () => {
      const result = getRelationsByAspect('Sextil');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach((mapping) => {
        expect(mapping.aspect_type).toBe('Sextil');
      });
    });

    it('returns square relations', () => {
      const result = getRelationsByAspect('Quadratura');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach((mapping) => {
        expect(mapping.aspect_type).toBe('Quadratura');
      });
    });

    it('returns opposition relations', () => {
      const result = getRelationsByAspect('Oposição');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach((mapping) => {
        expect(mapping.aspect_type).toBe('Oposição');
      });
    });

    it('returns complementary relations', () => {
      const result = getRelationsByAspect('Complementar');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      result.forEach((mapping) => {
        expect(mapping.aspect_type).toBe('Complementar');
      });
    });

    it('returns empty array for unknown aspect type', () => {
      const result = getRelationsByAspect('Unknown' as AspectType);
      expect(result).toEqual([]);
    });
  });

  // ─── getAllAspectTypes ───────────────────────────────────────────────────

  describe('getAllAspectTypes', () => {
    it('returns all aspect types', () => {
      const result = getAllAspectTypes();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes all expected aspect types', () => {
      const result = getAllAspectTypes();

      expect(result).toContain('Trino');
      expect(result).toContain('Sextil');
      expect(result).toContain('Quadratura');
      expect(result).toContain('Oposição');
      expect(result).toContain('Complementar');
    });

    it('returns unique values', () => {
      const result = getAllAspectTypes();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  // ─── getAllRelatedSigns ──────────────────────────────────────────────────

  describe('getAllRelatedSigns', () => {
    it('returns all 12 zodiac signs', () => {
      const result = getAllRelatedSigns();
      expect(result).toBeDefined();
      expect(result.length).toBe(12);
    });

    it('contains all expected signs', () => {
      const result = getAllRelatedSigns();

      const expected: SignoZodiac[] = [
        'Áries',
        'Touro',
        'Gémeos',
        'Câncer',
        'Leão',
        'Virgem',
        'Libra',
        'Escorpião',
        'Sagitário',
        'Capricórnio',
        'Aquário',
        'Peixes',
      ];

      expected.forEach((sign) => {
        expect(result).toContain(sign);
      });
    });

    it('returns unique values', () => {
      const result = getAllRelatedSigns();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  // ─── getRelationBetweenSigns ─────────────────────────────────────────────

  describe('getRelationBetweenSigns', () => {
    it('returns spiritual meaning for known pair', () => {
      const result = getRelationBetweenSigns('Áries', 'Leão');
      expect(result).toBeDefined();
      expect(result?.significado).toBeDefined();
      expect(result?.crescimento).toBeDefined();
      expect(result?.desafio).toBeDefined();
    });

    it('returns same result regardless of order', () => {
      const result1 = getRelationBetweenSigns('Áries', 'Leão');
      const result2 = getRelationBetweenSigns('Leão', 'Áries');

      expect(result1).toEqual(result2);
    });

    it('returns null for same sign', () => {
      const result = getRelationBetweenSigns('Áries', 'Áries');
      // Same sign might not have a mapping
      expect(result).toBeNull();
    });

    it('returns null for invalid signs', () => {
      const result = getRelationBetweenSigns('Invalid', 'Áries');
      expect(result).toBeNull();
    });

    it('handles case-insensitive input', () => {
      const result1 = getRelationBetweenSigns('ARIES', 'LEAO');
      const result2 = getRelationBetweenSigns('aries', 'leao');

      expect(result1).toEqual(result2);
    });

    it('returns null for empty strings', () => {
      const result = getRelationBetweenSigns('', '');
      expect(result).toBeNull();
    });
  });

  // ─── getAspectBetweenSigns ───────────────────────────────────────────────

  describe('getAspectBetweenSigns', () => {
    it('returns aspect type for known pair', () => {
      const result = getAspectBetweenSigns('Áries', 'Leão');
      expect(result).toBeDefined();
      expect(['Trino', 'Sextil', 'Quadratura', 'Oposição', 'Complementar']).toContain(result);
    });

    it('returns same result regardless of order', () => {
      const result1 = getAspectBetweenSigns('Áries', 'Leão');
      const result2 = getAspectBetweenSigns('Leão', 'Áries');

      expect(result1).toBe(result2);
    });

    it('returns null for same sign', () => {
      const result = getAspectBetweenSigns('Áries', 'Áries');
      // Same sign might not have a mapping
      expect(result).toBeNull();
    });

    it('returns null for invalid signs', () => {
      const result = getAspectBetweenSigns('Invalid', 'Áries');
      expect(result).toBeNull();
    });

    it('handles case-insensitive input', () => {
      const result1 = getAspectBetweenSigns('ARIES', 'LEAO');
      const result2 = getAspectBetweenSigns('aries', 'leao');

      expect(result1).toBe(result2);
    });

    it('returns null for empty strings', () => {
      const result = getAspectBetweenSigns('', '');
      expect(result).toBeNull();
    });

    it('returns correct aspect for trine pair (Áries-Sagitário)', () => {
      const result = getAspectBetweenSigns('Áries', 'Sagitário');
      expect(result).toBe('Trino');
    });

    it('returns correct aspect for opposition pair (Câncer-Capricórnio)', () => {
      const result = getAspectBetweenSigns('Câncer', 'Capricórnio');
      expect(result).toBe('Oposição');
    });
  });

  // ─── Spiritual meaning content validation ─────────────────────────────────

  describe('Spiritual meaning content', () => {
    it('all trines have positive spiritual meanings', () => {
      const trines = getRelationsByAspect('Trino');

      trines.forEach((mapping) => {
        expect(mapping.spiritual_meaning.significado.length).toBeGreaterThan(10);
        expect(mapping.spiritual_meaning.crescimento.length).toBeGreaterThan(10);
        expect(mapping.spiritual_meaning.desafio.length).toBeGreaterThan(10);
      });
    });

    it('all sextiles have opportunity spiritual meanings', () => {
      const sextiles = getRelationsByAspect('Sextil');

      sextiles.forEach((mapping) => {
        expect(mapping.spiritual_meaning.significado.length).toBeGreaterThan(10);
        expect(mapping.spiritual_meaning.crescimento.length).toBeGreaterThan(10);
        expect(mapping.spiritual_meaning.desafio.length).toBeGreaterThan(10);
      });
    });

    it('all squares have challenge spiritual meanings', () => {
      const squares = getRelationsByAspect('Quadratura');

      squares.forEach((mapping) => {
        expect(mapping.spiritual_meaning.significado.length).toBeGreaterThan(10);
        expect(mapping.spiritual_meaning.crescimento.length).toBeGreaterThan(10);
        expect(mapping.spiritual_meaning.desafio.length).toBeGreaterThan(10);
      });
    });

    it('all oppositions have balance spiritual meanings', () => {
      const oppositions = getRelationsByAspect('Oposição');

      oppositions.forEach((mapping) => {
        expect(mapping.spiritual_meaning.significado.length).toBeGreaterThan(10);
        expect(mapping.spiritual_meaning.crescimento.length).toBeGreaterThan(10);
        expect(mapping.spiritual_meaning.desafio.length).toBeGreaterThan(10);
      });
    });

    it('all complementary have integration spiritual meanings', () => {
      const complementary = getRelationsByAspect('Complementar');

      complementary.forEach((mapping) => {
        expect(mapping.spiritual_meaning.significado.length).toBeGreaterThan(10);
        expect(mapping.spiritual_meaning.crescimento.length).toBeGreaterThan(10);
        expect(mapping.spiritual_meaning.desafio.length).toBeGreaterThan(10);
      });
    });

    it('ritual field is optional but present in most mappings', () => {
      const mappingsWithRitual = ZODIAC_ZODIAC_MAP.filter(
        (m) => m.spiritual_meaning.ritual !== undefined,
      );

      // Most mappings should have rituals
      expect(mappingsWithRitual.length).toBeGreaterThan(ZODIAC_ZODIAC_MAP.length / 2);
    });
  });

  // ─── Edge cases ──────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('handles whitespace in input', () => {
      const result = getZodiacZodiac('  Áries  ');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles special characters', () => {
      const result = getZodiacZodiac('Sagitário');
      expect(result.length).toBeGreaterThan(0);
    });

    it('zodiac map is immutable', () => {
      expect(() => {
        (ZODIAC_ZODIAC_MAP as unknown as any).push({} as ZodiacZodiacMapping);
      }).toThrow();
    });
  });
});