/**
 * Testes do PromptBuilder e da Matriz de Correlação
 * @see docs/06_ai-engine-spec.md
 */

import { describe, it, expect } from 'vitest';
import {
  CORRELATION_MAP,
  getCorrelation,
  hasCorrelation,
} from '@/lib/ai/correlation-map';
import {
  buildFullPayload,
  buildHousePayload,
  buildSystemPrompt,
  payloadToUserContent,
} from '@/lib/ai/prompt-builder';
import { LENORMAND_CARDS } from '@/lib/constants/lenormand-cards';
import { ODUS } from '@/lib/constants/odus';

describe('Correlation Map — 36 entries', () => {
  it('tem exatamente 36 entradas', () => {
    expect(Object.keys(CORRELATION_MAP).length).toBe(36);
  });

  it('cobre as casas de 1 a 36', () => {
    for (let h = 1; h <= 36; h++) {
      expect(hasCorrelation(h)).toBe(true);
    }
  });

  it('cada entrada tem tema, astrologia, cabala e tantrica', () => {
    for (let h = 1; h <= 36; h++) {
      const c = getCorrelation(h);
      expect(c.houseName.length).toBeGreaterThan(0);
      expect(c.houseTheme.length).toBeGreaterThan(0);
      expect(c.astrology.extractionKeys.length).toBeGreaterThan(0);
      expect(c.kabalah.extractionKeys.length).toBeGreaterThan(0);
      expect(c.tantric.extractionKeys.length).toBeGreaterThan(0);
    }
  });

  it('casa 1 (Cavaleiro) injeta Ascendente + Marte + Alma', () => {
    const c = getCorrelation(1);
    expect(c.houseName).toBe('O Cavaleiro');
    expect(c.astrology.primaryPlanets).toContain('ascendant');
    expect(c.astrology.primaryPlanets).toContain('mars');
    expect(c.tantric.aspects).toContain('Número de Alma');
  });

  it('casa 34 (Peixes) injeta Casa 2 + Vênus + Karma (Doc 06 §2)', () => {
    const c = getCorrelation(34);
    expect(c.houseName).toBe('Os Peixes');
    expect(c.astrology.primaryHouses).toContain(2);
    expect(c.astrology.primaryPlanets).toContain('venus');
    expect(c.tantric.aspects[0]).toMatch(/Karma/);
  });

  it('casa 16 (Estrela) considera mestre no Caminho de Vida', () => {
    const c = getCorrelation(16);
    expect(c.houseName).toBe('A Estrela');
    expect(c.kabalah.aspects[0]).toMatch(/11.*22.*33|mestre/);
  });

  it('hasCorrelation retorna false para casa inválida', () => {
    expect(hasCorrelation(0)).toBe(false);
    expect(hasCorrelation(37)).toBe(false);
    expect(hasCorrelation(-1)).toBe(false);
  });
});

describe('Constants — 36 cartas e 16 odus', () => {
  it('LENORMAND_CARDS tem 36 cartas', () => {
    expect(LENORMAND_CARDS.length).toBe(36);
    expect(LENORMAND_CARDS[0].id).toBe(1);
    expect(LENORMAND_CARDS[0].name).toBe('O Cavaleiro');
    expect(LENORMAND_CARDS[35].id).toBe(36);
    expect(LENORMAND_CARDS[35].name).toBe('A Cruz');
  });

  it('ODUS tem 16 odus', () => {
    expect(ODUS.length).toBe(16);
    expect(ODUS[0].id).toBe(1);
    expect(ODUS[0].name).toBe('Ogbe');
    expect(ODUS[15].id).toBe(16);
    expect(ODUS[15].name).toBe('Ofurufu');
  });
});

