import { describe, it, expect } from 'vitest';
import { diagnoseSpiritualImbalance, diagnoseSpiritualMisalignment, getSpiritualPrescription } from '@/lib/correlation/spiritual-diagnosis';

describe('correlation/spiritual-diagnosis', () => {
  describe('diagnoseSpiritualImbalance', () => {
    it('returns diagnoses for symptoms', () => {
      const result = diagnoseSpiritualImbalance(['ansiedade', 'medo']);
      expect(result).toHaveLength(2);
    });

    it('each diagnosis has required fields', () => {
      const result = diagnoseSpiritualImbalance(['ansiedade']);
      expect(result[0].chakra).toBeTruthy();
      expect(result[0].condition).toBeTruthy();
      expect(result[0].orixa).toBeTruthy();
      expect(result[0].recommendation).toBeTruthy();
    });
  });

  describe('diagnoseSpiritualMisalignment', () => {
    it('returns diagnoses for signs', () => {
      const result = diagnoseSpiritualMisalignment(['fadiga', 'insônia']);
      expect(result).toHaveLength(2);
    });
  });

  describe('getSpiritualPrescription', () => {
    it('returns prescription', () => {
      const diagnosis = diagnoseSpiritualImbalance(['ansiedade']);
      const rx = getSpiritualPrescription(diagnosis);
      expect(rx.ritual).toBeTruthy();
      expect(rx.affirmation).toBeTruthy();
      expect(rx.orixa).toBeTruthy();
    });
  });
});
