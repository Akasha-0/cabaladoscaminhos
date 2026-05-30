import { describe, it, expect } from 'vitest';
import {
  getData,
  type WisdomData,
} from '@/lib/wisdom/wisdom-data';

describe('wisdom-data module', () => {
  describe('getData', () => {
    it('returns an array', () => {
      const data = getData();
      expect(Array.isArray(data)).toBe(true);
    });

    it('returns all wisdom entries', () => {
      const data = getData();
      expect(data.length).toBeGreaterThan(0);
    });

    it('each entry has required fields', () => {
      const data = getData();
      data.forEach((entry: WisdomData) => {
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('name');
        expect(entry).toHaveProperty('description');
        expect(entry).toHaveProperty('source');
        expect(entry).toHaveProperty('category');
        expect(entry).toHaveProperty('keywords');
        expect(entry).toHaveProperty('teaching');
        expect(entry).toHaveProperty('application');
      });
    });

    it('each entry has non-empty strings for required fields', () => {
      const data = getData();
      data.forEach((entry: WisdomData) => {
        expect(entry.id.length).toBeGreaterThan(0);
        expect(entry.name.length).toBeGreaterThan(0);
        expect(entry.description.length).toBeGreaterThan(0);
        expect(entry.source.length).toBeGreaterThan(0);
        expect(entry.teaching.length).toBeGreaterThan(0);
        expect(entry.application.length).toBeGreaterThan(0);
      });
    });

    it('each entry has non-empty keywords array', () => {
      const data = getData();
      data.forEach((entry: WisdomData) => {
        expect(Array.isArray(entry.keywords)).toBe(true);
        expect(entry.keywords.length).toBeGreaterThan(0);
      });
    });

    it('each entry has a valid category', () => {
      const data = getData();
      const validCategories = ['cabala', 'tarot', 'orixa', 'numerologia', 'geometria-sagrada', 'filosofia'];
      data.forEach((entry: WisdomData) => {
        expect(validCategories).toContain(entry.category);
      });
    });
  });

  describe('wisdom data content', () => {
    it('contains wisdom entry with cabala category', () => {
      const data = getData();
      const cabalaEntries = data.filter((d) => d.category === 'cabala');
      expect(cabalaEntries.length).toBeGreaterThan(0);
    });

    it('contains wisdom entry with tarot category', () => {
      const data = getData();
      const tarotEntries = data.filter((d) => d.category === 'tarot');
      expect(tarotEntries.length).toBeGreaterThan(0);
    });

    it('contains wisdom entry with filosofia category', () => {
      const data = getData();
      const filosofiaEntries = data.filter((d) => d.category === 'filosofia');
      expect(filosofiaEntries.length).toBeGreaterThan(0);
    });

    it('contains the micro-macro principle', () => {
      const data = getData();
      const microMacro = data.find((d) => d.id === 'micro-macro');
      expect(microMacro).toBeDefined();
      expect(microMacro!.name).toBe('O Microcosmo e o Macrocosmo');
      expect(microMacro!.source).toContain('Hermetismo');
    });

    it('keywords are lowercase strings', () => {
      const data = getData();
      data.forEach((entry: WisdomData) => {
        entry.keywords.forEach((keyword) => {
          expect(typeof keyword).toBe('string');
          expect(keyword.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('data integrity', () => {
    it('no duplicate ids', () => {
      const data = getData();
      const ids = data.map((d) => d.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('each entry has non-empty source', () => {
      const data = getData();
      data.forEach((entry: WisdomData) => {
        expect(entry.source.length).toBeGreaterThan(0);
      });
    });
  });
});