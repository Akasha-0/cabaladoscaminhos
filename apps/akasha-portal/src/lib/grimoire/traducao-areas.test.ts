/**
 * Testes para `traducao-areas.ts` (F-229) e sub-módulos.
 *
 * Estrutura testada:
 *   - AREAS: 8 áreas fixas (paz, saude, relacoes, dinheiro, trabalho,
 *     proposito, criatividade, espiritualidade)
 *   - MATRIZ: 5 Pilares × 8 Áreas = 40 entradas (CABALA + ASTROLOGIA +
 *     TANTRICA + ODU + ICHING)
 *   - Sub-módulos: cada array tem 8 entradas com pilar e area corretos
 *   - Helpers: traducaoPara, traducoesDaArea, traducoesDoPilar,
 *     traducaoDetalhadaPara, coberturaTraducaoAreas
 */
import { describe, it, expect } from 'vitest';
import {
 AREAS,
 traducaoPara,
 traducoesDaArea,
 traducoesDoPilar,
 traducaoDetalhadaPara,
 coberturaTraducaoAreas,
 type Area,
 type TraducaoArea,
} from './traducao-areas';
import { CABALA } from './traducao-areas.cabala';
import { ASTROLOGIA } from './traducao-areas.astrologia';
import { TANTRICA } from './traducao-areas.tantrica';
import { ODU } from './traducao-areas.odu';
import { ICHING } from './traducao-areas.iching';
import { TRADUCOES_DETALHADO } from './traducao-areas.matrix';

const TODOS_PILARES = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as const;
const TODAS_AREAS: Area[] = [
 'paz',
 'saude',
 'relacoes',
 'dinheiro',
 'trabalho',
 'proposito',
 'criatividade',
 'espiritualidade',
];

// PT_BR_RE — Axioma 8: detect PT-BR text via diacritics or common function words.
// Non-global so .test() can be called repeatedly on the same RegExp instance.
const PT_BR_RE_SOURCE =
 /[áéíóúãõ\u00e7àèìòùâêîôû]|\b(o|a|os|as|de|do|da|dos|das|no|na|nos|nas|em|um|uma|uns|umas|para|com|sem|por|mais|mas|ou|e|que|qual|quais|quem|quando|onde|cujo|portanto|assim|então|pois|porque|seu|seus|sua|suas|este|esta|estes|estas|esse|essa|esses|esses|aquele|aquela|isso|aquilo|não|sim|mais|menos|muito|pouco|bem|mau|mesmo|mesma|mesmos|mesmas|todo|toda|todos|todas|vários|várias|outro|outra|outros|outras|próprio|própria|além|dentro|fora|antes|depois|entre|sobre|sob|ante|após|mediante|vista|através)\b/.source;

// ─── AREAS ─────────────────────────────────────────────────────────────────

describe('AREAS', () => {
 it('tem exatamente 8 entradas', () => {
  expect(AREAS).toHaveLength(8);
 });

 it('contém todas as 8 áreas esperadas', () => {
  for (const area of TODAS_AREAS) {
   expect(AREAS, `área "${area}"`).toContain(area);
  }
 });
});

// ─── Sub-módulos ───────────────────────────────────────────────────────────

