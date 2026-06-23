/**
 * Testes para `botanica/ewe-database.ts` (Pilar 6 — Forest Alchemy).
 *
 * 16 Ewé leaves (Ewé Sagrados), com funções getByOrixa, getByNature,
 * searchEwe. Valida: IDs únicos, campos obrigatórios, funções de lookup,
 * elementos e naturezas térmicas válidos.
 */
import { describe, it, expect } from 'vitest';
import {
 EWE_DATABASE,
 getByOrixa,
 getByNature,
 searchEwe,
} from './ewe-database';
import type { EweLeaf } from './types';

const CAMPOS_OBRIGATORIOS_EWE: (keyof EweLeaf)[] = [
 'id',
 'name',
 'scientificName',
 'orixa',
 'element',
 'thermalNature',
 'uses',
 'preparation',
 'fuente',
];

const ELEMENTOS_VALIDOS = new Set([
 'Agua',
 'Fogo',
 'Terra',
 'Ar',
 'Vegetacao',
 'Ferro',
 'TerraAgua',
 'FogoAgua',
]);

const NATUREZAS_VALIDAS = new Set(['quente', 'frio', 'neutro']);

const ORIXAS_PRESENTES = new Set(EWE_DATABASE.map((e) => e.orixa));

describe('EWE_DATABASE', () => {
 it('tem exatamente 15 Einträge', () => {
  expect(EWE_DATABASE).toHaveLength(15);
 });

 it('cada Eintrag tem id único', () => {
  const ids = EWE_DATABASE.map((e) => e.id);
  const unique = new Set(ids);
  expect(unique.size).toBe(ids.length);
 });

 it('todos IDs começam com "ewe-"', () => {
  EWE_DATABASE.forEach((e) => {
   expect(e.id).toMatch(/^ewe-/);
  });
 });
});

describe('campos obrigatórios', () => {
 EWE_DATABASE.forEach((entry) => {
  CAMPOS_OBRIGATORIOS_EWE.forEach((campo) => {
   it(`${entry.id}: campo "${campo}" existe`, () => {
    const value = entry[campo];
    expect(value).toBeDefined();
   });
  });
 });
});

describe('tipos dos campos', () => {
 EWE_DATABASE.forEach((entry) => {
  it(`${entry.id}: id é string`, () => {
   expect(typeof entry.id).toBe('string');
  });

  it(`${entry.id}: name é string não-vazia`, () => {
   expect(typeof entry.name).toBe('string');
   expect(entry.name.trim().length).toBeGreaterThan(0);
  });

  it(`${entry.id}: scientificName é string não-vazia`, () => {
   expect(typeof entry.scientificName).toBe('string');
   expect(entry.scientificName.trim().length).toBeGreaterThan(0);
  });

  it(`${entry.id}: orixa é string não-vazia`, () => {
   expect(typeof entry.orixa).toBe('string');
   expect(entry.orixa.trim().length).toBeGreaterThan(0);
  });

  it(`${entry.id}: element é um valor válido`, () => {
   expect(ELEMENTOS_VALIDOS.has(entry.element)).toBe(true);
  });

  it(`${entry.id}: thermalNature é quente|frio|neutro`, () => {
   expect(NATUREZAS_VALIDAS.has(entry.thermalNature)).toBe(true);
  });

  it(`${entry.id}: uses é array não-vazio de strings`, () => {
   expect(Array.isArray(entry.uses)).toBe(true);
   expect(entry.uses.length).toBeGreaterThan(0);
   entry.uses.forEach((u) => {
    expect(typeof u).toBe('string');
    expect(u.trim().length).toBeGreaterThan(0);
   });
  });

  it(`${entry.id}: preparation é string não-vazia`, () => {
   expect(typeof entry.preparation).toBe('string');
   expect(entry.preparation.trim().length).toBeGreaterThan(0);
  });

  it(`${entry.id}: fuente é string não-vazia`, () => {
   expect(typeof entry.fuente).toBe('string');
   expect(entry.fuente.trim().length).toBeGreaterThan(0);
  });
 });

 it('contraindication é string ou undefined (quando presente, não-vazia)', () => {
  EWE_DATABASE.forEach((e) => {
   if (e.contraindication !== undefined) {
    expect(typeof e.contraindication).toBe('string');
    expect(e.contraindication.trim().length).toBeGreaterThan(0);
   }
  });
 });
});

