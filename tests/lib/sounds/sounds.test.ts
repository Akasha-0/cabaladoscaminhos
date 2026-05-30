import { describe, it, expect } from 'vitest';
import {
  getHealingSounds,
  getHealingSoundsByCategory,
  getHealingSoundById,
  getHealingSoundsByChakra,
} from '@/lib/sounds/sound-healing';

describe('sound-healing', () => {
  it('getHealingSounds returns array of healing sounds', () => {
    const sounds = getHealingSounds();
    expect(Array.isArray(sounds)).toBe(true);
    expect(sounds.length).toBeGreaterThan(0);
  });

  it('getHealingSoundsByCategory filters by category', () => {
    const chakraSounds = getHealingSoundsByCategory('chakra');
    chakraSounds.forEach(s => {
      expect(s.category).toBe('chakra');
    });
  });

  it('getHealingSoundById returns entry by id', () => {
    const sounds = getHealingSounds();
    const first = sounds[0];
    const found = getHealingSoundById(first.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(first.id);
  });

  it('getHealingSoundById returns undefined for unknown id', () => {
    expect(getHealingSoundById('nonexistent-id')).toBeUndefined();
  });

  it('getHealingSoundsByChakra filters by chakra name', () => {
    const heartSounds = getHealingSoundsByChakra('heart');
    expect(Array.isArray(heartSounds)).toBe(true);
  });
});