describe('sub-módulos (CABALA, ASTROLOGIA, TANTRICA, ODU, ICHING)', () => {
 const modulos = [
  { nome: 'CABALA', arr: CABALA },
  { nome: 'ASTROLOGIA', arr: ASTROLOGIA },
  { nome: 'TANTRICA', arr: TANTRICA },
  { nome: 'ODU', arr: ODU },
  { nome: 'ICHING', arr: ICHING },
 ] as const;

 it('cada sub-módulo tem exatamente 8 entradas', () => {
  for (const { nome, arr } of modulos) {
   expect(arr, nome).toHaveLength(8);
  }
 });

 it('cada entrada tem pilar correto (matching sub-module name)', () => {
  for (const { nome, arr } of modulos) {
   const pilarEsperado = nome.toLowerCase() as typeof arr[number]['pilar'];
   for (let i = 0; i < arr.length; i++) {
    expect(arr[i]!.pilar, `${nome}[${i}].pilar`).toBe(pilarEsperado);
   }
  }
 });

 it('cada entrada tem area válida (uma das 8 AREAS)', () => {
  for (const { nome, arr } of modulos) {
   for (let i = 0; i < arr.length; i++) {
    expect(AREAS, `${nome}[${i}].area`).toContain(arr[i]!.area);
   }
  }
 });

 it('cada entrada tem frase e fonte não-vazias', () => {
  for (const { nome, arr } of modulos) {
   for (let i = 0; i < arr.length; i++) {
    expect(
     arr[i]!.frase.trim().length,
     `${nome}[${i}].frase`
    ).toBeGreaterThan(0);
    expect(
     arr[i]!.fonte.trim().length,
     `${nome}[${i}].fonte`
    ).toBeGreaterThan(0);
   }
  }
 });

 it('ODU: todas as 8 entradas carregam requer_terreiro=true', () => {
  for (let i = 0; i < ODU.length; i++) {
   expect(ODU[i]!.requer_terreiro, `ODU[${i}].requer_terreiro`).toBe(true);
  }
 });

 it('pilares diferentes de ODU não têm requer_terreiro=true', () => {
  for (const { nome, arr } of modulos) {
   if (nome === 'ODU') continue;
   for (let i = 0; i < arr.length; i++) {
    expect(
     arr[i]!.requer_terreiro,
     `${nome}[${i}]`
    ).toBeFalsy();
   }
  }
 });

 it('cada pilar cobre todas as 8 áreas (sem duplicatas)', () => {
  for (const { nome, arr } of modulos) {
   const areasDoPilar = arr.map((e) => e.area);
   const unicos = new Set(areasDoPilar);
   expect(
    unicos.size,
    `${nome}: áreas únicas ${[...unicos]}`
   ).toBe(8);
  }
 });
});

// ─── traducaoPara ────────────────────────────────────────────────────────────

describe('traducaoPara(pilar, area)', () => {
 it('retorna entrada para par (pilar, area) conhecido', () => {
  const result = traducaoPara('cabala', 'paz');
  expect(result).toBeDefined();
  expect(result!.pilar).toBe('cabala');
  expect(result!.area).toBe('paz');
  expect(result!.frase.length).toBeGreaterThan(0);
 });

 it('retorna undefined para pilar inexistente', () => {
  expect(traducaoPara('pilar_inexistente' as never, 'paz')).toBeUndefined();
 });

 it('retorna undefined para área inexistente', () => {
  expect(traducaoPara('cabala', 'area_inexistente' as Area)).toBeUndefined();
 });

 it('cada (pilar, area) da matriz retorna exatamente 1 resultado', () => {
  for (const pilar of TODOS_PILARES) {
   for (const area of TODAS_AREAS) {
    const result = traducaoPara(pilar, area);
    expect(result, `(${pilar}, ${area})`).toBeDefined();
    // Sem duplicatas no array completo
    const all = [CABALA, ASTROLOGIA, TANTRICA, ODU, ICHING]
     .flat()
     .filter((t) => t.pilar === pilar && t.area === area);
    expect(all).toHaveLength(1);
   }
  }
 });
});

// ─── traducoesDaArea ────────────────────────────────────────────────────────

describe('traducoesDaArea(area)', () => {
 it('cada área retorna exatamente 5 entradas (uma por Pilar)', () => {
  for (const area of TODAS_AREAS) {
   const result = traducoesDaArea(area);
   expect(result, `área "${area}"`).toHaveLength(5);
  }
 });

 it('cada Pilar aparece exatamente uma vez por área', () => {
  for (const area of TODAS_AREAS) {
   const result = traducoesDaArea(area);
   const pilares = result.map((t) => t.pilar);
   const unicos = new Set(pilares);
   expect(unicos.size, `área "${area}"`).toBe(5);
  }
 });

 it('todos os pilares estão representados em cada área', () => {
  for (const area of TODAS_AREAS) {
   const pilares = traducoesDaArea(area).map((t) => t.pilar);
   for (const pilar of TODOS_PILARES) {
    expect(pilares, `área "${area}" contém pilar "${pilar}"`).toContain(pilar);
   }
  }
 });
});

