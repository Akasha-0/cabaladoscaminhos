import { describe, it, expect } from 'vitest';
import {
  buildSystemPrompt,
  buildHousePayload,
  type ClientMaps,
} from '@/lib/ai/dossier/oracle-prompt-builder';

const client: ClientMaps = {
  fullName: 'Eliane Simão de Almeida',
  birthDate: '1986-08-20',
  birthCity: 'Recife',
  birthCountry: 'Brasil',
  astrologyMap: {
    ascendant: 'Virgem',
    planets: [
      { planet: 'sun', sign: 'Leão', degree: 22, house: 12 },
      { planet: 'mars', sign: 'Leão', degree: 11, house: 11 },
      { planet: 'venus', sign: 'Câncer', degree: 5, house: 10 },
      { planet: 'moon', sign: 'Escorpião', degree: 18, house: 3 },
    ],
    houses: [
      { house: 1, sign: 'Virgem', degree: 12 },
      { house: 2, sign: 'Libra', degree: 8 },
      { house: 4, sign: 'Sagitário', degree: 27 },
    ],
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
    const astro1 = p.dados_natais_consulente.astrologia.valores;
    expect(astro1).toHaveProperty('ascendant', 'Virgem');
    expect(astro1).toHaveProperty('planets.mars.sign', 'Leão');
    expect(p.dados_natais_consulente.numerologia_cabalistica.valores).toHaveProperty('expression', 8);
    expect(p.dados_natais_consulente.numerologia_tantrica.valores).toHaveProperty('soul', 2);
    expect(p.tiragem_do_dia.carta_numero).toBe(19);
    expect(p.tiragem_do_dia.carta_significado.length).toBeGreaterThan(0);
    expect(p.tiragem_do_dia.carta_base.length).toBeGreaterThan(0);
    expect(p.tiragem_do_dia.carta_sombra.length).toBeGreaterThan(0);
    expect(p.tiragem_do_dia.odu_conselho.length).toBeGreaterThan(0);
  });

  it('Casa 34 injeta 2ª Casa + Vênus + Karma, e NÃO vaza Ascendente/Lua', () => {
    const entry = { carta: 34, cartaName: 'Os Peixes', odu: 6, oduName: 'Obará' };
    const p = buildHousePayload(34, entry, client);
    expect(p.casa_nome).toBe('Os Peixes');
    const astro34 = p.dados_natais_consulente.astrologia.valores;
    expect(astro34).toHaveProperty('houses.2', 'Libra');
    expect(astro34).toHaveProperty('planets.venus.sign', 'Câncer');
    expect(p.dados_natais_consulente.numerologia_tantrica.valores).toHaveProperty('karma', 8);
    expect(Object.keys(astro34).some((k) => k.includes('ascendant'))).toBe(false);
    expect(Object.keys(astro34).some((k) => k.includes('moon'))).toBe(false);
  });
});
