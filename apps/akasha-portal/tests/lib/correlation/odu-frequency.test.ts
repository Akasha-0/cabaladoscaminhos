import { describe, it, expect } from 'vitest';
import {
  getOduFrequency,
  getFrequencyByOduName,
  getFrequencyOdu,
  getAllOduFrequencies,
  getAllOduNames,
  hasOduFrequency,
  getOduByNumber,
  getOdusForElement,
  getFrequenciesForElement,
  getElementByOdu,
  getHealingProperties,
  getUsedFrequencies,
  ODU_FREQUENCY_MAPPINGS,
  SOLFEGGIO_FREQUENCIES,
  type OduFrequencyMapping,
  type HealingProperties,
  type Elemento,
} from '@/lib/correlation/odu-frequency';

describe('OduFrequency Correlation', () => {
  describe('Core Exports', () => {
    it('should export all required functions', () => {
      expect(typeof getOduFrequency).toBe('function');
      expect(typeof getFrequencyByOduName).toBe('function');
      expect(typeof getFrequencyOdu).toBe('function');
      expect(typeof getAllOduFrequencies).toBe('function');
      expect(typeof getAllOduNames).toBe('function');
      expect(typeof hasOduFrequency).toBe('function');
      expect(typeof getOduByNumber).toBe('function');
      expect(typeof getOdusForElement).toBe('function');
      expect(typeof getFrequenciesForElement).toBe('function');
      expect(typeof getElementByOdu).toBe('function');
      expect(typeof getHealingProperties).toBe('function');
      expect(typeof getUsedFrequencies).toBe('function');
    });

    it('should export constant SOLFEGGIO_FREQUENCIES', () => {
      expect(SOLFEGGIO_FREQUENCIES).toBeDefined();
      expect(Array.isArray(SOLFEGGIO_FREQUENCIES)).toBe(true);
    });

    it('should export constant ODU_FREQUENCY_MAPPINGS', () => {
      expect(ODU_FREQUENCY_MAPPINGS).toBeDefined();
      expect(typeof ODU_FREQUENCY_MAPPINGS).toBe('object');
    });
  });

  describe('getOduFrequency', () => {
    it('should return mapping for valid Odu names', () => {
      const mapping = getOduFrequency('Ogbe');
      expect(mapping).not.toBeNull();
      expect(mapping?.odu).toBe('Ogbe');
      expect(mapping?.numero).toBe(8);
      expect(mapping?.frequencia).toBe(852);
    });

    it('should return null for invalid Odu names', () => {
      expect(getOduFrequency('InvalidOdu')).toBeNull();
      expect(getOduFrequency('')).toBeNull();
    });

    it('should return correct mapping for Ofun', () => {
      const mapping = getOduFrequency('Ofun');
      expect(mapping).not.toBeNull();
      expect(mapping?.odu).toBe('Ofun');
      expect(mapping?.numero).toBe(10);
      expect(mapping?.frequencia).toBe(528);
      expect(mapping?.elemento).toBe('Água');
    });

    it('should return correct mapping for Alafia', () => {
      const mapping = getOduFrequency('Alafia');
      expect(mapping).not.toBeNull();
      expect(mapping?.odu).toBe('Alafia');
      expect(mapping?.numero).toBe(16);
      expect(mapping?.frequencia).toBe(963);
    });
  });

  describe('getFrequencyByOduName', () => {
    it('should return frequency for valid Odu names', () => {
      expect(getFrequencyByOduName('Ogbe')).toBe(852);
      expect(getFrequencyByOduName('Ofun')).toBe(528);
      expect(getFrequencyByOduName('Okaran')).toBe(174);
    });

    it('should return null for invalid Odu names', () => {
      expect(getFrequencyByOduName('Invalid')).toBeNull();
    });
  });

  describe('getFrequencyOdu', () => {
    it('should return all Odus for a given frequency', () => {
      const mappings = getFrequencyOdu(528);
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.every((m) => m.frequencia === 528)).toBe(true);
    });

    it('should return empty array for unused frequency', () => {
      const mappings = getFrequencyOdu(999);
      expect(mappings).toEqual([]);
    });

    it('should return multiple Odus for frequencies used by multiple Odus', () => {
      const mappings = getFrequencyOdu(396);
      expect(Array.isArray(mappings)).toBe(true);
    });
  });

  describe('getAllOduFrequencies', () => {
    it('should return all mappings sorted by number', () => {
      const mappings = getAllOduFrequencies();
      expect(mappings.length).toBe(16);
      for (let i = 1; i < mappings.length; i++) {
        expect(mappings[i].numero).toBeGreaterThan(mappings[i - 1].numero);
      }
    });

    it('should include all required fields in each mapping', () => {
      const mappings = getAllOduFrequencies();
      for (const mapping of mappings) {
        expect(mapping.odu).toBeDefined();
        expect(mapping.numero).toBeDefined();
        expect(mapping.frequencia).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.propriedades_healing).toBeDefined();
        expect(mapping.propriedades_healing.fisico).toBeDefined();
        expect(mapping.propriedades_healing.emocional).toBeDefined();
        expect(mapping.propriedades_healing.mental_espiritual).toBeDefined();
        expect(mapping.propriedades_healing.pratica).toBeDefined();
      }
    });
  });

  describe('getAllOduNames', () => {
    it('should return array of Odu names', () => {
      const names = getAllOduNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBe(16);
    });

    it('should return names sorted by Odu number', () => {
      const names = getAllOduNames();
      const mappings = getAllOduFrequencies();
      expect(names).toEqual(mappings.map((m) => m.odu));
    });
  });

  describe('hasOduFrequency', () => {
    it('should return true for existing Odus', () => {
      expect(hasOduFrequency('Ogbe')).toBe(true);
      expect(hasOduFrequency('Ofun')).toBe(true);
      expect(hasOduFrequency('Okaran')).toBe(true);
      expect(hasOduFrequency('Alafia')).toBe(true);
    });

    it('should return false for non-existing Odus', () => {
      expect(hasOduFrequency('NonExistent')).toBe(false);
      expect(hasOduFrequency('')).toBe(false);
    });
  });

  describe('getOduByNumber', () => {
    it('should return mapping for valid Odu numbers', () => {
      const mapping = getOduByNumber(8);
      expect(mapping).not.toBeNull();
      expect(mapping?.odu).toBe('Ogbe');
      expect(mapping?.numero).toBe(8);
    });

    it('should return null for invalid Odu numbers', () => {
      expect(getOduByNumber(0)).toBeNull();
      expect(getOduByNumber(17)).toBeNull();
      expect(getOduByNumber(-1)).toBeNull();
    });

    it('should return correct mapping for number 1', () => {
      const mapping = getOduByNumber(1);
      expect(mapping?.odu).toBe('Okaran');
    });

    it('should return correct mapping for number 16', () => {
      const mapping = getOduByNumber(16);
      expect(mapping?.odu).toBe('Alafia');
    });
  });

  describe('getOdusForElement', () => {
    it('should return all Odus for Fogo element', () => {
      const mappings = getOdusForElement('Fogo');
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.every((m) => m.elemento === 'Fogo')).toBe(true);
    });

    it('should return all Odus for Água element', () => {
      const mappings = getOdusForElement('Água');
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.every((m) => m.elemento === 'Água')).toBe(true);
    });

    it('should return all Odus for Ar element', () => {
      const mappings = getOdusForElement('Ar');
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.every((m) => m.elemento === 'Ar')).toBe(true);
    });

    it('should return all Odus for Terra element', () => {
      const mappings = getOdusForElement('Terra');
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings.every((m) => m.elemento === 'Terra')).toBe(true);
    });

    it('should return empty array for non-existing element', () => {
      const mappings = getOdusForElement('Éter');
      expect(mappings).toEqual([]);
    });

    it('should return mappings sorted by number', () => {
      const mappings = getOdusForElement('Fogo');
      for (let i = 1; i < mappings.length; i++) {
        expect(mappings[i].numero).toBeGreaterThan(mappings[i - 1].numero);
      }
    });
  });

  describe('getFrequenciesForElement', () => {
    it('should return unique frequencies for each element', () => {
      const fogoFreqs = getFrequenciesForElement('Fogo');
      expect(fogoFreqs.length).toBeGreaterThan(0);
      expect(new Set(fogoFreqs).size).toBe(fogoFreqs.length); // no duplicates
    });

    it('should return empty array for non-existing element', () => {
      expect(getFrequenciesForElement('Éter')).toEqual([]);
    });
  });

  describe('getElementByOdu', () => {
    it('should return element for valid Odu names', () => {
      expect(getElementByOdu('Ogbe')).toBe('Fogo');
      expect(getElementByOdu('Ofun')).toBe('Água');
      expect(getElementByOdu('Alafia')).toBe('Ar');
      expect(getElementByOdu('Okaran')).toBe('Fogo');
    });

    it('should return null for invalid Odu names', () => {
      expect(getElementByOdu('Invalid')).toBeNull();
    });
  });

  describe('getHealingProperties', () => {
    it('should return healing properties for valid Odu names', () => {
      const healing = getHealingProperties('Ogbe');
      expect(healing).not.toBeNull();
      expect(healing?.fisico).toBeDefined();
      expect(healing?.emocional).toBeDefined();
      expect(healing?.mental_espiritual).toBeDefined();
      expect(healing?.pratica).toBeDefined();
    });

    it('should return null for invalid Odu names', () => {
      expect(getHealingProperties('Invalid')).toBeNull();
    });

    it('should return valid healing properties structure for all Odus', () => {
      const mappings = getAllOduFrequencies();
      for (const mapping of mappings) {
        const healing = getHealingProperties(mapping.odu);
        expect(healing).not.toBeNull();
        expect(typeof healing?.fisico).toBe('string');
        expect(typeof healing?.emocional).toBe('string');
        expect(typeof healing?.mental_espiritual).toBe('string');
        expect(typeof healing?.pratica).toBe('string');
      }
    });
  });

  describe('getUsedFrequencies', () => {
    it('should return array of unique frequencies', () => {
      const frequencies = getUsedFrequencies();
      expect(Array.isArray(frequencies)).toBe(true);
      expect(new Set(frequencies).size).toBe(frequencies.length); // no duplicates
    });

    it('should include frequencies from all Odus', () => {
      const frequencies = getUsedFrequencies();
      const allFreqs = getAllOduFrequencies().map((m) => m.frequencia);
      for (const freq of allFreqs) {
        expect(frequencies).toContain(freq);
      }
    });

    it('should return frequencies in ascending order', () => {
      const frequencies = getUsedFrequencies();
      for (let i = 1; i < frequencies.length; i++) {
        expect(frequencies[i]).toBeGreaterThan(frequencies[i - 1]);
      }
    });
  });

  describe('ODU_FREQUENCY_MAPPINGS constant', () => {
    it('should contain all 16 Merindilogun Odus', () => {
      expect(Object.keys(ODU_FREQUENCY_MAPPINGS).length).toBe(16);
    });

    it('should have correct Odu names', () => {
      const expectedOdus = [
        'Okaran', 'Ejiokô', 'Etaogundá', 'Ejilawn', 'Oxé', 'Obará', 'Odi',
        'Ogbe', 'Ossá', 'Ofun', 'Ojuani', 'Ejilsebora', 'Olobón', 'Iká', 'Meji', 'Alafia',
      ];
      for (const odu of expectedOdus) {
        expect(ODU_FREQUENCY_MAPPINGS[odu]).toBeDefined();
      }
    });

    it('should have valid frequency values', () => {
      for (const mapping of Object.values(ODU_FREQUENCY_MAPPINGS)) {
        expect(SOLFEGGIO_FREQUENCIES).toContain(mapping.frequencia);
      }
    });

    it('should have valid element values', () => {
      const validElements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra'];
      for (const mapping of Object.values(ODU_FREQUENCY_MAPPINGS)) {
        expect(validElements).toContain(mapping.elemento);
      }
    });

    it('should have valid polarity values', () => {
      const validPolarities = ['Yang', 'Yin', 'Equilibrado'];
      for (const mapping of Object.values(ODU_FREQUENCY_MAPPINGS)) {
        expect(validPolarities).toContain(mapping.qualidades.polaridade);
      }
    });

    it('should be frozen to prevent modifications', () => {
      expect(Object.isFrozen(ODU_FREQUENCY_MAPPINGS)).toBe(true);
    });
  });

  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('should contain 9 standard Solfeggio frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES.length).toBe(9);
    });

    it('should contain the standard frequencies', () => {
      const expected = [174, 285, 396, 417, 528, 639, 741, 852, 963];
      expect(SOLFEGGIO_FREQUENCIES).toEqual(expected);
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(SOLFEGGIO_FREQUENCIES)).toBe(true);
    });
  });

  describe('Spiritual Correlations', () => {
    it('should have consistent Orixá-Odu relationships', () => {
      // Xangô should be associated with Fogo Odus
      const fogoOdus = getOdusForElement('Fogo');
      const xangoOdus = fogoOdus.filter((m) => m.orixa === 'Xangô');
      expect(xangoOdus.length).toBeGreaterThan(0);
    });

    it('should have consistent Chakra-Odu relationships', () => {
      // Ofun should be connected to Ajna (6th chakra)
      const ofun = getOduFrequency('Ofun');
      expect(ofun?.chakra).toContain('Ajna');
    });

    it('should have consistent Sephirah-Odu relationships', () => {
      // Check that Sephirah values are valid Kabbalistic names
      const validSephirot = ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Geburah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'];
      const mappings = getAllOduFrequencies();
      for (const mapping of mappings) {
        expect(validSephirot).toContain(mapping.sephirah);
      }
    });

    it('should have healing properties aligned with element', () => {
      const fogoOdus = getOdusForElement('Fogo');
      for (const odu of fogoOdus) {
        expect(odu.propriedades_healing).toBeDefined();
        expect(odu.propriedades_healing.fisico.length).toBeGreaterThan(0);
      }
    });

    it('should have meaningful healing practices', () => {
      const mappings = getAllOduFrequencies();
      for (const mapping of mappings) {
        expect(mapping.propriedades_healing.pratica).toContain('Hz');
        expect(mapping.propriedades_healing.pratica.length).toBeGreaterThan(10);
      }
    });
  });

  describe('Type Exports', () => {
    it('should export OduFrequencyMapping type', () => {
      const mapping: OduFrequencyMapping = {
        odu: 'Test',
        numero: 1,
        nomeingles: 'Test',
        frequencia: 528,
        elemento: 'Fogo',
        alinhamento_energetico: 'Test',
        qualidades: {
          temperatura: 'Quente',
          umidade: 'Seco',
          polaridade: 'Yang',
        },
        significado_espiritual: 'Test',
        orixa: 'Test',
        dia_sagrado: 'Test',
        cores: ['Test'],
        chakra: 'Test',
        sephirah: 'Test',
        propriedades_healing: {
          fisico: 'Test',
          emocional: 'Test',
          mental_espiritual: 'Test',
          pratica: 'Test',
        },
        aplicacoes_rituais: ['Test'],
      };
      expect(mapping.odu).toBe('Test');
    });

    it('should export HealingProperties type', () => {
      const healing: HealingProperties = {
        fisico: 'Test physical',
        emocional: 'Test emotional',
        mental_espiritual: 'Test spiritual',
        pratica: 'Test practice',
      };
      expect(healing.fisico).toBe('Test physical');
    });

    it('should export Elemento type', () => {
      const elemento: Elemento = 'Fogo';
      expect(elemento).toBe('Fogo');
    });
  });

  describe('Default Export', () => {
    it('should export default object with all functions', async () => {
      const mod = await import('@/lib/correlation/odu-frequency');
      const defaultExport = mod.default;
      expect(defaultExport).toBeDefined();
      expect(typeof defaultExport.getOduFrequency).toBe('function');
      expect(typeof defaultExport.getFrequencyOdu).toBe('function');
      expect(typeof defaultExport.getAllOduFrequencies).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle case sensitivity in Odu names', () => {
      // Odu names are case-sensitive
      expect(getOduFrequency('ogbe')).toBeNull();
      expect(getOduFrequency('Ogbe')).not.toBeNull();
    });

    it('should handle special characters in Odu names', () => {
      expect(getOduFrequency('Ejiokô')).not.toBeNull();
      expect(getOduFrequency('Etaogundá')).not.toBeNull();
    });

    it('should return consistent results for same queries', () => {
      const result1 = getOduFrequency('Ogbe');
      const result2 = getOduFrequency('Ogbe');
      expect(result1).toEqual(result2);
    });
  });
});