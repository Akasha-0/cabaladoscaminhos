import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/dosha/dosha-data';

describe('dosha-data', () => {
  it('getData returns array', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
  });

  it('has vata, pitta, kapha entries', () => {
    const data = getData();
    const ids = data.map(d => d.id);
    expect(ids).toContain('vata');
    expect(ids).toContain('pitta');
    expect(ids).toContain('kapha');
  });

  it('entries have element and qualities', () => {
    const data = getData();
    const vata = data.find(d => d.id === 'vata');
    expect(vata).toBeDefined();
    expect(vata!.element).toBeDefined();
    expect(Array.isArray(vata!.quality)).toBe(true);
  });
});