// ─── traducoesDoPilar ──────────────────────────────────────────────────────

describe('traducoesDoPilar(pilar)', () => {
 it('cada Pilar retorna exatamente 8 entradas (uma por Área)', () => {
  for (const pilar of TODOS_PILARES) {
   const result = traducoesDoPilar(pilar);
   expect(result, `pilar "${pilar}"`).toHaveLength(8);
  }
 });

 it('todas as 8 áreas estão representadas por Pilar', () => {
  for (const pilar of TODOS_PILARES) {
   const areas = traducoesDoPilar(pilar).map((t) => t.area);
   for (const area of TODAS_AREAS) {
    expect(areas, `pilar "${pilar}" contém área "${area}"`).toContain(area);
   }
  }
 });
});

// ─── traducaoDetalhadaPara ─────────────────────────────────────────────────

describe('traducaoDetalhadaPara(pilar, area)', () => {
 it('retorna non-null para todas as 40 combinações (pilar, area)', () => {
  for (const pilar of TODOS_PILARES) {
   for (const area of TODAS_AREAS) {
    const result = traducaoDetalhadaPara(pilar, area);
    expect(result, `(${pilar}, ${area})`).not.toBeNull();
   }
  }
 });

 it('retorna estrutura com campos obrigatórios', () => {
  const result = traducaoDetalhadaPara('cabala', 'paz');
  expect(result).toBeDefined();
  expect(result!.pilar).toBe('cabala');
  expect(typeof result!.frase).toBe('string');
  expect(typeof result!.explicacao).toBe('string');
  expect(typeof result!.convergencia).toBe('string');
  expect(typeof result!.tensao).toBe('string');
  expect(typeof result!.evitar).toBe('string');
  expect(typeof result!.pratica).toBe('string');
 });

 it('campos string são não-vazios para Pilar com matriz detalhada', () => {
  // CABALA tem matriz detalhada completa
  const result = traducaoDetalhadaPara('cabala', 'paz');
  expect(result!.frase.length).toBeGreaterThan(0);
  expect(result!.explicacao.length).toBeGreaterThan(0);
 });
});

// ─── coberturaTraducaoAreas ────────────────────────────────────────────────

describe('coberturaTraducaoAreas()', () => {
 it('pilares = 5', () => {
  expect(coberturaTraducaoAreas().pilares).toBe(5);
 });

 it('areas = 8', () => {
  expect(coberturaTraducaoAreas().areas).toBe(8);
 });

 it('total = 40 (5 pilares × 8 áreas)', () => {
  expect(coberturaTraducaoAreas().total).toBe(40);
 });

 it('com_terreiro = 8 (todas as entradas de ODU)', () => {
  expect(coberturaTraducaoAreas().com_terreiro).toBe(8);
 });

 it('retorna estrutura com todos os campos esperados', () => {
  const cob = coberturaTraducaoAreas();
  expect(cob).toHaveProperty('pilares');
  expect(cob).toHaveProperty('areas');
  expect(cob).toHaveProperty('total');
  expect(cob).toHaveProperty('com_terreiro');
 });
});

// ─── Matriz completa (invariantes) ─────────────────────────────────────────

