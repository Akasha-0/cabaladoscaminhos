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
  getArcanoByNumber,
  getOrixaByNumber,
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
    });

    it('should return Iemanjá mapping with A Estrela', () => {
      const mapping = getOrixaTarot('Iemanjá');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Estrela');
      expect(mapping?.numero_carta).toBe(17);
    });

    it('should return Oxum mapping with A Imperatriz', () => {
      const mapping = getOrixaTarot('Oxum');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Imperatriz');
      expect(mapping?.numero_carta).toBe(3);
    });

    it('should return Ogum mapping with O Carro', () => {
      const mapping = getOrixaTarot('Ogum');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Carro');
      expect(mapping?.numero_carta).toBe(7);
    });

    it('should return Oxóssi mapping with O Hierofante', () => {
      const mapping = getOrixaTarot('Oxóssi');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Hierofante');
      expect(mapping?.numero_carta).toBe(5);
    });

    it('should return Xangô mapping with O Sol', () => {
      const mapping = getOrixaTarot('Xangô');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Sol');
      expect(mapping?.numero_carta).toBe(19);
    });

    it('should return Iansã mapping with A Torre', () => {
      const mapping = getOrixaTarot('Iansã');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Torre');
      expect(mapping?.numero_carta).toBe(16);
    });

    it('should return Omolu mapping with O Mundo', () => {
      const mapping = getOrixaTarot('Omolu');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Mundo');
      expect(mapping?.numero_carta).toBe(21);
    });

    it('should return Nanã mapping with A Sacerdotisa', () => {
      const mapping = getOrixaTarot('Nanã');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('A Sacerdotisa');
      expect(mapping?.numero_carta).toBe(2);
    });

    it('should return Exu mapping with O Mago', () => {
      const mapping = getOrixaTarot('Exu');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Mago');
      expect(mapping?.numero_carta).toBe(1);
    });

    it('should return Logun Edé mapping with Os Enamorados', () => {
      const mapping = getOrixaTarot('Logun Edé');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('Os Enamorados');
      expect(mapping?.numero_carta).toBe(6);
    });

    it('should return Eshu mapping with O Louco', () => {
      const mapping = getOrixaTarot('Eshu');
      expect(mapping).toBeDefined();
      expect(mapping?.arcano).toBe('O Louco');
      expect(mapping?.numero_carta).toBe(0);
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
    it('should return Orixá name for O Imperador', () => {
      expect(getTarotOrixa('O Imperador')).toBe('Oxalá');
    });

    it('should return Orixá name for A Imperatriz', () => {
      expect(getTarotOrixa('A Imperatriz')).toBe('Oxum');
    });

    it('should return Orixá name for O Sol', () => {
      expect(getTarotOrixa('O Sol')).toBe('Xangô');
    });

    it('should return Orixá name for O Mago', () => {
      expect(getTarotOrixa('O Mago')).toBe('Exu');
    });

    it('should return null for unknown arcano', () => {
      expect(getTarotOrixa('O Mundo')).not.toBeNull(); // Omolu uses O Mundo
      expect(getTarotOrixa('Unknown Card')).toBeNull();
    });
  });

  describe('getAllOrixaTarots', () => {
    it('should return an array of all mappings', () => {
      const all = getAllOrixaTarots();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThan(0);
    });

    it('should return all mappings with correct structure', () => {
      const all = getAllOrixaTarots();
      all.forEach(mapping => {
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('energia_espiritual');
        expect(mapping).toHaveProperty('associacoes_rituais');
        expect(mapping).toHaveProperty('interpretacao');
      });
    });

    it('should have unique arcano names', () => {
      const all = getAllOrixaTarots();
      const arcanos = all.map(m => m.arcano);
      const uniqueArcanos = new Set(arcanos);
      expect(uniqueArcanos.size).toBe(arcanos.length);
    });
  });

  describe('getAllOrixaNames', () => {
    it('should return an array of Orixá names', () => {
      const names = getAllOrixaNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
    });

    it('should include main Orixás', () => {
      const names = getAllOrixaNames();
      expect(names).toContain('Oxalá');
      expect(names).toContain('Iemanjá');
      expect(names).toContain('Oxum');
      expect(names).toContain('Ogum');
      expect(names).toContain('Xangô');
      expect(names).toContain('Iansã');
    });
  });

  describe('hasOrixaTarot', () => {
    it('should return true for known Orixás', () => {
      expect(hasOrixaTarot('Oxalá')).toBe(true);
      expect(hasOrixaTarot('Iemanjá')).toBe(true);
      expect(hasOrixaTarot('Ogum')).toBe(true);
    });

    it('should return false for unknown Orixás', () => {
      expect(hasOrixaTarot('Tupã')).toBe(false);
      expect(hasOrixaTarot('Jurema')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(hasOrixaTarot('oxalá')).toBe(true);
      expect(hasOrixaTarot('XANGÔ')).toBe(true);
    });
  });

  describe('getOrixaTarotNumber', () => {
    it('should return correct card number for each Orixá', () => {
      expect(getOrixaTarotNumber('Oxalá')).toBe(4);
      expect(getOrixaTarotNumber('Oxum')).toBe(3);
      expect(getOrixaTarotNumber('Exu')).toBe(1);
      expect(getOrixaTarotNumber('Xangô')).toBe(19);
      expect(getOrixaTarotNumber('Omolu')).toBe(21);
    });

    it('should return null for unknown Orixá', () => {
      expect(getOrixaTarotNumber('Unknown')).toBeNull();
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return correct arcano for card number', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
      expect(getArcanoByNumber(3)).toBe('A Imperatriz');
      expect(getArcanoByNumber(4)).toBe('O Imperador');
      expect(getArcanoByNumber(5)).toBe('O Hierofante');
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('should return null for unknown card number', () => {
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(0)).toBe('O Louco'); // O Louco is 0
    });
  });

  describe('getOrixaByNumber', () => {
    it('should return correct Orixá for card number', () => {
      expect(getOrixaByNumber(1)).toBe('Exu');
      expect(getOrixaByNumber(3)).toBe('Oxum');
      expect(getOrixaByNumber(7)).toBe('Ogum');
      expect(getOrixaByNumber(16)).toBe('Iansã');
    });

    it('should return null for unknown card number', () => {
      expect(getOrixaByNumber(99)).toBeNull();
    });
  });

  describe('ORIXA_TAROT_MAPPINGS constant', () => {
    it('should be frozen to prevent modifications', () => {
      expect(Object.isFrozen(ORIXA_TAROT_MAPPINGS)).toBe(true);
    });

    it('should have at least 10 Orixás mapped', () => {
      const count = Object.keys(ORIXA_TAROT_MAPPINGS).length;
      expect(count).toBeGreaterThanOrEqual(10);
    });

    it('should have unique card numbers for all entries', () => {
      const mappings = Object.values(ORIXA_TAROT_MAPPINGS);
      const numbers = mappings.map(m => m.numero_carta);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);
    });
  });

  describe('Spiritual correlation consistency', () => {
    it('should have matching Orixá names between orixa and arcano properties', () => {
      const all = getAllOrixaTarots();
      all.forEach(mapping => {
        expect(getOrixaTarot(mapping.orixa)?.arcano).toBe(mapping.arcano);
      });
    });

    it('should have valid card numbers (0-21 for Major Arcana)', () => {
      const all = getAllOrixaTarots();
      all.forEach(mapping => {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      });
    });

    it('should have non-empty spiritual energy descriptions', () => {
      const all = getAllOrixaTarots();
      all.forEach(mapping => {
        expect(mapping.energia_espiritual.length).toBeGreaterThan(10);
      });
    });

    it('should have non-empty ritual associations', () => {
      const all = getAllOrixaTarots();
      all.forEach(mapping => {
        expect(mapping.associacoes_rituais.ferramentas?.length).toBeGreaterThan(0);
        expect(mapping.associacoes_rituais.oferendas?.length).toBeGreaterThan(0);
        expect(mapping.associacoes_rituais.momentos?.length).toBeGreaterThan(0);
      });
    });
  });
});