describe('uses sem duplicatas por Eintrag', () => {
 EWE_DATABASE.forEach((e) => {
  it(`${e.id}: uses[] não tem duplicatas`, () => {
   const unique = new Set(e.uses);
   expect(unique.size).toBe(e.uses.length);
  });
 });
});

describe('cobertura de Orixás', () => {
 it('pelo menos 4 Orixás representados', () => {
  expect(ORIXAS_PRESENTES.size).toBeGreaterThanOrEqual(4);
 });

 it('Ogum, Oxum, Obatalá e Iemanjá/Yemanjá estão presentes', () => {
  const orixasLower = new Set([...ORIXAS_PRESENTES].map((o) => o.toLowerCase()));
  expect(orixasLower.has('ogum')).toBe(true);
  expect(orixasLower.has('oxum')).toBe(true);
  expect(orixasLower.has('obatalá') || orixasLower.has('obatala')).toBe(true);
  expect(orixasLower.has('iemanjá') || orixasLower.has('yemanjá') || orixasLower.has('yemanja')).toBe(true);
 });

 it('cada Eintrag referencia um Orixá do conjunto', () => {
  EWE_DATABASE.forEach((e) => {
   expect(ORIXAS_PRESENTES.has(e.orixa)).toBe(true);
  });
 });
});

describe('cobertura de elementos', () => {
 it('pelo menos 4 elementos únicos representados', () => {
  const elementos = new Set(EWE_DATABASE.map((e) => e.element));
  expect(elementos.size).toBeGreaterThanOrEqual(4);
 });

 it('cada Eintrag tem elemento do conjunto válido', () => {
  EWE_DATABASE.forEach((e) => {
   expect(ELEMENTOS_VALIDOS.has(e.element)).toBe(true);
  });
 });
});

describe('cobertura de naturezas térmicas', () => {
 it('todas 3 naturezas (quente, frio, neutro) estão presentes', () => {
  const naturezas = new Set(EWE_DATABASE.map((e) => e.thermalNature));
  expect(naturezas.has('quente')).toBe(true);
  expect(naturezas.has('frio')).toBe(true);
  expect(naturezas.has('neutro')).toBe(true);
 });
});

describe('PT-BR em campos de texto', () => {
 const PT_BR_RE_SOURCE =
  /[áéíóúãõ\u00e7àèìòùâêîôû]|\b(o|a|os|as|de|do|da|dos|das|no|na|nos|nas|em|um|uma|uns|umas|para|com|sem|por|mais|mas|ou|e|que|qual|quais|quem|quando|onde|cujo|portanto|assim|então|pois|porque|seu|seus|sua|suas|este|esta|estes|estas|esse|essa|esses|essas|aquele|aquela|isso|aquilo|não|sim|mais|menos|muito|pouco|bem|mau|mesmo|mesma|mesmos|mesmas|todo|toda|todos|todas|vários|várias|outro|outra|outros|outras|próprio|própria|além|dentro|fora|antes|depois|entre|sobre|sob|ante|após|mediante|vista|através)\b/
   .source;

 const TEXTOS_PT = ['preparation', 'fuente'] as const;

 EWE_DATABASE.forEach((entry) => {
  TEXTOS_PT.forEach((campo) => {
   it(`${entry.id} ${campo}: contém PT_BR`, () => {
    const texto = entry[campo];
    expect(new RegExp(PT_BR_RE_SOURCE, 'i').test(texto)).toBe(true);
   });
  });
 });
});

describe('preparação menciona o método (banho, chá, infusão...)', () => {
 EWE_DATABASE.forEach((e) => {
  it(`${e.id}: preparation contém verbo de preparo`, () => {
   const temMetodo = /banho|chá|infusão|macerad|mastigad|queimar|defum|água|óleo|Unção/i.test(
    e.preparation,
   );
   expect(temMetodo).toBe(true);
  });
 });
});

