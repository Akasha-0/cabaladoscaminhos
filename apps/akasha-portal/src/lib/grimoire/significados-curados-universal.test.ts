/**
 * Cobertura de Wave 20.1 — Visões Universais do Grimório (Gabriel 25/06).
 *
 * Akasha Portal é uma plataforma de **espiritualidade universalista e
 * visceral**: as 5 tradições (Cabala, Astrologia, Tantra, Odu, I'Ching)
 * falam da MESMA verdade em linguagens diferentes.
 *
 * Esta camada (`PILAR_VISOES_UNIVERSAIS`) substitui o antigo "textão
 * acadêmico" por uma estrutura que serve:
 *  - **Zelador** (atendente): verdadeUniversal + vozesPorTradicao
 *  - **Consulente** (cliente): acoesParaCliente (executáveis hoje)
 *  - **Visitante** (curioso): expandableDetails (sob demanda)
 *
 * Princípios testados (Wave 20.1 §20.1):
 * - Verdade universal ≤ 15 palavras
 * - Cada voz por tradição ≤ 25 palavras
 * - 3 ações práticas, ≤ 12 palavras cada
 * - expandableDetails preserva 100% do array detalhado (zero info loss)
 * - R-022 §4.4: Pilar 4 (Odu) carrega requer_terreiro=true
 * - Pilar 5 (I'Ching) une pilar-5a (hex. 1-32) + pilar-5b (hex. 33-64)
 *
 * NÃO testamos CADA string (são dados curados, não lógica).
 * Testamos INVARIANTES estruturais e contagens.
 */
import { describe, expect, it } from 'vitest';
import {
  PILAR_VISOES_UNIVERSAIS,
  pilarVisaoUniversal,
  coberturaVisoesUniversais,
  type Pilar,
  type VozDaTradicao,
} from './significados-curados';
import { PILAR_1_SERIES } from './significados-curados-pilar-1';
import { PILAR_2_SERIES } from './significados-curados-pilar-2';
import { PILAR_3_SERIES } from './significados-curados-pilar-3';
import { PILAR_4_SERIES } from './significados-curados-pilar-4';
import {
  PILAR_5_HEXAGRAMAS_1_32,
  PILAR_5A_VISAO_UNIVERSAL,
} from './significados-curados-pilar-5a';
import {
  PILAR_5_HEXAGRAMAS_33_64,
  PILAR_5B_VISAO_UNIVERSAL,
} from './significados-curados-pilar-5b';

const TODOS_PILARES: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];

const TRADICOES: ReadonlyArray<keyof VozDaTradicao> = [
  'cabala',
  'astrologia',
  'tantra',
  'odu',
  'iching',
];

// PT-BR detection — diacritics + function words (matches pilar-2.test.ts
// regex to keep the editorial invariant consistent across the grimoire).
const PT_BR_RE_SOURCE =
  /[áéíóúãõçàèìòùâêîôûÁÉÍÓÚÃÕÇ]|\b(o|a|os|as|de|do|da|dos|das|no|na|nos|nas|em|um|uma|uns|umas|para|com|sem|por|mais|mas|ou|e|que|qual|quais|quem|quando|onde|cujo|portanto|assim|então|pois|porque|seu|seus|sua|suas|este|esta|estes|estas|esse|essa|esses|essas|aquele|aquela|isso|aquilo|não|sim|menos|muito|pouco|bem|mau|mesmo|mesma|mesmos|mesmas|todo|toda|todos|todas|outro|outra|outros|outras|próprio|própria|além|dentro|fora|antes|depois|entre|sobre|sob|após|hoje|ontem|amanhã|corpo|mente|alma)\b/i.source;
const PT_BR_RE = new RegExp(PT_BR_RE_SOURCE, 'i');

