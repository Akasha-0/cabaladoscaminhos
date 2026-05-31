/**
 * Tarot-Orixá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotOrixaMapping,
  getOrixaByTarot,
  getAllTarotOrixas,
  getAllArcanos,
  hasTarotOrixa,
  getNumeroByArcano,
  getElementoByArcano,
  getArcanoByNumero,
  getOrixaByNumero,
  getArcanoByOrixa,
  getArcanosByElemento,
  getOrixasByElemento,
  getTarotOrixaCount,
  getEnergiaByArcano,
  TAROT_ORIXA_MAPPINGS,
  type TarotOrixaMapping,
} from '@/lib/correlation/tarot-orixa';

describe('Tarot-Orixá Correlation', () => {
  describe('getTarotOrixaMapping', () => {
    it('should return mapping for valid arcano', () => {
      const mapping = getTarotOrixaMapping('O Sol');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Xangô');
      expect(mapping?.numero_carta).toBe(19);
    });

    it('should return mapping case-insensitive', () => {
      const mapping = getTarotOrixaMapping('O SOL');
      expect(mapping).toBeDefined();
      expect(mapping?.orixa).toBe('Xangô');
    });

    it('should return null for invalid arcano', () => {
      const mapping = getTarotOrixaMapping('Não existe');
      expect(mapping).toBeNull();
    });

    it('should have consistent data with Orixá-Tarot module', () => {
      const orixaTarot = require('@/lib/correlation/orixa-tarot');
      for (const arcano of Object.keys(TAROT_ORIXA_MAPPINGS)) {
        const tarotMapping = getTarotOrixaMapping(arcano);
        const orixaMapping = orixaTarot.getOrixaTarot(tarotMapping!.orixa);
        expect(orixaMapping).toBeDefined();
        expect(orixaMapping?.arcano).toBe(arcano);
      }
    });
  });

  describe('getOrixaByTarot', () => {
    it('should return Orixá name for valid arcano', () => {
      expect(getOrixaByTarot('O Mago')).toBe('Exu');
      expect(getOrixaByTarot('A Imperatriz')).toBe('Oxum');
      expect(getOrixaByTarot('A Torre')).toBe('Iansã');
    });

    it('should return null for invalid arcano', () => {
      expect(getOrixaByTarot('Invalid Card')).toBeNull();
    });
  });

  describe('getAllTarotOrixas', () => {
    it('should return all mappings', () => {
      const mappings = getAllTarotOrixas();
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.length).toBe(getTarotOrixaCount());
    });

    it('should return mappings sorted by card number', () => {
      const mappings = getAllTarotOrixas();
      for (let i = 1; i < mappings.length; i++) {
        expect(mappings[i].numero_carta).toBeGreaterThanOrEqual(mappings[i - 1].numero_carta);
      }
    });

    it('should include all required properties', () => {
      const mappings = getAllTarotOrixas();
      for (const mapping of mappings) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('energia_espiritual');
        expect(mapping).toHaveProperty('interpretacao');
      }
    });
  });

  describe('getAllArcanos', () => {
    it('should return all arcano names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos.length).toBeGreaterThan(0);
      expect(arcanos).toContain('O Mago');
      expect(arcanos).toContain('O Sol');
      expect(arcanos).toContain('O Mundo');
    });
  });

  describe('hasTarotOrixa', () => {
    it('should return true for existing arcano', () => {
      expect(hasTarotOrixa('O Sol')).toBe(true);
      expect(hasTarotOrixa('A Estrela')).toBe(true);
    });

    it('should return false for non-existing arcano', () => {
      expect(hasTarotOrixa('Não existe')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(hasTarotOrixa('O SOL')).toBe(true);
    });
  });

  describe('getNumeroByArcano', () => {
    it('should return correct card number', () => {
      expect(getNumeroByArcano('O Mago')).toBe(1);
      expect(getNumeroByArcano('O Sol')).toBe(19);
      expect(getNumeroByArcano('O Mundo')).toBe(21);
    });

    it('should return null for invalid arcano', () => {
      expect(getNumeroByArcano('Invalid')).toBeNull();
    });
  });

  describe('getElementoByArcano', () => {
    it('should return element for valid arcano', () => {
      expect(getElementoByArcano('A Imperatriz')).toBe('Terra');
      expect(getElementoByArcano('A Sacerdotisa')).toBe('Água');
      expect(getElementoByArcano('O Imperador')).toBe('Fogo');
    });

    it('should return null for invalid arcano', () => {
      expect(getElementoByArcano('Invalid')).toBeNull();
    });
  });

  describe('getArcanoByNumero', () => {
    it('should return arcano name by card number', () => {
      expect(getArcanoByNumero(1)).toBe('O Mago');
      expect(getArcanoByNumero(19)).toBe('O Sol');
      expect(getArcanoByNumero(21)).toBe('O Mundo');
    });

    it('should return null for non-existing number', () => {
      expect(getArcanoByNumero(99)).toBeNull();
    });
  });

  describe('getOrixaByNumero', () => {
    it('should return Orixá name by card number', () => {
      expect(getOrixaByNumero(1)).toBe('Exu');
      expect(getOrixaByNumero(19)).toBe('Xangô');
      expect(getOrixaByNumero(21)).toBe('Omolu');
    });

    it('should return null for non-existing number', () => {
      expect(getOrixaByNumero(99)).toBeNull();
    });
  });

  describe('getArcanoByOrixa', () => {
    it('should return arcano name by Orixá', () => {
      expect(getArcanoByOrixa('Xangô')).toBe('O Sol');
      expect(getArcanoByOrixa('Iemanjá')).toBe('A Estrela');
      expect(getArcanoByOrixa('Exu')).toBe('O Mago');
    });

    it('should return null for non-existing Orixá', () => {
      expect(getArcanoByOrixa('Não existe')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(getArcanoByOrixa('xangô')).toBe('O Sol');
    });
  });

  describe('getArcanosByElemento', () => {
    it('should return arcanos for specific element', () => {
      const fogoArcanos = getArcanosByElemento('Fogo');
      expect(fogoArcanos).toContain('O Imperador');
      expect(fogoArcanos).toContain('O Carro');
    });

    it('should return empty array for non-existing element', () => {
      expect(getArcanosByElemento('Invalid')).toEqual([]);
    });

    it('should be case-insensitive', () => {
      const terraArcanos = getArcanosByElemento('TERRA');
      expect(terraArcanos.length).toBeGreaterThan(0);
    });
  });

  describe('getOrixasByElemento', () => {
    it('should return Orixás for specific element', () => {
      const aguaOrixas = getOrixasByElemento('Água');
      expect(aguaOrixas).toContain('Nanã');
      expect(aguaOrixas).toContain('Iemanjá');
    });

    it('should return empty array for non-existing element', () => {
      expect(getOrixasByElemento('Invalid')).toEqual([]);
    });
  });

  describe('getTarotOrixaCount', () => {
    it('should return correct count', () => {
      const count = getTarotOrixaCount();
      expect(count).toBe(Object.keys(TAROT_ORIXA_MAPPINGS).length);
      expect(count).toBe(getAllTarotOrixas().length);
    });
  });

  describe('getEnergiaByArcano', () => {
    it('should return spiritual energy for valid arcano', () => {
      const energia = getEnergiaByArcano('O Sol');
      expect(energia).toBeDefined();
      expect(typeof energia).toBe('string');
      expect(energia!.length).toBeGreaterThan(0);
    });

    it('should return null for invalid arcano', () => {
      expect(getEnergiaByArcano('Invalid')).toBeNull();
    });
  });

  describe('TAROT_ORIXA_MAPPINGS constant', () => {
    it('should be frozen and not extensible', () => {
      expect(Object.isFrozen(TAROT_ORIXA_MAPPINGS)).toBe(true);
    });

    it('should have correct structure', () => {
      for (const arcano of Object.keys(TAROT_ORIXA_MAPPINGS)) {
        const mapping = TAROT_ORIXA_MAPPINGS[arcano];
        expect(mapping.arcano).toBe(arcano);
        expect(typeof mapping.numero_carta).toBe('number');
        expect(typeof mapping.orixa).toBe('string');
        expect(typeof mapping.elemento).toBe('string');
      }
    });

    it('should include ritual associations', () => {
      const mapping = TAROT_ORIXA_MAPPINGS['O Mago'];
      expect(mapping.ferramentas).toBeDefined();
      expect(mapping.oferendas).toBeDefined();
      expect(mapping.momentos).toBeDefined();
    });
  });

  describe('Spiritual correlation consistency', () => {
    it('should have bidirectional Orixá-Tarot mappings', () => {
      const orixaTarot = require('@/lib/correlation/orixa-tarot');
      for (const arcano of getAllArcanos()) {
        const mapping = getTarotOrixaMapping(arcano)!;
        const reverseMapping = orixaTarot.getOrixaTarot(mapping.orixa);
        expect(reverseMapping).toBeDefined();
        expect(reverseMapping!.arcano).toBe(arcano);
      }
    });

    it('should have consistent element mappings between modules', () => {
      const orixaTarot = require('@/lib/correlation/orixa-tarot');
      for (const arcano of getAllArcanos()) {
        const tarotMapping = getTarotOrixaMapping(arcano)!;
        const orixaMapping = orixaTarot.getOrixaTarot(tarotMapping.orixa)!;
        expect(tarotMapping.elemento).toBe(orixaMapping.elemento);
      }
    });

    it('should have consistent card numbers between modules', () => {
      const orixaTarot = require('@/lib/correlation/orixa-tarot');
      for (const arcano of getAllArcanos()) {
        const tarotMapping = getTarotOrixaMapping(arcano)!;
        const orixaMapping = orixaTarot.getOrixaTarot(tarotMapping.orixa)!;
        expect(tarotMapping.numero_carta).toBe(orixaMapping.numero_carta);
      }
    });

    it('should cover key Major Arcana cards', () => {
      const keyCards = ['O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador', 'O Hierofante',
        'Os Enamorados', 'O Carro', 'A Torre', 'A Estrela', 'O Sol', 'O Mundo', 'O Louco'];
      for (const card of keyCards) {
        expect(hasTarotOrixa(card)).toBe(true);
      }
    });

    it('should have valid card numbers for all arcanos', () => {
      const mappings = getAllTarotOrixas();
      for (const mapping of mappings) {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      }
    });
  });
});