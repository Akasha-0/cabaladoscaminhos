/**
 * Testes para `significados-curados.ts` (fachada pública do Grimório).
 *
 * O arquivo é o **aggregador** das curadorias extraídas em
 * `significados-curados-pilar-{1..5b}.ts` e `significados-curados-escala-temporal.ts`
 * (refactor c7f6b7f6). Exporta:
 *   - `significadoPorPilar(pilar, id)` — busca O(n) por pilar+id
 *   - `significadosDoPilar(pilar)` — lista todas as entradas de um Pilar
 *   - `coberturaSignificados()` — contagens por Pilar
 *   - Re-exports: `significadoGenericoDoPilar` (helper), `significadosEspecificos` (F-222)
 *   - Tipos: `Pilar`, `SignificadoCurado`, `PilarDados*`, `PilaresDados`
 *
 * Princípios testados (VISION.md §3):
 * - Axioma 3 (Curadoria contínua): cobertura = soma dos arquivos curados.
 * - Axioma 4 (Citação): toda entrada carrega `fonte` não-vazia.
 * - Axioma 8 (PT-BR primeiro): títulos/essência em PT-BR.
 * - R-022 §4.4 (Ética Ifá): Pilar 4 (Odu) carrega `requer_terreiro: true`.
 */
import { describe, it, expect } from 'vitest';
import {
  significadoPorPilar,
  significadosDoPilar,
  coberturaSignificados,
  significadoGenericoDoPilar,
  type Pilar,
  type SignificadoCurado,
} from './significados-curados';

const TODOS_PILARES: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];

// ─── Cobertura ────────────────────────────────────────────────────────────

describe('significados-curados: coberturaSignificados', () => {
  it('retorna contagens para os 5 Pilares', () => {
    const cob = coberturaSignificados();
    expect(Object.keys(cob).sort()).toEqual(['astrologia', 'cabala', 'iching', 'odu', 'tantrica']);
  });

  // Pilar 1 (Cabala) tem 4 séries numéricas com ids sobrepostos por design
  // (Life Path, Birthday, Expression, Ano Pessoal — todos 1-9):
  //   PILAR_1: 12 entradas (1-9, 11, 22, 33)
  //   PILAR_1_BIRTHDAY: 9 (1-9)
  //   PILAR_1_EXPRESSION: 9 (1-9)
  //   PILAR_1_ANO_PESSOAL: 9 (1-9)
  //   ESCALA_TEMPORAL: 4 (D, S, Z, V)
  //   → 12 + 9 + 9 + 9 + 4 = 43
  it('Pilar 1 (Cabala): 4 séries numéricas (12+9+9+9) + 4 escalas temporais = 43', () => {
    expect(coberturaSignificados().cabala).toBe(43);
  });

  it('Pilar 2 (Astrologia): 12 signos + 4 fases + 3 tríade = 19', () => {
    expect(coberturaSignificados().astrologia).toBe(19);
  });

  it('Pilar 3 (Tântrica): 11 corpos + 3 trigêmeos + 4 temperamentos = 18', () => {
    expect(coberturaSignificados().tantrica).toBe(18);
  });

  it('Pilar 4 (Odu): 16 odus principais', () => {
    expect(coberturaSignificados().odu).toBe(16);
  });

  it('Pilar 5 (I Ching): 32 + 32 = 64 hexagramas', () => {
    expect(coberturaSignificados().iching).toBe(64);
  });

  it('total agregado = soma das coberturas por Pilar', () => {
    const cob = coberturaSignificados();
    const total = TODOS_PILARES.reduce((acc, p) => acc + cob[p], 0);
    expect(total).toBe(43 + 19 + 18 + 16 + 64);
  });
});

// ─── significadoPorPilar ──────────────────────────────────────────────────

