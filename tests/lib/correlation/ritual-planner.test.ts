import { describe, it, expect } from 'vitest';
import { planRitual, generateRitualPlan, getWeeklyRitualSchedule } from '@/lib/correlation/ritual-planner';

describe('correlation/ritual-planner', () => {
  describe('planRitual', () => {
    it('returns valid ritual plan', () => {
      const plan = planRitual('cura');
      expect(plan.name).toBeTruthy();
      expect(typeof plan.odu).toBe('number');
      expect(plan.lunarPhase).toBeTruthy();
      expect(plan.dayOfWeek).toBeTruthy();
      expect(Array.isArray(plan.affirmations)).toBe(true);
    });
  });

  describe('generateRitualPlan', () => {
    it('returns valid plan', () => {
      const plan = generateRitualPlan('protecao');
      expect(plan.name).toBeTruthy();
    });
  });

  describe('getWeeklyRitualSchedule', () => {
    it('returns array', () => {
      const schedule = getWeeklyRitualSchedule();
      expect(Array.isArray(schedule)).toBe(true);
    });
  });
});