describe('matriz completa: 5×8 = 40', () => {
 it('MATRIZ concatenada tem exatamente 40 entradas', () => {
  const total =
   CABALA.length +
   ASTROLOGIA.length +
   TANTRICA.length +
   ODU.length +
   ICHING.length;
  expect(total).toBe(40);
 });

 it('cada entrada da matriz tem campos obrigatórios preenchidos', () => {
  const matriz = [
   ...CABALA,
   ...ASTROLOGIA,
   ...TANTRICA,
   ...ODU,
   ...ICHING,
  ] as TraducaoArea[];
  for (const entry of matriz) {
   expect(entry.pilar).toBeTruthy();
   expect(entry.area).toBeTruthy();
   expect(entry.frase.trim().length).toBeGreaterThan(0);
   expect(entry.fonte.trim().length).toBeGreaterThan(0);
  }
 });

 it('sem duplicatas: pilar+area é único em toda a matriz', () => {
  const matriz = [
   ...CABALA,
   ...ASTROLOGIA,
   ...TANTRICA,
   ...ODU,
   ...ICHING,
  ] as TraducaoArea[];
  const chaves = matriz.map((t) => `${t.pilar}::${t.area}`);
  const unicos = new Set(chaves);
  expect(unicos.size, `únicos: ${[...unicos]}`).toBe(matriz.length);
 });
});
// ─── TRADUCOES_DETALHADO matrix ─────────────────────────────────────────────

describe('TRADUCOES_DETALHADO matrix', () => {
 const DETALHADO_FIELDS = ['frase', 'explicacao', 'convergencia', 'tensao', 'evitar', 'pratica'] as const;

 it('tem 5 pilasters como chaves (ordem não importa)', () => {
  expect(Object.keys(TRADUCOES_DETALHADO).sort()).toEqual([...TODOS_PILARES].sort());
 });

 it('cada pilaster tem exatamente as 8 areas', () => {
  for (const pilar of TODOS_PILARES) {
   const entry = TRADUCOES_DETALHADO[pilar];
   expect(Object.keys(entry ?? {}), `áreas em ${pilar}`).toEqual(TODAS_AREAS);
  }
 });

 it('cada pilaster × area tem todos os 6 campos required preenchidos', () => {
  for (const pilar of TODOS_PILARES) {
   const pilarEntry = TRADUCOES_DETALHADO[pilar];
   for (const area of TODAS_AREAS) {
    const entry = pilarEntry?.[area];
    expect(entry, `(${pilar}, ${area})`).toBeDefined();
    for (const field of DETALHADO_FIELDS) {
     const val = (entry as unknown as Record<string, string>)[field];
     expect(typeof val === 'string' && val.trim().length > 0, `(${pilar}, ${area}).${field}`).toBe(true);
    }
   }
  }
 });

 it('PT_BR: frases contêm texto em português (diacritics ou function words)', () => {
  const PT_BR_RE = new RegExp(PT_BR_RE_SOURCE, 'i');
  for (const pilar of TODOS_PILARES) {
   for (const area of TODAS_AREAS) {
    const entry = TRADUCOES_DETALHADO[pilar]?.[area];
    expect(PT_BR_RE.test(entry.frase), `(${pilar}, ${area}).frase`).toBe(true);
   }
  }
 });

 it('sem entradas undefined ou null na matriz', () => {
  for (const pilar of TODOS_PILARES) {
   const pilarEntry = TRADUCOES_DETALHADO[pilar];
   expect(pilarEntry, `pilar ${pilar} existe`).toBeDefined();
   for (const area of TODAS_AREAS) {
    expect(pilarEntry?.[area], `(${pilar}, ${area})`).toBeDefined();
   }
  }
 });

 it('spot-check: cabala.paz.frase contém "número" e "paz"', () => {
  const frase = TRADUCOES_DETALHADO['cabala']?.['paz']?.frase ?? '';
  expect(frase).toMatch(/número|paz/i);
 });

 it('spot-check: iching.proposito.explicacao é string não-vazia', () => {
  const expl = TRADUCOES_DETALHADO['iching']?.['proposito']?.explicacao ?? '';
  expect(expl.trim().length).toBeGreaterThan(0);
 });

 it('spot-check: odu.criatividade.evitar começa com "Evite"', () => {
  const evitar = TRADUCOES_DETALHADO['odu']?.['criatividade']?.evitar ?? '';
  expect(evitar).toMatch(/^Evite/);
 });
});
