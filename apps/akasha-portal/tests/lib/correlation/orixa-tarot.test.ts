/**
 * Orixá-Tarot Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaTarot,
  getTarotOrixa,
  getAllOrixaTarots,
  getAllOrixaNames,
  hasOrixaTarot,
  getOrixaTarotNumber,
  getOrixaElement,
  getArcanoByNumber,
  getOrixaByNumber,
  getOrixasByElement,
  getTarotsByElement,
  ORIXA_TAROT_MAPPINGS,
  type OrixaTarotMapping,
} from '@/lib/correlation/orixa-tarot';

describe('Orixá-Tarot Correlation', () => {
  describe('getOrixaTarot', () => {
    it('should return Oxalá mapping with O Imperador', () => {
      const mapping = getOrixaTarot('Oxalá');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Imperador');
      expect(mapping?.numero_carta).toBe(4);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return Iemanjá mapping with A Estrela', () => {
      const mapping = getOrixaTarot('Iemanjá');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Estrela');
      expect(mapping?.numero_carta).toBe(17);
      expect(mapping?.elemento).toBe('Água');
    });

    it('should return Oxum mapping with A Imperatriz', () => {
      const mapping = getOrixaTarot('Oxum');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Imperatriz');
      expect(mapping?.numero_carta).toBe(3);
      expect(mapping?.elemento).toBe('Terra');
    });

    it('should return Ogum mapping with O Carro', () => {
      const mapping = getOrixaTarot('Ogum');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Carro');
      expect(mapping?.numero_carta).toBe(7);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return Oxóssi mapping with O Hierofante', () => {
      const mapping = getOrixaTarot('Oxóssi');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Hierofante');
      expect(mapping?.numero_carta).toBe(5);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return Xangô mapping with O Sol', () => {
      const mapping = getOrixaTarot('Xangô');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Sol');
      expect(mapping?.numero_carta).toBe(19);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return Iansã mapping with A Torre', () => {
      const mapping = getOrixaTarot('Iansã');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Torre');
      expect(mapping?.numero_carta).toBe(16);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return Omolu mapping with O Mundo', () => {
      const mapping = getOrixaTarot('Omolu');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Mundo');
      expect(mapping?.numero_carta).toBe(21);
      expect(mapping?.elemento).toBe('Terra');
    });

    it('should return Nanã mapping with A Sacerdotisa', () => {
      const mapping = getOrixaTarot('Nanã');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Sacerdotisa');
      expect(mapping?.numero_carta).toBe(2);
      expect(mapping?.elemento).toBe('Água');
    });

    it('should return Exu mapping with O Mago', () => {
      const mapping = getOrixaTarot('Exu');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Mago');
      expect(mapping?.numero_carta).toBe(1);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return Logun Edé mapping with Os Enamorados', () => {
      const mapping = getOrixaTarot('Logun Edé');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('Os Enamorados');
      expect(mapping?.numero_carta).toBe(6);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return Eshu mapping with O Louco', () => {
      const mapping = getOrixaTarot('Eshu');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Louco');
      expect(mapping?.numero_carta).toBe(0);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should be case-insensitive', () => {
      expect(getOrixaTarot('oxalá')?.arcano).toBe('O Imperador');
      expect(getOrixaTarot('OXUM')?.arcano).toBe('A Imperatriz');
      expect(getOrixaTarot('xangô')?.arcano).toBe('O Sol');
    });

    it('should return null for unknown Orixá', () => {
      expect(getOrixaTarot('Unknown Orixá')).toBeNull();
    });

    it('should include all required properties in returned object', () => {
      const mapping = getOrixaTarot('Oxalá');
      expect(mapping).toHaveProperty('orixa');
      expect(mapping).toHaveProperty('arcano');
      expect(mapping).toHaveProperty('numero_carta');
      expect(mapping).toHaveProperty('elemento');
      expect(mapping).toHaveProperty('energia_espiritual');
      expect(mapping).toHaveProperty('associacoes_rituais');
      expect(mapping).toHaveProperty('interpretacao');
    });

    it('should include ritual associations with tools and offerings', () => {
      const mapping = getOrixaTarot('Oxum');
      expect(mapping?.associacoes_rituais).toHaveProperty('ferramentas');
      expect(mapping?.associacoes_rituais).toHaveProperty('oferendas');
      expect(mapping?.associacoes_rituais).toHaveProperty('momentos');
      expect(Array.isArray(mapping?.associacoes_rituais.ferramentas)).toBe(true);
      expect(Array.isArray(mapping?.associacoes_rituais.oferendas)).toBe(true);
      expect(Array.isArray(mapping?.associacoes_rituais.momentos)).toBe(true);
    });
  });

  describe('getTarotOrixa', () => {
    it('should return Oxalá for O Imperador', () => {
      expect(getTarotOrixa('O Imperador')).toBe('Oxalá');
    });

    it('should return Iemanjá for A Estrela', () => {
      expect(getTarotOrixa('A Estrela')).toBe('Iemanjá');
    });

    it('should return Oxum for A Imperatriz', () => {
      expect(getTarotOrixa('A Imperatriz')).toBe('Oxum');
    });

    it('should return Ogum for O Carro', () => {
      expect(getTarotOrixa('O Carro')).toBe('Ogum');
    });

    it('should return Oxóssi for O Hierofante', () => {
      expect(getTarotOrixa('O Hierofante')).toBe('Oxóssi');
    });

    it('should return Xangô for O Sol', () => {
      expect(getTarotOrixa('O Sol')).toBe('Xangô');
    });

    it('should return Iansã for A Torre', () => {
      expect(getTarotOrixa('A Torre')).toBe('Iansã');
    });

    it('should return Omolu for O Mundo', () => {
      expect(getTarotOrixa('O Mundo')).toBe('Omolu');
    });

    it('should return Nanã for A Sacerdotisa', () => {
      expect(getTarotOrixa('A Sacerdotisa')).toBe('Nanã');
    });

    it('should return Exu for O Mago', () => {
      expect(getTarotOrixa('O Mago')).toBe('Exu');
    });

    it('should return Logun Edé for Os Enamorados', () => {
      expect(getTarotOrixa('Os Enamorados')).toBe('Logun Edé');
    });

    it('should return Eshu for O Louco', () => {
      expect(getTarotOrixa('O Louco')).toBe('Eshu');
    });

    it('should be case-insensitive', () => {
      expect(getTarotOrixa('o imperador')).toBe('Oxalá');
      expect(getTarotOrixa('A IMPERATRIZ')).toBe('Oxum');
    });

    it('should return null for unknown Tarot card', () => {
      expect(getTarotOrixa('Unknown Card')).toBeNull();
    });
  });

  describe('getAllOrixaTarots', () => {
    it('should return all mappings', () => {
      const all = getAllOrixaTarots();
      expect(all.length).toBe(12);
    });

    it('should return mapping objects with all required properties', () => {
      const all = getAllOrixaTarots();
      all.forEach(mapping => {
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('energia_espiritual');
        expect(mapping).toHaveProperty('associacoes_rituais');
        expect(mapping).toHaveProperty('interpretacao');
      });
    });

    it('should include element in each mapping', () => {
      const all = getAllOrixaTarots();
      all.forEach(mapping => {
        expect(mapping.elemento).toBeDefined();
        expect(['Fogo', 'Água', 'Terra', 'Ar']).toContain(mapping.elemento);
      });
    });
  });

  describe('getAllOrixaNames', () => {
    it('should return all 12 Orixá names', () => {
      const names = getAllOrixaNames();
      expect(names.length).toBe(12);
    });

    it('should include all expected Orixás', () => {
      const names = getAllOrixaNames();
      expect(names).toContain('Oxalá');
      expect(names).toContain('Iemanjá');
      expect(names).toContain('Oxum');
      expect(names).toContain('Ogum');
      expect(names).toContain('Oxóssi');
      expect(names).toContain('Xangô');
      expect(names).toContain('Iansã');
      expect(names).toContain('Omolu');
      expect(names).toContain('Nanã');
      expect(names).toContain('Exu');
      expect(names).toContain('Logun Edé');
      expect(names).toContain('Eshu');
    });
  });

  describe('hasOrixaTarot', () => {
    it('should return true for existing Orixás', () => {
      expect(hasOrixaTarot('Oxalá')).toBe(true);
      expect(hasOrixaTarot('Iemanjá')).toBe(true);
      expect(hasOrixaTarot('Oxum')).toBe(true);
    });

    it('should return false for non-existing Orixás', () => {
      expect(hasOrixaTarot('Unknown')).toBe(false);
      expect(hasOrixaTarot('')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(hasOrixaTarot('oxalá')).toBe(true);
      expect(hasOrixaTarot('IEMANJÁ')).toBe(true);
    });
  });

  describe('getOrixaTarotNumber', () => {
    it('should return correct card numbers', () => {
      expect(getOrixaTarotNumber('Exu')).toBe(1);
      expect(getOrixaTarotNumber('Nanã')).toBe(2);
      expect(getOrixaTarotNumber('Oxum')).toBe(3);
      expect(getOrixaTarotNumber('Oxalá')).toBe(4);
      expect(getOrixaTarotNumber('Oxóssi')).toBe(5);
      expect(getOrixaTarotNumber('Logun Edé')).toBe(6);
      expect(getOrixaTarotNumber('Ogum')).toBe(7);
      expect(getOrixaTarotNumber('Eshu')).toBe(0);
      expect(getOrixaTarotNumber('Iemanjá')).toBe(17);
      expect(getOrixaTarotNumber('Xangô')).toBe(19);
      expect(getOrixaTarotNumber('Omolu')).toBe(21);
    });

    it('should return null for unknown Orixá', () => {
      expect(getOrixaTarotNumber('Unknown')).toBeNull();
    });
  });

  describe('getOrixaElement', () => {
    it('should return correct elements', () => {
      expect(getOrixaElement('Oxalá')).toBe('Fogo');
      expect(getOrixaElement('Iemanjá')).toBe('Água');
      expect(getOrixaElement('Oxum')).toBe('Terra');
      expect(getOrixaElement('Oxóssi')).toBe('Ar');
      expect(getOrixaElement('Ogum')).toBe('Fogo');
      expect(getOrixaElement('Xangô')).toBe('Fogo');
      expect(getOrixaElement('Iansã')).toBe('Fogo');
      expect(getOrixaElement('Omolu')).toBe('Terra');
      expect(getOrixaElement('Nanã')).toBe('Água');
      expect(getOrixaElement('Exu')).toBe('Ar');
      expect(getOrixaElement('Logun Edé')).toBe('Ar');
      expect(getOrixaElement('Eshu')).toBe('Ar');
    });

    it('should return null for unknown Orixá', () => {
      expect(getOrixaElement('Unknown')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(getOrixaElement('oxalá')).toBe('Fogo');
      expect(getOrixaElement('IEMANJÁ')).toBe('Água');
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return arcano by number', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
      expect(getArcanoByNumber(1)).toBe('O Mago');
      expect(getArcanoByNumber(2)).toBe('A Sacerdotisa');
      expect(getArcanoByNumber(3)).toBe('A Imperatriz');
      expect(getArcanoByNumber(4)).toBe('O Imperador');
      expect(getArcanoByNumber(5)).toBe('O Hierofante');
      expect(getArcanoByNumber(6)).toBe('Os Enamorados');
      expect(getArcanoByNumber(7)).toBe('O Carro');
      expect(getArcanoByNumber(16)).toBe('A Torre');
      expect(getArcanoByNumber(17)).toBe('A Estrela');
      expect(getArcanoByNumber(19)).toBe('O Sol');
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('should return null for unknown number', () => {
      expect(getArcanoByNumber(999)).toBeNull();
    });
  });

  describe('getOrixaByNumber', () => {
    it('should return Orixá by number', () => {
      expect(getOrixaByNumber(0)).toBe('Eshu');
      expect(getOrixaByNumber(1)).toBe('Exu');
      expect(getOrixaByNumber(2)).toBe('Nanã');
      expect(getOrixaByNumber(3)).toBe('Oxum');
      expect(getOrixaByNumber(4)).toBe('Oxalá');
      expect(getOrixaByNumber(5)).toBe('Oxóssi');
      expect(getOrixaByNumber(6)).toBe('Logun Edé');
      expect(getOrixaByNumber(7)).toBe('Ogum');
      expect(getOrixaByNumber(16)).toBe('Iansã');
      expect(getOrixaByNumber(17)).toBe('Iemanjá');
      expect(getOrixaByNumber(19)).toBe('Xangô');
      expect(getOrixaByNumber(21)).toBe('Omolu');
    });

    it('should return null for unknown number', () => {
      expect(getOrixaByNumber(999)).toBeNull();
    });
  });

  describe('getOrixasByElement', () => {
    it('should return Orixás by element', () => {
      expect(getOrixasByElement('Fogo')).toContain('Oxalá');
      expect(getOrixasByElement('Fogo')).toContain('Ogum');
      expect(getOrixasByElement('Fogo')).toContain('Xangô');
      expect(getOrixasByElement('Fogo')).toContain('Iansã');
    });

    it('should return Orixás for Água', () => {
      const water = getOrixasByElement('Água');
      expect(water).toContain('Iemanjá');
      expect(water).toContain('Nanã');
    });

    it('should return Orixás for Terra', () => {
      const earth = getOrixasByElement('Terra');
      expect(earth).toContain('Oxum');
      expect(earth).toContain('Omolu');
    });

    it('should return Orixás for Ar', () => {
      const air = getOrixasByElement('Ar');
      expect(air).toContain('Oxóssi');
      expect(air).toContain('Exu');
      expect(air).toContain('Logun Edé');
      expect(air).toContain('Eshu');
    });

    it('should be case-insensitive', () => {
      expect(getOrixasByElement('fogo').length).toBeGreaterThan(0);
      expect(getOrixasByElement('ÁGUA').length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown element', () => {
      expect(getOrixasByElement('Unknown')).toEqual([]);
    });
  });

  describe('getTarotsByElement', () => {
    it('should return Tarot cards by element', () => {
      const fogo = getTarotsByElement('Fogo');
      expect(fogo).toContain('O Imperador');
      expect(fogo).toContain('O Carro');
      expect(fogo).toContain('O Sol');
      expect(fogo).toContain('A Torre');
    });

    it('should return cards for Água', () => {
      const agua = getTarotsByElement('Água');
      expect(agua).toContain('A Estrela');
      expect(agua).toContain('A Sacerdotisa');
    });

    it('should return cards for Terra', () => {
      const terra = getTarotsByElement('Terra');
      expect(terra).toContain('A Imperatriz');
      expect(terra).toContain('O Mundo');
    });

    it('should return cards for Ar', () => {
      const ar = getTarotsByElement('Ar');
      expect(ar).toContain('O Hierofante');
      expect(ar).toContain('O Mago');
      expect(ar).toContain('Os Enamorados');
      expect(ar).toContain('O Louco');
    });

    it('should return empty array for unknown element', () => {
      expect(getTarotsByElement('Unknown')).toEqual([]);
    });
  });

  describe('ORIXA_TAROT_MAPPINGS constant', () => {
    it('should be a frozen object', () => {
      expect(Object.isFrozen(ORIXA_TAROT_MAPPINGS)).toBe(true);
    });

    it('should contain 12 Orixás', () => {
      expect(Object.keys(ORIXA_TAROT_MAPPINGS).length).toBe(12);
    });

    it('should have all required properties in each mapping', () => {
      Object.values(ORIXA_TAROT_MAPPINGS).forEach((mapping: OrixaTarotMapping) => {
        expect(mapping.orixa).toBeDefined();
        expect(mapping.arcano).toBeDefined();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.energia_espiritual).toBeDefined();
        expect(mapping.associacoes_rituais).toBeDefined();
        expect(mapping.interpretacao).toBeDefined();
      });
    });

    it('should have unique card numbers', () => {
      const numbers = Object.values(ORIXA_TAROT_MAPPINGS).map(m => m.numero_carta);
      const unique = new Set(numbers);
      expect(unique.size).toBe(numbers.length);
    });
  });

  describe('Spiritual correlation consistency', () => {
    it('should have bidirectional consistency between getOrixaTarot and getTarotOrixa', () => {
      const all = getAllOrixaTarots();
      all.forEach(mapping => {
        const reverse = getTarotOrixa(mapping.arcano);
        expect(reverse).toBe(mapping.orixa);
      });
    });

    it('should have consistent element mappings', () => {
      const all = getAllOrixaTarots();
      all.forEach(mapping => {
        const element = getOrixaElement(mapping.orixa);
        expect(element).toBe(mapping.elemento);
      });
    });

    it('should have unique Tarot card mappings', () => {
      const arcanoSet = new Set(getAllOrixaTarots().map(m => m.arcano));
      expect(arcanoSet.size).toBe(12);
    });
  });
});