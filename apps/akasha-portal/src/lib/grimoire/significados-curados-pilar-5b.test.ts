import { describe, expect, it } from 'vitest';
import type { SignificadoCurado } from './significados-curados';
import { PILAR_5_HEXAGRAMAS_33_64 } from './significados-curados-pilar-5b';

// Axioma 8 — PT-BR text detection (matches pilar-2 exactly).
// Non-global so lastIndex never drifts across repeated test() calls.
const PT_BR_RE_SOURCE =
  /[áéíóúãõ\u00e7àèìòùâêîôû]|\b(o|a|os|as|de|do|da|dos|das|no|na|nos|nas|em|um|uma|uns|umas|para|com|sem|por|mais|mas|ou|e|que|qual|quais|quem|quando|onde|cujo|portanto|assim|então|pois|porque|seu|seus|sua|suas|este|esta|estes|estas|esse|essa|esses|essas|aquele|aquela|isso|aquilo|não|sim|mais|menos|muito|pouco|bem|mau|mesmo|mesma|mesmos|mesmas|todo|toda|todos|todas|vários|várias|outro|outra|outros|outras|próprio|própria|além|dentro|fora|antes|depois|entre|sobre|sob|ante|após|mediante|vista|através)\b/
    .source;
const PT_BR_RE = new RegExp(PT_BR_RE_SOURCE, 'gi');
const PT_BR_RE_TEST = new RegExp(PT_BR_RE_SOURCE, ''); // non-global, no lastIndex

