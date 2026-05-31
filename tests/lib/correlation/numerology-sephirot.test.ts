import { describe, it, expect } from 'vitest';
import {
  getNumerologySephirot,
  getSephirotNumerology,
  getAllNumerologySephiroths,
  NUMEROLOGY_SEPHIROT_MAPPINGS,
  type NumerologySephirot,
} from '@/lib/correlation/numerology-sephirot';

describe('numerology-sephirot', () => {
  // ─── getNumerologySephirot: valid numbers ────────────────────────────────────

  describe('getNumerologySephirot', () => {
    it('returns Kether mapping for numero 1 with Éter element', () => {
      const result = getNumerologySephirot(1);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(1);
      expect(result?.sephirah).toBe('Kether');
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(11);
      expect(result?.energia_espiritual).toBe('Pureza Primordial / Unidade Absoluta / Coroa Divina');
    });

    it('returns Chokmah mapping for numero 2 with Éter element', () => {
      const result = getNumerologySephirot(2);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(2);
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(12);
      expect(result?.energia_espiritual).toBe('Impulso Primordial / Dinamismo Criativo / Força Vital');
    });

    it('returns Binah mapping for numero 3 with Ar element', () => {
      const result = getNumerologySephirot(3);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(3);
      expect(result?.sephirah).toBe('Binah');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(3);
      expect(result?.energia_espiritual).toBe('Forma / Limitação / Discernimento Superior / Compreensão');
    });

    it('returns Chesed mapping for numero 4 with Água element', () => {
      const result = getNumerologySephirot(4);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(4);
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(4);
      expect(result?.energia_espiritual).toBe('Expansão / Abundância / Misericórdia Divina / Graça');
    });

    it('returns Geburah mapping for numero 5 with Fogo element', () => {
      const result = getNumerologySephirot(5);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(5);
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(5);
      expect(result?.energia_espiritual).toBe('Força / Guerra Santa / Cortante / Rigidês Divina');
    });

    it('returns Tiphereth mapping for numero 6 with Fogo element', () => {
      const result = getNumerologySephirot(6);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(6);
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(6);
      expect(result?.energia_espiritual).toBe('Harmonia / Brilho Solar / Propósito de Vida / Beleza');
    });

    it('returns Netzach mapping for numero 7 with Água element', () => {
      const result = getNumerologySephirot(7);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(7);
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(7);
      expect(result?.energia_espiritual).toBe('Vitória Emocional / Amor Universal / Triunfo');
    });

    it('returns Hod mapping for numero 8 with Ar element', () => {
      const result = getNumerologySephirot(8);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(8);
      expect(result?.sephirah).toBe('Hod');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(8);
      expect(result?.energia_espiritual).toBe('Intelecto / Comunicação / Verdade Divina / Glória');
    });

    it('returns Yesod mapping for numero 9 with Água element', () => {
      const result = getNumerologySephirot(9);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(9);
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(9);
      expect(result?.energia_espiritual).toBe('Imaginação / Base Subconsciente / Lua / Fundação');
    });

    it('returns Malkuth mapping for numero 10 with Terra element', () => {
      const result = getNumerologySephirot(10);
      expect(result).toBeDefined();
      expect(result?.numero).toBe(10);
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero_caminho).toBe(10);
      expect(result?.energia_espiritual).toBe('Manifestação / Aterramento / Matéria / Reino');
    });

    it('returns null for numero 0', () => {
      const result = getNumerologySephirot(0);
      expect(result).toBeNull();
    });

    it('returns null for negative numbers', () => {
      const result = getNumerologySephirot(-1);
      expect(result).toBeNull();
    });

    it('returns null for numbers greater than 10', () => {
      const result = getNumerologySephirot(11);
      expect(result).toBeNull();
    });
  });

  // ─── getSephirotNumerology ───────────────────────────────────────────────────

  describe('getSephirotNumerology', () => {
    it('returns Kether for numero 1', () => {
      const result = getSephirotNumerology(1);
      expect(result).toBe('Kether');
    });

    it('returns Chokmah for numero 2', () => {
      const result = getSephirotNumerology(2);
      expect(result).toBe('Chokmah');
    });

    it('returns Binah for numero 3', () => {
      const result = getSephirotNumerology(3);
      expect(result).toBe('Binah');
    });

    it('returns Chesed for numero 4', () => {
      const result = getSephirotNumerology(4);
      expect(result).toBe('Chesed');
    });

    it('returns Geburah for numero 5', () => {
      const result = getSephirotNumerology(5);
      expect(result).toBe('Geburah');
    });

    it('returns Tiphereth for numero 6', () => {
      const result = getSephirotNumerology(6);
      expect(result).toBe('Tiphereth');
    });

    it('returns Netzach for numero 7', () => {
      const result = getSephirotNumerology(7);
      expect(result).toBe('Netzach');
    });

    it('returns Hod for numero 8', () => {
      const result = getSephirotNumerology(8);
      expect(result).toBe('Hod');
    });

    it('returns Yesod for numero 9', () => {
      const result = getSephirotNumerology(9);
      expect(result).toBe('Yesod');
    });

    it('returns Malkuth for numero 10', () => {
      const result = getSephirotNumerology(10);
      expect(result).toBe('Malkuth');
    });

    it('returns null for invalid numbers', () => {
      expect(getSephirotNumerology(0)).toBeNull();
      expect(getSephirotNumerology(11)).toBeNull();
      expect(getSephirotNumerology(-5)).toBeNull();
    });
  });

  // ─── getAllNumerologySephiroths ─────────────────────────────────────────────

  describe('getAllNumerologySephiroths', () => {
    it('returns all 10 numerology-Sephirot mappings', () => {
      const result = getAllNumerologySephiroths();
      expect(result).toHaveLength(10);
    });

    it('contains mappings for numbers 1 through 10', () => {
      const result = getAllNumerologySephiroths();
      const numbers = result.map(m => m.numero).sort((a, b) => a - b);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('contains all Sephiroth names', () => {
      const result = getAllNumerologySephiroths();
      const sephiroth = result.map(m => m.sephirah).sort();
      expect(sephiroth).toEqual([
        'Binah',
        'Chesed',
        'Chokmah',
        'Geburah',
        'Hod',
        'Kether',
        'Malkuth',
        'Netzach',
        'Tiphereth',
        'Yesod',
      ]);
    });

    it('each mapping has all required fields', () => {
      const result = getAllNumerologySephiroths();
      result.forEach(mapping => {
        expect(mapping).toHaveProperty('numero');
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('energia_espiritual');
      });
    });
  });

  // ─── NUMEROLOGY_SEPHIROT_MAPPINGS constant ───────────────────────────────────

  describe('NUMEROLOGY_SEPHIROT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(NUMEROLOGY_SEPHIROT_MAPPINGS)).toBe(true);
    });

    it('contains exactly 10 mappings', () => {
      expect(Object.keys(NUMEROLOGY_SEPHIROT_MAPPINGS)).toHaveLength(10);
    });

    it('has numeric keys from 1 to 10', () => {
      const keys = Object.keys(NUMEROLOGY_SEPHIROT_MAPPINGS).map(Number).sort((a, b) => a - b);
      expect(keys).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('each mapping value is also frozen', () => {
      const values = Object.values(NUMEROLOGY_SEPHIROT_MAPPINGS);
      values.forEach(value => {
        expect(Object.isFrozen(value)).toBe(true);
      });
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('NumerologySephirot interface completeness', () => {
    it('has all required fields for numero 1 (Kether)', () => {
      const mapping = NUMEROLOGY_SEPHIROT_MAPPINGS[1];
      expect(mapping.numero).toBe(1);
      expect(typeof mapping.sephirah).toBe('string');
      expect(['Fogo', 'Terra', 'Ar', 'Água', 'Éter']).toContain(mapping.elemento);
      expect(typeof mapping.numero_caminho).toBe('number');
      expect(typeof mapping.energia_espiritual).toBe('string');
    });

    it('has all required fields for numero 10 (Malkuth)', () => {
      const mapping = NUMEROLOGY_SEPHIROT_MAPPINGS[10];
      expect(mapping.numero).toBe(10);
      expect(typeof mapping.sephirah).toBe('string');
      expect(['Fogo', 'Terra', 'Ar', 'Água', 'Éter']).toContain(mapping.elemento);
      expect(typeof mapping.numero_caminho).toBe('number');
      expect(typeof mapping.energia_espiritual).toBe('string');
    });
  });

  // ─── Element distribution ───────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('contains Éter element for numbers 1-2 (crown sephiroth)', () => {
      const result = getAllNumerologySephiroths();
      const etherMappings = result.filter(m => m.elemento === 'Éter');
      expect(etherMappings).toHaveLength(2);
      expect(etherMappings.map(m => m.numero)).toEqual([1, 2]);
    });

    it('contains Ar element for numbers 3 and 8', () => {
      const result = getAllNumerologySephiroths();
      const arMappings = result.filter(m => m.elemento === 'Ar');
      expect(arMappings).toHaveLength(2);
      expect(arMappings.map(m => m.numero).sort()).toEqual([3, 8]);
    });

    it('contains Água element for numbers 4, 7, and 9', () => {
      const result = getAllNumerologySephiroths();
      const aguaMappings = result.filter(m => m.elemento === 'Água');
      expect(aguaMappings).toHaveLength(3);
      expect(aguaMappings.map(m => m.numero).sort()).toEqual([4, 7, 9]);
    });

    it('contains Fogo element for numbers 5 and 6', () => {
      const result = getAllNumerologySephiroths();
      const fogoMappings = result.filter(m => m.elemento === 'Fogo');
      expect(fogoMappings).toHaveLength(2);
      expect(fogoMappings.map(m => m.numero).sort()).toEqual([5, 6]);
    });

    it('contains Terra element for number 10', () => {
      const result = getAllNumerologySephiroths();
      const terraMappings = result.filter(m => m.elemento === 'Terra');
      expect(terraMappings).toHaveLength(1);
      expect(terraMappings[0]?.numero).toBe(10);
    });
  });

  // ─── Path number verification ────────────────────────────────────────────────

  describe('Path number verification', () => {
    it('Kether has path 11 (crown)', () => {
      const result = getNumerologySephirot(1);
      expect(result?.numero_caminho).toBe(11);
    });

    it('Chokmah has path 12 (wisdom)', () => {
      const result = getNumerologySephirot(2);
      expect(result?.numero_caminho).toBe(12);
    });

    it('Binah has path 3 (understanding)', () => {
      const result = getNumerologySephirot(3);
      expect(result?.numero_caminho).toBe(3);
    });

    it('Chesed has path 4 (mercy)', () => {
      const result = getNumerologySephirot(4);
      expect(result?.numero_caminho).toBe(4);
    });

    it('Geburah has path 5 (severity)', () => {
      const result = getNumerologySephirot(5);
      expect(result?.numero_caminho).toBe(5);
    });

    it('Tiphereth has path 6 (beauty)', () => {
      const result = getNumerologySephirot(6);
      expect(result?.numero_caminho).toBe(6);
    });

    it('Netzach has path 7 (victory)', () => {
      const result = getNumerologySephirot(7);
      expect(result?.numero_caminho).toBe(7);
    });

    it('Hod has path 8 (glory)', () => {
      const result = getNumerologySephirot(8);
      expect(result?.numero_caminho).toBe(8);
    });

    it('Yesod has path 9 (foundation)', () => {
      const result = getNumerologySephirot(9);
      expect(result?.numero_caminho).toBe(9);
    });

    it('Malkuth has path 10 (kingdom)', () => {
      const result = getNumerologySephirot(10);
      expect(result?.numero_caminho).toBe(10);
    });
  });

  // ─── Spiritual energy content ───────────────────────────────────────────────

  describe('Spiritual energy content', () => {
    it('Kether energy contains crown/divine references', () => {
      const result = getNumerologySephirot(1);
      expect(result?.energia_espiritual).toMatch(/Coroa|Divina|Unidade/i);
    });

    it('Chokmah energy contains creative/force references', () => {
      const result = getNumerologySephirot(2);
      expect(result?.energia_espiritual).toMatch(/Criativo|Força|Dinamismo/i);
    });

    it('Binah energy contains understanding/discernment references', () => {
      const result = getNumerologySephirot(3);
      expect(result?.energia_espiritual).toMatch(/Discernimento|Compreensão|Limitação/i);
    });

    it('Malkuth energy contains manifestation/earth references', () => {
      const result = getNumerologySephirot(10);
      expect(result?.energia_espiritual).toMatch(/Manifestação|Matéria|Reino/i);
    });
  });
});