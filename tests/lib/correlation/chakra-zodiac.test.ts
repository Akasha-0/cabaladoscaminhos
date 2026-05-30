import { describe, it, expect } from 'vitest';
import {
  getChakraZodiac,
  getZodiacChakra,
  getAllChakraZodiacs,
  CHAKRA_ZODIAC_MAPPINGS,
} from '@/lib/correlation/chakra-zodiac';

describe('correlation/chakra-zodiac', () => {
  describe('getChakraZodiac', () => {
    it('returns correct mapping for Muladhara', () => {
      const result = getChakraZodiac('Muladhara');
      expect(result).not.toBeNull();
      expect(result!.chakra).toBe('Muladhara');
      expect(result!.signo_primario).toBe('Capricórnio');
      expect(result!.signo_secundario).toBe('Touro');
      expect(result!.elemento).toBe('Terra');
    });

    it('returns correct mapping for Svadhisthana', () => {
      const result = getChakraZodiac('Svadhisthana');
      expect(result).not.toBeNull();
      expect(result!.chakra).toBe('Svadhisthana');
      expect(result!.signo_primario).toBe('Escorpião');
      expect(result!.signo_secundario).toBe('Virgem');
      expect(result!.elemento).toBe('Água');
    });

    it('returns correct mapping for Manipura', () => {
      const result = getChakraZodiac('Manipura');
      expect(result).not.toBeNull();
      expect(result!.chakra).toBe('Manipura');
      expect(result!.signo_primario).toBe('Áries');
      expect(result!.signo_secundario).toBe('Leão');
      expect(result!.elemento).toBe('Fogo');
    });

    it('returns correct mapping for Anahata', () => {
      const result = getChakraZodiac('Anahata');
      expect(result).not.toBeNull();
      expect(result!.chakra).toBe('Anahata');
      expect(result!.signo_primario).toBe('Balança');
      expect(result!.signo_secundario).toBe('Touro');
      expect(result!.elemento).toBe('Ar');
    });

    it('returns correct mapping for Vishuddha', () => {
      const result = getChakraZodiac('Vishuddha');
      expect(result).not.toBeNull();
      expect(result!.chakra).toBe('Vishuddha');
      expect(result!.signo_primario).toBe('Gémeos');
      expect(result!.signo_secundario).toBe('Aquário');
      expect(result!.elemento).toBe('Éter');
    });

    it('returns correct mapping for Ajna', () => {
      const result = getChakraZodiac('Ajna');
      expect(result).not.toBeNull();
      expect(result!.chakra).toBe('Ajna');
      expect(result!.signo_primario).toBe('Aquário');
      expect(result!.signo_secundario).toBe('Caranguejo');
      expect(result!.elemento).toBe('Ar');
    });

    it('returns correct mapping for Sahasrara', () => {
      const result = getChakraZodiac('Sahasrara');
      expect(result).not.toBeNull();
      expect(result!.chakra).toBe('Sahasrara');
      expect(result!.signo_primario).toBe('Sagitário');
      expect(result!.signo_secundario).toBe('Peixes');
      expect(result!.elemento).toBe('Éter');
    });

    it('handles case-insensitive input', () => {
      const upper = getChakraZodiac('MULADHARA');
      const lower = getChakraZodiac('muladhara');
      const mixed = getChakraZodiac('MuLaDhArA');

      expect(upper).not.toBeNull();
      expect(lower).not.toBeNull();
      expect(mixed).not.toBeNull();
      expect(upper!.chakra).toBe('Muladhara');
      expect(lower!.chakra).toBe('Muladhara');
      expect(mixed!.chakra).toBe('Muladhara');
    });

    it('handles alternative chakra names', () => {
      const root = getChakraZodiac('raiz');
      const sacro = getChakraZodiac('sacro');
      const frontal = getChakraZodiac('frontal');

      expect(root).not.toBeNull();
      expect(sacro).not.toBeNull();
      expect(frontal).not.toBeNull();
      expect(root!.chakra).toBe('Muladhara');
      expect(sacro!.chakra).toBe('Svadhisthana');
      expect(frontal!.chakra).toBe('Ajna');
    });

    it('returns null for unknown chakra', () => {
      const result = getChakraZodiac('unknown-chakra');
      expect(result).toBeNull();
    });

    it('returns null for empty input', () => {
      expect(getChakraZodiac('')).toBeNull();
      expect(getChakraZodiac('   ')).toBeNull();
    });
  });

  describe('getZodiacChakra', () => {
    it('returns correct mapping for Áries', () => {
      const result = getZodiacChakra('Áries');
      expect(result).not.toBeNull();
      expect(result!.signo_primario).toBe('Áries');
      expect(result!.chakra).toBe('Manipura');
    });

    it('returns correct mapping for Touro', () => {
      const result = getZodiacChakra('Touro');
      expect(result).not.toBeNull();
      expect(result!.signo_primario).toBe('Capricórnio');
      expect(result!.signo_secundario).toBe('Touro');
      expect(result!.chakra).toBe('Muladhara');
    });

    it('returns correct mapping for Gémeos', () => {
      const result = getZodiacChakra('Gémeos');
      expect(result).not.toBeNull();
      expect(result!.signo_primario).toBe('Gémeos');
      expect(result!.chakra).toBe('Vishuddha');
    });

    it('returns correct mapping for Caranguejo', () => {
      const result = getZodiacChakra('Caranguejo');
      expect(result).not.toBeNull();
      expect(result!.signo_secundario).toBe('Caranguejo');
      expect(result!.chakra).toBe('Ajna');
    });

    it('returns correct mapping for Leão', () => {
      const result = getZodiacChakra('Leão');
      expect(result).not.toBeNull();
      expect(result!.signo_secundario).toBe('Leão');
      expect(result!.chakra).toBe('Manipura');
    });

    it('returns correct mapping for Virgem', () => {
      const result = getZodiacChakra('Virgem');
      expect(result).not.toBeNull();
      expect(result!.signo_secundario).toBe('Virgem');
      expect(result!.chakra).toBe('Svadhisthana');
    });

    it('returns correct mapping for Balança', () => {
      const result = getZodiacChakra('Balança');
      expect(result).not.toBeNull();
      expect(result!.signo_primario).toBe('Balança');
      expect(result!.chakra).toBe('Anahata');
    });

    it('returns correct mapping for Escorpião', () => {
      const result = getZodiacChakra('Escorpião');
      expect(result).not.toBeNull();
      expect(result!.signo_primario).toBe('Escorpião');
      expect(result!.chakra).toBe('Svadhisthana');
    });

    it('returns correct mapping for Sagitário', () => {
      const result = getZodiacChakra('Sagitário');
      expect(result).not.toBeNull();
      expect(result!.signo_primario).toBe('Sagitário');
      expect(result!.chakra).toBe('Sahasrara');
    });

    it('returns correct mapping for Capricórnio', () => {
      const result = getZodiacChakra('Capricórnio');
      expect(result).not.toBeNull();
      expect(result!.signo_primario).toBe('Capricórnio');
      expect(result!.chakra).toBe('Muladhara');
    });

    it('returns correct mapping for Aquário', () => {
      const result = getZodiacChakra('Aquário');
      expect(result).not.toBeNull();
      expect(result!.signo_primario).toBe('Aquário');
      expect(result!.chakra).toBe('Ajna');
    });

    it('returns correct mapping for Peixes', () => {
      const result = getZodiacChakra('Peixes');
      expect(result).not.toBeNull();
      expect(result!.signo_secundario).toBe('Peixes');
      expect(result!.chakra).toBe('Sahasrara');
    });

    it('handles case-insensitive input', () => {
      const upper = getZodiacChakra('ARIES');
      const lower = getZodiacChakra('aries');

      expect(upper).not.toBeNull();
      expect(lower).not.toBeNull();
      expect(upper!.signo_primario).toBe('Áries');
      expect(lower!.signo_primario).toBe('Áries');
    });

    it('handles accent variations', () => {
      const semAcento = getZodiacChakra('Sagitario');
      expect(semAcento).not.toBeNull();
      expect(semAcento!.signo_primario).toBe('Sagitário');
    });

    it('returns null for unknown sign', () => {
      const result = getZodiacChakra('UnknownSign');
      expect(result).toBeNull();
    });
  });

  describe('getAllChakraZodiacs', () => {
    it('returns all 7 chakra-zodiac mappings', () => {
      const result = getAllChakraZodiacs();
      expect(result).toHaveLength(7);
    });

    it('contains all 7 primary chakras', () => {
      const result = getAllChakraZodiacs();
      const chakras = result.map(r => r.chakra);

      expect(chakras).toContain('Muladhara');
      expect(chakras).toContain('Svadhisthana');
      expect(chakras).toContain('Manipura');
      expect(chakras).toContain('Anahata');
      expect(chakras).toContain('Vishuddha');
      expect(chakras).toContain('Ajna');
      expect(chakras).toContain('Sahasrara');
    });

    it('returns a new array each call', () => {
      const result1 = getAllChakraZodiacs();
      const result2 = getAllChakraZodiacs();
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe('CHAKRA_ZODIAC_MAPPINGS', () => {
    it('has correct number of entries', () => {
      expect(Object.keys(CHAKRA_ZODIAC_MAPPINGS)).toHaveLength(7);
    });

    it('all entries have required fields', () => {
      const mappings = Object.values(CHAKRA_ZODIAC_MAPPINGS);

      mappings.forEach(mapping => {
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('signo_primario');
        expect(mapping).toHaveProperty('signo_secundario');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('praticas');
      });
    });

    it('all chakras have valid elements', () => {
      const mappings = Object.values(CHAKRA_ZODIAC_MAPPINGS);

      mappings.forEach(mapping => {
        expect(['Fogo', 'Água', 'Ar', 'Terra', 'Éter']).toContain(mapping.elemento);
      });
    });

    it('all chakras have non-empty practices', () => {
      const mappings = Object.values(CHAKRA_ZODIAC_MAPPINGS);

      mappings.forEach(mapping => {
        expect(mapping.praticas.length).toBeGreaterThan(0);
      });
    });
  });

  describe('elemental alignment', () => {
    it('returns correct element for each chakra', () => {
      const muladhara = getChakraZodiac('Muladhara');
      const svadhisthana = getChakraZodiac('Svadhisthana');
      const manipura = getChakraZodiac('Manipura');
      const anahata = getChakraZodiac('Anahata');
      const vishuddha = getChakraZodiac('Vishuddha');
      const ajna = getChakraZodiac('Ajna');
      const sahasrara = getChakraZodiac('Sahasrara');

      expect(muladhara?.elemento).toBe('Terra');
      expect(svadhisthana?.elemento).toBe('Água');
      expect(manipura?.elemento).toBe('Fogo');
      expect(anahata?.elemento).toBe('Ar');
      expect(vishuddha?.elemento).toBe('Éter');
      expect(ajna?.elemento).toBe('Ar');
      expect(sahasrara?.elemento).toBe('Éter');
    });
  });

  describe('spiritual practices', () => {
    it('Muladhara has grounding practices', () => {
      const result = getChakraZodiac('Muladhara');
      expect(result?.praticas).toContain('Yoga');
      expect(result?.praticas).toContain('Meditação');
    });

    it('Sahasrara has transcendence practices', () => {
      const result = getChakraZodiac('Sahasrara');
      expect(result?.praticas).toContain('Meditação');
      expect(result?.praticas).toContain('Contemplação');
    });
  });
});