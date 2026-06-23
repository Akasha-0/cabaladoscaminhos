import { describe, expect, it } from 'vitest';
import {
  SHADOW_BY_SATURNO_SIGN,
  SHADOW_BY_PLUTO_SIGN,
  SHADOW_BY_KARMIC_DEBT,
  SHADOW_BY_CHALLENGE,
  SHADOW_BY_ODU_PROHIBITION,
  shadowPrimtivoFrase,
} from './shadow-sintomas';
import type { SynthesizedPrimitivo } from '@akasha/core';

// PT_BR_RE — Axioma 8: detect PT-BR text via diacritics or common function words.
// Copied verbatim from significados-curados-pilar-2.test.ts to stay in sync.
// No /g flag so .test() can be called repeatedly on the same regex instance.
const PT_BR_RE =
  /[áéíóúãõ\u00e7àèìòùâêîôû]|\b(o|a|os|as|de|do|da|dos|das|no|na|nos|nas|em|um|uma|uns|umas|para|com|sem|por|mais|mas|ou|e|que|qual|quais|quem|quando|onde|cujo|portanto|assim|então|pois|porque|seu|seus|sua|suas|este|esta|estes|estas|esse|essa|esses|esses|aquele|aquela|isso|aquilo|não|sim|mais|menos|muito|pouco|bem|mau|mesmo|mesma|mesmos|mesmas|todo|toda|todos|todas|vários|várias|outro|outra|outros|outras|próprio|própria|além|dentro|fora|antes|depois|entre|sobre|sob|ante|após|mediante|vista|através)\b/gi;

// ─── Derived key sets ────────────────────────────────────────────────────────

const SATURNO_SIGNS = Object.keys(SHADOW_BY_SATURNO_SIGN);
const PLUTO_SIGNS = Object.keys(SHADOW_BY_PLUTO_SIGN);
const KARMIC_KEYS = Object.keys(SHADOW_BY_KARMIC_DEBT)
  .map(Number)
  .sort((a, b) => a - b);
const CHALLENGE_KEYS = Object.keys(SHADOW_BY_CHALLENGE)
  .map(Number)
  .sort((a, b) => a - b);
