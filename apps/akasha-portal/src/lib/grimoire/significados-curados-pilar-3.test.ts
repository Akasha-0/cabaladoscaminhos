import { describe, expect, it } from 'vitest';
import type { SignificadoCurado } from './significados-curados';
import { PILAR_3_SERIES } from './significados-curados-pilar-3';

// Derived groups — the three sub-series are module-local in the source;
// only PILAR_3_SERIES is exported.  Derivation anchors on id shape and
// membership, which is stable regardless of titulo renames.
const CORPOS_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
const TRIGEMEO_IDS = new Set(['fisico', 'astral', 'mental'] as const);
const TEMPERAMENTO_IDS = new Set(['sanguineo', 'colerico', 'melancolico', 'fleumatico'] as const);

const PILAR_3_CORPOS = PILAR_3_SERIES.filter(
  (s: SignificadoCurado): s is SignificadoCurado & { id: number } =>
    typeof s.id === 'number' && CORPOS_IDS.has(s.id),
);
const PILAR_3_TRIGEMEO = PILAR_3_SERIES.filter(
  (s: SignificadoCurado): s is SignificadoCurado & { id: 'fisico' | 'astral' | 'mental' } =>
    typeof s.id === 'string' && TRIGEMEO_IDS.has(s.id as 'fisico' | 'astral' | 'mental'),
);
const PILAR_3_TEMPERAMENTO = PILAR_3_SERIES.filter(
  (s: SignificadoCurado): s is SignificadoCurado & { id: 'sanguineo' | 'colerico' | 'melancolico' | 'fleumatico' } =>
    typeof s.id === 'string' && TEMPERAMENTO_IDS.has(s.id as 'sanguineo' | 'colerico' | 'melancolico' | 'fleumatico'),
);

const PT_BR_RE =
  /[áéíóúãõ\u00e7àèìòùâêîôû]|\b(o|a|os|as|de|do|da|dos|das|no|na|nos|nas|em|um|uma|uns|umas|para|com|sem|por|mais|mas|ou|e|que|qual|quais|quem|quando|onde|cujo|portanto|assim|então|pois|porque|seu|seus|sua|suas|este|esta|estes|estas|esse|essa|esses|esses|aquele|aquela|isso|aquilo|não|sim|mais|menos|muito|pouco|bem|mau|mesmo|mesma|mesmos|mesmas|todo|toda|todos|todas|vários|várias|outro|outra|outros|outras|próprio|própria|além|dentro|fora|antes|depois|entre|sobre|sob|ante|após|mediante|vista|através)\b/gi;

