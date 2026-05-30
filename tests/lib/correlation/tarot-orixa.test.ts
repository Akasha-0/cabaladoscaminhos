/**
 * Tarot-Orixá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotOrixa,
  getOrixaTarot,
  getAllTarotOrixas,
  getAllArcanoNames,
  hasTarotOrixa,
  getTarotElement,
  getArcanoByNumber,
  getOrixaByNumber,
  getOrixasByElement,
  getTarotsByElement,
  TAROT_ORIXA_MAPPINGS,
  type TarotOrixaMapping,
} from '@/lib/correlation/tarot-orixa';

describe('Tarot-Orixá Correlation', () => {
  describe('getTarotOrixa', () => {
    it('should return O Mago mapping with Exu', () => {
      const result = getTarotOrixa('O Mago');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Exu');
      expect(result!.numero_carta).toBe(1);
    });

    it('should return A Sacerdotisa mapping with Nanã', () => {
      const result = getTarotOrixa('A Sacerdotisa');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Nanã');
      expect(result!.numero_carta).toBe(2);
    });

    it('should return A Imperatriz mapping with Oxum', () => {
      const result = getTarotOrixa('A Imperatriz');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Oxum');
      expect(result!.numero_carta).toBe(3);
    });

    it('should return O Imperador mapping with Oxalá', () => {
      const result = getTarotOrixa('O Imperador');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Oxalá');
      expect(result!.numero_carta).toBe(4);
    });

    it('should return O Hierofante mapping with Oxóssi', () => {
      const result = getTarotOrixa('O Hierofante');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Oxóssi');
      expect(result!.numero_carta).toBe(5);
    });

    it('should return Os Enamorados mapping with Logun Edé', () => {
      const result = getTarotOrixa('Os Enamorados');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Logun Edé');
      expect(result!.numero_carta).toBe(6);
    });

    it('should return O Carro mapping with Ogum', () => {
      const result = getTarotOrixa('O Carro');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Ogum');
      expect(result!.numero_carta).toBe(7);
    });

    it('should return A Justiça mapping with Xangô', () => {
      const result = getTarotOrixa('A Justiça');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Xangô');
      expect(result!.numero_carta).toBe(8);
    });

    it('should return O Hermita mapping with Oxalá', () => {
      const result = getTarotOrixa('O Hermita');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Oxalá');
      expect(result!.numero_carta).toBe(9);
    });

    it('should return A Roda da Fortuna mapping with Iansã', () => {
      const result = getTarotOrixa('A Roda da Fortuna');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Iansã');
      expect(result!.numero_carta).toBe(10);
    });

    it('should return A Força mapping with Omolu', () => {
      const result = getTarotOrixa('A Força');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Omolu');
      expect(result!.numero_carta).toBe(11);
    });

    it('should return O Enforcado mapping with Nanã', () => {
      const result = getTarotOrixa('O Enforcado');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Nanã');
      expect(result!.numero_carta).toBe(12);
    });

    it('should return A Morte mapping with Omolu', () => {
      const result = getTarotOrixa('A Morte');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Omolu');
      expect(result!.numero_carta).toBe(13);
    });

    it('should return A Temperança mapping with Oxum', () => {
      const result = getTarotOrixa('A Temperança');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Oxum');
      expect(result!.numero_carta).toBe(14);
    });

    it('should return O Diabo mapping with Eshu', () => {
      const result = getTarotOrixa('O Diabo');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Eshu');
      expect(result!.numero_carta).toBe(15);
    });

    it('should return A Torre mapping with Iansã', () => {
      const result = getTarotOrixa('A Torre');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Iansã');
      expect(result!.numero_carta).toBe(16);
    });

    it('should return A Estrela mapping with Iemanjá', () => {
      const result = getTarotOrixa('A Estrela');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Iemanjá');
      expect(result!.numero_carta).toBe(17);
    });

    it('should return A Lua mapping with Iemanjá', () => {
      const result = getTarotOrixa('A Lua');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Iemanjá');
      expect(result!.numero_carta).toBe(18);
    });

    it('should return O Sol mapping with Xangô', () => {
      const result = getTarotOrixa('O Sol');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Xangô');
      expect(result!.numero_carta).toBe(19);
    });

    it('should return O Julgamento mapping with Xangô', () => {
      const result = getTarotOrixa('O Julgamento');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Xangô');
      expect(result!.numero_carta).toBe(20);
    });

    it('should return O Mundo mapping with Omolu', () => {
      const result = getTarotOrixa('O Mundo');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Omolu');
      expect(result!.numero_carta).toBe(21);
    });

    it('should return O Louco mapping with Eshu', () => {
      const result = getTarotOrixa('O Louco');
      expect(result).not.toBeNull();
      expect(result!.orixa).toBe('Eshu');
      expect(result!.numero_carta).toBe(0);
    });

    it('should be case-insensitive', () => {
      expect(getTarotOrixa('o mago')?.orixa).toBe('Exu');
      expect(getTarotOrixa('A IMPERATRIZ')?.orixa).toBe('Oxum');
      expect(getTarotOrixa('o sol')?.orixa).toBe('Xangô');
    });

    it('should return null for unknown arcano', () => {
      expect(getTarotOrixa('Unknown Card')).toBeNull();
    });

    it('should include all required properties in returned object', () => {
      const result = getTarotOrixa('O Sol');
      expect(result).toHaveProperty('arcano', 'O Sol');
      expect(result).toHaveProperty('orixa', 'Xangô');
      expect(result).toHaveProperty('numero_carta', 19);
      expect(result).toHaveProperty('elemento', 'Fogo');
      expect(result).toHaveProperty('energia_espiritual');
      expect(result).toHaveProperty('associacoes_rituais');
      expect(result).toHaveProperty('interpretacao');
    });

    it('should include ritual associations with tools and offerings', () => {
      const result = getTarotOrixa('O Carro');
      expect(result).toHaveProperty('associacoes_rituais');
      expect(result!.associacoes_rituais).toHaveProperty('ferramentas');
      expect(result!.associacoes_rituais).toHaveProperty('oferendas');
      expect(result!.associacoes_rituais).toHaveProperty('momentos');
      expect(Array.isArray(result!.associacoes_rituais.ferramentas)).toBe(true);
      expect(Array.isArray(result!.associacoes_rituais.oferendas)).toBe(true);
    });

    it('should include element in mapping', () => {
      const result = getTarotOrixa('A Imperatriz');
      expect(result).toHaveProperty('elemento', 'Terra');
    });
  });

  describe('getOrixaTarot', () => {
    it('should return O Mago for Exu', () => {
      expect(getOrixaTarot('Exu')).toBe('O Mago');
    });

    it('should return A Imperatriz for Oxum', () => {
      expect(getOrixaTarot('Oxum')).toBe('A Imperatriz');
    });

    it('should return O Imperador for Oxalá', () => {
      expect(getOrixaTarot('Oxalá')).toBe('O Imperador');
    });

    it('should return A Estrela for Iemanjá', () => {
      expect(getOrixaTarot('Iemanjá')).toBe('A Estrela');
    });

    it('should return first Tarot card for Xangô', () => {
      // Xangô maps to A Justiça (8) and O Sol (19) - returns first match
      expect(getOrixaTarot('Xangô')).toBe('A Justiça');
    });
    it('should return O Carro for Ogum', () => {
      expect(getOrixaTarot('Ogum')).toBe('O Carro');
    });
    it('should return first Tarot card for Iansã', () => {
      // Iansã maps to A Roda da Fortuna (10) and A Torre (16) - returns first match
      expect(getOrixaTarot('Iansã')).toBe('A Roda da Fortuna');
    });
    it('should return first Tarot card for Omolu', () => {
      // Omolu maps to A Força (11), A Morte (13), and O Mundo (21) - returns first match
      expect(getOrixaTarot('Omolu')).toBe('A Força');
    });
    it('should return A Sacerdotisa for Nanã', () => {
      expect(getOrixaTarot('Nanã')).toBe('A Sacerdotisa');
    });
    it('should return Os Enamorados for Logun Edé', () => {
      expect(getOrixaTarot('Logun Edé')).toBe('Os Enamorados');
    });
    it('should return first Tarot card for Eshu', () => {
      // Eshu maps to O Diabo (15) and O Louco (0) - returns first match
      expect(getOrixaTarot('Eshu')).toBe('O Diabo');
    });

    it('should be case-insensitive', () => {
      expect(getOrixaTarot('exu')).toBe('O Mago');
      expect(getOrixaTarot('OXUM')).toBe('A Imperatriz');
      expect(getOrixaTarot('Iemanjá')).toBe('A Estrela');
    });

    it('should return null for unknown Orixá', () => {
      expect(getOrixaTarot('Unknown Orixá')).toBeNull();
    });
  });

  describe('getAllTarotOrixas', () => {
    it('should return all mappings as array', () => {
      const all = getAllTarotOrixas();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThan(0);
    });

    it('should include all major arcana cards', () => {
      const all = getAllTarotOrixas();
      const arcanoNames = all.map(m => m.arcano);
      expect(arcanoNames).toContain('O Mago');
      expect(arcanoNames).toContain('O Sol');
      expect(arcanoNames).toContain('O Mundo');
      expect(arcanoNames).toContain('O Louco');
    });

    it('each item should have all required properties', () => {
      const all = getAllTarotOrixas();
      for (const mapping of all) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('energia_espiritual');
        expect(mapping).toHaveProperty('associacoes_rituais');
        expect(mapping).toHaveProperty('interpretacao');
      }
    });
  });

  describe('getAllArcanoNames', () => {
    it('should return array of arcano names', () => {
      const names = getAllArcanoNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
    });

    it('should include all major arcana names', () => {
      const names = getAllArcanoNames();
      expect(names).toContain('O Mago');
      expect(names).toContain('A Imperatriz');
      expect(names).toContain('O Sol');
      expect(names).toContain('O Mundo');
    });
  });

  describe('hasTarotOrixa', () => {
    it('should return true for existing arcano', () => {
      expect(hasTarotOrixa('O Sol')).toBe(true);
      expect(hasTarotOrixa('A Estrela')).toBe(true);
      expect(hasTarotOrixa('O Louco')).toBe(true);
    });

    it('should return false for non-existing arcano', () => {
      expect(hasTarotOrixa('Unknown Card')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(hasTarotOrixa('o sol')).toBe(true);
      expect(hasTarotOrixa('A ESTRELA')).toBe(true);
    });
  });

  describe('getTarotElement', () => {
    it('should return correct element for O Mago', () => {
      expect(getTarotElement('O Mago')).toBe('Ar');
    });

    it('should return correct element for A Imperatriz', () => {
      expect(getTarotElement('A Imperatriz')).toBe('Terra');
    });

    it('should return correct element for O Sol', () => {
      expect(getTarotElement('O Sol')).toBe('Fogo');
    });

    it('should return correct element for A Sacerdotisa', () => {
      expect(getTarotElement('A Sacerdotisa')).toBe('Água');
    });

    it('should return null for unknown arcano', () => {
      expect(getTarotElement('Unknown')).toBeNull();
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return O Mago for number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('should return O Sol for number 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('should return O Mundo for number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('should return O Louco for number 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('should return null for unknown number', () => {
      expect(getArcanoByNumber(99)).toBeNull();
    });
  });

  describe('getOrixaByNumber', () => {
    it('should return Exu for number 1', () => {
      expect(getOrixaByNumber(1)).toBe('Exu');
    });

    it('should return Xangô for number 19', () => {
      expect(getOrixaByNumber(19)).toBe('Xangô');
    });

    it('should return Omolu for number 21', () => {
      expect(getOrixaByNumber(21)).toBe('Omolu');
    });

    it('should return Eshu for number 0', () => {
      expect(getOrixaByNumber(0)).toBe('Eshu');
    });

    it('should return null for unknown number', () => {
      expect(getOrixaByNumber(99)).toBeNull();
    });
  });

  describe('getOrixasByElement', () => {
    it('should return Orixás associated with Fogo', () => {
      const orixas = getOrixasByElement('Fogo');
      // O Imperador, O Carro, A Roda da Fortuna, O Diabo, A Torre, O Sol, O Julgamento
      expect(orixas).toContain('Oxalá');
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Iansã');
    });

    it('should return Orixás associated with Água', () => {
      const orixas = getOrixasByElement('Água');
      expect(orixas).toContain('Nanã');
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Omolu');
    });

    it('should return Orixás associated with Terra', () => {
      const orixas = getOrixasByElement('Terra');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Oxalá');
      expect(orixas).toContain('Omolu');
    });

    it('should return Orixás associated with Ar', () => {
      const orixas = getOrixasByElement('Ar');
      expect(orixas).toContain('Exu');
      expect(orixas).toContain('Oxóssi');
      expect(orixas).toContain('Logun Edé');
      expect(orixas).toContain('Eshu');
    });

    it('should return empty array for unknown element', () => {
      const orixas = getOrixasByElement('Unknown');
      expect(orixas).toEqual([]);
    });
  });

  describe('getTarotsByElement', () => {
    it('should return Tarot cards associated with Fogo', () => {
      const tarots = getTarotsByElement('Fogo');
      // O Imperador, O Carro, A Roda da Fortuna, O Diabo, A Torre, O Sol, O Julgamento
      expect(tarots).toContain('O Imperador');
      expect(tarots).toContain('O Carro');
      expect(tarots).toContain('O Sol');
    });
    it('should return Tarot cards associated with Água', () => {
      const tarots = getTarotsByElement('Água');
      expect(tarots).toContain('A Sacerdotisa');
      expect(tarots).toContain('A Estrela');
      expect(tarots).toContain('A Lua');
    });

    it('should return empty array for unknown element', () => {
      const tarots = getTarotsByElement('Unknown');
      expect(tarots).toEqual([]);
    });
  });

  describe('TAROT_ORIXA_MAPPINGS constant', () => {
    it('should be defined and not empty', () => {
      expect(TAROT_ORIXA_MAPPINGS).toBeDefined();
      expect(Object.keys(TAROT_ORIXA_MAPPINGS).length).toBeGreaterThan(0);
    });

    it('should have all major arcana cards', () => {
      const keys = Object.keys(TAROT_ORIXA_MAPPINGS);
      expect(keys).toContain('O Mago');
      expect(keys).toContain('O Sol');
      expect(keys).toContain('O Mundo');
      expect(keys).toContain('O Louco');
    });

    it('should have unique arcano names', () => {
      const keys = Object.keys(TAROT_ORIXA_MAPPINGS);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('Spiritual correlation consistency', () => {
    it('should be reverse of Orixá-Tarot mappings', () => {
      // If Orixá-Tarot maps Oxalá to O Imperador, Tarot-Orixá should map O Imperador to Oxalá
      const oMago = getTarotOrixa('O Mago');
      expect(oMago?.orixa).toBe('Exu');
      
      const estrela = getTarotOrixa('A Estrela');
      expect(estrela?.orixa).toBe('Iemanjá');
    });

    it('should map all elements correctly', () => {
      const mapping = getTarotOrixa('A Imperatriz');
      expect(mapping?.elemento).toBe('Terra');
      
      const another = getTarotOrixa('O Hermita');
      expect(another?.elemento).toBe('Terra');
    });

    it('should have consistent numbering across Major Arcana', () => {
      // O Louco is numbered 0 in many decks
      expect(getTarotOrixa('O Louco')?.numero_carta).toBe(0);
      const allMappings = getAllTarotOrixas();
      const numbers = allMappings.map(m => m.numero_carta);
      // Check all numbers are valid (0-21)
      for (const num of numbers) {
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(21);
      }
    });
  });
});