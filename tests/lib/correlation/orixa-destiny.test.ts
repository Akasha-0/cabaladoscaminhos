/**
 * Orixá-Destiny Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaDestiny,
  getAllOrixas,
  getAllOrixaDestinies,
  getOrixasByDestiny,
  getOrixasByElement,
  getDestinyPathStats,
  type DestinyPath,
} from '@/lib/correlation/orixa-destiny';

describe('Orixá-Destiny Correlation', () => {
  describe('getOrixaDestiny', () => {
    it('should return Oxalá mapping with creation destiny', () => {
      const result = getOrixaDestiny('Oxalá');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.caminho_destino).toBe('criacao');
      expect(result?.numero_jornada).toBe(1);
      expect(result?.elemento).toBe('éter');
      expect(result?.significado_espiritual).toContain('criação');
    });

    it('should return Iemanjá mapping with love destiny', () => {
      const result = getOrixaDestiny('Iemanjá');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.caminho_destino).toBe('amor');
      expect(result?.caminho_secundario).toBe('ancestralidade');
      expect(result?.numero_jornada).toBe(2);
      expect(result?.elemento).toBe('água');
      expect(result?.licao_central).toContain('Nutrir');
    });

    it('should return Oxum with abundance destiny', () => {
      const result = getOrixaDestiny('Oxum');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('abundancia');
      expect(result?.numero_jornada).toBe(3);
      expect(result?.tema_vida).toContain('Prosperidade');
    });

    it('should return Ogum with war destiny', () => {
      const result = getOrixaDestiny('Ogum');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('guerra');
      expect(result?.numero_jornada).toBe(4);
      expect(result?.elemento).toBe('terra');
      expect(result?.licao_central).toContain('coragem');
    });

    it('should return Oxóssi with wisdom destiny', () => {
      const result = getOrixaDestiny('Oxóssi');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('sabedoria');
      expect(result?.numero_jornada).toBe(5);
      expect(result?.tema_vida).toContain('Busca');
    });

    it('should return Xangô with justice destiny', () => {
      const result = getOrixaDestiny('Xangô');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('justice');
      expect(result?.numero_jornada).toBe(6);
      expect(result?.elemento).toBe('fogo');
      expect(result?.licao_central).toContain('justiça');
    });

    it('should return Iansã with transformation destiny', () => {
      const result = getOrixaDestiny('Iansã');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('transformacao');
      expect(result?.caminho_secundario).toBe('guerra');
      expect(result?.numero_jornada).toBe(7);
      expect(result?.tema_vida).toContain('Libertação');
    });

    it('should return Omolu with transformation destiny and earth element', () => {
      const result = getOrixaDestiny('Omolu');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('transformacao');
      expect(result?.numero_jornada).toBe(8);
      expect(result?.elemento).toBe('terra');
      expect(result?.significado_espiritual).toContain('transformar');
    });

    it('should return Nanã with ancestry destiny', () => {
      const result = getOrixaDestiny('Nanã');
      
      expect(result).toBeDefined();
      expect(result?.caminho_destino).toBe('ancestralidade');
      expect(result?.numero_jornada).toBe(9);
      expect(result?.elemento).toBe('água');
      expect(result?.licao_central).toContain('ancestrais');
    });

    it('should be case-insensitive', () => {
      const result = getOrixaDestiny('oxalá');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxalá');
    });

    it('should return undefined for unknown Orixá', () => {
      const result = getOrixaDestiny('UnknownOrixa');
      expect(result).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getOrixaDestiny('Oxalá');
      
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('caminho_destino');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('licao_central');
      expect(result).toHaveProperty('numero_jornada');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('tema_vida');
    });

    it('should include secondary path when available', () => {
      const iemanja = getOrixaDestiny('Iemanjá');
      expect(iemanja?.caminho_secundario).toBe('ancestralidade');
    });

    it('should return Oxalá with éter spiritual meaning about creation', () => {
      const result = getOrixaDestiny('Oxalá');
      expect(result?.significado_espiritual).toContain('criação');
      expect(result?.significado_espiritual).toContain('Oxalá');
    });

    it('should return Iemanjá with water spiritual meaning about nurturing', () => {
      const result = getOrixaDestiny('Iemanjá');
      expect(result?.significado_espiritual).toContain('amor');
      expect(result?.significado_espiritual).toContain('água');
    });

    it('should return Xangô with fire spiritual meaning about justice', () => {
      const result = getOrixaDestiny('Xangô');
      expect(result?.significado_espiritual).toContain('justiça');
      expect(result?.significado_espiritual).toContain('raio');
    });
  });

  describe('getAllOrixas', () => {
    it('should return array of all Orixá names', () => {
      const result = getAllOrixas();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should contain all main Orixás', () => {
      const result = getAllOrixas();
      
      expect(result).toContain('Oxalá');
      expect(result).toContain('Iemanjá');
      expect(result).toContain('Oxum');
      expect(result).toContain('Ogum');
      expect(result).toContain('Oxóssi');
      expect(result).toContain('Xangô');
      expect(result).toContain('Iansã');
      expect(result).toContain('Omolu');
      expect(result).toContain('Nanã');
    });
  });

  describe('getAllOrixaDestinies', () => {
    it('should return array of all OrixaDestiny objects', () => {
      const result = getAllOrixaDestinies();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(9);
    });

    it('should return complete objects with all properties', () => {
      const result = getAllOrixaDestinies();
      
      for (const destiny of result) {
        expect(destiny).toHaveProperty('orixa');
        expect(destiny).toHaveProperty('caminho_destino');
        expect(destiny).toHaveProperty('significado_espiritual');
        expect(destiny).toHaveProperty('licao_central');
        expect(destiny).toHaveProperty('numero_jornada');
        expect(destiny).toHaveProperty('elemento');
        expect(destiny).toHaveProperty('tema_vida');
      }
    });

    it('should have unique Orixá names', () => {
      const result = getAllOrixaDestinies();
      const names = result.map(r => r.orixa);
      const uniqueNames = new Set(names);
      
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('getOrixasByDestiny', () => {
    it('should return transformation Orixás (Iansã, Omolu)', () => {
      const result = getOrixasByDestiny('transformacao');
      
      expect(result.length).toBeGreaterThan(0);
      const orixaNames = result.map(r => r.orixa);
      expect(orixaNames).toContain('Iansã');
      expect(orixaNames).toContain('Omolu');
    });

    it('should return water Orixás for love destiny (Iemanjá)', () => {
      const result = getOrixasByDestiny('amor');
      
      const orixaNames = result.map(r => r.orixa);
      expect(orixaNames).toContain('Iemanjá');
    });

    it('should return abundance Orixás (Oxum, Oxóssi)', () => {
      const result = getOrixasByDestiny('abundancia');
      
      const orixaNames = result.map(r => r.orixa);
      expect(orixaNames).toContain('Oxum');
      expect(orixaNames).toContain('Oxóssi');
    });

    it('should return ancestry Orixás (Nanã, Iemanjá)', () => {
      const result = getOrixasByDestiny('ancestralidade');
      
      const orixaNames = result.map(r => r.orixa);
      expect(orixaNames).toContain('Nanã');
      expect(orixaNames).toContain('Iemanjá');
    });

    it('should return war Orixás (Ogum, Iansã)', () => {
      const result = getOrixasByDestiny('guerra');
      
      const orixaNames = result.map(r => r.orixa);
      expect(orixaNames).toContain('Ogum');
      expect(orixaNames).toContain('Iansã');
    });

    it('should return creation Orixás (Oxalá)', () => {
      const result = getOrixasByDestiny('criacao');
      
      expect(result.length).toBe(1);
      expect(result[0].orixa).toBe('Oxalá');
    });
  });

  describe('getOrixasByElement', () => {
    it('should return fire Orixás (Xangô, Iansã)', () => {
      const result = getOrixasByElement('fogo');
      
      expect(result.length).toBeGreaterThan(0);
      const orixaNames = result.map(r => r.orixa);
      expect(orixaNames).toContain('Xangô');
      expect(orixaNames).toContain('Iansã');
    });

    it('should return water Orixás (Iemanjá, Oxum, Nanã)', () => {
      const result = getOrixasByElement('água');
      
      const orixaNames = result.map(r => r.orixa);
      expect(orixaNames).toContain('Iemanjá');
      expect(orixaNames).toContain('Oxum');
      expect(orixaNames).toContain('Nanã');
    });

    it('should return earth Orixás (Ogum, Oxóssi, Omolu)', () => {
      const result = getOrixasByElement('terra');
      
      const orixaNames = result.map(r => r.orixa);
      expect(orixaNames).toContain('Ogum');
      expect(orixaNames).toContain('Oxóssi');
      expect(orixaNames).toContain('Omolu');
    });

    it('should return éter Orixá (Oxalá)', () => {
      const result = getOrixasByElement('éter');
      
      expect(result.length).toBe(1);
      expect(result[0].orixa).toBe('Oxalá');
    });
  });

  describe('Destiny correlation consistency', () => {
    it('should have consistent element-destiny correlations', () => {
      const waterOrixas = getOrixasByElement('água');
      
      for (const orixa of waterOrixas) {
        expect(['amor', 'abundancia', 'ancestralidade']).toContain(orixa.caminho_destino);
      }
    });

    it('should have ascending journey numbers from 1 to 9', () => {
      const allDestinies = getAllOrixaDestinies();
      const numbers = allDestinies.map(d => d.numero_jornada).sort((a, b) => a - b);
      
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should have unique journey numbers for each Orixá', () => {
      const allDestinies = getAllOrixaDestinies();
      const numbers = allDestinies.map(d => d.numero_jornada);
      const uniqueNumbers = new Set(numbers);
      
      expect(uniqueNumbers.size).toBe(numbers.length);
    });
  });

  describe('getDestinyPathStats', () => {
    it('should return record with all destiny paths', () => {
      const stats = getDestinyPathStats();
      
      expect(stats).toHaveProperty('criacao');
      expect(stats).toHaveProperty('amor');
      expect(stats).toHaveProperty('abundancia');
      expect(stats).toHaveProperty('guerra');
      expect(stats).toHaveProperty('sabedoria');
      expect(stats).toHaveProperty('transformacao');
      expect(stats).toHaveProperty('justice');
      expect(stats).toHaveProperty('ancestralidade');
    });

    it('should have transformation as most common path', () => {
      const stats = getDestinyPathStats();
      
      expect(stats['transformacao']).toBeGreaterThan(stats['criacao']);
      expect(stats['transformacao']).toBeGreaterThan(stats['sabedoria']);
    });

    it('should have at least one Orixá per main destiny path', () => {
      const stats = getDestinyPathStats();
      
      for (const path of Object.keys(stats)) {
        expect(stats[path as DestinyPath]).toBeGreaterThan(0);
      }
    });
  });

  describe('Default export', () => {
    it('should export all required functions', async () => {
      const module = await import('@/lib/correlation/orixa-destiny');
      const defaultExport = module.default;
      
      expect(defaultExport).toHaveProperty('getOrixaDestiny');
      expect(defaultExport).toHaveProperty('getAllOrixas');
      expect(defaultExport).toHaveProperty('getAllOrixaDestinies');
      expect(defaultExport).toHaveProperty('getOrixasByDestiny');
      expect(defaultExport).toHaveProperty('getOrixasByElement');
      expect(defaultExport).toHaveProperty('getDestinyPathStats');
    });
  });
});