describe('fuente contém origem (tradição, Verger, Saraceni...)', () => {
 EWE_DATABASE.forEach((e) => {
  it(`${e.id}: fuente menciona fonte de origem`, () => {
   const temFonte = /tradição|Verger|Saraceni|Ifá|iorubá|afro-brasileira/i.test(e.fuente);
   expect(temFonte).toBe(true);
  });
 });
});

describe('getByOrixa()', () => {
 it('retorna array', () => {
  const result = getByOrixa('Ogum');
  expect(Array.isArray(result)).toBe(true);
 });

 it('Ogum retorna folhas de Ogum', () => {
  const result = getByOrixa('Ogum');
  result.forEach((e) => {
   expect(e.orixa.toLowerCase()).toBe('ogum');
  });
 });

 it('case-insensitive', () => {
  const lower = getByOrixa('ogum');
  const upper = getByOrixa('OGUM');
  const mixed = getByOrixa('Ogum');
  expect(lower.length).toBe(upper.length);
  expect(lower.length).toBe(mixed.length);
 });

 it('retorna array vazio para Orixá inexistente', () => {
  const result = getByOrixa('NenhumOrixaInexistente');
  expect(result).toEqual([]);
 });

 it('todas as Orixás conhecidas retornam pelo menos 1 resultado', () => {
  ORIXAS_PRESENTES.forEach((orixa) => {
   const result = getByOrixa(orixa);
   expect(result.length).toBeGreaterThan(0);
  });
 });
});

describe('getByNature()', () => {
 it('quente retorna apenas entries com thermalNature quente', () => {
  getByNature('quente').forEach((e) => {
   expect(e.thermalNature).toBe('quente');
  });
 });

 it('frio retorna apenas entries com thermalNature frio', () => {
  getByNature('frio').forEach((e) => {
   expect(e.thermalNature).toBe('frio');
  });
 });

 it('neutro retorna apenas entries com thermalNature neutro', () => {
  getByNature('neutro').forEach((e) => {
   expect(e.thermalNature).toBe('neutro');
  });
 });

 it('soma dos três grupos equals total', () => {
  const total =
   getByNature('quente').length +
   getByNature('frio').length +
   getByNature('neutro').length;
  expect(total).toBe(EWE_DATABASE.length);
 });

 it('retorna array para naturezas desconhecidas (silently empty)', () => {
  const result = getByNature('desconhecido' as 'quente');
  expect(Array.isArray(result)).toBe(true);
 });
});

describe('searchEwe()', () => {
 it('busca por name retorna matches', () => {
  const result = searchEwe('alecrim');
  expect(result.length).toBeGreaterThan(0);
  expect(result.some((e) => e.name.toLowerCase().includes('alecrim'))).toBe(true);
 });

 it('busca por orixa retorna matches', () => {
  const result = searchEwe('oxum');
  expect(result.length).toBeGreaterThan(0);
  result.forEach((e) => {
   expect(e.orixa.toLowerCase()).toContain('oxum');
  });
 });

 it('busca por use retorna matches', () => {
  const result = searchEwe('proteção');
  expect(result.length).toBeGreaterThan(0);
  result.forEach((e) => {
   expect(e.uses.some((u) => u.toLowerCase().includes('proteção'))).toBe(true);
  });
 });

 it('case-insensitive', () => {
  const lower = searchEwe('ogum');
  const upper = searchEwe('OGUM');
  expect(lower.length).toBe(upper.length);
 });

 it('query vazia retorna array', () => {
  const result = searchEwe('');
  expect(Array.isArray(result)).toBe(true);
 });

 it('query inexistente retorna array vazio', () => {
  const result = searchEwe('xyzabc123inexistente');
  expect(result).toEqual([]);
 });

 it('resultados contêm query no name, orixa ou uses', () => {
  const query = 'amor';
  const result = searchEwe(query);
  result.forEach((e) => {
   const inName = e.name.toLowerCase().includes(query);
   const inOrixa = e.orixa.toLowerCase().includes(query);
   const inUses = e.uses.some((u) => u.toLowerCase().includes(query));
   expect(inName || inOrixa || inUses).toBe(true);
  });
 });
});
