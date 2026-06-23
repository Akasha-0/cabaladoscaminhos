/**
 * Testes para `reversed-systems.ts` (F-228 — Grimório).
 *
 * Estrutura testada:
 *   SistemaHerdado  — interface com 6 campos
 *   SISTEMAS_HERDADOS — array de 9 sistemas estudados (R-001 a R-020)
 *   resumoSistemasHerdados() — devolve Array<{ nome, resumo }>
 *
 * Estratégia: testes de estrutura (cardinalidade, unicidade,
 * preenchimento de campos) + teste deoutput da função pública.
 */
import { describe, it, expect } from 'vitest';
import {
 SISTEMAS_HERDADOS,
 resumoSistemasHerdados,
 type SistemaHerdado,
} from './reversed-systems';

// ─── helpers ─────────────────────────────────────────────────────────────────

const CAMPOS_OBRIGATORIOS: (keyof SistemaHerdado)[] = [
 'nome',
 'resumo',
 'oQueAkashaHerdou',
 'comoApareceNaUI',
 'fonte',
 'origem',
];

/** Todos os nomes presentes no array. */
const nomes = () => SISTEMAS_HERDADOS.map((s) => s.nome);

// ─── SISTEMAS_HERDADOS — estrutura ────────────────────────────────────────────

describe('SISTEMAS_HERDADOS: cardinalidade e unicidade', () => {
 it('contém exatamente 9 sistemas', () => {
  expect(SISTEMAS_HERDADOS).toHaveLength(9);
 });

 it('todos os nomes são únicos', () => {
  const unicos = new Set(nomes());
  expect(unicos.size).toBe(nomes().length);
 });
});

// ─── SISTEMAS_HERDADOS — invariantes por entrada ──────────────────────────────

describe('SISTEMAS_HERDADOS: invariantes por entrada', () => {
 SISTEMAS_HERDADOS.forEach((sistema) => {
  describe(`"${sistema.nome}"`, () => {
   it('todos os 6 campos obrigatórios estão presentes e são truthy', () => {
    CAMPOS_OBRIGATORIOS.forEach((campo) => {
     const valor = sistema[campo];
     expect(valor, `"${sistema.nome}".${campo} é vazio`).toBeTruthy();
    });
   });

   it('nome e resumo são strings não-vazias (sem whitespace-only)', () => {
    expect(sistema.nome.trim().length, `"${sistema.nome}".nome whitespace-only`).toBeGreaterThan(0);
    expect(sistema.resumo.trim().length, `"${sistema.nome}".resumo whitespace-only`).toBeGreaterThan(0);
   });

   it('fonte e origem são strings não-vazias', () => {
    expect(sistema.fonte.trim().length, `"${sistema.nome}".fonte vazia`).toBeGreaterThan(0);
    expect(sistema.origem.trim().length, `"${sistema.nome}".origem vazia`).toBeGreaterThan(0);
   });

   it('oQueAkashaHerdou tem entre 2 e 7 itens', () => {
    expect(sistema.oQueAkashaHerdou.length, `"${sistema.nome}": ${sistema.oQueAkashaHerdou.length} itens`)
     .toBeGreaterThanOrEqual(2);
    expect(sistema.oQueAkashaHerdou.length, `"${sistema.nome}": ${sistema.oQueAkashaHerdou.length} itens`)
     .toBeLessThanOrEqual(7);
   });

   it('comoApareceNaUI tem entre 1 e 3 itens', () => {
    expect(
     sistema.comoApareceNaUI.length,
     `"${sistema.nome}": ${sistema.comoApareceNaUI.length} itens`
    ).toBeGreaterThanOrEqual(1);
    expect(
     sistema.comoApareceNaUI.length,
     `"${sistema.nome}": ${sistema.comoApareceNaUI.length} itens`
    ).toBeLessThanOrEqual(3);
   });

   it('todos os itens de oQueAkashaHerdou são strings não-vazias', () => {
    sistema.oQueAkashaHerdou.forEach((item, i) => {
     expect(item.trim().length, `"${sistema.nome}".oQueAkashaHerdou[${i}] vazio`).toBeGreaterThan(0);
    });
   });

   it('todos os itens de comoApareceNaUI são strings não-vazias', () => {
    sistema.comoApareceNaUI.forEach((item, i) => {
     expect(item.trim().length, `"${sistema.nome}".comoApareceNaUI[${i}] vazio`).toBeGreaterThan(0);
    });
   });
  });
 });
});

// ─── resumoSistemasHerdados() ─────────────────────────────────────────────────

describe('resumoSistemasHerdados()', () => {
 it('devolve exatamente 9 itens (um por sistema)', () => {
  expect(resumoSistemasHerdados()).toHaveLength(9);
 });

 it('cada item tem exatamente os campos nome e resumo', () => {
  const resultado = resumoSistemasHerdados();
  resultado.forEach((item) => {
   const chaves = Object.keys(item).sort();
   expect(chaves).toEqual(['nome', 'resumo']);
  });
 });

 it('os nomes returnedos coincidem com SISTEMAS_HERDADOS na mesma ordem', () => {
  const resultado = resumoSistemasHerdados();
  resultado.forEach((item, i) => {
   expect(item.nome).toBe(SISTEMAS_HERDADOS[i].nome);
  });
 });

 it('os resumos returnedos coincidem com SISTEMAS_HERDADOS na mesma ordem', () => {
  const resultado = resumoSistemasHerdados();
  resultado.forEach((item, i) => {
   expect(item.resumo).toBe(SISTEMAS_HERDADOS[i].resumo);
  });
 });

 it('chamadas repetidas devolvem arrays com mesmo conteúdo (pureza)', () => {
  const a = resumoSistemasHerdados();
  const b = resumoSistemasHerdados();
  expect(a).toEqual(b);
  expect(a).not.toBe(b); // mas instâncias independentes
 });
});

// ─── SISTEMAS_HERDADOS — campos fonte e origem ───────────────────────────────

describe('SISTEMAS_HERDADOS: fonte e origem por sistema', () => {
 it('todo sistema tem campo fonte que referencia pesquisa primária (R-XXX ou RQ-XXX)', () => {
  SISTEMAS_HERDADOS.forEach((sistema) => {
   const ref = sistema.fonte;
   const temRef = /R-\d+|RQ-\d+/.test(ref);
   expect(temRef, `"${sistema.nome}".fonte="${ref}" sem referência R- ou RQ-`).toBe(true);
  });
 });

 it('todo sistema tem campo origem com período ou século (não-vazio)', () => {
  SISTEMAS_HERDADOS.forEach((sistema) => {
   expect(sistema.origem.trim().length, `"${sistema.nome}".origem vazia`).toBeGreaterThan(3);
  });
 });
});
