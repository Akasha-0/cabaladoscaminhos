import { describe, it, expect } from 'vitest';
import {
  getData,
  type SpiritEntity,
  type SpiritData,
} from '@/lib/spirit/spirit-data';

describe('spirit-data module', () => {
  describe('getData', () => {
    it('returns a SpiritData object', () => {
      const data = getData();
      expect(data).toHaveProperty('entities');
    });

    it('entities is an array', () => {
      const data = getData();
      expect(Array.isArray(data.entities)).toBe(true);
    });

    it('returns all 3 spirit entities', () => {
      const data = getData();
      expect(data.entities.length).toBe(3);
    });

    it('each entity has required fields', () => {
      const data = getData();
      data.entities.forEach((entity: SpiritEntity) => {
        expect(entity).toHaveProperty('id');
        expect(entity).toHaveProperty('name');
        expect(entity).toHaveProperty('description');
      });
    });

    it('each entity has non-empty strings for required fields', () => {
      const data = getData();
      data.entities.forEach((entity: SpiritEntity) => {
        expect(entity.id.length).toBeGreaterThan(0);
        expect(entity.name.length).toBeGreaterThan(0);
        expect(entity.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('spirit entity content', () => {
    it('contains Guia Espiritual entity', () => {
      const data = getData();
      const guia = data.entities.find((e) => e.id === 'guia');
      expect(guia).toBeDefined();
      expect(guia!.name).toBe('Guia Espiritual');
      expect(guia!.origin).toBeDefined();
    });

    it('contains Mentor Celestial entity', () => {
      const data = getData();
      const mentor = data.entities.find((e) => e.id === 'mentor');
      expect(mentor).toBeDefined();
      expect(mentor!.name).toBe('Mentor Celestial');
      expect(mentor!.origin).toBeDefined();
    });

    it('contains Guardião do Caminho entity', () => {
      const data = getData();
      const guardiao = data.entities.find((e) => e.id === 'guardiao');
      expect(guardiao).toBeDefined();
      expect(guardiao!.name).toBe('Guardião do Caminho');
      expect(guardiao!.origin).toBeDefined();
    });

    it('all entities have origin property', () => {
      const data = getData();
      data.entities.forEach((entity: SpiritEntity) => {
        expect(entity.origin).toBeDefined();
        expect(entity.origin!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('origin values', () => {
    it('Guia has Cabalística origin', () => {
      const data = getData();
      const guia = data.entities.find((e) => e.id === 'guia');
      expect(guia!.origin).toBe('Tradição Cabalística');
    });

    it('Mentor has Hermética origin', () => {
      const data = getData();
      const mentor = data.entities.find((e) => e.id === 'mentor');
      expect(mentor!.origin).toBe('Tradição Hermética');
    });

    it('Guardião has Antiga origin', () => {
      const data = getData();
      const guardiao = data.entities.find((e) => e.id === 'guardiao');
      expect(guardiao!.origin).toBe('Tradição Antiga');
    });
  });

  describe('data integrity', () => {
    it('no duplicate ids', () => {
      const data = getData();
      const ids = data.entities.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});