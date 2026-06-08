import { describe, it, expect } from 'vitest';
import ptBR from '../../../src/i18n/pt-BR.json';
import en from '../../../src/i18n/en.json';

type Dict = Record<string, unknown>;

/** Flatten a nested dict → { dottedKey: leafValue } */
function flatten(obj: Dict, prefix = ''): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v as Dict, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

describe('i18n dictionaries (Doc 25 §9, v0.0.4-T9.14)', () => {
  it('pt-BR and en have the same set of keys', () => {
    const ptKeys = Object.keys(flatten(ptBR as Dict)).sort();
    const enKeys = Object.keys(flatten(en as Dict)).sort();
    expect(enKeys).toEqual(ptKeys);
  });

  it('all values are non-empty strings (no empty translations)', () => {
    const ptFlat = flatten(ptBR as Dict);
    const enFlat = flatten(en as Dict);
    for (const [k, v] of Object.entries(ptFlat)) {
      expect(typeof v, `pt-BR.${k}`).toBe('string');
      expect((v as string).trim().length, `pt-BR.${k} should not be empty`).toBeGreaterThan(0);
    }
    for (const [k, v] of Object.entries(enFlat)) {
      expect(typeof v, `en.${k}`).toBe('string');
      expect((v as string).trim().length, `en.${k} should not be empty`).toBeGreaterThan(0);
    }
  });

  it('pt-BR and en values are different (actual translation, not copy-paste)', () => {
    const ptFlat = flatten(ptBR as Dict);
    const enFlat = flatten(en as Dict);
    let different = 0;
    for (const k of Object.keys(ptFlat)) {
      if (ptFlat[k] !== enFlat[k]) different++;
    }
    // At least 50% of values should differ between locales.
    const total = Object.keys(ptFlat).length;
    expect(different, `Expected ≥${Math.ceil(total / 2)} different values, got ${different}`).toBeGreaterThanOrEqual(Math.ceil(total / 2));
  });
});
