/**
 * Testes para `significados-curados-escala-temporal.ts` (F-219, F-220).
 *
 * 4 escalas de Mandato: D (Dia), S (Semana), Z (Zodíaco), V (Vida).
 *
 * Princípios testados:
 * - 4 entradas, IDs únicos: D, S, Z, V.
 * - Todos pilar === 'cabala'.
 * - PT-BR primeiro em campos de conteúdo (não labels/titulos).
 * - Campos obrigatórios de SignificadoCurado presentes.
 * - essencia ≤ 22 palavras.
 * - Cada escala tem pratica sem \n.
 * - conexao referencia outros pilares.
 * - fonte contém 'VISION §4' para todas.
 */
import { describe, it, expect } from 'vitest';
import { ESCALA_TEMPORAL } from './significados-curados-escala-temporal';
import type { SignificadoCurado } from './significados-curados';

const CAMPOS_OBRIGATORIOS: (keyof SignificadoCurado)[] = [
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

const PT_BR_RE_SOURCE =
  /[áéíóúãõ\u00e7àèìòùâêîôû]|\b(o|a|os|as|de|do|da|dos|das|no|na|nos|nas|em|um|uma|uns|umas|para|com|sem|por|mais|mas|ou|e|que|qual|quais|quem|quando|onde|cujo|portanto|assim|então|pois|porque|seu|seus|sua|suas|este|esta|estes|estas|esse|essa|esses|essas|aquele|aquela|isso|aquilo|não|sim|mais|menos|muito|pouco|bem|mau|mesmo|mesma|mesmos|mesmas|todo|toda|todos|todas|vários|várias|outro|outra|outros|outras|próprio|própria|além|dentro|fora|antes|depois|entre|sobre|sob|ante|após|mediante|vista|através)\b/
    .source;

const CAMPOS_TEXTO_PT: (keyof SignificadoCurado)[] = [
  'essencia',
  'missao',
  'sombra',
  'pratica',
  'conexao',
];

describe('ESCALA_TEMPORAL', () => {
  describe('estrutura básica', () => {
    it('tem exatamente 4 entradas', () => {
      expect(ESCALA_TEMPORAL).toHaveLength(4);
    });

    it('cada entrada tem id único', () => {
      const ids = ESCALA_TEMPORAL.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('os IDs são D, S, Z, V', () => {
      const ids = new Set(ESCALA_TEMPORAL.map((e) => e.id));
      expect(ids).toEqual(new Set(['D', 'S', 'Z', 'V']));
    });

    it('todos pilar === cabala', () => {
      ESCALA_TEMPORAL.forEach((e) => {
        expect(e.pilar).toBe('cabala');
      });
    });
  });

  describe('campos obrigatórios (SignificadoCurado)', () => {
    ESCALA_TEMPORAL.forEach((entry) => {
      CAMPOS_OBRIGATORIOS.forEach((campo) => {
        it(`${entry.id}: campo "${campo}" existe e não é vazio`, () => {
          const value = entry[campo];
          expect(value).toBeDefined();
          expect(typeof value).toBe('string');
          expect((value as string).trim().length).toBeGreaterThan(0);
        });
      });
    });

    it('nenhuma entrada tem requer_terreiro (não é Pilar 4/Odu)', () => {
      ESCALA_TEMPORAL.forEach((e) => {
        expect(e).not.toHaveProperty('requer_terreiro');
      });
    });
  });

  describe('formato de titulo', () => {
    it('todos titulos começam com "Escala ·"', () => {
      ESCALA_TEMPORAL.forEach((e) => {
        expect(e.titulo).toMatch(/^Escala ·/);
      });
    });

    it('cada escala tem titulo diferente', () => {
      const titulos = ESCALA_TEMPORAL.map((e) => e.titulo);
      expect(new Set(titulos).size).toBe(titulos.length);
    });
  });

  describe('essencia ≤ 22 palavras', () => {
    ESCALA_TEMPORAL.forEach((e) => {
      it(`${e.id}: essencia ≤ 22 palavras`, () => {
        const words = e.essencia.trim().split(/\s+/).filter(Boolean);
        expect(words.length).toBeLessThanOrEqual(22);
      });
    });
  });

  describe('pratica é uma única linha (sem \\n)', () => {
    ESCALA_TEMPORAL.forEach((e) => {
      it(`${e.id}: pratica não contém quebra de linha`, () => {
        expect(e.pratica).not.toMatch(/\n/);
      });
    });
  });

  describe('conexao menciona Pilar ou sistema externo', () => {
    ESCALA_TEMPORAL.forEach((e) => {
      it(`${e.id}: conexao referencia outro Pilar/sistema`, () => {
        const texto = [e.conexao, e.sombra, e.missao].join(' ');
        expect(/P\d|Zodíaco|Lua|Ano Pessoal|Saturno|Mente|Divina/i.test(texto)).toBe(true);
      });
    });
  });

  describe('fonte contém VISION §4', () => {
    ESCALA_TEMPORAL.forEach((e) => {
      it(`${e.id}: fonte referencia VISION §4`, () => {
        expect(e.fonte).toMatch(/VISION §4/i);
      });
    });
  });

  describe('PT-BR em campos de conteúdo (Axioma 8)', () => {
    ESCALA_TEMPORAL.forEach((entry) => {
      CAMPOS_TEXTO_PT.forEach((campo) => {
        it(`${entry.id} ${campo}: contém PT_BR`, () => {
          const texto = entry[campo] as string;
          expect(new RegExp(PT_BR_RE_SOURCE, 'i').test(texto)).toBe(true);
        });
      });
    });
  });

  describe('missao contém pergunta de auto-reflexão', () => {
    ESCALA_TEMPORAL.forEach((e) => {
      it(`${e.id}: missao termina com ?`, () => {
        expect(e.missao.trim()).toMatch(/\?$/);
      });
    });
  });

  describe('sombra é distinta da missao', () => {
    ESCALA_TEMPORAL.forEach((e) => {
      it(`${e.id}: sombra diferente da missao`, () => {
        expect(e.sombra).not.toBe(e.missao);
      });
    });
  });
});
