import { describe, it, expect } from 'vitest';
import {
  getZodiacNumerology,
  getZodiacNumerologyMapping,
  getNumerologyZodiac,
  getAllZodiacNumerology,
  getAllZodiacNumerologies,
  getAllZodiacSigns,
  hasZodiacNumerology,
  getMappingByNumero,
  getZodiacByElement,
  getZodiacByOrixa,
  getZodiacByModalidade,
  getZodiacByPlaneta,
  getZodiacBySephirah,
  ZODIAC_NUMEROLOGY_MAPPINGS,
  type ZodiacNumerologyMapping,
} from '@/lib/correlation/zodiac-numerology';

describe('zodiac-numerology', () => {
  // ─── getZodiacNumerologyMapping: valid signs ─────────────────────────────────

  describe('getZodiacNumerologyMapping', () => {
    it('returns mapping for Áries', () => {
      const mapping = getZodiacNumerologyMapping('Áries');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Áries');
      expect(mapping?.numero).toBe(1);
      expect(mapping?.elemento).toBe('Fogo');
      expect(mapping?.modalidade).toBe('Cardinal');
    });

    it('returns mapping for Touro', () => {
      const mapping = getZodiacNumerologyMapping('Touro');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Touro');
      expect(mapping?.numero).toBe(2);
      expect(mapping?.elemento).toBe('Terra');
    });

    it('returns mapping for Gêmeos', () => {
      const mapping = getZodiacNumerologyMapping('Gêmeos');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Gêmeos');
      expect(mapping?.numero).toBe(3);
    });

    it('returns mapping for Câncer', () => {
      const mapping = getZodiacNumerologyMapping('Câncer');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Câncer');
      expect(mapping?.numero).toBe(4);
    });

    it('returns mapping for Leão', () => {
      const mapping = getZodiacNumerologyMapping('Leão');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Leão');
      expect(mapping?.numero).toBe(5);
    });

    it('returns mapping for Virgem', () => {
      const mapping = getZodiacNumerologyMapping('Virgem');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Virgem');
      expect(mapping?.numero).toBe(6);
    });

    it('returns mapping for Libra', () => {
      const mapping = getZodiacNumerologyMapping('Libra');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Libra');
      expect(mapping?.numero).toBe(7);
    });

    it('returns mapping for Escorpião', () => {
      const mapping = getZodiacNumerologyMapping('Escorpião');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Escorpião');
      expect(mapping?.numero).toBe(8);
    });

    it('returns mapping for Sagitário', () => {
      const mapping = getZodiacNumerologyMapping('Sagitário');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Sagitário');
      expect(mapping?.numero).toBe(9);
    });

    it('returns mapping for Capricórnio', () => {
      const mapping = getZodiacNumerologyMapping('Capricórnio');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Capricórnio');
      expect(mapping?.numero).toBe(10);
    });

    it('returns mapping for Aquário', () => {
      const mapping = getZodiacNumerologyMapping('Aquário');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Aquário');
      expect(mapping?.numero).toBe(11);
    });

    it('returns mapping for Peixes', () => {
      const mapping = getZodiacNumerologyMapping('Peixes');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Peixes');
      expect(mapping?.numero).toBe(12);
    });

    it('returns null for invalid sign', () => {
      expect(getZodiacNumerologyMapping('InvalidSign')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getZodiacNumerologyMapping('')).toBeNull();
    });

    it('is case-insensitive', () => {
      expect(getZodiacNumerologyMapping('ARIES')).not.toBeNull();
      expect(getZodiacNumerologyMapping('aries')).not.toBeNull();
      expect(getZodiacNumerologyMapping('aRiEs')).not.toBeNull();
    });

    it('handles accent-insensitive matching', () => {
      expect(getZodiacNumerologyMapping('Aries')).not.toBeNull();
      expect(getZodiacNumerologyMapping('Escorpiao')).not.toBeNull();
    });
  });

  // ─── getZodiacNumerology ─────────────────────────────────────────────────────

  describe('getZodiacNumerology', () => {
    it('returns correct number for Áries', () => {
      expect(getZodiacNumerology('Áries')).toBe(1);
    });

    it('returns correct number for Touro', () => {
      expect(getZodiacNumerology('Touro')).toBe(2);
    });

    it('returns correct number for Gêmeos', () => {
      expect(getZodiacNumerology('Gêmeos')).toBe(3);
    });

    it('returns correct number for Câncer', () => {
      expect(getZodiacNumerology('Câncer')).toBe(4);
    });

    it('returns correct number for Leão', () => {
      expect(getZodiacNumerology('Leão')).toBe(5);
    });

    it('returns correct number for Virgem', () => {
      expect(getZodiacNumerology('Virgem')).toBe(6);
    });

    it('returns correct number for Libra', () => {
      expect(getZodiacNumerology('Libra')).toBe(7);
    });

    it('returns correct number for Escorpião', () => {
      expect(getZodiacNumerology('Escorpião')).toBe(8);
    });

    it('returns correct number for Sagitário', () => {
      expect(getZodiacNumerology('Sagitário')).toBe(9);
    });

    it('returns correct number for Capricórnio', () => {
      expect(getZodiacNumerology('Capricórnio')).toBe(10);
    });

    it('returns correct number for Aquário', () => {
      expect(getZodiacNumerology('Aquário')).toBe(11);
    });

    it('returns correct number for Peixes', () => {
      expect(getZodiacNumerology('Peixes')).toBe(12);
    });

    it('returns null for invalid sign', () => {
      expect(getZodiacNumerology('InvalidSign')).toBeNull();
    });

    it('is case-insensitive', () => {
      expect(getZodiacNumerology('ARIES')).toBe(1);
      expect(getZodiacNumerology('aries')).toBe(1);
    });
  });

  // ─── getAllZodiacNumerology ─────────────────────────────────────────────────

  describe('getAllZodiacNumerology', () => {
    it('returns all 12 zodiac signs', () => {
      const all = getAllZodiacNumerology();
      expect(all).toHaveLength(12);
    });

    it('contains all expected signs', () => {
      const all = getAllZodiacNumerology();
      const signNames = all.map(m => m.signo);
      expect(signNames).toContain('Áries');
      expect(signNames).toContain('Touro');
      expect(signNames).toContain('Gêmeos');
      expect(signNames).toContain('Câncer');
      expect(signNames).toContain('Leão');
      expect(signNames).toContain('Virgem');
      expect(signNames).toContain('Libra');
      expect(signNames).toContain('Escorpião');
      expect(signNames).toContain('Sagitário');
      expect(signNames).toContain('Capricórnio');
      expect(signNames).toContain('Aquário');
      expect(signNames).toContain('Peixes');
    });

    it('all mappings have required fields', () => {
      const all = getAllZodiacNumerology();
      for (const mapping of all) {
        expect(mapping.signo).toBeTruthy();
        expect(mapping.numero).toBeTruthy();
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.modalidade).toBeTruthy();
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(mapping.orixa).toBeTruthy();
        expect(mapping.sephirah).toBeTruthy();
        expect(mapping.planeta).toBeTruthy();
        expect(mapping.interpretacao).toBeTruthy();
      }
    });

    it('all mappings have valid elemento values', () => {
      const all = getAllZodiacNumerology();
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar'];
      for (const mapping of all) {
        expect(validElements).toContain(mapping.elemento);
      }
    });

    it('all mappings have valid modalidade values', () => {
      const all = getAllZodiacNumerology();
      const validModalities = ['Cardinal', 'Fixed', 'Mutable'];
      for (const mapping of all) {
        expect(validModalities).toContain(mapping.modalidade);
      }
    });
  });

  // ─── getAllZodiacSigns ───────────────────────────────────────────────────────

  describe('getAllZodiacSigns', () => {
    it('returns all 12 zodiac signs', () => {
      const signs = getAllZodiacSigns();
      expect(signs).toHaveLength(12);
    });

    it('contains all expected sign names', () => {
      const signs = getAllZodiacSigns();
      expect(signs).toContain('Áries');
      expect(signs).toContain('Touro');
      expect(signs).toContain('Gêmeos');
      expect(signs).toContain('Câncer');
      expect(signs).toContain('Leão');
      expect(signs).toContain('Virgem');
      expect(signs).toContain('Libra');
      expect(signs).toContain('Escorpião');
      expect(signs).toContain('Sagitário');
      expect(signs).toContain('Capricórnio');
      expect(signs).toContain('Aquário');
      expect(signs).toContain('Peixes');
    });
  });

  // ─── hasZodiacNumerology ─────────────────────────────────────────────────────

  describe('hasZodiacNumerology', () => {
    it('returns true for valid signs', () => {
      expect(hasZodiacNumerology('Áries')).toBe(true);
      expect(hasZodiacNumerology('Touro')).toBe(true);
      expect(hasZodiacNumerology('Gêmeos')).toBe(true);
    });

    it('returns false for invalid signs', () => {
      expect(hasZodiacNumerology('InvalidSign')).toBe(false);
      expect(hasZodiacNumerology('')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(hasZodiacNumerology('ARIES')).toBe(true);
      expect(hasZodiacNumerology('aries')).toBe(true);
    });
  });

  // ─── getMappingByNumero ─────────────────────────────────────────────────────

  describe('getMappingByNumero', () => {
    it('returns correct mapping for number 1', () => {
      const mappings = getMappingByNumero(1);
      expect(mappings).toHaveLength(1);
      expect(mappings[0].signo).toBe('Áries');
    });

    it('returns correct mapping for number 11', () => {
      const mappings = getMappingByNumero(11);
      expect(mappings).toHaveLength(1);
      expect(mappings[0].signo).toBe('Aquário');
    });

    it('returns correct mapping for number 12', () => {
      const mappings = getMappingByNumero(12);
      expect(mappings).toHaveLength(1);
      expect(mappings[0].signo).toBe('Peixes');
    });

    it('returns empty array for non-existent number', () => {
      expect(getMappingByNumero(99)).toHaveLength(0);
    });
  });

  // ─── getZodiacByElement ─────────────────────────────────────────────────────

  describe('getZodiacByElement', () => {
    it('returns 3 Fire signs', () => {
      const fireSigns = getZodiacByElement('Fogo');
      expect(fireSigns).toHaveLength(3);
      const signNames = fireSigns.map(m => m.signo);
      expect(signNames).toContain('Áries');
      expect(signNames).toContain('Leão');
      expect(signNames).toContain('Sagitário');
    });

    it('returns 3 Earth signs', () => {
      const earthSigns = getZodiacByElement('Terra');
      expect(earthSigns).toHaveLength(3);
      const signNames = earthSigns.map(m => m.signo);
      expect(signNames).toContain('Touro');
      expect(signNames).toContain('Virgem');
      expect(signNames).toContain('Capricórnio');
    });

    it('returns 3 Air signs', () => {
      const airSigns = getZodiacByElement('Ar');
      expect(airSigns).toHaveLength(3);
      const signNames = airSigns.map(m => m.signo);
      expect(signNames).toContain('Gêmeos');
      expect(signNames).toContain('Libra');
      expect(signNames).toContain('Aquário');
    });

    it('returns 3 Water signs', () => {
      const waterSigns = getZodiacByElement('Água');
      expect(waterSigns).toHaveLength(3);
      const signNames = waterSigns.map(m => m.signo);
      expect(signNames).toContain('Câncer');
      expect(signNames).toContain('Escorpião');
      expect(signNames).toContain('Peixes');
    });

    it('is case-insensitive', () => {
      expect(getZodiacByElement('FOGO')).toHaveLength(3);
      expect(getZodiacByElement('fogo')).toHaveLength(3);
    });

    it('returns empty array for invalid element', () => {
      expect(getZodiacByElement('InvalidElement')).toHaveLength(0);
    });
  });

  // ─── getZodiacByOrixa ───────────────────────────────────────────────────────

  describe('getZodiacByOrixa', () => {
    it('returns signs associated with Ogum', () => {
      const ogumSigns = getZodiacByOrixa('Ogum');
      expect(ogumSigns.some(m => m.signo === 'Áries')).toBe(true);
    });

    it('returns signs associated with Iemanjá', () => {
      const iemanjaSigns = getZodiacByOrixa('Iemanjá');
      expect(iemanjaSigns.some(m => m.signo === 'Câncer')).toBe(true);
      expect(iemanjaSigns.some(m => m.signo === 'Peixes')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(getZodiacByOrixa('OGUM').length).toBeGreaterThan(0);
      expect(getZodiacByOrixa('ogum').length).toBeGreaterThan(0);
    });

    it('returns empty array for non-existent orixá', () => {
      expect(getZodiacByOrixa('NonExistent')).toHaveLength(0);
    });
  });

  // ─── getZodiacByModalidade ─────────────────────────────────────────────────

  describe('getZodiacByModalidade', () => {
    it('returns 4 Cardinal signs', () => {
      const cardinalSigns = getZodiacByModalidade('Cardinal');
      expect(cardinalSigns).toHaveLength(4);
      const signNames = cardinalSigns.map(m => m.signo);
      expect(signNames).toContain('Áries');
      expect(signNames).toContain('Câncer');
      expect(signNames).toContain('Libra');
      expect(signNames).toContain('Capricórnio');
    });

    it('returns 4 Fixed signs', () => {
      const fixedSigns = getZodiacByModalidade('Fixed');
      expect(fixedSigns).toHaveLength(4);
      const signNames = fixedSigns.map(m => m.signo);
      expect(signNames).toContain('Touro');
      expect(signNames).toContain('Leão');
      expect(signNames).toContain('Escorpião');
      expect(signNames).toContain('Aquário');
    });

    it('returns 4 Mutable signs', () => {
      const mutableSigns = getZodiacByModalidade('Mutable');
      expect(mutableSigns).toHaveLength(4);
      const signNames = mutableSigns.map(m => m.signo);
      expect(signNames).toContain('Gêmeos');
      expect(signNames).toContain('Virgem');
      expect(signNames).toContain('Sagitário');
      expect(signNames).toContain('Peixes');
    });

    it('is case-insensitive', () => {
      expect(getZodiacByModalidade('CARDINAL')).toHaveLength(4);
      expect(getZodiacByModalidade('cardinal')).toHaveLength(4);
    });
  });

  // ─── getZodiacByPlaneta ─────────────────────────────────────────────────────

  describe('getZodiacByPlaneta', () => {
    it('returns signs ruled by Marte', () => {
      const marteSigns = getZodiacByPlaneta('Marte');
      expect(marteSigns.some(m => m.signo === 'Áries')).toBe(true);
    });

    it('returns signs ruled by Vênus', () => {
      const venusSigns = getZodiacByPlaneta('Vênus');
      expect(venusSigns.some(m => m.signo === 'Touro')).toBe(true);
      expect(venusSigns.some(m => m.signo === 'Libra')).toBe(true);
    });

    it('returns signs ruled by Mercúrio', () => {
      const mercurioSigns = getZodiacByPlaneta('Mercúrio');
      expect(mercurioSigns.some(m => m.signo === 'Gêmeos')).toBe(true);
      expect(mercurioSigns.some(m => m.signo === 'Virgem')).toBe(true);
    });

    it('returns signs ruled by Júpiter', () => {
      const jupiterSigns = getZodiacByPlaneta('Júpiter');
      expect(jupiterSigns.some(m => m.signo === 'Sagitário')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(getZodiacByPlaneta('MARTE').length).toBeGreaterThan(0);
      expect(getZodiacByPlaneta('marte').length).toBeGreaterThan(0);
    });

    it('returns empty array for non-existent planet', () => {
      expect(getZodiacByPlaneta('NonExistent')).toHaveLength(0);
    });
  });

  // ─── getZodiacBySephirah ───────────────────────────────────────────────────

  describe('getZodiacBySephirah', () => {
    it('returns signs associated with Kether', () => {
      const keterSigns = getZodiacBySephirah('Kether');
      expect(keterSigns.some(m => m.signo === 'Áries')).toBe(true);
    });

    it('returns signs associated with Malkuth', () => {
      const malkuthSigns = getZodiacBySephirah('Malkuth');
      expect(malkuthSigns.some(m => m.signo === 'Capricórnio')).toBe(true);
      expect(malkuthSigns.some(m => m.signo === 'Peixes')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(getZodiacBySephirah('KETHER').length).toBeGreaterThan(0);
      expect(getZodiacBySephirah('kether').length).toBeGreaterThan(0);
    });

    it('returns empty array for non-existent sephirah', () => {
      expect(getZodiacBySephirah('NonExistent')).toHaveLength(0);
    });
  });

  // ─── ZODIAC_NUMEROLOGY_MAPPINGS constant ─────────────────────────────────────

  describe('ZODIAC_NUMEROLOGY_MAPPINGS', () => {
    it('is defined and not null', () => {
      expect(ZODIAC_NUMEROLOGY_MAPPINGS).toBeDefined();
    });

    it('has 12 entries', () => {
      expect(Object.keys(ZODIAC_NUMEROLOGY_MAPPINGS)).toHaveLength(12);
    });

    it('keys are sign names', () => {
      const keys = Object.keys(ZODIAC_NUMEROLOGY_MAPPINGS);
      expect(keys).toContain('Áries');
      expect(keys).toContain('Touro');
      expect(keys).toContain('Gêmeos');
      expect(keys).toContain('Câncer');
      expect(keys).toContain('Leão');
      expect(keys).toContain('Virgem');
      expect(keys).toContain('Libra');
      expect(keys).toContain('Escorpião');
      expect(keys).toContain('Sagitário');
      expect(keys).toContain('Capricórnio');
      expect(keys).toContain('Aquário');
      expect(keys).toContain('Peixes');
    });

    it('is frozen (immutable)', () => {
      expect(Object.isFrozen(ZODIAC_NUMEROLOGY_MAPPINGS)).toBe(true);
    });
  });

  // ─── ZodiacNumerologyMapping interface completeness ─────────────────────────

  describe('ZodiacNumerologyMapping interface completeness', () => {
    it('all mappings have signo property', () => {
      const all = getAllZodiacNumerology();
      for (const mapping of all) {
        expect('signo' in mapping).toBe(true);
        expect(typeof mapping.signo).toBe('string');
      }
    });

    it('all mappings have numero property', () => {
      const all = getAllZodiacNumerology();
      for (const mapping of all) {
        expect('numero' in mapping).toBe(true);
        expect(typeof mapping.numero).toBe('number');
      }
    });

    it('all mappings have elemento property', () => {
      const all = getAllZodiacNumerology();
      for (const mapping of all) {
        expect('elemento' in mapping).toBe(true);
        expect(typeof mapping.elemento).toBe('string');
      }
    });

    it('all mappings have modalidade property', () => {
      const all = getAllZodiacNumerology();
      for (const mapping of all) {
        expect('modalidade' in mapping).toBe(true);
        expect(typeof mapping.modalidade).toBe('string');
      }
    });

    it('all mappings have significado_espiritual property', () => {
      const all = getAllZodiacNumerology();
      for (const mapping of all) {
        expect('significado_espiritual' in mapping).toBe(true);
        expect(typeof mapping.significado_espiritual).toBe('string');
      }
    });

    it('all mappings have orixa property', () => {
      const all = getAllZodiacNumerology();
      for (const mapping of all) {
        expect('orixa' in mapping).toBe(true);
        expect(typeof mapping.orixa).toBe('string');
      }
    });

    it('all mappings have sephirah property', () => {
      const all = getAllZodiacNumerology();
      for (const mapping of all) {
        expect('sephirah' in mapping).toBe(true);
        expect(typeof mapping.sephirah).toBe('string');
      }
    });

    it('all mappings have planeta property', () => {
      const all = getAllZodiacNumerology();
      for (const mapping of all) {
        expect('planeta' in mapping).toBe(true);
        expect(typeof mapping.planeta).toBe('string');
      }
    });

    it('all mappings have interpretacao property', () => {
      const all = getAllZodiacNumerology();
      for (const mapping of all) {
        expect('interpretacao' in mapping).toBe(true);
        expect(typeof mapping.interpretacao).toBe('string');
      }
    });
  });

  // ─── Element distribution ─────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('Fire signs have numero 1, 5, 9', () => {
      const fireSigns = getZodiacByElement('Fogo');
      const numeros = fireSigns.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([1, 5, 9]);
    });

    it('Earth signs have numero 2, 6, 10', () => {
      const earthSigns = getZodiacByElement('Terra');
      const numeros = earthSigns.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([2, 6, 10]);
    });

    it('Air signs have numero 3, 7, 11', () => {
      const airSigns = getZodiacByElement('Ar');
      const numeros = airSigns.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([3, 7, 11]);
    });

    it('Water signs have numero 4, 8, 12', () => {
      const waterSigns = getZodiacByElement('Água');
      const numeros = waterSigns.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([4, 8, 12]);
    });
  });

  // ─── Modality distribution ─────────────────────────────────────────────────
  describe('Modality distribution', () => {
    it('Cardinal signs: Áries, Câncer, Libra, Capricórnio', () => {
      const cardinalSigns = getZodiacByModalidade('Cardinal');
      const signNames = cardinalSigns.map(m => m.signo);
      expect(signNames).toContain('Áries');
      expect(signNames).toContain('Capricórnio');
      expect(signNames).toContain('Câncer');
      expect(signNames).toContain('Libra');
      expect(signNames).toHaveLength(4);
    });
    it('Fixed signs: Touro, Leão, Escorpião, Aquário', () => {
      const fixedSigns = getZodiacByModalidade('Fixed');
      const signNames = fixedSigns.map(m => m.signo);
      expect(signNames).toContain('Touro');
      expect(signNames).toContain('Leão');
      expect(signNames).toContain('Escorpião');
      expect(signNames).toContain('Aquário');
      expect(signNames).toHaveLength(4);
    });
    it('Mutable signs: Gêmeos, Virgem, Sagitário, Peixes', () => {
      const mutableSigns = getZodiacByModalidade('Mutable');
      const signNames = mutableSigns.map(m => m.signo);
      expect(signNames).toContain('Gêmeos');
      expect(signNames).toContain('Virgem');
      expect(signNames).toContain('Sagitário');
      expect(signNames).toContain('Peixes');
      expect(signNames).toHaveLength(4);
    });
  // ─── getNumerologyZodiac ───────────────────────────────────────────────────
  describe('getNumerologyZodiac', () => {
    it('returns mapping for Áries', () => {
      const mapping = getNumerologyZodiac('Áries');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Áries');
      expect(mapping?.numero).toBe(1);
    });
    it('returns mapping for Peixes', () => {
      const mapping = getNumerologyZodiac('Peixes');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Peixes');
      expect(mapping?.numero).toBe(12);
    });
    it('returns null for invalid sign', () => {
      const mapping = getNumerologyZodiac('InvalidSign');
      expect(mapping).toBeNull();
    });
    it('is case insensitive', () => {
      const mapping = getNumerologyZodiac('ARIES');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Áries');
    });
    it('handles accented input', () => {
      const mapping = getNumerologyZodiac('Sagitário');
      expect(mapping).not.toBeNull();
      expect(mapping?.signo).toBe('Sagitário');
    });
  });
  // ─── getAllZodiacNumerologies ───────────────────────────────────────────────
  describe('getAllZodiacNumerologies', () => {
    it('returns all 12 zodiac numerology mappings', () => {
      const allMappings = getAllZodiacNumerologies();
      expect(allMappings).toHaveLength(12);
    });
    it('contains all expected zodiac signs', () => {
      const allMappings = getAllZodiacNumerologies();
      const signNames = allMappings.map(m => m.signo);
      expect(signNames).toContain('Áries');
      expect(signNames).toContain('Touro');
      expect(signNames).toContain('Gêmeos');
      expect(signNames).toContain('Câncer');
      expect(signNames).toContain('Leão');
      expect(signNames).toContain('Virgem');
      expect(signNames).toContain('Libra');
      expect(signNames).toContain('Escorpião');
      expect(signNames).toContain('Sagitário');
      expect(signNames).toContain('Capricórnio');
      expect(signNames).toContain('Aquário');
      expect(signNames).toContain('Peixes');
    });
    it('returns same result as getAllZodiacNumerology', () => {
      const aliasResult = getAllZodiacNumerologies();
      const originalResult = getAllZodiacNumerology();
      expect(aliasResult).toEqual(originalResult);
    });
    it('each mapping has required fields', () => {
      const allMappings = getAllZodiacNumerologies();
      allMappings.forEach(mapping => {
        expect(mapping.signo).toBeDefined();
        expect(mapping.numero).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.modalidade).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.orixa).toBeDefined();
        expect(mapping.sephirah).toBeDefined();
        expect(mapping.planeta).toBeDefined();
        expect(mapping.interpretacao).toBeDefined();
      });
    });
  });
});
});