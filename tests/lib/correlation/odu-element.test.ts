import { describe, it, expect } from 'vitest';
import {
  getOduElement,
  getElementOdu,
  getAllOduElements,
  getAllOduNames,
  hasOduElement,
  getOduByNumber,
  getOdusForElement,
  ODU_ELEMENT_MAPPINGS,
} from '@/lib/correlation/odu-element';

describe('correlation/odu-element', () => {
  describe('getOduElement', () => {
    it('returns mapping for valid Odu name', () => {
      const result = getOduElement('Ejilsebora');
      expect(result).toBeTruthy();
      expect(result?.odu).toBe('Ejilsebora');
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns null for invalid Odu name', () => {
      const result = getOduElement('InvalidOdu');
      expect(result).toBeNull();
    });

    it('each mapping has required fields', () => {
      const result = getOduElement('Ofun');
      expect(result?.odu).toBeTruthy();
      expect(result?.numero).toBeTruthy();
      expect(result?.elemento).toBeTruthy();
      expect(result?.qualidades).toBeTruthy();
      expect(result?.alinhamento_energetico).toBeTruthy();
      expect(result?.significado_espiritual).toBeTruthy();
      expect(result?.orixa).toBeTruthy();
      expect(result?.dia_sagrado).toBeTruthy();
      expect(result?.cores).toBeTruthy();
      expect(result?.chakra).toBeTruthy();
      expect(result?.sephirah).toBeTruthy();
      expect(result?.praticas_espirituais).toBeTruthy();
      expect(result?.afinidades).toBeTruthy();
    });
  });

  describe('getElementOdu', () => {
    it('returns all Odus for Fogo element', () => {
      const result = getElementOdu('Fogo');
      expect(result).toHaveLength(3);
      expect(result.map(m => m.odu)).toContain('Ejilsebora');
      expect(result.map(m => m.odu)).toContain('Obará');
      expect(result.map(m => m.odu)).toContain('Etaogundá');
    });

    it('returns all Odus for Água element', () => {
      const result = getElementOdu('Água');
      expect(result).toHaveLength(3);
      expect(result.map(m => m.odu)).toContain('Ofun');
      expect(result.map(m => m.odu)).toContain('Oxé');
      expect(result.map(m => m.odu)).toContain('Odi');
    });

    it('returns all Odus for Ar element', () => {
      const result = getElementOdu('Ar');
      expect(result).toHaveLength(3);
      expect(result.map(m => m.odu)).toContain('Alafia');
      expect(result.map(m => m.odu)).toContain('Ejiokô');
      expect(result.map(m => m.odu)).toContain('Ossá');
    });

    it('returns all Odus for Terra element', () => {
      const result = getElementOdu('Terra');
      expect(result).toHaveLength(3);
      expect(result.map(m => m.odu)).toContain('Okaran');
      expect(result.map(m => m.odu)).toContain('Olobón');
      expect(result.map(m => m.odu)).toContain('Iká');
    });

    it('returns empty array for invalid element', () => {
      const result = getElementOdu('InvalidElement');
      expect(result).toHaveLength(0);
    });
  });

  describe('getAllOduElements', () => {
    it('returns all 12 Odu mappings', () => {
      const result = getAllOduElements();
      expect(result).toHaveLength(12);
    });

    it('all mappings have unique Odu names', () => {
      const result = getAllOduElements();
      const names = result.map(m => m.odu);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('all mappings have unique Odu numbers', () => {
      const result = getAllOduElements();
      const numbers = result.map(m => m.numero);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);
    });
  });

  describe('getAllOduNames', () => {
    it('returns all 12 Odu names', () => {
      const result = getAllOduNames();
      expect(result).toHaveLength(12);
    });

    it('returns names sorted by number', () => {
      const result = getAllOduNames();
      const mappings = getAllOduElements();
      const sorted = mappings.sort((a, b) => a.numero - b.numero).map(m => m.odu);
      expect(result).toEqual(sorted);
    });
  });

  describe('hasOduElement', () => {
    it('returns true for valid Odu', () => {
      expect(hasOduElement('Ejilsebora')).toBe(true);
      expect(hasOduElement('Ofun')).toBe(true);
      expect(hasOduElement('Alafia')).toBe(true);
      expect(hasOduElement('Okaran')).toBe(true);
    });

    it('returns false for invalid Odu', () => {
      expect(hasOduElement('InvalidOdu')).toBe(false);
      expect(hasOduElement('')).toBe(false);
    });
  });

  describe('getOduByNumber', () => {
    it('returns correct mapping for valid number', () => {
      const result = getOduByNumber(12);
      expect(result?.odu).toBe('Ejilsebora');
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns null for invalid number', () => {
      const result = getOduByNumber(99);
      expect(result).toBeNull();
    });

    it('returns null for number0 or negative', () => {
      expect(getOduByNumber(0)).toBeNull();
      expect(getOduByNumber(-1)).toBeNull();
    });
  });

  describe('getOdusForElement', () => {
    it('returns Odu names for Fogo sorted by number', () => {
      const result = getOdusForElement('Fogo');
      expect(result).toEqual(['Etaogundá', 'Obará', 'Ejilsebora']);
    });

    it('returns Odu names for Água sorted by number', () => {
      const result = getOdusForElement('Água');
      expect(result).toEqual(['Oxé', 'Odi', 'Ofun']);
    });

    it('returns Odu names for Ar sorted by number', () => {
      const result = getOdusForElement('Ar');
      expect(result).toEqual(['Ejiokô', 'Ossá', 'Alafia']);
    });

    it('returns Odu names for Terra sorted by number', () => {
      const result = getOdusForElement('Terra');
      expect(result).toEqual(['Okaran', 'Olobón', 'Iká']);
    });

    it('returns empty array for invalid element', () => {
      const result = getOdusForElement('InvalidElement');
      expect(result).toHaveLength(0);
    });
  });

  describe('elemental qualities', () => {
    it('Fogo Odus have quente/seco/yang qualities', () => {
      const fogoOdus = getElementOdu('Fogo');
      fogoOdus.forEach(odu => {
        expect(odu.qualidades.temperatura).toBe('Quente');
        expect(odu.qualidades.umidade).toBe('Seco');
        expect(odu.qualidades.polaridade).toBe('Yang');
      });
    });

    it('Água Odus have frio/úmido/yin qualities', () => {
      const aguaOdus = getElementOdu('Água');
      aguaOdus.forEach(odu => {
        expect(odu.qualidades.temperatura).toBe('Frio');
        expect(odu.qualidades.umidade).toBe('Úmido');
        expect(odu.qualidades.polaridade).toBe('Yin');
      });
    });

    it('Ar Odus have neutro/seco/equilibrado qualities', () => {
      const arOdus = getElementOdu('Ar');
      arOdus.forEach(odu => {
        expect(odu.qualidades.temperatura).toBe('Neutro');
        expect(odu.qualidades.umidade).toBe('Seco');
        expect(odu.qualidades.polaridade).toBe('Equilibrado');
      });
    });

    it('Terra Odus have frio/seco/yin qualities', () => {
      const terraOdus = getElementOdu('Terra');
      terraOdus.forEach(odu => {
        expect(odu.qualidades.temperatura).toBe('Frio');
        expect(odu.qualidades.umidade).toBe('Seco');
        expect(odu.qualidades.polaridade).toBe('Yin');
      });
    });
  });

  describe('spiritual practices', () => {
    it('each Odu has spiritual practices', () => {
      const allOdus = getAllOduElements();
      allOdus.forEach(odu => {
        expect(odu.praticas_espirituais.length).toBeGreaterThan(0);
      });
    });

    it('each practice has tipo and descricao', () => {
      const allOdus = getAllOduElements();
      allOdus.forEach(odu => {
        odu.praticas_espirituais.forEach(p => {
          expect(p.tipo).toBeTruthy();
          expect(p.descricao).toBeTruthy();
        });
      });
    });

    it('practice types are valid', () => {
      const validTypes = ['ebo', 'oracao', 'banho', 'ritual', 'oferenda'];
      const allOdus = getAllOduElements();
      allOdus.forEach(odu => {
        odu.praticas_espirituais.forEach(p => {
          expect(validTypes).toContain(p.tipo);
        });
      });
    });
  });

  describe('ODU_ELEMENT_MAPPINGS constant', () => {
    it('is frozen to prevent modifications', () => {
      expect(Object.isFrozen(ODU_ELEMENT_MAPPINGS)).toBe(true);
    });
  });
});
