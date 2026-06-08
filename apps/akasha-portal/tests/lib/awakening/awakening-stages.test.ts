import { describe, it, expect } from 'vitest';
import { getStages, getStageById, getStageByNumber } from '@/lib/awakening/awakening-stages';
import type { AwakeningStage, AwakeningStageId } from '@/lib/awakening/awakening-stages';

describe('awakening-stages', () => {
  describe('getStages', () => {
    it('returns array with 9 stages', () => {
      const stages = getStages();
      expect(stages).toHaveLength(9);
    });

    it('each stage has all required fields', () => {
      const stages = getStages();
      const requiredFields: (keyof AwakeningStage)[] = [
        'id',
        'name',
        'portugueseName',
        'description',
        'chaldeanNumber',
        'sephirah',
        'hebrewLetter',
        'pathWord',
        'keywords',
        'challenges',
        'gifts',
        'shadowPitfall',
        'practice',
        'color',
        'durationLabel',
      ];

      for (const stage of stages) {
        for (const field of requiredFields) {
          expect(stage).toHaveProperty(field);
        }
      }
    });

    it('chaldeanNumber is between 1 and 9 for all stages', () => {
      const stages = getStages();
      for (const stage of stages) {
        expect(stage.chaldeanNumber).toBeGreaterThanOrEqual(1);
        expect(stage.chaldeanNumber).toBeLessThanOrEqual(9);
      }
    });

    it('all stage ids are unique', () => {
      const stages = getStages();
      const ids = stages.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('keywords is non-empty array for all stages', () => {
      const stages = getStages();
      for (const stage of stages) {
        expect(Array.isArray(stage.keywords)).toBe(true);
        expect(stage.keywords.length).toBeGreaterThan(0);
      }
    });

    it('gifts is non-empty array for all stages', () => {
      const stages = getStages();
      for (const stage of stages) {
        expect(Array.isArray(stage.gifts)).toBe(true);
        expect(stage.gifts.length).toBeGreaterThan(0);
      }
    });

    it('challenges is non-empty array for all stages', () => {
      const stages = getStages();
      for (const stage of stages) {
        expect(Array.isArray(stage.challenges)).toBe(true);
        expect(stage.challenges.length).toBeGreaterThan(0);
      }
    });

    it('All stages have valid hebrewLetter (single character string)', () => {
      const stages = getStages();
      for (const stage of stages) {
        expect(typeof stage.hebrewLetter).toBe('string');
        expect(stage.hebrewLetter.length).toBe(1);
      }
    });
  });

  describe('getStageById', () => {
    it("getStageById('acordando') returns awakening stage", () => {
      const stage = getStageById('acordando');
      expect(stage).toBeDefined();
      expect(stage?.id).toBe('acordando');
    });

    it("getStageById('unificando') returns unifying stage", () => {
      const stage = getStageById('unificando');
      expect(stage).toBeDefined();
      expect(stage?.id).toBe('unificando');
    });

    it("getStageById('invalid') returns undefined", () => {
      const stage = getStageById('invalid' as AwakeningStageId);
      expect(stage).toBeUndefined();
    });

    it("getStageById('unknown') returns undefined", () => {
      const stage = getStageById('unknown' as AwakeningStageId);
      expect(stage).toBeUndefined();
    });
  });

  describe('getStageByNumber', () => {
    it('getStageByNumber(1) returns stage with chaldeanNumber 1 (acordando)', () => {
      const stage = getStageByNumber(1);
      expect(stage).toBeDefined();
      expect(stage?.id).toBe('acordando');
      expect(stage?.chaldeanNumber).toBe(1);
    });

    it('getStageByNumber(9) returns stage with chaldeanNumber 9 (unificando)', () => {
      const stage = getStageByNumber(9);
      expect(stage).toBeDefined();
      expect(stage?.id).toBe('unificando');
      expect(stage?.chaldeanNumber).toBe(9);
    });

    it('getStageByNumber(0) returns undefined', () => {
      const stage = getStageByNumber(0);
      expect(stage).toBeUndefined();
    });

    it('getStageByNumber(10) returns undefined', () => {
      const stage = getStageByNumber(10);
      expect(stage).toBeUndefined();
    });
  });
});