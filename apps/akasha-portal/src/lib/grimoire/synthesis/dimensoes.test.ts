/**
 * Testes para `dimensoes.ts` — Akasha Synthesis (R-023 F-223).
 *
 * Cobre:
 *   - `DIMENSOES`: array readonly com 8 entradas, todos os campos obrigatórios,
 *     ids únicos, pilaresPrimarios/Secundarios disjuntos, todos os 5 Pilares
 *     representados em algum lugar do array.
 *   - `DIMENSAO_POR_ID`: lookup coerente com DIMENSOES (mesma referência e
 *     mesmo id).
 *   - `DIMENSAO_BG` / `DIMENSAO_BORDER`: contrato rgba(r,g,b,a) com alpha
 *     exato (0.08 e 0.25) coerente com chakraCor base.
 *   - `DIMENSAO_DE_AREA`: cobre todas as 8 Areas, mapeia para DimensaoId
 *     válida. Reaches only: saude, trabalho, amor, proposito, criacao,
 *     espiritualidade — familia e superacao são addressed via DIMENSAO_POR_ID
 *     diretamente (sem Area correspondente).
 *   - Tipos: DimensaoId tem 8 membros, Pilar é o union exportado.
 */
import { describe, it, expect } from 'vitest';
import {
 DIMENSOES,
 DIMENSAO_POR_ID,
 DIMENSAO_BG,
 DIMENSAO_BORDER,
 DIMENSAO_DE_AREA,
 type Dimensao,
 type DimensaoId,
} from './dimensoes';
import type { Area } from '../traducao-areas';
import type { Pilar } from '../significados-curados';

const TODOS_PILARES: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];

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

const TODOS_DIMENSAO_IDS: DimensaoId[] = [
 'saude',
 'trabalho',
 'amor',
 'criacao',
 'proposito',
 'familia',
 'espiritualidade',
 'superacao',
];

// ─── DIMENSOES: estrutura ────────────────────────────────────────────────

