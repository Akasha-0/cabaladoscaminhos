import { describe, expect, it } from 'vitest';
import type { SignificadoCurado } from './significados-curados';
import { PILAR_2_SERIES } from './significados-curados-pilar-2';

// Derive the three logical groups from the single public export (sub-arrays are
// module-private in the source — F-219/F-220 public-surface contract).
const PILAR_2_SIGNOS = PILAR_2_SERIES.filter(
  (s: SignificadoCurado): boolean => s.titulo.startsWith('Sol em '),
);
const PILAR_2_FASES_LUA = PILAR_2_SERIES.filter(
  (s: SignificadoCurado): boolean => s.titulo.startsWith('Lua '),
);
const PILAR_2_TRINITY = PILAR_2_SERIES.filter(
  (s: SignificadoCurado): boolean => s.titulo.startsWith('Tríade · '),
);

// Axioma 8 — PT-BR text detection over the combined text of all six editorial
// fields (titulo + essencia + missao + sombra + pratica + conexao).
// Covers entries whose individual fields lack diacritics (e.g. Sagitário
// "Buscar sentido…", Dom "Harmonia. Onde os planetas fluem.", Gêmeos missao).
const PT_BR_RE =
  /[áéíóúãõ\u00e7àèìòùâêîôû]|\b(o|a|os|as|de|do|da|dos|das|no|na|nos|nas|em|um|uma|uns|umas|para|com|sem|por|mais|mas|ou|e|que|qual|quais|quem|quando|onde|cujo|portanto|assim|então|pois|porque|seu|seus|sua|suas|este|esta|estes|estas|esse|essa|esses|essas|aquele|aquela|isso|aquilo|não|sim|mais|menos|muito|pouco|bem|mau|mesmo|mesma|mesmos|mesmas|todo|toda|todos|todas|vários|várias|outro|outra|outros|outras|próprio|própria|além|dentro|fora|antes|depois|entre|sobre|sob|ante|após|mediante|vista|através)\b/gi;

const REQUIRED_FIELDS: (keyof SignificadoCurado)[] = [
  'id',
  'pilar',
  'titulo',
  'essencia',
  'missao',
  'sombra',
  'pratica',
  'conexao',
  'fonte',
];

