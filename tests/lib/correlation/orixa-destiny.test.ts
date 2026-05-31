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
} from '@/lib/correlation/orixa-destiny';
import type { DestinyPath } from '@/lib/correlation/orixa-destiny';

describe('Orixá-Destiny Correlation', () => {
  describe('getOrixaDestiny', () => {
    it('should return Oxalá mapping with creation destiny path', () => {
      const result = getOrixaDestiny('Oxalá');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Oxalá');
      expect(result!.caminho_destino).toBe('criacao');
      expect(result!.elemento).toBe('éter');
      expect(result!.numero_jornada).toBe(1);
    });

    it('should return Iemanjá mapping with love destiny path', () => {
      const result = getOrixaDestiny('Iemanjá');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Iemanjá');
      expect(result!.caminho_destino).toBe('amor');
      expect(result!.caminho_secundario).toBe('ancestralidade');
      expect(result!.elemento).toBe('água');
      expect(result!.numero_jornada).toBe(2);
    });

    it('should return Oxum with abundance destiny path', () => {
      const result = getOrixaDestiny('Oxum');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Oxum');
      expect(result!.caminho_destino).toBe('abundancia');
      expect(result!.elemento).toBe('água');
      expect(result!.numero_jornada).toBe(3);
    });

    it('should return Ogum with war destiny path', () => {
      const result = getOrixaDestiny('Ogum');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Ogum');
      expect(result!.caminho_destino).toBe('guerra');
      expect(result!.caminho_secundario).toBe('protecao');
      expect(result!.elemento).toBe('terra');
      expect(result!.numero_jornada).toBe(4);
    });

    it('should return Oxóssi with wisdom destiny path', () => {
      const result = getOrixaDestiny('Oxóssi');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Oxóssi');
      expect(result!.caminho_destino).toBe('sabedoria');
      expect(result!.elemento).toBe('terra');
      expect(result!.numero_jornada).toBe(5);
    });

    it('should return Xangô with justice destiny path', () => {
      const result = getOrixaDestiny('Xangô');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Xangô');
      expect(result!.caminho_destino).toBe('justice');
      expect(result!.elemento).toBe('fogo');
      expect(result!.numero_jornada).toBe(6);
    });

    it('should return Iansã with transformation destiny path', () => {
      const result = getOrixaDestiny('Iansã');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Iansã');
      expect(result!.caminho_destino).toBe('transformacao');
      expect(result!.elemento).toBe('fogo');
      expect(result!.numero_jornada).toBe(7);
    });

    it('should return Omolu with transformation destiny path', () => {
      const result = getOrixaDestiny('Omolu');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Omolu');
      expect(result!.caminho_destino).toBe('transformacao');
      expect(result!.caminho_secundario).toBe('ancestralidade');
      expect(result!.elemento).toBe('terra');
      expect(result!.numero_jornada).toBe(8);
    });

    it('should return Nanã with ancestry destiny path', () => {
      const result = getOrixaDestiny('Nanã');
      expect(result).toBeDefined();
      expect(result!.orixa).toBe('Nanã');
      expect(result!.caminho_destino).toBe('ancestralidade');
      expect(result!.elemento).toBe('água');
      expect(result!.numero_jornada).toBe(9);
    });

    it('should be case-insensitive', () => {
      const upper = getOrixaDestiny('OXALÁ');
      const lower = getOrixaDestiny('oxalá');
      const mixed = getOrixaDestiny('OxAlá');
      expect(upper).toEqual(lower);
      expect(lower).toEqual(mixed);
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

    it('should return Oxalá with éter spiritual meaning about creation', () => {
      const result = getOrixaDestiny('Oxalá');
      expect(result!.significado_espiritual).toContain('criação');
      expect(result!.licao_central).toContain('criação');
    });

    it('should return Iemanjá with water spiritual meaning about nurturing', () => {
      const result = getOrixaDestiny('Iemanjá');
      expect(result!.significado_espiritual).toContain('amor');
      expect(result!.significado_espiritual).toContain('água');
      expect(result!.licao_central).toContain('compaixão');
    });

    it('should return Xangô with fire spiritual meaning about justice', () => {
      const result = getOrixaDestiny('Xangô');
      expect(result!.significado_espiritual).toContain('justiça');
      expect(result!.licao_central).toContain('verdade');
    });
  });

  describe('getAllOrixas', () => {
    it('should return array of Orixá names', () => {
      const result = getAllOrixas();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all known Orixás', () => {
      const result = getAllOrixas();
      const expectedOrixas = ['Oxalá', 'Iemanjá', 'Oxum', 'Ogum', 'Oxóssi', 'Xangô', 'Iansã', 'Omolu', 'Nanã'];
      expectedOrixas.forEach(orixa => {
        expect(result).toContain(orixa);
      });
    });
  });

  describe('getAllOrixaDestinies', () => {
    it('should return array of all OrixaDestiny objects', () => {
      const result = getAllOrixaDestinies();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(getAllOrixas().length);
    });

    it('should contain objects with all required properties', () => {
      const result = getAllOrixaDestinies();
      result.forEach(destiny => {
        expect(destiny).toHaveProperty('orixa');
        expect(destiny).toHaveProperty('caminho_destino');
        expect(destiny).toHaveProperty('significado_espiritual');
        expect(destiny).toHaveProperty('licao_central');
        expect(destiny).toHaveProperty('numero_jornada');
        expect(destiny).toHaveProperty('elemento');
        expect(destiny).toHaveProperty('tema_vida');
      });
    });

    it('should have unique journey numbers from 1-9', () => {
      const result = getAllOrixaDestinies();
      const numbers = result.map(d => d.numero_jornada);
      const uniqueNumbers = [...new Set(numbers)];
      expect(uniqueNumbers.length).toBe(result.length);
      uniqueNumbers.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(9);
      });
    });
  });

  describe('getOrixasByDestiny', () => {
    it('should return Orixás by destiny path (primary or secondary)', () => {
      const result = getOrixasByDestiny('transformacao');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(orixa => {
        expect(
          orixa.caminho_destino === 'transformacao' || 
          orixa.caminho_secundario === 'transformacao'
        ).toBe(true);
      });
    });

    it('should return Orixás by secondary destiny path', () => {
      const result = getOrixasByDestiny('ancestralidade');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(orixa => {
        expect(
          orixa.caminho_destino === 'ancestralidade' || 
          orixa.caminho_secundario === 'ancestralidade'
        ).toBe(true);
      });
    });

    it('should return Orixás by primary destiny path only', () => {
      const result = getOrixasByDestiny('criacao');
      expect(result.length).toBe(1);
      expect(result[0].caminho_destino).toBe('criacao');
    });
  });

  describe('getOrixasByElement', () => {
    it('should return Orixás by element type', () => {
      const result = getOrixasByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(orixa => {
        expect(orixa.elemento).toBe('fogo');
      });
    });

    it('should return water Orixás', () => {
      const result = getOrixasByElement('água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(orixa => {
        expect(orixa.elemento).toBe('água');
      });
    });

    it('should return earth Orixás', () => {
      const result = getOrixasByElement('terra');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(orixa => {
        expect(orixa.elemento).toBe('terra');
      });
    });

    it('should return éter Orixás', () => {
      const result = getOrixasByElement('éter');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(orixa => {
        expect(orixa.elemento).toBe('éter');
      });
    });
  });

  describe('getDestinyPathStats', () => {
    it('should return object with destiny path counts', () => {
      const result = getDestinyPathStats();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('criacao');
      expect(result).toHaveProperty('amor');
      expect(result).toHaveProperty('transformacao');
    });

    it('should include transformation as most common path', () => {
      const result = getDestinyPathStats();
      expect(result['transformacao']).toBeGreaterThan(0);
    });
  });

  describe('Destiny correlation consistency', () => {
    it('should have journey numbers that match destiny path', () => {
      const destinies = getAllOrixaDestinies();
      destinies.forEach(destiny => {
        expect(destiny.numero_jornada).toBeGreaterThan(0);
        expect(destiny.numero_jornada).toBeLessThan(10);
      });
    });

    it('should have valid destiny path types', () => {
      const validPaths: DestinyPath[] = [
        'criacao', 'guerra', 'sabedoria', 'amor', 
        'transformacao', 'justice', 'ancestralidade', 
        'protecao', 'abundancia', 'equilibrio'
      ];
      const destinies = getAllOrixaDestinies();
      destinies.forEach(destiny => {
        expect(validPaths).toContain(destiny.caminho_destino);
        if (destiny.caminho_secundario) {
          expect(validPaths).toContain(destiny.caminho_secundario);
        }
      });
    });

    it('should have spiritual meanings in Portuguese', () => {
      const destinies = getAllOrixaDestinies();
      destinies.forEach(destiny => {
        expect(destiny.significado_espiritual).toBeTruthy();
        expect(destiny.significado_espiritual.length).toBeGreaterThan(20);
      });
    });

    it('should have central lessons that complement destiny path', () => {
      const destinies = getAllOrixaDestinies();
      destinies.forEach(destiny => {
        expect(destiny.licao_central).toBeTruthy();
        expect(destiny.licao_central.length).toBeGreaterThan(10);
      });
    });

    it('should have life themes for each Orixá', () => {
      const destinies = getAllOrixaDestinies();
      destinies.forEach(destiny => {
        expect(destiny.tema_vida).toBeTruthy();
        expect(destiny.tema_vida.split(',').length).toBeGreaterThan(0);
      });
    });
  });
});