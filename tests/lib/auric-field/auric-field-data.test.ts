import { describe, it, expect } from 'vitest';
import { getData, type AuricFieldData, type AuricLayer } from '@/lib/auric-field/auric-field-data';

describe('auric-field/auric-field-data', () => {
  it('getData returns AuricFieldData', () => {
    const data = getData() as AuricFieldData;
    expect(data).toBeDefined();
    expect(Array.isArray(data.layers)).toBe(true);
    expect(data.layers.length).toBeGreaterThan(0);
  });

  it('layers have required properties', () => {
    const data = getData() as AuricFieldData;
    const layer = data.layers[0] as AuricLayer;
    expect(typeof layer.id).toBe('string');
    expect(typeof layer.name).toBe('string');
    expect(typeof layer.color).toBe('string');
    expect(typeof layer.frequencyHz).toBe('number');
  });

  it('has at least 6 auric layers', () => {
    const data = getData() as AuricFieldData;
    expect(data.layers.length).toBeGreaterThanOrEqual(6);
  });
});