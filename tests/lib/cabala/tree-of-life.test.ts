import { describe, it, expect } from 'vitest';
import { getTree } from '@/lib/cabala/tree-of-life';

describe('cabala/tree-of-life', () => {
  const tree = getTree();

  it('has 10 sephiroth', () => {
    expect(tree.sephiroth.length).toBe(10);
  });

  it('has 23 paths', () => {
    expect(tree.paths.length).toBe(23);
  });

  it('each sephirah has required fields', () => {
    for (const s of tree.sephiroth) {
      expect(s.name).toBeTruthy();
      expect(s.enName).toBeTruthy();
      expect(s.number).toBeGreaterThan(0);
      expect(s.path).toBeGreaterThan(0);
      expect(s.hebrew).toBeTruthy();
      expect(s.meaning).toBeTruthy();
      expect(s.element).toBeTruthy();
      expect(s.planet).toBeTruthy();
      expect(s.letter).toBeTruthy();
    }
  });

  it('sephiroth numbered 1-10', () => {
    const nums = tree.sephiroth.map(s => s.number).sort((a, b) => a - b);
    expect(nums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('getSephirah finds Keter (1)', () => {
    const k = tree.getSephirah(1);
    expect(k?.name).toBe('Keter');
  });

  it('getSephirah finds Malkuth (10)', () => {
    const m = tree.getSephirah(10);
    expect(m?.name).toBe('Malkuth');
  });

  it('getSephirah returns undefined for invalid number', () => {
    expect(tree.getSephirah(99)).toBeUndefined();
  });

  it('getSephirahByName finds Keter', () => {
    const k = tree.getSephirahByName('Keter');
    expect(k?.number).toBe(1);
  });

  it('getSephirahByName is case-insensitive', () => {
    const k = tree.getSephirahByName('keter');
    expect(k?.number).toBe(1);
  });

  it('getPath finds path between sephiroth', () => {
    const p = tree.getPath(1, 2);
    expect(p).toBeDefined();
    expect(p?.from).toBe(1);
    expect(p?.to).toBe(2);
  });

  it('getPath is bidirectional', () => {
    const p1 = tree.getPath(1, 2);
    const p2 = tree.getPath(2, 1);
    expect(p1?.number).toBe(p2?.number);
  });

  it('each path has from/to/number/hebrew', () => {
    for (const p of tree.paths) {
      expect(p.from).toBeGreaterThan(0);
      expect(p.to).toBeGreaterThan(0);
      expect(p.number).toBeGreaterThan(0);
      expect(p.hebrew).toBeTruthy();
    }
  });

  it('paths connect valid sephiroth numbers', () => {
    for (const p of tree.paths) {
      expect(p.from).toBeGreaterThanOrEqual(1);
      expect(p.from).toBeLessThanOrEqual(10);
      expect(p.to).toBeGreaterThanOrEqual(1);
      expect(p.to).toBeLessThanOrEqual(10);
    }
  });

  it('includes Tiferet (6) as central sephirah', () => {
    const t = tree.getSephirah(6);
    expect(t?.name).toBe('Tiferet');
    expect(t?.planet).toBe('Sun');
  });

  it('Keter element is Spirit', () => {
    expect(tree.getSephirah(1)?.element).toBe('Spirit');
  });

  it('Malkuth element is Earth', () => {
    expect(tree.getSephirah(10)?.element).toBe('Earth');
  });
});