describe('significados-curados-pilar-5b', () => {
  // ── 1 · Array size ──────────────────────────────────────────────────────

  it('PILAR_5_HEXAGRAMAS_33_64 has exactly 32 entries', () => {
    expect(PILAR_5_HEXAGRAMAS_33_64).toHaveLength(32);
  });

  // ── 2 · pilar field ─────────────────────────────────────────────────────

  it('every entry has pilar equal to "iching"', () => {
    for (const s of PILAR_5_HEXAGRAMAS_33_64) {
      expect(s.pilar).toBe('iching');
    }
  });

  // ── 3 · ID range and uniqueness ─────────────────────────────────────────

  it('ids are contiguous integers 33–64 with no gaps or duplicates', () => {
    const ids = PILAR_5_HEXAGRAMAS_33_64.map((s: SignificadoCurado) => s.id as number);
    ids.sort((a, b) => a - b);
    expect(ids[0]).toBe(33);
    expect(ids[ids.length - 1]).toBe(64);
    for (let i = 0; i < ids.length; i++) {
      expect(ids[i]).toBe(33 + i);
    }
  });

  // ── 4 · Shape — all 32 entries, one describe block ──────────────────────

  describe('shape (all 32 entries)', () => {
    it('all required fields are present and non-empty', () => {
      for (const s of PILAR_5_HEXAGRAMAS_33_64) {
        expect(s.id, `id ${s.id}`).toBeTruthy();
        expect(s.pilar, `id ${s.id}`).toBe('iching');
        expect(s.titulo, `id ${s.id}`).toBeTruthy();
        expect(s.essencia, `id ${s.id}`).toBeTruthy();
        expect(s.missao, `id ${s.id}`).toBeTruthy();
        expect(s.sombra, `id ${s.id}`).toBeTruthy();
        expect(s.pratica, `id ${s.id}`).toBeTruthy();
        expect(s.conexao, `id ${s.id}`).toBeTruthy();
        expect(s.fonte, `id ${s.id}`).toBeTruthy();
      }
    });

    // Axioma 4 — "Citação obrigatória"
    it('fonte is a non-empty citation string on every entry', () => {
      for (const s of PILAR_5_HEXAGRAMAS_33_64) {
        expect(
          typeof s.fonte === 'string' && s.fonte.trim().length > 0,
          `id ${s.id} has empty fonte`,
        ).toBe(true);
      }
    });

    // Editorial axiom: essencia ≤ 22 words (matches pilar-2)
    it('essencia is at most 22 words on every entry', () => {
      for (const s of PILAR_5_HEXAGRAMAS_33_64) {
        const words = s.essencia.trim().split(/\s+/).filter(Boolean).length;
        expect(
          words <= 22,
          `id ${s.id} essencia has ${words} words (limit 22): "${s.essencia}"`,
        ).toBe(true);
      }
    });

    // titulo pattern: numeric prefix "N. " equivalent to pilar-2's startsWith checks
    it('every titulo matches /^\\d+\\.\\s/ and the number equals the id', () => {
      for (const s of PILAR_5_HEXAGRAMAS_33_64) {
        const match = s.titulo.match(/^(\d+)\.\s(.+)/);
        expect(match, `id ${s.id} titulo "${s.titulo}" has no leading number`).not.toBeNull();
        expect(Number(match![1])).toBe(s.id);
      }
    });

    // conexao matches the cross-pilar pattern "Hexagrama N (P5)"
    it('conexao contains "Hexagrama N (P5)" cross-reference on every entry', () => {
      for (const s of PILAR_5_HEXAGRAMAS_33_64) {
        expect(
          /Hexagrama\s+\d+\s+\(P5\)/.test(s.conexao),
          `id ${s.id} conexao "${s.conexao}" does not match Hexagrama N (P5) pattern`,
        ).toBe(true);
      }
    });

    // Axioma 8 — PT-BR
    it('combined editorial text is PT-BR on every entry', () => {
      for (const s of PILAR_5_HEXAGRAMAS_33_64) {
        const registro = [
          s.titulo,
          s.essencia,
          s.missao,
          s.sombra,
          s.pratica,
          s.conexao,
        ].join(' ');
        expect(
          PT_BR_RE_TEST.test(registro),
          `id ${s.id} does not appear to be PT-BR: "${registro}"`,
        ).toBe(true);
      }
    });
  });

  // ── 5 · Spot-check known entries ───────────────────────────────────────

  describe('known entries', () => {
    it('Hexagrama 33 — titulo and pilar are correct', () => {
      const s = PILAR_5_HEXAGRAMAS_33_64.find((x: SignificadoCurado) => x.id === 33)!;
      expect(s.titulo).toBe('33. A Retirada (Dun)');
      expect(s.pilar).toBe('iching');
    });

    it('Hexagrama 50 — titulo contains "Cachimbo" and "Ding"', () => {
      const s = PILAR_5_HEXAGRAMAS_33_64.find((x: SignificadoCurado) => x.id === 50)!;
      expect(s.titulo).toContain('Cachimbo');
      expect(s.titulo).toContain('Ding');
    });

    it('Hexagrama 63 — essencia references "ordem"', () => {
      const s = PILAR_5_HEXAGRAMAS_33_64.find((x: SignificadoCurado) => x.id === 63)!;
      expect(s.essencia).toContain('ordem');
    });

    it('Hexagrama 64 — exact titulo match', () => {
      const s = PILAR_5_HEXAGRAMAS_33_64.find((x: SignificadoCurado) => x.id === 64)!;
      expect(s.titulo).toBe('64. Antes da Conclusão (Wei Ji)');
    });

    it('Hexagrama 60 — sombra contains "Restrição"', () => {
      const s = PILAR_5_HEXAGRAMAS_33_64.find((x: SignificadoCurado) => x.id === 60)!;
      expect(s.sombra).toContain('Restrição');
    });

    it('Hexagrama 59 — pratica is non-empty', () => {
      const s = PILAR_5_HEXAGRAMAS_33_64.find((x: SignificadoCurado) => x.id === 59)!;
      expect(s.pratica.trim().length).toBeGreaterThan(0);
    });

    it('Hexagrama 62 — missao contains "pequeno" or "Excesso"', () => {
      const s = PILAR_5_HEXAGRAMAS_33_64.find((x: SignificadoCurado) => x.id === 62)!;
      expect(s.missao.toLowerCase()).toMatch(/pequeno|excesso/);
    });

    it('Hexagrama 58 — conexao links to Sanguíneo and Criador', () => {
      const s = PILAR_5_HEXAGRAMAS_33_64.find((x: SignificadoCurado) => x.id === 58)!;
      expect(s.conexao).toContain('Sanguíneo');
      expect(s.conexao).toContain('Criador');
    });
  });
});
