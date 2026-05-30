import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/nada/nada-data';
import { performPractice } from '@/lib/nada/nada-practice';

describe('nada-data', () => {
  it('getData returns array of nada entries', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('nada entries have required fields', () => {
    const entry = getData()[0];
    expect(entry.id).toBeDefined();
    expect(entry.name).toBeDefined();
    expect(typeof entry.frequency).toBe('number');
    expect(typeof entry.solfeggio).toBe('number');
  });

  it('nada entries have valid solfeggio frequencies', () => {
    const data = getData();
    data.forEach(entry => {
      expect(entry.solfeggio).toBeGreaterThan(0);
    });
  });
});

describe('nada-practice', () => {
  it('performPractice returns completed result', async () => {
    const result = await performPractice();
    expect(result.completed).toBe(true);
  });

  it('performPractice returns resonanceLevel between 0 and 1', async () => {
    const result = await performPractice();
    expect(result.resonanceLevel).toBeGreaterThanOrEqual(0);
    expect(result.resonanceLevel).toBeLessThanOrEqual(1);
  });
});