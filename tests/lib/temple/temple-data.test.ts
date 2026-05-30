import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/temple/temple-data';

describe('temple/temple-data', () => {
  it('returns temple data with entities', () => {
    const data = getData();
    expect(data.entities.length).toBeGreaterThan(0);
  });

  it('has valid temple entity structure', () => {
    const data = getData();
    const entity = data.entities[0];
    expect(entity.id).toBeDefined();
    expect(entity.name).toBeDefined();
    expect(entity.description).toBeDefined();
    expect(entity.type).toBeDefined();
  });
});
