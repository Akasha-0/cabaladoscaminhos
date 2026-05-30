import { describe, it, expect } from 'vitest';
import { getSignElement, getSignElementType, getSignQuality, getSignNature, getSignRuler, getSignDirection, getSignsByElement, getSignsByQuality, getSignsByRuler, getSignsByDirection, getYangSigns, getYinSigns, getAllSignElements, SIGN_ELEMENT_MAPPINGS } from '@/lib/correlation/sign-element';

describe('correlation/sign-element', () => {
  describe('getSignElement', () => {
    it('returns correct mapping for Áries', () => {
      const result = getSignElement('Áries');
      expect(result?.elemento).toBe('Fogo');
    });

    it('returns correct mapping for Escorpião', () => {
      const result = getSignElement('Escorpião');
      expect(result?.elemento).toBe('Água');
    });

    it('handles case-insensitive input', () => {
      expect(getSignElement('ARIES')?.elemento).toBe('Fogo');
    });

    it('handles accent variations', () => {
      expect(getSignElement('Gemeos')?.elemento).toBe('Ar');
    });

    it('returns null for unknown sign', () => {
      expect(getSignElement('Unknown')).toBeNull();
    });
  });

  describe('getSignsByElement', () => {
    it('returns 3 Fire signs', () => {
      const fire = getSignsByElement('Fogo');
      expect(fire).toHaveLength(3);
      expect(fire).toContain('Áries');
    });

    it('returns3 Earth signs', () => {
      const earth = getSignsByElement('Terra');
      expect(earth).toHaveLength(3);
    });
  });

  describe('getSignsByQuality', () => {
    it('returns 4 Cardinal signs', () => {
      expect(getSignsByQuality('Cardinal')).toHaveLength(4);
    });

    it('returns 4 Fixed signs', () => {
      expect(getSignsByQuality('Fixed')).toHaveLength(4);
    });

    it('returns 4 Mutable signs', () => {
      expect(getSignsByQuality('Mutable')).toHaveLength(4);
    });
  });

  describe('getYangSigns / getYinSigns', () => {
    it('returns 6 Yang signs', () => {
      expect(getYangSigns()).toHaveLength(6);
    });

    it('returns 6 Yin signs', () => {
      expect(getYinSigns()).toHaveLength(6);
    });
  });

  describe('getSignRuler', () => {
    it('returns Marte for Áries', () => {
      expect(getSignRuler('Áries')).toBe('Marte');
    });

    it('returns Sol for Leão', () => {
      expect(getSignRuler('Leão')).toBe('Sol');
    });
  });

  describe('getSignDirection', () => {
    it('returns Sul for Fire signs', () => {
      expect(getSignDirection('Áries')).toBe('Sul');
    });

    it('returns Norte for Earth signs', () => {
      expect(getSignDirection('Touro')).toBe('Norte');
    });
  });

  describe('getSignElementType', () => {
    it('returns correct element', () => {
      expect(getSignElementType('Áries')).toBe('Fogo');
      expect(getSignElementType('Touro')).toBe('Terra');
    });
  });

  describe('getSignQuality', () => {
    it('returns correct quality', () => {
      expect(getSignQuality('Áries')).toBe('Cardinal');
      expect(getSignQuality('Leão')).toBe('Fixed');
    });
  });

  describe('getSignNature', () => {
    it('returns correct polarity', () => {
      expect(getSignNature('Áries')).toBe('Yang');
      expect(getSignNature('Touro')).toBe('Yin');
    });
  });

  describe('getAllSignElements', () => {
    it('returns all 12 signs', () => {
      expect(getAllSignElements()).toHaveLength(12);
    });
  });

  describe('SIGN_ELEMENT_MAPPINGS', () => {
    it('contains all 12 zodiac signs', () => {
      expect(Object.keys(SIGN_ELEMENT_MAPPINGS)).toHaveLength(12);
    });
  });

  describe('getSignsByRuler', () => {
    it('returns signs ruled by Mercúrio', () => {
      const signs = getSignsByRuler('Mercúrio');
      expect(signs).toContain('Gémeos');
    });
  });
});
