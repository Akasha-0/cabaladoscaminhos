import { describe, expect, it } from 'vitest';
import type { SignificadoCurado } from './significados-curados';
import { PILAR_5_HEXAGRAMAS_1_32 } from './significados-curados-pilar-5a';

// Axioma 8 — PT-BR text detection over the combined text of all editorial
// fields (titulo + essencia + missao + sombra + pratica + conexao).
const PT_BR_RE =
  /[áéíóúãõ\u00e7àèìòùâêîôû]|\b(o|a|os|as|de|do|da|dos|das|no|na|nos|nas|em|um|uma|uns|umas|para|com|sem|por|mais|mas|ou|e|que|qual|quais|quem|quando|onde|cujo|portanto|assim|então|pois|porque|seu|seus|sua|suas|este|esta|estes|estas|esse|essa|esses|aquele|aquela|isso|aquilo|não|sim|mais|menos|muito|pouco|bem|mau|mesmo|mesma|mesmos|mesmas|todo|toda|todos|todas|vários|várias|outro|outra|outros|outras|próprio|própria|além|dentro|fora|antes|depois|entre|sobre|sob|ante|após|mediante|vista|através)\b/gi;

describe('significados-curados-pilar-5a', () => {
  // 1 · Array size
  it('PILAR_5_HEXAGRAMAS_1_32 has exactly 32 entries', () => {
    expect(PILAR_5_HEXAGRAMAS_1_32).toHaveLength(32);
  });

  // 2 · pilar field
  it('every entry has pilar equal to "iching"', () => {
    for (const s of PILAR_5_HEXAGRAMAS_1_32) expect(s.pilar).toBe('iching');
  });

  // 3 · IDs are contiguous integers 1-32 (King Wen sequence)
  describe('ID sequence: 1-32 (King Wen)', () => {
    const ids = PILAR_5_HEXAGRAMAS_1_32.map((s) => s.id as number);

    it('has exactly 32 numeric IDs', () => {
      expect(ids.every((id) => typeof id === 'number')).toBe(true);
      expect(ids).toHaveLength(32);
    });
    it('min ID is 1', () => expect(Math.min(...ids)).toBe(1));
    it('max ID is 32', () => expect(Math.max(...ids)).toBe(32));
    it('no duplicate IDs', () => expect(new Set(ids)).toHaveLength(32));
    it('all IDs are unique integers in [1, 32]', () => {
      const sorted = [...ids].sort((a, b) => a - b);
      for (let i = 0; i < 32; i++) expect(sorted[i]).toBe(i + 1);
    });
  });

  // 4 · Required fields, editorial fields, PT-BR, titulo shape
  for (const s of PILAR_5_HEXAGRAMAS_1_32) {
    it(`${s.titulo} has all required editorial fields`, () => {
      expect(s.id).toBeTruthy();
      expect(s.pilar).toBe('iching');
      expect(s.titulo).toBeTruthy();
      expect(s.essencia).toBeTruthy();
      expect(s.missao).toBeTruthy();
      expect(s.sombra).toBeTruthy();
      expect(s.pratica).toBeTruthy();
      expect(s.conexao).toBeTruthy();
      expect(s.fonte).toBeTruthy();
    });

    // Assignment spec: "Check titulo contains 'Hexagrama N' pattern"
    // Actual source format: "1. O Criador (Qian)" — digit + dot + space
    it(`${s.titulo} titulo matches /^\d+\.\s/ (hexagrama number prefix)`, () => {
      expect(s.titulo).toMatch(/^\d+\.\s/);
    });

    it(`${s.titulo} editorial text is PT-BR`, () => {
      const text = [s.titulo, s.essencia, s.missao, s.sombra, s.pratica, s.conexao].join(' ');
      expect(text).toMatch(PT_BR_RE);
    });
  }

  // 5 · Known entries spot-check
  describe('known entries', () => {
    it('Hexagrama 1 (O Criador) has correct pilar and fuente', () => {
      const h = PILAR_5_HEXAGRAMAS_1_32.find((s) => s.id === 1);
      expect(h?.pilar).toBe('iching');
      expect(h?.fonte).toBe('Wilhelm/Baynes 1950');
    });

    it('Hexagrama 32 (A Duração) closes the first 32', () => {
      const h = PILAR_5_HEXAGRAMAS_1_32.find((s) => s.id === 32);
      expect(h?.titulo).toBe('32. A Duração (Heng)');
    });
  });
});
