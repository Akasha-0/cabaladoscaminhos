import { describe, it, expect } from 'vitest';
import {
  recomendarAcaoPorEstado,
  praticaAuthorityDiaria,
  perguntaAkashaHoje,
  avaliarDecisao,
} from './akasha-authority';
import type { PilaresDados } from './significados-curados';

const PILARES_COMPLETOS: PilaresDados = {
  cabala: { life_path: 11, birthday: 7, expression: 5, ano_pessoal: 4 },
  astrologia: {
    sol_signo: 'Escorpião',
    asc_signo: 'Leão',
    lua_signo: 'Peixes',
    lua_fase: 'cheia',
    trinity: { sombra: 0.3, dom: 0.6, graca: 0.1 },
    trinity_dominante: 'dom',
    lilith_signo: 'Escorpião',
    casa_8_signo: 'Aquário',
  },
  tantrica: {
    corpo_predominante: 4,
    trigemeo: 'astral',
    temperamento_atual: 'colerico',
  },
  odu: {
    odu_principal: 'Ogbe',
    odu_secundario: 'Oyeku',
    fonte: 'Ifá',
  },
  iching: {
    hexagrama_natal: 51,
    hexagrama_dia: 11,
    level: 'gift',
  },
};

describe('recomendarAcaoPorEstado (F-227 regra-mãe)', () => {
  it('paz → aja (regra: Corpo 3 = paz = aja)', () => {
    const r = recomendarAcaoPorEstado('paz');
    expect(r.acao).toBe('aja');
    expect(r.icone).toBe('✦');
    expect(r.justificativa).toMatch(/paz/i);
  });

  it('ansiedade → espere (regra: Corpo 4 = ansiedade = espere)', () => {
    const r = recomendarAcaoPorEstado('ansiedade');
    expect(r.acao).toBe('espere');
    expect(r.icone).toBe('◌');
    expect(r.justificativa).toMatch(/ansiedad/i);
  });

  it('neutro → observe (sem clareza nem aperto)', () => {
    const r = recomendarAcaoPorEstado('neutro');
    expect(r.acao).toBe('observe');
    expect(r.icone).toBe('◯');
  });
});

describe('praticaAuthorityDiaria', () => {
  it('retorna prática baseada na autoridade (emocional para Corpo 4)', () => {
    const p = praticaAuthorityDiaria(PILARES_COMPLETOS);
    // Corpo 4 → emocional → "Espere 24h"
    expect(p).toMatch(/24h|paz|euforia|medo/i);
  });

  it('retorna prática default para pilares parciais', () => {
    const p = praticaAuthorityDiaria({});
    expect(p).toBeTruthy();
    expect(p.length).toBeGreaterThan(20);
  });

  it('Lua em água (Cancêr) ajusta timing da autoridade emocional', () => {
    const p = praticaAuthorityDiaria({
      astrologia: {
        ...PILARES_COMPLETOS.astrologia,
        lua_signo: 'Cancêr',
      },
    });
    // Lua água reforça a mensagem emocional
    expect(p).toBeTruthy();
  });
});

describe('perguntaAkashaHoje', () => {
  it('retorna pergunta + 3 opções (Paz, Ansiedade, Neutro)', () => {
    const q = perguntaAkashaHoje(PILARES_COMPLETOS);
    expect(q.pergunta).toMatch(/estado/i);
    expect(q.opcoes).toHaveLength(3);
    expect(q.opcoes.map((o) => o.estado)).toEqual(['paz', 'ansiedade', 'neutro']);
  });

  it('inclui contexto da autoridade derivada', () => {
    const q = perguntaAkashaHoje(PILARES_COMPLETOS);
    expect(q.contexto).toMatch(/autoridade base/i);
    expect(q.contexto).toMatch(/emocional|sagrada|espl.nica|mental/i);
  });
});

describe('avaliarDecisao', () => {
  it('paz → deveAgir=true com razão alinhada à estratégia', () => {
    const r = avaliarDecisao({
      estado: 'paz',
      pilares: PILARES_COMPLETOS,
      intencao: 'começar novo projeto',
    });
    expect(r.deveAgir).toBe(true);
    expect(r.razao).toMatch(/paz|estrat.gia|cabe na sua/i);
  });

  it('ansiedade → deveAgir=false com alternativa (decisaoHoje)', () => {
    const r = avaliarDecisao({
      estado: 'ansiedade',
      pilares: PILARES_COMPLETOS,
      intencao: 'começar novo projeto',
    });
    expect(r.deveAgir).toBe(false);
    expect(r.razao).toMatch(/ansiedad/i);
  });

  it('autoridade emocional + ansiedade = SEMPRE esperar (regra especial)', () => {
    // Life Path 2/4/6/7 + Corpo 4 (ansiedade) = autoridade emocional
    const pilaresEmocional: PilaresDados = {
      ...PILARES_COMPLETOS,
      cabala: { ...PILARES_COMPLETOS.cabala, life_path: 4 },
      tantrica: { ...PILARES_COMPLETOS.tantrica, corpo_predominante: 4 },
    };
    const r = avaliarDecisao({
      estado: 'ansiedade',
      pilares: pilaresEmocional,
      intencao: 'decisão importante',
    });
    // Mesmo que "act" ou "wait" seja a estratégia, autoridade emocional exige paz
    expect(r.deveAgir).toBe(false);
    expect(r.razao).toMatch(/emocional|24h/i);
  });
});