describe('significados-curados-pilar-3', () => {
  // 1 · Array sizes
  it('PILAR_3_CORPOS has exactly 11 entries', () => {
    expect(PILAR_3_CORPOS).toHaveLength(11);
  });
  it('PILAR_3_TRIGEMEO has exactly 3 entries', () => {
    expect(PILAR_3_TRIGEMEO).toHaveLength(3);
  });
  it('PILAR_3_TEMPERAMENTO has exactly 4 entries', () => {
    expect(PILAR_3_TEMPERAMENTO).toHaveLength(4);
  });
  it('PILAR_3_SERIES has 18 entries (11 + 3 + 4)', () => {
    expect(PILAR_3_SERIES).toHaveLength(18);
  });
  it('PILAR_3_SERIES is concatenation of the three groups', () => {
    expect(PILAR_3_SERIES.slice(0, 11)).toEqual(PILAR_3_CORPOS);
    expect(PILAR_3_SERIES.slice(11, 14)).toEqual(PILAR_3_TRIGEMEO);
    expect(PILAR_3_SERIES.slice(14)).toEqual(PILAR_3_TEMPERAMENTO);
  });

  // 2 · pilar field
  it('every entry has pilar equal to "tantrica"', () => {
    for (const s of PILAR_3_SERIES) expect(s.pilar).toBe('tantrica');
  });

  // 3 · Required fields per sub-series
  // Typed const avoids the readonly-tuple for-of trap that TypeScript hoists.
  const shapeGroups: [string, SignificadoCurado[]][] = [
    ['PILAR_3_CORPOS', PILAR_3_CORPOS],
    ['PILAR_3_TRIGEMEO', PILAR_3_TRIGEMEO],
    ['PILAR_3_TEMPERAMENTO', PILAR_3_TEMPERAMENTO],
  ];
  for (const [label, group] of shapeGroups) {
    describe(`required fields: ${label}`, () => {
      for (const s of group) {
        it(`${s.titulo} has all required editorial fields`, () => {
          expect(s.id).toBeTruthy();
          expect(s.pilar).toBe('tantrica');
          expect(s.titulo).toBeTruthy();
          expect(s.essencia).toBeTruthy();
          expect(s.missao).toBeTruthy();
          expect(s.sombra).toBeTruthy();
          expect(s.pratica).toBeTruthy();
          expect(s.conexao).toBeTruthy();
          expect(s.fonte).toBeTruthy();
        });
        it(`${s.titulo} editorial fields are PT-BR`, () => {
          const text = [s.titulo, s.essencia, s.missao, s.sombra, s.pratica, s.conexao].join(' ');
          expect(text).toMatch(PT_BR_RE);
        });
      }
    });
  }

  // 4 · CORPOS: numeric IDs 1-11, no duplicates
  describe('CORPOS numeric IDs', () => {
    it('CORPOS IDs are the numbers 1 through 11', () => {
      const ids = PILAR_3_CORPOS.map((s) => s.id);
      for (let i = 1; i <= 11; i++) expect(ids).toContain(i);
    });
    it('CORPOS has no duplicate IDs', () => {
      const ids = PILAR_3_CORPOS.map((s) => s.id);
      expect(new Set(ids)).toHaveLength(11);
    });
  });

  // 5 · TRIGEMEO: string IDs fisico/astral/mental, no duplicates
  describe('TRIGEMEO string IDs', () => {
    const trigemeoIds = ['fisico', 'astral', 'mental'];
    it('TRIGEMEO has 3 entries', () => expect(PILAR_3_TRIGEMEO).toHaveLength(3));
    it('TRIGEMEO IDs are fisico, astral, mental', () => {
      const ids = PILAR_3_TRIGEMEO.map((s) => s.id);
      expect(ids).toEqual(trigemeoIds);
    });
    it('TRIGEMEO has no duplicate IDs', () => {
      const ids = PILAR_3_TRIGEMEO.map((s) => s.id);
      expect(new Set(ids)).toHaveLength(3);
    });
  });

  // 6 · TEMPERAMENTO: string IDs, no duplicates
  describe('TEMPERAMENTO string IDs', () => {
    const temperamentoIds = ['sanguineo', 'colerico', 'melancolico', 'fleumatico'];
    it('TEMPERAMENTO has 4 entries', () => expect(PILAR_3_TEMPERAMENTO).toHaveLength(4));
    it('TEMPERAMENTO IDs are sanguineo, colerico, melancolico, fleumatico', () => {
      const ids = PILAR_3_TEMPERAMENTO.map((s) => s.id);
      expect(ids).toEqual(temperamentoIds);
    });
    it('TEMPERAMENTO has no duplicate IDs', () => {
      const ids = PILAR_3_TEMPERAMENTO.map((s) => s.id);
      expect(new Set(ids)).toHaveLength(4);
    });
  });

  // 7 · Spot-check known entries
  describe('known entries', () => {
    it('Corpo da Alma (id 1) essencia contains core identity keywords', () => {
      const s = PILAR_3_CORPOS.find((s) => s.id === 1)!;
      expect(s.essencia).toMatch(/Núcleo|Identidade|presença/);
    });
    it('Corpo Sutil (id 9) essencia contains "Intuição" (PT-BR diacritic)', () => {
      const s = PILAR_3_CORPOS.find((s) => s.id === 9)!;
      expect(s.essencia).toContain('Intuição');
    });
    it('Mente Divina (id 11) essencia contains "Transcendência" (PT-BR diacritic)', () => {
      const s = PILAR_3_CORPOS.find((s) => s.id === 11)!;
      expect(s.essencia).toContain('Transcendência');
    });
    it('Trigêmeo Físico has id "fisico"', () => {
      const s = PILAR_3_TRIGEMEO.find((s) => s.id === 'fisico')!;
      expect(s.titulo).toBe('Trigêmeo · Físico');
    });
    it('Temperamento Sanguíneo has id "sanguineo"', () => {
      const s = PILAR_3_TEMPERAMENTO.find((s) => s.id === 'sanguineo')!;
      expect(s.titulo).toBe('Temperamento · Sanguíneo');
    });
  });
});