describe('PromptBuilder', () => {
  const sampleMatrixData = {
    '1': { carta: 19, cartaName: 'A Torre', odu: 10, oduName: 'Ofun' },
    '4': { carta: 4, cartaName: 'A Casa', odu: 8, oduName: 'Ejionile' },
    '34': { carta: 34, cartaName: 'Os Peixes', odu: 4, oduName: 'Irosun' },
  };

  const sampleClient = {
    fullName: 'Eliane Simão de Almeida',
    birthDate: '1986-08-20',
    birthCity: 'São Paulo',
    birthState: 'SP',
    birthCountry: 'Brasil',
    astrologyMap: {
      sun: { sign: 'Leo', degree: 27.5, house: 10 },
      moon: { sign: 'Scorpio', degree: 3, house: 1 },
      ascendant: { sign: 'Leo', degree: 5 },
      houses: { 1: 'Leo', 2: 'Virgo', 10: 'Gemini' },
      planets: {
        venus: { sign: 'Leo', degree: 15, house: 1, retrograde: false },
        mars: { sign: 'Aries', degree: 8, house: 9, retrograde: false },
      },
      northNode: { sign: 'Aquarius', house: 7 },
      southNode: { sign: 'Leo', house: 1 },
      aspects: [],
      planetsInHouses: { 2: ['Sun'] },
    },
    kabalisticMap: {
      lifePath: 7,
      lifePathMaster: false,
      mission: 5,
      expression: 11,
      expressionMaster: true,
      motivation: 3,
      nativeDayNumber: 20,
      challenges: { first: 2, second: 1, main: 1, last: 5 },
      karmaicDebts: [4, 8],
      lifeCycles: {
        first: { number: 7, ageStart: 0, ageEnd: 27 },
        second: { number: 11, ageStart: 28, ageEnd: 53 },
        third: { number: 5, ageStart: 54 },
      },
    },
    tantricMap: {
      soul: 2,
      soulDescription: 'Corpo Negativo',
      karma: 8,
      karmaDescription: 'Corpo Prânico',
      divineGift: 5,
      divineGiftDescription: 'Corpo Físico',
      destiny: 6,
      tantricPath: 3,
      tantricBodies: { 1: 'Corpo Sutil', 2: 'Corpo Negativo' },
    },
    oduBirth: {
      oduNumber: 8,
      oduName: 'Ejionile',
      orixaRegency: ['Xangô', 'Oxalá'],
      elementalForce: 'Justiça, Força, Liderança',
      lifeLesson: 'Justiça e liderança',
    },
  };

  it('buildSystemPrompt instrui 3 parágrafos e síntese em 4 capítulos', () => {
    const sp = buildSystemPrompt();
    expect(sp).toMatch(/3 parágrafos/i);
    expect(sp).toMatch(/O TERRENO/);
    expect(sp).toMatch(/O EVENTO/);
    expect(sp).toMatch(/A DIREÇÃO/);
    expect(sp).toMatch(/4 capítulos/i);
    expect(sp).toMatch(/Trabalho e Dinheiro/);
    expect(sp).toMatch(/Amor e Relacionamentos/);
    expect(sp).toMatch(/Conselho Espiritual/);
  });

  it('buildHousePayload(1) injeta carta + odu + correlação', () => {
    const payload = buildHousePayload(1, sampleMatrixData['1']);
    expect(payload.casa_numero).toBe(1);
    expect(payload.casa_nome).toBe('O Cavaleiro');
    expect(payload.tiragem_do_dia.carta_numero).toBe(19);
    expect(payload.tiragem_do_dia.carta_nome).toBe('A Torre');
    expect(payload.tiragem_do_dia.odu_nome).toBe('Ofun');
  });

  it('buildHousePayload(34) injeta keywords da casa Peixes', () => {
    const payload = buildHousePayload(34, sampleMatrixData['34']);
    expect(payload.casa_nome).toBe('Os Peixes');
    expect(payload.tiragem_do_dia.carta_nome).toBe('Os Peixes');
  });

  it('buildFullPayload ordena casas numericamente', () => {
    const payload = buildFullPayload({
      client: sampleClient,
      matrixData: sampleMatrixData,
    });
    expect(payload.casas.map(c => c.casa_numero)).toEqual([1, 4, 34]);
  });

  it('buildFullPayload injeta apenas os dados mapeados para cada casa (Doc 06 §3.1)', () => {
    const payload = buildFullPayload({
      client: sampleClient,
      matrixData: sampleMatrixData,
    });
    // Casa 1 deve ter venus (não está em primaryPlanets) → não deve vir
    const casa1 = payload.casas.find(c => c.casa_numero === 1)!;
    expect(casa1.dados_natais_consultante.astrologia.aspectos_relevantes).toContain('mars');
    expect(casa1.dados_natais_consultante.astrologia.aspectos_relevantes).toContain('ascendant');
    // venus não está nos planetas primários da casa 1, deve estar fora
    expect(casa1.dados_natais_consultante.astrologia.aspectos_relevantes).not.toContain('venus');
  });

  it('buildFullPayload injeta dados do odu natal em todas as casas', () => {
    const payload = buildFullPayload({
      client: sampleClient,
      matrixData: sampleMatrixData,
    });
    for (const c of payload.casas) {
      expect(c.dados_natais_consultante.odu_natal).toEqual(sampleClient.oduBirth);
    }
  });

  it('buildFullPayload inclui consulente com nome e cidade', () => {
    const payload = buildFullPayload({
      client: sampleClient,
      matrixData: sampleMatrixData,
    });
    expect(payload.consulente.nome).toBe('Eliane Simão de Almeida');
    expect(payload.consulente.cidade_nascimento).toContain('São Paulo');
  });

  it('payloadToUserContent serializa para JSON', () => {
    const payload = buildFullPayload({
      client: sampleClient,
      matrixData: sampleMatrixData,
    });
    const str = payloadToUserContent(payload);
    expect(() => JSON.parse(str)).not.toThrow();
    expect(str).toContain('Eliane');
  });

  it('buildHousePayload lança para carta inválida', () => {
    expect(() =>
      buildHousePayload(1, { carta: 99, cartaName: 'X', odu: 1, oduName: 'Ogbe' })
    ).toThrow();
  });

  it('buildHousePayload lança para odu inválido', () => {
    expect(() =>
      buildHousePayload(1, { carta: 1, cartaName: 'O Cavaleiro', odu: 99, oduName: 'X' })
    ).toThrow();
  });
});
