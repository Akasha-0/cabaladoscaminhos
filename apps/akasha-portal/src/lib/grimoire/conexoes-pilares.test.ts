/**
 * Testes para `conexoes-pilares.ts` — GRIMOIRE coverage.
 */
import { describe, it, expect } from 'vitest';
import {
 conexao,
 conexoesDe,
 conexoesPara,
 matrizConexoes,
 coberturaConexoes,
 PARES_PILARES,
} from './conexoes-pilares';

const PILARES = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as const;

describe('matrizConexoes', () => {
 it('retorna exatamente 20 entradas', () => {
  expect(matrizConexoes()).toHaveLength(20);
 });

 it('todas as entradas têm origem !== destino', () => {
  for (const c of matrizConexoes()) {
   expect(c.origem).not.toBe(c.destino);
  }
 });

 it('todas as entradas têm frase e fonte não vazios', () => {
  for (const c of matrizConexoes()) {
   expect(typeof c.frase).toBe('string');
   expect(c.frase.length).toBeGreaterThan(0);
   expect(typeof c.fonte).toBe('string');
   expect(c.fonte.length).toBeGreaterThan(0);
  }
 });
});

describe('PARES_PILARES', () => {
 it('tem exatamente 20 pares', () => {
  expect(PARES_PILARES).toHaveLength(20);
 });

 it('não contém pares iguais (origem === destino)', () => {
  for (const [o, d] of PARES_PILARES) {
   expect(o).not.toBe(d);
  }
 });

 it('contém todos os pares origem→destino único', () => {
  const pares = new Set(PARES_PILARES.map(([o, d]) => `${o}→${d}`));
  expect(pares.size).toBe(20);
 });
});

describe('conexao(origem, destino)', () => {
 it('retorna conexão definida para pares válidos (ex: cabala→astrologia)', () => {
  const c = conexao('cabala', 'astrologia');
  expect(c).toBeDefined();
  expect(c?.origem).toBe('cabala');
  expect(c?.destino).toBe('astrologia');
 });

 it('retorna conexão definida para pares válidos (ex: odu→iching)', () => {
  const c = conexao('odu', 'iching');
  expect(c).toBeDefined();
  expect(c?.origem).toBe('odu');
  expect(c?.destino).toBe('iching');
 });

 it('retorna conexão definida para TODOS os 20 pares não-diagonal de PARES_PILARES', () => {
  for (const [o, d] of PARES_PILARES) {
   expect(conexao(o, d), `${o}→${d}`).toBeDefined();
  }
 });

 it('retorna undefined para conexões consigo mesmo (cada pilar)', () => {
  for (const pilar of PILARES) {
   expect(conexao(pilar, pilar)).toBeUndefined();
  }
 });
});

describe('conexoesDe(origem)', () => {
 it('retorna exatamente 4 entradas para cada pilar', () => {
  for (const pilar of PILARES) {
   expect(conexoesDe(pilar)).toHaveLength(4);
  }
 });

 it('todas as conexões têm origem igual ao pilar informado', () => {
  for (const pilar of PILARES) {
   for (const c of conexoesDe(pilar)) {
    expect(c.origem).toBe(pilar);
   }
  }
 });

 it('os 4 destinos são todos diferentes entre si', () => {
  for (const pilar of PILARES) {
   const destinos = conexoesDe(pilar).map((c) => c.destino);
   const unicos = new Set(destinos);
   expect(unicos.size).toBe(4);
  }
 });
});

describe('conexoesPara(destino)', () => {
 it('retorna exatamente 4 entradas para cada pilar', () => {
  for (const pilar of PILARES) {
   expect(conexoesPara(pilar)).toHaveLength(4);
  }
 });

 it('todas as conexões têm destino igual ao pilar informado', () => {
  for (const pilar of PILARES) {
   for (const c of conexoesPara(pilar)) {
    expect(c.destino).toBe(pilar);
   }
  }
 });

 it('as 4 origens são todas diferentes entre si', () => {
  for (const pilar of PILARES) {
   const origens = conexoesPara(pilar).map((c) => c.origem);
   const unicos = new Set(origens);
   expect(unicos.size).toBe(4);
  }
 });
});

describe('coberturaConexoes', () => {
 it('retorna objeto com campos origens, destinos, total e com_terreiro', () => {
  const cobertura = coberturaConexoes();
  expect(cobertura).toHaveProperty('origens');
  expect(cobertura).toHaveProperty('destinos');
  expect(cobertura).toHaveProperty('total');
  expect(cobertura).toHaveProperty('com_terreiro');
 });

 it('origens e destinos são ambos 5', () => {
  const cobertura = coberturaConexoes();
  expect(cobertura.origens).toBe(5);
  expect(cobertura.destinos).toBe(5);
 });

 it('total é 20', () => {
  expect(coberturaConexoes().total).toBe(20);
 });

 it('com_terreiro reflete o número real de entradas com requer_terreiro', () => {
  const esperado = matrizConexoes().filter((c) => c.requer_terreiro).length;
  expect(coberturaConexoes().com_terreiro).toBe(esperado);
 });
});

describe('consistência entre funções', () => {
 it('matrizConexoes e PARES_PILARES têm o mesmo tamanho', () => {
  expect(matrizConexoes().length).toBe(PARES_PILARES.length);
 });

 it('PARES_PILARES cobre todos os pares únicos de PILARES×PILARES sem diagonal', () => {
  // Cada pilar tem 4 destinos (≠ si mesmo)
  // 5 pilares × 4 destinos = 20 pares
  const esperados = new Set<string>();
  for (const o of PILARES) {
   for (const d of PILARES) {
    if (o !== d) esperados.add(`${o}→${d}`);
   }
  }
  const reais = new Set(PARES_PILARES.map(([o, d]) => `${o}→${d}`));
  expect(reais).toEqual(esperados);
 });

 it('todo par em PARES_PILARES tem conexão definida em matrizConexoes', () => {
  for (const [o, d] of PARES_PILARES) {
   const c = conexao(o, d);
   expect(c).toBeDefined();
  }
 });
});
