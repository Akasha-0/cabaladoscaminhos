import { describe, it, expect } from 'vitest';
import {
  getElementSephirot,
  getSephirotElement,
  getAllElementSephiroths,
  getSephirahByElement,
  getElementBySephirah,
  getChakraByElement,
  getSignificadoByElement,
  getQualidadesByElement,
  getOrixaByElement,
  getColorByElement,
  getDirectionByElement,
  getAllElementTypes,
  ELEMENT_SEPHIROT_MAP,
} from '@/lib/correlation/element-sephirot';

describe('correlation/element-sephirot', () => {
  describe('getElementSephirot', () => {
    it('returns mapping for fogo', () => {
      const result = getElementSephirot('fogo');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('fogo');
      expect(result?.sephirah).toBe('Gevurah');
    });

    it('returns mapping for água with accent', () => {
      const result = getElementSephirot('água');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('água');
      expect(result?.sephirah).toBe('Binah');
    });

    it('returns mapping for terra', () => {
      const result = getElementSephirot('terra');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('terra');
      expect(result?.sephirah).toBe('Malkhut');
    });

    it('returns mapping for ar', () => {
      const result = getElementSephirot('ar');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('ar');
      expect(result?.sephirah).toBe('Tiferet');
    });

    it('returns mapping for éter with accent', () => {
      const result = getElementSephirot('éter');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('éter');
      expect(result?.sephirah).toBe('Keter');
    });

    it('returns undefined for unknown element', () => {
      const result = getElementSephirot('unknown');
      expect(result).toBeUndefined();
    });

    it('handles case insensitivity', () => {
      const result = getElementSephirot('FOGO');
      expect(result).toBeDefined();
      expect(result?.elemento).toBe('fogo');
    });
  });

  describe('getSephirotElement', () => {
    it('returns reverse mapping for all sephiroth', () => {
      const map = getSephirotElement();
      expect(map['Keter']).toBe('éter');
      expect(map['Gevurah']).toBe('fogo');
      expect(map['Binah']).toBe('água');
      expect(map['Malkhut']).toBe('terra');
      expect(map['Tiferet']).toBe('ar');
    });

    it('contains 10 sephiroth entries', () => {
      const map = getSephirotElement();
      expect(Object.keys(map)).toHaveLength(10);
    });
  });

  describe('getAllElementSephiroths', () => {
    it('returns array of all 5 mappings', () => {
      const result = getAllElementSephiroths();
      expect(result).toHaveLength(5);
    });

    it('each mapping has required fields', () => {
      const result = getAllElementSephiroths();
      result.forEach((mapping) => {
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.elemento_nome).toBeTruthy();
        expect(mapping.sephirah).toBeTruthy();
        expect(mapping.chakra).toBeTruthy();
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(mapping.qualidades).toBeTruthy();
      });
    });

    it('mappings match constants', () => {
      const result = getAllElementSephiroths();
      const mapKeys = Object.keys(ELEMENT_SEPHIROT_MAP);
      expect(result.map((r) => r.elemento).sort()).toEqual(mapKeys.sort());
    });
  });

  describe('getSephirahByElement', () => {
    it('returns sephirah name for fogo', () => {
      const result = getSephirahByElement('fogo');
      expect(result).toBe('Gevurah');
    });

    it('returns sephirah name for água', () => {
      const result = getSephirahByElement('água');
      expect(result).toBe('Binah');
    });

    it('returns sephirah name for terra', () => {
      const result = getSephirahByElement('terra');
      expect(result).toBe('Malkhut');
    });

    it('returns sephirah name for ar', () => {
      const result = getSephirahByElement('ar');
      expect(result).toBe('Tiferet');
    });

    it('returns sephirah name for éter', () => {
      const result = getSephirahByElement('éter');
      expect(result).toBe('Keter');
    });

    it('returns null for unknown element', () => {
      const result = getSephirahByElement('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getElementBySephirah', () => {
    it('returns element for Gevurah', () => {
      const result = getElementBySephirah('Gevurah');
      expect(result).toBe('fogo');
    });

    it('returns element for Binah', () => {
      const result = getElementBySephirah('Binah');
      expect(result).toBe('água');
    });

    it('returns element for Malkhut', () => {
      const result = getElementBySephirah('Malkhut');
      expect(result).toBe('terra');
    });

    it('returns element for Tiferet', () => {
      const result = getElementBySephirah('Tiferet');
      expect(result).toBe('ar');
    });

    it('returns element for Keter', () => {
      const result = getElementBySephirah('Keter');
      expect(result).toBe('éter');
    });

    it('returns null for unknown sephirah', () => {
      const result = getElementBySephirah('Unknown');
      expect(result).toBeNull();
    });
  });

  describe('getChakraByElement', () => {
    it('returns chakra for fogo', () => {
      const result = getChakraByElement('fogo');
      expect(result).toBe('3º Plexo Solar (Manipura)');
    });

    it('returns chakra for água', () => {
      const result = getChakraByElement('água');
      expect(result).toBe('2º Sacro (Svadhisthana)');
    });

    it('returns chakra for terra', () => {
      const result = getChakraByElement('terra');
      expect(result).toBe('1º Básico (Muladhara)');
    });

    it('returns chakra for ar', () => {
      const result = getChakraByElement('ar');
      expect(result).toBe('4º Cardíaco (Anahata)');
    });

    it('returns chakra for éter', () => {
      const result = getChakraByElement('éter');
      expect(result).toBe('7º Coronário (Sahasrara)');
    });
  });

  describe('getSignificadoByElement', () => {
    it('returns spiritual meaning for fogo', () => {
      const result = getSignificadoByElement('fogo');
      expect(result).toBeDefined();
      expect(result?.core).toBeTruthy();
      expect(result?.qualidade_divina).toBeTruthy();
      expect(result?.licao).toBeTruthy();
      expect(result?.afirmacao).toBeTruthy();
    });

    it('returns null for unknown element', () => {
      const result = getSignificadoByElement('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getQualidadesByElement', () => {
    it('returns qualities for fogo', () => {
      const result = getQualidadesByElement('fogo');
      expect(result).toBeDefined();
      expect(result?.forca).toBeTruthy();
      expect(result?.desafio).toBeTruthy();
      expect(result?.licao_vida).toBeTruthy();
      expect(result?.afirmacao_espiritual).toBeTruthy();
    });

    it('returns null for unknown element', () => {
      const result = getQualidadesByElement('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getOrixaByElement', () => {
    it('returns orixá for fogo', () => {
      const result = getOrixaByElement('fogo');
      expect(result).toBe('Xangô');
    });

    it('returns orixá for água', () => {
      const result = getOrixaByElement('água');
      expect(result).toBe('Iemanjá');
    });

    it('returns orixá for terra', () => {
      const result = getOrixaByElement('terra');
      expect(result).toBe('Oxóssi');
    });

    it('returns orixá for ar', () => {
      const result = getOrixaByElement('ar');
      expect(result).toBe('Iansã');
    });

    it('returns orixá for éter', () => {
      const result = getOrixaByElement('éter');
      expect(result).toBe('Oxalá');
    });
  });

  describe('getColorByElement', () => {
    it('returns cor for fogo', () => {
      const result = getColorByElement('fogo');
      expect(result).toBe('Vermelho');
    });

    it('returns cor for água', () => {
      const result = getColorByElement('água');
      expect(result).toBe('Azul');
    });

    it('returns cor for terra', () => {
      const result = getColorByElement('terra');
      expect(result).toBe('Verde');
    });

    it('returns cor for ar', () => {
      const result = getColorByElement('ar');
      expect(result).toBe('Amarelo');
    });

    it('returns cor for éter', () => {
      const result = getColorByElement('éter');
      expect(result).toBe('Branco-dourado');
    });
  });

  describe('getDirectionByElement', () => {
    it('returns direction for fogo', () => {
      const result = getDirectionByElement('fogo');
      expect(result).toBe('Sul');
    });

    it('returns direction for água', () => {
      const result = getDirectionByElement('água');
      expect(result).toBe('Oeste');
    });

    it('returns direction for terra', () => {
      const result = getDirectionByElement('terra');
      expect(result).toBe('Norte');
    });

    it('returns direction for ar', () => {
      const result = getDirectionByElement('ar');
      expect(result).toBe('Leste');
    });

    it('returns direction for éter', () => {
      const result = getDirectionByElement('éter');
      expect(result).toBe('Centro');
    });
  });

  describe('getAllElementTypes', () => {
    it('returns array of all 5 element types', () => {
      const result = getAllElementTypes();
      expect(result).toHaveLength(5);
      expect(result).toContain('fogo');
      expect(result).toContain('água');
      expect(result).toContain('terra');
      expect(result).toContain('ar');
      expect(result).toContain('éter');
    });
  });

  describe('ELEMENT_SEPHIROT_MAP constant', () => {
    it('contains all 5 elements', () => {
      expect(Object.keys(ELEMENT_SEPHIROT_MAP)).toHaveLength(5);
    });

    it('each element has valid sephirah', () => {
      const sephirot = ['Keter', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkhut'];
      Object.values(ELEMENT_SEPHIROT_MAP).forEach((mapping) => {
        expect(sephirot).toContain(mapping.sephirah);
      });
    });

    it('mappings are frozen', () => {
      expect(Object.isFrozen(ELEMENT_SEPHIROT_MAP)).toBe(true);
    });
  });
});

