import { describe, it, expect } from 'vitest';
import {
  getOduElement,
  getElementOdu,
  getAllOduElements,
  getAllOduNames,
  hasOduElement,
  getOduByNumber,
  getOdusForElement,
  getAllElements,
  getElementDistribution,
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
      expect(result?.qualidades_elementares).toBeTruthy();
      expect(result?.significado_elementar).toBeTruthy();
      expect(result?.orixa).toBeTruthy();
      expect(result?.dia_sagrado).toBeTruthy();
      expect(result?.chakra).toBeTruthy();
      expect(result?.tipo_chakra).toBeTruthy();
      expect(result?.metais).toBeTruthy();
      expect(result?.direcoes_elementares).toBeTruthy();
      expect(result?.oferendas).toBeTruthy();
      expect(result?.afinidades).toBeTruthy();
      expect(result?.vibracoes).toBeTruthy();
    });
  });

  describe('getElementOdu', () => {
    it('returns all Odus for Fogo', () => {
      const result = getElementOdu('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map(m => m.odu)).toContain('Ejilsebora');
      expect(result.map(m => m.odu)).toContain('Obará');
      expect(result.map(m => m.odu)).toContain('Etaogundá');
      expect(result.map(m => m.odu)).toContain('Oxé');
    });

    it('returns all Odus for Água', () => {
      const result = getElementOdu('Água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map(m => m.odu)).toContain('Irosun');
      expect(result.map(m => m.odu)).toContain('Ofun');
      expect(result.map(m => m.odu)).toContain('Odi');
      expect(result.map(m => m.odu)).toContain('EjiOnile');
    });

    it('returns all Odus for Terra', () => {
      const result = getElementOdu('Terra');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map(m => m.odu)).toContain('Okaran');
      expect(result.map(m => m.odu)).toContain('Olobón');
      expect(result.map(m => m.odu)).toContain('Iká');
      expect(result.map(m => m.odu)).toContain('Obá');
    });

    it('returns all Odus for Ar', () => {
      const result = getElementOdu('Ar');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map(m => m.odu)).toContain('Ejiokô');
      expect(result.map(m => m.odu)).toContain('Ossá');
      expect(result.map(m => m.odu)).toContain('Alafia');
      expect(result.map(m => m.odu)).toContain('Oyekun');
    });

    it('returns empty array for invalid element', () => {
      const result = getElementOdu('InvalidElement');
      expect(result).toHaveLength(0);
    });

    it('returns Odus sorted by number', () => {
      const result = getElementOdu('Fogo');
      const numbers = result.map(m => m.numero);
      const sortedNumbers = [...numbers].sort((a, b) => a - b);
      expect(numbers).toEqual(sortedNumbers);
    });
  });

  describe('getAllOduElements', () => {
    it('returns all 16 Odu mappings', () => {
      const result = getAllOduElements();
      expect(result).toHaveLength(16);
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
    it('returns all 16 Odu names', () => {
      const result = getAllOduNames();
      expect(result).toHaveLength(16);
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
    it('returns Odu for valid number', () => {
      const result = getOduByNumber(1);
      expect(result).toBeTruthy();
      expect(result?.odu).toBe('Okaran');
      expect(result?.numero).toBe(1);
    });

    it('returns null for invalid number', () => {
      const result = getOduByNumber(99);
      expect(result).toBeNull();
    });

    it('returns null for number 0', () => {
      const result = getOduByNumber(0);
      expect(result).toBeNull();
    });
  });

  describe('getOdusForElement', () => {
    it('returns Odu names for Fogo', () => {
      const result = getOdusForElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Ejilsebora');
      expect(result).toContain('Etaogundá');
    });

    it('returns Odu names for Água', () => {
      const result = getOdusForElement('Água');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Irosun');
      expect(result).toContain('Ofun');
    });

    it('returns empty array for invalid element', () => {
      const result = getOdusForElement('Invalid');
      expect(result).toHaveLength(0);
    });
  });

  describe('getAllElements', () => {
    it('returns all 4 elements', () => {
      const result = getAllElements();
      expect(result).toHaveLength(4);
    });

    it('contains all expected elements', () => {
      const result = getAllElements();
      expect(result).toContain('Fogo');
      expect(result).toContain('Água');
      expect(result).toContain('Terra');
      expect(result).toContain('Ar');
    });
  });

  describe('getElementDistribution', () => {
    it('returns correct distribution', () => {
      const result = getElementDistribution();
      expect(result['Fogo']).toBe(4);
      expect(result['Água']).toBe(4);
      expect(result['Terra']).toBe(4);
      expect(result['Ar']).toBe(4);
    });

    it('total equals 16', () => {
      const result = getElementDistribution();
      const total = Object.values(result).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(16);
    });
  });

  describe('element qualities', () => {
    it('Fogo Odus have Yang quality', () => {
      const fogoOdus = getElementOdu('Fogo');
      for (const odu of fogoOdus) {
        expect(odu.qualidades_elementares.qualidade).toBe('Yang (Exterior)');
        expect(odu.qualidades_elementares.natureza).toBe('Transformador');
      }
    });

    it('Água Odus have Yin quality', () => {
      const aguaOdus = getElementOdu('Água');
      for (const odu of aguaOdus) {
        expect(odu.qualidades_elementares.qualidade).toBe('Yin (Interior)');
        expect(odu.qualidades_elementares.natureza).toBe('Receptivo');
      }
    });

    it('Ar Odus have Neutro quality', () => {
      const arOdus = getElementOdu('Ar');
      for (const odu of arOdus) {
        expect(odu.qualidades_elementares.qualidade).toBe('Neutro (Equilibrado)');
        expect(odu.qualidades_elementares.natureza).toBe('Comunicativo');
      }
    });

    it('Terra Odus have Yin or Yang quality based on Odu', () => {
      const terraOdus = getElementOdu('Terra');
      for (const odu of terraOdus) {
        expect(
          odu.qualidades_elementares.qualidade === 'Yin (Interior)' ||
          odu.qualidades_elementares.qualidade === 'Yang (Exterior)'
        ).toBe(true);
        expect(odu.qualidades_elementares.natureza).toBe('Estruturante');
      }
    });
  });

  describe('chakra correspondences', () => {
    it('each Odu has a valid chakra', () => {
      const allOdus = getAllOduElements();
      for (const odu of allOdus) {
        expect(odu.chakra).toBeTruthy();
        expect(odu.tipo_chakra).toBeTruthy();
      }
    });

    it('chakra types are valid', () => {
      const validTypes = ['Raiz', 'Sacral', 'Solar', 'Cardíaco', 'Laríngeo', 'Frontal', 'Coronário'];
      const allOdus = getAllOduElements();
      for (const odu of allOdus) {
        expect(validTypes).toContain(odu.tipo_chakra);
      }
    });

    it('Fogo Odus correspond to Solar or Cardíaco chakras', () => {
      const fogoOdus = getElementOdu('Fogo');
      const validChakras = ['Solar', 'Cardíaco'];
      for (const odu of fogoOdus) {
        expect(validChakras).toContain(odu.tipo_chakra);
      }
    });

    it('Água Odus correspond to Frontal or Cardíaco chakras', () => {
      const aguaOdus = getElementOdu('Água');
      const validChakras = ['Frontal', 'Cardíaco'];
      for (const odu of aguaOdus) {
        expect(validChakras).toContain(odu.tipo_chakra);
      }
    });

    it('Terra Odus correspond to Root or Solar chakras', () => {
      const terraOdus = getElementOdu('Terra');
      const validChakras = ['Raiz', 'Solar'];
      for (const odu of terraOdus) {
        expect(validChakras).toContain(odu.tipo_chakra);
      }
    });

    it('Ar Odus correspond to Laríngeo or Coronário chakras', () => {
      const arOdus = getElementOdu('Ar');
      const validChakras = ['Laríngeo', 'Coronário'];
      for (const arOdu of arOdus) {
        expect(validChakras).toContain(arOdu.tipo_chakra);
      }
    });
  });

  describe('spiritual meaning', () => {
    it('all Odus have spiritual meaning', () => {
      const allOdus = getAllOduElements();
      for (const odu of allOdus) {
        expect(odu.significado_elementar.length).toBeGreaterThan(10);
      }
    });

    it('all Odus have elemental vibrations', () => {
      const allOdus = getAllOduElements();
      for (const odu of allOdus) {
        expect(odu.vibracoes.length).toBeGreaterThan(0);
      }
    });

    it('all Odus have offerings', () => {
      const allOdus = getAllOduElements();
      for (const odu of allOdus) {
        expect(odu.oferendas.length).toBeGreaterThan(0);
      }
    });

    it('all Odus have metals', () => {
      const allOdus = getAllOduElements();
      for (const odu of allOdus) {
        expect(odu.metais.length).toBeGreaterThan(0);
      }
    });
  });

  describe('cross-references', () => {
    it('Odu names match between odu-element and ODU_ELEMENT_MAPPINGS', () => {
      const allNames = Object.keys(ODU_ELEMENT_MAPPINGS);
      const allMappings = getAllOduElements();
      expect(allMappings.map(m => m.odu).sort()).toEqual(allNames.sort());
    });

    it('each Odu has corresponding Orixá', () => {
      const allOdus = getAllOduElements();
      for (const odu of allOdus) {
        expect(odu.orixa).toBeTruthy();
        expect(odu.orixa.length).toBeGreaterThan(2);
      }
    });

    it('each Odu has sacred day', () => {
      const allOdus = getAllOduElements();
      for (const odu of allOdus) {
        expect(odu.dia_sagrado).toBeTruthy();
      }
    });

    it('each Odu has elemental directions', () => {
      const allOdus = getAllOduElements();
      for (const odu of allOdus) {
        expect(odu.direcoes_elementares.length).toBeGreaterThan(0);
      }
    });
  });

  describe('ODU_ELEMENT_MAPPINGS constant', () => {
    it('is frozen', () => {
      expect(Object.isFrozen(ODU_ELEMENT_MAPPINGS)).toBe(true);
    });

    it('contains all 16 Odu mappings', () => {
      expect(Object.keys(ODU_ELEMENT_MAPPINGS)).toHaveLength(16);
    });

    it('nested objects are frozen', () => {
      for (const mapping of Object.values(ODU_ELEMENT_MAPPINGS)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });
  });

  describe('specific Odu-Element mappings', () => {
    it('Okaran is Earth (1)', () => {
      const result = getOduElement('Okaran');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero).toBe(1);
      expect(result?.qualidades_elementares.qualidade).toBe('Yin (Interior)');
    });

    it('Ejiokô is Air (2)', () => {
      const result = getOduElement('Ejiokô');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero).toBe(2);
      expect(result?.qualidades_elementares.qualidade).toBe('Neutro (Equilibrado)');
    });

    it('Etaogundá is Fire (3)', () => {
      const result = getOduElement('Etaogundá');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero).toBe(3);
      expect(result?.qualidades_elementares.qualidade).toBe('Yang (Exterior)');
    });

    it('Irosun is Water (4)', () => {
      const result = getOduElement('Irosun');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero).toBe(4);
      expect(result?.qualidades_elementares.qualidade).toBe('Yin (Interior)');
    });

    it('Oxé is Fire (5)', () => {
      const result = getOduElement('Oxé');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero).toBe(5);
    });

    it('Obará is Fire (6)', () => {
      const result = getOduElement('Obará');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero).toBe(6);
    });

    it('Odi is Water (7)', () => {
      const result = getOduElement('Odi');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero).toBe(7);
    });

    it('EjiOnile is Water (8)', () => {
      const result = getOduElement('EjiOnile');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero).toBe(8);
    });

    it('Ossá is Air (9)', () => {
      const result = getOduElement('Ossá');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero).toBe(9);
    });

    it('Ofun is Water (10)', () => {
      const result = getOduElement('Ofun');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero).toBe(10);
    });

    it('Alafia is Air (11)', () => {
      const result = getOduElement('Alafia');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero).toBe(11);
    });

    it('Ejilsebora is Fire (12)', () => {
      const result = getOduElement('Ejilsebora');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero).toBe(12);
    });

    it('Olobón is Earth (13)', () => {
      const result = getOduElement('Olobón');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero).toBe(13);
    });

    it('Iká is Earth (14)', () => {
      const result = getOduElement('Iká');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero).toBe(14);
    });

    it('Obá is Earth (15)', () => {
      const result = getOduElement('Obá');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero).toBe(15);
    });

    it('Oyekun is Air (16)', () => {
      const result = getOduElement('Oyekun');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero).toBe(16);
    });
  });
});
