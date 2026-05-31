/**
 * Unified Odu HyperCorrelationEngine Tests
 * Sprint 315 - FASE 2 Execution
 */

import { describe, it, expect } from 'vitest';
import {
  ODUS_UNIFIED,
  getOdu,
  getAllOdus,
  getOdusByElement,
  getOdusByOrixa,
  getOdusByPlaneta,
  findResonance,
  analyzeOduCompatibility,
  OduSchema,
  OduQuerySchema,
} from '@/lib/odu/HyperCorrelationEngine';

describe('Unified Odu HyperCorrelationEngine', () => {
  describe('ODUS_UNIFIED', () => {
    it('should have all 16 Odus', () => {
      expect(Object.keys(ODUS_UNIFIED).length).toBe(16);
    });

    it('should have valid Odu structure for all entries', () => {
      Object.values(ODUS_UNIFIED).forEach(odu => {
        expect(() => OduSchema.parse(odu)).not.toThrow();
      });
    });

    it('should have Okaran (1) as Terra/Exu', () => {
      const okaran = ODUS_UNIFIED[1];
      expect(okaran.numero).toBe(1);
      expect(okaran.nome).toBe('Okaran');
      expect(okaran.elemento).toBe('Terra');
      expect(okaran.orixa).toBe('Exu');
    });

    it('should have Oxum (16) as Água/Vênus', () => {
      const oxum = ODUS_UNIFIED[16];
      expect(oxum.numero).toBe(16);
      expect(oxum.nome).toBe('Oxum');
      expect(oxum.elemento).toBe('Água');
      expect(oxum.planeta).toBe('Vênus');
    });
  });

  describe('getOdu()', () => {
    it('should return correct Odu by number', () => {
      const odu = getOdu(11);
      expect(odu).toBeDefined();
      expect(odu?.numero).toBe(11);
      expect(odu?.nome).toBe('Ofun');
    });

    it('should return undefined for invalid number', () => {
      expect(getOdu(0)).toBeUndefined();
      expect(getOdu(17)).toBeUndefined();
    });
  });

  describe('getAllOdus()', () => {
    it('should return array of 16 Odus', () => {
      const odus = getAllOdus();
      expect(odus).toHaveLength(16);
    });

    it('should be sorted by numero', () => {
      const odus = getAllOdus();
      for (let i = 1; i < odus.length; i++) {
        expect(odus[i].numero).toBeGreaterThan(odus[i - 1].numero);
      }
    });
  });

  describe('getOdusByElement()', () => {
    it('should filter Odus by element', () => {
      const fogos = getOdusByElement('Fogo');
      expect(fogos.length).toBeGreaterThan(0);
      fogos.forEach(odu => {
        expect(odu.elemento).toBe('Fogo');
      });
    });
  });

  describe('getOdusByOrixa()', () => {
    it('should filter Odus by Orixá', () => {
      const ogumOdus = getOdusByOrixa('Ogum');
      expect(ogumOdus.length).toBeGreaterThan(0);
      ogumOdus.forEach(odu => {
        expect(odu.orixa).toBe('Ogum');
      });
    });
  });

  describe('getOdusByPlaneta()', () => {
    it('should filter Odus by planet', () => {
      const venusOdus = getOdusByPlaneta('Vênus');
      expect(venusOdus.length).toBeGreaterThan(0);
      venusOdus.forEach(odu => {
        expect(odu.planeta).toBe('Vênus');
      });
    });
  });

  describe('findResonance()', () => {
    it('should find orixa resonance for Odu 1', () => {
      const resonances = findResonance(1, 'orixa');
      expect(resonances).toContain('Exu');
    });

    it('should find multiple resonances for Odu 11', () => {
      const orixaRes = findResonance(11, 'orixa');
      expect(orixaRes).toContain('Oxalá');
      
      const planetaRes = findResonance(11, 'planeta');
      expect(planetaRes).toContain('Sol');
    });
  });

  describe('analyzeOduCompatibility()', () => {
    it('should analyze same-element compatibility', () => {
      const result = analyzeOduCompatibility(1, 1);
      expect(result.elementos).toEqual(['Terra', 'Terra']);
      expect(result.harmonia).toBe(10);
    });

    it('should analyze cross-element compatibility', () => {
      const result = analyzeOduCompatibility(1, 2);
      expect(result.elementos).toEqual(['Terra', 'Água']);
      expect(result.harmonia).toBeLessThan(10);
    });
  });

  describe('Zod Validation', () => {
    it('should validate correct OduQuery', () => {
      const result = OduQuerySchema.safeParse({ numero: '5' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid OduQuery', () => {
      const result = OduQuerySchema.safeParse({ numero: '99' });
      expect(result.success).toBe(false);
    });
  });

  describe('Cross-Tradition Correlations', () => {
    it('should have all 4 classical elements represented', () => {
      const odus = getAllOdus();
      const elementos = new Set(odus.map(o => o.elemento));
      expect(elementos.has('Fogo')).toBe(true);
      expect(elementos.has('Água')).toBe(true);
      expect(elementos.has('Terra')).toBe(true);
      expect(elementos.has('Ar')).toBe(true);
    });

    it('should correlate numerology for master number 11', () => {
      const odu11 = getOdu(11);
      expect(odu11?.numerologia).toBe(11);
    });
  });
});
