/**
 * @akasha/core-pilar7 — Testes de integracao do orquestrador `calcular`
 *
 * Verifica:
 * - calcular() retorna Pilar7Result completo com todos os campos
 * - chaveNatal e null quando Pilar 5 ausente (graceful)
 * - estagioAtual e coerente com idade e Pilar 4
 * - sequenceVenusiana (22) e caminhoDourado (11) presentes
 * - Textos placeholder estao presentes (substituidos em Wave 5+)
 * - versaoCalculo = 'v1' e calculadoEm = Date injetado
 * - Determinismo (com data injetada)
 */
import { describe, it, expect } from 'vitest';
import { calcular, VERSAO_CALCULO } from '../calcular';
import type { PilaresDados } from '../types';

const pilaresCompletos: PilaresDados = {
  pilar5: { hexagramNumber: 13, hexagramName: 'Concordancia entre os Homens' },
  pilar4: { oduPrincipal: 'Ogbe', faseVida: 'maturidade' },
  pilar6: { tipo: 'Iniciador', estrategia: 'Esperar Convite', autoridade: 'Sentiente' },
};

const dataFixa = new Date('2026-06-23T12:00:00Z');

describe('Pilar 7 — calcular (integracao)', () => {
  it('VERSAO_CALCULO = "v1"', () => {
    expect(VERSAO_CALCULO).toBe('v1');
  });

  it('retorna Pilar7Result com todos os campos', () => {
    const result = calcular(pilaresCompletos, 35, dataFixa);

    expect(result).toMatchObject({
      chaveNatal: {
        numero: 13,
        nome: 'A Comunhao',
        hexagramaOrigem: 'Concordancia entre os Homens',
        hexagramaOrigemChines: 'Tong Ren',
      },
      estagioAtual: 'dom', // maturidade (Pilar 4) → dom
      versaoCalculo: 'v1',
      calculadoEm: dataFixa,
    });

    expect(result.sombra).toMatch(/Placeholder Wave 4/);
    expect(result.dom).toMatch(/Placeholder Wave 4/);
    expect(result.siddhi).toMatch(/Placeholder Wave 4/);

    expect(result.sequenceVenusiana).toHaveLength(22);
    expect(result.caminhoDourado).toHaveLength(11);
  });

  it('chaveNatal = null quando Pilar 5 ausente (graceful)', () => {
    const result = calcular(
      { pilar5: { hexagramNumber: null, hexagramName: null } },
      35,
      dataFixa
    );
    expect(result.chaveNatal).toBeNull();
    expect(result.sombra).toBe('');
    expect(result.dom).toBe('');
    expect(result.siddhi).toBe('');
    expect(result.sequenceVenusiana).toEqual([]);
    expect(result.caminhoDourado).toEqual([]);
    // estagio cai para heuristica por idade (35 → maturidade → dom)
    expect(result.estagioAtual).toBe('dom');
  });

  it('estagioAtual segue Pilar 4 faseVida', () => {
    const inf = calcular(
      { ...pilaresCompletos, pilar4: { faseVida: 'infancia' } },
      80,
      dataFixa
    );
    expect(inf.estagioAtual).toBe('sombra');

    const sab = calcular(
      { ...pilaresCompletos, pilar4: { faseVida: 'sabedoria' } },
      25,
      dataFixa
    );
    expect(sab.estagioAtual).toBe('siddhi');
  });

  it('estagioAtual segue heuristica por idade quando Pilar 4 ausente', () => {
    const pilaresSemPilar4: PilaresDados = {
      pilar5: pilaresCompletos.pilar5,
    };
    expect(calcular(pilaresSemPilar4, 5, dataFixa).estagioAtual).toBe('sombra');
    expect(calcular(pilaresSemPilar4, 15, dataFixa).estagioAtual).toBe('sombra');
    expect(calcular(pilaresSemPilar4, 25, dataFixa).estagioAtual).toBe('dom');
    expect(calcular(pilaresSemPilar4, 45, dataFixa).estagioAtual).toBe('dom');
    expect(calcular(pilaresSemPilar4, 65, dataFixa).estagioAtual).toBe('siddhi');
  });

  it('textos placeholder contem numero da chave', () => {
    const result = calcular(pilaresCompletos, 35, dataFixa);
    expect(result.sombra).toContain('Chave 13');
    expect(result.dom).toContain('Chave 13');
    expect(result.siddhi).toContain('Chave 13');
  });

  it('calculadoEm e a data injetada (determinismo)', () => {
    const r1 = calcular(pilaresCompletos, 35, dataFixa);
    const r2 = calcular(pilaresCompletos, 35, dataFixa);
    expect(r1.calculadoEm).toEqual(dataFixa);
    expect(r2.calculadoEm).toEqual(dataFixa);
    expect(r1.calculadoEm).toBe(r2.calculadoEm);
  });

  it('determinismo: mesma entrada → mesmo output (exceto calculadoEm)', () => {
    const r1 = calcular(pilaresCompletos, 35, dataFixa);
    const r2 = calcular(pilaresCompletos, 35, dataFixa);

    expect(r1.chaveNatal?.numero).toBe(r2.chaveNatal?.numero);
    expect(r1.estagioAtual).toBe(r2.estagioAtual);
    expect(r1.sequenceVenusiana.map((s) => s.chave.numero)).toEqual(
      r2.sequenceVenusiana.map((s) => s.chave.numero)
    );
    expect(r1.caminhoDourado.map((c) => c.chave.numero)).toEqual(
      r2.caminhoDourado.map((c) => c.chave.numero)
    );
  });

  it('versaoCalculo sempre = "v1"', () => {
    const r = calcular(pilaresCompletos, 35, dataFixa);
    expect(r.versaoCalculo).toBe('v1');
  });

  it('integracao Pilar 5 + Sequence + Pathway: ponta a ponta', () => {
    // Caso real: consulente com Pilar 5 = hexagrama 1 (O Criativo)
    const result = calcular(
      {
        pilar5: { hexagramNumber: 1, hexagramName: 'O Criativo' },
        pilar4: { faseVida: 'maturidade' },
      },
      40,
      dataFixa
    );
    expect(result.chaveNatal?.numero).toBe(1);
    expect(result.chaveNatal?.nome).toBe('A Forca Criadora');
    expect(result.chaveNatal?.glifo).toBe('乾');
    expect(result.estagioAtual).toBe('dom');
    expect(result.sequenceVenusiana[0].chave.numero).toBe(1);
    expect(result.caminhoDourado[0].chave.numero).toBe(1);
    // Sequence tem 22 chaves distintas
    const seqNumbers = new Set(
      result.sequenceVenusiana.map((s) => s.chave.numero)
    );
    expect(seqNumbers.size).toBe(22);
    // Caminho tem 11 chaves distintas
    const pathNumbers = new Set(
      result.caminhoDourado.map((c) => c.chave.numero)
    );
    expect(pathNumbers.size).toBe(11);
  });

  it('NUNCA retorna 4º estagio (whitelist 3)', () => {
    // Cobre varios perfis para garantir que apenas 3 valores sao possiveis.
    const perfis: Array<[number, PilaresDados['pilar4']]> = [
      [5, null],
      [15, null],
      [25, null],
      [40, null],
      [65, null],
      [80, { faseVida: 'infancia' }],
      [25, { faseVida: 'sabedoria' }],
      [40, { faseVida: 'juventude' }],
    ];
    const estagiosVistos = new Set<string>();
    for (const [idade, p4] of perfis) {
      const r = calcular(
        { pilar5: { hexagramNumber: 13, hexagramName: null }, pilar4: p4 },
        idade,
        dataFixa
      );
      estagiosVistos.add(r.estagioAtual);
    }
    expect(estagiosVistos).toEqual(new Set(['sombra', 'dom', 'siddhi']));
  });
});