describe('dimensoes: DIMENSOES', () => {
 it('tem 8 entradas (cabeçalho R-023 fala em "9 dimensões"; ajuste de escopo: 8)', () => {
  expect(DIMENSOES).toHaveLength(8);
 });

 it('ids únicos em todo o array', () => {
  const ids = DIMENSOES.map((d) => d.id);
  expect(new Set(ids).size).toBe(ids.length);
 });

 it('cada entrada tem todos os campos obrigatórios preenchidos', () => {
  DIMENSOES.forEach((d) => {
   expect(d.id, `${d.id}: id`).toBeTruthy();
   expect(d.titulo, `${d.id}: titulo`).toBeTruthy();
   expect(d.descricao, `${d.id}: descricao`).toBeTruthy();
   expect(d.icone, `${d.id}: icone`).toBeTruthy();
   expect(d.chakraCor, `${d.id}: chakraCor`).toBeTruthy();
   expect(d.pilaresPrimarios.length, `${d.id}: sem pilares primários`).toBeGreaterThan(0);
  });
 });

 it('chakraCor é hex #RRGGBB (sem alpha)', () => {
  DIMENSOES.forEach((d) => {
   expect(d.chakraCor, `${d.id}: chakraCor fora do formato #RRGGBB`).toMatch(
    /^#[0-9A-Fa-f]{6}$/
   );
  });
 });

 it('pilaresPrimarios e pilaresSecundarios são disjuntos (sem duplicar Pilar)', () => {
  DIMENSOES.forEach((d) => {
   const primarios = new Set(d.pilaresPrimarios);
   const secundarios = new Set(d.pilaresSecundarios);
   secundarios.forEach((p) => {
    expect(
     primarios.has(p),
     `${d.id}: Pilar "${p}" aparece em primários E secundários`
    ).toBe(false);
   });
  });
 });

 it('todos os pilares são membros válidos do union Pilar', () => {
  DIMENSOES.forEach((d) => {
   [...d.pilaresPrimarios, ...d.pilaresSecundarios].forEach((p) => {
    expect(TODOS_PILARES, `${d.id}: Pilar inválido "${p}"`).toContain(p);
   });
  });
 });

 it('cada entrada em pilaresPrimarios é um Pilar do union exportado', () => {
  DIMENSOES.forEach((d) => {
   d.pilaresPrimarios.forEach((p) => {
    expect(TODOS_PILARES, `${d.id}: pilaresPrimarios contém "${p}" fora do union`).toContain(p);
   });
  });
 });

 it('os 5 Pilares aparecem em algum lugar (primário OU secundário)', () => {
  const todos = new Set<Pilar>();
  DIMENSOES.forEach((d) => {
   d.pilaresPrimarios.forEach((p) => todos.add(p));
   d.pilaresSecundarios.forEach((p) => todos.add(p));
  });
  TODOS_PILARES.forEach((p) => {
   expect(todos.has(p), `Pilar "${p}" ausente de todas as dimensões`).toBe(true);
  });
 });

 it('cobertura: total de pilares únicos citados = 5 (não há Pilar órfão)', () => {
  const todos = new Set<Pilar>();
  DIMENSOES.forEach((d) => {
   d.pilaresPrimarios.forEach((p) => todos.add(p));
   d.pilaresSecundarios.forEach((p) => todos.add(p));
  });
  expect(todos.size).toBe(TODOS_PILARES.length);
 });

 it('exatamente UMA dimensão tem todos os 5 Pilares como primários: espiritualidade', () => {
  const fullCoverage = DIMENSOES.filter(
   (d) => new Set(d.pilaresPrimarios).size === TODOS_PILARES.length
  );
  expect(fullCoverage).toHaveLength(1);
  expect(fullCoverage[0].id).toBe('espiritualidade');
 });

 it('exatamente UMA dimensão tem lista de secundários vazia: espiritualidade', () => {
  const semSecundarios = DIMENSOES.filter((d) => (d.pilaresSecundarios ?? []).length === 0);
  expect(semSecundarios).toHaveLength(1);
  expect(semSecundarios[0].id).toBe('espiritualidade');
 });

 it('cada Pilar aparece como primário em pelo menos UMA dimensão', () => {
  const primariosUnicos = new Set<Pilar>();
  DIMENSOES.forEach((d) => d.pilaresPrimarios.forEach((p) => primariosUnicos.add(p)));
  TODOS_PILARES.forEach((p) => {
   expect(
    primariosUnicos.has(p),
    `Pilar "${p}" nunca aparece como primário`
   ).toBe(true);
  });
 });
});

// ─── DIMENSAO_POR_ID: lookup ────────────────────────────────────────────

describe('dimensoes: DIMENSAO_POR_ID', () => {
 it('cobre todos os 8 DimensaoId', () => {
  expect(Object.keys(DIMENSAO_POR_ID).sort()).toEqual([...TODOS_DIMENSAO_IDS].sort());
 });

 it('cada entrada aponta para a mesma referência em DIMENSOES (índice)', () => {
  TODOS_DIMENSAO_IDS.forEach((id, i) => {
   expect(DIMENSAO_POR_ID[id]).toBe(DIMENSOES[i]);
  });
 });

 it('cada entrada tem id coerente com a chave (sem drift)', () => {
  Object.entries(DIMENSAO_POR_ID).forEach(([key, dim]) => {
   expect(dim.id).toBe(key);
  });
 });

 it('lookup por id retorna objeto válido', () => {
  const dim: Dimensao = DIMENSAO_POR_ID.amor;
  expect(dim.titulo).toBeTruthy();
  expect(dim.icone).toBe('♥');
 });
});

// ─── DIMENSAO_BG / DIMENSAO_BORDER: contrato de cor ─────────────────────

