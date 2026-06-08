import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/mantra/mantra-data';

describe('mantra/mantra-data', () => {
  const data = getData();

  it('contains mantra data', () => {
    expect(Object.keys(data).length).toBeGreaterThan(0);
  });

  it('each mantra has name', () => {
    for (const [key, mantra] of Object.entries(data)) {
      expect(mantra.name).toBeTruthy();
    }
  });

  it('each mantra has meaning', () => {
    for (const mantra of Object.values(data)) {
      expect(mantra.meaning).toBeTruthy();
    }
  });

  it('contains Om mantra', () => {
    const om = data['om'] || data[' OM '];
    expect(om).toBeDefined();
  });

  it('each mantra has syllables array', () => {
    for (const mantra of Object.values(data)) {
      expect(Array.isArray(mantra.syllables)).toBe(true);
    }
  });

  it('each mantra has benefits array', () => {
    for (const mantra of Object.values(data)) {
      expect(Array.isArray(mantra.benefits)).toBe(true);
    }
  });
});
