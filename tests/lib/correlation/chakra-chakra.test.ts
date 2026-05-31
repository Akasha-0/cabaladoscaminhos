import { describe, it, expect } from 'vitest';
import {
  getChakraChakra,
  getAllChakraPaths,
  getChakraByLevel,
  getAllChakraChakra,
  getPathsByType,
  getChakraByName,
  CHAKRA_CHAKRA_MAPPINGS,
} from '@/lib/correlation/chakra-chakra';

describe('Chakra-Chakra Correlation', () => {
  describe('getChakraChakra', () => {
    it('should return Sushumna mapping between Muladhara and Svadhisthana', () => {
      const result = getChakraChakra('Muladhara', 'Svadhisthana');
      expect(result).not.toBeNull();
      expect(result?.source_chakra).toBe('Muladhara');
      expect(result?.target_chakra).toBe('Svadhisthana');
      expect(result?.path_type).toBe('sushumna');
    });

    it('should return Sushumna mapping between Svadhisthana and Manipura', () => {
      const result = getChakraChakra('Svadhisthana', 'Manipura');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('sushumna');
      expect(result?.energy_flow).toContain('Água para Fogo');
    });

    it('should return Ida mapping for lunar channel between Muladhara and Svadhisthana', () => {
      const result = getChakraChakra('Muladhara', 'Svadhisthana');
      // Get the ida path specifically
      const paths = getAllChakraPaths('Muladhara', 'Svadhisthana');
      const idaPath = paths.find((p) => p.path_type === 'ida');
      expect(idaPath).not.toBeNull();
      expect(idaPath?.spiritual_meaning).toContain('Lunar');
    });

    it('should return Pingala mapping for solar channel between Muladhara and Manipura', () => {
      const paths = getAllChakraPaths('Muladhara', 'Manipura');
      const pingalaPath = paths.find((p) => p.path_type === 'pingala');
      expect(pingalaPath).not.toBeNull();
      expect(pingalaPath?.spiritual_meaning).toContain('Solar');
    });

    it('should return Kundalini full path between Muladhara and Sahasrara', () => {
      const result = getChakraChakra('Muladhara', 'Sahasrara');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('kundalini');
      expect(result?.spiritual_meaning).toContain('Kundalini');
    });

    it('should return null for non-existent path', () => {
      const result = getChakraChakra('Ajna', 'Svadhisthana');
      expect(result).toBeNull();
    });

    it('should handle chakra number format as input', () => {
      const paths = getAllChakraPaths('1º Básico', '2º Sacro');
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('getAllChakraPaths', () => {
    it('should return multiple paths between adjacent chakras', () => {
      const paths = getAllChakraPaths('Muladhara', 'Svadhisthana');
      expect(paths.length).toBeGreaterThanOrEqual(3); // sushumna, ida, direct
    });

    it('should return paths in both directions', () => {
      const paths = getAllChakraPaths('Anahata', 'Vishuddha');
      expect(paths.length).toBeGreaterThanOrEqual(2);
      const pathTypes = paths.map((p) => p.path_type);
      expect(pathTypes).toContain('sushumna');
      expect(pathTypes).toContain('direct');
    });

    it('should return empty array for non-adjacent non-kundalini path', () => {
      const paths = getAllChakraPaths('Muladhara', 'Vishuddha');
      expect(paths.length).toBe(0);
    });
  });

  describe('getChakraByLevel', () => {
    it('should return Muladhara paths for level 1', () => {
      const paths = getChakraByLevel(1);
      expect(paths.length).toBeGreaterThan(0);
      const chakras = paths.flatMap((p) => [p.source_chakra, p.target_chakra]);
      expect(chakras).toContain('Muladhara');
    });

    it('should return Svadhisthana paths for level 2', () => {
      const paths = getChakraByLevel(2);
      expect(paths.length).toBeGreaterThan(0);
      const chakras = paths.flatMap((p) => [p.source_chakra, p.target_chakra]);
      expect(chakras).toContain('Svadhisthana');
    });

    it('should return Sahasrara paths for level 7', () => {
      const paths = getChakraByLevel(7);
      expect(paths.length).toBeGreaterThan(0);
      const chakras = paths.flatMap((p) => [p.source_chakra, p.target_chakra]);
      expect(chakras).toContain('Sahasrara');
    });

    it('should return empty array for invalid level 0', () => {
      const paths = getChakraByLevel(0);
      expect(paths).toHaveLength(0);
    });

    it('should return empty array for invalid level 8', () => {
      const paths = getChakraByLevel(8);
      expect(paths).toHaveLength(0);
    });
  });

  describe('getAllChakraChakra', () => {
    it('should return all chakra-chakra mappings', () => {
      const all = getAllChakraChakra();
      expect(all).toHaveLength(CHAKRA_CHAKRA_MAPPINGS.length);
      expect(all.length).toBeGreaterThan(20);
    });

    it('should contain all path types', () => {
      const all = getAllChakraChakra();
      const pathTypes = [...new Set(all.map((p) => p.path_type))];
      expect(pathTypes).toContain('sushumna');
      expect(pathTypes).toContain('ida');
      expect(pathTypes).toContain('pingala');
      expect(pathTypes).toContain('kundalini');
      expect(pathTypes).toContain('direct');
      expect(pathTypes).toContain('ida_pingala');
    });

    it('should have spiritual meaning for each mapping', () => {
      const all = getAllChakraChakra();
      all.forEach((mapping) => {
        expect(mapping.spiritual_meaning.length).toBeGreaterThan(10);
        expect(mapping.practices.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getPathsByType', () => {
    it('should return only sushumna paths', () => {
      const sushumnaPaths = getPathsByType('sushumna');
      sushumnaPaths.forEach((p) => {
        expect(p.path_type).toBe('sushumna');
      });
      expect(sushumnaPaths.length).toBeGreaterThan(0);
    });

    it('should return only ida paths', () => {
      const idaPaths = getPathsByType('ida');
      idaPaths.forEach((p) => {
        expect(p.path_type).toBe('ida');
      });
      expect(idaPaths.length).toBeGreaterThan(0);
    });

    it('should return only pingala paths', () => {
      const pingalaPaths = getPathsByType('pingala');
      pingalaPaths.forEach((p) => {
        expect(p.path_type).toBe('pingala');
      });
      expect(pingalaPaths.length).toBeGreaterThan(0);
    });

    it('should return only kundalini paths', () => {
      const kundaliniPaths = getPathsByType('kundalini');
      kundaliniPaths.forEach((p) => {
        expect(p.path_type).toBe('kundalini');
      });
      expect(kundaliniPaths.length).toBeGreaterThan(0);
      // Kundalini paths connect Muladhara to Sahasrara
      expect(kundaliniPaths.every((p) => 
        (p.source_chakra === 'Muladhara' && p.target_chakra === 'Sahasrara')
      )).toBe(true);
    });
  });

  describe('getChakraByName', () => {
    it('should return Muladhara for "Muladhara"', () => {
      expect(getChakraByName('Muladhara')).toBe('Muladhara');
    });

    it('should return Svadhisthana for "Svadhisthana"', () => {
      expect(getChakraByName('Svadhisthana')).toBe('Svadhisthana');
    });

    it('should return Manipura for "Manipura"', () => {
      expect(getChakraByName('Manipura')).toBe('Manipura');
    });

    it('should return Anahata for "Anahata"', () => {
      expect(getChakraByName('Anahata')).toBe('Anahata');
    });

    it('should return Vishuddha for "Vishuddha"', () => {
      expect(getChakraByName('Vishuddha')).toBe('Vishuddha');
    });

    it('should return Ajna for "Ajna"', () => {
      expect(getChakraByName('Ajna')).toBe('Ajna');
    });

    it('should return Sahasrara for "Sahasrara"', () => {
      expect(getChakraByName('Sahasrara')).toBe('Sahasrara');
    });

    it('should return Muladhara for "1º Básico"', () => {
      expect(getChakraByName('1º Básico')).toBe('Muladhara');
    });

    it('should return Svadhisthana for "2º Sacro"', () => {
      expect(getChakraByName('2º Sacro')).toBe('Svadhisthana');
    });

    it('should return Manipura for "3º Plexo Solar"', () => {
      expect(getChakraByName('3º Plexo Solar')).toBe('Manipura');
    });

    it('should return Anahata for "4º Cardíaco"', () => {
      expect(getChakraByName('4º Cardíaco')).toBe('Anahata');
    });

    it('should return Vishuddha for "5º Laríngeo"', () => {
      expect(getChakraByName('5º Laríngeo')).toBe('Vishuddha');
    });

    it('should return Ajna for "6º Frontal"', () => {
      expect(getChakraByName('6º Frontal')).toBe('Ajna');
    });

    it('should return Sahasrara for "7º Coronário"', () => {
      expect(getChakraByName('7º Coronário')).toBe('Sahasrara');
    });

    it('should return Muladhara for keyword "raiz"', () => {
      expect(getChakraByName('raiz')).toBe('Muladhara');
    });

    it('should return Svadhisthana for keyword "sacro"', () => {
      expect(getChakraByName('sacro')).toBe('Svadhisthana');
    });

    it('should return Manipura for keyword "plexo"', () => {
      expect(getChakraByName('plexo solar')).toBe('Manipura');
    });

    it('should return Anahata for keyword "cardiaco"', () => {
      expect(getChakraByName('cardíaco')).toBe('Anahata');
    });

    it('should return Vishuddha for keyword "laringeo"', () => {
      expect(getChakraByName('laríngeo')).toBe('Vishuddha');
    });

    it('should return Ajna for keyword "terceiro olho"', () => {
      expect(getChakraByName('terceiro olho')).toBe('Ajna');
    });

    it('should return Sahasrara for keyword "coroa"', () => {
      expect(getChakraByName('coroa')).toBe('Sahasrara');
    });

    it('should return null for unknown chakra', () => {
      expect(getChakraByName('UnknownChakra')).toBeNull();
    });
  });

  describe('CHAKRA_CHAKRA_MAPPINGS constant', () => {
    it('should have complete sushumna path from Muladhara to Sahasrara', () => {
      const sushumna = getPathsByType('sushumna');
      const chakras = ['Muladhara', 'Svadhisthana', 'Manipura', 'Anahata', 'Vishuddha', 'Ajna', 'Sahasrara'];
      
      // Check each adjacent pair has sushumna path
      for (let i = 0; i < chakras.length - 1; i++) {
        const hasPath = sushumna.some(
          (p) =>
            (p.source_chakra === chakras[i] && p.target_chakra === chakras[i + 1])
        );
        expect(hasPath).toBe(true);
      }
    });

    it('should have kundalini paths for full awakening', () => {
      const kundaliniPaths = getPathsByType('kundalini');
      expect(kundaliniPaths.length).toBeGreaterThanOrEqual(3); // sushumna, ida, pingala
    });

    it('should include all three nadis (ida, pingala, sushumna)', () => {
      const all = getAllChakraChakra();
      const pathTypes = all.map((p) => p.path_type);
      
      expect(pathTypes.filter((t) => t === 'ida').length).toBeGreaterThan(0);
      expect(pathTypes.filter((t) => t === 'pingala').length).toBeGreaterThan(0);
      expect(pathTypes.filter((t) => t === 'sushumna').length).toBeGreaterThan(0);
    });

    it('should have spiritual meaning with Kundalini reference', () => {
      const kundaliniPaths = getPathsByType('kundalini');
      kundaliniPaths.forEach((p) => {
        expect(p.spiritual_meaning).toMatch(/kundalini|kundalini shakti/i);
      });
    });

    it('should have practices for each mapping', () => {
      const all = getAllChakraChakra();
      all.forEach((mapping) => {
        expect(mapping.practices.length).toBeGreaterThanOrEqual(1);
        expect(Array.isArray(mapping.practices)).toBe(true);
      });
    });
  });
});