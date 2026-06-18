/**
 * Cobertura de `significados-curados-pilar-1.ts` (F-219, F-220).
 *
 * Foco: invariantes estruturais + princípios editoriais (VISION §3).
 * Não testamos CADA string (são dados curados, não lógica).
 */
import { describe, it, expect } from 'vitest';
import type { SignificadoCurado } from './significados-curados';
import { PILAR_1_SERIES } from './significados-curados-pilar-1';

const CAMPOS_OBRIGATORIOS: Array<keyof SignificadoCurado> = [
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

describe('significados-curados-pilar-1', () => {
  describe('PILAR_1_SERIES', () => {
    it('é um array não-vazio', () => {
      expect(Array.isArray(PILAR_1_SERIES)).toBe(true);
      expect(PILAR_1_SERIES.length).toBeGreaterThan(0);
    });

    it('contém 39 entradas: 12 Life Path (1-9, 11, 22, 33) + 9×3 séries secundárias', () => {
      // 12 (1-9, 11, 22, 33) + 9 (Birthday) + 9 (Expression) + 9 (Ano Pessoal) = 39
      expect(PILAR_1_SERIES).toHaveLength(39);
    });

    it('todos pertencem ao pilar "cabala"', () => {
      const naoCabala = PILAR_1_SERIES.filter((s) => s.pilar !== 'cabala');
      expect(naoCabala).toEqual([]);
    });

    it('IDs são únicos dentro de cada série (titulo-prefix)', () => {
      // IDs 1-9 são reutilizados entre Life Path, Birthday, Expression e Ano Pessoal
      // por design (cada série tem ids 1-9; só Life Path tem mestres 11/22/33).
      // O escopo de unicidade é o "prefixo" do titulo (série), não a série agregada.
      const porSerie = new Map<string, Array<string | number>>();
      PILAR_1_SERIES.forEach((s) => {
        // Extrai "série" do titulo: tudo antes do primeiro dígito.
        const serie = s.titulo.split(/\d/)[0] || s.titulo;
        if (!porSerie.has(serie)) porSerie.set(serie, []);
        porSerie.get(serie)!.push(s.id);
      });
      porSerie.forEach((ids, serie) => {
        const unicos = new Set(ids);
        expect(unicos.size, `série "${serie}" tem IDs duplicados: ${ids.join(',')}`).toBe(
          ids.length
        );
      });
    });

    it('IDs cobrem 1-9, 11, 22, 33 na série primária (Life Path)', () => {
      const lifePath = PILAR_1_SERIES.filter(
        (s) =>
          typeof s.id === 'number' &&
          s.id <= 33 &&
          s.titulo &&
          !/Expressão|Talento|Ano/.test(s.titulo)
      );
      const lifeIds = lifePath.map((s) => s.id).sort((a, b) => (a as number) - (b as number));
      // 1-9 + 11 + 22 + 33
      expect(lifeIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]);
    });

    it('toda entrada tem todos os campos obrigatórios preenchidos', () => {
      PILAR_1_SERIES.forEach((s, i) => {
        CAMPOS_OBRIGATORIOS.forEach((c) => {
          const valor = s[c];
          expect(valor, `entrada[${i}] campo "${c}" vazio`).toBeTruthy();
          if (typeof valor === 'string') {
            expect(
              valor.trim().length,
              `entrada[${i}] campo "${c}" só tem whitespace`
            ).toBeGreaterThan(0);
          }
        });
      });
    });
  });

  describe('princípios editoriais (VISION §3)', () => {
    it('Axioma 4 (citação obrigatória): todo significado tem fonte', () => {
      const semFonte = PILAR_1_SERIES.filter((s) => !s.fonte || s.fonte.trim().length === 0);
      expect(semFonte, 'entradas sem fonte').toEqual([]);
    });

    it('Axioma 8 (PT-BR primeiro): registros contêm marcadores PT-BR', () => {
      // Heurística: acentos comuns (á, é, í, ó, ú, ã, õ, ç) ou palavras funcionais.
      // 'fonte' é excluída: citações mantêm grafia original ("Sefer Yetzirah", "KRI 2007").
      // Avaliamos o registro inteiro (títulos curtos como "Pioneiro" não têm função-words).
      const PT_BR_RE =
        /[áéíóúãõçÁÉÍÓÚÃÕÇ]|\b(o|a|os|as|de|do|da|dos|das|em|no|na|nos|nas|por|para|com|sem|que|não|seu|sua|seus|suas)\b/i;
      const CAMPOS: Array<keyof SignificadoCurado> = [
        'titulo',
        'essencia',
        'missao',
        'sombra',
        'pratica',
        'conexao',
      ];
      PILAR_1_SERIES.forEach((s, i) => {
        const registro = CAMPOS.map((c) => s[c] as string).join(' ');
        const isPtBr = PT_BR_RE.test(registro);
        expect(
          isPtBr,
          `entrada[${i}] (id=${s.id}) sem marcadores PT-BR: "${registro.slice(0, 100)}…"`
        ).toBe(true);
      });
    });

    it('princípio de concisão: essencia ≤ 22 palavras', () => {
      // Diretriz editorial: cada essencia ≤ 22 palavras (VISION §3, curadoria).
      const longas = PILAR_1_SERIES.filter((s) => s.essencia.split(/\s+/).length > 22);
      expect(
        longas.map((s) => ({ id: s.id, n: s.essencia.split(/\s+/).length })),
        'essencias longas (>22 palavras)'
      ).toEqual([]);
    });
  });
});
