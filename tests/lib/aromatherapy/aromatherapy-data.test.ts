import { describe, it, expect } from 'vitest';
import { getData, getOleo, getOleosPorNota, getTodosOleos } from '~/lib/aromatherapy/aromatherapy-data';

describe('aromatherapy-data', () => {
  it('getData returns aromatherapy data', () => {
    const data = getData();
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
  });

  it('getTodosOleos returns array of oils', () => {
    const oleos = getTodosOleos();
    expect(Array.isArray(oleos)).toBe(true);
    expect(oleos.length).toBeGreaterThan(0);
  });

  it('getOleo finds oil by id', () => {
    const oleos = getTodosOleos();
    if (oleos.length > 0) {
      const oleo = getOleo(oleos[0].id);
      expect(oleo).toBeDefined();
      expect(oleo?.id).toBe(oleos[0].id);
    }
  });
});