import { describe, it, expect } from 'vitest';
import {
  getNumerologyZodiac,
  getZodiacNumerology,
  getAllNumerologyZodiacs,
  getAllNumerologyNumbers,
  hasNumerologyZodiac,
  getMappingBySigno,
  getNumerologyByElement,
  getNumerologyByOrixa,
  getNumerologyByModalidade,
  getNumerologyByPlaneta,
  getNumerologyBySephirah,
  NUMEROLOGY_ZODIAC_MAPPINGS,
  type NumerologyZodiacMapping,
} from '@/lib/correlation/numerology-zodiac';

describe('numerology-zodiac', () => {
  // ─── getNumerologyZodiac: valid numbers ──────────────────────────────────────

  describe('getNumerologyZodiac', () => {
    it('returns mapping for number 1 (Áries)', () => {
      const result = getNumerologyZodiac(1);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(1);
      expect(result?.signo).toBe('Áries');
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns mapping for number 2 (Touro)', () => {
      const result = getNumerologyZodiac(2);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(2);
      expect(result?.signo).toBe('Touro');
      expect(result?.elemento).toBe('Terra');
    });

    it('returns mapping for number 3 (Gêmeos)', () => {
      const result = getNumerologyZodiac(3);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(3);
      expect(result?.signo).toBe('Gêmeos');
      expect(result?.elemento).toBe('Ar');
    });

    it('returns mapping for number 4 (Câncer)', () => {
      const result = getNumerologyZodiac(4);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(4);
      expect(result?.signo).toBe('Câncer');
      expect(result?.elemento).toBe('Água');
    });

    it('returns mapping for number 5 (Leão)', () => {
      const result = getNumerologyZodiac(5);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(5);
      expect(result?.signo).toBe('Leão');
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns mapping for number 6 (Virgem)', () => {
      const result = getNumerologyZodiac(6);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(6);
      expect(result?.signo).toBe('Virgem');
      expect(result?.elemento).toBe('Terra');
    });

    it('returns mapping for number 7 (Libra)', () => {
      const result = getNumerologyZodiac(7);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(7);
      expect(result?.signo).toBe('Libra');
      expect(result?.elemento).toBe('Ar');
    });

    it('returns mapping for number 8 (Escorpião)', () => {
      const result = getNumerologyZodiac(8);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(8);
      expect(result?.signo).toBe('Escorpião');
      expect(result?.elemento).toBe('Água');
    });

    it('returns mapping for number 9 (Sagitário)', () => {
      const result = getNumerologyZodiac(9);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(9);
      expect(result?.signo).toBe('Sagitário');
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns mapping for number 10 (Capricórnio)', () => {
      const result = getNumerologyZodiac(10);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(10);
      expect(result?.signo).toBe('Capricórnio');
      expect(result?.elemento).toBe('Terra');
    });

    it('returns null for number0', () => {
      const result = getNumerologyZodiac(0);
      expect(result).toBeNull();
    });

    it('returns null for negative numbers', () => {
      expect(getNumerologyZodiac(-1)).toBeNull();
      expect(getNumerologyZodiac(-5)).toBeNull();
    });

    it('returns null for numbers greater than 10', () => {
      expect(getNumerologyZodiac(11)).toBeNull();
      expect(getNumerologyZodiac(100)).toBeNull();
    });
  });

  // ─── getZodiacNumerology ──────────────────────────────────────────────────────

  describe('getZodiacNumerology', () => {
    it('returns1 for Áries', () => {
      expect(getZodiacNumerology('Áries')).toBe(1);
    });

    it('returns 2 for Touro', () => {
      expect(getZodiacNumerology('Touro')).toBe(2);
    });

    it('returns3 for Gêmeos', () => {
      expect(getZodiacNumerology('Gêmeos')).toBe(3);
    });

    it('returns 4 for Câncer', () => {
      expect(getZodiacNumerology('Câncer')).toBe(4);
    });

    it('returns 5 for Leão', () => {
      expect(getZodiacNumerology('Leão')).toBe(5);
    });

    it('returns 6 for Virgem', () => {
      expect(getZodiacNumerology('Virgem')).toBe(6);
    });

    it('returns 7 for Libra', () => {
      expect(getZodiacNumerology('Libra')).toBe(7);
    });

    it('returns 8 for Escorpião', () => {
      expect(getZodiacNumerology('Escorpião')).toBe(8);
    });

    it('returns 9 for Sagitário', () => {
      expect(getZodiacNumerology('Sagitário')).toBe(9);
    });

    it('returns 10 for Capricórnio', () => {
      expect(getZodiacNumerology('Capricórnio')).toBe(10);
    });

    it('is case-insensitive', () => {
      expect(getZodiacNumerology('ARIES')).toBe(1);
      expect(getZodiacNumerology('aries')).toBe(1);
      expect(getZodiacNumerology('aRiEs')).toBe(1);
    });

    it('returns null for unknown sign', () => {
      expect(getZodiacNumerology('Peixes')).toBeNull();
      expect(getZodiacNumerology('Aquário')).toBeNull();
    });
  });

  // ─── getAllNumerologyZodiacs ─────────────────────────────────────────────────

  describe('getAllNumerologyZodiacs', () => {
    it('returns all 10 mappings', () => {
      const result = getAllNumerologyZodiacs();
      expect(result).toHaveLength(10);
    });

    it('returns mappings sorted by numero', () => {
      const result = getAllNumerologyZodiacs();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero).toBeLessThan(result[i + 1].numero);
      }
    });

    it('contains all expected signs', () => {
      const result = getAllNumerologyZodiacs();
      const signs = result.map(m => m.signo);
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
    });
  });

  // ─── getAllNumerologyNumbers ─────────────────────────────────────────────────

  describe('getAllNumerologyNumbers', () => {
    it('returns numbers 1-10', () => {
      const result = getAllNumerologyNumbers();
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('returns sorted numbers', () => {
      const result = getAllNumerologyNumbers();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toBeLessThan(result[i + 1]);
      }
    });
  });

  // ─── hasNumerologyZodiac ─────────────────────────────────────────────────────

  describe('hasNumerologyZodiac', () => {
    it('returns true for valid numbers 1-10', () => {
      for (let i = 1; i <= 10; i++) {
        expect(hasNumerologyZodiac(i)).toBe(true);
      }
    });

    it('returns false for 0', () => {
      expect(hasNumerologyZodiac(0)).toBe(false);
    });

    it('returns false for negative numbers', () => {
      expect(hasNumerologyZodiac(-1)).toBe(false);
    });

    it('returns false for numbers greater than 10', () => {
      expect(hasNumerologyZodiac(11)).toBe(false);
    });
  });

  // ─── getMappingBySigno ───────────────────────────────────────────────────────

  describe('getMappingBySigno', () => {
    it('returns mapping for valid sign name', () => {
      const result = getMappingBySigno('Áries');
      expect(result).toBeDefined();
      expect(result?.numero).toBe(1);
    });

    it('is case-insensitive', () => {
      const result = getMappingBySigno('ARIES');
      expect(result).toBeDefined();
      expect(result?.numero).toBe(1);
    });

    it('returns null for unknown sign', () => {
      expect(getMappingBySigno('Peixes')).toBeNull();
    });
  });

  // ─── getNumerologyByElement ─────────────────────────────────────────────────

  describe('getNumerologyByElement', () => {
    it('returns3 mappings for Fogo (1, 5, 9)', () => {
      const result = getNumerologyByElement('Fogo');
      expect(result).toHaveLength(3);
      const numeros = result.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([1, 5, 9]);
    });

    it('returns 2 mappings for Água (4, 8)', () => {
      const result = getNumerologyByElement('Água');
      expect(result).toHaveLength(2);
      const numeros = result.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([4, 8]);
    });

    it('returns 3 mappings for Terra (2, 6, 10)', () => {
      const result = getNumerologyByElement('Terra');
      expect(result).toHaveLength(3);
      const numeros = result.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([2, 6, 10]);
    });

    it('returns 2 mappings for Ar (3, 7)', () => {
      const result = getNumerologyByElement('Ar');
      expect(result).toHaveLength(2);
      const numeros = result.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([3, 7]);
    });

    it('is case-insensitive', () => {
      const result = getNumerologyByElement('FOGO');
      expect(result).toHaveLength(3);
    });

    it('returns empty array for unknown element', () => {
      expect(getNumerologyByElement('Éter')).toEqual([]);
    });
  });

  // ─── getNumerologyByOrixa ───────────────────────────────────────────────────

  describe('getNumerologyByOrixa', () => {
    it('returns mapping for Ogum (Áries)', () => {
      const result = getNumerologyByOrixa('Ogum');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(1);
    });

    it('returns mapping for Iemanjá (Câncer)', () => {
      const result = getNumerologyByOrixa('Iemanjá');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(4);
    });

    it('returns mapping for Oxalá (Capricórnio)', () => {
      const result = getNumerologyByOrixa('Oxalá');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(10);
    });

    it('is case-insensitive', () => {
      const result = getNumerologyByOrixa('OGUM');
      expect(result).toHaveLength(1);
    });

    it('returns empty array for unknown orixá', () => {
      expect(getNumerologyByOrixa('Obaluaiê')).toEqual([]);
    });
  });

  // ─── getNumerologyByModalidade ───────────────────────────────────────────────

  describe('getNumerologyByModalidade', () => {
    it('returns4 mappings for Cardinal (1, 4, 7, 10)', () => {
      const result = getNumerologyByModalidade('Cardinal');
      expect(result).toHaveLength(4);
      const numeros = result.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([1, 4, 7, 10]);
    });

    it('returns 3 mappings for Fixed (2, 5, 8)', () => {
      const result = getNumerologyByModalidade('Fixed');
      expect(result).toHaveLength(3);
      const numeros = result.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([2, 5, 8]);
    });

    it('returns 3 mappings for Mutable (3, 6, 9)', () => {
      const result = getNumerologyByModalidade('Mutable');
      expect(result).toHaveLength(3);
      const numeros = result.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([3, 6, 9]);
    });

    it('is case-insensitive', () => {
      const result = getNumerologyByModalidade('CARDINAL');
      expect(result).toHaveLength(4);
    });
  });

  // ─── getNumerologyByPlaneta ─────────────────────────────────────────────────

  describe('getNumerologyByPlaneta', () => {
    it('returns mapping for Marte (Áries)', () => {
      const result = getNumerologyByPlaneta('Marte');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(1);
    });

    it('returns mapping for Vênus (Touro, Libra)', () => {
      const result = getNumerologyByPlaneta('Vênus');
      expect(result).toHaveLength(2);
      const numeros = result.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([2, 7]);
    });

    it('returns mapping for Mercúrio (Gêmeos, Virgem)', () => {
      const result = getNumerologyByPlaneta('Mercúrio');
      expect(result).toHaveLength(2);
      const numeros = result.map(m => m.numero).sort((a, b) => a - b);
      expect(numeros).toEqual([3, 6]);
    });

    it('returns mapping for Plutão (Escorpião)', () => {
      const result = getNumerologyByPlaneta('Plutão');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(8);
    });

    it('is case-insensitive', () => {
      const result = getNumerologyByPlaneta('MARTE');
      expect(result).toHaveLength(1);
    });
  });

  // ─── getNumerologyBySephirah ───────────────────────────────────────────────

  describe('getNumerologyBySephirah', () => {
    it('returns mapping for Kether (Áries)', () => {
      const result = getNumerologyBySephirah('Kether');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(1);
    });

    it('returns mapping for Malkuth (Capricórnio)', () => {
      const result = getNumerologyBySephirah('Malkuth');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(10);
    });

    it('is case-insensitive', () => {
      const result = getNumerologyBySephirah('KETHER');
      expect(result).toHaveLength(1);
    });
  });

  // ─── NUMEROLOGY_ZODIAC_MAPPINGS constant ─────────────────────────────────────

  describe('NUMEROLOGY_ZODIAC_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(NUMEROLOGY_ZODIAC_MAPPINGS)).toBe(true);
    });

    it('has exactly 10 entries', () => {
      expect(Object.keys(NUMEROLOGY_ZODIAC_MAPPINGS)).toHaveLength(10);
    });

    it('contains numbers 1-10 as keys', () => {
      for (let i = 1; i <= 10; i++) {
        expect(i in NUMEROLOGY_ZODIAC_MAPPINGS).toBe(true);
      }
    });

    it('each mapping has required fields', () => {
      for (const mapping of Object.values(NUMEROLOGY_ZODIAC_MAPPINGS)) {
        expect(mapping).toHaveProperty('numero');
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('modalidade');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('interpretacao');
      }
    });

    it('each mapping numero matches its key', () => {
      for (const [key, mapping] of Object.entries(NUMEROLOGY_ZODIAC_MAPPINGS)) {
        expect(mapping.numero).toBe(Number(key));
      }
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('NumerologyZodiacMapping interface completeness', () => {
    it('all mappings have non-empty strings for required string fields', () => {
      for (const mapping of Object.values(NUMEROLOGY_ZODIAC_MAPPINGS)) {
        expect(mapping.signo.length).toBeGreaterThan(0);
        expect(mapping.elemento.length).toBeGreaterThan(0);
        expect(mapping.modalidade.length).toBeGreaterThan(0);
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
        expect(mapping.orixa.length).toBeGreaterThan(0);
        expect(mapping.sephirah.length).toBeGreaterThan(0);
        expect(mapping.planeta.length).toBeGreaterThan(0);
        expect(mapping.interpretacao.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have valid element values', () => {
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar'];
      for (const mapping of Object.values(NUMEROLOGY_ZODIAC_MAPPINGS)) {
        expect(validElements).toContain(mapping.elemento);
      }
    });

    it('all mappings have valid modalidade values', () => {
      const validModalidades = ['Cardinal', 'Fixed', 'Mutable'];
      for (const mapping of Object.values(NUMEROLOGY_ZODIAC_MAPPINGS)) {
        expect(validModalidades).toContain(mapping.modalidade);
      }
    });
  });

  // ─── Element distribution ─────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('Fogo element has 3 signs (Áries, Leão, Sagitário)', () => {
      const fogo = getNumerologyByElement('Fogo');
      expect(fogo.map(m => m.signo)).toEqual(['Áries', 'Leão', 'Sagitário']);
    });

    it('Terra element has 3 signs (Touro, Virgem, Capricórnio)', () => {
      const terra = getNumerologyByElement('Terra');
      expect(terra.map(m => m.signo)).toEqual(['Touro', 'Virgem', 'Capricórnio']);
    });

    it('Ar element has 2 signs (Gêmeos, Libra)', () => {
      const ar = getNumerologyByElement('Ar');
      expect(ar.map(m => m.signo)).toEqual(['Gêmeos', 'Libra']);
    });

    it('Água element has 2 signs (Câncer, Escorpião)', () => {
      const agua = getNumerologyByElement('Água');
      expect(agua.map(m => m.signo)).toEqual(['Câncer', 'Escorpião']);
    });
  });

  // ─── Modality distribution ─────────────────────────────────────────────────

  describe('Modality distribution', () => {
    it('Cardinal has 4 signs (Áries, Câncer, Libra, Capricórnio)', () => {
      const cardinal = getNumerologyByModalidade('Cardinal');
      expect(cardinal.map(m => m.signo)).toEqual(['Áries', 'Câncer', 'Libra', 'Capricórnio']);
    });

    it('Fixed has 3 signs (Touro, Leão, Escorpião)', () => {
      const fixed = getNumerologyByModalidade('Fixed');
      expect(fixed.map(m => m.signo)).toEqual(['Touro', 'Leão', 'Escorpião']);
    });

    it('Mutable has 3 signs (Gêmeos, Virgem, Sagitário)', () => {
      const mutable = getNumerologyByModalidade('Mutable');
      expect(mutable.map(m => m.signo)).toEqual(['Gêmeos', 'Virgem', 'Sagitário']);
    });
  });
});
