import { describe, it, expect } from 'vitest';
import { getData, VIBRATION_DATASET, VibrationData } from '@/lib/vibration/v2/vibration-data';

describe('vibration-data', () => {
  describe('getData', () => {
    it('returns array with 8 entries', () => {
      const data = getData();
      expect(data).toHaveLength(8);
    });

    it('returns copy (mutating returned array does not affect VIBRATION_DATASET)', () => {
      const data = getData();
      const originalLength = VIBRATION_DATASET.length;
      data.push({ id: 'fake', name: 'Fake', frequency: 100, unit: 'Hz', description: 'x', category: 'x', timestamp: 0 });
      expect(VIBRATION_DATASET).toHaveLength(originalLength);
    });
  });

  describe('VIBRATION_DATASET entries', () => {
    it('each entry has required fields: id, name, frequency, unit, description, category, timestamp', () => {
      for (const entry of VIBRATION_DATASET) {
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('name');
        expect(entry).toHaveProperty('frequency');
        expect(entry).toHaveProperty('unit');
        expect(entry).toHaveProperty('description');
        expect(entry).toHaveProperty('category');
        expect(entry).toHaveProperty('timestamp');
      }
    });

    it('all ids are unique', () => {
      const ids = VIBRATION_DATASET.map(e => e.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('id="vib-001" has name="Universal Baseline", frequency=528, unit="Hz", category="healing"', () => {
      const entry = VIBRATION_DATASET.find(e => e.id === 'vib-001')!;
      expect(entry.name).toBe('Universal Baseline');
      expect(entry.frequency).toBe(528);
      expect(entry.unit).toBe('Hz');
      expect(entry.category).toBe('healing');
    });

    it('id="vib-002" has name="Solfeggio Freedom", frequency=396, unit="Hz", category="liberation"', () => {
      const entry = VIBRATION_DATASET.find(e => e.id === 'vib-002')!;
      expect(entry.name).toBe('Solfeggio Freedom');
      expect(entry.frequency).toBe(396);
      expect(entry.unit).toBe('Hz');
      expect(entry.category).toBe('liberation');
    });

    it('id="vib-007" has name="Earth Resonance", frequency=7.83, unit="Hz", category="grounding"', () => {
      const entry = VIBRATION_DATASET.find(e => e.id === 'vib-007')!;
      expect(entry.name).toBe('Earth Resonance');
      expect(entry.frequency).toBe(7.83);
      expect(entry.unit).toBe('Hz');
      expect(entry.category).toBe('grounding');
    });

    it('id="vib-008" has name="Om Vibration", frequency=136.1, unit="Hz", category="meditation"', () => {
      const entry = VIBRATION_DATASET.find(e => e.id === 'vib-008')!;
      expect(entry.name).toBe('Om Vibration');
      expect(entry.frequency).toBe(136.1);
      expect(entry.unit).toBe('Hz');
      expect(entry.category).toBe('meditation');
    });

    it('frequency values are positive numbers for all entries', () => {
      for (const entry of VIBRATION_DATASET) {
        expect(typeof entry.frequency).toBe('number');
        expect(entry.frequency).toBeGreaterThan(0);
      }
    });

    it('category is non-empty string for all entries', () => {
      for (const entry of VIBRATION_DATASET) {
        expect(typeof entry.category).toBe('string');
        expect(entry.category.length).toBeGreaterThan(0);
      }
    });

    it('description is non-empty string for all entries', () => {
      for (const entry of VIBRATION_DATASET) {
        expect(typeof entry.description).toBe('string');
        expect(entry.description.length).toBeGreaterThan(0);
      }
    });
  });
});