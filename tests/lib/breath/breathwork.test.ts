import { describe, it, expect } from 'vitest';
import { performBreathwork } from '@/lib/breath/breathwork';
import { getData } from '@/lib/breath/breath-data';

describe('breath/breathwork', () => {
  describe('getData', () => {
    it('has breath exercises', () => {
      const exercises = getData();
      expect(exercises.length).toBeGreaterThan(0);
    });

    it('each exercise has id and name', () => {
      for (const ex of getData()) {
        expect(ex.id).toBeTruthy();
        expect(ex.name).toBeTruthy();
      }
    });
  });

  describe('performBreathwork', () => {
    it('performs breathwork session', () => {
      const exercises = getData();
      if (exercises.length > 0) {
        const result = performBreathwork(exercises[0].id);
        expect(result.session.exerciseId).toBeTruthy();
        expect(result.session.cyclesCompleted).toBeGreaterThanOrEqual(0);
      }
    });

    it('returns BreathworkResult with success boolean', () => {
      const exercises = getData();
      if (exercises.length > 0) {
        const result = performBreathwork(exercises[0].id);
        expect(typeof result.success).toBe('boolean');
      }
    });
  });
});
