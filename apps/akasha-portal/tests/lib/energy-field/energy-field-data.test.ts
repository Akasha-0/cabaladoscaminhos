import { describe, it, expect } from 'vitest';
import { getData, type EnergyFieldData } from '@/lib/energy-field/energy-field-data';

describe('energy-field/energy-field-data', () => {
  it('getData returns array of EnergyFieldData', () => {
    const data = getData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('each field has required properties', () => {
    const data = getData() as EnergyFieldData[];
    const field = data[0];
    expect(typeof field.name).toBe('string');
    expect(typeof field.description).toBe('string');
    expect(typeof field.vibrationLevel).toBe('number');
    expect(typeof field.frequency).toBe('number');
  });
});