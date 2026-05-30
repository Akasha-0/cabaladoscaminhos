import { describe, it, expect } from 'vitest';
import { getLunarPhase, getPhaseForRitual, getRitualGuidance } from '@/lib/correlation/lunar-phase-analyzer';

describe('correlation/lunar-phase-analyzer', () => {
  describe('getLunarPhase', () => {
    it('returns valid phase object', () => {
      const phase = getLunarPhase(new Date());
      expect(phase.phase).toBeTruthy();
      expect(phase.name).toBeTruthy();
      expect(phase.energy).toBeTruthy();
      expect(phase.ritualType).toBeTruthy();
    });

    it('phase is one of valid types', () => {
      const phase = getLunarPhase(new Date());
      expect(['new', 'waxing', 'full', 'waning']).toContain(phase.phase);
    });
  });

  describe('getPhaseForRitual', () => {
    it('returns valid phase', () => {
      const phase = getPhaseForRitual('celebration');
      expect(['new', 'waxing', 'full', 'waning']).toContain(phase);
    });
  });

  describe('getRitualGuidance', () => {
    it('returns guidance and affirmation', () => {
      const result = getRitualGuidance('full', 'gratidão');
      expect(result.guidance).toBeTruthy();
      expect(result.affirmation).toBeTruthy();
    });
  });
});
