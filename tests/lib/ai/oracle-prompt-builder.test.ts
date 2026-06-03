import { describe, it, expect } from 'vitest';
import {
  buildSystemPrompt,
  buildHousePayload,
  type ClientMaps,
} from '@/lib/ai/dossier/oracle-prompt-builder';
import type { BirthChart } from '@/lib/astrologia/birth-chart';

// Mock BirthChart with all required fields for Casa 1 and Casa 34 extractions
const mockBirthChart: BirthChart = {
  planets: [],
  houses: [],
  ascendant: 150, // ~0° Libra (150/30 = 5 → index 5 → virgem)
  midheaven: 200,
  aspects: [],
  chart: {
    planeta: {
      sol: { planeta: 'sol', signo: 'leao' as const, casa: 12, grauNoSigno: 22 },
      lua: { planeta: 'lua', signo: 'escorpio' as const, casa: 3, grauNoSigno: 18 },
      marte: { planeta: 'marte', signo: 'leao' as const, casa: 11, grauNoSigno: 11 },
      venus: { planeta: 'venus', signo: 'cancer' as const, casa: 10, grauNoSigno: 5 },
      mercurio: { planeta: 'mercurio', signo: 'virgem' as const, casa: 12, grauNoSigno: 3 },
      jupiter: { planeta: 'jupiter', signo: 'cancer' as const, casa: 10, grauNoSigno: 8 },
      saturno: { planeta: 'saturno', signo: 'libra' as const, casa: 1, grauNoSigno: 15 },
      urano: { planeta: 'urano', signo: 'escorpio' as const, casa: 8, grauNoSigno: 2 },
      netuno: { planeta: 'netuno', signo: 'sagitario' as const, casa: 9, grauNoSigno: 10 },
      plutao: { planeta: 'plutao', signo: 'escorpio' as const, casa: 7, grauNoSigno: 25 },
      chiron: { planeta: 'chiron', signo: 'peixes' as const, casa: 12, grauNoSigno: 3 },
      lilith: { planeta: 'lilith', signo: 'aries' as const, casa: 2, grauNoSigno: 20 },
      node_norte: { planeta: 'node_norte', signo: 'cancer' as const, casa: 5, grauNoSigno: 10 },
      node_sul: { planeta: 'node_sul', signo: 'capricornio' as const, casa: 11, grauNoSigno: 10 },
    },
    casas: [
      { numero: 1, signo: 'libra' as const, grauNoSigno: 5, planetaRegente: 'venus' },
      { numero: 2, signo: 'libra' as const, grauNoSigno: 8, planetaRegente: 'venus' }, // Libra in House 2 for Casa 34 test
      { numero: 3, signo: 'escorpio' as const, grauNoSigno: 20, planetaRegente: 'marte' },
      { numero: 4, signo: 'sagitario' as const, grauNoSigno: 27, planetaRegente: 'jupiter' },
      { numero: 5, signo: 'capricornio' as const, grauNoSigno: 15, planetaRegente: 'saturno' },
      { numero: 6, signo: 'aquario' as const, grauNoSigno: 3, planetaRegente: 'saturno' },
      { numero: 7, signo: 'aries' as const, grauNoSigno: 12, planetaRegente: 'marte' },
      { numero: 8, signo: 'touro' as const, grauNoSigno: 22, planetaRegente: 'venus' },
      { numero: 9, signo: 'gemeos' as const, grauNoSigno: 6, planetaRegente: 'mercurio' },
      { numero: 10, signo: 'cancer' as const, grauNoSigno: 18, planetaRegente: 'lua' },
      { numero: 11, signo: 'leo' as const, grauNoSigno: 2, planetaRegente: 'sol' },
      { numero: 12, signo: 'virgem' as const, grauNoSigno: 3, planetaRegente: 'mercurio' },
    ],
    ascendente: 152.5, // ~2.5° Libra → virgem
    mediumCoeli: 200,
    nodes: {
      norte: { planeta: 'node_norte', signo: 'cancer' as const, casa: 5, grauNoSigno: 10 },
      sul: { planeta: 'node_sul', signo: 'capricornio' as const, casa: 11, grauNoSigno: 10 },
    },
  },
};

const client: ClientMaps = {
  fullName: 'Eliane Simão de Almeida',
  birthDate: '1986-08-20',
  birthCity: 'Recife',
  birthCountry: 'Brasil',
  astrologyMap: mockBirthChart as unknown as Record<string, unknown>,
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
    // normalizeBirthChart uses lowercase signs (from signFromDegree / BirthChart.signo)
    expect(astro1).toHaveProperty('ascendant', 'virgem');
    expect(astro1).toHaveProperty('planets.mars.sign', 'leao');
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
    // normalizeBirthChart uses lowercase signs
    expect(astro34).toHaveProperty('houses.2', 'libra');
    expect(astro34).toHaveProperty('planets.venus.sign', 'cancer');
    expect(p.dados_natais_consulente.numerologia_tantrica.valores).toHaveProperty('karma', 8);
    expect(Object.keys(astro34).some((k) => k.includes('ascendant'))).toBe(false);
    expect(Object.keys(astro34).some((k) => k.includes('moon'))).toBe(false);
  });
});