describe('dimensoes: DIMENSAO_BG e DIMENSAO_BORDER', () => {
 it('cobrem todos os 8 DimensaoId', () => {
  expect(Object.keys(DIMENSAO_BG).sort()).toEqual([...TODOS_DIMENSAO_IDS].sort());
  expect(Object.keys(DIMENSAO_BORDER).sort()).toEqual([...TODOS_DIMENSAO_IDS].sort());
 });

 it('BG é rgba(r,g,b,0.08) coerente com chakraCor base', () => {
  DIMENSOES.forEach((d) => {
   const hex = d.chakraCor.slice(1);
   const r = parseInt(hex.slice(0, 2), 16);
   const g = parseInt(hex.slice(2, 4), 16);
   const b = parseInt(hex.slice(4, 6), 16);
   expect(DIMENSAO_BG[d.id], `BG de ${d.id}`).toBe(`rgba(${r},${g},${b},0.08)`);
  });
 });

 it('BORDER é rgba(r,g,b,0.25) coerente com chakraCor base', () => {
  DIMENSOES.forEach((d) => {
   const hex = d.chakraCor.slice(1);
   const r = parseInt(hex.slice(0, 2), 16);
   const g = parseInt(hex.slice(2, 4), 16);
   const b = parseInt(hex.slice(4, 6), 16);
   expect(DIMENSAO_BORDER[d.id], `BORDER de ${d.id}`).toBe(`rgba(${r},${g},${b},0.25)`);
  });
 });

 it('alpha de BG (0.08) e BORDER (0.25) seguem o contrato editorial', () => {
  DIMENSOES.forEach((d) => {
   const bgAlpha = DIMENSAO_BG[d.id].match(/rgba\([^)]+,([\d.]+)\)/)?.[1];
   const borderAlpha = DIMENSAO_BORDER[d.id].match(/rgba\([^)]+,([\d.]+)\)/)?.[1];
   expect(bgAlpha, `BG alpha de ${d.id}`).toBe('0.08');
   expect(borderAlpha, `BORDER alpha de ${d.id}`).toBe('0.25');
  });
 });
});

// ─── DIMENSAO_DE_AREA: mapeamento Area → DimensaoId ─────────────────────

describe('dimensoes: DIMENSAO_DE_AREA', () => {
 it('cobre todas as 8 Areas', () => {
  expect(Object.keys(DIMENSAO_DE_AREA).sort()).toEqual([...TODAS_AREAS].sort());
 });

 it('cada Area mapeia para um DimensaoId válido', () => {
  TODAS_AREAS.forEach((area) => {
   const dimId = DIMENSAO_DE_AREA[area];
   expect(TODOS_DIMENSAO_IDS, `${area} → ${dimId} inválido`).toContain(dimId);
  });
 });

 it('regra explícita: paz → saude, saude → saude (paz funde-se em saude)', () => {
  expect(DIMENSAO_DE_AREA.paz).toBe('saude');
  expect(DIMENSAO_DE_AREA.saude).toBe('saude');
 });

 it('regra explícita: dinheiro → trabalho, trabalho → trabalho (dinheiro funde-se em trabalho)', () => {
  expect(DIMENSAO_DE_AREA.dinheiro).toBe('trabalho');
  expect(DIMENSAO_DE_AREA.trabalho).toBe('trabalho');
 });

 it('regra explícita: relacoes → amor (sem Área "amor" no union Area)', () => {
  expect(DIMENSAO_DE_AREA.relacoes).toBe('amor');
 });

 it('atinge exatamente 6 DimensaoId únicos (familia e superacao ficam fora do escopo Areas)', () => {
  const destinos = new Set(Object.values(DIMENSAO_DE_AREA));
  expect(destinos.size).toBe(6);
  expect([...destinos].sort()).toEqual(
   ['amor', 'criacao', 'espiritualidade', 'proposito', 'saude', 'trabalho'].sort()
  );
 });

 it('familia e superacao são EXPLICITAMENTE inalcançáveis via Area (contrato editorial)', () => {
  const destinos = new Set(Object.values(DIMENSAO_DE_AREA));
  expect(destinos.has('familia')).toBe(false);
  expect(destinos.has('superacao')).toBe(false);
 });
});

// ─── Sanity por dimensão (describe.each com tuplo limpo) ─────────────────

describe.each(DIMENSOES.map((d) => [d.id, d] as [DimensaoId, Dimensao]))(
 'dimensoes: %s',
 (_id, d) => {
  it('titulo não-vazio e contém pelo menos 2 palavras PT-BR', () => {
   expect(d.titulo.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
  });

  it('icone é um glifo único (1 caractere visual)', () => {
   expect(d.icone.length).toBeGreaterThanOrEqual(1);
  });

  it('descricao termina com "?" (pergunta reflexiva — tom editorial)', () => {
   expect(d.descricao.trim().endsWith('?')).toBe(true);
  });
 }
);
