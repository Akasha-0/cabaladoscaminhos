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
  });

  describe('getOdusByElement()', () => {
    it('should filter Odus by element', () => {
      const fogos = getOdusByElement('Fogo');
      expect(fogos.length).toBeGreaterThan(0);
    });
  });

  describe('getOdusByOrixa()', () => {
    it('should filter Odus by Orixá', () => {
      const ogumOdus = getOdusByOrixa('Ogum');
      expect(ogumOdus.length).toBeGreaterThan(0);
    });
  });

  describe('findResonance()', () => {
    it('should find orixa resonance for Odu 1', () => {
      const resonances = findResonance(1, 'orixa');
      expect(resonances).toContain('Exu');
    });
  });

  describe('analyzeOduCompatibility()', () => {
    it('should analyze same-element compatibility', () => {
      const result = analyzeOduCompatibility(1, 1);
      expect(result.elementos).toEqual(['Terra', 'Terra']);
      expect(result.harmonia).toBe(10);
    });
  });

  describe('Zod Validation', () => {
    it('should validate correct OduQuery', () => {
      const result = OduQuerySchema.safeParse({ numero: '5' });
      expect(result.success).toBe(true);
    });
  });
});
