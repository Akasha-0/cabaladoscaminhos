/**
 * Testes para `significados-curados-helpers.ts` (F-219, F-220).
 *
 * Helper extraído de `significados-curados.ts` em refactor de T1.4 (commit
 * 6ab6ed7e / c2b80f26). Fornece a visão genérica por Pilar — usada quando
 * a API entrega apenas o Pilar ativo (ex: 'cabala') sem o símbolo
 * específico (ex: 11, 22).
 *
 * Princípios testados:
 * - Função pura, sem efeitos colaterais.
 * - PT-BR primeiro (Axioma 8 VISION.md §3).
 * - Cita fonte (Axioma 4).
 * - Pilar 4 (Odu) carrega `requer_terreiro: true` (R-022 §4.4).
 * - `id === pilar` para que `significadoPorPilar(pilar, pilar)` resolva
 *   via fallback genérico.
 */
import { describe, it, expect } from 'vitest';
import type { Pilar, SignificadoCurado } from './significados-curados';
import { significadoGenericoDoPilar } from './significados-curados-helpers';

const TODOS_PILARES: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];

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

describe('significados-curados-helpers: significadoGenericoDoPilar', () => {
  describe('cobertura por Pilar', () => {
    TODOS_PILARES.forEach((pilar) => {
      it(`Pilar ${pilar}: retorna visão genérica com todos os campos obrigatórios preenchidos`, () => {
        const v = significadoGenericoDoPilar(pilar);

        CAMPOS_OBRIGATORIOS.forEach((campo) => {
          const valor = v[campo];
          expect(
            typeof valor === 'string' && valor.trim().length > 0,
            `Pilar ${pilar}: campo obrigatório "${String(campo)}" vazio ou não-string`
          ).toBe(true);
        });
      });

      it(`Pilar ${pilar}: id === pilar e pilar === pilar (round-trip)`, () => {
        const v = significadoGenericoDoPilar(pilar);
        expect(v.id).toBe(pilar);
        expect(v.pilar).toBe(pilar);
      });
    });
  });

  describe('características específicas por Pilar', () => {
    it('Pilar 1 (Cabala): título é "Caminho de Vida" e cita fontes cabalísticas', () => {
      const v = significadoGenericoDoPilar('cabala');
      expect(v.titulo).toBe('Caminho de Vida');
      expect(v.fonte).toMatch(/Sefer Yetzirah|Mispar/i);
    });

    it('Pilar 2 (Astrologia): título é "Céu do seu nascimento" e cita Brennan', () => {
      const v = significadoGenericoDoPilar('astrologia');
      expect(v.titulo).toBe('Céu do seu nascimento');
      expect(v.fonte).toMatch(/Brennan/i);
    });

    it('Pilar 3 (Tântrica): título é "Anatomia sutil" e cita KRI/Yogi Bhajan', () => {
      const v = significadoGenericoDoPilar('tantrica');
      expect(v.titulo).toBe('Anatomia sutil');
      expect(v.fonte).toMatch(/KRI|Yogi Bhajan/i);
    });

    it('Pilar 4 (Odu): título é "Ori do seu nascimento", cita Verger/Mbiti E marca requer_terreiro=true', () => {
      const v = significadoGenericoDoPilar('odu');
      expect(v.titulo).toBe('Ori do seu nascimento');
      expect(v.fonte).toMatch(/Verger|Mbiti/i);
      // R-022 §4.4 — ética Ifá: visão genérica de Odu também exige terreiro.
      expect(v.requer_terreiro).toBe(true);
    });

    it('Pilar 4 (Odu) visão genérica tem pratica que sugere terreiro/vínculo ancestral', () => {
      const v = significadoGenericoDoPilar('odu');
      expect(v.pratica.toLowerCase()).toMatch(/ancestral|familiar|mais velho/);
    });

    it('Pilar 5 (I Ching): título é "Mutação do seu caminho" e cita Wilhelm/Baynes', () => {
      const v = significadoGenericoDoPilar('iching');
      expect(v.titulo).toBe('Mutação do seu caminho');
      expect(v.fonte).toMatch(/Wilhelm|Baynes/i);
    });

    it('Pilares 1-3 e 5 NÃO carregam requer_terreiro (apenas Pilar 4)', () => {
      const semRequer: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'iching'];
      semRequer.forEach((p) => {
        const v = significadoGenericoDoPilar(p);
        expect(
          v.requer_terreiro,
          `Pilar ${p} não deveria ter requer_terreiro=true`
        ).toBeUndefined();
      });
    });
  });

  describe('princípios editoriais (VISION.md §3)', () => {
    it('Axioma 4 (citação obrigatória): toda visão genérica cita fonte', () => {
      TODOS_PILARES.forEach((p) => {
        const v = significadoGenericoDoPilar(p);
        expect(v.fonte.length, `Pilar ${p} sem fonte`).toBeGreaterThan(0);
        // Não pode ser placeholder genérico
        expect(v.fonte).not.toBe('TBD');
        expect(v.fonte).not.toBe('N/A');
      });
    });

    it('Axioma 8 (PT-BR primeiro): registros contêm marcadores PT-BR', () => {
      // Heurística: presença de acentos comuns em PT-BR (á, é, í, ó, ú, ã, õ, ç)
      // ou palavras funcionais em pelo menos um campo textual.
      // 'fonte' é excluída: citações mantêm grafia original ("Sefer Yetzirah", "KRI 2007").
      // Títulos curtos ("Anatomia sutil") não contêm função-words — avaliamos o registro inteiro.
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
      TODOS_PILARES.forEach((p) => {
        const v = significadoGenericoDoPilar(p);
        const registro = CAMPOS.map((c) => v[c] as string).join(' ');
        const isPtBr = PT_BR_RE.test(registro);
        expect(
          isPtBr,
          `Pilar ${p} registro sem marcadores PT-BR: "${registro.slice(0, 100)}…"`
        ).toBe(true);
      });
    });

    it('conexao descreve o Pilar (não "undefined" / vazio)', () => {
      TODOS_PILARES.forEach((p) => {
        const v = significadoGenericoDoPilar(p);
        expect(v.conexao).toMatch(/Pilar \d/);
      });
    });
  });

  describe('imutabilidade / pureza', () => {
    it('chamadas repetidas retornam objetos independentes (sem aliasing)', () => {
      const a = significadoGenericoDoPilar('cabala');
      const b = significadoGenericoDoPilar('cabala');
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });

    it('não muta o objeto retornado em chamadas subsequentes', () => {
      const a = significadoGenericoDoPilar('astrologia');
      const aSnapshot = JSON.stringify(a);
      significadoGenericoDoPilar('astrologia');
      significadoGenericoDoPilar('iching');
      expect(JSON.stringify(a)).toBe(aSnapshot);
    });
  });
});
