import { describe, it, expect } from 'vitest';
import { getMeanings } from '@/lib/cabala/sefirot-meanings';

describe('cabala/sefirot-meanings', () => {
  const meanings = getMeanings();

  it('has all 10 sefirot', () => {
    expect(Object.keys(meanings).length).toBe(10);
  });

  it('each sefira has name', () => {
    for (const s of Object.values(meanings)) {
      expect(s.name).toBeTruthy();
    }
  });

  it('each sefira has divineName', () => {
    for (const s of Object.values(meanings)) {
      expect(s.divineName).toBeTruthy();
    }
  });

  it('each sefira has angelicOrder', () => {
    for (const s of Object.values(meanings)) {
      expect(s.angelicOrder).toBeTruthy();
    }
  });

  it('each sefira has color', () => {
    for (const s of Object.values(meanings)) {
      expect(s.color).toBeTruthy();
    }
  });

  it('each sefira has quality', () => {
    for (const s of Object.values(meanings)) {
      expect(s.quality).toBeTruthy();
    }
  });

  it('each sefira has essence', () => {
    for (const s of Object.values(meanings)) {
      expect(s.essence).toBeTruthy();
    }
  });

  it('each sefira has path', () => {
    for (const s of Object.values(meanings)) {
      expect(s.path).toBeTruthy();
    }
  });

  it('each sefira has letter', () => {
    for (const s of Object.values(meanings)) {
      expect(s.letter).toBeTruthy();
    }
  });

  it('each sefira has element', () => {
    for (const s of Object.values(meanings)) {
      expect(s.element).toBeTruthy();
    }
  });

  it('includes keter (crown)', () => {
    expect(meanings.keter).toBeDefined();
  });

  it('includes malkhut (kingdom)', () => {
    expect(meanings.malkhut).toBeDefined();
  });

  it('includes tiferet (beauty)', () => {
    expect(meanings.tiferet).toBeDefined();
  });

  it('includes chokhmah (wisdom)', () => {
    expect(meanings.chokhmah).toBeDefined();
  });

  it('includes binah (understanding)', () => {
    expect(meanings.binah).toBeDefined();
  });
});
