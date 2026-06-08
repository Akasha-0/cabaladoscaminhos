import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/mudra/mudra-data';
import { performPractice } from '@/lib/mudra/mudra-practice';

describe('mudra-data', () => {
  it('getData returns mudra data object', () => {
    const data = getData();
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
  });

  it('mudra data has entries', () => {
    const data = getData();
    const keys = Object.keys(data);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('mudra entries have id and name fields', () => {
    const data = getData();
    const firstKey = Object.keys(data)[0];
    const entry = data[firstKey];
    expect(entry.id).toBeDefined();
    expect(entry.name).toBeDefined();
  });
});

describe('mudra-practice', () => {
  it('performPractice returns result with name and performedAt', () => {
    const result = performPractice({ name: 'gyan-mudra', durationSeconds: 30 });
    expect(result.name).toBe('gyan-mudra');
    expect(result.performedAt).toBeInstanceOf(Date);
  });

  it('performPractice respects duration and repetitions', () => {
    const result = performPractice({ name: 'prana-mudra', durationSeconds: 60, repetitions: 3 });
    expect(result.durationSeconds).toBe(60);
    expect(result.repetitions).toBe(3);
  });

  it('performPractice throws on unknown mudra', () => {
    expect(() => performPractice({ name: 'unknown-mudra' as any })).toThrow();
  });
});