const ODÙ_KEYS = Object.keys(SHADOW_BY_ODU_PROHIBITION);

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('shadow-sintomas', () => {

  // ── 1 · Record sizes ───────────────────────────────────────────────────────

  describe('record sizes', () => {
    it('SHADOW_BY_SATURNO_SIGN has exactly 12 entries', () => {
      expect(SATURNO_SIGNS).toHaveLength(12);
    });

    it('SHADOW_BY_PLUTO_SIGN has exactly 12 entries', () => {
      expect(PLUTO_SIGNS).toHaveLength(12);
    });

    it('SHADOW_BY_KARMIC_DEBT has exactly 10 entries (keys 0–9)', () => {
      expect(KARMIC_KEYS).toHaveLength(10);
    });

    it('SHADOW_BY_CHALLENGE has exactly 10 entries (keys 0–9)', () => {
      expect(CHALLENGE_KEYS).toHaveLength(10);
    });

    it('SHADOW_BY_ODU_PROHIBITION has exactly 18 entries', () => {
      expect(ODÙ_KEYS).toHaveLength(18);
    });
  });

  // ── 2 · Key integrity ──────────────────────────────────────────────────────

  describe('SHADOW_BY_SATURNO_SIGN keys', () => {
    // Source uses non-accented 'Cancer' (not 'Câncer'), 'Carneiro' (not 'Áries').
    const expected = [
      'Touro', 'Carneiro', 'Gêmeos', 'Cancer', 'Leão', 'Virgem',
      'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
    ];
    it('keys are the 12 zodiac signs', () => {
      expect(SATURNO_SIGNS).toEqual(expected);
    });
  });

  describe('SHADOW_BY_PLUTO_SIGN keys', () => {
    it('keys match SHADOW_BY_SATURNO_SIGN exactly', () => {
      expect(PLUTO_SIGNS).toEqual(SATURNO_SIGNS);
    });
  });

  describe('SHADOW_BY_KARMIC_DEBT keys', () => {
    it('keys are exactly 0–9 as native numbers', () => {
      expect(KARMIC_KEYS).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('no string-coerced keys', () => {
      for (const k of KARMIC_KEYS) {
        expect(typeof k).toBe('number');
      }
    });
  });

  describe('SHADOW_BY_CHALLENGE keys', () => {
    it('keys are exactly 0–9 as native numbers', () => {
      expect(CHALLENGE_KEYS).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('no string-coerced keys', () => {
      for (const k of CHALLENGE_KEYS) {
        expect(typeof k).toBe('number');
      }
    });
  });

  describe('SHADOW_BY_ODU_PROHIBITION keys', () => {
    it('all keys are lowercase strings', () => {
      for (const k of ODÙ_KEYS) {
        expect(k).toBe(k.toLowerCase());
      }
    });

    it('all keys are single words (no spaces or hyphens)', () => {
      for (const k of ODÙ_KEYS) {
        expect(k).not.toMatch(/\s|-/);
      }
    });
  });

  // ── 3 · Non-empty values ──────────────────────────────────────────────────

  for (const sign of SATURNO_SIGNS) {
    describe(`SHADOW_BY_SATURNO_SIGN["${sign}"]`, () => {
      it('value is non-empty', () => {
        expect(SHADOW_BY_SATURNO_SIGN[sign].trim().length).toBeGreaterThan(0);
      });
      it('value is PT-BR', () => {
        PT_BR_RE.lastIndex = 0;
        expect(PT_BR_RE.test(SHADOW_BY_SATURNO_SIGN[sign])).toBe(true);
      });
      it('value ends with a period', () => {
        expect(SHADOW_BY_SATURNO_SIGN[sign]).toMatch(/\.$/);
      });
    });
  }

  for (const sign of PLUTO_SIGNS) {
    describe(`SHADOW_BY_PLUTO_SIGN["${sign}"]`, () => {
      it('value is non-empty', () => {
        expect(SHADOW_BY_PLUTO_SIGN[sign].trim().length).toBeGreaterThan(0);
      });
      it('value is PT-BR', () => {
        PT_BR_RE.lastIndex = 0;
        expect(PT_BR_RE.test(SHADOW_BY_PLUTO_SIGN[sign])).toBe(true);
      });
      it('value ends with a period', () => {
        expect(SHADOW_BY_PLUTO_SIGN[sign]).toMatch(/\.$/);
      });
    });
  }

  for (const k of KARMIC_KEYS) {
    describe(`SHADOW_BY_KARMIC_DEBT[${k}]`, () => {
      it('value is non-empty', () => {
        expect(SHADOW_BY_KARMIC_DEBT[k].trim().length).toBeGreaterThan(0);
      });
      it('value is PT-BR', () => {
        PT_BR_RE.lastIndex = 0;
        expect(PT_BR_RE.test(SHADOW_BY_KARMIC_DEBT[k])).toBe(true);
      });
      it('value ends with a period', () => {
        expect(SHADOW_BY_KARMIC_DEBT[k]).toMatch(/\.$/);
      });
    });
  }

  for (const k of CHALLENGE_KEYS) {
    describe(`SHADOW_BY_CHALLENGE[${k}]`, () => {
      it('value is non-empty', () => {
        expect(SHADOW_BY_CHALLENGE[k].trim().length).toBeGreaterThan(0);
      });
      it('value is PT-BR', () => {
        PT_BR_RE.lastIndex = 0;
        expect(PT_BR_RE.test(SHADOW_BY_CHALLENGE[k])).toBe(true);
      });
      it('value ends with a period', () => {
        expect(SHADOW_BY_CHALLENGE[k]).toMatch(/\.$/);
      });
    });
  }

  for (const k of ODÙ_KEYS) {
    describe(`SHADOW_BY_ODU_PROHIBITION["${k}"]`, () => {
      it('value is non-empty', () => {
        expect(SHADOW_BY_ODU_PROHIBITION[k].trim().length).toBeGreaterThan(0);
      });
      it('value is PT-BR', () => {
        PT_BR_RE.lastIndex = 0;
        expect(PT_BR_RE.test(SHADOW_BY_ODU_PROHIBITION[k])).toBe(true);
      });
      it('value ends with a period', () => {
        expect(SHADOW_BY_ODU_PROHIBITION[k]).toMatch(/\.$/);
      });
    });
  }

  // ── 4 · Spot-check known entries ──────────────────────────────────────────

  describe('spot-check known keys', () => {
    it('SHADOW_BY_SATURNO_SIGN["Touro"] is truthy', () => {
      expect(Boolean(SHADOW_BY_SATURNO_SIGN['Touro'])).toBe(true);
    });

    it('SHADOW_BY_SATURNO_SIGN["Leão"] is truthy', () => {
      expect(Boolean(SHADOW_BY_SATURNO_SIGN['Leão'])).toBe(true);
    });

    it('SHADOW_BY_SATURNO_SIGN["Peixes"] is truthy', () => {
      expect(Boolean(SHADOW_BY_SATURNO_SIGN['Peixes'])).toBe(true);
    });

    it('SHADOW_BY_PLUTO_SIGN["Escorpião"] is truthy', () => {
      expect(Boolean(SHADOW_BY_PLUTO_SIGN['Escorpião'])).toBe(true);
    });

    it('SHADOW_BY_PLUTO_SIGN["Capricórnio"] is truthy', () => {
      expect(Boolean(SHADOW_BY_PLUTO_SIGN['Capricórnio'])).toBe(true);
    });

    it('SHADOW_BY_KARMIC_DEBT[1] starts with "Você carrega"', () => {
      expect(SHADOW_BY_KARMIC_DEBT[1]).toMatch(/^Você carrega/);
    });

    it('SHADOW_BY_KARMIC_DEBT[0] contains "dívida kármica"', () => {
      expect(SHADOW_BY_KARMIC_DEBT[0]).toContain('dívida kármica');
    });

    it('SHADOW_BY_CHALLENGE[0] is truthy', () => {
      expect(Boolean(SHADOW_BY_CHALLENGE[0])).toBe(true);
    });

    it('SHADOW_BY_ODU_PROHIBITION["sexo"] is truthy', () => {
      expect(Boolean(SHADOW_BY_ODU_PROHIBITION['sexo'])).toBe(true);
    });

    it('SHADOW_BY_ODU_PROHIBITION["morte"] mentions renascimento or finais', () => {
      expect(SHADOW_BY_ODU_PROHIBITION['morte']).toMatch(/renac(?:er|imento)|finais?/i);
    });
  });

  // ── 5 · shadowPrimtivoFrase function ──────────────────────────────────────
  // Bonus: covered since the export is present. Tests use correct SynthesizedPrimitivo shape
  // (unaccented Primitivo literals, Polaridade = 'luz'|'sombra'|'ambas',
  //  all required fields: convergencia, dominante, contributions).

  describe('shadowPrimtivoFrase', () => {
    it('is a function', () => {
      expect(typeof shadowPrimtivoFrase).toBe('function');
    });

    it('returns a non-empty string for a valid SynthesizedPrimitivo', () => {
      const mock: SynthesizedPrimitivo = {
        primitivo: 'Amor',
        magnitude: 3,
        convergencia: 0.8,
        polaridade: 'luz',
        dominante: false,
        contributions: [],
      };
      const result = shadowPrimtivoFrase(mock);
      expect(typeof result).toBe('string');
      expect(result.trim().length).toBeGreaterThan(0);
    });

    it('output contains the primitivo name (unaccented)', () => {
      const mock: SynthesizedPrimitivo = {
        primitivo: 'Transformacao',
        magnitude: 9,
        convergencia: 0.8,
        polaridade: 'luz',
        dominante: false,
        contributions: [],
      };
      expect(shadowPrimtivoFrase(mock)).toContain('Transformacao');
    });

    it('returns "Sombra intensa" when magnitude >= 8', () => {
      const mock: SynthesizedPrimitivo = {
        primitivo: 'Poder',
        magnitude: 10,
        convergencia: 0.8,
        polaridade: 'luz',
        dominante: false,
        contributions: [],
      };
      expect(shadowPrimtivoFrase(mock)).toContain('intenso');
    });

    it('returns "Sombra moderada" when 5 <= magnitude < 8', () => {
      const mock: SynthesizedPrimitivo = {
        primitivo: 'Sabedoria',
        magnitude: 5,
        convergencia: 0.8,
        polaridade: 'luz',
        dominante: false,
        contributions: [],
      };
      expect(shadowPrimtivoFrase(mock)).toContain('moderado');
    });

    it('returns "Sombra leve" when magnitude < 5', () => {
      const mock: SynthesizedPrimitivo = {
        primitivo: 'Conexao',
        magnitude: 2,
        convergencia: 0.8,
        polaridade: 'luz',
        dominante: false,
        contributions: [],
      };
      expect(shadowPrimtivoFrase(mock)).toContain('leve');
    });
  });
});
