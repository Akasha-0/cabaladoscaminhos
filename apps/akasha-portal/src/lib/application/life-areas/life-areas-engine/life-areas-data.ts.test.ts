import { describe, it, expect } from 'vitest';
import { LIFE_AREAS } from './life-areas-data';
import type { LifeAreaId } from './types';

describe('life-areas-data', () => {
  describe('LIFE_AREAS record', () => {
    it('should have exactly 12 entries', () => {
      expect(Object.keys(LIFE_AREAS)).toHaveLength(12);
    });

    it('each area should have required top-level fields', () => {
      for (const area of Object.values(LIFE_AREAS)) {
        expect(area).toHaveProperty('id');
        expect(area).toHaveProperty('name');
        expect(area).toHaveProperty('nameEnglish');
        expect(area).toHaveProperty('description');
        expect(area).toHaveProperty('emoji');
        expect(area).toHaveProperty('color');
        expect(area).toHaveProperty('gradient');
        expect(area).toHaveProperty('icon');
      }
    });

    it('each area should have required astrology, chakra, element fields when defined', () => {
      for (const area of Object.values(LIFE_AREAS)) {
        expect(area.astrology).toBeDefined();
        expect(area.astrology.planets).toBeDefined();
        expect(Array.isArray(area.astrology.planets)).toBe(true);

        // chakra and element are optional in the LifeArea interface
        if (area.chakra) {
          expect(area.chakra.primary).toBeDefined();
          expect(Array.isArray(area.chakra.primary)).toBe(true);
        }

        if (area.element) {
          expect(area.element.primary).toBeDefined();
          expect(typeof area.element.primary).toBe('string');
        }
      }
    });

    // Edge case: not all areas have numerology, odu, orixa defined
    it('areas with odu should have valid structure', () => {
      for (const area of Object.values(LIFE_AREAS)) {
        if (area.odu) {
          expect(Array.isArray(area.odu.primaryOdus)).toBe(true);
        }
      }
    });

    it('areas with orixa should have valid structure', () => {
      for (const area of Object.values(LIFE_AREAS)) {
        if (area.orixa) {
          expect(Array.isArray(area.orixa.primary)).toBe(true);
        }
      }
    });

    it('each area should have questions, practices, crystals, affirmations arrays', () => {
      for (const area of Object.values(LIFE_AREAS)) {
        expect(Array.isArray(area.questions)).toBe(true);
        expect(Array.isArray(area.practices)).toBe(true);
        expect(Array.isArray(area.crystals)).toBe(true);
        expect(Array.isArray(area.affirmations)).toBe(true);
      }
    });

    // Edge case: color should be valid hex
    it('each area should have a valid hex color', () => {
      for (const area of Object.values(LIFE_AREAS)) {
        expect(area.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });

    // Edge case: emoji should be a single emoji character
    it('each area should have a single emoji character', () => {
      for (const area of Object.values(LIFE_AREAS)) {
        const emojiLength = [...area.emoji].length;
        expect(emojiLength).toBe(1);
      }
    });
  });

  describe('specific life areas', () => {
    it('proposito should reference Sol and Júpiter in astrology', () => {
      const area = LIFE_AREAS.proposito;
      expect(area.astrology.planets).toContain('Sol');
      expect(area.astrology.planets).toContain('Júpiter');
    });

    it('financas should have Oxum as primary orixa', () => {
      const area = LIFE_AREAS.financas;
      expect(area.orixa.primary).toContain('Oxum');
    });

    it('carreira should have career-related questions', () => {
      const area = LIFE_AREAS.carreira;
      expect(area.questions.length).toBeGreaterThan(0);
    });

    it('all areas should have at least one affirmation', () => {
      for (const area of Object.values(LIFE_AREAS)) {
        expect(area.affirmations.length).toBeGreaterThan(0);
      }
    });

    it('all areas should have at least one crystal', () => {
      for (const area of Object.values(LIFE_AREAS)) {
        expect(area.crystals.length).toBeGreaterThan(0);
      }
    });

    it('each area id should match its key in the record', () => {
      for (const [key, area] of Object.entries(LIFE_AREAS)) {
        expect(area.id).toBe(key);
      }
    });
  });

  describe('gradient format', () => {
    it('should have a from- and to- color in gradient', () => {
      for (const area of Object.values(LIFE_AREAS)) {
        expect(area.gradient).toContain('from-');
        expect(area.gradient).toContain('to-');
      }
    });
  });

  describe('LifeAreaId coverage', () => {
    const expectedIds: LifeAreaId[] = [
      'proposito',
      'carreira',
      'financas',
      'saude',
      'relacionamentos',
      'sexualidade',
      'familia',
      'espiritualidade',
      'criatividade',
      'amizades',
      'conhecimento',
      'autoconhecimento',
    ];

    it.each(expectedIds)('should have area: %s', (id) => {
      expect(LIFE_AREAS[id]).toBeDefined();
      expect(LIFE_AREAS[id].id).toBe(id);
    });
  });
});
