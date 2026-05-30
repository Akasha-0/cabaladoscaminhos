import { describe, it, expect } from 'vitest';
import {
  getSephirotElement,
  getElementSephirot,
  getAllSephirotElements,
  SEPHIROT_ELEMENT_MAPPINGS,
  type SephirotElement,
} from '@/lib/correlation/sephirot-element';

describe('sephirot-element', () => {
  // ─── getSephirotElement: valid Sephiroth ────────────────────────────────────

  describe('getSephirotElement', () => {
    it('returns Kether mapping with Éter element', () => {
      const result = getSephirotElement('Kether');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Kether');
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(11);
      expect(result?.energia_espiritual).toBe('Pureza Primordial / Conexão Divina Absoluta');
    });

    it('returns Chokmah mapping with Éter element', () => {
      const result = getSephirotElement('Chokmah');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.elemento).toBe('Éter');
      expect(result?.numero_caminho).toBe(12);
      expect(result?.energia_espiritual).toBe('Impulso Primordial / Dinamismo Criativo');
    });

    it('returns Binah mapping with Ar element', () => {
      const result = getSephirotElement('Binah');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Binah');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(3);
      expect(result?.energia_espiritual).toBe('Forma / Limitação / Discernimento Superior');
    });

    it('returns Chesed mapping with Água element', () => {
      const result = getSephirotElement('Chesed');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(4);
      expect(result?.energia_espiritual).toBe('Expansão / Abundância / Misericórdia Divina');
    });

    it('returns Geburah mapping with Fogo element', () => {
      const result = getSephirotElement('Geburah');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(5);
      expect(result?.energia_espiritual).toBe('Força / Guerra Santa / Cortante');
    });

    it('returns Tiphereth mapping with Fogo element', () => {
      const result = getSephirotElement('Tiphereth');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(6);
      expect(result?.energia_espiritual).toBe('Harmonia / Brilho Solar / Propósito de Vida');
    });

    it('returns Netzach mapping with Água element', () => {
      const result = getSephirotElement('Netzach');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(7);
      expect(result?.energia_espiritual).toBe('Vitória Emocional / Amor Universal');
    });

    it('returns Hod mapping with Ar element', () => {
      const result = getSephirotElement('Hod');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Hod');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(8);
      expect(result?.energia_espiritual).toBe('Intelecto / Comunicação / Verdade Divina');
    });

    it('returns Yesod mapping with Água element', () => {
      const result = getSephirotElement('Yesod');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(9);
      expect(result?.energia_espiritual).toBe('Imaginação / Base Subconsciente / Lua');
    });

    it('returns Malkuth mapping with Terra element', () => {
      const result = getSephirotElement('Malkuth');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero_caminho).toBe(10);
      expect(result?.energia_espiritual).toBe('Manifestação / Aterramento / Matéria');
    });

    it('returns null for unknown Sephirah', () => {
      expect(getSephirotElement('Unknown')).toBeNull();
      expect(getSephirotElement('')).toBeNull();
      expect(getSephirotElement('kether')).toBeNull(); // case sensitive
    });
  });

  // ─── getElementSephirot ───────────────────────────────────────────────────────

  describe('getElementSephirot', () => {
    it('returns Kether and Chokmah for Éter element', () => {
      const result = getElementSephirot('Éter');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.sephirah)).toContain('Kether');
      expect(result.map((r) => r.sephirah)).toContain('Chokmah');
    });

    it('returns Binah and Hod for Ar element', () => {
      const result = getElementSephirot('Ar');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.sephirah)).toContain('Binah');
      expect(result.map((r) => r.sephirah)).toContain('Hod');
    });

    it('returns Chesed, Netzach, and Yesod for Água element', () => {
      const result = getElementSephirot('Água');
      expect(result).toHaveLength(3);
      expect(result.map((r) => r.sephirah)).toContain('Chesed');
      expect(result.map((r) => r.sephirah)).toContain('Netzach');
      expect(result.map((r) => r.sephirah)).toContain('Yesod');
    });

    it('returns Geburah and Tiphereth for Fogo element', () => {
      const result = getElementSephirot('Fogo');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.sephirah)).toContain('Geburah');
      expect(result.map((r) => r.sephirah)).toContain('Tiphereth');
    });

    it('returns only Malkuth for Terra element', () => {
      const result = getElementSephirot('Terra');
      expect(result).toHaveLength(1);
      expect(result[0].sephirah).toBe('Malkuth');
    });

    it('returns empty array for unknown element', () => {
      expect(getElementSephirot('Unknown')).toHaveLength(0);
      expect(getElementSephirot('')).toHaveLength(0);
    });
  });

  // ─── getAllSephirotElements ─────────────────────────────────────────────────

  describe('getAllSephirotElements', () => {
    it('returns all 10 Sephiroth mappings', () => {
      const result = getAllSephirotElements();
      expect(result).toHaveLength(10);
    });

    it('returns mappings in correct order', () => {
      const result = getAllSephirotElements();
      const sephirothOrder = [
        'Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
        'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth',
      ];
      result.forEach((mapping, index) => {
        expect(mapping.sephirah).toBe(sephirothOrder[index]);
      });
    });

    it('each mapping has all required fields', () => {
      const result = getAllSephirotElements();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('energia_espiritual');
      });
    });
  });

  // ─── SEPHIROT_ELEMENT_MAPPINGS constant ─────────────────────────────────────

  describe('SEPHIROT_ELEMENT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(SEPHIROT_ELEMENT_MAPPINGS)).toBe(true);
    });

    it('contains exactly 10 Sephiroth', () => {
      expect(Object.keys(SEPHIROT_ELEMENT_MAPPINGS)).toHaveLength(10);
    });

    it('has all 10 Sephiroth as keys', () => {
      const expectedKeys = [
        'Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
        'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth',
      ];
      expect(Object.keys(SEPHIROT_ELEMENT_MAPPINGS)).toEqual(expectedKeys);
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('SephirotElement interface completeness', () => {
    it('each mapping has all interface fields', () => {
      const mappings = getAllSephirotElements();
      mappings.forEach((mapping) => {
        expect(typeof mapping.sephirah).toBe('string');
        expect(typeof mapping.elemento).toBe('string');
        expect(typeof mapping.numero_caminho).toBe('number');
        expect(typeof mapping.energia_espiritual).toBe('string');
      });
    });

    it('path numbers are valid (1-22 range)', () => {
      const mappings = getAllSephirotElements();
      mappings.forEach((mapping) => {
        expect(mapping.numero_caminho).toBeGreaterThanOrEqual(1);
        expect(mapping.numero_caminho).toBeLessThanOrEqual(22);
      });
    });
  });

  // ─── Element distribution ───────────────────────────────────────────────────

  describe('Element distribution', () => {
    it('Éter has 2 Sephiroth (Kether, Chokmah)', () => {
      const ether = getElementSephirot('Éter');
      expect(ether).toHaveLength(2);
    });

    it('Ar has 2 Sephiroth (Binah, Hod)', () => {
      const ar = getElementSephirot('Ar');
      expect(ar).toHaveLength(2);
    });

    it('Água has 3 Sephiroth (Chesed, Netzach, Yesod)', () => {
      const agua = getElementSephirot('Água');
      expect(agua).toHaveLength(3);
    });

    it('Fogo has 2 Sephiroth (Geburah, Tiphereth)', () => {
      const fogo = getElementSephirot('Fogo');
      expect(fogo).toHaveLength(2);
    });

    it('Terra has 1 Sephirah (Malkuth)', () => {
      const terra = getElementSephirot('Terra');
      expect(terra).toHaveLength(1);
    });

    it('total Sephiroth across all elements equals 10', () => {
      const elements: Elemento[] = ['Éter', 'Ar', 'Água', 'Fogo', 'Terra'];
      const total = elements.reduce((sum, el) => sum + getElementSephirot(el).length, 0);
      expect(total).toBe(10);
    });
  });
});

// Type for Elemento used in tests
type Elemento = 'Fogo' | 'Terra' | 'Ar' | 'Água' | 'Éter';