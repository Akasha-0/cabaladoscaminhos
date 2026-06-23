import { describe, expect, it } from 'vitest';
import type { SignificadoCurado } from './significados-curados';
import { PILAR_4_SERIES } from './significados-curados-pilar-4';

// PT-BR detection regex — catches Portuguese diacritics and function words
const PT_BR_RE =
  /[áéíóúãõ\u00e7àèìòùâêîôû]|\b(o|a|os|as|de|do|da|dos|das|no|na|nos|nas|em|um|uma|uns|umas|para|com|sem|por|mais|mas|ou|e|que|qual|quais|quem|quando|onde|cujo|portanto|assim|então|pois|porque|seu|seus|sua|suas|este|esta|estes|estas|esse|essa|esses|esses|aquele|aquela|isso|aquilo|não|sim|mais|menos|muito|pouco|bem|mau|mesmo|mesma|mesmos|mesmas|todo|toda|todos|todas|vários|várias|outro|outra|outros|outras|próprio|própria|além|dentro|fora|antes|depois|entre|sobre|sob|ante|após|mediante|vista|através)\b/gi;

describe('significados-curados-pilar-4', () => {
  // 1 · Array size
  it('PILAR_4_SERIES has exactly 16 entries', () => {
    expect(PILAR_4_SERIES).toHaveLength(16);
  });

  // 2 · pilar field
  it('every entry has pilar equal to "odu"', () => {
    for (const s of PILAR_4_SERIES) {
      expect(s.pilar).toBe('odu');
    }
  });

  // 3 · requer_terreiro === true (R-022 §4.4) — strict equality, catches undefined
  it('every Odu entry has requer_terreiro literally equal to true (R-022 §4.4)', () => {
    for (const s of PILAR_4_SERIES) {
      expect(s.requer_terreiro).toBe(true);
    }
  });

  // 4 · Required fields & PT-BR for every entry
  for (const s of PILAR_4_SERIES) {
    it(`${s.titulo} has all required editorial fields`, () => {
      expect(s.id).toBeTruthy();
      expect(s.pilar).toBe('odu');
      expect(s.titulo).toBeTruthy();
      expect(s.essencia).toBeTruthy();
      expect(s.missao).toBeTruthy();
      expect(s.sombra).toBeTruthy();
      expect(s.pratica).toBeTruthy();
      expect(s.conexao).toBeTruthy();
      expect(s.fonte).toBeTruthy();
      // R-022 §4.4 core ethical contract — must be boolean true, not just truthy
      expect(s.requer_terreiro).toBe(true);
    });

    it(`${s.titulo} editorial text is PT-BR`, () => {
      const text = [s.titulo, s.essencia, s.missao, s.sombra, s.pratica, s.conexao].join(' ');
      expect(text).toMatch(PT_BR_RE);
    });
  }

  // 5 · Unique IDs
  it('all Odu IDs are unique', () => {
    const ids = PILAR_4_SERIES.map((s) => s.id);
    expect(new Set(ids)).toHaveLength(16);
  });

  // 6 · Known entries spot-check
  describe('known entries', () => {
    it('Ogbe has correct essence', () => {
      const o = PILAR_4_SERIES.find((s) => s.id === 'Ogbe');
      expect(o).toBeDefined();
      expect(o!.essencia).toMatch(/Luz|origem|criação/);
    });

    it('Ofurufu is the last Odu (cycle closer)', () => {
      const last = PILAR_4_SERIES[PILAR_4_SERIES.length - 1];
      expect(last.id).toBe('Ofurufu');
      expect(last.essencia).toMatch(/Completude|totalidade|bênção/);
    });

    it('Iká has the sword essence keyword', () => {
      const o = PILAR_4_SERIES.find((s) => s.id === 'Iká');
      expect(o).toBeDefined();
      expect(o!.essencia).toMatch(/Poder|estratégia|espada|justiça/);
    });

    it('all 16 entries are present (full roster)', () => {
      const expectedIds = [
        'Ogbe',
        'Ejiokô',
        'Etogundá',
        'Irosun',
        'Oxê',
        'Obará',
        'Odi',
        'Ejionile',
        'Ossá',
        'Ofun',
        'Owonrin',
        'Ejilaxebô',
        'Oturupon',
        'Oturá',
        'Iká',
        'Ofurufu',
      ];
      const actualIds = PILAR_4_SERIES.map((s) => s.id);
      expect(actualIds).toEqual(expectedIds);
    });
  });
});
