import { describe, it, expect } from 'vitest';
import {
  getZodiacChakra,
  getChakraZodiac,
  getChakraZodiacs,
  getAllZodiacChakras,
  ZODIAC_CHAKRA_MAPPINGS,
} from '@/lib/correlation/zodiac-chakra';

describe('correlation/zodiac-chakra', () => {
  describe('getZodiacChakra', () => {
    it('returns correct mapping for Áries', () => {
      const result = getZodiacChakra('Áries');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Áries');
      expect(result?.chakra_primario).toBe('Manipura');
      expect(result?.chakra_secundario).toBe('Muladhara');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.praticas).toContain('Meditação');
    });

    it('returns correct mapping for Touro', () => {
      const result = getZodiacChakra('Touro');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Touro');
      expect(result?.chakra_primario).toBe('Anahata');
      expect(result?.chakra_secundario).toBe('Muladhara');
      expect(result?.elemento).toBe('Terra');
    });

    it('returns correct mapping for Gémeos', () => {
      const result = getZodiacChakra('Gémeos');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Gémeos');
      expect(result?.chakra_primario).toBe('Vishuddha');
      expect(result?.chakra_secundario).toBe('Ajna');
      expect(result?.elemento).toBe('Ar');
    });

    it('returns correct mapping for Caranguejo', () => {
      const result = getZodiacChakra('Caranguejo');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Caranguejo');
      expect(result?.chakra_primario).toBe('Ajna');
      expect(result?.chakra_secundario).toBe('Svadhisthana');
      expect(result?.elemento).toBe('Água');
    });

    it('returns correct mapping for Leão', () => {
      const result = getZodiacChakra('Leão');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Leão');
      expect(result?.chakra_primario).toBe('Manipura');
      expect(result?.chakra_secundario).toBe('Anahata');
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns correct mapping for Virgem', () => {
      const result = getZodiacChakra('Virgem');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Virgem');
      expect(result?.chakra_primario).toBe('Svadhisthana');
      expect(result?.chakra_secundario).toBe('Manipura');
      expect(result?.elemento).toBe('Terra');
    });

    it('returns correct mapping for Balança', () => {
      const result = getZodiacChakra('Balança');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Balança');
      expect(result?.chakra_primario).toBe('Anahata');
      expect(result?.chakra_secundario).toBe('Ajna');
      expect(result?.elemento).toBe('Ar');
    });

    it('returns correct mapping for Escorpião', () => {
      const result = getZodiacChakra('Escorpião');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Escorpião');
      expect(result?.chakra_primario).toBe('Svadhisthana');
      expect(result?.chakra_secundario).toBe('Muladhara');
      expect(result?.elemento).toBe('Água');
    });

    it('returns correct mapping for Sagitário', () => {
      const result = getZodiacChakra('Sagitário');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Sagitário');
      expect(result?.chakra_primario).toBe('Sahasrara');
      expect(result?.chakra_secundario).toBe('Manipura');
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns correct mapping for Capricórnio', () => {
      const result = getZodiacChakra('Capricórnio');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Capricórnio');
      expect(result?.chakra_primario).toBe('Muladhara');
      expect(result?.chakra_secundario).toBe('Anahata');
      expect(result?.elemento).toBe('Terra');
    });

    it('returns correct mapping for Aquário', () => {
      const result = getZodiacChakra('Aquário');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Aquário');
      expect(result?.chakra_primario).toBe('Ajna');
      expect(result?.chakra_secundario).toBe('Vishuddha');
      expect(result?.elemento).toBe('Ar');
    });

    it('returns correct mapping for Peixes', () => {
      const result = getZodiacChakra('Peixes');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Peixes');
      expect(result?.chakra_primario).toBe('Sahasrara');
      expect(result?.chakra_secundario).toBe('Ajna');
      expect(result?.elemento).toBe('Água');
    });

    it('handles case-insensitive input', () => {
      expect(getZodiacChakra('ARIES')?.signo).toBe('Áries');
      expect(getZodiacChakra('aries')?.signo).toBe('Áries');
      expect(getZodiacChakra('LEÃO')?.signo).toBe('Leão');
    });

    it('handles accent variations', () => {
      expect(getZodiacChakra('Gemeos')?.signo).toBe('Gémeos');
      expect(getZodiacChakra('Leao')?.signo).toBe('Leão');
      expect(getZodiacChakra('Sagitario')?.signo).toBe('Sagitário');
      expect(getZodiacChakra('Escorpiao')?.signo).toBe('Escorpião');
    });

    it('returns null for unknown sign', () => {
      expect(getZodiacChakra('Unknown')).toBeNull();
      expect(getZodiacChakra('')).toBeNull();
    });
  });

  describe('getChakraZodiac', () => {
    it('returns Áries for Manipura (primary)', () => {
      const result = getChakraZodiac('Manipura');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Áries');
    });

    it('returns Sagitário for Sahasrara (primary)', () => {
      const result = getChakraZodiac('Sahasrara');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Sagitário');
    });

    it('returns first sign for Ajna (Caranguejo has Ajna as primary)', () => {
      const result = getChakraZodiac('Ajna');
      expect(result).not.toBeNull();
      // Caranguejo is found first as it has Ajna as primary
      expect(result?.signo).toBe('Caranguejo');
    });

    it('handles chakra aliases', () => {
      expect(getChakraZodiac('coronário')?.signo).toBe('Sagitário');
      // Both Caranguejo and Aquário have Ajna as primary, Caranguejo found first
      expect(getChakraZodiac('frontal')?.signo).toBe('Caranguejo');
    });

    it('returns null for chakra with no primary sign mapping', () => {
      expect(getChakraZodiac('Unknown')).toBeNull();
    });
  });

  describe('getChakraZodiacs', () => {
    it('returns all signs for Muladhara (primary + secondary)', () => {
      const result = getChakraZodiacs('Muladhara');
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some((r) => r.signo === 'Áries')).toBe(true);
      expect(result.some((r) => r.signo === 'Touro')).toBe(true);
    });

    it('returns all signs for Ajna (primary + secondary)', () => {
      const result = getChakraZodiacs('Ajna');
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some((r) => r.signo === 'Caranguejo')).toBe(true);
      expect(result.some((r) => r.signo === 'Gémeos')).toBe(true);
    });

    it('returns empty array for unknown chakra', () => {
      expect(getChakraZodiacs('Unknown')).toEqual([]);
    });
  });

  describe('getAllZodiacChakras', () => {
    it('returns all 12 zodiac-chakra mappings', () => {
      const result = getAllZodiacChakras();
      expect(result).toHaveLength(12);
    });

    it('includes all zodiac signs', () => {
      const result = getAllZodiacChakras();
      const signos = result.map((r) => r.signo);
      expect(signos).toContain('Áries');
      expect(signos).toContain('Touro');
      expect(signos).toContain('Gémeos');
      expect(signos).toContain('Caranguejo');
      expect(signos).toContain('Leão');
      expect(signos).toContain('Virgem');
      expect(signos).toContain('Balança');
      expect(signos).toContain('Escorpião');
      expect(signos).toContain('Sagitário');
      expect(signos).toContain('Capricórnio');
      expect(signos).toContain('Aquário');
      expect(signos).toContain('Peixes');
    });

    it('each mapping has required fields', () => {
      const result = getAllZodiacChakras();
      for (const mapping of result) {
        expect(mapping.signo).toBeDefined();
        expect(mapping.chakra_primario).toBeDefined();
        expect(mapping.chakra_secundario).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.praticas).toBeDefined();
        expect(Array.isArray(mapping.praticas)).toBe(true);
        expect(mapping.praticas.length).toBeGreaterThan(0);
      }
    });
  });

  describe('ZODIAC_CHAKRA_MAPPINGS', () => {
    it('has 12 entries', () => {
      expect(Object.keys(ZODIAC_CHAKRA_MAPPINGS)).toHaveLength(12);
    });

    it('all elements are valid', () => {
      const elementos = Object.values(ZODIAC_CHAKRA_MAPPINGS).map((m) => m.elemento);
      const validElements = ['Fogo', 'Terra', 'Ar', 'Água'];
      for (const elemento of elementos) {
        expect(validElements).toContain(elemento);
      }
    });

    it('all chakras are valid', () => {
      const chakras = Object.values(ZODIAC_CHAKRA_MAPPINGS).flatMap((m) => [
        m.chakra_primario,
        m.chakra_secundario,
      ]);
      const validChakras = [
        'Muladhara',
        'Svadhisthana',
        'Manipura',
        'Anahata',
        'Vishuddha',
        'Ajna',
        'Sahasrara',
      ];
      for (const chakra of chakras) {
        expect(validChakras).toContain(chakra);
      }
    });

    it('no sign has same primary and secondary chakra', () => {
      for (const mapping of Object.values(ZODIAC_CHAKRA_MAPPINGS)) {
        expect(mapping.chakra_primario).not.toBe(mapping.chakra_secundario);
      }
    });
  });

  describe('elemental alignment', () => {
    it('fire signs have correct element', () => {
      expect(getZodiacChakra('Áries')?.elemento).toBe('Fogo');
      expect(getZodiacChakra('Leão')?.elemento).toBe('Fogo');
      expect(getZodiacChakra('Sagitário')?.elemento).toBe('Fogo');
    });

    it('earth signs have correct element', () => {
      expect(getZodiacChakra('Touro')?.elemento).toBe('Terra');
      expect(getZodiacChakra('Virgem')?.elemento).toBe('Terra');
      expect(getZodiacChakra('Capricórnio')?.elemento).toBe('Terra');
    });

    it('air signs have correct element', () => {
      expect(getZodiacChakra('Gémeos')?.elemento).toBe('Ar');
      expect(getZodiacChakra('Balança')?.elemento).toBe('Ar');
      expect(getZodiacChakra('Aquário')?.elemento).toBe('Ar');
    });

    it('water signs have correct element', () => {
      expect(getZodiacChakra('Caranguejo')?.elemento).toBe('Água');
      expect(getZodiacChakra('Escorpião')?.elemento).toBe('Água');
      expect(getZodiacChakra('Peixes')?.elemento).toBe('Água');
    });
  });

  describe('spiritual practices', () => {
    it('all signs have at least one practice', () => {
      for (const mapping of Object.values(ZODIAC_CHAKRA_MAPPINGS)) {
        expect(mapping.praticas.length).toBeGreaterThan(0);
      }
    });

    it('practices are valid spiritual practices', () => {
      const validPractices = [
        'Meditação',
        'Yoga',
        'Pranayama',
        'Visualização',
        'Mantras',
        'Afirmações',
        'Journaling',
        'Banhos Ritualísticos',
        'Defumação',
        'Gratidão',
        'Autosugestão',
        'Respiração',
        'Caminhada',
        'Contemplação',
      ];
      for (const mapping of Object.values(ZODIAC_CHAKRA_MAPPINGS)) {
        for (const pratica of mapping.praticas) {
          expect(validPractices).toContain(pratica);
        }
      }
    });
  });
});
