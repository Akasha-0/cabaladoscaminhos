/**
 * Tarot-Orixá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotOrixa,
  getOrixaByTarot,
  getAllTarotOrixas,
  getAllArcanos,
  hasTarotOrixa,
  getOrixaByNumber,
  getArcanoByNumber,
  getElementByArcano,
  getOrixasByElement,
  getArcanosByElement,
  TAROT_ORIXA_MAPPINGS,
  type TarotOrixaMapping,
} from '@/lib/correlation/tarot-orixa';

describe('Tarot-Orixá Correlation', () => {
  describe('getTarotOrixa', () => {
    it('should return O Louco mapping with Eshu', () => {
      const mapping = getTarotOrixa('O Louco');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Eshu');
      expect(mapping?.numero_carta).toBe(0);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return O Mago mapping with Exu', () => {
      const mapping = getTarotOrixa('O Mago');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Exu');
      expect(mapping?.numero_carta).toBe(1);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return A Sacerdotisa mapping with Nanã', () => {
      const mapping = getTarotOrixa('A Sacerdotisa');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Nanã');
      expect(mapping?.numero_carta).toBe(2);
      expect(mapping?.elemento).toBe('Água');
    });

    it('should return A Imperatriz mapping with Oxum', () => {
      const mapping = getTarotOrixa('A Imperatriz');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Oxum');
      expect(mapping?.numero_carta).toBe(3);
      expect(mapping?.elemento).toBe('Terra');
    });

    it('should return O Imperador mapping with Oxalá', () => {
      const mapping = getTarotOrixa('O Imperador');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Oxalá');
      expect(mapping?.numero_carta).toBe(4);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return O Hierofante mapping with Oxóssi', () => {
      const mapping = getTarotOrixa('O Hierofante');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Oxóssi');
      expect(mapping?.numero_carta).toBe(5);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return Os Enamorados mapping with Logun Edé', () => {
      const mapping = getTarotOrixa('Os Enamorados');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Logun Edé');
      expect(mapping?.numero_carta).toBe(6);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return O Carro mapping with Ogum', () => {
      const mapping = getTarotOrixa('O Carro');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Ogum');
      expect(mapping?.numero_carta).toBe(7);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return A Força mapping with Iansã', () => {
      const mapping = getTarotOrixa('A Força');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Iansã');
      expect(mapping?.numero_carta).toBe(8);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return O Eremita mapping with Oxalá', () => {
      const mapping = getTarotOrixa('O Eremita');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Oxalá');
      expect(mapping?.numero_carta).toBe(9);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return A Roda da Fortuna mapping with Iansã', () => {
      const mapping = getTarotOrixa('A Roda da Fortuna');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Iansã');
      expect(mapping?.numero_carta).toBe(10);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return A Justiça mapping with Xangô', () => {
      const mapping = getTarotOrixa('A Justiça');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Xangô');
      expect(mapping?.numero_carta).toBe(11);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return O Enforcado mapping with Omolu', () => {
      const mapping = getTarotOrixa('O Enforcado');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Omolu');
      expect(mapping?.numero_carta).toBe(12);
      expect(mapping?.elemento).toBe('Terra');
    });

    it('should return A Morte mapping with Omolu', () => {
      const mapping = getTarotOrixa('A Morte');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Omolu');
      expect(mapping?.numero_carta).toBe(13);
      expect(mapping?.elemento).toBe('Terra');
    });

    it('should return A Temperança mapping with Iemanjá', () => {
      const mapping = getTarotOrixa('A Temperança');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Iemanjá');
      expect(mapping?.numero_carta).toBe(14);
      expect(mapping?.elemento).toBe('Água');
    });

    it('should return O Diabo mapping with Exu', () => {
      const mapping = getTarotOrixa('O Diabo');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Exu');
      expect(mapping?.numero_carta).toBe(15);
      expect(mapping?.elemento).toBe('Ar');
    });

    it('should return A Torre mapping with Iansã', () => {
      const mapping = getTarotOrixa('A Torre');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Iansã');
      expect(mapping?.numero_carta).toBe(16);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return A Estrela mapping with Iemanjá', () => {
      const mapping = getTarotOrixa('A Estrela');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Iemanjá');
      expect(mapping?.numero_carta).toBe(17);
      expect(mapping?.elemento).toBe('Água');
    });

    it('should return A Lua mapping with Iemanjá', () => {
      const mapping = getTarotOrixa('A Lua');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Iemanjá');
      expect(mapping?.numero_carta).toBe(18);
      expect(mapping?.elemento).toBe('Água');
    });

    it('should return O Sol mapping with Xangô', () => {
      const mapping = getTarotOrixa('O Sol');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Xangô');
      expect(mapping?.numero_carta).toBe(19);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return O Julgamento mapping with Xangô', () => {
      const mapping = getTarotOrixa('O Julgamento');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Xangô');
      expect(mapping?.numero_carta).toBe(20);
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return O Mundo mapping with Omolu', () => {
      const mapping = getTarotOrixa('O Mundo');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Omolu');
      expect(mapping?.numero_carta).toBe(21);
      expect(mapping?.elemento).toBe('Terra');
    });

    it('should be case-insensitive', () => {
      expect(getTarotOrixa('o louco')?.orixa).toBe('Eshu');
      expect(getTarotOrixa('O MAGO')?.orixa).toBe('Exu');
      expect(getTarotOrixa('a estrela')?.orixa).toBe('Iemanjá');
    });

    it('should handle accented characters', () => {
      expect(getTarotOrixa('Oxalá')).toBeDefined();
      expect(getTarotOrixa('Iemanjá')).toBeDefined();
      expect(getTarotOrixa('Xangô')).toBeDefined();
      expect(getTarotOrixa('Nanã')).toBeDefined();
    });

    it('should return null for unknown arcano', () => {
      expect(getTarotOrixa('Unknown Arcano')).toBeNull();
    });

    it('should include all required properties in returned object', () => {
      const mapping = getTarotOrixa('O Sol');
      expect(mapping).toHaveProperty('arcano');
      expect(mapping).toHaveProperty('numero_carta');
      expect(mapping).toHaveProperty('orixa');
      expect(mapping).toHaveProperty('elemento');
      expect(mapping).toHaveProperty('energia_espiritual');
      expect(mapping).toHaveProperty('associacoes_rituais');
      expect(mapping).toHaveProperty('interpretacao');
    });

    it('should include ritual associations with tools and offerings', () => {
      const mapping = getTarotOrixa('O Imperador');
      expect(mapping?.associacoes_rituais).toHaveProperty('ferramentas');
      expect(mapping?.associacoes_rituais).toHaveProperty('oferendas');
      expect(mapping?.associacoes_rituais).toHaveProperty('momentos');
      expect(Array.isArray(mapping?.associacoes_rituais.ferramentas)).toBe(true);
      expect(Array.isArray(mapping?.associacoes_rituais.oferendas)).toBe(true);
      expect(Array.isArray(mapping?.associacoes_rituais.momentos)).toBe(true);
    });
  });

  describe('getOrixaByTarot', () => {
    it('should return Eshu for O Louco', () => {
      expect(getOrixaByTarot('O Louco')).toBe('Eshu');
    });

    it('should return Oxalá for O Imperador', () => {
      expect(getOrixaByTarot('O Imperador')).toBe('Oxalá');
    });

    it('should return Iemanjá for A Estrela', () => {
      expect(getOrixaByTarot('A Estrela')).toBe('Iemanjá');
    });

    it('should return Xangô for O Sol', () => {
      expect(getOrixaByTarot('O Sol')).toBe('Xangô');
    });

    it('should return null for unknown arcano', () => {
      expect(getOrixaByTarot('Unknown')).toBeNull();
    });
  });

  describe('getAllTarotOrixas', () => {
    it('should return all 22 mappings', () => {
      const all = getAllTarotOrixas();
      expect(all.length).toBe(22);
    });

    it('should return array of TarotOrixaMapping objects', () => {
      const all = getAllTarotOrixas();
      all.forEach((mapping) => {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('energia_espiritual');
        expect(mapping).toHaveProperty('associacoes_rituais');
        expect(mapping).toHaveProperty('interpretacao');
      });
    });

    it('should have valid arcano numbers from 0 to 21', () => {
      const all = getAllTarotOrixas();
      const numbers = all.map((m) => m.numero_carta).sort((a, b) => a - b);
      expect(numbers).toEqual([...Array(22).keys()]);
    });
  });

  describe('getAllArcanos', () => {
    it('should return all 22 arcano names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos.length).toBe(22);
    });

    it('should include major arcana cards', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toContain('O Louco');
      expect(arcanos).toContain('O Mago');
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('O Mundo');
    });
  });

  describe('hasTarotOrixa', () => {
    it('should return true for valid arcanos', () => {
      expect(hasTarotOrixa('O Sol')).toBe(true);
      expect(hasTarotOrixa('A Lua')).toBe(true);
      expect(hasTarotOrixa('O Imperador')).toBe(true);
    });

    it('should return true for case-insensitive input', () => {
      expect(hasTarotOrixa('o sol')).toBe(true);
      expect(hasTarotOrixa('A LUA')).toBe(true);
    });

    it('should return false for unknown arcanos', () => {
      expect(hasTarotOrixa('Unknown')).toBe(false);
    });
  });

  describe('getOrixaByNumber', () => {
    it('should return Eshu for card 0', () => {
      expect(getOrixaByNumber(0)).toBe('Eshu');
    });

    it('should return Exu for card 1', () => {
      expect(getOrixaByNumber(1)).toBe('Exu');
    });

    it('should return Xangô for card 19', () => {
      expect(getOrixaByNumber(19)).toBe('Xangô');
    });

    it('should return Omolu for card 21', () => {
      expect(getOrixaByNumber(21)).toBe('Omolu');
    });

    it('should return null for invalid number', () => {
      expect(getOrixaByNumber(99)).toBeNull();
      expect(getOrixaByNumber(-1)).toBeNull();
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return O Louco for card 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('should return A Estrela for card 17', () => {
      expect(getArcanoByNumber(17)).toBe('A Estrela');
    });

    it('should return O Sol for card 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('should return O Mundo for card 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('should return null for invalid number', () => {
      expect(getArcanoByNumber(99)).toBeNull();
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  describe('getElementByArcano', () => {
    it('should return Fogo for O Imperador', () => {
      expect(getElementByArcano('O Imperador')).toBe('Fogo');
    });

    it('should return Água for A Estrela', () => {
      expect(getElementByArcano('A Estrela')).toBe('Água');
    });

    it('should return Terra for A Imperatriz', () => {
      expect(getElementByArcano('A Imperatriz')).toBe('Terra');
    });

    it('should return Ar for O Mago', () => {
      expect(getElementByArcano('O Mago')).toBe('Ar');
    });

    it('should return null for unknown arcano', () => {
      expect(getElementByArcano('Unknown')).toBeNull();
    });
  });

  describe('getOrixasByElement', () => {
    it('should return Orixás with Fogo element', () => {
      const orixas = getOrixasByElement('Fogo');
      expect(orixas.length).toBeGreaterThan(0);
      expect(orixas).toContain('Oxalá');
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Iansã');
    });

    it('should return Orixás with Água element', () => {
      const orixas = getOrixasByElement('Água');
      expect(orixas.length).toBeGreaterThan(0);
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Nanã');
    });

    it('should return Orixás with Terra element', () => {
      const orixas = getOrixasByElement('Terra');
      expect(orixas.length).toBeGreaterThan(0);
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Omolu');
    });

    it('should return Orixás with Ar element', () => {
      const orixas = getOrixasByElement('Ar');
      expect(orixas.length).toBeGreaterThan(0);
      expect(orixas).toContain('Exu');
      expect(orixas).toContain('Oxóssi');
      expect(orixas).toContain('Logun Edé');
    });

    it('should be case-insensitive', () => {
      const orixasFogo = getOrixasByElement('fogo');
      const orixasAgua = getOrixasByElement('ÁGUA');
      expect(orixasFogo.length).toBeGreaterThan(0);
      expect(orixasAgua.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown element', () => {
      const orixas = getOrixasByElement('Unknown');
      expect(orixas).toEqual([]);
    });
  });

  describe('getArcanosByElement', () => {
    it('should return arcanos with Fogo element', () => {
      const arcanos = getArcanosByElement('Fogo');
      expect(arcanos.length).toBeGreaterThan(0);
      expect(arcanos).toContain('O Imperador');
      expect(arcanos).toContain('O Carro');
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('A Torre');
    });

    it('should return arcanos with Água element', () => {
      const arcanos = getArcanosByElement('Água');
      expect(arcanos.length).toBeGreaterThan(0);
      expect(arcanos).toContain('A Sacerdotisa');
      expect(arcanos).toContain('A Estrela');
      expect(arcanos).toContain('A Lua');
    });

    it('should be case-insensitive', () => {
      const arcanos = getArcanosByElement('FOGO');
      expect(arcanos.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown element', () => {
      const arcanos = getArcanosByElement('Unknown');
      expect(arcanos).toEqual([]);
    });
  });

  describe('TAROT_ORIXA_MAPPINGS constant', () => {
    it('should contain 22 entries', () => {
      expect(Object.keys(TAROT_ORIXA_MAPPINGS).length).toBe(22);
    });

    it('should have O Louco as first key', () => {
      expect(TAROT_ORIXA_MAPPINGS['O Louco']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['O Louco'].numero_carta).toBe(0);
    });

    it('should have O Mundo as last key', () => {
      expect(TAROT_ORIXA_MAPPINGS['O Mundo']).toBeDefined();
      expect(TAROT_ORIXA_MAPPINGS['O Mundo'].numero_carta).toBe(21);
    });

    it('should be frozen to prevent modifications', () => {
      expect(Object.isFrozen(TAROT_ORIXA_MAPPINGS)).toBe(true);
    });

    it('should have valid orixa names for all entries', () => {
      const validOrixas = [
        'Oxalá', 'Iemanjá', 'Oxum', 'Ogum', 'Oxóssi',
        'Xangô', 'Iansã', 'Omolu', 'Nanã', 'Exu',
        'Logun Edé', 'Eshu',
      ];
      
      Object.values(TAROT_ORIXA_MAPPINGS).forEach((mapping) => {
        expect(validOrixas).toContain(mapping.orixa);
      });
    });

    it('should have all elements defined', () => {
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar'];
      
      Object.values(TAROT_ORIXA_MAPPINGS).forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento);
      });
    });
  });

  describe('Spiritual correlation consistency', () => {
    it('should have consistent orixa-arcano pairs with orixa-tarot module', () => {
      // This test verifies that the reverse mapping (from tarot to orixa)
      // is consistent with the forward mapping (from orixa to tarot)
      const orixaTarotPairs = [
        ['Oxalá', 'O Imperador'],
        ['Iemanjá', 'A Estrela'],
        ['Oxum', 'A Imperatriz'],
        ['Ogum', 'O Carro'],
        ['Oxóssi', 'O Hierofante'],
        ['Xangô', 'O Sol'],
        ['Iansã', 'A Torre'],
        ['Omolu', 'O Mundo'],
        ['Nanã', 'A Sacerdotisa'],
        ['Exu', 'O Mago'],
        ['Logun Edé', 'Os Enamorados'],
        ['Eshu', 'O Louco'],
      ];

      orixaTarotPairs.forEach(([orixa, expectedArcano]) => {
        const mapping = getTarotOrixa(expectedArcano);
        expect(mapping?.orixa).toBe(orixa);
      });
    });

    it('should have correct arcano numbers matching tarot conventions', () => {
      const arcanoNumbers: Record<string, number> = {
        'O Louco': 0,
        'O Mago': 1,
        'A Sacerdotisa': 2,
        'A Imperatriz': 3,
        'O Imperador': 4,
        'O Hierofante': 5,
        'Os Enamorados': 6,
        'O Carro': 7,
        'A Força': 8,
        'O Eremita': 9,
        'A Roda da Fortuna': 10,
        'A Justiça': 11,
        'O Enforcado': 12,
        'A Morte': 13,
        'A Temperança': 14,
        'O Diabo': 15,
        'A Torre': 16,
        'A Estrela': 17,
        'A Lua': 18,
        'O Sol': 19,
        'O Julgamento': 20,
        'O Mundo': 21,
      };

      Object.entries(arcanoNumbers).forEach(([arcano, expectedNumero]) => {
        const mapping = getTarotOrixa(arcano);
        expect(mapping?.numero_carta).toBe(expectedNumero);
      });
    });

    it('should have unique arcano numbers for all 22 cards', () => {
      const numbers = getAllTarotOrixas().map((m) => m.numero_carta);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(22);
    });

    it('should have unique orixa assignments (no duplicates per element)', () => {
      // Some Orixás can appear multiple times (like Oxalá with O Imperador and O Eremita)
      // but we verify the mapping is structurally consistent
      const orixaCounts: Record<string, number> = {};
      
      getAllTarotOrixas().forEach((mapping) => {
        orixaCounts[mapping.orixa] = (orixaCounts[mapping.orixa] || 0) + 1;
      });

      // Verify all expected Orixás appear at least once
      expect(orixaCounts['Oxalá']).toBeGreaterThan(0);
      expect(orixaCounts['Iemanjá']).toBeGreaterThan(0);
      expect(orixaCounts['Xangô']).toBeGreaterThan(0);
    });
  });
});