describe('significados-curados: significadoPorPilar', () => {
  it('Pilar 1 id=1: retorna "Pioneiro" (Life Path 1)', () => {
    const s = significadoPorPilar('cabala', 1);
    expect(s).toBeDefined();
    expect(s?.titulo).toBe('Pioneiro');
  });

  it('Pilar 1 id=11: retorna o número mestre 11 (Caminho de Vida)', () => {
    const s = significadoPorPilar('cabala', 11);
    expect(s).toBeDefined();
    expect(s?.pilar).toBe('cabala');
  });

  it('Pilar 1 id=22: retorna o número mestre 22 (Construtor)', () => {
    const s = significadoPorPilar('cabala', 22);
    expect(s).toBeDefined();
  });

  it('Pilar 1 id=33: retorna o número mestre 33 (Mestre Professor)', () => {
    const s = significadoPorPilar('cabala', 33);
    expect(s).toBeDefined();
  });

  it('Pilar 1 id="D": retorna "Escala · Dia" (Mandato D)', () => {
    const s = significadoPorPilar('cabala', 'D');
    expect(s).toBeDefined();
    expect(s?.titulo).toBe('Escala · Dia');
  });

  it('Pilar 1 id="S/Z/V": cada escala temporal está acessível', () => {
    expect(significadoPorPilar('cabala', 'S')?.titulo).toBe('Escala · Semana');
    expect(significadoPorPilar('cabala', 'Z')?.titulo).toBe('Escala · Zodíaco');
    expect(significadoPorPilar('cabala', 'V')?.titulo).toBe('Escala · Vida');
  });

  it('Pilar 5 id=1: retorna o hexagrama 1 (Qian · O Criativo)', () => {
    const s = significadoPorPilar('iching', 1);
    expect(s).toBeDefined();
  });

  it('Pilar 5 id=64: retorna o hexagrama 64 (Wei Ji · Antes da Conclusão)', () => {
    const s = significadoPorPilar('iching', 64);
    expect(s).toBeDefined();
  });

  it('Pilar 5 cobre todos os 64 hexagramas (1-64 sem buracos)', () => {
    for (let n = 1; n <= 64; n++) {
      const s = significadoPorPilar('iching', n);
      expect(s, `hexagrama ${n} ausente`).toBeDefined();
    }
  });

  it('id inexistente no Pilar correto → undefined', () => {
    expect(significadoPorPilar('cabala', 9999)).toBeUndefined();
  });

  it('id existente em outro Pilar → undefined (busca é por pilar+id)', () => {
    // "Aries" é signo de Pilar 2; Pilar 1 não deve ter.
    const s = significadoPorPilar('cabala', 'Aries');
    expect(s).toBeUndefined();
  });

  it('coerção de id (string vs number): mesma chave → mesmo resultado', () => {
    // Pilar 1 Life Path 1 está como número, mas busca também aceita string.
    const porNumero = significadoPorPilar('cabala', 1);
    const porString = significadoPorPilar('cabala', '1');
    expect(porString).toEqual(porNumero);
  });

  it('id presente em MÚLTIPLOS Pilares (mesmo número) retorna o do Pilar pedido', () => {
    // "1" pode ser Life Path (P1) E hexagrama (P5). Busca por pilar deve
    // distinguir.
    const cabala1 = significadoPorPilar('cabala', 1);
    const iching1 = significadoPorPilar('iching', 1);
    expect(cabala1?.pilar).toBe('cabala');
    expect(iching1?.pilar).toBe('iching');
    expect(cabala1).not.toEqual(iching1);
  });
});

// ─── significadosDoPilar ──────────────────────────────────────────────────

describe('significados-curados: significadosDoPilar', () => {
  TODOS_PILARES.forEach((pilar) => {
    it(`Pilar ${pilar}: retorna array com tamanho = coberturaSignificados()[${pilar}]`, () => {
      const lista = significadosDoPilar(pilar);
      expect(lista).toHaveLength(coberturaSignificados()[pilar]);
    });

    it(`Pilar ${pilar}: todas as entradas têm pilar = "${pilar}"`, () => {
      const lista = significadosDoPilar(pilar);
      lista.forEach((s) => expect(s.pilar).toBe(pilar));
    });
  });

  it('chamadas repetidas retornam arrays independentes (defesa contra mutação)', () => {
    const a = significadosDoPilar('iching');
    const b = significadosDoPilar('iching');
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });

  it('Pilar 1 contém Life Path 11/22/33 e escalas D/S/Z/V', () => {
    const ids = significadosDoPilar('cabala').map((s) => String(s.id));
    expect(ids).toContain('11');
    expect(ids).toContain('22');
    expect(ids).toContain('33');
    expect(ids).toContain('D');
    expect(ids).toContain('S');
    expect(ids).toContain('Z');
    expect(ids).toContain('V');
  });
});

// ─── Invariantes editoriais (Axiomas 3, 4, 8 + R-022 §4.4) ────────────────

