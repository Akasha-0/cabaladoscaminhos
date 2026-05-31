/**
 * Tarot-Orixá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotOrixa,
  getOrixaTarot,
  getAllTarotOrixas,
  getAllArcanos,
  hasTarotOrixa,
  getArcanoNumber,
  getArcanoElement,
  getOrixaByNumber,
  getArcanoByNumber,
  getOrixasByElement,
  getArcanosByElement,
  getTarotOrixasByElement,
  TAROT_ORIXA_MAPPINGS,
  type TarotOrixaMapping,
} from '@/lib/correlation/tarot-orixa';

describe('Tarot-Orixá Correlation', () => {
  describe('getTarotOrixa', () => {
    it('should return mapping for valid arcano name', () => {
      const result = getTarotOrixa('O Mago');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Exu');
      expect(result?.numero_carta).toBe(1);
    });

    it('should return mapping case-insensitively', () => {
      const result = getTarotOrixa('O MAGO');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Exu');
    });

    it('should return mapping with different case', () => {
      const result = getTarotOrixa('o mago');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Exu');
    });

    it('should return null for non-existent arcano', () => {
      const result = getTarotOrixa('NonExistent');
      expect(result).toBeNull();
    });

    it('should return mapping with all required fields', () => {
      const result = getTarotOrixa('A Estrela');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Estrela');
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.numero_carta).toBe(17);
      expect(result?.elemento).toBe('Água');
      expect(result?.energia_espiritual).toBeDefined();
      expect(result?.associacoes_rituais).toBeDefined();
      expect(result?.interpretacao).toBeDefined();
    });
  });

  describe('getOrixaTarot', () => {
    it('should return arcano name for valid orixa', () => {
      const result = getOrixaTarot('Exu');
      expect(result).toBe('O Mago');
    });

    it('should return arcano name case-insensitively', () => {
      const result = getOrixaTarot('EXU');
      expect(result).toBe('O Mago');
    });

    it('should return null for non-existent orixa', () => {
      const result = getOrixaTarot('NonExistent');
      expect(result).toBeNull();
    });

    it('should correctly map all known orixás', () => {
      expect(getOrixaTarot('Oxalá')).toBe('O Imperador');
      expect(getOrixaTarot('Iemanjá')).toBe('A Estrela');
      expect(getOrixaTarot('Oxum')).toBe('A Imperatriz');
      expect(getOrixaTarot('Ogum')).toBe('O Carro');
      expect(getOrixaTarot('Oxóssi')).toBe('O Hierofante');
      expect(getOrixaTarot('Xangô')).toBe('O Sol');
      expect(getOrixaTarot('Iansã')).toBe('A Torre');
      expect(getOrixaTarot('Omolu')).toBe('O Mundo');
      expect(getOrixaTarot('Nanã')).toBe('A Sacerdotisa');
      expect(getOrixaTarot('Logun Edé')).toBe('Os Enamorados');
      expect(getOrixaTarot('Eshu')).toBe('O Louco');
    });
  });

  describe('getAllTarotOrixas', () => {
    it('should return all mappings', () => {
      const result = getAllTarotOrixas();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return mappings with all required fields', () => {
      const result = getAllTarotOrixas();
      result.forEach(mapping => {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.orixa).toBeDefined();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.energia_espiritual).toBeDefined();
        expect(mapping.associacoes_rituais).toBeDefined();
        expect(mapping.interpretacao).toBeDefined();
      });
    });

    it('should return unique mappings', () => {
      const result = getAllTarotOrixas();
      const arcanoNames = result.map(m => m.arcano);
      const uniqueNames = new Set(arcanoNames);
      expect(uniqueNames.size).toBe(arcanoNames.length);
    });
  });

  describe('getAllArcanos', () => {
    it('should return all arcano names', () => {
      const result = getAllArcanos();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should contain known arcano names', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Mago');
      expect(result).toContain('A Estrela');
      expect(result).toContain('O Sol');
    });
  });

  describe('hasTarotOrixa', () => {
    it('should return true for existing arcano', () => {
      expect(hasTarotOrixa('O Mago')).toBe(true);
    });

    it('should return false for non-existing arcano', () => {
      expect(hasTarotOrixa('NonExistent')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(hasTarotOrixa('O MAGO')).toBe(true);
      expect(hasTarotOrixa('o mago')).toBe(true);
    });
  });

  describe('getArcanoNumber', () => {
    it('should return correct number for arcano', () => {
      expect(getArcanoNumber('O Mago')).toBe(1);
      expect(getArcanoNumber('A Imperatriz')).toBe(3);
      expect(getArcanoNumber('O Sol')).toBe(19);
    });

    it('should return null for non-existent arcano', () => {
      expect(getArcanoNumber('NonExistent')).toBeNull();
    });
  });

  describe('getArcanoElement', () => {
    it('should return correct element for arcano', () => {
      expect(getArcanoElement('O Mago')).toBe('Ar');
      expect(getArcanoElement('A Estrela')).toBe('Água');
      expect(getArcanoElement('O Imperador')).toBe('Fogo');
    });

    it('should return null for non-existent arcano', () => {
      expect(getArcanoElement('NonExistent')).toBeNull();
    });
  });

  describe('getOrixaByNumber', () => {
    it('should return correct orixa for card number', () => {
      expect(getOrixaByNumber(1)).toBe('Exu');
      expect(getOrixaByNumber(17)).toBe('Iemanjá');
      expect(getOrixaByNumber(21)).toBe('Omolu');
    });

    it('should return null for non-existent number', () => {
      expect(getOrixaByNumber(99)).toBeNull();
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return correct arcano for card number', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
      expect(getArcanoByNumber(17)).toBe('A Estrela');
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('should return null for non-existent number', () => {
      expect(getArcanoByNumber(99)).toBeNull();
    });
  });

  describe('getOrixasByElement', () => {
    it('should return orixás for Fogo element', () => {
      const result = getOrixasByElement('Fogo');
      expect(result).toBeInstanceOf(Array);
      expect(result).toContain('Oxalá');
      expect(result).toContain('Ogum');
      expect(result).toContain('Xangô');
      expect(result).toContain('Iansã');
    });

    it('should return orixás for Água element', () => {
      const result = getOrixasByElement('Água');
      expect(result).toBeInstanceOf(Array);
      expect(result).toContain('Iemanjá');
      expect(result).toContain('Nanã');
    });

    it('should return orixás for Ar element', () => {
      const result = getOrixasByElement('Ar');
      expect(result).toBeInstanceOf(Array);
      expect(result).toContain('Exu');
      expect(result).toContain('Oxóssi');
      expect(result).toContain('Logun Edé');
      expect(result).toContain('Eshu');
    });

    it('should return orixás for Terra element', () => {
      const result = getOrixasByElement('Terra');
      expect(result).toBeInstanceOf(Array);
      expect(result).toContain('Oxum');
      expect(result).toContain('Omolu');
    });

    it('should be case-insensitive', () => {
      const result = getOrixasByElement('FOGO');
      expect(result).toBeInstanceOf(Array);
    });

    it('should return empty array for non-existent element', () => {
      const result = getOrixasByElement('NonExistent');
      expect(result).toEqual([]);
    });
  });

  describe('getArcanosByElement', () => {
    it('should return arcanos for Fogo element', () => {
      const result = getArcanosByElement('Fogo');
      expect(result).toBeInstanceOf(Array);
      expect(result).toContain('O Imperador');
      expect(result).toContain('O Carro');
      expect(result).toContain('O Sol');
      expect(result).toContain('A Torre');
    });

    it('should return arcanos for Água element', () => {
      const result = getArcanosByElement('Água');
      expect(result).toBeInstanceOf(Array);
      expect(result).toContain('A Estrela');
      expect(result).toContain('A Sacerdotisa');
    });

    it('should return arcanos for Ar element', () => {
      const result = getArcanosByElement('Ar');
      expect(result).toBeInstanceOf(Array);
      expect(result).toContain('O Mago');
      expect(result).toContain('O Hierofante');
      expect(result).toContain('Os Enamorados');
      expect(result).toContain('O Louco');
    });

    it('should return arcanos for Terra element', () => {
      const result = getArcanosByElement('Terra');
      expect(result).toBeInstanceOf(Array);
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Mundo');
    });
  });

  describe('getTarotOrixasByElement', () => {
    it('should return full mappings for element', () => {
      const result = getTarotOrixasByElement('Fogo');
      expect(result).toBeInstanceOf(Array);
      result.forEach(mapping => {
        expect(mapping.elemento).toBe('Fogo');
        expect(mapping.arcano).toBeDefined();
        expect(mapping.orixa).toBeDefined();
      });
    });

    it('should return correct count for each element', () => {
      const fogo = getTarotOrixasByElement('Fogo');
      const agua = getTarotOrixasByElement('Água');
      const ar = getTarotOrixasByElement('Ar');
      const terra = getTarotOrixasByElement('Terra');

      expect(fogo.length).toBe(4);
      expect(agua.length).toBe(2);
      expect(ar.length).toBe(4);
      expect(terra.length).toBe(2);
    });
  });

  describe('TAROT_ORIXA_MAPPINGS constant', () => {
    it('should be defined', () => {
      expect(TAROT_ORIXA_MAPPINGS).toBeDefined();
    });

    it('should contain all expected arcano entries', () => {
      expect(TAROT_ORIXA_MAPPINGS['O Mago']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['A Sacerdotisa']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['A Imperatriz']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['O Imperador']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['O Hierofante']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['Os Enamorados']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['O Carro']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['A Torre']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['A Estrela']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['O Sol']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['O Mundo']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['O Louco']).toBeDefined();
    });

    it('should have consistent orixa-arcano relationships', () => {
      Object.entries(TAROT_ORIXA_MAPPINGS).forEach(([arcano, mapping]) => {
        expect(getOrixaTarot(mapping.orixa)).toBe(arcano);
      });
    });

    it('should have unique card numbers', () => {
      const numbers = Object.values(TAROT_ORIXA_MAPPINGS).map(m => m.numero_carta);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);
    });
  });

  describe('Spiritual correlation consistency', () => {
    it('should have consistent energy between arcano and orixa', () => {
      const orixaTarot = getTarotOrixa('O Sol');
      expect(orixaTarot?.orixa).toBe('Xangô');
      expect(orixaTarot?.energia_espiritual).toContain('Justiça');
    });

    it('should have consistent element assignments', () => {
      const waterArcanos = getArcanosByElement('Água');
      expect(waterArcanos).toContain('A Estrela');
      expect(waterArcanos).toContain('A Sacerdotisa');
    });

    it('should have consistent ritual associations', () => {
      const result = getTarotOrixa('A Estrela');
      expect(result?.associacoes_rituais.ferramentas).toBeDefined();
      expect(result?.associacoes_rituais.oferendas).toBeDefined();
      expect(result?.associacoes_rituais.momentos).toBeDefined();
    });
  });
});
