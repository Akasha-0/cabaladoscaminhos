import { describe, it, expect } from 'vitest';
import {
  getStages,
  getStageById,
  getStageByNumber,
  type AwakeningStage,
  type AwakeningStageId,
} from '@/lib/awakening/awakening-stages';

describe('awakening-stages module', () => {
  describe('getStages', () => {
    it('returns an array', () => {
      const stages = getStages();
      expect(Array.isArray(stages)).toBe(true);
    });

    it('returns all 9 awakening stages', () => {
      const stages = getStages();
      expect(stages.length).toBe(9);
    });

    it('each stage has required fields', () => {
      const stages = getStages();
      stages.forEach((stage: AwakeningStage) => {
        expect(stage).toHaveProperty('id');
        expect(stage).toHaveProperty('name');
        expect(stage).toHaveProperty('portugueseName');
        expect(stage).toHaveProperty('description');
        expect(stage).toHaveProperty('chaldeanNumber');
        expect(stage).toHaveProperty('sephirah');
        expect(stage).toHaveProperty('hebrewLetter');
        expect(stage).toHaveProperty('pathWord');
        expect(stage).toHaveProperty('keywords');
        expect(stage).toHaveProperty('challenges');
        expect(stage).toHaveProperty('gifts');
        expect(stage).toHaveProperty('shadowPitfall');
        expect(stage).toHaveProperty('practice');
        expect(stage).toHaveProperty('color');
        expect(stage).toHaveProperty('durationLabel');
      });
    });

    it('chaldean numbers are 1-9 with no duplicates', () => {
      const stages = getStages();
      const numbers = stages.map((s) => s.chaldeanNumber);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('stages are ordered by chaldean number', () => {
      const stages = getStages();
      for (let i = 1; i < stages.length; i++) {
        expect(stages[i].chaldeanNumber).toBeGreaterThan(stages[i - 1].chaldeanNumber);
      }
    });
  });

  describe('getStageById', () => {
    it('returns stage for valid id "acordando"', () => {
      const stage = getStageById('acordando');
      expect(stage).toBeDefined();
      expect(stage!.id).toBe('acordando');
    });

    it('returns stage for valid id "reconhecendo"', () => {
      const stage = getStageById('reconhecendo');
      expect(stage).toBeDefined();
      expect(stage!.id).toBe('reconhecendo');
    });

    it('returns stage for valid id "unificando"', () => {
      const stage = getStageById('unificando');
      expect(stage).toBeDefined();
      expect(stage!.id).toBe('unificando');
    });

    it('returns undefined for invalid id', () => {
      const stage = getStageById('invalid-stage');
      expect(stage).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const stage = getStageById('');
      expect(stage).toBeUndefined();
    });

    it('first stage has chaldeanNumber 1', () => {
      const stage = getStageById('acordando');
      expect(stage!.chaldeanNumber).toBe(1);
    });

    it('last stage has chaldeanNumber 9', () => {
      const stage = getStageById('unificando');
      expect(stage!.chaldeanNumber).toBe(9);
    });
  });

  describe('getStageByNumber', () => {
    it('returns stage for valid number 1', () => {
      const stage = getStageByNumber(1);
      expect(stage).toBeDefined();
      expect(stage!.chaldeanNumber).toBe(1);
    });

    it('returns stage for valid number 5', () => {
      const stage = getStageByNumber(5);
      expect(stage).toBeDefined();
      expect(stage!.chaldeanNumber).toBe(5);
    });

    it('returns stage for valid number 9', () => {
      const stage = getStageByNumber(9);
      expect(stage).toBeDefined();
      expect(stage!.chaldeanNumber).toBe(9);
    });

    it('returns undefined for number 0', () => {
      const stage = getStageByNumber(0);
      expect(stage).toBeUndefined();
    });

    it('returns undefined for number > 9', () => {
      const stage = getStageByNumber(10);
      expect(stage).toBeUndefined();
    });

    it('returns undefined for negative numbers', () => {
      const stage = getStageByNumber(-1);
      expect(stage).toBeUndefined();
    });
  });

  describe('stage data integrity', () => {
    it('all stages have non-empty strings for required fields', () => {
      const stages = getStages();
      stages.forEach((stage: AwakeningStage) => {
        expect(stage.id.length).toBeGreaterThan(0);
        expect(stage.name.length).toBeGreaterThan(0);
        expect(stage.portugueseName.length).toBeGreaterThan(0);
        expect(stage.description.length).toBeGreaterThan(0);
        expect(stage.sephirah.length).toBeGreaterThan(0);
        expect(stage.hebrewLetter.length).toBeGreaterThan(0);
        expect(stage.pathWord.length).toBeGreaterThan(0);
        expect(stage.color.length).toBeGreaterThan(0);
        expect(stage.durationLabel.length).toBeGreaterThan(0);
      });
    });

    it('all stages have non-empty keyword arrays', () => {
      const stages = getStages();
      stages.forEach((stage: AwakeningStage) => {
        expect(Array.isArray(stage.keywords)).toBe(true);
        expect(stage.keywords.length).toBeGreaterThan(0);
      });
    });

    it('all stages have non-empty challenges and gifts arrays', () => {
      const stages = getStages();
      stages.forEach((stage: AwakeningStage) => {
        expect(Array.isArray(stage.challenges)).toBe(true);
        expect(stage.challenges.length).toBeGreaterThan(0);
        expect(Array.isArray(stage.gifts)).toBe(true);
        expect(stage.gifts.length).toBeGreaterThan(0);
      });
    });

    it('all stages have non-empty shadowPitfall and practice strings', () => {
      const stages = getStages();
      stages.forEach((stage: AwakeningStage) => {
        expect(stage.shadowPitfall.length).toBeGreaterThan(0);
        expect(stage.practice.length).toBeGreaterThan(0);
      });
    });
  });
});