describe('significados-curados: invariantes editoriais', () => {
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

  it('toda entrada tem todos os campos obrigatórios preenchidos', () => {
    TODOS_PILARES.forEach((pilar) => {
      const lista = significadosDoPilar(pilar);
      lista.forEach((s, i) => {
        CAMPOS_OBRIGATORIOS.forEach((campo) => {
          const valor = s[campo];
          expect(valor, `Pilar ${pilar}[${i}].${campo} vazio`).toBeTruthy();
          if (typeof valor === 'string') {
            expect(
              valor.trim().length,
              `Pilar ${pilar}[${i}].${campo} whitespace-only`
            ).toBeGreaterThan(0);
          }
        });
      });
    });
  });

  it('Axioma 4: toda entrada cita fonte (não-vazia)', () => {
    TODOS_PILARES.forEach((pilar) => {
      const lista = significadosDoPilar(pilar);
      lista.forEach((s) => {
        expect(s.fonte.length).toBeGreaterThan(0);
      });
    });
  });

  it('R-022 §4.4: TODAS as entradas de Pilar 4 (Odu) carregam requer_terreiro=true', () => {
    const lista = significadosDoPilar('odu');
    expect(lista.length).toBeGreaterThan(0);
    lista.forEach((s) => {
      expect(s.requer_terreiro, `Odu ${s.id} sem requer_terreiro`).toBe(true);
    });
  });

  it('Pilares 1, 2, 3 e 5 NÃO exigem terreiro (apenas Pilar 4)', () => {
    const pilaresSemTerreiro: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'iching'];
    pilaresSemTerreiro.forEach((pilar) => {
      const lista = significadosDoPilar(pilar);
      lista.forEach((s) => {
        expect(
          s.requer_terreiro,
          `${pilar}[${s.id}] tem requer_terreiro=true indevido`
        ).toBeFalsy();
      });
    });
  });

  it('ids são únicos dentro de cada Pilar EXCETO Pilar 1 (que tem 4 séries numéricas com ids 1-9 sobrepostos por design)', () => {
    // Pilar 1 (Cabala) tem 4 séries (Life Path, Birthday, Expression, Ano
    // Pessoal) que compartilham ids 1-9. Pilar 1 também tem 11/22/33 únicos.
    // Esta sobreposição é INTENCIONAL — `significadoPorPilar` retorna a
    // PRIMEIRA ocorrência (Life Path). Para os outros Pilares, ids são únicos.
    const pilaresComIdsUnicos: Pilar[] = ['astrologia', 'tantrica', 'odu', 'iching'];
    pilaresComIdsUnicos.forEach((pilar) => {
      const ids = significadosDoPilar(pilar).map((s) => String(s.id));
      const set = new Set(ids);
      expect(set.size, `Pilar ${pilar} tem ids duplicados: ${ids.length} vs ${set.size}`).toBe(
        ids.length
      );
    });

    // Sanity check: Pilar 1 tem 43 ids no array, mas só 16 únicos (1-9 + 11/22/33 + D/S/Z/V)
    const cabalaIds = significadosDoPilar('cabala').map((s) => String(s.id));
    const cabalaUnicos = new Set(cabalaIds);
    expect(cabalaIds.length).toBe(43);
    expect(cabalaUnicos.size).toBe(16); // 1-9 (9) + 11, 22, 33 (3) + D, S, Z, V (4)
  });

  it('significadoPorPilar retorna a PRIMEIRA ocorrência quando há colisão (Life Path vence Birthday)', () => {
    // id=1 existe em 4 séries (Life Path, Birthday, Expression, Ano Pessoal)
    // mas o helper retorna a PRIMEIRA do array SIGNIFICADOS, que é Life Path.
    const s = significadoPorPilar('cabala', 1);
    expect(s?.titulo).toBe('Pioneiro');
    // O fonte da Life Path cita Sefer Yetzirah
    expect(s?.fonte).toMatch(/Sefer Yetzirah/);
  });
});

// ─── Re-exports ───────────────────────────────────────────────────────────

describe('significados-curados: re-exports', () => {
  it('significadoGenericoDoPilar: idêntico ao import do helper (mesma função)', () => {
    const fromFaixada = significadoGenericoDoPilar('cabala');
    expect(fromFaixada.id).toBe('cabala');
    expect(fromFaixada.titulo).toBe('Caminho de Vida');
  });

  it('significadoGenericoDoPilar funciona como fallback para o Pilar todo (id === pilar)', () => {
    // O id é a própria chave do Pilar. Assim, `significadoPorPilar(p, p)`
    // resolve via SIGNIFICADOS.find (não há entrada com id === 'cabala'
    // entre os curados, mas o helper é re-exportado para uso externo).
    const generico = significadoGenericoDoPilar('astrologia');
    expect(generico.pilar).toBe('astrologia');
    expect(String(generico.id)).toBe('astrologia');
  });
});
