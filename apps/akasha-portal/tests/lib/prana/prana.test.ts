import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/prana/prana-data';
import { performPractice } from '@/lib/prana/prana-practice';

describe('prana-data', () => {
  it('getData returns array of prana entries', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('prana entries have id and name', () => {
    const entry = getData()[0];
    expect(entry.id).toBeDefined();
    expect(entry.name).toBeDefined();
  });

  it('prana entries have attributes with element, direction, chakra', () => {
    const entry = getData()[0];
    expect(entry.attributes.element).toBeDefined();
    expect(entry.attributes.direction).toBeDefined();
    expect(entry.attributes.chakra).toBeDefined();
  });
});

describe('prana-practice', () => {
  it('performPractice returns result with completed true', async () => {
    const result = await performPractice({ pranaType: 'prana' });
    expect(result.completed).toBe(true);
  });

  it('performPractice returns pranaLevel between 0 and 100', async () => {
    const result = await performPractice({ intensity: 5, duration: 30 });
    expect(result.pranaLevel).toBeGreaterThanOrEqual(0);
    expect(result.pranaLevel).toBeLessThanOrEqual(100);
  });

  it('performPractice returns activatedChannels array', async () => {
    const result = await performPractice({ pranaType: 'apana' });
    expect(Array.isArray(result.activatedChannels)).toBe(true);
    expect(result.activatedChannels.length).toBeGreaterThan(0);
  });
});