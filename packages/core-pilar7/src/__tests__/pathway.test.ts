/**
 * @akasha/core-pilar7 — Testes do Caminho Dourado (11 chaves)
 *
 * Verifica:
 * - Retorna 11 chaves quando Pilar 5 presente
 * - Retorna [] quando Pilar 5 ausente
 * - Posicoes sao 1-11 em ordem
 * - Cada chave e distinta (sem repeticao)
 * - Temas sao strings nao-vazias e unicas
 * - Determinismo: mesma entrada → mesmo caminho
 */
import { describe, it, expect } from 'vitest';
import {
  detectarCaminhoDourado,
  CAMINHO_DOURADO_LENGTH,
} from '../pathway';
import type { PilaresDados } from '../types';

const pilaresBase: PilaresDados = {
  pilar5: { hexagramNumber: 13, hexagramName: 'Concordancia entre os Homens' },
};

describe('Pilar 7 — Caminho Dourado', () => {
  it('CAMINHO_DOURADO_LENGTH = 11 (canonico)', () => {
    expect(CAMINHO_DOURADO_LENGTH).toBe(11);
  });

  it('retorna 11 chaves quando Pilar 5 presente', () => {
    const caminho = detectarCaminhoDourado(pilaresBase);
    expect(caminho).toHaveLength(11);
  });

  it('posicoes sao 1-11 em ordem', () => {
    const caminho = detectarCaminhoDourado(pilaresBase);
    for (let i = 0; i < 11; i++) {
      expect(caminho[i].posicao).toBe(i + 1);
    }
  });

  it('cada chave tem numero, nome, hexagramaOrigem (1-64)', () => {
    const caminho = detectarCaminhoDourado(pilaresBase);
    for (const item of caminho) {
      expect(item.chave.numero).toBeGreaterThanOrEqual(1);
      expect(item.chave.numero).toBeLessThanOrEqual(64);
      expect(typeof item.chave.nome).toBe('string');
      expect(item.chave.nome.length).toBeGreaterThan(0);
    }
  });

  it('temas sao strings nao-vazias e unicas', () => {
    const caminho = detectarCaminhoDourado(pilaresBase);
    const temas = caminho.map((s) => s.tema);
    for (const t of temas) {
      expect(typeof t).toBe('string');
      expect(t.length).toBeGreaterThan(0);
    }
    const unique = new Set(temas);
    expect(unique.size).toBe(11); // sem duplicatas
  });

  it('chaves dentro do caminho sao distintas (sem repeticao)', () => {
    const caminho = detectarCaminhoDourado(pilaresBase);
    const numeros = caminho.map((s) => s.chave.numero);
    const unique = new Set(numeros);
    expect(unique.size).toBe(11);
  });

  it('retorna [] quando Pilar 5 ausente (hexagramNumber null)', () => {
    const result = detectarCaminhoDourado({
      pilar5: { hexagramNumber: null, hexagramName: null },
    });
    expect(result).toEqual([]);
  });

  it('retorna [] quando Pilar 5 ausente (pilar5 null)', () => {
    const result = detectarCaminhoDourado({
      pilar5: null as unknown as PilaresDados['pilar5'],
    });
    expect(result).toEqual([]);
  });

  it('retorna [] quando Pilar 5 numero invalido', () => {
    expect(
      detectarCaminhoDourado({
        pilar5: { hexagramNumber: 0, hexagramName: null },
      })
    ).toEqual([]);
    expect(
      detectarCaminhoDourado({
        pilar5: { hexagramNumber: 65, hexagramName: null },
      })
    ).toEqual([]);
  });

  it('determinismo: mesma entrada → mesmo caminho', () => {
    const c1 = detectarCaminhoDourado(pilaresBase);
    const c2 = detectarCaminhoDourado(pilaresBase);
    expect(c1.map((c) => c.chave.numero)).toEqual(
      c2.map((c) => c.chave.numero)
    );
    expect(c1.map((c) => c.tema)).toEqual(c2.map((c) => c.tema));
  });

  it('chaves natais diferentes geram caminhos diferentes', () => {
    const c1 = detectarCaminhoDourado({
      pilar5: { hexagramNumber: 1, hexagramName: 'O Criativo' },
    });
    const c2 = detectarCaminhoDourado({
      pilar5: { hexagramNumber: 2, hexagramName: 'O Receptivo' },
    });
    expect(c1.map((c) => c.chave.numero)).not.toEqual(
      c2.map((c) => c.chave.numero)
    );
  });

  it('primeira chave do caminho e a chave natal (posicao 1)', () => {
    const natal = 13;
    const caminho = detectarCaminhoDourado({
      pilar5: { hexagramNumber: natal, hexagramName: null },
    });
    expect(caminho[0].chave.numero).toBe(natal);
  });
});
