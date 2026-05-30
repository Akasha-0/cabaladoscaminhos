import { describe, it, expect } from 'vitest';
import {
  getMeditations,
  getMeditationsByPlanet,
  getMeditationById,
  getPlanets,
} from '~/lib/planetary/meditations';

describe('meditations', () => {
  it('should return all meditations', () => {
    const meditations = getMeditations();
    expect(Array.isArray(meditations)).toBe(true);
    expect(meditations.length).toBeGreaterThan(0);
  });

  it('should get meditations by planet', () => {
    const planets = getPlanets();
    if (planets.length > 0) {
      const meditations = getMeditationsByPlanet(planets[0]);
      expect(Array.isArray(meditations)).toBe(true);
    }
  });

  it('should find meditation by id', () => {
    const all = getMeditations();
    if (all.length > 0) {
      const found = getMeditationById(all[0].id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(all[0].id);
    }
  });
});
