import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/bandha/bandha-data';
import { performPractice } from '@/lib/bandha/bandha-practice';

describe('bandha-data', () => {
  it('getData returns array of bandha entries', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('bandha entries have required fields', () => {
    const entry = getData()[0];
    expect(entry.id).toBeDefined();
    expect(entry.name).toBeDefined();
    expect(entry.difficulty).toBeDefined();
  });

  it('bandha difficulty is valid enum value', () => {
    const validDiffs = ['beginner', 'intermediate', 'advanced'];
    getData().forEach(entry => {
      expect(validDiffs).toContain(entry.difficulty);
    });
  });
});

describe('bandha-practice', () => {
  it('performPractice returns result with name and performedAt', () => {
    const result = performPractice({ name: 'mula-bandha', durationSeconds: 30 });
    expect(result.name).toBe('mula-bandha');
    expect(result.performedAt).toBeInstanceOf(Date);
  });

  it('performPractice respects duration and repetitions', () => {
    const result = performPractice({ name: 'uddiyana-bandha', durationSeconds: 60, repetitions: 3 });
    expect(result.durationSeconds).toBe(60);
    expect(result.repetitions).toBe(3);
  });

  it('performPractice throws on unknown bandha', () => {
    expect(() => performPractice({ name: 'unknown-bandha' as any })).toThrow();
  });
});