function contarPalavras(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

describe('Wave 20.1 — Visões Universais do Grimório', () => {
  describe('coberturaVisoesUniversais', () => {
    it('retorna 1 visão por Pilar (5 total)', () => {
      const cob = coberturaVisoesUniversais();
      expect(Object.keys(cob).sort()).toEqual(
        ['astrologia', 'cabala', 'iching', 'odu', 'tantrica']
      );
      TODOS_PILARES.forEach((p) => {
        expect(cob[p], `Pilar ${p}`).toBe(1);
      });
    });

    it('PILAR_VISOES_UNIVERSAIS tem 5 chaves (uma por Pilar)', () => {
      expect(Object.keys(PILAR_VISOES_UNIVERSAIS).sort()).toEqual(
        ['astrologia', 'cabala', 'iching', 'odu', 'tantrica']
      );
    });

    it('pilarVisaoUniversal(pilar) retorna a mesma instância por chave', () => {
      TODOS_PILARES.forEach((p) => {
        expect(pilarVisaoUniversal(p)).toBe(PILAR_VISOES_UNIVERSAIS[p]);
      });
    });
  });

  describe('invariantes editoriais (Wave 20.1 §20.1)', () => {
    TODOS_PILARES.forEach((pilar) => {
      describe(`Pilar ${pilar}`, () => {
        const v = PILAR_VISOES_UNIVERSAIS[pilar];

        it('pilar field matches key', () => {
          expect(v.pilar).toBe(pilar);
        });

        it('verdadeUniversal ≤ 15 palavras (visceral, ≤1 respiração)', () => {
          const n = contarPalavras(v.verdadeUniversal);
          expect(
            n,
            `verdadeUniversal com ${n} palavras: "${v.verdadeUniversal}"`
          ).toBeLessThanOrEqual(15);
        });

        it('verdadeUniversal é não-vazia e em PT-BR (diacritic ou função-word)', () => {
          expect(v.verdadeUniversal.trim().length).toBeGreaterThan(0);
          expect(
            PT_BR_RE.test(v.verdadeUniversal),
            `sem marcadores PT-BR: "${v.verdadeUniversal}"`
          ).toBe(true);
        });

        TRADICOES.forEach((tr) => {
          it(`vozesPorTradicao.${tr} ≤ 25 palavras`, () => {
            const voz = v.vozesPorTradicao[tr];
            const n = contarPalavras(voz);
            expect(n, `${tr} com ${n} palavras: "${voz}"`).toBeLessThanOrEqual(25);
          });

          it(`vozesPorTradicao.${tr} é não-vazia e em PT-BR`, () => {
            const voz = v.vozesPorTradicao[tr];
            expect(voz.trim().length).toBeGreaterThan(0);
            expect(
              PT_BR_RE.test(voz),
              `${tr} sem marcadores PT-BR: "${voz}"`
            ).toBe(true);
          });
        });

        it('acoesParaCliente tem exatamente 3 ações', () => {
          expect(v.acoesParaCliente).toHaveLength(3);
        });

        v.acoesParaCliente.forEach((acao, i) => {
          it(`acoesParaCliente[${i}] ≤ 12 palavras e é PT-BR`, () => {
            const n = contarPalavras(acao);
            expect(n, `ação[${i}] com ${n} palavras: "${acao}"`).toBeLessThanOrEqual(12);
            expect(
              PT_BR_RE.test(acao),
              `ação[${i}] sem marcadores PT-BR: "${acao}"`
            ).toBe(true);
          });
        });

        it('expandableDetails é não-vazio', () => {
          expect(v.expandableDetails.trim().length).toBeGreaterThan(0);
        });

        it('expandableDetails inclui marcador de Pilar', () => {
          expect(v.expandableDetails).toMatch(new RegExp(`\\[${pilar}\\|`, 'i'));
        });
      });
    });
  });

  describe('R-022 §4.4 — ética Ifá', () => {
    it('Pilar 4 (Odu) visão universal carrega requer_terreiro=true', () => {
      expect(PILAR_VISOES_UNIVERSAIS.odu.requer_terreiro).toBe(true);
    });

    it('Pilares 1, 2, 3, 5 NÃO carregam requer_terreiro (apenas Pilar 4)', () => {
      const semRequer: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'iching'];
      semRequer.forEach((p) => {
        expect(
          PILAR_VISOES_UNIVERSAIS[p].requer_terreiro,
          `Pilar ${p} não deveria ter requer_terreiro=true`
        ).toBeUndefined();
      });
    });

    it('vozesPorTradicao.odu do Pilar 4 contém aviso ético (terreiro|ancestral|babalaô)', () => {
      const voz = PILAR_VISOES_UNIVERSAIS.odu.vozesPorTradicao.odu.toLowerCase();
      expect(voz).toMatch(/terreiro|ancestral|babalaô|ori-don/);
    });

    it('expandableDetails do Pilar 4 inclui o aviso ⚠️ requer_terreiro em cada Odu', () => {
      const det = PILAR_VISOES_UNIVERSAIS.odu.expandableDetails;
      // 16 Odu → 16 ocorrências do aviso
      const matches = det.match(/⚠️\s+requer_terreiro:\s+true/g);
      expect(matches, `avisos ⚠️ encontrados em Pilar 4`).not.toBeNull();
      expect(matches!.length).toBeGreaterThanOrEqual(16);
    });
  });

  describe('Pilar 5 (I Ching) une 5a (hex. 1-32) + 5b (hex. 33-64)', () => {
    it('PILAR_5A_VISAO_UNIVERSAL existe e é do pilar iching', () => {
      expect(PILAR_5A_VISAO_UNIVERSAL.pilar).toBe('iching');
    });

    it('PILAR_5B_VISAO_UNIVERSAL existe e é do pilar iching', () => {
      expect(PILAR_5B_VISAO_UNIVERSAL.pilar).toBe('iching');
    });

    it('PILAR_VISOES_UNIVERSAIS.iching combina ambos arrays (5a+5b)', () => {
      const merged = PILAR_VISOES_UNIVERSAIS.iching;
      const det = merged.expandableDetails;
      // 32 + 32 = 64 hexagramas
      const hexMatches = det.match(/\[iching\|\d+\]/g);
      expect(hexMatches, 'hexagramas em expandableDetails').not.toBeNull();
      expect(hexMatches!.length).toBeGreaterThanOrEqual(64);
      // Confirma hex. 1 e hex. 64 presentes
      expect(det).toContain('[iching|1]');
      expect(det).toContain('[iching|64]');
      // Confirma metade 1-32 presente
      expect(det).toContain('[iching|32]');
      // Confirma metade 33-64 presente
      expect(det).toContain('[iching|33]');
    });
  });

  describe('ZERO info loss — expandableDetails preserva 100% do conteúdo', () => {
    function checkParesExpandidos(
      pilar: Pilar,
      seriesCount: number,
      series: ReadonlyArray<{ id: string | number; titulo: string; fonte: string }>
    ): void {
      it(`Pilar ${pilar}: expandableDetails preserva ${seriesCount} entradas do array detalhado`, () => {
        const det = PILAR_VISOES_UNIVERSAIS[pilar].expandableDetails;
        // Cada entrada aparece como "[pilar|id]"
        const markerRegex = new RegExp(`\\[${pilar}\\|`, 'g');
        const matches = det.match(markerRegex);
        expect(
          matches,
          `marcadores [${pilar}|id] em expandableDetails`
        ).not.toBeNull();
        expect(matches!.length).toBeGreaterThanOrEqual(seriesCount);
      });

      it(`Pilar ${pilar}: expandableDetails inclui cada titulo do array detalhado`, () => {
        const det = PILAR_VISOES_UNIVERSAIS[pilar].expandableDetails;
        for (const s of series) {
          // O titulo aparece no bloco; toleramos substring match
          // (alguns titulos podem ter caracteres especiais)
          const tituloEncontrado = det.includes(String(s.titulo).split('(')[0].trim());
          expect(
            tituloEncontrado,
            `Pilar ${pilar}: titulo "${s.titulo}" não encontrado em expandableDetails`
          ).toBe(true);
        }
      });

      it(`Pilar ${pilar}: expandableDetails inclui cada fonte do array detalhado`, () => {
        const det = PILAR_VISOES_UNIVERSAIS[pilar].expandableDetails;
        const fontesUnicas = new Set(series.map((s) => s.fonte));
        fontesUnicas.forEach((fonte) => {
          expect(
            det.includes(fonte),
            `Pilar ${pilar}: fonte "${fonte}" não encontrada em expandableDetails`
          ).toBe(true);
        });
      });
    }

    checkParesExpandidos('cabala', 39, PILAR_1_SERIES);
    checkParesExpandidos('astrologia', 19, PILAR_2_SERIES);
    checkParesExpandidos('tantrica', 18, PILAR_3_SERIES);
    checkParesExpandidos('odu', 16, PILAR_4_SERIES);

    // Pilar 5 (iching) une 5a + 5b em uma única visão — verificamos combinados
    it('Pilar iching: expandableDetails preserva 64 hexagramas (32+32)', () => {
      const det = PILAR_VISOES_UNIVERSAIS.iching.expandableDetails;
      const all5 = [...PILAR_5_HEXAGRAMAS_1_32, ...PILAR_5_HEXAGRAMAS_33_64];
      // Cada titulo presente
      let missing = 0;
      for (const h of all5) {
        const t = String(h.titulo).split('(')[0].trim();
        if (!det.includes(t)) missing += 1;
      }
      expect(
        missing,
        `Pilar iching: ${missing} hexagramas sem titulo em expandableDetails`
      ).toBe(0);
    });

    it('Pilar iching: expandableDetails inclui todas as fontes Wilhelm/Baynes 1950', () => {
      const det = PILAR_VISOES_UNIVERSAIS.iching.expandableDetails;
      const matches = det.match(/Wilhelm\/Baynes 1950/g);
      expect(matches, 'citações Wilhelm/Baynes 1950 em Pilar iching').not.toBeNull();
      expect(matches!.length).toBeGreaterThanOrEqual(64);
    });
  });

  describe('igualdade entre as 5 visões — princípio universalista', () => {
    it('verdadeUniversal é ÚNICA por Pilar (5 verdades diferentes, não 1 repetida)', () => {
      const verdades = TODOS_PILARES.map((p) => PILAR_VISOES_UNIVERSAIS[p].verdadeUniversal);
      const unicas = new Set(verdades);
      expect(
        unicas.size,
        `esperado 5 verdades únicas, encontrado ${unicas.size}`
      ).toBe(5);
    });

    it('cada Pilar tem vozesPorTradicao distintas em conteúdo (não copy-paste)', () => {
      TODOS_PILARES.forEach((pilar) => {
        const vozes = TRADICOES.map(
          (t) => PILAR_VISOES_UNIVERSAIS[pilar].vozesPorTradicao[t]
        );
        const unicas = new Set(vozes);
        expect(
          unicas.size,
          `Pilar ${pilar}: esperado 5 vozes únicas, encontrado ${unicas.size}`
        ).toBe(5);
      });
    });

    it('cada Pilar tem acoesParaCliente distintas (não copy-paste entre pilares)', () => {
      TODOS_PILARES.forEach((pilarA, i) => {
        TODOS_PILARES.slice(i + 1).forEach((pilarB) => {
          const a = JSON.stringify(PILAR_VISOES_UNIVERSAIS[pilarA].acoesParaCliente);
          const b = JSON.stringify(PILAR_VISOES_UNIVERSAIS[pilarB].acoesParaCliente);
          expect(
            a,
            `Pilar ${pilarA} e Pilar ${pilarB} têm acoesParaCliente idênticas`
          ).not.toBe(b);
        });
      });
    });
  });
});
