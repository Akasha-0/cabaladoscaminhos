/**
 * Testes para F-230 (Insight do Dia) e F-232 (Conexões entre Pilares).
 *
 * F-230:
 *   - gerarInsightDoDia retorna 4 campos obrigatórios
 *   - determinístico: mesmo mapa → mesmo insight
 *   - tema do dia varia conforme lua_fase
 *
 * F-232:
 *   - matriz 5×5 tem 20 conexões (sem diagonal)
 *   - cada Pilar aparece 4x como origem e 4x como destino
 *   - Pilar 4 (Odu) marca requer_terreiro em todas as 4 conexões
 *     que saem dele
 */

import { describe, it, expect } from 'vitest';
import {
  conexao,
  conexoesDe,
  conexoesPara,
  matrizConexoes,
  coberturaConexoes,
  PARES_PILARES,
} from '@/lib/grimoire/conexoes-pilares';
import { gerarInsightDoDia } from '@/lib/grimoire/insight-do-dia';
import type {
  PilarDadosCabala,
  PilarDadosAstrologia,
  PilarDadosTantrica,
  PilarDadosOdu,
  PilarDadosIChing,
} from '@/lib/grimoire/significados-curados';
import type { Pilar } from '@/lib/grimoire/significados-curados';

function stubPilares(overrides?: {
  lifePath?: number;
  solSigno?: string;
  luaFase?: 'nova' | 'crescente' | 'cheia' | 'minguante';
  corpoPred?: number;
  odu?: string;
  hex?: number;
}) {
  const cabala: PilarDadosCabala = {
    life_path: overrides?.lifePath ?? 11,
    birthday: 15,
    expression: 33,
    ano_pessoal: 5,
  };
  const astrologia: PilarDadosAstrologia = {
    sol_signo: overrides?.solSigno ?? 'Escorpião',
    asc_signo: 'Leão',
    lua_signo: 'Peixes',
    lua_fase: overrides?.luaFase ?? 'minguante',
    trinity: { sombra: 0, dom: 0, graca: 0 },
    trinity_dominante: 'sombra',
  };
  const tantrica: PilarDadosTantrica = {
    corpo_predominante: overrides?.corpoPred ?? 7,
    trigemeo: 'mental',
    ciclo_anos: 0,
    temperamento_atual: 'melancolico',
  };
  const odu: PilarDadosOdu = {
    odu_principal: overrides?.odu ?? 'Ogbe',
    odu_secundario: null,
    fonte: 'Ifá',
    aviso: '',
  };
  const iching: PilarDadosIChing = {
    hexagrama_natal: 1,
    hexagrama_dia: overrides?.hex ?? 51,
    level: 'gift',
  };
  return { cabala, astrologia, tantrica, odu, iching };
}

describe('F-230 — Insight do Dia', () => {
  it('retorna 4 campos obrigatórios', () => {
    const insight = gerarInsightDoDia(stubPilares());
    expect(insight.titulo_curto.length).toBeGreaterThan(0);
    expect(insight.sintese.length).toBeGreaterThan(30);
    expect(insight.pratica_do_dia.length).toBeGreaterThan(20);
    expect(insight.pilares_destacados.length).toBe(3);
  });

  it('é determinístico: mesmo mapa → mesmo insight', () => {
    const i1 = gerarInsightDoDia(stubPilares());
    const i2 = gerarInsightDoDia(stubPilares());
    expect(i1.titulo_curto).toBe(i2.titulo_curto);
    expect(i1.sintese).toBe(i2.sintese);
    expect(i1.pratica_do_dia).toBe(i2.pratica_do_dia);
  });

  it('muda com lua_fase', () => {
    const nova = gerarInsightDoDia(stubPilares({ luaFase: 'nova' }));
    const cheia = gerarInsightDoDia(stubPilares({ luaFase: 'cheia' }));
    expect(nova.pratica_do_dia).not.toBe(cheia.pratica_do_dia);
  });

  it('muda com lifePath (cabala)', () => {
    const lp7 = gerarInsightDoDia(stubPilares({ lifePath: 7 }));
    const lp22 = gerarInsightDoDia(stubPilares({ lifePath: 22 }));
    expect(lp7.sintese).not.toBe(lp22.sintese);
  });

  it('título curto vem do set de 8 variações', () => {
    const titulos = new Set<string>();
    for (let lp = 1; lp <= 33; lp++) {
      titulos.add(gerarInsightDoDia(stubPilares({ lifePath: lp })).titulo_curto);
    }
    // Pelo menos 2 títulos diferentes em 33 mapas
    expect(titulos.size).toBeGreaterThanOrEqual(2);
  });
});

describe('F-232 — Conexões entre Pilares', () => {
  it('matriz tem 20 conexões (5×5 menos 5 da diagonal)', () => {
    const m = matrizConexoes();
    expect(m.length).toBe(20);
    PARES_PILARES.forEach(([o, d]) => {
      expect(m.some((c) => c.origem === o && c.destino === d), `Falta ${o}→${d}`).toBe(true);
    });
  });

  it('cada Pilar aparece 4x como origem e 4x como destino', () => {
    const origens = new Set<Pilar>(['cabala', 'astrologia', 'tantrica', 'odu', 'iching']);
    origens.forEach((p) => {
      expect(conexoesDe(p).length, `${p} origem deveria ter 4`).toBe(4);
      expect(conexoesPara(p).length, `${p} destino deveria ter 4`).toBe(4);
    });
  });

  it('conexao(origem, destino) resolve corretamente', () => {
    const c = conexao('cabala', 'astrologia');
    expect(c).toBeDefined();
    expect(c?.origem).toBe('cabala');
    expect(c?.destino).toBe('astrologia');
  });

  it('Pilar 4 (Odu) marca requer_terreiro em todas as conexões que SAEM dele', () => {
    const saindoOdu = conexoesDe('odu');
    expect(saindoOdu.length).toBe(4);
    saindoOdu.forEach((c) => {
      expect(c.requer_terreiro, `Odu→${c.destino} sem requer_terreiro`).toBe(true);
    });
  });

  it('Pilar 4 (Odu) marca requer_terreiro em conexões QUE CHEGAM dele (R-022 §4.4 simétrico)', () => {
    const chegandoOdu = conexoesPara('odu');
    chegandoOdu.forEach((c) => {
      expect(c.requer_terreiro, `${c.origem}→Odu sem requer_terreiro`).toBe(true);
    });
  });

  it('coberturaConexoes reporta métricas', () => {
    const cob = coberturaConexoes();
    expect(cob.origens).toBe(5);
    expect(cob.destinos).toBe(5);
    expect(cob.total).toBe(20);
    // 4 saindo de Odu + 4 chegando em Odu = 8 com_terreiro
    expect(cob.com_terreiro).toBe(8);
  });

  it('toda conexão tem frase e fonte', () => {
    matrizConexoes().forEach((c) => {
      expect(c.frase.length, `${c.origem}→${c.destino} frase vazia`).toBeGreaterThan(20);
      expect(c.fonte, `${c.origem}→${c.destino} sem fonte`).toBeTruthy();
    });
  });
});
