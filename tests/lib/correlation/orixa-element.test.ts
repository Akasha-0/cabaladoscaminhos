/**
 * Orixá-Element Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaElement,
  getAllOrixas,
  getOrixasByElement,
  getOrixasByDay,
  getElementOrixa,
  getAllOrixaElements,
} from '@/lib/correlation/orixa-element';

describe('Orixá-Element Correlation', () => {
  describe('getOrixaElement', () => {
    it('should return Oxalá mapping with correct properties', () => {
      const result = getOrixaElement('Oxalá');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.elemento_principal).toBe('éter');
      expect(result?.planeta_regente).toBe('Sol');
      expect(result?.dia_da_semana).toBe('Sexta-feira');
      expect(result?.cores_principais).toContain('Branco');
      expect(result?.ferramentas).toContain('Boldo (Tapete de Oxalá)');
    });

    it('should return Iemanjá mapping with water element', () => {
      const result = getOrixaElement('Iemanjá');
      
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.elemento_principal).toBe('água');
      expect(result?.planeta_regente).toBe('Lua');
      expect(result?.dia_da_semana).toBe('Sábado');
    });

    it('should return Oxum with Vênus as regent planet', () => {
      const result = getOrixaElement('Oxum');
      
      expect(result).toBeDefined();
      expect(result?.planeta_regente).toBe('Vênus');
      expect(result?.cores_principais).toContain('Rosa');
    });

    it('should return Ogum with fire and earth elements', () => {
      const result = getOrixaElement('Ogum');
      
      expect(result).toBeDefined();
      expect(result?.elemento_principal).toBe('terra');
      expect(result?.elementos_secundarios).toContain('fogo');
      expect(result?.planeta_regente).toBe('Marte');
      expect(result?.ferramentas).toContain('Espada-de-são-jorge');
    });

    it('should return Oxóssi with green as primary color', () => {
      const result = getOrixaElement('Oxóssi');
      
      expect(result).toBeDefined();
      expect(result?.elemento_principal).toBe('terra');
      expect(result?.planeta_regente).toBe('Júpiter');
      expect(result?.cores_principais).toContain('Verde');
    });

    it('should return Xangô with fire as primary element', () => {
      const result = getOrixaElement('Xangô');
      
      expect(result).toBeDefined();
      expect(result?.elemento_principal).toBe('fogo');
      expect(result?.planeta_regente).toBe('Sol');
      expect(result?.dia_da_semana).toBe('Quarta-feira');
    });

    it('should return Iansã with Tuesday as day of week', () => {
      const result = getOrixaElement('Iansã');
      
      expect(result).toBeDefined();
      expect(result?.elemento_principal).toBe('fogo');
      expect(result?.planeta_regente).toBe('Urano');
      expect(result?.dia_da_semana).toBe('Terça-feira');
    });

    it('should return Omolu with Saturn as regent planet', () => {
      const result = getOrixaElement('Omolu');
      
      expect(result).toBeDefined();
      expect(result?.elemento_principal).toBe('terra');
      expect(result?.planeta_regente).toBe('Saturno');
      expect(result?.dia_da_semana).toBe('Segunda-feira');
    });

    it('should return Nanã with water element and Saturn', () => {
      const result = getOrixaElement('Nanã');
      
      expect(result).toBeDefined();
      expect(result?.elemento_principal).toBe('água');
      expect(result?.planeta_regente).toBe('Saturno');
      expect(result?.cores_principais).toContain('Lilás');
    });

    it('should be case-insensitive', () => {
      expect(getOrixaElement('oxalá')).toBeDefined();
      expect(getOrixaElement('IEMANJÁ')).toBeDefined();
      expect(getOrixaElement('  Xangô  ')).toBeDefined();
    });

    it('should return undefined for unknown Orixá', () => {
      expect(getOrixaElement('UnknownOrixa')).toBeUndefined();
      expect(getOrixaElement('')).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getOrixaElement('Oxalá');
      
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('elemento_principal');
      expect(result).toHaveProperty('planeta_regente');
      expect(result).toHaveProperty('dia_da_semana');
      expect(result).toHaveProperty('cores_principais');
      expect(result).toHaveProperty('ferramentas');
      expect(Array.isArray(result?.cores_principais)).toBe(true);
      expect(Array.isArray(result?.ferramentas)).toBe(true);
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

  describe('getOrixasByDay', () => {
    it('should return Orixás for Saturday (Oxum, Iemanjá)', () => {
      const result = getOrixasByDay('Sábado');
      
      const orixaNames = result.map(r => r.orixa);
      expect(orixaNames).toContain('Oxum');
      expect(orixaNames).toContain('Iemanjá');
    });

    it('should return Orixás for Tuesday (Ogum, Iansã, Nanã)', () => {
      const result = getOrixasByDay('Terça-feira');
      
      const orixaNames = result.map(r => r.orixa);
      expect(orixaNames).toContain('Ogum');
      expect(orixaNames).toContain('Iansã');
      expect(orixaNames).toContain('Nanã');
    });

    it('should be case-insensitive', () => {
      const result = getOrixasByDay('sábado');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Element correlation consistency', () => {
    it('should have consistent element-planet correlations', () => {
      const fireOrixas = getOrixasByElement('fogo');
      fireOrixas.forEach(orixa => {
        expect(['Sol', 'Marte', 'Urano']).toContain(orixa.planeta_regente);
      });

      const waterOrixas = getOrixasByElement('água');
      waterOrixas.forEach(orixa => {
        expect(['Lua', 'Vênus', 'Saturno']).toContain(orixa.planeta_regente);
      });
    });

    it('should have colors as non-empty arrays', () => {
      const orixas = Object.values(getAllOrixas());
      orixas.forEach(orixaName => {
        const result = getOrixaElement(orixaName);
        expect(result?.cores_principais.length).toBeGreaterThan(0);
      });
    });

    it('should have tools as non-empty arrays', () => {
      const orixas = Object.values(getAllOrixas());
      orixas.forEach(orixaName => {
        const result = getOrixaElement(orixaName);
        expect(result?.ferramentas.length).toBeGreaterThan(0);
      });
    });
  describe('getElementOrixa', () => {
    it('should return mapping of elements to Orixás', () => {
      const result = getElementOrixa();
      
      expect(result).toHaveProperty('fogo');
      expect(result).toHaveProperty('água');
      expect(result).toHaveProperty('terra');
      expect(result).toHaveProperty('éter');
    });

    it('should map fire element to Xangô and Iansã', () => {
      const result = getElementOrixa();
      
      expect(result.fogo).toContain('Xangô');
      expect(result.fogo).toContain('Iansã');
    });

    it('should map water element to Iemanjá, Oxum, and Nanã', () => {
      const result = getElementOrixa();
      
      expect(result.água).toContain('Iemanjá');
      expect(result.água).toContain('Oxum');
      expect(result.água).toContain('Nanã');
    });

    it('should map earth element to Ogum, Oxóssi, and Omolu', () => {
      const result = getElementOrixa();
      
      expect(result.terra).toContain('Ogum');
      expect(result.terra).toContain('Oxóssi');
      expect(result.terra).toContain('Omolu');
    });

    it('should map éter element to Oxalá only', () => {
      const result = getElementOrixa();
      
      expect(result.éter).toContain('Oxalá');
      expect(result.éter.length).toBe(1);
    });
  });

  describe('getAllOrixaElements', () => {
    it('should return array of all Orixá element mappings', () => {
      const result = getAllOrixaElements();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(9);
    });

    it('should include all main Orixás', () => {
      const result = getAllOrixaElements();
      const orixaNames = result.map(r => r.orixa);
      
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

    it('should return full OrixaElement objects', () => {
      const result = getAllOrixaElements();
      
      result.forEach(item => {
        expect(item).toHaveProperty('orixa');
        expect(item).toHaveProperty('elemento_principal');
        expect(item).toHaveProperty('planeta_regente');
        expect(item).toHaveProperty('dia_da_semana');
        expect(item).toHaveProperty('cores_principais');
        expect(item).toHaveProperty('ferramentas');
      });
    });
});