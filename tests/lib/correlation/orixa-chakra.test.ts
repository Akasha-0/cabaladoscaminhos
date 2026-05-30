/**
 * Orixá-Chakra Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaChakra,
  getChakraOrixa,
  getAllOrixaChakras,
  getOrixasByChakra,
} from '@/lib/correlation/orixa-chakra';

describe('Orixá-Chakra Correlation', () => {
  describe('getOrixaChakra', () => {
    it('should return Oxalá mapping with Sahasrara (7º Coronário) as primary chakra', () => {
      const result = getOrixaChakra('Oxalá');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.chakra_primario).toBe('Sahasrara');
      expect(result?.chakra_secundario).toBeNull();
      expect(result?.elemento_alinhamento).toBe('Éter');
    });

    it('should return Iemanjá mapping with Ajna (6º Frontal) as primary chakra', () => {
      const result = getOrixaChakra('Iemanjá');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.chakra_primario).toBe('Ajna');
      expect(result?.chakra_secundario).toBe('Anahata');
      expect(result?.elemento_alinhamento).toBe('Água');
    });

    it('should return Oxum mapping with Anahata (4º Cardíaco) as primary chakra', () => {
      const result = getOrixaChakra('Oxum');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxum');
      expect(result?.chakra_primario).toBe('Anahata');
      expect(result?.chakra_secundario).toBe('Ajna');
      expect(result?.elemento_alinhamento).toBe('Água');
    });

    it('should return Ogum mapping with Vishuddha (5º Laríngeo) as primary chakra', () => {
      const result = getOrixaChakra('Ogum');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Ogum');
      expect(result?.chakra_primario).toBe('Vishuddha');
      expect(result?.chakra_secundario).toBe('Manipura');
      expect(result?.elemento_alinhamento).toBe('Terra');
    });

    it('should return Oxóssi mapping with Anahata (4º Cardíaco) as primary chakra', () => {
      const result = getOrixaChakra('Oxóssi');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxóssi');
      expect(result?.chakra_primario).toBe('Anahata');
      expect(result?.chakra_secundario).toBe('Sahasrara');
      expect(result?.elemento_alinhamento).toBe('Terra');
    });

    it('should return Xangô mapping with Manipura (3º Plexo Solar) as primary chakra', () => {
      const result = getOrixaChakra('Xangô');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Xangô');
      expect(result?.chakra_primario).toBe('Manipura');
      expect(result?.chakra_secundario).toBe('Svadhisthana');
      expect(result?.elemento_alinhamento).toBe('Fogo');
    });

    it('should return Iansã mapping with Svadhisthana (2º Sacro) as primary chakra', () => {
      const result = getOrixaChakra('Iansã');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iansã');
      expect(result?.chakra_primario).toBe('Svadhisthana');
      expect(result?.chakra_secundario).toBe('Manipura');
      expect(result?.elemento_alinhamento).toBe('Fogo');
    });

    it('should return Omolu mapping with Muladhara (1º Básico) as primary chakra', () => {
      const result = getOrixaChakra('Omolu');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Omolu');
      expect(result?.chakra_primario).toBe('Muladhara');
      expect(result?.chakra_secundario).toBeNull();
      expect(result?.elemento_alinhamento).toBe('Terra');
    });

    it('should return Nanã mapping with Muladhara (1º Básico) as primary chakra', () => {
      const result = getOrixaChakra('Nanã');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Nanã');
      expect(result?.chakra_primario).toBe('Muladhara');
      expect(result?.chakra_secundario).toBe('Ajna');
      expect(result?.elemento_alinhamento).toBe('Água');
    });

    it('should be case-insensitive', () => {
      expect(getOrixaChakra('oxalá')?.orixa).toBe('Oxalá');
      expect(getOrixaChakra('OXALÁ')?.orixa).toBe('Oxalá');
      expect(getOrixaChakra('xangô')?.orixa).toBe('Xangô');
    });

    it('should return undefined for unknown Orixá', () => {
      expect(getOrixaChakra('Unknown Orixá')).toBeUndefined();
      expect(getOrixaChakra('')).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getOrixaChakra('Oxalá');
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('chakra_primario');
      expect(result).toHaveProperty('chakra_secundario');
      expect(result).toHaveProperty('elemento_alinhamento');
      expect(result).toHaveProperty('praticas_espirituais');
      expect(result?.praticas_espirituais).toHaveProperty('tipo');
      expect(result?.praticas_espirituais).toHaveProperty('descricao');
      expect(result?.praticas_espirituais).toHaveProperty('mantras');
      expect(result?.praticas_espirituais).toHaveProperty('erivas');
    });

    it('should include spiritual practices with mantras and herbs', () => {
      const result = getOrixaChakra('Xangô');
      expect(result?.praticas_espirituais.mantras).toContain('RAM (528 Hz)');
      expect(result?.praticas_espirituais.erivas).toContain('Quebra-pedra');
    });
  });

  describe('getChakraOrixa', () => {
    it('should return all seven chakras in the mapping', () => {
      const result = getChakraOrixa();
      expect(result).toHaveProperty('Muladhara');
      expect(result).toHaveProperty('Svadhisthana');
      expect(result).toHaveProperty('Manipura');
      expect(result).toHaveProperty('Anahata');
      expect(result).toHaveProperty('Vishuddha');
      expect(result).toHaveProperty('Ajna');
      expect(result).toHaveProperty('Sahasrara');
    });

    it('should associate Muladhara with Omolu and Nanã', () => {
      const result = getChakraOrixa();
      expect(result.Muladhara).toContain('Omolu');
      expect(result.Muladhara).toContain('Nanã');
    });

    it('should associate Svadhisthana with Iansã', () => {
      const result = getChakraOrixa();
      expect(result.Svadhisthana).toContain('Iansã');
    });

    it('should associate Manipura with Xangô', () => {
      const result = getChakraOrixa();
      expect(result.Manipura).toContain('Xangô');
    });

    it('should associate Anahata with Oxum and Oxóssi', () => {
      const result = getChakraOrixa();
      expect(result.Anahata).toContain('Oxum');
      expect(result.Anahata).toContain('Oxóssi');
    });

    it('should associate Vishuddha with Ogum', () => {
      const result = getChakraOrixa();
      expect(result.Vishuddha).toContain('Ogum');
    });

    it('should associate Ajna with Iemanjá, Oxum, and Nanã', () => {
      const result = getChakraOrixa();
      expect(result.Ajna).toContain('Iemanjá');
      expect(result.Ajna).toContain('Oxum');
      expect(result.Ajna).toContain('Nanã');
    });

    it('should associate Sahasrara with Oxalá and Oxóssi', () => {
      const result = getChakraOrixa();
      expect(result.Sahasrara).toContain('Oxalá');
      expect(result.Sahasrara).toContain('Oxóssi');
    });
  });

  describe('getAllOrixaChakras', () => {
    it('should return an array of all Orixá-chakra mappings', () => {
      const result = getAllOrixaChakras();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return all 9 major Orixás', () => {
      const result = getAllOrixaChakras();
      const orixaNames = result.map((m) => m.orixa);
      expect(orixaNames).toContain('Oxalá');
      expect(orixaNames).toContain('Iemanjá');
      expect(orixaNames).toContain('Oxum');
      expect(orixaNames).toContain('Ogum');
      expect(orixaNames).toContain('Oxóssi');
      expect(orixaNames).toContain('Xangô');
      expect(orixaNames).toContain('Iansã');
      expect(orixaNames).toContain('Omolu');
      expect(orixaNames).toContain('Nanã');
    });

    it('should return objects with complete structure', () => {
      const result = getAllOrixaChakras();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('chakra_primario');
        expect(mapping).toHaveProperty('chakra_secundario');
        expect(mapping).toHaveProperty('elemento_alinhamento');
        expect(mapping).toHaveProperty('praticas_espirituais');
      }
    });
  });

  describe('getOrixasByChakra', () => {
    it('should return Orixás associated with Muladhara', () => {
      const result = getOrixasByChakra('Muladhara');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map((m) => m.orixa)).toContain('Omolu');
    });

    it('should accept chakra number format as input', () => {
      const result = getOrixasByChakra('1º Básico');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map((m) => m.orixa)).toContain('Omolu');
    });

    it('should return empty array for unknown chakra', () => {
      const result = getOrixasByChakra('Unknown Chakra');
      expect(result).toEqual([]);
    });
  });

  describe('Element alignment consistency', () => {
    it('should align Oxalá with Éter element', () => {
      const result = getOrixaChakra('Oxalá');
      expect(result?.elemento_alinhamento).toBe('Éter');
    });

    it('should align Iemanjá and Oxum with Água element', () => {
      expect(getOrixaChakra('Iemanjá')?.elemento_alinhamento).toBe('Água');
      expect(getOrixaChakra('Oxum')?.elemento_alinhamento).toBe('Água');
    });

    it('should align Xangô and Iansã with Fogo element', () => {
      expect(getOrixaChakra('Xangô')?.elemento_alinhamento).toBe('Fogo');
      expect(getOrixaChakra('Iansã')?.elemento_alinhamento).toBe('Fogo');
    });

    it('should align Ogum, Oxóssi, and Omolu with Terra element', () => {
      expect(getOrixaChakra('Ogum')?.elemento_alinhamento).toBe('Terra');
      expect(getOrixaChakra('Oxóssi')?.elemento_alinhamento).toBe('Terra');
      expect(getOrixaChakra('Omolu')?.elemento_alinhamento).toBe('Terra');
    });
  });
});