describe('significados-curados-pilar-2', () => {
  // ── 1 · Array sizes ─────────────────────────────────────────────────────

  it('PILAR_2_SIGNOS has exactly 12 entries', () => {
    expect(PILAR_2_SIGNOS).toHaveLength(12);
  });

  it('PILAR_2_FASES_LUA has exactly 4 entries', () => {
    expect(PILAR_2_FASES_LUA).toHaveLength(4);
  });

  it('PILAR_2_TRINITY has exactly 3 entries', () => {
    expect(PILAR_2_TRINITY).toHaveLength(3);
  });

  it('PILAR_2_SERIES has 19 entries (12 + 4 + 3)', () => {
    expect(PILAR_2_SERIES).toHaveLength(19);
  });

  it('PILAR_2_SERIES is the concatenation of the three groups (order-preserving)', () => {
    expect(PILAR_2_SERIES).toEqual([
      ...PILAR_2_SIGNOS,
      ...PILAR_2_FASES_LUA,
      ...PILAR_2_TRINITY,
    ]);
  });

  // ── 2 · pilar field ─────────────────────────────────────────────────────

  it('every entry in PILAR_2_SERIES has pilar equal to "astrologia"', () => {
    for (const s of PILAR_2_SERIES) {
      expect(s.pilar).toBe('astrologia');
    }
  });

  // ── 3 · Required fields & editorial axioms ───────────────────────────────

  for (const [label, group] of [
    ['PILAR_2_SIGNOS', PILAR_2_SIGNOS],
    ['PILAR_2_FASES_LUA', PILAR_2_FASES_LUA],
    ['PILAR_2_TRINITY', PILAR_2_TRINITY],
  ] as [string, SignificadoCurado[]][]) {
    describe(`${label} — shape`, () => {
      it('all required fields are present and non-empty', () => {
        for (const s of group) {
          for (const field of REQUIRED_FIELDS) {
            expect(s[field], `${label} item "${s.id}" missing field "${field}"`).toBeTruthy();
          }
        }
      });

      // Axioma 4 — "Citação obrigatória": every entry must cite a source.
      it('fonte is a non-empty citation string', () => {
        for (const s of group) {
          expect(
            typeof s.fonte === 'string' && s.fonte.trim().length > 0,
            `${label} item "${s.id}" has empty fonte`,
          ).toBe(true);
        }
      });

      // Axioma 8 — "PT-BR primeiro": combined text of all six editorial fields
      // must contain at least one PT-BR signal (diacritic or function word).
      it('combined editorial text is PT-BR (Axioma 8)', () => {
        for (const s of group) {
          const registro = [s.titulo, s.essencia, s.missao, s.sombra, s.pratica, s.conexao].join(' ');
          expect(
            PT_BR_RE.test(registro),
            `${label} item "${s.id}" does not appear to be PT-BR: "${registro}"`,
          ).toBe(true);
        }
      });

      // essencia ≤ 22 words (Axioma editorial — source comment line 16)
      it('essencia is at most 22 words', () => {
        for (const s of group) {
          const words = s.essencia.trim().split(/\s+/).filter(Boolean).length;
          expect(
            words <= 22,
            `${label} item "${s.id}" essencia has ${words} words (limit 22): "${s.essencia}"`,
          ).toBe(true);
        }
      });
    });
  }

  // ── 4 · Unique ids ───────────────────────────────────────────────────────

  for (const [label, group] of [
    ['PILAR_2_SIGNOS', PILAR_2_SIGNOS],
    ['PILAR_2_FASES_LUA', PILAR_2_FASES_LUA],
    ['PILAR_2_TRINITY', PILAR_2_TRINITY],
  ] as [string, SignificadoCurado[]][]) {
    it(`${label} has no duplicate ids`, () => {
      const ids = group.map((s: SignificadoCurado) => String(s.id));
      const seen = new Set<string>();
      const dups: string[] = [];
      for (const id of ids) {
        if (seen.has(id)) dups.push(id);
        else seen.add(id);
      }
      expect(dups.length, `${label} duplicate ids: ${dups.join(', ')}`).toBe(0);
    });
  }

  // ── 5 · as SignificadoCurado cast regression ────────────────────────────
  // Lua Cheia is the only entry with `as SignificadoCurado` (source line 189).
  // Verify it passes identical shape validation to all other entries.
  it('Lua Cheia entry passes the same shape validation as every other entry', () => {
    const luaCheia = PILAR_2_FASES_LUA.find((s: SignificadoCurado) => s.id === 'cheia');
    expect(luaCheia, 'Lua Cheia entry not found').toBeDefined();
    for (const field of REQUIRED_FIELDS) {
      expect(luaCheia![field], `Lua Cheia missing field "${field}"`).toBeTruthy();
    }
    const registro = [
      luaCheia!.titulo,
      luaCheia!.essencia,
      luaCheia!.missao,
      luaCheia!.sombra,
      luaCheia!.pratica,
      luaCheia!.conexao,
    ].join(' ');
    expect(PT_BR_RE.test(registro), `Lua Cheia not PT-BR: "${registro}"`).toBe(true);
    const words = luaCheia!.essencia.trim().split(/\s+/).filter(Boolean).length;
    expect(words, `Lua Cheia essencia word count: ${words}`).toBeLessThanOrEqual(22);
  });

  // ── 6 · Spot-check known entries ─────────────────────────────────────────

  describe('known entries', () => {
    it('Áries — titulo and pilar are correct', () => {
      const s = PILAR_2_SIGNOS.find((x: SignificadoCurado) => x.id === 'Áries')!;
      expect(s.titulo).toBe('Sol em Áries');
      expect(s.pilar).toBe('astrologia');
    });

    it('Touro — essencia ≤ 22 words', () => {
      const s = PILAR_2_SIGNOS.find((x: SignificadoCurado) => x.id === 'Touro')!;
      expect(s.essencia.trim().split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(22);
    });

    it('Gêmeos — missao contains PT-BR function word "mais"', () => {
      const s = PILAR_2_SIGNOS.find((x: SignificadoCurado) => x.id === 'Gêmeos')!;
      expect(s.missao).toContain('Pergunte mais');
    });

    it('Escorpião — pratica may be multi-line; word-count still valid', () => {
      const s = PILAR_2_SIGNOS.find((x: SignificadoCurado) => x.id === 'Escorpião')!;
      expect(s.pratica.trim().split(/\s+/).filter(Boolean).length).toBeGreaterThan(0);
    });

    it('Sagitário — essencia contains "Buscar" (PT-BR verb)', () => {
      const s = PILAR_2_SIGNOS.find((x: SignificadoCurado) => x.id === 'Sagitário')!;
      expect(s.essencia).toContain('Buscar');
    });

    it('Lua Nova — titulo and pilar are correct', () => {
      const s = PILAR_2_FASES_LUA.find((x: SignificadoCurado) => x.id === 'nova')!;
      expect(s.titulo).toBe('Lua Nova');
      expect(s.pilar).toBe('astrologia');
    });

    it('Lua Cheia — essencia includes "Colheita" keyword', () => {
      const s = PILAR_2_FASES_LUA.find((x: SignificadoCurado) => x.id === 'cheia')!;
      expect(s.essencia).toContain('Colheita');
    });

    it('Lua Minguante — sombra is non-empty', () => {
      const s = PILAR_2_FASES_LUA.find((x: SignificadoCurado) => x.id === 'minguante')!;
      expect(s.sombra.trim().length).toBeGreaterThan(0);
    });

    it('Tríade Sombra — titulo and essencia contain "Sombra" and "Tensão"', () => {
      const s = PILAR_2_TRINITY.find((x: SignificadoCurado) => x.id === 'sombra')!;
      expect(s.titulo).toBe('Tríade · Sombra');
      expect(s.essencia).toContain('Tensão');
    });

    it('Tríade Dom — essencia contains "Harmonia" and "onde" (PT-BR)', () => {
      const s = PILAR_2_TRINITY.find((x: SignificadoCurado) => x.id === 'dom')!;
      expect(s.essencia).toContain('Harmonia');
      const registro = [s.titulo, s.essencia, s.missao, s.sombra, s.pratica, s.conexao].join(' ');
      expect(PT_BR_RE.test(registro), `Dom trinity not PT-BR: "${registro}"`).toBe(true);
    });

    it('Tríade Graça — essencia contains "Alinhamento"', () => {
      const s = PILAR_2_TRINITY.find((x: SignificadoCurado) => x.id === 'graca')!;
      expect(s.essencia).toContain('Alinhamento');
    });

    it('Peixes — pilar is astrologia', () => {
      const s = PILAR_2_SIGNOS.find((x: SignificadoCurado) => x.id === 'Peixes')!;
      expect(s.pilar).toBe('astrologia');
    });
  });
});
