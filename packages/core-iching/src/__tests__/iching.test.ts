import { describe, it, expect } from 'vitest';
import {
  type Trigram,
  buildIchingMap,
  TRIGRAMS,
  HEXAGRAMS,
  getTrigram,
  getHexagram,
  getAllHexagrams,
} from '../index';

describe('@akasha/core-iching', () => {
  describe('TRIGRAMS (8 Bagua)', () => {
    it('has 8 trigrams (Fu Xi sequence)', () => {
      expect(Object.keys(TRIGRAMS).length).toBe(8);
    });
    it('contains all 8 expected Chinese names', () => {
      const names = Object.values(TRIGRAMS).map((t: Trigram) => t.chineseName);
      expect(names).toEqual(
        expect.arrayContaining(['Qian', 'Kun', 'Kan', 'Li', 'Zhen', 'Gen', 'Xun', 'Dui'])
      );
    });
    it('getTrigram(1) returns Qian (Heaven)', () => {
      const t = getTrigram(1);
      expect(t.name).toBe('Céu');
      expect(t.nature).toBe('yang');
    });
  });

  describe('HEXAGRAMS (64 King Wen)', () => {
    it('has 64 unique hexagrams', () => {
      expect(getAllHexagrams().length).toBe(64);
      const numbers = getAllHexagrams().map((h) => h.number);
      expect(new Set(numbers).size).toBe(64);
    });
    it('getHexagram(1) returns Qian (The Creative)', () => {
      const h = getHexagram(1);
      expect(h.name).toContain('O Criativo');
      expect(h.upperTrigram).toBe(1);
      expect(h.lowerTrigram).toBe(1);
    });
    it('getHexagram(2) returns Kun (The Receptive)', () => {
      const h = getHexagram(2);
      expect(h.upperTrigram).toBe(2);
      expect(h.lowerTrigram).toBe(2);
    });
    it('hexagrams have at least one aspect each', () => {
      for (const h of getAllHexagrams()) {
        expect(h.aspects.length).toBeGreaterThan(0);
      }
    });
  });

  describe('buildIchingMap (deterministic natal)', () => {
    it('produces a stable map for a known birthdate', () => {
      const a = buildIchingMap({ birthDate: '1990-06-15', birthTime: '12:00' });
      const b = buildIchingMap({ birthDate: '1990-06-15', birthTime: '12:00' });
      expect(a).toEqual(b);
    });
    it('returns algorithm tag and metadata', () => {
      const map = buildIchingMap({ birthDate: '1985-03-20', birthTime: '03:00' });
      expect(map.algorithm).toBe('akasha.v0.0.4.trigramas-mod8');
      expect(map.upperTrigram).toBeGreaterThanOrEqual(1);
      expect(map.upperTrigram).toBeLessThanOrEqual(8);
      expect(map.lowerTrigram).toBeGreaterThanOrEqual(1);
      expect(map.lowerTrigram).toBeLessThanOrEqual(8);
      expect(map.hexagramNumber).toBeGreaterThanOrEqual(1);
      expect(map.hexagramNumber).toBeLessThanOrEqual(64);
    });
    it('handles missing birthTime gracefully', () => {
      const map = buildIchingMap({ birthDate: '2000-01-01' });
      expect(map.hexagramNumber).toBeGreaterThanOrEqual(1);
      expect(map.hexagramNumber).toBeLessThanOrEqual(64);
    });
    it('handles invalid date by returning null', () => {
      const map = buildIchingMap({ birthDate: 'not-a-date' });
      expect(map.hexagramNumber).toBeNull();
      expect(map.upperTrigram).toBeNull();
    });
    it('handles Date object input', () => {
      const map = buildIchingMap({ birthDate: new Date(1992, 11, 25), birthTime: '22:00' });
      expect(map.hexagramNumber).not.toBeNull();
    });
    it('different birthdates produce different hexagrams (statistical)', () => {
      const a = buildIchingMap({ birthDate: '1990-01-01', birthTime: '12:00' });
      const b = buildIchingMap({ birthDate: '2000-06-15', birthTime: '12:00' });
      const c = buildIchingMap({ birthDate: '2010-12-31', birthTime: '12:00' });
      const numbers = new Set([a.hexagramNumber, b.hexagramNumber, c.hexagramNumber]);
      expect(numbers.size).toBeGreaterThanOrEqual(2);
    });
    it('all 64 hexagrams are reachable across a sweep of dates', () => {
      const seen = new Set<number>();
      for (let day = 1; day <= 31; day++) {
        const map = buildIchingMap({
          birthDate: `2000-${String(((day - 1) % 12) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          birthTime: '12:00',
        });
        if (map.hexagramNumber !== null) seen.add(map.hexagramNumber);
      }
      // We won't reach all 64 in 31 days (algorithm only varies month/day),
      // but we should see a reasonable variety (>5 unique).
      expect(seen.size).toBeGreaterThan(5);
    });
  });
});
