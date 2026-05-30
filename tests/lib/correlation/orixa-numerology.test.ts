/**
 * Orixá-Numerology Correlation Tests
 * Tests the spiritual correlation between Orixás and sacred numbers
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaNumerology,
  getNumerologyOrixa,
  getAllOrixaNumerologies,
  getOrixasByNumber,
  getOrixasByElement,
} from '@/lib/correlation/orixa-numerology';

describe('Orixá Numerology Correlation', () => {
  describe('getOrixaNumerology', () => {
    it('should return Oxalá numerology with sacred number 8', () => {
      const result = getOrixaNumerology('Oxalá');
      expect(result).toBeDefined();
      expect(result?.numero_sagrado).toBe(8);
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.elemento).toBe('éter');
      expect(result?.sephirah).toBe('Hod / Malkuth');
    });

    it('should return Iemanjá numerology with sacred number 4', () => {
      const result = getOrixaNumerology('Iemanjá');
      expect(result).toBeDefined();
      expect(result?.numero_sagrado).toBe(4);
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.elemento).toBe('água');
    });

    it('should return Oxum numerology with sacred number 5', () => {
      const result = getOrixaNumerology('Oxum');
      expect(result).toBeDefined();
      expect(result?.numero_sagrado).toBe(5);
      expect(result?.orixa).toBe('Oxum');
      expect(result?.elemento).toBe('água');
    });

    it('should return Ogum numerology with sacred number 3', () => {
      const result = getOrixaNumerology('Ogum');
      expect(result).toBeDefined();
      expect(result?.numero_sagrado).toBe(3);
      expect(result?.orixa).toBe('Ogum');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Oxóssi numerology with sacred number 4', () => {
      const result = getOrixaNumerology('Oxóssi');
      expect(result).toBeDefined();
      expect(result?.numero_sagrado).toBe(4);
      expect(result?.orixa).toBe('Oxóssi');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Xangô numerology with sacred number 6', () => {
      const result = getOrixaNumerology('Xangô');
      expect(result).toBeDefined();
      expect(result?.numero_sagrado).toBe(6);
      expect(result?.orixa).toBe('Xangô');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Iansã numerology with sacred number 7', () => {
      const result = getOrixaNumerology('Iansã');
      expect(result).toBeDefined();
      expect(result?.numero_sagrado).toBe(7);
      expect(result?.orixa).toBe('Iansã');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Omolu numerology with sacred number 1', () => {
      const result = getOrixaNumerology('Omolu');
      expect(result).toBeDefined();
      expect(result?.numero_sagrado).toBe(1);
      expect(result?.orixa).toBe('Omolu');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Nanã numerology with sacred number 13', () => {
      const result = getOrixaNumerology('Nanã');
      expect(result).toBeDefined();
      expect(result?.numero_sagrado).toBe(13);
      expect(result?.orixa).toBe('Nanã');
      expect(result?.elemento).toBe('água');
    });

    it('should return Exu numerology with sacred number 1', () => {
      const result = getOrixaNumerology('Exu');
      expect(result).toBeDefined();
      expect(result?.numero_sagrado).toBe(1);
      expect(result?.orixa).toBe('Exu');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Orunmilá numerology with sacred number 11', () => {
      const result = getOrixaNumerology('Orunmilá');
      expect(result).toBeDefined();
      expect(result?.numero_sagrado).toBe(11);
      expect(result?.orixa).toBe('Orunmilá');
      expect(result?.elemento).toBe('éter');
    });

    it('should perform case-insensitive lookup', () => {
      expect(getOrixaNumerology('oxalá')?.numero_sagrado).toBe(8);
      expect(getOrixaNumerology('XANGÔ')?.numero_sagrado).toBe(6);
      expect(getOrixaNumerology('iEmAnJÁ')?.numero_sagrado).toBe(4);
    });

    it('should handle accented characters', () => {
      expect(getOrixaNumerology('Oxôssi')?.numero_sagrado).toBe(4);
    });

    it('should return undefined for unknown Orixá', () => {
      expect(getOrixaNumerology('UnknownOrixá')).toBeUndefined();
    });
  });

  describe('getNumerologyOrixa', () => {
    it('should return a record of numbers to Orixás', () => {
      const result = getNumerologyOrixa();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should group Oxalá and Exu with their sacred numbers', () => {
      const result = getNumerologyOrixa();
      expect(result[8]?.some(o => o.orixa === 'Oxalá')).toBe(true);
      expect(result[1]?.some(o => o.orixa === 'Exu')).toBe(true);
    });

    it('should contain number 1 with both Exu and Omolu', () => {
      const result = getNumerologyOrixa();
      const num1 = result[1];
      expect(num1).toBeDefined();
      expect(num1?.length).toBeGreaterThanOrEqual(2);
      expect(num1?.some(o => o.orixa === 'Exu')).toBe(true);
      expect(num1?.some(o => o.orixa === 'Omolu')).toBe(true);
    });

    it('should contain all sacred numbers 1-13', () => {
      const result = getNumerologyOrixa();
      const keys = Object.keys(result).map(Number).sort((a, b) => a - b);
      expect(keys).toContain(1);
      expect(keys).toContain(4);
      expect(keys).toContain(5);
      expect(keys).toContain(6);
      expect(keys).toContain(7);
      expect(keys).toContain(8);
      expect(keys).toContain(11);
      expect(keys).toContain(13);
    });
  });

  describe('getAllOrixaNumerologies', () => {
    it('should return an array of all Orixá numerologies', () => {
      const result = getAllOrixaNumerologies();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(10);
    });

    it('should contain all main Orixás', () => {
      const result = getAllOrixaNumerologies();
      const orixas = result.map(o => o.orixa);
      expect(orixas).toContain('Oxalá');
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Oxóssi');
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Iansã');
      expect(orixas).toContain('Omolu');
      expect(orixas).toContain('Nanã');
      expect(orixas).toContain('Exu');
    });

    it('should include meaning and elemental connection for each', () => {
      const result = getAllOrixaNumerologies();
      for (const orixa of result) {
        expect(orixa.significado_numerologico).toBeDefined();
        expect(orixa.significado_numerologico.length).toBeGreaterThan(10);
        expect(orixa.elemento).toMatch(/^(fogo|água|ar|terra|éter)$/);
        expect(orixa.sephirah).toBeDefined();
        expect(orixa.planeta_regente).toBeDefined();
        expect(orixa.energia_numerica).toBeDefined();
      }
    });
  });

  describe('getOrixasByNumber', () => {
    it('should return Orixás with sacred number 1', () => {
      const result = getOrixasByNumber(1);
      expect(result.length).toBe(2);
      expect(result.map(o => o.orixa).sort()).toEqual(['Exu', 'Omolu']);
    });

    it('should return Orixás with sacred number 4', () => {
      const result = getOrixasByNumber(4);
      expect(result.length).toBe(2);
      expect(result.map(o => o.orixa).sort()).toEqual(['Iemanjá', 'Oxóssi']);
    });

    it('should return Oxalá for sacred number 8', () => {
      const result = getOrixasByNumber(8);
      expect(result.length).toBe(1);
      expect(result[0].orixa).toBe('Oxalá');
    });

    it('should return empty array for non-existent number', () => {
      const result = getOrixasByNumber(99);
      expect(result).toEqual([]);
    });
  });

  describe('getOrixasByElement', () => {
    it('should return Orixás with água element', () => {
      const result = getOrixasByElement('água');
      expect(result.length).toBeGreaterThanOrEqual(4);
      const orixas = result.map(o => o.orixa);
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Oxum');
      expect(orixas).toContain('Nanã');
    });

    it('should return Orixás with fogo element', () => {
      const result = getOrixasByElement('fogo');
      expect(result.length).toBeGreaterThanOrEqual(3);
      const orixas = result.map(o => o.orixa);
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Iansã');
      expect(orixas).toContain('Exu');
    });

    it('should return Orixás with terra element', () => {
      const result = getOrixasByElement('terra');
      expect(result.length).toBeGreaterThanOrEqual(2);
      const orixas = result.map(o => o.orixa);
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Omolu');
    });

    it('should return Orixás with éter element', () => {
      const result = getOrixasByElement('éter');
      expect(result.length).toBe(2);
      const orixas = result.map(o => o.orixa);
      expect(orixas).toContain('Oxalá');
      expect(orixas).toContain('Orunmilá');
    });

    it('should return empty array for unknown element', () => {
      const result = getOrixasByElement('unknown' as any);
      expect(result).toEqual([]);
    });
  });

  describe('Spiritual Correlations Integrity', () => {
    it('should have valid Odú associations', () => {
      const all = getAllOrixaNumerologies();
      for (const orixa of all) {
        expect(orixa.odu_associado).toMatch(/^(Okaran|Ejiokô|Etaogundá|Irosun|Oxé|Obará|Odi|EjiOníle|Ossá|Ofun|Alafia|Ejilsebora|Olobón|Iká|Ogbogbé)/);
      }
    });

    it('should have aligned planets with orixa-element.ts', () => {
      // Oxalá should be ruled by Sol
      const oxala = getOrixaNumerology('Oxalá');
      expect(oxala?.planeta_regente).toBe('Sol');

      // Iemanjá should be ruled by Lua
      const iemanja = getOrixaNumerology('Iemanjá');
      expect(iemanja?.planeta_regente).toBe('Lua');

      // Xangô should be ruled by Sol
      const xango = getOrixaNumerology('Xangô');
      expect(xango?.planeta_regente).toBe('Sol');
    });
  });
});