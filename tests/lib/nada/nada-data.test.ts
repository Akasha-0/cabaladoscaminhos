import { describe, it, expect } from 'vitest';
import { getData, NADA_DATASET } from '~/lib/nada/nada-data';

describe('nada-data', () => {
  it('NADA_DATASET is defined and non-empty', () => {
    expect(Array.isArray(NADA_DATASET)).toBe(true);
    expect(NADA_DATASET.length).toBeGreaterThan(0);
  });

  it('getData returns array with all nada items', () => {
    const data = getData();
    expect(data).toEqual(NADA_DATASET);
    expect(data.length).toBeGreaterThan(0);
  });

  it('nada items have required properties', () => {
    const item = NADA_DATASET[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('frequency');
    expect(item.frequency).toBeGreaterThan(0);
  });
});