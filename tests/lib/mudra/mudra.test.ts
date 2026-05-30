import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/mudra/mudra-data';
import { performPractice } from '@/lib/mudra/mudra-practice';

describe('mudra', () => {
  it('getData returns mudra data object', () => {
    const data = getData();
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
  });

  it('performPractice returns practice result', () => {
    const result = performPractice({ name: 'gyan-mudra' });
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('performedAt');
    expect(result).toHaveProperty('durationSeconds');
    expect(result.name).toBe('gyan-mudra');
  });

  it('performPractice accepts custom duration', () => {
    const result = performPractice({ name: 'prana-mudra', durationSeconds: 60 });
    expect(result.durationSeconds).toBe(60);
  });
});