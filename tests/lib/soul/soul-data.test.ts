import { describe, it, expect } from 'vitest';
import {
  getData,
  type SoulEntity,
  type SoulData,
} from '@/lib/soul/soul-data';

describe('soul-data module', () => {
  describe('getData', () => {
    it('returns a SoulData object', () => {
      const data = getData();
      expect(data).toHaveProperty('entities');
    });

    it('entities is an array', () => {
      const data = getData();
      expect(Array.isArray(data.entities)).toBe(true);
    });

    it('returns all 3 soul entities', () => {
      const data = getData();
      expect(data.entities.length).toBe(3);
    });

    it('each entity has required fields', () => {
      const data = getData();
      data.entities.forEach((entity: SoulEntity) => {
        expect(entity).toHaveProperty('id');
        expect(entity).toHaveProperty('name');
        expect(entity).toHaveProperty('description');
      });
    });

    it('each entity has non-empty strings for required fields', () => {
      const data = getData();
      data.entities.forEach((entity: SoulEntity) => {
        expect(entity.id.length).toBeGreaterThan(0);
        expect(entity.name.length).toBeGreaterThan(0);
        expect(entity.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('soul entity content', () => {
    it('contains Essence entity', () => {
      const data = getData();
      const essence = data.entities.find((e) => e.id === 'essence');
      expect(essence).toBeDefined();
      expect(essence!.name).toBe('Essência Divina');
      expect(essence!.essence).toBeDefined();
    });

    it('contains higher-self entity', () => {
      const data = getData();
      const higherSelf = data.entities.find((e) => e.id === 'higher-self');
      expect(higherSelf).toBeDefined();
      expect(higherSelf!.name).toBe('Eu Superior');
      expect(higherSelf!.essence).toBeDefined();
    });

    it('contains heart-seed entity', () => {
      const data = getData();
      const heartSeed = data.entities.find((e) => e.id === 'heart-seed');
      expect(heartSeed).toBeDefined();
      expect(heartSeed!.name).toBe('Semente do Coração');
      expect(heartSeed!.essence).toBeDefined();
    });

    it('all entities have essence property', () => {
      const data = getData();
      data.entities.forEach((entity: SoulEntity) => {
        expect(entity.essence).toBeDefined();
        expect(entity.essence!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('essence values', () => {
    it('Essence has divine_spark essence', () => {
      const data = getData();
      const essence = data.entities.find((e) => e.id === 'essence');
      expect(essence!.essence).toBe(' divine_spark');
    });

    it('higher-self has transcendental_wisdom essence', () => {
      const data = getData();
      const higherSelf = data.entities.find((e) => e.id === 'higher-self');
      expect(higherSelf!.essence).toBe('transcendental_wisdom');
    });

    it('heart-seed has unconditional_love essence', () => {
      const data = getData();
      const heartSeed = data.entities.find((e) => e.id === 'heart-seed');
      expect(heartSeed!.essence).toBe('unconditional_love');
    });
  });
});