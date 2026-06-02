import { describe, it, expect } from 'vitest';
import {
  buildSystemPrompt,
  buildHousePayload,
  buildFullPayload,
  type ClientMaps,
} from '@/lib/ai/dossier/oracle-prompt-builder';
import type { MatrixData } from '@/types';

const client: ClientMaps = {
  fullName: 'Eliane Simão de Almeida',
  birthDate: '1986-08-20',
  birthCity: 'Recife',
  birthCountry: 'Brasil',
  astrologyMap: {
    ascendant: { sign: 'Virgem', degree: 12 },
    sun: { sign: 'Leão', house: 12 },
    planets: {
      mars: { sign: 'Leão', house: 11 },
      venus: { sign: 'Câncer', house: 10 },
      moon: { sign: 'Escorpião', house: 3 },
    },
    houses: { 1: 'Virgem', 2: 'Libra', 4: 'Sagitário' },
  },
  kabalisticMap: { expression: 8, motivation: 3, lifePath: 7 },
  tantricMap: { soul: 2, soulDescription: 'Corpo Negativo', karma: 8, karmaDescription: 'Corpo Prânico' },
  oduBirth: { oduNumber: 8, oduName: 'Ejionile' },
};

describe('buildSystemPrompt — persona do Oráculo', () => {
  it('inclui a estrutura de 3 parágrafos e a 2ª pessoa', () => {
    const p = buildSystemPrompt();
    expect(p).toContain('O TERRENO');
    expect(p).toContain('O EVENTO');
    expect(p).toContain('A DIREÇÃO');
    expect(p).toContain('segunda pessoa');
    expect(p).toContain('Cigano Ramiro');
  });
});

describe('buildHousePayload — delegação determinística', () => {
  it('Casa 1 injeta Ascendente + Marte + Expressão + Alma', () => {
    const entry = { carta: 19, cartaName: 'A Torre', odu: 10, oduName: 'Ofun' };
    const p = buildHousePayload(1, entry, client);
    expect(p.casa_nome).toBe('O Cavaleiro');
    expect(p.dados_natais_consulente.astrologia.valores).toHaveProperty('ascendant.sign', 'Virgem');
    expect(p.dados_natais_consulente.astrologia.valores).toHaveProperty('planets.mars.sign', 'Leão');
    expect(p.dados_natais_consulente.numerologia_cabalistica.valores).toHaveProperty('expression', 8);
    expect(p.dados_natais_consulente.numerologia_tantrica.valores).toHaveProperty('soul', 2);
    // a carta e o odu são resolvidos pelas constantes canônicas
    expect(p.tiragem_do_dia.carta).toBe('A Torre');
    expect(p.tiragem_do_dia.carta_significado.length).toBeGreaterThan(0);
    // verdade-base canônica injetada (anti-alucinação — Doc 15)
    expect(p.tiragem_do_dia.carta_base).toContain('reclusão');
    expect(p.tiragem_do_dia.carta_sombra.length).toBeGreaterThan(0);
    expect(p.tiragem_do_dia.odu_quizila.length).toBeGreaterThan(0);
    expect(p.tiragem_do_dia.odu_conselho.length).toBeGreaterThan(0);
  });

  it('Casa 34 injeta 2ª Casa + Vênus + Karma, e NÃO vaza Ascendente/Lua', () => {
    const entry = { carta: 34, cartaName: 'Os Peixes', odu: 6, oduName: 'Obará' };
    const p = buildHousePayload(34, entry, client);
    expect(p.casa_nome).toBe('Os Peixes');
    const astro = p.dados_natais_consulente.astrologia.valores;
    expect(astro).toHaveProperty('houses.2', 'Libra');
    expect(astro).toHaveProperty('planets.venus.sign', 'Câncer');
    expect(p.dados_natais_consulente.numerologia_tantrica.valores).toHaveProperty('karma', 8);
    // determinismo: nada do Ascendente nem da Lua entra na casa 34
    expect(Object.keys(astro).some((k) => k.includes('ascendant'))).toBe(false);
    expect(Object.keys(astro).some((k) => k.includes('moon'))).toBe(false);
  });
});

describe('buildFullPayload', () => {
  it('monta uma casa por entrada preenchida e a instrução de síntese', () => {
    const matrix: MatrixData = {
      '1': { carta: 19, cartaName: 'A Torre', odu: 10, oduName: 'Ofun' },
      '34': { carta: 34, cartaName: 'Os Peixes', odu: 6, oduName: 'Obará' },
    };
    const full = buildFullPayload(client, matrix);
    expect(full.casas).toHaveLength(2);
    expect(full.consulente.nome).toBe('Eliane Simão de Almeida');
    expect(full.consulente.data_nascimento).toBe('1986-08-20');
    expect(full.instrucao_sintese_final).toContain('Veredito Final'.toUpperCase());
  });

  it('ignora chaves de casa inválidas sem quebrar', () => {
    const matrix = {
      '99': { carta: 1, cartaName: 'O Cavaleiro', odu: 1, oduName: 'Ogbe' },
    } as unknown as MatrixData;
    const full = buildFullPayload(client, matrix);
    expect(full.casas).toHaveLength(0);
  });
});
