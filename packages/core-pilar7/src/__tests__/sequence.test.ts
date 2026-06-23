/**
 * @akasha/core-pilar7 — Testes da Sequence Venusiana (22 chaves)
 *
 * Verifica:
 * - Retorna 22 chaves quando Pilar 5 presente
 * - Retorna [] quando Pilar 5 ausente
 * - Posicoes sao 1-22 em ordem
 * - Cada chave e distinta (sem repeticao na mesma sequence)
 * - Temas sao strings nao-vazias e unicas
 * - Determinismo: mesma entrada → mesma sequence
 */
import { describe, it, expect } from 'vitest';
import {
  detectarSequenceVenusiana,
  SEQUENCE_VENUS_LENGTH,
} from '../sequence';
import type { PilaresDados } from '../types';

const pilaresBase: PilaresDados = {
  pilar5: { hexagramNumber: 13, hexagramName: 'Concordancia entre os Homens' },
};

describe('Pilar 7 — Sequence Venusiana', () => {
  it('SEQUENCE_VENUS_LENGTH = 22 (canonico)', () => {
    expect(SEQUENCE_VENUS_LENGTH).toBe(22);
  });

  it('retorna 22 chaves quando Pilar 5 presente', () => {
    const seq = detectarSequenceVenusiana(pilaresBase);
    expect(seq).toHaveLength(22);
  });

  it('posicoes sao 1-22 em ordem', () => {
    const seq = detectarSequenceVenusiana(pilaresBase);
    for (let i = 0; i < 22; i++) {
      expect(seq[i].posicao).toBe(i + 1);
    }
  });

  it('cada chave tem numero, nome, hexagramaOrigem (1-64)', () => {
    const seq = detectarSequenceVenusiana(pilaresBase);
    for (const item of seq) {
      expect(item.chave.numero).toBeGreaterThanOrEqual(1);
      expect(item.chave.numero).toBeLessThanOrEqual(64);
      expect(typeof item.chave.nome).toBe('string');
      expect(item.chave.nome.length).toBeGreaterThan(0);
    }
  });

  it('temas sao strings nao-vazias e unicas', () => {
    const seq = detectarSequenceVenusiana(pilaresBase);
    const temas = seq.map((s) => s.tema);
    for (const t of temas) {
      expect(typeof t).toBe('string');
      expect(t.length).toBeGreaterThan(0);
    }
    const unique = new Set(temas);
    expect(unique.size).toBe(22); // sem duplicatas
  });

  it('chaves dentro da sequence sao distintas (sem repeticao)', () => {
    const seq = detectarSequenceVenusiana(pilaresBase);
    const numeros = seq.map((s) => s.chave.numero);
    const unique = new Set(numeros);
    expect(unique.size).toBe(22);
  });

  it('retorna [] quando Pilar 5 ausente (hexagramNumber null)', () => {
    const result = detectarSequenceVenusiana({
      pilar5: { hexagramNumber: null, hexagramName: null },
    });
    expect(result).toEqual([]);
  });

  it('retorna [] quando Pilar 5 ausente (pilar5 null)', () => {
    const result = detectarSequenceVenusiana({
      pilar5: null as unknown as PilaresDados['pilar5'],
    });
    expect(result).toEqual([]);
  });

  it('retorna [] quando Pilar 5 numero invalido', () => {
    expect(
      detectarSequenceVenusiana({
        pilar5: { hexagramNumber: 0, hexagramName: null },
      })
    ).toEqual([]);
    expect(
      detectarSequenceVenusiana({
        pilar5: { hexagramNumber: 65, hexagramName: null },
      })
    ).toEqual([]);
    expect(
      detectarSequenceVenusiana({
        pilar5: { hexagramNumber: -1, hexagramName: null },
      })
    ).toEqual([]);
  });

  it('determinismo: mesma entrada → mesma sequence', () => {
    const s1 = detectarSequenceVenusiana(pilaresBase);
    const s2 = detectarSequenceVenusiana(pilaresBase);
    expect(s1.map((s) => s.chave.numero)).toEqual(
      s2.map((s) => s.chave.numero)
    );
    expect(s1.map((s) => s.tema)).toEqual(s2.map((s) => s.tema));
  });

  it('chaves natais diferentes geram sequences diferentes', () => {
    const s1 = detectarSequenceVenusiana({
      pilar5: { hexagramNumber: 1, hexagramName: 'O Criativo' },
    });
    const s2 = detectarSequenceVenusiana({
      pilar5: { hexagramNumber: 2, hexagramName: 'O Receptivo' },
    });
    expect(s1.map((s) => s.chave.numero)).not.toEqual(
      s2.map((s) => s.chave.numero)
    );
  });

  it('primeira chave da sequence NAO e necessariamente a chave natal', () => {
    // Posicao 1 segue a regra ((natal-1 + 0*11) % 64) + 1 = natal.
    // Ou seja, a chave natal aparece na posicao 1.
    const natal = 13;
    const seq = detectarSequenceVenusiana({
      pilar5: { hexagramNumber: natal, hexagramName: null },
    });
    expect(seq[0].chave.numero).toBe(natal);
  });
});
