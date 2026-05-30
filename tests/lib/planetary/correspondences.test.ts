import { describe, it, expect } from 'vitest';
import {
  getCorrespondences,
  getCorrespondencesByName,
  getCorrespondencesByDay,
  getCorrespondencesByChakra,
  getCorrespondencesByElement,
} from '@/lib/planetary/correspondences';

describe('correspondences', () => {
  it('should return all correspondences', () => {
    const data = getCorrespondences();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should find correspondence by name', () => {
    const sun = getCorrespondencesByName('Sun');
    expect(sun).toBeDefined();
    expect(sun?.name).toBe('Sun');
  });

  it('should find correspondences by element', () => {
    const fire = getCorrespondencesByElement('fire');
    expect(Array.isArray(fire)).toBe(true);
  });
});
